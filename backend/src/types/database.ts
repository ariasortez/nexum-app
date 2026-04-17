export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      credit_transaction_types: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          provider_id: string
          reference_id: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          provider_id: string
          reference_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          provider_id?: string
          reference_id?: string | null
          type?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      main_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          lat: number
          lng: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          lat: number
          lng: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          department_id: string | null
          full_name: string
          id: string
          lat: number | null
          lng: number | null
          municipality_id: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          full_name: string
          id: string
          lat?: number | null
          lng?: number | null
          municipality_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          full_name?: string
          id?: string
          lat?: number | null
          lng?: number | null
          municipality_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_categories: {
        Row: {
          provider_id: string
          subcategory_id: string
        }
        Insert: {
          provider_id: string
          subcategory_id: string
        }
        Update: {
          provider_id?: string
          subcategory_id?: string
        }
        Relationships: []
      }
      provider_portfolio: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          provider_id: string
          subcategory_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          provider_id: string
          subcategory_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          provider_id?: string
          subcategory_id?: string | null
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          address: string | null
          avg_rating: number | null
          business_name: string
          created_at: string | null
          credits_balance: number | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          municipality_id: string | null
          phone_public: string | null
          response_time_avg: number | null
          reviewed_by: string | null
          slug: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          verification_docs: string[] | null
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          business_name: string
          created_at?: string | null
          credits_balance?: number | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          municipality_id?: string | null
          phone_public?: string | null
          response_time_avg?: number | null
          reviewed_by?: string | null
          slug: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          verification_docs?: string[] | null
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          business_name?: string
          created_at?: string | null
          credits_balance?: number | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          municipality_id?: string | null
          phone_public?: string | null
          response_time_avg?: number | null
          reviewed_by?: string | null
          slug?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          verification_docs?: string[] | null
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      request_responses: {
        Row: {
          created_at: string | null
          credits_spent: number | null
          estimated_price: number | null
          id: string
          is_selected: boolean | null
          message: string | null
          provider_id: string
          request_id: string
        }
        Insert: {
          created_at?: string | null
          credits_spent?: number | null
          estimated_price?: number | null
          id?: string
          is_selected?: boolean | null
          message?: string | null
          provider_id: string
          request_id: string
        }
        Update: {
          created_at?: string | null
          credits_spent?: number | null
          estimated_price?: number | null
          id?: string
          is_selected?: boolean | null
          message?: string | null
          provider_id?: string
          request_id?: string
        }
        Relationships: []
      }
      request_statuses: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string | null
          id: string
          photos: string[] | null
          provider_id: string
          rating: number
          request_id: string | null
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          provider_id: string
          rating: number
          request_id?: string | null
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          provider_id?: string
          rating?: number
          request_id?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          address: string | null
          client_id: string
          created_at: string | null
          deleted_at: string | null
          department_id: string | null
          description: string
          expires_at: string | null
          id: string
          lat: number | null
          lng: number | null
          max_responses: number | null
          municipality_id: string | null
          photos: string[] | null
          status: string | null
          subcategory_id: string
          title: string
          urgency: string | null
        }
        Insert: {
          address?: string | null
          client_id: string
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description: string
          expires_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          max_responses?: number | null
          municipality_id?: string | null
          photos?: string[] | null
          status?: string | null
          subcategory_id: string
          title: string
          urgency?: string | null
        }
        Update: {
          address?: string | null
          client_id?: string
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          max_responses?: number | null
          municipality_id?: string | null
          photos?: string[] | null
          status?: string | null
          subcategory_id?: string
          title?: string
          urgency?: string | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          main_category_id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      urgency_levels: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_url: string
          id: string
          notes: string | null
          provider_id: string
          uploaded_at: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_url: string
          id?: string
          notes?: string | null
          provider_id: string
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_url?: string
          id?: string
          notes?: string | null
          provider_id?: string
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      document_type: "id_front" | "id_back" | "selfie" | "business_license" | "other"
      verification_status: "pending" | "in_review" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
