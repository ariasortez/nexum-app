"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { resetPassword } from "@/services/auth"
import { api, ApiError } from "@/lib/api"
import { toast } from "@/lib/toast"

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  )
}

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeSession() {
      const hash = window.location.hash

      if (hash && hash.includes("error")) {
        const params = new URLSearchParams(hash.substring(1))
        const errorDescription = params.get("error_description")
        if (errorDescription) {
          setError(decodeURIComponent(errorDescription.replace(/\+/g, " ")))
        }
        setIsInitializing(false)
        return
      }

      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")

        if (refreshToken) {
          try {
            await api.post("/auth/refresh", { refresh_token: refreshToken })
            window.history.replaceState(null, "", window.location.pathname)
          } catch {
            setError("El enlace ha expirado o es inválido. Solicita uno nuevo.")
          }
        } else if (!accessToken) {
          setError("Enlace de recuperación inválido. Solicita uno nuevo.")
        }
      }

      setIsInitializing(false)
    }

    initializeSession()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      setIsLoading(false)
      return
    }

    try {
      await resetPassword(password)
      setPasswordReset(true)
      toast.success("Contraseña actualizada", {
        description: "Ya puedes iniciar sesión con tu nueva contraseña.",
      })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("El enlace ha expirado o es inválido. Solicita uno nuevo.")
        } else {
          toast.error("Error", { description: err.message })
        }
      } else {
        toast.error("Error", { description: "No se pudo restablecer la contraseña. Intenta de nuevo." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[var(--surface)] text-[var(--on-surface)] min-h-screen flex flex-col md:flex-row selection:bg-[var(--primary-container)] selection:text-[var(--on-primary-container)]">
      {/* Mobile Header */}
      <header className="md:hidden bg-[var(--primary)] p-5 flex justify-center items-center h-32 relative overflow-hidden">
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
            Crea una nueva contraseña
          </h1>
          <p className="text-base text-[var(--primary-container)] mt-4 max-w-md">
            Elige una contraseña segura para proteger tu cuenta.
          </p>
        </div>
      </aside>

      {/* Right Panel: Form */}
      <main className="w-full md:w-[40%] flex flex-col justify-center px-5 py-10 md:p-10 lg:px-16 bg-[var(--surface-bright)] flex-grow">
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">
          {isInitializing ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--on-surface-variant)]">Verificando enlace...</p>
            </div>
          ) : error ? (
            <>
              {/* Error State */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-[var(--error-container)] rounded-full flex items-center justify-center">
                  <Icon name="link_off" className="text-3xl text-[var(--error)]" />
                </div>
                <header>
                  <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em] mb-1">
                    Enlace inválido
                  </h2>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    {error}
                  </p>
                </header>
              </div>

              <Link
                href="/forgot-password"
                className="mt-2 w-full py-3 px-4 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--primary-container)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--primary-container)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex justify-center items-center gap-2"
              >
                Solicitar nuevo enlace
                <Icon name="refresh" className="text-lg" />
              </Link>
            </>
          ) : passwordReset ? (
            <>
              {/* Success State */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-[var(--primary-container)] rounded-full flex items-center justify-center">
                  <Icon name="check_circle" className="text-3xl text-[var(--primary)]" />
                </div>
                <header>
                  <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em] mb-1">
                    Contraseña actualizada
                  </h2>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Tu contraseña ha sido restablecida exitosamente.
                  </p>
                </header>
              </div>

              <Link
                href="/login"
                className="mt-2 w-full py-3 px-4 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--primary-container)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--primary-container)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex justify-center items-center gap-2"
              >
                Iniciar sesión
                <Icon name="arrow_forward" className="text-lg" />
              </Link>
            </>
          ) : (
            <>
              {/* Form State */}
              <header>
                <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em] mb-1">
                  Nueva contraseña
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
                </p>
              </header>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* Password Input */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="password"
                    className="font-mono text-xs text-[var(--on-surface)] uppercase tracking-widest pl-1"
                  >
                    Nueva Contraseña
                  </label>
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
                      minLength={8}
                      autoComplete="new-password"
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

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="confirmPassword"
                    className="font-mono text-xs text-[var(--on-surface)] uppercase tracking-widest pl-1"
                  >
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Icon
                      name="lock"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline-variant)] pointer-events-none"
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full pl-11 pr-12 py-3 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm focus:outline-none focus:border-[var(--primary)] focus:ring-0 text-base text-[var(--on-surface)] placeholder:text-[var(--outline-variant)] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <Icon name={showConfirmPassword ? "visibility" : "visibility_off"} className="text-xl" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full py-3 px-4 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--primary-container)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--primary-container)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--primary-container)]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[var(--on-primary)] border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Restablecer contraseña
                      <Icon name="check" className="text-lg" />
                    </>
                  )}
                </button>
              </form>

              <footer className="text-center mt-4">
                <p className="text-sm text-[var(--on-surface-variant)]">
                  ¿Recordaste tu contraseña?{" "}
                  <Link
                    href="/login"
                    className="font-mono text-xs text-[var(--primary)] hover:text-[var(--primary-container)] underline decoration-[var(--primary)]/30 underline-offset-2 ml-1"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
