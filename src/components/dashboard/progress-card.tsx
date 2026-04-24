
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";

export function ProgressCard({ className }: { className?: string }) {
  const { progress } = useAppState();

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Progreso Total</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            {progress}%
          </Badge>
        </div>
        <CardDescription>Tu camino hacia una manada equilibrada.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progress === 100 ? "¡Felicidades! Has completado el programa." : `${100 - progress}% para completar`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
