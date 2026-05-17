'use client';

import { ImageRecord } from '@/lib/types';
import ImageCard from './ImageCard';

interface Props {
  images: ImageRecord[];
  onImageClick: (image: ImageRecord) => void;
  onFavoriteToggle: (id: string, favorited: boolean) => void;
}

export default function Moodboard({ images, onImageClick, onFavoriteToggle }: Props) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-300">
        <p className="text-4xl mb-4">✦</p>
        <p className="text-sm">이미지를 추가해 무드보드를 채워보세요</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid p-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={onImageClick}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
}
