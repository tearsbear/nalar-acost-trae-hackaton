import { DashboardHeader } from "@/components/dashboard/header"
import { SpendTrendChart } from "@/components/charts/spend-trend-chart"
import { ModelUsageChart } from "@/components/charts/model-usage-chart"
import { CostBadge } from "@/components/ui/cost-badge"
import {
  mockSpendTrend,
  mockFeatureCosts,
  mockTopUsers,
  mockModelUsage,
} from "@/lib/mock-data"
import { DollarSign, Zap, TrendingUp, Clock } from "lucide-react"

const totalSpend = mockFeatureCosts.reduce((s, f) => s + f.cost, 0)
const totalRequests = mockFeatureCosts.reduce((s, f) => s + f.requests, 0)
const topFeature = [...mockFeatureCosts].sort((a, b) => b.cost - a.cost)[0]
const avgCost = totalSpend / totalRequests

function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  trend?: number
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[14px] p-5 ${
        accent
          ? "bg-[#0a0a0a] text-white"
          : "bg-white border border-[#e5e5e5]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex size-8 items-center justify-center rounded-[8px] ${accent ? "bg-white/10" : "bg-[#f2f2f2]"}`}>
          <Icon className={`size-4 ${accent ? "text-white" : "text-[#737373]"}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? "text-[#c22b10]" : "text-[#10c22b]"}`}>
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className={`text-2xl font-semibold tracking-tight ${accent ? "text-white" : "text-[#000000]"}`}>
          {value}
        </p>
        <p className={`mt-0.5 text-xs ${accent ? "text-white/60" : "text-[#737373]"}`}>{label}</p>
      </div>
      {accent && (
        <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-white/5" />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader title="Dashboard" subtitle="May 2026 · My AI SaaS" />

      <div className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total AI spend" value={`$${totalSpend.toFixed(2)}`} trend={14.2} icon={DollarSign} accent />
          <StatCard label="Total requests" value={totalRequests.toLocaleString()} trend={8.7} icon={Zap} />
          <StatCard label="Top feature cost" value={`$${topFeature.cost.toFixed(2)}`} icon={TrendingUp} />
          <StatCard label="Avg cost / req" value={`$${avgCost.toFixed(4)}`} trend={-3.1} icon={Clock} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="col-span-2 rounded-[14px] border border-[#e5e5e5] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#000000]">Spend trend</p>
                <p className="text-xs text-[#737373]">Daily AI cost over last 7 days</p>
              </div>
              <div className="flex gap-1 rounded-[8px] border border-[#e5e5e5] p-0.5">
                {["7d", "30d"].map((p, i) => (
                  <button
                    key={p}
                    className={`rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors ${
                      i === 0 ? "bg-[#0a0a0a] text-white" : "text-[#737373] hover:text-[#0a0a0a]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <SpendTrendChart data={mockSpendTrend} />
          </div>

          <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#000000]">Model usage</p>
              <p className="text-xs text-[#737373]">Cost distribution by model</p>
            </div>
            <ModelUsageChart data={mockModelUsage} />
            <div className="mt-3 flex flex-col gap-1.5">
              {mockModelUsage.map((m, i) => (
                <div key={m.model} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2 rounded-full"
                      style={{ background: ["#000000", "#404040", "#737373", "#a1a1a1"][i] }}
                    />
                    <span className="text-xs text-[#737373]">{m.model}</span>
                  </div>
                  <span className="text-xs font-medium text-[#0a0a0a]">${m.cost.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#000000]">Top features by cost</p>
                <p className="text-xs text-[#737373]">Most expensive AI features this period</p>
              </div>
            </div>
            <div className="flex flex-col gap-0">
              <div className="grid grid-cols-5 pb-2.5 text-[11px] font-medium uppercase tracking-wide text-[#a1a1a1]">
                <span className="col-span-2">Feature</span>
                <span className="text-right">Cost</span>
                <span className="text-right">Reqs</span>
                <span className="text-right">P&L</span>
              </div>
              {mockFeatureCosts.slice(0, 4).map((f) => (
                <div
                  key={f.feature}
                  className="grid grid-cols-5 border-t border-[#f2f2f2] py-3 text-sm"
                >
                  <span className="col-span-2 text-sm font-medium text-[#0a0a0a]">{f.feature}</span>
                  <span className="text-right">
                    <CostBadge value={f.cost} />
                  </span>
                  <span className="text-right text-xs text-[#737373]">
                    {f.requests.toLocaleString()}
                  </span>
                  <span className="text-right">
                    <span className={`text-xs font-medium ${f.profitability >= 0 ? "text-[#10c22b]" : "text-[#c22b10]"}`}>
                      {f.profitability >= 0 ? "+" : ""}{f.profitability}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-[#000000]">Top users by cost</p>
              <p className="text-xs text-[#737373]">Heaviest AI consumers this period</p>
            </div>
            <div className="flex flex-col gap-0">
              <div className="grid grid-cols-4 pb-2.5 text-[11px] font-medium uppercase tracking-wide text-[#a1a1a1]">
                <span className="col-span-2">User ID</span>
                <span className="text-right">Cost</span>
                <span className="text-right">Status</span>
              </div>
              {mockTopUsers.map((u) => (
                <div
                  key={u.userId}
                  className="grid grid-cols-4 border-t border-[#f2f2f2] py-3 items-center"
                >
                  <span className="col-span-2 font-mono text-xs text-[#0a0a0a]">{u.userId}</span>
                  <span className="text-right">
                    <CostBadge value={u.cost} />
                  </span>
                  <span className="text-right">
                    {u.flag ? (
                      <span className="inline-flex items-center rounded-full bg-[#c22b10]/10 px-2 py-0.5 text-[10px] font-medium text-[#c22b10]">
                        high
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[#f2f2f2] px-2 py-0.5 text-[10px] font-medium text-[#737373]">
                        ok
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#e5e5e5] bg-[#0a0a0a] p-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                  AI SUMMARY · WEEKLY
                </span>
                <span className="rounded-full bg-[#c22b10]/20 px-2 py-0.5 text-[10px] font-medium text-[#ff6b4a]">
                  ⚠ 2 critical alerts
                </span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed max-w-2xl">
                Total spend increased <span className="font-semibold text-white">14%</span> this week.{" "}
                <span className="text-[#ff6b4a] font-medium">PDF Chat became unprofitable</span> — revenue $320 vs cost $441.
                GPT-4o usage is up 22%; switching to GPT-4o-mini for retrieval tasks could save{" "}
                <span className="font-semibold text-white">$182/month</span>. Content Gen prompts averaging 4,200 tokens — trim system prompts for another{" "}
                <span className="font-semibold text-white">$39/month</span> in savings.
              </p>
            </div>
            <div className="shrink-0 rounded-[10px] border border-white/10 bg-white/5 px-4 py-3 text-center">
              <p className="text-[10px] text-white/50">Est. savings</p>
              <p className="text-xl font-semibold text-white">$291</p>
              <p className="text-[10px] text-white/50">per month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
