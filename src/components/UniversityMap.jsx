import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

export default function UniversityMap() {
  const svgRef = useRef(null);
  const [hoveredUni, setHoveredUni] = useState(null);

  // Approximate relative positions on the stylized map of Nigeria (Canvas 800x600)
  const universities = [
    { id: 'pau', name: 'Pan-Atlantic Univ.', state: 'Lagos', x: 260, y: 500, address: 'Km 52 Lekki-Epe Expy, Ibeju-Lekki', lat: '6.4673° N', lng: '3.5852° E' },
    { id: 'covenant', name: 'Covenant Univ.', state: 'Ogun', x: 270, y: 470, address: 'Km 10 Idiroko Rd, Ota', lat: '6.6718° N', lng: '3.1581° E' },
    { id: 'babcock', name: 'Babcock Univ.', state: 'Ogun', x: 290, y: 460, address: 'Ilishan-Remo', lat: '6.8860° N', lng: '3.7056° E' },
    { id: 'bowen', name: 'Bowen Univ.', state: 'Osun', x: 310, y: 430, address: 'Iwo, Osun State', lat: '7.6292° N', lng: '4.1873° E' },
    { id: 'landmark', name: 'Landmark Univ.', state: 'Kwara', x: 330, y: 350, address: 'Omu-Aran, Kwara', lat: '8.1394° N', lng: '5.1011° E' },
    { id: 'baze', name: 'Baze Univ.', state: 'Abuja', x: 420, y: 340, address: 'Jabi Airport Road Bypass', lat: '9.0267° N', lng: '7.4047° E' },
  ];

  // Web connections
  const edges = [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 4 },
    { source: 4, target: 5 },
    { source: 1, target: 4 },
    { source: 0, target: 2 },
    { source: 3, target: 5 },
  ];

  useEffect(() => {
    anime({
      targets: '.uni-node',
      r: [0, 6],
      opacity: [0, 1],
      duration: 1500,
      delay: anime.stagger(150),
      easing: 'easeOutElastic(1, .5)'
    });

    anime({
      targets: '.uni-ring',
      r: [6, 24],
      opacity: [0.6, 0],
      duration: 2500,
      delay: anime.stagger(200),
      loop: true,
      easing: 'easeOutQuad'
    });

    anime({
      targets: '.uni-edge',
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 2000,
      delay: 500 + anime.stagger(100),
      easing: 'easeInOutSine',
      direction: 'normal',
      loop: false
    });
    
    anime({
      targets: '.uni-label',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 1000,
      delay: 1500 + anime.stagger(100),
      easing: 'easeOutExpo'
    });

    // Pulse the map glow slightly but keep it visible
    anime({
      targets: '.map-glow',
      opacity: [0.7, 1],
      duration: 3000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });

  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 500, background: 'var(--bg-inner)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      
      {/* Background Mesh */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--border-active) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.3
      }} />

      <svg 
        ref={svgRef}
        viewBox="150 200 450 400" 
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}
      >
        <defs>
          <linearGradient id="nigeria-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.02" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Stylized Tech Map of Nigeria */}
        <path 
          d="M 210 520 L 180 430 L 220 340 L 270 280 L 370 240 L 490 230 L 560 270 L 600 360 L 570 430 L 510 470 L 480 540 L 420 570 L 330 550 Z" 
          fill="url(#nigeria-grad)" 
          stroke="var(--text-primary)" 
          strokeWidth="1.5"
          className="map-glow"
          filter="url(#glow)"
        />
        
        {/* Subtle grid lines over the map */}
        <path 
          d="M 180 430 L 600 360 M 270 280 L 510 470 M 370 240 L 480 540" 
          stroke="var(--text-primary)" 
          strokeWidth="1" 
          strokeDasharray="4 4" 
          opacity="0.15" 
        />
        
        {/* Edges */}
        {edges.map((edge, i) => {
          const source = universities[edge.source];
          const target = universities[edge.target];
          return (
            <line 
              key={`edge-${i}`}
              className="uni-edge"
              x1={source.x} 
              y1={source.y} 
              x2={target.x} 
              y2={target.y}
              stroke="var(--accent-primary)"
              strokeWidth="2.5"
              strokeDasharray="1000"
              filter="url(#glow)"
              opacity="1"
            />
          );
        })}

        {/* Nodes and Labels */}
        {universities.map((uni) => (
          <g 
            key={uni.id}
            onMouseEnter={() => setHoveredUni(uni.id)}
            onMouseLeave={() => setHoveredUni(null)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
            transform={hoveredUni === uni.id ? `translate(0, -3)` : `translate(0, 0)`}
          >
            {/* Hitbox for easier hovering */}
            <circle cx={uni.x} cy={uni.y} r="25" fill="transparent" />

            <circle 
              className="uni-ring"
              cx={uni.x} 
              cy={uni.y} 
              r="6" 
              fill="var(--accent-primary)"
              filter="url(#glow)"
              opacity={hoveredUni === uni.id ? 0 : 0.6}
            />
            <circle 
              className="uni-node"
              cx={uni.x} 
              cy={uni.y} 
              r={hoveredUni === uni.id ? 8 : 6} 
              fill={hoveredUni === uni.id ? "var(--accent-primary)" : "var(--bg-void)"}
              stroke="var(--accent-primary)"
              strokeWidth="3"
              filter="url(#glow)"
              style={{ transition: 'all 0.3s ease' }}
            />
            
            <g className="uni-label" opacity="0">
              <rect 
                x={uni.x + 12} 
                y={uni.y - 12} 
                width="110" 
                height="32" 
                rx="4" 
                fill="var(--bg-card)" 
                opacity="0.9" 
                stroke="var(--border-subtle)" 
                strokeWidth="1" 
              />
              <text 
                x={uni.x + 20} 
                y={uni.y + 2} 
                fill="var(--text-primary)" 
                fontSize="11"
                fontFamily="Plus Jakarta Sans"
                fontWeight="700"
              >
                {uni.name}
              </text>
              <text 
                x={uni.x + 20} 
                y={uni.y + 14} 
                fill="var(--text-secondary)" 
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                {uni.state}
              </text>
            </g>

            {/* Glassmorphic Tooltip on Hover */}
            {hoveredUni === uni.id && (
              <foreignObject x={uni.x - 75} y={uni.y - 120} width="200" height="120" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <div className="glass-panel" style={{ 
                  padding: '12px', 
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '1px solid var(--accent-primary)',
                  animation: 'fadeInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{uni.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {uni.address}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTop: '1px dashed var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)' }}>LAT: {uni.lat}</div>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)' }}>LNG: {uni.lng}</div>
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
        ))}
      </svg>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
