"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCategories } from "@/hooks/use-categories"

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

const CATEGORY_ICONS: Record<string, string> = {
  "Hogar": "home",
  "Construcción": "construction",
  "Tecnología": "devices",
  "Eventos": "celebration",
  "Salud": "health_and_safety",
  "Educación": "school",
  "Transporte": "local_shipping",
  "Belleza": "spa",
}

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
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 pb-28 lg:p-8">
      {/* Header */}
      <header className="mb-6 lg:mb-8">
        <h1 className="text-3xl lg:text-4xl font-black text-[var(--primary)] font-headline leading-tight">
          Servicios
        </h1>
        <p className="text-label-sm font-label text-[var(--on-surface-variant)] mt-2 uppercase tracking-wider">
          Encuentra el profesional perfecto
        </p>
      </header>

      {/* Search Bar */}
      <div className="mb-6 lg:mb-8">
        <div className="relative">
          <Icon
            name="search"
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]"
          />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border-4 border-[var(--primary)] pl-12 pr-4 py-3 lg:py-4 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none focus:bg-white neo-shadow-md"
          />
        </div>
      </div>

      {/* Categories */}
      <section className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-[var(--primary)] font-headline flex items-center gap-2">
            <Icon name="category" filled size={24} className="text-[var(--secondary)]" />
            Categorías
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 px-3 py-1.5 text-label-sm font-label uppercase text-[var(--secondary)] border-2 border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white transition-colors"
            >
              <Icon name="close" size={16} />
              Limpiar
            </button>
          )}
        </div>

        {categoriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="fixo-loader"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
          </div>
        ) : categoriesError ? (
          <div className="bg-[var(--error-container)] border-4 border-[var(--error)] p-6 neo-shadow-md">
            <div className="flex items-center gap-3">
              <Icon name="error" size={24} className="text-[var(--error)]" />
              <p className="text-body-md text-[var(--error)]">{categoriesError}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal scroll */}
            <div className="lg:hidden -ml-4 -mr-4">
              <div
                className="flex gap-3 px-4 pb-3 overflow-x-scroll scrollbar-none"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
              >
                {filteredCategories.map((category) => {
                  const isSelected = selectedCategory === category.id
                  const iconName = CATEGORY_ICONS[category.name] || category.icon || "category"

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                      className={`flex-none flex flex-col items-center justify-center w-20 p-3 border-2 transition-all ${
                        isSelected
                          ? "bg-[var(--primary)] border-[var(--primary)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
                          : "bg-[var(--surface)] border-[var(--primary)]/40 hover:border-[var(--primary)]"
                      }`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center mb-2 border-2 ${
                        isSelected
                          ? "bg-[var(--primary-container)] border-[var(--primary-container)]"
                          : "bg-[var(--primary-container)]/50 border-[var(--primary)]/30"
                      }`}>
                        <Icon
                          name={iconName}
                          filled={isSelected}
                          size={20}
                          className={isSelected ? "text-[var(--primary)]" : "text-[var(--primary)]"}
                        />
                      </div>
                      <span className={`text-[10px] font-label font-bold text-center leading-tight uppercase ${
                        isSelected ? "!text-white" : "text-[var(--primary)]"
                      }`}>
                        {category.name}
                      </span>
                    </button>
                  )
                })}
                <div className="flex-none w-2" aria-hidden="true" />
              </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
              {filteredCategories.map((category) => {
                const isSelected = selectedCategory === category.id
                const iconName = CATEGORY_ICONS[category.name] || category.icon || "category"

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                    className={`group flex flex-col items-center justify-center p-6 border-4 transition-all ${
                      isSelected
                        ? "bg-[var(--primary)] border-[var(--primary)] neo-shadow-md"
                        : "bg-[var(--surface)] border-[var(--primary)] neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
                    }`}
                  >
                    <div className={`w-16 h-16 flex items-center justify-center mb-4 border-4 ${
                      isSelected
                        ? "bg-[var(--primary-container)] border-[var(--primary-container)]"
                        : "bg-[var(--primary-container)] border-[var(--primary)]"
                    }`}>
                      <Icon
                        name={iconName}
                        filled={isSelected}
                        size={32}
                        className="text-[var(--primary)]"
                      />
                    </div>
                    <span className={`text-label-md font-label font-bold text-center uppercase tracking-wide ${
                      isSelected ? "!text-white" : "text-[var(--primary)]"
                    }`}>
                      {category.name}
                    </span>
                    <span className={`text-[10px] font-label mt-1 uppercase ${
                      isSelected ? "text-white/80" : "text-[var(--on-surface-variant)]"
                    }`}>
                      {category.subcategories.length} servicio{category.subcategories.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* Featured Providers */}
      <section className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-[var(--primary)] font-headline flex items-center gap-2">
            <Icon name="workspace_premium" filled size={24} className="text-[var(--secondary)]" />
            Destacados
          </h2>
          <Link
            href="/client/services/providers"
            className="flex items-center gap-1 text-label-sm font-label uppercase text-[var(--secondary)] hover:underline"
          >
            Ver todos
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        {/* Mobile: Compact cards */}
        <div className="lg:hidden space-y-3">
          {FEATURED_PROVIDERS.slice(0, 3).map((provider) => (
            <Link
              key={provider.id}
              href={`/client/services/providers/${provider.id}`}
              className="flex items-center gap-3 bg-[var(--surface)] border-2 border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] p-3 group active:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Image
                  src={provider.avatar}
                  alt={provider.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover border-2 border-[var(--primary)]"
                />
                {provider.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--primary)] flex items-center justify-center border border-[var(--surface)]">
                    <Icon name="verified" filled size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--primary)] font-headline truncate">
                  {provider.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-label text-[var(--on-surface-variant)] uppercase">
                    {provider.specialty}
                  </span>
                  <div className="flex items-center gap-0.5 bg-[var(--primary-container)] px-1.5 py-0.5 border border-[var(--primary)]">
                    <Icon name="star" filled size={10} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-label font-bold text-[var(--primary)]">
                      {provider.rating}
                    </span>
                  </div>
                </div>
              </div>

              <Icon
                name="chevron_right"
                size={20}
                className="text-[var(--primary)] shrink-0"
              />
            </Link>
          ))}
        </div>

        {/* Desktop: Full cards */}
        <div className="hidden lg:grid grid-cols-2 gap-5">
          {FEATURED_PROVIDERS.map((provider) => (
            <Link
              key={provider.id}
              href={`/client/services/providers/${provider.id}`}
              className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all p-5 group"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Image
                    src={provider.avatar}
                    alt={provider.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover border-4 border-[var(--primary)]"
                  />
                  {provider.verified && (
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[var(--primary)] flex items-center justify-center border-2 border-[var(--surface)]">
                      <Icon name="verified" filled size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--primary)] font-headline group-hover:text-[var(--secondary)] transition-colors">
                        {provider.name}
                      </h3>
                      <span className="text-label-sm font-label text-[var(--on-surface-variant)] uppercase">
                        {provider.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-[var(--primary-container)] px-2 py-1 border-2 border-[var(--primary)]">
                      <Icon name="star" filled size={14} className="text-[var(--primary)]" />
                      <span className="text-label-sm font-label font-bold text-[var(--primary)]">
                        {provider.rating}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-[var(--on-surface-variant)]">
                      <Icon name="reviews" size={16} className="text-[var(--primary)]" />
                      <span>{provider.reviews} reseñas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--on-surface-variant)]">
                      <Icon name="timer" size={16} className="text-[var(--primary)]" />
                      <span>{provider.responseTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--on-surface-variant)]">
                      <Icon name="task_alt" size={16} className="text-[var(--primary)]" />
                      <span>{provider.completedJobs} trabajos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t-2 border-[var(--primary)]/20 flex items-center justify-between">
                <span className="text-[11px] font-label text-[var(--on-surface-variant)] uppercase">
                  Ver perfil completo
                </span>
                <Icon
                  name="arrow_forward"
                  size={18}
                  className="text-[var(--primary)] group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl lg:text-2xl font-bold text-[var(--primary)] font-headline mb-4 lg:mb-6 flex items-center gap-2">
          <Icon name="bolt" filled size={24} className="text-[var(--secondary)]" />
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5">
          {/* Create Request */}
          <Link
            href="/client/requests/new"
            className="bg-[var(--primary)] border-4 border-[var(--primary)] neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all p-4 lg:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[var(--primary-container)] border-2 border-[var(--primary-container)] flex items-center justify-center shrink-0">
                <Icon name="add_circle" filled size={28} className="text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base lg:text-lg font-bold text-white font-headline">
                  Nueva Solicitud
                </h3>
                <p className="text-xs lg:text-sm text-white/80">
                  Describe lo que necesitas
                </p>
              </div>
            </div>
          </Link>

          {/* Emergency Service */}
          <Link
            href="/client/requests/new?urgency=emergency"
            className="bg-[var(--error-container)] border-4 border-[var(--error)] shadow-[4px_4px_0px_0px_var(--error)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--error)] transition-all p-4 lg:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[var(--error)] border-2 border-[var(--error)] flex items-center justify-center shrink-0">
                <Icon name="emergency" filled size={28} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base lg:text-lg font-bold text-[var(--error)] font-headline">
                  Servicio Urgente
                </h3>
                <p className="text-xs lg:text-sm text-[var(--error)]/80">
                  Respuesta prioritaria
                </p>
              </div>
            </div>
          </Link>

          {/* View My Requests */}
          <Link
            href="/client/requests"
            className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all p-4 lg:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center shrink-0">
                <Icon name="receipt_long" filled size={28} className="text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base lg:text-lg font-bold text-[var(--primary)] font-headline">
                  Mis Solicitudes
                </h3>
                <p className="text-xs lg:text-sm text-[var(--on-surface-variant)]">
                  Ver tus pedidos activos
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
