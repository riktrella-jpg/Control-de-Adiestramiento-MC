"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings2,
  Users,
  WandSparkles,
  Sun,
  Moon,
  Laptop,
  BookOpen,
  Plus,
  PawPrint,
  ChevronDown,
  Camera,
  Star,
  PartyPopper,
  Activity,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from "motion/react";

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppState } from "@/context/app-state-provider";
import { useRouter } from "next/navigation";
import Logo from "../../../public/logo_transparent.png";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/supabase/client";

const baseLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/dashboard/courses", icon: BookOpenCheck, label: "Cursos" },
  { href: "/dashboard/ethology", icon: BookOpen, label: "Etología en Manada" },
  { href: "/dashboard/progress", icon: BarChart3, label: "Progreso" },
  { href: "/dashboard/tasks", icon: ClipboardList, label: "Tareas" },
  { href: "/dashboard/planner", icon: WandSparkles, label: "Planificador MC" },
  { href: "/dashboard/carnet", icon: Activity, label: "Carnet Digital" },
  { href: "https://www.facebook.com", icon: Users, label: "Comunidad", target: "_blank" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { 
    user, userProfile, pets, selectedPet, selectPet, addPet, updateDogPhoto, deletePet 
  } = useAppState();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Check for admin access (Ricardo Estrella or role admin)
  const isAdmin = userProfile?.role === 'admin' || user?.email === 'riktrella@gmail.com' || user?.email?.includes('ricardo');

  const allLinks = [
    ...baseLinks,
    ...(isAdmin ? [
      { href: "/admin", icon: Users, label: "Panel del Entrenador" },
      { href: "/admin/monitor", icon: ShieldCheck, label: "Centro de Monitoreo" }
    ] : []),
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedPet) {
      try {
        await updateDogPhoto(file, selectedPet.id);
        toast({ title: "Identidad Actualizada" });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    }
  };

  const handleAddPet = async () => {
    if (!newPetName.trim()) return;
    setIsUpdating(true);
    try {
      await addPet(newPetName, "Binomio Manada");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FCC419', '#FFFFFF', '#000000']
      });
      setAddPetOpen(false);
      setNewPetName("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center gap-2 mb-5 pt-2">
          <div className="relative flex justify-center items-center" style={{ width: 64, height: 64 }}>
            <Image
              src={Logo}
              alt="MC APP"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.35))' }}
            />
          </div>
          <div className="flex flex-col items-center gap-0">
            <span className="text-[13px] font-black tracking-[0.2em] text-white/90 uppercase">MANADA</span>
            <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: '#10B981' }}>CLUB</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/10 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Avatar className="h-10 w-10 border-2 border-primary/40 shrink-0 ring-4 ring-black">
                  <AvatarImage src={selectedPet?.photo_url ?? ""} className="object-cover" />
                  <AvatarFallback className="bg-primary/20 text-primary font-black">{(selectedPet?.name?.[0] ?? 'P').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Binomio Activo</span>
                  <span className="text-sm font-black text-white truncate w-full">{selectedPet?.name ?? "Seleccionar"}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-primary shrink-0 opacity-50 group-hover:opacity-100 transition-all" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(var(--radix-dropdown-menu-trigger-width)-10px)] bg-black/95 backdrop-blur-2xl border-white/10 rounded-2xl p-2 z-50">
            <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase py-2 px-3">Tu Pack de Entrenamiento</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {pets.map(pet => (
                <div key={pet.id} className="relative group/pet flex items-center mb-1">
                  <DropdownMenuItem 
                    onClick={() => selectPet(pet.id)}
                    className={`flex-1 flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${selectedPet?.id === pet.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5'}`}
                  >
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={pet.photo_url} className="object-cover" />
                      <AvatarFallback className="text-[10px] font-bold">{(pet.name[0]).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">{pet.name}</p>
                      <p className="text-[10px] opacity-60 uppercase">{pet.level || 'Principiante'}</p>
                    </div>
                    {selectedPet?.id === pet.id && <Star className="h-3 w-3 fill-primary text-primary" />}
                  </DropdownMenuItem>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-auto p-2">
        <SidebarMenu className="gap-1">
          {allLinks.map((link) => {
            const isActive = pathname === link.href && !link.target;
            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild={link.href !== "/settings"}
                  isActive={isActive}
                  tooltip={link.label}
                  onClick={link.href === "/settings" ? () => setAddPetOpen(true) : undefined}
                  className={`rounded-2xl h-12 transition-all border ${
                    isActive
                      ? 'border-emerald-500/20 shadow-inner'
                      : 'border-transparent hover:bg-white/[0.03]'
                  }`}
                  style={isActive ? { background: 'rgba(16,185,129,0.08)' } : {}}
                >
                  {link.href === "/settings" ? (
                    <div className="flex items-center gap-3 w-full cursor-pointer">
                      <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <link.icon className="h-4 w-4 text-white/40" />
                      </div>
                      <span className="text-sm font-bold text-white/40">{link.label}</span>
                    </div>
                  ) : (
                    <Link href={link.href} target={link.target} className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl transition-all"
                        style={{
                          background: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <link.icon
                          className="h-4 w-4 transition-colors"
                          style={{ color: isActive ? '#10B981' : 'rgba(255,255,255,0.35)' }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold transition-colors"
                        style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)' }}
                      >
                        {link.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: '#10B981' }} />
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="bg-white/5 mx-4" />

      <SidebarFooter className="p-3 gap-3">
        {/* User card */}
        <div
          className="rounded-2xl p-3 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Avatar className="h-9 w-9 ring-1 ring-offset-1 ring-offset-black" style={{ ringColor: 'rgba(16,185,129,0.3)' }}>
            <AvatarImage src={userProfile?.dogPhotoURL} className="object-cover" />
            <AvatarFallback
              className="font-black text-xs"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}
            >
              {(userProfile?.displayName?.[0] || 'M').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="font-black text-xs text-white truncate uppercase tracking-tight">
              {userProfile?.displayName || 'Usuario'}
            </p>
            <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setProfileOpen(true)}
            className="flex-1 justify-start gap-2 rounded-xl h-9 text-white/40 hover:text-white hover:bg-white/5 text-xs font-bold"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Ajustes
          </Button>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex-1 justify-start gap-2 rounded-xl h-9 text-white/40 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </Button>
        </div>
      </SidebarFooter>

      <Dialog open={addPetOpen} onOpenChange={setAddPetOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white rounded-3xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <PartyPopper className="h-6 w-6 text-primary" />
              Nuevo Binomio
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Registra una nueva mascota en tu pack de entrenamiento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Nombre de la Mascota</Label>
              <Input
                placeholder="Ej. Haku"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary text-lg font-bold"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full h-12 rounded-xl bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              onClick={handleAddPet}
              disabled={isUpdating || !newPetName.trim()}
            >
              {isUpdating ? <Activity className="h-5 w-5 animate-spin" /> : "Confirmar Registro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white rounded-3xl sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <Settings2 className="h-6 w-6 text-primary" />
              Ajustes del Sistema
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">

            {/* TEMA */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Modo Oscuro</Label>
                <p className="text-xs text-muted-foreground font-medium">Cambiar apariencia del tema.</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            {/* FOTO DEL BINOMIO */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Identidad Visual</Label>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                 <Avatar className="h-16 w-16 border-2 border-primary/20 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleAvatarClick}>
                    <AvatarImage src={selectedPet?.photo_url} className="object-cover" />
                    <AvatarFallback className="font-black text-xl">{(selectedPet?.name?.[0] || 'P').toUpperCase()}</AvatarFallback>
                 </Avatar>
                 <div className="flex-1">
                    <p className="text-sm font-bold">{selectedPet?.name || "Sin Mascota"}</p>
                    <p className="text-xs text-muted-foreground mb-2">Sube una foto para su expediente.</p>
                    <Button size="sm" variant="outline" onClick={handleAvatarClick} className="h-7 text-[10px] uppercase font-black tracking-widest border-white/10 bg-transparent hover:bg-white/10">
                       <Camera className="h-3 w-3 mr-2" /> Cambiar Foto
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                 </div>
              </div>
            </div>

            {/* PORTAL MANADA */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Portal Manada</Label>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <p className="text-xs text-muted-foreground font-medium">Registra un nuevo binomio en tu pack de entrenamiento.</p>
                <div className="flex gap-3">
                  <Input
                    placeholder="Nombre de la mascota, ej: Haku"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddPet(); }}
                    className="bg-white/5 border-white/10 h-11 rounded-xl font-bold text-sm"
                  />
                  <Button
                    onClick={handleAddPet}
                    disabled={isUpdating || !newPetName.trim()}
                    className="h-11 px-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90 shrink-0 shadow-lg shadow-primary/20"
                  >
                    {isUpdating ? <Activity className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
                {pets.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pack Registrado ({pets.length})</p>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                      {pets.map(pet => (
                        <div key={pet.id} className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${selectedPet?.id === pet.id ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.03]'}`}>
                          <Avatar className="h-7 w-7 border border-white/10">
                            <AvatarImage src={pet.photo_url} className="object-cover" />
                            <AvatarFallback className="text-[10px] font-bold">{pet.name[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold flex-1 truncate">{pet.name}</span>
                          {selectedPet?.id === pet.id && <Star className="h-3 w-3 fill-primary text-primary shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 font-black uppercase tracking-widest" onClick={() => setProfileOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>

  );
}