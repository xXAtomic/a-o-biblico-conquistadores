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
          <div className="certificate-bg-layer"></div>
          <div className="certificate-border-outer">
            <div className="certificate-border-inner">
              <div className="certificate-content">
                <header className="cert-header">
                  <h1 className="cert-main-title">Certificado de Reconocimiento</h1>
                </header>

                <section className="cert-body">
                  <p className="cert-text">Este documento certifica que el Conquistador(a):</p>
                  <h2 className="cert-name">{userData.nombre} {userData.apellido}</h2>
                  <p className="cert-text-long">
                    Ha completado satisfactoriamente el plan de lectura del <strong>Año Bíblico</strong>,<br/> 
                    recorriendo las 52 semanas de expedición a través de la Palabra de Dios,<br/>
                    demostrando fidelidad, constancia y un espíritu de búsqueda espiritual.
                  </p>
                </section>

                <footer className="cert-footer">
                  <div className="cert-info-row">
                    <div className="cert-info-item">
                      <span className="cert-label">CLUB</span>
                      <span className="cert-value">{userData.club || 'N/A'}</span>
                    </div>
                    <div className="cert-info-item">
                      <span className="cert-label">UNIDAD</span>
                      <span className="cert-value">{userData.unidad || 'N/A'}</span>
                    </div>
                    <div className="cert-info-item">
                      <span className="cert-label">FECHA</span>
                      <span className="cert-value">{today}</span>
                    </div>
                  </div>

                  <div className="cert-signatures">
                    <div className="signature-box">
                      <div className="sig-line"></div>
                      <span className="sig-name">Firma del Director</span>
                      <span className="sig-role">Club de Conquistadores</span>
                    </div>
                    <div className="signature-box">
                      <div className="sig-line"></div>
                      <span className="sig-name">Firma del Consejero</span>
                      <span className="sig-role">Unidad de Expedición</span>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>

        <div className="cert-actions no-print">
          <button className="btn-primary" onClick={() => window.print()}>
            📥 DESCARGAR / IMPRIMIR PDF
          </button>
          <button className="btn-close" onClick={onClose}>
            CERRAR VISTA PREVIA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
