import { useEffect, useRef } from 'react';
import anime from 'animejs';

// Define nodes matching REAVO categories
const nodes = [
  { id: 'creators', x: 200, y: 150, color: '#7C5CFF' },
  { id: 'gamers', x: 600, y: 100, color: '#B4FF39' },
  { id: 'students', x: 400, y: 300, color: '#3D8BFF' },
  { id: 'biz', x: 750, y: 350, color: '#FFB800' },
  { id: 'schools', x: 300, y: 500, color: '#FF6B4A' },
  { id: 'events', x: 650, y: 550, color: '#39D9C4' }
];

// Define edges connecting nodes
const edges = [
  { source: 0, target: 2 },
  { source: 1, target: 2 },
  { source: 2, target: 4 },
  { source: 2, target: 3 },
  { source: 3, target: 5 },
  { source: 4, target: 5 },
  { source: 0, target: 1 }
];

export default function MeshVisualization({ activeSequence = 0 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    // Basic pulse animation for nodes
    const nodeAnim = anime({
      targets: '.mesh-node',
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      duration: 3000,
      delay: anime.stagger(200),
      loop: true,
      easing: 'easeInOutSine'
    });
    
    // Animate edges
    const edgeAnim = anime({
      targets: '.mesh-edge',
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 2000,
      delay: anime.stagger(150),
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });

    return () => {
      nodeAnim.pause();
      edgeAnim.pause();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.7, pointerEvents: 'none' }}>
      <svg 
        ref={svgRef}
        viewBox="0 0 1000 700" 
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const sourceNode = nodes[edge.source];
          const targetNode = nodes[edge.target];
          return (
            <line 
              key={`edge-${i}`}
              className="mesh-edge"
              x1={sourceNode.x} 
              y1={sourceNode.y} 
              x2={targetNode.x} 
              y2={targetNode.y}
              stroke="var(--border-active)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`} transform={`translate(${node.x}, ${node.y})`} style={{ color: node.color }}>
            <circle 
              className="mesh-node"
              r="6" 
              fill="currentColor"
            />
            <circle 
              r="24" 
              fill="url(#node-glow)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
