"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useAcceptQuotation, useRejectQuotation, useRequest } from "@/hooks/use-requests"
import { toast } from "@/lib/toast"
import type { RequestResponseItem, ResponseStatus } from "@/types/requests"
import { RESPONSE_STATUS_DISPLAY, URGENCY_DISPLAY, STATUS_DISPLAY } from "@/types/requests"

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

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { request, isLoading, error, refetch } = useRequest(id)
  const { accept, isLoading: isAccepting } = useAcceptQuotation()
  const { reject, isLoading: isRejecting } = useRejectQuotation()
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null)

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !request) {
    return <ErrorState message={error ?? "Solicitud no encontrada"} />
  }

  const statusConfig = STATUS_DISPLAY[request.status]
  const urgencyConfig = URGENCY_DISPLAY[request.urgency]
  const responses = request.responses ?? []
  const priceStats = calculatePriceStats(responses)
  const locationLabel = request.address
    || [request.municipality?.name, request.department?.name].filter(Boolean).join(", ")
    || "Ubicación no disponible"
  const isDecisionLoading = isAccepting || isRejecting
  const requestId = request.id

  async function handleAccept(responseId: string) {
    setActiveResponseId(responseId)
    const accepted = await accept(requestId, responseId)
    if (accepted) {
      toast.success("Cotización aceptada", {
        description: "El proveedor fue notificado y las demás cotizaciones pendientes fueron rechazadas.",
      })
      await refetch()
    } else {
      toast.error("No se pudo aceptar la cotización")
    }
    setActiveResponseId(null)
  }

  async function handleReject(responseId: string) {
    setActiveResponseId(responseId)
    const rejected = await reject(requestId, responseId)
    if (rejected) {
      toast.success("Cotización rechazada", {
        description: "El proveedor fue notificado.",
      })
      await refetch()
    } else {
      toast.error("No se pudo rechazar la cotización")
    }
    setActiveResponseId(null)
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full max-w-full overflow-x-clip border-b-4 border-[var(--primary)] bg-[var(--surface)] px-4 py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-4">
          <Link
            href="/client/requests"
            className="inline-flex items-center gap-2 px-3 py-2 text-label-sm font-label font-bold uppercase text-[var(--primary)] border-2 border-transparent hover:border-[var(--primary)] hover:bg-[var(--primary-container)] transition-all"
          >
            <Icon name="arrow_back" size={18} />
            Volver
          </Link>
        </div>
      </header>

      <main className="w-full max-w-full overflow-x-clip px-4 py-4 pb-28 lg:p-8">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Hero Card */}
            <section className="relative overflow-hidden bg-[var(--surface)] border-4 border-[var(--primary)] p-5 neo-shadow-lg lg:p-8">
              {/* Decorative elements */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--primary-container)] border-4 border-[var(--primary)] opacity-30" />
              <div className="absolute -bottom-6 right-16 w-12 h-12 bg-[var(--secondary)] opacity-20" />

              <div className="relative">
                {/* Chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <Chip icon="category" label={request.subcategory?.main_category?.name ?? request.subcategory?.name ?? "Sin categoría"} tone="primary" />
                  {request.subcategory?.name && request.subcategory.name !== request.subcategory?.main_category?.name && (
                    <Chip icon="handyman" label={request.subcategory.name} tone="neutral" />
                  )}
                  <Chip icon={urgencyConfig.icon} label={urgencyConfig.label} tone={urgencyConfig.color} />
                </div>

                {/* Title */}
                <h1 className="mb-6 break-words text-3xl font-black leading-tight text-[var(--primary)] font-headline lg:text-5xl">
                  {request.title}
                </h1>

                {/* Description & Meta */}
                <div className="grid gap-5 border-t-4 border-[var(--primary)]/20 pt-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <p className="text-body-lg text-[var(--on-surface)] leading-relaxed">
                    {request.description}
                  </p>
                  <div className="min-w-0 space-y-3">
                    <InfoLine icon="schedule" label={formatDate(request.created_at)} />
                    <InfoLine icon="location_on" label={locationLabel} />
                  </div>
                </div>
              </div>
            </section>

            {/* Mobile Summary */}
            <div className="grid grid-cols-2 gap-3 xl:hidden">
              <MetricCard label="Propuestas" value={String(responses.length)} icon="forum" />
              <MetricCard
                label="Menor precio"
                value={priceStats.count > 0 ? `L. ${priceStats.min.toLocaleString()}` : "Pendiente"}
                icon="payments"
                highlight
              />
              <MetricCard label="Estado" value={statusConfig.label} icon={statusConfig.icon} />
              <MetricCard label="Urgencia" value={urgencyConfig.label} icon={urgencyConfig.icon} />
            </div>

            {/* Photos */}
            <section className="min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
                    Evidencia
                  </span>
                  <h2 className="text-xl lg:text-2xl font-bold text-[var(--primary)] font-headline">
                    Fotos de la solicitud
                  </h2>
                </div>
                <span className="px-2 py-1 bg-[var(--surface-container)] border-2 border-[var(--primary)] text-[10px] font-label font-bold text-[var(--primary)] uppercase">
                  {(request.photos ?? []).length}/5
                </span>
              </div>

              {(request.photos ?? []).length > 0 ? (
                <div className="-mx-4 overflow-x-auto px-4 pb-3 lg:mx-0 lg:px-0">
                  <div className="flex min-w-max gap-4">
                    {(request.photos ?? []).map((photo, index) => (
                      <div
                        key={photo}
                        className="h-44 w-60 shrink-0 overflow-hidden bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] lg:h-52 lg:w-72"
                      >
                        <img
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--surface)] border-4 border-[var(--primary)] border-dashed p-6 flex items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-[var(--surface-container)] border-2 border-[var(--primary)]/30">
                    <Icon name="image_not_supported" size={32} className="text-[var(--on-surface-variant)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--primary)] font-headline">Sin fotos adjuntas</h3>
                    <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                      Esta solicitud fue publicada sin fotos.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Timeline */}
            <section className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md p-5 lg:p-6">
              <div className="mb-5">
                <span className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
                  Actividad
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-[var(--primary)] font-headline">
                  Seguimiento
                </h2>
              </div>

              <div className="space-y-4 ml-3 border-l-4 border-[var(--primary)] pl-6">
                <TimelineItem
                  active
                  time={formatRelativeTime(request.created_at)}
                  title="Solicitud publicada"
                  description="Tu solicitud ya está visible para proveedores en tu zona."
                />
                <TimelineItem
                  active={responses.length > 0}
                  time={responses.length > 0 ? `${responses.length} recibida${responses.length === 1 ? "" : "s"}` : "En curso"}
                  title={responses.length > 0 ? "Cotizaciones disponibles" : "Esperando cotizaciones"}
                  description={responses.length > 0 ? "Revisa precios y reputación antes de seleccionar." : "Los proveedores podrán responder pronto."}
                />
              </div>
            </section>

            {/* Responses */}
            <section>
              <div className="mb-4">
                <span className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
                  Cotizaciones
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-[var(--primary)] font-headline">
                  Propuestas recibidas ({responses.length})
                </h2>
              </div>

              {responses.length === 0 ? (
                <EmptyResponsesState />
              ) : (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <ResponseCard
                      key={response.id}
                      response={response}
                      requestStatus={request.status}
                      isDecisionLoading={isDecisionLoading && activeResponseId === response.id}
                      disableDecisionActions={isDecisionLoading}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md p-5">
                <div className="mb-4 pb-4 border-b-4 border-[var(--primary)]/20">
                  <span className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
                    Resumen
                  </span>
                  <h3 className="text-xl font-bold text-[var(--primary)] font-headline">
                    Estado de la solicitud
                  </h3>
                </div>

                <div className="space-y-3">
                  <StatRow label="Propuestas" value={String(responses.length)} icon="forum" />
                  <StatRow
                    label="Precio promedio"
                    value={priceStats.count > 0 ? `L. ${priceStats.average.toLocaleString()}` : "Pendiente"}
                    icon="monitoring"
                  />
                  <StatRow
                    label="Menor precio"
                    value={priceStats.count > 0 ? `L. ${priceStats.min.toLocaleString()}` : "Pendiente"}
                    icon="payments"
                    highlight
                  />
                </div>

                <div className="mt-5 pt-4 border-t-2 border-[var(--primary)]/20 flex flex-wrap gap-2">
                  <Chip icon={statusConfig.icon} label={statusConfig.label} tone={statusConfig.color} />
                  <Chip icon={urgencyConfig.icon} label={urgencyConfig.label} tone={urgencyConfig.color} />
                </div>
              </div>

              {request.status === "open" && (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-[var(--surface)] text-[var(--error)] border-4 border-[var(--error)] px-6 py-4 text-label-md font-label font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--error)] hover:bg-[var(--error)] hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--error)] transition-all"
                >
                  <Icon name="cancel" size={20} />
                  Cancelar solicitud
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="fixo-loader"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
        <span className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
          Cargando solicitud...
        </span>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 flex items-center justify-center bg-[var(--error-container)] border-4 border-[var(--error)] mx-auto mb-6">
          <Icon name="error" filled size={40} className="text-[var(--error)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary)] font-headline mb-2">Error</h2>
        <p className="text-body-md text-[var(--on-surface-variant)] mb-6">{message}</p>
        <Link
          href="/client/requests"
          className="inline-flex items-center justify-center gap-2 bg-[var(--primary)] border-4 border-[var(--primary)] px-6 py-3 text-label-md font-label font-bold uppercase tracking-wider neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="arrow_back" size={18} className="!text-white" />
          <span className="!text-white">Volver a solicitudes</span>
        </Link>
      </div>
    </div>
  )
}

function Chip({ icon, label, tone }: { icon: string; label: string; tone: string }) {
  const toneClasses: Record<string, string> = {
    primary: "bg-[var(--primary-container)] text-[var(--primary)] border-[var(--primary)]",
    secondary: "bg-[var(--secondary-container)] text-[var(--secondary)] border-[var(--secondary)]",
    warning: "bg-[var(--primary-container)] text-[var(--primary)] border-[var(--primary)]",
    error: "bg-[var(--error-container)] text-[var(--error)] border-[var(--error)]",
    neutral: "bg-[var(--surface-container)] text-[var(--on-surface)] border-[var(--primary)]/50",
    success: "bg-green-100 text-green-800 border-green-600",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-[10px] font-label font-bold uppercase tracking-wider ${toneClasses[tone] ?? toneClasses.neutral}`}>
      <Icon name={icon} size={14} />
      {label}
    </span>
  )
}

function InfoLine({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon name={icon} size={18} className="text-[var(--secondary)] mt-0.5" />
      <span className="text-sm text-[var(--on-surface-variant)]">{label}</span>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string
  value: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`p-4 border-4 border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] ${
      highlight ? "bg-[var(--primary-container)]" : "bg-[var(--surface)]"
    }`}>
      <div className={`w-10 h-10 flex items-center justify-center mb-3 border-2 ${
        highlight
          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
          : "bg-[var(--surface-container)] border-[var(--primary)] text-[var(--primary)]"
      }`}>
        <Icon name={icon} size={20} />
      </div>
      <p className="text-[10px] font-label font-bold uppercase text-[var(--on-surface-variant)] tracking-wider">{label}</p>
      <p className="text-base font-bold text-[var(--primary)] font-headline mt-1 truncate">{value}</p>
    </div>
  )
}

function TimelineItem({
  active,
  time,
  title,
  description,
}: {
  active: boolean
  time: string
  title: string
  description: string
}) {
  return (
    <div className="relative">
      <div className={`absolute -left-[33px] top-1 w-4 h-4 border-2 border-[var(--primary)] ${
        active ? "bg-[var(--primary)]" : "bg-[var(--surface)]"
      }`} />
      <div>
        <span className="text-[10px] font-label font-bold uppercase text-[var(--on-surface-variant)] tracking-wider">
          {time}
        </span>
        <p className="font-bold text-[var(--primary)] font-headline mt-1">{title}</p>
        <p className="text-sm text-[var(--on-surface-variant)] mt-1">{description}</p>
      </div>
    </div>
  )
}

function EmptyResponsesState() {
  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md overflow-hidden">
      <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-[var(--primary-container)] border-4 border-[var(--primary)] shrink-0">
          <Icon name="hourglass_empty" size={40} className="text-[var(--primary)]" />
        </div>
        <div>
          <span className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
            Sin cotizaciones todavía
          </span>
          <h3 className="text-xl lg:text-2xl font-bold text-[var(--primary)] font-headline mt-1">
            Aún no hay propuestas
          </h3>
          <p className="text-sm text-[var(--on-surface-variant)] mt-2 max-w-xl">
            Los proveedores disponibles en tu zona podrán responder pronto. Asegúrate de que tu descripción tenga suficiente contexto.
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 border-t-4 border-[var(--primary)] bg-[var(--surface-container)]">
        <TipItem icon="edit_note" label="Describe el problema" />
        <TipItem icon="photo_camera" label="Agrega fotos" />
        <TipItem icon="bolt" label="Usa urgencia realista" />
      </div>
    </div>
  )
}

function TipItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b-2 sm:border-b-0 sm:border-r-2 border-[var(--primary)]/20 last:border-0">
      <Icon name={icon} size={20} className="text-[var(--secondary)]" />
      <span className="text-[11px] font-label font-bold uppercase text-[var(--primary)] tracking-wider">
        {label}
      </span>
    </div>
  )
}

function StatRow({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string
  value: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-3 p-3 border-2 ${
      highlight
        ? "bg-[var(--primary-container)] border-[var(--primary)]"
        : "bg-[var(--surface-container)] border-[var(--primary)]/30"
    }`}>
      <div className="flex items-center gap-2">
        <Icon name={icon} size={18} className="text-[var(--primary)]" />
        <span className="text-sm text-[var(--on-surface-variant)]">{label}</span>
      </div>
      <span className="text-sm font-bold text-[var(--primary)] font-headline">{value}</span>
    </div>
  )
}

function ResponseCard({
  response,
  requestStatus,
  isDecisionLoading,
  disableDecisionActions,
  onAccept,
  onReject,
}: {
  response: RequestResponseItem
  requestStatus: string | null | undefined
  isDecisionLoading: boolean
  disableDecisionActions: boolean
  onAccept: (responseId: string) => void
  onReject: (responseId: string) => void
}) {
  const provider = response.provider
  const responseStatus = response.status ?? (response.is_selected ? "accepted" : "pending")
  const statusConfig = RESPONSE_STATUS_DISPLAY[responseStatus as ResponseStatus]
  const canDecide = responseStatus === "pending" && (requestStatus === "open" || !requestStatus)
  const canChat = responseStatus !== "rejected"

  return (
    <article className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md p-4 lg:p-5 hover:-translate-y-0.5 transition-transform">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        {/* Provider Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 flex items-center justify-center bg-[var(--primary-container)] border-4 border-[var(--primary)] text-lg font-black text-[var(--primary)] font-headline">
              {provider?.business_name?.charAt(0) ?? "P"}
            </div>
            {provider?.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center bg-[var(--primary)] border-2 border-[var(--surface)]">
                <Icon name="verified" filled size={14} className="text-white" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {provider?.slug ? (
                <Link
                  href={`/providers/${provider.slug}`}
                  target="_blank"
                  className="font-bold text-[var(--primary)] font-headline truncate hover:underline"
                >
                  {provider.business_name}
                </Link>
              ) : (
                <h3 className="font-bold text-[var(--primary)] font-headline truncate">
                  {provider?.business_name ?? "Proveedor"}
                </h3>
              )}
              <span className="text-[10px] font-label text-[var(--on-surface-variant)] uppercase">
                {formatRelativeTime(response.created_at)}
              </span>
            </div>

            {provider && (
              <div className="flex items-center gap-1 text-[11px] font-label text-[var(--on-surface-variant)] uppercase mb-2">
                <Icon name="star" filled size={14} className="text-[var(--secondary)]" />
                <span className="font-bold">{provider.avg_rating?.toFixed(1) ?? "Nuevo"}</span>
                <span className="text-[var(--on-surface-variant)]">({provider.total_reviews} reseñas)</span>
              </div>
            )}

            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
              {response.message || "El proveedor envió una cotización sin mensaje adicional."}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {statusConfig && (
                <Chip icon={statusConfig.icon} label={statusConfig.label} tone={statusConfig.color} />
              )}
              {provider?.slug && (
                <Link
                  href={`/providers/${provider.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--surface)] text-[var(--primary)] border-2 border-[var(--primary)] text-[11px] font-label font-bold uppercase hover:bg-[var(--primary-container)] transition-all"
                >
                  <Icon name="person" size={14} />
                  Ver perfil
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="border-t-4 lg:border-t-0 lg:border-l-4 border-[var(--primary)]/20 pt-4 lg:pt-0 lg:pl-5 lg:min-w-[200px]">
          <div className="mb-4">
            <span className="text-[10px] font-label font-bold uppercase text-[var(--on-surface-variant)] tracking-wider">
              Precio ofrecido
            </span>
            <p className="text-2xl lg:text-3xl font-black text-[var(--primary)] font-headline mt-1">
              {response.estimated_price ? `L. ${response.estimated_price.toLocaleString()}` : "Pendiente"}
            </p>
          </div>

          <div className="space-y-2">
            {canDecide ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={disableDecisionActions}
                    onClick={() => onReject(response.id)}
                    className="flex items-center justify-center gap-1 bg-[var(--surface)] text-[var(--error)] border-2 border-[var(--error)] px-3 py-2 text-[11px] font-label font-bold uppercase shadow-[2px_2px_0px_0px_var(--error)] hover:bg-[var(--error)] hover:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--error)] transition-all disabled:opacity-50"
                  >
                    <Icon name="close" size={14} />
                    {isDecisionLoading ? "..." : "Rechazar"}
                  </button>
                  <button
                    type="button"
                    disabled={disableDecisionActions}
                    onClick={() => onAccept(response.id)}
                    className="flex items-center justify-center gap-1 bg-[var(--primary)] border-2 border-[var(--primary)] px-3 py-2 text-[11px] font-label font-bold uppercase shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)] transition-all disabled:opacity-50"
                  >
                    <Icon name="check" size={14} className="!text-white" />
                    <span className="!text-white">{isDecisionLoading ? "..." : "Aceptar"}</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1 bg-[var(--primary-container)] text-[var(--primary)] border-2 border-[var(--primary)] px-3 py-2 text-[11px] font-label font-bold uppercase hover:bg-[var(--primary)] hover:text-white transition-all"
                >
                  <Icon name="chat_bubble" size={14} />
                  Chat
                </button>
              </>
            ) : canChat ? (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-1 bg-[var(--primary-container)] text-[var(--primary)] border-2 border-[var(--primary)] px-3 py-2 text-[11px] font-label font-bold uppercase shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)] transition-all"
              >
                <Icon name="chat_bubble" size={14} />
                Abrir chat
              </button>
            ) : null}

            {response.is_selected && responseStatus !== "accepted" && (
              <span className="flex items-center justify-center gap-1 bg-green-100 text-green-800 border-2 border-green-600 px-3 py-2 text-[11px] font-label font-bold uppercase">
                <Icon name="check" size={14} />
                Seleccionado
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
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

type PriceStats = {
  count: number
  average: number
  min: number
}

function calculatePriceStats(responses: RequestResponseItem[]): PriceStats {
  const prices = responses
    .map((r) => r.estimated_price)
    .filter((p): p is number => p !== null && p !== undefined)

  if (prices.length === 0) {
    return { count: 0, average: 0, min: 0 }
  }

  const sum = prices.reduce((a, b) => a + b, 0)
  return {
    count: prices.length,
    average: Math.round(sum / prices.length),
    min: Math.min(...prices),
  }
}
