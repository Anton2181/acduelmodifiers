import React, { useState } from 'react';
import type { Character } from '../types';
import { X, Search, Trophy, Award } from 'lucide-react';

interface FightersModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighters: Character[];
  onParticipantClick: (name: string) => void;
}


const FightersModal: React.FC<FightersModalProps> = ({ isOpen, onClose, fighters, onParticipantClick }) => {
  const [search, setSearch] = useState('');
  const [showDead, setShowDead] = useState(true);
  const [showNoncombatants, setShowNoncombatants] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'id', direction: 'asc' });

  if (!isOpen) return null;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredFighters = fighters
    .filter(f => {
      const isDead = f.isDead;
      const isNoncombatant = !f.skillBonus && (f.totalDuels ?? 0) === 0;

      if (!showDead && isDead) return false;
      if (!showNoncombatants && isNoncombatant) return false;

      const q = search.toLowerCase();
      return (
        f.fullName.toLowerCase().includes(q) ||
        (f.skillBonus?.name ?? '').toLowerCase().includes(q) ||
        f.id.toString() === q
      );
    })
    .sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof typeof a];
      let bVal: any = b[sortConfig.key as keyof typeof b];

      if (sortConfig.key === 'startingBonus') {
        aVal = a.skillBonus?.value ?? -999; // Treat "no bonus" as very low
        bVal = b.skillBonus?.value ?? -999;
      }
      if (sortConfig.key === 'name') {
        aVal = a.fullName;
        bVal = b.fullName;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const renderSortIndicator = (key: string) => {
    if (sortConfig.key === key) return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    return '';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '2rem',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--panel)',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '80vh',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Award className="text-primary" /> Starting Modifiers
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Directory of combatants and their starting prowess bonuses</p>
          </div>
          <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '1rem 2rem', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Search by name or house..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-dim)', cursor: 'pointer', fontWeight: '600' }}>
              <input type="checkbox" checked={showDead} onChange={e => setShowDead(e.target.checked)} style={{ cursor: 'pointer' }} />
              Show Dead
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-dim)', cursor: 'pointer', fontWeight: '600' }}>
              <input type="checkbox" checked={showNoncombatants} onChange={e => setShowNoncombatants(e.target.checked)} style={{ cursor: 'pointer' }} />
              Show All Characters
            </label>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className={sortConfig.key === 'id' ? 'active-sort' : ''}>ID{renderSortIndicator('id')}</th>
                  <th onClick={() => handleSort('name')} className={sortConfig.key === 'name' ? 'active-sort' : ''}>Name{renderSortIndicator('name')}</th>
                  <th onClick={() => handleSort('birthYear')} className={sortConfig.key === 'birthYear' ? 'active-sort' : ''}>Birth Year{renderSortIndicator('birthYear')}</th>
                  <th onClick={() => handleSort('startingBonus')} className={sortConfig.key === 'startingBonus' ? 'active-sort' : ''}>Starting Bonus{renderSortIndicator('startingBonus')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredFighters.map(f => {
                  const bonus = f.skillBonus;
                  return (
                    <tr key={f.id} onClick={() => { onParticipantClick(f.fullName); }} style={{ opacity: f.isDead ? 0.65 : 1, filter: f.isDead ? 'grayscale(0.8)' : 'none' }}>
                      <td style={{ color: 'var(--text-dim)' }}>{f.id}</td>
                      <td><span style={{ fontWeight: '700' }}>{f.fullName}</span>{f.isDead && <span title={`Died at age ${f.ageFromSheet}`} style={{ marginLeft: '0.4rem', filter: 'grayscale(1)', opacity: 0.7, cursor: 'help' }}>💀</span>}</td>
                      <td style={{ color: 'var(--text-dim)' }}>{f.birthYear}</td>
                      <td>
                        {bonus ? (
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            color: '#16a34a', 
                            fontWeight: '700', 
                            fontSize: '0.75rem', 
                            background: 'rgba(22, 163, 74, 0.08)', 
                            padding: '0.15rem 0.65rem', 
                            borderRadius: '1rem', 
                            border: '1px solid rgba(22, 163, 74, 0.2)' 
                          }}>
                            <Trophy size={12} /> {bonus.name} {bonus.value > 0 ? `+${bonus.value}` : bonus.value}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border)', background: '#f8fafc', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Showing {filteredFighters.length} fighters found in the chronicle. Starting modifiers are fixed at career onset.
        </div>
      </div>
    </div>
  );
};

export default FightersModal;
