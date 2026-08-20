import React from 'react';

const WoolenLoader = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center z-[9999]">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full text-[var(--primary)] drop-shadow-xl"
          style={{ overflow: 'visible' }}
        >
          {/* The unwinding thread looping into a shape */}
          <path
            d="M 30 65 C 30 100, 90 100, 90 50 C 90 0, 30 0, 30 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              strokeDasharray: '180',
              animation: 'unwind 2.5s ease-in-out infinite'
            }}
          />
          
          {/* The Yarn Ball bouncing and spinning slightly */}
          <g style={{ transformOrigin: '30px 50px', animation: 'yarn-bounce 2.5s ease-in-out infinite' }}>
            {/* Main Ball Body */}
            <circle cx="30" cy="50" r="18" fill="currentColor" />
            
            {/* Yarn textures (white overlays for thread lines) */}
            <path d="M 16 40 Q 30 46 44 40" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M 14 50 Q 30 56 46 50" stroke="white" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M 16 60 Q 30 54 44 60" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
            
            <path d="M 22 34 Q 26 50 22 66" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M 38 34 Q 34 50 38 66" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
          </g>
          
          {/* Little Knitting Needle */}
          <g style={{ transformOrigin: '80px 30px', animation: 'needle-poke 2.5s ease-in-out infinite' }}>
            <line x1="90" y1="20" x2="60" y2="50" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="90" cy="20" r="3" fill="#cbd5e1" />
          </g>
        </svg>
      </div>
      <p className="mt-8 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-80" style={{ animation: 'pulse-opacity 2.5s ease-in-out infinite' }}>
        Knitting your experience...
      </p>

      {/* Internal Styles for Custom Animation Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes unwind {
          0% { stroke-dashoffset: 180; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -180; }
        }
        @keyframes yarn-bounce {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-15deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes needle-poke {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, 10px) rotate(-10deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes pulse-opacity {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default WoolenLoader;
