"use client"

import { useState } from "react"

interface StarRatingProps {
  value?: number
  count?: number
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
}

export function StarRating({
  value = 0,
  count,
  size = 14,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex gap-[1px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            onClick={() => interactive && onChange?.(i)}
            onMouseEnter={() => interactive && setHover(i)}
            onMouseLeave={() => interactive && setHover(0)}
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            <path
              d="M10 1l2.8 5.9 6.2.9-4.5 4.4 1.1 6.3L10 15.5l-5.6 3 1.1-6.3L1 7.8l6.2-.9L10 1z"
              fill={i <= display ? "var(--amber-500)" : "var(--n-200)"}
            />
          </svg>
        ))}
      </span>
      {count !== undefined && (
        <span
          className="font-medium text-[var(--n-500)]"
          style={{ fontSize: size * 0.9 }}
        >
          {value.toFixed(1)} ({count})
        </span>
      )}
    </span>
  )
}
