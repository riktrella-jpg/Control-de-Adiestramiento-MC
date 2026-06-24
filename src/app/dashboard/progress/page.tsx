"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, CalendarDays, Activity } from "lucide-react";
import { useAppState } from "@/context/app-state-provider";

export default function ProgressPage() {
  const { progress } = useAppState();

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          Progreso <TrendingUp className="h-6 w-6 text-emerald-400" />
        </h1>
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
          Estadísticas de tu manada
        </p>
      </motion.div>

      {/* Main Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2rem] p-6 text-center space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center h-32 w-32 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "4px solid rgba(16,185,129,0.2)" }}>
            <div className="text-center">
              <span className="text-4xl font-black text-emerald-400 leading-none">{progress}%</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">Global</p>
            </div>
            {/* SVG circle stroke animation can go here later */}
          </div>
        </div>

        <p className="text-sm font-medium text-white/70">
          ¡Vas por buen camino! Sigue entrenando para completar tu próximo módulo.
        </p>
      </motion.div>

      {/* Coming Soon Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.05)" }}>
          <Activity className="h-6 w-6 text-white/20" />
          <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Gráficos Detallados<br/>Pronto</p>
        </div>
        <div className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.05)" }}>
          <Award className="h-6 w-6 text-white/20" />
          <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Historial de Logros<br/>Pronto</p>
        </div>
        <div className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center col-span-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.05)" }}>
          <CalendarDays className="h-6 w-6 text-white/20" />
          <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Calendario de Actividad Próximamente</p>
        </div>
      </motion.div>
    </div>
  );
}
