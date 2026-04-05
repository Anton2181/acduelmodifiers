import React, { useState } from 'react';
import type { ProcessedDuel } from '../types';

interface DuelListProps {
  duels: ProcessedDuel[];
  selectedDuelId: string | null;
  onSelectDuel: (id: string) => void;
}

const HOVER_BG = 'rgba(241, 245, 249, 0.8)';

const DuelList: React.FC<DuelListProps> = ({ duels, selectedDuelId, onSelectDuel }) => {
  // Track which participant slot is hovered: `${duelId}-p1` or `${duelId}-p2`
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  return (
    <div className="scroll-area">
      <table className="duel-list">
        <thead>
          <tr>
            <th className="duel-cell" style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Date & Chronicle</th>
            <th className="duel-cell" style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Participant</th>
            <th className="duel-cell" style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Total</th>
            <th className="duel-cell" style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Bonus (+)</th>
            <th className="duel-cell" style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Malus (-)</th>
            <th className="duel-cell" style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Final Outcome</th>
          </tr>
        </thead>
        <tbody>
          {duels.map((duel) => (
            <React.Fragment key={duel.id}>
              {/* Row 1: Participant 1 */}
              {(() => {
                const hoverProps = (slot: string) => ({
                  onMouseEnter: () => setHoveredSlot(slot),
                  onMouseLeave: () => setHoveredSlot(null),
                });
                const cellHoverStyle = (slot: string) =>
                  hoveredSlot === slot ? { background: HOVER_BG } : {};
                const isSelected = selectedDuelId === duel.id;
                return (
                  <>
                    <tr
                      className={`duel-row-group ${isSelected ? 'selected row-1' : ''}`}
                      onClick={() => onSelectDuel(duel.id)}
                    >
                      {/* Date — spanned, no hover handler */}
                      <td className="duel-cell" rowSpan={2} style={{ verticalAlign: 'top' }}>
                        <div className="duel-row-1">{duel.date}</div>
                        <div className="duel-row-2">{duel.event}</div>
                      </td>
                      <td className="duel-cell" style={cellHoverStyle(`${duel.id}-p1`)} {...hoverProps(`${duel.id}-p1`)}>
                        <div className="duel-row-1">
                          {duel.winner === duel.participant1 ? (
                            <span className="status-badge status-winner" style={{ fontSize: '0.85rem' }}>{duel.participant1}</span>
                          ) : (
                            duel.participant1
                          )}
                        </div>
                        {duel.p1Gained.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                            {duel.p1Gained.map((g, i) => (
                              <span key={i} className={`gained-badge ${g.source === 'skill' ? 'gained-skill' : 'gained-manual'}`}>
                                {g.source === 'skill' ? '🏆' : '⚡'} {g.name} {g.value > 0 ? `+${g.value}` : g.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="duel-cell" style={{ textAlign: 'center', ...cellHoverStyle(`${duel.id}-p1`) }} {...hoverProps(`${duel.id}-p1`)}>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: duel.p1TotalModifier > 0 ? '#16a34a' : duel.p1TotalModifier < 0 ? '#dc2626' : 'var(--text)' }}>
                          {duel.p1TotalModifier > 0 ? `+${duel.p1TotalModifier}` : duel.p1TotalModifier}
                        </span>
                      </td>
                      <td className="duel-cell" style={{ textAlign: 'center', ...cellHoverStyle(`${duel.id}-p1`) }} {...hoverProps(`${duel.id}-p1`)}>
                        {duel.p1TotalBonus > 0 ? (
                          <span style={{ color: '#16a34a', fontWeight: '700' }}>+{duel.p1TotalBonus}</span>
                        ) : <span className="duel-row-2">0</span>}
                      </td>
                      <td className="duel-cell" style={{ textAlign: 'center', ...cellHoverStyle(`${duel.id}-p1`) }} {...hoverProps(`${duel.id}-p1`)}>
                        {duel.p1TotalPenalty < 0 ? (
                          <span style={{ color: '#dc2626', fontWeight: '700' }}>{duel.p1TotalPenalty}</span>
                        ) : <span className="duel-row-2">0</span>}
                      </td>
                      {/* Outcome — spanned, no hover handler */}
                      <td className="duel-cell" rowSpan={2} style={{ verticalAlign: 'top' }}>
                        <div className="duel-row-2" style={{ maxWidth: '280px' }}>
                          {duel.outcome}
                        </div>
                      </td>
                    </tr>
                    {/* Row 2: Participant 2 */}
                    <tr
                      className={`duel-row-group ${isSelected ? 'selected row-2' : ''}`}
                      onClick={() => onSelectDuel(duel.id)}
                    >
                      <td className="duel-cell" style={cellHoverStyle(`${duel.id}-p2`)} {...hoverProps(`${duel.id}-p2`)}>
                        <div className="duel-row-1">
                          {duel.winner === duel.participant2 ? (
                            <span className="status-badge status-winner" style={{ fontSize: '0.85rem' }}>{duel.participant2 || 'Unknown'}</span>
                          ) : (
                            duel.participant2 || 'Unknown'
                          )}
                        </div>
                        {duel.p2Gained.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                            {duel.p2Gained.map((g, i) => (
                              <span key={i} className={`gained-badge ${g.source === 'skill' ? 'gained-skill' : 'gained-manual'}`}>
                                {g.source === 'skill' ? '🏆' : '⚡'} {g.name} {g.value > 0 ? `+${g.value}` : g.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="duel-cell" style={{ textAlign: 'center', ...cellHoverStyle(`${duel.id}-p2`) }} {...hoverProps(`${duel.id}-p2`)}>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: duel.p2TotalModifier > 0 ? '#16a34a' : duel.p2TotalModifier < 0 ? '#dc2626' : 'var(--text)' }}>
                          {duel.p2TotalModifier > 0 ? `+${duel.p2TotalModifier}` : duel.p2TotalModifier}
                        </span>
                      </td>
                      <td className="duel-cell" style={{ textAlign: 'center', ...cellHoverStyle(`${duel.id}-p2`) }} {...hoverProps(`${duel.id}-p2`)}>
                        {duel.p2TotalBonus > 0 ? (
                          <span style={{ color: '#16a34a', fontWeight: '700' }}>+{duel.p2TotalBonus}</span>
                        ) : <span className="duel-row-2">0</span>}
                      </td>
                      <td className="duel-cell" style={{ textAlign: 'center', ...cellHoverStyle(`${duel.id}-p2`) }} {...hoverProps(`${duel.id}-p2`)}>
                        {duel.p2TotalPenalty < 0 ? (
                          <span style={{ color: '#dc2626', fontWeight: '700' }}>{duel.p2TotalPenalty}</span>
                        ) : <span className="duel-row-2">0</span>}
                      </td>
                    </tr>
                  </>
                );
              })()}
              {/* Spacer Row */}
              <tr className="duel-spacer"><td colSpan={6}></td></tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DuelList;
