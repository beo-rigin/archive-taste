import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SAMPLE_SONGS = [
  {
    id: 'song-1',
    title: 'Hype Boy',
    artist: 'NewJeans',
    reason: '첫 소절부터 빠져드는 중독성 있는 리듬. 풋풋하고 설레는 가사가 좋다.',
    album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/04/4e/8f/044e8f43-763e-f81a-89db-0cf3e0ee2e68/196589525796.jpg/600x600bb.jpg',
    album_name: 'New Jeans',
    ai_tags: { 장르: 'K-Pop' },
    favorited: true,
    created_at: new Date('2025-05-10').toISOString(),
  },
  {
    id: 'song-2',
    title: 'LILAC',
    artist: 'IU',
    reason: '봄이 오면 늘 생각나는 곡. 끝과 시작의 감정을 너무 잘 담았다.',
    album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/52/c6/74/52c674a3-5b16-6600-4154-0b9dbf37cd82/196589525802.jpg/600x600bb.jpg',
    album_name: 'LILAC',
    ai_tags: { 장르: 'K-Pop' },
    favorited: false,
    created_at: new Date('2025-04-01').toISOString(),
  },
  {
    id: 'song-3',
    title: 'Super Shy',
    artist: 'NewJeans',
    reason: '귀여움과 세련됨의 완벽한 균형. 여름 내내 들었다.',
    album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/02/74/81/02748172-5f0e-52e1-65a0-23c7e4e35daa/196589525819.jpg/600x600bb.jpg',
    album_name: 'Get Up',
    ai_tags: { 장르: 'K-Pop' },
    favorited: true,
    created_at: new Date('2025-03-15').toISOString(),
  },
  {
    id: 'song-4',
    title: 'Dynamite',
    artist: 'BTS',
    reason: '어디서 들어도 기분이 좋아지는 곡. 에너지가 넘친다.',
    album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/84/55/3e/84553e93-e670-8263-9c0c-f2b82b5cbba7/20UMGIM67017.rgb.jpg/600x600bb.jpg',
    album_name: 'Dynamite (DayTime Version)',
    ai_tags: { 장르: 'K-Pop' },
    favorited: false,
    created_at: new Date('2025-02-20').toISOString(),
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
  if (!isSupabaseConfigured()) return NextResponse.json(SAMPLE_SONGS);
  const supabase = getSupabase();
  const { data, error } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { title, artist, reason, album_art_url, album_name, ai_tags, favorited } = body;
  const { data, error } = await supabase
    .from('songs')
    .insert({ title, artist, reason, album_art_url, album_name, ai_tags, favorited: favorited ?? false })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const body = await request.json();
  const { data, error } = await supabase.from('songs').update({ favorited: body.favorited }).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
