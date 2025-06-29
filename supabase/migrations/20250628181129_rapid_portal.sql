/*
  # Create doodles table

  1. New Tables
    - `doodles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, optional)
      - `original_image_url` (text)
      - `final_image_url` (text)
      - `doodle_data_json` (jsonb, stores drawing paths and overlays)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `doodles` table
    - Add policies for CRUD operations restricted to users' own doodles
  
  3. Indexes
    - Add index on user_id for better query performance
    - Add index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS doodles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text DEFAULT 'Cloud Doodle',
  original_image_url text NOT NULL,
  final_image_url text NOT NULL,
  doodle_data_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doodles_user_id ON doodles(user_id);
CREATE INDEX IF NOT EXISTS idx_doodles_created_at ON doodles(created_at DESC);

-- Enable RLS
ALTER TABLE doodles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own doodles"
  ON doodles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own doodles"
  ON doodles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doodles"
  ON doodles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own doodles"
  ON doodles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doodles_updated_at
  BEFORE UPDATE ON doodles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();