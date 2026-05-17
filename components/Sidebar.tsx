'use client';

import { useMemo } from 'react';
import { ImageRecord, Period, CategoryTagStats } from '@/lib/types';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '2025', label: '2025' },
  { id: '2024', label: '2024' },
  { id: '25Q1', label: '25 Q1' },
  { id: '25Q2', label: '25 Q2' },
];

const AI_CATEGORIES = [
  { key: '사조', label: '사조' },
  { key: '형태및드로잉', label: '형태 · 드로잉' },
  { key: '색감질감', label: '색감 · 질감' },
  { key: '무드감성', label: '무드 · 감성' },
  { key: '작가명', label: '작가 · 출처' },
];

interface Props {
  images: ImageRecord[];
  selectedPeriod: Period;
  onPeriodChange: (p: Period) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

function computeTasteDefinition(images: ImageRecord[]): string {
  if (images.length === 0) return '아직 이미지를 추가해보세요.';

  const counts: Record<string, number> = {};
  images.forEach((img) => {
    Object.entries(img.ai_tags ?? {}).forEach(([, v]) => {
      if (v && v !== '미상') {
        counts[v] = (counts[v] ?? 0) + 1;
      }
    });
  });

  const top = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  if (top.length === 0) return '취향을 분석 중입니다.';
  if (top.length === 1) return `${top[0]}의 감성을 담은 취향`;
  if (top.length === 2) return `${top[0]}과(와) ${top[1]}의 감성을 담은 취향`;
  return `${top[0]}의 감성과 ${top[1]}의 색감, ${top[2]}의 무드를 담은 취향`;
}

function computeCategoryStats(images: ImageRecord[]): CategoryTagStats[] {
  return AI_CATEGORIES.map(({ key, label }) => {
    const counts: Record<string, number> = {};
    images.forEach((img) => {
      const v = img.ai_tags?.[key as keyof typeof img.ai_tags];
      if (v && v !== '미상') {
        counts[v] = (counts[v] ?? 0) + 1;
      }
    });

    const tags = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return { category: key, label, tags };
  });
}

export default function Sidebar({
  images,
  selectedPeriod,
  onPeriodChange,
  selectedTags,
  onTagToggle,
}: Props) {
  const tasteDefinition = useMemo(() => computeTasteDefinition(images), [images]);
  const categoryStats = useMemo(() => computeCategoryStats(images), [images]);

  return (
    <aside className="sidebar">
      {/* 나의 취향 정의 */}
      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
          나의 취향
        </p>
        <p className="text-sm font-medium leading-relaxed text-gray-800">
          {tasteDefinition}
        </p>
      </section>

      <div className="divider" />

      {/* 기간 선택 */}
      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
          기간
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onPeriodChange(id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedPeriod === id
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* 카테고리별 TOP 5 태그 */}
      <section>
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">
          태그 통계
        </p>
        {categoryStats.map(({ label, tags }) => {
          if (tags.length === 0) return null;
          const maxCount = tags[0]?.count ?? 1;

          return (
            <div key={label} className="mb-5">
              <p className="text-[11px] font-semibold text-gray-500 mb-2">{label}</p>
              <div className="space-y-1.5">
                {tags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => onTagToggle(tag)}
                    className={`w-full text-left group ${
                      selectedTags.includes(tag) ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`shrink-0 w-20 truncate text-right text-[11px] transition-colors ${
                          selectedTags.includes(tag) ? 'text-accent font-semibold' : 'text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            selectedTags.includes(tag) ? 'bg-accent' : 'bg-gray-300 group-hover:bg-gray-400'
                          }`}
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="shrink-0 w-4 text-gray-400 text-[10px] text-right">
                        {count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {images.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            이미지를 추가하면 통계가 표시됩니다
          </p>
        )}
      </section>
    </aside>
  );
}
