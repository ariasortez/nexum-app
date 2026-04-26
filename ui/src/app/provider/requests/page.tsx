"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, Card, Badge, Input } from "@/components/ui"
import { Search, Filter, MapPin, Clock, ChevronRight, Coin } from "@/components/icons"
import { URGENCY_CONFIG, type UrgencyLevel } from "@/types"

const REQUESTS = [
  {
    id: "r1",
    title: "Reparación de fuga en baño principal",
    description: "Tengo una fuga debajo del lavamanos del baño principal. El agua gotea constantemente.",
    category: "Plomería",
    urgency: "urgente" as UrgencyLevel,
    location: "Colonia Kennedy",
    municipality: "Tegucigalpa",
    postedAt: "Hace 15 min",
    responses: 2,
    maxResponses: 5,
    creditCost: 1,
  },
  {
    id: "r2",
    title: "Instalación de calentador de agua",
    description: "Necesito instalar un calentador de agua eléctrico en el baño. Ya tengo el equipo.",
    category: "Plomería",
    urgency: "esta_semana" as UrgencyLevel,
    location: "Residencial Los Castaños",
    municipality: "Comayagüela",
    postedAt: "Hace 1 hora",
    responses: 4,
    maxResponses: 5,
    creditCost: 1,
  },
  {
    id: "r3",
    title: "Destape de tubería de cocina",
    description: "El fregadero de la cocina está tapado y el agua no drena. Necesito que lo destapen urgente.",
    category: "Plomería",
    urgency: "urgente" as UrgencyLevel,
    location: "Barrio La Granja",
    municipality: "Tegucigalpa",
    postedAt: "Hace 2 horas",
    responses: 1,
    maxResponses: 5,
    creditCost: 1,
  },
  {
    id: "r4",
    title: "Revisión de sistema de agua",
    description: "Tengo baja presión de agua en toda la casa. Necesito que revisen el sistema completo.",
    category: "Plomería",
    urgency: "este_mes" as UrgencyLevel,
    location: "Colonia Miraflores",
    municipality: "Tegucigalpa",
    postedAt: "Hace 3 horas",
    responses: 0,
    maxResponses: 5,
    creditCost: 1,
  },
]

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "urgente", label: "Urgentes" },
  { id: "nearby", label: "Cerca de mí" },
  { id: "new", label: "Nuevas" },
]

export default function ProviderRequestsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--n-0)] border-b border-[var(--n-100)]">
        <div className="px-5 py-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-[var(--n-900)] tracking-tight lg:text-2xl">
                Solicitudes
              </h1>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--amber-600)] bg-[var(--amber-50)] px-3 py-1.5 rounded-full">
                  <Coin size={14} />
                  <span className="font-semibold">12 créditos</span>
                </div>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Filter size={18} />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Buscar solicitudes..."
                  leading={<Search size={18} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="secondary" className="hidden lg:flex" leading={<Filter size={16} />}>
                Filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-3 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 overflow-x-auto nx-scroll pb-1 -mx-5 px-5 lg:mx-0 lg:px-0">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter.id
                      ? "bg-[var(--n-900)] text-white"
                      : "bg-[var(--n-100)] text-[var(--n-600)] hover:bg-[var(--n-150)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-sm text-[var(--n-500)] mb-4">
            {REQUESTS.length} solicitudes disponibles
          </div>

          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {REQUESTS.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function RequestCard({ request }: { request: typeof REQUESTS[0] }) {
  const urgency = URGENCY_CONFIG[request.urgency]
  const spotsLeft = request.maxResponses - request.responses

  return (
    <Link href={`/provider/requests/${request.id}`} className="block">
      <Card padding={16} interactive className="h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge
              tone={request.urgency === "urgente" ? "red" : request.urgency === "esta_semana" ? "amber" : "neutral"}
            >
              {urgency.label}
            </Badge>
            <span className="text-xs text-[var(--n-400)]">{request.postedAt}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--amber-600)] bg-[var(--amber-50)] px-2 py-0.5 rounded">
            <Coin size={12} />
            <span className="font-medium">{request.creditCost}</span>
          </div>
        </div>

        <h3 className="text-[15px] font-semibold text-[var(--n-900)] mb-1.5 line-clamp-1">
          {request.title}
        </h3>

        <p className="text-sm text-[var(--n-500)] mb-3 line-clamp-2">
          {request.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-[var(--n-500)] mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {request.location}, {request.municipality}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--n-100)]">
          <div className="text-xs">
            <span className={spotsLeft <= 2 ? "text-[var(--red-600)] font-medium" : "text-[var(--n-500)]"}>
              {spotsLeft} {spotsLeft === 1 ? "lugar" : "lugares"} disponibles
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-[var(--brand-600)]">
            Ver detalles
            <ChevronRight size={14} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
