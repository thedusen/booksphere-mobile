// utils/catalogJobs.ts

export type JobType = 'ai' | 'isbn_scan' | 'isbn_manual';
export type JobDisplayInfo = {
  type: JobType;
  displayName: string;
  badgeColor: string;
  badgeIcon: string;
  certaintyLevel: 'high' | 'medium' | 'low';
  canReprocess: boolean;
};

// Job type detection based on data structure
export const getJobType = (job: any): JobType => {
  const imageUrls = job.image_urls;
  
  if (!imageUrls) return 'ai'; // Fallback for malformed data
  
  // Check for explicit job_type field FIRST (most reliable)
  if (imageUrls.job_type === 'isbn_scan') return 'isbn_scan';
  if (imageUrls.job_type === 'isbn_manual') return 'isbn_manual';
  if (imageUrls.job_type === 'ai') return 'ai';
  
  // Fallback: Check for ISBN jobs by structure
  if (imageUrls.isbn) {
    if (imageUrls.method === 'scan') return 'isbn_scan';
    if (imageUrls.method === 'manual') return 'isbn_manual';
    // If has ISBN but no method, assume scan
    return 'isbn_scan';
  }
  
  // Check for AI jobs (has actual image URLs)
  if (imageUrls.cover_url || imageUrls.title_url || imageUrls.copyright_url) {
    return 'ai';
  }
  
  // Default to AI for legacy jobs
  return 'ai';
};

// Get display information for a job type
export const getJobDisplayInfo = (job: any): JobDisplayInfo => {
  const jobType = getJobType(job);
  
  switch (jobType) {
    case 'ai':
      return {
        type: 'ai',
        displayName: 'AI Scan',
        badgeColor: '#C7006F', // Primary magenta
        badgeIcon: 'camera',
        certaintyLevel: job.status === 'completed' ? getCertaintyFromAI(job) : 'high',
        canReprocess: true,
      };
      
    case 'isbn_scan':
      return {
        type: 'isbn_scan',
        displayName: 'ISBN',
        badgeColor: '#1FB1AB', // Secondary teal
        badgeIcon: 'barcode',
        certaintyLevel: job.status === 'completed' ? 'high' : 'medium',
        canReprocess: false,
      };
      
    case 'isbn_manual':
      return {
        type: 'isbn_manual',
        displayName: 'Manual',
        badgeColor: '#6B7280', // Gray
        badgeIcon: 'type',
        certaintyLevel: job.status === 'completed' ? 'high' : 'medium',
        canReprocess: false,
      };
      
    default:
      return {
        type: 'ai',
        displayName: 'Unknown',
        badgeColor: '#6B7280',
        badgeIcon: 'help-circle',
        certaintyLevel: 'low',
        canReprocess: false,
      };
  }
};

// Extract certainty level for AI jobs using existing confidence logic
const getCertaintyFromAI = (job: any): 'high' | 'medium' | 'low' => {
  if (!job.extracted_data) return 'low';
  
  // Import confidence calculation from existing utility
  try {
    // This will need to be imported from the existing confidence utility
    // For now, we'll use a simple heuristic
    const data = job.extracted_data;
    const hasTitle = data.title && data.title.length > 0;
    const hasAuthors = data.authors && data.authors.length > 0;
    const hasISBN = data.isbn && data.isbn.length > 0;
    const hasPublisher = data.publisher && data.publisher.length > 0;
    
    const completeness = [hasTitle, hasAuthors, hasISBN, hasPublisher].filter(Boolean).length;
    
    if (completeness >= 3) return 'high';
    if (completeness >= 2) return 'medium';
    return 'low';
  } catch (error) {
    console.error('Error calculating certainty from AI data:', error);
    return 'medium';
  }
};

// Get certainty level for any job type
export const getJobCertaintyLevel = (job: any): 'high' | 'medium' | 'low' => {
  const displayInfo = getJobDisplayInfo(job);
  return displayInfo.certaintyLevel;
};

// Get thumbnail URL for different job types
export const getJobThumbnail = (job: any): string | null => {
  const jobType = getJobType(job);
  
  if (jobType === 'ai') {
    // Use cover image from AI job
    return job.image_urls?.cover_url || null;
  } else {
    // Use book cover from extracted data for ISBN jobs
    return job.extracted_data?.cover_image_url || null;
  }
};

// Check if job can be retried/reprocessed
export const canJobBeReprocessed = (job: any): boolean => {
  const displayInfo = getJobDisplayInfo(job);
  return displayInfo.canReprocess && (job.status === 'completed' || job.status === 'failed');
};

// Get appropriate confidence/certainty text for display
export const getCertaintyDisplayText = (job: any): string => {
  const jobType = getJobType(job);
  const certaintyLevel = getJobCertaintyLevel(job);
  
  if (jobType === 'ai') {
    // Use existing confidence text mapping
    switch (certaintyLevel) {
      case 'high': return 'Ready for Review';
      case 'medium': return 'Review Carefully';
      case 'low': return 'Needs Attention';
    }
  } else {
    // ISBN jobs have different certainty semantics
    if (job.status === 'completed') {
      return 'Data Retrieved';
    } else if (job.status === 'failed') {
      return 'Data Not Found';
    } else {
      return 'Processing';
    }
  }
  
  return 'Unknown Status';
};

// Get background color based on job certainty
export const getCertaintyBackgroundColor = (job: any): string => {
  const jobType = getJobType(job);
  
  if (jobType === 'ai' && job.status === 'completed') {
    const certaintyLevel = getJobCertaintyLevel(job);
    switch (certaintyLevel) {
      case 'high': return '#F0FDF4'; // Green tint
      case 'medium': return '#FFFBEB'; // Amber tint
      case 'low': return '#FEF2F2'; // Red tint
    }
  }
  
  // ISBN jobs and non-completed jobs use white background
  return 'white';
};