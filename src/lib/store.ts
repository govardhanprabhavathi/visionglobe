import { create } from 'zustand';

interface GlobeState {
  handPosition: { x: number; y: number; z: number } | null;
  distance: number;
  isFist: boolean;
  trackingActive: boolean;
  spinDelta: { x: number, y: number };
  setHandPosition: (pos: { x: number; y: number; z: number } | null) => void;
  setDistance: (distance: number) => void;
  setIsFist: (isFist: boolean) => void;
  setTrackingActive: (active: boolean) => void;
  setSpinDelta: (delta: { x: number, y: number }) => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  handPosition: null,
  distance: 1, // Default scale multiplier
  isFist: false,
  trackingActive: false,
  spinDelta: { x: 0, y: 0 },
  setHandPosition: (handPosition) => set({ handPosition }),
  setDistance: (distance) => set({ distance }),
  setIsFist: (isFist) => set({ isFist }),
  setTrackingActive: (trackingActive) => set({ trackingActive }),
  setSpinDelta: (spinDelta) => set({ spinDelta }),
}));
