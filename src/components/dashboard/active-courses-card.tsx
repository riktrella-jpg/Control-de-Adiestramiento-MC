"use client";

import { useAppState } from "@/context/app-state-provider";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Zap, BookOpenCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const COURSE_COLORS = [
  { bg: "rgba(245,158,11,0.15)", accent: "#F59E0B", bar: "linear-gradient(90deg,#F59E0B,#D97706)" },
  { bg: "rgba(16,185,129,0.15)", accent: "#10B981", bar: "linear-gradient(90deg,#10B981,#059669)" },
  { bg: "rgba(59,130,246,0.15)", accent: "#3B82F6", bar: "linear-gradient(90deg,#3B82F6,#2563EB)" },
  { bg: "rgba(139,92,246,0.15)", accent: "#8B5CF6", bar: "linear-gradient(90deg,#8B5CF6,#7C3AED)" },
  { bg: "rgba(239,68,68,0.15)", accent: "#EF4444", bar: "linear-gradient(90deg,#EF4444,#DC2626)" },
  { bg: "rgba(6,182,212,0.15)", accent: "#06B6D4", bar: "linear-gradient(90deg,#06B6D4,#0891B2)" },
  { bg: "rgba(212,175,55,0.15)", accent: "#D4AF37", bar: "linear-gradient(90deg,#D4AF37,#B8860B)" },
];

export function ActiveCoursesCard({ className }: { className?: string }) {
  const { modules } = useAppState();

  const allCourses = useMemo(() => {
    return modules.map((module) => {
      const completedWeeks = module.weeks.filter((w) => w.completed).length;
      const totalWeeks = module.weeks.length;
      const progress =
        totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;
      const colors = COURSE_COLORS[(module.moduleNumber - 1) % COURSE_COLORS.length];

      return {
        id: module.id,
        title: module.title,
        moduleNumber: module.moduleNumber,
        icon: module.icon,
        imageUrl: module.imageUrl,
        progress,
        colors,
        completedWeeks,
        totalWeeks,
      };
    });
  }, [modules]);

  const activeCourses = allCourses.filter((c) => c.progress > 0);
  const allModules = activeCourses.length > 0 ? activeCourses : allCourses.slice(0, 3);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-emerald-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
            {activeCourses.length > 0 ? "Mis Entrenamientos" : "Módulos del Programa"}
          </h2>
        </div>
        <Link
          href="/dashboard/courses"
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400/70 hover:text-emerald-400 transition-colors"
        >
          Ver todos
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Netflix-style horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
          {allModules.map((course, idx) => (
            <Link key={course.id} href="/dashboard/courses">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{
                  delay: idx * 0.08,
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden rounded-[1.5rem] cursor-pointer"
                style={{
                  width: "148px",
                  height: "200px",
                  background: course.colors.bg,
                  border: `1px solid ${course.colors.accent}30`,
                  boxShadow: course.progress > 0
                    ? `0 4px 20px ${course.colors.accent}20`
                    : "0 4px 20px rgba(0,0,0,0.3)",
                  flexShrink: 0,
                }}
              >
                {/* Module image or gradient */}
                {course.imageUrl ? (
                  <div className="absolute inset-0">
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover filter-vintage-art opacity-60"
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-5xl"
                    style={{ opacity: 0.3 }}
                  >
                    {course.icon}
                  </div>
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.2) 100%)",
                  }}
                />

                {/* Module number badge */}
                <div
                  className="absolute top-3 left-3 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{
                    background: course.colors.accent,
                    color: "#fff",
                    boxShadow: `0 0 12px ${course.colors.accent}60`,
                  }}
                >
                  {course.moduleNumber}
                </div>

                {/* Active badge */}
                {course.progress > 0 && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}
                  >
                    <Zap className="h-2.5 w-2.5 text-emerald-400" />
                    <span className="text-[8px] font-black text-emerald-400">ACTIVO</span>
                  </div>
                )}

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                  <h3 className="text-[11px] font-black text-white leading-tight line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Progress bar */}
                  <div
                    className="h-1 w-full rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: course.colors.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(course.progress, 3)}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 + idx * 0.1 }}
                    />
                  </div>

                  {/* Progress text + CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold" style={{ color: course.colors.accent }}>
                      {course.progress > 0 ? `${course.progress}%` : `${course.totalWeeks} sem.`}
                    </span>
                    <div
                      className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: `${course.colors.accent}20`,
                        color: course.colors.accent,
                        border: `1px solid ${course.colors.accent}30`,
                      }}
                    >
                      {course.progress > 0 ? "Continuar" : "Iniciar"}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}

          {/* View all card */}
          <Link href="/dashboard/courses">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: allModules.length * 0.08 + 0.2 }}
              className="flex flex-col items-center justify-center gap-2 rounded-[1.5rem] cursor-pointer"
              style={{
                width: "100px",
                height: "200px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <BookOpenCheck className="h-6 w-6 text-white/20" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white/25 text-center px-2 leading-tight">
                Ver todos los módulos
              </span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
