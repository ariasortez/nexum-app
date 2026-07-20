"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDepartments, useMunicipalities } from "@/hooks/use-locations"
import { getAuthSession, updateStoredAuthUser } from "@/lib/session"
import { toast } from "@/lib/toast"
import { changePassword, getMe, logout, updateMyProfile } from "@/services/auth"

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
        className={`w-full text-left bg-[var(--surface)] border-2 px-4 py-3 text-body-md transition-all flex items-center justify-between ${
          isOpen
            ? "border-[var(--primary)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
            : "border-[var(--primary)]/50 hover:border-[var(--primary)]"
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed text-[var(--on-surface-variant)]" : "cursor-pointer text-[var(--on-surface)]"}`}
      >
        <span className={!selectedOption ? "text-[var(--on-surface-variant)]" : ""}>
          {displayText}
        </span>
        <Icon
          name={isOpen ? "expand_less" : "expand_more"}
          size={20}
          className={isOpen ? "text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--surface)] border-2 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--on-surface-variant)]">No hay opciones</div>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-body-md transition-colors border-b border-[var(--primary)]/10 last:border-b-0 ${
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

export default function ClientProfilePage() {
  const router = useRouter()
  const initialSession = getAuthSession()
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [fullName, setFullName] = useState(initialSession?.user.full_name || "")
  const [email] = useState(initialSession?.user.email || "")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { municipalities, isLoading: loadingMunicipalities } = useMunicipalities(departmentId || null)

  const passwordStrength = getPasswordStrength(newPassword)

  useEffect(() => {
    const session = getAuthSession()
    if (!session?.user) {
      router.replace("/login?next=/client/profile")
      return
    }

    async function loadProfile() {
      try {
        const profile = await getMe()
        setFullName(profile.full_name || "")
        setPhone(profile.phone || "")
        setDepartmentId(profile.department_id || "")
        setMunicipalityId(profile.municipality_id || "")
      } catch (error) {
        toast.error("No se pudo cargar el perfil", {
          description: error instanceof Error ? error.message : "Intenta de nuevo más tarde.",
        })
      } finally {
        setIsProfileLoading(false)
      }
    }

    void loadProfile()
  }, [router])

  async function handleSaveChanges() {
    setIsSaving(true)
    try {
      const profile = await updateMyProfile({
        full_name: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        department_id: departmentId || undefined,
        municipality_id: municipalityId || undefined,
      })

      updateStoredAuthUser((user) => ({
        ...user,
        full_name: profile.full_name,
      }))

      toast.success("Perfil actualizado", { description: "Los cambios se guardaron correctamente." })
    } catch (error) {
      toast.error("No se pudo actualizar el perfil", {
        description: error instanceof Error ? error.message : "Intenta de nuevo más tarde.",
      })
    } finally {
      setIsSaving(false)
    }
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
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      toast.success("Contraseña actualizada")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (error) {
      toast.error("No se pudo actualizar la contraseña", {
        description: error instanceof Error ? error.message : "Intenta de nuevo más tarde.",
      })
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
          <span className="text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
            Cargando perfil...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-28 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-black text-[var(--primary)] font-headline leading-tight">
          Mi Perfil
        </h1>
        <p className="text-label-sm font-label text-[var(--on-surface-variant)] mt-2 uppercase tracking-wider">
          Administra tu información personal
        </p>
      </header>

      {/* Profile Card */}
      <section className="mb-8 bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md p-6 lg:p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Avatar */}
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
              alt={fullName || "Avatar"}
              width={128}
              height={128}
              className="w-28 h-28 lg:w-32 lg:h-32 object-cover border-4 border-[var(--primary)]"
            />
            <button className="absolute -bottom-2 -right-2 bg-[var(--primary-container)] text-[var(--primary)] w-10 h-10 flex items-center justify-center border-2 border-[var(--primary)] shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)] transition-all">
              <Icon name="edit" size={18} />
            </button>
          </div>

          {/* User Info */}
          <div className="min-w-0 text-center md:text-left flex-1">
            <h2 className="text-2xl lg:text-3xl font-black text-[var(--primary)] font-headline mb-1">
              {fullName || "Cliente"}
            </h2>
            <p className="text-body-md text-[var(--on-surface-variant)] mb-3">{email}</p>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-label-sm font-label font-bold text-[var(--primary)] uppercase">
              <Icon name="person" filled size={16} />
              Cliente
            </span>
          </div>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Personal Info Card */}
        <section className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="badge" filled size={24} className="text-[var(--secondary)]" />
            <h2 className="text-xl font-bold text-[var(--primary)] font-headline">
              Información Personal
            </h2>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-body-md text-[var(--on-surface)] transition-all outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2 flex justify-between items-center">
                Correo Electrónico
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 border border-green-600 text-[10px] font-label font-bold text-green-800 uppercase">
                  <Icon name="verified" filled size={12} />
                  Verificado
                </span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 px-4 py-3 text-body-md text-[var(--on-surface-variant)] cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+504 9999-9999"
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] transition-all outline-none"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2">
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
                <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2">
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

        {/* Security Section */}
        <section className="bg-[var(--surface)] border-4 border-[var(--primary)] neo-shadow-md p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="lock" filled size={24} className="text-[var(--secondary)]" />
            <h2 className="text-xl font-bold text-[var(--primary)] font-headline">
              Seguridad
            </h2>
          </div>

          <p className="text-sm text-[var(--on-surface-variant)] mb-5">
            Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] transition-all outline-none"
              />
              {newPassword && (
                <div className="mt-3">
                  <div className="flex gap-1 h-2">
                    <div className={`h-full flex-1 ${passwordStrength.level >= 1 ? "bg-[var(--error)]" : "bg-[var(--surface-container)]"}`} />
                    <div className={`h-full flex-1 ${passwordStrength.level >= 2 ? "bg-[var(--secondary)]" : "bg-[var(--surface-container)]"}`} />
                    <div className={`h-full flex-1 ${passwordStrength.level >= 3 ? "bg-[var(--primary)]" : "bg-[var(--surface-container)]"}`} />
                    <div className={`h-full flex-1 ${passwordStrength.level >= 4 ? "bg-green-500" : "bg-[var(--surface-container)]"}`} />
                  </div>
                  <span className="text-[11px] font-label text-[var(--on-surface-variant)] mt-1 block uppercase">
                    Fuerza: {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-label-sm font-label uppercase text-[var(--on-surface-variant)] mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[var(--surface)] border-2 px-4 py-3 text-body-md text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] transition-all outline-none ${
                  confirmNewPassword && confirmNewPassword !== newPassword
                    ? "border-[var(--error)]"
                    : "border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
                }`}
              />
              {confirmNewPassword && confirmNewPassword !== newPassword && (
                <span className="text-xs text-[var(--error)] mt-1 block font-label">
                  Las contraseñas no coinciden
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={!currentPassword || !newPassword || newPassword !== confirmNewPassword}
              className="w-full bg-[var(--primary)] border-2 border-[var(--primary)] px-6 py-3 text-label-md font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(27,48,34,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
            >
              <span className="!text-white">Actualizar Contraseña</span>
            </button>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-8">
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-[var(--primary-container)] text-[var(--primary)] border-4 border-[var(--primary)] px-8 py-4 text-label-md font-label font-bold uppercase tracking-wider neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Icon name="save" filled size={20} />
              Guardar Cambios
            </>
          )}
        </button>
        <a
          href="/client"
          className="flex items-center justify-center gap-2 bg-[var(--surface)] text-[var(--primary)] border-4 border-[var(--primary)] px-8 py-4 text-label-md font-label font-bold uppercase tracking-wider neo-shadow-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="close" size={20} />
          Cancelar
        </a>
      </div>

      {/* Danger Zone */}
      <section className="border-t-4 border-[var(--error)]/30 pt-6">
        <h3 className="text-lg font-bold text-[var(--error)] font-headline mb-4 flex items-center gap-2">
          <Icon name="warning" filled size={22} />
          Zona de Peligro
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Logout - Mobile only */}
          <button
            type="button"
            onClick={handleLogout}
            className="lg:hidden flex items-center justify-center gap-2 bg-[var(--surface)] text-[var(--error)] border-2 border-[var(--error)] px-6 py-3 text-label-md font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--error)] hover:bg-[var(--error)] hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--error)] transition-all"
          >
            <Icon name="logout" size={18} />
            Cerrar Sesión
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[var(--error-container)] text-[var(--error)] border-2 border-[var(--error)] px-6 py-3 text-label-md font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--error)] hover:bg-[var(--error)] hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--error)] transition-all"
          >
            <Icon name="delete_forever" size={18} />
            Eliminar Cuenta
          </button>
        </div>
      </section>
    </div>
  )
}
