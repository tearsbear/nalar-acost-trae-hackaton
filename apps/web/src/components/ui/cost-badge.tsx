import { cn } from "@/lib/utils"

function formatCost(value: number): string {
  if (value < 0.01) return `$${value.toFixed(4)}`
  if (value < 1) return `$${value.toFixed(3)}`
  if (value < 100) return `$${value.toFixed(2)}`
  return `$${value.toFixed(0)}`
}

export function CostBadge({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#f2f2f2] px-2 py-0.5 text-xs font-medium text-[#0a0a0a]",
        className
      )}
    >
      {formatCost(value)}
    </span>
  )
}
