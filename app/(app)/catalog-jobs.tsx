// app/(app)/catalog-jobs.tsx
import { useAuth } from '@/context/AuthContext';
import { CatalogJob, useCatalogJobs, JobTypeFilter } from '@/hooks/useCatalogJobs';
import { useSnackbar } from '@/hooks/useSnackbar';
import { supabase } from '@/lib/supabase';
import { calculateOverallConfidence, type ConfidenceLevel } from '@/utils/confidence';
import { getJobType, getJobDisplayInfo, getJobThumbnail, getCertaintyDisplayText, getJobTypeBackgroundColor } from '@/utils/catalogJobs';
import { ApiResponse, BookData } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AlertCircle, AlertTriangle, BarChart3, BookCopy, Camera, CheckCircle2, CheckSquare, Clock, Edit3, Image as ImageIcon, Loader, MoreVertical, Plus, RotateCcw, SlidersHorizontal, Square, Trash2, Type } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomTabBar from '@/components/navigation/BottomTabBar';
import FloatingActionButton from '@/components/navigation/FloatingActionButton';

// ISBN API function (same as in review.tsx and scan.tsx)
const fetchBookDataByIsbn = async (isbn: string): Promise<BookData> => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  console.log(`📚 Fetching book data for ISBN: ${isbn}`);
  
  try {
    const response = await fetch(`${baseUrl}/getEnrichedBookDataByIsbn?isbn=${isbn}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`ISBN ${isbn} not found in database`);
      } else if (response.status === 500) {
        throw new Error(`Server error fetching ISBN ${isbn}. The book data service may be temporarily unavailable.`);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    if (data.jsonResult && data.jsonResult.bookData) {
      console.log(`✅ Book data found for ISBN ${isbn}`);
      return data.jsonResult.bookData;
    }
    throw new Error(`No book data available for ISBN ${isbn}`);
  } catch (error: any) {
    console.error(`❌ Failed to fetch ISBN ${isbn}:`, error.message);
    throw error;
  }
};

// Helper functions for extracting book information from job data
const extractBookInfo = (job: CatalogJob) => {
  const extractedData = job.extracted_data as any;
  
  // Handle different job states
  if (job.status === 'pending' || job.status === 'processing' || !extractedData) {
    return {
      title: 'Processing...',
      author: 'Extracting book details',
      isbn: null,
      isProcessing: true
    };
  }
  
  if (job.status === 'failed') {
    return {
      title: 'Processing Failed',
      author: 'Unable to extract book details',
      isbn: null,
      isProcessing: false
    };
  }
  
  // Extract title - handle both string and object formats
  let title = 'Unknown Title';
  if (extractedData.title) {
    if (typeof extractedData.title === 'string') {
      title = extractedData.title;
    } else if (typeof extractedData.title === 'object' && extractedData.title.name) {
      title = extractedData.title.name;
    } else {
      title = 'Unknown Title';
    }
  }
  
  // Extract author - handle both string and array formats, and object formats
  let author = 'Unknown Author';
  if (extractedData.authors) {
    if (Array.isArray(extractedData.authors)) {
      if (extractedData.authors.length > 0) {
        const firstAuthor = extractedData.authors[0];
        // Handle case where author is an object with name property
        if (typeof firstAuthor === 'object' && firstAuthor.name) {
          author = firstAuthor.name;
        } else if (typeof firstAuthor === 'string') {
          author = firstAuthor;
        } else {
          author = 'Unknown Author';
        }
      }
    } else if (typeof extractedData.authors === 'string') {
      author = extractedData.authors;
    } else if (typeof extractedData.authors === 'object' && extractedData.authors.name) {
      // Handle case where authors is a single object with name property
      author = extractedData.authors.name;
    }
  } else if (extractedData.author) {
    if (typeof extractedData.author === 'object' && extractedData.author.name) {
      author = extractedData.author.name;
    } else if (typeof extractedData.author === 'string') {
      author = extractedData.author;
    }
  }
  
  // Extract ISBN
  const isbn = extractedData.isbn || null;
  
  // Ensure we always have strings and handle truncation safely
  const finalTitle = String(title || 'Unknown Title');
  const finalAuthor = String(author || 'Unknown Author');
  
  return {
    title: finalTitle.length > 50 ? finalTitle.substring(0, 50) + '...' : finalTitle,
    author: finalAuthor.length > 30 ? finalAuthor.substring(0, 30) + '...' : finalAuthor,
    isbn,
    isProcessing: false
  };
};

// Job Type Filter Buttons Component
const JobTypeFilterButtons = ({ 
  activeFilter, 
  onFilterChange, 
  jobCounts 
}: { 
  activeFilter: JobTypeFilter; 
  onFilterChange: (filter: JobTypeFilter) => void;
  jobCounts: { all: number; ai: number; isbn: number };
}) => {
  const filterOptions = [
    {
      key: 'all' as JobTypeFilter,
      label: 'All',
      icon: BookCopy,
      color: '#6B7280',
      lightColor: '#F3F4F6', // Light gray
      count: jobCounts.all
    },
    {
      key: 'ai' as JobTypeFilter,
      label: 'AI',
      icon: Camera,
      color: '#7C3AED', // Purple - matches the new AI theme
      lightColor: '#F3E8FF', // Light purple
      count: jobCounts.ai
    },
    {
      key: 'isbn' as JobTypeFilter,
      label: 'ISBN',
      icon: BarChart3,
      color: '#3B82F6', // Blue - distinguished from green and purple
      lightColor: '#EFF6FF', // Light blue
      count: jobCounts.isbn
    }
  ];

  return (
    <View style={styles.filterButtonsContainer}>
      {filterOptions.map((option) => {
        const IconComponent = option.icon;
        const isActive = activeFilter === option.key;
        
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onFilterChange(option.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${option.label} jobs, ${option.count} jobs available`}
            style={styles.filterButtonWrapper}
          >
            <View style={[
              styles.jobTypeFilterButton,
              isActive && [
                styles.filterButtonActive, 
                { 
                  backgroundColor: option.lightColor,
                  borderColor: option.color,
                  borderWidth: 1
                }
              ]
            ]}>
              <IconComponent 
                size={18} 
                color={option.color} 
              />
              <Text style={[
                styles.jobTypeFilterButtonText,
                isActive && { color: option.color }
              ]}>
                {option.label}
              </Text>
              {option.count > 0 && (
                <View style={[
                  styles.filterButtonBadge,
                  isActive && { backgroundColor: option.color }
                ]}>
                  <Text style={[
                    styles.filterButtonBadgeText,
                    isActive && { color: 'white' }
                  ]}>
                    {option.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const JobTypeBadge = ({ job }: { job: CatalogJob }) => {
  const displayInfo = getJobDisplayInfo(job);
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'camera': return Camera;
      case 'barcode': return BarChart3;
      case 'type': return Type;
      default: return BookCopy;
    }
  };
  
  const IconComponent = getIconComponent(displayInfo.badgeIcon);
  
  return (
    <View style={[styles.jobBadge, { backgroundColor: displayInfo.badgeColor }]}>
      <IconComponent size={12} color="white" />
      <Text style={styles.jobBadgeText}>{displayInfo.displayName}</Text>
    </View>
  );
};

const JobStatusChip = ({ job }: { job: CatalogJob }) => {
  const jobType = getJobType(job);
  const confidence = useMemo(() => {
    if (jobType === 'ai' && job.status === 'completed' && job.extracted_data) {
      return calculateOverallConfidence(job.extracted_data as any);
    }
    return 'high' as ConfidenceLevel; // Default for non-AI jobs
  }, [jobType, job.status, job.extracted_data]);

  const getStatusConfig = () => {
    switch (job.status) {
      case 'completed':
        if (jobType === 'ai') {
          switch (confidence) {
            case 'high':
              return {
                icon: CheckCircle2,
                text: 'Ready for Review',
                backgroundColor: '#DCFCE7', // Light green
                textColor: '#166534', // Dark green
                iconColor: '#22C55E' // Green
              };
            case 'medium':
              return {
                icon: AlertTriangle,
                text: 'Review Carefully',
                backgroundColor: '#FEF3C7', // Light amber
                textColor: '#92400E', // Dark amber
                iconColor: '#F59E0B' // Amber
              };
            case 'low':
              return {
                icon: AlertCircle,
                text: 'Needs Attention',
                backgroundColor: '#FEE2E2', // Light red
                textColor: '#991B1B', // Dark red
                iconColor: '#EF4444' // Red
              };
          }
        } else {
          return {
            icon: CheckCircle2,
            text: getCertaintyDisplayText(job),
            backgroundColor: '#DCFCE7', // Light green
            textColor: '#166534', // Dark green
            iconColor: '#22C55E' // Green
          };
        }
        break;
      case 'processing':
        return {
          icon: Loader,
          text: 'Processing',
          backgroundColor: '#FEF3C7', // Light amber
          textColor: '#92400E', // Dark amber
          iconColor: '#F59E0B' // Amber
        };
      case 'failed':
        return {
          icon: AlertCircle,
          text: 'Failed',
          backgroundColor: '#FEE2E2', // Light red
          textColor: '#991B1B', // Dark red
          iconColor: '#EF4444' // Red
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          text: 'Pending',
          backgroundColor: '#F3F4F6', // Light gray
          textColor: '#374151', // Dark gray
          iconColor: '#6B7280' // Gray
        };
    }
    
    // Fallback
    return {
      icon: Clock,
      text: 'Unknown',
      backgroundColor: '#F3F4F6',
      textColor: '#374151',
      iconColor: '#6B7280'
    };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <View style={[
      styles.statusChip,
      { backgroundColor: config.backgroundColor }
    ]}>
      <IconComponent size={14} color={config.iconColor} />
      <Text style={[
        styles.statusChipText,
        { color: config.textColor }
      ]}>
        {config.text}
      </Text>
    </View>
  );
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
    const displayInfo = getJobDisplayInfo(item);
    const thumbnailUrl = getJobThumbnail(item);
    const bookInfo = extractBookInfo(item);
    const jobTypeBackgroundColor = getJobTypeBackgroundColor(item);
    const [showActions, setShowActions] = useState(false);

    const handlePress = () => {
        if (isSelectionMode) {
            if (canDelete) {
                onToggleSelect(item.job_id);
            }
        } else if (item.status === 'completed') {
            // For completed jobs, navigate directly to review
            router.push(`/catalog-review/${item.job_id}`);
        } else if (item.status === 'pending') {
            // For pending jobs, navigate to review (will show loading state)
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

    const canDelete = item.status === 'pending' || item.status === 'failed' || item.status === 'completed' || item.status === 'processing'; // Allow deletion of all jobs including stuck processing ones
    const canShowActions = item.status === 'pending' || item.status === 'failed' || item.status === 'completed' || item.status === 'processing'; // Show context menu for all jobs

    return (
        <TouchableOpacity 
            style={[
                styles.newRowContainer,
                { backgroundColor: jobTypeBackgroundColor },
                isSelectionMode && canDelete && styles.selectableRow,
                isSelected && styles.selectedRow
            ]} 
            onPress={handlePress}
            disabled={!isSelectionMode && item.status !== 'completed' && item.status !== 'failed' && item.status !== 'pending'}
            accessibilityLabel={`${bookInfo.title} by ${bookInfo.author}, ${item.status}`}
        >
            {/* Book Cover - Larger size for better identification */}
            <View style={styles.bookCoverContainer}>
                {thumbnailUrl ? (
                    <Image source={{ uri: thumbnailUrl }} style={styles.newThumbnail} />
                ) : (
                    <View style={[styles.newThumbnail, styles.thumbnailPlaceholder]}>
                        {displayInfo.badgeIcon === 'camera' ? (
                            <ImageIcon size={28} color="#9CA3AF" />
                        ) : displayInfo.badgeIcon === 'barcode' ? (
                            <BarChart3 size={28} color="#9CA3AF" />
                        ) : (
                            <Type size={28} color="#9CA3AF" />
                        )}
                    </View>
                )}
            </View>

            {/* Main Content Area */}
            <View style={styles.newContentContainer}>
                {/* Title - Most prominent */}
                <Text style={[
                    styles.bookTitle,
                    bookInfo.isProcessing && styles.processingText
                ]} numberOfLines={1}>
                    {bookInfo.title}
                </Text>
                
                {/* Author - Secondary prominence */}
                <Text style={[
                    styles.bookAuthor,
                    bookInfo.isProcessing && styles.processingText
                ]} numberOfLines={1}>
                    {bookInfo.author}
                </Text>
                
                {/* Status Chip - Integrated into content flow */}
                <View style={styles.statusChipContainer}>
                    <JobStatusChip job={item} />
                </View>
                
                {/* ISBN - Tertiary information when available */}
                {bookInfo.isbn && !bookInfo.isProcessing && (
                    <Text style={styles.bookIsbn} numberOfLines={1}>
                        ISBN: {bookInfo.isbn}
                    </Text>
                )}
                
                {/* Footer Row - Date and Job Badge */}
                <View style={styles.footerRow}>
                    <Text style={styles.jobDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    <JobTypeBadge job={item} />
                </View>
            </View>

            {/* Actions - Right side */}
            <View style={styles.actionsContainer}>
                {isSelectionMode && canDelete ? (
                    isSelected ? (
                        <CheckSquare size={20} color="#1FB1AB" />
                    ) : (
                        <Square size={20} color="#6B7280" />
                    )
                ) : (
                    canShowActions && !isSelectionMode && (
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setShowActions(true)}
                        >
                            <MoreVertical size={16} color="#6B7280" />
                        </TouchableOpacity>
                    )
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
                        {item.status === 'processing' && (
                            <TouchableOpacity style={styles.actionItem} onPress={handleCancelAndRetry}>
                                <RotateCcw size={20} color="#1FB1AB" />
                                <Text style={styles.retryActionText}>Cancel and Retry</Text>
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

type SortOption = 'date-desc' | 'date-asc' | 'status' | 'method';
type FilterOption = 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'needs-review';
type ConfidenceFilterOption = 'all' | 'high' | 'medium' | 'low';
type MethodFilterOption = 'all' | 'ai' | 'isbn_scan' | 'isbn_manual';

// Custom refresh button component
const RefreshButton = ({ onRefresh, refreshing }: { onRefresh: () => void, refreshing: boolean }) => (
  <TouchableOpacity 
    onPress={onRefresh}
    disabled={refreshing}
    style={{ padding: 4 }}
  >
    <Text style={{ 
      color: refreshing ? '#9CA3AF' : '#007AFF', 
      fontSize: 17,
      fontWeight: '400'
    }}>
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </Text>
  </TouchableOpacity>
);

export default function CatalogJobsScreen() {
  const { organizationId } = useAuth();
  const [jobTypeFilter, setJobTypeFilter] = useState<JobTypeFilter>('all');
  const { data: jobs, isLoading, error, refetch } = useCatalogJobs(organizationId || '', jobTypeFilter);
  // Also fetch all jobs to calculate counts for filter buttons
  const { data: allJobs } = useCatalogJobs(organizationId || '', 'all');
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilterOption>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilterOption>('all');
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
        const errorMessage = status === 'processing'
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

      // Determine job type and use appropriate processing method
      const jobType = getJobType(job);
      console.log('🔍 Job type detected:', jobType);

      if (jobType === 'isbn_scan' || jobType === 'isbn_manual') {
        // For ISBN jobs, fetch book data and update job directly
        console.log('📚 Processing ISBN job - fetching book data...');
        const isbn = (job as any).image_urls.isbn;
        
        if (!isbn) {
          // Mark job as failed if ISBN is missing
          await supabase
            .from('cataloging_jobs')
            .update({ 
              status: 'failed', 
              error_message: 'ISBN not found in job data' 
            })
            .eq('job_id', newJobId);
          throw new Error('ISBN not found in job data');
        }

        try {
          const bookData = await fetchBookDataByIsbn(isbn);
          console.log('✅ Book data fetched successfully');

          // Update the job with the fetched data
          console.log('📝 Updating job with book data...');
          const { error: updateError } = await supabase
            .from('cataloging_jobs')
            .update({ 
              extracted_data: bookData, 
              status: 'completed' 
            })
            .eq('job_id', newJobId);

          if (updateError) {
            console.error('❌ Failed to update job with book data:', updateError);
            throw updateError;
          }
          console.log('✅ ISBN job processing completed successfully');
        } catch (error: any) {
          // Mark job as failed if API call or update fails
          console.error('❌ ISBN job processing failed:', error);
          await supabase
            .from('cataloging_jobs')
            .update({ 
              status: 'failed', 
              error_message: error.message || 'Failed to process ISBN' 
            })
            .eq('job_id', newJobId);
          throw error;
        }

      } else {
        // For AI jobs, trigger Edge Function API
        console.log('🚀 Triggering Edge Function API for AI job...');
        
        try {
          const edgeFunctionPayload = { jobId: newJobId };
          const API_ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-cataloging-job`;
          const session = await supabase.auth.getSession();
          const token = session?.data?.session?.access_token;

          if (!token) {
            console.error('❌ No authentication token found');
            // Mark job as failed if no token
            await supabase
              .from('cataloging_jobs')
              .update({ 
                status: 'failed', 
                error_message: 'Authentication token not found' 
              })
              .eq('job_id', newJobId);
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
            // Mark job as failed if Edge Function fails
            await supabase
              .from('cataloging_jobs')
              .update({ 
                status: 'failed', 
                error_message: `Edge Function API failed: ${response.status} ${response.statusText}` 
              })
              .eq('job_id', newJobId);
            throw new Error(`Edge Function API failed: ${response.status} ${response.statusText}`);
          }
          console.log('✅ Edge Function API call successful');
        } catch (error: any) {
          // If error wasn't already handled above, mark as failed
          if (!error.message?.includes('Edge Function API failed') && !error.message?.includes('Authentication token')) {
            console.error('❌ AI job processing failed:', error);
            await supabase
              .from('cataloging_jobs')
              .update({ 
                status: 'failed', 
                error_message: error.message || 'Failed to process AI job' 
              })
              .eq('job_id', newJobId);
          }
          throw error;
        }
      }

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
      
      // Check if this is an ISBN API error and offer alternatives
      if (error.message?.includes('ISBN') && error.message?.includes('not found')) {
        Alert.alert(
          "ISBN Not Found",
          `${error.message}\n\nWould you like to manually enter the book details instead?`,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Manual Entry", 
              onPress: () => router.push('/manual-entry')
            }
          ]
        );
      } else if (error.message?.includes('Server error') && error.message?.includes('ISBN')) {
        Alert.alert(
          "ISBN Service Unavailable",
          `${error.message}\n\nYou can try again later or manually enter the book details.`,
          [
            { text: "OK", style: "cancel" },
            { 
              text: "Manual Entry", 
              onPress: () => router.push('/manual-entry')
            }
          ]
        );
      } else {
        showSnackbar('error', `Failed to retry job: ${error.message}`, {
          duration: 6000,
          action: {
            label: 'Dismiss',
            onPress: () => {}, // Just dismiss the snackbar
            accessibilityHint: 'Dismiss error message'
          }
        });
      }
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

  // Calculate job counts for filter buttons
  const jobCounts = useMemo(() => {
    if (!allJobs) return { all: 0, ai: 0, isbn: 0 };
    
    const counts = { all: allJobs.length, ai: 0, isbn: 0 };
    
    allJobs.forEach((job) => {
      const jobType = getJobType(job);
      if (jobType === 'ai') {
        counts.ai += 1;
      } else if (jobType === 'isbn_scan' || jobType === 'isbn_manual') {
        counts.isbn += 1;
      }
    });
    
    return counts;
  }, [allJobs]);

  // Sort and filter jobs (method filtering is now handled by the hook)
  const processedJobs = useMemo(() => {
    if (!jobs) return [];
    
    let filtered = jobs as CatalogJob[];
    
    // Apply status filter
    if (filterBy === 'needs-review') {
      // Show completed jobs with medium or low confidence (AI jobs only)
      filtered = filtered.filter((job: CatalogJob) => {
        const jobType = getJobType(job);
        if (jobType === 'ai' && job.status === 'completed' && job.extracted_data) {
          const confidence = calculateOverallConfidence(job.extracted_data as any);
          return confidence === 'medium' || confidence === 'low';
        }
        return false;
      });
    } else if (filterBy !== 'all') {
      filtered = filtered.filter((job: CatalogJob) => job.status === filterBy);
    }
    
    // Apply confidence filter (AI jobs only)
    if (confidenceFilter !== 'all') {
      filtered = filtered.filter((job: CatalogJob) => {
        const jobType = getJobType(job);
        if (jobType === 'ai' && job.status === 'completed' && job.extracted_data) {
          const confidence = calculateOverallConfidence(job.extracted_data as any);
          return confidence === confidenceFilter;
        }
        // For non-AI jobs or non-completed jobs, only show in 'high' confidence filter
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
        case 'method':
          const methodOrder: Record<string, number> = { 'ai': 0, 'isbn_scan': 1, 'isbn_manual': 2 };
          const aMethod = getJobType(a);
          const bMethod = getJobType(b);
          return (methodOrder[aMethod] || 999) - (methodOrder[bMethod] || 999);
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

  // Get deletable jobs for selection mode (all jobs can be deleted including stuck processing ones)
  const deletableJobs = processedJobs.filter(job => job.status === 'pending' || job.status === 'failed' || job.status === 'completed' || job.status === 'processing');

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
              <SlidersHorizontal size={16} color="#6B7280" />
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
        ListHeaderComponent={() => (
          <>
            <JobTypeFilterButtons
              activeFilter={jobTypeFilter}
              onFilterChange={setJobTypeFilter}
              jobCounts={jobCounts}
            />
            {renderHeader()}
          </>
        )}
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
                { key: 'status', label: 'Status' },
                { key: 'method', label: 'Method' }
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
      <BottomTabBar />
      <FloatingActionButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContainer: { padding: 16, paddingBottom: 88 }, // Added bottom padding for tab navigation
  refreshButton: {
    padding: 4,
  },
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 12,
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
  // New redesigned row container
  newRowContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // Book cover styling
  bookCoverContainer: {
    marginRight: 16,
  },
  newThumbnail: { 
    width: 60, 
    height: 90, 
    borderRadius: 6, 
    backgroundColor: '#E5E7EB' 
  },
  thumbnailPlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  // Main content area
  newContentContainer: { 
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  // Book information styling
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 18,
    marginBottom: 6,
  },
  bookIsbn: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
    marginBottom: 4,
  },
  processingText: {
    fontStyle: 'italic',
    color: '#9CA3AF',
  },
  // Status chip styling
  statusChipContainer: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Footer row styling
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  jobDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  // Actions container
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 24,
  },
  actionButton: {
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
    backgroundColor: '#1FB1AB', // Use teal for primary action instead of old magenta
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
  jobBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  jobBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  // Job Type Filter Buttons Styles
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 17,
    backgroundColor: '#F9FBF9',
    gap: 8,
    marginHorizontal: -16, // Counteract the listContainer padding
    paddingHorizontal: 16, // Add back the padding we want
  },
  filterButtonWrapper: {
    flex: 1,
  },
  jobTypeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    // Border color and width will be set inline for each button type
    // Remove shadow changes to maintain consistent elevation
  },
  jobTypeFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  filterButtonBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  filterButtonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
});