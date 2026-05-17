-- ============================================================
-- ARCHIVE — 나의 취향 :: Supabase Schema
-- ============================================================

-- 1. images 테이블 생성
CREATE TABLE IF NOT EXISTS public.images (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  src_url    TEXT        NOT NULL,
  reason     TEXT        DEFAULT '',
  user_tags  TEXT[]      DEFAULT '{}',
  ai_tags    JSONB       DEFAULT '{}',
  favorited  BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Row Level Security 활성화
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 (인증 없이 공개 접근 — 개인 사용 용도)
CREATE POLICY "public_select" ON public.images
  FOR SELECT USING (true);

CREATE POLICY "public_insert" ON public.images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update" ON public.images
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "public_delete" ON public.images
  FOR DELETE USING (true);

-- ============================================================
-- FOOD 테이블
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
-- Storage 설정 (Supabase Dashboard → Storage에서 수동 생성 가능)
-- 또는 아래 SQL 실행 (storage 스키마 접근 권한 필요)
-- ============================================================

-- 4. moodboard 버킷 생성 (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moodboard',
  'moodboard',
  true,
  52428800,  -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Storage RLS 정책
CREATE POLICY "public_upload_moodboard" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'moodboard');

CREATE POLICY "public_read_moodboard" ON storage.objects
  FOR SELECT USING (bucket_id = 'moodboard');

CREATE POLICY "public_delete_moodboard" ON storage.objects
  FOR DELETE USING (bucket_id = 'moodboard');
