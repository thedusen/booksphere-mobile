// app/(app)/catalog-jobs.tsx
import { useAuth } from '@/context/AuthContext';
import { CatalogJob, useCatalogJobs } from '@/hooks/useCatalogJobs';
import { useSnackbar } from '@/hooks/useSnackbar';
import { supabase } from '@/lib/supabase';
import { calculateOverallConfidence, getConfidenceDisplayText, getConfidenceAccessibilityLabel, getConfidenceIcon, getConfidenceBackgroundColor, type ConfidenceLevel } from '@/utils/confidence';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, AlertTriangle, CheckCircle2, CheckSquare, Clock, Edit3, Image as ImageIcon, Loader, MoreVertical, Plus, RotateCcw, SlidersHorizontal, Square, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const JobStatusIndicator = ({ status }: { status: CatalogJob['status'] }) => {
  switch (status) {
    case 'completed':
      return null; // Status indicator moved inline for completed jobs
    case 'processing':
      return <Loader size={20} color="#F59E0B" />;
    case 'failed':
      return <AlertCircle size={20} color="#EF4444" />;
    case 'pending':
    default:
      return <Clock size={20} color="#6B7280" />;
  }
};

const JobStatusRow = ({ 
  item, 
  onDelete, 
  onCancelAndRetry,
  onReprocess,
  isSelectionMode, 
  isSelected, 
  onToggleSelect 
}: { 
  item: CatalogJob; 
  onDelete: (jobId: string) => void;
  onCancelAndRetry: (jobId: string) => void;
  onReprocess: (jobId: string) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (jobId: string) => void;
}) => {
    const router = useRouter();
    const coverImageUrl = (item.image_urls as any)?.cover_url;
    
    // Calculate confidence for completed jobs
    const confidence = useMemo(() => {
        if (item.status === 'completed' && item.extracted_data) {
            return calculateOverallConfidence(item.extracted_data as any);
        }
        return 'high' as ConfidenceLevel;
    }, [item.status, item.extracted_data]);
    const [showActions, setShowActions] = useState(false);

    const handlePress = () => {
        if (isSelectionMode) {
            if (canDelete) {
                onToggleSelect(item.job_id);
            }
        } else if (item.status === 'completed') {
            // For completed jobs, navigate directly to review
            router.push(`/catalog-review/${item.job_id}`);
        } else if (item.status === 'failed') {
            Alert.alert("Job Failed", item.error_message || "An unknown error occurred during processing.");
        }
    };

    const handleDelete = () => {
        setShowActions(false);
        const message = item.status === 'completed' 
            ? "Are you sure you want to delete this completed job? The extracted book data will be lost and cannot be recovered."
            : "Are you sure you want to delete this cataloging job? This action cannot be undone.";
        
        Alert.alert(
            "Delete Job",
            message,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => onDelete(item.job_id) 
                }
            ]
        );
    };

    const handleCancelAndRetry = () => {
        setShowActions(false);
        Alert.alert(
            "Cancel and Retry",
            "This will cancel the current job and create a new one with the same images. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Retry", 
                    onPress: () => onCancelAndRetry(item.job_id) 
                }
            ]
        );
    };

    const handleReprocess = () => {
        setShowActions(false);
        Alert.alert(
            "Reprocess Job",
            "This will create a new job with the same images for reprocessing. The original job will remain unchanged. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Reprocess", 
                    onPress: () => onReprocess(item.job_id) 
                }
            ]
        );
    };

    const canDelete = item.status === 'pending' || item.status === 'failed'; // Only pending and failed jobs can be deleted
    const canShowActions = item.status === 'pending' || item.status === 'failed' || item.status === 'completed'; // Show context menu for jobs that have actions available

    // Get confidence-based styling
    const confidenceBackgroundColor = item.status === 'completed' 
        ? getConfidenceBackgroundColor(confidence) 
        : 'white';

    return (
        <TouchableOpacity 
            style={[
                styles.rowContainer,
                { backgroundColor: confidenceBackgroundColor },
                isSelectionMode && canDelete && styles.selectableRow,
                isSelected && styles.selectedRow
            ]} 
            onPress={handlePress}
            disabled={!isSelectionMode && item.status !== 'completed' && item.status !== 'failed'}
            accessibilityLabel={item.status === 'completed' 
                ? getConfidenceAccessibilityLabel(confidence)
                : `Job ${item.status}, created ${new Date(item.created_at).toLocaleDateString()}`
            }
        >
            {coverImageUrl ? (
                <Image source={{ uri: coverImageUrl }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                    <ImageIcon size={24} color="#9CA3AF" />
                </View>
            )}
            <View style={styles.rowTextContainer}>
                <Text style={styles.rowDate}>{new Date(item.created_at).toLocaleString()}</Text>
                {item.status === 'completed' ? (
                    <View style={styles.completedStatusContainer}>
                        {(() => {
                            const iconConfig = getConfidenceIcon(confidence);
                            const IconComponent = iconConfig.name === 'CheckCircle2' ? CheckCircle2 
                                : iconConfig.name === 'AlertTriangle' ? AlertTriangle 
                                : AlertCircle;
                            return <IconComponent size={16} color={iconConfig.color} />;
                        })()}
                        <Text style={[
                            styles.completedStatusText,
                            confidence === 'medium' && styles.mediumConfidenceText,
                            confidence === 'low' && styles.lowConfidenceText
                        ]}>
                            {getConfidenceDisplayText(confidence)}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.rowStatus}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
                )}
            </View>
            <View style={styles.rowActions}>
                {isSelectionMode && canDelete ? (
                    isSelected ? (
                        <CheckSquare size={20} color="#1FB1AB" />
                    ) : (
                        <Square size={20} color="#6B7280" />
                    )
                ) : (
                    <>
                        <JobStatusIndicator status={item.status} />
                        {canShowActions && !isSelectionMode && (
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => setShowActions(true)}
                            >
                                <MoreVertical size={16} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
            
            <Modal
                visible={showActions}
                transparent
                animationType="fade"
                onRequestClose={() => setShowActions(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowActions(false)}
                >
                    <View style={styles.actionSheet}>
                        {item.status === 'pending' && (
                            <TouchableOpacity style={styles.actionItem} onPress={handleCancelAndRetry}>
                                <RotateCcw size={20} color="#1FB1AB" />
                                <Text style={styles.retryActionText}>Cancel and Retry</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'failed' && (
                            <TouchableOpacity style={styles.actionItem} onPress={handleCancelAndRetry}>
                                <RotateCcw size={20} color="#1FB1AB" />
                                <Text style={styles.retryActionText}>Retry</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'completed' && (
                            <TouchableOpacity style={styles.actionItem} onPress={handleReprocess}>
                                <RotateCcw size={20} color="#1FB1AB" />
                                <Text style={styles.retryActionText}>Reprocess</Text>
                            </TouchableOpacity>
                        )}
                        {canDelete && (
                            <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
                                <Trash2 size={20} color="#EF4444" />
                                <Text style={styles.deleteActionText}>Delete Job</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </TouchableOpacity>
    );
};

type SortOption = 'date-desc' | 'date-asc' | 'status';
type FilterOption = 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'needs-review';
type ConfidenceFilterOption = 'all' | 'high' | 'medium' | 'low';

export default function CatalogJobsScreen() {
  const { organizationId } = useAuth();
  const { data: jobs, isLoading, error, refetch } = useCatalogJobs(organizationId || '');
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      console.log('Attempting to delete job:', jobId);
      
      // Get current user ID for the RPC call
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.rpc('delete_cataloging_job_secure', {
        p_job_id: jobId,
        p_user_id: user.id
      });
      
      console.log('Delete result:', { data, error });
      if (error) throw error;
      
      if (data === true) {
        console.log('✅ Job deleted successfully');
        return { success: true, jobId };
      } else {
        // Get more specific error message based on job status
        const { data: jobInfo } = await supabase
          .from('cataloging_jobs')
          .select('status')
          .eq('job_id', jobId as any)
          .single();
        
        const status = (jobInfo as any)?.status || 'unknown';
        const errorMessage = status === 'completed' 
          ? 'Completed jobs cannot be deleted. You can only delete pending or failed jobs.'
          : status === 'processing'
          ? 'Jobs that are currently processing cannot be deleted.'
          : 'Job deletion failed: You may not have permission to delete this job.';
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      console.log('Delete successful:', data);
      queryClient.invalidateQueries({ queryKey: ['catalog-jobs'] });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      Alert.alert('Error', `Failed to delete job: ${error.message}`);
    }
  });

  // Bulk delete job mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (jobIds: string[]) => {
      // Get current user ID for the RPC calls
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Delete each job using the secure RPC function
      const deletePromises = jobIds.map(async (jobId) => {
        const { data, error } = await supabase.rpc('delete_cataloging_job_secure', {
          p_job_id: jobId,
          p_user_id: user.id
        });
        
        if (error) {
          console.error(`Failed to delete job ${jobId}:`, error);
          throw new Error(`Failed to delete job ${jobId}: ${error.message}`);
        }
        
        if (data !== true) {
          throw new Error(`Failed to delete job ${jobId}: User may not have permission.`);
        }
        
        return jobId;
      });
      
      // Wait for all deletions to complete
      const deletedJobIds = await Promise.all(deletePromises);
      console.log('✅ Bulk delete successful for jobs:', deletedJobIds);
      return deletedJobIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-jobs'] });
      setSelectedJobs(new Set());
      setIsSelectionMode(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', `Failed to delete jobs: ${error.message}`);
    }
  });

  // Cancel and retry mutation
  const cancelAndRetryMutation = useMutation({
    mutationFn: async (jobId: string) => {
      console.log('🔄 Cancel and retry mutation started for job:', jobId);
      
      // First get the job data
      console.log('📖 Fetching job data...');
      const { data: job, error: fetchError } = await supabase
        .from('cataloging_jobs')
        .select('image_urls')
        .eq('job_id', jobId as any)
        .single();
      
      if (fetchError) {
        console.error('❌ Failed to fetch job data:', fetchError);
        throw fetchError;
      }
      console.log('✅ Job data fetched:', job);
      
      // Delete the existing job using secure RPC function
      console.log('🗑️ Deleting existing job...');
      
      // Get current user ID for the RPC call
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error: deleteError } = await supabase.rpc('delete_cataloging_job_secure', {
        p_job_id: jobId,
        p_user_id: user.id
      });
      
      if (deleteError) {
        console.error('❌ Failed to delete job:', deleteError);
        throw deleteError;
      }
      
      if (data === true) {
        console.log('✅ Job deleted successfully');
      } else {
        console.error('❌ Job deletion failed - RPC returned false');
        throw new Error('Job deletion failed: User may not have permission to delete this job.');
      }
      
      // Create a new job with the same image URLs
      console.log('🆕 Creating new job...');
      const { data: newJobId, error: createError } = await supabase
        .rpc('create_cataloging_job', {
          image_urls_payload: (job as any).image_urls
        });
        
      if (createError) {
        console.error('❌ Failed to create new job:', createError);
        throw createError;
      }
      console.log('✅ New job created with ID:', newJobId);

      // Now trigger the Edge Function API to actually process the job
      console.log('🚀 Triggering Edge Function API...');
      const edgeFunctionPayload = { jobId: newJobId };
      const API_ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-cataloging-job`;
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('Authentication token not found');
      }

      // Call Edge Function API to trigger processing
      const response = await fetch(API_ENDPOINT, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(edgeFunctionPayload)
      });

      if (!response.ok) {
        console.error('❌ Edge Function API failed:', response.status, response.statusText);
        throw new Error(`Edge Function API failed: ${response.status} ${response.statusText}`);
      }
      console.log('✅ Edge Function API call successful');

      return newJobId;
    },
    onSuccess: () => {
      console.log('🎉 Cancel and retry mutation successful, refreshing data...');
      
      // Force invalidate and refetch the catalog jobs
      queryClient.invalidateQueries({ queryKey: ['catalog-jobs'] });
      
      // Also force a manual refetch to ensure UI updates immediately
      setTimeout(() => {
        console.log('🔄 Force refetch after 500ms delay');
        refetch();
      }, 500);
      
      // Show success snackbar instead of alert
      showSnackbar('success', 'Job retried successfully! Processing will begin shortly.', {
        duration: 4000
      });
    },
    onError: (error: any) => {
      console.error('❌ Cancel and retry mutation failed:', error);
      showSnackbar('error', `Failed to retry job: ${error.message}`, {
        duration: 6000,
        action: {
          label: 'Dismiss',
          onPress: () => {}, // Just dismiss the snackbar
          accessibilityHint: 'Dismiss error message'
        }
      });
    }
  });

  // Reprocess completed job mutation (for completed jobs that user wants to retry)
  const reprocessJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      console.log('🔄 Reprocess job mutation started for job:', jobId);
      
      // Get the job data
      console.log('📖 Fetching job data...');
      const { data: job, error: fetchError } = await supabase
        .from('cataloging_jobs')
        .select('image_urls')
        .eq('job_id', jobId as any)
        .single();
      
      if (fetchError || !job) {
        console.error('❌ Failed to fetch job data:', fetchError);
        throw new Error(`Failed to fetch job details: ${fetchError?.message || 'Job not found'}`);
      }
      console.log('✅ Job data fetched:', job);
      
      // Create a new job with the same image URLs (don't delete the original)
      console.log('🆕 Creating new job for reprocessing...');
      const { data: newJobId, error: createError } = await supabase
        .rpc('create_cataloging_job', {
          image_urls_payload: (job as any).image_urls
        });
        
      if (createError) {
        console.error('❌ Failed to create new job:', createError);
        throw createError;
      }
      console.log('✅ New job created with ID:', newJobId);

      // Trigger the Edge Function API to process the new job
      console.log('🚀 Triggering Edge Function API for reprocessing...');
      const edgeFunctionPayload = { jobId: newJobId };
      const API_ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-cataloging-job`;
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('Authentication token not found');
      }

      // Call Edge Function API to trigger processing
      const response = await fetch(API_ENDPOINT, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(edgeFunctionPayload)
      });

      if (!response.ok) {
        console.error('❌ Edge Function API failed:', response.status, response.statusText);
        throw new Error(`Edge Function API failed: ${response.status} ${response.statusText}`);
      }
      console.log('✅ Edge Function API call successful for reprocessing');

      return newJobId;
    },
    onSuccess: () => {
      console.log('🎉 Reprocess job mutation successful, refreshing data...');
      
      // Force invalidate and refetch the catalog jobs
      queryClient.invalidateQueries({ queryKey: ['catalog-jobs'] });
      
      // Also force a manual refetch to ensure UI updates immediately
      setTimeout(() => {
        console.log('🔄 Force refetch after 500ms delay');
        refetch();
      }, 500);
      
      // Show success snackbar
      showSnackbar('success', 'Job reprocessing started! A new job has been created.', {
        duration: 4000
      });
    },
    onError: (error: any) => {
      console.error('❌ Reprocess job mutation failed:', error);
      showSnackbar('error', `Failed to reprocess job: ${error.message}`, {
        duration: 6000,
        action: {
          label: 'Dismiss',
          onPress: () => {},
          accessibilityHint: 'Dismiss error message'
        }
      });
    }
  });

  // Sort and filter jobs
  const processedJobs = useMemo(() => {
    if (!jobs) return [];
    
    let filtered = jobs as CatalogJob[];
    
    // Apply status filter
    if (filterBy === 'needs-review') {
      // Show completed jobs with medium or low confidence
      filtered = (jobs as CatalogJob[]).filter((job: CatalogJob) => {
        if (job.status === 'completed' && job.extracted_data) {
          const confidence = calculateOverallConfidence(job.extracted_data as any);
          return confidence === 'medium' || confidence === 'low';
        }
        return false;
      });
    } else if (filterBy !== 'all') {
      filtered = (jobs as CatalogJob[]).filter((job: CatalogJob) => job.status === filterBy);
    }
    
    // Apply confidence filter
    if (confidenceFilter !== 'all') {
      filtered = filtered.filter((job: CatalogJob) => {
        if (job.status === 'completed' && job.extracted_data) {
          const confidence = calculateOverallConfidence(job.extracted_data as any);
          return confidence === confidenceFilter;
        }
        // For non-completed jobs, only show in 'high' confidence filter (legacy behavior)
        return confidenceFilter === 'high';
      });
    }
    
    const sorted = [...filtered].sort((a: CatalogJob, b: CatalogJob) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
          const statusOrder: Record<string, number> = { 'processing': 0, 'pending': 1, 'failed': 2, 'completed': 3 };
          return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [jobs, sortBy, filterBy, confidenceFilter]);

  const handleDelete = (jobId: string) => {
    deleteMutation.mutate(jobId);
  };

  const handleCancelAndRetry = (jobId: string) => {
    // Prevent double execution
    if (cancelAndRetryMutation.isPending) {
      console.log('Cancel and retry already in progress, ignoring duplicate call');
      return;
    }
    console.log('Starting cancel and retry for job:', jobId);
    
    // Show snackbar to indicate retry is starting
    showSnackbar('info', 'Retrying cataloging job...', {
      duration: 3000 // Show for 3 seconds
    });
    
    cancelAndRetryMutation.mutate(jobId);
  };

  const handleReprocess = (jobId: string) => {
    // Prevent double execution
    if (reprocessJobMutation.isPending) {
      console.log('Reprocess already in progress, ignoring duplicate call');
      return;
    }
    console.log('Starting reprocess for job:', jobId);
    
    // Show snackbar to indicate reprocess is starting
    showSnackbar('info', 'Reprocessing cataloging job...', {
      duration: 3000 // Show for 3 seconds
    });
    
    reprocessJobMutation.mutate(jobId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedJobs(new Set());
  };

  const handleToggleSelect = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedJobs.size === 0) return;
    
    Alert.alert(
      "Delete Jobs",
      `Are you sure you want to delete ${selectedJobs.size} job${selectedJobs.size > 1 ? 's' : ''}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => bulkDeleteMutation.mutate(Array.from(selectedJobs))
        }
      ]
    );
  };

  // Get deletable jobs for selection mode (only pending and failed jobs can be deleted)
  const deletableJobs = processedJobs.filter(job => job.status === 'pending' || job.status === 'failed');

  const renderHeader = () => (
    <View style={styles.header}>
      {isSelectionMode ? (
        <>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={toggleSelectionMode}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectionCount}>
            {selectedJobs.size} selected
          </Text>
          <TouchableOpacity 
            style={[styles.deleteButton, selectedJobs.size === 0 && styles.deleteButtonDisabled]}
            onPress={handleBulkDelete}
            disabled={selectedJobs.size === 0 || bulkDeleteMutation.isPending}
          >
            {bulkDeleteMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={20} color="#6B7280" />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
            {deletableJobs.length > 0 && (
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={toggleSelectionMode}
              >
                <Edit3 size={16} color="#6B7280" />
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.resultCount}>
            {processedJobs.length} job{processedJobs.length !== 1 ? 's' : ''}
          </Text>
        </>
      )}
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading jobs: {error.message}</Text>
        </View>
      );
    }
    if (!jobs || (jobs as CatalogJob[]).length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No pending catalog jobs</Text>
          <TouchableOpacity 
            style={styles.addCatalogButton}
            onPress={() => router.push('/catalog-new')}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addCatalogButtonText}>Start Cataloging</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (processedJobs.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No jobs match the current filters.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={processedJobs}
        renderItem={({ item }) => (
          <JobStatusRow 
            item={item} 
            onDelete={handleDelete}
            onCancelAndRetry={handleCancelAndRetry}
            onReprocess={handleReprocess}
            isSelectionMode={isSelectionMode}
            isSelected={selectedJobs.has(item.job_id)}
            onToggleSelect={handleToggleSelect}
          />
        )}
        keyExtractor={(item) => item.job_id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1FB1AB"
            colors={["#1FB1AB"]}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: "Cataloging Jobs",
        headerBackTitle: "Home"
      }} />
      {renderContent()}
      
      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort & Filter</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {[
                { key: 'date-desc', label: 'Newest First' },
                { key: 'date-asc', label: 'Oldest First' },
                { key: 'status', label: 'Status' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionRow}
                  onPress={() => setSortBy(option.key as SortOption)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {sortBy === option.key && <CheckCircle2 size={20} color="#1FB1AB" />}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter By Status</Text>
              {[
                { key: 'all', label: 'All Jobs' },
                { key: 'needs-review', label: 'Needs Review' },
                { key: 'pending', label: 'Pending' },
                { key: 'processing', label: 'Processing' },
                { key: 'completed', label: 'Completed' },
                { key: 'failed', label: 'Failed' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionRow}
                  onPress={() => setFilterBy(option.key as FilterOption)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {filterBy === option.key && <CheckCircle2 size={20} color="#1FB1AB" />}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter By Confidence</Text>
              {[
                { key: 'all', label: 'All Confidence Levels' },
                { key: 'high', label: 'High Confidence' },
                { key: 'medium', label: 'Medium Confidence' },
                { key: 'low', label: 'Low Confidence' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionRow}
                  onPress={() => setConfidenceFilter(option.key as ConfidenceFilterOption)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {confidenceFilter === option.key && <CheckCircle2 size={20} color="#1FB1AB" />}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContainer: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 8,
  },
  selectButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectionCount: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectableRow: {
    borderColor: '#1FB1AB',
    borderWidth: 1,
  },
  selectedRow: {
    backgroundColor: '#F0FDFA',
    borderColor: '#1FB1AB',
    borderWidth: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  thumbnail: { width: 50, height: 75, borderRadius: 4, backgroundColor: '#E5E7EB' },
  thumbnailPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  rowTextContainer: { flex: 1, marginLeft: 12 },
  rowDate: { fontSize: 14, color: '#6B7280' },
  rowStatus: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 4 },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  deleteActionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  retryActionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1FB1AB',
    fontWeight: '500',
  },
  reviewActionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1FB1AB',
    fontWeight: '500',
  },
  completedStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  completedStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 6,
  },
  mediumConfidenceText: {
    color: '#F59E0B', // Amber color for medium confidence
  },
  lowConfidenceText: {
    color: '#EF4444', // Red color for low confidence
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  doneButton: {
    fontSize: 16,
    color: '#1FB1AB',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  errorText: { color: '#EF4444', fontSize: 16 },
  emptyText: { color: '#6B7280', fontSize: 16, marginBottom: 20 },
  addCatalogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C7006F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addCatalogButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});