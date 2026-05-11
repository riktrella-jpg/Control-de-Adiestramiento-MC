"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Star, Video, ArrowRight, Target, Zap, Clock, Quote, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/app-state-provider";

// --- UTILS ---
const getFocusIcon = (taskName: string) => {
    const name = (taskName || "").toLowerCase();
    if (name.includes('ladrid') || name.includes('bark')) return '/focus/barking.png';
    if (name.includes('correa') || name.includes('leash')) return '/focus/leash.png';
    if (name.includes('ansiedad') || name.includes('anxiety')) return '/focus/anxiety.png';
    if (name.includes('miedo') || name.includes('fear') || name.includes('fobia')) return '/focus/fear.png';
    if (name.includes('obed') || name.includes('basic') || name.includes('sentado') || name.includes('quieto')) return '/focus/obedience.png';
    if (name.includes('destruc')) return '/focus/destruction.png';
    if (name.includes('agres')) return '/focus/aggression.png';
    if (name.includes('protección') || name.includes('recurso') || name.includes('guard')) return '/focus/guarding.png';
    if (name.includes('reactiv')) return '/focus/reactivity.png';
    if (name.includes('hiper')) return '/focus/hyperactivity.png';
    if (name.includes('timid') || name.includes('shy')) return '/focus/shyness.png';
    if (name.includes('atención') || name.includes('attention')) return '/focus/attention.png';
    return '/focus/generic.png';
};

type EvaluationStatus = 'excellent' | 'approved' | 'needs_improvement' | 'pending';


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
        default:
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
    const { uploads, selectedPet } = useAppState();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const safeUploads = uploads || [];
    const approvedCount = safeUploads.filter(u => u.status === 'approved').length;
    const totalCount = Math.max(1, safeUploads.length);
    const approvalRate = Math.round((approvedCount / totalCount) * 100);

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 w-full">
            
            {/* Header Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                    Centro de Retroalimentación
                </h1>
                <p className="text-muted-foreground text-lg font-medium opacity-80">
                    Aquí encontrarás las evaluaciones de tus tutores. Cada comentario es un paso más hacia el éxito con {selectedPet?.name || 'tu mascota'}.
                </p>
            </div>

            {/* Global Progress Summary */}
            <Card className="bg-primary/5 border-primary/20 rounded-[2rem] overflow-hidden">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0 relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
                            <circle 
                                cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                strokeDasharray="226" 
                                strokeDashoffset={`${226 - (226 * (approvalRate / 100))}`} 
                                className="text-primary transition-all duration-1000" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black text-primary">{approvalRate}%</span>
                        </div>
                    </div>
                    <div className="space-y-1 flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-black uppercase text-white">Tasa de Aprobación</h3>
                        <p className="text-sm font-medium text-muted-foreground">Tienes {approvedCount} videos aprobados de {safeUploads.length} subidos en total.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline / Feed */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {safeUploads.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-[3rem] border-white/5 bg-white/[0.02]">
                        <Video className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">Aún no hay videos subidos para revisar.</p>
                    </div>
                ) : (
                    safeUploads.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((sub, index) => (
                        <motion.div 
                            key={sub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-primary/20 text-primary shadow-xl shadow-primary/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Video className="w-4 h-4" />
                            </div>
                            <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] shadow-2xl transition-all border-white/5 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden group/card relative hover:border-primary/30">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-20 transition-opacity w-24 h-24">
                                    <Image src={getFocusIcon(sub.name)} alt="focus" fill className="grayscale object-contain" />
                                </div>
                                <CardHeader className="pb-3 relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <StatusBadge status={sub.status as any || 'pending'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                                            <Clock className="w-3 h-3 mr-1 text-primary" />
                                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Hoy'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover/card:border-primary/50 transition-colors relative">
                                            <Image src={getFocusIcon(sub.name)} alt={sub.name} fill className="object-contain p-2" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-tighter text-white leading-tight">{sub.name}</CardTitle>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-1">Evidencia Técnica</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                {(sub.feedback || sub.feedback_detail) ? (
                                    <CardContent className="space-y-5 relative z-10">
                                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.feedback_detail?.evaluatorName || "Ricardo"}`} />
                                                    <AvatarFallback className="bg-primary/20 text-primary font-black">{(sub.feedback_detail?.evaluatorName?.[0] || 'R').toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-white">{sub.feedback_detail?.evaluatorName || "Ricardo Estrella"}</p>
                                                    <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mt-0.5">{sub.feedback_detail?.evaluatorRole || "Lead Trainer"}</p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Quote className="h-8 w-8 text-primary/10 absolute -top-2 -left-2" />
                                                <p className="text-sm font-bold leading-relaxed text-slate-300 relative pl-4 border-l-2 border-primary/20">
                                                    {sub.feedback || sub.feedback_detail?.comments}
                                                </p>
                                            </div>
                                        </div>

                                        {sub.feedback_detail && (
                                            <div className="grid grid-cols-3 gap-4 py-2 border-t border-white/5 pt-4">
                                                <MetricBar label="Foco" value={sub.feedback_detail.foco || 0} icon={Target} />
                                                <MetricBar label="Timing" value={sub.feedback_detail.timing || 0} icon={Zap} />
                                                <MetricBar label="Técnica" value={sub.feedback_detail.tecnica || 0} icon={Star} />
                                            </div>
                                        )}

                                        {sub.feedback_detail?.nextSteps && sub.feedback_detail.nextSteps.length > 0 && (
                                            <div className="space-y-3 pt-4 border-t border-white/5">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center">
                                                    <ArrowRight className="w-3 h-3 mr-2" /> 
                                                    Plan de Acción
                                                </h4>
                                                <ul className="space-y-2">
                                                    {sub.feedback_detail.nextSteps.map((item: string, i: number) => (
                                                        <li key={i} className="text-xs font-bold text-slate-400 flex items-start gap-3 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary shrink-0 font-black">{i+1}</div>
                                                            <span className="pt-0.5">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                ) : (
                                    <CardContent>
                                        <div className="p-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                                            <Loader2 className="w-8 h-8 text-primary/30 mx-auto mb-3 animate-spin" />
                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground italic">Video en espera de revisión profesional.</p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

        </div>
    );
}
