"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { logout } from "@/services/auth"

// Material Symbol Icon component
function Icon({ name, fill = false, className = "" }: { name: string; fill?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}

const NAV_ITEMS = [
  { href: "/client", icon: "grid_view", label: "Dashboard" },
  { href: "/client/services", icon: "handyman", label: "Servicios" },
  { href: "/client/requests", icon: "receipt_long", label: "Solicitudes" },
  { href: "/client/messages", icon: "chat_bubble", label: "Mensajes" },
  { href: "/client/profile", icon: "account_circle", label: "Perfil" },
]

const MOBILE_NAV_ITEMS = [
  { href: "/client", icon: "grid_view", label: "Inicio" },
  { href: "/client/requests", icon: "receipt_long", label: "Solicitudes" },
  { href: "/client/requests/new", icon: "add_circle", label: "Nueva", isAction: true },
  { href: "/client/messages", icon: "chat_bubble", label: "Mensajes" },
  { href: "/client/profile", icon: "person", label: "Perfil" },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isChecking, isAuthorized } = useAuthGuard("client")
  const [userName] = useState("Carlos") // This would come from auth context

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--outline)]">
            Cargando...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--background)] text-[var(--on-background)] min-h-screen flex overflow-x-hidden w-full max-w-full">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 pt-20 pb-8 px-4 h-screen w-64 border-r-2 border-[var(--on-surface)] rounded-tr-[32px] rounded-bl-[16px] shadow-[4px_0px_0px_0px_var(--primary-container)] bg-[var(--surface-container-low)] z-40">
        {/* Header */}
        <div className="mb-10 px-4">
          <h2 className="text-2xl font-semibold text-[var(--on-background)] tracking-[-0.02em]">
            HOLA, {userName.toUpperCase()}
          </h2>
          <p className="font-mono text-xs text-[var(--outline)] mt-2 uppercase tracking-wider">
            Client Portal
          </p>
        </div>

        {/* Navigation Items */}
        <ul className="flex flex-col gap-2 flex-grow">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-tr-lg rounded-bl-lg border-2 transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--on-surface)] shadow-[2px_2px_0px_0px_var(--on-surface)]"
                      : "text-[var(--on-surface-variant)] border-transparent hover:bg-[var(--surface-variant)] hover:border-[var(--on-surface)]"
                  }`}
                >
                  <Icon name={item.icon} fill={isActive} />
                  <span className="font-mono uppercase tracking-wider text-xs">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Logout Button */}
        <div className="mt-auto px-2">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-[var(--error-container)] text-[var(--on-error-container)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--error)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--error)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex justify-center items-center gap-2 rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm"
          >
            <Icon name="power_settings_new" className="text-base" />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0 overflow-x-hidden w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-[var(--surface-container-lowest)] border-t-2 border-[var(--on-surface)] lg:hidden z-50">
        <div className="flex justify-around py-2 px-2">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/client" && item.href !== "/client/requests/new" && pathname.startsWith(item.href))
            const isAction = (item as { isAction?: boolean }).isAction

            if (isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 -mt-5"
                >
                  <div className="w-11 h-11 bg-[var(--primary)] rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm flex items-center justify-center border-2 border-[var(--on-surface)] shadow-[2px_2px_0px_0px_var(--on-surface)]">
                    <Icon name={item.icon} className="text-[var(--on-primary)] text-xl" />
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--outline)]"
                }`}
              >
                <Icon name={item.icon} fill={isActive} className="text-xl" />
                <span className="text-[9px] font-medium uppercase tracking-wide">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
