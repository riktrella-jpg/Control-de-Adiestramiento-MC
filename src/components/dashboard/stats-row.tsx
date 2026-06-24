"use client";

import { motion } from "framer-motion";
import { useAppState } from "@/context/app-state-provider";
import { CheckCircle2, Flame, Star, ClipboardList } from "lucide-react";

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}

function StatChip({ icon, label, value, color, delay }: StatChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-3 rounded-2xl press-effect"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        minWidth: 0,
      }}
    >
      <div
        className="flex items-center justify-center h-8 w-8 rounded-xl"
        style={{ background: `${color}18` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <span
        className="text-base font-black leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 text-center leading-tight px-1">
        {label}
      </span>
    </motion.div>
  );
}

export function StatsRow() {
  const { tasks, achievements, uploads, progress } = useAppState();

  const pendingTasks = tasks.filter((t) => !t.done).length;
  const completedTasks = tasks.filter((t) => t.done).length;
  const completedAchievements = achievements.filter((a) => a.completed).length;

  // Simple streak calculation based on uploads
  const streak = Math.min(uploads.length * 2, 30);

  const stats = [
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "Pendientes",
      value: pendingTasks,
      color: "#D4AF37",
      delay: 0.1,
    },
    {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Ejercicios",
      value: completedTasks,
      color: "#D4AF37",
      delay: 0.15,
    },
    {
      icon: <Star className="h-4 w-4" />,
      label: "Logros",
      value: completedAchievements,
      color: "#D4AF37",
      delay: 0.2,
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: `${streak}d Racha`,
      value: "🔥",
      color: "#D4AF37",
      delay: 0.25,
    },
  ];

  return (
    <div className="flex gap-2.5 w-full">
      {stats.map((stat) => (
        <StatChip key={stat.label} {...stat} />
      ))}
    </div>
  );
}
