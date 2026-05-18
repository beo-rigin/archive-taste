import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


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
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  const supabase = getSupabase();
  const { data, error } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { title, artist, reason, album_art_url, album_name, ai_tags, decade, link_url, hashtags, favorited } = body;
  const { data, error } = await supabase
    .from('songs')
    .insert({ title, artist, reason, album_art_url, album_name, ai_tags, decade: decade ?? '', link_url: link_url ?? '', hashtags: hashtags ?? [], favorited: favorited ?? false })
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
  // favorited만 있으면 즐겨찾기 토글, link_url/hashtags 있으면 수정
  const updates: Record<string, unknown> = {};
  if (body.favorited !== undefined) updates.favorited = body.favorited;
  if (body.link_url !== undefined) updates.link_url = body.link_url;
  if (body.hashtags !== undefined) updates.hashtags = body.hashtags;
  const { data, error } = await supabase.from('songs').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
