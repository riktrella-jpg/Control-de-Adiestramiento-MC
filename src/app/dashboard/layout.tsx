"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/header";
import { BackgroundEffects } from "@/components/ui/background-effects";
import { ChatWidget } from "@/components/chat/chat-widget";
import { NotificationOverlay } from "@/components/dashboard/notification-overlay";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";
import {
  LayoutDashboard,
  BookOpenCheck,
  Activity,
  User2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/app-state-provider";

const SidebarNav = dynamic(
  () => import("@/components/dashboard/sidebar-nav").then((mod) => mod.SidebarNav),
  { ssr: false }
);

const bottomNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/dashboard/courses", icon: BookOpenCheck, label: "Entrenamientos" },
  { href: "/dashboard/carnet", icon: Activity, label: "Carnet" },
  { href: "/dashboard/ethology", icon: BookOpen, label: "Etología" },
  { href: "/dashboard/profile", icon: User2, label: "Perfil" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isNewUser, user, userProfile } = useAppState();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && isNewUser) {
      router.replace('/onboarding');
    }
  }, [mounted, user, isNewUser, router]);

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen min-h-dvh lg:grid lg:grid-cols-[auto_1fr] w-full relative bg-background text-foreground">
        <BackgroundEffects />
        <OnboardingTour />
        <NotificationOverlay />

        {/* Desktop Sidebar */}
        <Sidebar
          className="hidden border-e border-white/5 bg-black lg:block relative z-10"
          collapsible="icon"
        >
          <SidebarNav />
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-col w-full overflow-hidden relative z-10 pb-[60px] lg:pb-0">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            {children}
          </main>
        </div>

        {/* =========================================================
            MOBILE BOTTOM NAVIGATION — WhatsApp Style
            ========================================================= */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          style={{
            background: "rgba(12,12,12,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Safe area for iPhone home indicator */}
          <div className="flex items-center justify-around h-[60px] px-2 pb-safe">
            {bottomNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center flex-1 h-full gap-1"
                  aria-label={item.label}
                >
                  {/* Active indicator line at top */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="flex flex-col items-center justify-center gap-[3px]"
                    whileTap={{ scale: 0.78 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  >
                    <Icon
                      className="transition-all duration-150"
                      style={{
                        width: 24,
                        height: 24,
                        color: isActive ? "#d4af37" : "rgba(255,255,255,0.38)",
                        strokeWidth: isActive ? 2.2 : 1.8,
                      }}
                    />
                    <span
                      className="text-[9px] font-semibold tracking-wide transition-all duration-150"
                      style={{ color: isActive ? "#d4af37" : "rgba(255,255,255,0.38)" }}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        <ChatWidget />
      </div>
    </SidebarProvider>
  );
}
