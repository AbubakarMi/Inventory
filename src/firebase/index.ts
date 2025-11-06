
'use client';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from "firebase/analytics";

import { useUser } from '@/hooks/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  analytics: Analytics | null;
}

let firebaseInstances: FirebaseInstances | null = null;

function initializeFirebase(): FirebaseInstances {
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  if (getApps().length > 0) {
    const app = getApps()[0];
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
    firebaseInstances = { app, auth, firestore, analytics };
    return firebaseInstances;
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
  
  firebaseInstances = { app, auth, firestore, analytics };
  return firebaseInstances;
}

export {
  firebaseConfig,
  initializeFirebase,
  useCollection,
  useDoc,
  useUser,
};
