"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, Input, Select, Textarea, NexumLogo, CategorySelector } from "@/components/ui"
import { Mail, Lock, User, Phone, ChevronLeft, Check, MapPin, Briefcase } from "@/components/icons"
import { useDepartments, useMunicipalities } from "@/hooks/use-locations"
import { useCategories } from "@/hooks/use-categories"
import { useRegister } from "@/hooks/use-register"

export default function ProviderRegistrationPage() {
  const [departmentId, setDepartmentId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { municipalities, isLoading: loadingMunicipalities } = useMunicipalities(departmentId || null)
  const { categories, isLoading: loadingCategories, error: categoriesError } = useCategories()
  const { isLoading, error, submitProvider } = useRegister()

  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }))
  const municipalityOptions = municipalities.map((m) => ({ value: m.id, label: m.name }))

  const isFormValid = departmentId && municipalityId && selectedCategories.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await submitProvider({
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      department_id: departmentId,
      municipality_id: municipalityId,
      business_name: formData.get("business_name") as string,
      description: (formData.get("description") as string) || undefined,
      subcategory_ids: selectedCategories,
    })
  }

  return (
    <div className="min-h-screen bg-[var(--n-0)] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--brand-500)] p-12 flex-col justify-between">
        <NexumLogo size={20} />
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Únete a la red de especialistas verificados
          </h1>
          <p className="text-lg text-white/80">
            Accede a miles de solicitudes de clientes en tu área.
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
                Completa tus datos para comenzar a recibir solicitudes
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
                name="business_name"
                label="Nombre del negocio"
                type="text"
                placeholder="Servicios Eléctricos JP"
                leading={<Briefcase size={18} />}
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

              <CategorySelector
                categories={categories}
                selectedIds={selectedCategories}
                onChange={setSelectedCategories}
                maxSelections={10}
                isLoading={loadingCategories}
                error={categoriesError}
              />

              <Textarea
                name="description"
                label="Descripción (opcional)"
                placeholder="Cuéntanos sobre tu experiencia y servicios..."
                rows={3}
              />

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
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-[var(--brand-50)] border border-[var(--brand-100)]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--brand-500)] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-700)] mb-1">
                    Verificación de identidad
                  </div>
                  <div className="text-xs text-[var(--brand-600)] leading-relaxed">
                    Después de registrarte, te pediremos una foto de tu documento de identidad para verificar tu cuenta.
                  </div>
                </div>
              </div>
            </div>

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
