"use client"

import { useState, useEffect, useMemo } from "react"
import { getCategories } from "@/services/categories"
import type { MainCategory, Subcategory } from "@/types/categories"

type SubcategoryWithMain = Subcategory & { main_category: { id: string; name: string } | null }

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

  const subcategories = useMemo<SubcategoryWithMain[]>(() => {
    return categories.flatMap((cat) =>
      cat.subcategories.map((sub) => ({
        ...sub,
        main_category: { id: cat.id, name: cat.name },
      }))
    )
  }, [categories])

  return { categories, subcategories, isLoading, error }
}
