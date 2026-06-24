"use client";

import { motion } from "framer-motion";
import { useAppState } from "@/context/app-state-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy, Star, Flame, Upload, Calendar, PawPrint,
  Settings, Camera, ChevronRight, Award, Trash2, RefreshCcw
} from "lucide-react";
import { useState, useRef } from "react";

export default function ProfilePage() {
  const { user, userProfile, selectedPet, pets, deletedPets, uploads, achievements, progress, updateDogPhoto, deletePet, restorePet, hardDeletePet } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completedAchievements = achievements.filter((a) => a.completed);
  const streak = Math.min(uploads.length * 2, 30);
  const level = Math.max(1, Math.min(7, uploads.length + 1));

  const stats = [
    { icon: "📤", label: "Videos", value: uploads.length, color: "#10B981" },
    { icon: "🏆", label: "Logros", value: completedAchievements.length, color: "#D4AF37" },
    { icon: "⭐", label: "Nivel", value: level, color: "#F59E0B" },
    { icon: "🔥", label: "Racha", value: `${streak}d`, color: "#F97316" },
  ];

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPet) {
      await updateDogPhoto(file, selectedPet.id);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-8 max-w-2xl mx-auto w-full">

      {/* Hero profile section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] p-6 pt-8"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(212,175,55,0.04) 100%)",
          border: "1px solid rgba(16,185,129,0.12)",
        }}
      >
        {/* Decorative top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-[2rem]"
          style={{ background: "linear-gradient(90deg, #10B981, #D4AF37)" }}
        />

        <div className="flex flex-col items-center text-center gap-3">
          {/* Dog avatar */}
          <div className="relative">
            <Avatar
              className="h-24 w-24 ring-2 ring-offset-2 ring-offset-black cursor-pointer"
              style={{ ringColor: "rgba(16,185,129,0.4)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <AvatarImage src={selectedPet?.photo_url ?? undefined} className="object-cover filter-vintage-art" />
              <AvatarFallback className="text-3xl font-black" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                {(selectedPet?.name?.[0] ?? "🐾").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}
            >
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Names */}
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {selectedPet?.name || "Mi Perro"}
            </h1>
            <p className="text-xs text-white/50 font-medium mt-0.5">
              Guía: {userProfile?.displayName || user?.email}
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <PawPrint className="h-3 w-3" />
              {selectedPet?.level || "Principiante"}
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" }}>
              <Award className="h-3 w-3" />
              Miembro MANADA
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats 4-grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-2"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="flex flex-col items-center py-3 rounded-2xl gap-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-lg">{stat.icon}</span>
            <span className="text-base font-black" style={{ color: stat.color }}>{stat.value}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest text-white/50">Progreso del Programa</span>
          <span className="text-sm font-black" style={{ color: "#10B981" }}>{progress}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #10B981, #059669, #D4AF37)", boxShadow: "0 0 10px rgba(16,185,129,0.4)" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progress, progress > 0 ? 3 : 0)}%` }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
          />
        </div>
        <p className="text-[10px] text-white/25 font-medium text-center">
          Continúa entrenando para avanzar al siguiente módulo
        </p>
      </motion.div>

      {/* Pets list */}
      {pets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 px-1">
            <div className="h-3 w-0.5 rounded-full" style={{ background: "#10B981" }} />
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Mi Pack</h2>
          </div>
          <div className="space-y-2">
            {pets.map((pet) => (
              <div key={pet.id} className="relative group/pet flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{
                  background: selectedPet?.id === pet.id ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                  border: selectedPet?.id === pet.id ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.05)",
                }}>
                <Avatar className="h-10 w-10 ring-1 ring-white/10">
                  <AvatarImage src={pet.photo_url ?? undefined} className="object-cover" />
                  <AvatarFallback className="font-black text-sm" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                    {pet.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pr-8">
                  <p className="text-sm font-black text-white">{pet.name}</p>
                  <p className="text-[10px] text-white/30 font-medium">{pet.level || "Principiante"}</p>
                </div>
                {selectedPet?.id === pet.id && (
                  <Star className="absolute right-12 h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (confirm(`¿Estás seguro de que quieres eliminar a ${pet.name}?`)) {
                      try {
                        await deletePet(pet.id);
                      } catch (error) {
                        console.error(error);
                      }
                    }
                  }}
                  className="absolute right-3 p-2 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all"
                  title="Eliminar binomio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-0.5 rounded-full bg-yellow-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Certificaciones</h2>
          </div>
          <span className="text-[10px] font-black" style={{ color: "#D4AF37" }}>
            {completedAchievements.length}/{achievements.length}
          </span>
        </div>
        {completedAchievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {completedAchievements.map((ach) => {
              const AchIcon = ach.icon;
              return (
                <div key={ach.id} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.15)" }}>
                  <AchIcon className="h-5 w-5 shrink-0" style={{ color: "#D4AF37", filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))" }} />
                  <span className="text-[10px] font-bold text-white/70 leading-tight line-clamp-2">
                    {ach.title.replace("Certificación: ", "")}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 rounded-2xl text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}>
            <Trophy className="h-8 w-8 text-white/10 mx-auto mb-2" />
            <p className="text-[10px] text-white/25 font-medium">Completa módulos para ganar certificaciones</p>
          </div>
        )}
      </motion.div>

      {/* Settings link */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer press-effect"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Settings className="h-5 w-5 text-white/40" />
          </div>
          <span className="text-sm font-bold text-white/60 flex-1">Configuración</span>
          <ChevronRight className="h-4 w-4 text-white/20" />
        </div>
      </motion.div>
      {/* Papelera section */}
      {deletedPets && deletedPets.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-3 mt-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-3 w-0.5 rounded-full bg-red-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500/70">Papelera de Reciclaje</h2>
          </div>
          <div className="space-y-2">
            {deletedPets.map((pet) => (
              <div key={pet.id} className="relative group flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{ background: "rgba(239,68,68,0.05)", border: "1px dashed rgba(239,68,68,0.2)" }}>
                <Avatar className="h-10 w-10 ring-1 ring-red-500/20 opacity-50 grayscale">
                  <AvatarImage src={pet.photo_url ?? undefined} className="object-cover" />
                  <AvatarFallback className="font-black text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                    {pet.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pr-16 opacity-70">
                  <p className="text-sm font-black text-white line-through">{pet.name}</p>
                  <p className="text-[10px] text-white/40 font-medium">Eliminado</p>
                </div>
                
                <div className="absolute right-3 flex items-center gap-1 opacity-60 hover:opacity-100 transition-all">
                  <button
                    onClick={async () => {
                      if (confirm(`¿Restaurar a ${pet.name} a tu manada activa?`)) {
                        try {
                          await restorePet(pet.id);
                        } catch (error) { console.error(error); }
                      }
                    }}
                    className="p-2 rounded-md hover:bg-emerald-500/20 text-emerald-400/70 hover:text-emerald-400 transition-all"
                    title="Restaurar binomio"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`¡CUIDADO! ¿Estás seguro de que quieres destruir permanentemente a ${pet.name}? Esta acción no se puede deshacer.`)) {
                        try {
                          await hardDeletePet(pet.id);
                        } catch (error) { console.error(error); }
                      }
                    }}
                    className="p-2 rounded-md hover:bg-red-500/20 text-red-400/70 hover:text-red-500 transition-all"
                    title="Borrar definitivamente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
