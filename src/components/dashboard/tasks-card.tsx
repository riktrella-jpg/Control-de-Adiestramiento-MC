"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";

import { Video, ExternalLink } from "lucide-react";

export function TasksCard({ className }: { className?: string }) {
    const { tasks, toggleTaskCompletion, uploads } = useAppState();

    const formatSize = (bytes?: number) => {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Tareas Pendientes</CardTitle>
          <CardDescription>¡Manos a la obra!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <Checkbox id={task.id} checked={task.done} onCheckedChange={() => toggleTaskCompletion(task.id)} />
                  <Label htmlFor={task.id} className={`flex-1 text-sm ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.label}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tienes tareas pendientes.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
