import React, { useEffect, useState } from 'react';
import { Globe } from './components/Globe';
import { HandTracker } from './components/HandTracker';
import { useGlobeStore } from './store';
import {
  Settings,
  Radio,
  Activity,
  Wifi,
  Globe2,
  Play,
  Pause,
  Zap,
  RefreshCw
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    autoRotate,
    rotationSpeed,
    activeGesture,
    activeNode,
    nodes,
    setAutoRotate,
    setRotationSpeed,
    setActiveNode,
    setZoomFactor,
    zoomFactor,
    setCameraRotation
  } = useGlobeStore();

  const [sysTime, setSysTime] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState<'details' | 'metrics'>('details');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSysTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resetView = () => {
    setCameraRotation(0, 0);
    setZoomFactor(1.0);
    setAutoRotate(true);
    setActiveNode(null);
  };

  // Compute average network latency
  const avgLatency = Math.round(
    nodes.reduce((acc, curr) => acc + curr.metrics.latency, 0) / nodes.length
  );

  return (
    <div className="app-container">
      
      {/* 3D Canvas Globe Background */}
      <div className="canvas-background">
        <Globe />
      </div>

      {/* DASHBOARD HUD GRID LAYOUT */}
      <div className="dashboard-grid">
        
        {/* HEADER PANEL */}
        <header className="hud-header glass-panel dashboard-panel hud-border">
          <div className="hud-title-container">
            <Globe2 className="w-8 h-8 text-primary-accent animate-pulse" style={{ color: 'var(--primary)', width: '32px', height: '32px' }} />
            <div className="hud-title-text">
              <h1 className="hud-title-gradient">
                VISIONGLOBE v1.0.0
              </h1>
              <p className="hud-subtitle-text">
                NEURAL HAND TRACKING PLATFORM
              </p>
            </div>
          </div>

          {/* Core System Indicators */}
          <div className="indicator-group">
            <div className="indicator-item">
              <span className="ping-indicator"></span>
              <span className="text-cyber text-muted" style={{ color: 'var(--text-secondary)' }}>CORE ENGINE:</span>
              <span className="text-cyber text-emerald-accent" style={{ color: 'var(--emerald)', fontWeight: 'bold' }}>ONLINE</span>
            </div>
            
            <div className="indicator-item">
              <Radio className="w-4 h-4 text-primary-accent" style={{ color: 'var(--primary)', width: '16px', height: '16px' }} />
              <span className="text-cyber text-muted" style={{ color: 'var(--text-secondary)' }}>FPS:</span>
              <span className="text-cyber text-primary-accent" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>60.0</span>
            </div>

            <div className="h-6-divider" style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="text-cyber text-muted" style={{ fontSize: '9px' }}>SYSTEM TIME</span>
              <span className="text-xs text-cyber text-primary-accent font-bold font-mono" style={{ color: 'var(--primary)' }}>{sysTime}</span>
            </div>
          </div>
        </header>

        {/* LEFT COLUMN: CONTROL & GESTURE INPUTS */}
        <aside className="hud-sidebar-left dashboard-panel">
          {/* Gesture webcam tracker */}
          <HandTracker />

          {/* Engine Parameters */}
          <div className="glass-panel hud-border" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header">
              <div className="panel-title">
                <Settings className="w-4 h-4 text-primary-accent" style={{ color: 'var(--primary)', width: '16px', height: '16px' }} />
                <span>Engine Controls</span>
              </div>
            </div>

            <div className="panel-body">
              {/* Auto rotate toggle */}
              <div className="control-row">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Auto Orbit Rotation</span>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`glass-button ${autoRotate ? 'active' : ''}`}
                  style={{ padding: '4px 12px', fontSize: '10px' }}
                >
                  {autoRotate ? <Pause style={{ width: '12px', height: '12px' }} /> : <Play style={{ width: '12px', height: '12px' }} />}
                  <span>{autoRotate ? 'Active' : 'Paused'}</span>
                </button>
              </div>

              {/* Orbit Speed slider */}
              <div className="control-col">
                <div className="control-row" style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Orbit Speed</span>
                  <span className="font-mono text-primary-accent" style={{ color: 'var(--primary)' }}>{(rotationSpeed * 10).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                />
              </div>

              {/* Zoom display and controller */}
              <div className="control-col">
                <div className="control-row" style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Camera Zoom</span>
                  <span className="font-mono text-primary-accent" style={{ color: 'var(--primary)' }}>{zoomFactor.toFixed(2)}x</span>
                </div>
                <div className="flex-row-gap">
                  <button
                    onClick={() => setZoomFactor(zoomFactor - 0.15)}
                    className="glass-button flex-1"
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                  >
                    Zoom In
                  </button>
                  <button
                    onClick={() => setZoomFactor(zoomFactor + 0.15)}
                    className="glass-button flex-1"
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                  >
                    Zoom Out
                  </button>
                </div>
              </div>

              {/* View Resetter */}
              <button
                onClick={resetView}
                className="glass-button glass-button-secondary w-full"
                style={{ padding: '8px 0', fontSize: '11px', marginTop: '4px' }}
              >
                <RefreshCw style={{ width: '12px', height: '12px' }} />
                <span>Reset Camera Matrix</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: INFORMATION & NETWORK METRICS */}
        <aside className="hud-sidebar-right dashboard-panel">
          {/* Tab switches */}
          <div className="tab-bar">
            <button
              onClick={() => setActiveTab('details')}
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            >
              Gateway Details
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
            >
              Network Terminals
            </button>
          </div>

          {/* TAB 1: NODE DETAILS PANEL */}
          {activeTab === 'details' && (
            <div className="glass-panel hud-border flex-1" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeNode ? (
                <div className="panel-body">
                  {/* Title and status */}
                  <div className="panel-header" style={{ paddingBottom: '12px', marginBottom: '0' }}>
                    <div>
                      <h3 className="text-cyber font-bold text-primary-accent" style={{ color: 'var(--primary)', fontSize: '14px' }}>{activeNode.name}</h3>
                      <p className="font-mono text-muted" style={{ fontSize: '9px', marginTop: '2px', color: 'var(--text-secondary)', opacity: 0.6 }}>
                        LAT: {activeNode.lat.toFixed(4)} | LNG: {activeNode.lng.toFixed(4)}
                      </p>
                    </div>
                    <span className={`badge ${activeNode.metrics.status === 'online' ? 'badge-online' : 'badge-warning'}`}>
                      {activeNode.metrics.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Summary Text */}
                  <div className="metric-detail-box">
                    {activeNode.details}
                  </div>

                  {/* Node Specific Metrics */}
                  <div className="metric-grid-2">
                    <div className="metric-box">
                      <span>Link Latency</span>
                      <div className="control-row" style={{ alignItems: 'baseline', justifyContent: 'flex-start', gap: '4px' }}>
                        <span className="font-mono text-primary-accent font-bold" style={{ color: 'var(--primary)', fontSize: '18px' }}>
                          {activeNode.metrics.latency}
                        </span>
                        <span className="text-muted" style={{ fontSize: '9px' }}>ms</span>
                      </div>
                    </div>

                    <div className="metric-box">
                      <span>Channel Width</span>
                      <div className="control-row" style={{ alignItems: 'baseline', justifyContent: 'flex-start' }}>
                        <span className="font-mono text-secondary-accent font-bold" style={{ color: 'var(--secondary)', fontSize: '12px' }}>
                          {activeNode.metrics.bandwidth}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Routing Connections */}
                  <div className="control-col">
                    <span className="text-cyber text-title-small" style={{ fontWeight: 'bold' }}>Active Optical Peers</span>
                    <div className="peer-list">
                      {activeNode.connections.map((connId) => {
                        const target = nodes.find((n) => n.id === connId);
                        if (!target) return null;
                        return (
                          <div
                            key={connId}
                            onClick={() => setActiveNode(connId)}
                            className="peer-item"
                          >
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{target.name}</span>
                            <span className="font-mono text-primary-accent" style={{ color: 'var(--primary)', fontSize: '10px' }}>
                              {target.metrics.latency}ms
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <Zap className="empty-state-icon" style={{ width: '40px', height: '40px' }} />
                  <div className="control-col" style={{ alignItems: 'center' }}>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>No Terminal Selected</p>
                    <p className="text-muted" style={{ fontSize: '10px', maxWidth: '200px', lineHeight: 1.5, marginTop: '4px', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.6 }}>
                      Select a pulsing hub on the 3D canvas globe or click one in the terminals panel to read connection logs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TERMINALS LIST PANEL */}
          {activeTab === 'metrics' && (
            <div className="glass-panel hud-border flex-1" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
              <div className="panel-header" style={{ marginBottom: '0' }}>
                <span className="text-cyber text-title-small" style={{ fontWeight: 'bold' }}>Link Diagnostics</span>
                <span className="font-mono text-primary-accent" style={{ color: 'var(--primary)', fontSize: '10px' }}>Nodes: {nodes.length}</span>
              </div>

              {/* Scrolling List */}
              <div className="scroll-container">
                {nodes.map((node) => {
                  const isActive = activeNode?.id === node.id;
                  const isOnline = node.metrics.status === 'online';
                  return (
                    <div
                      key={node.id}
                      onClick={() => {
                        setActiveNode(node.id);
                        setActiveTab('details');
                      }}
                      className={`terminal-item ${isActive ? 'active' : ''}`}
                    >
                      <div className="control-col" style={{ gap: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{node.name}</span>
                        <span className="font-mono text-muted" style={{ fontSize: '9px', color: 'var(--text-secondary)', opacity: 0.5 }}>{node.metrics.bandwidth}</span>
                      </div>

                      <div className="terminal-indicator">
                        <div style={{ textAlign: 'right' }}>
                          <p className="font-mono text-primary-accent font-bold" style={{ color: 'var(--primary)', fontSize: '12px' }}>
                            {node.metrics.latency}ms
                          </p>
                          <p className="text-muted" style={{ fontSize: '8px' }}>latency</p>
                        </div>
                        <div
                          className="terminal-status-dot"
                          style={{
                            color: isOnline ? 'var(--emerald)' : 'var(--warning)',
                            backgroundColor: 'currentColor'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aggregated Stats Footer */}
              <div className="metric-box" style={{ marginTop: 'auto', gap: '8px', padding: '12px' }}>
                <div className="control-row" style={{ fontSize: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity style={{ width: '14px', height: '14px', color: 'var(--secondary)' }} />
                    Mean Latency:
                  </span>
                  <span className="font-mono text-primary-accent font-bold" style={{ color: 'var(--primary)' }}>{avgLatency} ms</span>
                </div>
                <div className="control-row" style={{ fontSize: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wifi style={{ width: '14px', height: '14px', color: 'var(--emerald)' }} />
                    Optimal Packets:
                  </span>
                  <span className="font-mono text-emerald-accent font-bold" style={{ color: 'var(--emerald)' }}>99.82%</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* BOTTOM HUD STATUS */}
        <footer className="hud-footer glass-panel dashboard-panel hud-border">
          <div className="hud-footer-item">
            <span>ACTIVE GESTURE:</span>
            <span
              className={`badge ${
                activeGesture !== 'None' ? 'badge-active' : 'badge-inactive'
              }`}
            >
              {activeGesture.toUpperCase()}
            </span>
          </div>

          <div className="h-6-divider"></div>

          <div className="hud-footer-item">
            <span>ROTATION SPEED:</span>
            <span className="font-mono text-primary-accent font-bold" style={{ color: 'var(--primary)', fontSize: '12px' }}>
              {autoRotate ? `${(rotationSpeed * 100).toFixed(0)} rad/s` : 'MANUAL'}
            </span>
          </div>
        </footer>
      </div>

      {/* Decorative scanner line running down the screen (Cyberpunk HUD detail) */}
      <div className="scanner-line"></div>
    </div>
  );
};
export default App;
