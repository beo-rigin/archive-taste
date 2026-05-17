'use client';

import { useState } from 'react';
import { FoodRecord } from '@/lib/types';
import { IconHeart, IconHeartFilled, IconMapPin } from '@tabler/icons-react';

interface Props {
  food: FoodRecord;
  onClick: (food: FoodRecord) => void;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
}

export default function FoodCard({ food, onClick, onFavoriteToggle }: Props) {
  const [imgError, setImgError] = useState(false);

  const chips = [
    food.ai_tags?.대분류,
    food.ai_tags?.중분류,
    ...(food.user_tags ?? []),
  ].filter(Boolean).slice(0, 3) as string[];

  return (
    <div className="masonry-item">
      <div
        className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-50"
        onClick={() => onClick(food)}
      >
        {imgError ? (
          <div className="flex items-center justify-center h-40 text-gray-300 text-sm">이미지 없음</div>
        ) : (
          <img
            src={food.src_url}
            alt={food.food_name ?? food.place}
            className="w-full block"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center gap-1 mb-1">
            <IconMapPin size={11} className="text-green-300 shrink-0" />
            <span className="text-white text-xs font-medium truncate">{food.place}</span>
          </div>
          {food.food_name && (
            <p className="text-white/80 text-xs mb-2 truncate">{food.food_name}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {chips.map((tag) => (
              <span key={tag} className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); onFavoriteToggle(food.id, !food.favorited); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
        >
          {food.favorited
            ? <IconHeartFilled size={14} className="text-red-500" />
            : <IconHeart size={14} className="text-gray-500" />}
        </button>

        {/* Category badge (always visible) */}
        {food.ai_tags?.대분류 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 text-white backdrop-blur-sm">
            {food.ai_tags.대분류}
          </span>
        )}
      </div>
    </div>
  );
}
