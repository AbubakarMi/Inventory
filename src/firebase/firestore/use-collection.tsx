
'use client';

import { useEffect, useState, useRef } from 'react';
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
    loading: true,
    error: null,
  });

  // Use a ref to store the query to prevent re-running the effect on every render
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);


  useEffect(() => {
    if (!queryRef.current) {
        setState(prevState => ({ ...prevState, loading: false }));
        return;
    }
    
    setState(prevState => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(
      queryRef.current,
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
  }, [queryRef.current]);

  return state;
}
