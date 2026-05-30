"use client"

import { AlertsDropdown } from "@/components/dashboard/alerts-dropdown"
import { LogOut } from "lucide-react"

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-sm font-semibold text-[#000000]">{title}</h1>
        {subtitle && <p className="text-[11px] text-[#737373]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1.5">
        <AlertsDropdown />
        <div className="h-5 w-px bg-[#e5e5e5]" />
        <button className="flex size-8 items-center justify-center rounded-[10px] text-[#737373] hover:bg-[#f2f2f2] hover:text-[#0a0a0a] transition-colors">
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}
