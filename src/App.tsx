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
    <div className="relative w-full h-full bg-[#030712] overflow-hidden select-none">
      
      {/* 3D Canvas Globe Background */}
      <div className="absolute inset-0 z-0">
        <Globe />
      </div>

      {/* DASHBOARD HUD GRID LAYOUT */}
      <div className="dashboard-grid">
        
        {/* HEADER PANEL */}
        <header className="col-span-3 glass-panel dashboard-panel hud-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="w-8 h-8 text-sky-400 animate-pulse" />
            <div>
              <h1 className="text-cyber title-glow font-black text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
                VISIONGLOBE v1.0.0
              </h1>
              <p className="text-[10px] text-cyber text-sky-300/60 font-semibold">
                NEURAL HAND TRACKING PLATFORM
              </p>
            </div>
          </div>

          {/* Core System Indicators */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] text-cyber text-zinc-400">CORE ENGINE:</span>
              <span className="text-[10px] text-cyber text-emerald-400 font-bold">ONLINE</span>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] text-cyber text-zinc-400">FPS:</span>
              <span className="text-[10px] text-cyber text-sky-400 font-bold">60.0</span>
            </div>

            <div className="border-l border-white/10 h-6 pl-4 flex flex-col justify-center">
              <span className="text-[10px] text-cyber text-zinc-500">SYSTEM TIME</span>
              <span className="text-xs text-cyber text-sky-400 font-bold font-mono">{sysTime}</span>
            </div>
          </div>
        </header>

        {/* LEFT COLUMN: CONTROL & GESTURE INPUTS */}
        <aside className="col-start-1 row-start-2 dashboard-panel flex flex-col gap-4 overflow-y-auto">
          {/* Gesture webcam tracker */}
          <HandTracker />

          {/* Engine Parameters */}
          <div className="glass-panel hud-border p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Settings className="w-4 h-4 text-sky-400" />
              <h3 className="text-cyber text-xs font-bold tracking-wider">Engine Controls</h3>
            </div>

            <div className="flex flex-col gap-3">
              {/* Auto rotate toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Auto Orbit Rotation</span>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`glass-button text-xs py-1 px-3 ${autoRotate ? 'active' : ''}`}
                >
                  {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{autoRotate ? 'Active' : 'Paused'}</span>
                </button>
              </div>

              {/* Orbit Speed slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Orbit Speed</span>
                  <span className="font-mono text-sky-400">{(rotationSpeed * 10).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              {/* Zoom display and controller */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Camera Zoom</span>
                  <span className="font-mono text-sky-400">{zoomFactor.toFixed(2)}x</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setZoomFactor(zoomFactor - 0.15)}
                    className="glass-button flex-1 justify-center py-1 text-xs"
                  >
                    Zoom In
                  </button>
                  <button
                    onClick={() => setZoomFactor(zoomFactor + 0.15)}
                    className="glass-button flex-1 justify-center py-1 text-xs"
                  >
                    Zoom Out
                  </button>
                </div>
              </div>

              {/* View Resetter */}
              <button
                onClick={resetView}
                className="glass-button glass-button-secondary w-full justify-center text-xs py-2 mt-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Camera Matrix</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: INFORMATION & NETWORK METRICS */}
        <aside className="col-start-3 row-start-2 dashboard-panel flex flex-col gap-4 overflow-y-auto">
          {/* Tab switches */}
          <div className="glass-panel p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'details'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Gateway Details
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'metrics'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Network Terminals
            </button>
          </div>

          {/* TAB 1: NODE DETAILS PANEL */}
          {activeTab === 'details' && (
            <div className="glass-panel hud-border p-5 flex flex-col gap-4 flex-1">
              {activeNode ? (
                <div className="flex flex-col gap-4">
                  {/* Title and status */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-cyber text-sm font-bold text-sky-400">{activeNode.name}</h3>
                      <p className="text-[10px] text-text-secondary font-mono">
                        LAT: {activeNode.lat.toFixed(4)} | LNG: {activeNode.lng.toFixed(4)}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${
                        activeNode.metrics.status === 'online'
                          ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30'
                          : 'text-amber-400 bg-amber-950/30 border-amber-500/30'
                      }`}
                    >
                      {activeNode.metrics.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Summary Text */}
                  <div className="text-xs text-text-secondary leading-relaxed bg-white/5 p-3 rounded border border-white/5">
                    {activeNode.details}
                  </div>

                  {/* Node Specific Metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="bg-white/3 border border-white/5 rounded p-3 flex flex-col gap-1">
                      <span className="text-[9px] text-cyber text-text-muted">Link Latency</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-lg font-bold text-sky-400">
                          {activeNode.metrics.latency}
                        </span>
                        <span className="text-[9px] text-text-secondary">ms</span>
                      </div>
                    </div>

                    <div className="bg-white/3 border border-white/5 rounded p-3 flex flex-col gap-1">
                      <span className="text-[9px] text-cyber text-text-muted">Channel Width</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-sm font-bold text-indigo-400">
                          {activeNode.metrics.bandwidth}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Routing Connections */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-cyber text-text-muted font-bold">Active Optical Peers</span>
                    <div className="flex flex-col gap-1.5">
                      {activeNode.connections.map((connId) => {
                        const target = nodes.find((n) => n.id === connId);
                        if (!target) return null;
                        return (
                          <div
                            key={connId}
                            onClick={() => setActiveNode(connId)}
                            className="flex items-center justify-between text-xs p-2 rounded bg-white/3 border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 cursor-pointer transition-all"
                          >
                            <span className="text-text-primary font-medium">{target.name}</span>
                            <span className="text-sky-400 text-[10px] font-mono">
                              {target.metrics.latency}ms
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-16 flex-1 text-zinc-500">
                  <Zap className="w-10 h-10 opacity-30 text-sky-400 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-text-secondary">No Terminal Selected</p>
                    <p className="text-[10px] max-w-[200px] text-text-muted mt-1 leading-relaxed">
                      Select a pulsing hub on the 3D canvas globe or click one in the terminals panel to read connection logs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TERMINALS LIST PANEL */}
          {activeTab === 'metrics' && (
            <div className="glass-panel hud-border p-4 flex flex-col gap-4 flex-1 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-cyber text-xs font-bold">Link Diagnostics</span>
                <span className="text-[10px] text-sky-400 font-mono">Nodes: {nodes.length}</span>
              </div>

              {/* Scrolling List */}
              <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
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
                      className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-sky-500/10 border-sky-400/50'
                          : 'bg-white/3 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-text-primary">{node.name}</span>
                        <span className="text-[9px] text-text-muted font-mono">{node.metrics.bandwidth}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-bold font-mono text-sky-400">
                            {node.metrics.latency}ms
                          </p>
                          <p className="text-[8px] text-text-muted">latency</p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                          }`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aggregated Stats Footer */}
              <div className="bg-white/3 border border-white/5 rounded p-3 flex flex-col gap-2 mt-auto">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-secondary flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    Mean Latency:
                  </span>
                  <span className="font-mono text-sky-400 font-bold">{avgLatency} ms</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-secondary flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    Optimal Packets:
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">99.82%</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* BOTTOM HUD STATUS */}
        <footer className="col-start-2 row-start-2 self-end dashboard-panel justify-self-center glass-panel hud-border px-8 py-3 mb-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyber text-text-secondary">ACTIVE GESTURE:</span>
            <span
              className={`text-sm text-cyber font-black tracking-widest px-3 py-1 rounded bg-black/60 border ${
                activeGesture !== 'None'
                  ? 'text-pink-400 border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                  : 'text-zinc-500 border-white/10'
              }`}
            >
              {activeGesture.toUpperCase()}
            </span>
          </div>

          <div className="h-6 border-l border-white/10"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyber text-text-secondary">ROTATION SPEED:</span>
            <span className="text-xs font-mono font-bold text-sky-400">
              {autoRotate ? `${(rotationSpeed * 100).toFixed(0)} rad/s` : 'MANUAL'}
            </span>
          </div>
        </footer>
      </div>

      {/* Decorative scanner line running down the screen (Cyberpunk HUD detail) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-sky-500/10 shadow-[0_0_8px_#38bdf8] pointer-events-none animate-[scan_6s_infinite_linear]"></div>
      
      {/* Scan animation styles */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
export default App;
