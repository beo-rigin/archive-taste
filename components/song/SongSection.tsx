'use client';

import { useEffect, useState, useMemo } from 'react';
import { SongRecord, Period, Decade } from '@/lib/types';
import SongSidebar from './SongSidebar';
import SongCard from './SongCard';
import SongModal from './SongModal';
import SongUploadModal from './SongUploadModal';
import PasswordModal from '@/components/PasswordModal';
import { useUploadAuth } from '@/hooks/useUploadAuth';
import { IconPlus } from '@tabler/icons-react';

function filterByPeriod(songs: SongRecord[], period: Period): SongRecord[] {
  if (period === 'all') return songs;
  return songs.filter((s) => {
    const d = new Date(s.created_at);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (period === '2025') return y === 2025;
    if (period === '2024') return y === 2024;
    if (period === '25Q1') return y === 2025 && m >= 1 && m <= 3;
    if (period === '25Q2') return y === 2025 && m >= 4 && m <= 6;
    return true;
  });
}

export default function SongSection() {
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<Decade[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongRecord | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { requireAuth, showPasswordModal, handleAuthSuccess, handleAuthClose } = useUploadAuth();

  useEffect(() => {
    fetch('/api/song')
      .then((r) => r.json())
      .then((data) => setSongs(Array.isArray(data) ? data : []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  const periodFiltered = useMemo(() => filterByPeriod(songs, selectedPeriod), [songs, selectedPeriod]);

  const displayed = useMemo(() => {
    let result = periodFiltered;
    if (selectedDecades.length > 0) {
      result = result.filter((s) => s.decade && selectedDecades.includes(s.decade as Decade));
    }
    if (selectedTags.length > 0) {
      result = result.filter((s) => {
        const genre = s.ai_tags?.장르 ?? '';
        const artist = s.artist ?? '';
        return selectedTags.some((t) => t === genre || t === artist);
      });
    }
    return result;
  }, [periodFiltered, selectedTags, selectedDecades]);

  function handleTagToggle(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function handleDecadeToggle(decade: Decade) {
    setSelectedDecades((prev) => prev.includes(decade) ? prev.filter((d) => d !== decade) : [...prev, decade]);
  }

  function handleSaved(song: SongRecord) {
    setSongs((prev) => [song, ...prev]);
  }

  const hasFilter = selectedTags.length > 0 || selectedDecades.length > 0;

  return (
    <div className="flex gap-8 items-start">
      <SongSidebar
        songs={periodFiltered}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        selectedDecades={selectedDecades}
        onDecadeToggle={handleDecadeToggle}
      />

      <main className="flex-1 min-w-0 pb-16">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-gray-400">
            {displayed.length}곡
            {hasFilter && (
              <button
                onClick={() => { setSelectedTags([]); setSelectedDecades([]); }}
                className="ml-2 text-accent underline underline-offset-2"
              >
                필터 초기화
              </button>
            )}
          </p>
          <button
            onClick={() => requireAuth(() => setShowUpload(true))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors shadow-sm"
          >
            <IconPlus size={14} />
            곡 추가
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-sm">아직 기록된 곡이 없어요</p>
            <button onClick={() => requireAuth(() => setShowUpload(true))} className="mt-3 text-xs text-accent underline underline-offset-2">
              첫 곡 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayed.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onClick={setSelectedSong}
                onFavoriteToggle={() => {}}
              />
            ))}
          </div>
        )}
      </main>

      {selectedSong && (
        <SongModal song={selectedSong} onClose={() => setSelectedSong(null)} />
      )}
      {showUpload && (
        <SongUploadModal onClose={() => setShowUpload(false)} onSaved={handleSaved} />
      )}
      {showPasswordModal && (
        <PasswordModal onSuccess={handleAuthSuccess} onClose={handleAuthClose} />
      )}
    </div>
  );
}
