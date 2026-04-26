"use client"

import { type ReactNode } from "react"
import { Button } from "@/components/ui"

interface ConfirmModalProps {
  title: string
  body: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  body,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-[rgba(17,21,28,0.5)] flex items-end justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="nx-slide-up bg-[var(--n-0)] rounded-t-[20px] p-5 pb-10 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-[var(--n-200)] rounded-sm mx-auto mb-4" />
        <div className="text-lg font-bold mb-3">{title}</div>
        {body}
        <div className="flex gap-2 mt-5">
          <Button variant="secondary" size="lg" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
