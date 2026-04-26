"use client"

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "@/components/icons"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  leading?: ReactNode
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, leading, options, placeholder, className, required, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[13px] font-medium text-[var(--n-700)]">
            {label}
            {required && <span className="text-[var(--red-500)]"> *</span>}
          </label>
        )}
        <div
          className={cn(
            "flex items-center h-11 px-3 rounded-[10px]",
            "bg-[var(--n-0)] border transition-all duration-[120ms]",
            error
              ? "border-[var(--red-500)] focus-within:shadow-[0_0_0_3px_var(--red-50)]"
              : "border-[var(--n-200)] focus-within:border-[var(--brand-500)] focus-within:shadow-[0_0_0_3px_var(--brand-50)]"
          )}
        >
          {leading && (
            <span className="text-[var(--n-500)] mr-2 flex shrink-0">{leading}</span>
          )}
          <select
            ref={ref}
            className={cn(
              "flex-1 h-full bg-transparent border-none outline-none appearance-none",
              "text-[14px] text-[var(--n-900)]",
              "cursor-pointer",
              !props.value && "text-[var(--n-400)]",
              className
            )}
            required={required}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="text-[var(--n-400)] ml-2 shrink-0 pointer-events-none" />
        </div>
        {hint && !error && (
          <span className="text-[12px] text-[var(--n-500)]">{hint}</span>
        )}
        {error && (
          <span className="text-[12px] text-[var(--red-600)]">{error}</span>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"
