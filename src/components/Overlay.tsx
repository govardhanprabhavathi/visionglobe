import React from 'react';
import { useGlobeStore } from '../lib/store';
import { Hand, ZoomIn, Pause, Activity } from 'lucide-react';

export const Overlay: React.FC = () => {
  const { trackingActive, isFist, distance } = useGlobeStore();

  return (
    <div className="overlay-container">
      <header className="header">
        <h1>VisionGlobe</h1>
        <div className={`status-badge ${trackingActive ? 'active' : 'inactive'}`}>
          <Activity size={16} />
          {trackingActive ? 'Tracking Active' : 'No Hands Detected'}
        </div>
      </header>

      <div className="instructions-panel">
        <h2>Gestures</h2>
        <ul>
          <li className={trackingActive && !isFist && distance < 2 ? 'highlight' : ''}>
            <Hand size={20} />
            <span><strong>Open Hand:</strong> Float & Follow</span>
          </li>
          <li className={distance >= 2 ? 'highlight' : ''}>
            <ZoomIn size={20} />
            <span><strong>Two Hands (Peace Sign):</strong> Zoom</span>
          </li>
          <li>
            <Hand size={20} />
            <span><strong>Second Hand:</strong> Spin Globe</span>
          </li>
          <li className={isFist ? 'highlight' : ''}>
            <Pause size={20} />
            <span><strong>Fist:</strong> Pause Rotation</span>
          </li>
        </ul>
      </div>

      <div className="state-debug">
        {trackingActive && (
          <div className="debug-card">
            <h3>Current State</h3>
            <p><strong>Gesture:</strong> {isFist ? 'Fist (Paused)' : 'Open Hand'}</p>
            <p><strong>Scale:</strong> {distance.toFixed(2)}x</p>
          </div>
        )}
      </div>
    </div>
  );
};
