"use client"

import { useEffect } from "react"
import { Check, Close, Sparkle } from "@/components/icons"

type ToastTone = "success" | "error" | "info"

interface ToastProps {
  message: string
  tone?: ToastTone
  onClose: () => void
}

const toneConfig = {
  success: {
    icon: Check,
    iconBg: "var(--green-500)",
  },
  error: {
    icon: Close,
    iconBg: "var(--red-500)",
  },
  info: {
    icon: Sparkle,
    iconBg: "var(--brand-500)",
  },
}

export function Toast({ message, tone = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200)
    return () => clearTimeout(timer)
  }, [message, onClose])

  const config = toneConfig[tone]
  const IconComponent = config.icon

  return (
    <div
      className="nx-slide-up absolute bottom-24 left-1/2 -translate-x-1/2 z-50
        bg-[var(--n-900)] text-white rounded-xl py-3 px-4 pr-4
        flex items-center gap-2.5 shadow-[var(--shadow-lg)] max-w-[340px] text-sm"
    >
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white shrink-0"
        style={{ background: config.iconBg }}
      >
        <IconComponent size={13} />
      </div>
      <span className="font-medium flex-1">{message}</span>
    </div>
  )
}
