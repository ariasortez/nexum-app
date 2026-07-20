"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useClientRequests } from "@/hooks/use-requests"
import { getAuthSession } from "@/lib/session"
import type { AuthUser } from "@/types/auth"
import type { ClientRequestSummary, RequestResponseItem } from "@/types/requests"

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

type DashboardData = {
  inProgressRequest: ClientRequestSummary | null
  openRequests: ClientRequestSummary[]
  recentHistory: ClientRequestSummary[]
  activeResponseCount: number
}

export default function ClientDashboard() {
  const [currentUser] = useState<AuthUser | null>(() => getAuthSession()?.user ?? null)
  const { requests, isLoading, error } = useClientRequests({ limit: 50 })
  const dashboardData = useMemo(() => buildDashboardData(requests), [requests])
  const firstName = currentUser?.full_name?.split(" ")[0] ?? "Cliente"

  return (
    <div className="w-full max-w-full overflow-x-clip px-4 py-4 pb-28 lg:p-8">
      <DashboardHeader firstName={firstName} activeResponseCount={dashboardData.activeResponseCount} />

      {isLoading ? (
        <DashboardLoadingState />
      ) : error ? (
        <DashboardErrorState message={error} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-8">
            <QuickActions />
            <InProgressSection request={dashboardData.inProgressRequest} />
            <OpenRequestsSection requests={dashboardData.openRequests} />
          </div>
          <div className="xl:col-span-1">
            <HistorySection requests={dashboardData.recentHistory} />
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardHeader({ firstName, activeResponseCount }: { firstName: string; activeResponseCount: number }) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl lg:text-5xl font-black text-[var(--primary)] font-headline leading-tight">
        Hola, {firstName}
      </h1>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-2 bg-[var(--primary-container)] px-4 py-2 border-2 border-[var(--primary)]">
          <Icon name="mail" filled size={20} className="text-[var(--primary)]" />
          <span className="text-label-md font-label text-[var(--primary)]">
            {activeResponseCount > 0
              ? `${activeResponseCount} respuesta${activeResponseCount !== 1 ? "s" : ""} nueva${activeResponseCount !== 1 ? "s" : ""}`
              : "Sin respuestas nuevas"}
          </span>
        </div>
      </div>
    </header>
  )
}

function QuickActions() {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Link
        href="/client/requests/new"
        className="bg-[var(--primary-container)] border-4 border-[var(--primary)] p-4 flex flex-col items-center justify-center gap-2 neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] transition-all min-h-[120px]"
      >
        <Icon name="add_circle" filled size={40} className="text-[var(--primary)]" />
        <span className="text-label-md font-label text-[var(--primary)] uppercase text-center font-bold">
          Nueva Solicitud
        </span>
      </Link>

      <Link
        href="/client/services"
        className="bg-[var(--surface)] border-4 border-[var(--primary)] p-4 flex flex-col items-center justify-center gap-2 neo-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all min-h-[120px]"
      >
        <Icon name="search" size={40} className="text-[var(--primary)]" />
        <span className="text-label-md font-label text-[var(--primary)] uppercase text-center font-bold">
          Explorar
        </span>
      </Link>

      <Link
        href="/client/messages"
        className="bg-[var(--surface)] border-4 border-[var(--primary)] p-4 flex flex-col items-center justify-center gap-2 neo-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all min-h-[120px]"
      >
        <Icon name="chat" size={40} className="text-[var(--primary)]" />
        <span className="text-label-md font-label text-[var(--primary)] uppercase text-center font-bold">
          Mensajes
        </span>
      </Link>

      <Link
        href="/client/requests"
        className="bg-[var(--surface)] border-4 border-[var(--primary)] p-4 flex flex-col items-center justify-center gap-2 neo-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all min-h-[120px]"
      >
        <Icon name="assignment" size={40} className="text-[var(--primary)]" />
        <span className="text-label-md font-label text-[var(--primary)] uppercase text-center font-bold">
          Mis Solicitudes
        </span>
      </Link>
    </section>
  )
}

function InProgressSection({ request }: { request: ClientRequestSummary | null }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <Icon name="construction" filled size={32} className="text-[var(--secondary)]" />
        <h2 className="text-2xl font-black text-[var(--primary)] font-headline">
          En Progreso
        </h2>
      </div>

      {request ? <ProgressCard request={request} /> : <EmptyProgressCard />}
    </section>
  )
}

function ProgressCard({ request }: { request: ClientRequestSummary }) {
  const selectedResponse = findSelectedResponse(request)
  const provider = selectedResponse?.provider
  const providerName = provider?.business_name ?? "Proveedor asignado"

  return (
    <Link
      href={`/client/requests/${request.id}`}
      className="relative block min-w-0 bg-[var(--secondary)] border-4 border-[var(--primary)] p-6 neo-shadow-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] transition-all"
    >
      {/* Status Badge */}
      <div className="absolute -top-3 left-6 bg-[var(--primary-container)] text-[var(--primary)] px-4 py-1 border-2 border-[var(--primary)] text-label-sm font-label uppercase tracking-wider font-bold">
        {getRequestStatusLabel(request.status)}
      </div>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-black text-[var(--on-secondary)] font-headline break-words">
            {request.title}
          </h3>
          <p className="text-body-md text-[var(--on-secondary)]/80 mt-1">
            {formatDate(request.created_at)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-2xl font-black text-[var(--on-secondary)] font-headline block">
            {formatPrice(selectedResponse?.estimated_price)}
          </span>
          <span className="text-label-sm font-label text-[var(--on-secondary)]/70 uppercase">
            Estimado
          </span>
        </div>
      </div>

      {/* Provider Info */}
      <div className="mt-6 flex items-center gap-4 border-t-2 border-[var(--on-secondary)]/30 pt-4">
        <div className="w-14 h-14 bg-[var(--on-secondary)] border-4 border-[var(--primary)] flex items-center justify-center">
          <span className="text-xl font-black text-[var(--secondary)] font-headline">
            {providerName.charAt(0)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-[var(--on-secondary)]">{providerName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Icon name="star" filled size={18} className="text-[var(--primary-container)]" />
            <span className="text-label-md font-label text-[var(--on-secondary)]">
              {provider?.avg_rating?.toFixed(1) ?? "Nuevo"} ({provider?.total_reviews ?? 0} reseñas)
            </span>
          </div>
        </div>

        <div className="w-12 h-12 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center">
          <Icon name="chat" size={24} className="text-[var(--primary)]" />
        </div>
      </div>
    </Link>
  )
}

function EmptyProgressCard() {
  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] border-dashed p-8 flex items-center gap-6">
      <div className="w-16 h-16 bg-[var(--surface-container)] border-4 border-[var(--primary)]/30 flex items-center justify-center">
        <Icon name="engineering" size={36} className="text-[var(--on-surface-variant)]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[var(--primary)] font-headline">
          No hay trabajos en progreso
        </h3>
        <p className="text-body-md text-[var(--on-surface-variant)] mt-1">
          Cuando aceptes una cotización, tu trabajo activo aparecerá aquí.
        </p>
      </div>
    </div>
  )
}

function OpenRequestsSection({ requests }: { requests: ClientRequestSummary[] }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Icon name="format_list_bulleted" size={32} className="text-[var(--primary)]" />
          <h2 className="text-2xl font-black text-[var(--primary)] font-headline">
            Solicitudes Abiertas
          </h2>
        </div>
        <Link
          href="/client/requests"
          className="text-label-md font-label text-[var(--secondary)] hover:text-[var(--primary)] uppercase tracking-wider font-bold hidden md:block"
        >
          Ver Todas →
        </Link>
      </div>

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.slice(0, 4).map((request) => (
            <OpenRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border-4 border-[var(--primary)] border-dashed p-8 text-center">
          <Icon name="inbox" size={48} className="text-[var(--on-surface-variant)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--primary)] font-headline">
            No tienes solicitudes abiertas
          </h3>
          <p className="text-body-md text-[var(--on-surface-variant)] mt-1 mb-4">
            Crea tu primera solicitud y recibe cotizaciones de profesionales.
          </p>
          <Link
            href="/client/requests/new"
            className="inline-flex items-center gap-2 bg-[var(--primary-container)] text-[var(--primary)] px-6 py-3 border-4 border-[var(--primary)] neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-label text-label-md uppercase font-bold"
          >
            <Icon name="add" size={20} />
            Nueva Solicitud
          </Link>
        </div>
      )}
    </section>
  )
}

function OpenRequestCard({ request }: { request: ClientRequestSummary }) {
  const responseCount = getActionableResponses(request).length

  return (
    <Link
      href={`/client/requests/${request.id}`}
      className="bg-[var(--surface)] border-4 border-[var(--primary)] p-5 neo-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="bg-[var(--primary)] text-[var(--on-primary)] px-3 py-1 text-label-sm font-label uppercase tracking-wider">
          Abierta
        </span>
        <Icon name={getRequestIcon(request)} size={28} className="text-[var(--primary)]" />
      </div>

      <h3 className="text-lg font-bold text-[var(--primary)] font-headline mb-2">
        {request.title}
      </h3>
      <p className="text-body-md text-[var(--on-surface-variant)] line-clamp-2 flex-grow">
        {request.description}
      </p>

      <div className="mt-4 pt-4 border-t-2 border-[var(--primary)]/20 flex justify-between items-center">
        <span className="text-label-sm font-label text-[var(--on-surface-variant)] uppercase">
          {formatRelativeTime(request.created_at)}
        </span>
        <div className="flex items-center gap-2 bg-[var(--primary-container)] px-3 py-1.5 border-2 border-[var(--primary)]">
          <Icon name="person" size={16} className="text-[var(--primary)]" />
          <span className="text-label-sm font-label text-[var(--primary)] font-bold">
            {responseCount} respuesta{responseCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  )
}

function HistorySection({ requests }: { requests: ClientRequestSummary[] }) {
  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] p-6 neo-shadow-md h-full">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="history" size={28} className="text-[var(--primary)]" />
        <h2 className="text-xl font-black text-[var(--primary)] font-headline">
          Historial
        </h2>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((request) => (
            <HistoryItem key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <HistoryEmptyState />
      )}
    </section>
  )
}

function HistoryItem({ request }: { request: ClientRequestSummary }) {
  const provider = findSelectedResponse(request)?.provider

  return (
    <Link
      href={`/client/requests/${request.id}`}
      className="block p-4 bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 hover:border-[var(--primary)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[var(--primary)] truncate">{request.title}</h4>
          <p className="text-label-sm font-label text-[var(--on-surface-variant)] mt-1">
            {provider?.business_name ?? "Sin proveedor"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--primary-container)] px-2 py-1">
          <Icon name="star" filled size={14} className="text-[var(--primary)]" />
          <span className="text-label-sm font-label text-[var(--primary)] font-bold">
            {provider?.avg_rating?.toFixed(1) ?? "-"}
          </span>
        </div>
      </div>
      <p className="text-label-sm font-label text-[var(--on-surface-variant)] mt-2 uppercase">
        {formatRelativeTime(request.created_at)}
      </p>
    </Link>
  )
}

function HistoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8">
      <div className="w-16 h-16 bg-[var(--surface-container)] border-4 border-[var(--primary)]/30 flex items-center justify-center mb-4">
        <Icon name="inventory_2" size={32} className="text-[var(--on-surface-variant)]" />
      </div>
      <h3 className="text-lg font-bold text-[var(--primary)] font-headline mb-2">
        Sin historial
      </h3>
      <p className="text-body-md text-[var(--on-surface-variant)]">
        Tus servicios completados aparecerán aquí.
      </p>
    </div>
  )
}

function DashboardLoadingState() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] bg-[var(--surface)] border-4 border-[var(--primary)]/30 animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-[var(--surface)] border-4 border-[var(--primary)]/30 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-52 bg-[var(--surface)] border-4 border-[var(--primary)]/30 animate-pulse" />
          <div className="h-52 bg-[var(--surface)] border-4 border-[var(--primary)]/30 animate-pulse" />
        </div>
      </div>
      <div className="h-[400px] bg-[var(--surface)] border-4 border-[var(--primary)]/30 animate-pulse" />
    </div>
  )
}

function DashboardErrorState({ message }: { message: string }) {
  return (
    <div className="bg-[var(--error-container)] border-4 border-[var(--error)] p-6 neo-shadow-md">
      <div className="flex items-start gap-4">
        <Icon name="error" size={32} className="text-[var(--error)]" />
        <div>
          <h2 className="text-xl font-bold text-[var(--error)] font-headline">
            Error al cargar el dashboard
          </h2>
          <p className="text-body-md text-[var(--on-error-container)] mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}

function buildDashboardData(requests: ClientRequestSummary[]): DashboardData {
  const openRequests = requests.filter((request) => request.status === "open")
  const recentHistory = requests.filter((request) => request.status === "completed").slice(0, 5)
  const inProgressRequest = requests.find((request) => request.status === "in_progress") ?? null
  const activeResponseCount = openRequests.reduce(
    (total, request) => total + getActionableResponses(request).length,
    0
  )

  return { inProgressRequest, openRequests, recentHistory, activeResponseCount }
}

function getActionableResponses(request: ClientRequestSummary) {
  return request.responses.filter((response) => response.status === "pending" || response.status === "accepted")
}

function findSelectedResponse(request: ClientRequestSummary): RequestResponseItem | undefined {
  return request.responses.find((response) => response.status === "accepted" || response.is_selected)
}

function getRequestIcon(request: ClientRequestSummary): string {
  const text = `${request.subcategory?.slug ?? ""} ${request.subcategory?.name ?? ""}`.toLowerCase()
  if (text.includes("elect")) return "electrical_services"
  if (text.includes("plom") || text.includes("agua")) return "plumbing"
  if (text.includes("pint")) return "format_paint"
  if (text.includes("jardin")) return "yard"
  if (text.includes("limp")) return "cleaning_services"
  if (text.includes("aire") || text.includes("clima")) return "ac_unit"
  if (text.includes("carp")) return "carpenter"
  return "handyman"
}

function getRequestStatusLabel(status: ClientRequestSummary["status"]) {
  const labels: Record<ClientRequestSummary["status"], string> = {
    open: "Abierta",
    in_progress: "En Progreso",
    completed: "Completada",
    cancelled: "Cancelada",
    expired: "Expirada",
  }
  return labels[status] ?? status
}

function formatPrice(value: number | null | undefined) {
  return value === null || value === undefined ? "Pendiente" : `L. ${value.toLocaleString("es-HN")}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-HN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString("es-HN", { day: "numeric", month: "short" })
}
