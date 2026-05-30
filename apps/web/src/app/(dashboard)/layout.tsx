import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { OnboardingCheck } from "@/components/dashboard/onboarding-check"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9f9]">
      <OnboardingCheck />
      <DashboardSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
