"use client"

import { useState, useRef, useEffect } from "react"
import { useMyWorkPosts } from "@/hooks/use-providers"
import { toast } from "@/lib/toast"
import * as providersService from "@/services/providers"
import type { WorkPost, CreateWorkPostInput } from "@/types/providers"

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

export default function ProviderPortfolioPage() {
  const { workPosts, isLoading, error, refetch } = useMyWorkPosts()
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<WorkPost | null>(null)

  const handleCreate = () => {
    setEditingPost(null)
    setShowForm(true)
  }

  const handleEdit = (post: WorkPost) => {
    setEditingPost(post)
    setShowForm(true)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("¿Estás seguro de eliminar este trabajo?")) return

    try {
      await providersService.deleteWorkPost(postId)
      toast.success("Trabajo eliminado")
      refetch()
    } catch (err) {
      toast.error("Error al eliminar", {
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPost(null)
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
            Portafolio
          </h1>
          <p className="mt-2 text-body-md text-[var(--on-surface-variant)]">
            Muestra tus trabajos realizados a los clientes potenciales
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="self-start flex items-center gap-2 px-4 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="add" size={20} className="!text-white" />
          <span className="!text-white">Agregar Trabajo</span>
        </button>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : workPosts.length === 0 ? (
        <EmptyState onAdd={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workPosts.map((post) => (
            <WorkPostCard
              key={post.id}
              post={post}
              onEdit={() => handleEdit(post)}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <WorkPostForm
          post={editingPost}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

function WorkPostCard({ post, onEdit, onDelete }: { post: WorkPost; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] overflow-hidden">
      {post.images[0] && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-[var(--on-surface)] font-headline leading-tight line-clamp-1">
          {post.title}
        </h3>
        {post.subcategory && (
          <p className="text-xs text-[var(--on-surface-variant)] mt-1 uppercase">
            {post.subcategory.name}
          </p>
        )}
        <p className="text-sm text-[var(--on-surface-variant)] mt-2 line-clamp-2">
          {post.description}
        </p>

        {post.images.length > 1 && (
          <p className="text-xs text-[var(--primary)] mt-2">
            +{post.images.length - 1} foto{post.images.length > 2 ? "s" : ""} más
          </p>
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
      </div>
    </article>
  )
}

type ProviderCategory = Awaited<ReturnType<typeof providersService.getMyCategories>>[number]

function WorkPostForm({ post, onClose, onSuccess }: { post: WorkPost | null; onClose: () => void; onSuccess: () => void }) {
  const [myCategories, setMyCategories] = useState<ProviderCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(post?.title || "")
  const [description, setDescription] = useState(post?.description || "")
  const [subcategoryId, setSubcategoryId] = useState(post?.subcategory?.id || "")
  const [images, setImages] = useState<string[]>(post?.images || [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const categories = await providersService.getMyCategories()
        setMyCategories(categories)
        if (!post && categories.length === 1) {
          setSubcategoryId(categories[0].subcategory.id)
        }
      } catch {
        toast.error("Error al cargar categorías")
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [post])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error("Máximo 5 fotos por trabajo")
      return
    }

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const { upload_url, public_url } = await providersService.getWorkPostUploadUrl(file.name)
        await providersService.uploadFile(upload_url, file)
        setImages(prev => [...prev, public_url])
      }
      toast.success("Fotos subidas")
    } catch (err) {
      toast.error("Error al subir fotos", {
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (categoriesLoading) {
      toast.error("Espera a que carguen las categorías")
      return
    }

    const finalSubcategoryId = myCategories.length === 1
      ? myCategories[0].subcategory.id
      : subcategoryId

    if (!title.trim()) {
      toast.error("Ingresa un título")
      return
    }

    if (!description.trim()) {
      toast.error("Ingresa una descripción")
      return
    }

    if (images.length === 0) {
      toast.error("Agrega al menos una foto")
      return
    }

    if (!finalSubcategoryId) {
      toast.error("Selecciona una categoría")
      return
    }

    setIsSubmitting(true)
    try {
      const input: CreateWorkPostInput = {
        title: title.trim(),
        description: description.trim(),
        subcategory_id: finalSubcategoryId,
        images,
      }

      if (post) {
        await providersService.updateWorkPost(post.id, input)
        toast.success("Trabajo actualizado")
      } else {
        await providersService.createWorkPost(input)
        toast.success("Trabajo agregado")
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
            {post ? "Editar Trabajo" : "Agregar Trabajo"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface-container)]">
            <Icon name="close" size={24} className="text-[var(--on-surface-variant)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Instalación de aire acondicionado"
              className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
              maxLength={100}
            />
          </div>

          {/* Category - only show if provider has multiple categories */}
          {myCategories.length > 1 && (
            <div>
              <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
                Categoría *
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                disabled={categoriesLoading}
                className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all"
              >
                <option value="">Selecciona una categoría</option>
                {myCategories.map((cat) => (
                  <option key={cat.subcategory.id} value={cat.subcategory.id}>
                    {cat.subcategory.main_category?.name} - {cat.subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
              Descripción *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el trabajo realizado..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--primary)]/50 focus:border-[var(--primary)] focus:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] outline-none transition-all resize-none"
              maxLength={2000}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-label-sm font-label uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
              Fotos * ({images.length}/5)
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover border-2 border-[var(--primary)]" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--error)] flex items-center justify-center"
                  >
                    <Icon name="close" size={14} className="text-white" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square border-2 border-dashed border-[var(--primary)]/50 flex flex-col items-center justify-center gap-1 hover:border-[var(--primary)] hover:bg-[var(--primary-container)] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="fixo-loader scale-50">
                      <div className="fixo-loader-dot" />
                      <div className="fixo-loader-dot" />
                      <div className="fixo-loader-dot" />
                    </div>
                  ) : (
                    <>
                      <Icon name="add_photo_alternate" size={24} className="text-[var(--primary)]" />
                      <span className="text-[9px] font-label uppercase text-[var(--on-surface-variant)]">Agregar</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
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
              disabled={isSubmitting || uploading || categoriesLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all disabled:opacity-50"
            >
              <Icon name="save" size={18} className="!text-white" />
              <span className="!text-white">{isSubmitting ? "Guardando..." : uploading ? "Subiendo..." : "Guardar"}</span>
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
        Cargando trabajos...
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
        <Icon name="photo_library" size={40} className="text-[var(--primary)]" />
      </div>
      <h3 className="text-xl font-bold font-headline text-[var(--primary)] mb-2">
        Sin trabajos aún
      </h3>
      <p className="text-sm text-[var(--on-surface-variant)] max-w-sm mb-6">
        Agrega fotos de tus trabajos realizados para que los clientes puedan ver tu experiencia.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
      >
        <Icon name="add" size={20} className="!text-white" />
        <span className="!text-white">Agregar Primer Trabajo</span>
      </button>
    </div>
  )
}
