import React, { useState } from 'react';
import type { ProcessedDuel } from '../types';

interface DuelListProps {
  duels: ProcessedDuel[];
  selectedDuelId: string | null;
  onSelectDuel: (id: string) => void;
}

const StatBadge: React.FC<{ value: number; dim?: boolean }> = ({ value, dim }) => {
  if (dim) return <span className="dl-stat dl-stat--dim">{value > 0 ? `+${value}` : value}</span>;
  if (value > 0) return <span className="dl-stat dl-stat--bonus">+{value}</span>;
  if (value < 0) return <span className="dl-stat dl-stat--penalty">{value}</span>;
  return <span className="dl-stat dl-stat--zero">0</span>;
};

const GainedBadges: React.FC<{ gained: ProcessedDuel['p1Gained'] }> = ({ gained }) => (
  <div className="dl-gained-row">
    {gained.map((g, i) => (
      <span key={i} className={`dl-gained ${g.source === 'skill' ? 'dl-gained--skill' : 'dl-gained--manual'}`}>
        {g.source === 'skill' ? '🏆' : '⚡'} {g.name} {g.value > 0 ? `+${g.value}` : g.value}
      </span>
    ))}
  </div>
);

const DuelList: React.FC<DuelListProps> = ({ duels, selectedDuelId, onSelectDuel }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="scroll-area">
      {/* Header */}
      <div className="dl-header">
        <div className="dl-col--meta">Date &amp; Event</div>
        <div className="dl-col--participant">Participant</div>
        <div className="dl-col--stat">Total</div>
        <div className="dl-col--stat">Bonus</div>
        <div className="dl-col--stat">Malus</div>
        <div className="dl-col--outcome">Outcome</div>
      </div>

      {/* Rows */}
      <div className="dl-list">
        {duels.map((duel) => {
          const isSelected = selectedDuelId === duel.id;
          const isHovered = hoveredId === duel.id;

          return (
            <div
              key={duel.id}
              className={`dl-card${isSelected ? ' dl-card--selected' : ''}${isHovered && !isSelected ? ' dl-card--hovered' : ''}`}
              onClick={() => onSelectDuel(duel.id)}
              onMouseEnter={() => setHoveredId(duel.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Meta: date + event, spans both participants */}
              <div className="dl-col--meta dl-meta">
                <div className="dl-meta__date">{duel.date}</div>
                <div className="dl-meta__event">{duel.event}</div>
              </div>

              {/* Participants block */}
              <div className="dl-participants">

                {/* P1 */}
                <div className="dl-participant">
                  <div className="dl-col--participant dl-name-cell">
                    <span className={`dl-name${duel.winner === duel.participant1 ? ' dl-name--winner' : ''}`}>
                      {duel.participant1}
                    </span>
                    {duel.p1Gained.length > 0 && <GainedBadges gained={duel.p1Gained} />}
                  </div>
                  <div className="dl-col--stat"><StatBadge value={duel.p1TotalModifier} /></div>
                  <div className="dl-col--stat"><StatBadge value={duel.p1TotalBonus} dim={duel.p1TotalBonus === 0} /></div>
                  <div className="dl-col--stat"><StatBadge value={duel.p1TotalPenalty} dim={duel.p1TotalPenalty === 0} /></div>
                </div>

                {/* Divider */}
                <div className="dl-divider" />

                {/* P2 */}
                <div className="dl-participant">
                  <div className="dl-col--participant dl-name-cell">
                    <span className={`dl-name${duel.winner === duel.participant2 ? ' dl-name--winner' : ''}`}>
                      {duel.participant2 || 'Unknown'}
                    </span>
                    {duel.p2Gained.length > 0 && <GainedBadges gained={duel.p2Gained} />}
                  </div>
                  <div className="dl-col--stat"><StatBadge value={duel.p2TotalModifier} /></div>
                  <div className="dl-col--stat"><StatBadge value={duel.p2TotalBonus} dim={duel.p2TotalBonus === 0} /></div>
                  <div className="dl-col--stat"><StatBadge value={duel.p2TotalPenalty} dim={duel.p2TotalPenalty === 0} /></div>
                </div>
              </div>

              {/* Outcome */}
              <div className="dl-col--outcome dl-outcome">
                {duel.outcome}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DuelList;
