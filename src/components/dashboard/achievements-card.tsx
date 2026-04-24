import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";
import { Trophy, Star, Shield, Flame, Activity } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export function AchievementsCard({ className }: { className?: string }) {
  const { achievements } = useAppState();

  const completedCount = achievements.filter(a => a.completed).length;
  
  // Dynamic stats based on completed achievements (simulated power levels)
  const powerStats = [
    { subject: 'Vínculo', A: 50 + (completedCount * 8), fullMark: 100 },
    { subject: 'Foco', A: 40 + (completedCount * 10), fullMark: 100 },
    { subject: 'Calma', A: 60 + (completedCount * 5), fullMark: 100 },
    { subject: 'Control', A: 30 + (completedCount * 12), fullMark: 100 },
    { subject: 'Obediencia', A: 45 + (completedCount * 9), fullMark: 100 },
  ];

  return (
    <Card className={cn("overflow-hidden border-primary/10 shadow-2xl bg-black/60 backdrop-blur-3xl relative", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight uppercase flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Nivel de Manada
            </CardTitle>
            <CardDescription className="font-medium text-xs text-primary/60 tracking-widest uppercase">
              Rendimiento y Condecoraciones
            </CardDescription>
          </div>
          <div className="text-right">
             <div className="text-2xl font-black text-white">{completedCount}<span className="text-sm text-muted-foreground">/{achievements.length}</span></div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 relative z-10 space-y-6">
        
        {/* Radar Chart Section */}
        <div className="h-[200px] w-full bg-white/[0.02] rounded-2xl border border-white/5 p-2 relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={powerStats}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }} />
              <Radar name="Binomio" dataKey="A" stroke="#d4af37" strokeWidth={2} fill="#d4af37" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Achievements List */}
        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <TooltipProvider>
            {achievements.map((achievement, idx) => (
              <motion.div 
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 relative group overflow-hidden border",
                      achievement.completed 
                        ? "bg-gradient-to-r from-primary/10 to-transparent border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]" 
                        : "bg-black/40 border-white/5 grayscale opacity-60 hover:opacity-100"
                    )}>
                      {/* Shine Effect */}
                      {achievement.completed && (
                         <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shine" />
                      )}
                      
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 shadow-inner relative z-10",
                        achievement.completed ? "bg-primary/20 ring-1 ring-primary/50" : "bg-white/5"
                      )}>
                        <achievement.icon className={cn(
                          "h-6 w-6 transition-all duration-500",
                          achievement.completed ? "text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] scale-110" : "text-muted-foreground/50"
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className={cn(
                          "font-black text-[11px] uppercase tracking-widest mb-0.5 transition-colors",
                          achievement.completed ? "text-white" : "text-muted-foreground"
                        )}>
                          {achievement.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1 italic">
                          {achievement.description}
                        </p>
                      </div>

                      {achievement.completed && (
                        <Star className="h-4 w-4 text-primary fill-primary animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {!achievement.completed && (
                    <TooltipContent className="bg-black/90 backdrop-blur-xl text-white font-bold border border-white/10 shadow-2xl rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Misión Bloqueada</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </motion.div>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
