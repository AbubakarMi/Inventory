

import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/layout/header";
import AppSidebar from "@/components/layout/sidebar";
import { AuthGuard } from "@/firebase/auth/auth-guard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
