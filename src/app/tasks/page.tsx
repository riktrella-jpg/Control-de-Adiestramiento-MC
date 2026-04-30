"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { useAppState } from "@/context/app-state-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCircle, ListPlus, Video, Play, Calendar, HardDrive, Upload, Loader2, CheckCircle2, AlertCircle, MessageCircle, Info, Medal, Compass, Quote, Sparkles, Trophy, ChevronRight, ArrowRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const suggestedTasks = [
    "Mindfulness: Sesión de calma y respiración de 5 minutos.",
    "Apego Seguro: Practicar el contacto visual durante el paseo.",
    "Normas: Repasar el comando 'sentado' antes de recibir comida.",
    "Autocontrol: Ejercicio de 'quieto' mientras se deja un premio en el suelo.",
    "Desensibilización: Poner sonidos de la calle a volumen bajo durante 5 minutos.",
    "Adaptación: Realizar un paseo por una ruta ligeramente diferente a la habitual.",
    "Mindfulness: Paseo de olfateo, dejando que tu perro guíe el camino.",
    "Apego Seguro: Juego de 'llamada y ven' dentro de casa con refuerzo positivo.",
    "Normas: Practicar el no tirar de la correa en un tramo corto y conocido.",
    "Autocontrol: Esperar la señal verbal antes de salir por la puerta."
];

export default function TasksPage() {
    const { tasks, addTask, toggleTaskCompletion, uploads, user, userProfile, uploadVideo } = useAppState();
    const [newTaskLabel, setNewTaskLabel] = useState("");
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingFileName, setUploadingFileName] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, dismiss } = useToast();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation: File type (Video only)
        if (!file.type.startsWith('video/')) {
            toast({
                variant: "destructive",
                title: "Formato no válido",
                description: "Por favor, selecciona un archivo de video (MP4, MOV, etc.).",
            });
            return;
        }

        // Validation: File size (Max 100MB)
        const MAX_SIZE_MB = 100;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            toast({
                variant: "destructive",
                title: "Archivo demasiado grande",
                description: `El tamaño máximo permitido es de ${MAX_SIZE_MB}MB.`,
            });
            return;
        }

        const validateVideo = (videoFile: File): Promise<{ isValid: boolean; error?: string }> => {
            return new Promise((resolve) => {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    URL.revokeObjectURL(video.src);
                    const duration = video.duration;
                    const width = video.videoWidth;
                    const height = video.videoHeight;
                    if (duration > 300) {
                        resolve({ isValid: false, error: `El video dura ${Math.round(duration)}s. El máximo permitido es de 5 minutos.` });
                        return;
                    }
                    const maxDim = Math.max(width, height);
                    const minDim = Math.min(width, height);
                    if (maxDim > 1920 || minDim > 1080) {
                        resolve({ isValid: false, error: `La resolución es ${width}x${height}. El máximo permitido es 1080p (1920x1080).` });
                        return;
                    }
                    resolve({ isValid: true });
                };
                video.onerror = () => {
                    URL.revokeObjectURL(video.src);
                    resolve({ isValid: false, error: "El archivo de video está corrupto o no se puede leer." });
                };
                video.src = URL.createObjectURL(videoFile);
            });
        };

        const validationResult = await validateVideo(file);
        if (!validationResult.isValid) {
            toast({
                variant: "destructive",
                title: "Video no válido",
                description: validationResult.error,
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (!user) {
            toast({ variant: "destructive", title: "Error de autenticación", description: "Debes iniciar sesión para subir archivos." });
            return;
        }

        const { id: toastId, update: updateToast } = toast({ title: "Iniciando subida...", description: `Preparando "${file.name}" para la subida.` });

        try {
            setIsUploading(true);
            setUploadingFileName(file.name);
            updateToast({ title: "Subiendo archivo...", description: `No cierres esta ventana...` });
            await uploadVideo(file);
            dismiss(toastId);
            toast({ title: "¡Subida completada!", description: `"${file.name}" se ha subido correctamente.` });
        } catch (error: any) {
            dismiss(toastId);
            toast({ variant: "destructive", title: "Error en la subida", description: error.message || "No se pudo subir el archivo." });
        } finally {
            setIsUploading(false);
            setUploadingFileName("");
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddTask = async () => {
        if (newTaskLabel.trim()) {
            setIsAddingTask(true);
            try {
                await addTask(newTaskLabel.trim());
                setNewTaskLabel("");
                toast({ title: "Tarea añadida", description: `"${newTaskLabel.trim()}" se ha guardado correctamente.` });
            } catch (error: any) {
                toast({ variant: "destructive", title: "Error al añadir tarea", description: error.message || "No se pudo guardar la tarea." });
            } finally {
                setIsAddingTask(false);
            }
        }
    };
    
    const handleAddSuggestedTask = async (taskLabel: string) => {
        setIsAddingTask(true);
        try {
            await addTask(taskLabel);
            setPopoverOpen(false);
            toast({ title: "Tarea sugerida añadida", description: `"${taskLabel}" se ha guardado correctamente.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al añadir sugerencia", description: error.message || "No se pudo guardar la tarea." });
        } finally {
            setIsAddingTask(false);
        }
    }

    const handleToggleTask = async (taskId: string) => {
        try {
            await toggleTaskCompletion(taskId);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al actualizar tarea", description: error.message || "No se pudo sincronizar el cambio." });
        }
    }

    const formatSize = (bytes?: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusConfig = (status?: string) => {
        switch(status) {
            case 'approved': return { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle2 className="w-3 h-3 mr-1" />, label: 'Aprobado' };
            case 'improve': return { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <AlertCircle className="w-3 h-3 mr-1" />, label: 'Para corregir' };
            case 'reviewed': return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Info className="w-3 h-3 mr-1" />, label: 'Revisado' };
            default: return { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />, label: 'En revisión' };
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
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight">Tareas MANADA</h1>
                                    <p className="text-muted-foreground text-sm mt-1">Organiza tus prácticas diarias y conecta con los pilares del método.</p>
                                </div>
                                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button className="rounded-full px-6 shadow-lg shadow-primary/20">
                                            <PlusCircle className="mr-2 h-4 w-4" /> Nueva Tarea
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-5 rounded-2xl shadow-2xl border-primary/10" align="end">
                                        <div className="grid gap-5">
                                            <div className="space-y-1">
                                                <h4 className="font-bold">Añadir Tarea</h4>
                                                <p className="text-xs text-muted-foreground">Elige una sugerencia o crea una personalizada.</p>
                                            </div>
                                            <div className="flex w-full items-center space-x-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Ej: Caminar 10 min..."
                                                    value={newTaskLabel}
                                                    onChange={(e) => setNewTaskLabel(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                                    className="rounded-xl bg-muted/50 border-none"
                                                />
                                                <Button size="icon" onClick={handleAddTask} disabled={!newTaskLabel.trim() || isAddingTask} className="rounded-xl aspect-square">
                                                    {isAddingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-bold text-xs uppercase tracking-widest text-primary/70">Sugerencias</h4>
                                                <div className="grid gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                    {suggestedTasks.map((suggestion, index) => (
                                                        <Button
                                                            key={index}
                                                            variant="ghost"
                                                            className="justify-start text-left h-auto p-3 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                                                            disabled={isAddingTask}
                                                            onClick={() => handleAddSuggestedTask(suggestion)}
                                                        >
                                                            <ListPlus className="mr-3 h-4 w-4 flex-shrink-0 text-primary" />
                                                            <span className="text-xs font-medium">{suggestion}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {tasks.length > 0 ? (
                                        tasks.map((task) => (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={task.id} 
                                                onClick={() => handleToggleTask(task.id)}
                                                className={cn(
                                                    "group relative flex items-center p-4 rounded-2xl border transition-all cursor-pointer select-none",
                                                    task.done ? "bg-muted/30 border-primary/5 grayscale opacity-60" : "bg-card border-primary/10 hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center mr-4 transition-colors",
                                                    task.done ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                                )}>
                                                    {task.done ? <CheckCircle2 className="h-5 w-5" /> : <ListPlus className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className={cn("text-sm font-bold truncate transition-all", task.done ? "line-through text-muted-foreground" : "text-foreground")}>
                                                        {task.label}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                                                        {task.done ? 'Completado' : 'Pendiente'}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl bg-muted/5">
                                            <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                                            <p className="font-bold text-muted-foreground">¡Todo listo! No hay tareas pendientes.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Videos de Práctica</h2>
                                    <p className="text-muted-foreground text-xs font-medium">Tus evidencias enviadas para revisión experta.</p>
                                </div>
                                <Button onClick={handleUploadClick} variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5 gap-2">
                                    <Upload className="h-4 w-4" /> Subir Video
                                </Button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
                            </div>

                            {isUploading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 text-center space-y-4 relative overflow-hidden"
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                        </div>
                                        <h4 className="font-extrabold text-lg">Subiendo {uploadingFileName}...</h4>
                                        <div className="w-full max-w-[200px] h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-1/3 rounded-full animate-progress-loading" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {uploads && uploads.length > 0 ? (
                                <div className="max-w-4xl mx-auto space-y-12 pb-20">
                                    <motion.div 
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 via-black to-black border border-primary/20 overflow-hidden group shadow-[0_0_50px_rgba(252,196,25,0.05)]"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Trophy className="h-32 w-32 text-primary" />
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                            <div className="relative h-32 w-32 flex items-center justify-center">
                                                <svg className="h-full w-full -rotate-90 transform">
                                                    <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                                    <circle className="text-primary" strokeWidth="8" strokeDasharray="165, 365" strokeDashcap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-3xl font-black text-white">75%</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Nivel: Perro Confiable</h3>
                                                <p className="text-sm text-foreground/60 max-w-md">Has mejorado un 15% en tu timing esta semana. ¡Sigue así!</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="relative space-y-12">
                                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/40 via-primary/5 to-transparent -translate-x-1/2 hidden md:block" />

                                        <AnimatePresence>
                                            {uploads.map((upload, index) => {
                                                const statusConf = getStatusConfig(upload.status);
                                                return (
                                                    <Dialog key={upload.id}>
                                                        <DialogTrigger asChild>
                                                            <motion.div 
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className={cn(
                                                                    "group relative md:w-[48%] flex flex-col",
                                                                    index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                                                                )}
                                                            >
                                                                <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary shadow-[0_0_15px_rgba(252,196,25,0.8)] border-4 border-black z-20 hidden md:flex items-center justify-center">
                                                                    <div className="h-0.5 w-8 bg-primary/20 absolute right-full" />
                                                                </div>

                                                                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-[0_0_40px_rgba(252,196,25,0.05)] cursor-pointer group">
                                                                    <div className="p-6 sm:p-8 space-y-6">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="space-y-1">
                                                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                                                                                    <Calendar className="h-3 w-3 text-primary" />
                                                                                    {upload.createdAt ? new Date(upload.createdAt).toLocaleDateString() : 'Hoy'}
                                                                                </div>
                                                                                <h4 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight uppercase">{upload.name}</h4>
                                                                            </div>
                                                                            <Badge variant="outline" className={cn("px-4 py-1.5 border-none shadow-xl text-[9px] font-black uppercase tracking-widest ring-1 ring-white/10", statusConf.color)}>
                                                                                {statusConf.label}
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="flex items-center gap-3 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.05]">
                                                                            <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-black">
                                                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${upload.feedback_detail?.evaluatorName || 'Ricardo'}`} />
                                                                                <AvatarFallback>RE</AvatarFallback>
                                                                            </Avatar>
                                                                            <div className="flex-1">
                                                                                <p className="text-xs font-black text-foreground/80 leading-none mb-1">{upload.feedback_detail?.evaluatorName || "Especialista"}</p>
                                                                                <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest">{upload.feedback_detail?.evaluatorRole || "Tutor Evaluador"}</p>
                                                                            </div>
                                                                            <ChevronRight className="h-4 w-4 text-primary/40 group-hover:translate-x-1 transition-transform" />
                                                                        </div>

                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            {[
                                                                                { label: 'Foco', val: upload.feedback_detail?.foco || 0 },
                                                                                { label: 'Timing', val: upload.feedback_detail?.timing || 0 },
                                                                                { label: 'Técnica', val: upload.feedback_detail?.tecnica || 0 }
                                                                            ].map(m => (
                                                                                <div key={m.label} className="space-y-1.5">
                                                                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                                                                        <span>{m.label}</span>
                                                                                        <span className="text-primary">{m.val}%</span>
                                                                                    </div>
                                                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                                                        <div className="h-full bg-primary shadow-[0_0_8px_rgba(252,196,25,0.5)]" style={{ width: `${m.val}%` }} />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-[98vw] sm:max-w-[1000px] p-0 overflow-hidden bg-black border-none shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[2rem] sm:rounded-[4rem] max-h-[92vh] sm:max-h-[95vh] flex flex-col ring-1 ring-white/5">
                                                            <div className="flex flex-col md:grid md:grid-cols-[1.2fr_1fr] h-full overflow-hidden">
                                                                <div className="h-[35vh] md:h-auto w-full flex items-center justify-center bg-black relative shrink-0 border-b border-white/5 md:border-none">
                                                                    <video 
                                                                        src={upload.url} 
                                                                        controls 
                                                                        playsInline 
                                                                        webkit-playsinline="true"
                                                                        className="max-h-full max-w-full" 
                                                                        autoPlay 
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-card">
                                                                    <DialogHeader className="p-5 sm:p-8 pb-4 border-b bg-muted/20 shrink-0 bg-card/95 backdrop-blur-md">
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <Badge variant="outline" className={`px-3 py-1 border-none shadow-sm ${statusConf.color}`}>
                                                                                {statusConf.icon} {statusConf.label}
                                                                            </Badge>
                                                                        </div>
                                                                        <DialogTitle className="text-lg sm:text-xl font-extrabold leading-tight">{upload.name}</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                                                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-6 text-primary">
                                                                            <MessageCircle className="h-4 w-4" /> EVALUACIÓN PROFESIONAL
                                                                        </h4>
                                                                        {upload.feedback_detail ? (
                                                                            <div className="space-y-6">
                                                                                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                                                                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                                                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${upload.feedback_detail.evaluatorName || 'Ricardo'}`} />
                                                                                        <AvatarFallback>RE</AvatarFallback>
                                                                                    </Avatar>
                                                                                    <div>
                                                                                        <p className="text-sm font-bold">{upload.feedback_detail.evaluatorName || "Ricardo"}</p>
                                                                                        <p className="text-[10px] font-black uppercase text-primary/70">{upload.feedback_detail.evaluatorRole || "Tutor Evaluador"}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                                                                                    <Quote className="h-8 w-8 text-primary/20 absolute -top-3 -left-2 rotate-12" />
                                                                                    <p className="text-sm sm:text-base italic font-bold">"{upload.feedback_detail.comments}"</p>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                                    {[
                                                                                        { label: 'FOCO', value: upload.feedback_detail.foco, icon: <Compass className="h-4 w-4" /> },
                                                                                        { label: 'TIMING', value: upload.feedback_detail.timing, icon: <Loader2 className="h-4 w-4" /> },
                                                                                        { label: 'TÉCNICA', value: upload.feedback_detail.tecnica, icon: <Medal className="h-4 w-4" /> }
                                                                                    ].map((m) => (
                                                                                        <div key={m.label} className="p-4 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                                                                                            <div className="flex justify-between items-center mb-2">
                                                                                                <div className="p-2 bg-primary/10 rounded-xl text-primary">{m.icon}</div>
                                                                                                <span className="text-lg font-black text-primary">{m.value}%</span>
                                                                                            </div>
                                                                                            <p className="text-[9px] font-black uppercase text-muted-foreground">{m.label}</p>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                {upload.feedback_detail.nextSteps && (
                                                                                    <div className="space-y-4 pt-4">
                                                                                        <h5 className="text-[10px] font-black uppercase text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 inline-block">PRÓXIMOS PASOS</h5>
                                                                                        <div className="grid gap-2">
                                                                                            {upload.feedback_detail.nextSteps.map((step, i) => (
                                                                                                <div key={i} className="flex gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                                                                                    <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-[10px] font-black text-primary">{i+1}</div>
                                                                                                    <p className="text-sm font-bold text-foreground/80">{step}</p>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : upload.feedback ? (
                                                                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-sm font-bold">
                                                                                {upload.feedback}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center py-10 opacity-30">
                                                                                <Info className="h-10 w-10 mx-auto mb-3" />
                                                                                <p className="text-xs font-black uppercase">SIN REVISIÓN</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed rounded-[3rem] bg-muted/5 border-primary/20">
                                    <Video className="h-10 w-10 text-primary mx-auto mb-4" />
                                    <h3 className="font-black text-xl mb-2">Aún no hay evidencias</h3>
                                    <Button className="mt-8 rounded-full px-10" onClick={handleUploadClick}>
                                        <Upload className="mr-2 h-4 w-4" /> Seleccionar Video
                                    </Button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
