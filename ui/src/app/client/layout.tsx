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
  { href: "/client", icon: "space_dashboard", label: "Inicio" },
  { href: "/client/services", icon: "handyman", label: "Servicios" },
  { href: "/client/requests", icon: "assignment", label: "Solicitudes" },
  { href: "/client/messages", icon: "chat", label: "Mensajes" },
]

const MOBILE_NAV_ITEMS = [
  { href: "/client", icon: "space_dashboard", label: "Inicio" },
  { href: "/client/services", icon: "handyman", label: "Servicios" },
  { href: "/client/requests", icon: "assignment", label: "Solicitudes" },
  { href: "/client/messages", icon: "chat", label: "Mensajes" },
  { href: "/client/profile", icon: "person", label: "Perfil" },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isChecking, isAuthorized } = useAuthGuard("client")
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const userName = currentUser?.full_name?.split(" ")[0] ?? "Cliente"

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

        {/* User Info */}
        <div className="p-6 border-b-2 border-[var(--primary)]/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[var(--primary-container)] border-4 border-[var(--primary)] flex items-center justify-center">
              <span className="text-2xl font-black text-[var(--primary)] font-headline">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--primary)] font-headline">
                {userName}
              </p>
              <p className="text-label-sm font-label text-[var(--on-surface-variant)] uppercase tracking-wider">
                Cliente
              </p>
            </div>
          </div>
        </div>

        {/* New Request Button */}
        <div className="p-4">
          <Link
            href="/client/requests/new"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--primary-container)] text-[var(--primary)] border-4 border-[var(--primary)] neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] transition-all font-label text-label-md uppercase tracking-wider font-bold"
          >
            <Icon name="add_circle" filled size={24} />
            Nueva Solicitud
          </Link>
        </div>

        {/* Navigation Items */}
        <ul className="flex flex-col gap-1 px-4 py-2 flex-grow">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href))

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
            href="/client/profile"
            className={`flex items-center gap-4 px-4 py-3 border-4 transition-all ${
              pathname === "/client/profile"
                ? "bg-[var(--primary)] border-[var(--primary)]"
                : "text-[var(--primary)] border-transparent hover:bg-[var(--primary)]/10"
            }`}
          >
            <Icon name="settings" size={24} className={pathname === "/client/profile" ? "!text-white" : ""} />
            <span className={`font-label text-label-md uppercase tracking-wider ${pathname === "/client/profile" ? "!text-white" : ""}`}>
              Configuración
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-[var(--secondary)] border-4 border-transparent hover:bg-[var(--secondary)]/10 hover:border-[var(--secondary)]/30 transition-all"
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
          <NotificationsDropdown userId={currentUser?.id} role="client" />
        </header>

        {children}
      </main>

      {/* Desktop Notifications */}
      <div className="hidden lg:block fixed right-8 top-6 z-50">
        <NotificationsDropdown userId={currentUser?.id} role="client" />
      </div>

      {/* Mobile Floating Action Button - Only show on Home, Services, Requests list */}
      {(pathname === "/client" || pathname === "/client/services" || pathname === "/client/requests") && (
        <Link
          href="/client/requests/new"
          className="fixed right-4 bottom-24 z-50 lg:hidden w-14 h-14 bg-[var(--primary-container)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="add" filled size={28} className="text-[var(--primary)]" />
        </Link>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 w-full border-t-4 border-[var(--primary)] bg-[var(--surface)] lg:hidden">
        <div className="grid grid-cols-5 items-center px-1 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href))

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
