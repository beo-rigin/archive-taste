'use client';

import { useState, KeyboardEvent } from 'react';
import { ImageRecord } from '@/lib/types';
import { COLORS } from '@/lib/colors';
import { IconX, IconLoader2 } from '@tabler/icons-react';

interface Props {
  image: ImageRecord;
  onClose: () => void;
  onSaved: (updated: ImageRecord) => void;
}

export default function ImageEditModal({ image, onClose, onSaved }: Props) {
  const [colorTags, setColorTags] = useState<string[]>(image.color_tags ?? []);
  const [userTags, setUserTags] = useState<string[]>(image.user_tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleColor(id: string) {
    setColorTags((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function addTag() {
    const val = tagInput.trim();
    if (val && !userTags.includes(val)) setUserTags((prev) => [...prev, val]);
    setTagInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && tagInput === '' && userTags.length > 0) {
      setUserTags((prev) => prev.slice(0, -1));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/images?id=${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_tags: userTags, color_tags: colorTags }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? '수정 실패');
      }
      const updated = await res.json();
      onSaved({ ...image, ...updated });
      onClose();
    } catch (e) {
      alert('저장 오류: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">태그 수정</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <IconX size={16} className="text-gray-400" />
          </button>
        </div>

        {/* 색감 */}
        <div>
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
            색감
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(({ id, hex }) => {
              const selected = colorTags.includes(id);
              const isLight = id === '하양';
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleColor(id)}
                  title={id}
                  className={`relative w-7 h-7 rounded-full transition-all ${
                    isLight ? 'border border-gray-200' : ''
                  } ${selected ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
          </div>
          {colorTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {colorTags.map((c) => {
                const color = COLORS.find((x) => x.id === c);
                return (
                  <span key={c} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                    <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: color?.hex }} />
                    {c}
                    <button onClick={() => toggleColor(c)} className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* 나의 태그 */}
        <div>
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
            나의 태그
          </label>
          <div
            className="min-h-[44px] flex flex-wrap gap-1.5 items-center rounded-lg border border-gray-200 px-3 py-2 focus-within:border-accent transition-colors cursor-text"
            onClick={() => document.getElementById('img-tag-input')?.focus()}
          >
            {userTags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                {tag}
                <button
                  onClick={(e) => { e.stopPropagation(); setUserTags((prev) => prev.filter((t) => t !== tag)); }}
                  className="text-gray-400 hover:text-gray-600 leading-none ml-0.5"
                >×</button>
              </span>
            ))}
            <input
              id="img-tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
              placeholder={userTags.length === 0 ? '태그 입력 (Enter로 추가)' : ''}
              className="flex-1 min-w-[100px] text-sm focus:outline-none bg-transparent"
            />
          </div>
          <p className="text-[10px] text-gray-300 mt-1">Enter / 스페이스로 추가, Backspace로 삭제</p>
        </div>

        {/* 저장 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {saving && <IconLoader2 size={15} className="animate-spin" />}
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}
