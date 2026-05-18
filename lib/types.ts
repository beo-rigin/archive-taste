export interface AiTags {
  사조?: string;
  형태및드로잉?: string;
  색감질감?: string;
  무드감성?: string;
  작가명?: string;
}

export interface ImageRecord {
  id: string;
  src_url: string;
  reason: string;
  user_tags: string[];
  ai_tags: AiTags;
  favorited: boolean;
  likes: number;
  created_at: string;
}

// ── FOOD ──────────────────────────────────────────────
export interface FoodAiTags {
  대분류?: string;
  중분류?: string;
}

export interface FoodRecord {
  id: string;
  src_url: string;
  place: string;
  food_name: string;
  with_whom: string;
  recipe: string;
  user_tags: string[];
  ai_tags: FoodAiTags;
  favorited: boolean;
  likes: number;
  created_at: string;
}

// ── SONG ──────────────────────────────────────────────
export interface SongRecord {
  id: string;
  title: string;
  artist: string;
  reason: string;
  album_art_url: string;
  album_name: string;
  ai_tags: { 장르?: string };
  favorited: boolean;
  likes: number;
  created_at: string;
}

export interface SongLookupResult {
  artworkUrl: string;
  albumName: string;
  genre: string;
  trackName: string;
  artistName: string;
}

// ── 공통 ──────────────────────────────────────────────
export type Period = 'all' | '2025' | '2024' | '25Q1' | '25Q2';

export type Category = 'POSTER' | 'FOOD' | 'SONG' | 'SENTENCE' | 'PROFILE';

export interface TagCount {
  tag: string;
  count: number;
}

export interface CategoryTagStats {
  category: string;
  label: string;
  tags: TagCount[];
}
