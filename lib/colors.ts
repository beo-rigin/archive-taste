export const COLORS = [
  { id: '빨강', hex: '#EF4444' },
  { id: '주황', hex: '#F97316' },
  { id: '노랑', hex: '#EAB308' },
  { id: '초록', hex: '#22C55E' },
  { id: '파랑', hex: '#3B82F6' },
  { id: '남색', hex: '#3730A3' },
  { id: '보라', hex: '#A855F7' },
  { id: '하양', hex: '#F9FAFB' },
  { id: '검정', hex: '#111111' },
  { id: '분홍', hex: '#EC4899' },
] as const;

export type ColorId = (typeof COLORS)[number]['id'];
