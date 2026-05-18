import { NextResponse } from 'next/server';
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

// GET — 현재 방문자 수 조회
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ total_visits: 0 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('site_stats')
    .select('total_visits')
    .eq('id', 1)
    .single();

  if (error) return NextResponse.json({ total_visits: 0 });
  return NextResponse.json({ total_visits: data.total_visits ?? 0 });
}

// POST — 방문 카운트 +1
export async function POST() {
  if (!isSupabaseConfigured()) return NextResponse.json({ total_visits: 0 });

  const supabase = getSupabase();
  const { data: current } = await supabase
    .from('site_stats')
    .select('total_visits')
    .eq('id', 1)
    .single();

  const newCount = (current?.total_visits ?? 0) + 1;

  const { data, error } = await supabase
    .from('site_stats')
    .update({ total_visits: newCount })
    .eq('id', 1)
    .select('total_visits')
    .single();

  if (error) return NextResponse.json({ total_visits: 0 });
  return NextResponse.json({ total_visits: data.total_visits });
}
