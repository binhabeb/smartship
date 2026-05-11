import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface SettingsState {
  fixedCbmRate: number;
  officeCommission: number;
  setFixedCbmRate: (rate: number) => void;
  setOfficeCommission: (rate: number) => void;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fixedCbmRate: 150, // Default fallback
  officeCommission: 5, // Default fallback
  setFixedCbmRate: (rate) => set({ fixedCbmRate: rate }),
  setOfficeCommission: (rate) => set({ officeCommission: rate }),
  fetchSettings: async () => {
    try {
      const { data } = await supabase.from('site_settings').select('fixed_cbm_rate, office_commission').single();
      if (data) {
        if (data.fixed_cbm_rate !== undefined) set({ fixedCbmRate: data.fixed_cbm_rate });
        if (data.office_commission !== undefined) set({ officeCommission: data.office_commission });
      }
    } catch (err) {
      console.error('Failed to fetch settings for calculator', err);
    }
  }
}));
