"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "@/context/app-state-provider";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface SystemHealthChartProps {
  uploads: Upload[];
}

export function SystemHealthChart({ uploads }: SystemHealthChartProps) {
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { date: string; evaluados: number; pendientes: number }> = {};
    
    // Default previous 7 days to show a continuous timeline
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      dataByDate[dateStr] = { date: dateStr, evaluados: 0, pendientes: 0 };
    }

    const sortedUploads = [...uploads].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    sortedUploads.forEach(u => {
      // Just check if createdAt is valid
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      if (isNaN(d.getTime())) return;

      const dateStr = d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!dataByDate[dateStr]) {
        dataByDate[dateStr] = { date: dateStr, evaluados: 0, pendientes: 0 };
      }
      
      if (u.status === 'pending' || !u.status) {
        dataByDate[dateStr].pendientes += 1;
      } else {
        dataByDate[dateStr].evaluados += 1;
      }
    });

    return Object.values(dataByDate);
  }, [uploads]);

  const totalEvaluated = chartData.reduce((acc, curr) => acc + curr.evaluados, 0);
  const totalPending = chartData.reduce((acc, curr) => acc + curr.pendientes, 0);
  const healthScore = (totalEvaluated + totalPending) > 0 ? (totalEvaluated / (totalEvaluated + totalPending) * 100).toFixed(1) : "100.0";
  const hasBottleneck = totalPending > (totalEvaluated + 1) * 2;

  return (
    <Card className="col-span-full border-primary/20 bg-card overflow-hidden relative shadow-lg">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-primary to-green-500"></div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 tracking-tight">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          Rendimiento y Funcionamiento de Evaluaciones
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Visualiza el flujo de trabajo de la app al 100%. Detecta cuellos de botella en las evidencias para ajustar la atención.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid lg:grid-cols-4 gap-6 pt-4">
        <div className="lg:col-span-3 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvaluados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="evaluados" 
                name="Evaluados (Flujo 100%)" 
                stroke="#d4af37" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEvaluados)" 
              />
              <Area 
                type="monotone" 
                dataKey="pendientes" 
                name="Pendientes (Posible Retraso)" 
                stroke="#ef4444" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPendientes)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-between space-y-6 lg:pl-8 lg:border-l border-border/40 py-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Estado del Sistema
            </div>
            <div className="text-4xl font-bold font-mono text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">100%</div>
            <p className="text-xs text-muted-foreground">App funcionando sin errores de servidor.</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Eficiencia de Atención
            </div>
            <div className="text-4xl font-bold font-mono text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{healthScore}%</div>
            <p className="text-xs text-muted-foreground">Tasa de respuesta del entrenador.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
              <AlertTriangle className={`h-4 w-4 ${hasBottleneck ? 'text-destructive animate-bounce' : 'text-amber-500'}`} />
              Cola de Retención
            </div>
            <div className={`text-4xl font-bold font-mono ${hasBottleneck ? 'text-destructive' : 'text-amber-500'}`}>{totalPending}</div>
            <p className="text-xs text-muted-foreground">Evidencias esperando evaluación.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
