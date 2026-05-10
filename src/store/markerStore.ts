/* Global state store for marker detection sessions */
import { create } from 'zustand';
import { DetectedMarker, ScanSession, ScanStatus } from '@/types';
import { MAX_MARKERS } from '@/constants/appConstants';

interface MarkerState {
    currentSession: ScanSession | null;
    scanStatus: ScanStatus;
    sessions: ScanSession[];
}

interface MarkerActions {
    startSession(): void;
    resumeSession(): void;
    addMarker(marker: DetectedMarker): void;
    completeSession(): void;
    stopSession(): void;
    cancelSession(): void;
    clearHistory(): void;
}

export type MarkerStore = MarkerState & MarkerActions;

function devLog(action: string, payload?: unknown): void {
    if (__DEV__) {
        console.log(`[MarkerStore] ${action}`, payload ?? '');
    }
}

export const useMarkerStore = create<MarkerStore>((set, get) => ({
    currentSession: null,
    scanStatus: 'idle',
    sessions: [],

    /* Creates a new scanning session */
    startSession() {
        const session: ScanSession = {
            id: `session_${Date.now()}`,
            startedAt: Date.now(),
            completedAt: null,
            markers: [],
            totalFramesScanned: 0,
        };
        devLog('startSession', session.id);
        set({ currentSession: session, scanStatus: 'scanning' });
    },

    resumeSession() {
        const { currentSession } = get();
        if (!currentSession) {
            get().startSession();
            return;
        }
        devLog('resumeSession', currentSession.id);
        set({ scanStatus: 'scanning' });
    },

    /* Adds a newly detected marker to the current session */
    addMarker(marker: DetectedMarker) {
        const { currentSession } = get();
        if (!currentSession) {
            devLog('addMarker no active session, ignoring');
            return;
        }
        if (currentSession.markers.length >= MAX_MARKERS) {
            devLog('addMarker already at MAX_MARKERS, ignoring');
            return;
        }

        const updated: ScanSession = {
            ...currentSession,
            markers: [...currentSession.markers, marker],
            totalFramesScanned: currentSession.totalFramesScanned + 1,
        };

        const done = updated.markers.length >= MAX_MARKERS;
        devLog(
            `addMarker [${updated.markers.length}/${MAX_MARKERS}]`,
            marker.id,
        );

        set({
            currentSession: updated,
            scanStatus: done ? 'complete' : 'scanning',
        });

        if (done) {
            get().completeSession();
        }
    },

    completeSession() {
        const { currentSession, sessions } = get();
        if (!currentSession) return;

        const completed: ScanSession = {
            ...currentSession,
            completedAt: Date.now(),
        };
        devLog('completeSession', completed.id);

        const existingIndex = sessions.findIndex(s => s.id === completed.id);
        let newHistory = [...sessions];
        if (existingIndex >= 0) {
            newHistory[existingIndex] = completed;
        } else {
            newHistory = [completed, ...newHistory];
        }

        set({
            currentSession: completed,
            scanStatus: 'complete',
            sessions: newHistory,
        });
    },

    /* Pauses the current session and saves to history */
    stopSession() {
        const { currentSession, sessions } = get();
        if (!currentSession) {
            devLog('stopSession no active session');
            set({ scanStatus: 'idle' });
            return;
        }
        const stopped: ScanSession = {
            ...currentSession,
            completedAt: Date.now(),
        };
        devLog(
            'stopSession',
            `${stopped.id} (markers: ${stopped.markers.length})`,
        );

        const existingIndex = sessions.findIndex(s => s.id === stopped.id);
        let newHistory = [...sessions];
        if (existingIndex >= 0) {
            newHistory[existingIndex] = stopped;
        } else {
            newHistory = [stopped, ...newHistory];
        }

        set({
            currentSession: stopped,
            scanStatus: 'idle',
            sessions: newHistory,
        });
    },

    cancelSession() {
        devLog('cancelSession');
        set({ currentSession: null, scanStatus: 'idle' });
    },

    clearHistory() {
        devLog('clearHistory');
        set({ sessions: [] });
    },
}));

/* Store selectors */

export const selectMarkerCount = (s: MarkerStore): number =>
    s.currentSession?.markers.length ?? 0;

export const selectElapsedSeconds = (s: MarkerStore): string | null => {
    const { currentSession } = s;
    if (!currentSession?.completedAt) return null;
    return (
        (currentSession.completedAt - currentSession.startedAt) /
        1000
    ).toFixed(1);
};

export const selectScanStatus = (s: MarkerStore): ScanStatus => s.scanStatus;

export const selectCurrentSession = (s: MarkerStore): ScanSession | null =>
    s.currentSession;

export const selectSessions = (s: MarkerStore): ScanSession[] => s.sessions;
