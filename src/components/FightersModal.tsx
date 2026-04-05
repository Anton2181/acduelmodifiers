import React, { useState } from 'react';
import type { Character } from '../types';
import { X, Search, Trophy, Award } from 'lucide-react';

interface FightersModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighters: Character[];
}


const FightersModal: React.FC<FightersModalProps> = ({ isOpen, onClose, fighters }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredFighters = fighters
    .filter(f => {
      const q = search.toLowerCase();
      return (
        f.fullName.toLowerCase().includes(q) ||
        (f.skillBonus?.name ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

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
          <div style={{ position: 'relative' }}>
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
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredFighters.map(f => {
              const bonus = f.skillBonus;
              return (
                <div key={f.id} style={{
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  background: bonus ? 'rgba(29, 78, 216, 0.02)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>{f.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                        ID: {f.id} • BORN {f.birthYear}
                      </div>
                    </div>
                  </div>
                  {bonus ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>
                      <Trophy size={14} /> {bonus.name} {bonus.value > 0 ? `+${bonus.value}` : bonus.value}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      No starting modifiers
                    </div>
                  )}
                </div>
              );
            })}
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
