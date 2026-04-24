'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/supabase/client';

export type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 
 * @param tableName The name of the Supabase table
 * @param id The id of the row to fetch
 */
export function useDoc<T = any>(
  tableName: string | null | undefined,
  id: string | null | undefined
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!tableName && !!id);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!tableName || !id) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (isMounted) {
        if (error) {
          if (error.code === 'PGRST116') {
             // Not found
             setData(null);
          } else {
             setError(new Error(error.message));
          }
        } else {
          setData(data as WithId<T>);
        }
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for this specific document
    const channelName = `${tableName}_${id}_changes_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName, filter: `id=eq.${id}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setData(null);
        } else {
          setData(payload.new as WithId<T>);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [tableName, id]);

  const refetch = async () => {
    if (!tableName || !id) return;
    setIsLoading(true);
    const { data: fetchedData, error: fetchError } = await createClient()
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        setData(null);
      } else {
        setError(new Error(fetchError.message));
      }
    } else {
      setData(fetchedData as WithId<T>);
    }
    setIsLoading(false);
  };

  return { data, isLoading, error, refetch };
}
