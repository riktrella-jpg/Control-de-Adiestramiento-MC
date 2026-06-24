"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  WandSparkles,
  Lightbulb,
  Dog,
  ListOrdered,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  intensity: z.string().min(1, "Selecciona la intensidad."),
  dogInfo: z.string().min(1, "Debes describir a tu perro."),
  details: z.string().min(1, "Por favor, da más detalles de la situación."),
  comorbidities: z.array(z.string()).optional(),
});

async function callGroq(input: GeneratePlanInput & { dogName?: string; ownerName?: string }): Promise<GeneratePlanOutput> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clave de API de Groq no encontrada. Por favor, añádela en tu archivo .env.local como NEXT_PUBLIC_GROQ_API_KEY."
    );
  }

  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
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

    Un usuario, ${input.ownerName || "Dueño"}, necesita un plan de entrenamiento personalizado para su perro, ${input.dogName || "su perro"}.
    
    **Aquí está la información estructurada que proporcionó:**
    - **Problema Principal:** ${input.mainProblem}
    - **Contexto/Escenario:** ${input.context}
    - **Intensidad/Urgencia:** ${input.intensity}
    - **Perfil del Perro:** ${input.dogInfo}
    - **Comorbilidades del Guía:** ${input.comorbidities?.join(", ") || "Ninguna especificada"}
    - **Situación Detallada (El Por Qué):** "${input.details}"

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
        content: "Eres un experto entrenador de perros. Responde siempre en formato JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
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
  const [feedback, setFeedback] = useState<{ rating: "up" | "down" | null; comment: string }>({
    rating: null,
    comment: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();
  const { user } = useUser();

  const handleFeedback = async () => {
    if (!user || !feedback.rating) return;

    try {
      await supabase.from("ai_feedback").insert({
        user_id: user.id,
        rating: feedback.rating,
        comment: feedback.comment || "",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error saving feedback:", error);
      setSubmitted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-6 space-y-6 overflow-hidden"
    >
      <div
        className="p-4 rounded-2xl"
        style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4" style={{ color: "#D4AF37" }} />
          <h4 className="font-bold text-sm" style={{ color: "#D4AF37" }}>
            Análisis de la Situación
          </h4>
        </div>
        <p className="text-sm italic text-white/70 leading-relaxed">"{result.analysis}"</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Áreas de Enfoque MANADA
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.focusAreas.map((area) => (
            <Badge
              key={area}
              className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border-none hover:bg-emerald-500/20 transition-colors"
            >
              {area}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-emerald-400" />
          Plan de Acción Paso a Paso
        </h4>
        <div className="grid gap-3">
          {result.planSteps.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                  style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}
                >
                  {step.step}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-white leading-tight">{step.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{step.description}</p>
                  <div
                    className="flex items-center gap-1 mt-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit"
                    style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37" }}
                  >
                    <WandSparkles className="h-3 w-3" />
                    Duración: {step.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-2xl"
        style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Dog className="h-4 w-4" style={{ color: "#D4AF37" }} />
          <h4 className="font-bold text-sm" style={{ color: "#D4AF37" }}>
            Consejo del Entrenador
          </h4>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{result.proTip}</p>
      </div>

      {/* Feedback Section */}
      <div
        className="p-4 rounded-2xl text-center space-y-4"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}
      >
        {!submitted ? (
          <>
            <h4 className="text-sm font-bold flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              ¿Te ha sido útil este plan?
            </h4>
            <div className="flex gap-2">
              <button
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all ${
                  feedback.rating === "up" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/60"
                }`}
                onClick={() => setFeedback((prev) => ({ ...prev, rating: "up" }))}
              >
                <ThumbsUp className="h-3.5 w-3.5" /> Útil
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all ${
                  feedback.rating === "down" ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/60"
                }`}
                onClick={() => setFeedback((prev) => ({ ...prev, rating: "down" }))}
              >
                <ThumbsDown className="h-3.5 w-3.5" /> No mucho
              </button>
            </div>
            <Textarea
              placeholder="¿Algún comentario adicional?"
              className="text-xs min-h-[60px] rounded-xl bg-black/20 border-white/10 resize-none"
              value={feedback.comment}
              onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
            />
            <button
              disabled={!feedback.rating}
              onClick={handleFeedback}
              className="w-full h-10 rounded-xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-wider disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30"
            >
              Enviar Feedback
            </button>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-2 py-2"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-bold">¡Gracias por tu feedback!</p>
            <p className="text-[10px] text-white/40">Lo usaremos para mejorar tus futuros planes.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
        <Sparkles className="h-5 w-5 text-emerald-400 animate-bounce" />
        <div className="space-y-2 flex-1">
          <p className="text-xs font-medium text-emerald-400">El Asistente MANADA está analizando tu caso...</p>
          <div className="h-1.5 w-full bg-emerald-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-1/2 animate-[shimmer_1s_infinite]" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 w-32 bg-white/5 rounded-full" />
        <div className="h-24 w-full bg-white/5 rounded-2xl" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-40 bg-white/5 rounded-full" />
        <div className="flex gap-2">
          <div className="h-6 w-24 rounded-full bg-white/5" />
          <div className="h-6 w-28 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
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
      intensity: "Moderada",
      dogInfo: "",
      details: "",
      comorbidities: userProfile?.comorbidities || [],
    },
  });

  useEffect(() => {
    if (userProfile?.comorbidities && userProfile.comorbidities.length > 0) {
      form.setValue("comorbidities", userProfile.comorbidities);
    }
  }, [userProfile?.comorbidities, form]);

  const onSubmit = async (values: z.infer<typeof planSchema>) => {
    if (!user || !selectedPet) {
      toast({ variant: "destructive", title: "Selecciona un binomio primero." });
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

      const planResult = await callGroq(input);
      setResult(planResult);

      await supabase.from("plan_history").insert({
        analysis: planResult.analysis,
        focusAreas: planResult.focusAreas,
        plan_steps: planResult.planSteps,
        dogDescription: input.details,
        dogName: selectedPet.name,
        pet_id: selectedPet.id,
        user_id: user.id,
      });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al generar el plan",
        description: error.message || "No se pudo conectar con la IA.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn("rounded-[2rem] overflow-hidden", className)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-white">
          <WandSparkles className="h-5 w-5" style={{ color: "#D4AF37" }} />
          Diagnóstico IA: {selectedPet?.name || "Binomio"}
        </h2>
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: "#D4AF37" }}>
          Asistencia Inteligente MC26
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 space-y-6">
          
          {/* Main Problem */}
          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">
              ¿Cuál es el foco hoy?
            </Label>
            <FormField
              control={form.control}
              name="mainProblem"
              render={({ field }) => (
                <FormItem>
                    <div className="flex overflow-x-auto scrollbar-hide pb-2 gap-2 -mx-5 px-5">
                      {[
                        { id: "Bark", label: "Ladridos", icon: "/focus/barking.png" },
                        { id: "Leash", label: "Tira Correa", icon: "/focus/leash.png" },
                        { id: "Anxiety", label: "Ansiedad", icon: "/focus/anxiety.png" },
                        { id: "Fear", label: "Miedos", icon: "/focus/fear.png" },
                        { id: "Basics", label: "Obediencia", icon: "/focus/obedience.png" },
                        { id: "Destructive", label: "Destrucción", icon: "/focus/destruction.png" },
                        { id: "Aggression", label: "Agresividad", icon: "/focus/aggression.png" },
                        { id: "Guarding", label: "Protección Recursos", icon: "/focus/guarding.png" },
                        { id: "Reactivity", label: "Reactividad", icon: "/focus/reactivity.png" },
                        { id: "Hyper", label: "Hiperactividad", icon: "/focus/hyperactivity.png" },
                        { id: "Shy", label: "Timidez", icon: "/focus/shyness.png" },
                        { id: "Attention", label: "Busca Atención", icon: "/focus/attention.png" },
                      ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => field.onChange(opt.label)}
                        className="cursor-pointer rounded-[1.2rem] flex flex-col items-center gap-2 flex-shrink-0 transition-all press-effect"
                        style={{
                          width: "80px",
                          background: field.value === opt.label ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.03)",
                          border: field.value === opt.label ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.05)",
                          padding: "8px",
                        }}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden relative">
                          <Image
                            src={opt.icon}
                            alt={opt.label}
                            fill
                            className="object-cover filter-vintage-art"
                            unoptimized
                          />
                        </div>
                        <span className="text-[9px] font-bold text-center leading-tight line-clamp-1">
                          {opt.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Context & Intensity Row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5 block">
                    Escenario
                  </Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/10 text-xs font-bold">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black/95 border-white/10 text-white rounded-xl">
                      <SelectItem value="Casa / Hogar">Casa / Hogar</SelectItem>
                      <SelectItem value="Parque o Jardín">Parque o Jardín</SelectItem>
                      <SelectItem value="Paseo en la calle">Paseo en la calle</SelectItem>
                      <SelectItem value="Transporte público">Transporte público</SelectItem>
                      <SelectItem value="Vehículo particular">Vehículo particular</SelectItem>
                      <SelectItem value="Clínica veterinaria">Clínica veterinaria</SelectItem>
                      <SelectItem value="Multitudes / Espacio lleno">Multitudes / Espacio lleno</SelectItem>
                      <SelectItem value="Visitas en casa">Visitas en casa</SelectItem>
                      <SelectItem value="Lugares desconocidos">Lugares desconocidos</SelectItem>
                      <SelectItem value="Aire libre / Excursión">Aire libre / Excursión</SelectItem>
                      <SelectItem value="Entorno laboral">Entorno laboral</SelectItem>
                      <SelectItem value="Eventos sociales">Eventos sociales</SelectItem>
                      <SelectItem value="Emergencias / Ruidos">Emergencias / Ruidos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intensity"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5 block">
                    Intensidad
                  </Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/10 text-xs font-bold">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black/95 border-white/10 text-white rounded-xl">
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Moderada">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Comorbidities */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="comorbidities"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                    Tipo de Trastorno del Guía (Opcional)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["TEPT", "Ansiedad", "Fobias", "Depresión", "TEA"].map((item) => (
                      <div
                        key={item}
                        className={cn(
                          "cursor-pointer px-3 py-1.5 rounded-xl border transition-all text-[10px] font-bold",
                          field.value?.includes(item)
                            ? "border-[#D4AF37] bg-[rgba(212,175,55,0.15)] text-[#D4AF37]"
                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                        onClick={() => {
                          const current = field.value || [];
                          if (current.includes(item)) {
                            field.onChange(current.filter((v: string) => v !== item));
                          } else {
                            field.onChange([...current, item]);
                          }
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Details */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                    Situación Detallada
                  </Label>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos exactamente qué sucede..."
                      className="min-h-[80px] rounded-xl bg-white/5 border-white/10 text-xs font-medium resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Hidden but required field with default value for the prompt */}
          <input type="hidden" {...form.register("dogInfo")} value="Sin especificar" />

          {loading && <LoadingSkeleton />}
          {result && <PlanResult result={result} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 transition-all press-effect mt-2"
            style={{
              background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #F5D98B, #D4AF37)",
              color: loading ? "rgba(255,255,255,0.3)" : "black",
              boxShadow: loading ? "none" : "0 8px 20px rgba(212,175,55,0.3)",
            }}
          >
            <WandSparkles className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {loading ? "Sincronizando..." : "Generar Plan"}
            </span>
          </button>
        </form>
      </Form>
    </div>
  );
}
