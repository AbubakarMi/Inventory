
'use client';

import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// Memoize the firebase initialization
let firebaseApp: ReturnType<typeof initializeFirebase> | null = null;

function getFirebase() {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  return firebaseApp;
}

/**
 * Provides Firebase context to client-side components.
 */
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = getFirebase();
  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
