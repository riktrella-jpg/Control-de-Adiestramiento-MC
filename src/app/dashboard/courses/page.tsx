"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/app-state-provider";
import {
  BookOpenCheck,
  Lock,
  ChevronDown,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

// --- Subcomponente para una Tarea (Micropráctica) ---
function TaskCheckbox({
  label,
  isChecked,
  onToggle,
}: {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all press-effect border",
        isChecked
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
      )}
    >
      <div className="mt-0.5 shrink-0 transition-colors duration-300">
        {isChecked ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        ) : (
          <Circle className="h-5 w-5 text-white/20" />
        )}
      </div>
      <span
        className={cn(
          "text-xs font-medium leading-relaxed transition-all duration-300",
          isChecked ? "text-emerald-50 line-through opacity-80" : "text-white/80"
        )}
      >
        {label}
      </span>
    </div>
  );
}

// --- Subcomponente Botón de Video con Modal ---
function VideoButton({ videoUrl, weekLabel }: { videoUrl?: string; weekLabel: string }) {
  const [open, setOpen] = useState(false);

  const embedUrl = React.useMemo(() => {
    if (!videoUrl) return null;
    if (videoUrl.includes('vimeo.com') || videoUrl.includes('player.vimeo.com')) {
      const match = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (match) {
        const hashMatch = videoUrl.match(/h=([^&]+)/);
        return `https://player.vimeo.com/video/${match[1]}?autoplay=1${hashMatch ? `&h=${hashMatch[1]}` : '&dnt=1'}&title=0&byline=0&portrait=0`;
      }
    }
    return videoUrl;
  }, [videoUrl]);

  const hasVideo = !!embedUrl;

  return (
    <>
      {/* The Button */}
      <button
        onClick={() => hasVideo && setOpen(true)}
        className={cn(
          "w-full mt-2 group relative flex items-center gap-3 rounded-2xl border transition-all duration-200 text-left",
          hasVideo
            ? "bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/25 hover:border-emerald-400/50 hover:from-emerald-500/20 active:scale-[0.97] cursor-pointer"
            : "bg-white/[0.03] border-dashed border-white/20 cursor-not-allowed"
        )}
      >
        {/* Left accent bar */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 rounded-r-full",
            hasVideo ? "bg-emerald-400" : "bg-white/10"
          )}
        />

        <div className="flex items-center gap-3 px-4 py-3 w-full">
          {/* Icon */}
          <div
            className={cn(
              "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300",
              hasVideo
                ? "bg-emerald-500/20 group-hover:scale-110"
                : "bg-white/5"
            )}
          >
            <PlayCircle
              className={cn(
                "h-5 w-5",
                hasVideo ? "text-emerald-400" : "text-white/30"
              )}
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs font-bold", hasVideo ? "text-white" : "text-white/50")}>
              Video de Soporte
            </p>
            <p className={cn("text-[10px] mt-0.5 font-medium", hasVideo ? "text-emerald-400" : "text-white/30")}>
              {hasVideo ? `Toca para ver · ${weekLabel}` : "Próximamente disponible"}
            </p>
          </div>

          {/* Badge */}
          {!hasVideo ? (
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 bg-white/8 border border-white/10 px-2.5 py-1.5 rounded-lg shrink-0">
              PRONTO
            </span>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/15 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 shrink-0">
              VER ▶
            </span>
          )}
        </div>
      </button>

      {/* Modal Full-Screen Video Player */}
      <AnimatePresence>
        {open && hasVideo && (
          <motion.div
            key="video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex flex-col bg-black"
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Video de Soporte</p>
                <p className="text-sm font-bold text-white">{weekLabel}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* iframe — fills remaining space */}
            <div className="flex-1 relative">
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Componente Principal ---
export default function CoursesPage() {
  const { modules, user, selectedPet, toggleWeekCompletion } = useAppState();
  const { toast } = useToast();
  
  // Módulo actualmente expandido
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  
  // Semana actualmente expandida
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);

  // Estado local para los checkboxes guardados en localStorage
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // Cargar checkboxes desde localStorage al inicio
  useEffect(() => {
    if (!user || !selectedPet) return;
    const key = `mc26_tasks_${user.id}_${selectedPet.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setCheckedTasks(JSON.parse(saved));
      } catch (e) {}
    }
  }, [user, selectedPet]);

  // Expandir automáticamente el primer módulo activo
  useEffect(() => {
    if (modules.length > 0 && !expandedModuleId) {
      // Buscar el primer módulo que tenga alguna semana sin completar
      const activeMod = modules.find((m) => m.weeks.some((w) => !w.completed));
      if (activeMod) {
        setExpandedModuleId(activeMod.id);
        // Expandir también su primera semana no completada
        const activeWeek = activeMod.weeks.find((w) => !w.completed);
        if (activeWeek) setExpandedWeekId(activeWeek.id);
      } else {
        // Todos completados, expandir el primero
        setExpandedModuleId(modules[0].id);
      }
    }
  }, [modules, expandedModuleId]);

  const handleTaskToggle = async (
    moduleId: string,
    weekId: string,
    taskIndex: number,
    totalTasks: number,
    weekCompleted: boolean
  ) => {
    if (!user || !selectedPet || weekCompleted) return;

    const taskKey = `${weekId}_${taskIndex}`;
    const newChecked = !checkedTasks[taskKey];
    
    const newCheckedTasks = { ...checkedTasks, [taskKey]: newChecked };
    setCheckedTasks(newCheckedTasks);
    
    const storageKey = `mc26_tasks_${user.id}_${selectedPet.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newCheckedTasks));

    // Verificar si se completaron TODAS las tareas de la semana
    let allChecked = true;
    for (let i = 0; i < totalTasks; i++) {
      if (!newCheckedTasks[`${weekId}_${i}`]) {
        allChecked = false;
        break;
      }
    }

    if (allChecked) {
      // Auto-completar semana
      toast({
        title: "¡Semana Completada! 🎉",
        description: "Has terminado todas las prácticas. Se ha desbloqueado la siguiente fase.",
        duration: 4000,
      });

      // Llamada al backend
      await toggleWeekCompletion(moduleId, weekId, false, true);

      // Buscar siguiente semana para auto-expandirla
      const currentMod = modules.find((m) => m.id === moduleId);
      if (currentMod) {
        const weekIndex = currentMod.weeks.findIndex((w) => w.id === weekId);
        if (weekIndex >= 0 && weekIndex < currentMod.weeks.length - 1) {
          const nextWeek = currentMod.weeks[weekIndex + 1];
          setTimeout(() => setExpandedWeekId(nextWeek.id), 800);
        } else {
          // Completó el módulo
          toast({
            title: "¡Módulo Completado! 🏆",
            description: "¡Felicidades! Has avanzado en el Método MANADA.",
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          Entrenamientos <BookOpenCheck className="h-6 w-6 text-emerald-400" />
        </h1>
        <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
          Programa MANADA CLUB
        </p>
      </motion.div>

      {/* Lista de Módulos */}
      <div className="space-y-4">
        {modules.map((module, mIdx) => {
          const isModuleExpanded = expandedModuleId === module.id;
          const completedWeeksCount = module.weeks.filter((w) => w.completed).length;
          const totalWeeks = module.weeks.length;
          const progress = totalWeeks > 0 ? Math.round((completedWeeksCount / totalWeeks) * 100) : 0;
          
          // El módulo está bloqueado si el anterior no está 100% completo (excepto el primero)
          const prevModule = mIdx > 0 ? modules[mIdx - 1] : null;
          const isLocked = prevModule ? !prevModule.weeks.every(w => w.completed) : false;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mIdx * 0.1 }}
              className="rounded-[2rem] overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Module Header (Clickable) */}
              <div
                onClick={() => !isLocked && setExpandedModuleId(isModuleExpanded ? null : module.id)}
                className={cn(
                  "p-5 relative cursor-pointer select-none transition-colors",
                  !isLocked && "hover:bg-white/[0.02]",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Background image si existe */}
                {module.imageUrl && (
                  <div className="absolute inset-0 opacity-10 filter-vintage-art">
                    <Image src={module.imageUrl} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                  </div>
                )}
                
                <div className="relative z-10 flex items-start gap-4">
                  <div
                    className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: isLocked ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {isLocked ? <Lock className="h-5 w-5 text-white/40" /> : module.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: isLocked ? "rgba(255,255,255,0.4)" : "#10B981" }}>
                      Módulo {module.moduleNumber}
                    </p>
                    <h2 className="text-base font-black text-white leading-tight mt-0.5">
                      {module.title}
                    </h2>
                    
                    {/* Progress bar inside header */}
                    {!isLocked && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress === 100 ? "#D4AF37" : "linear-gradient(90deg, #10B981, #059669)" }} />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: progress === 100 ? "#D4AF37" : "#10B981" }}>
                          {progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {!isLocked && (
                    <ChevronDown
                      className={cn("h-5 w-5 text-white/30 transition-transform duration-300", isModuleExpanded && "rotate-180")}
                    />
                  )}
                </div>
              </div>

              {/* Module Content (Weeks Accordion) */}
              <AnimatePresence>
                {isModuleExpanded && !isLocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t overflow-hidden"
                    style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}
                  >
                    <div className="p-4 space-y-3">
                      {module.weeks.map((week, wIdx) => {
                        const isWeekExpanded = expandedWeekId === week.id;
                        
                        // Lógica de desbloqueo de semana
                        // Una semana está bloqueada si la anterior NO está completa
                        const prevWeek = wIdx > 0 ? module.weeks[wIdx - 1] : null;
                        const isWeekLocked = prevWeek ? !prevWeek.completed : false;
                        
                        const microPracticas = week.microPracticas || [];

                        return (
                          <div
                            key={week.id}
                            className="rounded-2xl overflow-hidden transition-colors"
                            style={{
                              background: week.completed
                                ? "rgba(212,175,55,0.03)"
                                : isWeekExpanded
                                ? "rgba(16,185,129,0.05)"
                                : "rgba(255,255,255,0.02)",
                              border: week.completed
                                ? "1px solid rgba(212,175,55,0.15)"
                                : isWeekExpanded
                                ? "1px solid rgba(16,185,129,0.2)"
                                : "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            {/* Week Header */}
                            <div
                              onClick={() => !isWeekLocked && setExpandedWeekId(isWeekExpanded ? null : week.id)}
                              className={cn(
                                "flex items-center gap-3 p-4 cursor-pointer select-none",
                                isWeekLocked && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div
                                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  background: week.completed
                                    ? "rgba(212,175,55,0.15)"
                                    : isWeekLocked
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(16,185,129,0.15)",
                                }}
                              >
                                {week.completed ? (
                                  <Trophy className="h-4 w-4" style={{ color: "#D4AF37" }} />
                                ) : isWeekLocked ? (
                                  <Lock className="h-4 w-4 text-white/30" />
                                ) : (
                                  <span className="text-[10px] font-black" style={{ color: "#10B981" }}>W{week.week}</span>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className={cn("text-sm font-bold truncate", week.completed ? "text-[#D4AF37]" : "text-white")}>
                                  Semana {week.week}: {week.objective}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="h-3 w-3 text-white/30" />
                                  <span className="text-[9px] text-white/40 font-medium">
                                    {week.time}
                                  </span>
                                </div>
                              </div>
                              
                              {!isWeekLocked && (
                                <ChevronDown
                                  className={cn("h-4 w-4 text-white/30 transition-transform duration-300", isWeekExpanded && "rotate-180")}
                                />
                              )}
                            </div>

                            {/* Week Details & Tasks */}
                            <AnimatePresence>
                              {isWeekExpanded && !isWeekLocked && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-4 pb-4 overflow-hidden"
                                >
                                  <div className="pt-2 space-y-4">
                                    {/* Info Block */}
                                    <div className="space-y-3">
                                      {week.enfoque && (
                                        <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                                          <p className="text-[10px] font-black uppercase text-emerald-400 mb-1 flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" /> Enfoque
                                          </p>
                                          <p className="text-xs text-white/70">{week.enfoque}</p>
                                        </div>
                                      )}
                                      
                                      {/* VIDEO BUTTON — always visible */}
                                      <VideoButton videoUrl={week.videoUrl} weekLabel={`Semana ${week.week}`} />
                                    </div>

                                    {/* Tareas (Microprácticas) */}
                                    <div className="space-y-2">
                                      <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-2">
                                        Micro-Prácticas a completar:
                                      </h4>
                                      {microPracticas.length > 0 ? (
                                        <div className="grid gap-2">
                                          {microPracticas.map((tarea, tIdx) => {
                                            const taskKey = `${week.id}_${tIdx}`;
                                            const isChecked = week.completed || checkedTasks[taskKey] || false;

                                            return (
                                              <TaskCheckbox
                                                key={tIdx}
                                                label={tarea}
                                                isChecked={isChecked}
                                                onToggle={() => handleTaskToggle(module.id, week.id, tIdx, microPracticas.length, week.completed)}
                                              />
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="p-4 rounded-xl text-center bg-white/5 border border-white/10">
                                          <p className="text-xs text-white/40">No hay tareas específicas listadas para esta semana.</p>
                                          {/* Fallback auto-complete button si no hay tareas */}
                                          {!week.completed && (
                                            <button
                                              onClick={() => {
                                                toggleWeekCompletion(module.id, week.id, false, true);
                                                toast({ title: "Semana Completada!" });
                                              }}
                                              className="mt-3 px-4 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-full"
                                            >
                                              Marcar Completada
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Alert de bloqueo para la siguiente */}
                                    {!week.completed && microPracticas.length > 0 && (
                                      <p className="text-[9px] text-center text-white/30 pt-2 font-medium">
                                        Completa todas las prácticas para desbloquear la siguiente semana.
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
