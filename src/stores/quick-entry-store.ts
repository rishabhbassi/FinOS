// Finance OS - Quick Entry Store (Zustand)
// Shared state so Quick Entry can be opened from any page

import { create } from 'zustand';

interface QuickEntryState {
  open: boolean;
  openQuickEntry: () => void;
  closeQuickEntry: () => void;
}

export const useQuickEntryStore = create<QuickEntryState>((set) => ({
  open: false,
  openQuickEntry: () => set({ open: true }),
  closeQuickEntry: () => set({ open: false }),
}));
