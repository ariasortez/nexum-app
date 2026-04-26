"use client"

import Link from "next/link"

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
const STATS = [
  { label: "Ganancias (Mes)", value: "L. 12,450", icon: null, highlight: true },
  { label: "Trabajos", value: "8", icon: "handyman", highlight: false },
  { label: "Rating", value: "4.9", suffix: "/5.0", icon: "star", highlight: false },
  { label: "Respuesta", value: "95%", icon: "bolt", highlight: false },
]

const OPPORTUNITIES = [
  {
    id: "op1",
    category: "Plomería",
    categoryIcon: "plumbing",
    categoryColor: "primary",
    title: "Fuga severa en baño principal",
    distance: "2.5 km",
    time: "Hace 5 min",
    budget: "L. 800",
    urgency: "urgente",
  },
  {
    id: "op2",
    category: "Electricidad",
    categoryIcon: "electric_bolt",
    categoryColor: "secondary",
    title: "Instalación de panel eléctrico",
    distance: "4.1 km",
    time: "Hace 12 min",
    budget: "L. 1,500",
    urgency: null,
  },
  {
    id: "op3",
    category: "Limpieza",
    categoryIcon: "cleaning_services",
    categoryColor: "tertiary",
    title: "Limpieza profunda de apartamento",
    distance: "1.8 km",
    time: "Hace 25 min",
    budget: "L. 600",
    urgency: "esta_semana",
  },
]

const CURRENT_JOB = {
  status: "En Camino",
  time: "14:30 PM",
  client: "Carlos R.",
  title: "Instalación Eléctrica Res.",
  address: "Col. Florencia Sur, Bloque 4",
}

const AGENDA_ITEMS = [
  { time: "16:00", title: "Revisión de Tuberías", location: "Plaza Miraflores" },
  { time: "18:30", title: "Mantenimiento AC", location: "Res. Lomas del Guijarro" },
]

export default function ProviderDashboard() {
  return (
    <div className="flex flex-col xl:flex-row min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 p-5 lg:p-8 flex flex-col gap-10 max-w-5xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[40px] font-bold text-[var(--on-surface)] leading-[1.1] tracking-[-0.04em]">
                Hola, Mario
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-container)] border-2 border-[var(--on-surface)] rounded-full shadow-[2px_2px_0px_0px_var(--on-surface)]">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-[10px] text-[var(--on-surface)] uppercase tracking-wider font-bold">
                  Disponible
                </span>
              </span>
            </div>
            <p className="text-base text-[var(--on-surface-variant)] flex items-center gap-2">
              <Icon name="notifications_active" className="text-[var(--primary)]" />
              Tienes <strong className="text-[var(--on-surface)]">3 nuevas oportunidades</strong> esperando hoy.
            </p>
          </div>
        </header>

        {/* Stats Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={`p-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)] flex flex-col justify-between min-h-[120px] transition-transform hover:-translate-y-1 ${
                stat.highlight
                  ? "bg-[var(--secondary-container)]"
                  : "bg-[var(--surface-container)]"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-mono text-[10px] uppercase tracking-wider ${
                  stat.highlight ? "text-[var(--on-secondary-container)] opacity-80" : "text-[var(--on-surface-variant)]"
                }`}>
                  {stat.label}
                </span>
                {stat.icon && (
                  <Icon
                    name={stat.icon}
                    className={stat.icon === "star" ? "text-[var(--secondary)]" : "text-[var(--on-surface-variant)]"}
                  />
                )}
              </div>
              <div className="mt-auto flex items-baseline gap-1">
                <span className={`font-mono text-2xl font-semibold ${
                  stat.highlight ? "text-[var(--on-secondary-container)]" : "text-[var(--on-surface)]"
                }`}>
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="font-mono text-xs text-[var(--on-surface-variant)]">{stat.suffix}</span>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Opportunities Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em]">
              Nuevas Oportunidades
            </h2>
            <Link
              href="/provider/opportunities"
              className="font-mono text-xs text-[var(--primary)] hover:underline uppercase tracking-wider"
            >
              Ver todas
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {OPPORTUNITIES.map((opp) => (
              <article
                key={opp.id}
                className="bg-[var(--surface)] p-5 lg:p-6 border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-[4px_4px_0px_0px_var(--on-surface)] flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform"
              >
                {/* Background decoration */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--surface-container-high)] rounded-full opacity-50 z-0 group-hover:scale-110 transition-transform" />

                {/* Category & Urgency */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--surface-container)] p-1.5 border-2 border-[var(--on-surface)] rounded-md">
                      <Icon
                        name={opp.categoryIcon}
                        className={`text-lg ${
                          opp.categoryColor === "primary"
                            ? "text-[var(--primary)]"
                            : opp.categoryColor === "secondary"
                            ? "text-[var(--secondary)]"
                            : "text-[var(--tertiary)]"
                        }`}
                      />
                    </span>
                    <span className="font-mono text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">
                      {opp.category}
                    </span>
                  </div>
                  {opp.urgency === "urgente" && (
                    <span className="bg-[var(--error-container)] text-[var(--on-error-container)] font-mono text-[10px] px-2 py-1 rounded-sm border-2 border-[var(--on-surface)] uppercase shadow-[2px_2px_0px_0px_var(--on-surface)] rotate-2">
                      Urgente
                    </span>
                  )}
                  {opp.urgency === "esta_semana" && (
                    <span className="bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-mono text-[10px] px-2 py-1 rounded-sm border-2 border-[var(--on-surface)] uppercase shadow-[2px_2px_0px_0px_var(--on-surface)]">
                      Esta Semana
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-1">
                  <h3 className="text-xl font-semibold leading-tight text-[var(--on-surface)] tracking-[-0.02em]">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[var(--on-surface-variant)] text-sm">
                    <span className="flex items-center gap-1">
                      <Icon name="location_on" className="text-base" />
                      {opp.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="schedule" className="text-base" />
                      {opp.time}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t-2 border-[var(--surface-variant)] flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-[var(--on-surface-variant)] uppercase">
                      Presupuesto Ref.
                    </span>
                    <span className="font-mono text-lg font-semibold text-[var(--on-surface)]">
                      {opp.budget}
                    </span>
                  </div>
                  <Link
                    href={`/provider/opportunities/${opp.id}`}
                    className={`font-mono text-xs uppercase px-4 py-2 border-2 border-[var(--on-surface)] shadow-[2px_2px_0px_0px_var(--on-surface)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${
                      opp.urgency === "urgente"
                        ? "bg-[var(--primary)] text-[var(--on-primary)]"
                        : "bg-[var(--surface)] text-[var(--on-surface)] hover:bg-[var(--surface-container)]"
                    }`}
                  >
                    Cotizar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar (Desktop XL) */}
      <aside className="w-full xl:w-96 border-t-2 xl:border-t-0 xl:border-l-2 border-[var(--on-surface)] bg-[var(--surface-bright)] p-5 lg:p-6 flex flex-col gap-10">
        {/* Current Job */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-[var(--on-surface)] tracking-[-0.02em]">
            Trabajo Actual
          </h2>

          <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] p-5 border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-[4px_4px_0px_0px_var(--on-surface)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="bg-[var(--background)] text-[var(--on-surface)] font-mono text-[10px] px-2 py-1 rounded-sm border-2 border-[var(--on-surface)] uppercase">
                {CURRENT_JOB.status}
              </span>
              <span className="font-mono text-xs opacity-80 uppercase">
                {CURRENT_JOB.time}
              </span>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase opacity-80 mb-1">
                Cliente: {CURRENT_JOB.client}
              </p>
              <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em]">
                {CURRENT_JOB.title}
              </h3>
              <p className="text-sm mt-2 opacity-90 flex items-center gap-1">
                <Icon name="pin_drop" className="text-base" />
                {CURRENT_JOB.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button className="bg-[var(--background)] text-[var(--on-surface)] font-mono text-xs uppercase py-2.5 border-2 border-[var(--on-surface)] shadow-[2px_2px_0px_0px_var(--on-surface)] hover:bg-[var(--surface-container)] transition-colors flex justify-center items-center gap-2 rounded-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--on-surface)]">
                <Icon name="chat" className="text-lg" />
                Chat
              </button>
              <button className="bg-[var(--on-surface)] text-[var(--surface)] font-mono text-xs uppercase py-2.5 border-2 border-[var(--on-surface)] shadow-[2px_2px_0px_0px_var(--on-surface)] hover:bg-[var(--on-surface-variant)] transition-colors flex justify-center items-center gap-2 rounded-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--on-surface)]">
                <Icon name="directions" className="text-lg" />
                Navegar
              </button>
            </div>
          </div>
        </section>

        {/* Agenda */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-[var(--on-surface)] pb-2">
            <h2 className="text-xl font-semibold text-[var(--on-surface)] tracking-[-0.02em]">
              Agenda Hoy
            </h2>
            <span className="bg-[var(--surface-container)] text-[var(--on-surface)] font-mono text-[10px] px-2 py-0.5 rounded-full border-2 border-[var(--on-surface)]">
              {AGENDA_ITEMS.length} Restantes
            </span>
          </div>

          <div className="flex flex-col divide-y-2 divide-[var(--surface-container)]">
            {AGENDA_ITEMS.map((item, index) => (
              <div
                key={index}
                className="py-3 flex items-start gap-3 hover:bg-[var(--surface-container)] px-2 transition-colors -mx-2 rounded-md cursor-pointer"
              >
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className={`font-mono text-lg font-semibold text-[var(--on-surface)] leading-none ${
                    index > 0 ? "opacity-60" : ""
                  }`}>
                    {item.time}
                  </span>
                </div>
                <div className={`flex-1 flex flex-col ${index > 0 ? "opacity-80" : ""}`}>
                  <h4 className="text-base font-semibold text-[var(--on-surface)] leading-tight">
                    {item.title}
                  </h4>
                  <span className="font-mono text-[10px] text-[var(--on-surface-variant)] uppercase mt-1">
                    {item.location}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {AGENDA_ITEMS.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 bg-[var(--surface-container)] rounded-full flex items-center justify-center mb-3 border border-[var(--outline-variant)]">
                <Icon name="event_available" className="text-[var(--outline)] text-2xl" />
              </div>
              <p className="text-sm text-[var(--outline)]">
                No hay más trabajos programados para hoy
              </p>
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}
