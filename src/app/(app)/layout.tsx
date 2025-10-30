import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/layout/header";
import AppSidebar from "@/components/layout/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
