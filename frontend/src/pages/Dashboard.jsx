import React, { useState, useEffect } from 'react';
import { fetchCrisisPredictions } from '../utils/api';
import { AlertOctagon, TrendingUp, Heart, ShieldAlert, Calendar, MapPin, Eye, Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ setCurrentPage, setSelectedIncident, incidents = [], loading = true }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [predictionData, setPredictionData] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const data = await fetchCrisisPredictions();
        setPredictionData(data);
        if (data && data.length > 0) {
          setSelectedSector(data[0].sector);
        }
      } catch (err) {
        console.error("Failed to load predictions:", err);
      } finally {
        setLoadingPredictions(false);
      }
    };
    loadPredictions();
  }, []);

  const stats = [
    {
      value: "200M+",
      label: "Global Stray Animals",
      desc: "Estimated unmanaged population",
      icon: Heart,
      color: "from-cyber-violet to-[#5F27CD]",
      glow: "shadow-neon-violet"
    },
    {
      value: "1 in 4",
      label: "Injured Annually",
      desc: "Subject to street trauma/accidents",
      icon: AlertOctagon,
      color: "from-cyber-magenta to-[#FF3F34]",
      glow: "shadow-neon-magenta"
    },
    {
      value: "68%",
      label: "Preventable Diseases",
      desc: "Rabies, parvovirus & zoonotic vectors",
      icon: TrendingUp,
      color: "from-cyber-cyan to-[#00CEC9]",
      glow: "shadow-neon-cyan"
    }
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Title Banner */}
      <div className="relative p-8 rounded-2xl overflow-hidden glass-panel border border-cyber-violet/25">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyber-violet/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-cyber-magenta/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-cyber-magenta font-mono text-xs tracking-widest">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span>LIVE AI OBSERVATION SYSTEM</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
              Guardian Network Command
            </h1>
            <p className="text-sm text-cyber-gray max-w-xl">
              Real-time multi-media acoustic and computer vision analysis triage interface. Flagging injury areas, detecting distress pitches, and coordinates mapping.
            </p>
          </div>
          
          <button
            onClick={() => setCurrentPage('triage')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyber-magenta to-cyber-violet hover:from-cyber-magenta hover:to-cyber-magenta text-white font-mono text-xs tracking-wider rounded-xl transition-all duration-300 shadow-neon-magenta hover:scale-105"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>INITIALIZE NEW TRIAGE</span>
          </button>
        </div>
      </div>

      {/* Presentation Metrics Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl glass-panel p-6 border border-cyber-violet/20 glass-panel-hover flex flex-col justify-between h-[180px]`}
            >
              {/* Subtle Glowing SVG Animal Paw Pathway */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 text-cyber-magenta pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 40c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-18-6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm36 0c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zM32 60c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm36 0c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z" />
                </svg>
              </div>

              <div className="flex justify-between items-start">
                <span className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </span>
                <div className={`p-2.5 rounded-xl bg-black/40 border border-cyber-violet/30 text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-mono text-xs tracking-wider text-white">{stat.label}</h3>
                <p className="text-xs text-cyber-gray leading-relaxed">{stat.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Layout: Active Triage Logs */}
      <div className="glass-panel rounded-2xl border border-cyber-violet/20 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-cyber-violet/10 pb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-magenta animate-pulse" />
            <h2 className="text-lg font-bold tracking-wider font-mono text-white">ACTIVE TRIAGE INCIDENTS</h2>
          </div>
          <span className="text-xs font-mono text-cyber-gray">
            TOTAL REPORTS: {incidents.length}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-t-2 border-r-2 border-cyber-magenta rounded-full animate-spin" />
            <p className="text-xs font-mono text-cyber-gray tracking-wider">RETRIEVING SECURE INCIDENT LOGS...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-cyber-violet/10 rounded-xl">
            <p className="text-sm font-mono text-cyber-gray">No reports registered in the database.</p>
            <button
              onClick={() => setCurrentPage('triage')}
              className="mt-4 px-4 py-2 bg-cyber-violet/30 hover:bg-cyber-violet/50 border border-cyber-violet text-white text-xs font-mono rounded-lg transition-all"
            >
              CREATE FIRST MOCK TRIAGE
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-cyber-gray">
              <thead>
                <tr className="border-b border-cyber-violet/10 font-mono text-xs tracking-wider text-white/70">
                  <th className="py-3 px-4">INCIDENT ID</th>
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">LOCATION</th>
                  <th className="py-3 px-4">DETECTIONS / INJURIES</th>
                  <th className="py-3 px-4 text-center">RISK INDEX</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-violet/5">
                {incidents.map((incident) => {
                  const risk = incident.analysis_payload?.risk_score ?? 0;
                  const status = incident.operational_status || "Critical";
                  
                  // Get color styles for risk indicators
                  let badgeColor = "bg-green-500/10 text-green-400 border-green-500/20";
                  let riskColor = "text-cyber-cyan";
                  let statusText = status.toUpperCase();
                  
                  if (status === "Dispatched") {
                    statusText = "DISPATCHED";
                    badgeColor = "bg-green-500/10 text-green-400 border-green-500/20";
                    riskColor = risk >= 75 ? "text-cyber-magenta" : (risk >= 40 ? "text-yellow-400" : "text-cyber-violet");
                  } else if (risk >= 75 && risk <= 100) {
                    statusText = "CRITICAL";
                    badgeColor = "bg-cyber-magenta/10 text-cyber-magenta border-cyber-magenta/30 shadow-neon-magenta";
                    riskColor = "text-cyber-magenta";
                  } else if (risk >= 40 && risk <= 74) {
                    statusText = "WARNING";
                    badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
                    riskColor = "text-yellow-400";
                  } else if (risk >= 0 && risk <= 39) {
                    statusText = "STABLE";
                    badgeColor = "bg-cyber-violet/10 text-cyber-violet border-cyber-violet/30";
                    riskColor = "text-cyber-violet";
                  }

                  const dateStr = incident.timestamp 
                    ? new Date(incident.timestamp).toLocaleString()
                    : "Unknown";

                  return (
                    <motion.tr
                      key={incident.incident_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-all duration-150"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono text-xs text-white">
                        {incident.incident_id.substring(0, 8)}...
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyber-violet" />
                          {dateStr}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyber-cyan" />
                          {incident.location[0]?.toFixed(4)}, {incident.location[1]?.toFixed(4)}
                        </span>
                      </td>

                      {/* Injuries */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {incident.analysis_payload?.detected_injuries && incident.analysis_payload.detected_injuries.length > 0 ? (
                            incident.analysis_payload.detected_injuries.map((injury, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#1A1A2F] border border-cyber-violet/30 text-white"
                              >
                                {injury}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Clear / Healthy
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className={`py-4 px-4 text-center font-bold font-mono text-base ${riskColor}`}>
                        {risk}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold border ${badgeColor}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {incident.media_assets?.cloudinary_image_url && (
                            <button
                              onClick={() => {
                                const url = incident.media_assets.cloudinary_image_url;
                                // If it is local fallback, append base backend path
                                const finalUrl = url.startsWith('/') 
                                  ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${url}`
                                  : url;
                                setSelectedMedia({ type: 'image_or_video', url: finalUrl });
                              }}
                              className="p-1.5 rounded bg-black/40 border border-cyber-violet/20 hover:border-cyber-cyan text-cyber-cyan transition-all"
                              title="View Media Asset"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedIncident(incident);
                              setCurrentPage('triage');
                            }}
                            className="px-2.5 py-1.5 rounded bg-cyber-violet/20 hover:bg-cyber-violet/40 border border-cyber-violet/40 hover:border-cyber-magenta text-white font-mono text-[10px] transition-all"
                          >
                            OPEN IN WORKSPACE
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Crisis Prediction Panel */}
      <div className="glass-panel rounded-2xl border border-cyber-violet/20 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyber-violet/10 pb-4 gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
            <h2 className="text-lg font-bold tracking-wider font-mono text-white">PREDICTIVE CRISIS OUTBREAK PANEL</h2>
          </div>
          
          {/* Sector selection dropdown */}
          {!loadingPredictions && predictionData.length > 0 && (
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-cyber-gray">TARGET_SECTOR:</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-black/50 border border-cyber-violet/30 hover:border-cyber-cyan text-white px-3 py-1.5 rounded-lg outline-none cursor-pointer transition-colors"
              >
                {predictionData.map((sec) => (
                  <option key={sec.sector} value={sec.sector} className="bg-[#07070F]">
                    {sec.sector.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loadingPredictions ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-t-2 border-r-2 border-cyber-cyan rounded-full animate-spin" />
            <p className="text-xs font-mono text-cyber-gray tracking-wider">PROJECTING CRISIS TIME-SERIES CORRELATIONS...</p>
          </div>
        ) : predictionData.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-cyber-violet/10 rounded-xl">
            <p className="text-sm font-mono text-cyber-gray">No density data loaded to project trends.</p>
          </div>
        ) : (() => {
          const activeSectorData = predictionData.find(s => s.sector === selectedSector)?.predictions || [];
          const maxSpikes = activeSectorData.length > 0 ? Math.max(...activeSectorData.map(d => d.spikes)) : 10;
          
          const width = 500;
          const height = 140;
          const paddingX = 50;
          const paddingY = 20;

          const points = activeSectorData.map((d, index) => {
            const x = paddingX + (index / (activeSectorData.length - 1)) * (width - 2 * paddingX);
            const y = height - paddingY - (d.spikes / (maxSpikes || 1)) * (height - 2 * paddingY);
            return { ...d, x, y };
          });

          const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
          const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

          return (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
              {/* SVG Line Graph (takes 3 cols) */}
              <div className="lg:col-span-3 relative bg-black/30 border border-cyber-violet/10 rounded-2xl p-4 flex flex-col items-center justify-center h-[260px]">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Y-axis helper lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const yVal = paddingY + ratio * (height - 2 * paddingY);
                    return (
                      <line
                        key={idx}
                        x1={paddingX}
                        y1={yVal}
                        x2={width - paddingX}
                        y2={yVal}
                        stroke="rgba(138, 43, 226, 0.1)"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* X-axis base line */}
                  <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(138, 43, 226, 0.3)" />

                  {/* Area under line */}
                  {areaD && (
                    <path d={areaD} fill="url(#cyanAreaGrad)" />
                  )}

                  {/* Curved distress line */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2.5"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Interactive Points */}
                  {points.map((pt, idx) => (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#FF007F"
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint({ ...pt, index: idx })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* X axis labels */}
                      <text
                        x={pt.x}
                        y={height - 4}
                        textAnchor="middle"
                        fill="#A0A0B0"
                        fontSize="7"
                        fontFamily="monospace"
                      >
                        {new Date(pt.date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Float Hover details overlay */}
                {hoveredPoint && (
                  <div 
                    className="absolute bg-[#0B081A] border border-cyber-magenta p-2.5 rounded-lg text-[9px] font-mono text-white shadow-neon-magenta pointer-events-none z-30 space-y-1 transition-all duration-150"
                    style={{
                      left: `${(hoveredPoint.x / width) * 100}%`,
                      top: `${(hoveredPoint.y / height) * 100 - 15}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <p className="text-cyber-cyan font-bold">DATE: {hoveredPoint.date}</p>
                    <p className="flex justify-between gap-4">
                      <span>FORECAST_SPIKES:</span>
                      <span className="text-cyber-magenta font-extrabold">{hoveredPoint.spikes}</span>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>CONFIDENCE:</span>
                      <span>{(hoveredPoint.confidence * 100).toFixed(0)}%</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar projection analytics description */}
              <div className="lg:col-span-1 space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-cyber-gray block">PROJECTION MODEL</span>
                  <span className="text-sm font-bold text-white block">LSTM-DECAY MATRIX</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-cyber-gray block">MAX EXPECTED SPIKE</span>
                  <span className="text-sm font-extrabold text-cyber-cyan block">{maxSpikes} CRY-SPIKES</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-cyber-gray block">HISTORICAL WEIGHT</span>
                  <span className="text-xs text-white block">Density-Correlated</span>
                </div>
                <p className="text-[10px] text-cyber-gray leading-normal">
                  Algorithmically plotting hotspots for upcoming stray animal medical outbreaks over the next 7 days, mapping acoustic distress whines and camera incidents.
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Media Overlay Dialog */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-4xl w-full glass-panel border border-cyber-violet/50 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white hover:text-cyber-magenta font-mono text-xs p-1 px-2 border border-white/20 hover:border-cyber-magenta/50 rounded bg-black/55 transition-all"
            >
              CLOSE [ESC]
            </button>
            <h3 className="text-sm font-mono text-white mb-4 border-b border-cyber-violet/20 pb-2 w-full text-left">
              TRIAGE VISUAL ANALYZER STREAM
            </h3>
            
            {/* If MP4 video */}
            {selectedMedia.url.endsWith('.mp4') || selectedMedia.url.includes('/uploads/') && selectedMedia.url.includes('video') ? (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[70vh] rounded-lg border border-cyber-violet/20 shadow-inner"
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt="Triage visual stream"
                className="max-h-[70vh] rounded-lg border border-cyber-violet/20 object-contain shadow-inner"
              />
            )}
            
            <div className="mt-4 w-full flex items-center justify-between font-mono text-[9px] text-cyber-gray">
              <span>SOURCE PATH: {selectedMedia.url}</span>
              <span>COMPUTED ANNOTATIONS RENDERED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
