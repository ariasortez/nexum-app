"use client"

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leading, trailing, className, required, ...props }, ref) => {
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
          <input
            ref={ref}
            className={cn(
              "flex-1 h-full bg-transparent border-none outline-none",
              "text-[14px] text-[var(--n-900)]",
              "placeholder:text-[var(--n-400)]",
              className
            )}
            {...props}
          />
          {trailing && (
            <span className="text-[var(--n-500)] ml-2 flex shrink-0">{trailing}</span>
          )}
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

Input.displayName = "Input"
