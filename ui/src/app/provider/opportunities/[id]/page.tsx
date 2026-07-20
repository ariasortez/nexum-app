"use client"

import { use, useState, type FormEvent } from "react"
import Link from "next/link"
import { useAvailableRequest } from "@/hooks/use-requests"
import { toast } from "@/lib/toast"
import * as requestsService from "@/services/requests"
import { STATUS_DISPLAY, URGENCY_DISPLAY, type ProviderOpportunityDetail } from "@/types/requests"

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

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { request, isLoading, error, refetch } = useAvailableRequest(id)

  if (isLoading) return <LoadingState />
  if (error || !request) return <ErrorState message={error ?? "Solicitud no encontrada"} />

  const statusConfig = STATUS_DISPLAY[request.status]
  const urgencyConfig = URGENCY_DISPLAY[request.urgency]
  const photos = request.photos ?? []
  const fullAddress = getFullAddress(request)
  const isOpen = request.status === "open"
  const hasReachedLimit = request.response_count >= request.response_limit

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b-4 border-[var(--primary)] bg-[var(--surface)] px-4 py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/provider/opportunities"
            className="flex items-center gap-2 text-label-sm font-label font-bold uppercase tracking-wider text-[var(--primary)] hover:underline"
          >
            <Icon name="arrow_back" size={18} />
            Oportunidades
          </Link>
          <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-[10px] font-label font-bold uppercase tracking-wider text-[var(--primary)]">
            <Icon name="toll" size={14} />
            1 crédito por cotización
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-4 pb-24 lg:p-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <OpportunityHero
            title={request.title}
            description={request.description}
            createdAt={request.created_at}
            category={request.subcategory?.name ?? "Sin categoría"}
            mainCategory={request.subcategory?.main_category?.name ?? null}
            statusConfig={statusConfig}
            urgencyConfig={urgencyConfig}
          />

          <MobileSummary
            responseCount={request.response_count}
            responseLimit={request.response_limit}
            creditsBalance={request.credits_balance}
            canRespond={request.can_respond && isOpen}
            hasReachedLimit={hasReachedLimit}
          />

          <ClientSection clientName={request.client?.full_name ?? "Cliente"} address={fullAddress} />
          <PhotoGallery photos={photos} />
          <ActivityTimeline
            createdAt={request.created_at}
            responseCount={request.response_count}
            responseLimit={request.response_limit}
            hasResponded={request.has_responded}
          />
        </div>

        <OpportunitySidebar
          request={request}
          isOpen={isOpen}
          hasReachedLimit={hasReachedLimit}
          onSubmitted={refetch}
        />
      </main>
    </div>
  )
}

function OpportunityHero({
  title,
  description,
  createdAt,
  category,
  mainCategory,
  statusConfig,
  urgencyConfig,
}: {
  title: string
  description: string
  createdAt: string
  category: string
  mainCategory: string | null
  statusConfig: { label: string; icon: string; color: string }
  urgencyConfig: { label: string; icon: string; color: string }
}) {
  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)]">
      <div className="border-b-4 border-[var(--primary)] bg-[var(--primary-container)] px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {mainCategory && <Chip icon="category" label={mainCategory} tone="secondary" />}
          <Chip icon="handyman" label={category} tone="neutral" />
          <Chip icon={urgencyConfig.icon} label={urgencyConfig.label} tone={urgencyConfig.color} />
          <Chip icon={statusConfig.icon} label={statusConfig.label} tone={statusConfig.color} />
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
          <p className="text-body-md lg:text-lg text-[var(--on-surface)] leading-relaxed">
            {description}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
            <Icon name="schedule" size={18} className="text-[var(--primary)]" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function MobileSummary({
  responseCount,
  responseLimit,
  creditsBalance,
  canRespond,
  hasReachedLimit,
}: {
  responseCount: number
  responseLimit: number
  creditsBalance: number
  canRespond: boolean
  hasReachedLimit: boolean
}) {
  return (
    <section className="grid grid-cols-2 gap-3 xl:hidden">
      <MetricCard label="Propuestas" value={`${responseCount}/${responseLimit}`} icon="forum" />
      <MetricCard label="Tus créditos" value={String(creditsBalance)} icon="toll" highlight />
      <MetricCard label="Costo" value="1 crédito" icon="request_quote" />
      <MetricCard
        label="Estado"
        value={hasReachedLimit ? "Cupo lleno" : canRespond ? "Puedes cotizar" : "Bloqueada"}
        icon={hasReachedLimit ? "group" : canRespond ? "send" : "block"}
      />
    </section>
  )
}

function ClientSection({ clientName, address }: { clientName: string; address: string | null }) {
  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-3">
        Cliente
      </p>
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
          <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
            Evidencia
          </p>
          <h2 className="text-2xl font-bold font-headline text-[var(--primary)]">
            Fotos del trabajo
          </h2>
        </div>
        <span className="px-2 py-1 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-[10px] font-label font-bold uppercase text-[var(--primary)]">
          {photos.length}/5
        </span>
      </div>

      {photos.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="h-44 w-60 shrink-0 bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] overflow-hidden lg:h-52 lg:w-72"
            >
              <img src={photo} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
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
              <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                El cliente no adjuntó imágenes para esta solicitud.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ActivityTimeline({
  createdAt,
  responseCount,
  responseLimit,
  hasResponded,
}: {
  createdAt: string
  responseCount: number
  responseLimit: number
  hasResponded: boolean
}) {
  const remaining = Math.max(responseLimit - responseCount, 0)

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <div className="mb-5">
        <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
          Seguimiento
        </p>
        <h2 className="text-2xl font-bold font-headline text-[var(--primary)]">
          Estado de la oportunidad
        </h2>
      </div>

      <div className="space-y-4 sm:ml-4 sm:border-l-4 sm:border-[var(--primary)] sm:pl-6">
        <TimelineItem
          active
          time={formatRelativeTime(createdAt)}
          title="Solicitud publicada"
          description="Esta solicitud coincide con tu municipio, departamento y categoría configurada."
        />
        <TimelineItem
          active={remaining > 0}
          time={remaining > 0 ? `${remaining} cupo${remaining === 1 ? "" : "s"}` : "Cupo lleno"}
          title="Límite de cotizaciones"
          description={`La solicitud tiene ${responseCount} de ${responseLimit} propuestas permitidas.`}
        />
        <TimelineItem
          active={hasResponded}
          time={hasResponded ? "Completado" : "Pendiente"}
          title={hasResponded ? "Cotización enviada" : "Tu cotización"}
          description={hasResponded ? "Ya invertiste 1 crédito en esta solicitud." : "Envía una propuesta clara para abrir el chat con el cliente."}
        />
      </div>
    </section>
  )
}

function OpportunitySidebar({
  request,
  isOpen,
  hasReachedLimit,
  onSubmitted,
}: {
  request: ProviderOpportunityDetail
  isOpen: boolean
  hasReachedLimit: boolean
  onSubmitted: () => void | Promise<void>
}) {
  return (
    <aside>
      <div className="sticky top-24 space-y-4">
        <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
          <div className="mb-4 pb-3 border-b-2 border-[var(--primary)]/20">
            <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
              Resumen
            </p>
            <h3 className="mt-1 text-xl font-bold font-headline text-[var(--primary)]">
              Antes de cotizar
            </h3>
          </div>

          <div className="space-y-3">
            <StatRow label="Propuestas" value={`${request.response_count}/${request.response_limit}`} icon="forum" />
            <StatRow label="Costo" value="1 crédito" icon="toll" highlight />
            <StatRow label="Tus créditos" value={String(request.credits_balance)} icon="account_balance_wallet" />
            <StatRow
              label="Disponibilidad"
              value={hasReachedLimit ? "Cupo lleno" : isOpen ? "Abierta" : "Cerrada"}
              icon={hasReachedLimit ? "group" : isOpen ? "schedule" : "block"}
            />
          </div>
        </div>

        {request.has_responded ? (
          <AccessGrantedCard />
        ) : !isOpen ? (
          <ClosedOpportunityCard status={request.status} />
        ) : !request.can_respond ? (
          <CannotRespondCard request={request} />
        ) : (
          <QuoteForm requestId={request.id} onSubmitted={onSubmitted} />
        )}
      </div>
    </aside>
  )
}

function AccessGrantedCard() {
  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <div className="w-14 h-14 flex items-center justify-center bg-[var(--primary-container)] border-4 border-[var(--primary)] mb-4">
        <Icon name="check_circle" filled size={28} className="text-[var(--primary)]" />
      </div>
      <h3 className="text-lg font-bold font-headline text-[var(--primary)]">Cotización enviada</h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        Ya se descontó 1 crédito. La comunicación con el cliente debe continuar por chat.
      </p>
      <Link
        href="/provider/messages"
        className="mt-4 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
      >
        <Icon name="chat" size={18} className="!text-white" />
        <span className="!text-white">Abrir chat</span>
      </Link>
    </div>
  )
}

function CannotRespondCard({ request }: { request: ProviderOpportunityDetail }) {
  const reason = request.cannot_respond_reason

  if (reason === "insufficient_credits") {
    return (
      <div className="bg-[var(--surface)] border-4 border-[var(--error)] shadow-[4px_4px_0px_0px_rgba(211,52,0,1)] p-5">
        <div className="w-14 h-14 flex items-center justify-center bg-[var(--error-container)] border-4 border-[var(--error)] mb-4">
          <Icon name="toll" size={28} className="text-[var(--error)]" />
        </div>
        <h3 className="text-lg font-bold font-headline text-[var(--error)]">Necesitas créditos</h3>
        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
          Tu saldo actual es {request.credits_balance} crédito{request.credits_balance === 1 ? "" : "s"}. Recarga para responder.
        </p>
        <div className="mt-4 space-y-2">
          <Link
            href="/provider/credits"
            className="flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
          >
            <Icon name="add_card" size={18} className="!text-white" />
            <span className="!text-white">Comprar créditos</span>
          </Link>
          <Link
            href="/provider/opportunities"
            className="flex items-center justify-center gap-2 py-3 bg-[var(--surface)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
          >
            <Icon name="arrow_back" size={18} className="text-[var(--primary)]" />
            <span className="text-[var(--primary)]">Ver oportunidades</span>
          </Link>
        </div>
      </div>
    )
  }

  if (reason === "max_responses_reached") {
    return (
      <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold font-headline text-[var(--primary)]">
          <Icon name="group" size={24} />
          Cupo lleno
        </h3>
        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
          Esta solicitud ya recibió {request.response_count} de {request.response_limit} propuestas.
        </p>
        <Link
          href="/provider/opportunities"
          className="mt-4 flex items-center justify-center gap-2 py-3 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
        >
          <Icon name="arrow_back" size={18} />
          Ver otras oportunidades
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold font-headline text-[var(--primary)]">
        <Icon name="block" size={24} />
        No disponible
      </h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        La solicitud ya no está disponible para recibir propuestas.
      </p>
      <Link
        href="/provider/opportunities"
        className="mt-4 flex items-center justify-center gap-2 py-3 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
      >
        <Icon name="arrow_back" size={18} />
        Ver oportunidades
      </Link>
    </div>
  )
}

function ClosedOpportunityCard({ status }: { status: string }) {
  const info: Record<string, { title: string; description: string; icon: string }> = {
    in_progress: { title: "En progreso", description: "Esta solicitud ya tiene un proveedor asignado.", icon: "engineering" },
    completed: { title: "Completada", description: "Esta solicitud ya fue completada.", icon: "check_circle" },
    cancelled: { title: "Cancelada", description: "El cliente canceló esta solicitud.", icon: "cancel" },
    expired: { title: "Expirada", description: "Esta solicitud ha expirado.", icon: "timer_off" },
  }
  const item = info[status] ?? { title: "No disponible", description: "Esta solicitud ya no está disponible.", icon: "block" }

  return (
    <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold font-headline text-[var(--primary)]">
        <Icon name={item.icon} size={24} />
        {item.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">{item.description}</p>
      <Link
        href="/provider/opportunities"
        className="mt-4 flex items-center justify-center gap-2 py-3 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
      >
        <Icon name="arrow_back" size={18} />
        Ver otras oportunidades
      </Link>
    </div>
  )
}

function QuoteForm({ requestId, onSubmitted }: { requestId: string; onSubmitted: () => void | Promise<void> }) {
  const [message, setMessage] = useState("")
  const [price, setPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    const numericPrice = Number(price)

    if (!trimmedMessage) {
      toast.error("Agrega un mensaje", { description: "Explica tu propuesta para que el cliente pueda evaluarla." })
      return
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error("Ingresa un precio válido", { description: "El precio ofrecido debe ser mayor que cero." })
      return
    }

    setIsSubmitting(true)
    try {
      await requestsService.createProviderResponse(requestId, { message: trimmedMessage, estimated_price: numericPrice })
      setMessage("")
      setPrice("")
      toast.success("Cotización enviada", { description: "Se descontó 1 crédito. Continúa la conversación por chat." })
      await onSubmitted()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "No se pudo enviar la cotización"
      toast.error(errorMessage.toLowerCase().includes("insufficient credits") ? "No tienes créditos suficientes" : "Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <div className="mb-4 pb-3 border-b-2 border-[var(--primary)]/20">
        <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
          Cotización
        </p>
        <h3 className="mt-1 flex items-center gap-2 text-xl font-bold font-headline text-[var(--primary)]">
          <Icon name="request_quote" size={24} />
          Enviar propuesta
        </h3>
      </div>

      {/* Price */}
      <div className="mb-4">
        <label htmlFor="price" className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
          Precio ofrecido (L.)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] font-label text-sm">L.</span>
          <input
            type="text"
            id="price"
            inputMode="numeric"
            pattern="[0-9]*"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="500"
            required
            className="w-full pl-10 pr-4 py-3 text-lg font-bold bg-[var(--surface)] border-2 border-[var(--primary)] text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
          />
        </div>
      </div>

      {/* Message */}
      <div className="mb-4">
        <label htmlFor="message" className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
          Mensaje al cliente
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe tu propuesta, disponibilidad, experiencia..."
          rows={5}
          required
          className="w-full px-4 py-3 text-sm bg-[var(--surface)] border-2 border-[var(--primary)] text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] resize-none focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
        />
      </div>

      {/* Credit Notice */}
      <div className="mb-4 p-3 bg-[var(--primary-container)] border-2 border-[var(--primary)]">
        <div className="flex items-center gap-2 text-sm text-[var(--primary)]">
          <Icon name="toll" size={18} />
          <span><strong>1 crédito</strong> será descontado al enviar</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          type="submit"
          disabled={isSubmitting || !price || !message.trim()}
          className={`w-full flex items-center justify-center gap-2 py-3 text-label-sm font-label font-bold uppercase tracking-wider border-4 transition-all ${
            isSubmitting || !price || !message.trim()
              ? "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--on-surface-variant)] cursor-not-allowed"
              : "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Icon name="send" size={18} />
              Enviar cotización
            </>
          )}
        </button>
        <Link
          href="/provider/opportunities"
          className="flex items-center justify-center gap-2 py-3 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
        >
          <Icon name="close" size={18} />
          Cancelar
        </Link>
      </div>
    </form>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="fixo-loader mx-auto"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
        <p className="text-label-md font-label uppercase text-[var(--on-surface-variant)] mt-4 tracking-wider">
          Cargando oportunidad...
        </p>
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
          href="/provider/opportunities"
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

function MetricCard({ label, value, icon, highlight = false }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`border-4 p-4 ${highlight ? "bg-[var(--primary-container)] border-[var(--primary)]" : "bg-[var(--surface)] border-[var(--primary)]"} shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]`}>
      <div className={`mb-2 w-10 h-10 flex items-center justify-center border-2 ${highlight ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "bg-[var(--surface-container)] border-[var(--primary)] text-[var(--primary)]"}`}>
        <Icon name={icon} size={20} />
      </div>
      <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">{label}</p>
      <p className="mt-1 text-lg font-bold font-headline text-[var(--primary)]">{value}</p>
    </div>
  )
}

function StatRow({ label, value, icon, highlight = false }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 p-3 border-2 ${highlight ? "bg-[var(--primary-container)] border-[var(--primary)]" : "bg-[var(--surface-container)] border-[var(--primary)]/30"}`}>
      <div className="flex items-center gap-2">
        <Icon name={icon} size={18} className="text-[var(--primary)]" />
        <span className="text-sm text-[var(--on-surface-variant)]">{label}</span>
      </div>
      <span className="text-sm font-bold text-[var(--on-surface)]">{value}</span>
    </div>
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

function getFullAddress(request: ProviderOpportunityDetail) {
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
