'use client';

import { useState } from 'react';
import { ImageRecord } from '@/lib/types';
import { IconThumbUp, IconThumbUpFilled } from '@tabler/icons-react';
import { useLike } from '@/hooks/useLike';

interface Props {
  image: ImageRecord;
  onClick: (image: ImageRecord) => void;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
}

export default function ImageCard({ image, onClick, onFavoriteToggle }: Props) {
  const [imgError, setImgError] = useState(false);
  const { isLiked, count, toggle } = useLike(image.id, 'images', image.likes ?? 0);

  const allTags = [
    ...(image.user_tags ?? []),
    ...Object.values(image.ai_tags ?? {}).filter((v) => v && v !== '미상'),
  ].slice(0, 4);

  return (
    <div className="masonry-item">
      <div
        className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-50"
        onClick={() => onClick(image)}
      >
        {imgError ? (
          <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
            이미지 없음
          </div>
        ) : (
          <img
            src={image.src_url}
            alt={image.reason ?? ''}
            className="w-full block"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          {image.reason && (
            <p className="text-white text-xs leading-relaxed line-clamp-3 mb-2">
              {image.reason}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 나도 좋아요 버튼 */}
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
