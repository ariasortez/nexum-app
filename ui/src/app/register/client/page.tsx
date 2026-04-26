"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, Input, Select, NexumLogo } from "@/components/ui"
import { Mail, Lock, User, Phone, ChevronLeft, MapPin } from "@/components/icons"
import { useDepartments, useMunicipalities } from "@/hooks/use-locations"
import { useRegister } from "@/hooks/use-register"

export default function ClientRegistrationPage() {
  const [departmentId, setDepartmentId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")

  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { municipalities, isLoading: loadingMunicipalities } = useMunicipalities(departmentId || null)
  const { isLoading, error, submitClient } = useRegister()

  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }))
  const municipalityOptions = municipalities.map((m) => ({ value: m.id, label: m.name }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await submitClient({
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      department_id: departmentId,
      municipality_id: municipalityId,
    })
  }

  return (
    <div className="min-h-screen bg-[var(--n-0)] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--brand-500)] p-12 flex-col justify-between">
        <NexumLogo size={20} />
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Encuentra los mejores especialistas cerca de ti
          </h1>
          <p className="text-lg text-white/80">
            Publica tu necesidad y recibe propuestas en minutos.
          </p>
        </div>
        <div className="text-sm text-white/60">
          © 2026 Nexum. Hecho en Honduras.
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 lg:p-6">
          <Link href="/register" className="flex items-center gap-1 text-[var(--n-600)] text-sm font-medium hover:text-[var(--n-900)] transition-colors">
            <ChevronLeft size={16} />
            Atrás
          </Link>
          <div className="lg:hidden">
            <NexumLogo size={16} />
          </div>
          <div className="w-16" />
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--n-900)] mb-2 lg:text-3xl">
                Crea tu cuenta
              </h1>
              <p className="text-sm text-[var(--n-500)] lg:text-base">
                Completa tus datos para publicar tu primera solicitud
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--red-50)] border border-[var(--red-500)] text-[var(--red-600)] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                name="full_name"
                label="Nombre completo"
                type="text"
                placeholder="Juan Pérez"
                leading={<User size={18} />}
                required
              />

              <Input
                name="email"
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                leading={<Mail size={18} />}
                required
              />

              <Input
                name="phone"
                label="Teléfono"
                type="tel"
                placeholder="+504 9999-9999"
                leading={<Phone size={18} />}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Departamento"
                  placeholder={loadingDepartments ? "Cargando..." : "Seleccionar"}
                  options={departmentOptions}
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value)
                    setMunicipalityId("")
                  }}
                  leading={<MapPin size={18} />}
                  disabled={loadingDepartments}
                  required
                />

                <Select
                  label="Municipio"
                  placeholder={loadingMunicipalities ? "Cargando..." : "Seleccionar"}
                  options={municipalityOptions}
                  value={municipalityId}
                  onChange={(e) => setMunicipalityId(e.target.value)}
                  disabled={!departmentId || loadingMunicipalities}
                  required
                />
              </div>

              <Input
                name="password"
                label="Contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                leading={<Lock size={18} />}
                hint="Usa letras, números y símbolos para mayor seguridad"
                required
                minLength={8}
              />

              <label className="flex items-start gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-[var(--n-300)] text-[var(--brand-500)] focus:ring-[var(--brand-500)]"
                  required
                />
                <span className="text-sm text-[var(--n-600)]">
                  Acepto los{" "}
                  <Link href="/terms" className="text-[var(--brand-600)] font-medium hover:underline">
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacy" className="text-[var(--brand-600)] font-medium hover:underline">
                    política de privacidad
                  </Link>
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2"
                disabled={isLoading || !departmentId || !municipalityId}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>

            <p className="text-center text-sm text-[var(--n-500)] mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-[var(--brand-600)] font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
