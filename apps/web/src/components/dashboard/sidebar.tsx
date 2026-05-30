"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ScrollText, Lightbulb, Settings, LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiLogout } from "@/lib/auth"
import { workspacesApi, Workspace } from "@/lib/api"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/logs", label: "Logs", icon: ScrollText },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const ws = await workspacesApi.list()
        if (ws.length > 0) {
          setWorkspace(ws[0]) // Show first workspace for now
        }
      } catch (err) {
        console.error("Failed to fetch workspace:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkspace()
  }, [])

  async function handleLogout() {
    try {
      await apiLogout()
      router.push("/login")
    } catch (err) {
      console.error("Failed to logout:", err)
    }
  }

  return (
    <aside className="flex h-full w-52 flex-col border-r border-[#e5e5e5] bg-white">
      <div className="flex h-14 items-center gap-2.5 border-b border-[#e5e5e5] px-4">
        <div className="flex size-6 items-center justify-center rounded-[6px] bg-[#000000]">
          <span className="text-[10px] font-bold text-white">AI</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-[#000000]">Acost</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-[#0a0a0a] font-medium text-white"
                  : "text-[#737373] hover:bg-[#f2f2f2] hover:text-[#0a0a0a]"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#e5e5e5] p-2.5">
        <div className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 hover:bg-[#f2f2f2] transition-colors">
          <div className="flex size-7 items-center justify-center rounded-full bg-[#0a0a0a] text-[11px] font-semibold text-white shrink-0">
            {workspace ? workspace.name.slice(0, 1).toUpperCase() : "U"}
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="truncate text-xs font-medium text-[#0a0a0a]">
              {workspace ? workspace.name : "User"}
            </span>
            <span className="truncate text-[11px] text-[#737373]">
              {loading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                workspace?.slug || "No workspace"
              )}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-[#737373] hover:text-[#0a0a0a] transition-colors"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
