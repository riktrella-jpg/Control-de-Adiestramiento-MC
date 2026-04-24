'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/supabase/client';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type Filter = {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: any;
};

export type OrderBy = {
  column: string;
  ascending?: boolean;
};

/**
 * @param tableName The name of the Supabase table
 * @param filters Array of filters to apply
 * @param orderBy Optional ordering
 */
export function useCollection<T = any>(
  tableName: string | null | undefined,
  filters: Filter[] = [],
  orderBy?: OrderBy
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Stable refs to avoid re-running effect on every render when caller passes inline arrays
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const orderByRef = useRef(orderBy);
  orderByRef.current = orderBy;

  // Stringify for dependency comparison only
  const filterKey = JSON.stringify(filters);
  const orderKey = orderBy ? JSON.stringify(orderBy) : 'none';

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const fetchData = async () => {
      let query = supabase.from(tableName).select('*');

      for (const f of filtersRef.current) {
        // Skip filters where value is undefined/null to avoid bad queries
        if (f.value === undefined || f.value === null) continue;
        if (f.operator === 'eq') query = query.eq(f.column, f.value);
        if (f.operator === 'neq') query = query.neq(f.column, f.value);
        if (f.operator === 'gt') query = query.gt(f.column, f.value);
        if (f.operator === 'lt') query = query.lt(f.column, f.value);
        if (f.operator === 'gte') query = query.gte(f.column, f.value);
        if (f.operator === 'lte') query = query.lte(f.column, f.value);
        if (f.operator === 'in') query = query.in(f.column, f.value);
      }

      const ord = orderByRef.current;
      if (ord) {
        query = query.order(ord.column, { ascending: ord.ascending ?? true });
      }

      const { data: result, error: fetchError } = await query;

      if (isMounted) {
        if (fetchError) {
          setError(new Error(fetchError.message));
        } else {
          setData(result as WithId<T>[]);
        }
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channelName = `${tableName}_changes_${filterKey}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, filterKey, orderKey]);

  // We can return a refetch wrapper that just calls the same logic
  const refetch = async () => {
    if (!tableName) return;
    setIsLoading(true);
    let query = createClient().from(tableName).select('*');
    for (const f of filtersRef.current) {
      if (f.value === undefined || f.value === null) continue;
      if (f.operator === 'eq') query = query.eq(f.column, f.value);
      if (f.operator === 'neq') query = query.neq(f.column, f.value);
      if (f.operator === 'gt') query = query.gt(f.column, f.value);
      if (f.operator === 'lt') query = query.lt(f.column, f.value);
      if (f.operator === 'gte') query = query.gte(f.column, f.value);
      if (f.operator === 'lte') query = query.lte(f.column, f.value);
      if (f.operator === 'in') query = query.in(f.column, f.value);
    }
    const ord = orderByRef.current;
    if (ord) query = query.order(ord.column, { ascending: ord.ascending ?? true });
    
    const { data: result, error: fetchError } = await query;
    if (fetchError) {
      setError(new Error(fetchError.message));
    } else {
      setData(result as WithId<T>[]);
    }
    setIsLoading(false);
  };

  return { data, isLoading, error, refetch };
}
