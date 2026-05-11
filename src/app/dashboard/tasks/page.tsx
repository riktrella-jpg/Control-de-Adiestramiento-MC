"use client";
import { useState, useRef, useEffect } from "react";
import { useAppState } from "@/context/app-state-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, ListPlus, Video, Upload, Loader2, CheckCircle2, AlertCircle, Info, Sparkles, Calendar, MessageCircle, Compass, Quote, ChevronRight, Trophy, ClipboardList, Film, Shield, Heart, Activity, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Mindfulness: Sesión de calma y respiración de 5 min.",
  "Apego Seguro: Contacto visual sostenido en el paseo.",
  "Normas: Repasar 'sentado' antes de cada comida.",
  "Autocontrol: 'Quieto' con premio en el suelo.",
  "Desensibilización: Sonidos urbanos a volumen bajo.",
  "Adaptación: Paseo por ruta nueva y diferente.",
  "Mindfulness: Paseo de olfateo libre sin corrección.",
  "Apego Seguro: Juego de llamada y ven en casa.",
  "Normas: Correa suelta en tramo corto conocido.",
  "Autocontrol: Esperar señal verbal antes de salir.",
  "Socialización: Exposición controlada a otro perro tranquilo.",
  "Obediencia: Practicar 'junto' en distancias cortas.",
  "Confianza: Juego de escondite dentro de casa.",
  "Manejo emocional: Ignorar ladrido por atención 3 min.",
  "Enriquecimiento: Lickmat o Kong relleno para calma.",
  "Caminata estructurada: 15 min sin tirones, foco total.",
  "Vínculo: Cepillado consciente con contacto visual.",
  "Impulso: Esperar 5 seg antes de comer su plato.",
  "Resiliencia: Permanecer en su lugar con distracción.",
  "Liderazgo: Pasar por puertas antes que el perro.",
  "Exploración: Visita corta a lugar nuevo (parque, tienda).",
  "Relajación: Masaje de orejas y pecho 5 minutos.",
  "Coordinación: Slalom entre conos o sillas.",
  "Paciencia: Ejercicio de 'espera' progresivo (10-30 seg).",
  "Comunicación: Responder a señales de calma del perro.",
  "Energía: Trote ligero de 10 min antes de entrenar.",
  "Independencia: Dejar al perro solo en habitación 5 min.",
  "Precisión: Marca con clicker 10 conductas correctas.",
  "Foco avanzado: Contacto visual de 10 seg con distracción.",
  "Gratitud: Sesión de juego libre como refuerzo final.",
];

type SaveState = "idle" | "saving" | "success" | "error";
type TabView = "tasks" | "videos";

function AddTaskDialog({ onTaskAdded }: { onTaskAdded: () => void }) {
  const { tasks, addTask } = useAppState();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setLabel(""); setSaveState("idle"); setErrorMsg(""); setTimeout(() => inputRef.current?.focus(), 100); } }, [open]);

  const isDuplicate = (t: string) => (tasks || []).some(x => x.label.toLowerCase() === t.toLowerCase() && !x.done);

  const handleSave = async () => {
    const t = label.trim();
    if (!t) { setErrorMsg("Escribe o selecciona una tarea."); setSaveState("error"); return; }
    if (t.length < 5) { setErrorMsg("Mínimo 5 caracteres."); setSaveState("error"); return; }
    if (isDuplicate(t)) { setErrorMsg("Ya tienes esta tarea pendiente."); setSaveState("error"); return; }
    setSaveState("saving"); setErrorMsg("");
    try {
      await addTask(t);
      setSaveState("success");
      onTaskAdded();
      setTimeout(() => { setOpen(false); setSaveState("idle"); setLabel(""); }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al guardar."); setSaveState("error");
      toast({ variant: "destructive", title: "Error", description: err?.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-6 py-6 shadow-xl shadow-primary/30 hover:scale-105 transition-transform font-bold gap-2">
          <PlusCircle className="h-5 w-5" /> Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg rounded-[2rem] p-0 overflow-hidden border-primary/20 shadow-2xl">
        <div className="p-6 bg-primary/5 border-b border-primary/10">
          <DialogTitle className="text-2xl font-black flex items-center gap-3"><Sparkles className="h-7 w-7 text-primary" /> Registrar Práctica</DialogTitle>
          <DialogDescription className="text-sm mt-1 text-muted-foreground">Elige una sugerencia o escribe tu propia tarea.</DialogDescription>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest font-black text-primary/70">1 · Sugerencias rápidas</Label>
            <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => { setLabel(s); setErrorMsg(""); setSaveState("idle"); inputRef.current?.focus(); }}
                  disabled={saveState === "saving" || saveState === "success"}
                  className={cn("text-left text-xs font-medium rounded-full px-3 py-1.5 transition-all border hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95",
                    label === s ? "bg-primary/15 text-primary border-primary/40 font-bold" : "bg-muted/50 border-transparent")}>
                  {s.length > 48 ? s.slice(0, 48) + "…" : s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-primary/70">2 · Detalle</Label>
            <Input ref={inputRef} value={label} onChange={e => { setLabel(e.target.value); setErrorMsg(""); setSaveState("idle"); }}
              onKeyDown={e => e.key === "Enter" && handleSave()} placeholder="Ej: Caminar 10 min en foco..."
              disabled={saveState === "saving" || saveState === "success"}
              className={cn("rounded-2xl pl-5 pr-12 py-6 text-base font-medium", saveState === "error" && "border-destructive")} />
            <AnimatePresence>{errorMsg && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-destructive font-bold flex items-center gap-1 pt-1"><AlertCircle className="h-3.5 w-3.5" /> {errorMsg}</motion.p>}</AnimatePresence>
          </div>
          <Button onClick={handleSave} disabled={!label.trim() || saveState === "saving" || saveState === "success"}
            className={cn("w-full rounded-2xl py-6 text-base font-black active:scale-95", saveState === "success" && "bg-green-600 hover:bg-green-600")}>
            {saveState === "saving" ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Guardando...</> :
              saveState === "success" ? <><CheckCircle2 className="h-5 w-5 mr-2" /> ¡Guardada!</> :
                <><CheckCircle2 className="h-5 w-5 mr-2" /> Confirmar y Guardar</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getStatusConfig = (s?: string) => {
  if (s === "approved") return { color: "bg-green-500/10 text-green-500", icon: <CheckCircle2 className="w-3 h-3 mr-1" />, label: "Aprobado" };
  if (s === "improve") return { color: "bg-red-500/10 text-red-500", icon: <AlertCircle className="w-3 h-3 mr-1" />, label: "Corregir" };
  if (s === "reviewed") return { color: "bg-blue-500/10 text-blue-500", icon: <Info className="w-3 h-3 mr-1" />, label: "Revisado" };
  return { color: "bg-yellow-500/10 text-yellow-600", icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />, label: "En revisión" };
};

export default function TasksPage() {
  const { tasks, isTasksLoading, toggleTaskCompletion, uploads, uploadVideo, user } = useAppState();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [tab, setTab] = useState<TabView>("tasks");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleToggle = async (id: string) => {
    if (toggling) return;
    setToggling(id);
    try { await toggleTaskCompletion(id); } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setToggling(null); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast({ variant: "destructive", title: "Solo videos" }); return; }
    if (file.size > 100 * 1024 * 1024) { toast({ variant: "destructive", title: "Máx 100MB" }); return; }
    try { setIsUploading(true); setUploadName(file.name); await uploadVideo(file); toast({ title: "¡Video subido!" }); }
    catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setIsUploading(false); setUploadName(""); if (fileRef.current) fileRef.current.value = ""; }
  };

  const pending = (tasks || []).filter(t => !t.done);
  const done = (tasks || []).filter(t => t.done);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 max-w-6xl mx-auto w-full">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Centro de Entrenamiento</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">Gestiona tus prácticas y evidencias en un solo lugar.</p>
        </div>
        <div className="flex gap-2 bg-muted/30 p-1 rounded-2xl">
          <button onClick={() => setTab("tasks")} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", tab === "tasks" ? "bg-primary text-black shadow-lg" : "text-muted-foreground hover:text-foreground")}>
            <ClipboardList className="h-4 w-4" /> Prácticas
          </button>
          <button onClick={() => setTab("videos")} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", tab === "videos" ? "bg-primary text-black shadow-lg" : "text-muted-foreground hover:text-foreground")}>
            <Film className="h-4 w-4" /> Videos
          </button>
        </div>
      </div>

      {/* TAB: PRÁCTICAS */}
      {tab === "tasks" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-medium">{pending.length} pendientes · {done.length} completadas</p>
            <AddTaskDialog onTaskAdded={() => {}} />
          </div>

          {isTasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}
            </div>
          ) : (tasks || []).length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-primary/20">
              <Sparkles className="mx-auto h-10 w-10 text-primary/30 mb-3" />
              <p className="font-bold text-muted-foreground">Aún no tienes tareas. ¡Crea tu primera práctica!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pending.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-primary/60">Pendientes</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                      {pending.map(t => (
                        <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => handleToggle(t.id)}
                          className="group flex items-center p-4 rounded-2xl border border-primary/10 bg-card hover:border-primary/40 hover:shadow-md active:scale-[0.98] cursor-pointer select-none transition-all">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0 bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            {toggling === t.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <ListPlus className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold whitespace-normal break-words leading-tight text-white">{t.label}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Pendiente</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {done.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/50">Completadas</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                      {done.map(t => (
                        <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => handleToggle(t.id)}
                          className="group flex items-center p-4 rounded-2xl border border-primary/5 bg-muted/30 opacity-60 cursor-pointer select-none transition-all">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0 bg-green-500/20 text-green-500">
                            {toggling === t.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold whitespace-normal break-words leading-tight line-through text-muted-foreground">{t.label}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">✓ Completado</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB: VIDEOS */}
      {tab === "videos" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-medium">{(uploads || []).length} evidencias enviadas</p>
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5 gap-2" disabled={isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Subir Video
            </Button>
            <input type="file" ref={fileRef} className="hidden" accept="video/*" onChange={handleUpload} />
          </div>

          {isUploading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="font-bold text-sm">Subiendo {uploadName}...</p>
            </motion.div>
          )}

          {uploads && uploads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploads.map(u => {
                const sc = getStatusConfig(u.status);
                return (
                  <Dialog key={u.id}>
                    <DialogTrigger asChild>
                      <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="group p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl cursor-pointer hover:border-primary/40 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-primary" /> {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Hoy"}
                            </p>
                            <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors mt-0.5 truncate max-w-[200px]">{u.name}</h4>
                          </div>
                          <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-none ring-1 ring-white/10", sc.color)}>{sc.icon}{sc.label}</Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-1 mt-4">
                          {[{ l: "Obed.", v: u.feedback_detail?.obediencia || 0 }, 
                            { l: "Vínc.", v: u.feedback_detail?.vinculo || 0 }, 
                            { l: "Foco", v: u.feedback_detail?.foco || 0 }, 
                            { l: "Cont.", v: u.feedback_detail?.control || 0 }, 
                            { l: "Calma", v: u.feedback_detail?.calma || 0 }].map(m => (
                            <div key={m.l} className="space-y-1">
                              <div className="flex justify-between text-[7px] font-black uppercase text-muted-foreground"><span>{m.l}</span></div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${m.v}%` }} /></div>
                              <p className="text-[8px] font-black text-primary text-center">{m.v}%</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="w-[98vw] sm:max-w-3xl p-0 overflow-hidden bg-black border-white/10 rounded-[2rem] max-h-[90vh] flex flex-col">
                      <div className="flex flex-col md:grid md:grid-cols-2 h-full overflow-hidden">
                        <div className="h-52 md:h-auto flex items-center justify-center bg-black border-b border-white/5 md:border-none">
                          <video src={u.url} controls playsInline className="max-h-full max-w-full" autoPlay />
                        </div>
                        <div className="flex flex-col overflow-hidden bg-card">
                          <DialogHeader className="p-5 border-b bg-muted/10 shrink-0">
                            <Badge variant="outline" className={cn("w-fit text-[9px] font-black uppercase border-none mb-2", sc.color)}>{sc.icon}{sc.label}</Badge>
                            <DialogTitle className="text-base font-extrabold">{u.name}</DialogTitle>
                            <DialogDescription className="text-[10px]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}</DialogDescription>
                          </DialogHeader>
                          <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5" /> Evaluación</h4>
                            {u.feedback_detail ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                                  <Avatar className="h-8 w-8"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.feedback_detail.evaluatorName || "trainer"}`} /><AvatarFallback>RE</AvatarFallback></Avatar>
                                  <div><p className="text-xs font-bold">{u.feedback_detail.evaluatorName || "Especialista"}</p><p className="text-[9px] font-black uppercase text-primary/70">{u.feedback_detail.evaluatorRole || "Tutor"}</p></div>
                                </div>
                                {u.feedback_detail.comments && <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm italic font-bold relative"><Quote className="h-5 w-5 text-primary/20 absolute -top-2 -left-1" />"{u.feedback_detail.comments}"</div>}
                                <div className="grid grid-cols-5 gap-2">
                                  {[
                                    { l: "OBED", v: u.feedback_detail.obediencia, i: <Shield className="h-3 w-3" /> }, 
                                    { l: "VÍNC", v: u.feedback_detail.vinculo, i: <Heart className="h-3 w-3" /> }, 
                                    { l: "FOCO", v: u.feedback_detail.foco, i: <Compass className="h-3 w-3" /> }, 
                                    { l: "CONT", v: u.feedback_detail.control, i: <Activity className="h-3 w-3" /> }, 
                                    { l: "CALM", v: u.feedback_detail.calma, i: <Flame className="h-3 w-3" /> }
                                  ].map(m => (
                                    <div key={m.l} className="p-2 bg-white/[0.02] rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                                      <div className="flex justify-center mb-1 text-primary">{m.i}</div>
                                      <p className="text-sm font-black text-primary leading-none">{m.v}%</p>
                                      <p className="text-[7px] font-black uppercase text-muted-foreground mt-1">{m.l}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : <div className="text-center py-8 opacity-40"><Info className="h-8 w-8 mx-auto mb-2" /><p className="text-xs font-black uppercase">Sin revisión aún</p></div>}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-[3rem] bg-muted/5 border-primary/20">
              <Video className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-black text-xl mb-2 text-white">Aún no hay evidencias</h3>
              <Button className="mt-4 rounded-full px-10" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Seleccionar Video</Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
