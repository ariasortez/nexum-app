"use client"

interface NexumMarkProps {
  size?: number
  color?: string
  bg?: string | null
}

export function NexumMark({
  size = 32,
  color = "var(--brand-500)",
  bg = null,
}: NexumMarkProps) {
  const stroke = size * 0.08

  return (
    <div
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: bg || undefined,
        borderRadius: bg ? size * 0.22 : 0,
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size * 0.72}
        height={size * 0.72}
      >
        <line
          x1="7"
          y1="22"
          x2="25"
          y2="10"
          stroke={color}
          strokeWidth={stroke * 4}
          strokeLinecap="round"
        />
        <circle cx="7" cy="22" r="4" fill={color} />
        <circle cx="25" cy="10" r="4" fill={color} />
      </svg>
    </div>
  )
}

interface NexumLogoProps {
  size?: number
  color?: string
  markColor?: string
}

export function NexumLogo({
  size = 24,
  color = "var(--n-900)",
  markColor = "var(--brand-500)",
}: NexumLogoProps) {
  return (
    <div
      className="inline-flex items-center"
      style={{ gap: size * 0.35 }}
    >
      <NexumMark size={size * 1.1} color={markColor} />
      <span
        className="font-bold leading-none"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: size,
          letterSpacing: size * -0.02,
          color,
        }}
      >
        nexum
      </span>
    </div>
  )
}
