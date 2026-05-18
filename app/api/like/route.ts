import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// POST /api/like?id=xxx&table=images&delta=1
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const table = searchParams.get('table'); // images | food | songs
  const delta = parseInt(searchParams.get('delta') ?? '1'); // 1 or -1

  if (!id || !table || !['images', 'food', 'songs'].includes(table)) {
    return NextResponse.json({ error: 'invalid params' }, { status: 400 });
  }

  const supabase = getSupabase();

  // 현재 likes 조회
  const { data, error } = await supabase
    .from(table)
    .select('likes')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const newLikes = Math.max(0, (data.likes ?? 0) + delta);

  const { data: updated, error: updateError } = await supabase
    .from(table)
    .update({ likes: newLikes })
    .eq('id', id)
    .select('likes')
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ likes: updated.likes });
}
