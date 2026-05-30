import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"
import { createHash } from "crypto"

type TrackingPayload = {
  feature: string
  user_id?: string | null
  model: string
  provider: string
  input_tokens: number
  output_tokens: number
  latency_ms: number
}

type ParsedPayloadResult =
  | { ok: true; data: TrackingPayload }
  | { ok: false; error: string }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(req: NextRequest) {
  try {
    const key = getApiKey(req)
    if (!key) {
      return jsonResponse({ message: "Missing API key. Use `Authorization: Bearer <key>` or `X-API-Key: <key>`." }, 401)
    }

    const keyHash = createHash("sha256").update(key).digest("hex")
    const supabase = createAdminClient()

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("workspace_id, id")
      .eq("key_hash", keyHash)
      .single()

    if (apiKeyError || !apiKeyData) {
      return jsonResponse({ message: "Invalid API key" }, 401)
    }

    const body = await readJsonBody(req)
    if (!body) {
      return jsonResponse({ message: "Invalid JSON body" }, 400)
    }

    const parsedPayload = parsePayload(body)
    if (!parsedPayload.ok) {
      return jsonResponse({ message: parsedPayload.error }, 400)
    }

    const { workspace_id } = apiKeyData
    const { feature, user_id, model, provider, input_tokens, output_tokens, latency_ms } = parsedPayload.data

    const estimatedCost = calculateCost(provider, model, input_tokens, output_tokens)

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
        estimated_cost: estimatedCost,
        latency: latency_ms,
      })

    if (eventError) throw eventError

    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyData.id)

    const today = new Date().toISOString().split("T")[0]

    const { data: metric, error: metricError } = await supabase
      .from("daily_metrics")
      .select("*")
      .match({ workspace_id, date: today, feature })
      .maybeSingle()

    if (metricError) throw metricError

    if (metric) {
      await supabase
        .from("daily_metrics")
        .update({
          total_cost: parseFloat(metric.total_cost) + estimatedCost,
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
          total_cost: estimatedCost,
          total_requests: 1,
          total_tokens: input_tokens + output_tokens,
          avg_latency: latency_ms,
        })
    }

    return jsonResponse({
      success: true,
      data: {
        workspace_id,
        feature,
        provider,
        model,
        estimated_cost: estimatedCost,
      },
    })
  } catch (error) {
    console.error("Tracking error:", error)
    return jsonResponse({ message: "Internal server error" }, 500)
  }
}

function getApiKey(req: NextRequest): string | null {
  const xApiKey = req.headers.get("x-api-key")?.trim()
  if (xApiKey) return xApiKey

  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  return authHeader.slice("Bearer ".length).trim() || null
}

async function readJsonBody(req: NextRequest): Promise<unknown | null> {
  try {
    return await req.json()
  } catch {
    return null
  }
}

function normalizePayload(body: unknown): Partial<TrackingPayload> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {}
  }

  const payload = body as Record<string, unknown>

  return {
    feature: readString(payload.feature),
    user_id: readOptionalString(payload.user_id ?? payload.userId),
    model: readString(payload.model),
    provider: readString(payload.provider),
    input_tokens: readNumber(payload.input_tokens ?? payload.inputTokens),
    output_tokens: readNumber(payload.output_tokens ?? payload.outputTokens),
    latency_ms: readNumber(payload.latency_ms ?? payload.latency),
  }
}

function parsePayload(body: unknown): ParsedPayloadResult {
  const payload = normalizePayload(body)
  const validationError = validatePayload(payload)

  if (validationError) {
    return { ok: false, error: validationError }
  }

  return { ok: true, data: payload as TrackingPayload }
}

function validatePayload(payload: Partial<TrackingPayload>): string | null {
  if (!payload.feature) return "`feature` is required"
  if (!payload.provider) return "`provider` is required"
  if (!payload.model) return "`model` is required"
  if (!Number.isFinite(payload.input_tokens)) return "`input_tokens` is required and must be a number"
  if (!Number.isFinite(payload.output_tokens)) return "`output_tokens` is required and must be a number"
  if (!Number.isFinite(payload.latency_ms)) return "`latency_ms` is required and must be a number"
  if (!Number.isInteger(payload.input_tokens)) return "`input_tokens` must be an integer"
  if (!Number.isInteger(payload.output_tokens)) return "`output_tokens` must be an integer"
  if (!Number.isInteger(payload.latency_ms)) return "`latency_ms` must be an integer"
  if ((payload.input_tokens ?? 0) < 0) return "`input_tokens` must be greater than or equal to 0"
  if ((payload.output_tokens ?? 0) < 0) return "`output_tokens` must be greater than or equal to 0"
  if ((payload.latency_ms ?? 0) < 0) return "`latency_ms` must be greater than or equal to 0"

  return null
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed || null
}

function readNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") return Number(value)
  return Number.NaN
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders,
  })
}

function calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    "openai:gpt-4o": { input: 0.000005, output: 0.000015 },
    "openai:gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
    "anthropic:claude-3-5-sonnet": { input: 0.000003, output: 0.000015 },
    "anthropic:claude-3-7-sonnet": { input: 0.000003, output: 0.000015 },
    "default": { input: 0.000002, output: 0.00001 },
  }

  const normalizedProvider = provider.toLowerCase()
  const normalizedModel = model.toLowerCase()
  const exactKey = Object.keys(rates).find((key) => {
    if (key === "default") return false
    const [providerKey, modelKey] = key.split(":")
    return normalizedProvider.includes(providerKey) && normalizedModel.includes(modelKey)
  }) ?? "default"

  const rate = rates[exactKey]
  return (inputTokens * rate.input) + (outputTokens * rate.output)
}
