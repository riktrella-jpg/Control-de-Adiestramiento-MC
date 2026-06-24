"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from "@/context/app-state-provider";
import { createClient } from "@/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { user, isAdmin } = useAppState();
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  // No need for widget if the user is an admin
  // Admins use the AdminChatPanel in the user's Control Center
  useEffect(() => {
    if (isAdmin || !user) return;

    const fetchAdmin = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();

      if (!error && data) {
        setAdminId(data.id);
      }
    };

    fetchAdmin();
  }, [isAdmin, user, supabase]);

  const { messages, isLoading, sendMessage, markAsRead } = useChat(adminId || undefined);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      markAsRead();
    }
  }, [messages, isOpen, markAsRead]);

  if (isAdmin || !user || !adminId) return null;

  const unreadCount = messages.filter(m => !m.read && m.receiver_id === user.id).length;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage;
    setNewMessage("");
    try {
      await sendMessage(content);
    } catch (err) {
      // Revert if error
      setNewMessage(content);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        size="icon"
        className="fixed top-1/2 right-4 -translate-y-1/2 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 z-50 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed top-1/2 right-20 -translate-y-1/2 w-80 sm:w-96 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden border-white/10 h-[500px] max-h-[calc(100vh-40px)] animate-in slide-in-from-right-8 fade-in duration-300 bg-black/60 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />
          
          <CardHeader className="bg-white/5 border-b border-white/10 p-4 pb-4 relative z-10 backdrop-blur-md">
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-white/90">
              <MessageCircle className="h-4 w-4 text-primary animate-pulse" />
              Entrenador
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden relative z-10">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" ref={scrollRef}>
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center space-y-3 opacity-40">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">¿Dudas sobre el plan?</p>
                    <p className="text-[10px] mt-1">Escribe aquí cualquier consulta o revisa los recordatorios.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === user.id;
                  const isLast = index === messages.length - 1;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                      <div 
                        className={`px-4 py-2.5 max-w-[85%] text-xs font-medium leading-relaxed shadow-lg backdrop-blur-sm ${
                          isMe 
                            ? 'bg-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm border border-primary/50' 
                            : 'bg-white/10 text-white rounded-2xl rounded-tl-sm border border-white/5'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className={`text-[9px] text-white/40 px-2 font-medium tracking-wider ${isLast && !isMe ? 'animate-pulse' : ''}`}>
                        {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/20 flex gap-2 items-center backdrop-blur-md">
              <Input
                placeholder="Escribe tu mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 text-xs h-10 bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 placeholder:text-white/30 text-white transition-all rounded-xl"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim() || isLoading} 
                className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/80 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
