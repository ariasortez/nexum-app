"use client"

import { useState } from "react"
import Link from "next/link"
import { useProviderResponses } from "@/hooks/use-requests"
import type { ProviderQuotationSummary, ResponseStatus } from "@/types/requests"
import { RESPONSE_STATUS_DISPLAY } from "@/types/requests"

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

const RESPONSE_STATUS_STYLES: Record<ResponseStatus, { bg: string; border: string; text: string }> = {
  pending: { bg: "bg-amber-100", border: "border-amber-600", text: "text-amber-800" },
  accepted: { bg: "bg-green-100", border: "border-green-600", text: "text-green-800" },
  rejected: { bg: "bg-[var(--error-container)]", border: "border-[var(--error)]", text: "text-[var(--error)]" },
  completed: { bg: "bg-[var(--primary-container)]", border: "border-[var(--primary)]", text: "text-[var(--primary)]" },
  cancelled: { bg: "bg-[var(--surface-container)]", border: "border-[var(--on-surface-variant)]", text: "text-[var(--on-surface-variant)]" },
}

const STATUS_TABS: { value: ResponseStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "accepted", label: "Aceptadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "completed", label: "Completadas" },
  { value: "cancelled", label: "Canceladas" },
]

export default function ProviderQuotationsPage() {
  const [activeStatus, setActiveStatus] = useState<ResponseStatus | "all">("all")
  const statusParam = activeStatus === "all" ? undefined : activeStatus
  const { responses, pagination, isLoading, error } = useProviderResponses({ limit: 50, status: statusParam })

  return (
    <div className="p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
      <header className="mb-6 lg:mb-8">
        <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-2">
          Cotizaciones
        </p>
        <h1 className="text-3xl lg:text-5xl font-black text-[var(--primary)] font-headline">
          Mis Cotizaciones
        </h1>
        <p className="mt-2 text-body-md text-[var(--on-surface-variant)]">
          <span className="font-bold text-[var(--primary)]">{pagination?.total ?? 0}</span> cotizaci{pagination?.total !== 1 ? "ones" : "ón"} enviada{pagination?.total !== 1 ? "s" : ""}
        </p>
      </header>

      {/* Status Filter Tabs */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`text-[10px] font-label font-bold uppercase tracking-wider py-2 px-3 border-4 transition-all ${
                activeStatus === tab.value
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
                  : "bg-[var(--surface)] border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-container)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : responses.length === 0 ? (
        <EmptyState activeStatus={activeStatus} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses.map((response) => (
            <QuotationCard key={response.id} quotation={response} />
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="fixo-loader"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
      <p className="text-label-md font-label uppercase text-[var(--on-surface-variant)] mt-4 tracking-wider">
        Cargando cotizaciones...
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 bg-[var(--error-container)] border-4 border-[var(--error)] flex items-center justify-center mb-4">
        <Icon name="error" filled size={40} className="text-[var(--error)]" />
      </div>
      <h3 className="text-xl font-bold font-headline text-[var(--error)] mb-2">
        Error al cargar
      </h3>
      <p className="text-sm text-[var(--on-surface-variant)] max-w-sm">{message}</p>
    </div>
  )
}

function EmptyState({ activeStatus }: { activeStatus: ResponseStatus | "all" }) {
  const message = activeStatus === "all"
    ? "Aún no has enviado ninguna cotización. Explora las oportunidades disponibles para empezar."
    : `No tienes cotizaciones con estado "${RESPONSE_STATUS_DISPLAY[activeStatus as ResponseStatus].label.toLowerCase()}".`

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 bg-[var(--primary-container)] border-4 border-[var(--primary)] flex items-center justify-center mb-4">
        <Icon name="request_quote" size={40} className="text-[var(--primary)]" />
      </div>
      <h3 className="text-xl font-bold font-headline text-[var(--primary)] mb-2">
        Sin cotizaciones
      </h3>
      <p className="text-sm text-[var(--on-surface-variant)] max-w-sm mb-4">
        {message}
      </p>
      {activeStatus === "all" && (
        <Link
          href="/provider/opportunities"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="search" size={18} className="!text-white" />
          <span className="!text-white">Ver oportunidades</span>
        </Link>
      )}
    </div>
  )
}

function QuotationCard({ quotation }: { quotation: ProviderQuotationSummary }) {
  const request = quotation.request
  if (!request) return null

  const statusConfig = RESPONSE_STATUS_DISPLAY[quotation.status]
  const statusStyle = RESPONSE_STATUS_STYLES[quotation.status]
  const isUrgent = request.urgency === "emergency"

  return (
    <Link
      href={`/provider/requests/${quotation.id}`}
      className="group block min-w-0 bg-[var(--surface)] border-2 border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)]"
    >
      {/* Header with status */}
      <div className="p-3 border-b border-[var(--primary)]/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} text-[10px] lg:text-label-sm font-label uppercase font-bold`}>
            <Icon name={statusConfig.icon} filled size={12} />
            {statusConfig.label}
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
        {/* Client */}
        {request.client && (
          <div className="flex items-center gap-2">
            <Icon name="person" size={16} className="text-[var(--primary)] shrink-0" />
            <span className="text-sm text-[var(--on-surface)] truncate">{request.client.full_name}</span>
          </div>
        )}

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
          <Icon name="send" size={16} className="text-[var(--primary)] shrink-0" />
          <span className="text-sm text-[var(--on-surface)]">{formatDate(quotation.created_at)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[var(--primary)]/20 flex items-center justify-between bg-[var(--surface-container)]">
        {/* Price */}
        <div className="flex items-center gap-1 bg-[var(--primary-container)] px-2 py-1 border border-[var(--primary)]">
          <Icon name="payments" size={12} className="text-[var(--primary)]" />
          <span className="text-[10px] font-label text-[var(--primary)] font-bold">
            {formatPrice(quotation.estimated_price)}
          </span>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-1 text-[var(--primary)]">
          <span className="text-[11px] font-label uppercase font-bold">Ver</span>
          <Icon name="arrow_forward" size={14} />
        </div>
      </div>
    </Link>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "hace menos de 1 hora"
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`
  if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`
  return date.toLocaleDateString("es-HN", { day: "numeric", month: "short" })
}

function formatPrice(price: number | null): string {
  if (price === null) return "Sin precio"
  return `L. ${price.toLocaleString("es-HN")}`
}
