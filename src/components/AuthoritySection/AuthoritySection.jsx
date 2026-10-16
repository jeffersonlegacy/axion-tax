import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import { ShieldCheck, Scale, Globe } from 'lucide-react';
import './AuthoritySection.css';

const AuthoritySection = () => {
  const { language } = useLanguage();
  const isSpanish = language === 'es';

  return (
    <section className="authority-section" id="authority">
      <div className="authority-container glass-panel">
        <div className="authority-content">
          <div className="authority-badge">{isSpanish ? 'RAREZA LOCAL' : 'LOCAL RARITY'}</div>
          <h2 className="authority-title">{isSpanish ? 'Una autoridad poco común en el Condado de Contra Costa' : 'A Rare Authority in Contra Costa County'}</h2>
          <p className="authority-text">
            {isSpanish
              ? 'De más de 800,000 profesionales de impuestos en todo el país, solo una pequeña fracción está autorizada como Agente Certificador de Aceptación del IRS. En el área de Pleasant Hill y Vallejo, Axion Tax & Beyond es una de las pocas oficinas con esta designación federal de élite.'
              : 'Out of over 800,000 tax professionals nationwide, only a small fraction are authorized as IRS Certifying Acceptance Agents. In the Pleasant Hill and Vallejo area, Axion Tax & Beyond is one of the few offices with this elite federal designation.'}
          </p>
          
          <div className="rarity-grid">
            <div className="rarity-item">
              <div className="rarity-icon"><ShieldCheck size={28} className="custom-icon-svg" /></div>
              <div className="rarity-info">
                <h4>{isSpanish ? 'Sin enviar documentos originales' : 'No Original Documents Mailed'}</h4>
                <p>{isSpanish ? 'Como Agentes de Aceptación, verificamos su pasaporte e identificaciones en persona. Nunca tiene que enviar sus documentos originales al IRS.' : 'Because we are Acceptance Agents, we verify your passport and IDs in person. You never have to mail your original identity documents to the IRS.'}</p>
              </div>
            </div>
            <div className="rarity-item">
              <div className="rarity-icon"><Scale size={28} className="custom-icon-svg" /></div>
              <div className="rarity-info">
                <h4>{isSpanish ? 'Confianza federal' : 'Federal Trust'}</h4>
                <p>{isSpanish ? 'Nuestro estatus como ERO y Agente de Aceptación significa que el IRS nos evalúa y autoriza directamente para manejar su información más sensible.' : 'Our status as an ERO and Acceptance Agent means we are directly vetted and authorized by the IRS to handle your most sensitive data.'}</p>
              </div>
            </div>
            <div className="rarity-item">
              <div className="rarity-icon"><Globe size={28} className="custom-icon-svg" /></div>
              <div className="rarity-info">
                <h4>{isSpanish ? 'El puente ITIN' : 'The ITIN Bridge'}</h4>
                <p>{isSpanish ? 'Nos especializamos en ayudar a la comunidad internacional a navegar el sistema financiero de EE. UU. con cumplimiento legal y rapidez.' : 'We specialize in helping the international community navigate the U.S. financial system with 100% legal compliance and speed.'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="authority-stat">
          <div className="stat-circle">
            <span className="stat-number">1%</span>
            <span className="stat-label">{isSpanish ? 'Designación rara' : 'Rare Designation'}</span>
          </div>
          <p className="stat-subtext">{isSpanish ? 'Estatus élite de certificación IRS' : 'Elite IRS Certification Status'}</p>
        </div>
      </div>
    </section>
  );
};

export default AuthoritySection;
