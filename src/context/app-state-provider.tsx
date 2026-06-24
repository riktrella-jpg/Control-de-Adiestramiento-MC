"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { coursesData, Module as CourseModule } from '@/lib/courses-data';
import { Award, Heart, Shield, Brain, Anchor, Milestone, LucideIcon, Loader2, Compass, Star } from "lucide-react";
import { User } from '@supabase/supabase-js';
import { useUser } from '@/hooks/use-user';
import { useCollection, WithId } from '@/hooks/use-collection';
import { useDoc } from '@/hooks/use-doc';
import { createClient } from '@/supabase/client';
import { logError } from '@/lib/utils';
import { useRouter } from 'next/navigation';


interface Pet {
  id: string;
  user_id: string;
  name: string;
  photo_url?: string;
  breed?: string;
  level?: string;
  created_at?: string;
  birth_date?: string;
  deworming_date?: string;
  vaccine_date?: string;
  particularities?: string;
  deleted_at?: string;
  is_sterilized?: boolean;
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
  obediencia: number;
  vinculo: number;
  control: number;
  calma: number;
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
  onboarding_completed?: boolean;
  tour_completed?: boolean;
  comorbidities?: string[];
}

const initialAchievements: Achievement[] = [
    { id: "cert_module1", achievementId: "cert_module1", icon: Award, title: "Certificación: Fundamentos", description: "Completaste el módulo de bases y comunicación canina.", completed: false },
    { id: "cert_module2", achievementId: "cert_module2", icon: Award, title: "Certificación: Herramientas", description: "Dominaste el equipo y el timing de marcación.", completed: false },
    { id: "cert_module3", achievementId: "cert_module3", icon: Award, title: "Certificación: MANADA en práctica", description: "Aplicaste las 6 fases del método con éxito.", completed: false },
    { id: "cert_module4", achievementId: "cert_module4", icon: Award, title: "Certificación: Casos reales", description: "Superaste retos de ansiedad y miedos específicos.", completed: false },
    { id: "cert_module5", achievementId: "cert_module5", icon: Award, title: "Certificación: Protocolos urbanos", description: "Listo para la convivencia en entornos públicos complejos.", completed: false },
    { id: "cert_module6", achievementId: "cert_module6", icon: Award, title: "Certificación: Plan y certificación", description: "Graduación oficial del programa MC APP.", completed: false },
    { id: "cert_module7", achievementId: "cert_module7", icon: Award, title: "Certificación: Perfeccionamiento", description: "Alcanzaste el nivel élite de control y foco.", completed: false },
];

interface AppState {
  progress: number;
  modules: CourseModule[];
  tasks: Task[];
  isTasksLoading: boolean;
  uploads: Upload[];
  achievements: Achievement[];
  pets: Pet[];
  deletedPets: Pet[];
  selectedPet: Pet | null;
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isNewUser: boolean;
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
  deletePet: (petId: string) => Promise<void>;
  restorePet: (petId: string) => Promise<void>;
  hardDeletePet: (petId: string) => Promise<void>;
  updateCarnetInfo: (petId: string, carnetData: Partial<Pet>) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  markTourComplete: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
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

  const pets = useMemo(() => (petsRaw || []).filter(p => !p.deleted_at), [petsRaw]);
  const deletedPets = useMemo(() => (petsRaw || []).filter(p => !!p.deleted_at), [petsRaw]);

  const selectedPet = useMemo(() => {
    if (!selectedPetId) return pets[0] || null;
    return pets.find(p => p.id === selectedPetId) || pets[0] || null;
  }, [pets, selectedPetId]);

  useEffect(() => {
    if (selectedPet && !selectedPetId) setSelectedPetId(selectedPet.id);
  }, [selectedPet, selectedPetId]);

  // Data Filtering by Pet
  const { data: dbTasksRaw, refetch: refetchTasks, isLoading: isTasksLoading } = useCollection<Task>(
    user ? 'tasks' : null,
    [
        { column: 'user_id', operator: 'eq', value: user?.id },
        { column: 'pet_id', operator: 'eq', value: selectedPet?.id }
    ]
  );

  const { data: dbUploadsRaw, refetch: refetchUploads } = useCollection<Upload>(
    user ? 'uploads' : null,
    [
        { column: 'user_id', operator: 'eq', value: user?.id },
        { column: 'pet_id', operator: 'eq', value: selectedPet?.id }
    ]
  );

  const { data: dbProgressRaw, refetch: refetchModuleProgress } = useCollection<ModuleProgress>(
    user ? 'module_progress' : null,
    [
        { column: 'user_id', operator: 'eq', value: user?.id }
    ]
  );

  const { data: dbAchievementsRaw, refetch: refetchAchievements, isLoading: isAchievementsLoading } = useCollection<Achievement>(
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
                    role: 'client',
                    onboarding_completed: false,
                    tour_completed: false,
                    comorbidities: []
                });
                refetchUserProfile();
            }
        };
        sync();
    }
  }, [user, userProfile, isProfileLoading, supabase, refetchUserProfile]);

  useEffect(() => {
    // Solo actuamos si hay un usuario, no estamos cargando y la lista está vacía
    if (user && pets.length === 0 && !isPetsLoading && !isCreatingPetRef.current) {
        const createDefaultPet = async () => {
            if (isCreatingPetRef.current) return;
            isCreatingPetRef.current = true;

            try {
                // Triple verificación: consultar directamente a Supabase antes de insertar
                const { data: existing, error: checkError } = await supabase
                    .from('pets')
                    .select('id')
                    .eq('user_id', user.id)
                    .limit(1);

                if (checkError) throw checkError;

                if (existing && existing.length > 0) {
                    console.log("Pet already exists, skipping creation");
                    await refetchPets();
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
            } catch (err) {
                console.error("Error creating default pet:", err);
            } finally {
                // Pequeño delay para asegurar que el estado de 'pets' se actualice antes de permitir otra creación
                setTimeout(() => {
                    isCreatingPetRef.current = false;
                }, 2000);
            }
        };
        createDefaultPet();
    }
  }, [user, pets, isPetsLoading, userProfile, supabase, refetchPets]);

  const uploads = useMemo(() => dbUploadsRaw || [], [dbUploadsRaw]);
  const tasks = useMemo(() => dbTasksRaw || [], [dbTasksRaw]);
  const dbModuleProgress = useMemo(() => {
    if (!dbProgressRaw || !selectedPet || !user) return [];
    // Filtro y mapeo para manejar el truco de "Módulos Virtuales" para multi-binomio
    return dbProgressRaw
      .filter(p => p.moduleId && p.moduleId.endsWith(`:${selectedPet.id}`))
      .map(p => ({
        ...p,
        moduleId: p.moduleId.split(':')[0] // Devolver el ID real (ej. 'module1') para que la UI lo reconozca
      }));
  }, [dbProgressRaw, selectedPet, user]);

  const dbAchievements = useMemo(() => {
    if (!dbAchievementsRaw || !selectedPet || !user) return [];
    // Si la tabla tiene pet_id lo usamos, si no, intentamos deducirlo o mostramos todo (logros suelen ser globales o por perro)
    return dbAchievementsRaw.filter(a => !a.pet_id || a.pet_id === selectedPet.id);
  }, [dbAchievementsRaw, selectedPet, user]);

  const router = useRouter();

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
      let isCompleted = serverAch?.completed || false;

      // Auto-visual completion: si el logro es una certificación de módulo,
      // comprobamos el progreso del módulo. Si tiene al menos 1 semana completada
      // Y el porcentaje de completado es 100%, se desbloquea visualmente.
      if (!isCompleted && ach.id.startsWith('cert_module')) {
        const moduleNum = ach.id.replace('cert_module', '');
        const mod = modules.find(m => m.moduleNumber.toString() === moduleNum);
        if (mod && mod.weeks.length > 0) {
          const completedWeeks = mod.weeks.filter(w => w.completed).length;
          const pct = Math.round((completedWeeks / mod.weeks.length) * 100);
          if (pct === 100) isCompleted = true;
        }
      }

      return { ...ach, completed: isCompleted };
    });
  }, [dbAchievements, modules]);

  const totalWeeks = useMemo(() => modules.reduce((acc, m) => acc + m.weeks.length, 0), [modules]);
  const completedWeeks = useMemo(() => modules.reduce((acc, m) => acc + m.weeks.filter(w => w.completed).length, 0), [modules]);
  const progress = useMemo(() => totalWeeks === 0 ? 0 : Math.round((completedWeeks / totalWeeks) * 100), [completedWeeks, totalWeeks]);

  // Auto-unlock achievements when course is 100% complete
  useEffect(() => {
    if (!isMounted || !user || !selectedPet || modules.length === 0 || isAchievementsLoading) return;
    
    const checkAndUnlock = async () => {
      let changed = false;
      for (const mod of modules) {
        const isModuleComplete = mod.weeks.every(w => w.completed);
        if (isModuleComplete) {
          const achId = `cert_${mod.id}`;
          const alreadyUnlocked = dbAchievements.some(a => a.achievementId === achId && a.completed);
          
          if (!alreadyUnlocked) {
            console.log(`Auto-unlocking achievement for ${mod.id}`);
            const { error } = await supabase.from('achievements').upsert({
              user_id: user.id,
              pet_id: selectedPet.id,
              achievementId: achId,
              completed: true,
              updatedAt: new Date().toISOString()
            }, { onConflict: 'user_id,pet_id,achievementId' });
            
            if (!error) changed = true;
          }
        }
      }
      if (changed) {
        refetchAchievements();
      }
    };

    checkAndUnlock();
  }, [isMounted, modules, user, selectedPet, dbAchievements, isAchievementsLoading, supabase, refetchAchievements]);


  const selectPet = (petId: string) => {
    setSelectedPetId(petId);
    localStorage.setItem('mc26_selected_pet', petId);
    router.push('/dashboard');
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

  const deletePet = useCallback(async (petId: string) => {
    if (!user) return;
    try {
      // Soft delete: solo actualizamos el deleted_at
      const { error } = await supabase.from('pets').update({ deleted_at: new Date().toISOString() }).eq('id', petId);
      if (error) throw error;
      await refetchPets();
      if (selectedPet?.id === petId) {
        setSelectedPetId("");
        localStorage.removeItem('mc26_selected_pet');
      }
    } catch (error: any) {
      await logError("deletePet", error);
      throw error;
    }
  }, [user, selectedPet, supabase, refetchPets]);

  const restorePet = useCallback(async (petId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('pets').update({ deleted_at: null }).eq('id', petId);
      if (error) throw error;
      await refetchPets();
    } catch (error: any) {
      await logError("restorePet", error);
      throw error;
    }
  }, [user, supabase, refetchPets]);

  const hardDeletePet = useCallback(async (petId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId);
      if (error) throw error;
      await refetchPets();
    } catch (error: any) {
      await logError("hardDeletePet", error);
      throw error;
    }
  }, [user, supabase, refetchPets]);

  const toggleWeekCompletion = useCallback(async (moduleId: string, weekId: string, dryRun = false, forceComplete?: boolean) => {
    if (!user || !selectedPet) return { isLocked: true, message: "No pet selected" };
    const current = dbModuleProgress.find(p => p.moduleId === moduleId);
    const completedIds = current?.completedWeekIds || [];
    
    let newItems;
    if (forceComplete === true) {
        if (completedIds.includes(weekId)) return { isLocked: false, message: "" };
        newItems = [...completedIds, weekId];
    } else if (forceComplete === false) {
        if (!completedIds.includes(weekId)) return { isLocked: false, message: "" };
        newItems = completedIds.filter(id => id !== weekId);
    } else {
        newItems = completedIds.includes(weekId) ? completedIds.filter(id => id !== weekId) : [...completedIds, weekId];
    }
    
    if (!dryRun) {
        try {
            // TRUCO: Usamos un moduleId virtual (moduleId:petId) para saltar la restricción unique_user_module de la DB
            const virtualModuleId = `${moduleId}:${selectedPet.id}`;
            const { error } = await supabase.from('module_progress').upsert({
              id: `${user.id}:${selectedPet.id}:${moduleId}`,
              user_id: user.id,
              moduleId: virtualModuleId,
              completedWeekIds: newItems,
              updatedAt: new Date().toISOString()
            }, { onConflict: 'id' });
            
            if (error) {
                console.error("Error en upsert module_progress:", error);
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
    if (!user) throw new Error("Debes iniciar sesión para añadir tareas.");
    const trimmed = label.trim();
    if (!trimmed) throw new Error("La tarea no puede estar vacía.");

    const payload: Record<string, any> = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      user_id: user.id,
      label: trimmed,
      done: false,
      createdAt: new Date().toISOString()
    };
    // Incluir pet_id si hay mascota seleccionada (evita fallos RLS)
    if (selectedPet?.id) payload.pet_id = selectedPet.id;

    const { data, error } = await supabase.from('tasks').insert(payload).select().single();
    if (error) {
      await logError("addTask", error);
      throw new Error(error.message || "Error de base de datos al guardar la tarea.");
    }
    await refetchTasks();
    return data;
  }, [user, selectedPet, supabase, refetchTasks]);

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      const { error } = await supabase.from('tasks').update({ done: !task.done }).eq('id', taskId);
      if (error) throw error;

      // Auto-completar semana del curso si la tarea viene de Mis Cursos
      if (!task.done && task.label.startsWith('[M')) {
        const match = task.label.match(/\[M(\d+)-S(\d+)\]/);
        if (match) {
          const moduleNum = match[1];
          const weekNum = match[2];
          const mId = `module${moduleNum}`;
          const wId = `m${moduleNum}w${weekNum}`;
          try {
            await toggleWeekCompletion(mId, wId, false, true);
          } catch (weekErr: any) {
            await logError("toggleTaskCompletion.weekSync", weekErr);
          }
        }
      }
      await refetchTasks();
    } catch (error: any) {
      await logError("toggleTaskCompletion", error);
      throw new Error(error.message || "Error al actualizar la tarea");
    }
  }, [tasks, supabase, refetchTasks, toggleWeekCompletion]);

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
         const fileId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
         const path = `${user.id}/${selectedPet.id}/${fileId}-${file.name}`;
         const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file);
         if (uploadError) throw uploadError;
         
         const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
         const { error: insertError } = await supabase.from('uploads').insert({
           id: fileId, name: file.name, url: publicUrl, type: file.type, size: file.size,
           user_id: user.id, pet_id: selectedPet.id, status: 'pending'
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

  const updateCarnetInfo = useCallback(async (petId: string, carnetData: Partial<Pet>) => {
    if (!user) throw new Error("No autenticado");
    const { error } = await supabase.from('pets').update(carnetData).eq('id', petId);
    if (error) throw new Error("No se pudo actualizar el carnet: " + error.message);
    await refetchPets();
  }, [user, supabase, refetchPets]);

  const markOnboardingComplete = useCallback(async () => {
    if (!user) return;
    await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id);
    await refetchUserProfile();
  }, [user, supabase, refetchUserProfile]);

  const markTourComplete = useCallback(async () => {
    if (!user) return;
    await supabase.from('users').update({ tour_completed: true }).eq('id', user.id);
    await refetchUserProfile();
  }, [user, supabase, refetchUserProfile]);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    await supabase.from('users').update(data).eq('id', user.id);
    await refetchUserProfile();
  }, [user, supabase, refetchUserProfile]);

  const isNewUser = useMemo(() => {
    if (!userProfile) return false;
    return userProfile.onboarding_completed === false;
  }, [userProfile]);

  // ROBUST GLOBAL REDIRECT
  useEffect(() => {
    if (isMounted && user && !isUserLoading && userProfile) {
      const isCurrentlyOnboarding = window.location.pathname.includes('/onboarding');
      if (isNewUser && !isCurrentlyOnboarding) {
        window.location.href = '/onboarding';
      }
    }
  }, [isMounted, user, isUserLoading, userProfile, isNewUser]);

  const value = useMemo(() => ({
    progress, modules, tasks, isTasksLoading, uploads, achievements, pets, deletedPets, selectedPet, user, userProfile, isAdmin, isNewUser,
    addPetOpen, setAddPetOpen,
    selectPet, addPet, deletePet, restorePet, hardDeletePet, toggleWeekCompletion, toggleTaskCompletion, addTask, toggleAchievementCompletion,
    updateDogPhoto, uploadVideo, deleteVideo, refetchUploads, updateCarnetInfo, markOnboardingComplete, markTourComplete, updateUserProfile
  }), [progress, modules, tasks, isTasksLoading, uploads, achievements, pets, deletedPets, selectedPet, user, userProfile, isAdmin, isNewUser, addPetOpen, selectPet, addPet, deletePet, restorePet, hardDeletePet, toggleWeekCompletion, toggleTaskCompletion, addTask, toggleAchievementCompletion, updateDogPhoto, uploadVideo, deleteVideo, refetchUploads, updateCarnetInfo, markOnboardingComplete, markTourComplete, updateUserProfile]);

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

