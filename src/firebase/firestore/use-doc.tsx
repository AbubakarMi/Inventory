
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, type DocumentReference, type DocumentData } from 'firebase/firestore';

type Options = {
  listen?: boolean;
};

export function useDoc<T>(
  ref: DocumentReference<T, DocumentData> | null,
  options: Options = { listen: true }
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedRef = useMemo(() => ref, [ref]);

  useEffect(() => {
    if (!memoizedRef) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);

    if (!options.listen) {
        // Implement getDoc logic if needed for non-listening fetches
        setLoading(false);
        return;
    }

    const unsubscribe = onSnapshot(
      memoizedRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedRef, options.listen]);

  return { data, loading, error };
}
