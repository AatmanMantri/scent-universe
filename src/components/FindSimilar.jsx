import { useState } from 'react';
import { Search } from 'lucide-react';
import { perfumes } from '../data/perfumes';
import { findSimilarPerfumes } from '../utils/similarity';

export default function FindSimilar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  const filteredPerfumes = perfumes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const similarPerfumes = selectedPerfume 
    ? findSimilarPerfumes(selectedPerfume, perfumes, 4) 
    : [];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ position: 'relative', marginBottom: '40px', maxWidth: '600px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} size={20} />
        <input 
          type="text" 
          className="search-input"
          placeholder="Search for a perfume to find its matches..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedPerfume(null);
          }}
        />
      </div>

      {!selectedPerfume && (
        <div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Select a perfume to find similarities ({perfumes.length} in catalog)
          </h3>
          <p style={{ marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Nearest matches use 3D distance from shared note text — search to narrow the list.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {(searchTerm ? filteredPerfumes : filteredPerfumes.slice(0, 48)).map(perfume => (
              <div 
                key={perfume.id} 
                className="glass-panel card" 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedPerfume(perfume)}
              >
                <div style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', marginBottom: '4px' }}>{perfume.brand}</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{perfume.name}</h4>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {(perfume.topNotes || []).slice(0, 2).map(n => <span key={n} className="pill">{n}</span>)}
                </div>
              </div>
            ))}
          </div>
          {!searchTerm && filteredPerfumes.length > 48 && (
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Showing 48 of {filteredPerfumes.length} — type above to search.
            </p>
          )}
        </div>
      )}

      {selectedPerfume && (
        <div>
          <button 
            onClick={() => setSelectedPerfume(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ← Back to search
          </button>
          
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            {/* Target Perfume */}
            <div className="glass-panel" style={{ flex: '0 0 350px', borderTop: `4px solid ${selectedPerfume.color}` }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>TARGET SCENT</div>
              <div style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 600 }}>{selectedPerfume.brand}</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{selectedPerfume.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                {selectedPerfume.description}
              </p>
              
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ marginBottom: '8px' }}><strong style={{ color: 'white' }}>Key Notes:</strong></div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[...(selectedPerfume.topNotes || []), ...(selectedPerfume.middleNotes || []), ...(selectedPerfume.baseNotes || [])].map(n => (
                    <span key={n} className="pill" style={{ background: 'rgba(255,255,255,0.05)' }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Similar Matches */}
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Nearest Matches in the Scent Space</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {similarPerfumes.map((match) => (
                  <div key={match.id} className="glass-panel card" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: `rgba(212, 175, 55, ${match.similarityScore / 100})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                      {Math.round(match.similarityScore)}%
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{match.brand}</div>
                      <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{match.name}</h4>
                      
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(match.topNotes || []).slice(0,2).map(n => <span key={n} className="pill">{n}</span>)}
                        {(match.baseNotes || []).slice(0,1).map(n => <span key={n} className="pill">{n}</span>)}
                      </div>
                    </div>
                    
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right', width: '150px' }}>
                      <div style={{ marginBottom: '4px' }}>Spatial Distance</div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>{match.distance.toFixed(2)} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
