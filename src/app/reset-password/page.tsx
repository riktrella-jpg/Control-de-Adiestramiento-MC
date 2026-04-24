"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/supabase/client";
import { ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a recovery session
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, they might have manually navigated here
        toast({
          variant: "destructive",
          title: "Acceso inválido",
          description: "No se ha encontrado una sesión de recuperación válida. Por favor, solicita un nuevo enlace.",
        });
        router.push("/login");
      }
      setVerifying(false);
    }
    checkSession();
  }, [supabase, router, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Las contraseñas no coinciden",
        description: "Por favor revisa que ambas sean iguales.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Contraseña muy corta",
        description: "Debe tener al menos 6 caracteres.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Nueva contraseña establecida",
        description: "Ya puedes ingresar con tu nueva clave de acceso.",
      });
      
      // Sign out to force clean login state
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message || "No se pudo cambiar la contraseña.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 relative z-10 py-16">
        
        {/* LOGO */}
        <div className="absolute top-8 left-6 sm:left-12 md:left-20 xl:left-32">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Image
                src="/logo.png"
                alt="MANADA CLUB"
                width={36}
                height={36}
                className="rounded-lg object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">MANADA CLUB</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Restablecer contraseña.
          </h1>
          <p className="text-base text-muted-foreground max-w-md">
            Ingresa tu nueva clave de acceso debajo. Te recomendamos usar una que no hayas usado antes.
          </p>
        </div>

        <form className="mt-8 space-y-5 max-w-md" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 rounded-xl font-bold mt-4 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <span className="animate-pulse">Actualizando contraseña...</span>
            ) : (
              <>Guardar Nueva Clave <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>

        <div className="mt-12 p-5 bg-muted/30 rounded-2xl flex gap-4 border border-border/40">
           <div className="bg-primary/5 p-3 rounded-xl h-fit">
              <ShieldCheck className="h-6 w-6 text-primary" />
           </div>
           <div>
              <h4 className="font-bold text-sm">Tu cuenta está segura</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                 Al cambiar tu contraseña, se cerrarán todas las sesiones activas en otros dispositivos por motivos de seguridad. 
              </p>
           </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-muted/20 items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80" 
          style={{ backgroundImage: "url('/login-illustration.png')" }}
          role="img"
          aria-label="Seguridad y confianza"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/95" />
      </div>
    </div>
  );
}
