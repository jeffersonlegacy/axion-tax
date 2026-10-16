import React, { useEffect, useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import './NavBar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage, copyMode, setCopyMode, t } = useLanguage();
  const isSpanish = language === 'es';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);
  const handleLanguageToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleLanguage();
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="#home" onClick={closeMenu}>
            <span className="logo-text">AXION</span>
            <span className="logo-subtext">{isSpanish ? 'IMPUESTOS Y MAS' : 'TAX & BEYOND'}</span>
          </a>
        </div>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <a href="#home" className="nav-link" onClick={closeMenu}>{t('nav.home')}</a>
          <a href="#your-plan" className="nav-link" onClick={closeMenu}>{t('nav.services')}</a>
          <a href="#tools" className="nav-link" onClick={closeMenu}>{t('nav.tools')}</a>
          <a href="#portal" className="nav-link" onClick={closeMenu}>{t('nav.portal')}</a>

          <div className="nav-toggle-cluster">
            <button type="button" className="lang-toggle-btn" onClick={handleLanguageToggle}>
              <Globe size={16} />
              <span>{language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}</span>
            </button>

            <div className="copy-toggle" aria-label={isSpanish ? 'Modo de explicacion' : 'Explanation mode'}>
              <button
                type="button"
                className={copyMode === 'explained' ? 'active' : ''}
                onClick={() => setCopyMode('explained')}
              >
                {isSpanish ? 'Explicado' : 'Explained'}
              </button>
              <button
                type="button"
                className={copyMode === 'basic' ? 'active' : ''}
                onClick={() => setCopyMode('basic')}
              >
                {isSpanish ? 'Basico' : 'Basic'}
              </button>
            </div>
          </div>

          <a href="#portal" className="btn-outline login-btn" onClick={closeMenu}>{t('nav.login')}</a>
          <a href="#portal-appointments" className="btn-primary nav-btn" onClick={closeMenu}>
            {isSpanish ? 'Reservar Reunion' : 'Book Meeting'}
          </a>
        </div>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isSpanish ? 'Alternar navegacion' : 'Toggle navigation'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
