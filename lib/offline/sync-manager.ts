/**
 * Sync Manager
 *
 * Handles background synchronization of workout completions.
 * Listens to online/offline events and syncs pending data when connection is restored.
 */

import { createClient } from '@/lib/supabase/client';
import type { Database, Json } from '@/lib/supabase/database.types';
import {
  getUnsyncedCompletions,
  markCompletionSynced,
  type WorkoutCompletion,
} from './workout-cache';

type WorkoutLogInsert = Database['public']['Tables']['workout_logs']['Insert'];
type WorkoutLogUpdate = Database['public']['Tables']['workout_logs']['Update'];

type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';
type ConnectionStatus = 'online' | 'offline';

type SyncListener = (status: SyncStatus) => void;
type ConnectionListener = (status: ConnectionStatus) => void;

class SyncManager {
  private syncListeners: Set<SyncListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private syncStatus: SyncStatus = 'idle';
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the sync manager - call once on app startup
   */
  initialize(): void {
    if (this.initialized || typeof window === 'undefined') return;

    this.initialized = true;
    this.isOnline = navigator.onLine;

    // Listen to online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Start periodic sync check (every 30 seconds when online)
    this.startSyncInterval();

    // Attempt initial sync if online
    if (this.isOnline) {
      this.syncPendingCompletions();
    }
  }

  /**
   * Cleanup listeners - call on app unmount
   */
  destroy(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.initialized = false;
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyConnectionListeners('online');
    // Sync when coming back online
    this.syncPendingCompletions();
    this.startSyncInterval();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyConnectionListeners('offline');
    this.stopSyncInterval();
  };

  private startSyncInterval(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncStatus !== 'syncing') {
        this.syncPendingCompletions();
      }
    }, 30000); // 30 seconds
  }

  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Get current online status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.isOnline ? 'online' : 'offline';
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(listener: SyncListener): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  private notifySyncListeners(status: SyncStatus): void {
    this.syncStatus = status;
    this.syncListeners.forEach((listener) => listener(status));
  }

  private notifyConnectionListeners(status: ConnectionStatus): void {
    this.connectionListeners.forEach((listener) => listener(status));
  }

  /**
   * Sync all pending workout completions to Supabase
   */
  async syncPendingCompletions(): Promise<void> {
    if (!this.isOnline || this.syncStatus === 'syncing') return;

    try {
      this.notifySyncListeners('syncing');

      const pendingCompletions = await getUnsyncedCompletions();

      if (pendingCompletions.length === 0) {
        this.notifySyncListeners('idle');
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        this.notifySyncListeners('error');
        return;
      }

      // Sync each completion
      for (const completion of pendingCompletions) {
        const success = await this.syncSingleCompletion(completion, user.id);
        if (success) {
          await markCompletionSynced(completion.id);
        }
      }

      this.notifySyncListeners('success');

      // Reset to idle after a short delay
      setTimeout(() => {
        if (this.syncStatus === 'success') {
          this.notifySyncListeners('idle');
        }
      }, 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifySyncListeners('error');
    }
  }

  private async syncSingleCompletion(
    completion: WorkoutCompletion,
    userId: string
  ): Promise<boolean> {
    try {
      const supabase = createClient();

      // Check if record exists for this date
      const { data: existing } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('workout_date', completion.date)
        .maybeSingle() as { data: { id: string } | null };

      const insertData: WorkoutLogInsert = {
        user_id: userId,
        workout_date: completion.date,
        exercises: completion.exercises as Json,
        completed_at: new Date(completion.completedAt).toISOString(),
      };

      let syncError;

      if (existing) {
        // Update existing record
        const updateData: WorkoutLogUpdate = {
          exercises: completion.exercises as Json,
          completed_at: new Date(completion.completedAt).toISOString(),
        };
        const result = await supabase
          .from('workout_logs')
          .update(updateData as never)
          .eq('id', existing.id);
        syncError = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('workout_logs')
          .insert(insertData as never);
        syncError = result.error;
      }

      if (syncError) {
        console.error('Failed to sync completion:', syncError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to sync completion:', error);
      return false;
    }
  }

  /**
   * Manually trigger a sync
   */
  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      console.warn('Cannot sync while offline');
      return;
    }
    await this.syncPendingCompletions();
  }
}

// Singleton instance
export const syncManager = new SyncManager();

// React hook for using sync manager
export function useSyncManager() {
  return {
    initialize: () => syncManager.initialize(),
    destroy: () => syncManager.destroy(),
    getConnectionStatus: () => syncManager.getConnectionStatus(),
    getSyncStatus: () => syncManager.getSyncStatus(),
    onSyncStatusChange: (listener: SyncListener) => syncManager.onSyncStatusChange(listener),
    onConnectionChange: (listener: ConnectionListener) => syncManager.onConnectionChange(listener),
    forceSync: () => syncManager.forceSync(),
  };
}
