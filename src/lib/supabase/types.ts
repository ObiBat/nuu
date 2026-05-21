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
  created_at: string;
  updated_at: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = ProfileRow;
