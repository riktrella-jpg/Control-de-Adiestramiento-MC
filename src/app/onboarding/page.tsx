"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/app-state-provider";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Camera, PawPrint, Heart, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, pets, markOnboardingComplete, updateUserProfile, addPet, updateCarnetInfo, updateDogPhoto } = useAppState();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.user_metadata?.full_name || "");
  const [comorbidities, setComorbidities] = useState<string[]>([]);
  
  const [dogName, setDogName] = useState(userProfile?.dogName || user?.user_metadata?.dog_name || "");
  const [dogBreed, setDogBreed] = useState("");
  const [dogParticularities, setDogParticularities] = useState("");
  const [dogPhotoFile, setDogPhotoFile] = useState<File | null>(null);
  const [dogPhotoPreview, setDogPhotoPreview] = useState<string | null>(null);

  const [birthDate, setBirthDate] = useState("");
  const [vaccineDate, setVaccineDate] = useState("");
  const [dewormingDate, setDewormingDate] = useState("");
  const [isSterilized, setIsSterilized] = useState<"yes" | "no" | "">("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDogPhotoFile(file);
      setDogPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Update User Profile
      await updateUserProfile({
        displayName,
        comorbidities,
        dogName
      });

      // 2. Manage Pet Data
      let petId = pets.length > 0 ? pets[0].id : null;
      if (!petId) {
        // If they don't have a pet yet, create it
        const newPet = await addPet(dogName, dogBreed);
        petId = newPet.id;
      }

      // 3. Update Pet Info
      if (petId) {
        await updateCarnetInfo(petId, {
          name: dogName,
          breed: dogBreed,
          particularities: dogParticularities,
          birth_date: birthDate || undefined,
          vaccine_date: vaccineDate || undefined,
          deworming_date: dewormingDate || undefined,
          is_sterilized: isSterilized === "yes"
        });

        if (dogPhotoFile) {
          await updateDogPhoto(dogPhotoFile, petId);
        }
      }

      // 4. Mark Onboarding as Complete
      await markOnboardingComplete();

      // Ensure state propagates and then redirect
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
      
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Stepper */}
      <div className="pt-12 px-6 max-w-md mx-auto w-full z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-white/10"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Paso {step} de 4
          </span>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[450px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: GUÍA */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black mb-2 tracking-tight">Bienvenido a la Manada</h1>
                  <p className="text-white/60 text-sm">Queremos conocerte mejor para personalizar tu experiencia.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/50">Tu Nombre</Label>
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/5 border-white/10 h-14 rounded-2xl text-lg font-bold focus:border-primary/50 focus:ring-primary/20"
                      placeholder="Ej. Ricardo"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/50">¿Tienes algún padecimiento? (Opcional)</Label>
                    <p className="text-xs text-white/40 mb-3">La IA adaptará el tono y los planes según tus necesidades.</p>
                    <div className="flex flex-wrap gap-2">
                      {["TEPT", "Ansiedad", "Fobias", "Depresión", "TEA"].map((item) => (
                        <div
                          key={item}
                          className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            comorbidities.includes(item) 
                              ? "bg-primary/20 border-primary text-primary" 
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                          onClick={() => {
                            setComorbidities(prev => 
                              prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                            );
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Button 
                    onClick={handleNext} 
                    disabled={!displayName.trim()}
                    className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-wider hover:bg-primary/90 transition-all text-sm"
                  >
                    Siguiente <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PERRO */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black mb-2 tracking-tight">Tu Mejor Amigo</h1>
                  <p className="text-white/60 text-sm">Hablemos del protagonista de este viaje.</p>
                </div>

                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Avatar className="h-28 w-28 ring-4 ring-primary/20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <AvatarImage src={dogPhotoPreview || userProfile?.dogPhotoURL} className="object-cover" />
                      <AvatarFallback className="text-3xl bg-white/5 text-primary">
                        {dogName ? dogName[0].toUpperCase() : <PawPrint className="h-10 w-10 opacity-50" />}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/50">Nombre de tu perro</Label>
                    <Input 
                      value={dogName} 
                      onChange={(e) => setDogName(e.target.value)}
                      className="bg-white/5 border-white/10 h-14 rounded-2xl text-lg font-bold focus:border-primary/50 focus:ring-primary/20"
                      placeholder="Ej. Haku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/50">Raza o Cruza (Opcional)</Label>
                    <Input 
                      value={dogBreed} 
                      onChange={(e) => setDogBreed(e.target.value)}
                      className="bg-white/5 border-white/10 h-12 rounded-2xl font-bold focus:border-primary/50 focus:ring-primary/20"
                      placeholder="Ej. Golden Retriever"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/50">¿Alguna particularidad? (Opcional)</Label>
                    <Textarea 
                      value={dogParticularities} 
                      onChange={(e) => setDogParticularities(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-2xl font-medium focus:border-primary/50 focus:ring-primary/20 resize-none"
                      placeholder="Ej. Le teme a los truenos, alergia al pollo, etc."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handlePrev} variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 shrink-0">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!dogName.trim()}
                    className="flex-1 h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-wider hover:bg-primary/90 transition-all text-sm"
                  >
                    Siguiente <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SALUD */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black mb-2 tracking-tight">Carnet Digital</h1>
                  <p className="text-white/60 text-sm">Registra la información médica de {dogName || "tu perro"}. (Puedes omitirlo por ahora)</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/50">Fecha de Nacimiento</Label>
                    <Input 
                      type="date"
                      value={birthDate} 
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="bg-white/5 border-white/10 h-14 rounded-2xl font-bold focus:border-primary/50 focus:ring-primary/20 [color-scheme:dark]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/50">Última Vacuna</Label>
                      <Input 
                        type="date"
                        value={vaccineDate} 
                        onChange={(e) => setVaccineDate(e.target.value)}
                        className="bg-white/5 border-white/10 h-12 rounded-xl font-bold text-sm [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/50">Última Desparasitación</Label>
                      <Input 
                        type="date"
                        value={dewormingDate} 
                        onChange={(e) => setDewormingDate(e.target.value)}
                        className="bg-white/5 border-white/10 h-12 rounded-xl font-bold text-sm [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/50">¿Está esterilizado?</Label>
                    <div className="flex gap-3">
                      <div 
                        onClick={() => setIsSterilized("yes")}
                        className={`flex-1 flex items-center justify-center h-12 rounded-xl cursor-pointer font-bold transition-all border ${isSterilized === "yes" ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/10 text-white/50"}`}
                      >
                        Sí
                      </div>
                      <div 
                        onClick={() => setIsSterilized("no")}
                        className={`flex-1 flex items-center justify-center h-12 rounded-xl cursor-pointer font-bold transition-all border ${isSterilized === "no" ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/10 text-white/50"}`}
                      >
                        No
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-8">
                  <Button onClick={handlePrev} variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 shrink-0">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="flex-1 h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-wider hover:bg-primary/90 transition-all text-sm"
                  >
                    Completar Perfil <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 flex flex-col items-center text-center justify-center py-10">
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-4 border-2 border-primary/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight text-primary">¡Todo listo, {displayName.split(" ")[0]}!</h1>
                  <p className="text-white/70 text-base max-w-[280px] mx-auto">
                    El perfil de {dogName} ha sido creado con éxito. Prepárate para iniciar el método MANADA.
                  </p>
                </div>

                <div className="pt-6 w-full">
                  <Button 
                    onClick={handleComplete} 
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-wider hover:bg-primary/90 transition-all text-sm"
                  >
                    {loading ? "Preparando portal..." : "Ingresar a mi Portal"}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
