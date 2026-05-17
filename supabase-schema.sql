-- ============================================================
-- ARCHIVE — 나의 취향 :: Supabase Schema
-- ============================================================

-- 1. images 테이블
CREATE TABLE IF NOT EXISTS public.images (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  src_url    TEXT        NOT NULL,
  reason     TEXT        DEFAULT '',
  user_tags  TEXT[]      DEFAULT '{}',
  ai_tags    JSONB       DEFAULT '{}',
  favorited  BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select" ON public.images FOR SELECT USING (true);
CREATE POLICY "public_insert" ON public.images FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON public.images FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON public.images FOR DELETE USING (true);

-- ============================================================
-- 2. food 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS public.food (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  src_url    TEXT        NOT NULL,
  place      TEXT        NOT NULL DEFAULT '',
  food_name  TEXT        DEFAULT '',
  with_whom  TEXT        DEFAULT '',
  recipe     TEXT        DEFAULT '',
  user_tags  TEXT[]      DEFAULT '{}',
  ai_tags    JSONB       DEFAULT '{}',
  favorited  BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.food ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_select" ON public.food FOR SELECT USING (true);
CREATE POLICY "food_insert" ON public.food FOR INSERT WITH CHECK (true);
CREATE POLICY "food_update" ON public.food FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "food_delete" ON public.food FOR DELETE USING (true);

-- ============================================================
-- 3. songs 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS public.songs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  artist        TEXT        NOT NULL,
  reason        TEXT        DEFAULT '',
  album_art_url TEXT        DEFAULT '',
  album_name    TEXT        DEFAULT '',
  ai_tags       JSONB       DEFAULT '{}',
  favorited     BOOLEAN     DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "songs_select" ON public.songs FOR SELECT USING (true);
CREATE POLICY "songs_insert" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "songs_update" ON public.songs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "songs_delete" ON public.songs FOR DELETE USING (true);

-- ============================================================
-- 4. Storage — moodboard 버킷
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moodboard',
  'moodboard',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "public_upload_moodboard" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'moodboard');

CREATE POLICY "public_read_moodboard" ON storage.objects
  FOR SELECT USING (bucket_id = 'moodboard');

CREATE POLICY "public_delete_moodboard" ON storage.objects
  FOR DELETE USING (bucket_id = 'moodboard');
