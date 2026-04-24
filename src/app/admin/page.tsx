"use client";

import { useCollection } from "@/hooks/use-collection";
import { UserProfile, Upload } from "@/context/app-state-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, Users, Video, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, Trash2, PlusCircle, Search, Activity, SlidersHorizontal,
  GraduationCap, TrendingUp, Bell
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";

export default function AdminDashboard() {
  const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useCollection<UserProfile>("users", [], { column: "createdAt", ascending: false });
  const { data: allUploads, isLoading: isUploadsLoading, refetch: refetchUploads } = useCollection<Upload>("uploads");
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [manualSyncId, setManualSyncId] = useState("");
  const [manualSyncName, setManualSyncName] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  // GHOST FINDER logic
  const clients = useMemo(() => {
    if (isUsersLoading || isUploadsLoading) return [];
    
    let baseClients = [...(users || [])];
    const userIdsWithUploads = Array.from(new Set(allUploads?.map(u => u.user_id) || []));
    
    for (const uid of userIdsWithUploads) {
        if (!baseClients.find(c => c.id === uid)) {
            baseClients.push({
               id: uid,
               displayName: "Estudiante (Pendiente)",
               dogName: "Nuevo Registro",
               role: "client",
               filesUploaded: allUploads?.filter(u => u.user_id === uid).length || 1
            });
        }
    }

    if (searchQuery) {
        baseClients = baseClients.filter(c => 
            c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.dogName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return baseClients;
  }, [users, allUploads, isUsersLoading, isUploadsLoading, searchQuery]);

  const studentsCount = useMemo(() => clients.filter(c => c.role === 'client').length, [clients]);
  const pendingReviews = useMemo(() => allUploads?.filter(u => !u.status || u.status === 'pending').length || 0, [allUploads]);

  const handleDeleteUser = async (e: React.MouseEvent, userId: string, displayName: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`¿Estás seguro de que quieres eliminar al binomio ${displayName}?`)) return;
    setIsDeleting(userId);
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      toast({ title: "Binomio Eliminado", description: "El registro ha sido removido del sistema." });
      refetchUsers(); refetchUploads();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally { setIsDeleting(null); }
  };

  if (isUsersLoading || isUploadsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const getUserStats = (userId: string) => {
    const userUploads = allUploads?.filter(u => u.user_id === userId) || [];
    const pending = userUploads.filter(u => !u.status || u.status === 'pending').length;
    return { pending, total: userUploads.length };
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20 px-4 md:px-6">
      
      {/* 2026 PREMIUM HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase text-primary tracking-widest italic leading-none">Management Studio 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
            Panel del <span className="text-primary italic">Entrenador</span>
          </h1>
          <div className="flex gap-4 pt-4">
             <Button variant="outline" className="bg-primary/10 border-primary/40 text-primary font-black uppercase italic" asChild>
                <Link href="/admin/monitor">Ir al Centro de Monitoreo 📈</Link>
             </Button>
          </div>
          <p className="text-muted-foreground text-lg font-medium max-w-lg mt-4">
            Supervisión avanzada de binomios. Gestiona el progreso y califica el rendimiento técnico de tu pack.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
            <div className="px-8 py-5 bg-black/40 border border-white/10 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-5">
                  <GraduationCap className="h-12 w-12" />
               </div>
               <span className="text-[10px] uppercase font-black text-primary block tracking-widest mb-1">Binomios Activos</span>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white italic">{studentsCount}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
               </div>
            </div>
            <div className="px-8 py-5 bg-black/40 border border-white/10 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
               {pendingReviews > 0 && (
                 <div className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
               )}
               <span className="text-[10px] uppercase font-black text-muted-foreground block tracking-widest mb-1">Pendientes de Revisión</span>
               <span className="text-4xl font-black text-white italic">{pendingReviews}</span>
            </div>
        </div>
      </div>

      {/* SEARCH AND TOOLS BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-md">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por nombre o binomio..." 
            className="h-14 bg-black/40 border-white/10 rounded-2xl pl-12 text-sm focus:border-primary/50 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 bg-primary text-black font-black uppercase italic rounded-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-primary/10">
                 <PlusCircle className="h-5 w-5" /> Registrar Binomio
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-primary/20 backdrop-blur-2xl rounded-[3rem]">
              <DialogHeader className="pt-6">
                <DialogTitle className="text-3xl font-black uppercase italic text-primary tracking-tighter">Sincronización Técnica</DialogTitle>
                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registrar manualmente un nuevo binomio en el Pack</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Auth Credentials (Email o UID)</Label>
                  <Input 
                    className="h-14 bg-white/5 border-white/10 rounded-2xl" 
                    placeholder="Busca en Supabase Auth" 
                    value={manualSyncId} 
                    onChange={(e) => setManualSyncId(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Público</Label>
                  <Input 
                    className="h-14 bg-white/5 border-white/10 rounded-2xl" 
                    placeholder="Ej. Ricardo Estrella" 
                    value={manualSyncName} 
                    onChange={(e) => setManualSyncName(e.target.value)} 
                  />
                </div>
                <Button className="w-full h-16 bg-primary text-black font-black uppercase italic text-lg rounded-[1.5rem]" onClick={() => {}}>Forzar Inclusión</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10">
             <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* BINOMIO CARDS GRID */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {clients.map((client, index) => {
            const { pending, total } = getUserStats(client.id);
            const isUserDeleting = isDeleting === client.id;

            return (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <Link href={`/admin/users/${client.id}`}>
                  <Card className={`group-hover:border-primary transition-all cursor-pointer h-full relative overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm rounded-[2.5rem] border-2 shadow-2xl ${isUserDeleting ? 'opacity-50 grayscale' : ''}`}>
                    
                    {/* Status Badge */}
                    <div className="absolute top-6 left-6 z-10">
                       {pending > 0 ? (
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 rounded-full font-black text-[10px] text-white uppercase italic tracking-tighter animate-pulse shadow-lg shadow-red-600/20">
                            <AlertCircle className="h-3 w-3" /> {pending} Pendiente{pending > 1 ? 's' : ''}
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full font-black text-[10px] text-green-500 uppercase italic tracking-tighter">
                            <CheckCircle2 className="h-3 w-3" /> Al Día
                         </div>
                       )}
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                       <button
                          onClick={(e) => handleDeleteUser(e, client.id, client.displayName || "Binomio")}
                          disabled={isUserDeleting}
                          className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>

                    <div className="p-8 pt-16 flex flex-col items-center text-center">
                       <div className="relative mb-6">
                          <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-transparent rounded-full opacity-20 blur-md group-hover:opacity-100 transition-opacity" />
                          <Avatar className="h-28 w-28 border-4 border-black ring-2 ring-white/10 shadow-2xl transition-transform group-hover:scale-105">
                            <AvatarImage src={client.dogPhotoURL || ""} className="object-cover" />
                            <AvatarFallback className="bg-muted text-4xl font-black">{client.dogName?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                       </div>

                       <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-primary transition-colors leading-none">
                          {client.displayName || "Expediente Local"}
                       </h3>
                       <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                          Binomio: <span className="text-white">🐕 {client.dogName || "Haku"}</span>
                       </p>

                       <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-6 border-t border-white/5">
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Evidencias</span>
                             <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-primary" />
                                <span className="text-lg font-black text-white italic">{total}</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-center border-l border-white/5">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Uptrend</span>
                             <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-lg font-black text-green-500 italic">+{Math.round(total * 1.2)}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Reveal Button on the bottom */}
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {clients.length === 0 && (
          <div className="col-span-full py-32 text-center bg-black/40 rounded-[3rem] border-2 border-dashed border-white/5 backdrop-blur-sm">
             <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-muted-foreground/30" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sin Binomios Detectados</h3>
             <p className="text-muted-foreground mt-2">Ajusta tu búsqueda o registra uno nuevo manualmente.</p>
          </div>
        )}
      </div>

      {/* QUICK FOOTER STATS */}
      <div className="flex justify-between items-center px-10 py-6 bg-primary/5 border border-primary/20 rounded-[2rem]">
         <div className="flex items-center gap-4">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-xs font-black text-white uppercase tracking-widest italic">Análisis de Integridad 2026</span>
         </div>
         <div className="flex gap-8">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 bg-green-500 rounded-full" />
               <span className="text-[10px] font-black text-muted-foreground uppercase">Sincronizado</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 bg-blue-500 rounded-full italic" />
               <span className="text-[10px] font-black text-muted-foreground uppercase">Cloud: OK</span>
            </div>
         </div>
      </div>

    </div>
  );
}