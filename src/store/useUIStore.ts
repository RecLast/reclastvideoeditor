import { create } from 'zustand';

interface UIState {
    activePanel: 'media' | 'effects' | 'text' | 'draw';
    selectedClipId: string | null;
    isSidebarOpen: boolean;

    setActivePanel: (panel: 'media' | 'effects' | 'text' | 'draw') => void;
    setSelectedClipId: (id: string | null) => void;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    activePanel: 'media',
    selectedClipId: null,
    isSidebarOpen: true,

    setActivePanel: (panel) => set({ activePanel: panel }),
    setSelectedClipId: (id) => set({ selectedClipId: id }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
}));
