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

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  createdAt: string;
  author_id: string;
}

import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Header } from "@/components/dashboard/header";

export default function EthologyPage() {
  const { userProfile, user } = useAppState();
  const { data: articles, isLoading, refetch } = useCollection<Article>("articles", [], { column: "createdAt", ascending: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

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
      // 1. Upload to Storage
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

      // 2. Save Metadata to DB
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
    <SidebarProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr] w-full">
        <Sidebar className="hidden border-e bg-card lg:block" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col w-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                  <BookOpen className="h-10 w-10 text-primary" />
                  Etología en Manada
                </h1>
                <p className="text-muted-foreground mt-2">
                  Explora artículos y recursos técnicos sobre el comportamiento y bienestar canino.
                </p>
              </div>

              {isAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Upload className="h-4 w-4" /> Subir Artículo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Compartir Conocimiento</DialogTitle>
                      <DialogDescription>Sube un archivo HTML para que la manada pueda aprender de él.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Título del Artículo</Label>
                        <Input name="title" placeholder="Ej. El lenguaje de las señales de calma" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción Corta</Label>
                        <Input name="description" placeholder="Breve resumen de lo que trata." />
                      </div>
                      <div className="space-y-2">
                        <Label>Archivo HTML</Label>
                        <Input type="file" name="file" accept=".html" required className="cursor-pointer" />
                      </div>
                      <Button type="submit" className="w-full" disabled={isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Publicar Artículo
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar artículos..." 
                className="pl-10 h-12 rounded-2xl bg-muted/30 border-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(article => (
                  <Card key={article.id} className="group hover:border-primary/50 transition-all border-primary/10 overflow-hidden bg-card flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] uppercase font-bold">Artículo Técnico</Badge>
                        <FileCode className="h-5 w-5 text-primary opacity-40" />
                      </div>
                      <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs mt-1">{article.description || "Sin descripción proporcionada."}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-[10px] text-muted-foreground italic">
                        Publicado el: {format(new Date(article.createdAt), "d 'de' MMMM", { locale: es })}
                      </p>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full text-xs font-bold gap-2"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <Eye className="h-4 w-4" /> Leer Ahora
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(article)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}

                {filteredArticles.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10">
                     <Info className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-muted-foreground">No hemos encontrado artículos</h3>
                     <p className="text-sm text-muted-foreground">Pronto habrá contenido nuevo sobre etología aquí.</p>
                  </div>
                )}
              </div>
            )}

            {/* Article Viewer Modal */}
            <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
              <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-950">
                <DialogHeader className="p-6 border-b shrink-0 bg-background">
                  <DialogTitle className="text-2xl font-bold text-primary">{selectedArticle?.title}</DialogTitle>
                  <DialogDescription>{selectedArticle?.description}</DialogDescription>
                </DialogHeader>
                <div className="flex-1 bg-white relative overflow-hidden">
                  {selectedArticle && (
                    <ArticleRenderer url={selectedArticle.url} title={selectedArticle.title} />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
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
