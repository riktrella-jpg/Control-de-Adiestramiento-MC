"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Star, Video, ArrowRight, Target, Zap, Clock } from "lucide-react";
import { motion } from "motion/react";

// --- MODELO DE DATOS (Ejemplo para Arquitectura) ---
type EvaluationStatus = 'excellent' | 'approved' | 'needs_improvement' | 'pending';

interface FeedbackMetrics {
    focus: number; // 0-100
    timing: number; // 0-100
    technique: number; // 0-100
}

interface Submission {
    id: string;
    taskName: string;
    submittedAt: Date;
    status: EvaluationStatus;
    videoUrl?: string;
    feedback?: {
        trainerName: string;
        trainerAvatar?: string;
        reviewedAt: Date;
        generalComment: string;
        actionableItems: string[];
        metrics?: FeedbackMetrics;
    };
}

// --- DATOS SIMULADOS (Para demostrar la UX/UI) ---
const mockSubmissions: Submission[] = [
    {
        id: "sub-1",
        taskName: "Autocontrol: Esperar la comida",
        submittedAt: new Date('2026-04-03T10:00:00Z'),
        status: 'needs_improvement',
        feedback: {
            trainerName: "Carlos Entrenador",
            trainerAvatar: "https://i.pravatar.cc/150?u=carlos",
            reviewedAt: new Date('2026-04-03T14:00:00Z'),
            generalComment: "¡Van por muy buen camino! Haku tiene la intención correcta, pero se está frustrando un poco al final. Necesitamos ajustar el 'timing' (el momento exacto) en el que le entregas el premio para evitar que rompa la posición antes de tiempo.",
            actionableItems: [
                "Reduce el tiempo de espera a solo 2 segundos antes de premiar.",
                "Asegúrate de decir la palabra liberadora ('¡Ya!') ANTES de mover la mano hacia él.",
                "Si se levanta, retira el plato calmadamente, sin regañar, y vuelve a empezar."
            ],
            metrics: {
                focus: 85,
                timing: 40,
                technique: 70
            }
        }
    },
    {
        id: "sub-2",
        taskName: "Apego Seguro: Llamada en interior",
        submittedAt: new Date('2026-03-30T10:00:00Z'),
        status: 'excellent',
        feedback: {
            trainerName: "Ana Especialista",
            trainerAvatar: "https://i.pravatar.cc/150?u=ana",
            reviewedAt: new Date('2026-03-31T10:00:00Z'),
            generalComment: "¡Ejecución perfecta! Me encantó cómo usaste un tono de voz agudo y motivador. Haku respondió inmediatamente y la entrega del premio fue fluida. Este es el estándar que buscamos.",
            actionableItems: [
                "Mantén esta misma energía.",
                "Siguiente reto: Intenta hacerlo en una habitación diferente para añadir un poco de dificultad."
            ],
            metrics: {
                focus: 95,
                timing: 100,
                technique: 90
            }
        }
    }
];

// --- COMPONENTES AUXILIARES ---

const StatusBadge = ({ status }: { status: EvaluationStatus }) => {
    switch (status) {
        case 'excellent':
            return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200"><Star className="w-3 h-3 mr-1 fill-current" /> Excelente</Badge>;
        case 'approved':
            return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprobado</Badge>;
        case 'needs_improvement':
            return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"><AlertCircle className="w-3 h-3 mr-1" /> Oportunidad de Mejora</Badge>;
        case 'pending':
            return <Badge variant="outline" className="text-muted-foreground"><Clock className="w-3 h-3 mr-1" /> En revisión</Badge>;
    }
};

const MetricBar = ({ label, value, icon: Icon }: { label: string, value: number, icon: any }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center text-muted-foreground"><Icon className="w-3 h-3 mr-1.5" /> {label}</span>
            <span>{value}%</span>
        </div>
        <Progress value={value} className="h-1.5" />
    </div>
);

export default function CalificacionesPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
            
            {/* Header Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Centro de Retroalimentación
                </h1>
                <p className="text-muted-foreground text-lg">
                    Aquí encontrarás las evaluaciones de tus tutores. Cada comentario es un paso más hacia el éxito con Haku.
                </p>
            </div>

            {/* Global Progress Summary (Mock) */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0 relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                            <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset="60" className="text-primary" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold text-primary">75%</span>
                        </div>
                    </div>
                    <div className="space-y-2 flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-semibold">Nivel: Perro Confiable (Fase 2)</h3>
                        <p className="text-sm text-muted-foreground">Has mejorado un 15% en tu &apos;timing&apos; esta semana. ¡Sigue así! La consistencia es la clave.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline / Feed */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {mockSubmissions.map((sub, index) => (
                    <motion.div 
                        key={sub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                        {/* Timeline Dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Video className="w-4 h-4" />
                        </div>
                        
                        {/* Card */}
                        <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <StatusBadge status={sub.status} />
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {sub.submittedAt.toISOString().split('T')[0]}
                                    </span>
                                </div>
                                <CardTitle className="text-lg">{sub.taskName}</CardTitle>
                            </CardHeader>
                            
                            {sub.feedback && (
                                <CardContent className="space-y-4">
                                    {/* Trainer Info & Comment */}
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 border border-border">
                                                <AvatarImage src={sub.feedback.trainerAvatar} />
                                                <AvatarFallback>{sub.feedback.trainerName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{sub.feedback.trainerName}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Tutor Evaluador</p>
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/90">
                                            &quot;{sub.feedback.generalComment}&quot;
                                        </p>
                                    </div>

                                    {/* Metrics (Optional) */}
                                    {sub.feedback.metrics && (
                                        <div className="grid grid-cols-3 gap-4 py-2">
                                            <MetricBar label="Foco" value={sub.feedback.metrics.focus} icon={Target} />
                                            <MetricBar label="Timing" value={sub.feedback.metrics.timing} icon={Zap} />
                                            <MetricBar label="Técnica" value={sub.feedback.metrics.technique} icon={Star} />
                                        </div>
                                    )}

                                    {/* Actionable Items */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                                            <ArrowRight className="w-3 h-3 mr-1 text-primary" /> 
                                            Siguientes Pasos
                                        </h4>
                                        <ul className="space-y-2">
                                            {sub.feedback.actionableItems.map((item, i) => (
                                                <li key={i} className="text-sm flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <span className="text-foreground/80">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
