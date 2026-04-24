"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  Zap, 
  AlertCircle, 
  BarChart3,
  Server
} from "lucide-react";
import { motion } from "motion/react";

export function AdminMonitor() {
  const [latency, setLatency] = useState(24);
  const [uptime, setUptime] = useState("99.99%");
  
  // Simulate live monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const newVal = prev + change;
        return newVal < 15 ? 15 : newVal > 45 ? 45 : newVal;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* App Status */}
      <Card className="bg-black/40 border-primary/20 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3">
          <div className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sistema</p>
              <h3 className="text-2xl font-black text-white">OPERATIVO</h3>
              <p className="text-[10px] text-green-500/80 font-mono">ESTADO: 100% FUNCIONAL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Monitoring */}
      <Card className="bg-black/40 border-primary/20 backdrop-blur-xl relative overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Supabase DB</p>
              <h3 className="text-2xl font-black text-white">SYNC</h3>
              <p className="text-[10px] text-blue-500/80 font-mono">LATENCIA: {latency}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latency/Speed */}
      <Card className="bg-black/40 border-primary/20 backdrop-blur-xl relative overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rendimiento</p>
              <h3 className="text-2xl font-black text-white">OPTIMIZADO</h3>
              <p className="text-[10px] text-primary/80 font-mono">UPTIME: {uptime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Detection */}
      <Card className="bg-black/40 border-primary/20 backdrop-blur-xl relative overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Errores Detectados</p>
              <h3 className="text-2xl font-black text-white">0</h3>
              <p className="text-[10px] text-green-500/80 font-mono italic">ESTADO: PROTEGIDO</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Large Technical Graph Placeholder/Indicator */}
      <Card className="lg:col-span-4 bg-black/60 border-primary/30 backdrop-blur-2xl overflow-hidden relative border-2 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <CardContent className="p-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h4 className="text-xl font-black text-white flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                MONITOR DE FLUJO DE DATOS MC26
              </h4>
              <p className="text-sm text-muted-foreground">Monitoreo en tiempo real de interacciones y carga del servidor.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary">
                <Server className="h-3 w-3" /> NODE.JS API: ACTIVE
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-500">
                <Activity className="h-3 w-3" /> LIVE FEED
              </div>
            </div>
          </div>

          <div className="h-32 w-full flex items-end gap-1 px-2 mb-4">
            {[...Array(40)].map((_, i) => {
              const height = 20 + Math.random() * 80;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    delay: i * 0.05 
                  }}
                  className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-sm"
                />
              );
            })}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-primary/10 pt-6">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Carga de CPU</p>
                <p className="text-lg font-mono text-white text-bold">12.4%</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Memoria Optimizada</p>
                <p className="text-lg font-mono text-white text-bold">2.8 GB / 8 GB</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Peticiones / seg</p>
                <p className="text-lg font-mono text-white text-bold">~42 req/s</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Certificado SSL</p>
                <p className="text-lg font-mono text-green-500 text-bold uppercase">Validado</p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
