import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useCatalogJobs, CatalogJob, CatalogJobStatus } from '@/hooks/useCatalogJobs';

interface JobStatusSnackbarsOptions {
  organizationId: string;
  enableNotifications?: boolean;
}

export const useJobStatusSnackbars = ({ 
  organizationId, 
  enableNotifications = true 
}: JobStatusSnackbarsOptions) => {
  const { data: jobs } = useCatalogJobs(organizationId);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  
  // Track previous job states to detect changes
  const previousJobsRef = useRef<Map<string, CatalogJobStatus>>(new Map());
  const sessionJobsRef = useRef<Set<string>>(new Set());

  // Mark jobs created in current session for notifications
  const markJobAsSessionJob = (jobId: string) => {
    sessionJobsRef.current.add(jobId);
  };

  useEffect(() => {
    if (!jobs || !enableNotifications) return;

    const currentJobs = new Map<string, CatalogJobStatus>();
    
    jobs.forEach((job) => {
      currentJobs.set(job.job_id, job.status);
      
      // Check if this job's status has changed
      const previousStatus = previousJobsRef.current.get(job.job_id);
      
      if (previousStatus && previousStatus !== job.status) {
        // Only show notifications for jobs from current session
        if (sessionJobsRef.current.has(job.job_id)) {
          handleStatusChange(job, previousStatus, job.status);
        }
      }
    });

    // Update the reference for next comparison
    previousJobsRef.current = currentJobs;
  }, [jobs, enableNotifications]);

  const handleStatusChange = (
    job: CatalogJob, 
    previousStatus: CatalogJobStatus, 
    newStatus: CatalogJobStatus
  ) => {
    switch (newStatus) {
      case 'processing':
        if (previousStatus === 'pending') {
          showSnackbar('warning', 'Processing your book images...', {
            duration: 4000
          });
        }
        break;

      case 'completed':
        if (previousStatus === 'processing') {
          showSnackbar('success', 'Book ready for review!', {
            duration: 6000,
            action: {
              label: 'Review',
              onPress: () => router.push(`/catalog-review/${job.job_id}`),
              accessibilityHint: 'Navigate to review the cataloged book'
            }
          });
        }
        break;

      case 'failed':
        if (previousStatus === 'processing' || previousStatus === 'pending') {
          showSnackbar('error', 'Cataloging failed. Please try again.', {
            duration: 8000,
            action: {
              label: 'Retry',
              onPress: () => router.push('/catalog-new'),
              accessibilityHint: 'Start a new cataloging session'
            }
          });
        }
        break;

      default:
        // Handle any other status changes if needed
        break;
    }
  };

  // Helper function to track new job creation (call this when creating jobs)
  const trackNewJob = (jobId: string) => {
    markJobAsSessionJob(jobId);
    showSnackbar('info', 'Cataloging job started! Processing in background.');
  };

  return {
    trackNewJob,
    isNotificationsEnabled: enableNotifications,
  };
};