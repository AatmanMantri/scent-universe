import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { mockPerfumes } from '../data/mockPerfumes';

function Orb({ perfume, onClick, isSelected }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  // Add subtle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = perfume.coordinates[1] + Math.sin(state.clock.elapsedTime * 2 + perfume.coordinates[0]) * 0.05;
    }
  });

  return (
    <group position={perfume.coordinates}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(perfume);
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={isSelected ? 1.5 : (hovered ? 1.2 : 1)}
      >
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
          color={perfume.color} 
          emissive={perfume.color}
          emissiveIntensity={hovered || isSelected ? 2 : 0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {(hovered || isSelected) && (
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.06}
          color="#1A1A1A"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#FFFFFF"
        >
          {perfume.name}
        </Text>
      )}
    </group>
  );
}

export default function ScentUniverse() {
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <color attach="background" args={['#F9F9FA']} />
        <fog attach="fog" args={['#F9F9FA', 3, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Origin and Dimensions */}
        <axesHelper args={[2]} />
        <Text position={[2.2, 0, 0]} fontSize={0.1} color="#666666">X (Dim 1)</Text>
        <Text position={[0, 2.2, 0]} fontSize={0.1} color="#666666">Y (Dim 2)</Text>
        <Text position={[0, 0, 2.2]} fontSize={0.1} color="#666666">Z (Dim 3)</Text>
        
        {mockPerfumes.map((perfume) => (
          <Orb 
            key={perfume.id} 
            perfume={perfume} 
            onClick={setSelectedPerfume}
            isSelected={selectedPerfume?.id === perfume.id}
          />
        ))}

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
        />
      </Canvas>

      {/* Info Panel Overlay */}
      {selectedPerfume && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '350px',
          pointerEvents: 'auto'
        }} className="glass-panel">
          <button 
            onClick={() => setSelectedPerfume(null)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
          
          <div style={{ marginBottom: '8px', color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 600 }}>
            {selectedPerfume.brand}
          </div>
          <h2 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{selectedPerfume.name}</h2>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="pill">{selectedPerfume.gender}</span>
            {selectedPerfume.mood.map(m => <span key={m} className="pill gold">{m}</span>)}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
            {selectedPerfume.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '0.85rem' }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>Top:</strong> <span style={{ color: 'var(--text-secondary)' }}>{selectedPerfume.topNotes.join(', ')}</span></div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Heart:</strong> <span style={{ color: 'var(--text-secondary)' }}>{selectedPerfume.middleNotes.join(', ')}</span></div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Base:</strong> <span style={{ color: 'var(--text-secondary)' }}>{selectedPerfume.baseNotes.join(', ')}</span></div>
          </div>
        </div>
      )}
      
      {!selectedPerfume && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(0,0,0,0.5)',
          fontSize: '0.9rem',
          pointerEvents: 'none'
        }}>
          Drag to rotate • Scroll to zoom • Click an orb to explore
        </div>
      )}
    </div>
  );
}
