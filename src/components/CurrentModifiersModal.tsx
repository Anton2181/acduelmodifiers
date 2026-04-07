import React, { useState } from 'react';
import type { Character, Modifier } from '../types';
import { X, Search, Shield, TrendingUp } from 'lucide-react';

interface CurrentModifiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighters: Character[];
  onParticipantClick: (name: string) => void;
}

const ModifierPill: React.FC<{ modifier: Modifier }> = ({ modifier: m }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: m.isOverridden ? '#f8fafc' : (m.type === 'bonus' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)'),
    color: m.isOverridden ? 'var(--text-dim)' : (m.type === 'bonus' ? '#16a34a' : '#dc2626'),
    border: `1px solid ${m.isOverridden ? 'var(--border)' : (m.type === 'bonus' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)')}`,
    opacity: m.isOverridden ? 0.6 : 1,
    textDecoration: m.isOverridden ? 'line-through' : 'none',
  }}>
    {m.name} {m.value > 0 ? `+${m.value}` : m.value}
  </div>
);

const CurrentModifiersModal: React.FC<CurrentModifiersModalProps> = ({ isOpen, onClose, fighters, onParticipantClick }) => {
  const [search, setSearch] = useState('');
  const [showDead, setShowDead] = useState(true);
  const [showNoncombatants, setShowNoncombatants] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'total', direction: 'desc' });

  if (!isOpen) return null;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const active = fighters
    .filter(f => {
      const isDead = f.isDead;
      const isNoncombatant = !f.skillBonus && (f.totalDuels ?? 0) === 0;

      if (!showDead && isDead) return false;
      if (!showNoncombatants && isNoncombatant) return false;

      const q = search.toLowerCase();
      return (
        f.fullName.toLowerCase().includes(q) ||
        (f.currentModifiers ?? []).some(m => m.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let aVal: any = 0;
      let bVal: any = 0;

      if (sortConfig.key === 'id') { aVal = a.id; bVal = b.id; }
      if (sortConfig.key === 'name') { aVal = a.fullName; bVal = b.fullName; }
      if (sortConfig.key === 'total') { aVal = a.currentTotal ?? 0; bVal = b.currentTotal ?? 0; }
      if (sortConfig.key === 'age') { 
        aVal = a.snapshots?.[a.snapshots.length - 1]?.age ?? 0;
        bVal = b.snapshots?.[b.snapshots.length - 1]?.age ?? 0;
      }
      if (sortConfig.key === 'duels') { aVal = a.totalDuels ?? 0; bVal = b.totalDuels ?? 0; }
      if (sortConfig.key === 'wins') { aVal = a.totalWins ?? 0; bVal = b.totalWins ?? 0; }

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
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, padding: '2rem',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--panel)',
        borderRadius: '1.5rem', width: '100%', maxWidth: '900px',
        maxHeight: '85vh', boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', border: '1px solid var(--border)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrendingUp className="text-primary" size={22} style={{ color: 'var(--primary)' }} /> Current Modifiers
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>All active bonuses and penalties at the current date</p>
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
                placeholder="Search combatants..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
                  borderRadius: '0.75rem', border: '1px solid var(--border)',
                  fontSize: '1rem', outline: 'none', fontFamily: 'inherit',
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
                  <th onClick={() => handleSort('age')} className={sortConfig.key === 'age' ? 'active-sort' : ''}>Age{renderSortIndicator('age')}</th>
                  <th onClick={() => handleSort('duels')} className={sortConfig.key === 'duels' ? 'active-sort' : ''}>Duels{renderSortIndicator('duels')}</th>
                  <th onClick={() => handleSort('wins')} className={sortConfig.key === 'wins' ? 'active-sort' : ''}>Wins{renderSortIndicator('wins')}</th>
                  <th>Active Modifiers</th>
                  <th onClick={() => handleSort('total')} className={sortConfig.key === 'total' ? 'active-sort' : ''}>Combat Total{renderSortIndicator('total')}</th>
                </tr>
              </thead>
              <tbody>
                {active.map(f => {
                  const mods = f.currentModifiers ?? [];
                  const total = f.currentTotal ?? 0;
                  const age = f.snapshots?.[f.snapshots.length - 1]?.age ?? '?';
                  return (
                    <tr key={f.id} onClick={() => { onParticipantClick(f.fullName); onClose(); }} style={{ opacity: f.isDead ? 0.65 : 1, filter: f.isDead ? 'grayscale(0.8)' : 'none' }}>
                      <td style={{ color: 'var(--text-dim)' }}>{f.id}</td>
                      <td><span style={{ fontWeight: '700' }}>{f.fullName}</span>{f.isDead && <span title={`Died at age ${f.ageFromSheet}`} style={{ marginLeft: '0.4rem', filter: 'grayscale(1)', opacity: 0.7, cursor: 'help' }}>💀</span>}</td>
                      <td style={{ color: 'var(--text-dim)' }}>{age}</td>
                      <td style={{ color: 'var(--text-dim)' }}>{f.totalDuels ?? 0}</td>
                      <td style={{ color: '#16a34a', fontWeight: '700' }}>{f.totalWins ?? 0}</td>
                      <td>
                        {mods.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {mods.map((m, i) => <ModifierPill key={i} modifier={m} />)}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', padding: '0.2rem 0',
                          borderRadius: '0.5rem', fontWeight: '800', 
                          background: total > 0 ? '#f0fdf4' : total < 0 ? '#fef2f2' : '#f8fafc',
                          color: total > 0 ? '#16a34a' : total < 0 ? '#dc2626' : 'var(--text-dim)',
                          border: `1px solid ${total > 0 ? '#dcfce7' : total < 0 ? '#fee2e2' : 'var(--border)'}`
                        }}>
                          {total > 0 ? `+${total}` : total}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {active.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                <Shield size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                <p>No modifiers found for "{search}"</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border)', background: '#f8fafc', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Showing {active.length} combatants with active modifiers. Sorted by total modifier.
        </div>
      </div>
    </div>
  );
};

export default CurrentModifiersModal;
