"use client";

import { CarnetDigital } from "@/components/dashboard/carnet-digital";

export default function CarnetPage() {
  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
          Carnet Digital
        </h1>
        <p className="text-white/60 text-sm">
          Lleva el control de la salud, vacunas y desparasitación de tu binomio.
        </p>
      </div>

      <CarnetDigital />
    </div>
  );
}
