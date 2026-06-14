import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Map, LayoutDashboard } from 'lucide-react';
import { apiClient } from '../utils/api';

export default function Header({ currentPage, setCurrentPage }) {
  const [dbStatus, setDbStatus] = useState("Checking...");
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await apiClient.get('/');
        setDbStatus(res.data.database || "Connected");
        setDbConnected(true);
      } catch (err) {
        setDbStatus("Offline");
        setDbConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 8000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'triage', label: 'LIVE WORKSPACE', icon: Activity },
    { id: 'heatmap', label: 'DISTRESS MAP', icon: Map },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyber-violet/20 px-6 py-4 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
        <div className="relative">
          <div className="absolute inset-0 bg-cyber-magenta/30 rounded-lg blur-sm" />
          <div className="relative p-2 bg-black/40 border border-cyber-magenta/40 rounded-lg text-cyber-magenta">
            <Shield className="w-5 h-5" />
          </div>
        </div>
        <div>
          <span className="text-lg font-black tracking-widest bg-gradient-to-r from-cyber-magenta via-cyber-violet to-cyber-cyan bg-clip-text text-transparent">
            ANIMAI
          </span>
          <span className="block text-[8px] font-mono tracking-widest text-cyber-cyan opacity-80">
            GUARDIAN NETWORK
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all duration-300 ${
                isActive
                  ? 'bg-cyber-violet/20 border border-cyber-violet text-white shadow-neon-violet'
                  : 'text-cyber-gray hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Live System Status HUD */}
      <div className="flex items-center space-x-3 font-mono text-[10px]">
        <div className="flex flex-col items-end">
          <span className="text-white opacity-85">SYS_TRIAGE_PORT</span>
        </div>
        <div className="p-1.5 bg-black/40 border border-cyber-violet/30 rounded-lg text-cyber-violet">
          <Radio className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
