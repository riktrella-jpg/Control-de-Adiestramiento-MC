"use client";

import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { useAppState } from "@/context/app-state-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Award, Lightbulb } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const trainingTips = [
    { icon: Lightbulb, tip: "¡La constancia es clave! Practica en sesiones cortas y frecuentes de 5-10 minutos." },
    { icon: Award, tip: "Usa refuerzo positivo. ¡Celebra cada pequeño logro con premios y caricias!" },
    { icon: CheckCircle, tip: "Termina siempre cada sesión de entrenamiento con una nota positiva y un ejercicio que tu perro domine." },
];

export default function ProgressPage() {
    const { modules } = useAppState();

    const chartData = modules.map(module => {
        const completed = module.weeks.filter(week => week.completed).length;
        const total = module.weeks.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        return {
            name: `Módulo ${module.moduleNumber}`,
            progreso: Math.round(percentage),
        };
    });
    
    const COLORS = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
        "hsl(var(--primary))",
    ];

    return (
        <SidebarProvider>
            <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr]">
                <Sidebar className="hidden border-e bg-card lg:block" collapsible="icon">
                    <SidebarNav />
                </Sidebar>
                <div className="flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="grid gap-6 md:grid-cols-2">
                             <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Progreso por Módulo</CardTitle>
                                    <CardDescription>Visualiza el avance en cada sección del programa MANADA.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--background))",
                                                    borderColor: "hsl(var(--border))",
                                                    borderRadius: "var(--radius)",
                                                }}
                                                formatter={(value, name) => [`${value}%`, name]}
                                            />
                                            <Legend
                                              iconSize={10}
                                              layout="vertical"
                                              verticalAlign="middle"
                                              align="right"
                                              wrapperStyle={{
                                                color: "hsl(var(--muted-foreground))",
                                                fontSize: '12px'
                                              }}
                                            />
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="progreso"
                                                nameKey="name"
                                            >
                                                {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Consejos de Entrenamiento</CardTitle>
                                    <CardDescription>Pequeños recordatorios para un gran éxito.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {trainingTips.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <item.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                            <p className="text-muted-foreground">{item.tip}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
