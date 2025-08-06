// hooks/useAIFeedbackTracking.ts
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  AIFeedbackTracker, 
  CreateFeedbackEventRequest,
  TrackableField,
  FeedbackEvent,
  FieldChangeData,
  ValidationData,
  ReprocessingFeedbackData,
  UseAIFeedbackTrackingOptions,
  ConfidenceLevel,
  CONFIDENCE_LEVELS,
  transformMobileEventsToEdgeFunctionBatch
} from '@/types/ai-feedback';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

// Mobile-optimized debounce function with cleanup
function debounce<T extends (...args: any[]) => Promise<void>>(func: T, delay: number): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debouncedFunc = ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  }) as T & { cancel: () => void };
  
  debouncedFunc.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debouncedFunc;
}

// Generate unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get confidence level from score
export const getConfidenceLevel = (score?: number): ConfidenceLevel => {
  if (!score) return 'very_low';
  if (score >= 0.8) return 'high';
  if (score >= 0.6) return 'medium';
  if (score >= 0.4) return 'low';
  return 'very_low';
};

// Lazy-loaded confidence level hook with memoization
export const useConfidenceLevel = (score?: number) => {
  return useMemo(() => {
    // Early return for undefined/null scores
    if (score === undefined || score === null) {
      return CONFIDENCE_LEVELS.very_low;
    }
    
    const level = getConfidenceLevel(score);
    return CONFIDENCE_LEVELS[level];
  }, [score]);
};

// Constants for memory management
const MAX_PENDING_EVENTS = 50;
const MEMORY_FLUSH_THRESHOLD = 0.8; // Flush when 80% of max capacity

// Mobile-optimized AI feedback tracking hook
export function useAIFeedbackTracking({
  catalogingJobId,
  originalData,
  organizationId,
  enabled = true,
  debounceMs = 1000, // Longer debounce for mobile
  sessionId: providedSessionId
}: UseAIFeedbackTrackingOptions): AIFeedbackTracker {
  const { user } = useAuth();
  const sessionIdRef = useRef<string>(providedSessionId || generateSessionId());
  const sessionStartTime = useRef<number>(Date.now());
  const pendingEvents = useRef<FeedbackEvent[]>([]);
  const changeCount = useRef<number>(0);
  const modifiedFields = useRef<Set<TrackableField>>(new Set());
  const isActiveRef = useRef<boolean>(true);

  // Track app state for battery optimization
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      isActiveRef.current = nextAppState === 'active';
      
      // Flush pending events when app goes to background
      if (nextAppState === 'background' && pendingEvents.current.length > 0) {
        flushPendingEvents().catch(console.error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // API call to submit feedback events with timeout and retry logic
  const submitFeedbackEvents = useCallback(async (events: FeedbackEvent[]): Promise<boolean> => {
    if (!events.length) return true;

    try {
      // Transform mobile events to Edge Function format
      const edgeFunctionPayload = transformMobileEventsToEdgeFunctionBatch(events);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('📊 AI Feedback: Request timeout, aborting...');
        controller.abort();
      }, 15000); // 15 second timeout
      
      const { data, error } = await supabase.functions.invoke('ai-feedback', {
        body: edgeFunctionPayload,
        headers: {
          'Content-Type': 'application/json',
        }
        // Note: Supabase JS client doesn't support AbortSignal directly
        // but has its own timeout handling
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('📊 AI Feedback: Supabase function error:', error);
        // Check if it's a network/timeout error that might be retryable
        if (error.message?.includes('timeout') || error.message?.includes('network')) {
          console.log('📊 AI Feedback: Network error detected, will retry via offline queue');
        }
        return false;
      }

      console.log(`📊 AI Feedback: Successfully submitted ${events.length} events to Edge Function`);
      return true;
    } catch (error) {
      console.error('📊 AI Feedback: Error submitting feedback events:', error);
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('📊 AI Feedback: Request was aborted due to timeout');
        } else if (error.message?.includes('Network')) {
          console.warn('📊 AI Feedback: Network error, will retry offline');
        }
      }
      
      return false;
    }
  }, []);

  // Debounced function to flush pending events
  const debouncedFlush = useCallback(
    debounce(async () => {
      if (!isActiveRef.current || pendingEvents.current.length === 0) return;
      
      const eventsToSubmit = [...pendingEvents.current];
      pendingEvents.current = [];

      const success = await submitFeedbackEvents(eventsToSubmit);
      
      if (!success) {
        // Queue for offline retry if submission fails
        try {
          const existingQueue = await AsyncStorage.getItem('feedbackQueue');
          const queue = existingQueue ? JSON.parse(existingQueue) : [];
          queue.push(...eventsToSubmit.map(event => ({
            id: `${event.cataloging_job_id}_${Date.now()}_${Math.random()}`,
            event,
            timestamp: new Date().toISOString(),
            retryCount: 0
          })));
          await AsyncStorage.setItem('feedbackQueue', JSON.stringify(queue));
        } catch (storageError) {
          console.error('Failed to queue events for offline retry:', storageError);
        }
      }
    }, debounceMs),
    [submitFeedbackEvents, debounceMs]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFlush.cancel();
    };
  }, [debouncedFlush]);

  // Helper to create base event structure
  const createBaseEvent = useCallback((): Omit<FeedbackEvent, 'event_type' | 'data'> => ({
    cataloging_job_id: catalogingJobId,
    organization_id: organizationId,
    user_id: user?.id || '',
    timestamp: new Date().toISOString(),
    session_id: sessionIdRef.current
  }), [catalogingJobId, organizationId, user?.id]);

  // Flush pending events immediately
  const flushPendingEvents = useCallback(async (): Promise<void> => {
    if (pendingEvents.current.length === 0) return;
    
    const eventsToSubmit = [...pendingEvents.current];
    pendingEvents.current = [];
    
    await submitFeedbackEvents(eventsToSubmit);
  }, [submitFeedbackEvents]);

  // Enhanced memory management with immediate flush
  const flushIfNearLimit = useCallback(() => {
    if (pendingEvents.current.length >= MAX_PENDING_EVENTS * MEMORY_FLUSH_THRESHOLD) {
      console.log('📊 AI Feedback: Memory threshold reached, forcing immediate flush');
      // Cancel debounced flush and execute immediately
      debouncedFlush.cancel();
      flushPendingEvents().catch(error => {
        console.error('Failed to flush events during memory pressure:', error);
        // As last resort, clear some events to prevent memory issues
        if (pendingEvents.current.length > MAX_PENDING_EVENTS) {
          console.warn('📊 AI Feedback: Dropping oldest events to prevent memory overflow');
          pendingEvents.current = pendingEvents.current.slice(-Math.floor(MAX_PENDING_EVENTS * 0.5));
        }
      });
    }
  }, [flushPendingEvents]);

  // Enhanced input validation and sanitization helper
  const validateAndSanitizeInput = useCallback((fieldName: TrackableField, value: any): { isValid: boolean; sanitizedValue: any } => {
    // Validate field name
    if (typeof fieldName !== 'string' || !fieldName.trim()) {
      return { isValid: false, sanitizedValue: null };
    }
    
    // Validate field name against allowed list
    const { TRACKABLE_FIELDS } = require('@/types/ai-feedback');
    if (!TRACKABLE_FIELDS.includes(fieldName)) {
      return { isValid: false, sanitizedValue: null };
    }
    
    // Handle different value types
    if (typeof value === 'string') {
      // Security: Remove potential XSS vectors
      let sanitized = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .trim();
      
      // Length limits based on field type
      const maxLength = fieldName === 'description' ? 2000 : 
                       fieldName === 'isbn' ? 20 :
                       fieldName === 'page_count' ? 10 : 500;
                       
      if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
      }
      
      return { isValid: true, sanitizedValue: sanitized };
    }
    
    // Validate numeric values
    if (typeof value === 'number') {
      // Confidence scores must be 0-1
      if (fieldName.includes('confidence') && (value < 0 || value > 1)) {
        return { isValid: false, sanitizedValue: null };
      }
      
      // Page count must be positive
      if (fieldName === 'page_count' && (value < 0 || value > 10000)) {
        return { isValid: false, sanitizedValue: null };
      }
      
      // Publication year reasonable range
      if (fieldName === 'publication_year' && (value < 1000 || value > new Date().getFullYear() + 2)) {
        return { isValid: false, sanitizedValue: null };
      }
      
      return { isValid: true, sanitizedValue: value };
    }
    
    // Validate boolean values
    if (typeof value === 'boolean') {
      return { isValid: true, sanitizedValue: value };
    }
    
    // Arrays (like authors)
    if (Array.isArray(value)) {
      const sanitizedArray = value
        .filter(item => typeof item === 'string' || typeof item === 'object')
        .slice(0, 20) // Limit array size
        .map(item => {
          if (typeof item === 'string') {
            return item.replace(/<script[^>]*>.*?<\/script>/gi, '').trim().substring(0, 200);
          }
          return item;
        });
      
      return { isValid: true, sanitizedValue: sanitizedArray };
    }
    
    // Reject other types
    return { isValid: false, sanitizedValue: null };
  }, []);

  // Track field changes
  const trackFieldChange = useCallback((
    fieldName: TrackableField,
    originalValue: any,
    newValue: any,
    confidence?: number
  ) => {
    if (!enabled || !user?.id) return;

    // Validate and sanitize inputs
    const { isValid, sanitizedValue } = validateAndSanitizeInput(fieldName, newValue);
    if (!isValid) {
      console.warn('Invalid input for field change tracking:', fieldName, newValue);
      return;
    }

    // Skip if values are the same (compare with sanitized value)
    if (originalValue === sanitizedValue) return;

    const changeData: FieldChangeData = {
      field_name: fieldName,
      original_value: originalValue,
      new_value: sanitizedValue, // Use sanitized value
      confidence_score: confidence,
      change_timestamp: new Date().toISOString()
    };

    const event: FeedbackEvent = {
      ...createBaseEvent(),
      event_type: 'field_change',
      data: changeData
    };

    // Check if we're at capacity limit
    if (pendingEvents.current.length >= MAX_PENDING_EVENTS) {
      console.warn('📊 AI Feedback: Event queue full, dropping oldest events');
      pendingEvents.current = pendingEvents.current.slice(-MAX_PENDING_EVENTS + 1);
    }

    pendingEvents.current.push(event);
    changeCount.current++;
    modifiedFields.current.add(fieldName);

    // Check if memory flush is needed
    flushIfNearLimit();

    // Trigger debounced flush
    debouncedFlush();
  }, [enabled, user?.id, createBaseEvent, debouncedFlush]);

  // Track validation events
  const trackValidation = useCallback((
    isValid: boolean,
    validationMessage?: string,
    confidence?: number
  ) => {
    if (!enabled || !user?.id) return;

    const validationData: ValidationData = {
      is_valid: isValid,
      validation_message: validationMessage,
      confidence_score: confidence,
      validation_timestamp: new Date().toISOString()
    };

    const event: FeedbackEvent = {
      ...createBaseEvent(),
      event_type: 'validation',
      data: validationData
    };

    pendingEvents.current.push(event);
    debouncedFlush();
  }, [enabled, user?.id, createBaseEvent, debouncedFlush]);

  // Track reprocessing feedback
  const trackReprocessingFeedback = useCallback((feedbackData: ReprocessingFeedbackData) => {
    if (!enabled || !user?.id) return;

    const event: FeedbackEvent = {
      ...createBaseEvent(),
      event_type: 'reprocessing_feedback',
      data: feedbackData
    };

    pendingEvents.current.push(event);
    // Flush immediately for reprocessing feedback
    flushPendingEvents();
  }, [enabled, user?.id, createBaseEvent, flushPendingEvents]);

  // Finalize session
  const finalizeSession = useCallback(async (): Promise<void> => {
    if (!enabled || !user?.id) return;

    const sessionDuration = Date.now() - sessionStartTime.current;

    // Performance monitoring data
    const performanceMetrics = {
      eventQueueSize: pendingEvents.current.length,
      sessionDuration: sessionDuration,
      eventsPerMinute: (changeCount.current / (sessionDuration / 60000)) || 0,
      memoryPressure: pendingEvents.current.length / MAX_PENDING_EVENTS
    };

    console.log('📊 AI Feedback Session Stats:', {
      totalChanges: changeCount.current,
      fieldsModified: modifiedFields.current.size,
      sessionDurationMin: Math.round(sessionDuration / 60000),
      queueSize: performanceMetrics.eventQueueSize,
      eventsPerMin: Math.round(performanceMetrics.eventsPerMinute)
    });

    const finalEvent: FeedbackEvent = {
      ...createBaseEvent(),
      event_type: 'session_finalized',
      data: {
        total_changes: changeCount.current,
        fields_modified: Array.from(modifiedFields.current),
        session_duration_ms: sessionDuration,
        finalization_timestamp: new Date().toISOString()
      }
    };

    pendingEvents.current.push(finalEvent);
    
    // Flush all pending events immediately
    await flushPendingEvents();
  }, [enabled, user?.id, createBaseEvent, flushPendingEvents]);

  // Enhanced cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cancel all pending operations
      debouncedFlush.cancel();
      
      // Flush any remaining events on unmount (fire and forget)
      if (pendingEvents.current.length > 0) {
        flushPendingEvents().catch(error => {
          console.error('Failed to flush events on unmount:', error);
          // Queue for offline retry as fallback
          try {
            const eventsToQueue = pendingEvents.current.map(event => ({
              id: `${event.cataloging_job_id}_${Date.now()}_${Math.random()}`,
              event,
              timestamp: new Date().toISOString(),
              retryCount: 0
            }));
            AsyncStorage.getItem('feedbackQueue').then(existingQueue => {
              const queue = existingQueue ? JSON.parse(existingQueue) : [];
              queue.push(...eventsToQueue);
              return AsyncStorage.setItem('feedbackQueue', JSON.stringify(queue));
            }).catch(console.error);
          } catch (fallbackError) {
            console.error('Failed to queue events on unmount:', fallbackError);
          }
        });
      }
      
      // Clear pending events to free memory
      pendingEvents.current = [];
      modifiedFields.current.clear();
      changeCount.current = 0;
    };
  }, [flushPendingEvents, debouncedFlush]);

  // Sync offline queue periodically
  useEffect(() => {
    const syncOfflineQueue = async () => {
      try {
        const queueData = await AsyncStorage.getItem('feedbackQueue');
        if (!queueData) return;

        const queue = JSON.parse(queueData);
        if (queue.length === 0) return;

        const eventsToSync = queue.map((item: any) => item.event);
        const success = await submitFeedbackEvents(eventsToSync);

        if (success) {
          await AsyncStorage.removeItem('feedbackQueue');
        }
      } catch (error) {
        console.error('Failed to sync offline queue:', error);
      }
    };

    // Sync on mount and when app becomes active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        syncOfflineQueue();
      }
    };

    // Initial sync
    syncOfflineQueue();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [submitFeedbackEvents]);

  return {
    trackFieldChange,
    trackValidation,
    trackReprocessingFeedback,
    finalizeSession,
    isTracking: enabled && !!user?.id,
    sessionId: sessionIdRef.current
  };
}

// Utility hook to extract confidence from extracted data
export const useFieldConfidence = (extractedData: Record<string, any>, fieldName: string): number | undefined => {
  return useMemo(() => {
    return extractedData?.confidence_scores?.[fieldName];
  }, [extractedData, fieldName]);
};