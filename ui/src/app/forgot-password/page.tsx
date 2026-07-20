"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { forgotPassword } from "@/services/auth"
import { ApiError } from "@/lib/api"
import { toast } from "@/lib/toast"

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  )
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string | null)?.trim() ?? ""

    try {
      await forgotPassword(email)
      setSentEmail(email)
      setEmailSent(true)
      toast.success("Correo enviado", {
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo enviar el correo. Intenta de nuevo."
      toast.error("Error", { description: message })
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
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-base text-[var(--primary-container)] mt-4 max-w-md">
            No te preocupes, te enviaremos instrucciones para restablecerla.
          </p>
        </div>
      </aside>

      {/* Right Panel: Form */}
      <main className="w-full md:w-[40%] flex flex-col justify-center px-5 py-10 md:p-10 lg:px-16 bg-[var(--surface-bright)] flex-grow">
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">
          {emailSent ? (
            <>
              {/* Success State */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-[var(--primary-container)] rounded-full flex items-center justify-center">
                  <Icon name="mark_email_read" className="text-3xl text-[var(--primary)]" />
                </div>
                <header>
                  <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em] mb-1">
                    Revisa tu correo
                  </h2>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Enviamos instrucciones a <strong>{sentEmail}</strong> para restablecer tu contraseña.
                  </p>
                </header>
              </div>

              <div className="bg-[var(--surface-container)] border-2 border-[var(--outline-variant)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm p-4">
                <p className="text-sm text-[var(--on-surface-variant)]">
                  <Icon name="info" className="text-base align-middle mr-1" />
                  Si no ves el correo, revisa tu carpeta de spam.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-2 w-full py-3 px-4 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--primary-container)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--primary-container)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex justify-center items-center gap-2"
              >
                Volver al inicio de sesión
                <Icon name="arrow_forward" className="text-lg" />
              </Link>
            </>
          ) : (
            <>
              {/* Form State */}
              <header>
                <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em] mb-1">
                  Recuperar contraseña
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </header>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full py-3 px-4 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase tracking-widest border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--primary-container)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--primary-container)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--primary-container)]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[var(--on-primary)] border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar enlace
                      <Icon name="send" className="text-lg" />
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
