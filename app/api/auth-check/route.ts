import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correct = process.env.UPLOAD_PASSWORD;

  if (!correct) {
    // 환경변수 미설정 시 잠금
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (password === correct) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
