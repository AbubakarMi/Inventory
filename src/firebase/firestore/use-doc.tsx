
'use client';

import { useEffect, useState, useRef } from 'react';
import { onSnapshot, DocumentReference, DocumentData, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import type { WithId } from '@/lib/types';


type DocState<T> = {
  data: WithId<T> | null;
  loading: boolean;
  error: FirestoreError | null;
};

/**
 * Hook to get a real-time stream of a single document from Firestore.
 * @param ref The Firestore document reference to listen to.
 * @returns The document data, loading state, and error.
 */
export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
  const [state, setState] = useState<DocState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  
  const refRef = useRef(ref);
  useEffect(() => {
    refRef.current = ref;
  }, [ref]);

  useEffect(() => {
    if (!refRef.current) {
      setState(prevState => ({...prevState, loading: false}));
      return;
    }

    setState(prevState => ({...prevState, loading: true}));

    const unsubscribe = onSnapshot(
      refRef.current,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as WithId<T>;
          setState({ data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: null });
        }
      },
      (error: FirestoreError) => {
        console.error('Error fetching document:', error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [refRef.current]);

  return state;
}
