'use client';

import { useState } from 'react';
import { FoodRecord } from '@/lib/types';
import { IconMapPin, IconThumbUp, IconThumbUpFilled } from '@tabler/icons-react';
import { useLike } from '@/hooks/useLike';

interface Props {
  food: FoodRecord;
  onClick: (food: FoodRecord) => void;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
}

export default function FoodCard({ food, onClick, onFavoriteToggle }: Props) {
  const [imgError, setImgError] = useState(false);
  const { isLiked, count, toggle } = useLike(food.id, 'food', food.likes ?? 0);

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

        {/* Category badge (always visible) */}
        {food.ai_tags?.대분류 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 text-white backdrop-blur-sm">
            {food.ai_tags.대분류}
          </span>
        )}

        {/* 나도 좋아요 */}
        <button
          onClick={toggle}
          title="나도 좋아요"
          className={`absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold transition-all
            ${isLiked
              ? 'bg-accent text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white opacity-0 group-hover:opacity-100'
            }`}
        >
          {isLiked ? <IconThumbUpFilled size={12} /> : <IconThumbUp size={12} />}
          {count > 0 && <span>{count}</span>}
        </button>
      </div>
    </div>
  );
}
