"use client"

import { useState } from "react"
import { Check, Copy, ArrowRight, Download, FileText, Zap } from "lucide-react"
import Link from "next/link"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.acost.io/v1"
const GENERATED_KEY = "act_sk_live_a8f3d2e1b9c4f7a2"

const API_TABS = ["cURL", "TypeScript", "Python", "PHP"]

const API_EXAMPLES: Record<string, string> = {
  cURL: `curl -X POST ${BASE_URL}/track \\
  -H "Authorization: Bearer ${GENERATED_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "feature": "pdf-chat",
    "user_id": "usr_123",
    "model": "gpt-4o",
    "provider": "openai",
    "input_tokens": 1240,
    "output_tokens": 380,
    "latency_ms": 1340
  }'`,
  TypeScript: `const res = await fetch("${BASE_URL}/track", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${GENERATED_KEY}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    feature: "pdf-chat",
    user_id: user.id,
    model: "gpt-4o",
    provider: "openai",
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    latency_ms: Date.now() - startTime,
  }),
})`,
  Python: `import httpx

httpx.post(
    "${BASE_URL}/track",
    headers={
        "Authorization": "Bearer ${GENERATED_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "feature": "pdf-chat",
        "user_id": user.id,
        "model": "gpt-4o",
        "provider": "openai",
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
        "latency_ms": latency_ms,
    },
)`,
  PHP: `Http::withHeaders([
    'Authorization' => 'Bearer ${GENERATED_KEY}',
    'Content-Type'  => 'application/json',
])->post('${BASE_URL}/track', [
    'feature'       => 'pdf-chat',
    'user_id'       => $user->id,
    'model'         => 'gpt-4o',
    'provider'      => 'openai',
    'input_tokens'  => $usage->input_tokens,
    'output_tokens' => $usage->output_tokens,
    'latency_ms'    => $latencyMs,
]);`,
}

const RULES_FILE = `# Acost — AI Cost Tracking Rules
# Drop this file into your project root as .acost-rules.md
# Works with: Trae, Cursor, Windsurf, Copilot, and any AI coding editor

## What is Acost?
Acost tracks AI API costs per feature and user.
After every AI API call in this project, send a tracking event to:
  POST ${BASE_URL}/track
  Authorization: Bearer YOUR_API_KEY

## Tracking payload schema
{
  "feature":       string,   // name of the feature making the call (e.g. "pdf-chat")
  "user_id":       string,   // end-user identifier (optional but recommended)
  "model":         string,   // model name (e.g. "gpt-4o", "claude-3-5-sonnet")
  "provider":      string,   // "openai" | "anthropic" | "google" | "openrouter" | ...
  "input_tokens":  number,   // from the API response usage object
  "output_tokens": number,   // from the API response usage object
  "latency_ms":    number    // wall-clock time of the AI call in milliseconds
}

## Rules for AI editors
When you write or modify code that calls an AI API (OpenAI, Anthropic, Google Gemini,
OpenRouter, Replicate, ElevenLabs, etc.), ALWAYS:

1. Record the start time before the API call:
   const start = Date.now()

2. Extract token usage from the response:
   - OpenAI:    response.usage.prompt_tokens / completion_tokens
   - Anthropic: response.usage.input_tokens / output_tokens
   - Gemini:    response.usageMetadata.promptTokenCount / candidatesTokenCount

3. After the call, fire a non-blocking tracking request:
   fetch("${BASE_URL}/track", {
     method: "POST",
     headers: { "Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json" },
     body: JSON.stringify({ feature, user_id, model, provider, input_tokens, output_tokens, latency_ms })
   }).catch(() => {}) // never block the main flow

4. Never await the tracking call — it must be fire-and-forget.
5. Never throw or surface errors from the tracking call to the user.
6. Use the feature name that describes the product feature, not the function name.

## Example — OpenAI
const start = Date.now()
const response = await openai.chat.completions.create({ model: "gpt-4o", messages })
fetch("${BASE_URL}/track", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({
    feature: "pdf-chat", user_id: userId,
    model: "gpt-4o", provider: "openai",
    input_tokens: response.usage.prompt_tokens,
    output_tokens: response.usage.completion_tokens,
    latency_ms: Date.now() - start,
  }),
}).catch(() => {})

## Example — Anthropic
const start = Date.now()
const response = await anthropic.messages.create({ model: "claude-3-5-sonnet-20241022", messages })
fetch("${BASE_URL}/track", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({
    feature: "ai-summarizer", user_id: userId,
    model: "claude-3-5-sonnet", provider: "anthropic",
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    latency_ms: Date.now() - start,
  }),
}).catch(() => {})
`

const steps = [
  { id: 1, label: "Create workspace" },
  { id: 2, label: "Get credentials" },
  { id: 3, label: "Send events" },
  { id: 4, label: "Verify connection" },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [workspaceName, setWorkspaceName] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [apiTab, setApiTab] = useState("cURL")
  const [verified, setVerified] = useState(false)
  const [rulesDownloaded, setRulesDownloaded] = useState(false)

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleDownloadRules() {
    const blob = new Blob([RULES_FILE], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = ".acost-rules.md"
    a.click()
    URL.revokeObjectURL(url)
    setRulesDownloaded(true)
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
      <header className="flex h-14 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-6 items-center justify-center rounded-[6px] bg-[#000000]">
            <span className="text-[10px] font-bold text-white">AI</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#000000]">Acost</span>
        </div>
        <Link href="/dashboard" className="text-xs text-[#737373] hover:text-[#0a0a0a] transition-colors">
          Skip for now →
        </Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#000000]">
              Set up your integration
            </h1>
            <p className="mt-1.5 text-sm text-[#737373]">
              No SDK required — just a REST API call after each AI request
            </p>
          </div>

          <div className="mb-8 flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      s.id < step
                        ? "bg-[#000000] text-white"
                        : s.id === step
                        ? "border-2 border-[#000000] bg-white text-[#000000]"
                        : "border border-[#e5e5e5] bg-white text-[#a1a1a1]"
                    }`}
                  >
                    {s.id < step ? <Check className="size-3.5" /> : s.id}
                  </div>
                  <span className={`text-[11px] font-medium whitespace-nowrap ${s.id === step ? "text-[#000000]" : "text-[#a1a1a1]"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px flex-1 mx-3 mb-5 transition-colors ${s.id < step ? "bg-[#000000]" : "bg-[#e5e5e5]"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-[14px] border border-[#e5e5e5] bg-white">
            {step === 1 && (
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <h2 className="text-base font-semibold text-[#000000]">Name your workspace</h2>
                  <p className="mt-0.5 text-xs text-[#737373]">
                    A workspace represents your product or company. You can create more later.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#0a0a0a]">Workspace name</label>
                  <input
                    type="text"
                    placeholder="My AI SaaS"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && workspaceName.trim() && setStep(2)}
                    autoFocus
                    className="h-10 rounded-[10px] border border-[#e5e5e5] bg-transparent px-3 text-sm text-[#0a0a0a] outline-none placeholder:text-[#737373] focus:border-[#000000] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#0a0a0a]">What are you building?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["AI SaaS app", "AI agency", "Side project", "Internal tool", "AI startup", "Other"].map((opt) => (
                      <button
                        key={opt}
                        className="rounded-[10px] border border-[#e5e5e5] px-3 py-2 text-xs text-[#737373] hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors text-left"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!workspaceName.trim()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#000000] text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-30"
                >
                  Continue <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <h2 className="text-base font-semibold text-[#000000]">Your credentials</h2>
                  <p className="mt-0.5 text-xs text-[#737373]">
                    Use these to authenticate your API requests. Keep your key secret.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#0a0a0a]">API Base URL</label>
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] px-3 py-2.5">
                      <code className="flex-1 font-mono text-xs text-[#0a0a0a]">{BASE_URL}</code>
                      <button
                        onClick={() => handleCopy(BASE_URL, "url")}
                        className="flex shrink-0 items-center gap-1 rounded-[6px] border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] text-[#737373] hover:text-[#0a0a0a] transition-colors"
                      >
                        {copied === "url" ? <Check className="size-3 text-[#10c22b]" /> : <Copy className="size-3" />}
                        {copied === "url" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#0a0a0a]">API Key</label>
                      <span className="rounded-full bg-[#c22b10]/10 px-2 py-0.5 text-[10px] font-medium text-[#c22b10]">
                        Shown once — save it now
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] px-3 py-2.5">
                      <code className="flex-1 font-mono text-xs text-[#0a0a0a]">{GENERATED_KEY}</code>
                      <button
                        onClick={() => handleCopy(GENERATED_KEY, "key")}
                        className="flex shrink-0 items-center gap-1 rounded-[6px] border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] text-[#737373] hover:text-[#0a0a0a] transition-colors"
                      >
                        {copied === "key" ? <Check className="size-3 text-[#10c22b]" /> : <Copy className="size-3" />}
                        {copied === "key" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] p-3">
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Store your API key as an environment variable:{" "}
                    <code className="font-mono text-[#0a0a0a]">ACOST_API_KEY</code>. Never commit it to version control.
                  </p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#000000] text-sm font-medium text-white transition-opacity hover:opacity-80"
                >
                  I&apos;ve saved my credentials <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <h2 className="text-base font-semibold text-[#000000]">Send tracking events</h2>
                  <p className="mt-0.5 text-xs text-[#737373]">
                    After each AI API call in your app, fire a POST request to Acost. No SDK needed.
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-[6px] bg-[#0a0a0a]">
                      <FileText className="size-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#000000]">AI Editor Rules File</p>
                      <p className="text-[11px] text-[#737373]">Works with Trae, Cursor, Windsurf, Copilot and more</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Download the <code className="font-mono text-[#0a0a0a]">.acost-rules.md</code> file and drop it into your project root.
                    Your AI coding editor will automatically detect AI API calls and inject the tracking code for you.
                  </p>
                  <button
                    onClick={handleDownloadRules}
                    className={`flex items-center gap-2 rounded-[9999px] px-3 py-1.5 text-xs font-medium transition-colors w-fit ${
                      rulesDownloaded
                        ? "bg-[#10c22b]/10 text-[#10c22b]"
                        : "bg-[#0a0a0a] text-white hover:opacity-80"
                    }`}
                  >
                    {rulesDownloaded ? <Check className="size-3" /> : <Download className="size-3" />}
                    {rulesDownloaded ? "Downloaded" : "Download .acost-rules.md"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e5e5e5]" />
                  <span className="text-[11px] text-[#a1a1a1]">or integrate manually</span>
                  <div className="h-px flex-1 bg-[#e5e5e5]" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#0a0a0a]">
                      POST <code className="font-mono">/track</code> — after every AI call
                    </label>
                    <div className="flex gap-1 rounded-[6px] border border-[#e5e5e5] p-0.5">
                      {API_TABS.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setApiTab(tab)}
                          className={`rounded-[4px] px-2 py-0.5 text-[11px] font-medium transition-colors ${
                            apiTab === tab ? "bg-[#000000] text-white" : "text-[#737373] hover:text-[#0a0a0a]"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative rounded-[10px] border border-[#e5e5e5] bg-[#0a0a0a] p-4">
                    <button
                      onClick={() => handleCopy(API_EXAMPLES[apiTab], "snippet")}
                      className="absolute top-3 right-3 flex items-center gap-1 rounded-[6px] border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 hover:text-white transition-colors"
                    >
                      {copied === "snippet" ? <Check className="size-3 text-[#10c22b]" /> : <Copy className="size-3" />}
                      {copied === "snippet" ? "Copied" : "Copy"}
                    </button>
                    <pre className="overflow-x-auto text-[11px] font-mono text-white/80 leading-relaxed">
                      {API_EXAMPLES[apiTab]}
                    </pre>
                  </div>
                </div>

                <div className="rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] p-3">
                  <p className="text-[11px] font-medium text-[#0a0a0a] mb-1.5">Required fields</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      ["feature", "string — product feature name"],
                      ["model", "string — e.g. gpt-4o"],
                      ["provider", "string — openai, anthropic…"],
                      ["input_tokens", "number — from API response"],
                      ["output_tokens", "number — from API response"],
                      ["latency_ms", "number — wall-clock time"],
                    ].map(([field, desc]) => (
                      <div key={field} className="flex items-baseline gap-1.5">
                        <code className="text-[10px] font-mono text-[#0a0a0a] shrink-0">{field}</code>
                        <span className="text-[10px] text-[#737373]">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#000000] text-sm font-medium text-white transition-opacity hover:opacity-80"
                >
                  Done, let&apos;s verify <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <h2 className="text-base font-semibold text-[#000000]">Verify connection</h2>
                  <p className="mt-0.5 text-xs text-[#737373]">
                    Make one AI request in your app, then check if we received the tracking event
                  </p>
                </div>

                <div className="rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#0a0a0a]">Listening for events...</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-[#737373]">
                      <span className="size-1.5 rounded-full bg-[#10c22b] animate-pulse" />
                      Live
                    </span>
                  </div>
                  {!verified ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-[#e5e5e5]">
                        <Zap className="size-5 text-[#e5e5e5]" />
                      </div>
                      <p className="text-xs text-[#737373]">
                        No events received yet. Make an AI request in your app to verify.
                      </p>
                      <button
                        onClick={() => setVerified(true)}
                        className="rounded-[9999px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors"
                      >
                        Simulate test event
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-[8px] border border-[#10c22b]/20 bg-[#10c22b]/5 px-3 py-2.5">
                      <Check className="size-4 text-[#10c22b] shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[#0a0a0a]">Event received</span>
                        <span className="text-[11px] text-[#737373]">pdf-chat · gpt-4o · openai · $0.0482 · 1340ms</span>
                      </div>
                      <span className="ml-auto font-mono text-[10px] text-[#737373]">just now</span>
                    </div>
                  )}
                </div>

                {verified && (
                  <div className="rounded-[10px] border border-[#10c22b]/20 bg-[#10c22b]/5 p-4">
                    <p className="text-sm font-semibold text-[#0a0a0a]">You&apos;re all set! 🎉</p>
                    <p className="mt-0.5 text-xs text-[#737373]">
                      Acost is now tracking your AI costs. Head to the dashboard to see your data.
                    </p>
                  </div>
                )}

                <Link
                  href="/dashboard"
                  className={`flex h-10 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-medium transition-opacity hover:opacity-80 ${
                    verified ? "bg-[#000000] text-white" : "border border-[#e5e5e5] bg-white text-[#737373]"
                  }`}
                >
                  {verified ? "Go to dashboard" : "Skip verification"} <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-[#a1a1a1]">
            Need help?{" "}
            <a href="#" className="text-[#737373] underline underline-offset-2 hover:text-[#0a0a0a] transition-colors">
              Read the API docs
            </a>{" "}
            or{" "}
            <a href="#" className="text-[#737373] underline underline-offset-2 hover:text-[#0a0a0a] transition-colors">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
