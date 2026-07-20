"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAvailableRequests, useProviderResponses } from "@/hooks/use-requests"
import { getMe } from "@/services/auth"
import type { ProfileMe } from "@/types/auth"
import type { ProviderQuotationSummary, ServiceRequestSummary, UrgencyLevel } from "@/types/requests"
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

type DashboardData = {
  activeJobs: ProviderQuotationSummary[]
  completedJobs: ProviderQuotationSummary[]
  currentJob: ProviderQuotationSummary | null
}

export default function ProviderDashboard() {
  const { requests: opportunities, isLoading: isLoadingOpportunities, error: opportunitiesError } = useAvailableRequests({ limit: 6 })
  const { responses, isLoading: isLoadingResponses, error: responsesError } = useProviderResponses({ limit: 50 })
  const [profile, setProfile] = useState<ProfileMe | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    getMe()
      .then((data) => { if (isMounted) setProfile(data) })
      .catch((error: unknown) => {
        if (isMounted) setProfileError(error instanceof Error ? error.message : "Error al cargar perfil")
      })
    return () => { isMounted = false }
  }, [])

  const dashboardData = useMemo(() => buildDashboardData(responses), [responses])
  const providerProfile = profile?.provider_profile
  const providerName = providerProfile?.business_name ?? profile?.full_name ?? "Proveedor"
  const firstName = providerName.split(" ")[0] ?? "Proveedor"
  const isLoading = isLoadingOpportunities || isLoadingResponses
  const error = opportunitiesError ?? responsesError ?? profileError

  return (
    <div className="flex flex-col xl:flex-row min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 flex flex-col gap-8 max-w-5xl">
        <DashboardHeader firstName={firstName} opportunityCount={opportunities.length} />
        <StatsGrid profile={profile} responses={responses} />
        {error && <DashboardError message={error} />}
        {isLoading ? <DashboardLoading /> : <OpportunitiesSection opportunities={opportunities} />}
      </div>

      {/* Sidebar */}
      <aside className="w-full xl:w-96 border-t-4 xl:border-t-0 xl:border-l-4 border-[var(--primary)] bg-[var(--surface)] p-4 lg:p-6 flex flex-col gap-8">
        <CurrentJobSection job={dashboardData.currentJob} />
        <AgendaSection jobs={dashboardData.activeJobs} />
      </aside>
    </div>
  )
}

function DashboardHeader({ firstName, opportunityCount }: { firstName: string; opportunityCount: number }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-2">
          Panel proveedor
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--primary)] font-headline leading-none">
          Hola, {firstName}
        </h1>
        <p className="mt-3 text-body-md text-[var(--on-surface-variant)]">
          Tienes <span className="font-bold text-[var(--primary)]">{formatOpportunityCount(opportunityCount)}</span> para revisar.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start px-3 py-2 bg-green-100 border-4 border-green-600 shadow-[3px_3px_0px_0px_rgba(22,163,74,1)]">
        <span className="w-2.5 h-2.5 bg-green-600" />
        <span className="text-label-sm font-label font-bold uppercase tracking-wider text-green-800">
          Disponible
        </span>
      </div>
    </header>
  )
}

function StatsGrid({ profile, responses }: { profile: ProfileMe | null; responses: ProviderQuotationSummary[] }) {
  const providerProfile = profile?.provider_profile
  const acceptedCount = responses.filter((r) => r.status === "accepted").length
  const completedCount = responses.filter((r) => r.status === "completed").length
  const rating = providerProfile?.avg_rating
  const totalReviews = providerProfile?.total_reviews ?? 0
  const responseTime = providerProfile?.response_time_avg

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <StatCard
        label="Ganancias (Mes)"
        value="--"
        detail="Próximamente"
        icon="payments"
        highlight
      />
      <StatCard
        label="Trabajos"
        value={`${acceptedCount + completedCount}`}
        detail={`${acceptedCount} activo${acceptedCount === 1 ? "" : "s"}`}
        icon="construction"
      />
      <StatCard
        label="Rating"
        value={typeof rating === "number" ? rating.toFixed(1) : "Nuevo"}
        detail={`${totalReviews} reseña${totalReviews === 1 ? "" : "s"}`}
        icon="star"
      />
      <StatCard
        label="Respuesta"
        value={formatResponseTime(responseTime)}
        detail="Promedio"
        icon="schedule"
      />
    </section>
  )
}

function StatCard({ label, value, detail, icon, highlight = false }: {
  label: string
  value: string
  detail: string
  icon: string
  highlight?: boolean
}) {
  return (
    <article className={`border-4 p-4 transition-all ${
      highlight
        ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
        : "bg-[var(--surface)] border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[10px] font-label uppercase tracking-wider ${highlight ? "text-white/80" : "text-[var(--on-surface-variant)]"}`}>
          {label}
        </p>
        <Icon name={icon} size={20} className={highlight ? "text-white/80" : "text-[var(--primary)]"} />
      </div>
      <p className={`mt-3 text-3xl font-black font-headline ${highlight ? "text-white" : "text-[var(--primary)]"}`}>
        {value}
      </p>
      <p className={`mt-1 text-[10px] font-label uppercase tracking-wider ${highlight ? "text-white/70" : "text-[var(--on-surface-variant)]"}`}>
        {detail}
      </p>
    </article>
  )
}

function DashboardError({ message }: { message: string }) {
  return (
    <div className="border-4 border-[var(--error)] bg-[var(--error-container)] p-4 shadow-[4px_4px_0px_0px_rgba(211,52,0,1)]">
      <div className="flex items-start gap-3">
        <Icon name="error" filled size={24} className="text-[var(--error)]" />
        <div>
          <p className="text-label-sm font-label uppercase tracking-wider text-[var(--error)] font-bold">
            Error al cargar datos
          </p>
          <p className="mt-1 text-sm text-[var(--on-error-container)]">{message}</p>
        </div>
      </div>
    </div>
  )
}

function DashboardLoading() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="min-h-[190px] animate-pulse border-4 border-[var(--primary)]/30 bg-[var(--surface-container)] p-4">
          <div className="h-6 w-28 bg-[var(--primary)]/20" />
          <div className="mt-8 h-5 w-4/5 bg-[var(--primary)]/20" />
          <div className="mt-3 h-4 w-2/3 bg-[var(--primary)]/20" />
        </div>
      ))}
    </section>
  )
}

function OpportunitiesSection({ opportunities }: { opportunities: ServiceRequestSummary[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
            Oportunidades
          </p>
          <h2 className="text-2xl lg:text-3xl font-black text-[var(--primary)] font-headline">
            Solicitudes disponibles
          </h2>
        </div>
        <Link
          href="/provider/opportunities"
          className="text-label-sm font-label font-bold uppercase tracking-wider text-[var(--primary)] hover:underline flex items-center gap-1"
        >
          Ver todas
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <EmptyOpportunities />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((request) => (
            <OpportunityCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </section>
  )
}

function OpportunityCard({ request }: { request: ServiceRequestSummary }) {
  const urgency = URGENCY_DISPLAY[request.urgency]
  const urgencyStyle = URGENCY_STYLES[request.urgency]
  const categoryName = request.subcategory?.name ?? "Sin categoría"

  return (
    <article className="group flex flex-col bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 px-2 py-1 bg-[var(--primary-container)] border-2 border-[var(--primary)]">
            <Icon name={getCategoryIcon(categoryName)} filled size={16} className="text-[var(--primary)]" />
            <span className="text-[10px] font-label font-bold uppercase tracking-wider text-[var(--primary)]">
              {categoryName}
            </span>
          </div>
          <span className={`px-2 py-1 text-[10px] font-label font-bold uppercase tracking-wider border-2 ${urgencyStyle.bg} ${urgencyStyle.border} ${urgencyStyle.text}`}>
            {urgency.label}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold font-headline text-[var(--on-surface)] line-clamp-2 group-hover:text-[var(--primary)]">
          {request.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--on-surface-variant)]">
          {request.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <InfoPill icon="location_on" label={formatLocation(request)} />
          <InfoPill icon="schedule" label={formatRelativeTime(request.created_at)} />
          <InfoPill icon="payments" label="Por cotizar" />
          <InfoPill icon="person" label={request.client?.full_name ?? "Cliente"} />
        </div>
      </div>

      <Link
        href={`/provider/opportunities/${request.id}`}
        className="mt-auto flex items-center justify-center gap-2 border-t-4 border-[var(--primary)] py-3 text-label-sm font-label font-bold uppercase tracking-wider text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all"
      >
        Ver detalles
        <Icon name="arrow_forward" size={16} />
      </Link>
    </article>
  )
}

function EmptyOpportunities() {
  return (
    <div className="border-4 border-[var(--primary)] bg-[var(--surface)] p-8 text-center shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]">
      <div className="mx-auto w-16 h-16 flex items-center justify-center bg-[var(--primary-container)] border-4 border-[var(--primary)]">
        <Icon name="inbox" size={32} className="text-[var(--primary)]" />
      </div>
      <h3 className="mt-4 text-xl font-bold font-headline text-[var(--primary)]">
        No hay solicitudes disponibles
      </h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)] max-w-md mx-auto">
        Cuando aparezcan solicitudes compatibles con tus categorías, se mostrarán aquí.
      </p>
    </div>
  )
}

function CurrentJobSection({ job }: { job: ProviderQuotationSummary | null }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
          Trabajo actual
        </p>
        {job && <StatusBadge status={job.status} />}
      </div>
      {job ? <CurrentJobCard job={job} /> : <EmptyCurrentJob />}
    </section>
  )
}

function CurrentJobCard({ job }: { job: ProviderQuotationSummary }) {
  const request = job.request

  return (
    <article className="bg-[var(--surface)] border-4 border-[var(--primary)] p-5 shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-[var(--primary-container)] border-4 border-[var(--primary)]">
          <Icon name={getCategoryIcon(request?.subcategory?.name)} filled size={28} className="text-[var(--primary)]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
            {request?.client?.full_name ?? "Cliente"}
          </p>
          <h3 className="mt-1 text-lg font-bold font-headline text-[var(--primary)] line-clamp-2">
            {request?.title ?? "Solicitud aceptada"}
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <InfoLine icon="location_on" label={formatJobLocation(job)} />
        <InfoLine icon="event" label="Por coordinar" />
        <InfoLine icon="payments" label={formatPrice(job.estimated_price)} />
      </div>

      <div className="mt-5 grid gap-2">
        <Link
          href="/provider/messages"
          className="flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="chat" size={18} className="!text-white" />
          <span className="!text-white">Abrir chat</span>
        </Link>
        <Link
          href={`/provider/requests/${job.id}`}
          className="flex items-center justify-center gap-2 py-3 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
        >
          <Icon name="visibility" size={18} />
          Ver cotización
        </Link>
      </div>
    </article>
  )
}

function EmptyCurrentJob() {
  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] p-5 text-center shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]">
      <div className="mx-auto w-14 h-14 flex items-center justify-center bg-[var(--primary-container)] border-4 border-[var(--primary)]">
        <Icon name="work_history" size={28} className="text-[var(--primary)]" />
      </div>
      <h3 className="mt-4 text-lg font-bold font-headline text-[var(--primary)]">
        Sin trabajo activo
      </h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        Tus cotizaciones aceptadas aparecerán aquí.
      </p>
    </div>
  )
}

function AgendaSection({ jobs }: { jobs: ProviderQuotationSummary[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
            Agenda
          </p>
          <h2 className="text-xl font-black font-headline text-[var(--primary)]">
            Próximos trabajos
          </h2>
        </div>
        <span className="px-2 py-1 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-[10px] font-label font-bold uppercase text-[var(--primary)]">
          {jobs.length}
        </span>
      </div>

      {jobs.length === 0 ? (
        <div className="border-4 border-dashed border-[var(--primary)]/40 p-4 text-sm text-[var(--on-surface-variant)]">
          No hay trabajos aceptados para coordinar.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.slice(0, 4).map((job) => (
            <AgendaItem key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  )
}

function AgendaItem({ job }: { job: ProviderQuotationSummary }) {
  return (
    <Link
      href={`/provider/requests/${job.id}`}
      className="block bg-[var(--surface)] border-4 border-[var(--primary)] p-3 hover:bg-[var(--primary-container)] transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 w-3 h-3 bg-[var(--primary)] shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-label font-bold uppercase tracking-wider text-[var(--primary)]">
            Por coordinar
          </p>
          <h3 className="mt-1 line-clamp-1 text-sm font-bold text-[var(--on-surface)]">
            {job.request?.title ?? "Trabajo aceptado"}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--on-surface-variant)]">
            {formatJobLocation(job)}
          </p>
        </div>
      </div>
    </Link>
  )
}

function InfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
      <Icon name={icon} size={14} className="text-[var(--primary)]" />
      <span className="truncate">{label}</span>
    </div>
  )
}

function InfoLine({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
      <Icon name={icon} size={16} className="text-[var(--primary)]" />
      <span>{label}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: ProviderQuotationSummary["status"] }) {
  const config: Record<ProviderQuotationSummary["status"], { label: string; bg: string; border: string; text: string }> = {
    pending: { label: "Pendiente", bg: "bg-[var(--surface-container)]", border: "border-[var(--on-surface-variant)]", text: "text-[var(--on-surface-variant)]" },
    accepted: { label: "Aceptada", bg: "bg-green-100", border: "border-green-600", text: "text-green-800" },
    rejected: { label: "Rechazada", bg: "bg-[var(--error-container)]", border: "border-[var(--error)]", text: "text-[var(--error)]" },
    completed: { label: "Completada", bg: "bg-[var(--primary-container)]", border: "border-[var(--primary)]", text: "text-[var(--primary)]" },
    cancelled: { label: "Cancelada", bg: "bg-[var(--surface-container)]", border: "border-[var(--on-surface-variant)]", text: "text-[var(--on-surface-variant)]" },
  }
  const c = config[status]

  return (
    <span className={`px-2 py-1 text-[10px] font-label font-bold uppercase tracking-wider border-2 ${c.bg} ${c.border} ${c.text}`}>
      {c.label}
    </span>
  )
}

function buildDashboardData(responses: ProviderQuotationSummary[]): DashboardData {
  const activeJobs = responses.filter((r) => r.status === "accepted" && r.request)
  const completedJobs = responses.filter((r) => r.status === "completed")
  return { activeJobs, completedJobs, currentJob: activeJobs[0] ?? null }
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

function formatLocation(request: ServiceRequestSummary): string {
  if (request.municipality?.name && request.department?.name) {
    return `${request.municipality.name}, ${request.department.name}`
  }
  return request.municipality?.name ?? request.department?.name ?? "Ubicación pendiente"
}

function formatJobLocation(job: ProviderQuotationSummary): string {
  const request = job.request
  if (request?.municipality?.name && request.department?.name) {
    return `${request.municipality.name}, ${request.department.name}`
  }
  return request?.municipality?.name ?? request?.department?.name ?? "Ubicación pendiente"
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return "Ahora"
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays < 7) return `Hace ${diffDays} d`
  return date.toLocaleDateString("es-HN", { day: "numeric", month: "short" })
}

function formatPrice(price: number | null): string {
  if (typeof price !== "number") return "Precio pendiente"
  return `L. ${price.toLocaleString("es-HN")}`
}

function formatResponseTime(minutes: number | null | undefined): string {
  if (typeof minutes !== "number") return "--"
  if (minutes < 60) return `${Math.round(minutes)} min`
  return `${Math.round(minutes / 60)} h`
}

function formatOpportunityCount(count: number): string {
  return count === 1 ? "1 oportunidad disponible" : `${count} oportunidades disponibles`
}
