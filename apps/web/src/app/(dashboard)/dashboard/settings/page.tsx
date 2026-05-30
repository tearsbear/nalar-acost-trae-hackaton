"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Trash2, Plus, Eye, EyeOff, Download, FileText, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { apiKeysApi, workspacesApi, ApiKey, Workspace } from "@/lib/api"

const BASE_URL = typeof window !== "undefined" ? window.location.origin + "/api" : "/api"

const API_TABS = ["cURL", "TypeScript", "Python", "PHP"]

function getApiExamples(apiKey: string) {
  return {
    cURL: `curl -X POST ${BASE_URL}/track \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "feature": "pdf-chat",
    "userId": "usr_123",
    "model": "gpt-4o",
    "provider": "openai",
    "inputTokens": 1240,
    "outputTokens": 380,
    "latency": 1340
  }'`,
    TypeScript: `// Fire-and-forget after every AI call
const start = Date.now()
const response = await openai.chat.completions.create({ model: "gpt-4o", messages })

fetch("${BASE_URL}/track", {
  method: "POST",
  headers: {
    "X-API-Key": "${apiKey}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    feature: "pdf-chat",
    userId,
    model: "gpt-4o",
    provider: "openai",
    inputTokens: response.usage.prompt_tokens,
    outputTokens: response.usage.completion_tokens,
    latency: Date.now() - start,
  }),
}).catch(() => {})`,
    Python: `import httpx, time

start = time.time()
response = openai.chat.completions.create(model="gpt-4o", messages=messages)

# Fire-and-forget
httpx.post(
    "${BASE_URL}/track",
    headers={
        "X-API-Key": "${apiKey}",
        "Content-Type": "application/json",
    },
    json={
        "feature": "pdf-chat",
        "userId": user.id,
        "model": "gpt-4o",
        "provider": "openai",
        "inputTokens": response.usage.prompt_tokens,
        "outputTokens": response.usage.completion_tokens,
        "latency": int((time.time() - start) * 1000),
    },
)`,
    PHP: `$start = microtime(true);
$response = $openai->chat()->create(['model' => 'gpt-4o', 'messages' => $messages]);

// Fire-and-forget
Http::withHeaders([
    'X-API-Key' => '${apiKey}',
    'Content-Type'  => 'application/json',
])->post('${BASE_URL}/track', [
    'feature'       => 'pdf-chat',
    'userId'        => $user->id,
    'model'         => 'gpt-4o',
    'provider'      => 'openai',
    'inputTokens'   => $response->usage->prompt_tokens,
    'outputTokens'  => $response->usage->completion_tokens,
    'latency'       => (int)((microtime(true) - $start) * 1000),
]);`,
  }
}

function getRulesFile(apiKey: string) {
  return `# Acost — AI Cost Tracking Rules
# Drop this file into your project root as .acost-rules.md
# Works with: Trae, Cursor, Windsurf, Copilot, and any AI coding editor

## What is Acost?
Acost tracks AI API costs per feature and user.
After every AI API call in this project, send a tracking event to:
  POST ${BASE_URL}/track
  X-API-Key: ${apiKey}

## Tracking payload schema
{
  "feature":       string,   // name of the feature making the call (e.g. "pdf-chat")
  "userId":        string,   // end-user identifier (optional but recommended)
  "model":         string,   // required model name (e.g. "gpt-4o", "claude-3-5-sonnet")
  "provider":      string,   // required provider ("openai" | "anthropic" | "google" | ...)
  "inputTokens":   number,   // from the API response usage object
  "outputTokens":  number,   // from the API response usage object
  "latency":       number    // wall-clock time of the AI call in milliseconds
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
     headers: { "X-API-Key": "${apiKey}", "Content-Type": "application/json" },
     body: JSON.stringify({ feature, userId, model, provider, inputTokens, outputTokens, latency })
   }).catch(() => {}) // never block the main flow

4. Never await the tracking call — it must be fire-and-forget.
5. Never throw or surface errors from the tracking call to the user.
6. Use the feature name that describes the product feature, not the function name.

## Example — OpenAI
const start = Date.now()
const response = await openai.chat.completions.create({ model: "gpt-4o", messages })
fetch("${BASE_URL}/track", {
  method: "POST",
  headers: { "X-API-Key": "${apiKey}", "Content-Type": "application/json" },
  body: JSON.stringify({
    feature: "pdf-chat", userId,
    model: "gpt-4o", provider: "openai",
    inputTokens: response.usage.prompt_tokens,
    outputTokens: response.usage.completion_tokens,
    latency: Date.now() - start,
  }),
}).catch(() => {})

## Example — Anthropic
const start = Date.now()
const response = await anthropic.messages.create({ model: "claude-3-5-sonnet-20241022", messages })
fetch("${BASE_URL}/track", {
  method: "POST",
  headers: { "X-API-Key": "${apiKey}", "Content-Type": "application/json" },
  body: JSON.stringify({
    feature: "ai-summarizer", userId,
    model: "claude-3-5-sonnet", provider: "anthropic",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latency: Date.now() - start,
  }),
}).catch(() => {})
`
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return "< 1h ago"
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [newKeyName, setNewKeyName] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null)
  
  const [copied, setCopied] = useState<string | null>(null)
  const [apiTab, setApiTab] = useState("cURL")
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)
  const [showBaseUrl, setShowBaseUrl] = useState(false)
  const [rulesDownloaded, setRulesDownloaded] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const wsList = await workspacesApi.list()
        setWorkspaces(wsList)
        
        if (wsList.length > 0) {
          const keysList = await apiKeysApi.list(wsList[0].id)
          setKeys(keysList)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const [editingWs, setEditingWs] = useState<string | null>(null)
  const [wsName, setWsName] = useState("")

  async function handleUpdateWorkspace(id: string) {
    if (!wsName.trim()) return
    setLoading(true)
    try {
      const updated = await workspacesApi.update(id, wsName.trim())
      setWorkspaces((prev) => prev.map((ws) => (ws.id === id ? updated : ws)))
      setEditingWs(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workspace")
    } finally {
      setLoading(false)
    }
  }

  function startEditing(ws: Workspace) {
    setEditingWs(ws.id)
    setWsName(ws.name)
  }

  async function handleRevoke(id: string) {
    if (!workspaces[0]) return
    try {
      await apiKeysApi.revoke(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
      setConfirmRevoke(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke key")
    }
  }

  async function handleCreate() {
    if (!newKeyName.trim() || workspaces.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const key = await apiKeysApi.create(workspaces[0].id, newKeyName.trim())
      setKeys((prev) => [key, ...prev])
      setCreatedKey(key)
      setNewKeyName("")
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key")
    } finally {
      setLoading(false)
    }
  }

  function handleDownloadRules() {
    const key = keys[0]?.key || "YOUR_API_KEY"
    const blob = new Blob([getRulesFile(key)], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = ".acost-rules.md"
    a.click()
    URL.revokeObjectURL(url)
    setRulesDownloaded(true)
  }

  const activeKey = keys[0]?.key || "YOUR_API_KEY"
  const API_EXAMPLES = getApiExamples(activeKey)
  const RULES_FILE = getRulesFile(activeKey)

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="flex items-center gap-2 rounded-[10px] border border-[#c22b10]/20 bg-[#c22b10]/5 p-4 text-sm text-[#c22b10]">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {createdKey && (
        <div className="rounded-[14px] border-2 border-[#10c22b] bg-[#10c22b]/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-[#10c22b]">
                <Check className="size-3.5 text-white" />
              </div>
              <p className="text-sm font-semibold text-[#000000]">New API Key created</p>
            </div>
            <button 
              onClick={() => setCreatedKey(null)}
              className="text-xs text-[#737373] hover:text-[#0a0a0a]"
            >
              Dismiss
            </button>
          </div>
          <p className="mb-4 text-xs text-[#737373]">
            Make sure to copy your API key now. You won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2 rounded-[10px] border border-[#10c22b]/20 bg-white px-4 py-3">
            <code className="flex-1 font-mono text-sm text-[#0a0a0a]">{createdKey.key}</code>
            <button
              onClick={() => handleCopy(createdKey.key!, "created")}
              className="flex shrink-0 items-center gap-1 rounded-[6px] border border-[#e5e5e5] bg-white px-2.5 py-1 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors"
            >
              {copied === "created" ? <Check className="size-3 text-[#10c22b]" /> : <Copy className="size-3" />}
              {copied === "created" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#000000]">API Base URL</p>
            <p className="text-xs text-[#737373]">Use this endpoint to send tracking events from your app</p>
          </div>
          <a
            href="#"
            className="flex items-center gap-1 text-xs text-[#737373] hover:text-[#0a0a0a] transition-colors"
          >
            API docs <ExternalLink className="size-3" />
          </a>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] px-4 py-3">
          <code className="flex-1 font-mono text-sm text-[#0a0a0a]">
            {showBaseUrl ? BASE_URL : "https://••••••••••••••••••/v1"}
          </code>
          <button
            onClick={() => setShowBaseUrl((v) => !v)}
            className="shrink-0 text-[#737373] hover:text-[#0a0a0a] transition-colors"
          >
            {showBaseUrl ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
          <button
            onClick={() => handleCopy(BASE_URL, "baseurl")}
            className="flex shrink-0 items-center gap-1 rounded-[6px] border border-[#e5e5e5] bg-white px-2.5 py-1 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors"
          >
            {copied === "baseurl" ? <Check className="size-3 text-[#10c22b]" /> : <Copy className="size-3" />}
            {copied === "baseurl" ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-[#000000]">Workspaces</p>
          <p className="text-xs text-[#737373]">Manage your products and team environments</p>
        </div>
        <div className="flex flex-col gap-2">
          {loading && workspaces.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-[#737373]" />
            </div>
          ) : (
            workspaces.map((ws) => (
              <div key={ws.id} className="flex items-center justify-between rounded-[10px] border border-[#f2f2f2] p-3">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-[8px] bg-[#f2f2f2] text-xs font-bold text-[#000000]">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  {editingWs === ws.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={wsName}
                        onChange={(e) => setWsName(e.target.value)}
                        className="h-8 flex-1 rounded-[6px] border border-[#000000] bg-white px-2 text-sm text-[#0a0a0a] outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateWorkspace(ws.id)}
                      />
                      <button
                        onClick={() => handleUpdateWorkspace(ws.id)}
                        className="text-xs font-medium text-[#000000] hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingWs(null)}
                        className="text-xs text-[#737373] hover:text-[#0a0a0a]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-[#0a0a0a]">{ws.name}</p>
                      <p className="text-[11px] text-[#737373]">{ws.slug}</p>
                    </div>
                  )}
                </div>
                {!editingWs && (
                  <button
                    onClick={() => startEditing(ws)}
                    className="text-xs font-medium text-[#737373] hover:text-[#000000] transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#000000]">API Keys</p>
            <p className="text-xs text-[#737373]">
              {loading ? "Loading..." : `${keys.length} active key${keys.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-[9999px] bg-[#000000] px-3 py-1.5 text-xs font-medium text-white hover:opacity-80 transition-opacity"
          >
            <Plus className="size-3" />
            New key
          </button>
        </div>

        {showForm && (
          <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-[#000000] bg-[#f2f2f2] p-3">
            <input
              type="text"
              placeholder="Key name (e.g. Production)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              className="flex-1 bg-transparent text-sm text-[#0a0a0a] outline-none placeholder:text-[#737373]"
            />
            <button
              onClick={handleCreate}
              disabled={!newKeyName.trim() || loading}
              className="flex items-center justify-center rounded-[8px] bg-[#000000] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-30 hover:opacity-80 transition-opacity min-w-[60px]"
            >
              {loading ? <Loader2 className="size-3 animate-spin" /> : "Create"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-[#737373] hover:text-[#0a0a0a] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-col">
          <div className="grid grid-cols-12 pb-2.5 text-[11px] font-medium uppercase tracking-wide text-[#a1a1a1]">
            <span className="col-span-3">Name</span>
            <span className="col-span-5">Key</span>
            <span className="col-span-2 text-right">Last used</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {loading && keys.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-[#737373]" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border-t border-[#f2f2f2]">
              <p className="text-xs text-[#737373]">No API keys found.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="mt-2 text-xs font-medium text-[#000000] hover:underline"
              >
                Create your first key
              </button>
            </div>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="grid grid-cols-12 items-center border-t border-[#f2f2f2] py-3.5">
                <span className="col-span-3 text-sm font-medium text-[#0a0a0a]">{k.name}</span>
                <div className="col-span-5 flex items-center gap-2">
                  <code className="truncate font-mono text-xs text-[#737373]">
                    {k.key || "••••••••••••••••••••••••••••••••"}
                  </code>
                  <button
                    onClick={() => k.key && handleCopy(k.key, k.id)}
                    disabled={!k.key}
                    className="shrink-0 text-[#737373] hover:text-[#0a0a0a] transition-colors disabled:opacity-30"
                  >
                    {copied === k.id ? <Check className="size-3.5 text-[#10c22b]" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
                <span className="col-span-2 text-right text-xs text-[#737373]">{timeAgo(k.last_used_at)}</span>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  {confirmRevoke === k.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="rounded-[6px] bg-[#c22b10]/10 px-2 py-1 text-[11px] font-medium text-[#c22b10] hover:bg-[#c22b10]/20 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmRevoke(null)}
                        className="text-[11px] text-[#737373] hover:text-[#0a0a0a] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRevoke(k.id)}
                      className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] text-[#737373] hover:bg-[#f2f2f2] hover:text-[#c22b10] transition-colors"
                    >
                      <Trash2 className="size-3" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#000000]">AI Editor Rules File</p>
            <p className="text-xs text-[#737373]">
              Teach your AI coding editor to auto-inject tracking after every AI API call
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {["Trae", "Cursor", "Windsurf", "Copilot"].map((e) => (
              <span key={e} className="rounded-full border border-[#e5e5e5] px-2 py-0.5 text-[10px] font-medium text-[#737373]">
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#0a0a0a]">
              <FileText className="size-4 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-[#000000]">.acost-rules.md</p>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Drop this file into your project root. Your AI editor will read it and automatically add
                the <code className="font-mono text-[#0a0a0a]">POST /track</code> call after every AI API call it writes or modifies.
                No SDK, no wrappers — just plain HTTP.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadRules}
              className={`flex items-center gap-2 rounded-[9999px] px-3 py-1.5 text-xs font-medium transition-colors ${
                rulesDownloaded
                  ? "bg-[#10c22b]/10 text-[#10c22b]"
                  : "bg-[#0a0a0a] text-white hover:opacity-80"
              }`}
            >
              {rulesDownloaded ? <Check className="size-3" /> : <Download className="size-3" />}
              {rulesDownloaded ? "Downloaded" : "Download .acost-rules.md"}
            </button>
            <button
              onClick={() => handleCopy(RULES_FILE, "rules")}
              className="flex items-center gap-1.5 rounded-[9999px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors"
            >
              {copied === "rules" ? <Check className="size-3 text-[#10c22b]" /> : <Copy className="size-3" />}
              {copied === "rules" ? "Copied" : "Copy contents"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-[#000000]">API Reference</p>
          <p className="text-xs text-[#737373]">
            Send a <code className="font-mono">POST /track</code> request after every AI call — fire-and-forget, never block your main flow
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] p-3">
          <p className="text-[11px] font-medium text-[#0a0a0a]">Payload fields</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {[
              ["feature", "string", "Product feature name (e.g. pdf-chat)"],
              ["model", "string", "Model used (e.g. gpt-4o)"],
              ["provider", "string", "openai · anthropic · google · openrouter"],
              ["input_tokens", "number", "From the API response usage object"],
              ["output_tokens", "number", "From the API response usage object"],
              ["latency_ms", "number", "Wall-clock time of the AI call"],
              ["user_id", "string?", "End-user identifier (optional)"],
            ].map(([field, type, desc]) => (
              <div key={field} className="flex items-baseline gap-1.5">
                <code className="text-[10px] font-mono font-semibold text-[#0a0a0a] shrink-0">{field}</code>
                <span className="text-[10px] font-mono text-[#a1a1a1] shrink-0">{type}</span>
                <span className="text-[10px] text-[#737373]">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3 flex gap-1 rounded-[8px] border border-[#e5e5e5] p-0.5 w-fit">
          {API_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setApiTab(tab)}
              className={`rounded-[6px] px-3 py-1 text-xs font-medium transition-colors ${
                apiTab === tab ? "bg-[#000000] text-white" : "text-[#737373] hover:text-[#0a0a0a]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative rounded-[10px] border border-[#e5e5e5] bg-[#0a0a0a] p-5">
          <button
            onClick={() => handleCopy(API_EXAMPLES[apiTab as keyof typeof API_EXAMPLES], "snippet")}
            className="absolute top-3 right-3 flex items-center gap-1 rounded-[6px] border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:text-white transition-colors"
          >
            {copied === "snippet" ? <Check className="size-3 text-[#10c22b]" /> : <Copy className="size-3" />}
            {copied === "snippet" ? "Copied" : "Copy"}
          </button>
          <pre className="overflow-x-auto text-[12px] font-mono text-white/80 leading-relaxed">
            {API_EXAMPLES[apiTab as keyof typeof API_EXAMPLES]}
          </pre>
        </div>
      </div>
    </div>
  )
}
