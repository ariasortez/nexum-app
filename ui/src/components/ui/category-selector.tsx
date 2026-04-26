"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "@/components/icons"
import type { MainCategory } from "@/types/categories"

type CategorySelectorProps = {
  categories: MainCategory[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  maxSelections?: number
  isLoading?: boolean
  error?: string | null
}

export function CategorySelector({
  categories,
  selectedIds,
  onChange,
  maxSelections = 10,
  isLoading,
  error,
}: CategorySelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  function toggleCategory(categoryId: string) {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  function toggleSubcategory(subcategoryId: string) {
    if (selectedIds.includes(subcategoryId)) {
      onChange(selectedIds.filter((id) => id !== subcategoryId))
    } else if (selectedIds.length < maxSelections) {
      onChange([...selectedIds, subcategoryId])
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-[var(--n-500)]">
        Cargando categorías...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-[var(--red-600)]">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[var(--n-700)]">
        Servicios que ofreces <span className="text-[var(--red-500)]">*</span>
      </label>

      <div className="border border-[var(--n-200)] rounded-[10px] overflow-hidden">
        {categories.map((category) => (
          <div key={category.id} className="border-b border-[var(--n-150)] last:border-b-0">
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 text-left",
                "hover:bg-[var(--n-50)] transition-colors",
                expandedCategory === category.id && "bg-[var(--n-50)]"
              )}
            >
              <span className="text-sm font-medium text-[var(--n-800)]">
                {category.name}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-[var(--n-400)] transition-transform",
                  expandedCategory === category.id && "rotate-180"
                )}
              />
            </button>

            {expandedCategory === category.id && (
              <div className="px-3 pb-3 flex flex-wrap gap-2">
                {category.subcategories.map((sub) => {
                  const isSelected = selectedIds.includes(sub.id)
                  const isDisabled = !isSelected && selectedIds.length >= maxSelections

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => !isDisabled && toggleSubcategory(sub.id)}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
                        "border transition-all",
                        isSelected
                          ? "bg-[var(--brand-500)] border-[var(--brand-500)] text-white"
                          : "bg-[var(--n-0)] border-[var(--n-200)] text-[var(--n-700)] hover:border-[var(--brand-400)]",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSelected && <Check size={14} />}
                      {sub.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-[var(--n-500)]">
        <span>Selecciona al menos 1 servicio</span>
        <span>{selectedIds.length}/{maxSelections} seleccionados</span>
      </div>
    </div>
  )
}
