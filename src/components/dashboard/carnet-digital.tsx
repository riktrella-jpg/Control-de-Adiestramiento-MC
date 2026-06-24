"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/app-state-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, Syringe, CalendarDays, Bug, Save, AlertTriangle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, differenceInMonths, differenceInYears, isValid, parseISO } from "date-fns";

export function CarnetDigital() {
  const { selectedPet, updateCarnetInfo } = useAppState();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    birth_date: "",
    deworming_date: "",
    vaccine_date: "",
    particularities: ""
  });

  useEffect(() => {
    if (selectedPet) {
      setFormData({
        birth_date: selectedPet.birth_date || "",
        deworming_date: selectedPet.deworming_date || "",
        vaccine_date: selectedPet.vaccine_date || "",
        particularities: selectedPet.particularities || ""
      });
    }
  }, [selectedPet]);

  if (!selectedPet) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCarnetInfo(selectedPet.id, formData);
      toast({ title: "Carnet Actualizado", description: "La información médica ha sido guardada." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper para alertas de salud
  const getHealthStatus = () => {
    const today = new Date();
    let alerts = [];

    if (formData.deworming_date) {
        const dewormDate = parseISO(formData.deworming_date);
        if (isValid(dewormDate)) {
            const monthsSince = differenceInMonths(today, dewormDate);
            if (monthsSince >= 3) {
                alerts.push({ type: "warning", message: `Han pasado ${monthsSince} meses desde la última desparasitación.` });
            }
        }
    }

    if (formData.vaccine_date) {
        const vaxDate = parseISO(formData.vaccine_date);
        if (isValid(vaxDate)) {
            const yearsSince = differenceInYears(today, vaxDate);
            if (yearsSince >= 1) {
                alerts.push({ type: "danger", message: `¡Atención! Vacuna anual expirada.` });
            } else if (differenceInMonths(today, vaxDate) >= 11) {
                alerts.push({ type: "warning", message: `Pronto tocará refuerzo de vacuna anual.` });
            }
        }
    }

    return alerts;
  };

  const alerts = getHealthStatus();

  return (
    <Card className="border-white/10 shadow-2xl bg-black/40 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-50 pointer-events-none" />
      <CardHeader className="border-b border-white/10 pb-4 bg-white/5 backdrop-blur-sm z-10 relative">
        <CardTitle className="text-sm font-black flex items-center gap-2 tracking-widest uppercase text-[#d4af37]">
          <Stethoscope className="h-5 w-5" />
          Carnet de Salud Digital
        </CardTitle>
        <CardDescription className="text-xs text-white/50">
          Mantén al día el registro de {selectedPet.name}. Te avisaremos si necesita refuerzos.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-5 space-y-6 relative z-10">
        {/* Health Alerts */}
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${alert.type === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium">Esquema de prevención al día.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs text-white/60 flex items-center gap-2 uppercase tracking-wider font-bold">
              <CalendarDays className="h-3 w-3" /> Fecha de Nacimiento
            </Label>
            <Input 
              type="date" 
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/60 flex items-center gap-2 uppercase tracking-wider font-bold">
              <Syringe className="h-3 w-3" /> Última Vacuna
            </Label>
            <Input 
              type="date" 
              name="vaccine_date"
              value={formData.vaccine_date}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/60 flex items-center gap-2 uppercase tracking-wider font-bold">
              <Bug className="h-3 w-3" /> Última Desparasitación
            </Label>
            <Input 
              type="date" 
              name="deworming_date"
              value={formData.deworming_date}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs text-white/60 flex items-center gap-2 uppercase tracking-wider font-bold">
              Particularidades / Alergias
            </Label>
            <Textarea 
              name="particularities"
              value={formData.particularities}
              onChange={handleChange}
              placeholder="Ej: Alergia al pollo, displasia leve, miedo a truenos..."
              className="bg-white/5 border-white/10 text-white resize-none h-24"
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-[#d4af37] to-[#aa8529] hover:opacity-90 text-black font-black uppercase tracking-widest text-xs h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          {isSaving ? "Guardando..." : "Guardar Carnet Digital"} <Save className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
