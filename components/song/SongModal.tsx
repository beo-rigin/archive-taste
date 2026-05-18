'use client';

import { useEffect, useState } from 'react';
import { SongRecord } from '@/lib/types';
import { IconX, IconMusic, IconExternalLink, IconPencil } from '@tabler/icons-react';
import SongEditModal from './SongEditModal';
import PasswordModal from '@/components/PasswordModal';
import { useUploadAuth } from '@/hooks/useUploadAuth';

interface Props {
  song: SongRecord;
  onClose: () => void;
  onSongUpdated?: (updated: SongRecord) => void;
}

export default function SongModal({ song, onClose, onSongUpdated }: Props) {
  const [current, setCurrent] = useState<SongRecord>(song);
  const [showEdit, setShowEdit] = useState(false);
  const { requireAuth, showPasswordModal, handleAuthSuccess, handleAuthClose } = useUploadAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSaved(updated: SongRecord) {
    setCurrent(updated);
    onSongUpdated?.(updated);
  }

  return (
    <>
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
            {current.album_art_url && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
                style={{ backgroundImage: `url(${current.album_art_url})` }}
              />
            )}
            <div className="relative flex justify-center py-8 px-6">
              <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0">
                {current.album_art_url ? (
                  <img src={current.album_art_url} alt={current.title} className="w-full h-full object-cover" />
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
            {/* 곡 제목 / 아티스트 + 수정 버튼 */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{current.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{current.artist}</p>
                {current.album_name && <p className="text-xs text-gray-400 mt-0.5">{current.album_name}</p>}
              </div>
              <button
                onClick={() => requireAuth(() => setShowEdit(true))}
                title="수정"
                className="shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors mt-0.5"
              >
                <IconPencil size={15} className="text-gray-400" />
              </button>
            </div>

            {/* 배지들: 장르 + 연대 */}
            <div className="flex flex-wrap gap-1.5">
              {current.ai_tags?.장르 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white">
                  {current.ai_tags.장르}
                </span>
              )}
              {current.decade && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                  {current.decade === '7080' ? '7080' : current.decade === '1990' ? '90s' : current.decade === '2000' ? '2000s' : current.decade === '2010' ? '2010s' : '2020s'}
                </span>
              )}
            </div>

            {/* 좋은 이유 */}
            {current.reason && (
              <section>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">좋은 이유</p>
                <p className="text-sm text-gray-700 leading-relaxed">{current.reason}</p>
              </section>
            )}

            {/* 해시태그 */}
            {current.hashtags && current.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {current.hashtags.map((tag) => (
                  <span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                    <span className="text-accent text-[10px]">#</span>{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 추천 링크 */}
            {current.link_url && (
              <a
                href={current.link_url}
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
              {new Date(current.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {showEdit && (
        <SongEditModal
          song={current}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { handleSaved(updated); setShowEdit(false); }}
        />
      )}
      {showPasswordModal && (
        <PasswordModal onSuccess={handleAuthSuccess} onClose={handleAuthClose} />
      )}
    </>
  );
}
