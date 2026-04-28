import React, { useState, useEffect } from 'react';
import './App.css';
import lecturasData from './data/lecturas.json';
import logrosData from './data/logros.json';
import AchievementModal from './components/AchievementModal';
import BibleReaderModal from './components/BibleReaderModal';
import Certificate from './components/Certificate';
import { supabase } from './supabaseClient';
import { LocalNotifications } from '@capacitor/local-notifications';

const API_URL = 'https://api.crisadones.com'; // Cambiar por tu subdominio final

function App() {
  // Initialize state from LocalStorage if available
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('conquibiblia_profile');
    return saved ? JSON.parse(saved) : {
      id: null, // New field for server ID
      nombre: '',
      apellido: '',
      unidad: '',
      club: '',
      ciudad: '',
      pais: ''
    };
  });

  const [screen, setScreen] = useState(() => {
    return localStorage.getItem('conquibiblia_profile') ? 'dashboard' : 'register';
  });

  const [completedWeeks, setCompletedWeeks] = useState(() => {
    const saved = localStorage.getItem('conquibiblia_weeks');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedLecturas, setCompletedLecturas] = useState(() => {
    const saved = localStorage.getItem('conquibiblia_lecturas');
    return saved ? JSON.parse(saved) : {};
  });

  // UI Transient States
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [activeLogro, setActiveLogro] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Persist state to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('conquibiblia_weeks', JSON.stringify(completedWeeks));
  }, [completedWeeks]);

  useEffect(() => {
    localStorage.setItem('conquibiblia_lecturas', JSON.stringify(completedLecturas));
  }, [completedLecturas]);

  useEffect(() => {
    if (screen === 'dashboard') {
      localStorage.setItem('conquibiblia_profile', JSON.stringify(formData));
    }
  }, [formData, screen]);

  const handleCheckLectura = async (semanaId, lecturaIdx) => {
    const key = `${semanaId}-${lecturaIdx}`;
    const newCompletedLecturas = { ...completedLecturas, [key]: !completedLecturas[key] };
    setCompletedLecturas(newCompletedLecturas);

    // Sync to Cloud if we have a userId
    if (formData.id) {
      try {
        if (newCompletedLecturas[key]) {
          await supabase.from('progress').insert([
            { user_id: formData.id, semana_id: semanaId, lectura_idx: lecturaIdx }
          ]);
        } else {
          await supabase.from('progress')
            .delete()
            .match({ user_id: formData.id, semana_id: semanaId, lectura_idx: lecturaIdx });
        }
      } catch (err) {
        console.error("Cloud sync failed, saved locally:", err);
      }
    }

    // Check if the entire week is now completed
    const weekData = lecturasData.find(w => w.semana === semanaId);
    const allLecturasOfCurrentWeekCompleted = weekData.lecturas.every((_, idx) => newCompletedLecturas[`${semanaId}-${idx}`]);

    if (allLecturasOfCurrentWeekCompleted && !completedWeeks.includes(semanaId)) {
      const newCompletedWeeks = [...completedWeeks, semanaId];
      setCompletedWeeks(newCompletedWeeks);
      
      const earnedLogro = logrosData.find(l => l.requisitoSemanas === newCompletedWeeks.length);
      if (earnedLogro) setActiveLogro(earnedLogro);
    } else if (!allLecturasOfCurrentWeekCompleted && completedWeeks.includes(semanaId)) {
      setCompletedWeeks(completedWeeks.filter(id => id !== semanaId));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Register in Cloud
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          nombre: formData.nombre,
          apellido: formData.apellido,
          unidad: formData.unidad,
          club: formData.club,
          ciudad: formData.ciudad,
          pais: formData.pais
        }])
        .select()
        .single();

      if (error) throw error;
      setFormData(data); // Supabase returns the full inserted row with UUID
      setScreen('dashboard');
    } catch (err) {
      console.error("Cloud registration failed, proceeding offline:", err);
      setScreen('dashboard');
    }
  };

  // Cloud Sync on Load
  useEffect(() => {
    if (formData.id && screen === 'dashboard') {
      const syncFromCloud = async () => {
        try {
          const { data, error } = await supabase
            .from('progress')
            .select('semana_id, lectura_idx')
            .eq('user_id', formData.id);

          if (error) throw error;
          
          const cloudLecturas = {};
          
          data.forEach(p => {
            cloudLecturas[`${p.semana_id}-${p.lectura_idx}`] = true;
          });

          const newCloudWeeks = [];
          lecturasData.forEach(weekData => {
            const allCompleted = weekData.lecturas.every((_, idx) => cloudLecturas[`${weekData.semana}-${idx}`]);
            if (allCompleted) newCloudWeeks.push(weekData.semana);
          });

          setCompletedLecturas(prev => ({ ...prev, ...cloudLecturas }));
          setCompletedWeeks(newCloudWeeks);
        } catch (err) {
          console.error("Initial cloud sync failed:", err);
        }
      };
      syncFromCloud();
    }
  }, [formData.id, screen]);

  const preCacheReadings = async () => {
    // Find only the next 5 uncompleted readings
    const allReadings = [];
    lecturasData.forEach(w => {
      w.lecturas.forEach((l, idx) => {
        if (!completedLecturas[`${w.semana}-${idx}`]) {
          allReadings.push({ passage: l, semana: w.semana, idx });
        }
      });
    });

    const next5 = allReadings.slice(0, 5);
    let count = 0;
    
    for (const item of next5) {
      const passage = item.passage;
      const cacheKey = `bible_cache_${passage.replace(/\s+/g, '_').toLowerCase()}`;
      if (!localStorage.getItem(cacheKey)) {
        try {
          const lastSpaceIndex = passage.lastIndexOf(' ');
          if (lastSpaceIndex === -1) continue;
          const bookRaw = passage.substring(0, lastSpaceIndex);
          const refRaw = passage.substring(lastSpaceIndex + 1);
          let book = bookRaw.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (book === 'salmo') book = 'salmos';
          const [chapter, verses] = refRaw.split(':');
          
          const response = await fetch(`https://bible-api.deno.dev/api/read/rv1960/${book}/${chapter}/${verses}`);
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem(cacheKey, JSON.stringify(data));
            count++;
          }
        } catch (e) { console.error("Error pre-caching:", passage); }
      }
    }
    alert(`¡Éxito! Se han descargado las próximas ${count} lecturas (5 días) para uso offline.`);
  };

  // Handle Notifications Setup
  useEffect(() => {
    if (screen === 'dashboard') {
      const setupNotifications = async () => {
        try {
          const permission = await LocalNotifications.requestPermissions();
          if (permission.display === 'granted') {
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: "📖 ¡Es hora de tu Expedición!",
                  body: "¿Ya completaste tu lectura del Año Bíblico hoy? No te quedes atrás.",
                  id: 1,
                  schedule: {
                    on: { hour: 8, minute: 0 },
                    repeats: true,
                    allowWhileIdle: true
                  },
                  actionTypeId: "",
                  extra: null
                }
              ]
            });
            console.log("Daily notification scheduled for 8:00 AM");
          }
        } catch (err) {
          console.error("Notification setup failed:", err);
        }
      };
      setupNotifications();
    }
  }, [screen]);

  // Find the first uncompleted reading to show in "Lectura de hoy"
  const getTodayReading = () => {
    for (const week of lecturasData) {
      for (let i = 0; i < week.lecturas.length; i++) {
        const key = `${week.semana}-${i}`;
        if (!completedLecturas[key]) {
          return {
            semana: week.semana,
            tema: week.tema,
            capitulos: week.lecturas[i],
            index: i
          };
        }
      }
    }
    return null;
  };

  const currentReading = getTodayReading();

    if (screen === 'register') {
      return (
        <>
          <div className="app-container animate-fade-in">
            <div className="hero-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <img src="/icon2.png" alt="ConquisBiblia Icon" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '10px' }} />
              <h1 style={{ fontSize: 'min(2.5rem, 10vw)', lineHeight: '1', margin: 0, textAlign: 'center' }}>Conquis<span style={{ color: 'var(--on-surface)' }}>Biblia</span></h1>
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
                <div className="flex-row-mobile">
                  <input type="text" name="unidad" placeholder="Unidad" required value={formData.unidad} onChange={handleInputChange} />
                  <input type="text" name="club" placeholder="Club" required value={formData.club} onChange={handleInputChange} />
                </div>
              </div>
              <div className="input-group">
                <label>Ciudad / País</label>
                <div className="flex-row-mobile">
                  <input type="text" name="ciudad" placeholder="Ciudad" required value={formData.ciudad} onChange={handleInputChange} />
                  <input type="text" name="pais" placeholder="País" required value={formData.pais} onChange={handleInputChange} />
                </div>
              </div>
    
              <button type="submit" className="btn-primary btn-full">
                COMENZAR EXPEDICIÓN
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginTop: '20px' }}>
                ¿Ya tienes cuenta? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Inicia sesión</span>
              </p>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '20px', opacity: 0.6 }}>Creado por AtomicDevs</p>
            </form>
          </div>
        </>
      );
    }

    if (screen === 'dashboard') {
      return (
        <>
          <div className="app-container animate-fade-in">
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--on-surface)', wordBreak: 'break-word' }}>Conquistador: {formData.nombre}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                  {formData.club ? `Club ${formData.club}` : 'Club Conquistadores'} 
                  {formData.unidad ? ` • ${formData.unidad}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src="/icon2.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Conquis<span style={{ color: 'var(--on-surface)' }}>Biblia</span></h1>
              </div>
            </header>
    
            {activeTab === 'inicio' && !selectedWeek && (
              <>
                {currentReading ? (
                  <div className="dashboard-hero glass-card animate-slide-up" style={{ textAlign: 'center', padding: '30px 20px', marginBottom: '30px' }}>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '15px' }}>Progreso Semanal</p>
                    
                    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 20px' }}>
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="3"
                          strokeDasharray={`${(() => {
                            const weekData = lecturasData.find(w => w.semana === currentReading.semana);
                            const completedInWeek = weekData.lecturas.filter((_, idx) => completedLecturas[`${currentReading.semana}-${idx}`]).length;
                            return (completedInWeek / weekData.lecturas.length) * 100;
                          })()}, 100)`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', display: 'block' }}>
                          {Math.round((() => {
                            const weekData = lecturasData.find(w => w.semana === currentReading.semana);
                            const completedInWeek = weekData.lecturas.filter((_, idx) => completedLecturas[`${currentReading.semana}-${idx}`]).length;
                            return (completedInWeek / weekData.lecturas.length) * 100;
                          })())}%
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: '600' }}>
                          Semana {currentReading.semana} de 52
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '20px' }}>
                      {(() => {
                        const weekData = lecturasData.find(w => w.semana === currentReading.semana);
                        const completedInWeek = weekData.lecturas.filter((_, idx) => completedLecturas[`${currentReading.semana}-${idx}`]).length;
                        return `${completedInWeek} ${completedInWeek === 1 ? 'día completado' : 'días completados'}`;
                      })()}
                    </p>

                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '16px', fontSize: '1rem', marginBottom: '15px' }} 
                      onClick={() => setSelectedPassage(currentReading.capitulos)}
                    >
                      📖 CONTINUAR LECTURA
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>Lectura de Hoy</p>
                        <p style={{ fontSize: '1rem', fontWeight: '700' }}>{currentReading.capitulos}</p>
                      </div>
                      <button 
                        className="btn-secondary" 
                        onClick={preCacheReadings}
                        style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                         <span style={{ fontSize: '1.2rem' }}>📥</span>
                         <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>OFFLINE</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card" style={{ marginBottom: '30px', borderLeft: '4px solid #4CAF50', background: 'rgba(76, 175, 80, 0.1)' }}>
                    <h3 style={{ fontSize: '0.8rem', color: '#4CAF50', marginBottom: '5px' }}>¡FELICITACIONES!</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>Has completado todas las lecturas del año.</p>
                  </div>
                )}
    
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem' }}>TU RUTA (52 SEMANAS)</h3>
                  <span style={{ color: 'var(--primary)', fontWeight: '800' }}>
                    {Math.round((completedWeeks.length / 52) * 100)}%
                  </span>
                </div>
    
                {completedWeeks.length === 52 && (
                  <button 
                    className="btn-primary" 
                    style={{ marginBottom: '30px', width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))', color: 'var(--on-primary)' }}
                    onClick={() => setShowCertificate(true)}
                  >
                    🎓 GENERAR CERTIFICADO OFICIAL
                  </button>
                )}
    
                <div className="weeks-grid">
                  {[...Array(52)].map((_, i) => {
                    const weekNum = i + 1;
                    const weekData = lecturasData.find(w => w.semana === weekNum);
                    
                    let progress = 0;
                    if (weekData) {
                      const totalInWeek = weekData.lecturas.length;
                      const completedInWeek = weekData.lecturas.filter((_, idx) => completedLecturas[`${weekNum}-${idx}`]).length;
                      progress = (completedInWeek / totalInWeek) * 100;
                    }
    
                    const isFullyDone = progress === 100;
    
                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedWeek(weekData)}
                        className="week-card"
                        style={{
                          aspectRatio: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isFullyDone 
                            ? 'var(--primary)' 
                            : `linear-gradient(to top, var(--primary) ${progress}%, var(--surface-high) ${progress}%)`,
                          color: progress > 50 ? 'var(--on-primary)' : 'var(--on-surface)',
                          borderRadius: 'var(--radius-md)',
                          cursor: weekData ? 'pointer' : 'default',
                          border: '1px solid var(--outline-variant)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          boxShadow: progress > 0 && !isFullyDone ? '0 0 15px var(--primary-low)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{weekNum}</span>
                        {isFullyDone && <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>LISTO</span>}
                        {progress > 0 && !isFullyDone && (
                          <span style={{ fontSize: '0.6rem', fontWeight: '900', position: 'absolute', bottom: '5px', color: 'var(--on-primary)' }}>
                            {Math.round(progress)}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'inicio' && selectedWeek && (
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

            {activeTab === 'ruta' && !selectedWeek && (
              <div className="animate-fade-in">
                <h1 style={{ marginBottom: '20px' }}>Mi Ruta Espiritual</h1>
                <div className="glass-card">
                   <p>Aquí aparecerá el resumen detallado de tus semanas (Próximamente en Beta).</p>
                </div>
              </div>
            )}

            {activeTab === 'logros' && (
              <div className="animate-fade-in">
                <h1 style={{ marginBottom: '20px' }}>Mis Logros</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {logrosData.map((logro, i) => {
                    const isUnlocked = completedWeeks.length >= logro.requisitoSemanas;
                    return (
                      <div key={i} className="glass-card" style={{ textAlign: 'center', opacity: isUnlocked ? 1 : 0.4 }}>
                         <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{isUnlocked ? '🏆' : '🔒'}</div>
                         <h3 style={{ fontSize: '0.9rem' }}>{logro.nombre}</h3>
                         <p style={{ fontSize: '0.7rem' }}>{logro.nivel}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'perfil' && (
              <div className="animate-fade-in">
                <h1 style={{ marginBottom: '20px' }}>Mi Perfil</h1>
                <div className="glass-card">
                   <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</p>
                   <p><strong>Club:</strong> {formData.club}</p>
                   <p><strong>Unidad:</strong> {formData.unidad}</p>
                   <button 
                     className="btn-primary" 
                     style={{ marginTop: '20px', width: '100%', background: 'var(--error)', color: '#000' }}
                     onClick={() => { localStorage.clear(); window.location.reload(); }}
                    >
                     CERRAR SESIÓN
                   </button>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
              <div className={`nav-item ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => {setActiveTab('inicio'); setSelectedWeek(null);}}>
                <span className="nav-icon">🏠</span>
                <span>Inicio</span>
              </div>
              <div className={`nav-item ${activeTab === 'ruta' ? 'active' : ''}`} onClick={() => {setActiveTab('ruta'); setSelectedWeek(null);}}>
                <span className="nav-icon">🗺️</span>
                <span>Ruta</span>
              </div>
              <div className={`nav-item ${activeTab === 'logros' ? 'active' : ''}`} onClick={() => {setActiveTab('logros'); setSelectedWeek(null);}}>
                <span className="nav-icon">🏆</span>
                <span>Logros</span>
              </div>
              <div className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => {setActiveTab('perfil'); setSelectedWeek(null);}}>
                <span className="nav-icon">👤</span>
                <span>Perfil</span>
              </div>
            </nav>
          </div>

    
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
        </>
      );
    }

  return null;
}

export default App;
