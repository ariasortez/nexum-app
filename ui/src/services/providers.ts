import { api } from "@/lib/api"
import type {
  Certification,
  CreateCertificationInput,
  UpdateCertificationInput,
  WorkPost,
  CreateWorkPostInput,
  UpdateWorkPostInput,
  PublicProviderData,
  PublicReview,
  UploadUrlResponse,
} from "@/types/providers"

// ==================== MY CATEGORIES ====================

interface ProviderCategory {
  subcategory: {
    id: string
    name: string
    slug: string
    main_category: {
      id: string
      name: string
      slug: string
    } | null
  }
}

export async function getMyCategories(): Promise<ProviderCategory[]> {
  const response = await api.get<{ data: ProviderCategory[] }>("/providers/me/categories")
  return response.data
}

// ==================== CERTIFICATIONS ====================

export async function getMyCertifications(): Promise<Certification[]> {
  const response = await api.get<{ data: Certification[] }>("/providers/me/certifications")
  return response.data
}

export async function createCertification(input: CreateCertificationInput): Promise<Certification> {
  const response = await api.post<{ data: Certification }>("/providers/me/certifications", input)
  return response.data
}

export async function updateCertification(
  id: string,
  input: UpdateCertificationInput
): Promise<Certification> {
  const response = await api.patch<{ data: Certification }>(`/providers/me/certifications/${id}`, input)
  return response.data
}

export async function deleteCertification(id: string): Promise<void> {
  await api.delete(`/providers/me/certifications/${id}`)
}

export async function getCertificationUploadUrl(fileName: string): Promise<UploadUrlResponse> {
  const response = await api.post<{ data: UploadUrlResponse }>("/providers/me/certifications/upload-url", { file_name: fileName })
  return response.data
}

// ==================== WORK POSTS ====================

export async function getMyWorkPosts(): Promise<WorkPost[]> {
  const response = await api.get<{ data: WorkPost[] }>("/providers/me/work-posts")
  return response.data
}

export async function createWorkPost(input: CreateWorkPostInput): Promise<WorkPost> {
  const response = await api.post<{ data: WorkPost }>("/providers/me/work-posts", input)
  return response.data
}

export async function updateWorkPost(id: string, input: UpdateWorkPostInput): Promise<WorkPost> {
  const response = await api.patch<{ data: WorkPost }>(`/providers/me/work-posts/${id}`, input)
  return response.data
}

export async function deleteWorkPost(id: string): Promise<void> {
  await api.delete(`/providers/me/work-posts/${id}`)
}

export async function getWorkPostUploadUrl(fileName: string): Promise<UploadUrlResponse> {
  const response = await api.post<{ data: UploadUrlResponse }>("/providers/me/work-posts/upload-url", { file_name: fileName })
  return response.data
}

// ==================== PUBLIC PROFILE ====================

export async function getPublicProvider(slug: string): Promise<PublicProviderData> {
  const response = await api.get<{ data: PublicProviderData }>(`/providers/${slug}`)
  return response.data
}

export async function getPublicProviderReviews(
  slug: string,
  page = 1,
  limit = 20
): Promise<{ data: PublicReview[]; pagination: { total: number; total_pages: number } }> {
  const response = await api.get<{
    data: PublicReview[]
    pagination: { page: number; limit: number; total: number; total_pages: number }
  }>(`/providers/${slug}/reviews?page=${page}&limit=${limit}`)
  return response
}

// ==================== FILE UPLOAD HELPER ====================

export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to upload file")
  }
}
