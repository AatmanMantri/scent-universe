import { useState } from 'react';
import { Sparkles, Search, GitCompare, LayoutGrid } from 'lucide-react';
import ScentUniverse from './components/ScentUniverse';
import FindSimilar from './components/FindSimilar';
import Compare from './components/Compare';
import Browse from './components/Browse';

function App() {
  const [activeTab, setActiveTab] = useState('universe');

  return (
    <div className="app-container">
      <header className="nav-header glass-nav">
        <div className="logo">
          <Sparkles className="gradient-text" size={24} />
          <span className="gradient-text">Scent Universe</span>
        </div>
        
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'universe' ? 'active' : ''}`}
            onClick={() => setActiveTab('universe')}
          >
            <Sparkles size={16} /> Universe
          </button>
          <button 
            className={`nav-tab ${activeTab === 'similar' ? 'active' : ''}`}
            onClick={() => setActiveTab('similar')}
          >
            <Search size={16} /> Find Similar
          </button>
          <button 
            className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <GitCompare size={16} /> Compare
          </button>
          <button 
            className={`nav-tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <LayoutGrid size={16} /> Browse
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'universe' && <ScentUniverse />}
        {activeTab === 'similar' && <FindSimilar />}
        {activeTab === 'compare' && <Compare />}
        {activeTab === 'browse' && <Browse />}
      </main>
    </div>
  );
}

export default App;
