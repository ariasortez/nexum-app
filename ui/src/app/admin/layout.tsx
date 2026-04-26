"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { NexumLogo, Badge } from "@/components/ui"
import { Home, Shield, User, List, Menu } from "@/components/icons"
import { useState } from "react"
import { useAuthGuard } from "@/hooks/use-auth-guard"

const NAV_ITEMS = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/verifications", icon: Shield, label: "Verificaciones", badge: 5 },
  { href: "/admin/providers", icon: User, label: "Proveedores" },
  { href: "/admin/requests", icon: List, label: "Solicitudes" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isChecking, isAuthorized } = useAuthGuard("admin")

  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--n-50)] flex items-center justify-center text-sm text-[var(--n-500)]">
        Cargando sesión...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--n-50)] flex">
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--n-900)] transform transition-transform lg:translate-x-0 lg:static ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-2">
            <NexumLogo size={18} />
            <Badge tone="neutral" solid className="text-[10px]">Admin</Badge>
          </div>
        </div>
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {item.badge && (
                  <Badge tone="red" solid className="ml-auto text-[10px]">{item.badge}</Badge>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold text-white">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Admin</div>
              <div className="text-xs text-white/50">admin@nexum.hn</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-[var(--n-0)] border-b border-[var(--n-100)] px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-[var(--n-600)]"
            >
              <Menu size={20} />
            </button>
            <NexumLogo size={16} />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
