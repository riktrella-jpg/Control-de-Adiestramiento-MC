-- Script para limpiar y enviar a la papelera todos los perros que NO tengan foto
UPDATE public.pets
SET deleted_at = NOW()
WHERE photo_url IS NULL;
