
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot, FirestoreError } from 'firebase/firestore';
import type { WithId } from '@/lib/types';

type CollectionState<T> = {
  data: WithId<T>[] | null;
  loading: boolean;
  error: FirestoreError | null;
};

/**
 * Hook to get a real-time stream of documents from a Firestore query.
 * @param query The Firestore query to listen to.
 * @returns The collection data, loading state, and error.
 */
export function useCollection<T>(query: Query<DocumentData> | null) {
  const [state, setState] = useState<CollectionState<T>>({
    data: null,
    loading: query !== null, // Only loading if query is not null
    error: null,
  });

  const queryPath = useMemo(() => query?.path, [query]);

  useEffect(() => {
    // Initial loading state should be true only if query is present
    setState(prevState => ({ ...prevState, loading: query !== null }));

    if (!query) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<T>));
        setState({ data, loading: false, error: null });
      },
      (error: FirestoreError) => {
        console.error('Error fetching collection:', error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [queryPath]); // Depend on the memoized path

  return state;
}
