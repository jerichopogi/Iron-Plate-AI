/**
 * IndexedDB Workout Cache
 *
 * Provides offline-first caching for workout data using IndexedDB.
 * Workouts are cached for 7 days and automatically cleaned up.
 */


const DB_NAME = 'ironplate-workout-cache';
const DB_VERSION = 1;
const WORKOUT_STORE = 'workouts';
const COMPLETION_STORE = 'completions';
const CACHE_EXPIRY_DAYS = 7;

export interface CachedWorkout {
  date: string; // ISO date string (YYYY-MM-DD)
  workout: TodayWorkout;
  cachedAt: number; // timestamp
}

export interface TodayWorkout {
  dayNumber: number;
  name: string;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest: number;
    notes?: string;
  }>;
  planId: string;
  planGeneratedAt: string;
}

export interface SetCompletion {
  date: string;
  exerciseId: string;
  setIndex: number;
  completed: boolean;
  completedAt?: number;
}

export interface WorkoutCompletion {
  id: string;
  date: string;
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }>;
  completedAt: number;
  synced: boolean;
}

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Workouts store - keyed by date
      if (!db.objectStoreNames.contains(WORKOUT_STORE)) {
        const workoutStore = db.createObjectStore(WORKOUT_STORE, { keyPath: 'date' });
        workoutStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // Completions store - keyed by date
      if (!db.objectStoreNames.contains(COMPLETION_STORE)) {
        const completionStore = db.createObjectStore(COMPLETION_STORE, { keyPath: 'id' });
        completionStore.createIndex('date', 'date', { unique: false });
        completionStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

/**
 * Cache a workout for offline access
 */
export async function cacheWorkout(date: string, workout: TodayWorkout): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(WORKOUT_STORE, 'readwrite');
    const store = transaction.objectStore(WORKOUT_STORE);

    const cachedWorkout: CachedWorkout = {
      date,
      workout,
      cachedAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(cachedWorkout);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to cache workout:', error);
  }
}

/**
 * Retrieve a cached workout by date
 */
export async function getCachedWorkout(date: string): Promise<TodayWorkout | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(WORKOUT_STORE, 'readonly');
    const store = transaction.objectStore(WORKOUT_STORE);

    const result = await new Promise<CachedWorkout | undefined>((resolve, reject) => {
      const request = store.get(date);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!result) return null;

    // Check if cache has expired
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - result.cachedAt > expiryTime) {
      await clearWorkoutCache(date);
      return null;
    }

    return result.workout;
  } catch (error) {
    console.error('Failed to get cached workout:', error);
    return null;
  }
}

/**
 * Clear cached workout for a specific date
 */
export async function clearWorkoutCache(date: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(WORKOUT_STORE, 'readwrite');
    const store = transaction.objectStore(WORKOUT_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(date);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to clear workout cache:', error);
  }
}

/**
 * Remove workouts older than 7 days
 */
export async function clearOldCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(WORKOUT_STORE, 'readwrite');
    const store = transaction.objectStore(WORKOUT_STORE);
    const index = store.index('cachedAt');

    const expiryTime = Date.now() - (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const range = IDBKeyRange.upperBound(expiryTime);
    const request = index.openCursor(range);

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to clear old cache:', error);
  }
}

/**
 * Save set completion state locally
 */
export async function saveSetCompletion(
  date: string,
  exerciseId: string,
  setIndex: number,
  completed: boolean
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(COMPLETION_STORE, 'readwrite');
    const store = transaction.objectStore(COMPLETION_STORE);

    const completion: SetCompletion & { id: string } = {
      id: `${date}-${exerciseId}-${setIndex}`,
      date,
      exerciseId,
      setIndex,
      completed,
      completedAt: completed ? Date.now() : undefined,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(completion);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to save set completion:', error);
  }
}

/**
 * Get all set completions for a date
 */
export async function getSetCompletions(date: string): Promise<Map<string, boolean>> {
  const completions = new Map<string, boolean>();

  try {
    const db = await openDB();
    const transaction = db.transaction(COMPLETION_STORE, 'readonly');
    const store = transaction.objectStore(COMPLETION_STORE);
    const index = store.index('date');

    const request = index.getAll(date);

    const results = await new Promise<Array<SetCompletion & { id: string }>>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    for (const result of results) {
      completions.set(`${result.exerciseId}-${result.setIndex}`, result.completed);
    }

    db.close();
  } catch (error) {
    console.error('Failed to get set completions:', error);
  }

  return completions;
}

/**
 * Save a completed workout for syncing
 */
export async function saveWorkoutCompletion(completion: Omit<WorkoutCompletion, 'id'>): Promise<string> {
  const id = `workout-${completion.date}-${completion.completedAt}`;

  try {
    const db = await openDB();
    const transaction = db.transaction(COMPLETION_STORE, 'readwrite');
    const store = transaction.objectStore(COMPLETION_STORE);

    const workoutCompletion: WorkoutCompletion = {
      ...completion,
      id,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(workoutCompletion);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to save workout completion:', error);
  }

  return id;
}

/**
 * Get all unsynced workout completions
 */
export async function getUnsyncedCompletions(): Promise<WorkoutCompletion[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(COMPLETION_STORE, 'readonly');
    const store = transaction.objectStore(COMPLETION_STORE);
    const index = store.index('synced');

    const request = index.getAll(IDBKeyRange.only(0));

    const results = await new Promise<WorkoutCompletion[]>((resolve, reject) => {
      request.onsuccess = () => {
        const all = request.result || [];
        // Filter to only workout completions (not set completions)
        const workouts = all.filter((item): item is WorkoutCompletion =>
          item.id?.startsWith('workout-') && item.synced === false
        );
        resolve(workouts);
      };
      request.onerror = () => reject(request.error);
    });

    db.close();
    return results;
  } catch (error) {
    console.error('Failed to get unsynced completions:', error);
    return [];
  }
}

/**
 * Mark a workout completion as synced
 */
export async function markCompletionSynced(id: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(COMPLETION_STORE, 'readwrite');
    const store = transaction.objectStore(COMPLETION_STORE);

    const request = store.get(id);

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        const completion = request.result;
        if (completion) {
          completion.synced = true;
          const updateRequest = store.put(completion);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to mark completion synced:', error);
  }
}

/**
 * Clear all set completions for a date (after finishing workout)
 */
export async function clearDateCompletions(date: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(COMPLETION_STORE, 'readwrite');
    const store = transaction.objectStore(COMPLETION_STORE);
    const index = store.index('date');

    const request = index.openCursor(date);

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          // Only delete set completions, not workout completions
          if (!cursor.value.id?.startsWith('workout-')) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to clear date completions:', error);
  }
}
