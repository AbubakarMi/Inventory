
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, type Query, type DocumentData } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

type Options = {
  listen?: boolean;
};

export function useCollection<T extends DocumentData>(
  q: Query | null,
  options: Options = { listen: true }
): { data: T[] | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedQuery = useMemo(() => q, [q]);

  useEffect(() => {
    if (!memoizedQuery) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (querySnapshot) => {
        const data: T[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery, options.listen]);

  return { data, loading, error };
}
