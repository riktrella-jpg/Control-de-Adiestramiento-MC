import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState } from "@/context/app-state-provider";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function ActiveCoursesCard({ className }: { className?: string }) {
  const { modules } = useAppState();

  const activeCourses = useMemo(() => {
    return modules
      .map(module => {
        const completedWeeks = module.weeks.filter(w => w.completed).length;
        const totalWeeks = module.weeks.length;
        const progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;
        
        const colors = [
          "from-orange-500 to-amber-500",
          "from-emerald-500 to-teal-500",
          "from-blue-500 to-indigo-500",
          "from-purple-500 to-pink-500",
          "from-rose-500 to-red-500",
          "from-cyan-500 to-blue-500",
          "from-primary to-primary/80"
        ];

        return {
          id: module.id,
          title: module.title,
          moduleNumber: module.moduleNumber,
          icon: module.icon,
          progress,
          gradient: colors[(module.moduleNumber - 1) % colors.length],
        };
      })
      .filter(module => module.progress > 0);
  }, [modules]);

  return (
    <Card className={cn("overflow-hidden border-primary/5 shadow-xl", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight">Cursos Activos</CardTitle>
            <CardDescription className="font-medium text-xs">Tu ascenso en el Método MANADA.</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="space-y-4">
          {activeCourses.length > 0 ? (
            activeCourses.map((course, idx) => (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all hover:bg-card hover:shadow-lg active:scale-[0.98] cursor-pointer">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0 bg-gradient-to-br",
                    course.gradient,
                    "opacity-90 group-hover:opacity-100"
                  )}>
                    <span className="drop-shadow-md">{course.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/70 mb-0.5">Módulo {course.moduleNumber}</p>
                        <h4 className="font-bold text-sm truncate leading-tight">{course.title}</h4>
                      </div>
                      <span className="text-xs font-black text-primary ml-2">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className={cn("h-full rounded-full bg-gradient-to-r", course.gradient)}
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 rounded-3xl bg-muted/20 border border-dashed border-primary/10">
              <p className="text-sm font-medium text-muted-foreground italic px-4">Inicia tu primera lección para ver tu ascenso aquí.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
