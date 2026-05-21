import type { CharacterPalette } from "@/lib/character";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: {
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
        };
        Update: {
          display_name?: string;
          role?: string;
          location?: string;
          bio?: string;
          slug?: string | null;
          character?: CharacterPalette;
          links?: ProfileLinks;
          avatar_url?: string | null;
        };
      };
    };
  };
};

export type ProfileLinks = {
  site?: string;
  github?: string;
  linkedin?: string;
  x?: string;
  email?: string;
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
