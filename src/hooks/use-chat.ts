import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/supabase/client';
import { useUser } from '@/hooks/use-user';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useChat(otherUserId?: string) {
  const { user } = useUser();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !otherUserId) {
        setIsLoading(false);
        return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, otherUserId, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user || !otherUserId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          // Note: RLS handles security, we subscribe to all messages and filter locally or trust RLS
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's relevant to this chat
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId, supabase]);

  const sendMessage = async (content: string) => {
    if (!user || !otherUserId || !content.trim()) return null;

    try {
      const newMessage = {
        sender_id: user.id,
        receiver_id: otherUserId,
        content: content.trim(),
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message);
      throw err;
    }
  };

  const markAsRead = async () => {
    if (!user || !otherUserId) return;
    
    try {
        await supabase
            .from('messages')
            .update({ read: true })
            .eq('receiver_id', user.id)
            .eq('sender_id', otherUserId)
            .eq('read', false);
    } catch (err) {
        console.error("Error marking messages as read:", err);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages
  };
}
