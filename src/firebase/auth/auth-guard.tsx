
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirebase } from '..';
import { getDocs, collection } from 'firebase/firestore';


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, claims, loading: useUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  // This state tracks the initial, hard auth check on page load.
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Only run this on the client
    if (typeof window !== 'undefined') {
        const { auth, firestore } = initializeFirebase();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (!firebaseUser) {
                // If not on the login page, redirect there.
                // Exception: allow access to /users page if no users exist, which allows first user creation.
                if (pathname !== '/login') {
                    // This logic allows the very first user to be created.
                    if (pathname === '/users') {
                        try {
                            const usersSnapshot = await getDocs(collection(firestore, "users"));
                            if (usersSnapshot.empty) {
                                setIsVerifying(false); // Allow access to create first user
                                return;
                            }
                        } catch(e) {
                             // This can happen if firestore rules are not set up, but in our case,
                             // it implies a first run scenario.
                             setIsVerifying(false); // Allow access
                             return;
                        }
                    }
                    // For all other pages, redirect to login if no user.
                    router.push('/login');
                } else {
                     // If we are already on the login page, we are done verifying.
                     setIsVerifying(false);
                }
            } else {
                // User is logged in via Firebase Auth state.
                // The `useUser` hook will handle loading claims.
                // We can stop the initial high-level verification.
                setIsVerifying(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }
  }, [pathname, router]);

  // We are in a loading state if:
  // 1. The initial onAuthStateChanged check is running (isVerifying).
  // 2. The useUser hook is still fetching the user object.
  // 3. We have a user object but are still waiting for their custom claims to load. This is CRITICAL.
  const isLoading = isVerifying || useUserLoading || (user && !claims);
  
  if (isLoading) {
    return (
        <div className="flex h-screen w-full bg-background">
            <div className="hidden sm:flex flex-col border-r p-2 gap-2 h-full w-[256px]">
                <div className="flex items-center justify-between p-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8" />
                </div>
                <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-auto p-2" />
            </div>
            <div className="flex flex-col flex-1">
                 <div className="flex h-14 items-center border-b px-4">
                    <Skeleton className="h-8 w-8 sm:hidden" />
                    <Skeleton className="h-6 w-32 ml-4" />
                    <div className="ml-auto flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
                <div className="flex-1 p-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        </div>
    )
  }

  // If we are on the login page and the user is already authenticated, redirect to dashboard
  if (user && pathname === '/login') {
    router.push('/dashboard');
    return null; // Render nothing while redirecting
  }
  
  // After all loading is done, if we still have no user and are on a protected page, redirect.
  // This is a final safeguard. The useEffect handles the primary redirect logic.
  if (!user && pathname !== '/login' && pathname !== '/users') {
      router.push('/login');
      return null;
  }

  return <>{children}</>;
}
