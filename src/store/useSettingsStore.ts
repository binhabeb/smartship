import { create } from 'zustand';

interface SettingsState {
  fixedCbmRate: number;
  setFixedCbmRate: (rate: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fixedCbmRate: 150, // Default admin dashboard value
  setFixedCbmRate: (rate) => set({ fixedCbmRate: rate }),
}));
