import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json()
    
    const baseUrl = process.env.OPENAGENTIC_BASE_URL
    const apiKey = process.env.OPENAGENTIC_API_KEY
    const model = process.env.OPENAGENTIC_MODEL

    let prompt = ""
    
    if (action === "summarize") {
      prompt = `Summarize the following AI cost data and provide key insights: ${JSON.stringify(data)}`
    } else if (action === "suggest") {
      prompt = `Based on this AI usage data, provide 3 actionable cost-saving recommendations: ${JSON.stringify(data)}`
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "You are an AI cost optimization expert. Provide concise, actionable advice." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAgentic API error:", errorData)
      throw new Error("Failed to fetch from AI service")
    }

    const result = await response.json()
    return NextResponse.json({ 
      content: result.choices[0].message.content,
      model: result.model,
      usage: result.usage
    })

  } catch (error) {
    console.error("AI Service Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
