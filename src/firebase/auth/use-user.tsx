
'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onIdTokenChanged } from 'firebase/auth';
import { useAuth } from '@/firebase';

type UserState = {
  user: User | null;
  claims: any | null;
  loading: boolean;
};

/**
 * Hook to get the current authenticated user.
 * @returns The current user, claims, and loading state.
 */
export function useUser() {
  const auth = useAuth();
  const [userState, setUserState] = useState<UserState>({
    user: auth?.currentUser || null,
    claims: null,
    loading: true,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, claims: null, loading: false });
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        setUserState({ user, claims: idTokenResult.claims, loading: false });
      } else {
        setUserState({ user: null, claims: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return userState;
}
