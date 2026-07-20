"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useProviderResponse, useCancelProviderResponse } from "@/hooks/use-requests"
import { toast } from "@/lib/toast"
import { URGENCY_DISPLAY, RESPONSE_STATUS_DISPLAY, STATUS_DISPLAY } from "@/types/requests"
import type { ResponseStatus, ProviderQuotationDetail } from "@/types/requests"

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

export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { response, isLoading, error, refetch } = useProviderResponse(id)

  if (isLoading) return <LoadingState />
  if (error || !response) return <ErrorState message={error ?? "Cotización no encontrada"} />

  const request = response.request
  if (!request) return <ErrorState message="Solicitud no encontrada" />

  const statusConfig = RESPONSE_STATUS_DISPLAY[response.status]
  const statusStyle = RESPONSE_STATUS_STYLES[response.status]
  const requestStatusConfig = STATUS_DISPLAY[request.status]
  const urgencyConfig = URGENCY_DISPLAY[request.urgency]
  const photos = request.photos ?? []
  const fullAddress = getFullAddress(request)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b-4 border-[var(--primary)] bg-[var(--surface)] px-4 py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/provider/requests"
            className="flex items-center gap-2 text-label-sm font-label font-bold uppercase tracking-wider text-[var(--primary)] hover:underline"
          >
            <Icon name="arrow_back" size={18} />
            Mis Cotizaciones
          </Link>
          <span className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-label font-bold uppercase tracking-wider border-2 ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
            <Icon name={statusConfig.icon} size={14} />
            {statusConfig.label}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-4 pb-24 lg:p-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <RequestHero
            title={request.title}
            description={request.description}
            createdAt={request.created_at}
            category={request.subcategory?.name ?? "Sin categoría"}
            mainCategory={request.subcategory?.main_category?.name ?? null}
            requestStatusConfig={requestStatusConfig}
            urgencyConfig={urgencyConfig}
          />

          <ClientSection clientName={request.client?.full_name ?? "Cliente"} address={fullAddress} />
          <PhotoGallery photos={photos} />
          <QuotationTimeline
            quotationStatus={response.status}
            quotationCreatedAt={response.created_at}
            requestCreatedAt={request.created_at}
          />
        </div>

        <QuotationSidebar response={response} onCancelled={refetch} />
      </main>
    </div>
  )
}

function RequestHero({
  title, description, createdAt, category, mainCategory, requestStatusConfig, urgencyConfig,
}: {
  title: string; description: string; createdAt: string; category: string; mainCategory: string | null
  requestStatusConfig: { label: string; icon: string; color: string }; urgencyConfig: { label: string; icon: string; color: string }
}) {
  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)]">
      <div className="border-b-4 border-[var(--primary)] bg-[var(--primary-container)] px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {mainCategory && <Chip icon="category" label={mainCategory} tone="secondary" />}
          <Chip icon="handyman" label={category} tone="neutral" />
          <Chip icon={urgencyConfig.icon} label={urgencyConfig.label} tone={urgencyConfig.color} />
          <Chip icon={requestStatusConfig.icon} label={requestStatusConfig.label} tone={requestStatusConfig.color} />
        </div>
      </div>

      <div className="p-5 lg:p-7">
        <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-3">
          {formatRelativeTime(createdAt)}
        </p>
        <h1 className="text-3xl lg:text-5xl font-black font-headline text-[var(--primary)] leading-tight">
          {title}
        </h1>
        <div className="mt-5 pt-5 border-t-2 border-[var(--primary)]/20">
          <p className="text-body-md lg:text-lg text-[var(--on-surface)] leading-relaxed">{description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
            <Icon name="schedule" size={18} className="text-[var(--primary)]" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClientSection({ clientName, address }: { clientName: string; address: string | null }) {
  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-3">Cliente</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[var(--primary)] border-4 border-[var(--primary)] text-white text-xl font-black font-headline">
            {clientName.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-lg font-bold font-headline text-[var(--primary)]">{clientName}</h3>
        </div>
        {address && (
          <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
            <Icon name="location_on" size={18} className="text-[var(--primary)]" />
            <span>{address}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function PhotoGallery({ photos }: { photos: string[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">Evidencia</p>
          <h2 className="text-2xl font-bold font-headline text-[var(--primary)]">Fotos del trabajo</h2>
        </div>
        <span className="px-2 py-1 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-[10px] font-label font-bold uppercase text-[var(--primary)]">
          {photos.length}/5
        </span>
      </div>

      {photos.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {photos.map((photo, idx) => (
            <div key={photo} className="h-44 w-60 shrink-0 bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] overflow-hidden lg:h-52 lg:w-72">
              <img src={photo} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center bg-[var(--primary-container)] border-4 border-dashed border-[var(--primary)]">
              <Icon name="image_not_supported" size={32} className="text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="font-bold font-headline text-[var(--primary)]">Sin fotos adjuntas</h3>
              <p className="mt-1 text-sm text-[var(--on-surface-variant)]">El cliente no adjuntó imágenes para esta solicitud.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function QuotationTimeline({ quotationStatus, quotationCreatedAt, requestCreatedAt }: {
  quotationStatus: ResponseStatus; quotationCreatedAt: string; requestCreatedAt: string
}) {
  const statusMessages: Record<ResponseStatus, { title: string; description: string }> = {
    pending: { title: "Esperando respuesta del cliente", description: "El cliente aún no ha tomado una decisión sobre tu cotización." },
    accepted: { title: "Cotización aceptada", description: "El cliente aceptó tu propuesta. Coordina los detalles por chat." },
    rejected: { title: "Cotización rechazada", description: "El cliente eligió otro proveedor para esta solicitud." },
    completed: { title: "Trabajo completado", description: "Este trabajo ha sido marcado como completado." },
    cancelled: { title: "Cotización cancelada", description: "Cancelaste esta cotización." },
  }
  const currentStatus = statusMessages[quotationStatus]

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <div className="mb-5">
        <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">Seguimiento</p>
        <h2 className="text-2xl font-bold font-headline text-[var(--primary)]">Estado de tu cotización</h2>
      </div>

      <div className="space-y-4 sm:ml-4 sm:border-l-4 sm:border-[var(--primary)] sm:pl-6">
        <TimelineItem active time={formatRelativeTime(requestCreatedAt)} title="Solicitud publicada" description="El cliente publicó esta solicitud de servicio." />
        <TimelineItem active time={formatRelativeTime(quotationCreatedAt)} title="Cotización enviada" description="Enviaste tu propuesta y se descontó 1 crédito." />
        <TimelineItem active={quotationStatus !== "pending"} time={quotationStatus === "pending" ? "Pendiente" : "Actualizado"} title={currentStatus.title} description={currentStatus.description} />
      </div>
    </section>
  )
}

function QuotationSidebar({ response, onCancelled }: { response: ProviderQuotationDetail; onCancelled: () => void | Promise<void> }) {
  const isPending = response.status === "pending"
  const isAccepted = response.status === "accepted"
  const isCompleted = response.status === "completed"

  return (
    <aside>
      <div className="sticky top-24 space-y-4">
        {/* Quotation Details */}
        <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
          <div className="mb-4 pb-3 border-b-2 border-[var(--primary)]/20">
            <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">Tu Cotización</p>
            <h3 className="mt-1 text-xl font-bold font-headline text-[var(--primary)]">Detalles enviados</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--primary-container)] border-2 border-[var(--primary)] p-4">
              <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-1">Precio ofrecido</p>
              <p className="text-3xl font-black font-headline text-[var(--primary)]">
                L. {(response.estimated_price ?? 0).toLocaleString("es-HN")}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">Mensaje al cliente</p>
              <p className="text-sm text-[var(--on-surface)] bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 p-3">
                {response.message ?? "Sin mensaje"}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm border-t-2 border-[var(--primary)]/20 pt-3">
              <span className="text-[var(--on-surface-variant)]">Créditos usados</span>
              <span className="font-bold text-[var(--primary)]">{response.credits_spent ?? 1}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--on-surface-variant)]">Fecha de envío</span>
              <span className="text-xs text-[var(--on-surface)]">{formatDate(response.created_at)}</span>
            </div>
          </div>
        </div>

        {isPending && <PendingActions responseId={response.id} onCancelled={onCancelled} />}
        {isAccepted && <AcceptedActions />}
        {isCompleted && <CompletedActions />}
      </div>
    </aside>
  )
}

function PendingActions({ responseId, onCancelled }: { responseId: string; onCancelled: () => void | Promise<void> }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const { cancel, isLoading } = useCancelProviderResponse()

  const handleCancel = async () => {
    const success = await cancel(responseId)
    if (success) {
      toast.success("Cotización cancelada", { description: "Tu cotización ha sido cancelada. El crédito no será reembolsado." })
      await onCancelled()
    } else {
      toast.error("Error al cancelar", { description: "No se pudo cancelar la cotización. Intenta de nuevo." })
    }
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="bg-[var(--surface)] border-4 border-[var(--error)] shadow-[4px_4px_0px_0px_rgba(211,52,0,1)] p-5">
        <div className="w-14 h-14 flex items-center justify-center bg-[var(--error-container)] border-4 border-[var(--error)] mb-4">
          <Icon name="warning" filled size={28} className="text-[var(--error)]" />
        </div>
        <h3 className="text-lg font-bold font-headline text-[var(--error)]">¿Cancelar cotización?</h3>
        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
          Esta acción no se puede deshacer. <strong>El crédito usado NO será reembolsado.</strong>
        </p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleCancel}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--error)] text-white border-4 border-[var(--error)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(211,52,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(211,52,0,1)] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />Cancelando...</>
            ) : (
              <><Icon name="close" size={18} />Sí, cancelar cotización</>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
          >
            No, mantener cotización
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] border-4 border-amber-500 shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] p-5">
      <div className="w-14 h-14 flex items-center justify-center bg-amber-100 border-4 border-amber-500 mb-4">
        <Icon name="hourglass_empty" size={28} className="text-amber-700" />
      </div>
      <h3 className="text-lg font-bold font-headline text-amber-800">Esperando respuesta</h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        El cliente está evaluando las propuestas. Te notificaremos cuando tome una decisión.
      </p>
      <div className="mt-4 space-y-2">
        <Link
          href="/provider/messages"
          className="flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="chat" size={18} className="!text-white" />
          <span className="!text-white">Abrir chat</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--surface)] border-4 border-[var(--error)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--error-container)] transition-all"
        >
          <Icon name="close" size={18} className="text-[var(--error)]" />
          <span className="text-[var(--error)]">Cancelar cotización</span>
        </button>
      </div>
    </div>
  )
}

function AcceptedActions() {
  return (
    <div className="bg-[var(--surface)] border-4 border-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] p-5">
      <div className="w-14 h-14 flex items-center justify-center bg-green-100 border-4 border-green-600 mb-4">
        <Icon name="check_circle" filled size={28} className="text-green-700" />
      </div>
      <h3 className="text-lg font-bold font-headline text-green-800">¡Cotización aceptada!</h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        El cliente eligió tu propuesta. Coordina los detalles del trabajo por chat.
      </p>
      <div className="mt-4 space-y-2">
        <Link
          href="/provider/messages"
          className="flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="chat" size={18} className="!text-white" />
          <span className="!text-white">Abrir chat con cliente</span>
        </Link>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--surface)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
        >
          <Icon name="task_alt" size={18} className="text-[var(--primary)]" />
          <span className="text-[var(--primary)]">Marcar como completado</span>
        </button>
      </div>
    </div>
  )
}

function CompletedActions() {
  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <div className="w-14 h-14 flex items-center justify-center bg-[var(--primary-container)] border-4 border-[var(--primary)] mb-4">
        <Icon name="task_alt" filled size={28} className="text-[var(--primary)]" />
      </div>
      <h3 className="text-lg font-bold font-headline text-[var(--primary)]">Trabajo completado</h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        Este trabajo ha sido marcado como completado. Puedes solicitar una reseña al cliente.
      </p>
      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="star" size={18} className="!text-white" />
          <span className="!text-white">Solicitar reseña</span>
        </button>
        <Link
          href="/provider/messages"
          className="flex items-center justify-center gap-2 py-3 bg-[var(--surface)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
        >
          <Icon name="chat" size={18} className="text-[var(--primary)]" />
          <span className="text-[var(--primary)]">Abrir chat</span>
        </Link>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="fixo-loader mx-auto"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
        <p className="text-label-md font-label uppercase text-[var(--on-surface-variant)] mt-4 tracking-wider">Cargando cotización...</p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-[var(--error-container)] border-4 border-[var(--error)] flex items-center justify-center mx-auto mb-4">
          <Icon name="error" filled size={40} className="text-[var(--error)]" />
        </div>
        <h2 className="text-xl font-bold font-headline text-[var(--error)] mb-2">Error</h2>
        <p className="text-sm text-[var(--on-surface-variant)] mb-6">{message}</p>
        <Link
          href="/provider/requests"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="arrow_back" size={18} className="!text-white" />
          <span className="!text-white">Volver</span>
        </Link>
      </div>
    </div>
  )
}

function Chip({ icon, label, tone }: { icon: string; label: string; tone: string }) {
  const tones: Record<string, string> = {
    primary: "bg-[var(--primary-container)] border-[var(--primary)] text-[var(--primary)]",
    secondary: "bg-[var(--primary-container)] border-[var(--primary)] text-[var(--primary)]",
    warning: "bg-[var(--primary-container)] border-[var(--primary)] text-[var(--primary)]",
    error: "bg-[var(--error-container)] border-[var(--error)] text-[var(--error)]",
    neutral: "bg-[var(--surface-container)] border-[var(--on-surface-variant)] text-[var(--on-surface)]",
    success: "bg-green-100 border-green-600 text-green-800",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 border-2 text-[10px] font-label font-bold uppercase tracking-wider ${tones[tone] ?? tones.neutral}`}>
      <Icon name={icon} size={14} />
      {label}
    </span>
  )
}

function TimelineItem({ active, time, title, description }: { active: boolean; time: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="flex gap-3 bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 p-3 sm:block sm:border-0 sm:bg-transparent sm:p-0">
        <div className={`mt-1 w-4 h-4 shrink-0 border-2 border-[var(--primary)] sm:absolute sm:-left-[34px] sm:top-1 sm:mt-0 ${active ? "bg-[var(--primary)]" : "bg-[var(--surface-container)]"}`} />
        <div className="min-w-0">
          <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">{time}</p>
          <p className="mt-1 font-bold text-[var(--primary)]">{title}</p>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{description}</p>
        </div>
      </div>
    </div>
  )
}

function getFullAddress(request: { address?: string | null; municipality?: { name: string } | null; department?: { name: string } | null }) {
  const parts = [request.address, request.municipality?.name, request.department?.name].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return new Date(dateStr).toLocaleDateString("es-HN", { day: "numeric", month: "short" })
}
