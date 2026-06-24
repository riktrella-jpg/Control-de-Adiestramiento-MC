-- Migration: Onboarding Columns
-- Run this in your Supabase SQL editor

-- 1. Add is_sterilized (boolean) to pets
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS is_sterilized BOOLEAN DEFAULT FALSE;

-- 2. Add onboarding_completed to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 3. Add tour_completed to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

-- 4. Add comorbidities (text array) to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS comorbidities TEXT[] DEFAULT '{}';

-- Mark existing users as already onboarded (so they don't see the onboarding again)
UPDATE public.users
  SET onboarding_completed = TRUE, tour_completed = TRUE
  WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;
