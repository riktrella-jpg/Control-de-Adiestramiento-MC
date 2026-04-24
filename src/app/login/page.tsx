"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/supabase/client";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dogName, setDogName] = useState("");
  const [loading, setLoading] = useState<boolean | string>(false);

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Correo requerido",
        description: "Ingresa tu email arriba para restablecer la contraseña.",
      });
      return;
    }

    setLoading("reset");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada o carpeta de spam.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: error.message || "No se pudo enviar el correo de restablecimiento.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && password.length < 6) {
      toast({
        variant: "destructive",
        title: "Contraseña muy corta",
        description: "Debe tener al menos 6 caracteres por seguridad.",
      });
      return;
    }

    setLoading("email");
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: displayName,
              dog_name: dogName,
            },
          },
        });
        if (error) throw error;

        // Si la confirmación de email está activa, el usuario debe verificar su correo.
        // Si no está activa, Supabase lo loguea automáticamente (depende de la config).
        if (data.session) {
           router.replace("/dashboard");
           toast({
             title: "¡Bienvenido a la Manada!",
             description: "Tu cuenta ha sido creada y has iniciado sesión.",
           });
        } else {
           toast({
             title: "¡Paso casi listo!",
             description: "Revisa tu correo para confirmar tu cuenta y poder ingresar.",
             variant: "default",
           });
           setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace("/dashboard");
      }
    } catch (error: any) {
      let description = error.message || "Ha ocurrido un error inesperado.";
      if (description.includes("already registered")) {
        description = "Este correo ya está registrado en Manada Club.";
      } else if (description.includes("Invalid login credentials")) {
        description = "Las credenciales no coinciden. Intenta de nuevo.";
      }
      toast({
        variant: "destructive",
        title: isSignUp ? "Error al registrar" : "Error de acceso",
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error con Google",
        description: error.message || "No se pudo conectar con Google.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden selection:bg-primary/20 bg-white">
      {/* BACKGROUND IMAGE - Seamless Integration */}
      <div 
        className="fixed inset-0 bg-cover bg-center lg:bg-right transition-all duration-1000 z-0 opacity-20 lg:opacity-60" 
        style={{ 
          backgroundImage: "url('/login-illustration.png')",
          maskImage: 'radial-gradient(circle at center right, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center right, black 30%, transparent 80%)'
        }}
      />
      
      {/* Dynamic Overlay for depth and integration */}
      <div className="fixed inset-0 bg-gradient-to-tr from-white via-white/80 to-transparent z-1" />

      {/* CONTENT LAYER */}
      <div className="relative z-10 flex min-h-screen">
        {/* PANEL: Form with high precision layout */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 relative pt-24 pb-16 min-h-screen">
          
          {/* LOGO */}
          <div className="absolute top-8 left-6 sm:left-12 md:left-20 xl:left-32">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="bg-white p-2.5 rounded-2xl shadow-2xl border border-slate-100 transition-transform active:scale-90">
                <Image
                  src="/logo.png"
                  alt="MANADA CLUB Logo"
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none">MANADA</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">C L U B</span>
              </div>
            </div>
          </div>

          {/* HEADER TEXT - High Contrast & Premium Typography */}
          <div className="mt-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
              <span className="block h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Portal Oficial de Entrenamiento</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 leading-[0.9]">
              {isSignUp ? "Únete a la\nManada" : "Plataforma\nOficial."}
            </h1>
            <p className="text-lg text-slate-600 max-w-sm leading-relaxed font-medium">
              {isSignUp
                ? "Forma parte del método de adiestramiento líder en habla hispana."
                : "Entrena, progresa y conecta con tu mejor amigo hoy mismo."}
            </p>
          </div>

          <div className="max-w-md w-full mt-10">
            {/* SOCIAL AUTH */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-white shadow-xl hover:shadow-2xl transition-all hover:bg-slate-50 font-black text-slate-900 tracking-wide flex items-center justify-center gap-4 active:scale-[0.98]"
              onClick={handleGoogleLogin}
              disabled={!!loading}
            >
              {loading === "google" ? (
                <span className="animate-pulse">Conectando...</span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-6 w-6">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar con Google
                </>
              )}
            </Button>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.4em] font-black">
                <span className="bg-white px-6 text-slate-400">
                  O usa tus credenciales
                </span>
              </div>
            </div>

            {/* FORM */}
            <form className="space-y-6" onSubmit={handleEmailAuth}>
              {isSignUp && (
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tu Nombre</Label>
                    <Input
                      id="display-name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 font-bold"
                      placeholder="Ej. Ricardo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dog-name" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Perro</Label>
                    <Input
                      id="dog-name"
                      type="text"
                      required
                      value={dogName}
                      onChange={(e) => setDogName(e.target.value)}
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 font-bold"
                      placeholder="Ej. Haku"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email-address" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo electrónico</Label>
                <Input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 font-bold"
                  placeholder="ricardo@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-[11px] font-black text-primary hover:text-primary/70 transition-colors focus:outline-none uppercase tracking-widest mr-1"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all tracking-widest text-slate-900 font-bold"
                  placeholder="••••••••"
                />
              </div>

              <Button 
                type="submit" 
                disabled={!!loading} 
                className="w-full h-15 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all mt-6 py-4"
              >
                {loading === "email" ? (
                  <span className="animate-pulse">Verificando...</span>
                ) : isSignUp ? (
                  <span className="flex items-center gap-2">Crear mi cuenta <ArrowRight className="h-5 w-5" /></span>
                ) : (
                  <span className="flex items-center gap-2">Ingresar al portal <ArrowRight className="h-5 w-5 ml-1" /></span>
                )}
              </Button>
            </form>

            {/* TOGGLE MODE */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm font-bold text-slate-400">
                {isSignUp ? "¿Ya eres miembro?" : "¿Aún no tienes cuenta?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-black text-slate-950 hover:text-primary transition-colors focus:outline-none underline decoration-primary/40 underline-offset-8 hover:decoration-primary uppercase tracking-tighter ml-2"
                >
                  {isSignUp ? "Inicia sesión" : "Regístrate ahora"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Empty space on desktop for the mask to shine */}
        <div className="hidden lg:flex flex-1" />
      </div>
    </div>
  );
}
