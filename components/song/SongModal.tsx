'use client';

import { useEffect } from 'react';
import { SongRecord } from '@/lib/types';
import { IconX, IconMusic, IconExternalLink } from '@tabler/icons-react';

interface Props {
  song: SongRecord;
  onClose: () => void;
}

export default function SongModal({ song, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors">
          <IconX size={18} className="text-gray-600" />
        </button>

        {/* 앨범아트 + 블러 배경 */}
        <div className="relative">
          {song.album_art_url && (
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
              style={{ backgroundImage: `url(${song.album_art_url})` }}
            />
          )}
          <div className="relative flex justify-center py-8 px-6">
            <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0">
              {song.album_art_url ? (
                <img src={song.album_art_url} alt={song.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <IconMusic size={48} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 정보 패널 */}
        <div className="p-5 space-y-4">
          {/* 곡 제목 / 아티스트 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{song.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{song.artist}</p>
            {song.album_name && <p className="text-xs text-gray-400 mt-0.5">{song.album_name}</p>}
          </div>

          {/* 배지들: 장르 + 연대 */}
          <div className="flex flex-wrap gap-1.5">
            {song.ai_tags?.장르 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white">
                {song.ai_tags.장르}
              </span>
            )}
            {song.decade && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                {song.decade === '7080' ? '7080' : song.decade === '1990' ? '90s' : song.decade === '2000' ? '2000s' : song.decade === '2010' ? '2010s' : '2020s'}
              </span>
            )}
          </div>

          {/* 좋은 이유 */}
          {song.reason && (
            <section>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">좋은 이유</p>
              <p className="text-sm text-gray-700 leading-relaxed">{song.reason}</p>
            </section>
          )}

          {/* 추천 링크 */}
          {song.link_url && (
            <a
              href={song.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <IconExternalLink size={14} />
              추천 링크 바로가기
            </a>
          )}

          <p className="text-[10px] text-gray-300">
            {new Date(song.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
