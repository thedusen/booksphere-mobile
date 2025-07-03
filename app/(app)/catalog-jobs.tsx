// app/(app)/catalog-jobs.tsx
import { useAuth } from '@/context/AuthContext';
import { CatalogJob, useCatalogJobs } from '@/hooks/useCatalogJobs';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, CheckSquare, ChevronRight, Clock, Edit3, Eye, Image as ImageIcon, Loader, MoreVertical, Plus, RotateCcw, SlidersHorizontal, Square, Trash2 } from 'lucide-react-native';
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
  isSelectionMode, 
  isSelected, 
  onToggleSelect 
}: { 
  item: CatalogJob; 
  onDelete: (jobId: string) => void;
  onCancelAndRetry: (jobId: string) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (jobId: string) => void;
}) => {
    const router = useRouter();
    const coverImageUrl = item.image_urls?.cover_url;
    const [showActions, setShowActions] = useState(false);

    const handlePress = () => {
        if (isSelectionMode) {
            if (canDelete) {
                onToggleSelect(item.job_id);
            }
        } else if (item.status === 'completed') {
            // For completed jobs, show context menu instead of direct navigation
            setShowActions(true);
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

    const canDelete = item.status === 'pending' || item.status === 'failed' || item.status === 'completed';
    const canShowActions = item.status === 'pending' || item.status === 'failed' || item.status === 'completed';

    return (
        <TouchableOpacity 
            style={[
                styles.rowContainer,
                isSelectionMode && canDelete && styles.selectableRow,
                isSelected && styles.selectedRow
            ]} 
            onPress={handlePress}
            disabled={!isSelectionMode && item.status !== 'completed' && item.status !== 'failed'}
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
                        <CheckCircle2 size={16} color="#22C55E" />
                        <Text style={styles.completedStatusText}>Ready for Review</Text>
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
                        {item.status === 'completed' && (
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                setShowActions(false);
                                router.push(`/catalog-review/${item.job_id}`);
                            }}>
                                <Eye size={20} color="#1FB1AB" />
                                <Text style={styles.reviewActionText}>Review</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'pending' && (
                            <TouchableOpacity style={styles.actionItem} onPress={handleCancelAndRetry}>
                                <RotateCcw size={20} color="#1FB1AB" />
                                <Text style={styles.retryActionText}>Cancel and Retry</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
                            <Trash2 size={20} color="#EF4444" />
                            <Text style={styles.deleteActionText}>Delete Job</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </TouchableOpacity>
    );
};

type SortOption = 'date-desc' | 'date-asc' | 'status';
type FilterOption = 'all' | 'pending' | 'processing' | 'completed' | 'failed';

export default function CatalogJobsScreen() {
  const { organizationId } = useAuth();
  const { data: jobs, isLoading, error, refetch } = useCatalogJobs(organizationId || '');
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      console.log('Attempting to delete job:', jobId);
      const { data, error } = await supabase
        .from('cataloging_jobs')
        .delete()
        .eq('job_id', jobId)
        .select();
      
      console.log('Delete result:', { data, error });
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('cataloging_jobs')
        .delete()
        .in('job_id', jobIds);
      if (error) throw error;
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
      // First get the job data
      const { data: job, error: fetchError } = await supabase
        .from('cataloging_jobs')
        .select('image_urls')
        .eq('job_id', jobId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete the existing job
      const { error: deleteError } = await supabase
        .from('cataloging_jobs')
        .delete()
        .eq('job_id', jobId);
      
      if (deleteError) throw deleteError;
      
      // Create a new job with the same image URLs
      const { data: newJob, error: createError } = await supabase
        .rpc('create_cataloging_job', {
          image_urls_payload: job.image_urls
        });
        
      if (createError) throw createError;
      return newJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-jobs'] });
      Alert.alert('Success', 'Job has been cancelled and a new one created. Processing will begin shortly.');
    },
    onError: (error: any) => {
      Alert.alert('Error', `Failed to cancel and retry job: ${error.message}`);
    }
  });

  // Sort and filter jobs
  const processedJobs = useMemo(() => {
    if (!jobs) return [];
    
    let filtered = jobs;
    if (filterBy !== 'all') {
      filtered = jobs.filter(job => job.status === filterBy);
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
          const statusOrder = { 'processing': 0, 'pending': 1, 'failed': 2, 'completed': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [jobs, sortBy, filterBy]);

  const handleDelete = (jobId: string) => {
    deleteMutation.mutate(jobId);
  };

  const handleCancelAndRetry = (jobId: string) => {
    cancelAndRetryMutation.mutate(jobId);
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

  // Get deletable jobs for selection mode
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
    if (!jobs || jobs.length === 0) {
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