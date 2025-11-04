
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { initializeFirebase } from '@/firebase';

type UserWithClaims = User & {
  claims?: {
    role?: 'Admin' | 'Manager' | 'Staff' | 'Storekeeper';
    [key: string]: any;
  };
};

export function useUser() {
  const { auth } = initializeFirebase();
  const [user, setUser] = useState<UserWithClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setUser({ ...user, claims: tokenResult.claims });
        setClaims(tokenResult.claims);
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, claims };
}
