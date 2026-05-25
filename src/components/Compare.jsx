import { useState } from 'react';
import { perfumes } from '../data/perfumes';
import { calculateNoteSimilarity } from '../utils/similarity';
import PerfumePicker from './PerfumePicker';

export default function Compare() {
  const [perfume1Id, setPerfume1Id] = useState(perfumes[0]?.id ?? '');
  const [perfume2Id, setPerfume2Id] = useState(perfumes[1]?.id ?? perfumes[0]?.id ?? '');

  const p1 = perfumes.find((p) => p.id === perfume1Id) ?? perfumes[0];
  const p2 = perfumes.find((p) => p.id === perfume2Id) ?? perfumes[1] ?? perfumes[0];

  if (!p1 || !p2) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No perfumes in catalog. Run the scraper or check filters.
      </div>
    );
  }

  const getNotes = (p) => [
    ...(p.topNotes || []),
    ...(p.middleNotes || []),
    ...(p.baseNotes || []),
  ];

  const notes1 = getNotes(p1);
  const notes2 = getNotes(p2);

  const notes1Lower = notes1.map((n) => n.toLowerCase());
  const notes2Lower = notes2.map((n) => n.toLowerCase());

  const sharedNotes = notes1.filter((n) => notes2Lower.includes(n.toLowerCase()));
  const uniqueTo1 = notes1.filter((n) => !notes2Lower.includes(n.toLowerCase()));
  const uniqueTo2 = notes2.filter((n) => !notes1Lower.includes(n.toLowerCase()));

  const similarityScore = calculateNoteSimilarity(p1, p2);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Head-to-Head Comparison</h2>
      <p
        style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          marginBottom: '32px',
        }}
      >
        Comparing {perfumes.length} scents (gifts and accessories hidden by default)
      </p>

      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <PerfumePicker
          perfumes={perfumes}
          value={perfume1Id}
          onChange={setPerfume1Id}
          placeholder="Search first perfume..."
        />
        <PerfumePicker
          perfumes={perfumes}
          value={perfume2Id}
          onChange={setPerfume2Id}
          placeholder="Search second perfume..."
        />
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
              {Math.round(similarityScore)}%
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Shared note overlap (not AI vibe)</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '40px' }}>
            <h3 style={{ color: p1.color, marginBottom: '24px', textAlign: 'center' }}>{p1.name} Only</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {uniqueTo1.map((n) => (
                <span key={n} className="pill" style={{ opacity: 0.7 }}>
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '40px' }}>
            <h3 style={{ color: 'white', marginBottom: '24px', textAlign: 'center' }}>Shared DNA</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {sharedNotes.length > 0 ? (
                sharedNotes.map((n) => (
                  <span key={n} className="pill gold">
                    {n}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>No shared notes</span>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ color: p2.color, marginBottom: '24px', textAlign: 'center' }}>{p2.name} Only</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {uniqueTo2.map((n) => (
                <span key={n} className="pill" style={{ opacity: 0.7 }}>
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
