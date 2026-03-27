-- Cutter Gang Supabase Schema
-- Run this setup script in the Supabase SQL editor

-- 1. Create Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  user_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.1 Create Password Attempts table (for Gate Lockout)
CREATE TABLE IF NOT EXISTS password_attempts (
  ip TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_attempts ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Fixed Syntax)
DROP POLICY IF EXISTS "Allow public select on videos" ON videos;
DROP POLICY IF EXISTS "Allow public insert on videos" ON videos;
DROP POLICY IF EXISTS "Allow public select on chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow public insert on chat_messages" ON chat_messages;

CREATE POLICY "Allow public select on videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on videos" ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public select on chat_messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on chat_messages" ON chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public select on password_attempts" ON password_attempts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on password_attempts" ON password_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on password_attempts" ON password_attempts FOR UPDATE USING (true);

-- 5. Enable Realtime for chat_messages table
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE chat_messages;
COMMIT;

-- 6. Storage Setup for Videos (Uploading functionality)
insert into storage.buckets (id, name, public) values ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public select on storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert on storage" ON storage.objects;

CREATE POLICY "Allow public select on storage" ON storage.objects FOR SELECT USING ( bucket_id = 'videos' );
CREATE POLICY "Allow public insert on storage" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'videos' );
-- 7. Chat Auto-Cleanup (Delete messages older than 24 hours)
-- Note: This requires the 'pg_cron' extension to be enabled in Supabase (Database -> Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-old-messages', -- name of the cron job
  '0 * * * *',           -- run every hour (at minute 0)
  $$ DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '24 hours' $$
);
