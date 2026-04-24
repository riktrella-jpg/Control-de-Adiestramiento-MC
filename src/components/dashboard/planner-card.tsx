
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { WandSparkles, Lightbulb, Dog, ListOrdered, Sparkles, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useAppState } from "@/context/app-state-provider";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/supabase/client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Groq from "groq-sdk";



// Types moved here from the flow file
export type GeneratePlanInput = z.infer<typeof planSchema>;

export type GeneratePlanOutput = {
    analysis: string;
    focusAreas: string[];
    planSteps: {
        step: number;
        title: string;
        description: string;
        duration: string;
    }[];
    proTip: string;
};

const planSchema = z.object({
    mainProblem: z.string().min(1, "Debes seleccionar un problema."),
    context: z.string().min(1, "Debes seleccionar dónde ocurre."),
    dogInfo: z.string().min(1, "Debes describir a tu perro."),
    details: z.string().min(1, "Por favor, da más detalles de la situación.")
});

async function callGroq(input: GeneratePlanInput & { dogName?: string, ownerName?: string }): Promise<GeneratePlanOutput> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clave de API de Groq no encontrada. Por favor, añádela en tu archivo .env.local como NEXT_PUBLIC_GROQ_API_KEY."
    );
  }

  const groq = new Groq({ 
    apiKey, 
    dangerouslyAllowBrowser: true // Necessary for client-side API calls in dev
  });

  const prompt = `
    Eres un experto entrenador de perros y asistente virtual para "MANADA Club", especializado en el "método MANADA". Tu tono debe ser alentador, empático y profesional.

    El método MANADA se basa en 6 pilares fundamentales:
    1. Mindfulness: Estar presente y consciente del estado emocional del perro y del tuyo propio.
    2. Apego Seguro: Construir un vínculo sólido basado en la confianza y la comunicación.
    3. Normas: Establecer reglas claras y consistentes.
    4. Autocontrol: Enseñar al perro a gestionar sus impulsos.
    5. Desensibilización: Exponer gradualmente al perro a sus miedos de manera controlada.
    6. Adaptación: Ayudar al perro a generalizar el buen comportamiento a diferentes entornos.

    Un usuario, ${input.ownerName || 'Dueño'}, necesita un plan de entrenamiento personalizado para su perro, ${input.dogName || 'su perro'}.
    
    **Aquí está la información estructurada que proporcionó:**
    - **Problema Principal:** ${input.mainProblem}
    - **Contexto:** ${input.context}
    - **Información del Perro:** ${input.dogInfo}
    - **Situación Detallada:** "${input.details}"

    **Tu Tarea:**
    Utilizando toda la información proporcionada, crea un plan de entrenamiento paso a paso estructurado, práctico y altamente personalizado siguiendo el método MANADA.

    1. Análisis: Analiza brevemente la situación desde la perspectiva del método MANADA. Conecta la descripción detallada del usuario con los 6 pilares. ¿Qué pilares son más relevantes aquí y por qué?
    2. Áreas de Enfoque: Identifica los 2 o 3 pilares principales del método MANADA en los que centrarse. Estos deben abordar directamente el 'Problema Principal' y el 'Contexto'.
    3. Pasos del Plan: Proporciona un plan concreto, paso a paso. Cada paso debe ser un ejercicio práctico con un título y una duración/frecuencia recomendada. Las instrucciones deben ser muy claras y fáciles de seguir para un dueño novato. Adapta los ejercicios a la 'Información del Perro' (ej: sesiones más cortas para un cachorro, enfoques diferentes para un perro con mucha energía).
    4. Consejo Pro: Ofrece un "consejo pro" final y alentador que se alinee con la filosofía MANADA y sea directamente relevante para el problema específico del usuario.

    Genera la respuesta estrictamente en formato JSON con la siguiente estructura:
    {
      "analysis": "string",
      "focusAreas": ["string"],
      "planSteps": [
        { "step": number, "title": "string", "description": "string", "duration": "string" }
      ],
      "proTip": "string"
    }
  `;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Eres un experto entrenador de perros. Responde siempre en formato JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("El modelo de IA no devolvió un plan válido.");
  }

  try {
    return JSON.parse(content) as GeneratePlanOutput;
  } catch (e) {
    throw new Error("Error al procesar la respuesta de la IA.");
  }
}

function PlanResult({ result }: { result: GeneratePlanOutput }) {
    const [feedback, setFeedback] = useState<{ rating: 'up' | 'down' | null, comment: string }>({ rating: null, comment: '' });
    const [submitted, setSubmitted] = useState(false);

    const supabase = createClient();
    const { user } = useUser();

    const handleFeedback = async () => {
        if (!user || !feedback.rating) return;
        
        try {
            await supabase.from('ai_feedback').insert({
                user_id: user.id,
                rating: feedback.rating,
                comment: feedback.comment || "",
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Error saving feedback:", error);
            // Even if it fails, we show the thanks message to the user for UX
            setSubmitted(true);
        }
    };

    return (
        <div className="mt-6 space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-bold">Análisis de la Situación</AlertTitle>
                <AlertDescription className="text-foreground/90 italic">&quot;{result.analysis}&quot;</AlertDescription>
            </Alert>

            <div className="space-y-3">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Áreas de Enfoque MANADA
                </h4>
                <div className="flex flex-wrap gap-2">
                    {result.focusAreas.map((area) => (
                        <Badge key={area} variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-none hover:bg-primary/20 transition-colors">
                            {area}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-primary"/> 
                    Plan de Acción Paso a Paso
                </h4>
                <div className="grid gap-4">
                    {result.planSteps.map((step) => (
                        <div key={step.step} className="p-5 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                    {step.step}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-foreground">{step.title}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                    <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md w-fit">
                                        <WandSparkles className="h-3 w-3" />
                                        Duración: {step.duration}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Alert className="bg-secondary/20 border-secondary/30">
                <Dog className="h-4 w-4 text-secondary-foreground" />
                <AlertTitle className="font-bold">Consejo del Entrenador</AlertTitle>
                <AlertDescription className="text-foreground/90">{result.proTip}</AlertDescription>
            </Alert>

            {/* Feedback Section */}
            <Card className="border-dashed bg-muted/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        ¿Te ha sido útil este plan?
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Tu opinión nos ayuda a mejorar las recomendaciones de la IA.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!submitted ? (
                        <>
                            <div className="flex gap-4">
                                <Button 
                                    variant={feedback.rating === 'up' ? "default" : "outline"} 
                                    size="sm" 
                                    className="flex-1 gap-2"
                                    onClick={() => setFeedback(prev => ({ ...prev, rating: 'up' }))}
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    Útil
                                </Button>
                                <Button 
                                    variant={feedback.rating === 'down' ? "destructive" : "outline"} 
                                    size="sm" 
                                    className="flex-1 gap-2"
                                    onClick={() => setFeedback(prev => ({ ...prev, rating: 'down' }))}
                                >
                                    <ThumbsDown className="h-4 w-4" />
                                    No mucho
                                </Button>
                            </div>
                            <Textarea 
                                placeholder="¿Algún comentario adicional?" 
                                className="text-xs min-h-[60px]"
                                value={feedback.comment}
                                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                            />
                            <Button 
                                className="w-full text-xs h-8" 
                                disabled={!feedback.rating}
                                onClick={handleFeedback}
                            >
                                Enviar Retroalimentación
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-4 space-y-2">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <ThumbsUp className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-bold text-foreground">¡Gracias por tu feedback!</p>
                            <p className="text-xs text-muted-foreground">Lo usaremos para mejorar tus futuros planes.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="mt-6 space-y-6 animate-pulse">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles className="h-5 w-5 text-primary animate-bounce" />
                <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-primary">El Asistente MANADA está analizando tu caso...</p>
                    <Skeleton className="h-2 w-full bg-primary/20" />
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-20 w-full" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>

                <div className="space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-lg border border-dashed flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function PlannerCard({ className }: { className?: string }) {
  const { selectedPet, userProfile, user } = useAppState();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratePlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
        mainProblem: "",
        context: "",
        dogInfo: "",
        details: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof planSchema>) => {
    if (!user || !selectedPet) {
      toast({ variant: "destructive", title: "Debes seleccionar un binomio para generar un plan." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
        const input = {
            ...values,
            dogName: selectedPet.name,
            ownerName: userProfile?.displayName || "Entrenador",
        };

      // 1. Get detailed training plan
      const planResult = await callGroq(input);
      setResult(planResult);

      // 2. Save to Supabase
      await supabase.from('plan_history').insert({
          analysis: planResult.analysis,
          focusAreas: planResult.focusAreas,
          plan_steps: planResult.planSteps,
          dogDescription: input.details,
          dogName: selectedPet.name,
          pet_id: selectedPet.id,
          user_id: user.id
      });

      toast({
        title: "¡Plan Generado!",
        description: `Tu ruta para ${selectedPet.name} está lista.`,
      });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al generar el plan",
        description: error.message || "No se pudo conectar con el asistente de IA.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("border-white/5 bg-black/40 backdrop-blur-xl rounded-[2.5rem]", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter text-white">
             <WandSparkles className="h-6 w-6 text-primary" />
             Diagnóstico IA: {selectedPet?.name || "Binomio"}
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">
            Inteligencia Canina Personalizada MC26
          </CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">¿Cuál es el foco hoy?</Label>
                        <FormField
                            control={form.control}
                            name="mainProblem"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'Bark', label: 'Ladridos', icon: '🐕' },
                                            { id: 'Leash', label: 'Tira Correa', icon: '🦮' },
                                            { id: 'Anxiety', label: 'Ansiedad', icon: '🏠' },
                                            { id: 'Fear', label: 'Miedo/Fobia', icon: '😨' },
                                            { id: 'Basics', label: 'Obediencia', icon: '🎾' },
                                            { id: 'Destructive', label: 'Destrucción', icon: '🧹' },
                                        ].map((opt) => (
                                            <div 
                                                key={opt.id}
                                                onClick={() => field.onChange(opt.label)}
                                                className={cn(
                                                    "cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2",
                                                    field.value === opt.label ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                                                )}
                                            >
                                                <span className="text-2xl">{opt.icon}</span>
                                                <span className="text-[9px] font-black uppercase tracking-tighter leading-tight">{opt.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Escenario de la situación</Label>
                        <FormField
                            control={form.control}
                            name="context"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            'Durante los paseos',
                                            'Solo en casa',
                                            'Con las visitas',
                                            'Lugares desconocidos',
                                            'En todo momento'
                                        ].map((ctx) => (
                                            <div 
                                                key={ctx}
                                                onClick={() => field.onChange(ctx)}
                                                className={cn(
                                                    "cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-3",
                                                    field.value === ctx ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                                                )}
                                            >
                                                <div className={cn("h-4 w-4 rounded-full border-2", field.value === ctx ? "border-primary bg-primary" : "border-white/20")} />
                                                <span className="text-xs font-bold text-white/80">{ctx}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-2">
                        <FormField
                            control={form.control}
                            name="dogInfo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Observaciones breves</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Ej: Golden de 2 años, muy activo." 
                                            className="h-12 rounded-xl bg-white/5 border-white/10 font-bold"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="details"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Situación Detallada (El Por Qué)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Cuéntanos exactamente qué sucede..."
                                            className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 font-medium resize-none shadow-inner"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {loading && <LoadingSkeleton />}
                    {result && <PlanResult result={result} />}
                    
                </CardContent>
                <CardFooter className="pb-8">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <WandSparkles className="mr-2 h-5 w-5" />
                        {loading ? "Sincronizando con la IA..." : "Forjar Plan de Entrenamiento"}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}

    