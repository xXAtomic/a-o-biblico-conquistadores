import React, { useState, useEffect } from 'react';
import './BibleReaderModal.css';

const BibleReaderModal = ({ passage, onClose, onFinished }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasReadBottom, setHasReadBottom] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // If user is within 50px of the bottom
    if (scrollHeight - scrollTop <= clientHeight + 50) {
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

        // IMPROVED PARSING
        let bookRaw = "";
        let refRaw = "";
        
        // Find the last space before the chapter:verses
        const parts = passage.split(' ');
        refRaw = parts.pop(); // Last part should be "32:9" or "3:3-15"
        bookRaw = parts.join(' '); // Everything else is the book (e.g., "Deuteronomio" or "1 Reyes")
        
        if (!refRaw.includes(':')) {
           // Maybe it's just a chapter? (rare in this app but let's handle)
           throw new Error('Formato de pasaje inválido (Falta :)');
        }

        const [chapter, verses] = refRaw.split(':');
        
        // Normalize book name for the API
        let book = bookRaw.toLowerCase()
          .trim()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
          .replace(/\s+/g, '-'); // Spaces to hyphens
        
        if (book === 'salmo') book = 'salmos';
          
        console.log(`Fetching: https://bible-api.deno.dev/api/read/rv1960/${book}/${chapter}/${verses}`);
        
        const response = await fetch(`https://bible-api.deno.dev/api/read/rv1960/${book}/${chapter}/${verses}`);
        if (!response.ok) {
           // Try without normalization if it fails
           const retryResponse = await fetch(`https://bible-api.deno.dev/api/read/rv1960/${bookRaw.toLowerCase()}/${chapter}/${verses}`);
           if (!retryResponse.ok) throw new Error('No se pudo cargar el texto bíblico');
           const data = await retryResponse.json();
           localStorage.setItem(cacheKey, JSON.stringify(data));
           setContent(data);
        } else {
           const data = await response.json();
           localStorage.setItem(cacheKey, JSON.stringify(data));
           setContent(data);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo encontrar el texto bíblico. Verifica el nombre del libro o tu conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchBibleText();
  }, [passage]);

  if (!passage) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="bible-card glass-card animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
        <header className="bible-header">
          <div>
            <h3 className="version-tag">REINA VALERA 1960</h3>
            <h2 className="passage-title">{passage}</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </header>

        <div className="bible-content" onScroll={handleScroll}>
          {loading ? (
            <div className="loader">
                <div className="spinner"></div>
                <p>Cargando Palabra del Señor...</p>
            </div>
          ) : error ? (
            <div className="error-msg" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📖</div>
              <p style={{ marginBottom: '20px', color: 'var(--error)' }}>{error}</p>
              <button className="btn-primary" style={{ background: 'var(--secondary)' }} onClick={() => window.location.reload()}>REINTENTAR</button>
            </div>
          ) : (
            <div className="verses-list">
              {Array.isArray(content) && content.map((v, i) => (
                <div key={i} className="verse-row">
                  <span className="verse-num">{v.number}</span>
                  <div className="verse-text-container">
                    {v.study && <h4 className="study-title">{v.study}</h4>}
                    <span className="verse-text">{v.verse}</span>
                  </div>
                </div>
              ))}
              <div style={{ height: '40px' }}></div> {/* Spacer */}
              {hasReadBottom && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    background: 'rgba(228,171,57,0.1)', 
                    borderRadius: '10px', 
                    border: '1px dashed var(--primary)',
                    marginBottom: '20px'
                }}>
                    <p style={{ color: 'var(--primary)', fontSize: '0.9rem', margin: 0, fontWeight: 'bold' }}>✨ ¡LECTURA COMPLETADA! ✨</p>
                </div>
              )}
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
