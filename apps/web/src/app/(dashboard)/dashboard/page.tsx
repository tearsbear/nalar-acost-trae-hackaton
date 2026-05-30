import { DashboardHeader } from "@/components/dashboard/header"
import { SpendTrendChart } from "@/components/charts/spend-trend-chart"
import { ModelUsageChart } from "@/components/charts/model-usage-chart"
import { CostBadge } from "@/components/ui/cost-badge"
import {
  mockSpendTrend,
  mockFeatureCosts,
  mockModelUsage,
  mockInsights,
} from "@/lib/mock-data"
import { DollarSign, Zap, TrendingUp, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

const totalSpend = mockFeatureCosts.reduce((s, f) => s + f.cost, 0)
const totalRequests = mockFeatureCosts.reduce((s, f) => s + f.requests, 0)
const topFeature = [...mockFeatureCosts].sort((a, b) => b.cost - a.cost)[0]
const avgCost = totalSpend / totalRequests

const totalSavings = mockInsights.reduce((s, i) => s + i.estimatedSavings, 0)

function ConfidencePip({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-tight ${
      level === "HIGH"
        ? "bg-emerald-500 text-white"
        : level === "MEDIUM"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-slate-100 text-slate-500"
    }`}>
      {level}
    </span>
  )
}

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
          <StatCard label="Total AI spend" value={`$${totalSpend.toFixed(2)}`} trend={14.2} icon={DollarSign} />
          <StatCard label="Total requests" value={totalRequests.toLocaleString()} trend={8.7} icon={Zap} />
          <StatCard label="Top feature cost" value={`$${topFeature.cost.toFixed(2)}`} icon={TrendingUp} />
          <StatCard label="Avg cost / req" value={`$${avgCost.toFixed(4)}`} trend={-3.1} icon={Clock} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="col-span-2 rounded-[14px] border border-emerald-500/20 bg-emerald-50/30 p-5">
            <div className="flex flex-col h-full justify-between gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      AI INSIGHTS · WEEKLY
                    </span>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                      ⚠ {mockInsights.length} Recommendations
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockInsights.slice(0, 4).map((insight) => (
                    <div key={insight.id} className="flex flex-col gap-1.5 rounded-[10px] border border-emerald-500/10 bg-white/50 p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <ConfidencePip level={insight.confidence} />
                        <span className="text-[10px] font-bold text-emerald-600">+${insight.estimatedSavings}/mo</span>
                      </div>
                      <p className="text-[13px] font-semibold text-slate-800 line-clamp-1">{insight.title}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-normal">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[10px] bg-white border border-emerald-500/10 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Potential Savings</p>
                    <p className="text-2xl font-bold text-emerald-600">${totalSavings}<span className="text-xs font-medium text-slate-400 ml-1">/mo</span></p>
                  </div>
                    <Link href="/dashboard/insights" className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                    View all insights <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
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
        </div>
      </div>
    </div>
  )
}
