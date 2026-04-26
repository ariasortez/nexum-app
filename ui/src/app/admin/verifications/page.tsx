"use client"

import { useState } from "react"
import { Button, Card, Badge, Avatar } from "@/components/ui"
import { Check, Close, ChevronRight, ChevronLeft } from "@/components/icons"

const VERIFICATIONS = [
  {
    id: "v1",
    name: "Pedro Martínez",
    business: "Electricidad PM",
    phone: "+504 9876-5432",
    category: "Electricidad",
    location: "Tegucigalpa, Francisco Morazán",
    submittedAt: "15 abril 2026, 10:30 AM",
    status: "pending" as const,
    documents: {
      idFront: "/placeholder-id-front.jpg",
      idBack: "/placeholder-id-back.jpg",
      selfie: "/placeholder-selfie.jpg",
    },
  },
  {
    id: "v2",
    name: "Ana López",
    business: "Limpieza Express",
    phone: "+504 8765-4321",
    category: "Limpieza",
    location: "San Pedro Sula, Cortés",
    submittedAt: "15 abril 2026, 09:15 AM",
    status: "pending" as const,
    documents: {
      idFront: "/placeholder-id-front.jpg",
      idBack: "/placeholder-id-back.jpg",
      selfie: "/placeholder-selfie.jpg",
    },
  },
  {
    id: "v3",
    name: "Roberto Sánchez",
    business: "Pintura RS",
    phone: "+504 7654-3210",
    category: "Pintura",
    location: "Tegucigalpa, Francisco Morazán",
    submittedAt: "15 abril 2026, 08:00 AM",
    status: "pending" as const,
    documents: {
      idFront: "/placeholder-id-front.jpg",
      idBack: "/placeholder-id-back.jpg",
      selfie: "/placeholder-selfie.jpg",
    },
  },
]

const STATUS_CONFIG = {
  pending: { label: "Pendiente", tone: "amber" as const },
  in_review: { label: "En revisión", tone: "brand" as const },
  approved: { label: "Aprobado", tone: "green" as const },
  rejected: { label: "Rechazado", tone: "red" as const },
}

export default function AdminVerificationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(VERIFICATIONS[0]?.id || null)
  const selected = VERIFICATIONS.find((v) => v.id === selectedId)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-80 lg:border-r lg:border-[var(--n-100)] bg-[var(--n-0)]">
        <header className="sticky top-0 bg-[var(--n-0)] border-b border-[var(--n-100)] px-4 py-4 lg:px-5">
          <h1 className="text-lg font-bold text-[var(--n-900)] tracking-tight">
            Verificaciones
          </h1>
          <p className="text-sm text-[var(--n-500)]">
            {VERIFICATIONS.filter((v) => v.status === "pending").length} pendientes
          </p>
        </header>

        <div className="divide-y divide-[var(--n-100)]">
          {VERIFICATIONS.map((verification) => {
            const status = STATUS_CONFIG[verification.status]
            const isSelected = selectedId === verification.id

            return (
              <button
                key={verification.id}
                onClick={() => setSelectedId(verification.id)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  isSelected ? "bg-[var(--brand-50)]" : "hover:bg-[var(--n-25)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={verification.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--n-900)] truncate">
                        {verification.business}
                      </span>
                      <Badge tone={status.tone} className="text-[10px] shrink-0">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-[var(--n-500)] truncate">{verification.name}</div>
                    <div className="text-xs text-[var(--n-400)] mt-0.5">{verification.submittedAt}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 bg-[var(--n-50)]">
        {selected ? (
          <VerificationDetail
            verification={selected}
            onPrevious={() => {
              const idx = VERIFICATIONS.findIndex((v) => v.id === selectedId)
              if (idx > 0) setSelectedId(VERIFICATIONS[idx - 1].id)
            }}
            onNext={() => {
              const idx = VERIFICATIONS.findIndex((v) => v.id === selectedId)
              if (idx < VERIFICATIONS.length - 1) setSelectedId(VERIFICATIONS[idx + 1].id)
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-[var(--n-500)]">Selecciona una verificación para revisar</p>
          </div>
        )}
      </div>
    </div>
  )
}

function VerificationDetail({
  verification,
  onPrevious,
  onNext,
}: {
  verification: typeof VERIFICATIONS[0]
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 bg-[var(--n-0)] border-b border-[var(--n-100)] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            className="p-1.5 rounded-lg hover:bg-[var(--n-100)] text-[var(--n-500)]"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-[var(--n-100)] text-[var(--n-500)]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" size="sm" leading={<Close size={14} />}>
            Rechazar
          </Button>
          <Button variant="success" size="sm" leading={<Check size={14} />}>
            Aprobar
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-5 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card padding={20}>
            <div className="flex items-start gap-4">
              <Avatar name={verification.name} size={56} />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[var(--n-900)]">{verification.business}</h2>
                <p className="text-sm text-[var(--n-500)]">{verification.name}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge tone="brand">{verification.category}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--n-100)] text-sm">
              <div>
                <div className="text-[var(--n-500)] text-xs uppercase tracking-wider mb-1">Teléfono</div>
                <div className="text-[var(--n-900)] font-medium">{verification.phone}</div>
              </div>
              <div>
                <div className="text-[var(--n-500)] text-xs uppercase tracking-wider mb-1">Ubicación</div>
                <div className="text-[var(--n-900)] font-medium">{verification.location}</div>
              </div>
              <div>
                <div className="text-[var(--n-500)] text-xs uppercase tracking-wider mb-1">Enviado</div>
                <div className="text-[var(--n-900)] font-medium">{verification.submittedAt}</div>
              </div>
            </div>
          </Card>

          <div>
            <h3 className="text-sm font-semibold text-[var(--n-500)] uppercase tracking-wider mb-3">
              Documentos de verificación
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "ID Frontal", key: "idFront" },
                { label: "ID Trasero", key: "idBack" },
                { label: "Selfie", key: "selfie" },
              ].map((doc) => (
                <Card key={doc.key} padding={0} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-[var(--n-100)] flex items-center justify-center">
                    <span className="text-[var(--n-400)] text-sm">Vista previa</span>
                  </div>
                  <div className="p-3 border-t border-[var(--n-100)]">
                    <span className="text-sm font-medium text-[var(--n-700)]">{doc.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card padding={20}>
            <h3 className="text-sm font-semibold text-[var(--n-700)] mb-3">
              Notas de revisión
            </h3>
            <textarea
              placeholder="Agregar notas sobre esta verificación..."
              className="w-full h-24 px-3 py-2 border border-[var(--n-200)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-50)]"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
