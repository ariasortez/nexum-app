export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type AnyRow = Record<string, any> & {
  id: any
  role: any
  provider_id: any
  provider_user_id: any
  client_id: any
}

type GenericTable = {
  Row: AnyRow
  Insert: Record<string, any>
  Update: Record<string, any>
  Relationships: any[]
}

type Table<Row extends Record<string, any> = AnyRow> = {
  Row: Row
  Insert: Partial<Row> & Record<string, any>
  Update: Partial<Row> & Record<string, any>
  Relationships: any[]
}

type ProfileRow = AnyRow & {
  id: string
  full_name: string
  role: string | null
  avatar_url: string | null
}

type ProviderProfileRow = AnyRow & {
  id: string
  user_id: string
  slug: string
  business_name: string
  verification_status: "pending" | "in_review" | "approved" | "rejected"
  credits_balance: number | null
  verified: boolean | null
}

type ProviderWorkPostRow = AnyRow & {
  id: string
  provider_id: string
}

type PublicTables = {
  conversation_messages: GenericTable
  conversation_reads: GenericTable
  conversations: GenericTable
  credit_transaction_types: GenericTable
  credit_transactions: GenericTable
  departments: GenericTable
  main_categories: GenericTable
  marketplace_settings: GenericTable
  message_attachments: GenericTable
  municipalities: GenericTable
  notifications: GenericTable
  profiles: Table<ProfileRow>
  provider_categories: GenericTable
  provider_portfolio: GenericTable
  provider_profiles: Table<ProviderProfileRow>
  provider_work_posts: Table<ProviderWorkPostRow>
  request_responses: GenericTable
  request_statuses: GenericTable
  response_statuses: GenericTable
  reviews: GenericTable
  service_requests: GenericTable
  subcategories: GenericTable
  urgency_levels: GenericTable
  user_roles: GenericTable
  verification_documents: GenericTable
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: PublicTables
    Views: Record<string, GenericTable>
    Functions: Record<string, any>
    Enums: {
      document_type: "id_front" | "id_back" | "selfie" | "business_license" | "other"
      verification_status: "pending" | "in_review" | "approved" | "rejected"
    }
    CompositeTypes: Record<string, any>
  }
}
