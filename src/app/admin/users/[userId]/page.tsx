"use client";

import { useState } from "react";
import { useDoc } from "@/hooks/use-doc";
import { useCollection } from "@/hooks/use-collection";
import { UserProfile, Upload } from "@/context/app-state-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, CheckCircle2, Circle, FileVideo, Calendar, MessageSquare, Video, Play, Sparkles, Filter, ChevronRight, Trash2, Users, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Task {
  id: string;
  label: string;
  done: boolean;
  createdAt: any;
}

export default function AdminUserPage() {
  const params = useParams();
  const userId = params.userId as string;
  const { toast } = useToast();
  const supabase = createClient();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
  const [focoMap, setFocoMap] = useState<{ [key: string]: number }>({});
  const [timingMap, setTimingMap] = useState<{ [key: string]: number }>({});
  const [tecnicaMap, setTecnicaMap] = useState<{ [key: string]: number }>({});
  const [nextStepsMap, setNextStepsMap] = useState<{ [key: string]: string[] }>({});
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});

  const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>("users", userId);
  
  const { data: tasks, isLoading: isTasksLoading } = useCollection<Task>(
    "tasks",
    [{ column: "user_id", operator: "eq", value: userId }],
    { column: "createdAt", ascending: false }
  );

  const { data: uploads, isLoading: isUploadsLoading, refetch: refetchUploads } = useCollection<Upload>(
    "uploads",
    [{ column: "user_id", operator: "eq", value: userId }],
    { column: "createdAt", ascending: false }
  );

  const { data: planHistory, isLoading: isPlanHistoryLoading } = useCollection<any>(
    "plan_history",
    [{ column: "user_id", operator: "eq", value: userId }],
    { column: "createdAt", ascending: false }
  );

  const { data: moduleProgress, isLoading: isModuleProgressLoading } = useCollection<any>(
    "module_progress",
    [{ column: "user_id", operator: "eq", value: userId }]
  );

  const handleAssignTask = async (label: string) => {
    try {
      const { error } = await supabase.from('tasks').insert({
        user_id: userId,
        label,
        done: false,
        createdAt: new Date().toISOString()
      });
      if (error) throw error;
      toast({ title: "Tarea asignada" });
      // Invalidate collections is handled by real-time hopefully, but we can force it
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast({ title: "Tarea eliminada" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleStatusChange = async (uploadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('uploads').update({ status: newStatus }).eq('id', uploadId);
      if (error) throw error;
      toast({ title: "Estado actualizado" });
      await refetchUploads();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleSaveFeedback = async (uploadId: string) => {
    setIsSaving(prev => ({ ...prev, [uploadId]: true }));
    
    // Construct professional feedback object
    const feedbackDetail = {
        foco: focoMap[uploadId] ?? 80,
        timing: timingMap[uploadId] ?? 80,
        tecnica: tecnicaMap[uploadId] ?? 80,
        comments: feedbackText[uploadId] || "",
        nextSteps: nextStepsMap[uploadId] || [],
        evaluatorName: "Ricardo",
        evaluatorRole: "Tutor Evaluador",
        date: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('uploads').update({ 
        feedback: feedbackText[uploadId] || "",
        feedback_detail: feedbackDetail
      }).eq('id', uploadId);
      
      if (error) throw error;
      
      toast({ title: "Feedback profesional guardado exitosamente" });
      await refetchUploads();

      // Disparar Notificación por Correo y App
      const targetUpload = uploads?.find(u => u.id === uploadId);
      if (userProfile && userProfile.email) {
         try {
           const response = await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 clientEmail: userProfile.email,
                 clientName: userProfile.displayName,
                 status: targetUpload?.status || 'pending',
                 feedbackText: feedbackText[uploadId] || "Tienes nueva retroalimentación profesional esperándote.",
                 feedbackDetail: feedbackDetail,
                 userId: userId
              })
           });
           
           if (!response.ok) {
              const err = await response.json();
              console.error("Notification failed:", err);
              toast({ variant: "destructive", title: "Aviso", description: "Feedback guardado, pero no se pudo enviar el correo (Faltan variables EMAIL_USER/PASS)." });
           } else {
              toast({ title: "Feedback enviado al alumno ✅" });
           }
         } catch (e) {
           console.error("Fetch error:", e);
         }
      }

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(prev => ({ ...prev, [uploadId]: false }));
    }
  };

  const handleDeleteVideo = async (upload: Upload) => {
    if (!window.confirm("¿Seguro que deseas eliminar este video permanentemente? Esta acción no se puede deshacer y liberará espacio.")) return;
    
    setIsDeleting(prev => ({ ...prev, [upload.id]: true }));
    try {
        const urlParts = upload.url.split('/uploads/');
        if (urlParts.length > 1) {
             const storagePath = urlParts[1].split('?')[0];
             const { error: storageError } = await supabase.storage.from('uploads').remove([storagePath]);
             if (storageError) console.error("Error eliminando de storage:", storageError);
        }

        const { error } = await supabase.from('uploads').delete().eq('id', upload.id);
        if (error) throw error;
        
        toast({ title: "Video eliminado", description: "El video ha sido borrado permanentemente." });
        await refetchUploads();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
    } finally {
        setIsDeleting(prev => ({ ...prev, [upload.id]: false }));
    }
  };

  if (isUserLoading || isTasksLoading || isUploadsLoading || isPlanHistoryLoading || isModuleProgressLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Usuario no encontrado</h2>
        <Link href="/admin" className="text-primary hover:underline mt-4 inline-block">Volver al panel</Link>
      </div>
    );
  }

  const filteredUploads = uploads?.filter(u => filterStatus === "all" || u.status === filterStatus || (!u.status && filterStatus === "pending")) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Centro de Control: {userProfile.displayName}</h2>
          <p className="text-muted-foreground">Supervisión técnica y retroalimentación profesional.</p>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Videos</p>
              <h4 className="text-xl font-bold">{uploads?.length || 0}</h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-yellow-500/10 rounded-full"><Loader2 className="h-5 w-5 text-yellow-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
              <h4 className="text-xl font-bold">{uploads?.filter(u => !u.status || u.status === 'pending').length || 0}</h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-full"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Aprobados</p>
              <h4 className="text-xl font-bold">{uploads?.filter(u => u.status === 'approved').length || 0}</h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-full"><Sparkles className="h-5 w-5 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Planes IA</p>
              <h4 className="text-xl font-bold">{planHistory?.length || 0}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile & Progress */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Perfil del Binomio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={userProfile.dogPhotoURL || ""} />
                  <AvatarFallback>{userProfile.dogName?.charAt(0) || "P"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{userProfile.dogName || "Sin Nombre"}</h3>
                  <p className="text-xs text-muted-foreground">{userProfile.displayName}</p>
                </div>
              </div>
              <div className="pt-2 space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Progreso por Módulo</p>
                {moduleProgress && moduleProgress.length > 0 ? (
                  moduleProgress.map((prog: any) => (
                    <div key={prog.moduleId} className="space-y-1">
                      <div className="flex justify-between text-[10px] items-center">
                        <span className="font-medium">{prog.moduleId}</span>
                        <span>{prog.completedWeekIds?.length || 0}/4</span>
                      </div>
                      <Progress value={((prog.completedWeekIds?.length || 0) / 4) * 100} className="h-1" />
                    </div>
                  ))
                ) : <p className="text-xs text-muted-foreground">Sin progreso registrado.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Tareas Diarias</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full"><Plus className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Asignar Nueva Tarea</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                       <Label>Descripción de la tarea</Label>
                       <Input 
                        placeholder="Ej. Practicar 5 min de DPT" 
                        id="new-task-label"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            if (val) handleAssignTask(val);
                          }
                        }}
                       />
                    </div>
                    <Button className="w-full" onClick={() => {
                      const input = document.getElementById('new-task-label') as HTMLInputElement;
                      if (input.value) handleAssignTask(input.value);
                    }}>Asignar Tarea</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
              {tasks?.map(task => (
                <div key={task.id} className="flex items-start gap-2 p-2 rounded-md border bg-muted/20 group/task relative">
                  {task.done ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" /> : <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />}
                  <span className={`text-[11px] leading-tight ${task.done ? 'line-through opacity-50' : ''}`}>{task.label}</span>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="absolute right-2 opacity-0 group-hover/task:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )) || <p className="text-xs text-muted-foreground p-4 text-center">No hay tareas asignadas aún.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Video Review Center */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Evidencias de Entrenamiento
                </CardTitle>
                <CardDescription>Revisa los videos y califica el desempeño.</CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <Filter className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los videos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="improve">Por mejorar</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredUploads.length > 0 ? filteredUploads.map((upload) => (
                  <div key={upload.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 p-4">
                        {/* Video Player Section */}
                        <div className="lg:col-span-5 w-full">
                          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-inner group/video">
                            <video 
                              src={upload.url} 
                              controls 
                              className="w-full h-full object-contain"
                              preload="metadata"
                            />
                          </div>
                        </div>

                        {/* Feedback & Info Section */}
                        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm text-white truncate max-w-[200px]">{upload.name}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(upload.createdAt?.toDate ? upload.createdAt.toDate() : upload.createdAt), "d MMM, HH:mm", { locale: es })}
                                </div>
                              </div>
                              <Badge 
                                variant={upload.status === 'approved' ? 'default' : upload.status === 'improve' ? 'destructive' : 'secondary'}
                                className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest border-none`}
                              >
                                {upload.status === 'approved' ? 'Aprobado' : upload.status === 'improve' ? 'Corregir' : 'Pendiente'}
                              </Badge>
                            </div>

                            {/* Professional Metrics Sliders */}
                            <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Foco {focoMap[upload.id] ?? upload.feedback_detail?.foco ?? 80}%</Label>
                                <input 
                                  type="range" 
                                  className="w-full accent-primary h-1"
                                  min="0" max="100" 
                                  value={focoMap[upload.id] ?? upload.feedback_detail?.foco ?? 80}
                                  onChange={(e) => setFocoMap(prev => ({ ...prev, [upload.id]: parseInt(e.target.value) }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Timing {timingMap[upload.id] ?? upload.feedback_detail?.timing ?? 80}%</Label>
                                <input 
                                  type="range" 
                                  className="w-full accent-primary h-1"
                                  min="0" max="100" 
                                  value={timingMap[upload.id] ?? upload.feedback_detail?.timing ?? 80}
                                  onChange={(e) => setTimingMap(prev => ({ ...prev, [upload.id]: parseInt(e.target.value) }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Técnica {tecnicaMap[upload.id] ?? upload.feedback_detail?.tecnica ?? 80}%</Label>
                                <input 
                                  type="range" 
                                  className="w-full accent-primary h-1"
                                  min="0" max="100" 
                                  value={tecnicaMap[upload.id] ?? upload.feedback_detail?.tecnica ?? 80}
                                  onChange={(e) => setTecnicaMap(prev => ({ ...prev, [upload.id]: parseInt(e.target.value) }))}
                                />
                              </div>
                            </div>

                            <div className="relative group">
                              <Textarea 
                                placeholder="Escribe tu observación técnica detallada..."
                                className="w-full text-xs min-h-[80px] bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-white placeholder:text-muted-foreground/50 rounded-lg p-3 transition-all font-medium leading-relaxed resize-none"
                                value={feedbackText[upload.id] ?? upload.feedback ?? ""}
                                onChange={(e) => setFeedbackText(prev => ({ ...prev, [upload.id]: e.target.value }))}
                              />
                            </div>

                            {/* Next Steps Builder */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Próximos Pasos (Siguientes Pasos)</Label>
                                <div className="space-y-2">
                                    {(nextStepsMap[upload.id] ?? upload.feedback_detail?.nextSteps ?? []).map((step, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input 
                                                className="h-7 text-[11px] bg-white/5 border-white/5 focus:border-primary/30"
                                                value={step}
                                                onChange={(e) => {
                                                    const newSteps = [...(nextStepsMap[upload.id] ?? upload.feedback_detail?.nextSteps ?? [])];
                                                    newSteps[idx] = e.target.value;
                                                    setNextStepsMap(prev => ({ ...prev, [upload.id]: newSteps }));
                                                }}
                                            />
                                            <Button 
                                                variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                onClick={() => {
                                                    const newSteps = (nextStepsMap[upload.id] ?? upload.feedback_detail?.nextSteps ?? []).filter((_, i) => i !== idx);
                                                    setNextStepsMap(prev => ({ ...prev, [upload.id]: newSteps }));
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full h-7 border-dashed border-white/10 bg-transparent hover:bg-white/5 text-[10px] uppercase font-bold text-primary"
                                        onClick={() => {
                                            const currentSteps = nextStepsMap[upload.id] ?? upload.feedback_detail?.nextSteps ?? [];
                                            setNextStepsMap(prev => ({ ...prev, [upload.id]: [...currentSteps, ""] }));
                                        }}
                                    >
                                        + Añadir Paso
                                    </Button>
                                </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                            <div className="flex gap-2 items-center">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`h-9 px-4 rounded-lg border-white/10 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50 text-[10px] font-black uppercase tracking-wider transition-all`}
                                onClick={() => handleStatusChange(upload.id, 'approved')}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Aprobar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 px-4 rounded-lg border-white/10 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50 text-[10px] font-black uppercase tracking-wider transition-all"
                                onClick={() => handleStatusChange(upload.id, 'improve')}
                              >
                                <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Corregir
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                disabled={isDeleting[upload.id]}
                                onClick={() => handleDeleteVideo(upload)}
                              >
                                {isDeleting[upload.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>

                            <Button 
                              size="sm" 
                              className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 group"
                              disabled={isSaving[upload.id]}
                              onClick={() => handleSaveFeedback(upload.id)}
                            >
                              {isSaving[upload.id] ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />}
                              Guardar Feedback
                            </Button>
                          </div>
                        </div>
                      </div>
                  </div>
                )) : (
                  <div className="py-20 text-center space-y-2">
                    <Video className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">No hay videos en esta categoría.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
