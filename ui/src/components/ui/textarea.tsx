"use client"

import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, rows = 4, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[13px] font-medium text-[var(--n-700)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            "w-full p-3 rounded-[10px] resize-y min-h-20",
            "bg-[var(--n-0)] border outline-none",
            "text-[14px] text-[var(--n-900)] font-[inherit]",
            "placeholder:text-[var(--n-400)]",
            "transition-all duration-[120ms]",
            error
              ? "border-[var(--red-500)] focus:shadow-[0_0_0_3px_var(--red-50)]"
              : "border-[var(--n-200)] focus:border-[var(--brand-500)] focus:shadow-[0_0_0_3px_var(--brand-50)]",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea"
