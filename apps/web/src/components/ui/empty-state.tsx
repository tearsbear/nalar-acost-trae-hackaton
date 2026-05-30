import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-[#e5e5e5] bg-[#f2f2f2] px-6 py-16 text-center",
        className
      )}
    >
      <p className="text-sm font-medium text-[#0a0a0a]">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-[#737373]">{description}</p>
      )}
    </div>
  )
}
