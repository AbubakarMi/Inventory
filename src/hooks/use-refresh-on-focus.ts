"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to refresh data when window regains focus
 * Useful for keeping data in sync after modal operations
 */
export function useRefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);
}
