import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AchievementsCard({ className }: { className?: string }) {
  const { achievements } = useAppState();

  return (
    <Card className={cn("overflow-hidden border-primary/5 shadow-xl", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight">Logros MANADA</CardTitle>
            <CardDescription className="font-medium text-xs">Exhibición de tus grandes hazañas.</CardDescription>
          </div>
          <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="grid grid-cols-1 gap-4">
          <TooltipProvider>
            {achievements.map((achievement, idx) => (
              <motion.div 
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 relative group",
                      achievement.completed 
                        ? "bg-primary/5 border border-primary/20 shadow-sm" 
                        : "bg-muted/30 border border-transparent grayscale opacity-50"
                    )}>
                      {achievement.completed && (
                        <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 shadow-inner rotate-3 group-hover:rotate-0",
                        achievement.completed ? "bg-primary/20 scale-110" : "bg-accent/40"
                      )}>
                        <achievement.icon className={cn(
                          "h-6 w-6 transition-all duration-500",
                          achievement.completed ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "text-muted-foreground/50"
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className={cn(
                          "font-black text-xs uppercase tracking-wider mb-0.5 transition-colors",
                          achievement.completed ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {achievement.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 italic font-medium">
                          {achievement.description}
                        </p>
                      </div>

                      {achievement.completed && (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {!achievement.completed && (
                    <TooltipContent className="bg-muted text-muted-foreground font-bold border-none shadow-xl">
                      <p className="text-[10px] uppercase tracking-widest">Sigue entrenando para desbloquear</p>
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
