"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";
import { Heart, PawPrint, Star } from "lucide-react";

export function DogProfileCard({ className }: { className?: string }) {
  const { selectedPet, uploads, achievements, progress } = useAppState();
  const level = Math.max(1, Math.min(7, uploads.length + 1));
  const completedAchievements = achievements.filter((a) => a.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] w-full",
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0) 60%)",
        border: "1px solid rgba(212,175,55,0.12)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Blurred background glow from pet photo */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        {selectedPet?.photo_url && (
          <div
            className="absolute -top-8 -right-8 h-48 w-48 rounded-full hero-blur"
            style={{
              backgroundImage: `url(${selectedPet.photo_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background:
              "linear-gradient(to top, rgba(8,8,8,0.8), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 p-5">
        {/* Top row: avatar + info + level badge */}
        <div className="flex items-start gap-4">
          {/* Pet avatar with ring */}
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-full pulse-ring"
              style={{ borderRadius: "50%" }}
            />
            <Avatar
              className="h-[72px] w-[72px] ring-2 ring-offset-2 ring-offset-black"
              style={{ ringColor: "rgba(212,175,55,0.5)" }}
            >
              <AvatarImage
                src={selectedPet?.photo_url ?? undefined}
                alt={selectedPet?.name ?? "Dog"}
                className="object-cover filter-vintage-art"
              />
              <AvatarFallback
                className="text-2xl font-black"
                style={{
                  background: "rgba(212,175,55,0.15)",
                  color: "#D4AF37",
                }}
              >
                {(selectedPet?.name?.[0] ?? "🐾").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Level badge */}
            <div
              className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full flex items-center justify-center font-black text-[11px] ring-2 ring-black z-20"
              style={{
                background: "linear-gradient(135deg, #F5D98B, #D4AF37)",
                color: "black",
                boxShadow: "0 0 12px rgba(212,175,55,0.4)",
              }}
            >
              {level}
            </div>
          </div>

          {/* Pet info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <PawPrint className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/70">
                Binomio Activo
              </span>
            </div>
            <h2 className="text-xl font-black text-white leading-none tracking-tight uppercase truncate">
              {selectedPet?.name || "Cargando..."}
            </h2>
            <p className="text-[11px] font-semibold text-white/40 mt-0.5">
              {selectedPet?.level || "Principiante"} · Manada Club
            </p>

            {/* Mini stars for achievements */}
            <div className="flex items-center gap-1 mt-2">
              {[...Array(Math.min(completedAchievements, 5))].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
              {completedAchievements === 0 && (
                <span className="text-[9px] text-white/30 font-medium">
                  Completa tu primer logro
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Progreso del Programa
            </span>
            <span
              className="text-sm font-black tabular-nums"
              style={{ color: "#D4AF37" }}
            >
              {progress}%
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #D4AF37, #F5D98B)",
                boxShadow: "0 0 10px rgba(212,175,55,0.4)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, 3)}%` }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/25 font-medium">
              Módulo 1 de 7
            </span>
            <span className="text-[9px] text-white/25 font-medium">
              {completedAchievements} logros desbloqueados
            </span>
          </div>
        </div>

        {/* Stats mini row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Videos", value: uploads.length, color: "#D4AF37" },
            { label: "Logros", value: completedAchievements, color: "#D4AF37" },
            { label: "Nivel", value: level, color: "#D4AF37" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-base font-black" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
