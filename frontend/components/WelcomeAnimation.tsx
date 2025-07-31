import React from 'react';

const WelcomeAnimation: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 bg-cyber-bg flex flex-col items-center justify-center z-50 pointer-events-none"
      style={{ animation: 'fadeOut 0.5s ease-in 4.5s forwards' }}
    >
      <div style={{ animation: 'fadeInUp 1s ease-out forwards' }}>
        <svg viewBox="0 0 200 200" className="w-40 h-40 text-cyber-glow">
          <defs>
            <filter id="robotGlow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#robotGlow)">
            {/* Head Outline */}
            <path d="M 60 160 C 40 130 40 70 60 40 L 140 40 C 160 70 160 130 140 160 Z" stroke="currentColor" strokeWidth="3" fill="none" />
            
            {/* Antenna */}
            <line x1="100" y1="40" x2="100" y2="20" stroke="currentColor" strokeWidth="3" />
            <circle cx="100" cy="15" r="5" fill="currentColor" className="animate-pulse" />
            
            {/* Eye */}
            <rect x="75" y="75" width="50" height="20" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="75" y1="85" x2="125" y2="85" stroke="currentColor" strokeWidth="2" className="animate-flicker" />
            
             {/* Details */}
            <line x1="60" y1="120" x2="140" y2="120" stroke="currentColor" strokeWidth="2" />
            <circle cx="70" cy="55" r="3" fill="currentColor" />
            <circle cx="130" cy="55" r="3" fill="currentColor" />
          </g>
        </svg>
      </div>
      
      <div className="mt-6 text-center">
        <h1 
          className="font-orbitron text-3xl md:text-4xl text-cyber-glow inline-block overflow-hidden whitespace-nowrap border-r-4 border-r-cyber-glow"
          style={{
            animation: 'typewriter 2s steps(22, end) 1s forwards, blinkCaret .75s step-end 3s forwards'
          }}
        >
          AI MOCK INTERVIEWER
        </h1>
        
        <p 
          className="font-mono text-cyber-text mt-4 opacity-0"
          style={{ animation: 'fadeIn 1s ease-in 3.5s forwards' }}
        >
          INITIALIZING SIMULATION...
        </p>
      </div>
    </div>
  );
};

export default WelcomeAnimation;