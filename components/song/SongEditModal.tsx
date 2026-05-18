'use client';

import { useState, KeyboardEvent } from 'react';
import { SongRecord } from '@/lib/types';
import { IconX, IconLink, IconHash, IconLoader2 } from '@tabler/icons-react';

interface Props {
  song: SongRecord;
  onClose: () => void;
  onSaved: (updated: SongRecord) => void;
}

export default function SongEditModal({ song, onClose, onSaved }: Props) {
  const [linkUrl, setLinkUrl] = useState(song.link_url ?? '');
  const [hashtags, setHashtags] = useState<string[]>(song.hashtags ?? []);
  const [hashInput, setHashInput] = useState('');
  const [saving, setSaving] = useState(false);

  function addTag() {
    const val = hashInput.replace(/^#/, '').trim();
    if (val && !hashtags.includes(val)) {
      setHashtags((prev) => [...prev, val]);
    }
    setHashInput('');
  }

  function handleHashKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && hashInput === '' && hashtags.length > 0) {
      setHashtags((prev) => prev.slice(0, -1));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/song?id=${song.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link_url: linkUrl.trim() || '',
          hashtags,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? '수정 실패');
      }
      const updated = await res.json();
      onSaved({ ...song, ...updated });
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
          <div>
            <h3 className="text-sm font-bold text-gray-800">수정</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{song.title} — {song.artist}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <IconX size={16} className="text-gray-400" />
          </button>
        </div>

        {/* 추천 링크 */}
        <div>
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
            추천 링크
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-accent transition-colors">
            <IconLink size={14} className="text-gray-400 shrink-0" />
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="flex-1 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* 해시태그 */}
        <div>
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
            해시태그
          </label>
          <div className="min-h-[44px] flex flex-wrap gap-1.5 items-center rounded-lg border border-gray-200 px-3 py-2 focus-within:border-accent transition-colors cursor-text"
            onClick={() => document.getElementById('hash-input')?.focus()}
          >
            {hashtags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                <span className="text-accent text-[10px]">#</span>{tag}
                <button
                  onClick={(e) => { e.stopPropagation(); setHashtags((prev) => prev.filter((t) => t !== tag)); }}
                  className="text-gray-400 hover:text-gray-600 leading-none ml-0.5"
                >×</button>
              </span>
            ))}
            <input
              id="hash-input"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              onKeyDown={handleHashKeyDown}
              onBlur={addTag}
              placeholder={hashtags.length === 0 ? '날씨, 시간대, 악기... (Enter로 추가)' : ''}
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
