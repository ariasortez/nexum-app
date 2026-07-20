"use client"

import { useState, useRef } from "react"
import { useMyCertifications } from "@/hooks/use-providers"
import { toast } from "@/lib/toast"
import * as providersService from "@/services/providers"
import type { Certification, CreateCertificationInput } from "@/types/providers"

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

export default function ProviderCertificationsPage() {
  const { certifications, isLoading, error, refetch } = useMyCertifications()
  const [showForm, setShowForm] = useState(false)
  const [editingCert, setEditingCert] = useState<Certification | null>(null)

  const handleCreate = () => {
    setEditingCert(null)
    setShowForm(true)
  }

  const handleEdit = (cert: Certification) => {
    setEditingCert(cert)
    setShowForm(true)
  }

  const handleDelete = async (certId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta certificación?")) return

    try {
      await providersService.deleteCertification(certId)
      toast.success("Certificación eliminada")
      refetch()
    } catch (err) {
      toast.error("Error al eliminar", {
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCert(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    refetch()
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-6xl">
      <header className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-label-sm font-label uppercase text-[var(--on-surface-variant)] tracking-wider mb-2">
            Mi Perfil
          </p>
          <h1 className="text-3xl lg:text-5xl font-black text-[var(--primary)] font-headline">
            Certificaciones
          </h1>
          <p className="mt-2 text-body-md text-[var(--on-surface-variant)]">
            Agrega tus certificaciones y acreditaciones profesionales
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="self-start flex items-center gap-2 px-4 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="add" size={20} className="!text-white" />
          <span className="!text-white">Agregar Certificación</span>
        </button>
      </header>

      {/* Info notice */}
      <div className="mb-6 bg-[var(--surface)] border-4 border-[var(--primary)]/30 p-4 flex items-start gap-3">
        <Icon name="info" size={20} className="text-[var(--primary)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[var(--on-surface-variant)]">
            Las certificaciones verificadas aparecen con un badge especial en tu perfil público.
            Nuestro equipo revisa los documentos que subas para verificarlas.
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : certifications.length === 0 ? (
        <EmptyState onAdd={handleCreate} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certifications.map((cert) => (
            <CertificationCard
              key={cert.id}
              certification={cert}
              onEdit={() => handleEdit(cert)}
              onDelete={() => handleDelete(cert.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CertificationForm
          certification={editingCert}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

function CertificationCard({ certification, onEdit, onDelete }: { certification: Certification; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className={`bg-[var(--surface)] border-4 p-5 ${
      certification.verified
        ? "border-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]"
        : "border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-12 h-12 shrink-0 border-4 flex items-center justify-center ${
          certification.verified
            ? "bg-green-100 border-green-600"
            : "bg-[var(--primary-container)] border-[var(--primary)]"
        }`}>
          <Icon
            name="workspace_premium"
            filled
            size={24}
            className={certification.verified ? "text-green-700" : "text-[var(--primary)]"}
          />
        </div>

        {certification.verified && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 border-2 border-green-600 text-[10px] font-label font-bold uppercase tracking-wider text-green-800">
            <Icon name="verified" filled size={12} />
            Verificado
          </span>
        )}
      </div>

      <h3 className="font-bold text-lg text-[var(--on-surface)] font-headline leading-tight">
        {certification.name}
      </h3>

      <p className="text-sm text-[var(--on-surface-variant)] mt-1">
        {certification.issuer}
      </p>

      {certification.description && (
        <p className="text-sm text-[var(--on-surface-variant)] mt-2 line-clamp-2">
          {certification.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-[var(--on-surface-variant)]">
        {certification.issue_date && (
          <span className="flex items-center gap-1">
            <Icon name="calendar_today" size={14} />
            Emitido: {new Date(certification.issue_date).toLocaleDateString("es-HN", { year: "numeric", month: "short" })}
          </span>
        )}
        {certification.expiry_date && (
          <span className="flex items-center gap-1">
            <Icon name="event_busy" size={14} />
            Vence: {new Date(certification.expiry_date).toLocaleDateString("es-HN", { year: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {certification.certificate_url && (
        <a
          href={certification.certificate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm text-[var(--primary)] hover:underline"
        >
          <Icon name="attachment" size={16} />
          Ver documento
        </a>
      )}

      <div className="flex gap-2 mt-4 pt-3 border-t-2 border-[var(--primary)]/20">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1 py-2 bg-[var(--surface)] border-2 border-[var(--primary)] text-[var(--primary)] text-label-sm font-label font-bold uppercase hover:bg-[var(--primary-container)] transition-colors"
        >
          <Icon name="edit" size={16} />
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-[var(--surface)] border-2 border-[var(--error)] text-[var(--error)] text-label-sm font-label font-bold uppercase hover:bg-[var(--error-container)] transition-colors"
        >
          <Icon name="delete" size={16} />
        </button>
      </div>
    </article>
  )
}

function CertificationForm({ certification, onClose, onSuccess }: { certification: Certification | null; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(certification?.name || "")
  const [issuer, setIssuer] = useState(certification?.issuer || "")
  const [description, setDescription] = useState(certification?.description || "")
  const [issueDate, setIssueDate] = useState(certification?.issue_date || "")
  const [expiryDate, setExpiryDate] = useState(certification?.expiry_date || "")
  const [certificateUrl, setCertificateUrl] = useState(certification?.certificate_url || "")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { upload_url, public_url } = await providersService.getCertificationUploadUrl(file.name)
      await providersService.uploadFile(upload_url, file)
      setCertificateUrl(public_url)
      toast.success("Documento subido")
    } catch (err) {
      toast.error("Error al subir documento", {
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !issuer.trim()) {
      toast.error("Completa los campos requeridos", {
        description: "Nombre e institución son obligatorios",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const input: CreateCertificationInput = {
        name: name.trim(),
        issuer: issuer.trim(),
        description: description.trim() || undefined,
        issue_date: issueDate || undefined,
        expiry_date: expiryDate || undefined,
        certificate_url: certificateUrl || undefined,
      }

      if (certification) {
        await providersService.updateCertification(certification.id, input)
        toast.success("Certificación actualizada")
      } else {
        await providersService.createCertification(input)
        toast.success("Certificación agregada")
      }
      onSuccess()
    } catch (err) {
      toast.error("Error al guardar", {
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)] w-full max-w-xl">
        <div className="flex items-center justify-between p-4 border-b-4 border-[var(--primary)]">
          <h2 className="text-xl font-bold font-headline text-[var(--primary)]">
            {certification ? "Editar Certificación" : "Agregar Certificación"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface-container)]">
            <Icon name="close" size={24} className="text-[var(--on-surface-variant)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
              Nombre de la certificación *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Técnico Electricista Certificado"
              className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
              maxLength={150}
            />
          </div>

          {/* Issuer */}
          <div>
            <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
              Institución emisora *
            </label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Ej: INFOP, Universidad X"
              className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
              maxLength={150}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la certificación..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all resize-none"
              maxLength={500}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
                Fecha de emisión
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
              />
            </div>
          </div>

          {/* Document upload */}
          <div>
            <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
              Documento (imagen o PDF)
            </label>

            {certificateUrl ? (
              <div className="flex items-center gap-3 p-3 bg-[var(--primary-container)] border-2 border-[var(--primary)]">
                <Icon name="description" size={24} className="text-[var(--primary)]" />
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-[var(--primary)] truncate hover:underline"
                >
                  Ver documento actual
                </a>
                <button
                  type="button"
                  onClick={() => setCertificateUrl("")}
                  className="p-1 hover:bg-[var(--error-container)]"
                >
                  <Icon name="close" size={18} className="text-[var(--error)]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-4 border-2 border-dashed border-[var(--primary)]/50 flex flex-col items-center justify-center gap-2 hover:border-[var(--primary)] hover:bg-[var(--primary-container)] transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <div className="fixo-loader">
                    <div className="fixo-loader-dot" />
                    <div className="fixo-loader-dot" />
                    <div className="fixo-loader-dot" />
                  </div>
                ) : (
                  <>
                    <Icon name="upload_file" size={32} className="text-[var(--primary)]" />
                    <span className="text-sm text-[var(--on-surface-variant)]">
                      Subir documento
                    </span>
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[var(--surface)] border-4 border-[var(--primary)] text-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider hover:bg-[var(--primary-container)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all disabled:opacity-50"
            >
              <Icon name="save" size={18} className="!text-white" />
              <span className="!text-white">{isSubmitting ? "Guardando..." : "Guardar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="fixo-loader mb-4">
        <div className="fixo-loader-dot" />
        <div className="fixo-loader-dot" />
        <div className="fixo-loader-dot" />
      </div>
      <p className="text-label-md font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
        Cargando certificaciones...
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 bg-[var(--error-container)] border-4 border-[var(--error)] flex items-center justify-center mb-4">
        <Icon name="error" filled size={40} className="text-[var(--error)]" />
      </div>
      <h3 className="text-xl font-bold font-headline text-[var(--error)] mb-2">Error al cargar</h3>
      <p className="text-sm text-[var(--on-surface-variant)] max-w-sm">{message}</p>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 bg-[var(--primary-container)] border-4 border-[var(--primary)] flex items-center justify-center mb-4">
        <Icon name="workspace_premium" size={40} className="text-[var(--primary)]" />
      </div>
      <h3 className="text-xl font-bold font-headline text-[var(--primary)] mb-2">
        Sin certificaciones
      </h3>
      <p className="text-sm text-[var(--on-surface-variant)] max-w-sm mb-6">
        Agrega tus certificaciones profesionales para aumentar la confianza de los clientes.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
      >
        <Icon name="add" size={20} className="!text-white" />
        <span className="!text-white">Agregar Certificación</span>
      </button>
    </div>
  )
}
