/*
  # Create YouTube playlists table

  1. New Tables
    - `youtube_playlists`
      - `id` (uuid, primary key)
      - `platform` (text)
      - `playlist_id` (text)
      - `last_synced_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `youtube_playlists` table
    - Add policies for authenticated users to manage playlists
    - Add policy for public to view playlists
*/

CREATE TABLE IF NOT EXISTS youtube_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  playlist_id text NOT NULL,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(platform, playlist_id)
);

ALTER TABLE youtube_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can manage playlists"
  ON youtube_playlists
  FOR ALL
  TO authenticated
  USING (role() = 'authenticated');

CREATE POLICY "Playlists are viewable by everyone"
  ON youtube_playlists
  FOR SELECT
  TO public
  USING (true);