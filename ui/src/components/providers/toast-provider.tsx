"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gap={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "fixo-toast",
          success: "fixo-toast-success",
          error: "fixo-toast-error",
          info: "fixo-toast-info",
          warning: "fixo-toast-warning",
        },
      }}
      expand={false}
      richColors={false}
    />
  )
}
