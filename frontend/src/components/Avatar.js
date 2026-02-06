import React from 'react';

const Avatar = ({ value, size = 40, variant = 'marble' }) => {
  // Generate consistent colors based on the input value
  const generateColors = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      ['#FF6B6B', '#4ECDC4'], // Red to Teal
      ['#A8E6CF', '#FFD93D'], // Green to Yellow
      ['#FF8A80', '#82B1FF'], // Pink to Blue
      ['#4ECDC4', '#45B7D1'], // Teal to Blue
      ['#FFAB91', '#81C784'], // Orange to Green
      ['#F8BBD9', '#80CBC4'], // Light Pink to Cyan
      ['#90CAF9', '#A5D6A7'], // Light Blue to Light Green
      ['#FFCC02', '#FF6F00'], // Yellow to Orange
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const [color1, color2] = generateColors(value || 'default');
  
  const marblePattern = (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-full">
      <defs>
        <radialGradient id={`gradient-${value}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </radialGradient>
        <filter id={`noise-${value}`}>
          <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>
      </defs>
      <circle 
        cx="50" 
        cy="50" 
        r="50" 
        fill={`url(#gradient-${value})`}
        filter={`url(#noise-${value})`}
      />
      <circle 
        cx="50" 
        cy="50" 
        r="50" 
        fill="none" 
        stroke="rgba(255,255,255,0.2)" 
        strokeWidth="1"
      />
    </svg>
  );

  const shapePattern = (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-full">
      <defs>
        <linearGradient id={`shape-gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#shape-gradient-${value})`} rx="50" />
      <polygon 
        points="20,80 50,20 80,80" 
        fill="rgba(255,255,255,0.1)" 
      />
      <circle 
        cx="30" 
        cy="40" 
        r="8" 
        fill="rgba(255,255,255,0.15)" 
      />
      <circle 
        cx="70" 
        cy="35" 
        r="5" 
        fill="rgba(255,255,255,0.1)" 
      />
    </svg>
  );

  return (
    <div 
      className="inline-block animate-in fade-in duration-300 hover:scale-110 transition-transform cursor-pointer"
      style={{ width: size, height: size }}
    >
      {variant === 'marble' ? marblePattern : shapePattern}
    </div>
  );
};

export default Avatar;