"use client";

import { motion } from "framer-motion";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";
import { Lock, Trophy, ChevronRight } from "lucide-react";

export function AchievementsCard({ className }: { className?: string }) {
  const { achievements } = useAppState();
  const completed = achievements.filter((a) => a.completed);
  const locked = achievements.filter((a) => !a.completed);
  const totalCompleted = completed.length;
  const total = achievements.length;
  const pct = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-yellow-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
            Logros & Certificaciones
          </h2>
        </div>
        <span
          className="text-[10px] font-black tabular-nums"
          style={{ color: "#D4AF37" }}
        >
          {totalCompleted}/{total}
        </span>
      </div>

      {/* Card container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-[2rem] overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Progress header */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy
                className="h-4 w-4"
                style={{
                  color: "#D4AF37",
                  filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))",
                }}
              />
              <span className="text-sm font-black text-white">
                {totalCompleted === 0
                  ? "Comienza tu camino"
                  : totalCompleted === total
                  ? "¡Programa Completado! 🎉"
                  : `${totalCompleted} certificaciones obtenidas`}
              </span>
            </div>
            <span
              className="text-base font-black"
              style={{ color: pct > 0 ? "#D4AF37" : "rgba(255,255,255,0.2)" }}
            >
              {pct}%
            </span>
          </div>

          {/* Overall progress */}
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  pct === 100
                    ? "linear-gradient(90deg, #D4AF37, #F5D98B, #D4AF37)"
                    : "linear-gradient(90deg, #D4AF37, #B8860B)",
                boxShadow: pct > 0 ? "0 0 8px rgba(212,175,55,0.4)" : "none",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            />
          </div>
        </div>

        {/* Achievements grid */}
        <div className="px-4 pb-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {achievements.map((achievement, idx) => {
              const AchIcon = achievement.icon;
              const isCompleted = achievement.completed;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.4 + idx * 0.05,
                    type: "spring",
                    stiffness: 450,
                    damping: 20,
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl relative"
                  style={{
                    background: isCompleted
                      ? "rgba(212,175,55,0.08)"
                      : "rgba(255,255,255,0.02)",
                    border: isCompleted
                      ? "1px solid rgba(212,175,55,0.2)"
                      : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Medal icon */}
                  <div
                    className="relative h-10 w-10 rounded-full flex items-center justify-center"
                    style={{
                      background: isCompleted
                        ? "rgba(212,175,55,0.15)"
                        : "rgba(255,255,255,0.04)",
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <AchIcon
                          className="h-5 w-5"
                          style={{
                            color: "#D4AF37",
                            filter:
                              "drop-shadow(0 0 6px rgba(212,175,55,0.6))",
                          }}
                        />
                        {/* Glow ring */}
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            boxShadow: "0 0 12px rgba(212,175,55,0.3)",
                          }}
                        />
                      </>
                    ) : (
                      <Lock className="h-4 w-4 text-white/15" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className="text-[8px] font-bold text-center leading-tight line-clamp-2"
                    style={{
                      color: isCompleted
                        ? "rgba(212,175,55,0.8)"
                        : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {achievement.title
                      .replace("Certificación: ", "")
                      .split(" ")
                      .slice(0, 3)
                      .join(" ")}
                  </span>

                  {/* Completed check */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-black"
                      style={{
                        background: "linear-gradient(135deg, #D4AF37, #B8860B)",
                        color: "#fff",
                        boxShadow: "0 0 8px rgba(212,175,55,0.5)",
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* CTA if no achievements */}
          {totalCompleted === 0 && (
            <div
              className="mt-4 flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(212,175,55,0.05)",
                border: "1px dashed rgba(212,175,55,0.15)",
              }}
            >
              <Trophy className="h-5 w-5 text-yellow-500/40 shrink-0" />
              <p className="text-[10px] text-white/30 font-medium">
                Completa módulos del curso para desbloquear certificaciones.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
