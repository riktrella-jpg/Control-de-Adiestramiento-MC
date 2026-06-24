"use client";

import { motion } from "framer-motion";
import { Play, Search, Star, Heart, ChevronRight } from "lucide-react";
import Image from "next/image";

const CATEGORIES = [
  { id: "all", label: "🎯 Todos" },
  { id: "puppies", label: "🐶 Cachorros" },
  { id: "obedience", label: "📚 Obediencia" },
  { id: "anxiety", label: "🧘 Ansiedad" },
  { id: "esa", label: "💛 Apoyo Emocional" },
  { id: "agility", label: "⚡ Agility" },
  { id: "behavior", label: "🔧 Conducta" },
];

const VIDEOS = [
  { id: 1, title: "Fundamentos del Vínculo", category: "obedience", duration: "8:24", thumb: "https://picsum.photos/seed/mc1/300/450", featured: true },
  { id: 2, title: "Cómo calmar la ansiedad de separación", category: "anxiety", duration: "12:10", thumb: "https://picsum.photos/seed/mc2/300/450" },
  { id: 3, title: "Primeras semanas con tu cachorro", category: "puppies", duration: "15:32", thumb: "https://picsum.photos/seed/mc3/300/450" },
  { id: 4, title: "Técnica MANADA: Autocontrol", category: "obedience", duration: "6:45", thumb: "https://picsum.photos/seed/mc4/300/450" },
  { id: 5, title: "Perro de Apoyo Emocional: Guía", category: "esa", duration: "20:15", thumb: "https://picsum.photos/seed/mc5/300/450" },
  { id: 6, title: "Agility para principiantes", category: "agility", duration: "9:50", thumb: "https://picsum.photos/seed/mc6/300/450" },
  { id: 7, title: "Manejo de la reactividad", category: "behavior", duration: "11:20", thumb: "https://picsum.photos/seed/mc7/300/450" },
  { id: 8, title: "Socialización correcta", category: "puppies", duration: "7:35", thumb: "https://picsum.photos/seed/mc8/300/450" },
];

import { useState } from "react";

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filtered = activeCategory === "all"
    ? VIDEOS
    : VIDEOS.filter((v) => v.category === activeCategory);

  const featured = VIDEOS.find((v) => v.featured);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Videos
        </h1>
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
          Biblioteca de entrenamiento MANADA
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="Buscar videos..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl text-sm font-medium text-white placeholder-white/25 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        />
      </motion.div>

      {/* Featured video */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-[2rem] cursor-pointer"
          style={{ height: "200px" }}
        >
          <Image
            src={featured.thumb}
            alt={featured.title}
            fill
            className="object-cover filter-vintage-art"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.3) 100%)" }}
          />
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: "rgba(16,185,129,0.3)", color: "#10B981", border: "1px solid rgba(16,185,129,0.4)" }}
          >
            ⭐ Destacado
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-0.5">Obediencia</p>
              <h3 className="text-base font-black text-white leading-tight">{featured.title}</h3>
              <p className="text-[10px] text-white/40 mt-0.5">{featured.duration}</p>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 ml-3"
              style={{ background: "rgba(16,185,129,0.9)", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}
            >
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Categories scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              onClick={() => setActiveCategory(cat.id)}
              className="h-9 px-4 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all press-effect"
              style={{
                background: activeCategory === cat.id
                  ? "linear-gradient(135deg, #10B981, #059669)"
                  : "rgba(255,255,255,0.04)",
                color: activeCategory === cat.id ? "white" : "rgba(255,255,255,0.4)",
                border: activeCategory === cat.id
                  ? "1px solid transparent"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: activeCategory === cat.id
                  ? "0 4px 15px rgba(16,185,129,0.3)"
                  : "none",
              }}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Videos grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.06, type: "spring", stiffness: 350, damping: 25 }}
            className="relative overflow-hidden rounded-[1.5rem] cursor-pointer"
            style={{ aspectRatio: "2/3" }}
          >
            <Image
              src={video.thumb}
              alt={video.title}
              fill
              className="object-cover filter-vintage-art"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 35%, transparent 70%)" }}
            />

            {/* Favorite */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(video.id); }}
              className="absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <Heart
                className="h-3.5 w-3.5"
                style={{
                  color: favorites.includes(video.id) ? "#EF4444" : "rgba(255,255,255,0.4)",
                  fill: favorites.includes(video.id) ? "#EF4444" : "transparent",
                }}
              />
            </button>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center opacity-70"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
              >
                <Play className="h-4 w-4 text-white fill-white ml-0.5" />
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[10px] font-black text-white leading-tight line-clamp-2">
                {video.title}
              </p>
              <p className="text-[9px] text-white/40 mt-0.5">{video.duration}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coming soon note */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}
      >
        <p className="text-[10px] text-white/25 font-medium">
          Más videos disponibles próximamente 🎬
        </p>
      </div>
    </div>
  );
}
