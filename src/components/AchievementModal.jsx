import React from 'react';
import './AchievementModal.css';

const AchievementModal = ({ logro, onClose }) => {
  if (!logro) return null;

  // Handle Vite base path for images
  const baseUrl = import.meta.env.BASE_URL || '/';
  const imagePath = logro.imagen && logro.imagen.startsWith('http') 
    ? logro.imagen 
    : (logro.imagen ? `${baseUrl}${logro.imagen}` : null);

  return (
    <div className="modal-overlay animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000 }}>
      {/* Scrollable Container for Small Screens */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '40px 20px' 
      }}>
        <div className="achievement-celebration" style={{ 
          width: '100%', 
          maxWidth: '400px',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          background: 'radial-gradient(circle at center, rgba(228,171,57,0.15) 0%, transparent 70%)'
        }}>
          <p style={{ color: 'var(--primary)', letterSpacing: '4px', fontWeight: '800', marginBottom: '10px', fontSize: '0.8rem' }}>NIVEL</p>
          <h1 style={{ 
            fontSize: 'min(3.5rem, 15vw)', 
            fontWeight: '900', 
            lineHeight: '1', 
            marginBottom: '20px',
            background: 'linear-gradient(to bottom, #FFF, #E4AB39)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            margin: 0
          }}>ALCANZADO</h1>

          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '30px', maxWidth: '300px' }}>
            ¡Felicidades, Conquistador!<br/>
            Has alcanzado un nuevo nivel en tu expedición bíblica.
          </p>

          <div className="medal-container" style={{ position: 'relative', marginBottom: '50px' }}>
             {/* Medal Shield Effect */}
             <div style={{
               width: 'min(260px, 60vw)',
               height: 'min(260px, 60vw)',
               borderRadius: '40px',
               border: '8px solid var(--primary)',
               background: 'rgba(255,255,255,0.05)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               overflow: 'hidden',
               boxShadow: '0 0 60px rgba(228,171,57,0.4)',
               position: 'relative'
             }}>
               {imagePath ? (
                 <img src={imagePath} alt={logro.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <span style={{ fontSize: 'min(120px, 30vw)' }}>🛡️</span>
               )}
             </div>
             
             {/* Banner */}
             <div style={{
               position: 'absolute',
               bottom: '-25px',
               left: '50%',
               transform: 'translateX(-50%)',
               background: 'linear-gradient(to right, #0B162C, #1a2a4a, #0B162C)',
               padding: '12px 40px',
               borderRadius: '8px',
               border: '2px solid var(--primary)',
               whiteSpace: 'nowrap',
               boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
               zIndex: 2
             }}>
               <p style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '800', margin: 0, letterSpacing: '2px' }}>NIVEL</p>
               <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '900', color: '#FFF' }}>{logro.nombre.toUpperCase()}</h2>
             </div>
          </div>

          <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '3px', marginBottom: '20px' }}>
            SABIDURÍA • FE • VALOR
          </p>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
             {[1,2,3,4,5].map(i => (
               <div key={i} style={{ 
                 width: '12px', 
                 height: '12px', 
                 borderRadius: '50%', 
                 background: i <= 3 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                 boxShadow: i <= 3 ? '0 0 15px var(--primary)' : 'none',
                 border: '1px solid rgba(255,255,255,0.1)'
               }} />
             ))}
          </div>

          <div style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)', fontSize: '0.85rem', maxWidth: '320px', marginBottom: '40px', lineHeight: '1.6' }}>
             <p style={{ margin: 0 }}>"Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas."</p>
             <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.7rem', marginTop: '12px', letterSpacing: '1px' }}>ISAÍAS 40:31</p>
          </div>

          <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '380px' }}>
            <button 
              className="btn-primary" 
              style={{ flex: 1, padding: '18px', fontSize: '0.9rem', fontWeight: '800' }} 
              onClick={onClose}
            >
              CONTINUAR EXPEDICIÓN
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: '18px', background: 'rgba(255,255,255,0.05)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
