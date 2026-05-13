"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/hooks/use-collection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/supabase/client";
import { BookOpen, FileCode, Upload, Search, Eye, Trash2, Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useAppState } from "@/context/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  createdAt: string;
  author_id: string;
}

const getArticleImage = (title: string) => {
  const t = title.toLowerCase();
  // Specific matches first
  if (t.includes("huella") || t.includes("sangre")) {
    return "/dog-paw-hero.png";
  }
  if (t.includes("neurolog") || t.includes("temblor") || t.includes("petardo")) {
    return "/dog-neurology-hero.png";
  }
  if (t.includes("mitos") || t.includes("castigo")) {
    return "/dog-myths-hero.png";
  }
  if (t.includes("47 hechos") || t.includes("ciencia") || t.includes("cient")) {
    return "/dog-science-hero.png";
  }
  if (t.includes("culpa") || t.includes("educaci")) {
    return "/dog-education-hero.png";
  }
  if (t.includes("reactividad")) {
    return "/dog-reactivity-hero.png";
  }
  if (t.includes("luca") || t.includes("duelo") || t.includes("gratitud")) {
    return "/dog-luca-hero.png";
  }
  if (t.includes("emociones") || t.includes("emocion")) {
    return "/dog-emotions-hero.png";
  }
  if (t.includes("caso") || t.includes("estudio")) {
    return "/dog-caso-estudio.png";
  }
  if (t.includes("masterclass") || t.includes("criticidad")) {
    return "/dog-masterclass-hero.png";
  }
  if (t.includes("introducci") || t.includes("perro esa")) {
    return "/dog-intro-hero.png";
  }
  // Episodios — match specific numbers
  if (t.includes("episodio 1") || t.includes("ep. 1") || t.includes("ep1")) {
    return "/dog-episodio-1.png";
  }
  if (t.includes("episodio 2") || t.includes("ep. 2") || t.includes("ep2")) {
    return "/dog-episodio-2.png";
  }
  if (t.includes("episodio 3") || t.includes("ep. 3") || t.includes("ep3")) {
    return "/dog-episodio-3.png";
  }
  if (t.includes("episodio 4") || t.includes("ep. 4") || t.includes("ep4")) {
    return "/dog-episodio-4.png";
  }
  if (t.includes("episodio 5") || t.includes("ep. 5") || t.includes("ep5")) {
    return "/dog-episodio-5.png";
  }
  if (t.includes("episodio 6") || t.includes("ep. 6") || t.includes("ep6")) {
    return "/dog-episodio-6.png";
  }
  return "/dog-article-hero.png";
};

export default function EthologyPage() {
  const { userProfile, user } = useAppState();
  const [mounted, setMounted] = useState(false);
  const { data: articles, isLoading, refetch } = useCollection<Article>("articles", [], { column: "createdAt", ascending: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'riktrella@gmail.com';

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file || !title) return;

    setIsUploading(true);
    try {
      const fileName = `articles/${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          contentType: 'text/html',
          upsert: true
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('articles').insert({
        title,
        description,
        url: publicUrl,
        category: "Etología",
        author_id: user?.id,
        createdAt: new Date().toISOString()
      });

      if (dbError) throw dbError;

      toast({ title: "Artículo subido", description: "El artículo de etología ya está disponible." });
      refetch();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (article: Article) => {
    if (!window.confirm("¿Seguro que quieres eliminar este artículo?")) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', article.id);
      if (error) throw error;
      toast({ title: "Artículo eliminado" });
      refetch();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const filteredArticles = articles?.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-12 max-w-7xl mx-auto pb-32 w-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary px-3 py-1 uppercase tracking-widest text-[10px] font-black">
              Biblioteca Técnica
            </Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">
            Etología <span className="text-primary">en Manada</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl font-medium tracking-wide">
            Recursos especializados y artículos técnicos sobre el comportamiento, bienestar y comunicación consciente del binomio canino.
          </p>
        </div>

        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wider shadow-[0_10px_30px_rgba(212,175,55,0.3)] gap-3 transition-all hover:scale-105 active:scale-95 border-none">
                <Upload className="h-5 w-5" /> Subir Artículo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg rounded-[2.5rem] p-8 shadow-2xl">
              <DialogHeader className="space-y-4 mb-6">
                <div className="w-12 h-1 bg-primary rounded-full" />
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Compartir Conocimiento</DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium italic">
                  Sube un archivo HTML para expandir la sabiduría técnica de la manada.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-primary/80">Título del Artículo</Label>
                  <Input name="title" placeholder="Ej. El lenguaje de las señales de calma" required className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-primary/80">Descripción Corta</Label>
                  <Input name="description" placeholder="Breve resumen de lo que trata." className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-primary/80">Archivo HTML</Label>
                  <Input type="file" name="file" accept=".html" required className="bg-white/5 border-white/10 h-12 rounded-xl cursor-pointer file:bg-primary/10 file:text-primary file:border-none file:px-4 file:rounded-lg file:mr-4 file:text-[10px] file:font-black file:uppercase" />
                </div>
                <Button type="submit" className="w-full h-14 rounded-xl bg-white text-black hover:bg-primary font-black uppercase tracking-widest transition-colors" disabled={isUploading}>
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <BookOpen className="h-5 w-5 mr-2" />}
                  Publicar en la Biblioteca
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <div className="relative group max-w-md mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000" />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Buscar conocimiento..." 
          className="pl-14 h-14 rounded-[2rem] bg-black/40 backdrop-blur-md border border-white/5 group-focus-within:border-primary/50 text-white placeholder:text-white/20 transition-all shadow-2xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3].map(i => <div key={i} className="h-80 animate-pulse rounded-[2.5rem] bg-white/5 border border-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                className="group relative cursor-pointer rounded-[2.5rem] overflow-hidden h-80 flex flex-col justify-between border border-white/5 shadow-2xl"
                style={{ isolation: "isolate" }}
                onClick={() => setSelectedArticle(article)}
              >
                {/* ── Background image ── */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url('${getArticleImage(article.title)}')` }}
                />
                
                {/* ── Overlays ── */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-transparent" />
                
                {/* ── Interactive Glow ── */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: "radial-gradient(circle at center, rgba(212,175,55,0.1) 0%, transparent 70%)" }}
                />

                {/* ── TOP: Category & Admin ── */}
                <div className="relative z-10 flex items-start justify-between p-7">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 rounded-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/90 drop-shadow-md">
                      Artículo Técnico
                    </span>
                  </div>
                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-white/40 hover:text-red-400 border border-white/10"
                      onClick={(e) => { e.stopPropagation(); handleDelete(article); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>

                {/* ── BOTTOM: Content ── */}
                <div className="relative z-10 p-7 space-y-4">
                  <div>
                    <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-2xl mb-2">
                      {article.title}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/80 mb-3 flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-primary/40" />
                      {article.description || "Conocimiento que transforma"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2">
                      <div className="p-1.5 rounded-lg bg-primary/20">
                        <FileCode className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                        {article.createdAt ? format(new Date(article.createdAt), "d 'de' MMMM", { locale: es }) : "Hoy"}
                      </span>
                    </div>

                    {/* CTA Overlay */}
                    <div className="flex items-center gap-2 rounded-2xl px-5 py-2.5 bg-primary text-black
                                    opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0
                                    transition-all duration-500 shadow-[0_10px_30px_rgba(212,175,55,0.4)] font-black uppercase text-[11px] tracking-wider">
                      <Eye className="h-4 w-4" />
                      Leer Ahora
                    </div>
                  </div>
                </div>

                {/* ── Border Shine ── */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-primary/20 rounded-[2.5rem] transition-colors duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredArticles.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10">
               <Info className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-muted-foreground">No hemos encontrado artículos</h3>
               <p className="text-sm text-muted-foreground">Pronto habrá contenido nuevo sobre etología aquí.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0 overflow-hidden bg-black border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)]">
          <DialogHeader className="p-8 border-b border-white/5 shrink-0 bg-black/40 backdrop-blur-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="flex items-center gap-4 mb-2">
              <div className="w-2 h-8 rounded-full bg-primary" />
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white">{selectedArticle?.title}</DialogTitle>
            </div>
            <DialogDescription className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">
              {selectedArticle?.description || "Documentación Técnica del Sistema"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 bg-white relative overflow-hidden m-4 rounded-[2rem] shadow-inner">
            {selectedArticle && (
              <ArticleRenderer url={selectedArticle.url} title={selectedArticle.title} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArticleRenderer({ url, title }: { url: string; title: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    }
    if (url) fetchContent();
  }, [url]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <iframe 
      srcDoc={content || ""} 
      className="w-full h-full border-none"
      title={title}
    />
  );
}
