# ARCHIVE — 나의 취향

나의 시각적 취향을 기록하는 무드보드 아카이브. 이미지를 저장하면 Claude AI가 자동으로 사조, 색감, 무드, 작가명을 태깅합니다.

## 기술 스택

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** + **Tailwind CSS v4**
- **Supabase** — PostgreSQL DB + Storage
- **Anthropic Claude API** (`claude-sonnet-4-5`) — 이미지 AI 분석
- **Tabler Icons** · **Pretendard** 폰트

---

## 시작하기

### 1. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. **SQL Editor**에서 `supabase-schema.sql` 전체 내용 실행
   - `images` 테이블 + RLS 정책 생성
   - `moodboard` Storage 버킷 생성 (public)
3. **Settings → API**에서 `URL`과 `anon key` 복사

> Storage 버킷이 SQL로 안 생성될 경우: Dashboard → Storage → New bucket → 이름 `moodboard`, Public 체크

### 2. Anthropic API 키 발급

[console.anthropic.com/keys](https://console.anthropic.com/keys)에서 API 키 생성

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key
AI_PROVIDER=claude
```

### 4. 로컬 실행

```bash
npm install
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

### 5. Vercel 배포

1. GitHub에 push
2. [vercel.com](https://vercel.com) → Import Repository
3. Environment Variables에 `.env.local` 키-값 입력
4. Deploy

또는 CLI:

```bash
npx vercel
```

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 무드보드 | Pinterest 스타일 masonry 레이아웃 |
| AI 분석 | 사조 / 형태 / 색감 / 무드 / 작가 자동 태깅 |
| 태그 필터 | 키워드 바 클릭으로 필터링 |
| 기간 필터 | 전체 / 연도 / 분기별 |
| 즐겨찾기 | 하트 버튼 토글 |
| 취향 통계 | 자동 생성 취향 문장 + TOP 5 태그 바 차트 |

## 프로젝트 구조

```
archive-taste/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   # Claude 이미지 분석 API
│   │   └── images/route.ts    # GET / POST / PATCH
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CategoryTabs.tsx
│   ├── ImageCard.tsx
│   ├── ImageModal.tsx
│   ├── KeywordBar.tsx
│   ├── Moodboard.tsx
│   ├── Sidebar.tsx
│   └── UploadModal.tsx
├── lib/
│   ├── supabase.ts
│   └── types.ts
├── .env.local.example
└── supabase-schema.sql
```
