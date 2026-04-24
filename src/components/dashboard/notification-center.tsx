"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, MessageSquare, Info, Clock,
  Heart, ChevronRight, Flame, PawPrint
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/supabase/client";
import { useUser } from "@/hooks/use-user";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'feedback' | 'engagement' | 'achievement' | 'info';
  created_at: string;
  metadata?: { suggestedTasks?: string[]; level?: '3_days' | '15_days' };
}

function getTypeConfig(type: string, level?: string) {
  if (type === 'engagement' && level === '15_days') {
    return { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Re-Conexión' };
  }
  if (type === 'engagement') {
    return { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Motivación IA' };
  }
  if (type === 'feedback') {
    return { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Feedback' };
  }
  if (type === 'achievement') {
    return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Logro' };
  }
  return { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'Info' };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClient();

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetchNotifications)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    fetchNotifications();
    setExpanded(prev => prev === id ? null : id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    fetchNotifications();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black border-2 border-background"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-black/95 border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> 
            Notificaciones
            {unreadCount > 0 && <Badge className="bg-primary text-black text-[10px] font-black h-4 px-1.5">{unreadCount}</Badge>}
          </h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-primary hover:bg-primary/10 font-bold uppercase" onClick={markAllAsRead}>
              Marcar todas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[420px]">
          <div className="flex flex-col p-2 gap-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <PawPrint className="h-10 w-10 text-muted-foreground/20 mb-3 animate-bounce" />
                <p className="text-xs font-bold text-muted-foreground">Todo tranquilo en la Manada</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">Las notificaciones aparecerán aquí.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = getTypeConfig(n.type, n.metadata?.level);
                const Icon = config.icon;
                const isExpanded = expanded === n.id;
                const hasTasks = n.metadata?.suggestedTasks && n.metadata.suggestedTasks.length > 0;

                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${!n.read ? config.border + ' ' + config.bg : 'border-white/5 bg-white/[0.02]'} hover:bg-white/5`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex gap-3 p-3">
                      <div className={`mt-0.5 p-2 rounded-lg ${config.bg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-black leading-tight ${!n.read ? 'text-white' : 'text-muted-foreground'}`}>{n.title}</p>
                          <Badge variant="outline" className={`text-[8px] shrink-0 font-black uppercase ${config.color} border-current opacity-60 px-1 h-4`}>{config.label}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{n.message}</p>
                        
                        {/* Suggested Tasks - expandable */}
                        {hasTasks && (
                          <AnimatePresence>
                            {isExpanded ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-2 space-y-1.5"
                              >
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/70">🎯 Tareas sugeridas para hoy</p>
                                {n.metadata!.suggestedTasks!.map((task, i) => (
                                  <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-primary font-black text-[10px]">{i + 1}</span>
                                    <span className="text-[11px] text-muted-foreground">{task}</span>
                                  </div>
                                ))}
                                <Link href="/tasks" className="flex items-center gap-1 text-[10px] text-primary font-bold hover:underline mt-1">
                                  Registrar tarea <ChevronRight className="h-3 w-3" />
                                </Link>
                              </motion.div>
                            ) : (
                              <p className="text-[10px] text-primary font-bold flex items-center gap-1 mt-1">
                                <ChevronRight className="h-3 w-3" /> Ver tareas sugeridas
                              </p>
                            )}
                          </AnimatePresence>
                        )}

                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground/50 pt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
