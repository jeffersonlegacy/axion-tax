import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import './HeroSection.css';

const HeroSection = () => {
  const { language, t, pickCopy } = useLanguage();
  const isSpanish = language === 'es';

  return (
    <section className="hero" id="home">
      <div className="hero-video-container" aria-hidden="true">
        <video className="hero-video-bg" autoPlay muted loop playsInline>
          <source src="/assets/hero-bg-video.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-bg-ambient" aria-hidden="true"></div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-premium-header">
          <span className="hero-premium-title">{t('hero.premiumTitle')}</span>
          <p className="hero-premium-subtitle">{t('hero.premiumSubtitle')}</p>
        </div>
        <figure className="hero-brand-frame">
          <img
            className="hero-brand-image"
            src="/assets/axion-hero-main.png"
            alt={isSpanish ? 'Imagen principal de marca Axion' : 'Axion brand hero image'}
          />
        </figure>
        <h1 className="hero-title">{t('hero.title')}</h1>
        <p className="hero-subtitle">{t('hero.subtitle')}</p>
        <div className="hero-guides">
          <a href="#tools" className="hero-guide-pill">
            {pickCopy('Missing a W-2 or 1099?', '¿Le falta un W-2 o 1099?', 'Missing a form?', '¿Falta un formulario?')}
          </a>
          <a href="#client-profile" className="hero-guide-pill">
            {pickCopy('Want the full client profile?', '¿Quiere el perfil completo del cliente?', 'Client profile?', '¿Perfil del cliente?')}
          </a>
        </div>
        <div className="hero-actions">
          <a href="#portal" className="btn-primary-lg">{t('hero.cta')}</a>
          <a href="#client-profile" className="btn-outline-lg">{pickCopy('Why Open A Client Profile', 'Por que abrir un perfil del cliente', 'Why the profile matters', 'Por que importa el perfil')}</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
