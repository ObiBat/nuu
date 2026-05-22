import type { CharacterPalette } from "@/lib/character";

export type ProfileLinks = {
  site?: string;
  github?: string;
  linkedin?: string;
  x?: string;
  email?: string;
};

type ProfileRow = {
  user_id: string;
  member_number: number;
  display_name: string;
  role: string;
  location: string;
  bio: string;
  slug: string | null;
  character: CharacterPalette;
  links: ProfileLinks;
  avatar_url: string | null;
  is_admin: boolean;
  character_preset: string;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  city: string;
  starts_at: string;
  capacity: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type EventInsert = {
  id?: string;
  slug?: string | null;
  title: string;
  description?: string;
  city?: string;
  starts_at: string;
  capacity?: number;
  created_by?: string | null;
};

type EventUpdate = Partial<EventInsert>;

type EventRsvpRow = {
  event_id: string;
  user_id: string;
  created_at: string;
};

type EventRsvpInsert = {
  event_id: string;
  user_id: string;
  created_at?: string;
};

type PostRow = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type PostInsert = {
  id?: string;
  author_id: string;
  body: string;
  created_at?: string;
};

export type ContributionStatus = "draft" | "submitted" | "published" | "rejected";

type ContributionRow = {
  id: string;
  author_id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  body_md: string;
  read_minutes: number;
  status: ContributionStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

type ContributionInsert = {
  id?: string;
  author_id: string;
  slug: string;
  title: string;
  excerpt?: string;
  tag?: string;
  body_md?: string;
  read_minutes?: number;
  status?: ContributionStatus;
  published_at?: string | null;
};

type ContributionUpdate = Partial<Omit<ContributionInsert, "author_id">>;

type NewsletterRow = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

type NewsletterInsert = {
  id?: string;
  email: string;
  source?: string;
  created_at?: string;
};

type ProfileInsert = {
  user_id: string;
  member_number?: number;
  display_name?: string;
  role?: string;
  location?: string;
  bio?: string;
  slug?: string | null;
  character?: CharacterPalette;
  links?: ProfileLinks;
  avatar_url?: string | null;
  is_admin?: boolean;
  character_preset?: string;
  created_at?: string;
  updated_at?: string;
};

type ProfileUpdate = {
  user_id?: string;
  member_number?: number;
  display_name?: string;
  role?: string;
  location?: string;
  bio?: string;
  slug?: string | null;
  character?: CharacterPalette;
  links?: ProfileLinks;
  avatar_url?: string | null;
  is_admin?: boolean;
  character_preset?: string;
  updated_at?: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      events: {
        Row: EventRow;
        Insert: EventInsert;
        Update: EventUpdate;
        Relationships: [];
      };
      event_rsvps: {
        Row: EventRsvpRow;
        Insert: EventRsvpInsert;
        Update: Partial<EventRsvpInsert>;
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: PostRow;
        Insert: PostInsert;
        Update: Partial<PostInsert>;
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      contributions: {
        Row: ContributionRow;
        Insert: ContributionInsert;
        Update: ContributionUpdate;
        Relationships: [
          {
            foreignKeyName: "contributions_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: NewsletterRow;
        Insert: NewsletterInsert;
        Update: Partial<NewsletterInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = ProfileRow;
