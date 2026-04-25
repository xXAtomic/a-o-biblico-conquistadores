import React from 'react';
import './AchievementModal.css';

const AchievementModal = ({ logro, onClose }) => {
  if (!logro) return null;

  return (
    <div className="modal-overlay">
      <div className="achievement-card glass-card animate-pop-in">
        <div className="achievement-glow" style={{ background: `radial-gradient(circle, ${logro.color}33 0%, transparent 70%)` }}></div>
        
        <div className="badge-container">
          <div className="badge-circle" style={{ borderColor: logro.color, overflow: 'hidden' }}>
            {logro.imagen ? (
              <img src={logro.imagen} alt={logro.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="badge-initial">{logro.nombre[0]}</span>
            )}
          </div>
        </div>

        <h2 style={{ color: logro.color, marginTop: '20px' }}>¡LOGRO ALCANZADO!</h2>
        <h1 style={{ fontSize: '2rem', margin: '10px 0' }}>NIVEL {logro.nombre.toUpperCase()}</h1>
        
        <p className="achievement-message">{logro.mensaje}</p>

        <button 
          className="btn-primary" 
          style={{ marginTop: '30px', width: '100%', background: logro.color, color: '#000' }}
          onClick={onClose}
        >
          CONTINUAR EXPEDICIÓN
        </button>
      </div>
    </div>
  );
};

export default AchievementModal;
