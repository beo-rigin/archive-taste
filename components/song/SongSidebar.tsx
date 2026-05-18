'use client';

import { useMemo } from 'react';
import { SongRecord, Period, Decade } from '@/lib/types';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '2025', label: '2025' },
  { id: '2024', label: '2024' },
  { id: '25Q1', label: '25 Q1' },
  { id: '25Q2', label: '25 Q2' },
];

const DECADES: { id: Decade; label: string }[] = [
  { id: '7080', label: '7080' },
  { id: '1990', label: '90s' },
  { id: '2000', label: '2000s' },
  { id: '2010', label: '2010s' },
  { id: '2020', label: '2020s' },
];

interface Props {
  songs: SongRecord[];
  selectedPeriod: Period;
  onPeriodChange: (p: Period) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  selectedDecades: Decade[];
  onDecadeToggle: (d: Decade) => void;
}

function topN(items: string[], n: number) {
  const counts: Record<string, number> = {};
  items.forEach((v) => { if (v) counts[v] = (counts[v] ?? 0) + 1; });
  return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, n).map(([tag, count]) => ({ tag, count }));
}

function BarList({ items, selectedTags, onTagToggle }: { items: { tag: string; count: number }[]; selectedTags: string[]; onTagToggle: (t: string) => void }) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="space-y-1.5">
      {items.map(({ tag, count }) => (
        <button key={tag} onClick={() => onTagToggle(tag)} className="w-full text-left group">
          <div className="flex items-center gap-2 text-xs">
            <span className={`shrink-0 w-20 truncate text-right text-[11px] transition-colors ${selectedTags.includes(tag) ? 'text-accent font-semibold' : 'text-gray-600'}`}>
              {tag}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all ${selectedTags.includes(tag) ? 'bg-accent' : 'bg-gray-300 group-hover:bg-gray-400'}`}
                style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="shrink-0 w-4 text-gray-400 text-[10px] text-right">{count}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function SongSidebar({ songs, selectedPeriod, onPeriodChange, selectedTags, onTagToggle, selectedDecades, onDecadeToggle }: Props) {
  const topGenres = useMemo(() => topN(songs.map((s) => s.ai_tags?.장르 ?? '').filter(Boolean), 5), [songs]);
  const topArtists = useMemo(() => topN(songs.map((s) => s.artist).filter(Boolean), 5), [songs]);

  const tasteText = useMemo(() => {
    if (songs.length === 0) return '아직 곡을 추가해보세요.';
    const genre = topGenres[0]?.tag;
    const artist = topArtists[0]?.tag;
    if (genre && artist) return `${genre}의 ${artist}을(를) 자주 듣는 취향`;
    if (genre) return `${genre} 장르를 즐겨 듣는 취향`;
    return `${songs.length}곡을 기록했습니다`;
  }, [songs, topGenres, topArtists]);

  return (
    <aside className="sidebar">
      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">나의 음악 취향</p>
        <p className="text-sm font-medium leading-relaxed text-gray-800">{tasteText}</p>
      </section>

      <div className="divider" />

      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">등록 기간</p>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map(({ id, label }) => (
            <button key={id} onClick={() => onPeriodChange(id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedPeriod === id ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">연대</p>
        <div className="flex flex-wrap gap-1.5">
          {DECADES.map(({ id, label }) => (
            <button key={id} onClick={() => onDecadeToggle(id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedDecades.includes(id) ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="space-y-5">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">통계</p>

        {topGenres.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2">즐겨 듣는 장르</p>
            <BarList items={topGenres} selectedTags={selectedTags} onTagToggle={onTagToggle} />
          </div>
        )}

        {topArtists.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2">자주 듣는 아티스트</p>
            <BarList items={topArtists} selectedTags={selectedTags} onTagToggle={onTagToggle} />
          </div>
        )}

        {songs.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">곡을 추가하면 통계가 표시됩니다</p>
        )}
      </section>
    </aside>
  );
}
