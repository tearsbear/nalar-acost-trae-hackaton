"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"

const tabs = [
  { href: "/dashboard/settings", label: "API Keys" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Settings" subtitle="Workspace configuration" />
      <div className="flex flex-col gap-0 p-6">
        <div className="flex gap-0 border-b border-[#e5e5e5] mb-6">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                pathname === tab.href
                  ? "border-[#000000] text-[#000000]"
                  : "border-transparent text-[#737373] hover:text-[#0a0a0a]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}
