
"use client";
import { useState, useMemo } from 'react';
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAppState } from '@/context/app-state-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Lock, Clock, ClipboardList, WandSparkles, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function CoursesPage() {
    const { modules, toggleWeekCompletion, progress, tasks, userProfile, uploads } = useAppState();
    const { toast } = useToast();
    const [lockState, setLockState] = useState<Record<string, { isLocked: boolean; message: string }>>({})

    // Precompute lock state for all weeks using useEffect
    useMemo(() => {
      const isAdmin = userProfile?.role === 'admin';
      const state: Record<string, { isLocked: boolean; message: string }> = {};
      
      modules.forEach(module => {
        const lastWeek = module.weeks[module.weeks.length - 1];
        if (!lastWeek) return;
        
        const requiredVideosCount = module.moduleNumber;
        const completedTasks = tasks.filter((t: any) => t.done).length;
        const hasEnoughVideos = uploads.length >= requiredVideosCount;
        
        module.weeks.forEach((week, i) => {
          const isWeek4 = week.week === 4;
          const isLocked = !isAdmin && isWeek4 && !week.completed && (completedTasks < 3 || !hasEnoughVideos);
          
          state[week.id] = {
            isLocked: isLocked,
            message: isLocked 
              ? [
                  completedTasks < 3 ? 'Completa al menos 3 tareas en tu lista.' : '', 
                  !hasEnoughVideos ? `Sube tu video de evidencia para este nivel (necesitas ${requiredVideosCount} en total).` : ''
                ].filter(Boolean).join(' ')
              : ''
          };
        });
      });
      setLockState(state);
    }, [modules, tasks, uploads, userProfile]);

    const handleToggleWeekCompletion = async (moduleId: string, weekId: string, week: any, module: any) => {
        const isLastWeek = week.id === module.weeks[module.weeks.length - 1].id;
        try {
            const response = await toggleWeekCompletion(moduleId, weekId);
            
            if (response?.isLocked) return;
            
            if (isLastWeek && !week.completed) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF8C00', '#ffffff']
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error al actualizar curso",
                description: error.message || "Ocurrió un error al guardar tu progreso."
            });
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr]">
                <Sidebar className="hidden border-e bg-card lg:block" collapsible="icon">
                    <SidebarNav />
                </Sidebar>
                <div className="flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10"
                        >
                            <h1 className="text-4xl font-extrabold tracking-tight">Mis Cursos</h1>
                            <p className="text-muted-foreground mt-2 text-lg">Sigue tu progreso en el programa de entrenamiento de élite MANADA.</p>
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
                                                        "flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shrink-0 transition-transform group-hover:scale-110 duration-500 shadow-inner",
                                                        isCompleted ? "bg-primary/20" : "bg-accent/50"
                                                    )}>
                                                        {module.icon}
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
                                                                                    onClick={() => handleToggleWeekCompletion(module.id, week.id, week, module)}
                                                                                >
                                                                                    {week.completed ? <GraduationCap className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-primary" />}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <CardTitle className="text-lg font-bold mt-4 line-clamp-2 leading-snug group-hover/week:text-primary transition-colors">
                                                                            {week.objective}
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80 flex items-center gap-1.5">
                                                                                <WandSparkles className="h-3 w-3" /> Entrenamiento
                                                                            </p>
                                                                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{week.exercises}</p>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-4 pt-2 border-t border-primary/5">
                                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                                <Clock className="h-3.5 w-3.5 text-primary/60" />
                                                                                {week.time}
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                    
                                                                    {isLocked && (
                                                                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] pointer-events-none flex items-center justify-center">
                                                                            {/* Visual lock overlay */}
                                                                        </div>
                                                                    )}
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
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
