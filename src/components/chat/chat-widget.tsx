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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 z-50 hover:scale-105"
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
        <Card className="fixed bottom-24 right-6 w-80 sm:w-96 shadow-2xl z-50 flex flex-col overflow-hidden border-primary/20 h-[500px] max-h-[calc(100vh-120px)] animate-in slide-in-from-bottom-5">
          <CardHeader className="bg-primary/10 border-b p-4 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Chat con el Entrenador
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 flex flex-col overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2" ref={scrollRef}>
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center space-y-2 opacity-50">
                  <MessageCircle className="h-8 w-8 mb-2" />
                  <p className="text-xs">No hay mensajes aún.</p>
                  <p className="text-xs">Escribe aquí cualquier duda que tengas sobre el entrenamiento.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
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
                      <span className="text-[9px] text-muted-foreground px-1">
                        {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="mt-4 pt-2 flex gap-2 items-center">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 text-sm bg-muted/50 border-transparent focus-visible:ring-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-10 w-10 shrink-0 rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
