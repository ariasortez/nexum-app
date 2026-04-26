"use client"

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

// Sample data
const IN_PROGRESS_REQUEST = {
  id: "r1",
  title: "Reparación de Fregadero",
  date: "Hoy, 14:00 - 15:30",
  price: "L. 450",
  status: "En Camino",
  provider: {
    name: "Mario Rivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    rating: 4.8,
    reviews: 124,
    specialty: "Plomero",
    online: true,
  },
}

const OPEN_REQUESTS = [
  {
    id: "r2",
    title: "Instalación Eléctrica",
    description: "Revisión de cableado en sala principal y cambio de 3 tomacorrientes que presentan fallas.",
    category: "electricidad",
    icon: "bolt",
    createdAt: "Hace 2 horas",
    responses: 5,
  },
]

const RECENT_HISTORY: Array<{
  id: string
  title: string
  provider: string
  date: string
  rating: number
}> = []

export default function ClientDashboard() {
  return (
    <div className="p-5 lg:p-10">
      {/* Top Header */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-[40px] font-bold text-[var(--on-background)] leading-[1.1] tracking-[-0.04em]">
            Hola, Carlos
          </h1>
          <p className="text-base text-[var(--primary)] font-medium mt-2 flex items-center gap-2">
            <Icon name="mark_email_unread" fill className="text-lg" />
            Tienes 3 respuestas nuevas
          </p>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Column 1 & 2: Active / Progress (Span 2) */}
        <div className="xl:col-span-2 space-y-12">
          {/* Section: En Progreso */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--on-background)] mb-6 flex items-center gap-3 tracking-[-0.02em]">
              <Icon name="construction" fill className="text-[var(--secondary-container)]" />
              En Progreso
            </h2>

            {/* Progress Card */}
            <div className="bg-[var(--surface-container-lowest)] nx-leaf nx-card-border shadow-[4px_4px_0px_0px_var(--secondary-container)] p-6 relative transition-transform hover:-translate-y-1 duration-200">
              {/* Top Badge */}
              <div className="absolute -top-3 left-6 bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] font-mono text-xs px-3 py-1 border-2 border-[var(--on-surface)] uppercase tracking-wider">
                {IN_PROGRESS_REQUEST.status}
              </div>

              <div className="flex justify-between items-start mt-2">
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--on-background)] leading-tight tracking-[-0.02em]">
                    {IN_PROGRESS_REQUEST.title}
                  </h3>
                  <p className="text-sm text-[var(--outline)] mt-1">
                    {IN_PROGRESS_REQUEST.date}
                  </p>
                </div>
                {/* Price/Status */}
                <div className="text-right">
                  <span className="text-xl font-semibold text-[var(--on-background)] block">
                    {IN_PROGRESS_REQUEST.price}
                  </span>
                  <span className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider">
                    Est.
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 pt-6 border-t-2 border-[var(--surface-variant)]">
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full nx-card-border overflow-hidden bg-[var(--surface-container-high)]">
                  <Image
                    src={IN_PROGRESS_REQUEST.provider.avatar}
                    alt={IN_PROGRESS_REQUEST.provider.name}
                    fill
                    className="object-cover"
                  />
                  {/* Online Indicator */}
                  {IN_PROGRESS_REQUEST.provider.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--surface-container-lowest)] rounded-full" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-base font-medium text-[var(--on-background)]">
                    {IN_PROGRESS_REQUEST.provider.name}
                  </p>
                  <div className="flex items-center gap-1 text-[var(--secondary-container)]">
                    <Icon name="star" fill className="text-sm" />
                    <span className="font-mono text-xs text-[var(--on-background)] mt-0.5">
                      {IN_PROGRESS_REQUEST.provider.rating} ({IN_PROGRESS_REQUEST.provider.reviews})
                    </span>
                    <span className="font-mono text-xs text-[var(--outline)] ml-2 px-2 py-0.5 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-sm">
                      {IN_PROGRESS_REQUEST.provider.specialty}
                    </span>
                  </div>
                </div>

                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-variant)] transition-colors border-2 border-[var(--on-surface)]">
                  <Icon name="chat" className="text-[var(--primary-container)]" />
                </button>
              </div>
            </div>
          </section>

          {/* Section: Solicitudes Abiertas */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-semibold text-[var(--on-background)] flex items-center gap-3 tracking-[-0.02em]">
                <Icon name="format_list_bulleted" className="text-[var(--primary-container)]" />
                Solicitudes Abiertas
              </h2>
              <Link
                href="/client/requests"
                className="font-mono text-xs text-[var(--primary)] hover:underline uppercase tracking-wider hidden md:block"
              >
                Ver Todas
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Request Cards */}
              {OPEN_REQUESTS.map((request) => (
                <Link
                  key={request.id}
                  href={`/client/requests/${request.id}`}
                  className="bg-[var(--surface-container-lowest)] nx-leaf-reverse nx-card-border nx-offset-shadow p-5 flex flex-col justify-between h-full group cursor-pointer hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-xs bg-[var(--primary-container)] text-[var(--on-primary-container)] px-2 py-1 rounded-sm uppercase tracking-wider">
                        Abierta
                      </span>
                      <Icon
                        name={request.icon}
                        className="text-[var(--outline)] group-hover:text-[var(--primary)] transition-colors"
                      />
                    </div>
                    <h3 className="text-base font-semibold text-[var(--on-background)] mb-1">
                      {request.title}
                    </h3>
                    <p className="text-sm text-[var(--outline)] line-clamp-2">
                      {request.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-[var(--surface-variant)] flex justify-between items-center">
                    <p className="font-mono text-xs text-[var(--outline)] uppercase">
                      {request.createdAt}
                    </p>
                    <div className="flex items-center gap-2 bg-[var(--surface-variant)] px-3 py-1.5 rounded-full border border-[var(--outline-variant)]">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--surface-dim)] border border-[var(--surface-container-lowest)]" />
                        <div className="w-6 h-6 rounded-full bg-[var(--surface-dim)] border border-[var(--surface-container-lowest)]" />
                      </div>
                      <span className="font-mono text-xs text-[var(--on-background)]">
                        {request.responses} respuestas
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Empty/Add Card */}
              <Link
                href="/client/requests/new"
                className="bg-[var(--surface-container-lowest)]/50 nx-leaf-reverse border-2 border-[var(--outline-variant)] border-dashed p-5 flex flex-col justify-center items-center text-center h-full min-h-[200px] hover:border-[var(--primary)] transition-colors cursor-pointer group"
              >
                <Icon
                  name="add_circle"
                  className="text-[var(--outline)] group-hover:text-[var(--primary)] mb-3 text-[32px] transition-colors"
                />
                <h3 className="text-base font-medium text-[var(--on-background)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                  Crear Nueva Solicitud
                </h3>
                <p className="text-sm text-[var(--outline)]">
                  Describe lo que necesitas y recibe cotizaciones.
                </p>
              </Link>
            </div>
          </section>
        </div>

        {/* Column 3: Sidebar / History (Span 1) */}
        <div className="xl:col-span-1">
          {/* Section: Historial */}
          <section className="bg-[var(--surface-container-low)] rounded-xl p-6 h-full min-h-[400px] flex flex-col">
            <h2 className="text-2xl font-semibold text-[var(--on-background)] mb-6 flex items-center gap-3 tracking-[-0.02em]">
              <Icon name="history" className="text-[var(--outline)]" />
              Historial Reciente
            </h2>

            {RECENT_HISTORY.length > 0 ? (
              <div className="space-y-4">
                {RECENT_HISTORY.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]"
                  >
                    <h4 className="font-medium text-[var(--on-background)]">{item.title}</h4>
                    <p className="text-sm text-[var(--outline)] mt-1">{item.provider}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-[var(--outline)]">{item.date}</span>
                      <div className="flex items-center gap-1">
                        <Icon name="star" fill className="text-sm text-[var(--secondary-container)]" />
                        <span className="text-xs font-medium">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-[var(--surface-container)] rounded-full flex items-center justify-center mb-4 border border-[var(--outline-variant)]">
                  <Icon name="inventory_2" className="text-[var(--outline)] text-[32px]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--on-background)] mb-2">
                  No hay historial reciente
                </h3>
                <p className="text-sm text-[var(--outline)]">
                  Tus servicios completados en los últimos 30 días aparecerán aquí.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
