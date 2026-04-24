"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Star, TrendingUp, Zap } from "lucide-react"
import { useAppState } from "@/context/app-state-provider"

const data = [
  { day: "Lun", value: 45 },
  { day: "Mar", value: 52 },
  { day: "Mié", value: 48 },
  { day: "Jue", value: 61 },
  { day: "Vie", value: 55 },
  { day: "Sáb", value: 67 },
  { day: "Dom", value: 60 },
]

export function PerformanceChartsCard({ className }: { className?: string }) {
  const { progress } = useAppState();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Pulso de Entrenamiento
          </CardTitle>
          <CardDescription>Visualiza el nivel de compromiso semanal con tu manada.</CardDescription>
        </div>
        <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">
          <TrendingUp className="h-3 w-3 mr-1" /> +12% vs sem pasada
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex flex-col justify-between py-2">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Progreso Global</span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-primary leading-none">{progress}%</span>
                  <Zap className="h-4 w-4 text-primary fill-primary mb-1 animate-pulse" />
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">Engagement</span>
                  </div>
                  <span className="text-xs font-bold">Excelente</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium">Consistencia</span>
                  </div>
                  <span className="text-xs font-bold">L-M-X-V</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
