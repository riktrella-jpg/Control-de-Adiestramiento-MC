import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/supabase/client';
import { useUser } from '@/hooks/use-user';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  _optimistic?: boolean; // flag for messages not yet confirmed by server
}

export function useChat(otherUserId?: string) {
  const { user } = useUser();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track optimistic IDs to avoid duplicates when real-time confirms them
  const optimisticIds = useRef<Set<string>>(new Set());

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

  // Real-time subscription with a unique channel name per conversation pair
  useEffect(() => {
    if (!user || !otherUserId) return;

    // Sort IDs so the channel name is always the same regardless of direction
    const ids = [user.id, otherUserId].sort();
    const channelName = `chat:${ids[0]}:${ids[1]}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;

          // Only handle messages relevant to this conversation
          const isRelevant =
            (newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id);

          if (!isRelevant) return;

          // If this was our own optimistic message, replace it
          // (it will share the same content; we match by content + sender)
          setMessages((prev) => {
            // Check if there's an optimistic version of this message
            const optimisticIndex = prev.findIndex(
              (m) => m._optimistic && m.sender_id === newMsg.sender_id && m.content === newMsg.content
            );

            if (optimisticIndex !== -1) {
              // Replace the optimistic message with the confirmed one
              const updated = [...prev];
              updated[optimisticIndex] = newMsg;
              return updated;
            }

            // Avoid duplicates from server
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId, supabase]);

  const sendMessage = async (content: string) => {
    if (!user || !otherUserId || !content.trim()) return null;

    // OPTIMISTIC UPDATE: Add message to local state immediately
    const tempId = `optimistic_${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content: content.trim(),
      read: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    optimisticIds.current.add(tempId);

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

      if (error) {
        // Rollback optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw error;
      }

      // Trigger email notification in the background
      try {
        const senderName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Un usuario';
        fetch('/api/chat-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderName,
            receiverId: otherUserId,
            messageContent: content.trim()
          })
        }).catch(e => console.error("Error triggering chat notification:", e));
      } catch (notifyErr) {
        console.error("Failed to construct notification payload:", notifyErr);
      }

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
