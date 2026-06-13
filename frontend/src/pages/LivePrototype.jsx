import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Upload, FileAudio, FileVideo, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Zap, Play, Volume2 } from 'lucide-react';
import { submitRescueTriage } from '../utils/api';
import HologramCanvas from '../components/HologramCanvas';
import PawTracker from '../components/PawTracker';

// Beautiful animated counter using Framer Motion hooks
function AnimatedCounter({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [rounded]);

  return <span>{displayValue}</span>;
}

export default function LivePrototype({ selectedIncident, setSelectedIncident, refreshIncidents }) {
  // Media Blobs
  const [audioFile, setAudioFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // UI States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sysLogs, setSysLogs] = useState([
    { time: new Date().toLocaleTimeString(), text: "System initialized. Waiting for telemetry blobs..." }
  ]);
  const [resultData, setResultData] = useState(null);
  const [errorText, setErrorText] = useState(null);

  // Refs
  const audioInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const logContainerRef = useRef(null);

  // If redirected from Dashboard with an incident selected, load it
  useEffect(() => {
    if (selectedIncident) {
      setResultData(selectedIncident);
      // Generate preview urls if they exist in the model
      if (selectedIncident.media_assets?.cloudinary_image_url) {
        const url = selectedIncident.media_assets.cloudinary_image_url;
        setMediaPreview(url.startsWith('/') 
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${url}`
          : url);
      }
      if (selectedIncident.media_assets?.cloudinary_audio_url) {
        setAudioPreview(selectedIncident.media_assets.cloudinary_audio_url);
      }
      
      addLog(`Loaded historical incident record: ${selectedIncident.incident_id}`);
      addLog(`Risk Level: ${selectedIncident.analysis_payload.risk_score} | Status: ${selectedIncident.operational_status}`);
    }
  }, [selectedIncident]);

  // Autoscroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [sysLogs]);

  const addLog = (text) => {
    setSysLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text }]);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => e.preventDefault();

  const handleAudioDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      loadAudioFile(file);
    } else {
      showError("Invalid file. Please drop an audio file (MP3/WAV).");
    }
  };

  const handleMediaDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      loadMediaFile(file);
    } else {
      showError("Invalid file. Please drop an image or video file (JPG/PNG/MP4).");
    }
  };

  const loadAudioFile = (file) => {
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    addLog(`Acoustic payload registered: ${file.name} (${(file.size/1024).toFixed(1)} KB)`);
  };

  const loadMediaFile = (file) => {
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    addLog(`Visual payload registered: ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`);
  };

  const showError = (text) => {
    setErrorText(text);
    addLog(`[ERROR] ${text}`);
    setTimeout(() => setErrorText(null), 5000);
  };

  // Preset demo loader to make testing quick
  const loadMockPreset = () => {
    addLog("Injecting sample emergency telemetry vectors...");
    
    // Create standard text representations to bypass actual file selections
    const mockImageBlob = new Blob(["mock_img_data"], { type: "image/png" });
    const mockAudioBlob = new Blob(["mock_audio_data"], { type: "audio/wav" });
    
    // Set custom names
    mockImageBlob.name = "emergency_strickendog.png";
    mockAudioBlob.name = "distress_barking.wav";
    
    setMediaFile(mockImageBlob);
    setAudioFile(mockAudioBlob);
    
    setMediaPreview("https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600");
    setAudioPreview("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    
    addLog("Successfully queued: 'emergency_strickendog.png' and 'distress_barking.wav'");
  };

  const clearWorkspace = () => {
    setAudioFile(null);
    setMediaFile(null);
    setAudioPreview(null);
    setMediaPreview(null);
    setResultData(null);
    setSelectedIncident(null);
    setUploadProgress(0);
    addLog("Workspace cleared. Ready for next triage scan.");
  };

  const executeTriageScan = async () => {
    if (!audioFile && !mediaFile) {
      showError("Please upload or register at least one audio or media asset to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setErrorText(null);
    setResultData(null);
    addLog("Establishing connection with FastAPI triage socket...");
    addLog("Streaming media blocks to secure cloud storage...");

    try {
      const data = await submitRescueTriage(audioFile, mediaFile, (percent) => {
        setUploadProgress(percent);
        if (percent % 25 === 0 || percent === 100) {
          addLog(`Uploading assets... ${percent}% completed.`);
        }
      });

      addLog("Upload complete. Activating computer vision injury checks...");
      addLog("Invoking Librosa spectral distress analyzers...");
      addLog("Applying threat score matrices calculations...");

      // Simulate a small delay for premium visual wow factor
      setTimeout(() => {
        setResultData(data);
        setIsAnalyzing(false);
        addLog("Triage analysis complete! Incident report generated successfully.");
        addLog(`BLENDED RISK LEVEL: ${data.analysis_payload.risk_score}/100`);
        addLog(`OPERATIONAL STATE: ${data.operational_status}`);
        if (refreshIncidents) {
          refreshIncidents();
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      showError("Triage calculation failed. Confirm backend server is online.");
    }
  };

  // Compute Risk circular indicators
  const anomalies = resultData?.analysis_payload?.detected_anomalies || resultData?.analysis_payload?.detected_injuries || [];
  const isClear = resultData && anomalies.length === 0;

  const riskVal = resultData?.analysis_payload?.risk_score ?? 0;
  const status = resultData?.operational_status ?? "Stable";
  
  let riskColor = "text-cyber-cyan border-cyber-cyan";
  let strokeColor = "#00F0FF";
  let statusBadge = "bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30";
  
  if (isClear) {
    riskColor = "text-emerald-400 border-emerald-400";
    strokeColor = "#10B981";
    statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  } else if (status === "Dispatched") {
    riskColor = riskVal >= 75 ? "text-cyber-magenta border-cyber-magenta" : (riskVal >= 40 ? "text-yellow-400 border-yellow-400" : "text-cyber-violet border-cyber-violet");
    strokeColor = riskVal >= 75 ? "#FF007F" : (riskVal >= 40 ? "#F1C40F" : "#8A2BE2");
    statusBadge = "bg-green-500/10 text-green-400 border-green-500/30";
  } else if (riskVal >= 75) {
    riskColor = "text-cyber-magenta border-cyber-magenta";
    strokeColor = "#FF007F";
    statusBadge = "bg-cyber-magenta/10 text-cyber-magenta border-cyber-magenta/30 shadow-neon-magenta";
  } else if (riskVal >= 40) {
    riskColor = "text-yellow-400 border-yellow-400";
    strokeColor = "#F1C40F";
    statusBadge = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  } else if (resultData) {
    riskColor = "text-cyber-violet border-cyber-violet";
    strokeColor = "#8A2BE2";
    statusBadge = "bg-cyber-violet/10 text-cyber-violet border-cyber-violet/30";
  }

  // Circular progress math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskVal / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Action Header bar */}
      <div className="flex items-center justify-between border-b border-cyber-violet/10 pb-4">
        <div>
          <h2 className="text-xl font-black tracking-widest font-mono text-white">LIVE TRIAGE MODULE</h2>
          <p className="text-xs text-cyber-gray font-mono mt-0.5">TARGET_SYSTEM_TRIAGE: ENG_V1</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadMockPreset}
            disabled={isAnalyzing}
            className="px-4 py-2 border border-cyber-cyan/40 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan font-mono text-[10px] tracking-wider rounded-lg transition-all"
          >
            LOAD SIMULATED EMERGENCY
          </button>
          
          <button
            onClick={clearWorkspace}
            disabled={isAnalyzing}
            className="px-4 py-2 border border-cyber-violet/40 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] tracking-wider rounded-lg transition-all"
          >
            RESET WORKSPACE
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Media Drag & Drop uploads */}
        <div className="space-y-6">
          
          {/* Audio drag box */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleAudioDrop}
            onClick={() => audioInputRef.current.click()}
            className="relative h-[185px] border border-dashed border-cyber-violet/30 hover:border-cyber-magenta/50 bg-black/30 hover:bg-black/50 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 group"
          >
            <input
              type="file"
              ref={audioInputRef}
              onChange={(e) => loadAudioFile(e.target.files[0])}
              accept="audio/*"
              className="hidden"
            />
            {audioPreview ? (
              <div className="flex flex-col items-center text-center space-y-2 w-full">
                <div className="p-3 bg-cyber-violet/20 border border-cyber-violet/40 rounded-xl text-cyber-violet group-hover:scale-110 transition-transform">
                  <FileAudio className="w-8 h-8" />
                </div>
                <p className="text-xs font-mono text-white truncate max-w-xs">{audioFile?.name || "Preloaded Audio Case"}</p>
                <audio src={audioPreview} controls className="w-full max-w-[200px] h-8 mt-1" onClick={e => e.stopPropagation()} />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-cyber-violet/10 border border-cyber-violet/20 rounded-xl text-cyber-violet group-hover:text-cyber-magenta group-hover:border-cyber-magenta/40 transition-colors">
                  <Volume2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white tracking-wide">DRAG OR UPLOAD AUDIO</p>
                  <p className="text-[10px] text-cyber-gray font-mono mt-1">Accepts: .mp3, .wav vocalizations</p>
                </div>
              </div>
            )}
          </div>

          {/* Visual media drag box */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleMediaDrop}
            onClick={() => mediaInputRef.current.click()}
            className="relative h-[245px] border border-dashed border-cyber-violet/30 hover:border-cyber-magenta/50 bg-black/30 hover:bg-black/50 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 group"
          >
            <input
              type="file"
              ref={mediaInputRef}
              onChange={(e) => loadMediaFile(e.target.files[0])}
              accept="image/*,video/*"
              className="hidden"
            />
            {mediaPreview ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyber-violet/20">
                {mediaPreview.includes('.mp4') || (mediaFile && mediaFile.type.startsWith('video/')) ? (
                  <video src={mediaPreview} controls className="w-full h-full object-cover" onClick={e => e.stopPropagation()} />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/75 border border-cyber-magenta/40 rounded text-[9px] font-mono text-cyber-magenta">
                  TELEMETRY_STREAM
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-cyber-violet/10 border border-cyber-violet/20 rounded-xl text-cyber-violet group-hover:text-cyber-magenta group-hover:border-cyber-magenta/40 transition-colors">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white tracking-wide">DRAG OR UPLOAD VISUALS</p>
                  <p className="text-[10px] text-cyber-gray font-mono mt-1">Accepts: .png, .jpg, .mp4 formats</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Center Panel: Three.js 3D animal mesh */}
        <div className="space-y-6">
          <div className="relative rounded-2xl p-4 glass-panel border border-cyber-violet/20">
            <h3 className="text-[10px] font-mono tracking-widest text-cyber-magenta mb-3">SILHOUETTE SCANNER VIEWPORT</h3>
            
            {isAnalyzing ? (
              <div className="w-full h-[320px] rounded-2xl bg-[#07070F] border border-cyber-violet/15 flex flex-col items-center justify-center">
                <PawTracker text={`AI ANALYZING IMAGES & AUDIO: ${uploadProgress}%`} />
              </div>
            ) : (
              <HologramCanvas scanning={resultData?.analysis_payload?.risk_score > 0} />
            )}
            
            <button
              onClick={executeTriageScan}
              disabled={isAnalyzing}
              className="mt-4 w-full py-3 bg-gradient-to-r from-cyber-magenta to-cyber-violet hover:from-cyber-magenta hover:to-cyber-magenta text-white font-mono text-xs tracking-wider rounded-xl transition-all duration-300 shadow-neon-magenta hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>EXECUTING AI TRIAGE...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>RUN TRIAGE SCAN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Risk Gauge, detected injury list, system logs */}
        <div className="space-y-6">
          
          <div className="glass-panel border border-cyber-violet/20 rounded-2xl p-6 flex flex-col justify-between min-h-[450px]">
            
            <AnimatePresence mode="wait">
              {resultData ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  {/* Title & Status Badge */}
                  <div className="flex items-center justify-between border-b border-cyber-violet/10 pb-3">
                    <h3 className="font-mono text-xs text-white">TRIAGE DIAGNOSTIC OUTPUT</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${statusBadge}`}>
                      {isClear ? "NORMAL" : (status === "Dispatched" ? "DISPATCHED" : (riskVal >= 75 ? "CRITICAL" : (riskVal >= 40 ? "WARNING" : "STABLE")))}
                    </span>
                  </div>

                  {/* Circular Radial Risk Score Gauge */}
                  <div className="flex justify-center py-2">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r={radius}
                          fill="transparent"
                          stroke="rgba(138, 43, 226, 0.15)"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r={radius}
                          fill="transparent"
                          stroke={strokeColor}
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center font-mono">
                        <span className={`text-3xl font-black ${riskColor}`}>
                          <AnimatedCounter value={riskVal} />
                        </span>
                        <span className="text-[8px] text-cyber-gray tracking-widest">RISK INDEX</span>
                      </div>
                    </div>
                  </div>

                  {/* Injury details */}
                  <div className="space-y-2">
                    <h4 className="font-mono text-[10px] text-cyber-magenta tracking-wider">DETECTED ANOMALIES</h4>
                    <div className="flex flex-wrap gap-1.5 w-full">
                      {isClear ? (
                        <div className="text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 rounded-lg w-full">
                          Status: Normal / No Anomalies Detected
                        </div>
                      ) : (
                        anomalies.map((injury, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-black/40 border border-cyber-violet/30 text-white flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-cyber-magenta" />
                            {injury}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Confidence breakdown */}
                  <div className="space-y-2 bg-black/30 border border-cyber-violet/10 rounded-xl p-3">
                    <h4 className="font-mono text-[9px] text-cyber-cyan tracking-wider">MODEL MATCH CONFIDENCE</h4>
                    <div className="space-y-1.5">
                      {Object.entries(resultData.analysis_payload.confidence_percentages).map(([k, v]) => (
                        <div key={k} className="flex justify-between font-mono text-[9px]">
                          <span className="text-cyber-gray">{k.toUpperCase()}</span>
                          <span className="text-white font-bold">{v}{typeof v === 'number' && v <= 100 ? '%' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="p-4 border border-dashed border-cyber-violet/20 rounded-full text-cyber-violet">
                    <ShieldAlert className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-xs font-mono text-cyber-gray text-center max-w-[200px]">
                    Telemetry diagnostic inactive. Trigger a triage scan to populate results.
                  </p>
                </div>
              )}
            </AnimatePresence>

            {/* Live Operations Logs */}
            <div className="space-y-2 border-t border-cyber-violet/10 pt-4 mt-auto">
              <h4 className="font-mono text-[9px] text-cyber-violet tracking-wider">SYSTEM EXECUTION HUD LOGS</h4>
              <div 
                ref={logContainerRef}
                className="h-[120px] overflow-y-auto bg-black/60 rounded-xl p-2.5 border border-cyber-violet/15 font-mono text-[9px] leading-relaxed text-cyber-cyan space-y-1.5 scrollbar-thin"
              >
                {sysLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-1">
                    <span className="text-cyber-violet/70">[{log.time}]</span>
                    <span className="text-cyber-cyan/95">{log.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
        </div>

      </div>

      {/* Error alert toast */}
      <AnimatePresence>
        {errorText && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[100] px-4 py-3 bg-cyber-magenta/90 text-white font-mono text-xs rounded-xl flex items-center space-x-2 shadow-neon-magenta border border-cyber-magenta/50"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{errorText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
