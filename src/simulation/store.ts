import { create } from 'zustand';
import type { SimState } from '../types/simulation';

type Store = SimState & { set: <K extends keyof SimState>(key: K, value: SimState[K]) => void };

export const useSimStore = create<Store>((set) => ({
  material: 'cotton',
  fit: 'regular',
  pattern: 'mothtech_style',
  temperatureC: 26,
  humidityPct: 62,
  windKph: 4,
  paceKph: 12,
  sweatRate: 0.72,
  metabolicHeat: 86,
  perforationScale: 0.75,
  set: (key, value) => set({ [key]: value } as Pick<Store, typeof key>)
}));
