"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { ApiSuccessResponse } from "@fixo/contracts/api"

type Department = {
  id: string
  name: string
  slug: string
}

type Municipality = {
  id: string
  name: string
  slug: string
  department_id: string
  lat: number
  lng: number
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await api.get<ApiSuccessResponse<Department[]>>("/locations/departments")
        setDepartments(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar departamentos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  return { departments, isLoading, error }
}

export function useMunicipalities(departmentId: string | null) {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!departmentId) {
      setMunicipalities([])
      return
    }

    async function fetchMunicipalities() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await api.get<ApiSuccessResponse<Municipality[]>>(
          `/locations/municipalities?department_id=${departmentId}`
        )
        setMunicipalities(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar municipios")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMunicipalities()
  }, [departmentId])

  return { municipalities, isLoading, error }
}
