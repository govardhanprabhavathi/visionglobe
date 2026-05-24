import React, { useMemo } from 'react';
import { useGlobeStore } from '../lib/store';
import { Hand, ZoomIn, Pause, Activity, Globe as GlobeIcon } from 'lucide-react';
import { celestialBodies } from '../utils/celestialBodies';

export const Overlay: React.FC = () => {
  const { trackingActive, isFist, distance, selectedBodyId, setSelectedBodyId } = useGlobeStore();

  const currentBody = useMemo(() => {
    return celestialBodies.find((b) => b.id === selectedBodyId) || celestialBodies[3];
  }, [selectedBodyId]);

  return (
    <div 
      className="overlay-container"
      style={{ 
        // Expose the current planet's color as a CSS variable for the theme
        ['--theme-accent' as any]: currentBody.color,
        ['--theme-accent-glow' as any]: `${currentBody.color}33`, // 20% opacity
      }}
    >
      <header className="header">
        <div className="logo-group">
          <GlobeIcon size={24} className="logo-icon animate-pulse-slow" />
          <h1>VisionGlobe</h1>
        </div>
        <div className={`status-badge ${trackingActive ? 'active' : 'inactive'}`}>
          <Activity size={16} />
          {trackingActive ? 'Tracking Active' : 'No Hands Detected'}
        </div>
      </header>

      {/* Main Layout containing left-instructions and right-info */}
      <div className="middle-layout">
        <div className="instructions-panel">
          <h2>Gesture Controls</h2>
          <ul>
            <li className={trackingActive && !isFist && distance < 2 ? 'highlight' : ''}>
              <Hand size={20} />
              <span><strong>Open Hand:</strong> Float & Follow</span>
            </li>
            <li className={distance >= 2 ? 'highlight' : ''}>
              <ZoomIn size={20} />
              <span><strong>Two Hands (Peace):</strong> Zoom ({distance.toFixed(1)}x)</span>
            </li>
            <li>
              <Hand size={20} className="spin-icon" />
              <span><strong>Second Hand:</strong> Spin Momentum</span>
            </li>
            <li className={isFist ? 'highlight' : ''}>
              <Pause size={20} />
              <span><strong>Closed Fist:</strong> Pause Rotation</span>
            </li>
          </ul>
        </div>

        {/* Selected Planet/Sun Info Panel */}
        <div className="body-info-panel fade-in" key={currentBody.id}>
          <div className="info-header">
            <span className="body-type">{currentBody.type || 'Star'}</span>
            <h2>{currentBody.name}</h2>
          </div>
          <p className="body-description">{currentBody.description}</p>
          <hr className="divider" />
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Diameter</span>
              <span className="metric-value">{currentBody.metrics.diameter}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Gravity</span>
              <span className="metric-value">{currentBody.metrics.gravity}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Day Length</span>
              <span className="metric-value">{currentBody.metrics.dayLength}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">From Sun</span>
              <span className="metric-value">{currentBody.metrics.distanceFromSun}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Planet / Sun Selector Bar at the bottom */}
      <div className="selector-bar-container">
        <div className="selector-bar-scroll">
          {celestialBodies.map((body) => (
            <button
              key={body.id}
              onClick={() => setSelectedBodyId(body.id)}
              className={`selector-btn ${selectedBodyId === body.id ? 'active' : ''}`}
            >
              <div 
                className="btn-color-dot" 
                style={{ backgroundColor: body.color, boxShadow: `0 0 10px ${body.color}` }} 
              />
              <span className="btn-label">{body.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
