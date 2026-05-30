"use client"

import { useState } from "react"
import { Bell, X, AlertTriangle, TrendingUp, Zap, User } from "lucide-react"
import { mockAlerts } from "@/lib/mock-data"
import { SeverityBadge } from "@/components/ui/severity-badge"

const iconMap: Record<string, React.ReactNode> = {
  cost_spike: <TrendingUp className="size-3.5" />,
  unprofitable_feature: <Zap className="size-3.5" />,
  model_overuse: <AlertTriangle className="size-3.5" />,
  prompt_size: <AlertTriangle className="size-3.5" />,
  high_cost_user: <User className="size-3.5" />,
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return "< 1h ago"
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function AlertsDropdown() {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [selected, setSelected] = useState<string | null>(null)

  const unread = alerts.filter((a) => !a.isRead)
  const selectedAlert = alerts.find((a) => a.id === selected)

  function markRead(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)))
  }

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((v) => !v); setSelected(null) }}
        className="relative flex size-8 items-center justify-center rounded-[10px] text-[#737373] hover:bg-[#f2f2f2] hover:text-[#0a0a0a] transition-colors"
      >
        <Bell className="size-4" />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#c22b10] text-[9px] font-bold text-white">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setOpen(false); setSelected(null) }}
          />
          <div className="absolute right-0 top-10 z-50 w-[380px] rounded-[14px] border border-[#e5e5e5] bg-white shadow-xl overflow-hidden">
            {selected && selectedAlert ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-4 py-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="text-[#737373] hover:text-[#0a0a0a] transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                  <span className="text-sm font-medium text-[#0a0a0a]">Alert detail</span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={selectedAlert.severity as "HIGH" | "MEDIUM" | "LOW"} />
                    <span className="text-xs text-[#737373]">{timeAgo(selectedAlert.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#0a0a0a] leading-relaxed">{selectedAlert.message}</p>
                  <div className="rounded-[10px] bg-[#f2f2f2] p-3">
                    <p className="text-xs font-medium text-[#737373] mb-1">Recommended action</p>
                    <p className="text-xs text-[#0a0a0a] leading-relaxed">
                      {selectedAlert.type === "cost_spike" &&
                        "Review recent traffic patterns and check if a specific feature or user is driving the spike. Consider setting per-feature cost limits."}
                      {selectedAlert.type === "unprofitable_feature" &&
                        "Audit the feature's prompt design and model selection. Consider switching to a cheaper model or adding caching."}
                      {selectedAlert.type === "model_overuse" &&
                        "Audit which requests actually need GPT-4o. Route simpler tasks to GPT-4o-mini or Claude Haiku."}
                      {selectedAlert.type === "prompt_size" &&
                        "Review system prompts for verbosity. Remove redundant context and consider chunking large inputs."}
                      {selectedAlert.type === "high_cost_user" &&
                        "Consider adding soft rate limits or usage quotas for this user. Review their usage patterns."}
                    </p>
                  </div>
                  {!selectedAlert.isRead && (
                    <button
                      onClick={() => { markRead(selectedAlert.id); setSelected(null) }}
                      className="w-full rounded-[10px] bg-[#000000] py-2 text-xs font-medium text-white hover:opacity-80 transition-opacity"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#000000]">Alerts</span>
                    {unread.length > 0 && (
                      <span className="rounded-full bg-[#c22b10]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#c22b10]">
                        {unread.length} unread
                      </span>
                    )}
                  </div>
                  {unread.length > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-[#f2f2f2]">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Bell className="size-8 text-[#e5e5e5] mb-2" />
                      <p className="text-sm text-[#737373]">No alerts</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => { setSelected(alert.id); if (!alert.isRead) markRead(alert.id) }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#f2f2f2] transition-colors ${
                          !alert.isRead ? "bg-white" : "bg-[#fafafa]"
                        }`}
                      >
                        <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                          alert.severity === "HIGH"
                            ? "bg-[#c22b10]/10 text-[#c22b10]"
                            : "bg-[#f2f2f2] text-[#737373]"
                        }`}>
                          {iconMap[alert.type]}
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <SeverityBadge severity={alert.severity as "HIGH" | "MEDIUM" | "LOW"} />
                            <span className="text-[10px] text-[#737373]">{timeAgo(alert.createdAt)}</span>
                          </div>
                          <p className="text-xs text-[#0a0a0a] leading-snug line-clamp-2">
                            {alert.message}
                          </p>
                        </div>
                        {!alert.isRead && (
                          <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#000000]" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
