"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDepartments, useMunicipalities } from "@/hooks/use-locations"
import { useCategories } from "@/hooks/use-categories"
import { getAuthSession, updateStoredAuthUser } from "@/lib/session"
import { toast } from "@/lib/toast"
import { changePassword, getMe, logout, updateMyProfile, updateMyProviderProfile } from "@/services/auth"

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

type SelectOption = { id: string; name: string }

function CustomSelect({ value, onChange, options, placeholder, disabled = false, isLoading = false }: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  disabled?: boolean
  isLoading?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((opt) => opt.id === value)
  const displayText = isLoading ? "Cargando..." : selectedOption?.name || placeholder

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full text-left bg-[var(--surface)] border-2 px-4 py-3 text-sm transition-all flex items-center justify-between ${
          isOpen ? "border-[var(--primary)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]" : "border-[var(--primary)]/50"
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[var(--primary)]"}`}
      >
        <span className={!selectedOption ? "text-[var(--on-surface-variant)]" : "text-[var(--on-surface)]"}>
          {displayText}
        </span>
        <Icon name={isOpen ? "expand_less" : "expand_more"} size={20} className={isOpen ? "text-[var(--primary)]" : "text-[var(--on-surface-variant)]"} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--on-surface-variant)]">No hay opciones</div>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => { onChange(option.id); setIsOpen(false) }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  option.id === value
                    ? "bg-[var(--primary)]"
                    : "text-[var(--on-surface)] hover:bg-[var(--primary-container)]"
                }`}
              >
                <span className={`flex items-center gap-2 ${option.id === value ? "!text-white" : ""}`}>
                  {option.id === value && <Icon name="check" size={18} className="!text-white" />}
                  {option.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: "" }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { level: 1, label: "Débil" }
  if (score <= 2) return { level: 2, label: "Media" }
  if (score === 3) return { level: 3, label: "Buena" }
  return { level: 4, label: "Fuerte" }
}

export default function ProviderProfilePage() {
  const router = useRouter()
  const initialSession = getAuthSession()
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [fullName, setFullName] = useState(initialSession?.user.full_name || "")
  const [email] = useState(initialSession?.user.email || "")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")

  const [businessName, setBusinessName] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [yearsExperience, setYearsExperience] = useState("")
  const [providerSlug, setProviderSlug] = useState("")

  const [securityExpanded, setSecurityExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { municipalities, isLoading: loadingMunicipalities } = useMunicipalities(departmentId || null)
  const { categories, isLoading: loadingCategories } = useCategories()

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const availableSubcategories = selectedCategory?.subcategories || []
  const passwordStrength = getPasswordStrength(newPassword)
  const findSubcategoryById = (subcategoryId: string) =>
    categories.flatMap((c) => c.subcategories).find((s) => s.id === subcategoryId)

  useEffect(() => {
    const session = getAuthSession()
    if (!session?.user) { router.replace("/login?next=/provider/profile"); return }

    async function loadProfile() {
      try {
        const profile = await getMe()
        setFullName(profile.full_name || "")
        setPhone(profile.phone || "")
        setDepartmentId(profile.department_id || "")
        setMunicipalityId(profile.municipality_id || "")

        const providerProfile = profile.provider_profile
        if (providerProfile) {
          setProviderSlug(providerProfile.slug || "")
          setBusinessName(providerProfile.business_name || "")
          setDescription(providerProfile.description || "")
          const subcategoryIds = (providerProfile.categories ?? [])
            .map((item) => item.subcategory)
            .filter((s): s is NonNullable<typeof s> => Boolean(s))
            .map((s) => s.id)
          setSelectedSubcategoryIds(subcategoryIds)

          const firstMainCategoryId = (providerProfile.categories ?? [])
            .map((item) => item.subcategory?.main_category?.id)
            .find((id): id is string => Boolean(id))
          if (firstMainCategoryId) setSelectedCategoryId(firstMainCategoryId)
        }
      } catch (error) {
        toast.error("No se pudo cargar el perfil", { description: error instanceof Error ? error.message : "Intenta de nuevo más tarde." })
      } finally {
        setIsProfileLoading(false)
      }
    }
    void loadProfile()
  }, [router])

  function handleCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryIds([])
  }

  function toggleSubcategory(subcategoryId: string) {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(subcategoryId) ? prev.filter((id) => id !== subcategoryId) : [...prev, subcategoryId]
    )
  }

  function removeSubcategory(subcategoryId: string) {
    setSelectedSubcategoryIds((prev) => prev.filter((id) => id !== subcategoryId))
  }

  async function handleSaveChanges() {
    setIsSaving(true)
    try {
      const profile = await updateMyProfile({
        full_name: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        department_id: departmentId || undefined,
        municipality_id: municipalityId || undefined,
      })
      await updateMyProviderProfile({
        business_name: businessName.trim() || undefined,
        description: description.trim() || undefined,
        department_id: departmentId || undefined,
        municipality_id: municipalityId || undefined,
        subcategory_ids: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
      })
      updateStoredAuthUser((user) => ({ ...user, full_name: profile.full_name }))
      toast.success("Perfil actualizado", { description: "Los cambios se guardaron correctamente." })
    } catch (error) {
      toast.error("No se pudo actualizar el perfil", { description: error instanceof Error ? error.message : "Intenta de nuevo más tarde." })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdatePassword() {
    if (newPassword !== confirmNewPassword) { toast.error("Las contraseñas no coinciden"); return }
    if (newPassword.length < 8) { toast.error("La contraseña debe tener al menos 8 caracteres"); return }
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword })
      toast.success("Contraseña actualizada")
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("")
    } catch (error) {
      toast.error("No se pudo actualizar la contraseña", { description: error instanceof Error ? error.message : "Intenta de nuevo más tarde." })
    }
  }

  async function handleLogout() {
    await logout()
    router.replace("/login")
  }

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="fixo-loader"><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /><div className="fixo-loader-dot" /></div>
          <span className="text-label-md font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
            Cargando perfil...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl">
      {/* Header */}
      <header className="mb-8">
        <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-2">
          Configuración
        </p>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[var(--primary-container)] border-4 border-[var(--primary)] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]">
              <span className="text-4xl font-black font-headline text-[var(--primary)]">
                {(fullName || "P").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black font-headline text-[var(--primary)]">
                {fullName || "Proveedor"}
              </h1>
              <div className="flex items-center gap-2 text-label-sm font-label uppercase tracking-wider text-green-700 mt-1">
                <Icon name="verified" filled size={18} />
                Proveedor Verificado
              </div>
            </div>
          </div>
          {providerSlug && (
            <Link
              href={`/providers/${providerSlug}`}
              target="_blank"
              className="self-start flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border-2 border-[var(--primary)] text-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-colors"
            >
              <Icon name="visibility" size={18} />
              Ver perfil público
            </Link>
          )}
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal Info */}
        <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
          <h2 className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-4 pb-3 border-b-2 border-[var(--primary)]/20">
            Información Personal
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider flex items-center justify-between">
                Correo Electrónico
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 border border-green-600 text-green-800 text-[9px]">
                  <Icon name="check_circle" size={12} />
                  Verificado
                </span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 px-4 py-3 text-sm text-[var(--on-surface-variant)] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                Teléfono
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+504 9999-9999"
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                  Departamento
                </label>
                <CustomSelect
                  value={departmentId}
                  onChange={(v) => { setDepartmentId(v); setMunicipalityId("") }}
                  options={departments}
                  placeholder="Seleccione..."
                  isLoading={loadingDepartments}
                />
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                  Municipio
                </label>
                <CustomSelect
                  value={municipalityId}
                  onChange={setMunicipalityId}
                  options={municipalities}
                  placeholder="Seleccione..."
                  disabled={!departmentId}
                  isLoading={loadingMunicipalities}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Professional Info */}
        <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
          <h2 className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-4 pb-3 border-b-2 border-[var(--primary)]/20">
            Información Profesional
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Mi Negocio"
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                Categoría Principal
              </label>
              <CustomSelect
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                options={categories}
                placeholder="Selecciona categoría..."
                isLoading={loadingCategories}
              />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                Subcategorías
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedSubcategoryIds.map((subId) => {
                  const sub = findSubcategoryById(subId)
                  if (!sub) return null
                  return (
                    <span
                      key={subId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-[var(--primary)] text-[10px] font-label font-bold uppercase"
                    >
                      {sub.name}
                      <button type="button" onClick={() => removeSubcategory(subId)} className="hover:text-[var(--error)]">
                        <Icon name="close" size={14} />
                      </button>
                    </span>
                  )
                })}
                {selectedCategoryId && availableSubcategories.filter((sub) => !selectedSubcategoryIds.includes(sub.id)).length > 0 && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1 border-2 border-dashed border-[var(--primary)] text-[var(--primary)] text-[10px] font-label uppercase hover:bg-[var(--primary-container)] transition-all"
                    >
                      <Icon name="add" size={14} /> Añadir
                    </button>
                    <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] z-10 min-w-[180px] max-h-48 overflow-y-auto">
                      {availableSubcategories
                        .filter((sub) => !selectedSubcategoryIds.includes(sub.id))
                        .map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => toggleSubcategory(sub.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--primary-container)] transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                {!selectedCategoryId && (
                  <span className="text-sm text-[var(--on-surface-variant)]">Selecciona una categoría primero</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe tus servicios..."
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                Años de Experiencia
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none transition-all"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Security Section */}
      <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5 mb-6">
        <button
          type="button"
          onClick={() => setSecurityExpanded(!securityExpanded)}
          className="w-full flex justify-between items-center"
        >
          <h2 className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider flex items-center gap-2">
            <Icon name="lock" size={18} />
            Seguridad
          </h2>
          <Icon name={securityExpanded ? "expand_less" : "expand_more"} size={20} className="text-[var(--on-surface-variant)]" />
        </button>

        {securityExpanded && (
          <div className="mt-4 pt-4 border-t-2 border-[var(--primary)]/20 space-y-4">
            <p className="text-sm text-[var(--on-surface-variant)]">
              Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none transition-all"
                />
              </div>
              <div className="hidden md:block" />

              <div>
                <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none transition-all"
                />
                {newPassword && (
                  <>
                    <div className="mt-2 flex gap-1 h-1.5">
                      <div className={`flex-1 ${passwordStrength.level >= 1 ? "bg-[var(--error)]" : "bg-[var(--surface-container)]"}`} />
                      <div className={`flex-1 ${passwordStrength.level >= 2 ? "bg-[var(--primary)]" : "bg-[var(--surface-container)]"}`} />
                      <div className={`flex-1 ${passwordStrength.level >= 3 ? "bg-[var(--primary)]" : "bg-[var(--surface-container)]"}`} />
                      <div className={`flex-1 ${passwordStrength.level >= 4 ? "bg-green-500" : "bg-[var(--surface-container)]"}`} />
                    </div>
                    <span className="text-[10px] font-label text-[var(--on-surface-variant)] mt-1 block uppercase tracking-wider">
                      Fuerza: {passwordStrength.label}
                    </span>
                  </>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-label uppercase text-[var(--on-surface-variant)] mb-2 tracking-wider">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[var(--surface)] border-2 focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] outline-none transition-all ${
                    confirmNewPassword && confirmNewPassword !== newPassword
                      ? "border-[var(--error)]"
                      : "border-[var(--primary)]/50 focus:border-[var(--primary)]"
                  }`}
                />
                {confirmNewPassword && confirmNewPassword !== newPassword && (
                  <span className="text-xs text-[var(--error)] mt-1 block">Las contraseñas no coinciden</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={!currentPassword || !newPassword || newPassword !== confirmNewPassword}
                className="px-4 py-2 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
              >
                <span className="!text-white">Actualizar Contraseña</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mb-8">
        <Link
          href="/provider"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-all"
        >
          Cancelar
        </Link>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
              <span className="!text-white">Guardando...</span>
            </>
          ) : (
            <>
              <Icon name="save" size={18} className="!text-white" />
              <span className="!text-white">Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="border-t-2 border-[var(--primary)]/20 pt-6">
        <p className="text-label-sm font-label uppercase text-[var(--error)] tracking-wider mb-4">
          Zona de peligro
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-[var(--surface)] text-[var(--error)] border-4 border-[var(--error)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--error-container)] transition-all"
          >
            <Icon name="logout" size={18} />
            Cerrar Sesión
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--error)] text-white border-4 border-[var(--error)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(211,52,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(211,52,0,1)] transition-all"
          >
            <Icon name="delete_forever" size={18} />
            Eliminar Cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
