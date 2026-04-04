import { create } from "zustand";

interface AppStore {
  sidebarOpen: boolean;
  expandedGroups: string[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleGroup: (id: string) => void;
  setGroupExpanded: (id: string, expanded: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  expandedGroups: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleGroup: (id) =>
    set((state) => ({
      expandedGroups: state.expandedGroups.includes(id)
        ? state.expandedGroups.filter((g) => g !== id)
        : [...state.expandedGroups, id],
    })),
  setGroupExpanded: (id, expanded) =>
    set((state) => ({
      expandedGroups: expanded
        ? state.expandedGroups.includes(id)
          ? state.expandedGroups
          : [...state.expandedGroups, id]
        : state.expandedGroups.filter((g) => g !== id),
    })),
}));
