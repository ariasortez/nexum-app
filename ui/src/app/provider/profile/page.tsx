"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDepartments, useMunicipalities } from "@/hooks/use-locations"
import { useCategories } from "@/hooks/use-categories"
import { getAuthSession, clearAuthSession } from "@/lib/session"
import { toast } from "@/lib/toast"

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

// Custom Select Component
type SelectOption = { id: string; name: string }

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  disabled?: boolean
  isLoading?: boolean
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  isLoading = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.id === value)
  const displayText = isLoading ? "Cargando..." : selectedOption?.name || placeholder

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full text-left bg-transparent border-0 border-b-2 px-0 py-2 text-base transition-colors flex items-center justify-between ${
          isOpen ? "border-[var(--primary)]" : "border-[var(--on-surface)]"
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed text-[var(--outline)]" : "cursor-pointer text-[var(--on-surface)]"}`}
      >
        <span className={!selectedOption ? "text-[var(--outline)]" : ""}>
          {displayText}
        </span>
        <Icon
          name={isOpen ? "expand_less" : "expand_more"}
          className={`text-xl ${isOpen ? "text-[var(--primary)]" : "text-[var(--outline)]"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--on-surface)] max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--outline)]">No hay opciones</div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-base transition-colors ${
                  option.id === value
                    ? "bg-[var(--primary)] text-[var(--on-primary)]"
                    : "text-[var(--on-surface)] hover:bg-[var(--primary-container)]"
                } ${index === 0 ? "rounded-tl-2xl" : ""} ${index === options.length - 1 ? "rounded-br-2xl" : ""}`}
              >
                <span className="flex items-center gap-2">
                  {option.id === value && <Icon name="check" className="text-lg" />}
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

// Password strength calculator
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
  const [isSaving, setIsSaving] = useState(false)

  // Form state - Personal
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")

  // Form state - Professional
  const [businessName, setBusinessName] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [yearsExperience, setYearsExperience] = useState("")

  // Security section
  const [securityExpanded, setSecurityExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  // Data hooks
  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { municipalities, isLoading: loadingMunicipalities } = useMunicipalities(departmentId || null)
  const { categories, isLoading: loadingCategories } = useCategories()

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const availableSubcategories = selectedCategory?.subcategories || []
  const passwordStrength = getPasswordStrength(newPassword)

  // Load user data
  useEffect(() => {
    const session = getAuthSession()
    if (session?.user) {
      setFullName(session.user.full_name || "")
      setEmail(session.user.email || "")
      // TODO: Load full profile data from API
    }
  }, [])

  function handleCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryIds([])
  }

  function toggleSubcategory(subcategoryId: string) {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  function removeSubcategory(subcategoryId: string) {
    setSelectedSubcategoryIds((prev) => prev.filter((id) => id !== subcategoryId))
  }

  async function handleSaveChanges() {
    setIsSaving(true)
    // TODO: Implement API call to save profile
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Perfil actualizado", { description: "Los cambios se guardaron correctamente." })
    setIsSaving(false)
  }

  async function handleUpdatePassword() {
    if (newPassword !== confirmNewPassword) {
      toast.error("Error", { description: "Las contraseñas no coinciden." })
      return
    }
    if (newPassword.length < 8) {
      toast.error("Error", { description: "La contraseña debe tener al menos 8 caracteres." })
      return
    }
    // TODO: Implement API call to update password
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Contraseña actualizada")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
  }

  function handleLogout() {
    clearAuthSession()
    router.replace("/login")
  }

  return (
    <div className="p-5 lg:p-8">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 max-w-5xl">
        <div className="relative">
          <Image
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
            alt={fullName || "Avatar"}
            width={128}
            height={128}
            className="w-32 h-32 object-cover rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)]"
          />
          <button className="absolute bottom-0 right-0 bg-[var(--primary)] text-[var(--on-primary)] w-8 h-8 flex items-center justify-center rounded-full border-2 border-[var(--on-surface)] shadow-[2px_2px_0px_0px_var(--on-surface)] hover:bg-[var(--primary-container)] transition-colors">
            <Icon name="edit" className="text-sm" />
          </button>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-[40px] font-bold text-[var(--on-surface)] leading-[1.1] tracking-[-0.04em] mb-1">
            {fullName || "Proveedor"}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-1 text-[var(--primary)] font-mono text-xs uppercase tracking-wider">
            <Icon name="verified" fill className="text-base" />
            Proveedor Verificado
          </div>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Personal Info Card */}
        <section className="bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] p-6 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--on-surface)]">
          <h2 className="font-mono text-xs uppercase text-[var(--outline)] mb-4 tracking-wider">
            Información Personal
          </h2>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-0 px-0 py-2 text-base text-[var(--on-surface)] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1 flex justify-between items-center">
                Correo Electrónico
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-sm text-[10px] flex items-center gap-1 border border-green-800">
                  <Icon name="check_circle" className="text-xs" />
                  Verificado
                </span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-[var(--surface-container)] border-0 border-b-2 border-[var(--on-surface)] px-0 py-2 text-base text-[var(--outline)] cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+504 9999-9999"
                className="w-full bg-transparent border-0 border-b-2 border-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-0 px-0 py-2 text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-colors"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                  Departamento
                </label>
                <CustomSelect
                  value={departmentId}
                  onChange={(value) => {
                    setDepartmentId(value)
                    setMunicipalityId("")
                  }}
                  options={departments}
                  placeholder="Seleccione..."
                  isLoading={loadingDepartments}
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
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

        {/* Professional Info Card */}
        <section className="bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] p-6 rounded-tr-2xl rounded-bl-2xl rounded-tl-sm rounded-br-sm shadow-[4px_4px_0px_0px_var(--on-surface)]">
          <h2 className="font-mono text-xs uppercase text-[var(--outline)] mb-4 tracking-wider">
            Información Profesional
          </h2>
          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Mi Negocio"
                className="w-full bg-transparent border-0 border-b-2 border-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-0 px-0 py-2 text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
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

            {/* Subcategories */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-2">
                Subcategorías
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedSubcategoryIds.map((subId) => {
                  const sub = availableSubcategories.find((s) => s.id === subId)
                  if (!sub) return null
                  return (
                    <span
                      key={subId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--surface-container)] border-2 border-[var(--on-surface)] text-[var(--on-surface)] font-mono text-xs uppercase shadow-[2px_2px_0px_0px_var(--on-surface)] rounded-full"
                    >
                      {sub.name}
                      <button
                        type="button"
                        onClick={() => removeSubcategory(subId)}
                        className="hover:text-[var(--error)] transition-colors"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </span>
                  )
                })}
                {selectedCategoryId && availableSubcategories.length > selectedSubcategoryIds.length && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-transparent border-2 border-dashed border-[var(--outline)] text-[var(--outline)] font-mono text-xs uppercase rounded-full hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-colors"
                    >
                      <Icon name="add" className="text-sm" /> Añadir
                    </button>
                    <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-lg shadow-[4px_4px_0px_0px_var(--on-surface)] z-10 min-w-[180px] max-h-48 overflow-y-auto">
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
                  <span className="text-sm text-[var(--outline)]">Selecciona una categoría primero</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe tus servicios..."
                className="w-full bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-0 p-3 text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-colors rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm resize-none"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                Años de Experiencia
              </label>
              <input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full bg-transparent border-0 border-b-2 border-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-0 px-0 py-2 text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-colors"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Security Section */}
      <section className="bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] p-6 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--on-surface)] mb-6">
        <button
          type="button"
          onClick={() => setSecurityExpanded(!securityExpanded)}
          className="w-full flex justify-between items-center"
        >
          <h2 className="font-mono text-xs uppercase text-[var(--on-surface)] tracking-wider flex items-center gap-2">
            <Icon name="lock" />
            Seguridad
          </h2>
          <Icon
            name={securityExpanded ? "expand_less" : "expand_more"}
            className="text-[var(--outline)]"
          />
        </button>

        {securityExpanded && (
          <div className="mt-4 pt-4 border-t-2 border-[var(--surface-container)] space-y-4">
            <p className="text-sm text-[var(--outline)]">
              Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-0 border-b-2 border-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-0 px-0 py-2 text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-colors"
                />
              </div>
              <div className="hidden md:block" />

              <div>
                <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-transparent border-0 border-b-2 border-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-0 px-0 py-2 text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-colors"
                />
                {newPassword && (
                  <>
                    <div className="mt-2 flex gap-1 h-1 w-full">
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.level >= 1 ? "bg-[var(--error)]" : "bg-[var(--surface-container)]"}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.level >= 2 ? "bg-[var(--secondary)]" : "bg-[var(--surface-container)]"}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.level >= 3 ? "bg-[var(--primary)]" : "bg-[var(--surface-container)]"}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.level >= 4 ? "bg-green-500" : "bg-[var(--surface-container)]"}`} />
                    </div>
                    <span className="font-mono text-[10px] text-[var(--outline)] mt-1 block">
                      Fuerza: {passwordStrength.label}
                    </span>
                  </>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[var(--on-surface)] mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-transparent border-0 border-b-2 focus:ring-0 px-0 py-2 text-base text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-colors ${
                    confirmNewPassword && confirmNewPassword !== newPassword
                      ? "border-[var(--error)]"
                      : "border-[var(--on-surface)] focus:border-[var(--primary)]"
                  }`}
                />
                {confirmNewPassword && confirmNewPassword !== newPassword && (
                  <span className="text-xs text-[var(--error)] mt-1 block">
                    Las contraseñas no coinciden
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={!currentPassword || !newPassword || newPassword !== confirmNewPassword}
                className="bg-[var(--on-surface)] text-[var(--surface)] px-6 py-2 font-mono text-xs uppercase border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--outline)] hover:bg-[var(--outline)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Actualizar Contraseña
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-8">
        <Link
          href="/provider"
          className="w-full sm:w-auto px-6 py-3 bg-transparent text-[var(--on-surface)] font-mono text-xs uppercase border-2 border-[var(--on-surface)] hover:bg-[var(--surface-container)] transition-colors text-center"
        >
          Cancelar
        </Link>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 bg-[var(--primary)] text-[var(--on-primary)] font-mono text-xs uppercase border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)] hover:shadow-[2px_2px_0px_0px_var(--on-surface)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--on-primary)] border-t-transparent rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="border-t-2 border-[var(--surface-container)] pt-6 flex flex-col sm:flex-row justify-between lg:justify-end items-center gap-4">
        {/* Logout button - only on mobile (desktop has it in sidebar) */}
        <button
          type="button"
          onClick={handleLogout}
          className="lg:hidden w-full sm:w-auto px-5 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-mono text-xs uppercase tracking-wider border-2 border-[var(--on-surface)] rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm shadow-[3px_3px_0px_0px_var(--on-surface)] hover:shadow-[1px_1px_0px_0px_var(--on-surface)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
        >
          <Icon name="power_settings_new" className="text-base" />
          Cerrar Sesión
        </button>
        <button
          type="button"
          className="w-full sm:w-auto px-5 py-3 bg-[var(--error-container)] text-[var(--on-error-container)] font-mono text-xs uppercase tracking-wider border-2 border-[var(--error)] rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm shadow-[3px_3px_0px_0px_var(--error)] hover:shadow-[1px_1px_0px_0px_var(--error)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
        >
          <Icon name="delete_forever" className="text-base" />
          Eliminar Cuenta
        </button>
      </div>
    </div>
  )
}
