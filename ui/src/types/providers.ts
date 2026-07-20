// Provider Certifications
export type Certification = {
  id: string
  provider_id: string
  name: string
  issuer: string
  description: string | null
  issue_date: string | null
  expiry_date: string | null
  certificate_url: string | null
  verified: boolean
  created_at: string
}

export type CreateCertificationInput = {
  name: string
  issuer: string
  description?: string
  issue_date?: string
  expiry_date?: string
  certificate_url?: string
}

export type UpdateCertificationInput = Partial<CreateCertificationInput>

// Work Posts (Portfolio)
export type WorkPost = {
  id: string
  provider_id: string
  title: string
  description: string
  images: string[]
  created_at: string
  updated_at: string
  subcategory: {
    id: string
    name: string
    slug: string
    main_category: {
      id: string
      name: string
      slug: string
    } | null
  } | null
}

export type CreateWorkPostInput = {
  title: string
  description: string
  subcategory_id: string
  images: string[]
}

export type UpdateWorkPostInput = Partial<CreateWorkPostInput>

// Reviews
export type PublicReview = {
  id: string
  rating: number
  comment: string | null
  photos: string[] | null
  created_at: string
  client: {
    full_name: string
    avatar_url: string | null
  } | null
  request: {
    id: string
    title: string
    subcategory: {
      id: string
      name: string
    } | null
  } | null
}

// Public Provider Profile
export type PublicProviderProfile = {
  id: string
  slug: string
  business_name: string
  description: string | null
  phone_public: string | null
  verified: boolean | null
  avg_rating: number | null
  total_reviews: number | null
  response_time_avg: number | null
  is_active: boolean | null
  created_at: string | null
  department: {
    id: string
    name: string
    slug: string
  } | null
  municipality: {
    id: string
    name: string
    slug: string
  } | null
  categories: Array<{
    subcategory: {
      id: string
      name: string
      slug: string
      main_category: {
        id: string
        name: string
        slug: string
      } | null
    } | null
  }>
  user: {
    full_name: string
    avatar_url: string | null
  } | null
}

export type PublicProviderData = {
  profile: PublicProviderProfile
  work_posts: WorkPost[]
  certifications: Certification[]
  reviews: PublicReview[]
  reviews_pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

// Upload URL response
export type UploadUrlResponse = {
  upload_url: string
  file_path: string
  public_url: string
}
