"use client";

import { useAppState } from "@/context/app-state-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Header } from "@/components/dashboard/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, isAdmin } = useAppState();
  const router = useRouter();

  useEffect(() => {
    // Senior Architect approach: specific admin email OR isAdmin role verified from Supabase
    const hasAccess = user?.email === "riktrella@gmail.com" || isAdmin;
    
    if (user === null) {
      router.push("/login");
    } else if (userProfile && !hasAccess) {
      router.push("/dashboard");
    }
  }, [user, userProfile, isAdmin, router]);

  const isAuthorized = user?.email === "riktrella@gmail.com" || isAdmin;

  if (!user || (!userProfile && user.email !== "riktrella@gmail.com") || (userProfile && !isAuthorized)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr] w-full bg-background">
        <Sidebar className="hidden border-e bg-card lg:block" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col w-full overflow-hidden">
          <Header />
          <div className="border-b">
            <div className="flex h-16 items-center px-4 md:px-6">
              <h1 className="text-lg font-semibold">Panel del Entrenador</h1>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto w-full p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}