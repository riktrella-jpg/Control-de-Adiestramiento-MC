"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from "@/context/app-state-provider";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AdminChatPanelProps {
  userId: string;
  userName: string;
}

export function AdminChatPanel({ userId, userName }: AdminChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAppState();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, sendMessage, markAsRead } = useChat(userId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      markAsRead();
    }
  }, [messages, markAsRead]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage;
    setNewMessage("");
    try {
      await sendMessage(content);
    } catch (err) {
      setNewMessage(content);
    }
  };

  return (
    <Card className="h-[500px] flex flex-col border-white/10 shadow-2xl bg-black/40 backdrop-blur-md relative overflow-hidden group/chat">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover/chat:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      <CardHeader className="border-b border-white/10 pb-4 bg-white/5 backdrop-blur-sm z-10 relative">
        <CardTitle className="text-sm font-black flex items-center gap-2 tracking-widest uppercase text-white/90">
          <MessageSquare className="h-4 w-4 text-primary animate-pulse" />
          Chat con {userName}
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
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">Sin Contacto Previo</p>
                <p className="text-[10px] mt-1">Inicia la conversación enviando un mensaje o recordatorio.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender_id === user?.id;
              const isLast = index === messages.length - 1;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  <div 
                    className={`px-4 py-2.5 max-w-[85%] text-xs font-medium leading-relaxed shadow-md backdrop-blur-sm ${
                      isMe 
                        ? 'bg-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm border border-primary/50' 
                        : 'bg-white/10 text-white rounded-2xl rounded-tl-sm border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[9px] text-white/40 px-2 font-medium tracking-wider ${isLast ? 'animate-pulse' : ''}`}>
                    {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/20 flex gap-2 items-center backdrop-blur-md">
          <Input
            placeholder="Escribe un comentario o recordatorio..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 text-xs h-10 bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 placeholder:text-white/30 text-white transition-all rounded-xl"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isLoading} 
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/80 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
