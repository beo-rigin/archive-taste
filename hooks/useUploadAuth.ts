'use client';

import { useState, useCallback } from 'react';

export function useUploadAuth() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAuth = useCallback((action: () => void) => {
    const authed = typeof window !== 'undefined' && sessionStorage.getItem('archive_authed') === '1';
    if (authed) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPasswordModal(true);
    }
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setShowPasswordModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleAuthClose = useCallback(() => {
    setShowPasswordModal(false);
    setPendingAction(null);
  }, []);

  return { requireAuth, showPasswordModal, handleAuthSuccess, handleAuthClose };
}
