import { useEffect, useState } from "react"
import * as providersService from "@/services/providers"
import type {
  PublicProviderData,
  Certification,
  WorkPost,
} from "@/types/providers"

// ==================== PUBLIC PROVIDER ====================

export function usePublicProvider(slug: string) {
  const [data, setData] = useState<PublicProviderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await providersService.getPublicProvider(slug)
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error al cargar el perfil")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (slug) {
      fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [slug])

  return { data, isLoading, error }
}

// ==================== MY CERTIFICATIONS ====================

export function useMyCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchCertifications() {
    try {
      setIsLoading(true)
      setError(null)
      const result = await providersService.getMyCertifications()
      setCertifications(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar certificaciones")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCertifications()
  }, [])

  return {
    certifications,
    isLoading,
    error,
    refetch: fetchCertifications,
  }
}

// ==================== MY WORK POSTS ====================

export function useMyWorkPosts() {
  const [workPosts, setWorkPosts] = useState<WorkPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchWorkPosts() {
    try {
      setIsLoading(true)
      setError(null)
      const result = await providersService.getMyWorkPosts()
      setWorkPosts(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar trabajos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkPosts()
  }, [])

  return {
    workPosts,
    isLoading,
    error,
    refetch: fetchWorkPosts,
  }
}
