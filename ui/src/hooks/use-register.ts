"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerClient, registerProvider } from "@/services/auth"
import { ApiError } from "@/lib/api"
import { toast } from "@/lib/toast"
import type { RegisterClientInput, RegisterProviderInput } from "@/types/auth"

type UseRegisterResult = {
  isLoading: boolean
  error: string | null
  submitClient: (input: RegisterClientInput) => Promise<void>
  submitProvider: (input: RegisterProviderInput) => Promise<void>
}

export function useRegister(): UseRegisterResult {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitClient(input: RegisterClientInput) {
    setIsLoading(true)
    setError(null)

    try {
      await registerClient(input)
      toast.success("¡Cuenta creada exitosamente!", {
        description: "Revisa tu correo electrónico para confirmar tu cuenta.",
        duration: 8000,
      })
      router.push("/login?registered=true")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error al crear la cuenta. Intenta de nuevo."
      setError(message)
      toast.error("Error al crear cuenta", { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  async function submitProvider(input: RegisterProviderInput) {
    setIsLoading(true)
    setError(null)

    try {
      await registerProvider(input)
      toast.success("¡Cuenta creada exitosamente!", {
        description: "Revisa tu correo electrónico para confirmar tu cuenta.",
        duration: 8000,
      })
      router.push("/login?registered=true")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error al crear la cuenta. Intenta de nuevo."
      setError(message)
      toast.error("Error al crear cuenta", { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, submitClient, submitProvider }
}
