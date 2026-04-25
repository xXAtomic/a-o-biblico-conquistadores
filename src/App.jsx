import React, { useState, useEffect } from 'react';
import './App.css';
import lecturasData from './data/lecturas.json';
import logrosData from './data/logros.json';
import AchievementModal from './components/AchievementModal';
import BibleReaderModal from './components/BibleReaderModal';
import Certificate from './components/Certificate';

function App() {
  const [screen, setScreen] = useState('register');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [activeLogro, setActiveLogro] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [completedLecturas, setCompletedLecturas] = useState({});

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    unidad: '',
    club: '',
    ciudad: '',
    pais: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckLectura = (semanaId, lecturaIdx) => {
    const key = `${semanaId}-${lecturaIdx}`;
    const newCompleted = { ...completedLecturas, [key]: !completedLecturas[key] };
    setCompletedLecturas(newCompleted);

    // Check if week is completed
    const weekData = lecturasData.find(w => w.semana === semanaId);
    const allCompleted = weekData.lecturas.every((_, idx) => newCompleted[`${semanaId}-${idx}`]);

    if (allCompleted && !completedWeeks.includes(semanaId)) {
      setCompletedWeeks([...completedWeeks, semanaId]);
      
      // Check for new achievement
      const nextLogro = logrosData.find(l => l.requisitoSemanas === (completedWeeks.length + 1));
      if (nextLogro) {
        setActiveLogro(nextLogro);
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setScreen('dashboard');
  };

  const currentReading = {
    semana: 1,
    capitulos: "1 Reyes 3:3-15"
  };

  if (screen === 'register') {
    return (
      <div className="app-container animate-fade-in">
        <div className="hero-section">
          <h1 style={{ fontSize: '3rem', lineHeight: '1' }}>AÑO<br/><span style={{ color: 'var(--on-surface)' }}>BÍBLICO</span></h1>
          <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginTop: '10px' }}>CONQUISTADORES</p>
        </div>

        <form className="registration-card glass-card" onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nombre</label>
            <input type="text" name="nombre" placeholder="Tu nombre" required value={formData.nombre} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>Apellido</label>
            <input type="text" name="apellido" placeholder="Tu apellido" required value={formData.apellido} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>Unidad / Club</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" name="unidad" placeholder="Unidad" required value={formData.unidad} onChange={handleInputChange} />
              <input type="text" name="club" placeholder="Club" required value={formData.club} onChange={handleInputChange} />
            </div>
          </div>
          <div className="input-group">
            <label>Ciudad / País</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" name="ciudad" placeholder="Ciudad" required value={formData.ciudad} onChange={handleInputChange} />
              <input type="text" name="pais" placeholder="País" required value={formData.pais} onChange={handleInputChange} />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full">
            COMENZAR EXPEDICIÓN
          </button>
        </form>
      </div>
    );
  }

  if (screen === 'dashboard') {
    return (
      <div className="app-container animate-fade-in">
        <header style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--on-surface)' }}>Conquistador: {formData.nombre}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Club {formData.club} • {formData.unidad}</p>
        </header>

        {!selectedWeek ? (
          <>
            <div className="glass-card" style={{ marginBottom: '30px', borderLeft: '4px solid var(--primary)', cursor: 'pointer' }} onClick={() => setSelectedPassage(currentReading.capitulos)}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '5px' }}>LECTURA DE HOY</h3>
              <p style={{ fontSize: '1.4rem', fontWeight: '800' }}>{currentReading.capitulos}</p>
              <button className="btn-primary" style={{ marginTop: '15px', padding: '10px 20px' }}>
                LEER AHORA
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem' }}>TU RUTA (52 SEMANAS)</h3>
              <span style={{ color: 'var(--primary)', fontWeight: '800' }}>
                {Math.round((completedWeeks.length / 52) * 100)}%
              </span>
            </div>

            {completedWeeks.length > 0 && (
              <button 
                className="btn-primary" 
                style={{ marginBottom: '30px', width: '100%', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}
                onClick={() => setShowCertificate(true)}
              >
                🎓 GENERAR CERTIFICADO {completedWeeks.length < 52 ? '(BETA)' : ''}
              </button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[...Array(52)].map((_, i) => {
                const weekData = lecturasData.find(w => w.semana === i + 1);
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedWeek(weekData)}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: completedWeeks.includes(i + 1) ? 'var(--primary)' : 'var(--surface-high)',
                      color: completedWeeks.includes(i + 1) ? 'var(--on-primary)' : 'var(--on-surface)',
                      borderRadius: 'var(--radius-md)',
                      cursor: weekData ? 'pointer' : 'default',
                      border: '1px solid var(--outline-variant)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{i + 1}</span>
                    {completedWeeks.includes(i + 1) && <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>LISTO</span>}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <button 
              onClick={() => setSelectedWeek(null)}
              style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              ← VOLVER
            </button>
            
            <div className="glass-card">
              <h2 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '5px' }}>SEMANA {selectedWeek.semana}</h2>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>{selectedWeek.tema}</h1>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedWeek.lecturas.map((lectura, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '16px',
                      background: 'var(--surface-high)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--outline-variant)'
                    }}
                  >
                    <div 
                      style={{ flex: 1, cursor: 'pointer' }} 
                      onClick={() => setSelectedPassage(lectura)}
                    >
                      <span style={{ fontWeight: '600' }}>{lectura}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} 
                      checked={!!completedLecturas[`${selectedWeek.semana}-${idx}`]}
                      onChange={() => handleCheckLectura(selectedWeek.semana, idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <AchievementModal logro={activeLogro} onClose={() => setActiveLogro(null)} />
        <BibleReaderModal 
          passage={selectedPassage} 
          onClose={() => setSelectedPassage(null)} 
          onFinished={(passage) => {
            // Find week and index of this passage
            lecturasData.forEach(w => {
              const idx = w.lecturas.indexOf(passage);
              if (idx !== -1) {
                handleCheckLectura(w.semana, idx);
              }
            });
          }}
        />
        {showCertificate && <Certificate userData={formData} onClose={() => setShowCertificate(false)} />}
      </div>
    );
  }

  return null;
}

export default App;
