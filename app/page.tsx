'use client';

import { useState, useEffect, useMemo } from 'react';
import { ImageRecord, Period, Category } from '@/lib/types';
import CategoryTabs from '@/components/CategoryTabs';
import Sidebar from '@/components/Sidebar';
import KeywordBar from '@/components/KeywordBar';
import Moodboard from '@/components/Moodboard';
import ImageModal from '@/components/ImageModal';
import UploadModal from '@/components/UploadModal';
import FoodSection from '@/components/food/FoodSection';
import SongSection from '@/components/song/SongSection';
import PasswordModal from '@/components/PasswordModal';
import { useUploadAuth } from '@/hooks/useUploadAuth';
import { IconPlus } from '@tabler/icons-react';

function filterByPeriod(images: ImageRecord[], period: Period): ImageRecord[] {
  if (period === 'all') return images;
  return images.filter((img) => {
    const d = new Date(img.created_at);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (period === '2025') return y === 2025;
    if (period === '2024') return y === 2024;
    if (period === '25Q1') return y === 2025 && m >= 1 && m <= 3;
    if (period === '25Q2') return y === 2025 && m >= 4 && m <= 6;
    return true;
  });
}

export default function Home() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  const [activeCategory, setActiveCategory] = useState<Category>('POSTER');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const { requireAuth, showPasswordModal, handleAuthSuccess, handleAuthClose } = useUploadAuth();

  useEffect(() => {
    fetch('/api/images')
      .then((r) => r.json())
      .then((data) => setImages(Array.isArray(data) ? data : []))
      .catch(() => setImages([]));
  }, []);

  const periodImages = useMemo(() => filterByPeriod(images, selectedPeriod), [images, selectedPeriod]);

  const filteredImages = useMemo(() => {
    if (selectedTags.length === 0) return periodImages;
    return periodImages.filter((img) => {
      const tags = [
        ...(img.user_tags ?? []),
        ...Object.values(img.ai_tags ?? {}).filter(Boolean),
      ];
      return selectedTags.every((t) => tags.includes(t));
    });
  }, [periodImages, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleFavoriteToggle = async (id: string, favorited: boolean) => {
    await fetch(`/api/images?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorited }),
    });
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, favorited } : img)));
    if (selectedImage?.id === id) {
      setSelectedImage((prev) => (prev ? { ...prev, favorited } : null));
    }
  };

  const handleImageAdded = (image: ImageRecord) => {
    setImages((prev) => [image, ...prev]);
    setIsUploadOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Sticky header + tabs */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="relative flex items-center justify-center px-6 h-14">
          {/* 가운데 로고 */}
          <img src="/logo.png" alt="Takeiteasyin" className="h-7 object-contain" />

          {/* 우측 업로드 버튼 */}
          {activeCategory === 'POSTER' && (
            <button
              onClick={() => requireAuth(() => setIsUploadOpen(true))}
              className="absolute right-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: '#339d55' }}
            >
              <IconPlus size={14} strokeWidth={2.5} />
              업로드
            </button>
          )}
        </div>
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      </header>

      {activeCategory === 'POSTER' ? (
        <div className="flex">
          <Sidebar
            images={periodImages}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />

          <main className="flex-1 min-w-0">
            <KeywordBar
              images={periodImages}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearFilter={() => setSelectedTags([])}
            />
            <Moodboard
              images={filteredImages}
              onImageClick={setSelectedImage}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </main>
        </div>
      ) : activeCategory === 'FOOD' ? (
        <FoodSection />
      ) : activeCategory === 'SONG' ? (
        <div className="px-6 pt-6">
          <SongSection />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-3">
          <span className="text-3xl">✦</span>
          <p className="text-sm tracking-widest uppercase">준비 중</p>
        </div>
      )}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}

      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)} onImageAdded={handleImageAdded} />
      )}

      {showPasswordModal && (
        <PasswordModal onSuccess={handleAuthSuccess} onClose={handleAuthClose} />
      )}
    </div>
  );
}
