"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCategories } from "@/hooks/use-categories"
import { useCreateRequest } from "@/hooks/use-requests"
import { toast } from "@/lib/toast"
import type { MainCategory, Subcategory } from "@/types/categories"
import type { UrgencyLevel } from "@/types/requests"

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

const URGENCY_OPTIONS = [
  { id: "urgente", label: "Urgente", desc: "Lo antes posible (1-3 hrs)", icon: "bolt", color: "error" },
  { id: "esta_semana", label: "Esta semana", desc: "En los próximos 7 días", icon: "calendar_today", color: "secondary" },
  { id: "este_mes", label: "Este mes", desc: "Sin prisa (próximos 30 días)", icon: "calendar_month", color: "neutral" },
  { id: "flexible", label: "Flexible", desc: "Solo cotizando por ahora", icon: "schedule", color: "neutral" },
]

type FormData = {
  category: string | null
  subcategory: string | null
  title: string
  description: string
  address: string
  urgency: string | null
  photos: File[]
}

const REQUEST_TITLE_MIN_LENGTH = 5
const REQUEST_DESCRIPTION_MIN_LENGTH = 20
const REQUEST_ADDRESS_MAX_LENGTH = 255

const URGENCY_API_MAP: Record<string, UrgencyLevel> = {
  urgente: "emergency",
  esta_semana: "high",
  este_mes: "medium",
  flexible: "low",
}

const MIN_PHOTOS = 1
const MAX_PHOTOS = 4

function getRequestValidationMessage(formData: FormData): string | null {
  if (!formData.category || !formData.subcategory) return "Selecciona una categoría y subcategoría."
  if (formData.title.trim().length < REQUEST_TITLE_MIN_LENGTH) return `El título debe tener al menos ${REQUEST_TITLE_MIN_LENGTH} caracteres.`
  if (formData.description.trim().length < REQUEST_DESCRIPTION_MIN_LENGTH) return `La descripción debe tener al menos ${REQUEST_DESCRIPTION_MIN_LENGTH} caracteres.`
  if (!formData.address.trim()) return "Agrega la dirección del servicio."
  if (formData.address.trim().length > REQUEST_ADDRESS_MAX_LENGTH) return `La dirección no puede superar ${REQUEST_ADDRESS_MAX_LENGTH} caracteres.`
  if (formData.photos.length < MIN_PHOTOS) return "Agrega al menos una foto del problema."
  if (!formData.urgency) return "Selecciona cuándo necesitas el servicio."
  return null
}

export default function NewRequestPage() {
  const router = useRouter()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { create, isLoading: isPublishing, isUploading } = useCreateRequest()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    category: null,
    subcategory: null,
    title: "",
    description: "",
    address: "",
    urgency: null,
    photos: [],
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else router.back()
  }

  const handleCategorySelect = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId, subcategory: null })
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    setFormData({ ...formData, subcategory: subcategoryId })
    setStep(2)
  }

  const handleSubcategorySelectDesktop = (subcategoryId: string) => {
    setFormData({ ...formData, subcategory: subcategoryId })
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim().length < REQUEST_TITLE_MIN_LENGTH) {
      toast.error(`El título debe tener al menos ${REQUEST_TITLE_MIN_LENGTH} caracteres.`)
      return
    }
    if (formData.description.trim().length < REQUEST_DESCRIPTION_MIN_LENGTH) {
      toast.error(`La descripción debe tener al menos ${REQUEST_DESCRIPTION_MIN_LENGTH} caracteres.`)
      return
    }
    if (!formData.address.trim()) {
      toast.error("Agrega la dirección del servicio.")
      return
    }
    if (formData.photos.length < MIN_PHOTOS) {
      toast.error("Agrega al menos una foto del problema.")
      return
    }
    setStep(3)
  }

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newPhotos = Array.from(files).slice(0, MAX_PHOTOS - formData.photos.length)
    if (newPhotos.length === 0) {
      toast.error(`Máximo ${MAX_PHOTOS} fotos permitidas.`)
      return
    }

    setFormData({ ...formData, photos: [...formData.photos, ...newPhotos] })
    e.target.value = ""
  }

  const handleRemovePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    })
  }

  const handleUrgencySelect = (urgencyId: string) => {
    setFormData({ ...formData, urgency: urgencyId })
    setStep(4)
  }

  const handleUrgencySelectDesktop = (urgencyId: string) => {
    setFormData({ ...formData, urgency: urgencyId })
  }

  const handlePublish = async () => {
    const validationMessage = getRequestValidationMessage(formData)
    if (validationMessage) {
      toast.error(validationMessage)
      return
    }

    const urgency = URGENCY_API_MAP[formData.urgency!]
    if (!urgency) {
      toast.error("La urgencia seleccionada no es válida")
      return
    }

    const result = await create(
      {
        subcategory_id: formData.subcategory!,
        title: formData.title.trim(),
        description: formData.description.trim(),
        urgency,
        address: formData.address.trim(),
      },
      formData.photos.length > 0 ? formData.photos : undefined
    )

    if (!result) {
      toast.error("No se pudo publicar la solicitud", {
        description: "Revisa tu perfil y vuelve a intentarlo.",
      })
      return
    }

    toast.success("Solicitud publicada")
    router.push(`/client/requests/${result.id}`)
  }

  const selectedCategory = categories.find((c) => c.id === formData.category)
  const availableSubcategories = selectedCategory?.subcategories ?? []
  const selectedSubcategory = availableSubcategories.find((sub) => sub.id === formData.subcategory)
  const selectedUrgency = URGENCY_OPTIONS.find((u) => u.id === formData.urgency)
  const validationMessage = getRequestValidationMessage(formData)
  const isFormValid = validationMessage === null

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="fixo-loader"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
          <span className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
            Cargando...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--background)] min-h-screen">
      {/* MOBILE VERSION */}
      <div className="lg:hidden pb-24">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-[var(--surface)] border-b-4 border-[var(--primary)]">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center border-2 border-transparent hover:border-[var(--primary)] hover:bg-[var(--primary-container)] transition-all"
            >
              <Icon name="arrow_back" size={20} className="text-[var(--primary)]" />
            </button>
            <span className="text-label-sm font-label font-bold text-[var(--primary)] uppercase tracking-wider">
              Paso {step} de {totalSteps}
            </span>
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center border-2 border-transparent hover:border-[var(--primary)] hover:bg-[var(--primary-container)] transition-all"
            >
              <Icon name="close" size={20} className="text-[var(--primary)]" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[var(--surface-container)]">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Mobile Content */}
        <main className="p-4 pt-8">
          {step === 1 && (
            <MobileStepCategory
              categories={categories}
              selected={formData.category}
              selectedSubcategory={formData.subcategory}
              onSelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
            />
          )}
          {step === 2 && (
            <MobileStepDetails
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleDetailsSubmit}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
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
              subcategory={selectedSubcategory}
              urgency={selectedUrgency}
              onPublish={handlePublish}
              isPublishing={isPublishing}
              isUploading={isUploading}
            />
          )}
        </main>

        {/* Mobile Step Navigation */}
        <nav className="fixed bottom-0 w-full border-t-4 border-[var(--primary)] bg-[var(--surface)] z-50">
          <div className="grid grid-cols-4 px-2 py-2">
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
                className={`flex flex-col items-center justify-center py-2 transition-all ${
                  step === item.step
                    ? "bg-[var(--primary)]"
                    : item.step < step
                    ? "text-[var(--primary)] hover:bg-[var(--primary-container)]"
                    : "text-[var(--on-surface-variant)] opacity-50"
                }`}
              >
                <Icon name={item.icon} filled={step === item.step} size={20} className={step === item.step ? "!text-white" : ""} />
                <span className={`text-[9px] font-label font-bold uppercase mt-1 ${step === item.step ? "!text-white" : ""}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden lg:block">
        <main className="p-8 xl:px-16">
          <div className="grid grid-cols-5 gap-10">
            {/* Left Column - Form */}
            <div className="col-span-3 space-y-10">
              {/* Section 1: Category */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--primary)] flex items-center justify-center border-4 border-[var(--primary)] text-xl font-black font-headline">
                    <span className="!text-white">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--primary)] font-headline">
                    ¿Qué necesitas?
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`flex flex-col items-center justify-center p-5 border-4 transition-all ${
                        formData.category === cat.id
                          ? "bg-[var(--primary-container)] border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
                          : "bg-[var(--surface)] border-[var(--primary)]/50 hover:border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
                      }`}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center mb-3 border-2 ${
                        formData.category === cat.id
                          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                          : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--primary)]"
                      }`}>
                        <Icon name={cat.icon ?? "category"} size={28} />
                      </div>
                      <span className="text-label-md font-label font-bold text-[var(--primary)] uppercase text-center">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedCategory && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-[var(--primary)] font-headline mb-4">
                      ¿Qué tipo de servicio?
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableSubcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategorySelectDesktop(sub.id)}
                          className={`flex items-center gap-4 p-4 border-4 transition-all text-left ${
                            formData.subcategory === sub.id
                              ? "bg-[var(--primary-container)] border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
                              : "bg-[var(--surface)] border-[var(--primary)]/40 hover:border-[var(--primary)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)]"
                          }`}
                        >
                          <div className={`w-12 h-12 flex items-center justify-center border-2 ${
                            formData.subcategory === sub.id
                              ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                              : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--primary)]"
                          }`}>
                            <Icon name={sub.icon ?? "category"} size={24} />
                          </div>
                          <span className="text-sm font-bold text-[var(--primary)] font-headline">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Section 2: Details */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 flex items-center justify-center border-4 text-xl font-black font-headline ${
                    formData.subcategory
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                      : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--on-surface-variant)]"
                  }`}>
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--primary)] font-headline">
                    Detalles del Servicio
                  </h2>
                </div>
                <div className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md p-6 space-y-5">
                  <div>
                    <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                      Título de la tarea
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Reparación de fuga en baño"
                      className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                      Descripción detallada
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe el problema con el mayor detalle posible..."
                      rows={4}
                      className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] transition-all outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                      Dirección del servicio
                    </label>
                    <div className="relative">
                      <Icon name="location_on" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Ej: Colonia Palmira, Avenida República de Panamá"
                        className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] pl-12 pr-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider flex items-center gap-2">
                        Fotos
                        <span className="text-[var(--error)]">*</span>
                      </label>
                      <span className="text-[10px] font-label text-[var(--on-surface-variant)]">{formData.photos.length}/{MAX_PHOTOS}</span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative w-20 h-20 bg-[var(--surface)] border-2 border-[var(--primary)] overflow-hidden group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-[var(--error)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      ))}
                      {formData.photos.length < MAX_PHOTOS && (
                        <label className="w-20 h-20 bg-[var(--surface)] border-2 border-dashed border-[var(--primary)] flex flex-col items-center justify-center hover:bg-[var(--primary-container)] transition-all cursor-pointer group">
                          <Icon name="add_a_photo" size={24} className="text-[var(--primary)]" />
                          <span className="text-[8px] font-label font-bold text-[var(--primary)] uppercase mt-1">Agregar</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAddPhoto}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {formData.photos.length === 0 && (
                      <p className="text-xs text-[var(--error)] mt-2 flex items-center gap-1">
                        <Icon name="info" size={14} />
                        Requerido: agrega al menos 1 foto
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 3: Urgency */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 flex items-center justify-center border-4 text-xl font-black font-headline ${
                    formData.title && formData.description && formData.address && formData.photos.length >= MIN_PHOTOS
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                      : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--on-surface-variant)]"
                  }`}>
                    3
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--primary)] font-headline">
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
                        className={`flex items-center gap-4 p-4 border-4 transition-all text-left ${
                          isSelected
                            ? isError
                              ? "bg-[var(--error-container)] border-[var(--error)] shadow-[4px_4px_0px_0px_var(--error)]"
                              : isSecondary
                              ? "bg-[var(--secondary-container)] border-[var(--secondary)] shadow-[4px_4px_0px_0px_var(--secondary)]"
                              : "bg-[var(--primary-container)] border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
                            : "bg-[var(--surface)] border-[var(--primary)]/40 shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:border-[var(--primary)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
                        }`}
                      >
                        <div className={`w-12 h-12 flex items-center justify-center border-2 ${
                          isError
                            ? "bg-[var(--error)]/20 border-[var(--error)] text-[var(--error)]"
                            : isSelected
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                            : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--primary)]"
                        }`}>
                          <Icon name={option.icon} size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[var(--primary)] font-headline">{option.label}</p>
                          <p className="text-sm text-[var(--on-surface-variant)]">{option.desc}</p>
                        </div>
                        {isSelected && (
                          <Icon
                            name="check_circle"
                            filled
                            size={24}
                            className={isError ? "text-[var(--error)]" : isSecondary ? "text-[var(--secondary)]" : "text-[var(--primary)]"}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* Right Column - Summary */}
            <div className="col-span-2">
              <div className="sticky top-8">
                <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)] p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-[var(--primary)]/20">
                    <Icon name="receipt_long" filled size={28} className="text-[var(--secondary)]" />
                    <h3 className="text-xl font-bold text-[var(--primary)] font-headline">
                      Resumen de Solicitud
                    </h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <SummaryRow
                      label="Categoría"
                      value={selectedCategory ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[var(--primary-container)] border border-[var(--primary)] flex items-center justify-center">
                            <Icon name={selectedCategory.icon ?? "category"} size={16} className="text-[var(--primary)]" />
                          </div>
                          <div>
                            <span className="font-bold text-sm">{selectedCategory.name}</span>
                            <span className="block text-[10px] text-[var(--on-surface-variant)]">
                              {selectedSubcategory?.name ?? "Pendiente"}
                            </span>
                          </div>
                        </div>
                      ) : "No seleccionada"}
                    />
                    <SummaryRow label="Título" value={formData.title || "Sin título"} />
                    <SummaryRow
                      label="Descripción"
                      value={formData.description ? (
                        <span className="line-clamp-2 text-sm">{formData.description}</span>
                      ) : "Sin descripción"}
                    />
                    <SummaryRow label="Dirección" value={formData.address || "Sin dirección"} />
                    <SummaryRow
                      label="Fotos"
                      value={formData.photos.length > 0 ? (
                        <div className="flex gap-1">
                          {formData.photos.map((photo, i) => (
                            <div key={i} className="w-8 h-8 border border-[var(--primary)] overflow-hidden">
                              <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          <span className="text-[10px] font-label text-[var(--on-surface-variant)] self-center ml-1">
                            ({formData.photos.length}/{MAX_PHOTOS})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--error)] text-sm flex items-center gap-1">
                          <Icon name="warning" size={14} />
                          Requerido
                        </span>
                      )}
                    />
                    <SummaryRow
                      label="Urgencia"
                      value={selectedUrgency ? (
                        <span className={`inline-block px-2 py-1 text-[10px] font-label font-bold uppercase border-2 ${
                          selectedUrgency.color === "error"
                            ? "bg-[var(--error-container)] border-[var(--error)] text-[var(--error)]"
                            : selectedUrgency.color === "secondary"
                            ? "bg-[var(--secondary-container)] border-[var(--secondary)] text-[var(--secondary)]"
                            : "bg-[var(--surface-container)] border-[var(--primary)] text-[var(--primary)]"
                        }`}>
                          {selectedUrgency.label}
                        </span>
                      ) : "No seleccionada"}
                    />
                  </div>

                  <button
                    onClick={handlePublish}
                    disabled={!isFormValid || isPublishing || isUploading}
                    className={`w-full flex items-center justify-center gap-2 py-4 text-label-md font-label font-bold uppercase tracking-wider border-4 transition-all ${
                      isFormValid && !isPublishing && !isUploading
                        ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
                        : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--on-surface-variant)] cursor-not-allowed"
                    }`}
                  >
                    <Icon name="send" size={20} />
                    {isUploading ? "Subiendo fotos..." : isPublishing ? "Publicando..." : "Publicar Solicitud"}
                  </button>

                  {!isFormValid && (
                    <p className="text-xs text-center text-[var(--on-surface-variant)] mt-4">
                      {validationMessage}
                    </p>
                  )}

                  <p className="text-[10px] text-center text-[var(--on-surface-variant)] mt-6">
                    Al publicar, aceptas nuestros{" "}
                    <Link href="#" className="underline hover:text-[var(--primary)]">Términos</Link>
                    {" "}y{" "}
                    <Link href="#" className="underline hover:text-[var(--primary)]">Privacidad</Link>
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

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="pb-3 border-b border-[var(--primary)]/10">
      <p className="text-[10px] font-label font-bold uppercase text-[var(--on-surface-variant)] mb-1 tracking-wider">
        {label}
      </p>
      <div className="text-sm text-[var(--on-surface)]">
        {typeof value === "string" && !value ? (
          <span className="italic text-[var(--on-surface-variant)]">{value || "—"}</span>
        ) : value}
      </div>
    </div>
  )
}

// MOBILE STEP COMPONENTS

function MobileStepCategory({
  categories,
  selected,
  selectedSubcategory,
  onSelect,
  onSubcategorySelect,
}: {
  categories: MainCategory[]
  selected: string | null
  selectedSubcategory: string | null
  onSelect: (id: string) => void
  onSubcategorySelect: (id: string) => void
}) {
  const activeCategory = categories.find((cat) => cat.id === selected)

  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--primary)] font-headline leading-tight mb-2">
        ¿Qué necesitas?
      </h1>
      <p className="text-body-md text-[var(--on-surface-variant)] mb-6">
        Selecciona la categoría de servicio.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center justify-center p-4 border-4 transition-all ${
              selected === cat.id
                ? "bg-[var(--primary-container)] border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
                : "bg-[var(--surface)] border-[var(--primary)]/40 shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center mb-2 border-2 ${
              selected === cat.id
                ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--primary)]"
            }`}>
              <Icon name={cat.icon ?? "category"} size={24} />
            </div>
            <span className="text-[11px] font-label font-bold text-[var(--primary)] uppercase text-center">
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {activeCategory && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[var(--primary)] font-headline mb-4">
            Tipo de servicio
          </h2>
          <div className="space-y-3">
            {activeCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSubcategorySelect(sub.id)}
                className={`w-full flex items-center gap-4 p-4 border-4 transition-all text-left ${
                  selectedSubcategory === sub.id
                    ? "bg-[var(--primary-container)] border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
                    : "bg-[var(--surface)] border-[var(--primary)]/40 shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                }`}
              >
                <div className={`w-11 h-11 flex items-center justify-center border-2 shrink-0 ${
                  selectedSubcategory === sub.id
                    ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                    : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--primary)]"
                }`}>
                  <Icon name={sub.icon ?? "category"} size={22} />
                </div>
                <span className="text-sm font-bold text-[var(--primary)] font-headline">{sub.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MobileStepDetails({
  formData,
  setFormData,
  onSubmit,
  onAddPhoto,
  onRemovePhoto,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
  onSubmit: (e: React.FormEvent) => void
  onAddPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: (index: number) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--primary)] font-headline leading-tight mb-8">
        Detalles
      </h1>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
            Título
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Reparación de fuga en baño"
            className="w-full bg-[var(--surface)] border-2 border-[var(--primary)] px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] focus:shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
            required
          />
        </div>

        <div>
          <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el problema con detalle..."
            rows={4}
            className="w-full bg-[var(--surface)] border-2 border-[var(--primary)] px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none resize-none shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] focus:shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
            required
          />
        </div>

        <div>
          <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
            Dirección
          </label>
          <div className="relative">
            <Icon name="location_on" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Colonia, Calle, Referencia"
              className="w-full bg-[var(--surface)] border-2 border-[var(--primary)] pl-12 pr-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] focus:shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
              required
            />
          </div>
        </div>

        {/* Photos Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider flex items-center gap-1">
              Fotos <span className="text-[var(--error)]">*</span>
            </label>
            <span className="text-[10px] font-label text-[var(--on-surface-variant)]">{formData.photos.length}/{MAX_PHOTOS}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square bg-[var(--surface)] border-2 border-[var(--primary)] overflow-hidden">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-[var(--error)] text-white flex items-center justify-center"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
            {formData.photos.length < MAX_PHOTOS && (
              <label className="aspect-square bg-[var(--surface)] border-2 border-dashed border-[var(--primary)] flex flex-col items-center justify-center cursor-pointer active:bg-[var(--primary-container)]">
                <Icon name="add_a_photo" size={24} className="text-[var(--primary)]" />
                <span className="text-[8px] font-label font-bold text-[var(--primary)] uppercase mt-1">Agregar</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onAddPhoto}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {formData.photos.length === 0 && (
            <p className="text-xs text-[var(--error)] mt-2 flex items-center gap-1">
              <Icon name="info" size={14} />
              Agrega al menos 1 foto
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] border-4 border-[var(--primary)] py-4 text-label-md font-label font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
          >
            <span className="!text-white">Continuar</span>
            <Icon name="arrow_forward" size={20} className="!text-white" />
          </button>
        </div>
      </form>
    </div>
  )
}

function MobileStepUrgency({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--primary)] font-headline leading-tight mb-2">
        ¿Cuándo lo necesitas?
      </h1>
      <p className="text-body-md text-[var(--on-surface-variant)] mb-8">
        Selecciona el nivel de urgencia.
      </p>

      <div className="space-y-3">
        {URGENCY_OPTIONS.map((option) => {
          const isSelected = selected === option.id
          const isError = option.color === "error"
          const isSecondary = option.color === "secondary"

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full flex items-center gap-4 p-4 border-4 transition-all text-left ${
                isSelected
                  ? isError
                    ? "bg-[var(--error-container)] border-[var(--error)] shadow-[3px_3px_0px_0px_var(--error)]"
                    : isSecondary
                    ? "bg-[var(--secondary-container)] border-[var(--secondary)] shadow-[3px_3px_0px_0px_var(--secondary)]"
                    : "bg-[var(--primary-container)] border-[var(--primary)] shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
                  : "bg-[var(--surface)] border-[var(--primary)]/40 shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              }`}
            >
              <div className={`w-12 h-12 flex items-center justify-center border-2 shrink-0 ${
                isError
                  ? "bg-[var(--error)]/20 border-[var(--error)] text-[var(--error)]"
                  : isSelected
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                  : "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--primary)]"
              }`}>
                <Icon name={option.icon} size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[var(--primary)] font-headline">{option.label}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">{option.desc}</p>
              </div>
              {isSelected && (
                <Icon
                  name="check_circle"
                  filled
                  size={24}
                  className={isError ? "text-[var(--error)]" : isSecondary ? "text-[var(--secondary)]" : "text-[var(--primary)]"}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MobileStepReview({
  formData,
  category,
  subcategory,
  urgency,
  onPublish,
  isPublishing,
  isUploading,
}: {
  formData: FormData
  category: MainCategory | undefined
  subcategory: Subcategory | undefined
  urgency: typeof URGENCY_OPTIONS[0] | undefined
  onPublish: () => void | Promise<void>
  isPublishing: boolean
  isUploading: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Icon name="check_circle" filled size={36} className="text-[var(--primary)]" />
        <h1 className="text-3xl font-black text-[var(--primary)] font-headline">
          ¡Listo!
        </h1>
      </div>

      <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5 mb-8">
        <h2 className="text-lg font-bold text-[var(--primary)] font-headline pb-3 mb-4 border-b-2 border-[var(--primary)]/20">
          Resumen
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center shrink-0">
              <Icon name={category?.icon ?? "category"} size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-[10px] font-label uppercase text-[var(--on-surface-variant)]">Categoría</p>
              <p className="font-bold text-sm text-[var(--primary)]">{category?.name ?? "—"}</p>
              <p className="text-xs text-[var(--on-surface-variant)]">{subcategory?.name ?? "—"}</p>
            </div>
          </div>

          <div className="border-t border-[var(--primary)]/10 pt-4">
            <p className="text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-1">Título</p>
            <p className="font-bold text-sm text-[var(--on-surface)]">{formData.title || "—"}</p>
          </div>

          <div className="border-t border-[var(--primary)]/10 pt-4">
            <p className="text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-1">Descripción</p>
            <p className="text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container)] p-3 border-l-4 border-[var(--primary)]">
              {formData.description || "—"}
            </p>
          </div>

          <div className="border-t border-[var(--primary)]/10 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-1">Urgencia</p>
              {urgency && (
                <span className={`inline-block px-2 py-1 text-[10px] font-label font-bold uppercase border-2 ${
                  urgency.color === "error"
                    ? "bg-[var(--error-container)] border-[var(--error)] text-[var(--error)]"
                    : urgency.color === "secondary"
                    ? "bg-[var(--secondary-container)] border-[var(--secondary)] text-[var(--secondary)]"
                    : "bg-[var(--surface-container)] border-[var(--primary)] text-[var(--primary)]"
                }`}>
                  {urgency.label}
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-1">Dirección</p>
              <p className="text-sm text-[var(--on-surface)]">{formData.address || "—"}</p>
            </div>
          </div>

          {/* Photos */}
          <div className="border-t border-[var(--primary)]/10 pt-4">
            <p className="text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2">
              Fotos ({formData.photos.length})
            </p>
            {formData.photos.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {formData.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 w-16 h-16 border-2 border-[var(--primary)] overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[var(--error)]">
                <Icon name="warning" size={16} />
                <span className="text-sm font-bold">Sin fotos</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onPublish}
        disabled={isPublishing || isUploading}
        className={`w-full flex items-center justify-center gap-2 py-5 text-xl font-bold font-headline border-4 transition-all ${
          isPublishing || isUploading
            ? "bg-[var(--surface-container)] border-[var(--primary)]/30 text-[var(--on-surface-variant)] cursor-not-allowed"
            : "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
        }`}
      >
        {isUploading ? "Subiendo fotos..." : isPublishing ? "Publicando..." : "Publicar Solicitud"}
        <Icon name="send" size={24} />
      </button>

      <p className="text-xs text-center text-[var(--on-surface-variant)] mt-4">
        Al publicar, aceptas nuestros{" "}
        <Link href="#" className="underline text-[var(--primary)]">Términos</Link>
        {" "}y{" "}
        <Link href="#" className="underline text-[var(--primary)]">Privacidad</Link>
      </p>
    </div>
  )
}
