"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

// Categories data
const CATEGORIES = [
  { id: "plomeria", name: "Plomería", icon: "plumbing", color: "primary" },
  { id: "electricidad", name: "Electricidad", icon: "electric_bolt", color: "secondary" },
  { id: "limpieza", name: "Limpieza", icon: "cleaning_services", color: "tertiary" },
  { id: "carpinteria", name: "Carpintería", icon: "carpenter", color: "primary" },
  { id: "pintura", name: "Pintura", icon: "format_paint", color: "secondary" },
  { id: "electrodomesticos", name: "Electrodomésticos", icon: "kitchen", color: "tertiary" },
]

// Urgency options
const URGENCY_OPTIONS = [
  {
    id: "urgente",
    label: "Urgente",
    desc: "Lo antes posible (1-3 hrs)",
    icon: "bolt",
    color: "error",
  },
  {
    id: "esta_semana",
    label: "Esta semana",
    desc: "En los próximos 7 días",
    icon: "calendar_today",
    color: "secondary",
  },
  {
    id: "este_mes",
    label: "Este mes",
    desc: "Sin prisa (próximos 30 días)",
    icon: "calendar_month",
    color: "surface",
  },
  {
    id: "flexible",
    label: "Flexible",
    desc: "Solo cotizando por ahora",
    icon: "schedule",
    color: "surface",
  },
]

type FormData = {
  category: string | null
  title: string
  description: string
  address: string
  urgency: string | null
}

export default function NewRequestPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    category: null,
    title: "",
    description: "",
    address: "",
    urgency: null,
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId })
    setStep(2)
  }

  const handleCategorySelectDesktop = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId })
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handleUrgencySelect = (urgencyId: string) => {
    setFormData({ ...formData, urgency: urgencyId })
    setStep(4)
  }

  const handleUrgencySelectDesktop = (urgencyId: string) => {
    setFormData({ ...formData, urgency: urgencyId })
  }

  const handlePublish = () => {
    // TODO: Submit to API
    console.log("Publishing:", formData)
    router.push("/client")
  }

  const selectedCategory = CATEGORIES.find((c) => c.id === formData.category)
  const selectedUrgency = URGENCY_OPTIONS.find((u) => u.id === formData.urgency)

  const isFormValid = formData.category && formData.title && formData.description && formData.address && formData.urgency

  return (
    <div className="bg-[var(--background)] text-[var(--on-background)] min-h-screen">
      {/* ============================================= */}
      {/* MOBILE VERSION - Step by Step Wizard */}
      {/* ============================================= */}
      <div className="lg:hidden pb-24">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-[var(--surface)] border-b-2 border-[var(--on-background)]">
          <div className="flex items-center justify-between px-5 h-16">
            <button
              onClick={handleBack}
              className="flex items-center justify-center p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
            >
              <Icon name="arrow_back" />
            </button>
            <div className="text-center flex-1">
              <span className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-widest">
                PASO {step} DE {totalSteps}
              </span>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center p-2 rounded-full hover:bg-[var(--surface-variant)] transition-colors"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[var(--surface-container-high)]">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Mobile Main Content */}
        <main className="px-5 py-10">
          {step === 1 && (
            <MobileStepCategory
              selected={formData.category}
              onSelect={handleCategorySelect}
            />
          )}

          {step === 2 && (
            <MobileStepDetails
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleDetailsSubmit}
            />
          )}

          {step === 3 && (
            <MobileStepUrgency
              selected={formData.urgency}
              onSelect={handleUrgencySelect}
            />
          )}

          {step === 4 && (
            <MobileStepReview
              formData={formData}
              category={selectedCategory}
              urgency={selectedUrgency}
              onPublish={handlePublish}
            />
          )}
        </main>

        {/* Mobile Bottom Step Navigation */}
        <nav className="fixed bottom-0 w-full border-t-2 border-[var(--on-surface)] bg-white/80 backdrop-blur-md z-50 flex justify-around items-center px-4 py-2">
          {[
            { step: 1, icon: "category", label: "Categoría" },
            { step: 2, icon: "edit_note", label: "Detalles" },
            { step: 3, icon: "bolt", label: "Urgencia" },
            { step: 4, icon: "fact_check", label: "Revisar" },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => item.step < step && setStep(item.step)}
              disabled={item.step > step}
              className={`flex flex-col items-center justify-center p-2 transition-all ${
                step === item.step
                  ? "bg-[var(--primary)] text-[var(--on-primary)] rounded-tr-2xl rounded-bl-2xl"
                  : item.step < step
                  ? "text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
                  : "text-[var(--outline)] opacity-50"
              }`}
            >
              <Icon name={item.icon} fill={step === item.step} className="mb-1" />
              <span className="font-mono text-[10px] uppercase font-bold">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* ============================================= */}
      {/* DESKTOP VERSION - Single Page Form */}
      {/* ============================================= */}
      <div className="hidden lg:block">
        {/* Desktop Main Content - Full width */}
        <main className="px-8 xl:px-16 py-10">
          <div className="grid grid-cols-5 gap-10">
            {/* Left Column - Form */}
            <div className="col-span-3 space-y-12">
              {/* Section 1: Category */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-lg border-2 border-[var(--on-background)]">
                    1
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">
                    ¿Qué necesitas?
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelectDesktop(cat.id)}
                      className={`group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        formData.category === cat.id
                          ? "bg-[var(--primary-container)] border-[var(--primary)] shadow-[3px_3px_0px_0px_var(--primary)]"
                          : "bg-[var(--surface-container-low)] border-[var(--on-background)] hover:bg-[var(--surface-variant)] shadow-[3px_3px_0px_0px_var(--on-background)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--on-background)]"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                        formData.category === cat.id
                          ? "bg-[var(--primary)] text-[var(--on-primary)]"
                          : "bg-[var(--surface-container-high)] group-hover:bg-[var(--on-background)] group-hover:text-[var(--surface)]"
                      }`}>
                        <Icon name={cat.icon} className="text-2xl" />
                      </div>
                      <span className="text-sm font-medium text-center">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Section 2: Details */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-[var(--on-background)] ${
                    formData.category
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
                      : "bg-[var(--surface-container)] text-[var(--outline)]"
                  }`}>
                    2
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">
                    Detalles del Servicio
                  </h2>
                </div>
                <div className="space-y-5 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-background)] rounded-xl p-6 shadow-[4px_4px_0px_0px_var(--surface-variant)]">
                  {/* Title */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="title-desktop"
                      className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider"
                    >
                      Título de la tarea
                    </label>
                    <input
                      id="title-desktop"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Reparación de fuga en baño"
                      className="w-full bg-transparent border-0 border-b-2 border-[var(--outline-variant)] px-0 py-2 text-base text-[var(--on-background)] focus:ring-0 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--outline)] outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="description-desktop"
                      className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider"
                    >
                      Descripción detallada
                    </label>
                    <textarea
                      id="description-desktop"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe el problema con el mayor detalle posible..."
                      rows={3}
                      className="w-full bg-transparent border-0 border-b-2 border-[var(--outline-variant)] px-0 py-2 text-base text-[var(--on-background)] focus:ring-0 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--outline)] resize-none outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="address-desktop"
                      className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider"
                    >
                      Dirección del servicio
                    </label>
                    <div className="relative w-full">
                      <Icon
                        name="location_on"
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--outline)]"
                      />
                      <input
                        id="address-desktop"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Ej: Colonia Palmira, Avenida República de Panamá"
                        className="w-full bg-transparent border-0 border-b-2 border-[var(--outline-variant)] pl-8 pr-0 py-2 text-base text-[var(--on-background)] focus:ring-0 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--outline)] outline-none"
                      />
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider">
                        Fotos (Opcional)
                      </label>
                      <span className="font-mono text-xs text-[var(--outline)]">Max 4</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="w-20 h-20 bg-[var(--surface)] border-2 border-dashed border-[var(--outline-variant)] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] transition-colors group"
                      >
                        <Icon
                          name="add_a_photo"
                          className="text-[var(--outline)] group-hover:text-[var(--primary)] transition-colors text-xl"
                        />
                      </button>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-20 h-20 bg-[var(--surface-container-lowest)] border-2 border-dashed border-[var(--surface-variant)] rounded-lg flex items-center justify-center opacity-40"
                        >
                          <Icon name="image" className="text-[var(--surface-variant)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Urgency */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-[var(--on-background)] ${
                    formData.title && formData.description && formData.address
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
                      : "bg-[var(--surface-container)] text-[var(--outline)]"
                  }`}>
                    3
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">
                    ¿Cuándo lo necesitas?
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {URGENCY_OPTIONS.map((option) => {
                    const isSelected = formData.urgency === option.id
                    const isError = option.color === "error"
                    const isSecondary = option.color === "secondary"

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleUrgencySelectDesktop(option.id)}
                        className={`flex items-center p-4 border-2 border-[var(--on-surface)] rounded-xl transition-all text-left ${
                          isSelected
                            ? isError
                              ? "bg-[var(--error-container)] shadow-[3px_3px_0px_0px_var(--error)]"
                              : isSecondary
                              ? "bg-[var(--secondary-container)]/50 shadow-[3px_3px_0px_0px_var(--secondary)]"
                              : "bg-[var(--primary-container)]/30 shadow-[3px_3px_0px_0px_var(--primary)]"
                            : isError
                            ? "bg-[var(--error-container)]/20 hover:bg-[var(--error-container)]/40 shadow-[3px_3px_0px_0px_var(--on-background)]"
                            : isSecondary
                            ? "bg-[var(--secondary-container)]/20 hover:bg-[var(--secondary-container)]/40 shadow-[3px_3px_0px_0px_var(--on-background)]"
                            : "bg-[var(--surface)] hover:bg-[var(--surface-variant)] shadow-[3px_3px_0px_0px_var(--on-background)]"
                        } hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--on-background)]`}
                      >
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            isError
                              ? "bg-[var(--error)]/20"
                              : "bg-[var(--surface-variant)]"
                          }`}
                        >
                          <Icon
                            name={option.icon}
                            className={isError ? "text-[var(--error)]" : "text-[var(--on-surface)]"}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="text-base font-semibold">
                            {option.label}
                          </div>
                          <div className="text-xs text-[var(--on-surface-variant)]">
                            {option.desc}
                          </div>
                        </div>
                        {isSelected && (
                          <Icon
                            name="check_circle"
                            fill
                            className={`ml-2 ${
                              isError
                                ? "text-[var(--error)]"
                                : isSecondary
                                ? "text-[var(--secondary)]"
                                : "text-[var(--primary)]"
                            }`}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* Right Column - Summary Sidebar */}
            <div className="col-span-2">
              <div className="sticky top-8">
                <div className="bg-[var(--surface-container-lowest)] border-2 border-[var(--on-background)] nx-leaf shadow-[4px_4px_0px_0px_var(--primary)] p-8">
                  <h3 className="text-xl font-semibold mb-6 pb-4 border-b-2 border-[var(--surface-variant)] flex items-center gap-3">
                    <Icon name="receipt_long" className="text-[var(--primary)] text-2xl" />
                    Resumen de Solicitud
                  </h3>

                  <div className="space-y-5 mb-8">
                    {/* Category */}
                    <div className="pb-4 border-b border-[var(--surface-variant)]">
                      <p className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider mb-2">
                        Categoría
                      </p>
                      {selectedCategory ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--primary-container)] flex items-center justify-center border border-[var(--primary)]">
                            <Icon name={selectedCategory.icon} className="text-[var(--on-primary-container)] text-xl" />
                          </div>
                          <span className="font-semibold text-base">{selectedCategory.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--outline)] italic">No seleccionada</span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="pb-4 border-b border-[var(--surface-variant)]">
                      <p className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider mb-2">
                        Título
                      </p>
                      <p className="text-base font-medium">
                        {formData.title || <span className="text-[var(--outline)] italic">Sin título</span>}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="pb-4 border-b border-[var(--surface-variant)]">
                      <p className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider mb-2">
                        Descripción
                      </p>
                      <p className="text-sm text-[var(--on-surface-variant)] line-clamp-3">
                        {formData.description || <span className="text-[var(--outline)] italic">Sin descripción</span>}
                      </p>
                    </div>

                    {/* Address */}
                    <div className="pb-4 border-b border-[var(--surface-variant)]">
                      <p className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider mb-2">
                        Dirección
                      </p>
                      <p className="text-sm">
                        {formData.address || <span className="text-[var(--outline)] italic">Sin dirección</span>}
                      </p>
                    </div>

                    {/* Urgency */}
                    <div>
                      <p className="font-mono text-xs text-[var(--outline)] uppercase tracking-wider mb-2">
                        Urgencia
                      </p>
                      {selectedUrgency ? (
                        <span
                          className={`inline-block font-mono text-sm px-3 py-1.5 border-2 border-[var(--on-background)] uppercase ${
                            selectedUrgency.color === "error"
                              ? "bg-[var(--error-container)] text-[var(--on-error-container)]"
                              : selectedUrgency.color === "secondary"
                              ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]"
                              : "bg-[var(--surface-variant)] text-[var(--on-surface)]"
                          }`}
                        >
                          {selectedUrgency.label}
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--outline)] italic">No seleccionada</span>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handlePublish}
                    disabled={!isFormValid}
                    className={`w-full py-5 text-lg font-semibold border-2 border-[var(--on-background)] transition-all flex justify-center items-center gap-3 ${
                      isFormValid
                        ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-[4px_4px_0px_0px_var(--on-background)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--on-background)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        : "bg-[var(--surface-variant)] text-[var(--outline)] cursor-not-allowed"
                    }`}
                  >
                    <Icon name="send" className="text-xl" />
                    Publicar Solicitud
                  </button>

                  {!isFormValid && (
                    <p className="text-sm text-center text-[var(--outline)] mt-4">
                      Completa todos los campos para publicar
                    </p>
                  )}

                  <p className="text-xs text-center text-[var(--outline)] mt-6">
                    Al publicar, aceptas nuestros{" "}
                    <Link href="#" className="underline hover:text-[var(--primary)]">
                      Términos de Servicio
                    </Link>{" "}
                    y{" "}
                    <Link href="#" className="underline hover:text-[var(--primary)]">
                      Política de Privacidad
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// =============================================
// MOBILE STEP COMPONENTS
// =============================================

// Step 1: Category Selection (Mobile)
function MobileStepCategory({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[40px] font-bold text-[var(--on-background)] leading-[1.1] tracking-[-0.04em] mb-2">
          ¿Qué necesitas arreglar?
        </h1>
        <p className="text-base text-[var(--on-surface-variant)]">
          Selecciona la categoría de servicio que mejor describa tu problema.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`group flex flex-col items-center justify-center p-4 bg-[var(--surface-container-low)] rounded-2xl border-2 border-[var(--on-background)] shadow-[4px_4px_0px_0px_var(--on-background)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${
              cat.color === "primary"
                ? "hover:bg-[var(--primary-fixed)] active:bg-[var(--primary-container)]"
                : cat.color === "secondary"
                ? "hover:bg-[var(--secondary-fixed)] active:bg-[var(--secondary-container)]"
                : "hover:bg-[var(--tertiary-fixed)] active:bg-[var(--tertiary-container)]"
            } ${selected === cat.id ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]" : ""}`}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--surface-container-high)] flex items-center justify-center mb-2 group-hover:bg-[var(--on-background)] group-hover:text-[var(--surface)] transition-colors">
              <Icon name={cat.icon} className="text-3xl" />
            </div>
            <span className="text-base font-semibold text-center">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 2: Details Form (Mobile)
function MobileStepDetails({
  formData,
  setFormData,
  onSubmit,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div>
      <h1 className="text-[40px] font-bold text-[var(--on-background)] leading-[1.1] tracking-[-0.04em] mb-10">
        Detalles de Solicitud
      </h1>

      <form className="space-y-6" onSubmit={onSubmit}>
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="title"
            className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider"
          >
            Título de la tarea
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Reparación de fuga en baño"
            className="w-full bg-transparent border-0 border-b-2 border-[var(--on-background)] px-0 py-2 text-base text-[var(--on-background)] focus:ring-0 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--outline)] outline-none"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="description"
            className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider"
          >
            Descripción detallada
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el problema o lo que necesitas que se haga con el mayor detalle posible..."
            rows={4}
            className="w-full bg-transparent border-0 border-b-2 border-[var(--on-background)] px-0 py-2 text-base text-[var(--on-background)] focus:ring-0 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--outline)] resize-none outline-none"
            required
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="address"
            className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider"
          >
            Dirección del servicio
          </label>
          <div className="relative w-full">
            <Icon
              name="location_on"
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--outline)]"
            />
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ej: Colonia Palmira, Avenida República de Panamá"
              className="w-full bg-transparent border-0 border-b-2 border-[var(--on-background)] pl-8 pr-0 py-2 text-base text-[var(--on-background)] focus:ring-0 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--outline)] outline-none"
              required
            />
          </div>
        </div>

        {/* Photos */}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex justify-between items-end mb-1">
            <label className="font-mono text-xs text-[var(--on-surface-variant)] uppercase tracking-wider">
              Fotos (Opcional)
            </label>
            <span className="font-mono text-xs text-[var(--outline)]">Max 4</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              className="aspect-square bg-[var(--surface)] border-2 border-dashed border-[var(--outline-variant)] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] transition-colors group"
            >
              <Icon
                name="add_a_photo"
                className="text-[var(--outline)] group-hover:text-[var(--primary)] transition-colors"
              />
            </button>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square bg-[var(--surface-container-lowest)] border-2 border-dashed border-[var(--surface-variant)] rounded-lg flex items-center justify-center opacity-50"
              >
                <Icon name="image" className="text-[var(--surface-variant)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase py-4 px-6 border-2 border-[var(--on-background)] shadow-[4px_4px_0px_0px_var(--on-background)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--on-background)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2"
          >
            Continuar
            <Icon name="arrow_forward" className="text-base" />
          </button>
        </div>
      </form>
    </div>
  )
}

// Step 3: Urgency Selection (Mobile)
function MobileStepUrgency({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-[40px] font-bold text-[var(--on-surface)] leading-[1.1] tracking-[-0.04em] mb-1">
          ¿Cuándo lo necesitas?
        </h1>
        <p className="text-base text-[var(--on-surface-variant)]">
          Selecciona el nivel de urgencia para tu solicitud.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {URGENCY_OPTIONS.map((option) => {
          const isSelected = selected === option.id
          const isError = option.color === "error"
          const isSecondary = option.color === "secondary"

          return (
            <label key={option.id} className="relative block cursor-pointer group">
              <input
                type="radio"
                name="urgency"
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                className="peer sr-only"
              />
              <div
                className={`flex items-center p-4 border-2 border-[var(--on-surface)] nx-leaf shadow-[4px_4px_0px_0px_var(--on-background)] transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_var(--on-background)] ${
                  isSelected
                    ? isError
                      ? "bg-[var(--error-container)] border-[var(--error)]"
                      : isSecondary
                      ? "bg-[var(--secondary-container)]/50 border-[var(--on-secondary-container)]"
                      : "bg-[var(--primary-container)]/20 border-[var(--primary)]"
                    : isError
                    ? "bg-[var(--error-container)]/30 hover:bg-[var(--error-container)]/50"
                    : isSecondary
                    ? "bg-[var(--secondary-container)]/30 hover:bg-[var(--surface-variant)]"
                    : "bg-[var(--surface)] hover:bg-[var(--surface-variant)]"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 border ${
                    isError
                      ? "bg-[var(--error)]/20 border-[var(--error)]/50"
                      : "bg-[var(--surface-variant)] border-[var(--on-surface)]/20"
                  }`}
                >
                  <Icon
                    name={option.icon}
                    className={isError ? "text-[var(--error)]" : "text-[var(--on-surface)]"}
                  />
                </div>
                <div className="flex-grow">
                  <div
                    className={`text-xl font-semibold mb-1 ${
                      isError && isSelected
                        ? "text-[var(--on-error-container)]"
                        : "text-[var(--on-surface)]"
                    }`}
                  >
                    {option.label}
                  </div>
                  <div
                    className={`text-sm ${
                      isError && isSelected
                        ? "text-[var(--on-error-container)]/80"
                        : "text-[var(--on-surface-variant)]"
                    }`}
                  >
                    {option.desc}
                  </div>
                </div>
                <div
                  className={`flex-shrink-0 ml-2 transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-0"
                  } ${
                    isError
                      ? "text-[var(--error)]"
                      : isSecondary
                      ? "text-[var(--on-secondary-container)]"
                      : "text-[var(--primary)]"
                  }`}
                >
                  <Icon name="check_circle" fill />
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// Step 4: Review (Mobile)
function MobileStepReview({
  formData,
  category,
  urgency,
  onPublish,
}: {
  formData: FormData
  category: typeof CATEGORIES[0] | undefined
  urgency: typeof URGENCY_OPTIONS[0] | undefined
  onPublish: () => void
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Icon
          name="check_circle"
          fill
          className="text-[var(--primary)] text-4xl"
        />
        <h1 className="text-[40px] font-bold text-[var(--on-background)] leading-[1.1] tracking-[-0.04em]">
          ¡Todo listo!
        </h1>
      </div>

      {/* Summary Card */}
      <section className="bg-[var(--surface-container-lowest)] border-2 border-[var(--on-background)] nx-leaf shadow-[4px_4px_0px_0px_var(--on-background)] p-6 flex flex-col gap-4 mb-10">
        <h2 className="text-2xl font-semibold text-[var(--on-background)] border-b-2 border-[var(--surface-container-high)] pb-2 tracking-[-0.02em]">
          Resumen
        </h2>

        {/* Category */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--secondary-fixed)] flex items-center justify-center shrink-0 border-2 border-[var(--on-background)]">
            <Icon
              name={category?.icon || "category"}
              className="text-[var(--on-secondary-fixed)] text-2xl"
            />
          </div>
          <div>
            <p className="font-mono text-xs text-[var(--on-surface-variant)] uppercase mb-1">
              Categoría
            </p>
            <p className="text-base font-semibold">{category?.name || "-"}</p>
          </div>
        </div>

        {/* Title & Description */}
        <div className="border-t border-[var(--surface-container-high)] pt-4">
          <p className="font-mono text-xs text-[var(--on-surface-variant)] uppercase mb-1">
            Título
          </p>
          <p className="text-base font-semibold mb-4">
            {formData.title || "Sin título"}
          </p>

          <p className="font-mono text-xs text-[var(--on-surface-variant)] uppercase mb-1">
            Descripción
          </p>
          <p className="text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container)] p-2 border-l-2 border-[var(--primary)]">
            {formData.description || "Sin descripción"}
          </p>
        </div>

        {/* Urgency & Address */}
        <div className="border-t border-[var(--surface-container-high)] pt-4 flex flex-col gap-4">
          <div>
            <p className="font-mono text-xs text-[var(--on-surface-variant)] uppercase mb-1">
              Urgencia
            </p>
            <span
              className={`inline-block font-mono text-xs px-2 py-1 border-2 border-[var(--on-background)] uppercase ${
                urgency?.color === "error"
                  ? "bg-[var(--error-container)] text-[var(--on-error-container)]"
                  : urgency?.color === "secondary"
                  ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]"
                  : "bg-[var(--surface-variant)] text-[var(--on-surface)]"
              }`}
            >
              {urgency?.label || "-"}
            </span>
          </div>
          <div>
            <p className="font-mono text-xs text-[var(--on-surface-variant)] uppercase mb-1">
              Dirección
            </p>
            <p className="text-sm font-semibold">
              {formData.address || "Sin dirección"}
            </p>
          </div>
        </div>
      </section>

      {/* Publish Button */}
      <button
        onClick={onPublish}
        className="w-full bg-[var(--primary)] text-[var(--on-primary)] text-2xl font-semibold py-4 border-2 border-[var(--on-background)] shadow-[4px_4px_0px_0px_var(--on-background)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--on-background)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex justify-center items-center gap-2"
      >
        Publicar Solicitud
        <Icon name="send" />
      </button>

      <p className="text-sm text-center text-[var(--outline)] mt-4">
        Al publicar, aceptas nuestros{" "}
        <Link href="#" className="underline text-[var(--primary)]">
          Términos de Servicio
        </Link>{" "}
        y la{" "}
        <Link href="#" className="underline text-[var(--primary)]">
          Política de Privacidad
        </Link>
        .
      </p>
    </div>
  )
}
