import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

function formatLabel(perfume) {
  return `${perfume.brand} — ${perfume.name}`;
}

export default function PerfumePicker({ perfumes, value, onChange, placeholder = 'Search brand or name...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = perfumes.find((p) => p.id === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return perfumes.slice(0, 40);
    return perfumes
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [perfumes, query]);

  const pick = (perfume) => {
    onChange(perfume.id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {selected && !open && (
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
          }}
        >
          Selected: <strong style={{ color: 'var(--text-primary)' }}>{formatLabel(selected)}</strong>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <Search
          style={{
            position: 'absolute',
            left: '16px',
            top: '16px',
            color: 'var(--text-secondary)',
            pointerEvents: 'none',
          }}
          size={20}
        />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>
      {open && matches.length > 0 && (
        <ul
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            maxHeight: '240px',
            overflowY: 'auto',
            listStyle: 'none',
            padding: '8px 0',
            zIndex: 20,
          }}
        >
          {matches.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onMouseDown={() => pick(p)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  border: 'none',
                  background: p.id === value ? 'rgba(184, 134, 11, 0.15)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>{p.brand}</span>
                <br />
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query && matches.length === 0 && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            padding: '12px 16px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            zIndex: 20,
          }}
        >
          No matches
        </div>
      )}
    </div>
  );
}
