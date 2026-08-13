export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_default: boolean
          label: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          country?: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_default?: boolean
          label?: string
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string
          service: string
          status: string
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          service: string
          status?: string
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          service?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean
          subject?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_discount: number | null
          min_order: number
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_discount?: number | null
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_discount?: number | null
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          id: string
          image_url: string
        }
        Insert: {
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url: string
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          created_at: string
          email: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          city: string | null
          country: string | null
          coupon_code: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          discount: number
          estimated_delivery: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string | null
          paid_at: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string
          pincode: string | null
          razorpay_order_id: string | null
          shipping: number
          state: string | null
          status: string
          subtotal: number
          total: number
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          city?: string | null
          country?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          discount?: number
          estimated_delivery?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_number?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          pincode?: string | null
          razorpay_order_id?: string | null
          shipping?: number
          state?: string | null
          status?: string
          subtotal: number
          total: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          country?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          discount?: number
          estimated_delivery?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          pincode?: string | null
          razorpay_order_id?: string | null
          shipping?: number
          state?: string | null
          status?: string
          subtotal?: number
          total?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          payment_id: string | null
          razorpay_order_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload?: Json | null
          payment_id?: string | null
          razorpay_order_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json | null
          payment_id?: string | null
          razorpay_order_id?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          author_name: string
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          author_name: string
          comment: string
          created_at?: string
          id?: string
          product_id: string
          rating?: number
          user_id: string
        }
        Update: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          badge: string | null
          category: string | null
          created_at: string
          description: string | null
          discount_percent: number
          id: string
          image_url: string | null
          images: string[]
          name: string
          price: number
          rating: number
          review_count: number
          sku: string | null
          sort_order: number
          stock: number
          updated_at: string
          variants: Json
        }
        Insert: {
          active?: boolean
          badge?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          image_url?: string | null
          images?: string[]
          name: string
          price: number
          rating?: number
          review_count?: number
          sku?: string | null
          sort_order?: number
          stock?: number
          updated_at?: string
          variants?: Json
        }
        Update: {
          active?: boolean
          badge?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          image_url?: string | null
          images?: string[]
          name?: string
          price?: number
          rating?: number
          review_count?: number
          sku?: string | null
          sort_order?: number
          stock?: number
          updated_at?: string
          variants?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          client_name: string
          created_at: string
          featured: boolean
          id: string
          location: string | null
          message: string
          rating: number
        }
        Insert: {
          avatar_url?: string | null
          client_name: string
          created_at?: string
          featured?: boolean
          id?: string
          location?: string | null
          message: string
          rating?: number
        }
        Update: {
          avatar_url?: string | null
          client_name?: string
          created_at?: string
          featured?: boolean
          id?: string
          location?: string | null
          message?: string
          rating?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          title: string
          video_type: string
          youtube_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          video_type?: string
          youtube_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          video_type?: string
          youtube_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_phone_exists: { Args: { p_phone: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
