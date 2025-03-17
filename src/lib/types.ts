// src/lib/types.ts
export type Database = {
  public: {
    Tables: {
      contests: {
        Row: {
          id: string;
          name: string;
          platform: 'Codeforces' | 'CodeChef' | 'LeetCode';
          start_time: string;
          end_time: string;
          duration: number;
          url: string;
          solution_link: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          platform: 'Codeforces' | 'CodeChef' | 'LeetCode';
          start_time: string;
          end_time: string;
          duration: number;
          url: string;
          solution_link?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          platform?: 'Codeforces' | 'CodeChef' | 'LeetCode';
          start_time?: string;
          end_time?: string;
          duration?: number;
          url?: string;
          solution_link?: string | null;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          contest_id: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contest_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contest_id?: string;
        };
      };
      youtube_playlists: {
        Row: {
          id: string;
          platform: string;
          playlist_id: string;
          last_synced_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          playlist_id: string;
          last_synced_at: string;
        };
        Update: {
          id?: string;
          platform?: string;
          playlist_id?: string;
          last_synced_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'user' | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user' | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user' | null;
        };
      };
    };
  };
};

export type Contest = Database['public']['Tables']['contests']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type YoutubePlaylist = Database['public']['Tables']['youtube_playlists']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];