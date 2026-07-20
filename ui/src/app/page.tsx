"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

const HERO_ICONS = [
  { icon: "electrical_services", label: "Electricistas" },
  { icon: "plumbing", label: "Plomeros" },
  { icon: "construction", label: "Construcción" },
  { icon: "carpenter", label: "Carpinteros" },
  { icon: "ac_unit", label: "Climatización" },
  { icon: "format_paint", label: "Pintores" },
]

const SERVICES = [
  {
    id: "electricidad",
    name: "Electricistas",
    title: "Reparación e Instalación Eléctrica",
    description: "Cableado, paneles, iluminación y diagnóstico de fallas.",
    icon: "electrical_services",
    price: "Desde L. 350",
  },
  {
    id: "plomeria",
    name: "Plomeros",
    title: "Servicios de Plomería",
    description: "Fugas, destape de tuberías, instalación de sanitarios y cisternas.",
    icon: "plumbing",
    price: "Desde L. 400",
  },
  {
    id: "climatizacion",
    name: "Climatización",
    title: "Mantenimiento de A/C",
    description: "Limpieza profunda, revisión de gas refrigerante y diagnóstico.",
    icon: "ac_unit",
    price: "Desde L. 600",
    featured: true,
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("Tegucigalpa")
  const [currentIconIndex, setCurrentIconIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [displayIndex, setDisplayIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true)
      setTimeout(() => {
        setDisplayIndex((prev) => (prev + 1) % HERO_ICONS.length)
        setIsFlipping(false)
      }, 300)
      setCurrentIconIndex((prev) => (prev + 1) % HERO_ICONS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/client/services?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="bg-[var(--background)] text-[var(--on-background)] min-h-screen antialiased overflow-x-hidden">
      {/* Header */}
      <header className="bg-[var(--surface)] border-b-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] flex justify-between items-center w-full px-5 md:px-10 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-headline-lg font-headline font-bold tracking-tighter text-[var(--primary)] uppercase transform -rotate-1">
            FIXO
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-label-md font-label">
          <Link href="#servicios" className="text-[var(--secondary)] font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Explorar
          </Link>
          <Link href="#como-funciona" className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
            Cómo funciona
          </Link>
          <Link href="#nosotros" className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
            Nosotros
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" target="_blank" className="flex items-center gap-2 text-[var(--primary)] text-label-md font-label hover:text-[var(--secondary)] transition-colors">
            <Icon name="person" /> Iniciar Sesión
          </Link>
          <Link href="/register" target="_blank" className="btn-secondary">
            REGISTRARSE
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[var(--primary)] p-2"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Icon name="menu" />
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-[var(--surface)] border-l-4 border-[var(--primary)] z-50 p-6 md:hidden">
            <div className="flex justify-between items-center mb-8">
              <span className="text-headline-lg font-headline font-bold text-[var(--primary)]">FIXO</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <Icon name="close" className="text-[var(--primary)]" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              <Link href="#servicios" className="py-2 text-body-md text-[var(--on-surface)]" onClick={() => setMobileMenuOpen(false)}>
                Explorar
              </Link>
              <Link href="#como-funciona" className="py-2 text-body-md text-[var(--on-surface)]" onClick={() => setMobileMenuOpen(false)}>
                Cómo funciona
              </Link>
              <Link href="#nosotros" className="py-2 text-body-md text-[var(--on-surface)]" onClick={() => setMobileMenuOpen(false)}>
                Nosotros
              </Link>
              <hr className="my-4 border-[var(--outline-variant)]" />
              <Link href="/login" target="_blank" className="py-2 text-body-md text-[var(--on-surface-variant)]" onClick={() => setMobileMenuOpen(false)}>
                Iniciar sesión
              </Link>
              <Link href="/register" target="_blank" className="btn-secondary text-center" onClick={() => setMobileMenuOpen(false)}>
                REGISTRARSE
              </Link>
            </nav>
          </div>
        </>
      )}

      <main>
        {/* Hero Section */}
        <section className="px-5 md:px-10 lg:px-60 py-14 md:py-20 bg-[var(--surface-container-low)] border-b-4 border-[var(--primary)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          <div className="space-y-8 relative z-10 lg:flex-1">
            <h1 className="text-display text-[var(--primary)] max-w-2xl">
              ENCUENTRA EL EXPERTO QUE TU HOGAR MERECE.
            </h1>

            <p className="text-body-lg text-[var(--on-surface-variant)] max-w-xl">
              Conectamos hogares en Tegucigalpa, San Pedro Sula y todo el país con profesionales verificados, listos para trabajar.
            </p>

            {/* Search Component */}
            <form onSubmit={handleSearch} className="bg-[var(--surface)] border-4 border-[var(--primary)] p-2 flex flex-col sm:flex-row gap-2 neo-shadow-lg max-w-3xl mt-8">
              <div className="flex-1 flex items-center bg-[var(--surface)] border-2 border-transparent focus-within:border-[var(--primary)] transition-colors px-4 py-3">
                <Icon name="search" className="text-[var(--primary)] mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-label-md font-label placeholder-[var(--on-surface-variant)]/50 outline-none text-[var(--primary)]"
                  placeholder="¿Qué necesitas reparar hoy?"
                />
              </div>
              <div className="w-full sm:w-px bg-[var(--primary)]/20 sm:my-2 hidden sm:block" />
              <div className="w-44 shrink-0 flex items-center bg-[var(--surface)] border-2 border-transparent focus-within:border-[var(--primary)] transition-colors px-3 py-3 relative">
                <Icon name="location_on" className="text-[var(--primary)] mr-2" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-label-md font-label appearance-none outline-none text-[var(--primary)] cursor-pointer"
                >
                  <option>Tegucigalpa</option>
                  <option>San Pedro Sula</option>
                  <option>La Ceiba</option>
                  <option>Comayagua</option>
                </select>
                <Icon name="arrow_drop_down" className="text-[var(--primary)] absolute right-4 pointer-events-none" />
              </div>
              <button type="submit" className="btn-primary px-8 py-4">
                BUSCAR
              </button>
            </form>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--primary)] bg-[var(--surface-container)] flex items-center justify-center">
                    <Icon name="person" className="text-[var(--primary)] text-sm" />
                  </div>
                ))}
              </div>
              <p className="text-label-sm font-label text-[var(--on-surface-variant)]">
                +5,000 trabajos completados este mes
              </p>
            </div>
          </div>

          {/* Hero Icons Animation - Flip Clock Style */}
          <div className="hidden lg:block flex-shrink-0">
            {/* Brutalist frame - same style as search box */}
            <div className="bg-[var(--surface)] border-4 border-[var(--primary)] p-3 neo-shadow-lg">
              <div className="flex flex-col">
                {/* Main flip container */}
                <div className="w-96 h-80 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center overflow-hidden relative" style={{ perspective: "1000px" }}>
                  {/* Flip card content */}
                  <div
                    key={displayIndex}
                    className={`text-center ${isFlipping ? "flip-exit" : "flip-enter"}`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Icon
                      name={HERO_ICONS[displayIndex].icon}
                      filled
                      size={180}
                      className="text-[var(--primary)]"
                    />
                    <p className="text-label-md font-label text-[var(--primary)] uppercase tracking-widest mt-4">
                      {HERO_ICONS[displayIndex].label}
                    </p>
                  </div>

                  {/* Flip line decoration */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--primary)]/20 pointer-events-none" />
                </div>

                {/* Service icons row */}
                <div className="flex justify-center border-2 border-t-0 border-[var(--primary)] bg-[var(--surface)]">
                  {HERO_ICONS.map((item, idx) => (
                    <div
                      key={item.icon}
                      className={`flex-1 py-4 flex items-center justify-center transition-all duration-300 border-r-2 border-[var(--primary)] last:border-r-0 ${
                        idx === displayIndex
                          ? "bg-[var(--primary)]"
                          : "bg-[var(--surface)] hover:bg-[var(--primary-container)]"
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        filled={idx === displayIndex}
                        size={28}
                        className={idx === displayIndex ? "text-[var(--on-primary)]" : "text-[var(--primary)]"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section id="nosotros" className="px-5 md:px-10 py-12 bg-[var(--surface)] border-b-4 border-[var(--primary)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 border-2 border-[var(--primary)] bg-[var(--surface)] neo-shadow-sm hover:neo-shadow-md transition-shadow">
              <div className="bg-[var(--primary-container)] p-3 border-2 border-[var(--primary)] neo-shadow-sm flex-shrink-0">
                <Icon name="badge" className="text-[var(--primary)] text-3xl" />
              </div>
              <div>
                <h3 className="text-headline-md font-headline text-[var(--primary)] mb-2">Identidad Verificada</h3>
                <p className="text-body-md text-[var(--on-surface-variant)]">
                  Cada profesional pasa por verificación de identidad antes de poder ofrecer sus servicios.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 border-2 border-[var(--primary)] bg-[var(--surface)] neo-shadow-sm hover:neo-shadow-md transition-shadow">
              <div className="bg-[var(--secondary)] p-3 border-2 border-[var(--primary)] neo-shadow-sm flex-shrink-0">
                <Icon name="forum" className="text-[var(--on-secondary)] text-3xl" />
              </div>
              <div>
                <h3 className="text-headline-md font-headline text-[var(--primary)] mb-2">Comunicación Directa</h3>
                <p className="text-body-md text-[var(--on-surface-variant)]">
                  Contacta directamente con el profesional para cotizar y coordinar el servicio.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 border-2 border-[var(--primary)] bg-[var(--surface)] neo-shadow-sm hover:neo-shadow-md transition-shadow">
              <div className="bg-[var(--primary)] p-3 border-2 border-[var(--primary)] neo-shadow-sm flex-shrink-0">
                <Icon name="star" className="text-[var(--on-primary)] text-3xl" />
              </div>
              <div>
                <h3 className="text-headline-md font-headline text-[var(--primary)] mb-2">Reseñas Reales</h3>
                <p className="text-body-md text-[var(--on-surface-variant)]">
                  Lee opiniones de otros clientes para elegir al profesional ideal para ti.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section id="servicios" className="px-5 md:px-10 py-20 bg-[var(--surface-container-low)] border-b-4 border-[var(--primary)]">
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b-4 border-[var(--secondary)] pb-6">
            <div>
              <h2 className="text-display text-[var(--primary)] uppercase">Servicios Populares</h2>
              <p className="text-body-lg text-[var(--on-surface-variant)] mt-2">
                Los oficios más solicitados por nuestra comunidad.
              </p>
            </div>
            <Link href="/client/services" className="btn-ghost whitespace-nowrap">
              VER TODOS <Icon name="arrow_forward" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.id}
                href={`/client/services?category=${service.id}`}
                className={`group border-2 border-[var(--primary)] bg-[var(--surface)] neo-card cursor-pointer flex flex-col ${
                  service.featured ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="h-52 relative border-b-2 border-[var(--primary)] overflow-hidden bg-[var(--primary-container)] flex items-center justify-center">
                  <Icon
                    name={service.icon}
                    filled
                    size={100}
                    className="text-[var(--primary)] group-hover:scale-110 transition-transform duration-300"
                  />
                  {service.featured && (
                    <div className="absolute top-4 left-4 bg-[var(--secondary)] px-3 py-1 border-2 border-[var(--primary)] text-label-sm font-label text-[var(--on-secondary)] neo-shadow-sm uppercase">
                      Alta Demanda
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[var(--surface)] px-3 py-1 border-2 border-[var(--primary)] text-label-sm font-label text-[var(--primary)] neo-shadow-sm uppercase">
                    {service.price}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name={service.icon} className="text-[var(--secondary)]" />
                    <span className="text-label-sm font-label text-[var(--secondary)] uppercase tracking-widest">
                      {service.name}
                    </span>
                  </div>
                  <h3 className="text-headline-md font-headline text-[var(--primary)] mb-2">{service.title}</h3>
                  <p className="text-body-md text-[var(--on-surface-variant)] mb-6 mt-auto">{service.description}</p>
                  <div className="w-10 h-10 border-2 border-[var(--primary)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] transition-colors">
                    <Icon name="arrow_outward" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="px-5 md:px-10 py-20 bg-[var(--surface)] border-b-4 border-[var(--primary)] overflow-hidden relative">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-display text-[var(--primary)] uppercase">CÓMO FUNCIONA</h2>
            <p className="text-body-lg text-[var(--on-surface-variant)] mt-4 max-w-2xl mx-auto">
              Tres pasos simples para resolver cualquier problema en tu hogar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-1 border-t-4 border-dashed border-[var(--primary)]/30 z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-32 h-32 bg-[var(--primary-container)] border-4 border-[var(--primary)] neo-shadow-md mb-8 group-hover:scale-110 transition-transform flex items-center justify-center">
                <Icon name="search" filled className="text-[var(--primary)] text-6xl" />
              </div>
              <h3 className="text-headline-md font-headline text-[var(--primary)] mb-4 bg-[var(--surface)] px-4">Busca</h3>
              <p className="text-body-md text-[var(--on-surface-variant)] px-4">
                Describe lo que necesitas y encuentra perfiles verificados de profesionales locales.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-32 h-32 bg-[var(--secondary)] border-4 border-[var(--primary)] neo-shadow-md mb-8 group-hover:scale-110 transition-transform flex items-center justify-center">
                <Icon name="forum" filled className="text-[var(--on-secondary)] text-6xl" />
              </div>
              <h3 className="text-headline-md font-headline text-[var(--primary)] mb-4 bg-[var(--surface)] px-4">Contacta</h3>
              <p className="text-body-md text-[var(--on-surface-variant)] px-4">
                Envía tu solicitud, recibe cotizaciones y agenda el servicio cuando mejor te convenga.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-32 h-32 bg-[var(--primary)] border-4 border-[var(--primary)] neo-shadow-md mb-8 group-hover:scale-110 transition-transform flex items-center justify-center">
                <Icon name="handshake" filled className="text-[var(--on-primary)] text-6xl" />
              </div>
              <h3 className="text-headline-md font-headline text-[var(--primary)] mb-4 bg-[var(--surface)] px-4">Resuelve</h3>
              <p className="text-body-md text-[var(--on-surface-variant)] px-4">
                El profesional realiza el trabajo. Califica tu experiencia y ayuda a otros usuarios.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-5 md:px-10 py-20 bg-[var(--primary)] text-[var(--on-primary)] border-b-4 border-[var(--primary)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-display text-[var(--surface)] mb-6">
              ¿LISTO PARA ENCONTRAR A TU EXPERTO?
            </h2>
            <p className="text-body-lg text-[var(--surface)]/80 mb-10 max-w-2xl mx-auto">
              Miles de hogares en Honduras ya confían en Fixo para conectar con los mejores profesionales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" target="_blank" className="btn-secondary text-lg py-4 px-10">
                CREAR CUENTA GRATIS
              </Link>
              <Link href="/client/services" className="inline-flex items-center justify-center gap-2 py-4 px-10 bg-transparent border-2 border-[#F9F7F2] text-[#F9F7F2] font-label text-lg font-bold uppercase tracking-wider hover:!bg-[#F9F7F2] hover:!text-[#1B3022] transition-colors">
                EXPLORAR SERVICIOS
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--surface-container-low)] border-t-4 border-[var(--primary)] w-full py-12 px-5 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4 md:col-span-1">
            <div className="text-headline-lg font-headline font-black text-[var(--secondary)]">
              FIXO
            </div>
            <p className="text-body-md text-[var(--on-surface-variant)] max-w-xs">
              El marketplace líder de servicios para el hogar en Honduras. Calidad garantizada.
            </p>
            <div className="flex gap-3 pt-4">
              <a href="https://wa.me/50412345678" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] hover:bg-[#25D366] hover:border-[#25D366] hover:!text-white transition-colors">
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/fixohn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-[#dc2743] hover:!text-white transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/fixohn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] hover:bg-[#0077B5] hover:border-[#0077B5] hover:!text-white transition-colors">
                <LinkedInIcon className="w-5 h-5" />
              </a>
              <a href="mailto:info@fixo.hn" className="w-10 h-10 border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:!text-white transition-colors">
                <Icon name="mail" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-label-md font-label text-[var(--primary)] uppercase border-b-2 border-[var(--primary)] pb-2 inline-block">
              Compañía
            </h4>
            <ul className="space-y-2 text-body-md">
              <li><Link href="#" className="text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="#" className="text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-label-md font-label text-[var(--primary)] uppercase border-b-2 border-[var(--primary)] pb-2 inline-block">
              Navegación
            </h4>
            <ul className="space-y-2 text-body-md">
              <li><Link href="/client/services" className="text-[var(--primary)] font-bold underline hover:text-[var(--secondary)] transition-colors">Servicios</Link></li>
              <li><Link href="#" className="text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors">Ayuda</Link></li>
              <li><Link href="#" className="text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors">Términos</Link></li>
              <li><Link href="#" className="text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors">Privacidad</Link></li>
            </ul>
          </div>

          <div className="space-y-4 bg-[var(--surface)] p-6 border-2 border-[var(--primary)] neo-shadow-sm">
            <h4 className="text-headline-md font-headline text-[var(--primary)]">¿Necesitas ayuda?</h4>
            <p className="text-body-md text-[var(--on-surface-variant)]">
              Nuestro equipo de soporte está listo para asistirte.
            </p>
            <Link href="#" className="block bg-[#F9F7F2] text-[#1B3022] border-2 border-[#1B3022] w-full py-3 text-label-md font-label uppercase tracking-wider text-center hover:!bg-[#1B3022] hover:!text-[#F9F7F2] transition-colors mt-2">
              CONTÁCTANOS
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t-2 border-[var(--primary)]/20 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-label-md font-label text-[var(--on-surface-variant)] uppercase tracking-wider text-center md:text-left">
            © 2024 FIXO HONDURAS - CALIDAD GARANTIZADA
          </p>
          <div className="flex items-center gap-2">
            <span className="text-label-sm font-label text-[var(--on-surface-variant)]">Hecho con</span>
            <Icon name="favorite" filled className="text-[var(--secondary)]" />
            <span className="text-label-sm font-label text-[var(--on-surface-variant)]">en Honduras</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-[var(--surface)] border-t-4 border-[var(--primary)] py-2 px-4 shadow-[0px_-4px_0px_0px_rgba(27,48,34,1)]">
        <Link href="/client/services" className="flex flex-col items-center justify-center bg-[var(--primary-container)] text-[var(--on-primary-container)] px-4 py-1 border-2 border-[var(--primary)] neo-shadow-sm text-label-sm font-label uppercase active:scale-95 transition-transform">
          <Icon name="search" filled className="mb-1" />
          Explorar
        </Link>
        <Link href="/client/requests" className="flex flex-col items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] transition-colors p-2 text-label-sm font-label uppercase active:scale-95">
          <Icon name="assignment" className="mb-1" />
          Solicitudes
        </Link>
        <Link href="/client/messages" className="flex flex-col items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] transition-colors p-2 text-label-sm font-label uppercase active:scale-95">
          <Icon name="chat_bubble" className="mb-1" />
          Mensajes
        </Link>
        <Link href="/client/profile" className="flex flex-col items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] transition-colors p-2 text-label-sm font-label uppercase active:scale-95">
          <Icon name="person" className="mb-1" />
          Perfil
        </Link>
      </nav>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/50412345678?text=Hola%2C%20necesito%20ayuda%20con%20un%20servicio"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-3"
      >
        <span className="hidden sm:block bg-[var(--primary)] text-white text-sm font-bold font-label px-4 py-2 opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          ¡Hablemos por WhatsApp!
        </span>
        <span className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-200">
          <WhatsAppIcon className="w-7 h-7" />
        </span>
      </a>
    </div>
  )
}
