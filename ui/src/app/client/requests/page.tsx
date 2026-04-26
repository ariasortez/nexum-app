"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

// Material Symbol Icon component
function Icon({ name, fill = false, className = "" }: { name: string; fill?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}

// Status types
type RequestStatus = "pendiente" | "cotizando" | "en_progreso" | "completada" | "cancelada"

// Mock request data
interface Request {
  id: string
  title: string
  category: string
  categoryIcon: string
  status: RequestStatus
  date: string
  address: string
  urgency?: "urgente" | "esta_semana" | "este_mes" | "flexible"
  quotesCount?: number
  assignedProvider?: {
    name: string
    avatar: string
    rating: number
  }
  rating?: number
  completedDate?: string
}

const MOCK_REQUESTS: Request[] = [
  {
    id: "1",
    title: "Reparación de fuga en baño principal",
    category: "Plomería",
    categoryIcon: "plumbing",
    status: "pendiente",
    date: "Hace 2 horas",
    address: "Colonia Palmira, Tegucigalpa",
    urgency: "urgente",
  },
  {
    id: "2",
    title: "Instalación de lámpara en sala",
    category: "Electricidad",
    categoryIcon: "electric_bolt",
    status: "cotizando",
    date: "Hace 1 día",
    address: "Residencial Los Castaños",
    urgency: "esta_semana",
    quotesCount: 3,
  },
  {
    id: "3",
    title: "Reparación de puerta de madera",
    category: "Carpintería",
    categoryIcon: "carpenter",
    status: "en_progreso",
    date: "Hace 3 días",
    address: "Colonia Kennedy",
    assignedProvider: {
      name: "Roberto Martínez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      rating: 4.8,
    },
  },
  {
    id: "4",
    title: "Limpieza profunda de apartamento",
    category: "Limpieza",
    categoryIcon: "cleaning_services",
    status: "completada",
    date: "Hace 1 semana",
    address: "Torre Lara, Piso 12",
    rating: 5,
    completedDate: "15 Abr 2026",
    assignedProvider: {
      name: "María García",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      rating: 4.9,
    },
  },
  {
    id: "5",
    title: "Pintura de habitación",
    category: "Pintura",
    categoryIcon: "format_paint",
    status: "cancelada",
    date: "Hace 2 semanas",
    address: "Colonia Miraflores",
  },
  {
    id: "6",
    title: "Reparación de refrigerador",
    category: "Electrodomésticos",
    categoryIcon: "kitchen",
    status: "cotizando",
    date: "Hace 5 horas",
    address: "Residencial Plaza",
    urgency: "urgente",
    quotesCount: 1,
  },
]

// Filter tabs
const FILTER_TABS = [
  { id: "todas", label: "Todas", icon: "list" },
  { id: "activas", label: "Activas", icon: "pending_actions" },
  { id: "en_progreso", label: "En Progreso", icon: "engineering" },
  { id: "completadas", label: "Completadas", icon: "task_alt" },
  { id: "canceladas", label: "Canceladas", icon: "cancel" },
]

// Status configuration
const STATUS_CONFIG: Record<RequestStatus, { label: string; bgColor: string; textColor: string; icon: string }> = {
  pendiente: {
    label: "Pendiente",
    bgColor: "bg-[var(--secondary-container)]",
    textColor: "text-[var(--on-secondary-container)]",
    icon: "schedule",
  },
  cotizando: {
    label: "Cotizando",
    bgColor: "bg-[var(--tertiary-container)]",
    textColor: "text-[var(--on-tertiary-container)]",
    icon: "request_quote",
  },
  en_progreso: {
    label: "En Progreso",
    bgColor: "bg-[var(--primary-container)]",
    textColor: "text-[var(--on-primary-container)]",
    icon: "engineering",
  },
  completada: {
    label: "Completada",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: "check_circle",
  },
  cancelada: {
    label: "Cancelada",
    bgColor: "bg-[var(--error-container)]",
    textColor: "text-[var(--on-error-container)]",
    icon: "cancel",
  },
}

export default function RequestsPage() {
  const [activeFilter, setActiveFilter] = useState("todas")

  // Filter requests based on active filter
  const filteredRequests = MOCK_REQUESTS.filter((request) => {
    if (activeFilter === "todas") return true
    if (activeFilter === "activas") return ["pendiente", "cotizando"].includes(request.status)
    if (activeFilter === "en_progreso") return request.status === "en_progreso"
    if (activeFilter === "completadas") return request.status === "completada"
    if (activeFilter === "canceladas") return request.status === "cancelada"
    return true
  })

  return (
    <div className="p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 mb-4 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-[40px] font-bold text-[var(--on-surface)] leading-[1.1] tracking-[-0.04em]">
            Mis Solicitudes
          </h1>
          <p className="font-mono text-[9px] lg:text-xs text-[var(--outline)] mt-1 uppercase tracking-wider">
            {filteredRequests.length} solicitud{filteredRequests.length !== 1 ? "es" : ""}
          </p>
        </div>
        {/* Desktop button */}
        <Link
          href="/client/requests/new"
          className="hidden lg:inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase tracking-wider border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <Icon name="add" className="text-lg" />
          Nueva Solicitud
        </Link>
      </header>

      {/* Filter Tabs */}
      <nav className="mb-4 lg:mb-6 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        <div className="flex gap-1.5 lg:gap-2 w-max lg:w-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-1.5 lg:py-2 font-mono text-[10px] lg:text-xs uppercase tracking-wider border-2 rounded-lg transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--on-surface)] shadow-[1px_1px_0px_0px_var(--on-surface)] lg:shadow-[2px_2px_0px_0px_var(--on-surface)]"
                  : "bg-transparent text-[var(--on-surface-variant)] border-[var(--outline-variant)]"
              }`}
            >
              <Icon name={tab.icon} className="text-sm lg:text-base" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 lg:py-16 text-center px-4">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[var(--surface-container)] flex items-center justify-center mb-4">
            <Icon name="inbox" className="text-3xl lg:text-4xl text-[var(--outline)]" />
          </div>
          <h3 className="text-base lg:text-lg font-semibold text-[var(--on-surface)] mb-2">
            No hay solicitudes
          </h3>
          <p className="text-xs lg:text-sm text-[var(--outline)] max-w-sm mb-6">
            No tienes solicitudes en esta categoría. ¡Crea una nueva para comenzar!
          </p>
          <Link
            href="/client/requests/new"
            className="inline-flex items-center gap-2 px-5 lg:px-6 py-2.5 lg:py-3 bg-[var(--primary-container)] text-[var(--on-primary-container)] font-mono text-[10px] lg:text-xs uppercase tracking-wider border-2 border-[var(--on-surface)] shadow-[3px_3px_0px_0px_var(--on-surface)] lg:shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Icon name="add" className="text-base lg:text-lg" />
            Nueva Solicitud
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 lg:gap-4">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

// Request Card Component
function RequestCard({ request }: { request: Request }) {
  const statusConfig = STATUS_CONFIG[request.status]

  return (
    <Link
      href={`/client/requests/${request.id}`}
      className="block bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-xl lg:rounded-tl-2xl lg:rounded-br-2xl lg:rounded-tr-sm lg:rounded-bl-sm shadow-[2px_2px_0px_0px_var(--on-surface)] lg:shadow-[4px_4px_0px_0px_var(--on-surface)] transition-all group"
    >
      {/* Card Header */}
      <div className="p-3 lg:p-4 border-b border-[var(--surface-container-high)]">
        <div className="flex items-start justify-between gap-2 lg:gap-3 mb-2 lg:mb-3">
          {/* Category Icon */}
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[var(--primary-container)] flex items-center justify-center border border-[var(--primary)] shrink-0">
            <Icon name={request.categoryIcon} className="text-[var(--on-primary-container)] text-lg lg:text-xl" />
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1 lg:gap-2 flex-wrap justify-end">
            {request.urgency === "urgente" && (
              <span className="inline-flex items-center gap-0.5 px-1.5 lg:px-2 py-0.5 lg:py-1 bg-[var(--error-container)] text-[var(--on-error-container)] font-mono text-[10px] uppercase tracking-wider border border-[var(--error)] whitespace-nowrap">
                <Icon name="bolt" className="text-xs" />
                Urgente
              </span>
            )}
            <span className={`inline-flex items-center gap-0.5 px-1.5 lg:px-2 py-0.5 lg:py-1 font-mono text-[10px] uppercase tracking-wider border border-current whitespace-nowrap ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              <Icon name={statusConfig.icon} className="text-xs" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm lg:text-base font-semibold text-[var(--on-surface)] leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
          {request.title}
        </h3>

        {/* Category */}
        <span className="font-mono text-[10px] lg:text-xs text-[var(--outline)] uppercase tracking-wider">
          {request.category}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
        {/* Address */}
        <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--on-surface-variant)]">
          <Icon name="location_on" className="text-sm lg:text-base text-[var(--outline)] shrink-0" />
          <span className="truncate">{request.address}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--on-surface-variant)]">
          <Icon name="schedule" className="text-sm lg:text-base text-[var(--outline)] shrink-0" />
          <span>{request.date}</span>
        </div>

        {/* Quotes Count (for cotizando status) */}
        {request.status === "cotizando" && request.quotesCount !== undefined && (
          <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--tertiary)]">
            <Icon name="request_quote" className="text-sm lg:text-base shrink-0" />
            <span className="font-medium">{request.quotesCount} cotización{request.quotesCount !== 1 ? "es" : ""}</span>
          </div>
        )}

        {/* Assigned Provider (for en_progreso status) */}
        {request.status === "en_progreso" && request.assignedProvider && (
          <div className="flex items-center gap-2 lg:gap-3 pt-2 border-t border-[var(--surface-container-high)]">
            <Image
              src={request.assignedProvider.avatar}
              alt={request.assignedProvider.name}
              width={32}
              height={32}
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border-2 border-[var(--on-surface)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-[var(--on-surface)] truncate">
                {request.assignedProvider.name}
              </p>
              <div className="flex items-center gap-1">
                <Icon name="star" fill className="text-[10px] lg:text-xs text-amber-500" />
                <span className="text-[10px] lg:text-xs text-[var(--outline)]">{request.assignedProvider.rating}</span>
              </div>
            </div>
          </div>
        )}

        {/* Completed Info (for completada status) */}
        {request.status === "completada" && (
          <div className="pt-2 border-t border-[var(--surface-container-high)]">
            {request.assignedProvider && (
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <Image
                  src={request.assignedProvider.avatar}
                  alt={request.assignedProvider.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border-2 border-[var(--on-surface)]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-[var(--on-surface)] truncate">
                    {request.assignedProvider.name}
                  </p>
                  <p className="text-[10px] lg:text-xs text-[var(--outline)]">{request.completedDate}</p>
                </div>
              </div>
            )}
            {request.rating && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    fill={star <= request.rating!}
                    className={`text-sm lg:text-base ${star <= request.rating! ? "text-amber-500" : "text-[var(--surface-container-high)]"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer - Action hint */}
      <div className="px-3 lg:px-4 py-2 lg:py-3 border-t border-[var(--surface-container-high)] flex items-center justify-between">
        <span className="font-mono text-[9px] lg:text-[10px] text-[var(--outline)] uppercase tracking-wider">
          Ver detalles
        </span>
        <Icon name="arrow_forward" className="text-sm lg:text-base text-[var(--outline)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  )
}
