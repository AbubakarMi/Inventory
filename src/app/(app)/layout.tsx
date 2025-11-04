
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/layout/header";
import AppSidebar from "@/components/layout/sidebar";
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, claims, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // While checking auth state, or if the user is logged in but we are waiting for their roles.
  if (loading || (user && !claims)) {
     return (
        <div className="flex h-screen w-full bg-background">
            <div className="hidden sm:flex flex-col border-r p-2 gap-2 h-full w-[16rem]">
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
                <Skeleton className="h-10 w-full mt-auto" />
            </div>
            <div className="flex flex-col flex-1">
                 <div className="flex h-14 items-center border-b px-6">
                    <Skeleton className="h-8 w-8 sm:hidden" />
                    <Skeleton className="h-6 w-32 hidden md:block" />
                    <div className="ml-auto flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
                <div className="flex-1 p-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                    <div className="mt-6">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  // If there's a user and their claims are loaded, render the app.
  if (user && claims) {
      return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
                {children}
                </main>
            </div>
            </div>
        </SidebarProvider>
      );
  }

  // If no user and not loading, we're about to redirect. Render null.
  return null;
}
