export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          id: string;
          name: string;
          resource_type: string;
          status: string;
          latitude: number;
          longitude: number;
          availability: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          resource_type: string;
          status: string;
          latitude: number;
          longitude: number;
          availability?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          resource_type?: string;
          status?: string;
          latitude?: number;
          longitude?: number;
          availability?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          incident_type: string;
          severity: string;
          status: string;
          latitude: number;
          longitude: number;
          reported_by: string | null;
          assigned_resource: string | null;
          priority_score: number | null;
          ai_summary: string | null;
          recommended_resource_type: string | null;
          ai_confidence: number | null;
          assigned_at: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          incident_type: string;
          severity: string;
          status: string;
          latitude: number;
          longitude: number;
          reported_by?: string | null;
          assigned_resource?: string | null;
          priority_score?: number | null;
          ai_summary?: string | null;
          recommended_resource_type?: string | null;
          ai_confidence?: number | null;
          assigned_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          incident_type?: string;
          severity?: string;
          status?: string;
          latitude?: number;
          longitude?: number;
          reported_by?: string | null;
          assigned_resource?: string | null;
          priority_score?: number | null;
          ai_summary?: string | null;
          recommended_resource_type?: string | null;
          ai_confidence?: number | null;
          assigned_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incidents_assigned_resource_fkey";
            columns: ["assigned_resource"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          }
        ];
      };
      alerts: {
        Row: {
          id: string;
          title: string;
          message: string | null;
          severity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message?: string | null;
          severity: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string | null;
          severity?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender: string;
          content: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          sender: string;
          content: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          sender?: string;
          content?: string;
          timestamp?: string;
        };
        Relationships: [];
      };
      incident_events: {
        Row: {
          id: string;
          incident_id: string;
          event_type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          event_type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string;
          event_type?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incident_events_incident_id_fkey";
            columns: ["incident_id"];
            isOneToOne: false;
            referencedRelation: "incidents";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
