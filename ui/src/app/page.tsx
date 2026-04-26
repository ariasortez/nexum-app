"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

// Material Symbol Icon component
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  )
}

// Smooth scroll hook
function useSmoothScroll() {
  return useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])
}

// Services data
const FEATURED_SERVICES = [
  {
    id: "electricidad",
    name: "Electricidad",
    description: "Instalaciones, reparaciones y emergencias 24/7.",
    icon: "bolt",
    price: "L. 500",
    color: "secondary",
  },
  {
    id: "plomeria",
    name: "Plomería",
    description: "Fugas, destapes y nuevas instalaciones de tuberías.",
    icon: "plumbing",
    price: "L. 450",
    color: "primary",
  },
]

const SMALL_SERVICES = [
  { id: "limpieza", name: "Limpieza", icon: "cleaning_services" },
  { id: "carpinteria", name: "Carpintería", icon: "carpenter" },
  { id: "fumigacion", name: "Fumigación", icon: "pest_control" },
  { id: "jardineria", name: "Jardinería", icon: "yard" },
]

const POPULAR_SEARCHES = ["Electricidad", "Plomería", "Limpieza"]

const PROVIDER_BENEFITS = [
  "Sin cobros ocultos",
  "Pagos seguros",
  "Soporte 24/7",
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const smoothScroll = useSmoothScroll()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    smoothScroll(e, targetId)
    setMobileMenuOpen(false)
  }

  return (
    <div className="bg-[var(--background)] text-[var(--on-background)] min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 w-full z-50 border-b-2 border-[var(--on-background)] shadow-[4px_4px_0px_0px_var(--primary-container)]">
        <div className="flex justify-between items-center w-full px-6 py-4 mx-auto max-w-7xl">
          <div className="text-2xl font-black text-[var(--primary)] tracking-tighter italic">
            Nexum
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              href="#"
              className="text-[var(--primary)] border-b-2 border-[var(--primary)] pb-1 font-bold uppercase tracking-tight text-sm hover:bg-[var(--surface-container)] px-2 py-1 transition-all"
            >
              Home
            </Link>
            <a
              href="#servicios"
              onClick={(e) => handleNavClick(e, "servicios")}
              className="text-[var(--on-surface-variant)] font-bold uppercase tracking-tight text-sm hover:text-[var(--primary)] hover:bg-[var(--surface-container)] px-2 py-1 transition-all cursor-pointer"
            >
              Servicios
            </a>
            <a
              href="#proveedores"
              onClick={(e) => handleNavClick(e, "proveedores")}
              className="text-[var(--on-surface-variant)] font-bold uppercase tracking-tight text-sm hover:text-[var(--primary)] hover:bg-[var(--surface-container)] px-2 py-1 transition-all cursor-pointer"
            >
              Ser Proveedor
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-[var(--on-surface-variant)] font-bold uppercase tracking-tight text-sm hover:text-[var(--primary)] transition-all"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-[var(--primary)] text-[var(--on-primary)] px-6 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all nx-offset-shadow-hover nx-card-border"
            >
              Comenzar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--on-background)] p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-[var(--surface)] z-50 transform transition-transform duration-300 ease-out md:hidden border-l-2 border-[var(--on-background)] shadow-[-4px_0px_0px_0px_var(--primary)] ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b-2 border-[var(--outline-variant)]">
          <span className="text-lg font-black text-[var(--primary)] tracking-tighter italic">
            Nexum
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-[var(--on-surface-variant)] hover:text-[var(--on-background)]"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="p-6 flex flex-col gap-2">
          <a
            href="#"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--on-background)] font-bold uppercase tracking-tight text-sm py-3 px-4 rounded hover:bg-[var(--surface-container)] transition-all"
          >
            Home
          </a>
          <a
            href="#servicios"
            onClick={(e) => handleNavClick(e, "servicios")}
            className="text-[var(--on-surface-variant)] font-bold uppercase tracking-tight text-sm py-3 px-4 rounded hover:bg-[var(--surface-container)] hover:text-[var(--on-background)] transition-all"
          >
            Servicios
          </a>
          <a
            href="#proveedores"
            onClick={(e) => handleNavClick(e, "proveedores")}
            className="text-[var(--on-surface-variant)] font-bold uppercase tracking-tight text-sm py-3 px-4 rounded hover:bg-[var(--surface-container)] hover:text-[var(--on-background)] transition-all"
          >
            Ser Proveedor
          </a>
        </nav>

        <div className="p-6 border-t-2 border-[var(--outline-variant)] mt-auto absolute bottom-0 left-0 right-0">
          <Link
            href="/login"
            className="block text-center text-[var(--on-surface-variant)] font-bold uppercase tracking-tight text-sm py-3 mb-3 hover:text-[var(--primary)] transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block text-center bg-[var(--primary)] text-[var(--on-primary)] px-6 py-3 rounded font-mono text-xs uppercase tracking-wider transition-all nx-card-border nx-offset-shadow"
            onClick={() => setMobileMenuOpen(false)}
          >
            Comenzar
          </Link>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-5 md:px-6 overflow-hidden">
        {/* Hero Section */}
        <section className="py-10 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative">
          <div className="z-10 relative">
            <h1 className="text-[40px] md:text-5xl lg:text-6xl font-bold text-[var(--on-background)] mb-4 leading-[1.1] tracking-[-0.04em]">
              Tu electricista de confianza,{" "}
              <span className="text-[var(--primary)] block md:inline">ahora.</span>
            </h1>
            <p className="text-base text-[var(--on-surface-variant)] mb-6 max-w-lg leading-relaxed">
              Encuentra profesionales verificados en Honduras para resolver tus
              necesidades del hogar al instante. Rápido, seguro y garantizado.
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-md mb-6">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)]"
              />
              <input
                type="text"
                placeholder="¿Qué necesitas hoy?"
                className="w-full pl-12 pr-4 py-4 bg-[var(--surface)] rounded nx-card-border text-base focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--outline-variant)]"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--primary)] text-[var(--on-primary)] px-4 py-2 rounded-sm font-mono text-xs uppercase nx-offset-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                Buscar
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider py-2">
                Populares:
              </span>
              {POPULAR_SEARCHES.map((search) => (
                <button
                  key={search}
                  className="px-3 py-1 bg-[var(--surface-container)] rounded-full font-mono text-xs text-[var(--on-surface-variant)] border border-[var(--outline-variant)] hover:bg-[var(--surface-variant)] hover:border-[var(--primary)] transition-colors cursor-pointer"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded nx-card-border overflow-hidden nx-offset-shadow nx-leaf">
            <Image
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80"
              alt="Profesional electricista trabajando"
              fill
              className="object-cover"
              priority
            />

            {/* Floating Badge */}
            <div className="absolute bottom-6 left-6 bg-[var(--surface)]/90 backdrop-blur-md p-4 rounded nx-card-border shadow-lg max-w-xs flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full bg-[var(--secondary-container)] flex items-center justify-center shrink-0 border border-[var(--on-background)]">
                <Icon name="electric_bolt" className="text-[var(--on-secondary-container)]" />
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--on-surface-variant)] uppercase">
                  Profesionales en línea
                </p>
                <p className="text-2xl font-semibold text-[var(--on-background)] leading-none tracking-[-0.02em]">
                  240+
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="servicios" className="py-10 md:py-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-semibold text-[var(--on-background)] tracking-[-0.02em]">
              Servicios Destacados
            </h2>
            <Link
              href="/services"
              className="font-mono text-xs text-[var(--primary)] uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-4"
            >
              Ver todos <Icon name="arrow_forward" className="text-base" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Large Featured Cards */}
            {FEATURED_SERVICES.map((service) => (
              <div
                key={service.id}
                className={`col-span-2 ${
                  service.color === "secondary"
                    ? "bg-[var(--secondary-container)]/20"
                    : "bg-[var(--primary-fixed)]/30"
                } p-6 rounded-xl nx-card-border nx-offset-shadow-hover transition-all cursor-pointer relative overflow-hidden group min-h-[200px] flex flex-col justify-between`}
              >
                <Icon
                  name={service.icon}
                  className={`text-6xl ${
                    service.color === "secondary"
                      ? "text-[var(--secondary)]"
                      : "text-[var(--primary)]"
                  } opacity-20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform`}
                />
                <div>
                  <div
                    className={`w-12 h-12 ${
                      service.color === "secondary"
                        ? "bg-[var(--secondary-container)]"
                        : "bg-[var(--primary-container)]"
                    } rounded flex items-center justify-center mb-4 border border-[var(--on-background)]`}
                  >
                    <Icon
                      name={service.icon}
                      className={
                        service.color === "secondary"
                          ? "text-[var(--on-secondary-container)]"
                          : "text-[var(--on-primary)]"
                      }
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-[var(--on-background)] mb-1 tracking-[-0.02em]">
                    {service.name}
                  </h3>
                  <p className="text-sm text-[var(--on-surface-variant)] max-w-[80%]">
                    {service.description}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <div className="font-mono text-xs uppercase text-[var(--on-surface-variant)]">
                    Desde <br />
                    <span className="text-xl font-semibold text-[var(--on-background)]">
                      {service.price}
                    </span>
                  </div>
                  <button className="bg-[var(--surface)] border border-[var(--on-background)] rounded-full w-10 h-10 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] transition-colors">
                    <Icon name="arrow_forward" />
                  </button>
                </div>
              </div>
            ))}

            {/* Small Service Cards */}
            {SMALL_SERVICES.map((service) => (
              <div
                key={service.id}
                className="col-span-1 bg-[var(--surface-container)] p-4 rounded-xl nx-card-border hover:bg-[var(--surface-variant)] transition-colors cursor-pointer text-center group"
              >
                <div className="w-10 h-10 mx-auto bg-[var(--surface)] rounded-full flex items-center justify-center mb-2 border border-[var(--outline-variant)] group-hover:border-[var(--primary)]">
                  <Icon
                    name={service.icon}
                    className="text-[var(--on-surface-variant)] group-hover:text-[var(--primary)]"
                  />
                </div>
                <h4 className="text-base font-semibold text-[var(--on-background)]">
                  {service.name}
                </h4>
              </div>
            ))}
          </div>
        </section>

        {/* Provider CTA Section */}
        <section id="proveedores" className="py-10 mb-10 md:py-16 md:mb-16">
          <div className="bg-[var(--primary-container)] rounded-xl nx-card-border p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden nx-offset-shadow">
            {/* Abstract BG */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] rounded-full opacity-50 blur-3xl" />

            <div className="relative z-10 max-w-lg">
              <h2 className="text-2xl font-semibold text-[var(--on-primary)] mb-2 tracking-[-0.02em]">
                ¿Eres un profesional? Únete a Nexum.
              </h2>
              <p className="text-base text-[var(--on-primary-container)] mb-4">
                Multiplica tus ingresos conectando con clientes verificados en tu
                área. Controla tus horarios y tarifas.
              </p>
              <ul className="mb-6 space-y-2">
                {PROVIDER_BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2 font-mono text-xs text-[var(--on-primary-container)]"
                  >
                    <Icon
                      name="check_circle"
                      className="text-base text-[var(--secondary-container)]"
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-block bg-[var(--surface)] text-[var(--on-background)] px-8 py-3 rounded font-mono text-xs uppercase tracking-wider transition-all nx-card-border hover:bg-[var(--surface-variant)] hover:translate-x-[-2px] hover:translate-y-[-2px] nx-offset-shadow-dark"
              >
                Regístrate Gratis
              </Link>
            </div>

            {/* Provider Image */}
            <div className="relative z-10 w-full max-w-sm hidden md:block">
              <div className="relative h-[300px] w-full rounded nx-card-border shadow-lg nx-leaf overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&q=80"
                  alt="Profesional de limpieza sonriendo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--surface-container-low)] w-full border-t-2 border-[var(--on-background)] mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto gap-6">
          <div className="text-lg font-black text-[var(--on-background)]">Nexum</div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="#"
              className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] font-mono text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] font-mono text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              Términos
            </Link>
            <Link
              href="#"
              className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] font-mono text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              Contacto
            </Link>
          </nav>

          <div className="font-mono text-xs uppercase tracking-widest text-[var(--on-surface-variant)]">
            © 2026 Nexum Honduras
          </div>
        </div>
      </footer>
    </div>
  )
}
