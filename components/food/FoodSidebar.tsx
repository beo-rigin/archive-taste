'use client';

import { useMemo } from 'react';
import { FoodRecord, Period } from '@/lib/types';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '2025', label: '2025' },
  { id: '2024', label: '2024' },
  { id: '25Q1', label: '25 Q1' },
  { id: '25Q2', label: '25 Q2' },
];

interface Props {
  foods: FoodRecord[];
  selectedPeriod: Period;
  onPeriodChange: (p: Period) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
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
              <div
                className={`h-1.5 rounded-full transition-all ${selectedTags.includes(tag) ? 'bg-accent' : 'bg-gray-300 group-hover:bg-gray-400'}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="shrink-0 w-4 text-gray-400 text-[10px] text-right">{count}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function FoodSidebar({ foods, selectedPeriod, onPeriodChange, selectedTags, onTagToggle }: Props) {
  const topPlaces = useMemo(() => topN(foods.map((f) => f.place).filter(Boolean), 5), [foods]);
  const topMajor = useMemo(() => topN(foods.map((f) => f.ai_tags?.대분류 ?? '').filter(Boolean), 5), [foods]);
  const topMinor = useMemo(() => topN(foods.map((f) => f.ai_tags?.중분류 ?? '').filter(Boolean), 5), [foods]);

  const tasteText = useMemo(() => {
    if (foods.length === 0) return '아직 기록을 추가해보세요.';
    const major = topMajor[0]?.tag;
    const minor = topMinor[0]?.tag;
    const place = topPlaces[0]?.tag;
    if (major && minor && place) return `${place}에서 즐기는 ${major} ${minor}을 좋아합니다`;
    if (major && place) return `${place}를 즐겨 찾는 ${major} 마니아`;
    return `${foods.length}개의 식도락 기록이 있습니다`;
  }, [foods, topMajor, topMinor, topPlaces]);

  return (
    <aside className="sidebar">
      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">나의 식도락</p>
        <p className="text-sm font-medium leading-relaxed text-gray-800">{tasteText}</p>
      </section>

      <div className="divider" />

      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">기간</p>
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

      <section className="space-y-5">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">태그 통계</p>

        {topPlaces.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2">자주 방문한 장소</p>
            <BarList items={topPlaces} selectedTags={selectedTags} onTagToggle={onTagToggle} />
          </div>
        )}

        {topMajor.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2">즐겨먹는 대분류</p>
            <BarList items={topMajor} selectedTags={selectedTags} onTagToggle={onTagToggle} />
          </div>
        )}

        {topMinor.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2">즐겨먹는 중분류</p>
            <BarList items={topMinor} selectedTags={selectedTags} onTagToggle={onTagToggle} />
          </div>
        )}

        {foods.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">기록을 추가하면 통계가 표시됩니다</p>
        )}
      </section>
    </aside>
  );
}
