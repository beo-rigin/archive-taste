'use client';

import { useState, useRef, useCallback } from 'react';
import { FoodRecord, FoodAiTags } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { IconX, IconUpload, IconLink, IconLoader2, IconSparkles, IconHeart, IconHeartFilled, IconMapPin } from '@tabler/icons-react';

interface Props {
  onClose: () => void;
  onFoodAdded: (food: FoodRecord) => void;
}

type Mode = 'upload' | 'url';
type Step = 'select' | 'analyzing' | 'form';

export default function FoodUploadModal({ onClose, onFoodAdded }: Props) {
  const [mode, setMode] = useState<Mode>('upload');
  const [step, setStep] = useState<Step>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storageUrl, setStorageUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [aiTags, setAiTags] = useState<FoodAiTags | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Form fields
  const [place, setPlace] = useState('');
  const [foodName, setFoodName] = useState('');
  const [withWhom, setWithWhom] = useState('');
  const [recipe, setRecipe] = useState('');
  const [userTagsInput, setUserTagsInput] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useCallback(async (imageUrl: string) => {
    setStep('analyzing');
    setAnalyzeError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, mode: 'food' }),
      });
      if (!res.ok) throw new Error('분석 실패');
      const { tags } = await res.json();
      setAiTags(tags);
    } catch {
      setAnalyzeError('AI 분석 중 오류가 발생했습니다. 계속 진행할 수 있습니다.');
    } finally {
      setStep('form');
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPreviewUrl(URL.createObjectURL(file));
    setStep('analyzing');
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `food/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('moodboard').upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('moodboard').getPublicUrl(data.path);
      setStorageUrl(urlData.publicUrl);
      await analyzeImage(urlData.publicUrl);
    } catch {
      setAnalyzeError('이미지 업로드 중 오류가 발생했습니다. 환경변수를 확인해주세요.');
      setStep('form');
    }
  }, [analyzeImage]);

  const handleUrlAnalyze = useCallback(async () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    setStorageUrl(urlInput.trim());
    await analyzeImage(urlInput.trim());
  }, [urlInput, analyzeImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSave = async () => {
    if (!storageUrl || !place.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          src_url: storageUrl,
          place: place.trim(),
          food_name: foodName.trim(),
          with_whom: withWhom.trim(),
          recipe: recipe.trim(),
          user_tags: userTagsInput.split(',').map((t) => t.trim()).filter(Boolean),
          ai_tags: aiTags ?? {},
          favorited,
        }),
      });
      if (!res.ok) throw new Error('저장 실패');
      const food = await res.json();
      onFoodAdded(food);
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={onClose}>
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold tracking-widest uppercase text-gray-700">요리 기록 추가</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <IconX size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Step: select */}
          {step === 'select' && (
            <>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
                <button onClick={() => setMode('upload')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-medium transition-colors ${mode === 'upload' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <IconUpload size={15} />파일 업로드
                </button>
                <button onClick={() => setMode('url')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-medium transition-colors ${mode === 'url' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <IconLink size={15} />URL 입력
                </button>
              </div>

              {mode === 'upload' ? (
                <div
                  onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? 'border-accent bg-green-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                  <IconUpload size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">이미지를 드래그하거나 클릭하여 선택</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="url" placeholder="https://example.com/food.jpg" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent transition-colors"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUrlAnalyze(); }} />
                  <button onClick={handleUrlAnalyze} disabled={!urlInput.trim()} className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors">
                    이미지 불러오기
                  </button>
                </div>
              )}
            </>
          )}

          {/* Step: analyzing */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center py-10 gap-4">
              {previewUrl && <img src={previewUrl} alt="" className="max-h-48 rounded-xl object-cover" />}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <IconLoader2 size={18} className="animate-spin text-accent" />
                음식 종류를 분석하고 있습니다…
              </div>
            </div>
          )}

          {/* Step: form */}
          {step === 'form' && (
            <>
              {previewUrl && (
                <div className="flex justify-center">
                  <img src={previewUrl} alt="" className="max-h-52 rounded-xl object-cover border border-gray-100" />
                </div>
              )}

              {/* AI 분류 결과 */}
              {aiTags && (aiTags.대분류 || aiTags.중분류) && (
                <section className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <IconSparkles size={14} className="text-accent" />
                    <p className="text-xs font-bold text-accent tracking-wide uppercase">AI 분류</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {aiTags.대분류 && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white">{aiTags.대분류}</span>}
                    {aiTags.중분류 && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-accent border border-green-200">{aiTags.중분류}</span>}
                  </div>
                </section>
              )}

              {analyzeError && <p className="text-xs text-amber-500 bg-amber-50 rounded-xl p-3">{analyzeError}</p>}

              {/* 장소 (필수) */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                  장소 <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <IconMapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="레스토랑 이름 또는 지역"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent transition-colors" />
                </div>
              </div>

              {/* 음식명 */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">음식명</label>
                <input type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="메뉴 이름 (선택)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent transition-colors" />
              </div>

              {/* 누구와 */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">누구와</label>
                <input type="text" value={withWhom} onChange={(e) => setWithWhom(e.target.value)} placeholder="혼자 / 친구 / 가족 / 연인 (선택)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent transition-colors" />
              </div>

              {/* 레시피 메모 */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">레시피 메모</label>
                <textarea value={recipe} onChange={(e) => setRecipe(e.target.value)} placeholder="기억해두고 싶은 레시피나 맛 메모 (선택)" rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent transition-colors resize-none" />
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">태그</label>
                <input type="text" value={userTagsInput} onChange={(e) => setUserTagsInput(e.target.value)} placeholder="태그1, 태그2, 태그3 (쉼표로 구분, 선택)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent transition-colors" />
              </div>

              {/* 즐겨찾기 */}
              <button onClick={() => setFavorited((v) => !v)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors">
                {favorited ? <IconHeartFilled size={18} className="text-red-500" /> : <IconHeart size={18} />}
                즐겨찾기에 추가
              </button>

              {/* 저장 */}
              <button onClick={handleSave} disabled={!storageUrl || !place.trim() || isSaving}
                className="w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold tracking-wide disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {isSaving ? <><IconLoader2 size={16} className="animate-spin" />저장 중…</> : '기록 추가'}
              </button>
              {!place.trim() && storageUrl && <p className="text-xs text-center text-gray-400">장소는 필수 입력입니다</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
