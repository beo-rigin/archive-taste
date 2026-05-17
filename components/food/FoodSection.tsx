'use client';

import { useState, useEffect, useMemo } from 'react';
import { FoodRecord, Period } from '@/lib/types';
import FoodSidebar from './FoodSidebar';
import FoodCard from './FoodCard';
import FoodModal from './FoodModal';
import FoodUploadModal from './FoodUploadModal';
import KeywordBar from '@/components/KeywordBar';
import { IconPlus } from '@tabler/icons-react';

function filterByPeriod(foods: FoodRecord[], period: Period): FoodRecord[] {
  if (period === 'all') return foods;
  return foods.filter((f) => {
    const d = new Date(f.created_at);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (period === '2025') return y === 2025;
    if (period === '2024') return y === 2024;
    if (period === '25Q1') return y === 2025 && m >= 1 && m <= 3;
    if (period === '25Q2') return y === 2025 && m >= 4 && m <= 6;
    return true;
  });
}

// FoodRecord를 KeywordBar용 ImageRecord 형태로 변환
function toKeywordItems(foods: FoodRecord[]) {
  return foods.map((f) => ({
    ...f,
    reason: '',
    user_tags: [...(f.user_tags ?? []), f.place, f.with_whom].filter(Boolean) as string[],
    ai_tags: {
      사조: f.ai_tags?.대분류,
      형태및드로잉: f.ai_tags?.중분류,
    } as Record<string, string>,
    src_url: f.src_url,
  }));
}

export default function FoodSection() {
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodRecord | null>(null);

  useEffect(() => {
    fetch('/api/food')
      .then((r) => r.json())
      .then((data) => setFoods(Array.isArray(data) ? data : []))
      .catch(() => setFoods([]));
  }, []);

  const periodFoods = useMemo(() => filterByPeriod(foods, selectedPeriod), [foods, selectedPeriod]);

  const filteredFoods = useMemo(() => {
    if (selectedTags.length === 0) return periodFoods;
    return periodFoods.filter((f) => {
      const tags = [
        ...(f.user_tags ?? []),
        f.place,
        f.with_whom,
        f.ai_tags?.대분류,
        f.ai_tags?.중분류,
      ].filter(Boolean) as string[];
      return selectedTags.every((t) => tags.includes(t));
    });
  }, [periodFoods, selectedTags]);

  const handleTagToggle = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleFavoriteToggle = async (id: string, favorited: boolean) => {
    await fetch(`/api/food?id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ favorited }) });
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, favorited } : f)));
    if (selectedFood?.id === id) setSelectedFood((prev) => prev ? { ...prev, favorited } : null);
  };

  const handleFoodAdded = (food: FoodRecord) => {
    setFoods((prev) => [food, ...prev]);
    setIsUploadOpen(false);
  };

  return (
    <>
      <div className="flex">
        <FoodSidebar
          foods={periodFoods}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />

        <main className="flex-1 min-w-0">
          {/* 업로드 버튼 + 키워드 바 */}
          <div className="keyword-bar flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shrink-0 hover:opacity-85 transition-opacity"
              style={{ backgroundColor: '#339d55' }}
            >
              <IconPlus size={13} strokeWidth={2.5} />
              기록 추가
            </button>
            <div className="flex-1 overflow-hidden">
              <KeywordBar
                images={toKeywordItems(periodFoods) as never}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearFilter={() => setSelectedTags([])}
              />
            </div>
          </div>

          {/* 그리드 */}
          {filteredFoods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300 gap-3">
              <span className="text-3xl">🍽️</span>
              <p className="text-sm">식도락 기록을 추가해보세요</p>
            </div>
          ) : (
            <div className="masonry-grid p-4">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} onClick={setSelectedFood} onFavoriteToggle={handleFavoriteToggle} />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedFood && (
        <FoodModal food={selectedFood} onClose={() => setSelectedFood(null)} onFavoriteToggle={handleFavoriteToggle} />
      )}

      {isUploadOpen && (
        <FoodUploadModal onClose={() => setIsUploadOpen(false)} onFoodAdded={handleFoodAdded} />
      )}
    </>
  );
}
