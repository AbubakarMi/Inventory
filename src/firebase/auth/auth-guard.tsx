
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged } from 'firebase/auth';
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
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
                // User is logged in. The useUser hook will handle claims and role loading.
                // We can stop the initial verification.
                setIsVerifying(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }
  }, [pathname, router]);

  // We are in a loading state if:
  // 1. The initial onAuthStateChanged check is running (isVerifying).
  // 2. The useUser hook is still fetching the user object and claims.
  // 3. We have a user object but are still waiting for their custom claims to load.
  const isLoading = isVerifying || useUserLoading || (user && !claims);

  if (isLoading) {
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

  // If we are on the login page and the user is already authenticated, redirect to dashboard
  if (user && pathname === '/login') {
    router.push('/dashboard');
    return null; // Render nothing while redirecting
  }

  // If we are not loading and there's no user, and we're not on the login page, it's a state that should have been caught by the useEffect.
  // This can act as a fallback, but the redirect in useEffect is primary.
  if (!user && pathname !== '/login' && pathname !== '/users') {
    // The useEffect should have already redirected. This is a safeguard.
    return null;
  }

  return <>{children}</>;
}
