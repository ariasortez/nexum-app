"use client"

import Link from "next/link"
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react"
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

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leading?: ReactNode
  trailing?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)]",
  secondary: "bg-transparent text-[var(--on-surface)] border-[var(--on-surface)] shadow-none hover:bg-[var(--surface-container)]",
  ghost: "bg-[var(--surface-container)] text-[var(--on-surface)] border-[var(--on-surface)] shadow-[3px_3px_0px_0px_var(--on-surface)] hover:shadow-[1px_1px_0px_0px_var(--on-surface)]",
  dark: "bg-[var(--on-surface)] text-[var(--surface)] border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--outline)] hover:bg-[var(--outline)] hover:shadow-[2px_2px_0px_0px_var(--outline)]",
  danger: "bg-[var(--error-container)] text-[var(--on-error-container)] border-[var(--error)] shadow-[3px_3px_0px_0px_var(--error)] hover:shadow-[1px_1px_0px_0px_var(--error)]",
  success: "bg-[var(--green-600)] text-white border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)]",
  amber: "bg-[var(--amber-600)] text-white border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)]",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-[10px]",
  md: "min-h-11 px-5 py-3 text-xs",
  lg: "min-h-[50px] px-6 py-4 text-sm",
}

const baseButtonStyles = [
  "inline-flex items-center justify-center gap-2",
  "border-2 rounded-none",
  "font-mono uppercase tracking-wider text-center whitespace-nowrap",
  "transition-all duration-150 ease-out",
  "hover:translate-x-[2px] hover:translate-y-[2px]",
  "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
  "nx-focusable",
].join(" ")

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
          baseButtonStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          disabled && "opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0",
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

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      leading,
      trailing,
      href,
      ...props
    },
    ref
  ) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          baseButtonStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {leading}
        {children}
        {trailing}
      </Link>
    )
  }
)

ButtonLink.displayName = "ButtonLink"
