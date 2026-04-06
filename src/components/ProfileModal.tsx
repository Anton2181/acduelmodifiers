import React, { useState, useEffect } from 'react';
import type { Character } from '../types';
import { X, User, Trophy, Target, ShieldCheck, ChevronRight } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
  initialSnapshotId?: string;
}

const ProgressBar = ({ current, max, label }: { current: number; max: number; label: string }) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  const isComplete = current >= max;
  
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: '600', color: isComplete ? '#15803d' : 'var(--text-dim)' }}>
        <span>{label}</span>
        <span>{Math.min(current, max)} / {max}</span>
      </div>
      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          background: isComplete ? '#22c55e' : 'var(--primary)', 
          width: `${percent}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

const BooleanRequirement = ({ isMet, label }: { isMet: boolean; label: string }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: isMet ? '#15803d' : 'var(--text-dim)' }}>
      <div style={{ 
        width: '16px', height: '16px', borderRadius: '50%', 
        background: isMet ? '#22c55e' : '#cbd5e1', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {isMet && <ChevronRight size={12} color="white" />}
      </div>
      {label}
    </div>
  );
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, character, initialSnapshotId = 'current' }) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(initialSnapshotId);

  useEffect(() => {
    if (isOpen) {
      setSelectedSnapshotId(initialSnapshotId);
    }
  }, [isOpen, character, initialSnapshotId]);

  if (!isOpen || !character) return null;

  const snapshots = character.snapshots || [];
  const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId) || snapshots[snapshots.length - 1];

  if (!selectedSnapshot) return null;

  const h = selectedSnapshot.history;
  const mods = selectedSnapshot.modifiers;
  const total = selectedSnapshot.totalModifier;
  const currentAge = selectedSnapshot.age;
  const effSkillMod = mods.find(m => m.source === 'skill' && !m.isOverridden);
  const effSkillLevel = effSkillMod?.value ?? 0;
  const effSkillName = effSkillMod?.name;

  const hasTier = (tierVal: number, specificNames: string[]) => {
    if (effSkillLevel > tierVal) return true;
    if (effSkillLevel === tierVal && effSkillName) return specificNames.includes(effSkillName);
    return false;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1100, padding: '2rem',
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: 'var(--bg)',
        borderRadius: '1.5rem', width: '100%', maxWidth: '1000px',
        maxHeight: '90vh', boxShadow: 'var(--shadow-xl)',
        display: 'flex', overflow: 'hidden', border: '1px solid var(--border)',
      }} onClick={e => e.stopPropagation()}>
        
        {/* Left Column: Standard Data */}
        <div style={{ 
          width: '320px', 
          background: 'var(--panel)', 
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '2rem' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '1rem', 
              background: 'rgba(29, 78, 216, 0.05)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(29, 78, 216, 0.1)', marginBottom: '1.5rem'
            }}>
              <User size={32} />
            </div>
            
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.1, color: 'var(--text)', marginBottom: '0.25rem' }}>
              {character.fullName}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '1.5rem' }}>
              ID: {character.id} • BORN {character.birthYear}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Viewing Timepoint</label>
              <select 
                value={selectedSnapshotId}
                onChange={e => setSelectedSnapshotId(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.75rem', borderRadius: '0.75rem', 
                  border: '1px solid var(--border)', background: 'white',
                  fontSize: '0.9rem', color: 'var(--text)', fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {snapshots.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '700' }}>AGE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{currentAge ?? '?'}</div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '700' }}>DUELS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{h?.totalDuels ?? 0}</div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '700' }}>WINS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a' }}>{h?.totalWins ?? 0}</div>
              </div>
            </div>

            <div style={{ 
              background: total > 0 ? '#f0fdf4' : total < 0 ? '#fef2f2' : '#f8fafc', 
              border: `1px solid ${total > 0 ? '#dcfce7' : total < 0 ? '#fee2e2' : 'var(--border)'}`,
              borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Combat Total</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: total > 0 ? '#16a34a' : total < 0 ? '#dc2626' : 'var(--text)', lineHeight: 1 }}>
                {total > 0 ? `+${total}` : total}
              </div>
            </div>

            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck size={16} /> ACTIVE MODIFIERS
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mods.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No active modifiers.</div>
              ) : (
                mods.map((m, i) => (
                  <div key={i} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem',
                    border: '1px solid var(--border)', opacity: m.isOverridden ? 0.5 : 1
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', textDecoration: m.isOverridden ? 'line-through' : 'none' }}>
                      {m.name} {m.isOverridden && '(Overridden)'}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: m.value > 0 ? '#16a34a' : '#dc2626' }}>
                      {m.value > 0 ? `+${m.value}` : m.value}
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Progression Tracker */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target size={20} className="text-primary" /> Skill Progression
            </h2>
            <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: 'var(--bg)' }}>
            {!h ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem' }}>No combat history available.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                
                {/* Tier 1 */}
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#b45309' }}>Proven Duelist</div>
                    <div style={{ background: '#fef3c7', color: '#d97706', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}>+1</div>
                  </div>
                  <BooleanRequirement isMet={hasTier(1, ['Proven Duelist']) || h.hasWonNoPenaltyAgainstPrimary} label="Win vs primary character (No penalties)" />
                </div>

                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#b45309' }}>Experienced Duelist</div>
                    <div style={{ background: '#fef3c7', color: '#d97706', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}>+1</div>
                  </div>
                  <ProgressBar current={hasTier(1, ['Experienced Duelist']) ? 6 : h.totalDuels} max={6} label="Fight 6 duels total" />
                </div>

                {/* Tier 2 */}
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#4338ca' }}>Good Duelist</div>
                    <div style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}>+2</div>
                  </div>
                  <BooleanRequirement isMet={hasTier(2, ['Good Duelist']) || (h.winsAgainstSkillLevel.get(1) ?? 0) > 0} label="Win vs +1 level primary opponent" />
                </div>

                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#4338ca' }}>Veteran Duelist</div>
                    <div style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}>+2</div>
                  </div>
                  <ProgressBar current={hasTier(2, ['Veteran Duelist']) ? 6 : h.winsAgainstPrimary} max={6} label="Win 6 duels vs primary characters" />
                </div>

                {/* Tier 3 */}
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#BE185D' }}>Superior Duelist</div>
                    <div style={{ background: '#FCE7F3', color: '#DB2777', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}>+3</div>
                  </div>
                  <ProgressBar current={effSkillLevel >= 3 ? 6 : h.distinctPrimaryOpponentsDueled.size} max={6} label="Fight 6 distinct primary opponents" />
                  <BooleanRequirement isMet={effSkillLevel >= 3 || (h.winsAgainstSkillLevel.get(2) ?? 0) > 0} label="Win vs +2 level primary opponent" />
                </div>

                {/* Tier 4 */}
                <div style={{ background: '#fdf2f8', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #fbcfe8', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#9d174d' }}>Expert Duelist</div>
                    <div style={{ background: '#fce7f3', color: '#be185d', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}>+4</div>
                  </div>
                  <ProgressBar current={effSkillLevel >= 4 ? 12 : h.distinctPrimaryOpponentsDueled.size} max={12} label="Fight 12 distinct primary opponents" />
                  <BooleanRequirement isMet={effSkillLevel >= 4 || (h.winsAgainstSkillLevel.get(3) ?? 0) > 0} label="Win vs +3 level primary opponent" />
                </div>

                {/* Tier 5 */}
                <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #fde68a', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Trophy size={20} /> Master Duelist
                    </div>
                    <div style={{ background: '#fef3c7', color: '#d97706', fontWeight: '900', padding: '0.2rem 0.75rem', borderRadius: '0.5rem', fontSize: '1rem' }}>+5</div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '1rem' }}>Master duelists also negate age-based maluses up to -5.</p>
                  <ProgressBar current={effSkillLevel >= 5 ? 24 : h.distinctPrimaryOpponentsDueled.size} max={24} label="Fight 24 distinct primary opponents" />
                  <BooleanRequirement isMet={effSkillLevel >= 5 || (h.winsAgainstSkillLevel.get(4) ?? 0) > 0} label="Win vs +4 level primary opponent" />
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
