"use client"

type PlaceholderTone = "cool" | "warm" | "brand" | "green"

interface ImagePlaceholderProps {
  w: number | string
  h: number | string | null
  label?: string
  tone?: PlaceholderTone
  radius?: number | string
}

const toneStyles: Record<PlaceholderTone, { a: string; b: string; fg: string }> = {
  cool: { a: "#e1e5ec", b: "#cdd3dd", fg: "#6b7280" },
  warm: { a: "#ebdfcf", b: "#d8c8b4", fg: "#77634b" },
  brand: { a: "oklch(0.88 0.08 258)", b: "oklch(0.8 0.12 258)", fg: "oklch(0.3 0.14 258)" },
  green: { a: "oklch(0.9 0.07 155)", b: "oklch(0.8 0.11 155)", fg: "oklch(0.3 0.12 155)" },
}

export function ImagePlaceholder({
  w,
  h,
  label,
  tone = "cool",
  radius = 10,
}: ImagePlaceholderProps) {
  const t = toneStyles[tone]
  const width = typeof w === "number" ? `${w}px` : w
  const height = h === null ? undefined : typeof h === "number" ? `${h}px` : h
  const borderRadius = typeof radius === "number" ? `${radius}px` : radius

  return (
    <div
      className="flex items-center justify-center shrink-0 overflow-hidden"
      style={{
        width,
        height,
        borderRadius,
        background: `repeating-linear-gradient(45deg, ${t.a} 0 12px, ${t.b} 12px 24px)`,
        aspectRatio: h === null ? "1" : undefined,
      }}
    >
      {label && (
        <span
          className="nx-mono text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-white/65"
          style={{ color: t.fg }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
