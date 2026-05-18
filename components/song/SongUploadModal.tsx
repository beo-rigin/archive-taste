'use client';

import { useState, KeyboardEvent } from 'react';
import { IconX, IconSearch, IconMusic, IconLoader2, IconLink, IconHash } from '@tabler/icons-react';
import { SongRecord, Decade } from '@/lib/types';

interface Props {
  onClose: () => void;
  onSaved: (song: SongRecord) => void;
}

const DECADES: { id: Decade; label: string }[] = [
  { id: '7080', label: '7080' },
  { id: '1990', label: '90s' },
  { id: '2000', label: '2000s' },
  { id: '2010', label: '2010s' },
  { id: '2020', label: '2020s' },
];

export default function SongUploadModal({ onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [reason, setReason] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashInput, setHashInput] = useState('');
  const [selectedDecade, setSelectedDecade] = useState<Decade | ''>('');

  function addTag() {
    const val = hashInput.replace(/^#/, '').trim();
    if (val && !hashtags.includes(val)) setHashtags((prev) => [...prev, val]);
    setHashInput('');
  }

  function handleHashKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && hashInput === '' && hashtags.length > 0) {
      setHashtags((prev) => prev.slice(0, -1));
    }
  }

  const [lookupResult, setLookupResult] = useState<{
    artworkUrl: string;
    albumName: string;
    genre: string;
    trackName: string;
    artistName: string;
    releaseYear: number | null;
    decade: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleLookup() {
    if (!title.trim() || !artist.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const res = await fetch(
        `/api/song-lookup?title=${encodeURIComponent(title.trim())}&artist=${encodeURIComponent(artist.trim())}`,
      );
      if (!res.ok) {
        setLookupError('곡을 찾을 수 없어요. 제목과 아티스트명을 다시 확인해주세요.');
        return;
      }
      const data = await res.json();
      setLookupResult(data);
      // 연대 자동 설정
      if (data.decade) setSelectedDecade(data.decade as Decade);
    } catch {
      setLookupError('검색 중 오류가 발생했어요.');
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || !artist.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: lookupResult?.trackName ?? title.trim(),
        artist: lookupResult?.artistName ?? artist.trim(),
        reason: reason.trim() || null,
        album_art_url: lookupResult?.artworkUrl ?? null,
        album_name: lookupResult?.albumName ?? null,
        ai_tags: lookupResult?.genre ? { 장르: lookupResult.genre } : null,
        decade: selectedDecade || null,
        link_url: linkUrl.trim() || null,
        hashtags,
        favorited: false,
      };
      const res = await fetch('/api/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('save failed');
      const saved = await res.json();
      onSaved(saved);
      onClose();
    } catch {
      alert('저장 중 오류가 발생했어요.');
    } finally {
      setSaving(false);
    }
  }

  const canLookup = title.trim().length > 0 && artist.trim().length > 0;
  const canSave = title.trim().length > 0 && artist.trim().length > 0 && !saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold tracking-widest text-gray-700 uppercase">곡 추가</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <IconX size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 곡 제목 + 가수 */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
                곡 제목 <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setLookupResult(null); setLookupError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && canLookup) handleLookup(); }}
                placeholder="곡 제목을 입력하세요"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
                가수 <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => { setArtist(e.target.value); setLookupResult(null); setLookupError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && canLookup) handleLookup(); }}
                placeholder="아티스트명을 입력하세요"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleLookup}
              disabled={!canLookup || lookupLoading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {lookupLoading ? <IconLoader2 size={15} className="animate-spin" /> : <IconSearch size={15} />}
              {lookupLoading ? '검색 중...' : '앨범 정보 검색'}
            </button>
          </div>

          {/* 에러 */}
          {lookupError && <p className="text-xs text-red-400 text-center">{lookupError}</p>}

          {/* 검색 결과 */}
          {lookupResult && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                {lookupResult.artworkUrl ? (
                  <img src={lookupResult.artworkUrl} alt={lookupResult.trackName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <IconMusic size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{lookupResult.trackName}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{lookupResult.artistName}</p>
                {lookupResult.albumName && <p className="text-xs text-gray-400 truncate mt-0.5">{lookupResult.albumName}</p>}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {lookupResult.genre && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent text-white">
                      {lookupResult.genre}
                    </span>
                  )}
                  {lookupResult.releaseYear && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-600">
                      {lookupResult.releaseYear}년
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 연대 선택 */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
              연대
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DECADES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedDecade(selectedDecade === id ? '' : id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedDecade === id
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 좋은 이유 */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
              좋은 이유
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="이 곡이 좋은 이유를 자유롭게 적어주세요"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* 추천 링크 */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
              추천 링크 <span className="text-gray-300 normal-case font-normal">(선택)</span>
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
              해시태그 <span className="text-gray-300 normal-case font-normal">(선택)</span>
            </label>
            <div
              className="min-h-[44px] flex flex-wrap gap-1.5 items-center rounded-lg border border-gray-200 px-3 py-2 focus-within:border-accent transition-colors cursor-text"
              onClick={() => document.getElementById('upload-hash-input')?.focus()}
            >
              {hashtags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                  <span className="text-accent text-[10px]">#</span>{tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHashtags((prev) => prev.filter((t) => t !== tag)); }}
                    className="text-gray-400 hover:text-gray-600 leading-none ml-0.5"
                  >×</button>
                </span>
              ))}
              <input
                id="upload-hash-input"
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

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
