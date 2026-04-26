"use client"

type CategoryType =
  | "plomeria"
  | "electricidad"
  | "carpinteria"
  | "pintura"
  | "limpieza"
  | "jardineria"
  | "mecanica"
  | "aire"
  | "tecnologia"
  | "mudanzas"
  | "seguridad"
  | "refri"

interface CategoryGlyphProps {
  category: CategoryType | string
  size?: number
  color?: string
}

export function CategoryGlyph({
  category,
  size = 24,
  color = "currentColor",
}: CategoryGlyphProps) {
  const glyphs: Record<string, React.ReactNode> = {
    plomeria: (
      <path
        d="M4 4h4v4h4v4h4v4"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    ),
    electricidad: (
      <path d="M8 2l-3 10h4l-2 8 9-12h-5l3-6H8z" fill={color} />
    ),
    carpinteria: (
      <path
        d="M3 5l8 3 8-3v4l-8 3-8-3V5zM3 12l8 3 8-3v4l-8 3-8-3v-4z"
        fill={color}
        opacity="0.85"
      />
    ),
    pintura: (
      <path
        d="M4 12c0-4 4-8 8-8s8 4 8 8-4 8-8 8"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    ),
    limpieza: (
      <>
        <circle cx="7" cy="7" r="3" fill={color} />
        <circle cx="16" cy="10" r="2" fill={color} opacity="0.6" />
        <circle cx="11" cy="16" r="4" fill={color} opacity="0.4" />
      </>
    ),
    jardineria: (
      <path
        d="M12 20V10M12 10c-4 0-6-2-6-6 4 0 6 2 6 6zm0 0c4 0 6-2 6-6-4 0-6 2-6 6z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    ),
    mecanica: (
      <>
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="1.5" fill={color} />
        <path
          d="M12 3v3M12 18v3M21 12h-3M6 12H3"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
    aire: (
      <path
        d="M12 4v16M4 12h16M7 7l10 10M17 7L7 17"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    ),
    tecnologia: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="12"
          rx="2"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        <path d="M8 21h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    mudanzas: (
      <>
        <rect
          x="3"
          y="8"
          width="12"
          height="9"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        <path d="M15 11h4l2 3v3h-6" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="7" cy="19" r="2" fill={color} />
        <circle cx="17" cy="19" r="2" fill={color} />
      </>
    ),
    seguridad: (
      <path
        d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    ),
    refri: (
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="block shrink-0"
    >
      {glyphs[category] || glyphs.refri}
    </svg>
  )
}
