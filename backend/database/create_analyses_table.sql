-- Drop existing table if it has issues
DROP TABLE IF EXISTS analyses CASCADE;

-- Create analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  source_url TEXT,
  credibility_score INTEGER NOT NULL,
  verdict TEXT NOT NULL,
  analysis TEXT NOT NULL,
  indicators JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  content_length INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_verdict ON analyses(verdict);

-- Enable Row Level Security (but we'll handle auth in backend)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (backend handles auth)
CREATE POLICY "Allow all operations" ON analyses FOR ALL USING (true);
