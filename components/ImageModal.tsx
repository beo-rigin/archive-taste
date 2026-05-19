'use client';

import { useEffect, useState } from 'react';
import { ImageRecord } from '@/lib/types';
import { COLORS } from '@/lib/colors';
import { IconX, IconHeart, IconHeartFilled, IconPencil } from '@tabler/icons-react';
import ImageEditModal from './ImageEditModal';
import PasswordModal from './PasswordModal';
import { useUploadAuth } from '@/hooks/useUploadAuth';

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
  onImageUpdated?: (updated: ImageRecord) => void;
}

export default function ImageModal({ image, onClose, onFavoriteToggle, onImageUpdated }: Props) {
  const [current, setCurrent] = useState<ImageRecord>(image);
  const [showEdit, setShowEdit] = useState(false);
  const { requireAuth, showPasswordModal, handleAuthSuccess, handleAuthClose } = useUploadAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSaved(updated: ImageRecord) {
    setCurrent(updated);
    onImageUpdated?.(updated);
  }

  const aiTagEntries = Object.entries(current.ai_tags ?? {}).filter(([, v]) => v && v !== '미상');
  const colorList = (current.color_tags ?? [])
    .map((id) => COLORS.find((c) => c.id === id))
    .filter(Boolean) as { id: string; hex: string }[];

  return (
    <>
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
              src={current.src_url}
              alt={current.reason ?? ''}
              className="w-full h-full object-contain max-h-[60vh] md:max-h-[85vh]"
            />
          </div>

          {/* Info panel */}
          <div className="w-full md:w-72 shrink-0 overflow-y-auto p-5 flex flex-col gap-4">
            {/* 상단 액션 */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => onFavoriteToggle(current.id, !current.favorited)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
              >
                {current.favorited ? (
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
              <button
                onClick={() => requireAuth(() => setShowEdit(true))}
                title="태그 수정"
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <IconPencil size={15} className="text-gray-400" />
              </button>
            </div>

            {/* Reason */}
            {current.reason && (
              <section>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
                  저장 이유
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{current.reason}</p>
              </section>
            )}

            {/* 색감 */}
            {colorList.length > 0 && (
              <section>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                  색감
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {colorList.map(({ id, hex }) => (
                    <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-gray-200" style={{ backgroundColor: hex }} />
                      {id}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* User tags */}
            {(current.user_tags ?? []).length > 0 && (
              <section>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
                  나의 태그
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {current.user_tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
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
              {new Date(current.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {showEdit && (
        <ImageEditModal
          image={current}
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
