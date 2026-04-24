"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { useAppState } from "@/context/app-state-provider";
import { NotificationCenter } from "./notification-center";

export function Header() {
  const { userProfile, selectedPet } = useAppState();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <SidebarNav />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-foreground">Hola, {userProfile?.displayName || 'Ricardo'}!</h1>
        <p className="text-sm text-muted-foreground">Aquí tienes un resumen del progreso de {selectedPet?.name || 'Haku'}.</p>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[320px]" />
        </div>
        <NotificationCenter />
        <Avatar>
          <AvatarImage src={selectedPet?.photo_url || userProfile?.dogPhotoURL} alt={selectedPet?.name || "User"} />
          <AvatarFallback>{(selectedPet?.name?.[0] || userProfile?.displayName?.[0] || 'D').toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
