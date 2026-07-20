"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { login } from "@/services/auth"
import { ApiError } from "@/lib/api"
import { toast } from "@/lib/toast"
import type { UserRole } from "@/types/auth"

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


function getRedirectPath(role?: UserRole) {
  if (role === "admin") return "/admin"
  if (role === "provider") return "/provider"
  return "/client"
}

function getSafeRedirectPath(nextPath: string | null, fallbackPath: string) {
  if (!nextPath) return fallbackPath
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return fallbackPath
  if (nextPath.startsWith("/login")) return fallbackPath
  return nextPath
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shownRegisteredToast = useRef(false)
  const shownExpiredToast = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!shownRegisteredToast.current && searchParams.get("registered") === "true") {
      shownRegisteredToast.current = true
      toast.success("Cuenta creada", {
        description: "Ya puedes iniciar sesión con tus credenciales.",
      })
    }

    if (!shownExpiredToast.current && searchParams.get("expired") === "true") {
      shownExpiredToast.current = true
      toast.info("Tu sesión expiró", {
        description: "Inicia sesión de nuevo para continuar.",
      })
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string | null)?.trim() ?? ""
    const password = (formData.get("password") as string | null) ?? ""

    try {
      const result = await login({ email, password })
      toast.success("Sesión iniciada")
      const fallbackPath = getRedirectPath(result.user.role)
      const nextPath = searchParams.get("next")
      router.push(getSafeRedirectPath(nextPath, fallbackPath))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo iniciar sesión. Intenta de nuevo."
      toast.error("Error al iniciar sesión", { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[var(--surface)] text-[var(--on-surface)] min-h-screen flex flex-col md:flex-row selection:bg-[var(--primary-container)] selection:text-[var(--on-primary-container)]">
      {/* Mobile Header */}
      <header className="md:hidden bg-[var(--primary)] p-5 flex justify-center items-center h-32 relative overflow-hidden border-b-4 border-[var(--primary-container)]">
        <Link href="/" className="z-10 text-4xl font-black text-[var(--primary-container)] font-headline tracking-tight">
          FIXO
        </Link>
      </header>

      {/* Left Panel: Branding (Desktop) */}
      <aside className="hidden md:flex flex-col justify-center relative w-[55%] bg-[var(--primary)] overflow-hidden p-10 lg:p-16 border-r-4 border-[var(--primary-container)]">
        {/* Floating Service Icons */}
        <Icon name="electrical_services" className="absolute top-[2%] right-[5%] text-[200px] text-[var(--primary-container)] opacity-25" />
        <Icon name="plumbing" className="absolute top-[10%] left-[2%] text-[180px] text-[var(--on-primary)] opacity-15" />
        <Icon name="construction" className="absolute bottom-[10%] right-[0%] text-[220px] text-[var(--primary-container)] opacity-20" />
        <Icon name="format_paint" className="absolute bottom-[0%] left-[10%] text-[160px] text-[var(--on-primary)] opacity-15" />
        <Icon name="carpenter" className="absolute top-[30%] right-[20%] text-[150px] text-[var(--primary-container)] opacity-20" />
        <Icon name="ac_unit" className="absolute top-[45%] left-[-5%] text-[190px] text-[var(--on-primary)] opacity-10" />
        <Icon name="home_repair_service" className="absolute bottom-[30%] right-[-5%] text-[170px] text-[var(--primary-container)] opacity-15" />
        <Icon name="roofing" className="absolute top-[-5%] left-[20%] text-[140px] text-[var(--on-primary)] opacity-15" />
        <Icon name="handyman" className="absolute top-[55%] right-[10%] text-[160px] text-[var(--primary-container)] opacity-20" />
        <Icon name="cleaning_services" className="absolute bottom-[45%] left-[15%] text-[130px] text-[var(--on-primary)] opacity-10" />
        <Icon name="local_shipping" className="absolute top-[20%] right-[-5%] text-[150px] text-[var(--primary-container)] opacity-15" />
        <Icon name="water_damage" className="absolute bottom-[-5%] right-[20%] text-[165px] text-[var(--on-primary)] opacity-10" />
        <Icon name="garage" className="absolute top-[65%] left-[5%] text-[140px] text-[var(--primary-container)] opacity-15" />
        <Icon name="yard" className="absolute top-[38%] left-[30%] text-[120px] text-[var(--on-primary)] opacity-10" />

        <div className="relative z-10 max-w-xl">
          <Link href="/" className="inline-block mb-8">
            <span className="text-5xl font-black text-[var(--primary-container)] font-headline tracking-tight">
              FIXO
            </span>
          </Link>
          <h1 className="text-4xl font-black text-[var(--on-primary)] font-headline leading-[1.1] mb-4">
            Conectamos soluciones con quienes las necesitan.
          </h1>
          <p className="text-lg text-[var(--primary-container)] font-body max-w-md">
            El marketplace de servicios para el hogar en Honduras. Encuentra profesionales verificados cerca de ti.
          </p>
        </div>
      </aside>

      {/* Right Panel: Login Form */}
      <main className="w-full md:w-[45%] flex flex-col justify-center px-5 py-10 md:p-10 lg:px-16 bg-[var(--surface)] flex-grow">
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">
          {/* Header */}
          <header>
            <h2 className="text-3xl font-black text-[var(--primary)] font-headline mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-body-md text-[var(--on-surface-variant)]">
              Ingresa tus credenciales para continuar.
            </p>
          </header>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-label-md font-label text-[var(--primary)] uppercase"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Icon
                  name="mail"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)] pointer-events-none"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-4 bg-[var(--surface)] border-4 border-[var(--primary)] focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] focus:-translate-x-[2px] focus:-translate-y-[2px] text-base text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]/50 transition-all font-label"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-label-md font-label text-[var(--primary)] uppercase"
                >
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-label-sm font-label text-[var(--secondary)] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)] pointer-events-none"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-4 bg-[var(--surface)] border-4 border-[var(--primary)] focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary)] focus:-translate-x-[2px] focus:-translate-y-[2px] text-base text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]/50 transition-all font-label"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Icon name={showPassword ? "visibility" : "visibility_off"} className="text-xl" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full py-4 px-6 bg-[var(--primary)] text-[var(--on-primary)] text-label-md font-label uppercase tracking-wider border-4 border-[var(--primary)] neo-shadow-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--on-primary)] border-t-transparent rounded-full animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <Icon name="arrow_forward" className="text-lg" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <footer className="text-center mt-6 pt-6 border-t-2 border-[var(--primary)]/20">
            <p className="text-body-md text-[var(--on-surface-variant)]">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="text-label-md font-label text-[var(--secondary)] hover:text-[var(--primary)] font-bold uppercase ml-1"
              >
                Regístrate
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
