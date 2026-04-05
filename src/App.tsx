import { useEffect, useState, useMemo } from 'react';
import { fetchAllData } from './services/dataService';
import type { ProcessedDuel, Character } from './types';
import DuelList from './components/DuelList';
import ModifierDetails from './components/ModifierDetails';
import FightersModal from './components/FightersModal';
import CurrentModifiersModal from './components/CurrentModifiersModal';
import { Swords, Calendar, Loader2, Users, TrendingUp } from 'lucide-react';

const BTN_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--border)',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '600',
  boxShadow: 'var(--shadow)',
  transition: 'all 0.2s',
} as const;

function App() {
  const [duels, setDuels] = useState<ProcessedDuel[]>([]);
  const [allFighters, setAllFighters] = useState<Character[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuelId, setSelectedDuelId] = useState<string | null>(null);
  const [isFightersModalOpen, setIsFightersModalOpen] = useState(false);
  const [isCurrentModifiersOpen, setIsCurrentModifiersOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { duels, currentDate, allFighters } = await fetchAllData();
        setDuels(duels);
        setCurrentDate(currentDate);
        setAllFighters(allFighters);
        if (duels.length > 0) {
          setSelectedDuelId(duels[0].id);
        }
      } catch (err) {
        setError('Failed to fetch duel data. Please check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedDuel = useMemo(() => {
    return duels.find(d => d.id === selectedDuelId) || null;
  }, [duels, selectedDuelId]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
        <Loader2 className="animate-spin" size={48} />
        <p>Loading duel data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: 'var(--secondary)' }}>
        <Swords size={48} />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', background: 'var(--surface)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>AC DUEL MODIFIERS</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsFightersModalOpen(true)}
            style={BTN_STYLE}
            className="header-button"
          >
            <Users size={18} style={{ color: 'var(--primary)' }} />
            Starting Modifiers
          </button>

          <button
            onClick={() => setIsCurrentModifiersOpen(true)}
            style={BTN_STYLE}
            className="header-button"
          >
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            Current Modifiers
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{currentDate}</span>
          </div>
        </div>
      </header>

      <main className="main-panel">
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-dim)' }}>CHRONOLOGICAL DUELS</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{duels.length} entries filtered</span>
        </div>
        <DuelList
          duels={duels}
          selectedDuelId={selectedDuelId}
          onSelectDuel={setSelectedDuelId}
        />
      </main>

      <ModifierDetails duel={selectedDuel} />

      <FightersModal
        isOpen={isFightersModalOpen}
        onClose={() => setIsFightersModalOpen(false)}
        fighters={allFighters}
      />

      <CurrentModifiersModal
        isOpen={isCurrentModifiersOpen}
        onClose={() => setIsCurrentModifiersOpen(false)}
        fighters={allFighters}
      />
    </div>
  );
}

export default App;
