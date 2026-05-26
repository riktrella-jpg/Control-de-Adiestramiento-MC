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
    <Card className="h-[500px] flex flex-col border-primary/20 shadow-lg">
      <CardHeader className="border-b pb-4 bg-primary/5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Chat con {userName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2" ref={scrollRef}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-center space-y-2 opacity-50">
              <MessageSquare className="h-8 w-8 mb-2" />
              <p className="text-sm">No hay mensajes.</p>
              <p className="text-xs">Envía el primer mensaje para iniciar la conversación.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                  <div 
                    className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="mt-4 pt-4 border-t flex gap-2 items-center">
          <Input
            placeholder="Escribe un mensaje al alumno..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 text-sm focus-visible:ring-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isLoading} className="shrink-0 gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
