"use client"

import { forwardRef, type HTMLAttributes, type ReactNode, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: number | string
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, padding = 16, interactive = false, className, onClick, ...props }, ref) => {
    const paddingStyle = typeof padding === "number" ? `${padding}px` : padding
    const isClickable = interactive || !!onClick

    const classes = cn(
      "bg-[var(--n-0)] rounded-[14px]",
      "border border-[var(--n-150)]",
      "shadow-[var(--shadow-xs)]",
      "transition-all duration-[160ms]",
      isClickable && [
        "cursor-pointer",
        "hover:border-[var(--n-200)]",
        "hover:shadow-[var(--shadow-md)]",
        "active:scale-[0.98]",
      ],
      className
    )

    if (isClickable) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick as ButtonHTMLAttributes<HTMLButtonElement>["onClick"]}
          className={cn(classes, "w-full text-left")}
          style={{
            padding: paddingStyle,
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
          {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      )
    }

    return (
      <div
        ref={ref}
        className={classes}
        style={{ padding: paddingStyle }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
