// hooks/useCatalogJobs.ts
import { Enums, supabase, Tables } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// Use the generated type for the cataloging_jobs table
export type CatalogJob = Tables<'cataloging_jobs'>;

// Use the generated enum for status
export type CatalogJobStatus = Enums<'cataloging_job_status'>;

// Custom hook to fetch jobs and subscribe to real-time updates
export const useCatalogJobs = (organizationId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['catalog-jobs', organizationId];

  // Fetch initial data
  const { data, isLoading, error, refetch } = useQuery<CatalogJob[]>({
    queryKey: queryKey,
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('cataloging_jobs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!organizationId,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Subscribe to real-time changes
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`catalog_jobs:${organizationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cataloging_jobs', filter: `organization_id=eq.${organizationId}` },
        (payload) => {
          console.log('📡 Real-time change received!', {
            eventType: payload.eventType,
            table: payload.table,
            jobId: payload.new?.job_id || payload.old?.job_id,
            newStatus: payload.new?.status,
            oldStatus: payload.old?.status
          });
          // Invalidate the query to force a refetch, which will update the UI
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient, queryKey]);

  return { data, isLoading, error, refetch };
};