import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export function TrendIndicator({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const isUp = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isUp ? "text-[#c22b10]" : "text-[#10c22b]",
        className
      )}
    >
      {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {isUp ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  )
}
