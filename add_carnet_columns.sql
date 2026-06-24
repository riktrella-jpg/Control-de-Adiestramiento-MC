-- Script para añadir campos del Carnet Digital a la tabla de mascotas
ALTER TABLE public.pets 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS deworming_date DATE,
ADD COLUMN IF NOT EXISTS vaccine_date DATE,
ADD COLUMN IF NOT EXISTS particularities TEXT;
