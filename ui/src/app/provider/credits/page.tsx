"use client"

import { useState } from "react"
import { toast } from "@/lib/toast"
import { CREDIT_PACKAGES } from "@/types"

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

const BANK_INFO = {
  bank: "BAC Credomatic",
  accountType: "Cuenta de Ahorro",
  accountNumber: "XXX-XXXX-XXXXX",
  accountName: "Fixo Honduras S.A.",
  email: "creditos@fixo.hn",
  whatsapp: "+504 9999-9999",
  whatsappLink: "https://wa.me/50499999999",
}

export default function ProviderCreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)

  const handleSelectPackage = (credits: number) => {
    setSelectedPackage(credits)
    toast.success("Paquete seleccionado", {
      description: `Realiza la transferencia de L ${CREDIT_PACKAGES.find(p => p.credits === credits)?.price} y envía el comprobante.`,
    })
  }

  const selectedPkg = CREDIT_PACKAGES.find(p => p.credits === selectedPackage)

  return (
    <div className="p-4 lg:p-8 w-full">
      <header className="mb-6 lg:mb-8 max-w-4xl">
        <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-2">
          Créditos
        </p>
        <h1 className="text-3xl lg:text-5xl font-black text-[var(--primary)] font-headline">
          Comprar Créditos
        </h1>
        <p className="text-body-md text-[var(--on-surface-variant)] mt-3 max-w-2xl">
          Necesitas créditos para enviar cotizaciones a los clientes. Cada cotización consume <span className="font-bold text-[var(--primary)]">1 crédito</span>.
        </p>
      </header>

      {/* Desktop: Two column layout */}
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Left Column - Balance, How it works, Packages */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Current Balance */}
          <section className="bg-[var(--primary)] border-4 border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-label-sm font-label uppercase text-white/80 tracking-wider mb-1">
                  Tu saldo actual
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black font-headline text-white">0</span>
                  <span className="text-lg font-label uppercase text-white/80">créditos</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 border-4 border-white/30 flex items-center justify-center">
                <Icon name="toll" filled size={36} className="text-white" />
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
            <h2 className="text-xl font-bold font-headline text-[var(--primary)] mb-4 flex items-center gap-2">
              <Icon name="info" size={24} className="text-[var(--primary)]" />
              ¿Cómo comprar créditos?
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center">
                  <span className="text-lg font-black text-[var(--primary)] font-headline">1</span>
                </div>
                <div>
                  <p className="font-bold text-[var(--on-surface)]">Selecciona un paquete</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">Elige la cantidad de créditos</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center">
                  <span className="text-lg font-black text-[var(--primary)] font-headline">2</span>
                </div>
                <div>
                  <p className="font-bold text-[var(--on-surface)]">Realiza la transferencia</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">Transfiere a nuestra cuenta</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center">
                  <span className="text-lg font-black text-[var(--primary)] font-headline">3</span>
                </div>
                <div>
                  <p className="font-bold text-[var(--on-surface)]">Envía el comprobante</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">Acreditamos tus créditos</p>
                </div>
              </div>
            </div>
          </section>

          {/* Packages Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.credits
              return (
                <article
                  key={pkg.credits}
                  className={`relative bg-[var(--surface)] border-4 p-5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--secondary)] shadow-[6px_6px_0px_0px_rgba(255,184,0,1)]"
                      : pkg.popular
                      ? "border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)] hover:shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
                      : "border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
                  }`}
                  onClick={() => handleSelectPackage(pkg.credits)}
                >
                  {pkg.popular && !isSelected && (
                    <span className="absolute -top-3 left-4 bg-[var(--primary)] border-2 border-[var(--primary)] px-3 py-1 text-[10px] font-label font-bold uppercase tracking-wider !text-white">
                      Popular
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute -top-3 left-4 bg-[var(--secondary)] border-2 border-[var(--secondary)] px-3 py-1 text-[10px] font-label font-bold uppercase tracking-wider text-[var(--on-secondary)]">
                      Seleccionado
                    </span>
                  )}

                  <div className={`w-14 h-14 border-4 flex items-center justify-center mb-4 ${
                    isSelected
                      ? "bg-[var(--secondary)] border-[var(--secondary)]"
                      : "bg-[var(--primary-container)] border-[var(--primary)]"
                  }`}>
                    <Icon name="toll" filled size={28} className={isSelected ? "text-[var(--on-secondary)]" : "text-[var(--primary)]"} />
                  </div>

                  <h2 className={`text-4xl font-black font-headline ${isSelected ? "text-[var(--secondary)]" : "text-[var(--primary)]"}`}>
                    {pkg.credits}
                  </h2>
                  <p className="text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-4">
                    créditos
                  </p>

                  <div className="mb-4 pb-4 border-b-2 border-[var(--primary)]/20">
                    <p className="text-2xl font-bold font-headline text-[var(--on-surface)]">
                      L {pkg.price}
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                      L {pkg.pricePerCredit} por crédito {pkg.bonus && <span className="text-[var(--primary)] font-bold">({pkg.bonus})</span>}
                    </p>
                  </div>

                  <div className={`flex items-center justify-center gap-2 py-2 border-2 ${
                    isSelected
                      ? "border-[var(--secondary)] text-[var(--secondary)]"
                      : "border-[var(--primary)] text-[var(--primary)]"
                  }`}>
                    <Icon name={isSelected ? "check_circle" : "add_shopping_cart"} size={18} />
                    <span className="text-label-sm font-label font-bold uppercase">
                      {isSelected ? "Seleccionado" : "Seleccionar"}
                    </span>
                  </div>
                </article>
              )
            })}
          </section>

          {/* Notice - Only on desktop */}
          <aside className="hidden xl:flex bg-[var(--surface)] border-4 border-[var(--primary)]/30 p-4 items-start gap-3">
            <Icon name="schedule" size={20} className="text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--on-surface)] mb-1">Tiempo de acreditación</p>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Los créditos se acreditan en un máximo de 24 horas hábiles después de verificar tu transferencia.
              </p>
            </div>
          </aside>
        </div>

        {/* Right Column - Bank Transfer Info (Desktop: sticky sidebar) */}
        <div className="xl:w-96 xl:shrink-0">
          <div className="xl:sticky xl:top-8 space-y-4">
            {/* Bank Transfer Info */}
            <section className={`bg-[var(--surface)] border-4 shadow-[6px_6px_0px_0px_rgba(27,48,34,1)] p-5 transition-all ${
              selectedPackage ? "border-[var(--primary)]" : "border-[var(--primary)]/50"
            }`}>
              <h2 className="text-xl font-bold font-headline text-[var(--primary)] mb-4 flex items-center gap-2">
                <Icon name="account_balance" size={24} className="text-[var(--primary)]" />
                Datos para transferencia
              </h2>

              {selectedPackage && selectedPkg ? (
                <div className="bg-[var(--primary-container)] border-2 border-[var(--primary)] p-4 mb-4">
                  <p className="text-sm text-[var(--on-surface-variant)] mb-1">Monto a transferir:</p>
                  <p className="text-3xl font-black font-headline text-[var(--primary)]">
                    L {selectedPkg.price}
                  </p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Por {selectedPkg.credits} créditos
                  </p>
                </div>
              ) : (
                <div className="bg-[var(--surface-container)] border-2 border-dashed border-[var(--primary)]/30 p-4 mb-4 text-center">
                  <Icon name="touch_app" size={32} className="text-[var(--on-surface-variant)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Selecciona un paquete para ver el monto a transferir
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="p-3 border-2 border-[var(--primary)]/30">
                  <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">Banco</p>
                  <p className="font-bold text-[var(--on-surface)]">{BANK_INFO.bank}</p>
                </div>
                <div className="p-3 border-2 border-[var(--primary)]/30">
                  <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">Tipo de cuenta</p>
                  <p className="font-bold text-[var(--on-surface)]">{BANK_INFO.accountType}</p>
                </div>
                <div className="p-3 border-2 border-[var(--primary)]/30">
                  <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">Número de cuenta</p>
                  <p className="font-bold text-[var(--on-surface)]">{BANK_INFO.accountNumber}</p>
                </div>
                <div className="p-3 border-2 border-[var(--primary)]/30">
                  <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">A nombre de</p>
                  <p className="font-bold text-[var(--on-surface)]">{BANK_INFO.accountName}</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-[var(--surface-container)] border-2 border-[var(--primary)]/30">
                <p className="text-sm font-bold text-[var(--on-surface)] mb-3">
                  Envía tu comprobante por:
                </p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${BANK_INFO.email}?subject=Comprobante%20de%20créditos%20Fixo`}
                    className="flex items-center gap-3 p-3 bg-[var(--surface)] border-2 border-[var(--primary)] hover:bg-[var(--primary-container)] transition-colors"
                  >
                    <div className="w-10 h-10 bg-[var(--primary)] flex items-center justify-center shrink-0">
                      <Icon name="mail" size={20} className="!text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">Correo</p>
                      <p className="font-bold text-[var(--primary)] truncate">{BANK_INFO.email}</p>
                    </div>
                  </a>
                  <a
                    href={BANK_INFO.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[var(--surface)] border-2 border-green-600 hover:bg-green-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">WhatsApp</p>
                      <p className="font-bold text-green-700 truncate">{BANK_INFO.whatsapp}</p>
                    </div>
                  </a>
                </div>
                <p className="text-xs text-[var(--on-surface-variant)] mt-3">
                  Incluye tu correo de Fixo para identificarte.
                </p>
              </div>
            </section>

            {/* Notice - Only on mobile */}
            <aside className="xl:hidden bg-[var(--surface)] border-4 border-[var(--primary)]/30 p-4 flex items-start gap-3">
              <Icon name="schedule" size={20} className="text-[var(--primary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[var(--on-surface)] mb-1">Tiempo de acreditación</p>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Los créditos se acreditan en un máximo de 24 horas hábiles después de verificar tu transferencia. Los fines de semana puede tardar más.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
