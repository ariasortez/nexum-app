"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

type BadgeTone = "neutral" | "brand" | "green" | "amber" | "red"
type BadgeSize = "sm" | "md" | "lg"

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  size?: BadgeSize
  icon?: ReactNode
  solid?: boolean
  className?: string
}

const toneStyles: Record<BadgeTone, { default: string; solid: string }> = {
  neutral: {
    default: "bg-[var(--n-100)] text-[var(--n-700)]",
    solid: "bg-[var(--n-800)] text-white",
  },
  brand: {
    default: "bg-[var(--brand-50)] text-[var(--brand-700)]",
    solid: "bg-[var(--brand-500)] text-white",
  },
  green: {
    default: "bg-[var(--green-50)] text-[var(--green-700)]",
    solid: "bg-[var(--green-600)] text-white",
  },
  amber: {
    default: "bg-[var(--amber-50)] text-[var(--amber-700)]",
    solid: "bg-[var(--amber-600)] text-white",
  },
  red: {
    default: "bg-[var(--red-50)] text-[var(--red-600)]",
    solid: "bg-[var(--red-500)] text-white",
  },
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: "h-[18px] px-1.5 text-[10.5px] gap-[3px] rounded-[5px]",
  md: "h-[22px] px-2 text-[11.5px] gap-1 rounded-[6px]",
  lg: "h-[26px] px-2.5 text-[12.5px] gap-[5px] rounded-[7px]",
}

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  icon,
  solid = false,
  className,
}: BadgeProps) {
  const colorStyle = solid ? toneStyles[tone].solid : toneStyles[tone].default

  return (
    <span
      className={cn(
        "inline-flex items-center",
        "font-semibold tracking-wide uppercase leading-none",
        colorStyle,
        sizeStyles[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  )
}

export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-[var(--brand-500)] shrink-0 shadow-[0_0_0_2px_var(--n-0)]"
      style={{ width: size, height: size }}
      title="Verificado"
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M2 6l2.5 2.5L10 3"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
