import React from 'react';
import './Certificate.css';

const Certificate = ({ userData, onClose }) => {
  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="certificate-overlay">
      <div className="certificate-container animate-fade-in">
        <div className="certificate-paper">
          <div className="certificate-border">
            <div className="certificate-content">
              <header className="cert-header">
                <h3 className="cert-club-tag">CLUB DE CONQUISTADORES</h3>
                <h1 className="cert-main-title">CERTIFICADO DE LOGRO</h1>
              </header>

              <section className="cert-body">
                <p className="cert-text">Se otorga con orgullo a:</p>
                <h2 className="cert-name">{userData.nombre} {userData.apellido}</h2>
                <p className="cert-text-long">
                  Por haber completado con éxito la expedición del <strong>Año Bíblico</strong>,<br/> 
                  demostrando constancia, disciplina y amor por la Palabra de Dios<br/>
                  durante las 52 semanas de este año.
                </p>
              </section>

              <footer className="cert-footer">
                <div className="cert-info-row">
                  <div className="cert-info-item">
                    <span className="cert-label">CLUB</span>
                    <span className="cert-value">{userData.club}</span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-label">FECHA</span>
                    <span className="cert-value">{today}</span>
                  </div>
                </div>

                <div className="cert-signatures">
                  <div className="signature-box">
                    <div className="sig-line"></div>
                    <span>Director del Club</span>
                  </div>
                  <div className="signature-box">
                    <div className="sig-line"></div>
                    <span>Consejero(a) de Unidad</span>
                  </div>
                </div>
              </footer>

              <div className="cert-seal">
                <div className="seal-inner">52</div>
                <div className="seal-text">SEMANAS COMPLETADAS</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cert-actions no-print">
          <button className="btn-primary" onClick={() => window.print()}>
            IMPRIMIR CERTIFICADO
          </button>
          <button className="btn-secondary" onClick={onClose} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--outline)' }}>
            CERRAR VISTA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
