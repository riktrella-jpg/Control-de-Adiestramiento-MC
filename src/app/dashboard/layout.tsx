"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/header";
import { BackgroundEffects } from "@/components/ui/background-effects";

import { ChatWidget } from "@/components/chat/chat-widget";

const SidebarNav = dynamic(() => import("@/components/dashboard/sidebar-nav").then(mod => mod.SidebarNav), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <SidebarProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr] w-full relative bg-black">
        <BackgroundEffects />
        <Sidebar className="hidden border-e bg-card lg:block relative z-10" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col w-full overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </div>
        <ChatWidget />
      </div>
    </SidebarProvider>
  );
}
