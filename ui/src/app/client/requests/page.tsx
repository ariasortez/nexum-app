"use client"

import { useState } from "react"
import Link from "next/link"
import { useRequests } from "@/hooks/use-requests"
import type { ServiceRequestSummary, RequestStatus } from "@/types/requests"
import { URGENCY_DISPLAY, STATUS_DISPLAY } from "@/types/requests"

function Icon({ name, filled = false, className = "", size }: { name: string; filled?: boolean; className?: string; size?: number }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        ...(filled && { fontVariationSettings: "'FILL' 1" }),
        ...(size && { fontSize: `${size}px` }),
      }}
    >
      {name}
    </span>
  )
}

const FILTER_TABS = [
  { id: "all", label: "Todas", icon: "list", status: undefined, count: 0 },
  { id: "open", label: "Abiertas", icon: "hourglass_empty", status: "open" as RequestStatus },
  { id: "in_progress", label: "En Progreso", icon: "construction", status: "in_progress" as RequestStatus },
  { id: "completed", label: "Completadas", icon: "check_circle", status: "completed" as RequestStatus },
  { id: "cancelled", label: "Canceladas", icon: "cancel", status: "cancelled" as RequestStatus },
]

const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string; border: string; icon: string }> = {
  open: { bg: "bg-[var(--primary-container)]", text: "text-[var(--primary)]", border: "border-[var(--primary)]", icon: "hourglass_empty" },
  in_progress: { bg: "bg-[var(--secondary)]", text: "text-white", border: "border-[var(--primary)]", icon: "construction" },
  completed: { bg: "bg-green-100", text: "text-green-800", border: "border-green-600", icon: "check_circle" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-400", icon: "cancel" },
  expired: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300", icon: "schedule" },
}

export default function RequestsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const selectedTab = FILTER_TABS.find((t) => t.id === activeFilter)

  const { requests, isLoading, error } = useRequests({
    status: selectedTab?.status,
    limit: 50,
  })

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 py-4 pb-28 lg:p-8">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4 lg:mb-8 lg:pr-16">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-4xl font-black text-[var(--primary)] font-headline leading-tight">
            Mis Solicitudes
          </h1>
          <p className="text-label-sm font-label text-[var(--on-surface-variant)] mt-2 uppercase tracking-wider">
            {requests.length} solicitud{requests.length !== 1 ? "es" : ""} encontrada{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/client/requests/new"
          className="hidden lg:inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary-container)] border-4 border-[var(--primary)] neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="add_circle" filled size={24} className="text-[var(--primary)]" />
          <span className="text-label-md font-label text-[var(--primary)] uppercase font-bold">Nueva Solicitud</span>
        </Link>
      </header>

      {/* Filter Tabs - Horizontal scroll container */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 pb-3 lg:mx-0 lg:mb-8 lg:px-0">
        <div className="flex min-w-max gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 border-2 px-3 py-2 transition-all lg:gap-2 lg:border-4 lg:px-4 lg:py-3 ${
                  isActive
                    ? "bg-[var(--primary)] border-[var(--primary)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] lg:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
                    : "bg-[var(--surface)] border-[var(--primary)]/30 hover:border-[var(--primary)]"
                }`}
              >
                <Icon
                  name={tab.icon}
                  filled={isActive}
                  size={18}
                  className={isActive ? "!text-white" : "text-[var(--primary)]"}
                />
                <span className={`text-[11px] lg:text-label-sm font-label uppercase font-bold ${isActive ? "!text-white" : "text-[var(--primary)]"}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 pb-1 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="fixo-loader mb-4"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
      <p className="text-body-md text-[var(--on-surface-variant)]">Cargando solicitudes...</p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-[var(--error-container)] border-4 border-[var(--error)] p-8 neo-shadow-md">
      <div className="flex items-start gap-4">
        <Icon name="error" size={32} className="text-[var(--error)]" />
        <div>
          <h3 className="text-xl font-bold text-[var(--error)] font-headline mb-2">
            Error al cargar
          </h3>
          <p className="text-body-md text-[var(--on-error-container)]">{message}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] border-dashed p-12 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-[var(--surface-container)] border-4 border-[var(--primary)]/30 flex items-center justify-center mb-6">
        <Icon name="inbox" size={40} className="text-[var(--on-surface-variant)]" />
      </div>
      <h3 className="text-2xl font-bold text-[var(--primary)] font-headline mb-2">
        No hay solicitudes
      </h3>
      <p className="text-body-md text-[var(--on-surface-variant)] max-w-md mb-8">
        No tienes solicitudes en esta categoría. Crea tu primera solicitud y recibe cotizaciones de profesionales verificados.
      </p>
      <Link
        href="/client/requests/new"
        className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary-container)] border-4 border-[var(--primary)] neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] transition-all"
      >
        <Icon name="add_circle" filled size={24} className="text-[var(--primary)]" />
        <span className="text-label-md font-label text-[var(--primary)] uppercase font-bold">Crear Solicitud</span>
      </Link>
    </div>
  )
}

function RequestCard({ request }: { request: ServiceRequestSummary }) {
  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.open
  const isUrgent = request.urgency === "emergency"
  const urgencyConfig = URGENCY_DISPLAY[request.urgency]
  const responseCount = request.response_count ?? 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Hace menos de 1h"
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString("es-HN", { day: "numeric", month: "short" })
  }

  return (
    <Link
      href={`/client/requests/${request.id}`}
      className="group block min-w-0 bg-[var(--surface)] border-2 border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)]"
    >
      {/* Header with status */}
      <div className="p-3 border-b border-[var(--primary)]/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} text-[10px] lg:text-label-sm font-label uppercase font-bold`}>
            <Icon name={statusStyle.icon} filled size={12} />
            {STATUS_DISPLAY[request.status]?.label || request.status}
          </span>

          {/* Urgent Badge */}
          {isUrgent && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--error)] text-white border border-[var(--error)] text-[10px] font-label uppercase font-bold">
              <Icon name="bolt" filled size={12} />
              Urgente
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base lg:text-lg font-bold text-[var(--primary)] font-headline leading-tight group-hover:text-[var(--secondary)] transition-colors line-clamp-2">
          {request.title}
        </h3>

        {/* Category */}
        <p className="text-[10px] lg:text-label-sm font-label text-[var(--on-surface-variant)] mt-1 uppercase">
          {request.subcategory?.name ?? "Sin categoría"}
        </p>
      </div>

      {/* Details */}
      <div className="p-3 space-y-1.5">
        {/* Location */}
        {request.municipality && (
          <div className="flex items-center gap-2">
            <Icon name="location_on" size={16} className="text-[var(--primary)] shrink-0" />
            <span className="text-sm text-[var(--on-surface)] truncate">
              {request.municipality.name}{request.department && `, ${request.department.name}`}
            </span>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2">
          <Icon name="schedule" size={16} className="text-[var(--primary)] shrink-0" />
          <span className="text-sm text-[var(--on-surface)]">{formatDate(request.created_at)}</span>
        </div>

        {/* Urgency (if not emergency) - hide on mobile */}
        {!isUrgent && (
          <div className="hidden lg:flex items-center gap-2">
            <Icon name={urgencyConfig.icon} size={16} className="text-[var(--primary)] shrink-0" />
            <span className="text-sm text-[var(--on-surface)]">{urgencyConfig.label}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[var(--primary)]/20 flex items-center justify-between bg-[var(--surface-container)]">
        {/* Response count */}
        <div className="flex items-center gap-1 bg-[var(--primary-container)] px-2 py-1 border border-[var(--primary)]">
          <Icon name="person" size={12} className="text-[var(--primary)]" />
          <span className="text-[10px] font-label text-[var(--primary)] font-bold">
            {responseCount}
          </span>
        </div>

        {/* Arrow - always visible */}
        <div className="flex items-center gap-1 text-[var(--primary)]">
          <span className="text-[11px] font-label uppercase font-bold">Ver</span>
          <Icon name="arrow_forward" size={14} />
        </div>
      </div>
    </Link>
  )
}
