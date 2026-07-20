"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useDepartments, useMunicipalities } from "@/hooks/use-locations"
import { useCategories } from "@/hooks/use-categories"
import { useRegister } from "@/hooks/use-register"

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

// Custom Select Component with Nexum styling
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

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full text-left px-4 py-3 bg-[var(--surface)] border-4 border-[var(--primary)] transition-all flex items-center justify-between gap-2 ${
          isOpen ? "neo-shadow-md -translate-x-[2px] -translate-y-[2px]" : ""
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:neo-shadow-sm"}`}
      >
        <span className={`text-base truncate font-label ${!selectedOption ? "text-[var(--on-surface-variant)]/50" : "text-[var(--primary)]"}`}>
          {displayText}
        </span>
        <Icon
          name={isOpen ? "expand_less" : "expand_more"}
          className={`text-xl transition-transform text-[var(--primary)]`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--on-surface-variant)] bg-[var(--surface)]">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
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
                    : "bg-[var(--surface)] text-[var(--on-surface)] hover:bg-[var(--primary-container)] hover:text-[var(--primary)]"
                }`}
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
  return { level: 3, label: "Fuerte" }
}

type UserType = "client" | "provider"

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>("client")
  const [departmentId, setDepartmentId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([])

  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { categories, isLoading: loadingCategories } = useCategories()
  const { municipalities, isLoading: loadingMunicipalities } = useMunicipalities(departmentId || null)
  const { isLoading, error, submitClient, submitProvider } = useRegister()

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword

  // Get subcategories for selected category
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const availableSubcategories = selectedCategory?.subcategories || []

  // Toggle subcategory selection
  function toggleSubcategory(subcategoryId: string) {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  // Reset subcategories when category changes
  function handleCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryIds([])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!passwordsMatch) return

    const formData = new FormData(e.currentTarget)
    const baseData = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: "",
      password: password,
      department_id: departmentId,
      municipality_id: municipalityId,
    }

    if (userType === "client") {
      await submitClient(baseData)
    } else {
      await submitProvider({
        ...baseData,
        business_name: formData.get("full_name") as string,
        subcategory_ids: selectedSubcategoryIds,
      })
    }
  }

  const isFormValid =
    departmentId &&
    municipalityId &&
    password.length >= 8 &&
    passwordsMatch &&
    (userType === "client" || (selectedCategoryId && selectedSubcategoryIds.length > 0))

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--on-background)] flex flex-col md:flex-row">
      {/* Left Panel (Branding) - Desktop Only */}
      <aside className="hidden md:flex md:w-[55%] bg-[var(--primary)] flex-col justify-between p-12 relative overflow-hidden text-[var(--on-primary)] border-r-4 border-[var(--primary-container)]">
        {/* Floating Service Icons */}
        <Icon name="electrical_services" className="absolute top-[2%] right-[5%] text-[200px] text-[var(--primary-container)] opacity-25" />
        <Icon name="plumbing" className="absolute top-[10%] left-[2%] text-[180px] text-[var(--on-primary)] opacity-15" />
        <Icon name="construction" className="absolute bottom-[10%] right-[0%] text-[220px] text-[var(--primary-container)] opacity-20" />
        <Icon name="format_paint" className="absolute bottom-[0%] left-[10%] text-[160px] text-[var(--on-primary)] opacity-15" />
        <Icon name="carpenter" className="absolute top-[30%] right-[20%] text-[150px] text-[var(--primary-container)] opacity-20" />
        <Icon name="ac_unit" className="absolute top-[45%] left-[-5%] text-[190px] text-[var(--on-primary)] opacity-10" />
        <Icon name="home_repair_service" className="absolute bottom-[30%] right-[-5%] text-[170px] text-[var(--primary-container)] opacity-15" />
        <Icon name="roofing" className="absolute top-[-5%] left-[20%] text-[140px] text-[var(--on-primary)] opacity-15" />
        <Icon name="handyman" className="absolute top-[55%] right-[10%] text-[160px] text-[var(--primary-container)] opacity-20" />
        <Icon name="cleaning_services" className="absolute bottom-[45%] left-[15%] text-[130px] text-[var(--on-primary)] opacity-10" />
        <Icon name="local_shipping" className="absolute top-[20%] right-[-5%] text-[150px] text-[var(--primary-container)] opacity-15" />
        <Icon name="water_damage" className="absolute bottom-[-5%] right-[20%] text-[165px] text-[var(--on-primary)] opacity-10" />
        <Icon name="garage" className="absolute top-[65%] left-[5%] text-[140px] text-[var(--primary-container)] opacity-15" />
        <Icon name="yard" className="absolute top-[38%] left-[30%] text-[120px] text-[var(--on-primary)] opacity-10" />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <span className="text-5xl font-black text-[var(--primary-container)] font-headline tracking-tight">
            FIXO
          </span>
        </Link>

        {/* Content */}
        <div className="relative z-10 mt-auto max-w-xl">
          <h1 className="text-4xl font-black text-[var(--on-primary)] font-headline leading-[1.1] mb-6">
            Únete a la red de servicios más grande de Honduras
          </h1>
          <p className="text-lg text-[var(--primary-container)] font-body max-w-lg">
            Conecta con miles de clientes y profesionales locales en una plataforma diseñada para el mercado hondureño.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="relative z-10 flex gap-4 mt-10">
          <div className="w-16 h-1 bg-[var(--primary-container)]" />
          <div className="w-4 h-1 bg-[var(--primary-container)]" />
          <div className="w-4 h-1 bg-[var(--primary-container)]" />
        </div>
      </aside>

      {/* Right Panel (Form) */}
      <main className="w-full md:w-[45%] flex-shrink-0 min-h-screen bg-[var(--surface)] flex flex-col justify-center px-5 py-10 overflow-y-auto relative z-20">
        {/* Mobile Logo */}
        <Link href="/" className="md:hidden mb-8 flex justify-center">
          <span className="text-4xl font-black text-[var(--secondary)] font-headline tracking-tight">
            FIXO
          </span>
        </Link>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-black text-[var(--primary)] font-headline mb-2">
              Crear Cuenta
            </h2>
            <p className="text-body-md text-[var(--on-surface-variant)]">
              Elige cómo quieres usar Fixo
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[var(--error-container)] border-2 border-[var(--error)] text-[var(--on-error-container)] text-sm rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              {/* Client Option */}
              <label className="relative cursor-pointer block">
                <input
                  type="radio"
                  name="user_type"
                  value="client"
                  checked={userType === "client"}
                  onChange={() => setUserType("client")}
                  className="peer sr-only"
                />
                <div className={`h-full bg-[var(--surface-container-lowest)] border-2 rounded-tl-[32px] rounded-br-[32px] rounded-tr-[4px] rounded-bl-[4px] p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                  userType === "client"
                    ? "border-[var(--primary)] bg-[var(--surface-container)] shadow-[4px_4px_0px_0px_var(--primary)]"
                    : "border-[var(--on-surface)] hover:shadow-[4px_4px_0px_0px_var(--on-surface)]"
                }`}>
                  <Icon
                    name="person_search"
                    fill={userType === "client"}
                    className={`text-4xl ${userType === "client" ? "text-[var(--primary)]" : "text-[var(--outline)]"}`}
                  />
                  <span className="font-mono text-[10px] text-[var(--on-background)] uppercase text-center mt-1">
                    Busco Servicios
                  </span>
                </div>
              </label>

              {/* Provider Option */}
              <label className="relative cursor-pointer block">
                <input
                  type="radio"
                  name="user_type"
                  value="provider"
                  checked={userType === "provider"}
                  onChange={() => setUserType("provider")}
                  className="peer sr-only"
                />
                <div className={`h-full bg-[var(--surface-container-lowest)] border-2 rounded-tl-[32px] rounded-br-[32px] rounded-tr-[4px] rounded-bl-[4px] p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                  userType === "provider"
                    ? "border-[var(--secondary)] bg-[var(--secondary-container)]/30 shadow-[4px_4px_0px_0px_var(--secondary)]"
                    : "border-[var(--on-surface)] hover:shadow-[4px_4px_0px_0px_var(--on-surface)]"
                }`}>
                  <Icon
                    name="handyman"
                    fill={userType === "provider"}
                    className={`text-4xl ${userType === "provider" ? "text-[var(--secondary)]" : "text-[var(--outline)]"}`}
                  />
                  <span className="font-mono text-[10px] text-[var(--on-background)] uppercase text-center mt-1">
                    Ofrezco Servicios
                  </span>
                </div>
              </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                  <Icon name="person" className="text-lg" />
                  Nombre Completo
                </label>
                <div className="relative border-2 border-[var(--on-surface)] bg-[var(--surface-container-lowest)] rounded overflow-hidden focus-within:border-[var(--primary)] focus-within:shadow-[4px_4px_0px_0px_var(--primary)] focus-within:-translate-x-[2px] focus-within:-translate-y-[2px] transition-all">
                  <input
                    name="full_name"
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    required
                    className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-base text-[var(--on-background)] placeholder:text-[var(--outline)]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                  <Icon name="mail" className="text-lg" />
                  Correo Electrónico
                </label>
                <div className="relative border-2 border-[var(--on-surface)] bg-[var(--surface-container-lowest)] rounded overflow-hidden focus-within:border-[var(--primary)] focus-within:shadow-[4px_4px_0px_0px_var(--primary)] focus-within:-translate-x-[2px] focus-within:-translate-y-[2px] transition-all">
                  <input
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    required
                    autoComplete="email"
                    className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-base text-[var(--on-background)] placeholder:text-[var(--outline)]"
                  />
                </div>
              </div>

              {/* Location Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                {/* Departamento */}
                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                    <Icon name="map" className="text-lg" />
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

                {/* Municipio */}
                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                    <Icon name="location_city" className="text-lg" />
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

              {/* Provider-only: Category & Subcategories */}
              {userType === "provider" && (
                <>
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                      <Icon name="category" className="text-lg" />
                      Categoría Principal
                    </label>
                    <CustomSelect
                      value={selectedCategoryId}
                      onChange={handleCategoryChange}
                      options={categories}
                      placeholder="Selecciona tu categoría..."
                      isLoading={loadingCategories}
                                          />
                  </div>

                  {/* Subcategories Selection */}
                  {selectedCategoryId && (
                    <div className="space-y-2">
                      <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                        <Icon name="checklist" className="text-lg" />
                        Servicios que ofreces
                        <span className="text-[var(--outline)] lowercase font-normal">(selecciona al menos uno)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableSubcategories.map((sub) => {
                          const isSelected = selectedSubcategoryIds.includes(sub.id)
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => toggleSubcategory(sub.id)}
                              className={`px-3 py-2 text-sm border-2 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm transition-all ${
                                isSelected
                                  ? "bg-[var(--secondary)] text-[var(--on-secondary)] border-[var(--on-surface)] shadow-[3px_3px_0px_0px_var(--on-surface)]"
                                  : "bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] border-[var(--outline-variant)] hover:border-[var(--secondary)] hover:bg-[var(--secondary-container)]/30"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {isSelected && <Icon name="check" className="text-base" />}
                                {sub.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {selectedSubcategoryIds.length > 0 && (
                        <p className="font-mono text-[10px] text-[var(--secondary)] uppercase tracking-wider pl-1">
                          {selectedSubcategoryIds.length} servicio{selectedSubcategoryIds.length !== 1 ? "s" : ""} seleccionado{selectedSubcategoryIds.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                  <Icon name="lock" className="text-lg" />
                  Contraseña
                </label>
                <div className="relative border-2 border-[var(--on-surface)] bg-[var(--surface-container-lowest)] rounded overflow-hidden focus-within:border-[var(--primary)] focus-within:shadow-[4px_4px_0px_0px_var(--primary)] focus-within:-translate-x-[2px] focus-within:-translate-y-[2px] transition-all flex items-center pr-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-base text-[var(--on-background)] placeholder:text-[var(--outline)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors"
                  >
                    <Icon name={showPassword ? "visibility" : "visibility_off"} className="text-xl" />
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2">
                      <div className={`h-1.5 flex-1 rounded-full ${passwordStrength.level >= 1 ? "bg-[var(--error)]" : "bg-[var(--surface-dim)]"}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${passwordStrength.level >= 2 ? "bg-[var(--secondary-container)]" : "bg-[var(--surface-dim)]"}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${passwordStrength.level >= 3 ? "bg-green-500" : "bg-[var(--surface-dim)]"}`} />
                    </div>
                    <p className="font-mono text-[10px] text-[var(--outline)] uppercase tracking-wider text-right">
                      Fuerza: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-[var(--on-background)] flex items-center gap-2 pl-1">
                  <Icon name="lock_reset" className="text-lg" />
                  Confirmar Contraseña
                </label>
                <div className={`relative border-2 bg-[var(--surface-container-lowest)] rounded overflow-hidden transition-all flex items-center pr-3 ${
                  confirmPassword && !passwordsMatch
                    ? "border-[var(--error)]"
                    : "border-[var(--on-surface)] focus-within:border-[var(--primary)] focus-within:shadow-[4px_4px_0px_0px_var(--primary)] focus-within:-translate-x-[2px] focus-within:-translate-y-[2px]"
                }`}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-base text-[var(--on-background)] placeholder:text-[var(--outline)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors"
                  >
                    <Icon name={showConfirmPassword ? "visibility" : "visibility_off"} className="text-xl" />
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-[var(--error)] mt-1">Las contraseñas no coinciden</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-5 h-5 mt-0.5 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] text-[var(--primary)] focus:ring-[var(--primary)] rounded-sm cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-[var(--on-surface-variant)] cursor-pointer">
                Acepto los{" "}
                <Link href="/terms" className="text-[var(--primary)] font-semibold hover:underline underline-offset-2">
                  Términos de Servicio
                </Link>{" "}
                y{" "}
                <Link href="/privacy" className="text-[var(--primary)] font-semibold hover:underline underline-offset-2">
                  Política de Privacidad
                </Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-[var(--primary)] text-[var(--on-primary)] font-mono text-sm uppercase py-4 px-6 rounded-tl-[32px] rounded-br-[32px] rounded-tr-[4px] rounded-bl-[4px] border-2 border-[var(--on-surface)] shadow-[4px_4px_0px_0px_var(--on-surface)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_var(--on-surface)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--on-surface)]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--on-primary)] border-t-transparent rounded-full animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear Cuenta
                  <Icon name="arrow_forward" />
                </>
              )}
            </button>

          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t-2 border-[var(--primary)]/20 text-center">
            <p className="text-body-md text-[var(--on-surface-variant)]">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-label-md font-label text-[var(--secondary)] hover:text-[var(--primary)] font-bold uppercase ml-1"
              >
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
