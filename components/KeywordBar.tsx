'use client';

import { useMemo } from 'react';
import { ImageRecord } from '@/lib/types';
import { IconX } from '@tabler/icons-react';

interface Props {
  images: ImageRecord[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilter: () => void;
}

export default function KeywordBar({ images, selectedTags, onTagToggle, onClearFilter }: Props) {
  const sortedTags = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach((img) => {
      const allTags = [
        ...(img.user_tags ?? []),
        ...Object.values(img.ai_tags ?? {}).filter((v) => v && v !== '미상'),
      ];
      allTags.forEach((tag) => {
        counts[tag] = (counts[tag] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  }, [images]);

  if (sortedTags.length === 0) return null;

  return (
    <div className="keyword-bar">
      <div className="flex items-center gap-2 flex-wrap">
        {selectedTags.length > 0 && (
          <button
            onClick={onClearFilter}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors shrink-0"
          >
            <IconX size={11} />
            필터 해제
          </button>
        )}
        {sortedTags.map(({ tag, count }) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
              <span className={`ml-1 text-[10px] ${active ? 'text-green-200' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
