import { create } from 'zustand';

export interface Clip {
    id: string;
    trackId: string;
    name: string;
    sourcePath: string;
    start: number; // Start time in timeline (seconds)
    duration: number; // Duration in timeline (seconds)
    offset: number; // Start time in source media (seconds)
    type: 'video' | 'audio' | 'image' | 'text';
    volume?: number; // 0-1
    speed?: number; // 1 = normal
    opacity?: number; // 0-1
    scale?: number; // 1 = 100%
    position?: { x: number, y: number }; // {x: 0, y: 0} center
}

export interface Track {
    id: string;
    name: string;
    type: 'video' | 'audio' | 'text' | 'image';
    clips: Clip[];
    isMuted: boolean;
    isLocked: boolean;
}

export interface MediaItem {
    id: string;
    file: File;
    objectUrl: string;
    duration: number;
    type: 'video' | 'audio' | 'image';
}

interface RecentProject {
    name: string;
    path: string;
    lastModified: number;
    size: number;
}

interface ElectronFile extends File {
    path?: string;
}

interface ProjectState {
    tracks: Track[];
    mediaPool: MediaItem[];
    currentTime: number;
    duration: number;
    zoomLevel: number;
    isPlaying: boolean;
    selectedClipId: string | null;
    isMagnetic: boolean;
    width: number;
    height: number;
    fps: number;

    addMedia: (media: MediaItem) => void;
    addTrack: (type: Track['type']) => string;
    addClip: (trackId: string, clip: Clip) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;
    setPlayhead: (time: number) => void;
    setZoomLevel: (level: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setSelectedClipId: (id: string | null) => void;

    toggleMagnetic: () => void;
    splitClip: () => void;
    deleteClip: (clipId: string) => void;

    recalculateDuration: () => void;
    saveProject: () => void;
    loadProject: (file: File) => void;
    resetProject: () => void;
    deleteTrack: (id: string) => void;
    setDimensions: (width: number, height: number, fps?: number) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    tracks: [],
    mediaPool: [],
    currentTime: 0,
    duration: 60,
    zoomLevel: 1,
    isPlaying: false,
    selectedClipId: null,
    isMagnetic: false,
    width: 1920,
    height: 1080,
    fps: 30,

    addMedia: (media) => set((state) => ({ mediaPool: [...state.mediaPool, media] })),

    addTrack: (type) => {
        const id = crypto.randomUUID();
        set((state) => ({
            tracks: [...state.tracks, {
                id,
                name: `${type} Track`,
                type,
                clips: [],
                isMuted: false,
                isLocked: false
            }]
        }));
        return id;
    },

    addClip: (trackId, clip) => {
        set((state) => {
            const newTracks = state.tracks.map(t =>
                t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
            );

            // Recalculate duration
            let maxDuration = 0;
            newTracks.forEach(track => {
                track.clips.forEach(c => {
                    const end = c.start + c.duration;
                    if (end > maxDuration) maxDuration = end;
                });
            });

            return { tracks: newTracks, duration: Math.max(maxDuration, 60) };
        });
    },

    updateClip: (clipId, updates) => {
        set((state) => {
            const newTracks = state.tracks.map(t => ({
                ...t,
                clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
            }));

            // Recalculate duration
            let maxDuration = 0;
            newTracks.forEach(track => {
                track.clips.forEach(c => {
                    const end = c.start + c.duration;
                    if (end > maxDuration) maxDuration = end;
                });
            });

            return { tracks: newTracks, duration: Math.max(maxDuration, 60) };
        });
    },

    deleteClip: (clipId) => set((state) => {
        const { tracks, isMagnetic } = state;
        let clipToDelete: Clip | undefined;
        let trackId: string | undefined;

        // Find clip and track
        for (const track of tracks) {
            const found = track.clips.find(c => c.id === clipId);
            if (found) {
                clipToDelete = found;
                trackId = track.id;
                break;
            }
        }

        if (!clipToDelete || !trackId) return state;

        const newTracks = tracks.map(track => {
            if (track.id !== trackId) return track;

            // Filter out the deleted clip
            let updatedClips = track.clips.filter(c => c.id !== clipId);

            // Ripple delete: Shift subsequent clips left
            if (isMagnetic) {
                updatedClips = updatedClips.map(c => {
                    if (c.start > clipToDelete!.start) {
                        return { ...c, start: c.start - clipToDelete!.duration };
                    }
                    return c;
                });
            }

            return { ...track, clips: updatedClips };
        });

        // Recalculate duration
        let maxDuration = 0;
        newTracks.forEach(track => {
            track.clips.forEach(c => {
                const end = c.start + c.duration;
                if (end > maxDuration) maxDuration = end;
            });
        });

        return {
            tracks: newTracks,
            selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
            duration: Math.max(maxDuration, 60)
        };
    }),

    splitClip: () => set((state) => {
        const { tracks, currentTime, selectedClipId } = state;
        if (!selectedClipId) return state;

        const newTracks = tracks.map(track => {
            const clipToSplit = track.clips.find(c => c.id === selectedClipId);
            if (!clipToSplit) return track;

            // Check if playhead is inside clip
            if (currentTime <= clipToSplit.start || currentTime >= clipToSplit.start + clipToSplit.duration) {
                return track;
            }

            const splitPoint = currentTime - clipToSplit.start;

            // Update original clip
            const updatedOriginal = { ...clipToSplit, duration: splitPoint };

            // Create new clip
            const newClip: Clip = {
                ...clipToSplit,
                id: crypto.randomUUID(),
                start: currentTime,
                duration: clipToSplit.duration - splitPoint,
                offset: clipToSplit.offset + splitPoint,
                volume: clipToSplit.volume ?? 1,
                speed: clipToSplit.speed ?? 1,
                opacity: clipToSplit.opacity ?? 1,
                scale: clipToSplit.scale ?? 1,
                position: clipToSplit.position ?? { x: 0, y: 0 }
            };

            return {
                ...track,
                clips: [...track.clips.filter(c => c.id !== selectedClipId), updatedOriginal, newClip]
            };
        });

        const newState = { tracks: newTracks };
        // Recalculate duration
        let maxDuration = 0;
        newTracks.forEach(track => {
            track.clips.forEach(clip => {
                const end = clip.start + clip.duration;
                if (end > maxDuration) maxDuration = end;
            });
        });
        return { ...newState, duration: Math.max(maxDuration, 60) };
    }),

    setPlayhead: (time) => set({ currentTime: time }),
    setZoomLevel: (level) => set({ zoomLevel: level }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setSelectedClipId: (id) => set({ selectedClipId: id }),
    toggleMagnetic: () => set((state) => ({ isMagnetic: !state.isMagnetic })),

    deleteTrack: (id: string) => set((state) => ({
        tracks: state.tracks.filter(t => t.id !== id)
    })),

    setDimensions: (width: number, height: number, fps = 30) => set({ width, height, fps }),

    resetProject: () => set({
        tracks: [
            { id: 'video-1', type: 'video', clips: [], name: 'Video 1', isMuted: false, isLocked: false },
            { id: 'audio-1', type: 'audio', clips: [], name: 'Audio 1', isMuted: false, isLocked: false }
        ],
        mediaPool: [],
        currentTime: 0,
        duration: 60,
        selectedClipId: null,
        width: 1920,
        height: 1080,
        fps: 30
    }),

    // Helper to recalculate project duration
    recalculateDuration: () => set((state) => {
        let maxDuration = 0;
        state.tracks.forEach(track => {
            track.clips.forEach(clip => {
                const end = clip.start + clip.duration;
                if (end > maxDuration) maxDuration = end;
            });
        });
        return { duration: Math.max(maxDuration, 60) }; // Minimum 60s
    }),

    saveProject: () => {
        const state = get();
        const projectData = {
            tracks: state.tracks,
            duration: state.duration,
            zoomLevel: state.zoomLevel,
            width: state.width,
            height: state.height,
            fps: state.fps
        };
        const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    loadProject: (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                if (data.tracks) {
                    set({
                        tracks: data.tracks,
                        duration: data.duration || 60,
                        zoomLevel: data.zoomLevel || 1,
                        width: data.width || 1920,
                        height: data.height || 1080,
                        fps: data.fps || 30,
                        currentTime: 0,
                        selectedClipId: null
                    });

                    // Save to Recent Projects
                    try {
                        const recent: RecentProject[] = JSON.parse(localStorage.getItem('recentProjects') || '[]');
                        const newProject: RecentProject = {
                            name: file.name.replace('.json', ''),
                            path: (file as ElectronFile).path || file.name, // file.path is available in Electron
                            lastModified: Date.now(),
                            size: file.size
                        };

                        // Remove duplicates
                        const filtered = recent.filter((p) => p.path !== newProject.path);
                        const updated = [newProject, ...filtered].slice(0, 10); // Keep last 10

                        localStorage.setItem('recentProjects', JSON.stringify(updated));
                    } catch (err) {
                        console.error('Failed to save recent project:', err);
                    }
                }
            } catch (error) {
                console.error('Failed to load project:', error);
            }
        };
        reader.readAsText(file);
    }
}));
