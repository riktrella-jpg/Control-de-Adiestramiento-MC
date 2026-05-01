"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { coursesData, Module as CourseModule } from '@/lib/courses-data';
import { Award, Heart, Shield, Brain, Anchor, Milestone, LucideIcon, Loader2, Compass, Medal, Star } from "lucide-react";
import { User } from '@supabase/supabase-js';
import { useUser } from '@/hooks/use-user';
import { useCollection, WithId } from '@/hooks/use-collection';
import { useDoc } from '@/hooks/use-doc';
import { createClient } from '@/supabase/client';
import { logError } from '@/lib/utils';


interface Pet {
  id: string;
  user_id: string;
  name: string;
  photo_url?: string;
  breed?: string;
  level?: string;
  created_at?: string;
}

interface Task {
  id: string;
  label: string;
  done: boolean;
  user_id: string;
  pet_id?: string;
}

export interface FeedbackDetail {
  foco: number;
  timing: number;
  tecnica: number;
  comments: string;
  nextSteps: string[];
  evaluatorName?: string;
  evaluatorRole?: string;
  date?: string;
}

export interface Upload {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  createdAt: any;
  status?: 'pending' | 'reviewed' | 'approved' | 'improve';
  feedback?: string;
  feedback_detail?: FeedbackDetail;
  user_id: string;
  pet_id?: string;
}

export interface Achievement {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  completed: boolean;
  achievementId: string;
  pet_id?: string;
};

export interface UserProfile {
  email?: string;
  displayName?: string;
  dogName?: string;
  dogPhotoURL?: string;
  filesUploaded?: number;
  role?: 'admin' | 'user' | 'client';
}

const initialAchievements: Achievement[] = [
    { id: "ach1", achievementId: "ach1", icon: Milestone, title: "Primer Paseo Consciente", description: "Realizaste tu primer paseo enfocado en el presente.", completed: false },
    { id: "ach2", achievementId: "ach2", icon: Anchor, title: "Vínculo Fortalecido", description: "Completaste una semana de ejercicios de contacto visual.", completed: false },
    { id: "ach3", achievementId: "ach3", icon: Shield, title: "Maestro de la Calma", description: "Tu perro esperó su comida con éxito por primera vez.", completed: false },
    { id: "ach4", achievementId: "ach4", icon: Brain, title: "Superando Miedos", description: "Realizaste la primera sesión de desensibilización.", completed: false },
    { id: "ach5", achievementId: "ach5", icon: Compass, title: "Ciudadano Ejemplar", description: "Paseaste correctamente en zonas urbanas.", completed: false },
    { id: "ach6", achievementId: "ach6", icon: Award, title: "Graduación MANADA", description: "Completaste la bitácora y certificación final.", completed: false },
    { id: "ach7", achievementId: "ach7", icon: Star, title: "Perfeccionamiento Práctico", description: "Dominaste el autocontrol puro y timing.", completed: false },
];

interface AppState {
  progress: number;
  modules: CourseModule[];
  tasks: Task[];
  uploads: Upload[];
  achievements: Achievement[];
  pets: Pet[];
  selectedPet: Pet | null;
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  addPetOpen: boolean;
  setAddPetOpen: (open: boolean) => void;
  selectPet: (petId: string) => void;
  addPet: (name: string, breed?: string) => Promise<Pet>;
  toggleWeekCompletion: (moduleId: string, weekId: string, dryRun?: boolean) => Promise<{ isLocked: boolean, message: string }>;
  toggleTaskCompletion: (taskId: string) => void;
  addTask: (label: string) => void;
  toggleAchievementCompletion: (achievementId: string) => void;
  updateDogPhoto: (file: File, petId?: string) => Promise<void>;
  uploadVideo: (file: File) => Promise<void>;
  deleteVideo: (uploadId: string) => Promise<void>;
  refetchUploads: () => Promise<void>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

interface ModuleProgress {
  moduleId: string;
  completedWeekIds: string[];
  pet_id?: string;
}

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: isUserLoading } = useUser();
  const supabase = createClient();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const isCreatingPetRef = React.useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('mc26_selected_pet');
    if (saved) setSelectedPetId(saved);
  }, []);

  // Pets Collection
  const { data: petsRaw, isLoading: isPetsLoading, refetch: refetchPets } = useCollection<Pet>(
    user ? 'pets' : null,
    [{ column: 'user_id', operator: 'eq', value: user?.id }]
  );

  const pets = useMemo(() => petsRaw || [], [petsRaw]);

  const selectedPet = useMemo(() => {
    if (!selectedPetId) return pets[0] || null;
    return pets.find(p => p.id === selectedPetId) || pets[0] || null;
  }, [pets, selectedPetId]);

  useEffect(() => {
    if (selectedPet && !selectedPetId) setSelectedPetId(selectedPet.id);
  }, [selectedPet, selectedPetId]);

  // Data Filtering by Pet
  const { data: dbTasksRaw, refetch: refetchTasks } = useCollection<Task>(
    user ? 'tasks' : null,
    [
        { column: 'user_id', operator: 'eq', value: user?.id }
    ]
  );

  const { data: dbUploadsRaw, refetch: refetchUploads } = useCollection<Upload>(
    user ? 'uploads' : null,
    [
        { column: 'user_id', operator: 'eq', value: user?.id }
    ]
  );

  const { data: dbProgressRaw, refetch: refetchModuleProgress } = useCollection<ModuleProgress>(
    user ? 'module_progress' : null,
    [
        { column: 'user_id', operator: 'eq', value: user?.id }
    ]
  );

  const { data: dbAchievementsRaw, refetch: refetchAchievements } = useCollection<Achievement>(
    user ? 'achievements' : null,
    [
        { column: 'user_id', operator: 'eq', value: user?.id }
    ]
  );

  const { data: userProfile, isLoading: isProfileLoading, refetch: refetchUserProfile } = useDoc<UserProfile>(
    (isMounted && user) ? 'users' : null,
    user?.id
  );

  const isAdmin = useMemo(() => userProfile?.role === 'admin', [userProfile]);

  // AUTO-SYNC: Ensure user record and at least one default pet
  useEffect(() => {
    if (user && !isProfileLoading && !userProfile) {
        const sync = async () => {
            const { data: existing } = await supabase.from('users').select('id').eq('id', user.id).single();
            if (!existing) {
                await supabase.from('users').insert({
                    id: user.id, email: user.email, 
                    displayName: user.user_metadata?.full_name || user.email?.split('@')[0],
                    dogName: user.user_metadata?.dog_name || 'Haku',
                    role: 'client'
                });
                refetchUserProfile();
            }
        };
        sync();
    }
  }, [user, userProfile, isProfileLoading, supabase, refetchUserProfile]);

  useEffect(() => {
    if (user && pets.length === 0 && !isPetsLoading && !isCreatingPetRef.current) {
        isCreatingPetRef.current = true;
        const createDefaultPet = async () => {
            // Double-check in DB before inserting to prevent race conditions
            const { data: existing } = await supabase.from('pets').select('id').eq('user_id', user.id).limit(1);
            if (existing && existing.length > 0) {
                await refetchPets();
                isCreatingPetRef.current = false;
                return;
            }
            const name = userProfile?.dogName || user.user_metadata?.dog_name || "Mi Primogénito";
            const photo = userProfile?.dogPhotoURL || user.user_metadata?.dog_photo_url;
            await supabase.from('pets').insert({
                user_id: user.id,
                name: name,
                photo_url: photo,
                level: 'Principiante'
            });
            await refetchPets();
            isCreatingPetRef.current = false;
        };
        createDefaultPet();
    }
  }, [user, pets, isPetsLoading, userProfile, supabase, refetchPets]);

  const uploads = useMemo(() => dbUploadsRaw || [], [dbUploadsRaw]);
  const tasks = useMemo(() => dbTasksRaw || [], [dbTasksRaw]);
  const dbModuleProgress = useMemo(() => dbProgressRaw || [], [dbProgressRaw]);
  const dbAchievements = useMemo(() => dbAchievementsRaw || [], [dbAchievementsRaw]);

  const selectPet = (petId: string) => {
    setSelectedPetId(petId);
    localStorage.setItem('mc26_selected_pet', petId);
  };

  const addPet = async (name: string, breed?: string) => {
    if (!user) throw new Error("No user");
    const { data, error } = await supabase.from('pets').insert({
      user_id: user.id,
      name,
      level: 'Principiante'
    }).select().single();
    if (error) throw error;
    await refetchPets();
    selectPet(data.id);
    return data;
  };

  const modules = useMemo(() => {
    return coursesData.map(module => {
      const prog = dbModuleProgress.find(p => p.moduleId === module.id);
      return {
        ...module,
        weeks: module.weeks.map(week => ({
          ...week,
          completed: prog?.completedWeekIds?.includes(week.id) || false
        }))
      };
    });
  }, [dbModuleProgress]);

  const achievements = useMemo(() => {
    return initialAchievements.map(ach => {
      const serverAch = dbAchievements.find(fa => fa.achievementId === ach.achievementId);
      return { ...ach, completed: serverAch?.completed || false };
    });
  }, [dbAchievements]);

  const totalWeeks = useMemo(() => modules.reduce((acc, m) => acc + m.weeks.length, 0), [modules]);
  const completedWeeks = useMemo(() => modules.reduce((acc, m) => acc + m.weeks.filter(w => w.completed).length, 0), [modules]);
  const progress = useMemo(() => totalWeeks === 0 ? 0 : Math.round((completedWeeks / totalWeeks) * 100), [completedWeeks, totalWeeks]);

  const toggleWeekCompletion = useCallback(async (moduleId: string, weekId: string, dryRun = false) => {
    if (!user || !selectedPet) return { isLocked: true, message: "No pet selected" };
    const current = dbModuleProgress.find(p => p.moduleId === moduleId);
    const completedIds = current?.completedWeekIds || [];
    const newItems = completedIds.includes(weekId) ? completedIds.filter(id => id !== weekId) : [...completedIds, weekId];
    
    if (!dryRun) {
        try {
            const { error } = await supabase.from('module_progress').upsert({
              id: `${user.id}:${moduleId}`,
              user_id: user.id,
              moduleId,
              completedWeekIds: newItems,
              updatedAt: new Date().toISOString()
            });
            if (error) {
                await logError("toggleWeekCompletion", error);
                throw error;
            }
            await refetchModuleProgress();
        } catch (error: any) {
            await logError("toggleWeekCompletion.catch", error);
            throw new Error(error.message || "Error al actualizar el progreso del módulo");
        }
    }
    return { isLocked: false, message: "" };
  }, [user, selectedPet, dbModuleProgress, supabase, refetchModuleProgress]);

  const addTask = useCallback(async (label: string) => {
    if (!user) return;
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      label,
      done: false,
      createdAt: new Date().toISOString()
    });
    if (error) {
      await logError("addTask", error);
      throw new Error(error.message || "Error de base de datos");
    }
    await refetchTasks();
  }, [user, selectedPet, supabase, refetchTasks]);

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
          const { error } = await supabase.from('tasks').update({ done: !task.done }).eq('id', taskId);
          if (error) throw error;
          await refetchTasks();
      } catch (error: any) {
          await logError("toggleTaskCompletion", error);
          throw new Error(error.message || "Error al actualizar la tarea");
      }
    }
  }, [tasks, supabase, refetchTasks]);

  const toggleAchievementCompletion = useCallback(async (achievementId: string) => {
    if (!user || !selectedPet) return;
    const existing = dbAchievements.find(a => a.achievementId === achievementId);
    if (existing) {
      await supabase.from('achievements').update({ completed: !existing.completed }).eq('id', existing.id);
    } else {
      await supabase.from('achievements').insert({
        user_id: user.id,
        pet_id: selectedPet.id,
        achievementId,
        completed: true
      });
    }
    await refetchAchievements();
  }, [user, selectedPet, dbAchievements, supabase, refetchAchievements]);

  const uploadVideo = useCallback(async (file: File) => {
     if (!user || !selectedPet) return;
     try {
         const fileId = Math.random().toString(36).substring(7);
         const path = `${user.id}/${selectedPet.id}/${fileId}-${file.name}`;
         const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file);
         if (uploadError) throw uploadError;
         
         const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
         const { error: insertError } = await supabase.from('uploads').insert({
           id: fileId, name: file.name, url: publicUrl, type: file.type, size: file.size,
           user_id: user.id, status: 'pending'
         });
         if (insertError) throw insertError;

         if (userProfile) {
            await supabase.from('users').update({ filesUploaded: (userProfile.filesUploaded || 0) + 1 }).eq('id', user.id);
         }
         
         await refetchUploads();
     } catch (error: any) {
         await logError("uploadVideo", error);
         throw new Error(error.message || "Error al subir video");
     }
  }, [user, selectedPet, supabase, refetchUploads, userProfile]);

  const deleteVideo = useCallback(async (id: string) => {
     await supabase.from('uploads').delete().eq('id', id);
     await refetchUploads();
  }, [supabase, refetchUploads]);

  const updateDogPhoto = useCallback(async (file: File, petId?: string) => {
    if (!user) return;
    const targetPetId = petId || selectedPet?.id;
    if (!targetPetId) return;
    const path = `${user.id}/pets/${targetPetId}-${Date.now()}`;
    await supabase.storage.from('uploads').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
    await supabase.from('pets').update({ photo_url: publicUrl }).eq('id', targetPetId);
    await refetchPets();
  }, [user, selectedPet, supabase, refetchPets]);

  const value = useMemo(() => ({
    progress, modules, tasks, uploads, achievements, pets, selectedPet, user, userProfile, isAdmin,
    addPetOpen, setAddPetOpen,
    selectPet, addPet, toggleWeekCompletion, toggleTaskCompletion, addTask, toggleAchievementCompletion,
    updateDogPhoto, uploadVideo, deleteVideo, refetchUploads
  }), [progress, modules, tasks, uploads, achievements, pets, selectedPet, user, userProfile, isAdmin, addPetOpen, selectPet, addPet, toggleWeekCompletion, toggleTaskCompletion, addTask, toggleAchievementCompletion, updateDogPhoto, uploadVideo, deleteVideo, refetchUploads]);

  if (!isMounted || isUserLoading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};
