import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SAMPLE_IMAGES = [
  {
    id: 'sample-1',
    src_url: '/samples/001.jpg',
    reason: '나무, 호수, 하늘이 보이는 자연 이미지 / 밝은 햇살이 느껴지는 풍경 / 독서하며 휴식하는 것을 책 위에 누운 것처럼 표현하는 위트',
    user_tags: ['자연', '여름', '독서', '위트', '일러스트'],
    ai_tags: {
      사조: '현대 일러스트레이션',
      형태및드로잉: '평면적',
      색감질감: '과슈 질감',
      무드감성: '위트있는',
      작가명: '미상',
    },
    favorited: false,
    created_at: new Date('2025-06-01').toISOString(),
  },
  {
    id: 'sample-2',
    src_url: '/samples/002.jpg',
    reason: '평안한 마을 / 도시와 자연이 어울어지는 느낌 / 밝은 색감',
    user_tags: ['도시', '자연', '평화', '일러스트', '색감'],
    ai_tags: {
      사조: '중국 현대 일러스트레이션',
      형태및드로잉: '조감도',
      색감질감: '파스텔톤',
      무드감성: '평화로움',
      작가명: '미상',
    },
    favorited: true,
    created_at: new Date('2025-05-15').toISOString(),
  },
  {
    id: 'sample-3',
    src_url: '/samples/003.jpg',
    reason: '아파트 앞의 열기구 — 현실 속에 불가능한 일을 동화처럼 그려낸 것이 좋음 / 검은 밤 하늘, 하늘색 건물, 핑크빛 열기구의 색감 조화',
    user_tags: ['열기구', '밤', '동화', '색감', '핑크'],
    ai_tags: {
      사조: '현대 일러스트레이션',
      형태및드로잉: '콜라주',
      색감질감: '고채도 대비',
      무드감성: '몽환적',
      작가명: '미상',
    },
    favorited: false,
    created_at: new Date('2025-04-20').toISOString(),
  },
  {
    id: 'sample-4',
    src_url: '/samples/004.jpg',
    reason: '',
    user_tags: ['일러스트', '풍경', '자전거'],
    ai_tags: {
      사조: '현대 일러스트레이션',
      형태및드로잉: '터널 프레임',
      색감질감: '가을 색감',
      무드감성: '상쾌한',
      작가명: '미상',
    },
    favorited: false,
    created_at: new Date('2025-03-05').toISOString(),
  },
];

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('placeholder') && !url.includes('your-project');
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(SAMPLE_IMAGES);
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { src_url, reason, user_tags, ai_tags, favorited } = body;

  const { data, error } = await supabase
    .from('images')
    .insert({ src_url, reason, user_tags, ai_tags, favorited: favorited ?? false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const body = await request.json();
  const { data, error } = await supabase
    .from('images')
    .update({ favorited: body.favorited })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
