import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"
import { createHash } from "crypto"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing or invalid authorization header" }, { status: 401 })
    }

    const key = authHeader.split(" ")[1]
    const keyHash = createHash("sha256").update(key).digest("hex")

    const supabase = createAdminClient()

    // 1. Verify API Key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("workspace_id, id")
      .eq("key_hash", keyHash)
      .single()

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { workspace_id } = apiKeyData
    const body = await req.json()
    const { feature, user_id, model, provider, input_tokens, output_tokens, latency_ms } = body

    // 2. Insert Event
    const { error: eventError } = await supabase
      .from("events")
      .insert({
        workspace_id,
        feature,
        user_id,
        model,
        provider,
        input_tokens,
        output_tokens,
        estimated_cost: calculateCost(model, input_tokens, output_tokens),
        latency: latency_ms,
      })

    if (eventError) throw eventError

    // 3. Update API Key last_used_at
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyData.id)

    // 4. Update Daily Metrics (upsert)
    const today = new Date().toISOString().split("T")[0]
    const cost = calculateCost(model, input_tokens, output_tokens)

    const { data: metric } = await supabase
      .from("daily_metrics")
      .select("*")
      .match({ workspace_id, date: today, feature })
      .single()

    if (metric) {
      await supabase
        .from("daily_metrics")
        .update({
          total_cost: parseFloat(metric.total_cost) + cost,
          total_requests: metric.total_requests + 1,
          total_tokens: metric.total_tokens + input_tokens + output_tokens,
          avg_latency: Math.round((metric.avg_latency * metric.total_requests + latency_ms) / (metric.total_requests + 1)),
        })
        .match({ id: metric.id })
    } else {
      await supabase
        .from("daily_metrics")
        .insert({
          workspace_id,
          date: today,
          feature,
          total_cost: cost,
          total_requests: 1,
          total_tokens: input_tokens + output_tokens,
          avg_latency: latency_ms,
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tracking error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 0.000005, output: 0.000015 },
    "gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
    "claude-3-5-sonnet": { input: 0.000003, output: 0.000015 },
    "default": { input: 0.000002, output: 0.00001 },
  }

  const modelKey = Object.keys(rates).find(k => model.toLowerCase().includes(k)) || "default"
  const rate = rates[modelKey]
  return (inputTokens * rate.input) + (outputTokens * rate.output)
}
