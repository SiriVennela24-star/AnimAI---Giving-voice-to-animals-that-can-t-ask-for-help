import React from 'react';

export default function PawTracker({ text = "AI ENGINE TRIAGE ACTIVE..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="flex items-center space-x-3">
        {[1, 2, 3, 4, 5].map((step) => (
          <svg
            key={step}
            className={`w-8 h-8 text-cyber-magenta paw-glow-step-${step}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* Custom high-fidelity paw print SVG */}
            <path d="M12 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-5.5-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9-4c-.83 0-1.5.67-1.5 1.5S7.67 11 8.5 11s1.5-.67 1.5-1.5S9.33 8 8.5 8zm7 0c-.83 0-1.5.67-1.5 1.5S14.67 11 15.5 11s1.5-.67 1.5-1.5S16.33 8 15.5 8z" />
          </svg>
        ))}
      </div>
      <p className="text-xs tracking-widest text-cyber-magenta font-mono animate-pulse">{text}</p>
    </div>
  );
}
