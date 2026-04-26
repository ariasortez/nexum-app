"use client"

import { VerifiedBadge } from "./badge"

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #4f6df5 0%, #2a44c9 100%)",
  "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  "linear-gradient(135deg, #059669 0%, #047857 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
  "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
  "linear-gradient(135deg, #0891b2 0%, #155e75 100%)",
]

interface AvatarProps {
  name?: string
  size?: number
  verified?: boolean
  online?: boolean
  src?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getGradient(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

export function Avatar({
  name = "?",
  size = 40,
  verified = false,
  online = false,
  src,
}: AvatarProps) {
  const initials = getInitials(name)
  const gradient = getGradient(name)

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold"
          style={{
            background: gradient,
            fontSize: size * 0.38,
            letterSpacing: 0.5,
          }}
        >
          {initials}
        </div>
      )}

      {verified && (
        <div className="absolute -right-0.5 -bottom-0.5">
          <VerifiedBadge size={size * 0.38} />
        </div>
      )}

      {online && !verified && (
        <div
          className="absolute right-0 bottom-0 rounded-full bg-[var(--green-500)] shadow-[0_0_0_2px_var(--n-0)]"
          style={{
            width: size * 0.26,
            height: size * 0.26,
          }}
        />
      )}
    </div>
  )
}
