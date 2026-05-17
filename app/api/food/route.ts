import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SAMPLE_FOOD = [
  {
    id: 'food-1',
    src_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
    place: '을지로 라멘집',
    food_name: '돈코츠 라멘',
    with_whom: '혼자',
    recipe: '',
    user_tags: ['라멘', '혼밥', '을지로', '국물'],
    ai_tags: { 대분류: '일식', 중분류: '라멘' },
    favorited: true,
    created_at: new Date('2025-05-20').toISOString(),
  },
  {
    id: 'food-2',
    src_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600',
    place: '연남동 파스타바',
    food_name: '까르보나라',
    with_whom: '친구',
    recipe: '',
    user_tags: ['파스타', '연남동', '데이트'],
    ai_tags: { 대분류: '양식', 중분류: '파스타' },
    favorited: false,
    created_at: new Date('2025-05-10').toISOString(),
  },
  {
    id: 'food-3',
    src_url: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600',
    place: '인사동 한정식',
    food_name: '비빔밥',
    with_whom: '가족',
    recipe: '',
    user_tags: ['한식', '비빔밥', '인사동', '가족'],
    ai_tags: { 대분류: '전통한식', 중분류: '비빔밥' },
    favorited: false,
    created_at: new Date('2025-04-15').toISOString(),
  },
  {
    id: 'food-4',
    src_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    place: '홍대 포케집',
    food_name: '연어 포케',
    with_whom: '친구',
    recipe: '',
    user_tags: ['포케', '홍대', '건강식', '연어'],
    ai_tags: { 대분류: '퓨전한식', 중분류: '포케' },
    favorited: true,
    created_at: new Date('2025-03-22').toISOString(),
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
    return NextResponse.json(SAMPLE_FOOD);
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('food')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { src_url, place, food_name, with_whom, recipe, user_tags, ai_tags, favorited } = body;
  const { data, error } = await supabase
    .from('food')
    .insert({ src_url, place, food_name, with_whom, recipe, user_tags, ai_tags, favorited: favorited ?? false })
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
    .from('food')
    .update({ favorited: body.favorited })
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
