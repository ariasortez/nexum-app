"use client"

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "danger" | "success" | "amber"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leading?: ReactNode
  trailing?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--brand-500)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(17,21,28,0.08)] hover:brightness-95",
  secondary: "bg-[var(--n-0)] text-[var(--n-800)] border border-[var(--n-200)] shadow-[var(--shadow-xs)] hover:brightness-[0.98]",
  ghost: "bg-transparent text-[var(--n-700)] hover:bg-[var(--n-50)]",
  dark: "bg-[var(--n-900)] text-white hover:brightness-95",
  danger: "bg-[var(--red-500)] text-white hover:brightness-95",
  success: "bg-[var(--green-600)] text-white hover:brightness-95",
  amber: "bg-[var(--amber-600)] text-white hover:brightness-95",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-[34px] px-3 text-[13px]",
  md: "h-[42px] px-4 text-[14px]",
  lg: "h-[50px] px-5 text-[15px]",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      leading,
      trailing,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "border-none rounded-[10px] font-semibold tracking-tight whitespace-nowrap",
          "transition-all duration-[120ms] ease-out",
          "nx-focusable",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {leading}
        {children}
        {trailing}
      </button>
    )
  }
)

Button.displayName = "Button"
