"use client"

import Link from "next/link"
import { useAvailableRequests } from "@/hooks/use-requests"
import type { ServiceRequestSummary, UrgencyLevel } from "@/types/requests"
import { URGENCY_DISPLAY } from "@/types/requests"

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

const URGENCY_STYLES: Record<UrgencyLevel, { bg: string; border: string; text: string }> = {
  emergency: { bg: "bg-[var(--error-container)]", border: "border-[var(--error)]", text: "text-[var(--error)]" },
  high: { bg: "bg-[var(--primary-container)]", border: "border-[var(--primary)]", text: "text-[var(--primary)]" },
  medium: { bg: "bg-[var(--primary-container)]", border: "border-[var(--primary)]", text: "text-[var(--primary)]" },
  low: { bg: "bg-[var(--surface-container)]", border: "border-[var(--on-surface-variant)]", text: "text-[var(--on-surface-variant)]" },
}

const CATEGORY_ICONS: Record<string, string> = {
  plomería: "plumbing",
  electricidad: "electrical_services",
  "aire acondicionado": "ac_unit",
  climatización: "ac_unit",
  carpintería: "carpenter",
  pintura: "format_paint",
  limpieza: "cleaning_services",
  jardinería: "yard",
  cerrajería: "lock",
  mudanzas: "local_shipping",
  default: "handyman",
}

function getCategoryIcon(categoryName: string | undefined): string {
  if (!categoryName) return CATEGORY_ICONS.default
  return CATEGORY_ICONS[categoryName.toLowerCase()] ?? CATEGORY_ICONS.default
}

export default function OpportunitiesPage() {
  const { requests, pagination, isLoading, error } = useAvailableRequests({ limit: 50 })

  return (
    <div className="p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
      <header className="mb-6 lg:mb-8">
        <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-2">
          Oportunidades
        </p>
        <h1 className="text-3xl lg:text-5xl font-black text-[var(--primary)] font-headline">
          Solicitudes Disponibles
        </h1>
        <p className="mt-2 text-body-md text-[var(--on-surface-variant)]">
          <span className="font-bold text-[var(--primary)]">{pagination?.total ?? 0}</span> solicitud{pagination?.total !== 1 ? "es" : ""} en tu área
        </p>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="fixo-loader"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
      <p className="text-label-md font-label uppercase text-[var(--on-surface-variant)] mt-4 tracking-wider">
        Cargando solicitudes...
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 bg-[var(--primary-container)] border-4 border-[var(--primary)] flex items-center justify-center mb-4">
        <Icon name="inbox" size={40} className="text-[var(--primary)]" />
      </div>
      <h3 className="text-xl font-bold font-headline text-[var(--primary)] mb-2">
        No hay solicitudes disponibles
      </h3>
      <p className="text-sm text-[var(--on-surface-variant)] max-w-sm">
        No encontramos solicitudes que coincidan con tus categorías y ubicación. Vuelve a revisar más tarde.
      </p>
    </div>
  )
}

function RequestCard({ request }: { request: ServiceRequestSummary }) {
  const urgencyLabel = URGENCY_DISPLAY[request.urgency].label
  const urgencyStyle = URGENCY_STYLES[request.urgency]
  const categoryIcon = getCategoryIcon(request.subcategory?.name)

  return (
    <article className="group flex flex-col bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2 px-2 py-1 bg-[var(--primary-container)] border-2 border-[var(--primary)]">
            <Icon name={categoryIcon} filled size={16} className="text-[var(--primary)]" />
            <span className="text-[10px] font-label font-bold uppercase tracking-wider text-[var(--primary)]">
              {request.subcategory?.name ?? "Sin categoría"}
            </span>
          </div>
          <span className={`px-2 py-1 text-[10px] font-label font-bold uppercase tracking-wider border-2 ${urgencyStyle.bg} ${urgencyStyle.border} ${urgencyStyle.text}`}>
            {urgencyLabel}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold font-headline text-[var(--on-surface)] leading-tight mb-3 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {request.title}
        </h2>

        {/* Meta info */}
        <div className="flex flex-col gap-2">
          {request.municipality && (
            <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
              <Icon name="location_on" size={16} className="text-[var(--primary)]" />
              <span>
                {request.municipality.name}
                {request.department && `, ${request.department.name}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
            <Icon name="schedule" size={16} className="text-[var(--primary)]" />
            <span>{formatDate(request.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <Link
        href={`/provider/opportunities/${request.id}`}
        className="mt-auto flex items-center justify-center gap-2 border-t-4 border-[var(--primary)] py-3 text-label-sm font-label font-bold uppercase tracking-wider text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all"
      >
        Ver Detalles
        <Icon name="arrow_forward" size={16} />
      </Link>
    </article>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "Hace menos de 1 hora"
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`
  return date.toLocaleDateString("es-HN", { day: "numeric", month: "short" })
}
