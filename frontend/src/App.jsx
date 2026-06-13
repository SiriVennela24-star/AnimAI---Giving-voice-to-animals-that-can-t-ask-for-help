import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LivePrototype from './pages/LivePrototype';
import DistressHeatmap from './pages/DistressHeatmap';
import { fetchIncidents } from './utils/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshIncidents = async () => {
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshIncidents();
    // Poll for new incidents/reports every 5 seconds to keep dashboard/map fully reactive
    const interval = setInterval(refreshIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate floating paws positions once
  const [floatingPaws] = useState(() =>
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      y: Math.random() * 80 + 10, // percentage height
      scale: Math.random() * 0.5 + 0.3,
      delay: Math.random() * -15, // negative delay so they start immediately at different phases
      duration: Math.random() * 12 + 12
    }))
  );

  return (
    <div className="min-h-screen bg-cyber-bg text-white relative flex flex-col font-sans overflow-hidden">
      {/* Background canvas overlays */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyber-violet/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyber-magenta/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Floating SVG Dog Paws Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingPaws.map((paw) => (
          <svg
            key={paw.id}
            style={{
              left: `${paw.x}%`,
              top: `${paw.y}%`,
              transform: `scale(${paw.scale})`,
              '--delay': `${paw.delay}s`,
              '--duration': `${paw.duration}s`
            }}
            className="absolute w-8 h-8 text-cyber-violet/10 animate-float-paw"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-5.5-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9-4c-.83 0-1.5.67-1.5 1.5S7.67 11 8.5 11s1.5-.67 1.5-1.5S9.33 8 8.5 8zm7 0c-.83 0-1.5.67-1.5 1.5S14.67 11 15.5 11s1.5-.67 1.5-1.5S16.33 8 15.5 8z" />
          </svg>
        ))}
      </div>

      {/* Navigation Header */}
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Pages Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 relative z-10">
        {currentPage === 'dashboard' && (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setSelectedIncident={setSelectedIncident}
            incidents={incidents}
            loading={loading}
          />
        )}
        
        {currentPage === 'triage' && (
          <LivePrototype 
            selectedIncident={selectedIncident} 
            setSelectedIncident={setSelectedIncident}
            refreshIncidents={refreshIncidents}
          />
        )}
        
        {currentPage === 'heatmap' && (
          <DistressHeatmap 
            setCurrentPage={setCurrentPage} 
            setSelectedIncident={setSelectedIncident}
            incidents={incidents}
            loading={loading}
            refreshIncidents={refreshIncidents}
          />
        )}
      </main>

      {/* Frequency Wave Simulator overlay at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] pointer-events-none z-0">
        <svg 
          className="relative block w-[200%] h-[75px]" 
          viewBox="0 0 2400 120" 
          preserveAspectRatio="none"
        >
          {/* Layer 1 - Slow Deep Violet Wave */}
          <path 
            d="M0,60 C300,110 500,20 800,60 C1100,100 1300,30 1600,70 C1900,110 2100,40 2400,60 L2400,120 L0,120 Z" 
            className="fill-cyber-violet/5 animate-wave-slow" 
          />
          {/* Layer 2 - Medium Cyan Wave */}
          <path 
            d="M0,40 C360,80 600,10 960,40 C1320,70 1560,10 1920,40 C2280,70 2400,50 2520,40 L2520,120 L0,120 Z" 
            className="fill-cyber-cyan/5 animate-wave-medium" 
          />
          {/* Layer 3 - Fast Magenta Audio Frequency Spikes (high frequency whining representation) */}
          <path 
            d="M0,80 C180,40 300,110 480,80 C660,50 780,100 960,70 C1140,40 1380,115 1560,80 C1740,45 2000,90 2200,80 L2200,120 L0,120 Z" 
            className="fill-cyber-magenta/5 animate-wave-fast" 
          />
        </svg>
      </div>

      {/* Diagnostic Footer */}
      <footer className="w-full py-4 px-6 border-t border-cyber-violet/10 bg-black/60 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center font-mono text-[9px] text-cyber-gray gap-2">
          <span>&copy; {new Date().getFullYear()} ANIMAI: GUARDIAN NETWORK. ZERO-CONFIG DEPLOYMENT CONTRACTS ACTIVE.</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" /> 
              CLOUDINARY_MEDIA_CHANNEL
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-violet animate-pulse" /> 
              MONGODB_ATLAS_CONNECTED
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-magenta animate-pulse" /> 
              YOLO11_TRIAGE_CORE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
