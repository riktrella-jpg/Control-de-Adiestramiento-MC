-- Script para habilitar la Papelera de Reciclaje (Soft Delete) en la tabla de mascotas
ALTER TABLE public.pets 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
