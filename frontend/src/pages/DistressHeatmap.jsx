import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMapEvents } from 'react-leaflet';
import { submitCommunityReport, updateIncidentStatus } from '../utils/api';
import ReportForm from '../components/ReportForm';
import { Activity, ShieldAlert, Sparkles, MapPin, Eye, Send, Phone, User, FileText } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Map Click handler to select coordinates
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lng, e.latlng.lat]);
    }
  });
  return null;
}

export default function DistressHeatmap({ setCurrentPage, setSelectedIncident, incidents, loading, refreshIncidents }) {
  // Focus center on India
  const mapCenter = [20.5937, 78.9629];

  // Community Report coordinates state [longitude, latitude] matching India center default
  const [coordinates, setCoordinates] = useState([78.9629, 20.5937]);

  const handleMapClick = (coords) => {
    setCoordinates(coords);
  };

  // Helper to create glowing neon custom markers
  const createNeonIcon = (risk, status) => {
    let color = "#8A2BE2"; // Violet
    let glowClass = "bg-cyber-violet shadow-neon-violet border-cyber-violet/50";
    if (status === "Dispatched") {
      color = "#10B981"; // Emerald green
      glowClass = "bg-emerald-400 shadow-neon-green border-emerald-400/50";
    } else if (status === "Critical" || risk >= 75) {
      color = "#FF007F"; // Magenta
      glowClass = "bg-cyber-magenta shadow-neon-magenta border-cyber-magenta/50 animate-pulse";
    } else if (status === "Warning" || risk >= 40) {
      color = "#F1C40F"; // Yellow
      glowClass = "bg-yellow-400 shadow-neon-yellow border-yellow-400/50";
    }

    return L.divIcon({
      className: 'custom-neon-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full opacity-35 animate-ping" style="background-color: ${color}"></div>
          <div class="w-4 h-4 rounded-full border border-white ${glowClass}"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-cyber-violet/10 pb-4">
        <div>
          <h2 className="text-xl font-black tracking-widest font-mono text-white">GEOSPATIAL DISTRESS HEATMAP</h2>
          <p className="text-xs text-cyber-gray font-mono mt-0.5">GEOSPATIAL_HOTZONES: PULSING_RADIAL_ALERTS</p>
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-1 bg-cyber-magenta/15 border border-cyber-magenta/30 rounded-lg text-cyber-magenta font-mono text-[10px]">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>REAL-TIME TRACKING ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Quick Incident submission form (1/4 space) */}
        <div className="lg:col-span-1 glass-panel border border-cyber-violet/20 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-xs text-white border-b border-cyber-violet/10 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyber-magenta animate-pulse" />
              <span>COMMUNITY ALERT DESK</span>
            </h3>
            <p className="text-[10px] text-cyber-gray leading-normal mt-2">
              Report stray animal sightings, injuries, or hazards. Click coordinates directly on the map grid to update incident location.
            </p>

            <ReportForm 
              coordinates={coordinates} 
              setCoordinates={setCoordinates} 
              refreshIncidents={refreshIncidents} 
            />
          </div>
          
          <div className="pt-3 border-t border-cyber-violet/10 text-[9px] text-cyber-gray font-mono">
            <span>MAP CLICK CAPTURE HUD: ACTIVE</span>
          </div>
        </div>

        {/* Heatmap canvas mapping (takes 2/4 columns) */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-cyber-violet/20 shadow-inner h-[530px] relative">
          {loading ? (
            <div className="w-full h-full bg-[#07070F] flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-t-2 border-r-2 border-cyber-magenta rounded-full animate-spin" />
              <p className="text-xs font-mono text-cyber-gray tracking-wider">LOADING GEOSPATIAL MAP GRID...</p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={5}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Dark mode TileLayer for premium cyber aesthetics */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              <MapClickHandler onMapClick={handleMapClick} />
              
              {incidents.map((incident) => {
                const [lon, lat] = incident.location;
                const risk = incident.analysis_payload?.risk_score ?? 0;
                
                // Pulsing indicator color
                let glowColor = "#8A2BE2"; // Violet
                if (incident.operational_status === "Dispatched") {
                  glowColor = "#10B981"; // Green
                } else if (risk >= 75) {
                  glowColor = "#FF007F"; // Magenta
                } else if (risk >= 40) {
                  glowColor = "#F1C40F"; // Yellow
                }
                
                // Circle size proportional to risk score
                const radiusSize = 25000 + (risk * 2500);

                return (
                  <React.Fragment key={incident.incident_id}>
                    {/* Pulsating background circle */}
                    <Circle
                      center={[lat, lon]}
                      radius={radiusSize}
                      pathOptions={{
                        color: glowColor,
                        fillColor: glowColor,
                        fillOpacity: 0.2,
                        weight: 1,
                        interactive: false
                      }}
                    />

                    {/* Highly interactive glowing Leaflet Marker */}
                    <Marker
                      position={[lat, lon]}
                      icon={createNeonIcon(risk, incident.operational_status)}
                    >
                      <Popup>
                        <div className="font-mono text-xs p-1 space-y-2 text-white">
                          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                            <span className="font-bold text-[10px] text-cyber-cyan">ID: {incident.incident_id.substring(0,8)}</span>
                            <span 
                              className="font-bold text-[9px] px-1.5 py-0.5 rounded border"
                              style={{
                                color: glowColor,
                                borderColor: `${glowColor}50`,
                                backgroundColor: `${glowColor}15`
                              }}
                            >
                              {incident.operational_status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-[10px]">
                            <p className="flex items-center gap-1.5">
                              <span className="text-cyber-gray">Risk Score:</span>
                              <span className="font-bold" style={{ color: glowColor }}>{risk}/100</span>
                            </p>
                            <p className="flex items-start gap-1.5">
                              <span className="text-cyber-gray">Injuries:</span>
                              <span className="text-white flex-1">{incident.analysis_payload?.detected_injuries?.join(', ')}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span className="text-cyber-gray">Coordinates:</span>
                              <span className="text-white">{lat.toFixed(4)}, {lon.toFixed(4)}</span>
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedIncident(incident);
                              setCurrentPage('triage');
                            }}
                            className="mt-2 w-full py-1 text-[9px] bg-cyber-violet/30 hover:bg-cyber-violet/60 border border-cyber-violet/50 text-white rounded font-bold transition-all text-center"
                          >
                            LOAD IN WORKSPACE
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Sidebar Info: High risk zones index (1/4 columns) */}
        <div className="glass-panel border border-cyber-violet/20 rounded-2xl p-4 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-mono text-xs text-white border-b border-cyber-violet/10 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyber-magenta animate-pulse" />
              <span>INCIDENT SUMMARY</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="block text-[10px] font-mono text-cyber-gray">ACTIVE SECTOR DENSITY</span>
                <span className="block text-sm font-bold text-white">India Cluster</span>
              </div>
              
              <div className="space-y-1">
                <span className="block text-[10px] font-mono text-cyber-gray font-bold text-cyber-magenta">HIGH THREAT SECTORS</span>
                <div className="space-y-2 mt-1 max-h-[220px] overflow-y-auto pr-1">
                  {incidents.filter(inc => inc.operational_status === "Critical").map((inc) => (
                    <div 
                      key={inc.incident_id} 
                      className="p-2 bg-cyber-magenta/5 border border-cyber-magenta/20 rounded-lg flex items-center justify-between text-[10px] font-mono cursor-pointer hover:border-cyber-magenta/40 transition-colors"
                      onClick={() => {
                        setSelectedIncident(inc);
                        setCurrentPage('triage');
                      }}
                    >
                      <span className="text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyber-magenta" />
                        {inc.location[0].toFixed(2)}, {inc.location[1].toFixed(2)}
                      </span>
                      <span className="text-cyber-magenta font-bold">RISK {inc.analysis_payload.risk_score}</span>
                    </div>
                  ))}
                  {incidents.filter(inc => inc.operational_status === "Critical").length === 0 && (
                    <p className="text-[10px] text-cyber-gray italic">No critical risk zones active.</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-cyber-violet/10 space-y-2">
                <span className="block text-[10px] font-mono text-cyber-gray">HEAT MAP KEY</span>
                <div className="space-y-1 text-[9px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-magenta border border-cyber-magenta/50 shadow-neon-magenta" />
                    <span className="text-white">CRITICAL ALERTS (SCORE 75+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-400/50 shadow-neon-yellow" />
                    <span className="text-white">WARNING STATUS (SCORE 40-74)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-violet border border-cyber-violet/50 shadow-neon-violet" />
                    <span className="text-white">STABLE MONITORING (SCORE 0-39)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-400/50 shadow-neon-green" />
                    <span className="text-white">DISPATCHED STATUS (GREEN INDICATOR)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cyber-violet/10 text-[9px] text-cyber-gray font-mono">
            <span>MAP RESOLUTION: GLOWING_PIN_DESK</span>
          </div>
        </div>

      </div>
    </div>
  );
}
