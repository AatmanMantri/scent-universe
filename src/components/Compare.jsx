import { useState } from 'react';
import { mockPerfumes } from '../data/mockPerfumes';
import { calculateNoteSimilarity } from '../utils/similarity';

export default function Compare() {
  const [perfume1Id, setPerfume1Id] = useState(mockPerfumes[0].id);
  const [perfume2Id, setPerfume2Id] = useState(mockPerfumes[1].id);

  const p1 = mockPerfumes.find(p => p.id === perfume1Id);
  const p2 = mockPerfumes.find(p => p.id === perfume2Id);

  const getNotes = (p) => [...p.topNotes, ...p.middleNotes, ...p.baseNotes];
  
  const notes1 = getNotes(p1);
  const notes2 = getNotes(p2);
  
  const notes1Lower = notes1.map(n => n.toLowerCase());
  const notes2Lower = notes2.map(n => n.toLowerCase());

  const sharedNotes = notes1.filter(n => notes2Lower.includes(n.toLowerCase()));
  const uniqueTo1 = notes1.filter(n => !notes2Lower.includes(n.toLowerCase()));
  const uniqueTo2 = notes2.filter(n => !notes1Lower.includes(n.toLowerCase()));

  const similarityScore = calculateNoteSimilarity(p1, p2);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '32px', textAlign: 'center' }}>Head-to-Head Comparison</h2>

      {/* Selectors */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <select 
            value={perfume1Id} 
            onChange={e => setPerfume1Id(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '20px' }}
          >
            {mockPerfumes.map(p => <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <select 
            value={perfume2Id} 
            onChange={e => setPerfume2Id(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '20px' }}
          >
            {mockPerfumes.map(p => <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Comparison View */}
      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
              {Math.round(similarityScore)}%
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Note Similarity Score</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          {/* Perfume 1 Unique */}
          <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '40px' }}>
            <h3 style={{ color: p1.color, marginBottom: '24px', textAlign: 'center' }}>{p1.name} Only</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {uniqueTo1.map(n => <span key={n} className="pill" style={{ opacity: 0.7 }}>{n}</span>)}
            </div>
          </div>

          {/* Shared Notes */}
          <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '40px' }}>
            <h3 style={{ color: 'white', marginBottom: '24px', textAlign: 'center' }}>Shared DNA</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {sharedNotes.length > 0 ? (
                sharedNotes.map(n => <span key={n} className="pill gold">{n}</span>)
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>No shared notes</span>
              )}
            </div>
          </div>

          {/* Perfume 2 Unique */}
          <div style={{ flex: 1 }}>
            <h3 style={{ color: p2.color, marginBottom: '24px', textAlign: 'center' }}>{p2.name} Only</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {uniqueTo2.map(n => <span key={n} className="pill" style={{ opacity: 0.7 }}>{n}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
