import Link from "next/link"
import { Card, Badge } from "@/components/ui"
import { Shield, User, List, ChevronRight, Coin } from "@/components/icons"

const STATS = [
  { label: "Verificaciones pendientes", value: "5", icon: Shield, tone: "red", href: "/admin/verifications" },
  { label: "Proveedores activos", value: "2,847", icon: User, tone: "brand", href: "/admin/providers" },
  { label: "Solicitudes hoy", value: "42", icon: List, tone: "green", href: "/admin/requests" },
  { label: "Créditos vendidos", value: "L. 12,450", icon: Coin, tone: "amber", href: "/admin/sales" },
]

const RECENT_VERIFICATIONS = [
  { id: "v1", name: "Pedro Martínez", business: "Electricidad PM", status: "pending", submittedAt: "Hace 15 min" },
  { id: "v2", name: "Ana López", business: "Limpieza Express", status: "pending", submittedAt: "Hace 1 hora" },
  { id: "v3", name: "Roberto Sánchez", business: "Pintura RS", status: "pending", submittedAt: "Hace 2 horas" },
]

const RECENT_ACTIVITY = [
  { id: "a1", type: "verification_approved", message: "Verificación aprobada: Plomería Mendoza", time: "Hace 30 min" },
  { id: "a2", type: "new_provider", message: "Nuevo proveedor registrado: Electricidad PM", time: "Hace 1 hora" },
  { id: "a3", type: "credits_purchased", message: "Compra de créditos: 30 créditos - Jorge M.", time: "Hace 2 horas" },
  { id: "a4", type: "verification_rejected", message: "Verificación rechazada: Docs ilegibles - Carlos H.", time: "Hace 3 horas" },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <header className="bg-[var(--n-0)] border-b border-[var(--n-100)] px-5 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--n-900)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--n-500)] mt-1">
            Resumen de actividad de la plataforma
          </p>
        </div>
      </header>

      <div className="px-5 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat) => (
              <Link key={stat.label} href={stat.href}>
                <Card padding={20} interactive className="h-full">
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                    stat.tone === "red" ? "bg-[var(--red-50)] text-[var(--red-600)]" :
                    stat.tone === "amber" ? "bg-[var(--amber-50)] text-[var(--amber-600)]" :
                    stat.tone === "green" ? "bg-[var(--green-50)] text-[var(--green-600)]" :
                    "bg-[var(--brand-50)] text-[var(--brand-600)]"
                  }`}>
                    <stat.icon size={20} />
                  </div>
                  <div className="text-2xl font-bold text-[var(--n-900)] nx-mono">{stat.value}</div>
                  <div className="text-xs text-[var(--n-500)] mt-0.5">{stat.label}</div>
                </Card>
              </Link>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[var(--n-500)] uppercase tracking-wider">
                  Verificaciones pendientes
                </h2>
                <Link href="/admin/verifications" className="text-sm text-[var(--brand-600)] font-medium flex items-center gap-0.5">
                  Ver todas <ChevronRight size={14} />
                </Link>
              </div>
              <Card padding={0}>
                {RECENT_VERIFICATIONS.map((verification, index) => (
                  <Link
                    key={verification.id}
                    href={`/admin/verifications/${verification.id}`}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-[var(--n-25)] transition-colors ${
                      index !== RECENT_VERIFICATIONS.length - 1 ? "border-b border-[var(--n-100)]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--amber-100)] flex items-center justify-center text-sm font-semibold text-[var(--amber-700)]">
                        {verification.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--n-900)]">{verification.business}</div>
                        <div className="text-xs text-[var(--n-500)]">{verification.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--n-400)]">{verification.submittedAt}</span>
                      <ChevronRight size={14} className="text-[var(--n-400)]" />
                    </div>
                  </Link>
                ))}
              </Card>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-[var(--n-500)] uppercase tracking-wider mb-4">
                Actividad reciente
              </h2>
              <Card padding={0}>
                {RECENT_ACTIVITY.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`px-4 py-3 ${
                      index !== RECENT_ACTIVITY.length - 1 ? "border-b border-[var(--n-100)]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          activity.type === "verification_approved" ? "bg-[var(--green-500)]" :
                          activity.type === "verification_rejected" ? "bg-[var(--red-500)]" :
                          activity.type === "credits_purchased" ? "bg-[var(--amber-500)]" :
                          "bg-[var(--brand-500)]"
                        }`} />
                        <span className="text-sm text-[var(--n-700)]">{activity.message}</span>
                      </div>
                      <span className="text-xs text-[var(--n-400)] shrink-0">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
