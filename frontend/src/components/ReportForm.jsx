import React, { useState } from 'react';
import { User, Phone, MapPin, FileText, Send } from 'lucide-react';
import { submitCommunityReport, updateIncidentStatus } from '../utils/api';

export default function ReportForm({ coordinates, setCoordinates, refreshIncidents }) {
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [locationRequested, setLocationRequested] = useState(false);

  const requestGeolocation = () => {
    if (locationRequested) return;
    setLocationRequested(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates([lng, lat]);
          setSuccessMsg("Location coordinates captured via GPS successfully.");
          setErrorMsg("");
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error);
          setLocationRequested(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const nameVal = reporterName || "";
    const phoneVal = reporterPhone || "";
    const descVal = description || "";

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await submitCommunityReport({
        reporter_name: nameVal,
        reporter_phone: phoneVal,
        description: descVal,
        location: coordinates
      });

      setSuccessMsg("🚨 Broadcast Dispatched: Nearest Field Responders and Regional NGO Network Notified.");
      setReporterName("");
      setReporterPhone("");
      setDescription("");
      setLocationRequested(false);

      if (res && res.incident_id) {
        updateIncidentStatus(res.incident_id, "Dispatched").catch(err => {
          console.error("Failed to update status:", err);
        });
      }

      if (refreshIncidents) {
        await refreshIncidents();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload report. Verify server connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleReportSubmit} className="space-y-3 mt-4 text-xs font-mono">
      {/* Reporter Name */}
      <div className="space-y-1">
        <label className="text-[10px] text-cyber-gray flex items-center gap-1">
          <User className="w-3 h-3 text-cyber-cyan" /> REPORTER NAME
        </label>
        <input
          type="text"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          placeholder="e.g. Alex Mercer"
          className="w-full px-3 py-2 bg-black/40 border border-cyber-violet/30 focus:border-cyber-magenta rounded-lg text-white outline-none transition-colors"
        />
      </div>

      {/* Reporter Phone */}
      <div className="space-y-1">
        <label className="text-[10px] text-cyber-gray flex items-center gap-1">
          <Phone className="w-3 h-3 text-cyber-cyan" /> CONTACT PHONE
        </label>
        <input
          type="tel"
          value={reporterPhone}
          onChange={(e) => {
            setReporterPhone(e.target.value);
            if (e.target.value && e.target.value.length === 1) {
              requestGeolocation();
            }
          }}
          onFocus={requestGeolocation}
          onClick={requestGeolocation}
          placeholder="e.g. +91 98765 43210"
          className="w-full px-3 py-2 bg-black/40 border border-cyber-violet/30 focus:border-cyber-magenta rounded-lg text-white outline-none transition-colors"
        />
      </div>

      {/* Coordinates Display */}
      <div className="space-y-1">
        <label className="text-[10px] text-cyber-gray flex items-center gap-1">
          <MapPin className="w-3 h-3 text-cyber-magenta" /> COORDINATES (LNG, LAT)
        </label>
        <div className="w-full px-3 py-2 bg-[#100C20] border border-cyber-violet/20 rounded-lg text-white flex items-center justify-between text-[11px]">
          <span>{coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}</span>
          <span className="text-[8px] text-cyber-magenta animate-pulse">[MAP TARGET]</span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-[10px] text-cyber-gray flex items-center gap-1">
          <FileText className="w-3 h-3 text-cyber-cyan" /> INCIDENT DESCRIPTION
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe animal status, visible wounds, or posture distress..."
          className="w-full px-3 py-2 bg-black/40 border border-cyber-violet/30 focus:border-cyber-magenta rounded-lg text-white outline-none resize-none transition-colors"
        />
      </div>

      {/* Error / Success Toast inside form */}
      {errorMsg && <p className="text-[9.5px] text-cyber-magenta animate-shake">{errorMsg}</p>}
      {successMsg && <p className="text-[9.5px] text-green-400">{successMsg}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-gradient-to-r from-cyber-magenta to-cyber-violet hover:from-cyber-magenta hover:to-cyber-magenta text-white font-mono text-[10px] tracking-wider rounded-lg transition-all shadow-neon-magenta hover:scale-[1.02] flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{submitting ? "SUBMITTING..." : "BROADCAST DISPATCH"}</span>
      </button>
    </form>
  );
}
