"use client"

import { useState, useEffect } from "react"
import { getCategories } from "@/services/categories"
import type { MainCategory } from "@/types/categories"

export function useCategories() {
  const [categories, setCategories] = useState<MainCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar categorías")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, isLoading, error }
}
