
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";
import { Heart, Trophy, Calendar } from "lucide-react";

export function DogProfileCard({ className }: { className?: string }) {
  const { selectedPet, uploads, achievements } = useAppState();
  const level = Math.max(1, Math.min(7, uploads.length));
  const completedAchievements = achievements.filter(a => a.completed).length;

  return (
    <Card className={cn("overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl relative group shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-[2.5rem]", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-20 pointer-events-none" />
      <CardHeader className="relative pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Avatar className="h-20 w-20 ring-4 ring-primary/20 ring-offset-4 ring-offset-black shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
              <AvatarImage src={selectedPet?.photo_url ?? "https://picsum.photos/seed/haku/100/100"} alt={selectedPet?.name ?? "Dog"} />
              <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">{selectedPet?.name?.[0].toUpperCase() ?? 'D'}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary text-black h-8 w-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg ring-4 ring-black z-20">
              {level}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-2xl font-black text-white leading-none tracking-tight uppercase group-hover:text-primary transition-colors">{selectedPet?.name || 'Cargando...'}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
              <Heart className="h-3 w-3 fill-current" /> Miembro de la Manada
            </CardDescription>
          </div>
          <Trophy className="h-8 w-8 text-primary shadow-[0_0_15px_rgba(252,196,25,0.4)] opacity-80" />
        </div>
      </CardHeader>
      <CardContent className="pt-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] mb-2 opacity-50">Logros</span>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black text-white">{completedAchievements}</span>
               <span className="text-[10px] font-black text-primary/40 uppercase">Estatus</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] mb-2 opacity-50">Compromiso</span>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black text-white">100</span>
               <span className="text-[10px] font-black text-primary/40 uppercase">% IA</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
