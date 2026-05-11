"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { useAppState } from '@/context/app-state-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Lock, Clock, ListPlus, WandSparkles, GraduationCap, 
    Loader2, CheckCircle2, Sparkles, Video, PlayCircle,
    Heart, Activity, Brain, Target, Flame, Dumbbell,
    Info, Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import Image from 'next/image';

export default function CoursesPage() {
    const { modules, toggleWeekCompletion, progress, tasks, addTask, userProfile, uploads } = useAppState();
    const [mounted, setMounted] = useState(false);
    const [lockState, setLockState] = useState<Record<string, { isLocked: boolean; message: string }>>({});
    const [taskDialog, setTaskDialog] = useState<{ open: boolean; moduleId: string; weekId: string; week: any; module: any } | null>(null);
    const [taskInput, setTaskInput] = useState('');
    const [isSavingTask, setIsSavingTask] = useState(false);
    const [videoDialog, setVideoDialog] = useState<{ open: boolean; title: string; videoUrl?: string } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
      if (!modules || !tasks) return;
      const state: Record<string, { isLocked: boolean; message: string }> = {};
      modules.forEach(module => {
        if (!module.weeks) return;
        const completedTasks = (tasks || []).filter((t: any) => t.done).length;
        const requiredVideosCount = module.moduleNumber;
        module.weeks.forEach((week) => {
          const baseTasks = (module.moduleNumber - 1) * 3;
          let requiredTasks = baseTasks;
          if (week.week === 2) requiredTasks = baseTasks + 1;
          if (week.week === 3) requiredTasks = baseTasks + 2;
          if (week.week === 4) requiredTasks = baseTasks + 3;
          const hasEnoughTasks = completedTasks >= requiredTasks;
          const needsVideo = week.week === 4;

          let previousWeekCompleted = true;
          if (week.week > 1) {
            const prevWeek = module.weeks.find(w => w.week === week.week - 1);
            previousWeekCompleted = prevWeek ? prevWeek.completed : true;
          }

          let isLocked = false;
          let messages: string[] = [];
          if (!previousWeekCompleted) { isLocked = true; messages.push(`Completa la semana ${week.week - 1}.`); }
          else if (!hasEnoughTasks) { isLocked = true; messages.push(`Requiere ${requiredTasks} tareas completadas (tienes ${completedTasks}).`); }
          else if (needsVideo && uploads.length < module.moduleNumber) { 
            isLocked = true; 
            messages.push(`Para la SEMANA 4 es obligatorio subir un video de evidencia (tienes ${uploads.length}/${module.moduleNumber}).`); 
          }
          if (week.completed) { isLocked = false; messages = []; }
          state[week.id] = { isLocked, message: messages.join(' ') };
        });
      });
      setLockState(state);
    }, [modules, tasks, uploads, userProfile]);

    const handleWeekClick = (moduleId: string, weekId: string, week: any, module: any) => {
      if (week.completed) {
        handleToggleWeekCompletion(moduleId, weekId, week, module);
        return;
      }
      const autoLabel = `[M${module.moduleNumber}-S${week.week}] ${week.objective}`;
      setTaskInput(autoLabel);
      setTaskDialog({ open: true, moduleId, weekId, week, module });
    };

    const handleConfirmWeekWithTask = async () => {
      if (!taskDialog) return;
      const label = taskInput.trim();
      if (!label) { toast({ variant: 'destructive', title: 'Escribe una tarea' }); return; }
      setIsSavingTask(true);
      try {
        const exists = tasks.some((t: any) => t.label === label);
        if (!exists) await addTask(label);
        setTaskDialog(null);
        setTaskInput('');
        toast({ title: '¡Tarea Asignada!', description: 'Completa la tarea en la sección de Tareas para desbloquear la siguiente semana.', className: 'bg-blue-600 text-white border-none font-bold' });
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
      } finally {
        setIsSavingTask(false);
      }
    };

    const handleToggleWeekCompletion = async (moduleId: string, weekId: string, week: any, module: any) => {
        const isLastWeek = week.id === module.weeks[module.weeks.length - 1].id;
        try {
            const response = await toggleWeekCompletion(moduleId, weekId);
            if (response?.isLocked) return;
            if (isLastWeek && !week.completed) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF8C00', '#ffffff'] });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al actualizar curso", description: error.message || "Ocurrió un error." });
        }
    };

    if (!mounted) return null;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase">Mis Cursos</h1>
                <p className="text-muted-foreground mt-2 text-base md:text-lg font-medium opacity-80">Sigue tu progreso en el programa de entrenamiento de élite MANADA.</p>
            </motion.div>
            
            <Accordion type="single" collapsible className="w-full space-y-6">
                {modules.map((module, mIdx) => {
                    const moduleProgress = Math.round(module.weeks.filter(w => w.completed).length / module.weeks.length * 100);
                    const isCompleted = moduleProgress === 100;
                    
                    return (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: mIdx * 0.1 }}
                        >
                            <AccordionItem 
                                value={module.id} 
                                className={cn(
                                    "border-none rounded-[2rem] overflow-hidden bg-card shadow-lg transition-all mb-4 border border-primary/5",
                                    isCompleted ? "ring-2 ring-primary/20 shadow-primary/5" : ""
                                )}
                            >
                                <AccordionTrigger className="hover:no-underline px-6 py-6 group">
                                    <div className="flex w-full items-center gap-6 text-left">
                                        <div className={cn(
                                            "flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shrink-0 transition-transform group-hover:scale-105 duration-500 shadow-inner overflow-hidden relative border border-white/5",
                                            isCompleted ? "bg-primary/20" : "bg-accent/50"
                                        )}>
                                            {module.imageUrl ? (
                                                <Image 
                                                    src={module.imageUrl} 
                                                    alt={module.title} 
                                                    fill
                                                    className="object-cover sepia-[.6] saturate-[1.8] hue-rotate-[-15deg] contrast-110"
                                                />
                                            ) : (
                                                module.icon
                                            )}
                                        </div>
                                        <div className="flex-1 py-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Módulo {module.moduleNumber}</span>
                                                {isCompleted && <Badge variant="default" className="bg-primary/20 text-primary border-none text-[8px] uppercase font-black tracking-widest px-2 h-4">Completado</Badge>}
                                            </div>
                                            <h2 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{module.title}</h2>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">Pulse para ver las semanas de entrenamiento</p>
                                        </div>
                                        <div className="hidden md:flex flex-col items-end gap-2 pr-4">
                                            <span className="text-sm font-black text-primary">{moduleProgress}%</span>
                                            <div className="w-32 h-2 bg-primary/10 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${moduleProgress}%` }}
                                                    className="h-full bg-primary rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-8">
                                    <div className="grid gap-6 pt-2 sm:grid-cols-2">
                                        {module.weeks.map((week, weekIndex) => {
                                            const lock = lockState[week.id] || { isLocked: false, message: '' };
                                            const { isLocked, message } = lock;

                                            return (
                                                <motion.div 
                                                    key={week.id}
                                                    whileHover={{ scale: isLocked ? 1 : 1.02 }}
                                                    className="relative"
                                                >
                                                    <Card className={cn(
                                                        "h-full rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group/week",
                                                        week.completed 
                                                            ? "bg-primary/5 border-primary/20" 
                                                            : isLocked 
                                                                ? "bg-muted/30 border-primary/5 opacity-80" 
                                                                : "bg-card border-primary/10 hover:border-primary/40 shadow-sm"
                                                    )}>
                                                        <CardHeader className="pb-4">
                                                            <div className="flex items-center justify-between">
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={cn(
                                                                        "rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-none",
                                                                        week.completed ? "bg-primary text-primary-foreground" : "bg-accent/50 text-muted-foreground"
                                                                    )}
                                                                >
                                                                    Semana {week.week}
                                                                </Badge>
                                                                
                                                                {isLocked ? (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center border border-muted-foreground/10">
                                                                                    <Lock className="h-4 w-4 text-muted-foreground/60" />
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-destructive text-destructive-foreground font-bold p-3 rounded-xl shadow-xl border-none">
                                                                                <p className="max-w-[180px] text-[10px] uppercase leading-relaxed tracking-wide">{message}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ) : (
                                                                    <div 
                                                                        className={cn(
                                                                            "h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-sm border",
                                                                            week.completed 
                                                                                ? "bg-primary text-primary-foreground border-primary" 
                                                                                : "bg-background hover:bg-primary/10 border-primary/20 text-primary"
                                                                        )}
                                                                        onClick={() => handleWeekClick(module.id, week.id, week, module)}
                                                                    >
                                                                        {week.completed ? <GraduationCap className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-primary" />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <CardTitle className="text-lg font-bold mt-4 line-clamp-2 leading-snug group-hover/week:text-primary transition-colors">
                                                                {week.objective}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-6">
                                                             {/* Detailed training content if available */}
                                                             {week.enfoque ? (
                                                                 <div className="space-y-5">
                                                                     {/* Enfoque & Experiencia */}
                                                                     <div className="space-y-4">
                                                                         <div className="space-y-1.5">
                                                                             <div className="flex items-center gap-2">
                                                                                 <Sparkles className="h-3.5 w-3.5 text-primary" />
                                                                                 <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Enfoque</span>
                                                                             </div>
                                                                             <p className="text-sm font-bold leading-tight text-white/90">{week.enfoque}</p>
                                                                         </div>
                                                                         <div className="space-y-1.5 p-3.5 rounded-2xl bg-primary/[0.03] border border-primary/10">
                                                                             <div className="flex items-center gap-2">
                                                                                 <Heart className="h-3.5 w-3.5 text-primary" />
                                                                                 <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">Experiencia Formativa</span>
                                                                             </div>
                                                                             <p className="text-[11px] font-medium leading-relaxed text-white/80 italic">{week.experienciaFormativa}</p>
                                                                         </div>
                                                                     </div>

                                                                     {/* Entrenamiento Central */}
                                                                     <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                                         <div className="flex items-center justify-between">
                                                                             <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80 flex items-center gap-2">
                                                                                 <Target className="h-4 w-4" /> Entrenamiento Central
                                                                             </p>
                                                                         </div>
                                                                         <p className="text-sm font-black text-white/90 leading-tight">{week.entrenamientoCentral}</p>
                                                                         <div className="space-y-2 mt-3">
                                                                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Microprácticas</span>
                                                                             <div className="grid grid-cols-1 gap-2">
                                                                                 {week.microPracticas?.map((ex: string, i: number) => (
                                                                                     <div key={i} className="flex gap-2.5 p-2 rounded-xl bg-primary/5 border border-primary/5 items-start">
                                                                                         <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                                                         <p className="text-[11px] font-medium text-white/70 leading-snug">{ex}</p>
                                                                                     </div>
                                                                                 ))}
                                                                             </div>
                                                                         </div>
                                                                     </div>

                                                                     {/* Aprendizaje & Transformación */}
                                                                     <div className="grid grid-cols-1 gap-4">
                                                                         <div className="space-y-2 p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                                                             <div className="flex items-center gap-2 text-orange-500">
                                                                                 <Brain className="h-3.5 w-3.5" />
                                                                                 <span className="text-[9px] font-black uppercase tracking-widest">Aprendizaje Humano</span>
                                                                             </div>
                                                                             <p className="text-[11px] font-medium text-orange-200/70 leading-relaxed">
                                                                                 {week.aprendizajeHumano}
                                                                             </p>
                                                                         </div>
                                                                         <div className="space-y-1.5 px-2">
                                                                             <div className="flex items-center gap-2">
                                                                                 <GraduationCap className="h-3.5 w-3.5 text-primary/60" />
                                                                                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Transformación Esperada</span>
                                                                             </div>
                                                                             <p className="text-[10px] font-bold leading-relaxed text-primary/80">{week.transformacionEsperada}</p>
                                                                        </div>
                                                                     </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80 flex items-center gap-1.5">
                                                                        <WandSparkles className="h-3 w-3" /> Entrenamiento
                                                                    </p>
                                                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{week.exercises}</p>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-primary/5">
                                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                    <Clock className="h-3.5 w-3.5 text-primary/60" />
                                                                    {week.time}
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                           e.stopPropagation();
                                                                           setVideoDialog({ open: true, title: week.objective, videoUrl: week.videoUrl });
                                                                        }}
                                                                        className="rounded-xl border-white/10 hover:bg-white/5 text-xs font-bold w-full sm:w-auto"
                                                                    >
                                                                        <PlayCircle className="mr-2 h-3.5 w-3.5 text-primary" /> Ejemplo
                                                                    </Button>

                                                                    {!week.completed && !isLocked && (
                                                                        <Button 
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                               e.stopPropagation();
                                                                               const taskLabel = `[M${module.moduleNumber}-S${week.week}] ${week.objective}`;
                                                                               const task = tasks.find((t: any) => t.label === taskLabel);
                                                                               if (task && !task.done) {
                                                                                   window.location.href = '/dashboard/tasks';
                                                                               } else if (task && task.done) {
                                                                                   handleToggleWeekCompletion(module.id, week.id, week, module);
                                                                               } else {
                                                                                   handleWeekClick(module.id, week.id, week, module);
                                                                               }
                                                                            }}
                                                                             className={cn(
                                                                                "rounded-xl border-none text-xs font-bold w-full sm:w-auto transition-all",
                                                                                tasks.some((t: any) => t.label === `[M${module.moduleNumber}-S${week.week}] ${week.objective}` && !t.done)
                                                                                    ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                                                                                    : tasks.some((t: any) => t.label === `[M${module.moduleNumber}-S${week.week}] ${week.objective}` && t.done)
                                                                                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                                                        : "bg-primary/10 hover:bg-primary/20 text-primary"
                                                                             )}
                                                                        >
                                                                            {(() => {
                                                                               const taskLabel = `[M${module.moduleNumber}-S${week.week}] ${week.objective}`;
                                                                               const task = tasks.find((t: any) => t.label === taskLabel);
                                                                               if (task && !task.done) return <><Clock className="mr-2 h-3.5 w-3.5 animate-pulse" /> Tarea en curso...</>;
                                                                               if (task && task.done) return <><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Completar Semana</>;
                                                                               return (
                                                                                   <>
                                                                                       {week.week === 4 ? <Video className="mr-2 h-3.5 w-3.5" /> : <ListPlus className="mr-2 h-3.5 w-3.5" />}
                                                                                       {week.week === 4 ? "Añadir Video a Tareas" : "Añadir a Tareas"}
                                                                                   </>
                                                                               );
                                                                            })()}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </motion.div>
                    )
                })}
            </Accordion>

            <Dialog open={!!taskDialog?.open} onOpenChange={(o) => { if (!o) setTaskDialog(null); }}>
                <DialogContent className="w-[95vw] max-w-md rounded-[2rem] p-0 overflow-hidden border-primary/20 shadow-2xl">
                    <div className="p-6 bg-primary/5 border-b border-primary/10">
                        <DialogTitle className="text-xl font-black flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-primary" /> Registrar Tarea de Semana
                        </DialogTitle>
                        <DialogDescription className="text-sm mt-1 text-muted-foreground">
                            Para completar esta semana, primero registra la práctica correspondiente.
                        </DialogDescription>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-black text-primary/70">Tarea a registrar</Label>
                            <Input
                                value={taskInput}
                                onChange={e => setTaskInput(e.target.value)}
                                placeholder="Describe la práctica..."
                                className="rounded-2xl py-6 text-base font-medium"
                                disabled={isSavingTask}
                            />
                        </div>
                        <Button
                            onClick={handleConfirmWeekWithTask}
                            disabled={!taskInput.trim() || isSavingTask}
                            className="w-full rounded-2xl py-6 text-base font-black active:scale-95"
                        >
                            {isSavingTask ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Guardando...</> : <><CheckCircle2 className="h-5 w-5 mr-2" /> Registrar y Completar Semana</>}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!videoDialog?.open} onOpenChange={(o) => { if (!o) setVideoDialog(null); }}>
                <DialogContent className="w-[95vw] max-w-2xl rounded-[2rem] p-0 overflow-hidden border-primary/20 shadow-2xl bg-black">
                    <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                        <PlayCircle className="h-5 w-5 text-primary" />
                        <DialogTitle className="text-sm font-black uppercase tracking-widest text-white">
                            Ejemplo: {videoDialog?.title}
                        </DialogTitle>
                    </div>
                    <div className={cn("aspect-video bg-black/50 flex flex-col items-center justify-center relative overflow-hidden", videoDialog?.videoUrl ? "p-0" : "p-8")}>
                         {videoDialog?.videoUrl ? (
                             <iframe 
                                 src={videoDialog.videoUrl} 
                                 className="w-full h-full absolute inset-0"
                                 allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                                 title={videoDialog.title}
                             />
                         ) : (
                             <>
                                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale blur-sm mix-blend-overlay"></div>
                                 <div className="relative z-10 text-center space-y-4">
                                     <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 border border-primary/30">
                                        <Video className="h-8 w-8 text-primary" />
                                     </div>
                                     <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Video en Producción</h3>
                                     <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                         Próximamente podrás ver un ejemplo práctico de 30 segundos sobre cómo realizar este entrenamiento correctamente.
                                     </p>
                                     <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black tracking-widest px-3 py-1">Muy Pronto</Badge>
                                 </div>
                             </>
                         )}
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/10">
                        <Button
                            onClick={() => setVideoDialog(null)}
                            variant="outline"
                            className="w-full rounded-xl border-white/10 hover:bg-white/10 text-xs font-bold"
                        >
                            Cerrar Ejemplo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
