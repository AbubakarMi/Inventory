
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '..';
import { getDocs, collection } from 'firebase/firestore';


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [initialAuthCheck, setInitialAuthCheck] = useState(true);

  useEffect(() => {
    // Only run this on the client
    if (typeof window !== 'undefined') {
        const { auth, firestore } = initializeFirebase();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user && pathname !== '/login') {
                 // allow access to /users page if no users exist
                if (pathname === '/users') {
                    try {
                        const usersSnapshot = await getDocs(collection(firestore, "users"));
                        if (usersSnapshot.empty) {
                            setInitialAuthCheck(false);
                            return;
                        }
                    } catch(e) {
                        // If collection doesn't exist, it's the first run
                        setInitialAuthCheck(false);
                        return;
                    }
                }
                router.push('/login');
            } else {
                setInitialAuthCheck(false);
            }
        });

        return () => unsubscribe();
    }
  }, [pathname, router]);

  if (loading || initialAuthCheck) {
    return (
        <div className="flex flex-col h-screen w-full">
            <div className="flex h-14 items-center border-b px-4">
                <Skeleton className="h-6 w-24" />
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
            <div className="flex flex-1">
                <div className="hidden sm:flex flex-col border-r p-2 gap-2 h-full w-[256px]">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full mt-auto" />
                </div>
                <div className="flex-1 p-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        </div>
    )
  }

  // If on login page, let it render
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!user) {
    // This case should be handled by the useEffect redirect, but as a fallback
    return <div>Redirecting to login...</div>
  }


  return <>{children}</>;
}
