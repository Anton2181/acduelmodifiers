import React from 'react';
import type { ProcessedDuel, Modifier, GainedModifier } from '../types';
import { Swords, Shield, Info, Star } from 'lucide-react';

interface ModifierDetailsProps {
  duel: ProcessedDuel | null;
  onParticipantClick: (name: string) => void;
}

const ParticipantPanel: React.FC<{ name: string; age: number | null; isDead?: boolean; modifiers: Modifier[]; total: number; gained: GainedModifier[]; duelsFought: number; duelsWon: number; onClick: () => void }> = ({ name, age, isDead, modifiers, total, gained, duelsFought, duelsWon, onClick }) => {
  return (
    <div className="modifier-card header-button" style={{ 
      cursor: 'pointer', transition: 'all 0.2s', padding: '1.5rem', width: '100%', boxSizing: 'border-box',
      opacity: isDead ? 0.7 : 1,
      filter: isDead ? 'grayscale(0.8)' : 'none'
    }} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '1.4rem', 
            fontWeight: '800', 
            lineHeight: 1.1,
            color: 'var(--text)', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {name || 'Unknown'}
            {isDead && <span title="Deceased" style={{ filter: 'grayscale(1)', opacity: 0.8, fontSize: '1.2rem', cursor: 'help' }}>💀</span>}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <span style={{ 
              fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', 
              background: '#f8fafc', padding: '0.2rem 0.5rem', 
              borderRadius: '0.35rem', border: '1px solid var(--border)',
              letterSpacing: '0.02em'
            }}>
              AGE {age ?? '?'}
            </span>
            <span style={{ 
              fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', 
              background: '#f8fafc', padding: '0.2rem 0.5rem', 
              borderRadius: '0.35rem', border: '1px solid var(--border)',
              letterSpacing: '0.02em'
            }}>
              {duelsFought} DUEL{duelsFought !== 1 && 'S'} ({duelsWon} WON)
            </span>
          </div>
        </div>
        <div style={{ 
          flexShrink: 0,
          background: total > 0 ? '#f0fdf4' : total < 0 ? '#fef2f2' : '#f8fafc', 
          border: '1px solid',
          borderColor: total > 0 ? '#dcfce7' : total < 0 ? '#fee2e2' : 'var(--border)',
           borderRadius: '0.75rem',
          padding: '0.6rem 0.8rem',
          textAlign: 'center',
          minWidth: '64px'
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: total > 0 ? '#15803d' : total < 0 ? '#b91c1c' : 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.1rem', letterSpacing: '0.05em' }}>Total</div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '900', 
            color: total > 0 ? '#16a34a' : total < 0 ? '#dc2626' : 'var(--text)' 
          }}>
            {total > 0 ? `+${total}` : total}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--primary)', 
          fontSize: '0.75rem', 
          fontWeight: '700', 
          letterSpacing: '0.05em', 
          textTransform: 'uppercase' 
        }}>
          <Shield size={16} />
          Active Modifiers
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {modifiers.length === 0 ? (
            <div style={{ 
              padding: '1.5rem', 
              background: '#f8fafc', 
              borderRadius: '1rem', 
              border: '1px dashed var(--border)',
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontSize: '0.875rem'
            }}>
              No active penalties or bonuses
            </div>
          ) : (
            modifiers.map((m, i) => (
              <div key={i} className="modifier-detail-item" style={{ opacity: m.isOverridden ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: m.isOverridden ? '#94a3b8' : (m.type === 'penalty' ? '#dc2626' : '#16a34a') 
                  }} />
                  <span style={{ 
                    fontSize: '0.925rem', 
                    fontWeight: '500',
                    textDecoration: m.isOverridden ? 'line-through' : 'none'
                  }}>
                    {m.name}
                  </span>
                  {m.isOverridden && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      OVERRIDDEN
                    </span>
                  )}
                </div>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  color: m.isOverridden ? '#94a3b8' : (m.type === 'penalty' ? '#dc2626' : '#16a34a'),
                  textDecoration: m.isOverridden ? 'line-through' : 'none'
                }}>
                  {m.value > 0 ? `+${m.value}` : m.value}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {gained.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Star size={14} />
            Gained This Duel
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {gained.map((g, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 1rem',
                borderRadius: '0.75rem',
                background: g.source === 'skill' ? '#fffbeb' : '#fef2f2',
                border: `1px solid ${g.source === 'skill' ? '#fde68a' : '#fecaca'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>{g.source === 'skill' ? '🏆' : '⚡'}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: g.source === 'skill' ? '#92400e' : '#991b1b' }}>
                    {g.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: g.value >= 0 ? '#16a34a' : '#dc2626' }}>
                  {g.value > 0 ? `+${g.value}` : g.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {modifiers.some(m => m.isOverridden) && (
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          <Info size={14} />
          Only the highest bonus applies.
        </div>
      )}
    </div>
  );
};

const ModifierDetails: React.FC<ModifierDetailsProps> = ({ duel, onParticipantClick }) => {
  if (!duel) {
    return (
      <div className="side-panels">
        <div className="modifier-card" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--bg)', 
            borderRadius: '50%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            color: 'var(--text-dim)'
          }}>
            <Swords size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Chamber of Valor</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', maxWidth: '240px' }}>
            Select a duel from the chronicle to inspect combatants and their active modifiers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="side-panels">
      <ParticipantPanel 
        name={duel.participant1} 
        age={duel.p1Age} 
        isDead={duel.p1IsDead}
        modifiers={duel.p1Modifiers} 
        total={duel.p1TotalModifier}
        gained={duel.p1Gained}
        duelsFought={duel.p1DuelsFought}
        duelsWon={duel.p1DuelsWon}
        onClick={() => onParticipantClick(duel.participant1)}
      />
      <ParticipantPanel 
        name={duel.participant2} 
        age={duel.p2Age} 
        isDead={duel.p2IsDead}
        modifiers={duel.p2Modifiers} 
        total={duel.p2TotalModifier}
        gained={duel.p2Gained}
        duelsFought={duel.p2DuelsFought}
        duelsWon={duel.p2DuelsWon}
        onClick={() => onParticipantClick(duel.participant2)}
      />
    </div>
  );
};

export default ModifierDetails;
