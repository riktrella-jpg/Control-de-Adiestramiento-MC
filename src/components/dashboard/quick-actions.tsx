"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Upload,
  GraduationCap,
  Sparkles,
  Users,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/context/app-state-provider";
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

type ActionCardProps = {
  href?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
  index: number;
};

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  color,
  bgColor,
  onClick,
  index,
}: ActionCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: 0.1 + index * 0.07,
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      whileTap={{ scale: 0.94 }}
      className="flex flex-col h-full gap-3 p-4 rounded-[1.5rem] w-full text-left relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        minHeight: "110px",
      }}
    >
      {/* Subtle colored corner glow */}
      <div
        className="absolute top-0 right-0 h-16 w-16 rounded-bl-full opacity-20"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />

      {/* Icon */}
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl shrink-0"
        style={{ background: bgColor }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      {/* Text */}
      <div className="space-y-0.5">
        <p className="text-sm font-black text-white leading-tight">{title}</p>
        <p className="text-[10px] text-white/40 font-medium leading-snug">
          {description}
        </p>
      </div>
    </motion.div>
  );

  const commonClass = "block w-full cursor-pointer";

  if (href) {
    return (
      <Link href={href} className={commonClass}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={commonClass}>
      {content}
    </button>
  );
}

export function QuickActions({ className }: { className?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, dismiss } = useToast();
  const { user, uploadVideo } = useAppState();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: "Selecciona un video (MP4, MOV, etc.).",
      });
      return;
    }

    const MAX_SIZE_MB = 100;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: `Máximo ${MAX_SIZE_MB}MB.`,
      });
      return;
    }

    const validateVideo = (videoFile: File): Promise<{ isValid: boolean; error?: string }> => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 300) {
            resolve({ isValid: false, error: `Máximo 5 minutos.` });
            return;
          }
          resolve({ isValid: true });
        };
        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          resolve({ isValid: false, error: "Archivo de video corrupto." });
        };
        video.src = URL.createObjectURL(videoFile);
      });
    };

    const validationResult = await validateVideo(file);
    if (!validationResult.isValid) {
      toast({
        variant: "destructive",
        title: "Video no válido",
        description: validationResult.error,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Inicia sesión primero",
      });
      return;
    }

    const { id: toastId, update: updateToast } = toast({
      title: "Subiendo video...",
      description: `Preparando "${file.name}"`,
    });

    try {
      updateToast({ title: "Subiendo...", description: "Por favor espera..." });
      await uploadVideo(file);
      dismiss(toastId);
      toast({ title: "✅ Subida completada", description: `"${file.name}" listo.` });
    } catch (error: any) {
      dismiss(toastId);
      toast({
        variant: "destructive",
        title: "Error al subir",
        description: error.message,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const actions: Omit<ActionCardProps, "index">[] = [
    {
      icon: Upload,
      title: "Entregar Tarea",
      description: "Sube tu video de práctica",
      color: "#D4AF37",
      bgColor: "rgba(212,175,55,0.1)",
      onClick: handleUploadClick,
    },
    {
      href: "/dashboard/calificaciones",
      icon: GraduationCap,
      title: "Calificaciones",
      description: "Feedback de tus tutores",
      color: "#D4AF37",
      bgColor: "rgba(212,175,55,0.1)",
    },
    {
      href: "/dashboard/planner",
      icon: Sparkles,
      title: "Planificador IA",
      description: "Genera tu plan MANADA",
      color: "#D4AF37",
      bgColor: "rgba(212,175,55,0.1)",
    },
    {
      href: "https://www.facebook.com",
      icon: Users,
      title: "Comunidad",
      description: "Comparte tu progreso",
      color: "#D4AF37",
      bgColor: "rgba(212,175,55,0.1)",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 px-1">
        <div
          className="h-3 w-0.5 rounded-full"
          style={{ background: "#D4AF37" }}
        />
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
          Acciones Rápidas
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <ActionCard key={action.title} {...action} index={index} />
        ))}
      </div>

      <Input
        id="task-upload"
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="video/mp4,video/quicktime,video/x-m4v,video/*,image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
