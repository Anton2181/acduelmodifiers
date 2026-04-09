import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface MissingCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingNames: string[];
}

const MissingCharactersModal: React.FC<MissingCharactersModalProps> = ({ isOpen, onClose, missingNames }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1200, padding: '2rem',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--panel)',
        borderRadius: '1.5rem', width: '100%', maxWidth: '500px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', border: '1px solid var(--border)',
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Missing from Chronicle</h2>
          </div>
          <button onClick={onClose} style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            The following {missingNames.length} characters are listed in the starting data but have no entries in the Chronicle:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {missingNames.map((name, i) => (
              <div key={i} style={{ 
                padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', 
                borderRadius: '0.75rem', fontSize: '0.9rem', color: '#991b1b', fontWeight: '600'
              }}>
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: '#f8fafc', textAlign: 'right' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '0.5rem 1.25rem', borderRadius: '0.75rem', background: '#dc2626', color: 'white', 
              border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.875rem'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissingCharactersModal;
