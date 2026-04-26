"use client"

import { useState } from "react"
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

// Service categories
const CATEGORIES = [
  { id: "plomeria", name: "Plomería", icon: "plumbing", color: "primary", providers: 45 },
  { id: "electricidad", name: "Electricidad", icon: "electric_bolt", color: "secondary", providers: 38 },
  { id: "limpieza", name: "Limpieza", icon: "cleaning_services", color: "tertiary", providers: 62 },
  { id: "carpinteria", name: "Carpintería", icon: "carpenter", color: "primary", providers: 24 },
  { id: "pintura", name: "Pintura", icon: "format_paint", color: "secondary", providers: 31 },
  { id: "electrodomesticos", name: "Electrodomésticos", icon: "kitchen", color: "tertiary", providers: 19 },
  { id: "cerrajeria", name: "Cerrajería", icon: "lock", color: "primary", providers: 15 },
  { id: "jardineria", name: "Jardinería", icon: "yard", color: "secondary", providers: 22 },
]

// Featured providers
const FEATURED_PROVIDERS = [
  {
    id: "p1",
    name: "Roberto Martínez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    specialty: "Plomería",
    rating: 4.9,
    reviews: 156,
    verified: true,
    responseTime: "< 1 hora",
    completedJobs: 234,
  },
  {
    id: "p2",
    name: "María García",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    specialty: "Limpieza",
    rating: 4.8,
    reviews: 203,
    verified: true,
    responseTime: "< 30 min",
    completedJobs: 312,
  },
  {
    id: "p3",
    name: "Carlos Hernández",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    specialty: "Electricidad",
    rating: 4.7,
    reviews: 98,
    verified: true,
    responseTime: "< 2 horas",
    completedJobs: 145,
  },
  {
    id: "p4",
    name: "Ana López",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    specialty: "Pintura",
    rating: 4.9,
    reviews: 87,
    verified: false,
    responseTime: "< 1 hora",
    completedJobs: 98,
  },
]

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="mb-5 lg:mb-8">
        <h1 className="text-2xl lg:text-[40px] font-bold text-[var(--on-surface)] leading-[1.1] tracking-[-0.04em]">
          Servicios
        </h1>
        <p className="text-xs lg:text-base text-[var(--on-surface-variant)] mt-1 lg:mt-2">
          Encuentra el profesional perfecto
        </p>
      </header>

      {/* Search Bar */}
      <div className="mb-6 lg:mb-8">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-[var(--outline)] text-lg lg:text-xl"
          />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tl-xl rounded-br-xl lg:rounded-tl-2xl lg:rounded-br-2xl rounded-tr-sm rounded-bl-sm pl-10 lg:pl-12 pr-4 py-3 lg:py-4 text-sm lg:text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 shadow-[2px_2px_0px_0px_var(--surface-variant)] lg:shadow-[4px_4px_0px_0px_var(--surface-variant)]"
          />
        </div>
      </div>

      {/* Categories */}
      <section className="mb-6 lg:mb-12">
        <div className="flex items-center justify-between mb-3 lg:mb-6">
          <h2 className="text-base lg:text-2xl font-semibold text-[var(--on-surface)] flex items-center gap-1.5 lg:gap-3 tracking-[-0.02em]">
            <Icon name="category" className="text-[var(--primary)] text-lg lg:text-2xl" />
            Categorías
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="font-mono text-[10px] lg:text-xs text-[var(--primary)] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <Icon name="close" className="text-sm" />
              Limpiar
            </button>
          )}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3 w-max">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategory === category.id
              const colorClasses = {
                primary: {
                  bg: isSelected ? "bg-[var(--primary)]" : "bg-[var(--primary-container)]",
                  text: isSelected ? "text-[var(--on-primary)]" : "text-[var(--on-primary-container)]",
                  iconBg: isSelected ? "bg-[var(--on-primary)]/20" : "bg-[var(--primary)]/20",
                },
                secondary: {
                  bg: isSelected ? "bg-[var(--secondary)]" : "bg-[var(--secondary-container)]",
                  text: isSelected ? "text-[var(--on-secondary)]" : "text-[var(--on-secondary-container)]",
                  iconBg: isSelected ? "bg-[var(--on-secondary)]/20" : "bg-[var(--secondary)]/20",
                },
                tertiary: {
                  bg: isSelected ? "bg-[var(--tertiary)]" : "bg-[var(--tertiary-container)]",
                  text: isSelected ? "text-[var(--on-tertiary)]" : "text-[var(--on-tertiary-container)]",
                  iconBg: isSelected ? "bg-[var(--on-tertiary)]/20" : "bg-[var(--tertiary)]/20",
                },
              }
              const colors = colorClasses[category.color as keyof typeof colorClasses]

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  className={`flex flex-col items-center justify-center p-3 w-20 border-2 border-[var(--on-surface)] rounded-xl transition-all ${colors.bg} ${colors.text} ${
                    isSelected
                      ? "shadow-[1px_1px_0px_0px_var(--on-surface)]"
                      : "shadow-[2px_2px_0px_0px_var(--on-surface)]"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${colors.iconBg}`}>
                    <Icon name={category.icon} className="text-lg" />
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-4">
          {filteredCategories.map((category) => {
            const isSelected = selectedCategory === category.id
            const colorClasses = {
              primary: {
                bg: isSelected ? "bg-[var(--primary)]" : "bg-[var(--primary-container)]",
                text: isSelected ? "text-[var(--on-primary)]" : "text-[var(--on-primary-container)]",
                iconBg: isSelected ? "bg-[var(--on-primary)]/20" : "bg-[var(--primary)]/20",
                shadow: "shadow-[4px_4px_0px_0px_var(--primary)]",
              },
              secondary: {
                bg: isSelected ? "bg-[var(--secondary)]" : "bg-[var(--secondary-container)]",
                text: isSelected ? "text-[var(--on-secondary)]" : "text-[var(--on-secondary-container)]",
                iconBg: isSelected ? "bg-[var(--on-secondary)]/20" : "bg-[var(--secondary)]/20",
                shadow: "shadow-[4px_4px_0px_0px_var(--secondary)]",
              },
              tertiary: {
                bg: isSelected ? "bg-[var(--tertiary)]" : "bg-[var(--tertiary-container)]",
                text: isSelected ? "text-[var(--on-tertiary)]" : "text-[var(--on-tertiary-container)]",
                iconBg: isSelected ? "bg-[var(--on-tertiary)]/20" : "bg-[var(--tertiary)]/20",
                shadow: "shadow-[4px_4px_0px_0px_var(--tertiary)]",
              },
            }

            const colors = colorClasses[category.color as keyof typeof colorClasses]

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`group flex flex-col items-center justify-center p-5 border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm transition-all ${colors.bg} ${colors.text} ${
                  isSelected
                    ? colors.shadow
                    : "shadow-[4px_4px_0px_0px_var(--on-surface)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--on-surface)]"
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${colors.iconBg}`}>
                  <Icon name={category.icon} className="text-2xl" />
                </div>
                <span className="text-sm font-semibold text-center mb-1">
                  {category.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider opacity-80">
                  {category.providers} profesionales
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Featured Providers */}
      <section className="mb-6 lg:mb-12">
        <div className="flex items-center justify-between mb-3 lg:mb-6">
          <h2 className="text-base lg:text-2xl font-semibold text-[var(--on-surface)] flex items-center gap-1.5 lg:gap-3 tracking-[-0.02em]">
            <Icon name="workspace_premium" fill className="text-amber-500 text-lg lg:text-2xl" />
            Destacados
          </h2>
          <Link
            href="/client/services/providers"
            className="font-mono text-[10px] lg:text-xs text-[var(--primary)] hover:underline uppercase tracking-wider"
          >
            Ver todos
          </Link>
        </div>

        {/* Mobile: Compact cards */}
        <div className="lg:hidden space-y-2">
          {FEATURED_PROVIDERS.slice(0, 3).map((provider) => (
            <Link
              key={provider.id}
              href={`/client/services/providers/${provider.id}`}
              className="flex items-center gap-2.5 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-xl shadow-[2px_2px_0px_0px_var(--on-surface)] p-2.5 group"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Image
                  src={provider.avatar}
                  alt={provider.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[var(--on-surface)]"
                />
                {provider.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[var(--primary)] rounded-full flex items-center justify-center border border-[var(--surface-container-lowest)]">
                    <Icon name="verified" className="text-[var(--on-primary)] text-[10px]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-[var(--on-surface)] truncate">
                  {provider.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[9px] text-[var(--outline)] uppercase">
                    {provider.specialty}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Icon name="star" fill className="text-[10px] text-amber-500" />
                    <span className="text-[10px] font-medium text-[var(--on-surface)]">
                      {provider.rating}
                    </span>
                  </div>
                </div>
              </div>

              <Icon
                name="chevron_right"
                className="text-lg text-[var(--outline)] shrink-0"
              />
            </Link>
          ))}
        </div>

        {/* Desktop: Full cards */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
          {FEATURED_PROVIDERS.map((provider) => (
            <Link
              key={provider.id}
              href={`/client/services/providers/${provider.id}`}
              className="bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tr-2xl rounded-bl-2xl rounded-tl-sm rounded-br-sm shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-5 group"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Image
                    src={provider.avatar}
                    alt={provider.name}
                    width={72}
                    height={72}
                    className="w-[72px] h-[72px] rounded-full object-cover border-2 border-[var(--on-surface)]"
                  />
                  {provider.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center border-2 border-[var(--surface-container-lowest)]">
                      <Icon name="verified" className="text-[var(--on-primary)] text-sm" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                        {provider.name}
                      </h3>
                      <span className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider">
                        {provider.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-[var(--surface-container)] px-2 py-1 rounded-full border border-[var(--outline-variant)]">
                      <Icon name="star" fill className="text-sm text-amber-500" />
                      <span className="font-mono text-xs font-medium text-[var(--on-surface)]">
                        {provider.rating}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1 text-sm text-[var(--on-surface-variant)]">
                      <Icon name="reviews" className="text-base text-[var(--outline)]" />
                      <span>{provider.reviews} reseñas</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--on-surface-variant)]">
                      <Icon name="timer" className="text-base text-[var(--outline)]" />
                      <span>{provider.responseTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--on-surface-variant)]">
                      <Icon name="task_alt" className="text-base text-[var(--outline)]" />
                      <span>{provider.completedJobs} trabajos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action hint */}
              <div className="mt-4 pt-4 border-t border-[var(--surface-container-high)] flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--outline)] uppercase tracking-wider">
                  Ver perfil
                </span>
                <Icon
                  name="arrow_forward"
                  className="text-base text-[var(--outline)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="pb-4">
        <h2 className="text-base lg:text-2xl font-semibold text-[var(--on-surface)] mb-3 lg:mb-6 flex items-center gap-1.5 lg:gap-3 tracking-[-0.02em]">
          <Icon name="bolt" className="text-[var(--secondary)] text-lg lg:text-2xl" />
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-4">
          {/* Create Request */}
          <Link
            href="/client/requests/new"
            className="bg-[var(--primary)] text-[var(--on-primary)] border-2 border-[var(--on-surface)] rounded-xl lg:rounded-tl-2xl lg:rounded-br-2xl lg:rounded-tr-sm lg:rounded-bl-sm shadow-[2px_2px_0px_0px_var(--on-surface)] lg:shadow-[4px_4px_0px_0px_var(--on-surface)] transition-all p-3 lg:p-6"
          >
            <div className="flex items-center gap-2.5 lg:gap-4">
              <div className="w-9 h-9 lg:w-12 lg:h-12 bg-[var(--on-primary)]/20 rounded-full flex items-center justify-center shrink-0">
                <Icon name="add_circle" className="text-lg lg:text-2xl" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm lg:text-lg font-semibold">Nueva Solicitud</h3>
                <p className="text-[10px] lg:text-sm opacity-80">Describe lo que necesitas</p>
              </div>
            </div>
          </Link>

          {/* Emergency Service */}
          <Link
            href="/client/requests/new?urgency=urgente"
            className="bg-[var(--error-container)] text-[var(--on-error-container)] border-2 border-[var(--on-surface)] rounded-xl lg:rounded-tr-2xl lg:rounded-bl-2xl lg:rounded-tl-sm lg:rounded-br-sm shadow-[2px_2px_0px_0px_var(--error)] lg:shadow-[4px_4px_0px_0px_var(--error)] transition-all p-3 lg:p-6"
          >
            <div className="flex items-center gap-2.5 lg:gap-4">
              <div className="w-9 h-9 lg:w-12 lg:h-12 bg-[var(--error)]/20 rounded-full flex items-center justify-center shrink-0">
                <Icon name="emergency" className="text-lg lg:text-2xl text-[var(--error)]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm lg:text-lg font-semibold">Servicio Urgente</h3>
                <p className="text-[10px] lg:text-sm opacity-80">Respuesta rápida</p>
              </div>
            </div>
          </Link>

          {/* View My Requests */}
          <Link
            href="/client/requests"
            className="bg-[var(--surface-container-lowest)] text-[var(--on-surface)] border-2 border-[var(--on-surface)] rounded-xl lg:rounded-tl-2xl lg:rounded-br-2xl lg:rounded-tr-sm lg:rounded-bl-sm shadow-[2px_2px_0px_0px_var(--on-surface)] lg:shadow-[4px_4px_0px_0px_var(--on-surface)] transition-all p-3 lg:p-6"
          >
            <div className="flex items-center gap-2.5 lg:gap-4">
              <div className="w-9 h-9 lg:w-12 lg:h-12 bg-[var(--surface-container)] rounded-full flex items-center justify-center shrink-0">
                <Icon name="receipt_long" className="text-lg lg:text-2xl text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm lg:text-lg font-semibold">Mis Solicitudes</h3>
                <p className="text-[10px] lg:text-sm text-[var(--outline)]">Ver tus pedidos</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
