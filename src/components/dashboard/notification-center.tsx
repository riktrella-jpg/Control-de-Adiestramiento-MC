"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  MessageSquare, 
  Info, 
  X,
  Clock
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/supabase/client";
import { useUser } from "@/hooks/use-user";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
  link?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();
  const supabase = createClient();

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
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

    // Setup real-time listener
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    fetchNotifications();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-black/90 border-white/10 backdrop-blur-xl" align="end">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h4 className="text-sm font-bold uppercase italic text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notificaciones
          </h4>
          {unreadCount > 0 && (
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] h-7 px-2 text-primary hover:bg-primary/10"
                onClick={markAllAsRead}
            >
                Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">No tienes notificaciones por ahora.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  {!n.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>
                  )}
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {n.type === 'feedback' ? (
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      ) : n.type === 'achievement' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Info className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white leading-none">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{n.message}</p>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground pt-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {notifications.length > 0 && (
            <div className="p-2 border-t border-white/5">
                <Button variant="ghost" className="w-full h-8 text-[10px] text-muted-foreground hover:text-white" asChild>
                    <Link href="/notifications">Ver todo el historial</Link>
                </Button>
            </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
