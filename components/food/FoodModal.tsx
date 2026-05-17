'use client';

import { useEffect } from 'react';
import { FoodRecord } from '@/lib/types';
import { IconX, IconHeart, IconHeartFilled, IconMapPin, IconUsers, IconNotes } from '@tabler/icons-react';

interface Props {
  food: FoodRecord;
  onClose: () => void;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
}

export default function FoodModal({ food, onClose, onFavoriteToggle }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors">
          <IconX size={18} className="text-gray-600" />
        </button>

        {/* Image */}
        <div className="flex-1 bg-gray-50 min-h-[280px] flex items-center justify-center overflow-hidden">
          <img src={food.src_url} alt={food.food_name ?? food.place} className="w-full h-full object-cover max-h-[55vh] md:max-h-[85vh]" />
        </div>

        {/* Info */}
        <div className="w-full md:w-72 shrink-0 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Favorite */}
          <button onClick={() => onFavoriteToggle(food.id, !food.favorited)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors">
            {food.favorited
              ? <><IconHeartFilled size={18} className="text-red-500" /><span className="text-red-500">즐겨찾기됨</span></>
              : <><IconHeart size={18} />즐겨찾기</>}
          </button>

          {/* AI 분류 */}
          {(food.ai_tags?.대분류 || food.ai_tags?.중분류) && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">분류</p>
              <div className="flex gap-2 flex-wrap">
                {food.ai_tags.대분류 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white">{food.ai_tags.대분류}</span>
                )}
                {food.ai_tags.중분류 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-accent border border-green-200">{food.ai_tags.중분류}</span>
                )}
              </div>
            </section>
          )}

          {/* 장소 */}
          <section>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">장소</p>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <IconMapPin size={14} className="text-accent shrink-0" />
              {food.place}
            </div>
          </section>

          {/* 음식명 */}
          {food.food_name && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">음식</p>
              <p className="text-sm font-medium text-gray-800">{food.food_name}</p>
            </section>
          )}

          {/* 누구와 */}
          {food.with_whom && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">누구와</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <IconUsers size={14} className="text-gray-400 shrink-0" />
                {food.with_whom}
              </div>
            </section>
          )}

          {/* 레시피 */}
          {food.recipe && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">레시피 메모</p>
              <div className="flex gap-1.5">
                <IconNotes size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{food.recipe}</p>
              </div>
            </section>
          )}

          {/* 태그 */}
          {(food.user_tags ?? []).length > 0 && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">태그</p>
              <div className="flex flex-wrap gap-1.5">
                {food.user_tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{tag}</span>
                ))}
              </div>
            </section>
          )}

          <p className="text-[10px] text-gray-300 mt-auto">
            {new Date(food.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
