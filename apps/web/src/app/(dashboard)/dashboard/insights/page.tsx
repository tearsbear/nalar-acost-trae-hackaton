import { DashboardHeader } from "@/components/dashboard/header"
import { mockInsights } from "@/lib/mock-data"
import { ArrowRight, TrendingDown, Cpu, Database, Users } from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  ins_1: Cpu,
  ins_2: TrendingDown,
  ins_3: Database,
  ins_4: Users,
}

const totalSavings = mockInsights.reduce((s, i) => s + i.estimatedSavings, 0)

function ConfidencePip({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
      level === "HIGH"
        ? "bg-[#0a0a0a] text-white"
        : level === "MEDIUM"
        ? "bg-[#f2f2f2] text-[#737373]"
        : "bg-[#f2f2f2] text-[#a1a1a1]"
    }`}>
      <span className={`size-1.5 rounded-full ${level === "HIGH" ? "bg-white" : "bg-[#a1a1a1]"}`} />
      {level}
    </span>
  )
}

export default function InsightsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader title="Insights" subtitle="AI-powered optimization recommendations" />

      <div className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-[14px] border border-[#e5e5e5] bg-[#0a0a0a] p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">Potential savings</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-white">${totalSavings}<span className="text-lg text-white/40">/mo</span></p>
            <p className="mt-2 text-xs text-white/50">
              Based on {mockInsights.length} recommendations across your AI features. Implementing all HIGH confidence suggestions alone saves ${mockInsights.filter(i => i.confidence === "HIGH").reduce((s, i) => s + i.estimatedSavings, 0)}/mo.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-[14px] border border-[#e5e5e5] bg-white p-5">
            <p className="text-xs font-medium text-[#737373]">By confidence</p>
            {(["HIGH", "MEDIUM", "LOW"] as const).map((level) => {
              const count = mockInsights.filter((i) => i.confidence === level).length
              const savings = mockInsights.filter((i) => i.confidence === level).reduce((s, i) => s + i.estimatedSavings, 0)
              return (
                <div key={level} className="flex items-center justify-between">
                  <ConfidencePip level={level} />
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#0a0a0a]">${savings}</span>
                    <span className="ml-1 text-[11px] text-[#737373]">· {count} rec</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {mockInsights.map((insight) => {
            const Icon = iconMap[insight.id] ?? TrendingDown
            return (
              <div
                key={insight.id}
                className="group rounded-[14px] border border-[#e5e5e5] bg-white p-5 hover:border-[#0a0a0a] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f2f2f2] group-hover:bg-[#0a0a0a] transition-colors">
                    <Icon className="size-4 text-[#737373] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ConfidencePip level={insight.confidence} />
                      {insight.affectedFeature && (
                        <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5 text-[10px] font-medium text-[#737373]">
                          {insight.affectedFeature}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#000000]">{insight.title}</p>
                    <p className="text-xs text-[#737373] leading-relaxed">{insight.description}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="rounded-[10px] border border-[#e5e5e5] bg-[#f2f2f2] px-3 py-2 text-center min-w-[80px]">
                      <p className="text-[10px] text-[#737373]">Save up to</p>
                      <p className="text-lg font-semibold text-[#000000]">${insight.estimatedSavings}</p>
                      <p className="text-[10px] text-[#737373]">/ month</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#737373] group-hover:text-[#0a0a0a] transition-colors">
                      View details <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
