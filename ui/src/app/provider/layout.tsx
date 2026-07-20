"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { logout } from "@/services/auth"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { getAuthSession } from "@/lib/session"
import type { AuthUser } from "@/types/auth"

function Icon({ name, filled = false, className = "", size }: { name: string; filled?: boolean; className?: string; size?: number }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        ...(filled && { fontVariationSettings: "'FILL' 1" }),
        ...(size && { fontSize: `${size}px` }),
      }}
    >
      {name}
    </span>
  )
}

const NAV_ITEMS = [
  { href: "/provider", icon: "space_dashboard", label: "Inicio" },
  { href: "/provider/opportunities", icon: "work", label: "Oportunidades" },
  { href: "/provider/requests", icon: "receipt_long", label: "Cotizaciones" },
  { href: "/provider/messages", icon: "chat", label: "Mensajes" },
  { href: "/provider/portfolio", icon: "photo_library", label: "Portafolio" },
  { href: "/provider/certifications", icon: "workspace_premium", label: "Certificaciones" },
  { href: "/provider/credits", icon: "toll", label: "Créditos" },
]

const MOBILE_NAV_ITEMS = [
  { href: "/provider", icon: "space_dashboard", label: "Inicio" },
  { href: "/provider/opportunities", icon: "work", label: "Buscar" },
  { href: "/provider/requests", icon: "receipt_long", label: "Cotizaciones" },
  { href: "/provider/messages", icon: "chat", label: "Mensajes" },
  { href: "/provider/profile", icon: "person", label: "Perfil" },
]

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isChecking, isAuthorized } = useAuthGuard("provider")
  const [isAvailable, setIsAvailable] = useState(true)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const providerName = currentUser?.full_name?.split(" ")[0] ?? "Proveedor"

  useEffect(() => {
    if (!isAuthorized) return
    queueMicrotask(() => {
      setCurrentUser(getAuthSession()?.user ?? null)
    })
  }, [isAuthorized])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="fixo-loader">
            <div className="fixo-loader-dot" />
            <div className="fixo-loader-dot" />
            <div className="fixo-loader-dot" />
          </div>
          <span className="text-label-sm font-label text-[var(--on-surface-variant)] uppercase tracking-wider">
            Cargando...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-clip bg-[var(--background)] text-[var(--on-background)]">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-72 bg-[var(--surface)] border-r-4 border-[var(--primary)] z-40">
        {/* Logo */}
        <div className="p-6 border-b-4 border-[var(--primary)]">
          <Link href="/" className="block">
            <span className="text-4xl font-black text-[var(--secondary)] font-headline tracking-tight">
              FIXO
            </span>
          </Link>
        </div>

        {/* Provider Info */}
        <div className="p-6 border-b-2 border-[var(--primary)]/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-[var(--primary-container)] border-4 border-[var(--primary)] flex items-center justify-center">
                <span className="text-2xl font-black text-[var(--primary)] font-headline">
                  {providerName.charAt(0).toUpperCase()}
                </span>
              </div>
              {isAvailable && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[var(--surface)]" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--primary)] font-headline">
                {providerName}
              </p>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className="text-label-sm font-label uppercase tracking-wider flex items-center gap-1"
              >
                {isAvailable ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500" />
                    Disponible
                  </span>
                ) : (
                  <span className="text-[var(--on-surface-variant)] flex items-center gap-1">
                    <span className="w-2 h-2 bg-[var(--on-surface-variant)]" />
                    No disponible
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <ul className="flex flex-col gap-1 px-4 py-4 flex-grow">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/provider" && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-4 border-4 transition-all ${
                    isActive
                      ? "bg-[var(--primary)] border-[var(--primary)] neo-shadow-sm"
                      : "text-[var(--primary)] border-transparent hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30"
                  }`}
                >
                  <Icon name={item.icon} filled={isActive} size={28} className={isActive ? "!text-white" : ""} />
                  <span className={`font-label text-label-md uppercase tracking-wider font-bold ${isActive ? "!text-white" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Profile & Logout */}
        <div className="p-4 border-t-2 border-[var(--primary)]/20 space-y-2">
          <Link
            href="/provider/profile"
            className={`flex items-center gap-4 px-4 py-3 border-4 transition-all ${
              pathname === "/provider/profile"
                ? "bg-[var(--primary)] border-[var(--primary)]"
                : "text-[var(--primary)] border-transparent hover:bg-[var(--primary)]/10"
            }`}
          >
            <Icon name="settings" size={24} className={pathname === "/provider/profile" ? "!text-white" : ""} />
            <span className={`font-label text-label-md uppercase tracking-wider ${pathname === "/provider/profile" ? "!text-white" : ""}`}>
              Configuración
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-[var(--error)] border-4 border-transparent hover:bg-[var(--error)]/10 hover:border-[var(--error)]/30 transition-all"
          >
            <Icon name="logout" size={24} />
            <span className="font-label text-label-md uppercase tracking-wider">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen w-full min-w-0 flex-1 overflow-x-clip pb-24 lg:ml-72 lg:pb-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex w-full max-w-full items-center justify-between overflow-x-clip border-b-4 border-[var(--primary)] bg-[var(--surface)] px-4 py-3 lg:hidden">
          <Link href="/" className="block">
            <span className="text-2xl font-black text-[var(--secondary)] font-headline tracking-tight">
              FIXO
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-3 py-1.5 border-2 text-[10px] font-label font-bold uppercase tracking-wider transition-all ${
                isAvailable
                  ? "bg-green-100 border-green-600 text-green-700"
                  : "bg-[var(--surface-container)] border-[var(--on-surface-variant)] text-[var(--on-surface-variant)]"
              }`}
            >
              {isAvailable ? "Disponible" : "No disponible"}
            </button>
            <NotificationsDropdown userId={currentUser?.id} role="provider" />
          </div>
        </header>

        {children}
      </main>

      {/* Desktop Notifications */}
      <div className="hidden lg:block fixed right-8 top-6 z-50">
        <NotificationsDropdown userId={currentUser?.id} role="provider" />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 w-full border-t-4 border-[var(--primary)] bg-[var(--surface)] lg:hidden">
        <div className="grid grid-cols-5 items-center px-1 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/provider" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-center transition-colors ${
                  isActive ? "text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
                }`}
              >
                <Icon name={item.icon} filled={isActive} size={22} />
                <span className="w-full truncate text-[9px] font-label font-bold uppercase tracking-[0.04em]">
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
