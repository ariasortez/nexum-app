"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
        },
        classNames: {
          toast: "!bg-[var(--n-0)] !border-[var(--n-150)] !shadow-[var(--shadow-lg)]",
          title: "!text-[var(--n-900)] !font-medium",
          description: "!text-[var(--n-500)]",
          success: "!border-l-4 !border-l-[var(--green-500)]",
          error: "!border-l-4 !border-l-[var(--red-500)]",
          info: "!border-l-4 !border-l-[var(--brand-500)]",
          warning: "!border-l-4 !border-l-[var(--amber-500)]",
        },
      }}
      expand={false}
      richColors={false}
      closeButton
    />
  )
}
