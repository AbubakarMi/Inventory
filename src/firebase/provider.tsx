
'use client';

import { createContext, useContext, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Define the shape of the Firebase context
interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

// Create the Firebase context
const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  firestore: null,
});

// Define the props for the FirebaseProvider component
interface FirebaseProviderProps {
  children: React.ReactNode;
  value: FirebaseContextValue;
}

/**
 * Provides the Firebase app, auth, and firestore instances to its children.
 */
export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
  const memoizedValue = useMemo(() => value, [value.app, value.auth, value.firestore]);
  return (
    <FirebaseContext.Provider value={memoizedValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

/**
 * Hook to access the Firebase context.
 * @returns The Firebase context value.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * Hook to access the Firebase app instance.
 * @returns The Firebase app instance.
 */
export function useFirebaseApp() {
  return useFirebase().app;
}

/**
 * Hook to access the Firebase Auth instance.
 * @returns The Firebase Auth instance.
 */
export function useAuth() {
  return useFirebase().auth;
}

/**
 * Hook to access the Firestore instance.
 * @returns The Firestore instance.
 */
export function useFirestore() {
  return useFirebase().firestore;
}
