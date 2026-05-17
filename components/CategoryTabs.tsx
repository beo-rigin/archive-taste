'use client';

import { Category } from '@/lib/types';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'POSTER', label: 'POSTER' },
  { id: 'FOOD', label: 'FOOD' },
  { id: 'SONG', label: 'SONG' },
  { id: 'SENTENCE', label: 'SENTENCE' },
  { id: 'PROFILE', label: 'PROFILE' },
];

interface Props {
  active: Category;
  onChange: (c: Category) => void;
}

export default function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex border-t border-gray-100">
      {CATEGORIES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative px-6 py-3 text-xs font-semibold tracking-widest transition-colors ${
            active === id
              ? 'text-accent'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          {label}
          {active === id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      ))}
    </div>
  );
}
