import React from 'react';

const AIViewfinder: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black p-4 rounded-lg border-2 border-cyber-border/50 overflow-hidden shadow-glow">
      {/* Glitchy background grid */}
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10 text-cyber-glow">
        <defs>
          <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="url(#smallGrid)"/>
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* The AI Core SVG */}
      <svg viewBox="0 0 200 200" className="relative w-4/5 h-4/5 z-10">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer rotating rings */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="#29c5f6" strokeWidth="1" opacity="0.3" style={{ transformOrigin: 'center', animation: 'rotate 20s linear infinite' }} />
        <circle cx="100" cy="100" r="75" fill="none" stroke="#29c5f6" strokeWidth="0.5" opacity="0.5" style={{ transformOrigin: 'center', animation: 'rotate 15s linear infinite reverse' }} />
        
        {/* Pulsing Core */}
        <circle cx="100" cy="100" r="50" fill="url(#coreGradient)" stroke="#e6007a" strokeWidth="1.5" filter="url(#glow)" className="animate-pulse" />
        <circle cx="100" cy="100" r="50" fill="transparent" stroke="#dcf3f6" strokeWidth="2" strokeDasharray="10 5" opacity="0.5" style={{ transformOrigin: 'center', animation: 'rotate 10s linear infinite' }} />

        <radialGradient id="coreGradient">
          <stop offset="0%" stopColor="#e6007a" />
          <stop offset="100%" stopColor="#29c5f6" />
        </radialGradient>
      </svg>
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyber-glow opacity-70"></div>
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cyber-glow opacity-70"></div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-cyber-glow opacity-70"></div>
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-cyber-glow opacity-70"></div>
    </div>
  );
};

export default AIViewfinder;