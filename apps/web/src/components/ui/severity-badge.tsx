import { cn } from "@/lib/utils"

type Severity = "HIGH" | "MEDIUM" | "LOW"

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        severity === "HIGH" && "bg-[#c22b10]/10 text-[#c22b10]",
        severity === "MEDIUM" && "bg-[#f2f2f2] text-[#737373]",
        severity === "LOW" && "bg-[#f2f2f2] text-[#0a0a0a]",
        className
      )}
    >
      {severity}
    </span>
  )
}
