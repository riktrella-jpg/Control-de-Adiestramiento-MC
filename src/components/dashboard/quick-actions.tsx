"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookCopy, GraduationCap, History } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/context/app-state-provider";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@/supabase/client";
import { cn } from "@/lib/utils";
import React from "react";

type ActionCardProps = {
    href?: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
};

const ActionCard = ({ href, icon, title, description, onClick }: ActionCardProps) => {
    const content = (
        <div className="flex flex-col h-full">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-primary" })}
            </div>
            <div className="flex-1 space-y-1">
                <h3 className="font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                Comenzar <ArrowRight className="ml-1 h-3 w-3" />
            </div>
        </div>
    );

    const commonClasses = "group relative flex h-full flex-col rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.98]";

    if (href) {
        return (
            <Link href={href} className={cn(commonClasses)}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={cn(commonClasses, "cursor-pointer w-full")}>
            {content}
        </button>
    );
};


export function QuickActions({ className }: { className?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, dismiss } = useToast();
  const { user, userProfile } = useAppState();
  const supabase = createClient();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({ variant: "destructive", title: "Formato no válido", description: "Por favor, selecciona un archivo de video (MP4, MOV, etc.)." });
      return;
    }

    const MAX_SIZE_MB = 100;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ variant: "destructive", title: "Archivo demasiado grande", description: `El tamaño máximo permitido es de ${MAX_SIZE_MB}MB.` });
      return;
    }

    const validateVideo = (videoFile: File): Promise<{ isValid: boolean; error?: string }> => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 300) { resolve({ isValid: false, error: `El video dura ${Math.round(video.duration)}s. El máximo es 5 minutos.` }); return; }
          const maxDim = Math.max(video.videoWidth, video.videoHeight);
          if (maxDim > 1920) { resolve({ isValid: false, error: `La resolución es demasiado alta. El máximo es 1080p.` }); return; }
          resolve({ isValid: true });
        };
        video.onerror = () => { URL.revokeObjectURL(video.src); resolve({ isValid: false, error: "El archivo de video está corrupto." }); };
        video.src = URL.createObjectURL(videoFile);
      });
    };

    const validationResult = await validateVideo(file);
    if (!validationResult.isValid) {
      toast({ variant: "destructive", title: "Video no válido", description: validationResult.error });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!user) {
      toast({ variant: "destructive", title: "Error de autenticación", description: "Debes iniciar sesión para subir un archivo." });
      return;
    }

    const { id: toastId, update: updateToast } = toast({ title: "Subiendo archivo...", description: `Preparando "${file.name}" para la subida.` });

    try {
      const uniqueFileName = `${user.id}/${uuidv4()}-${file.name}`;

      updateToast({ title: "Subiendo archivo...", description: "Por favor espera..." });

      const { error: uploadError } = await supabase.storage.from('uploads').upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(uniqueFileName);

      const uploadId = uuidv4();
      await supabase.from('uploads').insert({ id: uploadId, name: file.name, url: publicUrl, type: file.type, size: file.size, user_id: user.id });

      const currentFilesUploaded = userProfile?.filesUploaded || 0;
      await supabase.from('users').update({ filesUploaded: currentFilesUploaded + 1 }).eq('id', user.id);

      dismiss(toastId);
      toast({ title: "¡Subida completada!", description: `"${file.name}" se ha subido correctamente.` });

    } catch (error: any) {
      dismiss(toastId);
      toast({ variant: "destructive", title: "Error en la subida", description: error.message || "No se pudo subir el archivo." });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold tracking-tight">Acciones Rápidas</h2>
      </div>
      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <ActionCard
            onClick={handleUploadClick}
            icon={<BookCopy />}
            title="Entregar tarea"
            description="Sube tus videos de práctica."
        />
        <Input
            id="task-upload"
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="video/mp4,video/quicktime,video/x-m4v,video/*,image/*"
            onChange={handleFileChange}
        />
        <ActionCard
            href="/dashboard/calificaciones"
            icon={<GraduationCap />}
            title="Calificaciones"
            description="Feedback de tus tutores."
        />
        <ActionCard
            href="/planner"
            icon={<History />}
            title="Planes IA"
            description="Historial de rutas."
        />
      </div>
    </div>
  );
}
