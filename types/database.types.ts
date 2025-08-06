export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_feedback_aggregates: {
        Row: {
          aggregate_id: string
          aggregation_period: string
          avg_accuracy_score: number | null
          avg_confidence_score: number | null
          avg_time_to_edit_ms: number | null
          common_corrections: Json | null
          computed_at: string
          confirmed_validations: number
          field_name: string | null
          organization_id: string
          period_end: string
          period_start: string
          problem_areas: Json | null
          total_corrections: number
          total_extractions: number
          total_reprocessing_requests: number
          total_validations: number
          updated_at: string
        }
        Insert: {
          aggregate_id?: string
          aggregation_period: string
          avg_accuracy_score?: number | null
          avg_confidence_score?: number | null
          avg_time_to_edit_ms?: number | null
          common_corrections?: Json | null
          computed_at?: string
          confirmed_validations?: number
          field_name?: string | null
          organization_id: string
          period_end: string
          period_start: string
          problem_areas?: Json | null
          total_corrections?: number
          total_extractions?: number
          total_reprocessing_requests?: number
          total_validations?: number
          updated_at?: string
        }
        Update: {
          aggregate_id?: string
          aggregation_period?: string
          avg_accuracy_score?: number | null
          avg_confidence_score?: number | null
          avg_time_to_edit_ms?: number | null
          common_corrections?: Json | null
          computed_at?: string
          confirmed_validations?: number
          field_name?: string | null
          organization_id?: string
          period_end?: string
          period_start?: string
          problem_areas?: Json | null
          total_corrections?: number
          total_extractions?: number
          total_reprocessing_requests?: number
          total_validations?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_feedback_events: {
        Row: {
          accuracy_score: number | null
          cataloging_job_id: string
          confidence_score: number | null
          corrected_value: Json | null
          created_at: string
          edit_sequence: number | null
          edit_session_id: string | null
          event_id: string
          feedback_notes: string | null
          feedback_source: string
          feedback_type: string
          field_name: string | null
          organization_id: string
          original_value: Json | null
          time_to_edit_ms: number | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          cataloging_job_id: string
          confidence_score?: number | null
          corrected_value?: Json | null
          created_at?: string
          edit_sequence?: number | null
          edit_session_id?: string | null
          event_id?: string
          feedback_notes?: string | null
          feedback_source?: string
          feedback_type: string
          field_name?: string | null
          organization_id: string
          original_value?: Json | null
          time_to_edit_ms?: number | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          cataloging_job_id?: string
          confidence_score?: number | null
          corrected_value?: Json | null
          created_at?: string
          edit_sequence?: number | null
          edit_session_id?: string | null
          event_id?: string
          feedback_notes?: string | null
          feedback_source?: string
          feedback_type?: string
          field_name?: string | null
          organization_id?: string
          original_value?: Json | null
          time_to_edit_ms?: number | null
          user_id?: string
        }
        Relationships: []
      }
      amazon_listing_data: {
        Row: {
          asin: string | null
          condition_note: string | null
          created_at: string | null
          fulfillment_channel: string | null
          id: string
          item_description: string | null
          item_name: string | null
          item_note: string | null
          listing_id: string
          product_id: string | null
          product_id_type: string | null
          stock_item_id: string | null
        }
        Insert: {
          asin?: string | null
          condition_note?: string | null
          created_at?: string | null
          fulfillment_channel?: string | null
          id?: string
          item_description?: string | null
          item_name?: string | null
          item_note?: string | null
          listing_id: string
          product_id?: string | null
          product_id_type?: string | null
          stock_item_id?: string | null
        }
        Update: {
          asin?: string | null
          condition_note?: string | null
          created_at?: string | null
          fulfillment_channel?: string | null
          id?: string
          item_description?: string | null
          item_name?: string | null
          item_note?: string | null
          listing_id?: string
          product_id?: string | null
          product_id_type?: string | null
          stock_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amazon_listing_data_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      amazon_sp_api_tokens: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "amazon_sp_api_tokens_refresh_token_fkey"
            columns: ["refresh_token"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["amazon_refresh_token"]
          },
        ]
      }
      attribute_categories: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          name: string
          sort_order: number | null
        }
        Insert: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          name: string
          sort_order?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      attribute_types: {
        Row: {
          affects_pricing: boolean | null
          attribute_type_id: string
          category_id: string | null
          created_at: string | null
          data_type: string | null
          description: string | null
          is_value_required: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          affects_pricing?: boolean | null
          attribute_type_id?: string
          category_id?: string | null
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          is_value_required?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          affects_pricing?: boolean | null
          attribute_type_id?: string
          category_id?: string | null
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          is_value_required?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attribute_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "attribute_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      author_alternate_names: {
        Row: {
          alternate_name_id: string
          author_id: string
          created_at: string
          name: string
        }
        Insert: {
          alternate_name_id?: string
          author_id: string
          created_at?: string
          name: string
        }
        Update: {
          alternate_name_id?: string
          author_id?: string
          created_at?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "author_alternate_names_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["author_id"]
          },
        ]
      }
      author_types: {
        Row: {
          author_type_id: string
          created_at: string | null
          description: string | null
          name: string
        }
        Insert: {
          author_type_id?: string
          created_at?: string | null
          description?: string | null
          name: string
        }
        Update: {
          author_type_id?: string
          created_at?: string | null
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      authors: {
        Row: {
          author_id: string
          biography: string | null
          birth_date_text_ol: string | null
          created_at: string
          death_date_text_ol: string | null
          links_ol: Json | null
          name: string | null
          open_library_author_key: string | null
          personal_name: string | null
          photos_ol: Json | null
          source_records_ol: Json | null
          top_subjects_ol: Json | null
          top_work_text_ol: string | null
          updated_at: string
          work_count_ol: number | null
        }
        Insert: {
          author_id?: string
          biography?: string | null
          birth_date_text_ol?: string | null
          created_at?: string
          death_date_text_ol?: string | null
          links_ol?: Json | null
          name?: string | null
          open_library_author_key?: string | null
          personal_name?: string | null
          photos_ol?: Json | null
          source_records_ol?: Json | null
          top_subjects_ol?: Json | null
          top_work_text_ol?: string | null
          updated_at?: string
          work_count_ol?: number | null
        }
        Update: {
          author_id?: string
          biography?: string | null
          birth_date_text_ol?: string | null
          created_at?: string
          death_date_text_ol?: string | null
          links_ol?: Json | null
          name?: string | null
          open_library_author_key?: string | null
          personal_name?: string | null
          photos_ol?: Json | null
          source_records_ol?: Json | null
          top_subjects_ol?: Json | null
          top_work_text_ol?: string | null
          updated_at?: string
          work_count_ol?: number | null
        }
        Relationships: []
      }
      book_authors: {
        Row: {
          author_id: string
          author_type_id: string
          book_id: string
          created_at: string
        }
        Insert: {
          author_id: string
          author_type_id: string
          book_id: string
          created_at?: string
        }
        Update: {
          author_id?: string
          author_type_id?: string
          book_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "view_book_inventory_summary"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "fk_author_type"
            columns: ["author_type_id"]
            isOneToOne: false
            referencedRelation: "author_types"
            referencedColumns: ["author_type_id"]
          },
        ]
      }
      book_genres: {
        Row: {
          book_id: string
          created_at: string
          genre_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          genre_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          genre_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_genres_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "book_genres_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "book_genres_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "view_book_inventory_summary"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "book_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["genre_id"]
          },
        ]
      }
      books: {
        Row: {
          book_id: string
          created_at: string
          description: string | null
          edition_count_ol: number | null
          excerpts_ol: Json | null
          first_publish_year_ol: number | null
          has_fulltext_ol: boolean | null
          internet_archive_ids_ol: Json | null
          is_serial: boolean | null
          links_ol: Json | null
          notes_ol: string | null
          open_library_cover_id: string | null
          open_library_work_key: string | null
          primary_cover_image_url: string | null
          subtitle: string | null
          table_of_contents_ol: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          book_id?: string
          created_at?: string
          description?: string | null
          edition_count_ol?: number | null
          excerpts_ol?: Json | null
          first_publish_year_ol?: number | null
          has_fulltext_ol?: boolean | null
          internet_archive_ids_ol?: Json | null
          is_serial?: boolean | null
          links_ol?: Json | null
          notes_ol?: string | null
          open_library_cover_id?: string | null
          open_library_work_key?: string | null
          primary_cover_image_url?: string | null
          subtitle?: string | null
          table_of_contents_ol?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          description?: string | null
          edition_count_ol?: number | null
          excerpts_ol?: Json | null
          first_publish_year_ol?: number | null
          has_fulltext_ol?: boolean | null
          internet_archive_ids_ol?: Json | null
          is_serial?: boolean | null
          links_ol?: Json | null
          notes_ol?: string | null
          open_library_cover_id?: string | null
          open_library_work_key?: string | null
          primary_cover_image_url?: string | null
          subtitle?: string | null
          table_of_contents_ol?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cataloging_event_outbox: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivery_attempts: number
          entity_id: string
          entity_type: string
          event_data: Json
          event_id: string
          event_type: string
          last_error: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivery_attempts?: number
          entity_id: string
          entity_type: string
          event_data?: Json
          event_id?: string
          event_type: string
          last_error?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivery_attempts?: number
          entity_id?: string
          entity_type?: string
          event_data?: Json
          event_id?: string
          event_type?: string
          last_error?: string | null
          organization_id?: string
        }
        Relationships: []
      }
      cataloging_event_outbox_cursor: {
        Row: {
          last_processed_at: string
          last_processed_event_id: string
          organization_id: string
          processor_name: string
          updated_at: string
        }
        Insert: {
          last_processed_at?: string
          last_processed_event_id: string
          organization_id: string
          processor_name: string
          updated_at?: string
        }
        Update: {
          last_processed_at?: string
          last_processed_event_id?: string
          organization_id?: string
          processor_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursor_event_reference"
            columns: ["last_processed_event_id"]
            isOneToOne: false
            referencedRelation: "cataloging_event_outbox"
            referencedColumns: ["event_id"]
          },
        ]
      }
      cataloging_event_outbox_dlq: {
        Row: {
          delivery_attempts: number
          dlq_id: string
          entity_id: string
          entity_type: string
          event_data: Json
          event_type: string
          failed_at: string
          last_error: string
          organization_id: string
          original_event_id: string
        }
        Insert: {
          delivery_attempts: number
          dlq_id?: string
          entity_id: string
          entity_type: string
          event_data?: Json
          event_type: string
          failed_at?: string
          last_error: string
          organization_id: string
          original_event_id: string
        }
        Update: {
          delivery_attempts?: number
          dlq_id?: string
          entity_id?: string
          entity_type?: string
          event_data?: Json
          event_type?: string
          failed_at?: string
          last_error?: string
          organization_id?: string
          original_event_id?: string
        }
        Relationships: []
      }
      cataloging_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_data: Json | null
          image_urls: Json | null
          job_id: string
          matched_edition_ids: string[] | null
          organization_id: string
          original_extracted_data: Json | null
          status: Database["public"]["Enums"]["cataloging_job_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          image_urls?: Json | null
          job_id?: string
          matched_edition_ids?: string[] | null
          organization_id: string
          original_extracted_data?: Json | null
          status?: Database["public"]["Enums"]["cataloging_job_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          image_urls?: Json | null
          job_id?: string
          matched_edition_ids?: string[] | null
          organization_id?: string
          original_extracted_data?: Json | null
          status?: Database["public"]["Enums"]["cataloging_job_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cataloging_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      classifications: {
        Row: {
          classification_id: string
          classification_type: string
          classification_value: string
          created_at: string
          edition_id: string
        }
        Insert: {
          classification_id?: string
          classification_type: string
          classification_value: string
          created_at?: string
          edition_id: string
        }
        Update: {
          classification_id?: string
          classification_type?: string
          classification_value?: string
          created_at?: string
          edition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classifications_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "classifications_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      condition_standards: {
        Row: {
          condition_id: string
          created_at: string | null
          description: string | null
          sort_order: number | null
          standard_name: string
        }
        Insert: {
          condition_id?: string
          created_at?: string | null
          description?: string | null
          sort_order?: number | null
          standard_name: string
        }
        Update: {
          condition_id?: string
          created_at?: string | null
          description?: string | null
          sort_order?: number | null
          standard_name?: string
        }
        Relationships: []
      }
      data_quality_flag_comments: {
        Row: {
          author_id: string | null
          body: string
          comment_id: string
          created_at: string | null
          flag_id: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          comment_id?: string
          created_at?: string | null
          flag_id?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          comment_id?: string
          created_at?: string | null
          flag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_flag_comments_flag_id_fkey"
            columns: ["flag_id"]
            isOneToOne: false
            referencedRelation: "data_quality_flags"
            referencedColumns: ["flag_id"]
          },
        ]
      }
      data_quality_flag_votes: {
        Row: {
          flag_id: string
          vote: number | null
          voter_id: string
        }
        Insert: {
          flag_id: string
          vote?: number | null
          voter_id: string
        }
        Update: {
          flag_id?: string
          vote?: number | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_flag_votes_flag_id_fkey"
            columns: ["flag_id"]
            isOneToOne: false
            referencedRelation: "data_quality_flags"
            referencedColumns: ["flag_id"]
          },
        ]
      }
      data_quality_flags: {
        Row: {
          created_at: string | null
          description: string | null
          details: Json | null
          field_name: string | null
          flag_id: string
          flag_type: string
          flagged_by: string | null
          organization_id: string | null
          original_value: Json | null
          record_id: string
          resolution_notes: string | null
          resolved_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
          suggested_value: Json | null
          table_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          details?: Json | null
          field_name?: string | null
          flag_id?: string
          flag_type: string
          flagged_by?: string | null
          organization_id?: string | null
          original_value?: Json | null
          record_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          suggested_value?: Json | null
          table_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          details?: Json | null
          field_name?: string | null
          flag_id?: string
          flag_type?: string
          flagged_by?: string | null
          organization_id?: string | null
          original_value?: Json | null
          record_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          suggested_value?: Json | null
          table_name?: string
        }
        Relationships: []
      }
      ebay_api_tokens: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string
          id: string
          organization_id: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at: string
          id?: string
          organization_id?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebay_api_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      edition_contributors: {
        Row: {
          author_id: string
          author_type_id: string
          created_at: string
          edition_id: string
        }
        Insert: {
          author_id: string
          author_type_id: string
          created_at?: string
          edition_id: string
        }
        Update: {
          author_id?: string
          author_type_id?: string
          created_at?: string
          edition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edition_contributors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "edition_contributors_author_type_id_fkey"
            columns: ["author_type_id"]
            isOneToOne: false
            referencedRelation: "author_types"
            referencedColumns: ["author_type_id"]
          },
          {
            foreignKeyName: "edition_contributors_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_contributors_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      edition_languages: {
        Row: {
          created_at: string
          edition_id: string
          language_id: string
        }
        Insert: {
          created_at?: string
          edition_id: string
          language_id: string
        }
        Update: {
          created_at?: string
          edition_id?: string
          language_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edition_languages_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_languages_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["language_id"]
          },
        ]
      }
      edition_publish_places: {
        Row: {
          created_at: string
          edition_id: string
          place_id: string
        }
        Insert: {
          created_at?: string
          edition_id: string
          place_id: string
        }
        Update: {
          created_at?: string
          edition_id?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edition_publish_places_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_publish_places_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_publish_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      edition_subjects: {
        Row: {
          created_at: string
          edition_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          edition_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          edition_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edition_subjects_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_subjects_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["subject_id"]
          },
        ]
      }
      editions: {
        Row: {
          book_id: string | null
          by_statement_ol: string | null
          contributors_ol: Json | null
          created_at: string
          description_ol: string | null
          ebook_preview_urls_ol: Json | null
          edition_cover_image_url: string | null
          edition_ebook_access_ol: string | null
          edition_id: string
          edition_statement_text_ol: string | null
          edition_subtitle_ol: string | null
          edition_title_ol: string | null
          info_url_ol: string | null
          isbn10_ol: string | null
          isbn13_ol: string | null
          item_specific_format_type_id: string | null
          item_url_ol: string | null
          number_of_pages_ol: number | null
          open_library_edition_key: string | null
          pagination_text_ol: string | null
          physical_dimensions_text_ol: string | null
          preview_url_ol: string | null
          publish_country_code_ol: string | null
          publish_date_text_ol: string | null
          publisher_id: string | null
          serial_enumeration_chronology_text: string | null
          series_id: string | null
          series_number: string | null
          series_title_ol: string | null
          source_records_ol: Json | null
          target_audience_text_ol: string | null
          translation_of_text_ol: string | null
          updated_at: string
          weight_grams_ol: number | null
        }
        Insert: {
          book_id?: string | null
          by_statement_ol?: string | null
          contributors_ol?: Json | null
          created_at?: string
          description_ol?: string | null
          ebook_preview_urls_ol?: Json | null
          edition_cover_image_url?: string | null
          edition_ebook_access_ol?: string | null
          edition_id?: string
          edition_statement_text_ol?: string | null
          edition_subtitle_ol?: string | null
          edition_title_ol?: string | null
          info_url_ol?: string | null
          isbn10_ol?: string | null
          isbn13_ol?: string | null
          item_specific_format_type_id?: string | null
          item_url_ol?: string | null
          number_of_pages_ol?: number | null
          open_library_edition_key?: string | null
          pagination_text_ol?: string | null
          physical_dimensions_text_ol?: string | null
          preview_url_ol?: string | null
          publish_country_code_ol?: string | null
          publish_date_text_ol?: string | null
          publisher_id?: string | null
          serial_enumeration_chronology_text?: string | null
          series_id?: string | null
          series_number?: string | null
          series_title_ol?: string | null
          source_records_ol?: Json | null
          target_audience_text_ol?: string | null
          translation_of_text_ol?: string | null
          updated_at?: string
          weight_grams_ol?: number | null
        }
        Update: {
          book_id?: string | null
          by_statement_ol?: string | null
          contributors_ol?: Json | null
          created_at?: string
          description_ol?: string | null
          ebook_preview_urls_ol?: Json | null
          edition_cover_image_url?: string | null
          edition_ebook_access_ol?: string | null
          edition_id?: string
          edition_statement_text_ol?: string | null
          edition_subtitle_ol?: string | null
          edition_title_ol?: string | null
          info_url_ol?: string | null
          isbn10_ol?: string | null
          isbn13_ol?: string | null
          item_specific_format_type_id?: string | null
          item_url_ol?: string | null
          number_of_pages_ol?: number | null
          open_library_edition_key?: string | null
          pagination_text_ol?: string | null
          physical_dimensions_text_ol?: string | null
          preview_url_ol?: string | null
          publish_country_code_ol?: string | null
          publish_date_text_ol?: string | null
          publisher_id?: string | null
          serial_enumeration_chronology_text?: string | null
          series_id?: string | null
          series_number?: string | null
          series_title_ol?: string | null
          source_records_ol?: Json | null
          target_audience_text_ol?: string | null
          translation_of_text_ol?: string | null
          updated_at?: string
          weight_grams_ol?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "editions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "editions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "editions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "view_book_inventory_summary"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "editions_item_specific_format_type_id_fkey"
            columns: ["item_specific_format_type_id"]
            isOneToOne: false
            referencedRelation: "item_types"
            referencedColumns: ["item_type_id"]
          },
          {
            foreignKeyName: "editions_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["publisher_id"]
          },
          {
            foreignKeyName: "editions_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["series_id"]
          },
        ]
      }
      external_identifiers: {
        Row: {
          created_at: string
          edition_id: string
          identifier_id: string
          identifier_type: string
          identifier_value: string
        }
        Insert: {
          created_at?: string
          edition_id: string
          identifier_id?: string
          identifier_type: string
          identifier_value: string
        }
        Update: {
          created_at?: string
          edition_id?: string
          identifier_id?: string
          identifier_type?: string
          identifier_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_identifiers_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "external_identifiers_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          description: string | null
          genre_id: string
          name: string | null
          source_subject_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          genre_id?: string
          name?: string | null
          source_subject_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          genre_id?: string
          name?: string | null
          source_subject_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "genres_source_subject_id_fkey"
            columns: ["source_subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["subject_id"]
          },
        ]
      }
      import_batches: {
        Row: {
          batch_id: string
          batch_name: string
          completed_at: string | null
          created_at: string | null
          error_summary: Json | null
          failed_records: number | null
          imported_by: string | null
          processed_records: number | null
          source_file: string | null
          started_at: string | null
          status: string | null
          successful_records: number | null
          total_records: number | null
        }
        Insert: {
          batch_id?: string
          batch_name: string
          completed_at?: string | null
          created_at?: string | null
          error_summary?: Json | null
          failed_records?: number | null
          imported_by?: string | null
          processed_records?: number | null
          source_file?: string | null
          started_at?: string | null
          status?: string | null
          successful_records?: number | null
          total_records?: number | null
        }
        Update: {
          batch_id?: string
          batch_name?: string
          completed_at?: string | null
          created_at?: string | null
          error_summary?: Json | null
          failed_records?: number | null
          imported_by?: string | null
          processed_records?: number | null
          source_file?: string | null
          started_at?: string | null
          status?: string | null
          successful_records?: number | null
          total_records?: number | null
        }
        Relationships: []
      }
      import_errors: {
        Row: {
          batch_id: string | null
          created_at: string | null
          error_id: string
          error_message: string | null
          error_type: string | null
          record_data: Json | null
          record_identifier: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          error_id?: string
          error_message?: string | null
          error_type?: string | null
          record_data?: Json | null
          record_identifier?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          error_id?: string
          error_message?: string | null
          error_type?: string | null
          record_data?: Json | null
          record_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_errors_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["batch_id"]
          },
        ]
      }
      item_types: {
        Row: {
          created_at: string
          description: string | null
          item_type_id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          item_type_id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          item_type_id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string | null
          created_at: string
          language_id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          language_id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          language_id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      listing_price_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          currency_code: string | null
          end_date: string | null
          history_id: string
          marketplace_id: string | null
          price_amount: number | null
          start_date: string | null
          stock_item_id: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          currency_code?: string | null
          end_date?: string | null
          history_id?: string
          marketplace_id?: string | null
          price_amount?: number | null
          start_date?: string | null
          stock_item_id?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          currency_code?: string | null
          end_date?: string | null
          history_id?: string
          marketplace_id?: string | null
          price_amount?: number | null
          start_date?: string | null
          stock_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_price_history_marketplace_id_fkey"
            columns: ["marketplace_id"]
            isOneToOne: false
            referencedRelation: "marketplaces"
            referencedColumns: ["marketplace_id"]
          },
          {
            foreignKeyName: "listing_price_history_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      market_pricing_data: {
        Row: {
          condition_id: string | null
          created_at: string | null
          currency_code: string | null
          dust_jacket_condition: string | null
          edition_id: string | null
          external_reference_id: string | null
          is_first_edition: boolean | null
          is_library_copy: boolean | null
          is_signed: boolean | null
          listing_duration_days: number | null
          marketplace_id: string | null
          price_amount: number
          price_date: string
          price_type: string
          pricing_attributes: Json | null
          pricing_id: string
          source_stock_item_id: string | null
          source_type: string | null
        }
        Insert: {
          condition_id?: string | null
          created_at?: string | null
          currency_code?: string | null
          dust_jacket_condition?: string | null
          edition_id?: string | null
          external_reference_id?: string | null
          is_first_edition?: boolean | null
          is_library_copy?: boolean | null
          is_signed?: boolean | null
          listing_duration_days?: number | null
          marketplace_id?: string | null
          price_amount: number
          price_date: string
          price_type: string
          pricing_attributes?: Json | null
          pricing_id?: string
          source_stock_item_id?: string | null
          source_type?: string | null
        }
        Update: {
          condition_id?: string | null
          created_at?: string | null
          currency_code?: string | null
          dust_jacket_condition?: string | null
          edition_id?: string | null
          external_reference_id?: string | null
          is_first_edition?: boolean | null
          is_library_copy?: boolean | null
          is_signed?: boolean | null
          listing_duration_days?: number | null
          marketplace_id?: string | null
          price_amount?: number
          price_date?: string
          price_type?: string
          pricing_attributes?: Json | null
          pricing_id?: string
          source_stock_item_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_pricing_data_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "condition_standards"
            referencedColumns: ["condition_id"]
          },
          {
            foreignKeyName: "market_pricing_data_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "market_pricing_data_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "market_pricing_data_marketplace_id_fkey"
            columns: ["marketplace_id"]
            isOneToOne: false
            referencedRelation: "marketplaces"
            referencedColumns: ["marketplace_id"]
          },
          {
            foreignKeyName: "market_pricing_data_source_stock_item_id_fkey"
            columns: ["source_stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      marketplace_condition_mappings: {
        Row: {
          condition_id: string | null
          created_at: string | null
          mapping_id: string
          marketplace_code: string | null
          marketplace_id: string | null
          marketplace_name: string | null
        }
        Insert: {
          condition_id?: string | null
          created_at?: string | null
          mapping_id?: string
          marketplace_code?: string | null
          marketplace_id?: string | null
          marketplace_name?: string | null
        }
        Update: {
          condition_id?: string | null
          created_at?: string | null
          mapping_id?: string
          marketplace_code?: string | null
          marketplace_id?: string | null
          marketplace_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_condition_mappings_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "condition_standards"
            referencedColumns: ["condition_id"]
          },
          {
            foreignKeyName: "marketplace_condition_mappings_marketplace_id_fkey"
            columns: ["marketplace_id"]
            isOneToOne: false
            referencedRelation: "marketplaces"
            referencedColumns: ["marketplace_id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          created_at: string | null
          currency_code: string | null
          current_price: number | null
          last_synced_at: string | null
          listed_at: string | null
          listing_id: string
          listing_url: string | null
          marketplace_id: string | null
          marketplace_listing_id: string | null
          marketplace_sku: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          stock_item_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency_code?: string | null
          current_price?: number | null
          last_synced_at?: string | null
          listed_at?: string | null
          listing_id?: string
          listing_url?: string | null
          marketplace_id?: string | null
          marketplace_listing_id?: string | null
          marketplace_sku?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_item_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency_code?: string | null
          current_price?: number | null
          last_synced_at?: string | null
          listed_at?: string | null
          listing_id?: string
          listing_url?: string | null
          marketplace_id?: string | null
          marketplace_listing_id?: string | null
          marketplace_sku?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_item_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_marketplace_id_fkey"
            columns: ["marketplace_id"]
            isOneToOne: false
            referencedRelation: "marketplaces"
            referencedColumns: ["marketplace_id"]
          },
          {
            foreignKeyName: "marketplace_listings_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      marketplaces: {
        Row: {
          api_endpoint: string | null
          code: string | null
          created_at: string | null
          is_active: boolean | null
          marketplace_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          code?: string | null
          created_at?: string | null
          is_active?: boolean | null
          marketplace_id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          code?: string | null
          created_at?: string | null
          is_active?: boolean | null
          marketplace_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          catalog_updates: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          inventory_alerts: boolean | null
          marketing_emails: boolean | null
          system_announcements: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          catalog_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          inventory_alerts?: boolean | null
          marketing_emails?: boolean | null
          system_announcements?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          catalog_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          inventory_alerts?: boolean | null
          marketing_emails?: boolean | null
          system_announcements?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          created_at: string | null
          id: string
          locale: string | null
          organization_id: string
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          locale?: string | null
          organization_id: string
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          locale?: string | null
          organization_id?: string
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_users: {
        Row: {
          created_at: string
          first_name: string | null
          last_name: string | null
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          organization_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          amazon_refresh_token: string | null
          created_at: string
          created_by: string | null
          ebay_refresh_token: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          amazon_refresh_token?: string | null
          created_at?: string
          created_by?: string | null
          ebay_refresh_token?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          amazon_refresh_token?: string | null
          created_at?: string
          created_by?: string | null
          ebay_refresh_token?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      photos_extraction: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          storage_url: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          storage_url?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          storage_url?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_extraction_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          created_at: string
          name: string | null
          place_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          name?: string | null
          place_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          name?: string | null
          place_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_attribute_impacts: {
        Row: {
          attribute_name: string | null
          attribute_value: string | null
          avg_price_multiplier: number | null
          book_id: string | null
          calculation_period_end: string | null
          calculation_period_start: string | null
          confidence_level: number | null
          created_at: string | null
          impact_id: string
          last_calculated: string | null
          sample_size: number | null
        }
        Insert: {
          attribute_name?: string | null
          attribute_value?: string | null
          avg_price_multiplier?: number | null
          book_id?: string | null
          calculation_period_end?: string | null
          calculation_period_start?: string | null
          confidence_level?: number | null
          created_at?: string | null
          impact_id?: string
          last_calculated?: string | null
          sample_size?: number | null
        }
        Update: {
          attribute_name?: string | null
          attribute_value?: string | null
          avg_price_multiplier?: number | null
          book_id?: string | null
          calculation_period_end?: string | null
          calculation_period_start?: string | null
          confidence_level?: number | null
          created_at?: string | null
          impact_id?: string
          last_calculated?: string | null
          sample_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_attribute_impacts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "pricing_attribute_impacts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "pricing_attribute_impacts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "view_book_inventory_summary"
            referencedColumns: ["book_id"]
          },
        ]
      }
      printings: {
        Row: {
          created_at: string | null
          edition_id: string | null
          estimated_print_run: number | null
          identifying_points: Json | null
          notes: string | null
          printing_id: string
          printing_name: string | null
          printing_number: number | null
          publication_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          edition_id?: string | null
          estimated_print_run?: number | null
          identifying_points?: Json | null
          notes?: string | null
          printing_id?: string
          printing_name?: string | null
          printing_number?: number | null
          publication_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          edition_id?: string | null
          estimated_print_run?: number | null
          identifying_points?: Json | null
          notes?: string | null
          printing_id?: string
          printing_name?: string | null
          printing_number?: number | null
          publication_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "printings_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "printings_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      publishers: {
        Row: {
          created_at: string
          name: string | null
          publisher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          name?: string | null
          publisher_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          name?: string | null
          publisher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          ip_address: unknown | null
          log_id: string
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          ip_address?: unknown | null
          log_id?: string
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          ip_address?: unknown | null
          log_id?: string
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string | null
          description: string | null
          series_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          series_id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          series_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staging_amazon_import: {
        Row: {
          asin1: string | null
          author: string | null
          author_1: string | null
          author_2: string | null
          author_3: string | null
          author_4: string | null
          author1_name_final: string | null
          author1_name_final_clean: string | null
          author1_role_final: string | null
          author2_name_final: string | null
          author2_name_final_clean: string | null
          author2_role_final: string | null
          author3_name_final: string | null
          author3_name_final_clean: string | null
          author3_role_final: string | null
          author4_name_final: string | null
          author4_name_final_clean: string | null
          author4_role_final: string | null
          author5_name_final: string | null
          author5_name_final_clean: string | null
          author5_role_final: string | null
          author6_name_final: string | null
          author6_name_final_clean: string | null
          author6_role_final: string | null
          binding: string | null
          binding_final: string | null
          brand_name: string | null
          category: string | null
          category_final: string | null
          condition_final: string | null
          condition_note: string | null
          condition_notes_final: string | null
          copyright: string | null
          created_at: string | null
          created_stock_item_id: string | null
          dimensions: string | null
          dimensions_final: string | null
          dust_jacket_final: string | null
          edition: string | null
          error_details: Json | null
          external_product_id: string | null
          external_product_id_type: string | null
          first_edition_final: string | null
          fulfillment_channel: string | null
          genre: string | null
          has_enhanced_data: string | null
          has_errors: boolean | null
          image_url_final: string | null
          "image-url": string | null
          inventory_notes_final: string | null
          isbn10_final: string | null
          isbn13_final: string | null
          item_condition: string | null
          item_description: string | null
          item_is_marketplace: string | null
          item_name: string | null
          item_note: string | null
          key_product_features: string | null
          keywords: string | null
          keywords_final: string | null
          language: string | null
          language_final: string | null
          listing_id: string | null
          manufacturer: string | null
          match_confidence_score: number | null
          match_type: string | null
          matched_book_id: string | null
          matched_edition_id: string | null
          merchant_shipping_group: string | null
          open_date: string | null
          original_author: string | null
          original_binding: string | null
          original_condition_note: string | null
          original_item_description: string | null
          original_item_name: string | null
          original_item_note: string | null
          original_publication_date: string | null
          original_publisher: string | null
          pages: string | null
          pages_final: string | null
          price: string | null
          processed: boolean | null
          processing_stage: string | null
          product_description: string | null
          product_id: string | null
          product_id_type: string | null
          product_type: string | null
          publication_date: string | null
          publication_year_final: string | null
          publisher: string | null
          publisher_final: string | null
          publisher_final_clean: string | null
          quantity: string | null
          row_id: number
          seller_sku: string | null
          series_number_final: string | null
          series_title: string | null
          series_title_final: string | null
          series_title_final_clean: string | null
          signed_final: string | null
          size: string | null
          status: string | null
          subject_keyword: string | null
          subtitle_final: string | null
          title: string | null
          title_final: string | null
          title_final_clean: string | null
          title_for_lookup: string | null
          weight: string | null
          weight_final: string | null
          zshop_shipping_fee: string | null
        }
        Insert: {
          asin1?: string | null
          author?: string | null
          author_1?: string | null
          author_2?: string | null
          author_3?: string | null
          author_4?: string | null
          author1_name_final?: string | null
          author1_name_final_clean?: string | null
          author1_role_final?: string | null
          author2_name_final?: string | null
          author2_name_final_clean?: string | null
          author2_role_final?: string | null
          author3_name_final?: string | null
          author3_name_final_clean?: string | null
          author3_role_final?: string | null
          author4_name_final?: string | null
          author4_name_final_clean?: string | null
          author4_role_final?: string | null
          author5_name_final?: string | null
          author5_name_final_clean?: string | null
          author5_role_final?: string | null
          author6_name_final?: string | null
          author6_name_final_clean?: string | null
          author6_role_final?: string | null
          binding?: string | null
          binding_final?: string | null
          brand_name?: string | null
          category?: string | null
          category_final?: string | null
          condition_final?: string | null
          condition_note?: string | null
          condition_notes_final?: string | null
          copyright?: string | null
          created_at?: string | null
          created_stock_item_id?: string | null
          dimensions?: string | null
          dimensions_final?: string | null
          dust_jacket_final?: string | null
          edition?: string | null
          error_details?: Json | null
          external_product_id?: string | null
          external_product_id_type?: string | null
          first_edition_final?: string | null
          fulfillment_channel?: string | null
          genre?: string | null
          has_enhanced_data?: string | null
          has_errors?: boolean | null
          image_url_final?: string | null
          "image-url"?: string | null
          inventory_notes_final?: string | null
          isbn10_final?: string | null
          isbn13_final?: string | null
          item_condition?: string | null
          item_description?: string | null
          item_is_marketplace?: string | null
          item_name?: string | null
          item_note?: string | null
          key_product_features?: string | null
          keywords?: string | null
          keywords_final?: string | null
          language?: string | null
          language_final?: string | null
          listing_id?: string | null
          manufacturer?: string | null
          match_confidence_score?: number | null
          match_type?: string | null
          matched_book_id?: string | null
          matched_edition_id?: string | null
          merchant_shipping_group?: string | null
          open_date?: string | null
          original_author?: string | null
          original_binding?: string | null
          original_condition_note?: string | null
          original_item_description?: string | null
          original_item_name?: string | null
          original_item_note?: string | null
          original_publication_date?: string | null
          original_publisher?: string | null
          pages?: string | null
          pages_final?: string | null
          price?: string | null
          processed?: boolean | null
          processing_stage?: string | null
          product_description?: string | null
          product_id?: string | null
          product_id_type?: string | null
          product_type?: string | null
          publication_date?: string | null
          publication_year_final?: string | null
          publisher?: string | null
          publisher_final?: string | null
          publisher_final_clean?: string | null
          quantity?: string | null
          row_id?: number
          seller_sku?: string | null
          series_number_final?: string | null
          series_title?: string | null
          series_title_final?: string | null
          series_title_final_clean?: string | null
          signed_final?: string | null
          size?: string | null
          status?: string | null
          subject_keyword?: string | null
          subtitle_final?: string | null
          title?: string | null
          title_final?: string | null
          title_final_clean?: string | null
          title_for_lookup?: string | null
          weight?: string | null
          weight_final?: string | null
          zshop_shipping_fee?: string | null
        }
        Update: {
          asin1?: string | null
          author?: string | null
          author_1?: string | null
          author_2?: string | null
          author_3?: string | null
          author_4?: string | null
          author1_name_final?: string | null
          author1_name_final_clean?: string | null
          author1_role_final?: string | null
          author2_name_final?: string | null
          author2_name_final_clean?: string | null
          author2_role_final?: string | null
          author3_name_final?: string | null
          author3_name_final_clean?: string | null
          author3_role_final?: string | null
          author4_name_final?: string | null
          author4_name_final_clean?: string | null
          author4_role_final?: string | null
          author5_name_final?: string | null
          author5_name_final_clean?: string | null
          author5_role_final?: string | null
          author6_name_final?: string | null
          author6_name_final_clean?: string | null
          author6_role_final?: string | null
          binding?: string | null
          binding_final?: string | null
          brand_name?: string | null
          category?: string | null
          category_final?: string | null
          condition_final?: string | null
          condition_note?: string | null
          condition_notes_final?: string | null
          copyright?: string | null
          created_at?: string | null
          created_stock_item_id?: string | null
          dimensions?: string | null
          dimensions_final?: string | null
          dust_jacket_final?: string | null
          edition?: string | null
          error_details?: Json | null
          external_product_id?: string | null
          external_product_id_type?: string | null
          first_edition_final?: string | null
          fulfillment_channel?: string | null
          genre?: string | null
          has_enhanced_data?: string | null
          has_errors?: boolean | null
          image_url_final?: string | null
          "image-url"?: string | null
          inventory_notes_final?: string | null
          isbn10_final?: string | null
          isbn13_final?: string | null
          item_condition?: string | null
          item_description?: string | null
          item_is_marketplace?: string | null
          item_name?: string | null
          item_note?: string | null
          key_product_features?: string | null
          keywords?: string | null
          keywords_final?: string | null
          language?: string | null
          language_final?: string | null
          listing_id?: string | null
          manufacturer?: string | null
          match_confidence_score?: number | null
          match_type?: string | null
          matched_book_id?: string | null
          matched_edition_id?: string | null
          merchant_shipping_group?: string | null
          open_date?: string | null
          original_author?: string | null
          original_binding?: string | null
          original_condition_note?: string | null
          original_item_description?: string | null
          original_item_name?: string | null
          original_item_note?: string | null
          original_publication_date?: string | null
          original_publisher?: string | null
          pages?: string | null
          pages_final?: string | null
          price?: string | null
          processed?: boolean | null
          processing_stage?: string | null
          product_description?: string | null
          product_id?: string | null
          product_id_type?: string | null
          product_type?: string | null
          publication_date?: string | null
          publication_year_final?: string | null
          publisher?: string | null
          publisher_final?: string | null
          publisher_final_clean?: string | null
          quantity?: string | null
          row_id?: number
          seller_sku?: string | null
          series_number_final?: string | null
          series_title?: string | null
          series_title_final?: string | null
          series_title_final_clean?: string | null
          signed_final?: string | null
          size?: string | null
          status?: string | null
          subject_keyword?: string | null
          subtitle_final?: string | null
          title?: string | null
          title_final?: string | null
          title_final_clean?: string | null
          title_for_lookup?: string | null
          weight?: string | null
          weight_final?: string | null
          zshop_shipping_fee?: string | null
        }
        Relationships: []
      }
      stock_item_attributes: {
        Row: {
          attribute_id: string
          attribute_type_id: string | null
          boolean_value: boolean | null
          created_at: string | null
          date_value: string | null
          notes: string | null
          numeric_value: number | null
          stock_item_id: string | null
          text_value: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          attribute_id?: string
          attribute_type_id?: string | null
          boolean_value?: boolean | null
          created_at?: string | null
          date_value?: string | null
          notes?: string | null
          numeric_value?: number | null
          stock_item_id?: string | null
          text_value?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          attribute_id?: string
          attribute_type_id?: string | null
          boolean_value?: boolean | null
          created_at?: string | null
          date_value?: string | null
          notes?: string | null
          numeric_value?: number | null
          stock_item_id?: string | null
          text_value?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_item_attributes_attribute_type_id_fkey"
            columns: ["attribute_type_id"]
            isOneToOne: false
            referencedRelation: "attribute_types"
            referencedColumns: ["attribute_type_id"]
          },
          {
            foreignKeyName: "stock_item_attributes_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["stock_item_id"]
          },
        ]
      }
      stock_items: {
        Row: {
          added_by_user_id: string | null
          attributes_cache: Json | null
          condition_description: string | null
          condition_id: string | null
          copy_number_text: string | null
          created_at: string
          date_added_to_stock: string | null
          edition_id: string
          import_batch_id: string | null
          is_active_for_sale: boolean | null
          item_specific_notes: string | null
          location_in_store_text: string | null
          organization_id: string
          printing_id: string | null
          purchase_cost_amount: number | null
          quantity: number | null
          selling_price_amount: number | null
          selling_price_currency: string | null
          sku: string | null
          stock_item_id: string
          supplier_info_text: string | null
          updated_at: string
          variation_notes: Json | null
        }
        Insert: {
          added_by_user_id?: string | null
          attributes_cache?: Json | null
          condition_description?: string | null
          condition_id?: string | null
          copy_number_text?: string | null
          created_at?: string
          date_added_to_stock?: string | null
          edition_id: string
          import_batch_id?: string | null
          is_active_for_sale?: boolean | null
          item_specific_notes?: string | null
          location_in_store_text?: string | null
          organization_id: string
          printing_id?: string | null
          purchase_cost_amount?: number | null
          quantity?: number | null
          selling_price_amount?: number | null
          selling_price_currency?: string | null
          sku?: string | null
          stock_item_id?: string
          supplier_info_text?: string | null
          updated_at?: string
          variation_notes?: Json | null
        }
        Update: {
          added_by_user_id?: string | null
          attributes_cache?: Json | null
          condition_description?: string | null
          condition_id?: string | null
          copy_number_text?: string | null
          created_at?: string
          date_added_to_stock?: string | null
          edition_id?: string
          import_batch_id?: string | null
          is_active_for_sale?: boolean | null
          item_specific_notes?: string | null
          location_in_store_text?: string | null
          organization_id?: string
          printing_id?: string | null
          purchase_cost_amount?: number | null
          quantity?: number | null
          selling_price_amount?: number | null
          selling_price_currency?: string | null
          sku?: string | null
          stock_item_id?: string
          supplier_info_text?: string | null
          updated_at?: string
          variation_notes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "condition_standards"
            referencedColumns: ["condition_id"]
          },
          {
            foreignKeyName: "stock_items_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "stock_items_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "mv_inventory_latest"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "stock_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_printing_id_fkey"
            columns: ["printing_id"]
            isOneToOne: false
            referencedRelation: "printings"
            referencedColumns: ["printing_id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          name: string | null
          source_url_ol: string | null
          subject_id: string
          type_ol: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          name?: string | null
          source_url_ol?: string | null
          subject_id?: string
          type_ol?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          name?: string | null
          source_url_ol?: string | null
          subject_id?: string
          type_ol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_organizations: {
        Row: {
          created_at: string
          id: string
          organizations_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organizations_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organizations_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organizations_id_fkey"
            columns: ["organizations_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          created_at: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      z_test_table: {
        Row: {
          id: number | null
        }
        Insert: {
          id?: number | null
        }
        Update: {
          id?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      bulk_operations_performance: {
        Row: {
          avg_time_per_call: number | null
          calls: number | null
          funcname: unknown | null
          performance_rating: string | null
          schemaname: unknown | null
          self_time: number | null
          total_time: number | null
        }
        Relationships: []
      }
      cataloging_jobs_index_performance: {
        Row: {
          hit_ratio_percent: number | null
          idx_scan: number | null
          idx_tup_fetch: number | null
          idx_tup_read: number | null
          indexname: unknown | null
          schemaname: unknown | null
          usage_level: string | null
        }
        Relationships: []
      }
      cataloging_jobs_index_usage: {
        Row: {
          idx_scan: number | null
          idx_tup_fetch: number | null
          idx_tup_read: number | null
          indexname: unknown | null
          schemaname: unknown | null
          tablename: unknown | null
          usage_level: string | null
        }
        Relationships: []
      }
      cataloging_jobs_table_stats: {
        Row: {
          dead_tuple_ratio_percent: number | null
          dead_tuples: number | null
          deletes: number | null
          inserts: number | null
          last_analyze: string | null
          last_autoanalyze: string | null
          last_autovacuum: string | null
          last_vacuum: string | null
          live_tuples: number | null
          schemaname: unknown | null
          tablename: unknown | null
          updates: number | null
        }
        Relationships: []
      }
      inventory_mv_status: {
        Row: {
          definition: string | null
          ispopulated: boolean | null
          matviewname: unknown | null
          matviewowner: unknown | null
          schemaname: unknown | null
        }
        Relationships: []
      }
      inventory_search_performance: {
        Row: {
          index_name: unknown | null
          scans: number | null
          table_name: unknown | null
          tuples_fetched: number | null
          tuples_read: number | null
          usage_level: string | null
        }
        Relationships: []
      }
      mv_inventory_latest: {
        Row: {
          book_id: string | null
          cover_image_url: string | null
          edition_id: string | null
          isbn10: string | null
          isbn13: string | null
          max_date_added: string | null
          max_price: number | null
          min_price: number | null
          organization_id: string | null
          primary_author: string | null
          published_date: string | null
          publisher_name: string | null
          stock_items: Json | null
          title: string | null
          total_copies: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_critical_alerts: {
        Row: {
          alert_type: string | null
          description: string | null
          detected_at: string | null
          severity: string | null
          value: number | null
        }
        Relationships: []
      }
      outbox_cursor_health: {
        Row: {
          cursor_lag_seconds: number | null
          events_behind_cursor: number | null
          last_processed_at: string | null
          oldest_unprocessed_event: string | null
          organization_id: string | null
          organization_name: string | null
          processor_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      outbox_health_metrics: {
        Row: {
          description: string | null
          metric: string | null
          value: number | null
        }
        Relationships: []
      }
      outbox_index_performance: {
        Row: {
          index_name: unknown | null
          index_size: string | null
          scan_count: number | null
          schemaname: unknown | null
          selectivity_ratio: number | null
          table_name: unknown | null
          total_fetches: number | null
          total_reads: number | null
        }
        Relationships: []
      }
      outbox_org_metrics: {
        Row: {
          avg_delivery_time_seconds: number | null
          events_last_hour: number | null
          oldest_undelivered_age_seconds: number | null
          organization_id: string | null
          organization_name: string | null
          retry_events: number | null
          total_events: number | null
          undelivered_events: number | null
        }
        Relationships: []
      }
      pg_all_foreign_keys: {
        Row: {
          fk_columns: unknown[] | null
          fk_constraint_name: unknown | null
          fk_schema_name: unknown | null
          fk_table_name: unknown | null
          fk_table_oid: unknown | null
          is_deferrable: boolean | null
          is_deferred: boolean | null
          match_type: string | null
          on_delete: string | null
          on_update: string | null
          pk_columns: unknown[] | null
          pk_constraint_name: unknown | null
          pk_index_name: unknown | null
          pk_schema_name: unknown | null
          pk_table_name: unknown | null
          pk_table_oid: unknown | null
        }
        Relationships: []
      }
      tap_funky: {
        Row: {
          args: string | null
          is_definer: boolean | null
          is_strict: boolean | null
          is_visible: boolean | null
          kind: unknown | null
          langoid: unknown | null
          name: unknown | null
          oid: unknown | null
          owner: unknown | null
          returns: string | null
          returns_set: boolean | null
          schema: unknown | null
          volatility: string | null
        }
        Relationships: []
      }
      view_book_inventory_summary: {
        Row: {
          book_id: string | null
          cover_image_url: string | null
          isbn13: string | null
          item_count: number | null
          max_price: number | null
          min_price: number | null
          organization_id: string | null
          primary_author: string | null
          subtitle: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _cleanup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      _contract_on: {
        Args: { "": string }
        Returns: unknown
      }
      _currtest: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      _db_privs: {
        Args: Record<PropertyKey, never>
        Returns: unknown[]
      }
      _definer: {
        Args: { "": unknown }
        Returns: boolean
      }
      _dexists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _expand_context: {
        Args: { "": string }
        Returns: string
      }
      _expand_on: {
        Args: { "": string }
        Returns: string
      }
      _expand_vol: {
        Args: { "": string }
        Returns: string
      }
      _ext_exists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _extensions: {
        Args: Record<PropertyKey, never> | { "": unknown }
        Returns: unknown[]
      }
      _funkargs: {
        Args: { "": unknown[] }
        Returns: string
      }
      _get: {
        Args: { "": string }
        Returns: number
      }
      _get_db_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_dtype: {
        Args: { "": unknown }
        Returns: string
      }
      _get_language_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_latest: {
        Args: { "": string }
        Returns: number[]
      }
      _get_note: {
        Args: { "": number } | { "": string }
        Returns: string
      }
      _get_opclass_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_rel_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_schema_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_tablespace_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_type_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _got_func: {
        Args: { "": unknown }
        Returns: boolean
      }
      _grolist: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      _has_group: {
        Args: { "": unknown }
        Returns: boolean
      }
      _has_role: {
        Args: { "": unknown }
        Returns: boolean
      }
      _has_user: {
        Args: { "": unknown }
        Returns: boolean
      }
      _inherited: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_schema: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_super: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_trusted: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_verbose: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      _lang: {
        Args: { "": unknown }
        Returns: unknown
      }
      _opc_exists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _parts: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      _pg_sv_type_array: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      _prokind: {
        Args: { p_oid: unknown }
        Returns: unknown
      }
      _query: {
        Args: { "": string }
        Returns: string
      }
      _refine_vol: {
        Args: { "": string }
        Returns: string
      }
      _relexists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _returns: {
        Args: { "": unknown }
        Returns: string
      }
      _strict: {
        Args: { "": unknown }
        Returns: boolean
      }
      _table_privs: {
        Args: Record<PropertyKey, never>
        Returns: unknown[]
      }
      _temptypes: {
        Args: { "": string }
        Returns: string
      }
      _todo: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _vol: {
        Args: { "": unknown }
        Returns: string
      }
      add_edition_to_inventory: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_isbn13: string
          p_title: string
          p_subtitle: string
          p_authors: Json
          p_publisher_name: string
          p_publish_date_text: string
          p_page_count: number
          p_format_name: string
          p_language_name: string
          p_image_url: string
          p_condition_id: string
          p_price: number
          p_condition_notes: string
          p_selected_attributes?: string[]
        }
        Returns: string
      }
      add_stock_item_attribute: {
        Args: {
          p_stock_item_id: string
          p_attribute_name: string
          p_value_boolean?: boolean
          p_value_text?: string
          p_value_numeric?: number
          p_value_date?: string
          p_notes?: string
          p_verified_by?: string
        }
        Returns: string
      }
      admin_update_user_metadata: {
        Args: { user_id: string; metadata: Json }
        Returns: undefined
      }
      bulk_update_cataloging_jobs: {
        Args: {
          organization_id: string
          job_count?: number
          new_status?: string
          simulate_processing_time?: boolean
        }
        Returns: Json
      }
      can: {
        Args: { "": unknown[] }
        Returns: string
      }
      casts_are: {
        Args: { "": string[] }
        Returns: string
      }
      clean_text: {
        Args: { input_text: string }
        Returns: string
      }
      col_is_null: {
        Args:
          | {
              schema_name: unknown
              table_name: unknown
              column_name: unknown
              description?: string
            }
          | { table_name: unknown; column_name: unknown; description?: string }
        Returns: string
      }
      col_not_null: {
        Args:
          | {
              schema_name: unknown
              table_name: unknown
              column_name: unknown
              description?: string
            }
          | { table_name: unknown; column_name: unknown; description?: string }
        Returns: string
      }
      collect_tap: {
        Args: Record<PropertyKey, never> | { "": string[] }
        Returns: string
      }
      confirm_event_delivery: {
        Args: { p_event_ids: string[]; p_organization_id: string }
        Returns: {
          confirmed_count: number
          failed_count: number
        }[]
      }
      create_cataloging_job: {
        Args: { image_urls_payload: Json }
        Returns: string
      }
      create_data_quality_flag: {
        Args: {
          p_organization_id: string
          p_table_name: string
          p_record_id: string
          p_flag_type: string
          p_severity: string
          p_field_name?: string
          p_status?: string
          p_description?: string
          p_suggested_value?: Json
          p_details?: Json
        }
        Returns: {
          created_at: string | null
          description: string | null
          details: Json | null
          field_name: string | null
          flag_id: string
          flag_type: string
          flagged_by: string | null
          organization_id: string | null
          original_value: Json | null
          record_id: string
          resolution_notes: string | null
          resolved_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
          suggested_value: Json | null
          table_name: string
        }
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      debug_step_by_step: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_access_token: string
          p_refresh_token: string
          p_expires_in: number
        }
        Returns: Json
      }
      debug_user_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      debug_uuid_comparison: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      delete_cataloging_job_secure: {
        Args: { p_job_id: string; p_user_id: string }
        Returns: boolean
      }
      delete_cataloging_jobs: {
        Args: { job_ids_param: string[]; max_batch_size?: number }
        Returns: {
          deleted_count: number
          invalid_count: number
          deleted_job_ids: string[]
          invalid_job_ids: string[]
        }[]
      }
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      diag: {
        Args:
          | Record<PropertyKey, never>
          | Record<PropertyKey, never>
          | { msg: string }
          | { msg: unknown }
        Returns: string
      }
      diag_test_name: {
        Args: { "": string }
        Returns: string
      }
      do_tap: {
        Args: Record<PropertyKey, never> | { "": string } | { "": unknown }
        Returns: string[]
      }
      domains_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      enums_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      execute_bulk_delete: {
        Args: { job_ids: string[]; batch_size?: number }
        Returns: {
          deleted_count: number
          invalid_count: number
          deleted_job_ids: string[]
          invalid_job_ids: string[]
        }[]
      }
      execute_bulk_retry: {
        Args: { job_ids: string[]; batch_size?: number }
        Returns: {
          retried_count: number
          invalid_count: number
          retried_job_ids: string[]
          invalid_job_ids: string[]
        }[]
      }
      extensions_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      fail: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: string
      }
      finalize_cataloging_job: {
        Args: {
          p_job_id: string
          p_title: string
          p_condition_id: string
          p_price: number
          p_organization_id: string
          p_subtitle?: string
          p_authors?: Json
          p_publisher_name?: string
          p_publication_year?: number
          p_publication_location?: string
          p_edition_statement?: string
          p_has_dust_jacket?: boolean
          p_sku?: string
          p_condition_notes?: string
          p_selected_attributes?: string[]
        }
        Returns: string
      }
      findfuncs: {
        Args: { "": string }
        Returns: string[]
      }
      finish: {
        Args: { exception_on_failure?: boolean }
        Returns: string[]
      }
      foreign_tables_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      functions_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      get_ai_accuracy_dashboard: {
        Args: { org_id: string; days_back?: number }
        Returns: {
          field_name: string
          total_extractions: number
          correction_rate: number
          validation_success_rate: number
          reprocessing_rate: number
          avg_accuracy_score: number
          trend_direction: string
        }[]
      }
      get_book_summary: {
        Args: { book_id_in: string; org_id_in: string }
        Returns: Json
      }
      get_cataloging_job_stats: {
        Args: { org_id: string }
        Returns: {
          total: number
          pending: number
          processing: number
          completed: number
          failed: number
        }[]
      }
      get_cataloging_performance_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_name: string
          metric_value: number
          description: string
        }[]
      }
      get_complete_schema: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_current_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_ebay_token_status: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_edition_details: {
        Args: { p_edition_id: string; p_organization_id: string }
        Returns: Json
      }
      get_edition_details_by_isbn: {
        Args: { p_isbn: string }
        Returns: Json
      }
      get_full_edition_details: {
        Args: { edition_olid_param: string }
        Returns: Json
      }
      get_inventory_search_count: {
        Args: { org_id: string; search_query?: string; filter_type?: string }
        Returns: number
      }
      get_inventory_stats: {
        Args: { org_id: string }
        Returns: {
          total_books: number
          active_listings: number
          needs_photos: number
          unique_editions: number
          amazon_listings: number
          ebay_listings: number
        }[]
      }
      get_inventory_summary_metrics: {
        Args: {
          org_id: string
          search_query?: string
          filter_type?: string
          sort_by?: string
          filters?: Json
        }
        Returns: {
          book_count: number
          total_item_count: number
          total_value_in_cents: number
          needs_photos_count: number
        }[]
      }
      get_or_create_processor_cursor: {
        Args: { p_processor_name: string; p_organization_id: string }
        Returns: {
          last_processed_event_id: string
          last_processed_at: string
        }[]
      }
      get_outbox_health_metrics: {
        Args: { time_window_minutes?: number }
        Returns: Json
      }
      get_paginated_flags: {
        Args: {
          p_organization_id: string
          p_limit: number
          p_offset: number
          p_status?: string
          p_table_name?: string
          p_severity?: string
          p_search?: string
          p_sort_by?: string
          p_sort_dir?: string
        }
        Returns: {
          flag_id: string
          table_name: string
          record_id: string
          field_name: string
          flag_type: string
          severity: string
          status: string
          description: string
          suggested_value: Json
          details: Json
          flagged_by: string
          organization_id: string
          created_at: string
          reviewed_by: string
          resolution_notes: string
          resolved_at: string
          item_title: string
        }[]
      }
      get_processor_cursor: {
        Args: { p_processor_name: string; p_organization_id: string }
        Returns: {
          last_processed_event_id: string
          last_processed_at: string
        }[]
      }
      get_sp_api_token_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_stock_item_details: {
        Args: { stock_item_id_in: string; org_id_in: string }
        Returns: Json
      }
      groups_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_check: {
        Args: { "": unknown }
        Returns: string
      }
      has_composite: {
        Args: { "": unknown }
        Returns: string
      }
      has_domain: {
        Args: { "": unknown }
        Returns: string
      }
      has_enum: {
        Args: { "": unknown }
        Returns: string
      }
      has_extension: {
        Args: { "": unknown }
        Returns: string
      }
      has_fk: {
        Args: { "": unknown }
        Returns: string
      }
      has_foreign_table: {
        Args: { "": unknown }
        Returns: string
      }
      has_function: {
        Args: { "": unknown }
        Returns: string
      }
      has_group: {
        Args: { "": unknown }
        Returns: string
      }
      has_inherited_tables: {
        Args: { "": unknown }
        Returns: string
      }
      has_language: {
        Args: { "": unknown }
        Returns: string
      }
      has_materialized_view: {
        Args: { "": unknown }
        Returns: string
      }
      has_opclass: {
        Args: { "": unknown }
        Returns: string
      }
      has_pk: {
        Args: { "": unknown }
        Returns: string
      }
      has_relation: {
        Args: { "": unknown }
        Returns: string
      }
      has_role: {
        Args: { "": unknown }
        Returns: string
      }
      has_schema: {
        Args: { "": unknown }
        Returns: string
      }
      has_sequence: {
        Args: { "": unknown }
        Returns: string
      }
      has_table: {
        Args: { "": unknown }
        Returns: string
      }
      has_tablespace: {
        Args: { "": unknown }
        Returns: string
      }
      has_type: {
        Args: { "": unknown }
        Returns: string
      }
      has_unique: {
        Args: { "": string }
        Returns: string
      }
      has_user: {
        Args: { "": unknown }
        Returns: string
      }
      has_view: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_composite: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_domain: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_enum: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_extension: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_fk: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_foreign_table: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_function: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_group: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_inherited_tables: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_language: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_materialized_view: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_opclass: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_pk: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_relation: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_role: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_schema: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_sequence: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_table: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_tablespace: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_type: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_user: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_view: {
        Args: { "": unknown }
        Returns: string
      }
      import_authors: {
        Args: { p_batch_id: string }
        Returns: {
          created_count: number
          existing_count: number
        }[]
      }
      import_authors_step1: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_count: number
        }[]
      }
      import_authors_step2: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_count: number
        }[]
      }
      import_authors_step3: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_count: number
        }[]
      }
      import_authors_step4: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_count: number
        }[]
      }
      import_authors_step5: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_count: number
        }[]
      }
      import_authors_step6: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_count: number
        }[]
      }
      import_publishers: {
        Args: { p_batch_id: string }
        Returns: {
          created_count: number
          existing_count: number
        }[]
      }
      import_series: {
        Args: { p_batch_id: string }
        Returns: {
          created_count: number
          existing_count: number
        }[]
      }
      in_todo: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      index_is_primary: {
        Args: { "": unknown }
        Returns: string
      }
      index_is_unique: {
        Args: { "": unknown }
        Returns: string
      }
      is_aggregate: {
        Args: { "": unknown }
        Returns: string
      }
      is_clustered: {
        Args: { "": unknown }
        Returns: string
      }
      is_definer: {
        Args: { "": unknown }
        Returns: string
      }
      is_empty: {
        Args: { "": string }
        Returns: string
      }
      is_normal_function: {
        Args: { "": unknown }
        Returns: string
      }
      is_partitioned: {
        Args: { "": unknown }
        Returns: string
      }
      is_procedure: {
        Args: { "": unknown }
        Returns: string
      }
      is_strict: {
        Args: { "": unknown }
        Returns: string
      }
      is_superuser: {
        Args: { "": unknown }
        Returns: string
      }
      is_window: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_aggregate: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_definer: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_empty: {
        Args: { "": string }
        Returns: string
      }
      isnt_normal_function: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_partitioned: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_procedure: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_strict: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_superuser: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_window: {
        Args: { "": unknown }
        Returns: string
      }
      language_is_trusted: {
        Args: { "": unknown }
        Returns: string
      }
      languages_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      lives_ok: {
        Args: { "": string }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
      manual_refresh_inventory_latest: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      match_book_by_details: {
        Args: {
          p_title: string
          p_author_name: string
          p_publication_year: number
        }
        Returns: string[]
      }
      materialized_views_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      migrate_failed_events_to_dlq: {
        Args: { max_delivery_attempts?: number }
        Returns: {
          moved_count: number
          affected_organizations: string[]
        }[]
      }
      migrate_stock_item_attributes: {
        Args: Record<PropertyKey, never>
        Returns: {
          migrated_signed: number
          migrated_first_edition: number
          migrated_library: number
          migrated_dust_jacket: number
        }[]
      }
      no_plan: {
        Args: Record<PropertyKey, never>
        Returns: boolean[]
      }
      normalize_isbn: {
        Args: { asin_value: string }
        Returns: string
      }
      num_failed: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      ok: {
        Args: { "": boolean }
        Returns: string
      }
      opclasses_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      operators_are: {
        Args: { "": string[] }
        Returns: string
      }
      os_name: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      parse_boolean: {
        Args: { input_text: string }
        Returns: boolean
      }
      pass: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: string
      }
      pg_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      pg_version_num: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      pgtap_version: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      plan: {
        Args: { "": number }
        Returns: string
      }
      prepare_bulk_operations_statements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_staging_records: {
        Args: {
          p_organization_id: string
          p_batch_id: string
          p_limit?: number
        }
        Returns: {
          processed_count: number
          success_count: number
          error_count: number
        }[]
      }
      prune_delivered_events: {
        Args: { retention_hours?: number; max_batch_size?: number }
        Returns: {
          deleted_count: number
          execution_time_ms: number
          oldest_remaining_hours: number
        }[]
      }
      refresh_inventory_latest: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      retry_cataloging_jobs: {
        Args: { job_ids_param: string[]; max_batch_size?: number }
        Returns: {
          retried_count: number
          invalid_count: number
          retried_job_ids: string[]
          invalid_job_ids: string[]
        }[]
      }
      roles_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      run_system_health_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          component: string
          status: string
          details: string
          recommendation: string
        }[]
      }
      runtests: {
        Args: Record<PropertyKey, never> | { "": string } | { "": unknown }
        Returns: string[]
      }
      safe_to_numeric: {
        Args: { input_text: string }
        Returns: number
      }
      schemas_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      search_books_fuzzy: {
        Args: { p_query: string }
        Returns: {
          edition_id: string
          title: string
          authors: Json
          similarity: number
        }[]
      }
      search_inventory: {
        Args: {
          p_org_id: string
          p_search_query?: string
          p_filter_type?: string
          p_sort_by?: string
          p_filters?: Json
          p_limit_count?: number
          p_last_date_added?: string
          p_last_edition_id?: string
        }
        Returns: {
          edition_id: string
          book_id: string
          title: string
          primary_author: string
          cover_image_url: string
          isbn13: string
          isbn10: string
          publisher_name: string
          published_date: string
          total_copies: number
          min_price: number
          max_price: number
          stock_items: Json
          max_date_added: string
        }[]
      }
      sequences_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      skip: {
        Args:
          | { "": number }
          | { "": string }
          | { why: string; how_many: number }
        Returns: string
      }
      tables_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      tablespaces_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      throws_ok: {
        Args: { "": string }
        Returns: string
      }
      todo: {
        Args:
          | { how_many: number }
          | { how_many: number; why: string }
          | { why: string }
          | { why: string; how_many: number }
        Returns: boolean[]
      }
      todo_end: {
        Args: Record<PropertyKey, never>
        Returns: boolean[]
      }
      todo_start: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: boolean[]
      }
      types_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      update_ebay_access_token: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_access_token: string
          p_expires_in: number
        }
        Returns: Json
      }
      update_flag_status: {
        Args: {
          p_organization_id: string
          p_flag_id: string
          p_status: string
          p_resolution_notes?: string
          p_reviewed_by?: string
        }
        Returns: {
          created_at: string | null
          description: string | null
          details: Json | null
          field_name: string | null
          flag_id: string
          flag_type: string
          flagged_by: string | null
          organization_id: string | null
          original_value: Json | null
          record_id: string
          resolution_notes: string | null
          resolved_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
          suggested_value: Json | null
          table_name: string
        }
      }
      update_processor_cursor: {
        Args: {
          p_processor_name: string
          p_organization_id: string
          p_last_processed_event_id: string
        }
        Returns: boolean
      }
      update_stock_item_details: {
        Args: {
          p_stock_item_id: string
          p_organization_id: string
          p_condition_id: string
          p_sku: string
          p_location_in_store_text: string
          p_condition_notes: string
          p_internal_notes: string
        }
        Returns: undefined
      }
      upsert_ebay_tokens: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_access_token: string
          p_refresh_token: string
          p_expires_in: number
        }
        Returns: Json
      }
      users_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      views_are: {
        Args: { "": unknown[] }
        Returns: string
      }
    }
    Enums: {
      cataloging_job_status: "pending" | "processing" | "completed" | "failed"
      listing_status:
        | "active"
        | "inactive"
        | "sold"
        | "pending"
        | "error"
        | "draft"
        | "archived"
    }
    CompositeTypes: {
      _time_trial_type: {
        a_time: number | null
      }
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
      cataloging_job_status: ["pending", "processing", "completed", "failed"],
      listing_status: [
        "active",
        "inactive",
        "sold",
        "pending",
        "error",
        "draft",
        "archived",
      ],
    },
  },
} as const
