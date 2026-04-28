import React, { useState, useEffect } from 'react';
import './BibleReaderModal.css';

const BibleReaderModal = ({ passage, onClose, onFinished }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasReadBottom, setHasReadBottom] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // If user is within 20px of the bottom
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setHasReadBottom(true);
    }
  };

  const handleClose = () => {
    if (hasReadBottom && onFinished) {
      onFinished(passage);
    }
    onClose();
  };

  useEffect(() => {
    if (!passage) return;

    const fetchBibleText = async () => {
      setLoading(true);
      setError(null);
      try {
        const cacheKey = `bible_cache_${passage.replace(/\s+/g, '_').toLowerCase()}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          console.log("Cargando desde caché offline:", passage);
          setContent(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Robust parsing for books with numbers/spaces (e.g., "1 Reyes 3:3-15")
        const lastSpaceIndex = passage.lastIndexOf(' ');
        if (lastSpaceIndex === -1) throw new Error('Formato de pasaje inválido');
        
        const bookRaw = passage.substring(0, lastSpaceIndex);
        const refRaw = passage.substring(lastSpaceIndex + 1);
        
        // Normalize book name: lowercase, replace space with hyphen, remove accents
        let book = bookRaw.toLowerCase()
          .replace(/\s+/g, '-')
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Special case for Salmos
        if (book === 'salmo') book = 'salmos';
          
        const [chapter, verses] = refRaw.split(':');

        const response = await fetch(`https://bible-api.deno.dev/api/read/rv1960/${book}/${chapter}/${verses}`);
        if (!response.ok) throw new Error('No se pudo cargar el texto bíblico');
        const data = await response.json();
        
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setContent(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el texto bíblico. Revisa tu conexión a internet.');
      } finally {
        setLoading(false);
      }
    };

    fetchBibleText();
  }, [passage]);

  if (!passage) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="bible-card glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="bible-header">
          <div>
            <h3 className="version-tag">REINA VALERA 1960</h3>
            <h2 className="passage-title">{passage}</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </header>

        <div className="bible-content" onScroll={handleScroll}>
          {loading ? (
            <div className="loader">Cargando Palabra del Señor...</div>
          ) : error ? (
            <div className="error-msg" style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '20px' }}>{error}</p>
              <button className="btn-primary" style={{ background: 'var(--secondary)' }} onClick={() => window.location.reload()}>REINTENTAR</button>
            </div>
          ) : (
            <div className="verses-list">
              {Array.isArray(content) && content.map((v, i) => (
                <p key={i} className="verse-row">
                  <span className="verse-num">{v.number}</span>
                  <div className="verse-text-container">
                    {v.study && <h4 className="study-title">{v.study}</h4>}
                    <span className="verse-text">{v.verse}</span>
                  </div>
                </p>
              ))}
              {hasReadBottom && <p style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.8rem', marginTop: '20px', fontWeight: 'bold' }}>✓ LECTURA COMPLETADA</p>}
            </div>
          )}
        </div>

        <footer className="bible-footer">
          <button className="btn-primary" onClick={handleClose}>
            {hasReadBottom ? 'MARCAR COMO LEÍDO' : 'CERRAR LECTURA'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BibleReaderModal;
