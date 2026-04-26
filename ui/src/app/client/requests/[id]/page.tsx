"use client"

import Link from "next/link"
import { Button, Card, Badge, Avatar, StarRating } from "@/components/ui"
import { ChevronLeft, MapPin, Clock, Phone, Check } from "@/components/icons"
import { URGENCY_CONFIG } from "@/types"

const REQUEST = {
  id: "r1",
  title: "Reparación de fuga en baño principal",
  description: "Tengo una fuga debajo del lavamanos del baño principal. El agua gotea constantemente y ya se está formando humedad en el piso. Necesito que revisen las conexiones y reparen la fuga.",
  category: "Plomería",
  urgency: "urgente" as const,
  status: "open" as const,
  location: "Colonia Kennedy, Tegucigalpa",
  department: "Francisco Morazán",
  createdAt: "15 abril 2026, 10:30 AM",
  photos: [] as string[],
}

const RESPONSES = [
  {
    id: "resp1",
    provider: {
      id: "p1",
      name: "Jorge Mendoza",
      business: "Plomería Mendoza & Hijos",
      rating: 4.9,
      reviews: 127,
      verified: true,
    },
    message: "Buenos días, puedo ir hoy mismo a revisar la fuga. Tengo experiencia en reparación de lavamanos y llevo todas mis herramientas. El precio puede variar según el daño, pero normalmente una reparación de este tipo ronda los L.500-800.",
    estimatedPrice: 650,
    createdAt: "Hace 30 min",
  },
  {
    id: "resp2",
    provider: {
      id: "p2",
      name: "Roberto Flores",
      business: "Servicios de Plomería RF",
      rating: 4.7,
      reviews: 89,
      verified: true,
    },
    message: "Hola, puedo pasar hoy en la tarde después de las 3pm. Por la descripción, parece ser un problema menor que puedo solucionar rápidamente.",
    estimatedPrice: 550,
    createdAt: "Hace 1 hora",
  },
  {
    id: "resp3",
    provider: {
      id: "p3",
      name: "Mario Castellanos",
      business: "Plomería Express",
      rating: 4.5,
      reviews: 45,
      verified: true,
    },
    message: "Disponible para ir mañana temprano. Incluyo garantía de 30 días en todas las reparaciones.",
    estimatedPrice: 700,
    createdAt: "Hace 2 horas",
  },
]

const STATUS_CONFIG = {
  open: { label: "Abierta", tone: "brand" as const },
  in_progress: { label: "En progreso", tone: "amber" as const },
  completed: { label: "Completada", tone: "green" as const },
  cancelled: { label: "Cancelada", tone: "neutral" as const },
}

export default function RequestDetailPage() {
  const urgency = URGENCY_CONFIG[REQUEST.urgency]
  const status = STATUS_CONFIG[REQUEST.status]

  return (
    <div className="min-h-screen bg-[var(--n-50)]">
      <header className="sticky top-0 z-10 bg-[var(--n-0)] border-b border-[var(--n-100)] px-5 py-4 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/client"
            className="flex items-center gap-1 text-[var(--n-600)] text-sm font-medium hover:text-[var(--n-900)] transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <div className="flex-1" />
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </header>

      <main className="px-5 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card padding={20}>
              <div className="flex items-center gap-2 text-xs text-[var(--n-500)] mb-3">
                <span className="bg-[var(--brand-50)] text-[var(--brand-700)] px-2 py-0.5 rounded font-medium">
                  {REQUEST.category}
                </span>
                <span>·</span>
                <span>{REQUEST.createdAt}</span>
              </div>

              <h1 className="text-xl font-bold text-[var(--n-900)] tracking-tight mb-3 lg:text-2xl">
                {REQUEST.title}
              </h1>

              <p className="text-sm text-[var(--n-600)] leading-relaxed mb-4">
                {REQUEST.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-[var(--n-500)]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {REQUEST.location}
                </span>
                <span className={`flex items-center gap-1.5 ${
                  REQUEST.urgency === "urgente" ? "text-[var(--red-600)]" : ""
                }`}>
                  <Clock size={14} />
                  {urgency.label}
                </span>
              </div>
            </Card>

            <div>
              <h2 className="text-sm font-semibold text-[var(--n-500)] uppercase tracking-wider mb-3 px-1">
                Propuestas ({RESPONSES.length})
              </h2>

              <div className="space-y-3">
                {RESPONSES.map((response) => (
                  <ResponseCard key={response.id} response={response} />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Card padding={20}>
                <h3 className="text-sm font-semibold text-[var(--n-700)] mb-4">
                  Resumen
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--n-500)]">Propuestas</span>
                    <span className="font-medium text-[var(--n-900)]">{RESPONSES.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--n-500)]">Precio promedio</span>
                    <span className="font-medium text-[var(--n-900)]">L. 633</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--n-500)]">Menor precio</span>
                    <span className="font-medium text-[var(--green-600)]">L. 550</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ResponseCard({ response }: { response: typeof RESPONSES[0] }) {
  return (
    <Card padding={16}>
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={response.provider.name} size={44} verified={response.provider.verified} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-[var(--n-900)] truncate">
              {response.provider.business}
            </span>
          </div>
          <StarRating
            value={response.provider.rating}
            count={response.provider.reviews}
            size={12}
          />
        </div>
        <span className="text-xs text-[var(--n-400)] shrink-0">{response.createdAt}</span>
      </div>

      <p className="text-sm text-[var(--n-600)] leading-relaxed mb-4">
        {response.message}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--n-100)]">
        {response.estimatedPrice && (
          <div>
            <span className="text-xs text-[var(--n-500)]">Precio estimado</span>
            <div className="text-lg font-bold text-[var(--n-900)] nx-mono">
              L. {response.estimatedPrice.toLocaleString()}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leading={<Phone size={14} />}>
            Contactar
          </Button>
          <Button variant="primary" size="sm" leading={<Check size={14} />}>
            Seleccionar
          </Button>
        </div>
      </div>
    </Card>
  )
}
