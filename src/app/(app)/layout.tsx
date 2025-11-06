
"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/layout/header";
import AppSidebar from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950 px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
              <div className="mx-auto max-w-[1600px] w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
