// services/feedbackQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import { 
  FeedbackEvent, 
  CreateFeedbackEventRequest,
  QueuedFeedbackEvent,
  transformMobileEventsToEdgeFunctionBatch,
  isValidQueuedFeedbackEvent
} from '@/types/ai-feedback';

const QUEUE_STORAGE_KEY = 'feedbackQueue';
const MAX_QUEUE_SIZE = 100; // Prevent memory issues
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

export class FeedbackQueue {
  private static instance: FeedbackQueue;
  private queue: QueuedFeedbackEvent[] = [];
  private isSyncing = false;
  private syncIntervalId: any = null;
  private appStateSubscription: any = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): FeedbackQueue {
    if (!FeedbackQueue.instance) {
      FeedbackQueue.instance = new FeedbackQueue();
    }
    return FeedbackQueue.instance;
  }

  private async initialize() {
    await this.loadQueue();
    this.setupAppStateListener();
    this.startPeriodicSync();
  }

  private setupAppStateListener() {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Sync when app becomes active
        this.syncQueue();
      } else if (nextAppState === 'background') {
        // Stop periodic sync when app goes to background
        this.stopPeriodicSync();
      }
    };

    this.appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }

  private startPeriodicSync() {
    // Sync every 30 seconds when app is active
    this.syncIntervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        this.syncQueue();
      }
    }, 30000);
  }

  private stopPeriodicSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  private async loadQueue(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Validate parsed data structure
          if (Array.isArray(parsed)) {
            this.queue = parsed.filter(isValidQueuedFeedbackEvent);
          } else {
            throw new Error('Invalid queue data structure');
          }
        } catch (parseError) {
          console.error('📊 Feedback Queue: Failed to parse queue data - possible corruption:', parseError);
          // Notify about data loss (could trigger user notification in production)
          console.warn('📊 Feedback Queue: Clearing corrupted queue data - some feedback events may be lost');
          this.queue = [];
          await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
          
          // TODO: In production, consider adding analytics/crash reporting here
          // Example: Crashlytics.recordError(new Error('Feedback queue data corruption'));
        }
      } else {
        this.queue = [];
      }
      
      // Clean up old events (older than 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      this.queue = this.queue.filter(item => item.timestamp > oneDayAgo);
      
      await this.saveQueue();
    } catch (error) {
      console.error('Failed to load feedback queue:', error);
      this.queue = [];
      // Clear corrupted storage
      try {
        await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      } catch (clearError) {
        console.error('Failed to clear corrupted queue storage:', clearError);
      }
    }
  }


  private async saveQueue(): Promise<void> {
    try {
      // Optimized serialization for better AsyncStorage performance
      const serializedQueue = JSON.stringify(this.queue, (key, value) => {
        // Compress common strings and remove null/undefined values
        if (value === null || value === undefined) return undefined;
        if (typeof value === 'string' && value.length > 1000) {
          // Truncate extremely long strings to prevent storage bloat
          return value.substring(0, 1000) + '...[truncated]';
        }
        return value;
      });
      
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, serializedQueue);
    } catch (error) {
      console.error('Failed to save feedback queue:', error);
      
      // Fallback: try to save a smaller version by removing oldest events
      if (this.queue.length > 10) {
        const reducedQueue = this.queue.slice(-10);
        try {
          await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(reducedQueue));
          this.queue = reducedQueue;
          console.log('Saved reduced queue due to storage constraints');
        } catch (fallbackError) {
          console.error('Even reduced queue save failed:', fallbackError);
        }
      }
    }
  }

  async queueEvent(event: FeedbackEvent): Promise<void> {
    // Prevent queue from growing too large
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest events
      this.queue = this.queue.slice(-MAX_QUEUE_SIZE + 1);
    }

    const queuedEvent: QueuedFeedbackEvent = {
      id: `${event.cataloging_job_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.queue.push(queuedEvent);
    await this.saveQueue();

    // Try to sync immediately if not already syncing
    if (!this.isSyncing) {
      this.syncQueue();
    }
  }

  async queueMultipleEvents(events: FeedbackEvent[]): Promise<void> {
    for (const event of events) {
      await this.queueEvent(event);
    }
  }

  async syncQueue(): Promise<boolean> {
    if (this.isSyncing || this.queue.length === 0) {
      return true;
    }

    this.isSyncing = true;

    try {
      // Group events by retry count for different handling
      const eventsToRetry = this.queue.filter(item => item.retryCount < MAX_RETRY_COUNT);
      const eventsToDiscard = this.queue.filter(item => item.retryCount >= MAX_RETRY_COUNT);

      if (eventsToDiscard.length > 0) {
        console.warn(`Discarding ${eventsToDiscard.length} events that exceeded max retry count`);
      }

      if (eventsToRetry.length === 0) {
        this.queue = [];
        await this.saveQueue();
        return true;
      }

      // Attempt to submit events
      const eventsToSubmit = eventsToRetry.map(item => item.event);
      const success = await this.submitEvents(eventsToSubmit);

      if (success) {
        // Remove successfully synced events
        this.queue = this.queue.filter(item => item.retryCount >= MAX_RETRY_COUNT);
        console.log(`Successfully synced ${eventsToSubmit.length} feedback events`);
      } else {
        // Increment retry count for failed events
        eventsToRetry.forEach(item => {
          item.retryCount++;
        });
        console.log(`Failed to sync events, will retry. Queue size: ${this.queue.length}`);
      }

      await this.saveQueue();
      return success;

    } catch (error) {
      console.error('Error during queue sync:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  private async submitEvents(events: FeedbackEvent[]): Promise<boolean> {
    // Batch optimization: split large payloads to prevent timeout
    const BATCH_SIZE = 20;
    
    if (events.length <= BATCH_SIZE) {
      return this.submitEventBatch(events);
    }

    // Process in smaller batches
    const batches = [];
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      batches.push(events.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    for (const batch of batches) {
      const success = await this.submitEventBatch(batch);
      if (success) successCount++;
      
      // Add small delay between batches to prevent rate limiting
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Require 95% success rate to minimize data loss
    const successRate = successCount / batches.length;
    if (successRate < 0.95) {
      console.warn(`📊 Feedback Queue: Low success rate: ${Math.round(successRate * 100)}% (${successCount}/${batches.length} batches)`);
    }
    return successRate >= 0.95;
  }

  private async submitEventBatch(events: FeedbackEvent[]): Promise<boolean> {
    try {
      // Transform mobile events to Edge Function format
      const edgeFunctionPayload = transformMobileEventsToEdgeFunctionBatch(events);
      
      // Create timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('📊 Feedback Queue: Batch request timeout, aborting...');
        controller.abort();
      }, 20000); // 20 second timeout for batch operations
      
      const { data, error } = await supabase.functions.invoke('ai-feedback', {
        body: edgeFunctionPayload,
        headers: {
          'Content-Type': 'application/json',
        }
        // Note: Supabase JS client handles timeouts internally
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('📊 Feedback Queue: Supabase function error:', error);
        
        // Log additional context for debugging
        if (error.message?.includes('timeout')) {
          console.warn('📊 Feedback Queue: Request timed out, will retry later');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          console.warn('📊 Feedback Queue: Network error, will retry later');
        } else {
          console.warn('📊 Feedback Queue: Unknown error:', error.message);
        }
        
        return false;
      }

      console.log(`📊 Feedback Queue: Successfully submitted batch of ${events.length} events to Edge Function`);
      return true;
    } catch (error) {
      console.error('📊 Feedback Queue: Network error submitting events:', error);
      
      // Enhanced error classification
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('📊 Feedback Queue: Batch request was aborted due to timeout');
        } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
          console.warn('📊 Feedback Queue: Network connectivity issue');
        }
      }
      
      return false;
    }
  }

  async getQueueStatus(): Promise<{
    totalEvents: number;
    pendingEvents: number;
    failedEvents: number;
    oldestEventTimestamp?: string;
  }> {
    const pendingEvents = this.queue.filter(item => item.retryCount < MAX_RETRY_COUNT);
    const failedEvents = this.queue.filter(item => item.retryCount >= MAX_RETRY_COUNT);
    const oldestEvent = this.queue.sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0];

    return {
      totalEvents: this.queue.length,
      pendingEvents: pendingEvents.length,
      failedEvents: failedEvents.length,
      oldestEventTimestamp: oldestEvent?.timestamp
    };
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  async forceSync(): Promise<boolean> {
    return await this.syncQueue();
  }

  // Cleanup method for when the app is being terminated
  cleanup(): void {
    this.stopPeriodicSync();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // Final sync attempt (fire and forget)
    if (this.queue.length > 0) {
      this.syncQueue().catch(console.error);
    }
  }

  // Static method to get queue instance and initialize if needed
  static async getInitializedInstance(): Promise<FeedbackQueue> {
    const instance = FeedbackQueue.getInstance();
    // Give the instance a moment to initialize if it's the first call
    await new Promise(resolve => setTimeout(resolve, 100));
    return instance;
  }
}

// Convenience functions for easy use
export const queueFeedbackEvent = async (event: FeedbackEvent): Promise<void> => {
  const queue = await FeedbackQueue.getInitializedInstance();
  return queue.queueEvent(event);
};

export const queueMultipleFeedbackEvents = async (events: FeedbackEvent[]): Promise<void> => {
  const queue = await FeedbackQueue.getInitializedInstance();
  return queue.queueMultipleEvents(events);
};

export const syncFeedbackQueue = async (): Promise<boolean> => {
  const queue = await FeedbackQueue.getInitializedInstance();
  return queue.forceSync();
};

export const getFeedbackQueueStatus = async () => {
  const queue = await FeedbackQueue.getInitializedInstance();
  return queue.getQueueStatus();
};

export const clearFeedbackQueue = async (): Promise<void> => {
  const queue = await FeedbackQueue.getInitializedInstance();
  return queue.clearQueue();
};