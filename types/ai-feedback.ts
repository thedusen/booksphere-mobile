// types/ai-feedback.ts

// Confidence levels for AI-extracted data
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very_low';

// Trackable fields in the cataloging system
export type TrackableField = 
  | 'title'
  | 'subtitle'
  | 'authors'
  | 'publisher'
  | 'publication_year'
  | 'publication_location'
  | 'edition_statement'
  | 'isbn'
  | 'page_count'
  | 'format_type'
  | 'has_dust_jacket'
  | 'description';

// All trackable fields for validation
export const TRACKABLE_FIELDS: TrackableField[] = [
  'title',
  'subtitle', 
  'authors',
  'publisher',
  'publication_year',
  'publication_location',
  'edition_statement',
  'isbn',
  'page_count',
  'format_type',
  'has_dust_jacket',
  'description'
];

// Confidence level mapping with colors and labels
export interface ConfidenceLevelInfo {
  level: ConfidenceLevel;
  color: string;
  label: string;
  description: string;
}

export const CONFIDENCE_LEVELS: Record<ConfidenceLevel, ConfidenceLevelInfo> = {
  high: {
    level: 'high',
    color: '#10B981', // emerald-500
    label: 'High',
    description: 'AI is very confident in this data'
  },
  medium: {
    level: 'medium', 
    color: '#F59E0B', // amber-500
    label: 'Medium',
    description: 'AI has moderate confidence in this data'
  },
  low: {
    level: 'low',
    color: '#EF4444', // red-500
    label: 'Low', 
    description: 'AI has low confidence in this data'
  },
  very_low: {
    level: 'very_low',
    color: '#DC2626', // red-600
    label: 'Very Low',
    description: 'AI has very low confidence in this data'
  }
};

// Feedback event types
export type FeedbackEventType = 
  | 'field_change'
  | 'validation'
  | 'reprocessing_feedback'
  | 'session_finalized';

// Reasons for reprocessing feedback
export type FeedbackReason = 
  | 'poor_image_quality'
  | 'incorrect_extraction'
  | 'missing_information'
  | 'formatting_issues'
  | 'language_detection'
  | 'complex_layout'
  | 'other';

export const FEEDBACK_REASONS: Record<FeedbackReason, string> = {
  poor_image_quality: 'Poor image quality',
  incorrect_extraction: 'Incorrect data extraction',
  missing_information: 'Missing information',
  formatting_issues: 'Formatting issues',
  language_detection: 'Language detection problems',
  complex_layout: 'Complex page layout',
  other: 'Other issues'
};

// Field change tracking data
export interface FieldChangeData {
  field_name: TrackableField;
  original_value: any;
  new_value: any;
  confidence_score?: number;
  change_timestamp: string;
}

// Validation tracking data
export interface ValidationData {
  is_valid: boolean;
  validation_message?: string;
  confidence_score?: number;
  validation_timestamp: string;
}

// Reprocessing feedback data
export interface ReprocessingFeedbackData {
  reason: FeedbackReason;
  custom_reason?: string;
  user_comment?: string;
  fields_affected?: TrackableField[];
  reprocess_timestamp: string;
}

// Base feedback event interface
export interface BaseFeedbackEvent {
  event_type: FeedbackEventType;
  cataloging_job_id: string;
  organization_id: string;
  user_id: string;
  timestamp: string;
  session_id?: string;
}

// Specific event types
export interface FieldChangeFeedbackEvent extends BaseFeedbackEvent {
  event_type: 'field_change';
  data: FieldChangeData;
}

export interface ValidationFeedbackEvent extends BaseFeedbackEvent {
  event_type: 'validation';
  data: ValidationData;
}

export interface ReprocessingFeedbackEvent extends BaseFeedbackEvent {
  event_type: 'reprocessing_feedback';
  data: ReprocessingFeedbackData;
}

export interface SessionFinalizedEvent extends BaseFeedbackEvent {
  event_type: 'session_finalized';
  data: {
    total_changes: number;
    fields_modified: TrackableField[];
    session_duration_ms: number;
    finalization_timestamp: string;
  };
}

// Union type for all feedback events
export type FeedbackEvent = 
  | FieldChangeFeedbackEvent
  | ValidationFeedbackEvent  
  | ReprocessingFeedbackEvent
  | SessionFinalizedEvent;

// API request interface
export interface CreateFeedbackEventRequest {
  events: FeedbackEvent[];
}

// Confidence score calculation interface
export interface ConfidenceData {
  [key: string]: number; // field_name -> confidence_score
}

// Hook options interface
export interface UseAIFeedbackTrackingOptions {
  catalogingJobId: string;
  originalData: Record<string, any>;
  organizationId: string;
  enabled?: boolean;
  debounceMs?: number;
  sessionId?: string;
}

// AI Feedback Tracker interface
export interface AIFeedbackTracker {
  trackFieldChange: (fieldName: TrackableField, originalValue: any, newValue: any, confidence?: number) => void;
  trackValidation: (isValid: boolean, validationMessage?: string, confidence?: number) => void;
  trackReprocessingFeedback: (feedbackData: ReprocessingFeedbackData) => void;
  finalizeSession: () => Promise<void>;
  isTracking: boolean;
  sessionId: string;
}

// Extracted data with confidence scores
export interface ExtractedDataWithConfidence {
  data: Record<string, any>;
  confidence_scores?: ConfidenceData;
  extraction_metadata?: {
    extraction_timestamp: string;
    model_version?: string;
    processing_time_ms?: number;
  };
}

// Props for confidence indicator component
export interface ConfidenceIndicatorProps {
  confidence?: number;
  fieldName: TrackableField;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  extractedData?: Record<string, any>;
}

// Props for reprocessing modal component
export interface ReprocessingFeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (feedbackData: ReprocessingFeedbackData) => void;
  onReprocessWithoutFeedback: () => void;
  jobTitle?: string;
}

// Offline queue item interface
export interface QueuedFeedbackEvent {
  id: string;
  event: FeedbackEvent;
  timestamp: string;
  retryCount: number;
}

// Analytics interfaces (for future dashboard support)
export interface AIFeedbackAnalytics {
  total_events: number;
  field_changes: number;
  validations: number;
  reprocessing_requests: number;
  average_confidence: number;
  most_changed_fields: TrackableField[];
}

export interface FieldAnalytics {
  field_name: TrackableField;
  change_frequency: number;
  average_confidence: number;
  common_issues: FeedbackReason[];
}

// Edge Function types and interfaces
export type EdgeFunctionFeedbackType = 
  | 'field_correction'
  | 'accuracy_rating'
  | 'confidence_override'
  | 'validation_confirm'
  | 'validation_reject'
  | 'reprocessing_request';

// Edge Function event payload structure
export interface EdgeFunctionFeedbackEvent {
  cataloging_job_id: string;
  feedback_type: EdgeFunctionFeedbackType;
  field_name?: TrackableField;
  original_value?: any;
  corrected_value?: any;
  accuracy_score?: number; // 1-5 scale
  confidence_score?: number; // 0.0-1.0
  feedback_notes?: string;
  edit_session_id?: string;
  edit_sequence?: number;
  time_to_edit_ms?: number;
}

// Edge Function batch request structure
export interface EdgeFunctionBatchRequest {
  events: EdgeFunctionFeedbackEvent[];
}

// Edge Function single event request structure  
export interface EdgeFunctionSingleRequest extends EdgeFunctionFeedbackEvent {}

// Transformation utilities
export const transformMobileEventToEdgeFunction = (
  mobileEvent: FeedbackEvent,
  editSequence?: number,
  timeToEditMs?: number
): EdgeFunctionFeedbackEvent => {
  const baseEvent: Partial<EdgeFunctionFeedbackEvent> = {
    cataloging_job_id: mobileEvent.cataloging_job_id,
    edit_session_id: mobileEvent.session_id,
    edit_sequence: editSequence,
    time_to_edit_ms: timeToEditMs
  };

  switch (mobileEvent.event_type) {
    case 'field_change': {
      const data = mobileEvent.data as FieldChangeData;
      return {
        ...baseEvent,
        feedback_type: 'field_correction',
        field_name: data.field_name,
        original_value: data.original_value,
        corrected_value: data.new_value,
        confidence_score: data.confidence_score
      } as EdgeFunctionFeedbackEvent;
    }

    case 'validation': {
      const data = mobileEvent.data as ValidationData;
      return {
        ...baseEvent,
        feedback_type: data.is_valid ? 'validation_confirm' : 'validation_reject',
        confidence_score: data.confidence_score,
        feedback_notes: data.validation_message
      } as EdgeFunctionFeedbackEvent;
    }

    case 'reprocessing_feedback': {
      const data = mobileEvent.data as ReprocessingFeedbackData;
      let feedbackNotes = FEEDBACK_REASONS[data.reason];
      
      if (data.custom_reason) {
        feedbackNotes += `: ${data.custom_reason}`;
      }
      
      if (data.user_comment) {
        feedbackNotes += `. ${data.user_comment}`;
      }

      return {
        ...baseEvent,
        feedback_type: 'reprocessing_request',
        feedback_notes: feedbackNotes
      } as EdgeFunctionFeedbackEvent;
    }

    case 'session_finalized': {
      const data = mobileEvent.data;
      // Convert session finalized to accuracy rating
      // Use average score based on number of changes vs total fields
      const totalFields = TRACKABLE_FIELDS.length;
      const changedFields = data.fields_modified.length;
      const accuracyScore = Math.max(1, Math.min(5, Math.round(5 - (changedFields / totalFields) * 4)));
      
      return {
        ...baseEvent,
        feedback_type: 'accuracy_rating',
        accuracy_score: accuracyScore,
        feedback_notes: `Session completed: ${data.total_changes} changes to ${changedFields} fields in ${Math.round(data.session_duration_ms / 1000)}s`
      } as EdgeFunctionFeedbackEvent;
    }

    default:
      throw new Error(`Unsupported mobile event type: ${(mobileEvent as any).event_type}`);
  }
};

export const transformMobileEventsToEdgeFunctionBatch = (
  mobileEvents: FeedbackEvent[]
): EdgeFunctionBatchRequest => {
  // Validate input array
  if (!Array.isArray(mobileEvents)) {
    throw new Error('mobileEvents must be an array');
  }

  const transformedEvents = mobileEvents
    .filter(isValidFeedbackEvent) // Filter out invalid events
    .map((event, index) => {
      // Calculate time to edit if we have timestamps
      let timeToEditMs: number | undefined;
      if (event.event_type === 'field_change') {
        const changeData = event.data as FieldChangeData;
        if (changeData.change_timestamp && event.timestamp) {
          const changeTime = new Date(changeData.change_timestamp).getTime();
          const eventTime = new Date(event.timestamp).getTime();
          timeToEditMs = Math.max(0, changeTime - eventTime);
        }
      }

      return transformMobileEventToEdgeFunction(event, index + 1, timeToEditMs);
    });

  return { events: transformedEvents };
};

// Runtime type guards for safety
export const isValidFeedbackEvent = (event: any): event is FeedbackEvent => {
  if (!event || typeof event !== 'object') return false;
  
  // Check required fields
  if (typeof event.cataloging_job_id !== 'string' || !event.cataloging_job_id.trim()) return false;
  if (typeof event.organization_id !== 'string' || !event.organization_id.trim()) return false;
  if (typeof event.user_id !== 'string' || !event.user_id.trim()) return false;
  if (typeof event.timestamp !== 'string' || !event.timestamp.trim()) return false;
  
  // Validate event type
  const validEventTypes = ['field_change', 'validation', 'reprocessing_feedback', 'session_finalized'];
  if (!validEventTypes.includes(event.event_type)) return false;
  
  // Check data field exists
  if (!event.data || typeof event.data !== 'object') return false;
  
  // Specific validation based on event type
  if (event.event_type === 'field_change') {
    const data = event.data;
    if (typeof data.field_name !== 'string' || !TRACKABLE_FIELDS.includes(data.field_name)) return false;
    if (typeof data.change_timestamp !== 'string') return false;
  }
  
  if (event.event_type === 'validation') {
    const data = event.data;
    if (typeof data.is_valid !== 'boolean') return false;
    if (typeof data.validation_timestamp !== 'string') return false;
  }
  
  return true;
};

export const isValidQueuedFeedbackEvent = (item: any): item is QueuedFeedbackEvent => {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.timestamp === 'string' &&
    typeof item.retryCount === 'number' &&
    item.retryCount >= 0 &&
    item.event &&
    isValidFeedbackEvent(item.event)
  );
};

export const isValidEdgeFunctionEvent = (event: any): event is EdgeFunctionFeedbackEvent => {
  if (!event || typeof event !== 'object') return false;
  
  // Check required fields
  if (typeof event.cataloging_job_id !== 'string' || !event.cataloging_job_id.trim()) return false;
  if (typeof event.feedback_type !== 'string') return false;
  
  // Validate feedback type
  const validFeedbackTypes: EdgeFunctionFeedbackType[] = [
    'field_correction', 'accuracy_rating', 'confidence_override', 
    'validation_confirm', 'validation_reject', 'reprocessing_request'
  ];
  if (!validFeedbackTypes.includes(event.feedback_type as EdgeFunctionFeedbackType)) return false;
  
  // Optional field validation
  if (event.field_name && !TRACKABLE_FIELDS.includes(event.field_name)) return false;
  if (event.confidence_score && (typeof event.confidence_score !== 'number' || event.confidence_score < 0 || event.confidence_score > 1)) return false;
  if (event.accuracy_score && (typeof event.accuracy_score !== 'number' || event.accuracy_score < 1 || event.accuracy_score > 5)) return false;
  
  return true;
};

// Utility function to create safe confidence scores
export const createConfidenceScore = (value: number): number => {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn('Invalid confidence score, defaulting to 0:', value);
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

// Utility function to create safe accuracy scores  
export const createAccuracyScore = (value: number): number => {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn('Invalid accuracy score, defaulting to 3:', value);
    return 3;
  }
  return Math.max(1, Math.min(5, Math.round(value)));
};