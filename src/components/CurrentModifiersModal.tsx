import React, { useState } from 'react';
import type { Character, Modifier } from '../types';
import { X, Search, Shield, TrendingUp } from 'lucide-react';

interface CurrentModifiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighters: Character[];
  onParticipantClick: (name: string) => void;
}

const ModifierRow: React.FC<{ modifier: Modifier }> = ({ modifier: m }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0.75rem',
    borderRadius: '0.5rem',
    background: m.isOverridden ? '#f8fafc' : (m.type === 'bonus' ? 'rgba(22,163,74,0.05)' : 'rgba(220,38,38,0.05)'),
    opacity: m.isOverridden ? 0.5 : 1,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: m.isOverridden ? '#94a3b8' : (m.type === 'bonus' ? '#16a34a' : '#dc2626'),
      }} />
      <span style={{
        fontSize: '0.8rem', fontWeight: '500',
        textDecoration: m.isOverridden ? 'line-through' : 'none',
        color: m.isOverridden ? 'var(--text-dim)' : 'var(--text)',
      }}>
        {m.name}
        {m.isOverridden && (
          <span style={{ marginLeft: '0.4rem', fontSize: '0.6rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
            OVERRIDDEN
          </span>
        )}
      </span>
    </div>
    <span style={{
      fontSize: '0.875rem', fontWeight: '700',
      color: m.isOverridden ? '#94a3b8' : (m.type === 'bonus' ? '#16a34a' : '#dc2626'),
      textDecoration: m.isOverridden ? 'line-through' : 'none',
    }}>
      {m.value > 0 ? `+${m.value}` : m.value}
    </span>
  </div>
);

const CurrentModifiersModal: React.FC<CurrentModifiersModalProps> = ({ isOpen, onClose, fighters, onParticipantClick }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const active = fighters
    .filter(f => {
      const hasContent = (f.currentModifiers?.length ?? 0) > 0;
      if (!hasContent) return false;
      const q = search.toLowerCase();
      return (
        f.fullName.toLowerCase().includes(q) ||
        (f.currentModifiers ?? []).some(m => m.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (b.currentTotal ?? 0) - (a.currentTotal ?? 0));

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
          <div style={{ position: 'relative' }}>
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
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
            {active.map(f => {
              const mods = f.currentModifiers ?? [];
              const total = f.currentTotal ?? 0;
              return (
                <div key={f.id} style={{
                  borderRadius: '1rem', border: '1px solid var(--border)',
                  overflow: 'hidden',
                  background: total > 0 ? 'rgba(29,78,216,0.02)' : total < 0 ? 'rgba(220,38,38,0.02)' : 'transparent',
                  cursor: 'pointer', transition: 'box-shadow 0.2s',
                }}
                className="header-button"
                onClick={() => {
                  onParticipantClick(f.fullName);
                  onClose();
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{f.fullName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                        ID: {f.id} • BORN {f.birthYear} • {f.totalDuels ?? 0} DUEL{(f.totalDuels ?? 0) !== 1 && 'S'} ({f.totalWins ?? 0} WON)
                      </div>
                    </div>
                    <div style={{
                      background: total > 0 ? '#f0fdf4' : total < 0 ? '#fef2f2' : '#f8fafc',
                      border: `1px solid ${total > 0 ? '#dcfce7' : total < 0 ? '#fee2e2' : 'var(--border)'}`,
                      borderRadius: '0.75rem', padding: '0.4rem 0.75rem', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: total > 0 ? '#16a34a' : total < 0 ? '#dc2626' : 'var(--text)' }}>
                        {total > 0 ? `+${total}` : total}
                      </div>
                    </div>
                  </div>
                  {/* Modifiers */}
                  <div style={{ padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {mods.map((m, i) => <ModifierRow key={i} modifier={m} />)}
                  </div>
                </div>
              );
            })}
            {active.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                <Shield size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
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
