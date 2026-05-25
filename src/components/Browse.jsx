import { useState } from 'react';
import { perfumes } from '../data/perfumes';

export default function Browse() {
  const [filterBrand, setFilterBrand] = useState('All');
  
  const brands = ['All', ...new Set(perfumes.map(p => p.brand))];

  const filtered = filterBrand === 'All' 
    ? perfumes 
    : perfumes.filter(p => p.brand === filterBrand);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2>Browse Collection ({filtered.length})</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Default view hides gifts and accessories (same as Universe)
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setFilterBrand(brand)}
              className={`nav-tab ${filterBrand === brand ? 'active' : ''}`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filtered.map(perfume => (
          <div key={perfume.id} className="glass-panel card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', marginBottom: '4px' }}>{perfume.brand}</div>
                <h3 style={{ fontSize: '1.4rem' }}>{perfume.name}</h3>
              </div>
              <span className="pill" style={{ border: `1px solid ${perfume.color}`, color: perfume.color }}>
                {perfume.gender}
              </span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px', minHeight: '60px' }}>
              {perfume.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div><strong style={{ color: 'white' }}>Top:</strong> <span style={{ color: 'var(--text-secondary)' }}>{(perfume.topNotes || []).join(', ') || '—'}</span></div>
              <div><strong style={{ color: 'white' }}>Base:</strong> <span style={{ color: 'var(--text-secondary)' }}>{(perfume.baseNotes || []).join(', ') || '—'}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
