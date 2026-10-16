import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import './AwardShowcase.css';

const AwardShowcase = () => {
  const { language } = useLanguage();
  const isSpanish = language === 'es';

  return (
    <section className="award-showcase" id="awards">
      <div className="award-showcase-container">
        <div className="award-visual-frame fade-in">
          <div className="glass-reflection-layer"></div>
          <img 
            src="/assets/google-award-2025-v2.jpg" 
            alt={isSpanish ? 'Ganador Premio Google 2025 - Axion Tax & Beyond' : '2025 Google Award Winner - Axion Tax & Beyond'}
            className="award-main-image"
          />
          <div className="award-info-overlay">
            <div className="award-tag">{isSpanish ? 'RECONOCIMIENTO PREMIUM' : 'PREMIUM RECOGNITION'}</div>
            <h2 className="award-display-title">{isSpanish ? 'Excelencia reconocida por el líder global.' : 'Excellence Recognized by the Global Leader.'}</h2>
            <p className="award-display-p">
              {isSpanish
                ? 'Innovando la industria fiscal mediante integración digital avanzada y soporte experto local.'
                : 'Innovating the tax industry through advanced digital integration and localized expert support.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardShowcase;
