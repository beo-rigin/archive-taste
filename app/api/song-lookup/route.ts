import { NextRequest, NextResponse } from 'next/server';

// iTunes Search API — 무료, 인증 불필요
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.trim();
  const artist = searchParams.get('artist')?.trim();

  if (!title || !artist) {
    return NextResponse.json({ error: 'title and artist required' }, { status: 400 });
  }

  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=5&country=KR`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) throw new Error('iTunes API error');

    const data = await res.json();

    if (!data.resultCount || data.resultCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 가장 유사한 결과 선택 (제목 일치 우선)
    const results = data.results as Array<{
      trackName: string;
      artistName: string;
      collectionName: string;
      artworkUrl100: string;
      primaryGenreName: string;
    }>;

    const best =
      results.find(
        (r) =>
          r.trackName.toLowerCase().includes(title.toLowerCase()) &&
          r.artistName.toLowerCase().includes(artist.toLowerCase()),
      ) ?? results[0];

    // artworkUrl100 → 600×600 고화질로 교체
    const artworkUrl = best.artworkUrl100
      .replace('100x100bb', '600x600bb')
      .replace('100x100bb.jpg', '600x600bb.jpg');

    return NextResponse.json({
      artworkUrl,
      albumName: best.collectionName,
      genre: best.primaryGenreName,
      trackName: best.trackName,
      artistName: best.artistName,
    });
  } catch {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
