"use client"

import { Home, List, Search, User, Inbox, Coin } from "@/components/icons"

type TabKey = "home" | "reqs" | "search" | "profile" | "jobs" | "credits"
type Role = "client" | "provider"

interface TabConfig {
  key: TabKey
  label: string
  icon: typeof Home
  href: string
}

const clientTabs: TabConfig[] = [
  { key: "home", label: "Inicio", icon: Home, href: "/dashboard" },
  { key: "reqs", label: "Solicitudes", icon: List, href: "/requests" },
  { key: "search", label: "Buscar", icon: Search, href: "/categories" },
  { key: "profile", label: "Perfil", icon: User, href: "/profile" },
]

const providerTabs: TabConfig[] = [
  { key: "home", label: "Inicio", icon: Home, href: "/provider/dashboard" },
  { key: "jobs", label: "Solicitudes", icon: Inbox, href: "/provider/jobs" },
  { key: "credits", label: "Créditos", icon: Coin, href: "/provider/credits" },
  { key: "profile", label: "Perfil", icon: User, href: "/provider/profile" },
]

interface MobileTabBarProps {
  active: TabKey
  role?: Role
  onNavigate?: (href: string) => void
}

export function MobileTabBar({
  active,
  role = "client",
  onNavigate,
}: MobileTabBarProps) {
  const tabs = role === "client" ? clientTabs : providerTabs

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20
        bg-white/[0.92] backdrop-blur-[20px] backdrop-saturate-[180%]
        border-t border-[var(--n-150)]
        pb-7 pt-2 flex"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.key

        return (
          <button
            key={tab.key}
            onClick={() => onNavigate?.(tab.href)}
            className={`
              flex-1 flex flex-col items-center gap-[3px] py-1.5
              bg-transparent border-none cursor-pointer
              ${isActive ? "text-[var(--brand-600)]" : "text-[var(--n-400)]"}
            `}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
