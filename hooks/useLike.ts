'use client';

import { useState, useCallback } from 'react';

type TableName = 'images' | 'food' | 'songs';

const STORAGE_KEY = 'archive_liked';

function getLiked(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}

function setLiked(liked: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liked));
}

export function useLike(id: string, table: TableName, initialLikes: number) {
  const liked = getLiked();
  const [isLiked, setIsLiked] = useState(!!liked[`${table}:${id}`]);
  const [count, setCount] = useState(initialLikes ?? 0);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (loading) return;
      setLoading(true);

      const delta = isLiked ? -1 : 1;
      const newLiked = !isLiked;

      // 낙관적 업데이트
      setIsLiked(newLiked);
      setCount((c) => Math.max(0, c + delta));

      // localStorage 저장
      const current = getLiked();
      const key = `${table}:${id}`;
      if (newLiked) current[key] = true;
      else delete current[key];
      setLiked(current);

      try {
        const res = await fetch(`/api/like?id=${id}&table=${table}&delta=${delta}`, {
          method: 'POST',
        });
        if (res.ok) {
          const { likes } = await res.json();
          setCount(likes);
        }
      } catch {
        // 실패 시 롤백
        setIsLiked(isLiked);
        setCount((c) => Math.max(0, c - delta));
      } finally {
        setLoading(false);
      }
    },
    [id, table, isLiked, loading],
  );

  return { isLiked, count, toggle };
}
