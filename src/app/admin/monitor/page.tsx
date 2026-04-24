"use client";

import { useCollection } from "@/hooks/use-collection";
import { Upload } from "@/context/app-state-provider";
import { 
  Loader2, Bell, Zap 
} from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminMonitor } from "@/components/dashboard/admin-monitor";

const SystemHealthChart = dynamic(
  () => import("@/components/dashboard/system-health-chart").then(mod => mod.SystemHealthChart), 
  { ssr: false }
);

export default function MonitoringCenter() {
  const { data: allUploads, isLoading } = useCollection<Upload>("uploads");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 md:px-6">
      {/* 2026 HERO HEADER */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-75 transition-all" />
        <div className="relative bg-black/60 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 overflow-hidden">
             {/* Background decorative elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40">
                    <Zap className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase font-black text-[10px] tracking-widest px-3 py-1">
                    System Live 2.0
                  </Badge>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                  Centro de <span className="text-primary">Monitoreo</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl font-medium">
                  Diagnóstico en tiempo real del ecosistema MC26. Supervisión de integridad de datos, latencia de red y flujo de evidencias.
                </p>
             </div>

             <div className="relative z-10 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md min-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Global Status</span>
                  <div className="flex h-3 w-3 rounded-full bg-green-500 animate-ping" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white flex items-center gap-2 italic">API Cluster</span>
                    <span className="text-xs font-black text-green-500">NORTH_AMERICA_01</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white flex items-center gap-2 italic">CDN Edge</span>
                    <span className="text-xs font-black text-green-500">ACTIVE_CACHED</span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-muted-foreground">Uptime 2026</span>
                       <span className="text-xs font-black text-white font-mono">99.999%</span>
                    </div>
                  </div>
                </div>
             </div>
        </div>
      </div>

      {/* ADVANCED METRICS (Integrated Component) */}
      <AdminMonitor />

      {/* LOGS AND CHARTS SECTION */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-black/40 border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-2xl border-2">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row justify-between items-center">
             <div>
                <CardTitle className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                  Flujo de Evaluaciones (7 Días)
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Sincronización por hora de evidencias técnicas.</p>
             </div>
             <Badge className="bg-primary/10 text-primary border-primary/20">LIVE_DATA</Badge>
          </CardHeader>
          <CardContent className="p-8">
             <div className="h-[350px] w-full">
                <SystemHealthChart uploads={allUploads || []} />
             </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-2xl border-2">
           <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> Log de Sistema
                </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <div className="flex flex-col">
                 {[
                  { time: '10:42', msg: 'Backup Supabase completado', type: 'success' },
                  { time: '09:15', msg: 'Revisión técnica enviada', type: 'info' },
                  { time: '08:00', msg: 'Reinicio de caché global exitoso', type: 'success' },
                  { time: '07:30', msg: 'Detección de nuevo registro manual', type: 'info' },
                  { time: '05:12', msg: 'Limpieza de logs temporales', type: 'info' }
                 ].map((log, i) => (
                   <div key={i} className="flex items-start gap-4 p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-mono font-black text-muted-foreground pt-1">{log.time}</span>
                      <div>
                        <p className="text-xs font-bold text-white mb-0.5">{log.msg}</p>
                        <div className="flex items-center gap-1">
                           <div className={`h-1 w-1 rounded-full ${log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                           <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{log.type}</span>
                        </div>
                      </div>
                   </div>
                 ))}
                 <div className="p-6 text-center">
                    <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline transition-all">Ver Historial Completo</button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* FOOTER PULSE */}
      <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 flex items-center justify-center">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] italic">
            MC26 IA STUDIO — Ecosistema de Entrenamiento Blindado v2.0.4
          </p>
      </div>
    </div>
  );
}
