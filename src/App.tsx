import { useEffect, useState, useMemo } from 'react';
import { fetchAllData, normalizeName } from './services/dataService';
import type { ProcessedDuel, Character } from './types';
import DuelList from './components/DuelList';
import ModifierDetails from './components/ModifierDetails';
import FightersModal from './components/FightersModal';
import CurrentModifiersModal from './components/CurrentModifiersModal';
import ProfileModal from './components/ProfileModal';
import { Swords, Calendar, Loader2, Users, TrendingUp, Search } from 'lucide-react';

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
  const [duelSearch, setDuelSearch] = useState('');
  const [selectedProfileName, setSelectedProfileName] = useState<string | null>(null);
  const [selectedProfileSnapshot, setSelectedProfileSnapshot] = useState<string>('current');
  const [missingCharacters, setMissingCharacters] = useState<string[]>([]);



  const handleOpenProfile = (name: string, snapshotId: string = 'current') => {
    setSelectedProfileName(name);
    setSelectedProfileSnapshot(snapshotId);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const { duels, currentDate, allFighters, missingCharacters } = await fetchAllData();
        setDuels(duels);
        setCurrentDate(currentDate);
        setAllFighters(allFighters);
        setMissingCharacters(missingCharacters);
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

  const selectedProfileCharacter = useMemo(() => {
    if (!selectedProfileName) return null;
    const targetNorm = normalizeName(selectedProfileName);
    return allFighters.find(f => normalizeName(f.fullName) === targetNorm) || null;
  }, [allFighters, selectedProfileName]);

  const filteredDuels = useMemo(() => {
    const q = duelSearch.toLowerCase().trim();
    if (!q) return duels;
    return duels.filter(d => {
      const inParticipants = d.participant1.toLowerCase().includes(q) || d.participant2.toLowerCase().includes(q);
      const inEvent = d.event.toLowerCase().includes(q);
      const inDate = d.date.toLowerCase().includes(q);
      const inOutcome = d.outcome.toLowerCase().includes(q);
      const inModifiers = [...d.p1Gained, ...d.p2Gained].some(m => m.name.toLowerCase().includes(q));
      return inParticipants || inEvent || inDate || inOutcome || inModifiers;
    });
  }, [duels, duelSearch]);

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

          {import.meta.env.DEV && missingCharacters.length > 0 && (
            <button
              onClick={() => alert(`Characters missing from Chronicle:\n\n${missingCharacters.join('\n')}`)}
              style={{ ...BTN_STYLE, color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
              className="header-button"
            >
              Missing ({missingCharacters.length})
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{currentDate}</span>
          </div>
        </div>
      </header>

      <main className="main-panel">
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <div 
            title={`${filteredDuels.length} entries filtered`}
            style={{ cursor: 'help' }}
          >
            <h2 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Chronological Duels
            </h2>
          </div>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Search participants, events, modifiers..." 
              value={duelSearch}
              onChange={e => setDuelSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>
        </div>
        <DuelList
          duels={filteredDuels}
          selectedDuelId={selectedDuelId}
          onSelectDuel={setSelectedDuelId}
        />
      </main>

      <ModifierDetails 
        duel={selectedDuel} 
        onParticipantClick={(name) => handleOpenProfile(name, selectedDuel?.id)}
      />

      <FightersModal
        isOpen={isFightersModalOpen}
        onClose={() => setIsFightersModalOpen(false)}
        fighters={allFighters}
        onParticipantClick={(name) => handleOpenProfile(name, 'starting')}
      />

      <CurrentModifiersModal
        isOpen={isCurrentModifiersOpen}
        onClose={() => setIsCurrentModifiersOpen(false)}
        fighters={allFighters}
        onParticipantClick={(name) => handleOpenProfile(name, 'current')}
      />

      <ProfileModal
        isOpen={!!selectedProfileName}
        onClose={() => setSelectedProfileName(null)}
        character={selectedProfileCharacter}
        initialSnapshotId={selectedProfileSnapshot}
      />
    </div>
  );
}

export default App;
