"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/app-state-provider";
import { X, ChevronRight, LayoutDashboard, BookOpenCheck, Activity, BookOpen, User2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    id: "welcome",
    title: "¡Bienvenido a tu Portal MANADA!",
    description: "Este es tu centro de entrenamiento. Aquí encontrarás todo lo necesario para educar a tu perro con nuestro método. ¿Damos un rápido paseo?",
    icon: Sparkles,
  },
  {
    id: "inicio",
    title: "Inicio",
    description: "Aquí verás un resumen del progreso de tu binomio, tus logros recientes y acceso rápido a tus próximos entrenamientos.",
    icon: LayoutDashboard,
    targetSelector: "a[href='/dashboard']", // Works for sidebar and bottom nav
  },
  {
    id: "cursos",
    title: "Entrenamientos",
    description: "Accede a los 7 módulos del Método MANADA. Aquí encontrarás los videos y ejercicios semana a semana.",
    icon: BookOpenCheck,
    targetSelector: "a[href='/dashboard/courses']",
  },
  {
    id: "carnet",
    title: "Carnet Digital",
    description: "Lleva el control médico de tu perro: vacunas, desparasitaciones y datos de salud importantes.",
    icon: Activity,
    targetSelector: "a[href='/dashboard/carnet']",
  },
  {
    id: "etologia",
    title: "Etología",
    description: "Aprende el porqué del comportamiento canino con nuestra biblioteca de recursos y artículos.",
    icon: BookOpen,
    targetSelector: "a[href='/dashboard/ethology']",
  },
  {
    id: "perfil",
    title: "Perfil",
    description: "Administra la información de tu binomio, logros, configuración y cambia a tu perro activo si tienes más de uno.",
    icon: User2,
    targetSelector: "a[href='/dashboard/profile']",
  },
  {
    id: "chat",
    title: "Asistente MANADA",
    description: "Abre este chat en cualquier momento si tienes dudas. Nuestra IA especializada te guiará 24/7.",
    icon: MessageSquare,
    targetSelector: "#chat-widget-button", // Assumes chat widget has this or we can just point generally to bottom right
  }
];

export function OnboardingTour() {
  const { userProfile, markTourComplete } = useAppState();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if userProfile is loaded and tour is not completed
    if (userProfile && userProfile.tour_completed === false) {
      // Delay slightly so UI can render
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      finishTour();
    }
  };

  const finishTour = async () => {
    setIsVisible(false);
    await markTourComplete();
  };

  if (!isVisible) return null;

  const currentStep = steps[currentStepIndex];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={finishTour}
          />
          
          {/* Tour Modal */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="relative bg-black border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={finishTour}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight">{currentStep.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 py-4">
                {steps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex ? "w-6 bg-primary" : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <div className="w-full pt-2">
                <Button 
                  onClick={handleNext}
                  className="w-full h-12 rounded-xl bg-primary text-black font-black uppercase tracking-wider text-xs hover:bg-primary/90 transition-all"
                >
                  {currentStepIndex === steps.length - 1 ? "Comenzar" : "Siguiente"} <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              {currentStepIndex < steps.length - 1 && (
                <button onClick={finishTour} className="text-[10px] font-bold text-white/30 hover:text-white/70 uppercase tracking-widest mt-2">
                  Saltar tour
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
