"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { usePublicProvider } from "@/hooks/use-providers"
import { getAuthSession } from "@/lib/session"
import type { PublicProviderData, Certification, WorkPost, PublicReview } from "@/types/providers"

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

export default function PublicProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data, isLoading, error } = usePublicProvider(slug)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const session = getAuthSession()
    setIsLoggedIn(!!session?.user)
  }, [])

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error ?? "Proveedor no encontrado"} />

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b-4 border-[var(--primary)] bg-[var(--surface)] px-4 py-4 lg:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="text-2xl lg:text-3xl font-black text-[var(--secondary)] font-headline tracking-tight">
            FIXO
          </Link>
          {!isLoggedIn && (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] border-2 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(27,48,34,1)]"
            >
              <Icon name="login" size={18} className="!text-white" />
              <span className="!text-white">Ingresar</span>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        {/* Profile Header - Full Width */}
        <ProfileHeader profile={data.profile} />

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Left Column - About & Services */}
          <div className="space-y-6">
            <AboutSection profile={data.profile} />
            <CategoriesSection categories={data.profile.categories} />
            <CertificationsSection certifications={data.certifications} />
          </div>

          {/* Center Column - Portfolio */}
          <div className="lg:col-span-2">
            <PortfolioSection workPosts={data.work_posts} />

            {/* Reviews below portfolio on desktop */}
            <div className="mt-6">
              <ReviewsSection reviews={data.reviews} pagination={data.reviews_pagination} />
            </div>
          </div>
        </div>

        {/* Floating CTA - Mobile only */}
        <div className="fixed bottom-4 left-4 right-4 lg:hidden z-40">
          <ContactCard profile={data.profile} />
        </div>
      </main>
    </div>
  )
}

function ProfileHeader({ profile }: { profile: PublicProviderData["profile"] }) {
  const initials = profile.user?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-HN", { year: "numeric", month: "long" })
    : null

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[6px_6px_0px_0px_rgba(27,48,34,1)] p-5 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left: Avatar & Basic Info */}
        <div className="flex flex-col sm:flex-row gap-5 items-start lg:flex-1">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile.user?.avatar_url ? (
              <img
                src={profile.user.avatar_url}
                alt={profile.business_name}
                className="w-24 h-24 lg:w-32 lg:h-32 object-cover border-4 border-[var(--primary)]"
              />
            ) : (
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[var(--primary-container)] border-4 border-[var(--primary)] flex items-center justify-center">
                <span className="text-3xl lg:text-4xl font-black text-[var(--primary)] font-headline">
                  {initials}
                </span>
              </div>
            )}
            {profile.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-600 border-2 border-white flex items-center justify-center">
                <Icon name="verified" filled size={18} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {profile.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 border-2 border-green-600 text-[10px] font-label font-bold uppercase tracking-wider text-green-800">
                  <Icon name="verified" filled size={12} />
                  Verificado
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-4xl font-black text-[var(--primary)] font-headline leading-tight">
              {profile.business_name}
            </h1>

            {profile.user?.full_name && (
              <p className="text-body-md text-[var(--on-surface-variant)] mt-1">
                {profile.user.full_name}
              </p>
            )}

            {/* Location */}
            {(profile.municipality || profile.department) && (
              <div className="flex items-center gap-2 mt-3 text-sm text-[var(--on-surface-variant)]">
                <Icon name="location_on" size={18} className="text-[var(--primary)]" />
                <span>
                  {profile.municipality?.name}
                  {profile.department && `, ${profile.department.name}`}
                </span>
              </div>
            )}

            {/* Member Since - Mobile */}
            {memberSince && (
              <div className="flex items-center gap-2 mt-2 text-sm text-[var(--on-surface-variant)] lg:hidden">
                <Icon name="calendar_month" size={18} className="text-[var(--primary)]" />
                <span>Miembro desde {memberSince}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
          {/* Rating */}
          <div className="bg-[var(--primary-container)] border-2 border-[var(--primary)] p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Icon name="star" filled size={24} className="text-amber-500" />
              <span className="text-2xl font-black text-[var(--primary)] font-headline">
                {profile.avg_rating?.toFixed(1) || "—"}
              </span>
            </div>
            <p className="text-[10px] font-label uppercase tracking-wider text-[var(--primary)]">
              Calificación
            </p>
          </div>

          {/* Reviews */}
          <div className="bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 p-4 text-center">
            <span className="text-2xl font-black text-[var(--primary)] font-headline block">
              {profile.total_reviews || 0}
            </span>
            <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
              Reseñas
            </p>
          </div>

          {/* Response Time */}
          <div className="bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 p-4 text-center">
            <span className="text-2xl font-black text-[var(--primary)] font-headline block">
              {profile.response_time_avg
                ? profile.response_time_avg < 60
                  ? `${profile.response_time_avg}m`
                  : `${Math.round(profile.response_time_avg / 60)}h`
                : "—"}
            </span>
            <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
              Respuesta
            </p>
          </div>

          {/* Member Since - Desktop */}
          <div className="bg-[var(--surface-container)] border-2 border-[var(--primary)]/30 p-4 text-center hidden sm:block">
            <span className="text-lg font-black text-[var(--primary)] font-headline block">
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString("es-HN", { year: "numeric", month: "short" })
                : "—"}
            </span>
            <p className="text-[10px] font-label uppercase tracking-wider text-[var(--on-surface-variant)]">
              Miembro desde
            </p>
          </div>
        </div>
      </div>

      {/* CTA - Desktop only */}
      <div className="hidden lg:flex mt-6 pt-6 border-t-2 border-[var(--primary)]/20 items-center justify-between">
        <p className="text-body-md text-[var(--on-surface-variant)]">
          ¿Necesitas este servicio? Publica tu solicitud y recibe cotizaciones.
        </p>
        <Link
          href="/client/requests/new"
          className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-md font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(27,48,34,1)] transition-all"
        >
          <Icon name="add_circle" size={20} className="!text-white" />
          <span className="!text-white">Crear Solicitud</span>
        </Link>
      </div>
    </section>
  )
}

function AboutSection({ profile }: { profile: PublicProviderData["profile"] }) {
  if (!profile.description) return null

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <h2 className="text-xl font-bold font-headline text-[var(--primary)] mb-3 flex items-center gap-2">
        <Icon name="info" size={24} className="text-[var(--primary)]" />
        Acerca de
      </h2>
      <p className="text-body-md text-[var(--on-surface)] leading-relaxed whitespace-pre-line">
        {profile.description}
      </p>
    </section>
  )
}

function CategoriesSection({ categories }: { categories: PublicProviderData["profile"]["categories"] }) {
  if (!categories || categories.length === 0) return null

  const mainCategories = [...new Set(
    categories
      .map(c => c.subcategory?.main_category?.name)
      .filter(Boolean)
  )]

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <h2 className="text-xl font-bold font-headline text-[var(--primary)] mb-4 flex items-center gap-2">
        <Icon name="handyman" size={24} className="text-[var(--primary)]" />
        Servicios
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--primary-container)] border-2 border-[var(--primary)] text-sm font-label text-[var(--primary)]"
          >
            {cat.subcategory?.name}
          </span>
        ))}
      </div>
    </section>
  )
}

function CertificationsSection({ certifications }: { certifications: Certification[] }) {
  if (!certifications || certifications.length === 0) return null

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <h2 className="text-xl font-bold font-headline text-[var(--primary)] mb-4 flex items-center gap-2">
        <Icon name="workspace_premium" size={24} className="text-[var(--primary)]" />
        Certificaciones y Acreditaciones
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className={`p-4 border-2 ${cert.verified ? "border-green-600 bg-green-50" : "border-[var(--primary)]/30"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-[var(--on-surface)] leading-tight">{cert.name}</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-0.5">{cert.issuer}</p>
                {cert.issue_date && (
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                    Emitido: {new Date(cert.issue_date).toLocaleDateString("es-HN", { year: "numeric", month: "short" })}
                  </p>
                )}
              </div>
              {cert.verified && (
                <div className="shrink-0 w-8 h-8 bg-green-600 flex items-center justify-center">
                  <Icon name="verified" filled size={18} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PortfolioSection({ workPosts }: { workPosts: WorkPost[] }) {
  const [selectedPost, setSelectedPost] = useState<WorkPost | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!workPosts || workPosts.length === 0) return null

  const openGallery = (post: WorkPost, imageIndex = 0) => {
    setSelectedPost(post)
    setSelectedImageIndex(imageIndex)
  }

  const closeGallery = () => {
    setSelectedPost(null)
    setSelectedImageIndex(0)
  }

  const nextImage = () => {
    if (selectedPost && selectedImageIndex < selectedPost.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <h2 className="text-xl font-bold font-headline text-[var(--primary)] mb-4 flex items-center gap-2">
        <Icon name="photo_library" size={24} className="text-[var(--primary)]" />
        Trabajos Realizados
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workPosts.map((post) => (
          <article key={post.id} className="border-2 border-[var(--primary)]/30 overflow-hidden">
            {post.images[0] && (
              <button
                onClick={() => openGallery(post, 0)}
                className="relative w-full aspect-[4/3] overflow-hidden group"
              >
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {post.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-bold flex items-center gap-1">
                    <Icon name="photo_library" size={14} />
                    {post.images.length}
                  </div>
                )}
              </button>
            )}
            <div className="p-3">
              <h3 className="font-bold text-[var(--on-surface)] leading-tight line-clamp-1">{post.title}</h3>
              {post.subcategory && (
                <p className="text-xs text-[var(--on-surface-variant)] mt-1 uppercase">
                  {post.subcategory.name}
                </p>
              )}
              {post.description && (
                <p className="text-sm text-[var(--on-surface-variant)] mt-2 line-clamp-2">
                  {post.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Image Gallery Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onClick={closeGallery}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="font-bold text-lg">{selectedPost.title}</h3>
              <p className="text-sm text-white/70">
                {selectedImageIndex + 1} / {selectedPost.images.length}
              </p>
            </div>
            <button
              onClick={closeGallery}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icon name="close" size={24} className="text-white" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4 relative" onClick={(e) => e.stopPropagation()}>
            {selectedImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon name="chevron_left" size={32} className="text-white" />
              </button>
            )}

            <img
              src={selectedPost.images[selectedImageIndex]}
              alt={`${selectedPost.title} - Foto ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain"
            />

            {selectedImageIndex < selectedPost.images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon name="chevron_right" size={32} className="text-white" />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {selectedPost.images.length > 1 && (
            <div className="p-4 flex justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
              {selectedPost.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 shrink-0 overflow-hidden border-2 ${
                    idx === selectedImageIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  } transition-opacity`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ReviewsSection({ reviews, pagination }: { reviews: PublicReview[]; pagination: { total: number } }) {
  if (!reviews || reviews.length === 0) return null

  return (
    <section className="bg-[var(--surface)] border-4 border-[var(--primary)] shadow-[4px_4px_0px_0px_rgba(27,48,34,1)] p-5">
      <h2 className="text-xl font-bold font-headline text-[var(--primary)] mb-4 flex items-center gap-2">
        <Icon name="reviews" size={24} className="text-[var(--primary)]" />
        Reseñas
        <span className="ml-auto text-sm font-label text-[var(--on-surface-variant)]">
          {pagination.total} total
        </span>
      </h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="p-4 border-2 border-[var(--primary)]/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 bg-[var(--primary-container)] border-2 border-[var(--primary)] flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--primary)]">
                  {review.client?.full_name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-[var(--on-surface)]">
                    {review.client?.full_name || "Cliente"}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name="star"
                        filled={star <= review.rating}
                        size={14}
                        className={star <= review.rating ? "text-amber-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                {review.request?.subcategory && (
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                    {review.request.subcategory.name}
                  </p>
                )}
                {review.comment && (
                  <p className="text-sm text-[var(--on-surface)] mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
                <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                  {new Date(review.created_at).toLocaleDateString("es-HN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ContactCard({ profile }: { profile: PublicProviderData["profile"] }) {
  return (
    <Link
      href="/client/requests/new"
      className="flex items-center justify-center gap-2 py-4 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-md font-label font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(27,48,34,1)]"
    >
      <Icon name="add_circle" size={22} className="!text-white" />
      <span className="!text-white">Crear Solicitud</span>
    </Link>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="fixo-loader mx-auto mb-4">
          <div className="fixo-loader-dot" />
          <div className="fixo-loader-dot" />
          <div className="fixo-loader-dot" />
        </div>
        <p className="text-label-md font-label uppercase text-[var(--on-surface-variant)] tracking-wider">
          Cargando perfil...
        </p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[var(--error-container)] border-4 border-[var(--error)] flex items-center justify-center mx-auto mb-4">
          <Icon name="error" filled size={40} className="text-[var(--error)]" />
        </div>
        <h2 className="text-xl font-bold font-headline text-[var(--error)] mb-2">Error</h2>
        <p className="text-sm text-[var(--on-surface-variant)] mb-6">{message}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] border-4 border-[var(--primary)] text-label-sm font-label font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(27,48,34,1)]"
        >
          <Icon name="home" size={18} className="!text-white" />
          <span className="!text-white">Ir al inicio</span>
        </Link>
      </div>
    </div>
  )
}
