"use client";

import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Dog, WandSparkles, ListOrdered } from "lucide-react";
import { useCollection, WithId } from "@/hooks/use-collection";
import { useAppState } from "@/context/app-state-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanHistoryItem {
  id: string;
  dogDescription: string;
  dogName?: string;
  createdAt: string;
  focusAreas: string[];
  analysis: string;
  plan_steps?: any[];
  user_id: string;
}

const PlanHistorySkeleton = () => (
  <div className="grid gap-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  </div>
);


export default function PlannerHistoryPage() {
  const { user } = useAppState();

  const { data: plans, isLoading } = useCollection<PlanHistoryItem>(
    user ? "plan_history" : null,
    [{ column: "user_id", operator: "eq", value: user?.id }],
    { column: "createdAt", ascending: false }
  );

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "Fecha no disponible";
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr]">
        <Sidebar className="hidden border-e bg-card lg:block" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Historial de Planes</h1>
                <p className="text-muted-foreground">Aquí puedes consultar todas las rutas de aprendizaje que has generado con el Asistente de IA.</p>
              </div>
              
              {isLoading && <PlanHistorySkeleton />}

              {!isLoading && plans && plans.length > 0 && (
                <div className="grid gap-6">
                  {plans.map((plan: WithId<PlanHistoryItem>) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              Plan de Entrenamiento
                            </CardTitle>
                            <CardDescription className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="flex items-center gap-1.5">
                                <Dog className="h-4 w-4" />
                                {plan.dogName || 'Tu Perro'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDate(plan.createdAt)}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end max-w-xs">
                            {plan.focusAreas?.map((area: string) => <Badge key={area} variant="secondary">{area}</Badge>)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Situación:</p>
                          <p className="text-sm text-muted-foreground italic">&quot;{plan.dogDescription}&quot;</p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-foreground">Análisis MANADA:</p>
                          <p className="text-sm text-muted-foreground">{plan.analysis}</p>
                        </div>

                        {plan.plan_steps && plan.plan_steps.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <ListOrdered className="h-4 w-4 text-primary" />
                              Ejercicios Recomendados:
                            </p>
                            <div className="space-y-3">
                              {plan.plan_steps.map((step: any) => (
                                <div key={step.step} className="bg-accent/30 rounded-lg p-3 border border-border/50">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Paso {step.step}</span>
                                    <Badge variant="outline" className="text-[10px] h-5">{step.duration}</Badge>
                                  </div>
                                  <p className="text-sm font-bold text-foreground mb-1">{step.title}</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
               {!isLoading && (!plans || plans.length === 0) && (
                 <div className="text-center text-muted-foreground py-16 px-4 border-2 border-dashed rounded-lg">
                    <WandSparkles className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-semibold">No has generado ningún plan todavía.</p>
                    <p className="text-sm">Ve al Dashboard para crear tu primera ruta de aprendizaje con IA.</p>
                 </div>
               )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}