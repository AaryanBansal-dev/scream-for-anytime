/**
 * PRIVACY-FIRST MEMORY STORE
 * 
 * This is a completely in-memory storage system that:
 * - Stores all data ONLY in browser RAM
 * - Never persists to disk or sends to any server
 * - Auto-wipes on page unload/refresh
 * - Provides a panic wipe function for immediate data destruction
 * 
 * PRIVACY GUARANTEE: All data stored here is ephemeral and will be
 * permanently deleted when the browser tab closes or refreshes.
 */

export interface VentEntry {
  id: string;
  content: string;
  timestamp: number;
  type: 'typed' | 'spoken';
}

export interface ScreamSession {
  id: string;
  peakVolume: number;
  duration: number;
  timestamp: number;
}

interface MemoryState {
  ventEntries: VentEntry[];
  screamSessions: ScreamSession[];
  isInitialized: boolean;
}

// Private in-memory storage - never persisted
const memoryState: MemoryState = {
  ventEntries: [],
  screamSessions: [],
  isInitialized: false,
};

/**
 * Initialize the memory store
 * Sets up beforeunload handler to ensure data is wiped on page exit
 */
export function initializeMemoryStore(): void {
  if (memoryState.isInitialized) return;
  
  memoryState.isInitialized = true;
  
  // PRIVACY: Auto-wipe all data when user leaves the page
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      panicWipe();
    });
    
    // Also clear on page hide (mobile browsers)
    window.addEventListener('pagehide', () => {
      panicWipe();
    });
  }
}

/**
 * PANIC WIPE - Immediately destroys all stored data
 * 
 * This function:
 * - Clears all in-memory arrays
 * - Resets all state to initial values
 * - Cannot be undone
 * 
 * Use this when user wants immediate data deletion.
 */
export function panicWipe(): void {
  memoryState.ventEntries = [];
  memoryState.screamSessions = [];
  // Keep isInitialized true so listeners stay active
}

/**
 * Add a vent entry (typed or spoken text)
 */
export function addVentEntry(content: string, type: 'typed' | 'spoken'): VentEntry {
  const entry: VentEntry = {
    id: generateId(),
    content,
    timestamp: Date.now(),
    type,
  };
  memoryState.ventEntries.push(entry);
  return entry;
}

/**
 * Get all vent entries (read-only copy)
 */
export function getVentEntries(): VentEntry[] {
  return [...memoryState.ventEntries];
}

/**
 * Clear all vent entries
 */
export function clearVentEntries(): void {
  memoryState.ventEntries = [];
}

/**
 * Add a scream session record
 */
export function addScreamSession(peakVolume: number, duration: number): ScreamSession {
  const session: ScreamSession = {
    id: generateId(),
    peakVolume,
    duration,
    timestamp: Date.now(),
  };
  memoryState.screamSessions.push(session);
  return session;
}

/**
 * Get all scream sessions (read-only copy)
 */
export function getScreamSessions(): ScreamSession[] {
  return [...memoryState.screamSessions];
}

/**
 * Clear all scream sessions
 */
export function clearScreamSessions(): void {
  memoryState.screamSessions = [];
}

/**
 * Generate a unique ID (client-side only, no external dependencies)
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get total entry count (for UI display)
 */
export function getTotalEntryCount(): number {
  return memoryState.ventEntries.length + memoryState.screamSessions.length;
}
