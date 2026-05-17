'use client';

import { useEffect } from 'react';
import { ImageRecord } from '@/lib/types';
import { IconX, IconHeart, IconHeartFilled } from '@tabler/icons-react';

const AI_CATEGORY_LABELS: Record<string, string> = {
  사조: '사조',
  형태및드로잉: '형태 · 드로잉',
  색감질감: '색감 · 질감',
  무드감성: '무드 · 감성',
  작가명: '작가 · 출처',
};

interface Props {
  image: ImageRecord;
  onClose: () => void;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
}

export default function ImageModal({ image, onClose, onFavoriteToggle }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const aiTagEntries = Object.entries(image.ai_tags ?? {}).filter(
    ([, v]) => v && v !== '미상',
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <IconX size={18} className="text-gray-600" />
        </button>

        {/* Image */}
        <div className="flex-1 bg-gray-50 min-h-[300px] flex items-center justify-center overflow-hidden">
          <img
            src={image.src_url}
            alt={image.reason ?? ''}
            className="w-full h-full object-contain max-h-[60vh] md:max-h-[85vh]"
          />
        </div>

        {/* Info panel */}
        <div className="w-full md:w-72 shrink-0 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Favorite */}
          <button
            onClick={() => onFavoriteToggle(image.id, !image.favorited)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
          >
            {image.favorited ? (
              <>
                <IconHeartFilled size={18} className="text-red-500" />
                <span className="text-red-500">즐겨찾기됨</span>
              </>
            ) : (
              <>
                <IconHeart size={18} />
                즐겨찾기
              </>
            )}
          </button>

          {/* Reason */}
          {image.reason && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
                저장 이유
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{image.reason}</p>
            </section>
          )}

          {/* User tags */}
          {(image.user_tags ?? []).length > 0 && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
                나의 태그
              </p>
              <div className="flex flex-wrap gap-1.5">
                {image.user_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* AI tags */}
          {aiTagEntries.length > 0 && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                AI 분석
              </p>
              <div className="space-y-2">
                {aiTagEntries.map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-[10px] text-gray-400 pt-0.5 shrink-0 w-20 text-right">
                      {AI_CATEGORY_LABELS[key] ?? key}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-accent font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Date */}
          <p className="text-[10px] text-gray-300 mt-auto">
            {new Date(image.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
