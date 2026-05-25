import { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { allPerfumes } from '../data/perfumes';
import { applyPerfumeFilters, DEFAULT_FILTER_OPTIONS } from '../utils/perfumeFilters';

const BRANDS = [...new Set(allPerfumes.map((p) => p.brand))].sort();

function Orb({ perfume, onClick, isSelected }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        perfume.coordinates[1] +
        Math.sin(state.clock.elapsedTime * 2 + perfume.coordinates[0]) * 0.05;
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
        scale={isSelected ? 1.5 : hovered ? 1.2 : 1}
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
  const [enabledBrands, setEnabledBrands] = useState(() => new Set(BRANDS));
  const [hideGifts, setHideGifts] = useState(DEFAULT_FILTER_OPTIONS.hideGifts);
  const [hideAccessories, setHideAccessories] = useState(DEFAULT_FILTER_OPTIONS.hideAccessories);
  const [requireNotes, setRequireNotes] = useState(DEFAULT_FILTER_OPTIONS.requireNotes);

  const visiblePerfumes = useMemo(() => {
    const brands =
      enabledBrands.size === BRANDS.length ? [] : [...enabledBrands];
    return applyPerfumeFilters(allPerfumes, {
      brands,
      hideGifts,
      hideAccessories,
      requireNotes,
    });
  }, [enabledBrands, hideGifts, hideAccessories, requireNotes]);

  const toggleBrand = (brand) => {
    setEnabledBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
    setSelectedPerfume(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          width: '280px',
          padding: '16px',
          pointerEvents: 'auto',
          maxHeight: 'calc(100% - 32px)',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '12px' }}>
          Filters ({visiblePerfumes.length} / {allPerfumes.length})
        </div>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={hideGifts}
            onChange={(e) => {
              setHideGifts(e.target.checked);
              setSelectedPerfume(null);
            }}
          />
          Hide gifts &amp; sample sets
        </label>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={hideAccessories}
            onChange={(e) => {
              setHideAccessories(e.target.checked);
              setSelectedPerfume(null);
            }}
          />
          Hide accessories (beard balm, etc.)
        </label>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={requireNotes}
            onChange={(e) => {
              setRequireNotes(e.target.checked);
              setSelectedPerfume(null);
            }}
          />
          Only with note data
        </label>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Brands</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {BRANDS.map((brand) => (
            <label
              key={brand}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem' }}
            >
              <input
                type="checkbox"
                checked={enabledBrands.has(brand)}
                onChange={() => toggleBrand(brand)}
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
        <color attach="background" args={['#F9F9FA']} />
        <fog attach="fog" args={['#F9F9FA', 6, 14]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <axesHelper args={[2]} />
        <Text position={[2.2, 0, 0]} fontSize={0.1} color="#666666">
          X
        </Text>
        <Text position={[0, 2.2, 0]} fontSize={0.1} color="#666666">
          Y
        </Text>
        <Text position={[0, 0, 2.2]} fontSize={0.1} color="#666666">
          Z
        </Text>

        {visiblePerfumes.map((perfume) => (
          <Orb
            key={perfume.id}
            perfume={perfume}
            onClick={setSelectedPerfume}
            isSelected={selectedPerfume?.id === perfume.id}
          />
        ))}

        <OrbitControls enablePan enableZoom enableRotate autoRotate={false} />
      </Canvas>

      {selectedPerfume && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            width: '350px',
            pointerEvents: 'auto',
          }}
          className="glass-panel"
        >
          <button
            onClick={() => setSelectedPerfume(null)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            ×
          </button>

          <div
            style={{
              marginBottom: '8px',
              color: 'var(--accent-gold)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {selectedPerfume.brand}
          </div>
          <h2 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{selectedPerfume.name}</h2>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="pill">{selectedPerfume.gender}</span>
            {(selectedPerfume.mood || []).map((m) => (
              <span key={m} className="pill gold">
                {m}
              </span>
            ))}
          </div>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              marginBottom: '16px',
            }}
          >
            {selectedPerfume.description}
          </p>

          {selectedPerfume.url && (
            <a
              href={selectedPerfume.url}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--accent-gold)',
                fontSize: '0.85rem',
                display: 'block',
                marginBottom: '16px',
              }}
            >
              View on store →
            </a>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Top:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {(selectedPerfume.topNotes || []).join(', ') || '—'}
              </span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Heart:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {(selectedPerfume.middleNotes || []).join(', ') || '—'}
              </span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Base:</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {(selectedPerfume.baseNotes || []).join(', ') || '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {!selectedPerfume && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(0,0,0,0.5)',
            fontSize: '0.9rem',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          Drag to rotate • Scroll to zoom • Click an orb to explore
          <br />
          <span style={{ fontSize: '0.8rem' }}>
            Showing {visiblePerfumes.length} scents — use filters (top right) to narrow.
            <br />
            Layout uses shared note vocabulary (UMAP), not AI &quot;vibe&quot; matching.
          </span>
        </div>
      )}
    </div>
  );
}
