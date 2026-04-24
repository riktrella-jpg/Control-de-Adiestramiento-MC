"use client";

import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr] w-full">
        <Sidebar className="hidden border-e bg-card lg:block" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col w-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
