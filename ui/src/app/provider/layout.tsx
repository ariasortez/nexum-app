"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
  { href: "/provider", icon: "dashboard", label: "Dashboard" },
  { href: "/provider/opportunities", icon: "work_outline", label: "Oportunidades" },
  { href: "/provider/jobs", icon: "assignment_turned_in", label: "Mis Trabajos" },
  { href: "/provider/messages", icon: "chat_bubble", label: "Mensajes" },
  { href: "/provider/finances", icon: "payments", label: "Finanzas" },
  { href: "/provider/profile", icon: "account_circle", label: "Perfil" },
]

const MOBILE_NAV_ITEMS = [
  { href: "/provider", icon: "home", label: "Inicio" },
  { href: "/provider/opportunities", icon: "explore", label: "Oportunidades" },
  { href: "/provider/messages", icon: "chat_bubble", label: "Chat" },
  { href: "/provider/profile", icon: "person", label: "Perfil" },
]

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isChecking, isAuthorized } = useAuthGuard("provider")
  const [isAvailable, setIsAvailable] = useState(true)
  const [providerName] = useState("Mario")

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
    <div className="bg-[var(--background)] text-[var(--on-background)] min-h-screen">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-[var(--surface-container-lowest)] border-r-2 border-[var(--on-surface)] shadow-[4px_0px_0px_0px_var(--primary-container)] z-40">
        {/* Provider Info Header */}
        <div className="p-5 flex items-center gap-3 border-b-2 border-[var(--on-surface)]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--on-surface)] overflow-hidden bg-[var(--surface-container-high)]">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt="Provider Avatar"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            {isAvailable && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--surface-container-lowest)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[var(--on-surface)] truncate tracking-[-0.02em]">
              Hola, {providerName}
            </h2>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className="font-mono text-[10px] text-[var(--outline)] uppercase tracking-wider flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
            >
              Estado: {isAvailable ? (
                <span className="text-green-600">Disponible</span>
              ) : (
                <span className="text-[var(--outline)]">No Disponible</span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/provider" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 transition-all font-mono uppercase text-xs font-bold rounded-sm ${
                  isActive
                    ? "bg-[var(--primary)] text-[var(--on-primary)] border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)]"
                    : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] hover:translate-x-1"
                }`}
              >
                <Icon name={item.icon} fill={isActive} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t-2 border-[var(--on-surface)]">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-[var(--error-container)] text-[var(--on-error-container)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--error)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--error)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex justify-center items-center gap-2 rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm"
          >
            <Icon name="power_settings_new" className="text-base" />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden flex justify-around items-center h-20 px-2 bg-[var(--surface-container-lowest)]/90 backdrop-blur-lg fixed bottom-0 w-full z-50 border-t-2 border-[var(--on-surface)]">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/provider" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center font-mono text-[10px] uppercase font-bold px-4 py-2 transition-all ${
                isActive
                  ? "text-[var(--primary)] scale-110"
                  : "text-[var(--outline)] opacity-70"
              }`}
            >
              <Icon name={item.icon} fill={isActive} className="text-2xl" />
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
