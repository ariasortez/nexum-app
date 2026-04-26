import { toast as sonnerToast } from "sonner"

export type ToastType = "success" | "error" | "info" | "warning"

export type ToastOptions = {
  description?: string
  duration?: number
}

function success(message: string, options?: ToastOptions) {
  sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
  })
}

function error(message: string, options?: ToastOptions) {
  sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
  })
}

function info(message: string, options?: ToastOptions) {
  sonnerToast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
  })
}

function warning(message: string, options?: ToastOptions) {
  sonnerToast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
  })
}

function dismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId)
}

export const toast = {
  success,
  error,
  info,
  warning,
  dismiss,
}
