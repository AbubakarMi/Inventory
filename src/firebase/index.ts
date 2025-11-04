
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
  apiKey: "AIzaSyCz2C2J3narD7Jmqi5Xpj16dYNzUGuI_2k",
  authDomain: "inventory-956da.firebaseapp.com",
  projectId: "inventory-956da",
  storageBucket: "inventory-956da.appspot.com",
  messagingSenderId: "764174985892",
  appId: "1:764174985892:web:9519f3157a072703dd1431",
  measurementId: "G-N8EMT26EYD"
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
