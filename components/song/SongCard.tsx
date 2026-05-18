'use client';

import { SongRecord } from '@/lib/types';
import { IconMusic, IconThumbUp, IconThumbUpFilled } from '@tabler/icons-react';
import { useLike } from '@/hooks/useLike';

interface Props {
  song: SongRecord;
  onClick: (song: SongRecord) => void;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
}

export default function SongCard({ song, onClick, onFavoriteToggle: _ }: Props) {
  const { isLiked, count, toggle } = useLike(song.id, 'songs', song.likes ?? 0);

  return (
    <div className="group cursor-pointer" onClick={() => onClick(song)}>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
        {song.album_art_url ? (
          <img
            src={song.album_art_url}
            alt={`${song.title} - ${song.artist}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <IconMusic size={32} className="text-gray-400" />
          </div>
        )}

        {/* 장르 배지 */}
        {song.ai_tags?.장르 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 text-white backdrop-blur-sm">
            {song.ai_tags.장르}
          </span>
        )}

        {/* 연대 배지 */}
        {song.decade && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 text-gray-700 backdrop-blur-sm">
            {song.decade === '7080' ? '7080' : song.decade === '1990' ? '90s' : song.decade === '2000' ? '2000s' : song.decade === '2010' ? '2010s' : '2020s'}
          </span>
        )}

        {/* hover 오버레이 */}
        {song.reason && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
            <p className="text-white text-xs leading-relaxed line-clamp-3">{song.reason}</p>
          </div>
        )}

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

      {/* 곡 정보 */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold text-gray-900 truncate">{song.title}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{song.artist}</p>
      </div>
    </div>
  );
}
