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
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
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
  const { src_url, reason, user_tags, color_tags, ai_tags, favorited } = body;

  const { data, error } = await supabase
    .from('images')
    .insert({ src_url, reason, user_tags, color_tags: color_tags ?? [], ai_tags, favorited: favorited ?? false })
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
  const updates: Record<string, unknown> = {};
  if (body.favorited !== undefined) updates.favorited = body.favorited;
  if (body.user_tags !== undefined) updates.user_tags = body.user_tags;
  if (body.color_tags !== undefined) updates.color_tags = body.color_tags;

  const { data, error } = await supabase
    .from('images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
