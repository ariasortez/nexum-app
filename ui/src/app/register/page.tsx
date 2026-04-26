"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
  accentColor?: "primary" | "secondary"
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  isLoading = false,
  accentColor = "primary",
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

  const accentStyles = {
    primary: {
      open: "border-[var(--primary)] shadow-[4px_4px_0px_0px_var(--primary)] -translate-x-[2px] -translate-y-[2px]",
      option: "hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)]",
      selected: "bg-[var(--primary)] text-[var(--on-primary)]",
    },
    secondary: {
      open: "border-[var(--secondary)] shadow-[4px_4px_0px_0px_var(--secondary)] -translate-x-[2px] -translate-y-[2px]",
      option: "hover:bg-[var(--secondary-container)] hover:text-[var(--on-secondary-container)]",
      selected: "bg-[var(--secondary)] text-[var(--on-secondary)]",
    },
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full text-left px-4 py-3 bg-[var(--surface-container-lowest)] border-2 rounded transition-all flex items-center justify-between gap-2 ${
          isOpen
            ? accentStyles[accentColor].open
            : "border-[var(--on-surface)]"
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`text-base truncate ${!selectedOption ? "text-[var(--outline)]" : "text-[var(--on-background)]"}`}>
          {displayText}
        </span>
        <Icon
          name={isOpen ? "expand_less" : "expand_more"}
          className={`text-xl transition-transform ${isOpen ? `text-[var(--${accentColor})]` : "text-[var(--outline)]"}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-[4px_4px_0px_0px_var(--on-surface)] max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--outline)]">
              No hay opciones disponibles
            </div>
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
                    ? accentStyles[accentColor].selected
                    : `text-[var(--on-background)] ${accentStyles[accentColor].option}`
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

// Google Icon SVG
function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
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
      <aside className="hidden md:flex md:w-[60%] bg-[var(--primary)] flex-col justify-between p-12 relative overflow-hidden text-[var(--on-primary)]">
        {/* Abstract Geometric Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-container)] rounded-full opacity-30 mix-blend-overlay" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] aspect-square bg-[var(--inverse-primary)] opacity-20 transform rotate-12 rounded-tl-[32px] rounded-br-[32px] rounded-tr-[4px] rounded-bl-[4px] border-4 border-[var(--on-primary)]" />
        <div className="absolute top-[30%] right-[10%] w-[15%] h-[15%] border-8 border-[var(--on-primary)] rounded-full opacity-20" />
        <div className="absolute bottom-[40%] left-[10%] w-[20%] aspect-square bg-[var(--surface-tint)] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[4px] rounded-br-[4px] opacity-40" />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <Image
            src="/nexum-logo-white.svg"
            alt="Nexum Logo"
            width={160}
            height={64}
            className="h-16 w-auto"
            priority
          />
        </Link>

        {/* Content */}
        <div className="relative z-10 mt-auto max-w-2xl">
          <h1 className="text-[40px] font-bold text-[var(--on-primary)] leading-[1.1] tracking-[-0.04em] mb-6">
            Únete a la red de servicios más grande de Honduras
          </h1>
          <p className="text-base text-[var(--on-primary)]/80 max-w-lg">
            Conecta con miles de clientes y profesionales locales en una plataforma diseñada para el mercado hondureño.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="relative z-10 flex gap-4 mt-10 opacity-60">
          <div className="w-16 h-1 bg-[var(--on-primary)] rounded-full" />
          <div className="w-4 h-1 bg-[var(--on-primary)] rounded-full" />
          <div className="w-4 h-1 bg-[var(--on-primary)] rounded-full" />
        </div>
      </aside>

      {/* Right Panel (Form) */}
      <main className="w-full md:w-[40%] flex-shrink-0 min-h-screen bg-[var(--surface)] flex flex-col justify-center px-5 py-10 overflow-y-auto relative z-20 md:shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
        {/* Mobile Logo */}
        <Link href="/" className="md:hidden mb-8 flex justify-center">
          <Image
            src="/nexum-logo.svg"
            alt="Nexum Logo"
            width={120}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[var(--on-background)] tracking-[-0.02em] mb-1">
              Crear Cuenta
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Elige cómo quieres usar Nexum
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
                    accentColor="primary"
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
                    accentColor="primary"
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
                      accentColor="secondary"
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

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t-2 border-[var(--surface-variant)]" />
              <span className="flex-shrink-0 mx-4 font-mono text-xs text-[var(--outline)] uppercase tracking-wider">
                o regístrate con
              </span>
              <div className="flex-grow border-t-2 border-[var(--surface-variant)]" />
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full bg-[var(--surface-container-lowest)] border-2 border-[var(--on-surface)] rounded py-3 px-4 font-mono text-xs uppercase text-[var(--on-background)] hover:bg-[var(--surface-container-low)] transition-colors flex justify-center items-center gap-3"
            >
              <GoogleIcon className="w-5 h-5" />
              Google
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-[var(--on-surface-variant)]">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-[var(--on-background)] font-bold hover:text-[var(--primary)] transition-colors border-b-2 border-[var(--on-background)] hover:border-[var(--primary)] pb-0.5 ml-1"
            >
              Inicia Sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
