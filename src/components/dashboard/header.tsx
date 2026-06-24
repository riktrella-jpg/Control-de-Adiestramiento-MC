"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { useAppState } from "@/context/app-state-provider";
import { NotificationCenter } from "./notification-center";
import Image from "next/image";
import Logo from "../../../public/logo_transparent.png";

const SidebarNav = dynamic(
  () => import("./sidebar-nav").then((mod) => mod.SidebarNav),
  { ssr: false }
);

export function Header() {
  const { userProfile, selectedPet } = useAppState();

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4 lg:px-6"
      style={{
        background: "rgba(8,8,8,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Mobile: Hamburger menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="flex items-center justify-center h-9 w-9 rounded-xl glass-card press-effect"
              aria-label="Abrir menú"
            >
              <Menu className="h-4 w-4 text-white/70" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col p-0 w-[280px] max-w-[85vw] border-r border-white/5"
            style={{ background: "#080808" }}
          >
            <SidebarNav />
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile: Logo + Title */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="relative h-7 w-7">
          <Image
            src={Logo}
            alt="MC APP"
            fill
            className="object-contain drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/90">
            MANADA
          </span>
          <span
            className="text-[8px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "#D4AF37" }}
          >
            CLUB
          </span>
        </div>
      </div>

      {/* Desktop: greeting */}
      <div className="hidden lg:block flex-1">
        <h1 className="text-base font-black text-white/90">
          Hola, {userProfile?.displayName?.split(" ")[0] || "Entrenador"}!
        </h1>
        <p className="text-xs text-white/40 font-medium">
          Resumen del progreso de{" "}
          <span className="text-[#D4AF37] font-bold">
            {selectedPet?.name || "tu binomio"}
          </span>
        </p>
      </div>

      {/* Right side: Pet chip + Notifications + Avatar */}
      <div className="ml-auto flex items-center gap-2">
        {/* Active pet chip — mobile */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full press-effect lg:hidden"
          style={{
            background: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: "#D4AF37" }}
          />
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider">
            {selectedPet?.name || "Binomio"}
          </span>
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User avatar */}
        <Avatar className="h-8 w-8 ring-1 ring-white/10 ring-offset-1 ring-offset-black cursor-pointer">
          <AvatarImage
            src={selectedPet?.photo_url || userProfile?.dogPhotoURL}
            alt={selectedPet?.name || "User"}
            className="object-cover"
          />
          <AvatarFallback
            className="text-xs font-black"
            style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}
          >
            {(
              selectedPet?.name?.[0] ||
              userProfile?.displayName?.[0] ||
              "M"
            ).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
