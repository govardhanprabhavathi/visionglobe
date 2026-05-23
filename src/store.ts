import { create } from 'zustand';

export interface GlobeNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  connections: string[]; // Node IDs this node connects to
  metrics: {
    latency: number;
    bandwidth: string;
    status: 'online' | 'warning' | 'offline';
  };
  details: string;
}

interface GlobeState {
  autoRotate: boolean;
  rotationSpeed: number;
  isTracking: boolean;
  trackingStatus: 'idle' | 'loading' | 'active' | 'error';
  trackingError: string | null;
  activeGesture: string;
  activeNode: GlobeNode | null;
  cameraRotation: [number, number]; // [rotationY, rotationX]
  zoomFactor: number;
  nodes: GlobeNode[];
  
  // Actions
  setAutoRotate: (autoRotate: boolean) => void;
  setRotationSpeed: (speed: number) => void;
  setIsTracking: (isTracking: boolean) => void;
  setTrackingStatus: (status: 'idle' | 'loading' | 'active' | 'error') => void;
  setTrackingError: (error: string | null) => void;
  setActiveGesture: (gesture: string) => void;
  setActiveNode: (nodeId: string | null) => void;
  updateCameraRotation: (deltaY: number, deltaX: number) => void;
  setCameraRotation: (y: number, x: number) => void;
  setZoomFactor: (zoom: number) => void;
}

const initialNodes: GlobeNode[] = [
  {
    id: 'tokyo',
    name: 'Tokyo Hub',
    lat: 35.6762,
    lng: 139.6503,
    connections: ['london', 'sydney', 'mumbai'],
    metrics: { latency: 45, bandwidth: '1.2 Gbps', status: 'online' },
    details: 'Primary Asia-Pacific routing gateway. Handling heavy optical fiber traffic.'
  },
  {
    id: 'newyork',
    name: 'New York Node',
    lat: 40.7128,
    lng: -74.0060,
    connections: ['london', 'rio', 'tokyo'],
    metrics: { latency: 12, bandwidth: '2.5 Gbps', status: 'online' },
    details: 'North American trans-Atlantic terminal. High density transaction hub.'
  },
  {
    id: 'london',
    name: 'London Transit',
    lat: 51.5074,
    lng: -0.1278,
    connections: ['newyork', 'cairo', 'mumbai'],
    metrics: { latency: 18, bandwidth: '1.8 Gbps', status: 'online' },
    details: 'European core backbone ring connection point. Highly redundant links.'
  },
  {
    id: 'sydney',
    name: 'Sydney Terminal',
    lat: -33.8688,
    lng: 151.2093,
    connections: ['tokyo', 'rio'],
    metrics: { latency: 85, bandwidth: '850 Mbps', status: 'warning' },
    details: 'Oceanic link junction. Experiencing moderate weather-induced attenuation.'
  },
  {
    id: 'cairo',
    name: 'Cairo Station',
    lat: 30.0444,
    lng: 31.2357,
    connections: ['london', 'mumbai'],
    metrics: { latency: 62, bandwidth: '620 Mbps', status: 'online' },
    details: 'Middle East & North Africa hub. Link routing optimized for low latency.'
  },
  {
    id: 'rio',
    name: 'Rio de Janeiro Gateway',
    lat: -22.9068,
    lng: -43.1729,
    connections: ['newyork', 'sydney'],
    metrics: { latency: 50, bandwidth: '950 Mbps', status: 'online' },
    details: 'South American east coast transit center connecting trans-oceanic cables.'
  },
  {
    id: 'mumbai',
    name: 'Mumbai Terminal',
    lat: 19.0760,
    lng: 72.8777,
    connections: ['tokyo', 'london', 'cairo'],
    metrics: { latency: 38, bandwidth: '1.1 Gbps', status: 'online' },
    details: 'South Asian gateway connecting mainland fiber networks with Indian Ocean pipelines.'
  }
];

export const useGlobeStore = create<GlobeState>((set) => ({
  autoRotate: true,
  rotationSpeed: 0.15,
  isTracking: false,
  trackingStatus: 'idle',
  trackingError: null,
  activeGesture: 'None',
  activeNode: null,
  cameraRotation: [0, 0],
  zoomFactor: 1.0,
  nodes: initialNodes,

  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),
  setIsTracking: (isTracking) => set({ isTracking }),
  setTrackingStatus: (trackingStatus) => set({ trackingStatus }),
  setTrackingError: (trackingError) => set({ trackingError }),
  setActiveGesture: (activeGesture) => set({ activeGesture }),
  setActiveNode: (nodeId) => set((state) => ({
    activeNode: state.nodes.find(n => n.id === nodeId) || null
  })),
  updateCameraRotation: (deltaY, deltaX) => set((state) => {
    // Limit pitch (rotationX) between -pi/2.2 and pi/2.2 to prevent camera flipping upside down
    const newX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, state.cameraRotation[1] + deltaX));
    const newY = state.cameraRotation[0] + deltaY;
    return { cameraRotation: [newY, newX], autoRotate: false };
  }),
  setCameraRotation: (y, x) => set({ cameraRotation: [y, x] }),
  setZoomFactor: (zoom) => set({
    zoomFactor: Math.max(0.5, Math.min(3.0, zoom))
  })
}));
