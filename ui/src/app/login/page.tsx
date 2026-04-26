"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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

// Google Icon SVG
function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
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
      <header className="md:hidden bg-[var(--primary)] p-5 flex justify-center items-center h-32 relative overflow-hidden">
        {/* Decorative shape */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full fill-white" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polygon points="0,0 100,0 100,50 0,100" />
          </svg>
        </div>
        <Link href="/" className="z-10">
          <Image
            src="/nexum-logo-white.svg"
            alt="Nexum Logo"
            width={120}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>
      </header>

      {/* Left Panel: Branding (Desktop) */}
      <aside className="hidden md:flex flex-col justify-center relative w-[60%] bg-[var(--primary)] overflow-hidden p-10 lg:p-20">
        {/* Geometric Decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-[var(--primary-container)] opacity-40 rounded-tl-[24px] rounded-br-[24px] rounded-tr-[4px] rounded-bl-[4px] transform rotate-12 mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[60%] aspect-square bg-[var(--inverse-primary)] opacity-20 rounded-tl-[16px] rounded-br-[16px] rounded-tr-[4px] rounded-bl-[4px] transform -rotate-6" />
        <div className="absolute top-[30%] left-[20%] w-24 h-24 border-4 border-[var(--on-primary)] opacity-10 rounded-full" />
        <div className="absolute bottom-[20%] right-[20%] w-16 h-16 bg-[var(--secondary-container)] opacity-20 rounded-tl-[16px] rounded-br-[16px] rounded-tr-[4px] rounded-bl-[4px] transform rotate-45" />

        <div className="relative z-10 max-w-2xl">
          <Link href="/">
            <Image
              src="/nexum-logo-white.svg"
              alt="Nexum Logo"
              width={160}
              height={64}
              className="h-16 w-auto mb-6"
              priority
            />
          </Link>
          <h1 className="text-[40px] font-bold text-[var(--on-primary)] tracking-[-0.04em] leading-[1.1] max-w-lg">
            Conectamos soluciones con quienes las necesitan.
          </h1>
          <p className="text-base text-[var(--primary-container)] mt-4 max-w-md">
            Tu red confiable de servicios locales. Rápido, seguro y eficiente.
          </p>
        </div>
      </aside>

      {/* Right Panel: Login Form */}
      <main className="w-full md:w-[40%] flex flex-col justify-center px-5 py-10 md:p-10 lg:px-16 bg-[var(--surface-bright)] flex-grow">
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">
          {/* Header */}
          <header>
            <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em] mb-1">
              Bienvenido de vuelta
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Ingresa tus credenciales para continuar.
            </p>
          </header>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="font-mono text-xs text-[var(--on-surface)] uppercase tracking-widest pl-1"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Icon
                  name="mail"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline-variant)] pointer-events-none"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm focus:outline-none focus:border-[var(--primary)] focus:ring-0 text-base text-[var(--on-surface)] placeholder:text-[var(--outline-variant)] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center pl-1">
                <label
                  htmlFor="password"
                  className="font-mono text-xs text-[var(--on-surface)] uppercase tracking-widest"
                >
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="font-mono text-xs text-[var(--primary)] hover:text-[var(--primary-container)] underline decoration-[var(--primary)]/30 underline-offset-2"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline-variant)] pointer-events-none"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm focus:outline-none focus:border-[var(--primary)] focus:ring-0 text-base text-[var(--on-surface)] placeholder:text-[var(--outline-variant)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors"
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
              className="mt-2 w-full py-3 px-4 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--primary-container)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--primary-container)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--primary-container)]"
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-grow border-t border-[var(--surface-variant)]" />
            <span className="font-mono text-xs text-[var(--outline-variant)] uppercase">
              o ingresa con
            </span>
            <div className="flex-grow border-t border-[var(--surface-variant)]" />
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            className="w-full py-3 px-4 bg-[var(--surface-container-lowest)] text-[var(--on-surface)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm hover:bg-[var(--surface-container-low)] active:bg-[var(--surface-variant)] transition-colors flex justify-center items-center gap-3"
          >
            <GoogleIcon className="w-5 h-5" />
            Google
          </button>

          {/* Footer */}
          <footer className="text-center mt-4">
            <p className="text-sm text-[var(--on-surface-variant)]">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-mono text-xs text-[var(--primary)] hover:text-[var(--primary-container)] underline decoration-[var(--primary)]/30 underline-offset-2 ml-1"
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
