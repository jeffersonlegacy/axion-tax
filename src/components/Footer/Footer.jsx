import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import './Footer.css';

const Footer = () => {
  const { language, pickCopy } = useLanguage();
  const txt = (en, es) => (language === 'es' ? es : en);
  const copy = (en, es, basicEn = en, basicEs = es) => pickCopy(en, es, basicEn, basicEs);

  return (
    <footer className="footer" id="contact">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <span className="logo-text">AXION</span>
            <span className="logo-subtext">{language === 'en' ? 'TAX & BEYOND' : 'IMPUESTOS Y MAS'}</span>
          </div>
          <p className="footer-desc">
            {copy(
              'Tax preparation, bookkeeping support, ITIN guidance, and a cleaner client prep workflow for the Bay Area.',
              'Preparacion de impuestos, apoyo contable, orientacion ITIN y un flujo de preparacion mas limpio para el Area de la Bahia.',
              'Tax prep, bookkeeping, ITIN, and cleaner client prep.',
              'Impuestos, contabilidad, ITIN y mejor preparacion del cliente.'
            )}
          </p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/axiontb/" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">IG</a>
            <a href="https://www.yelp.com/biz/axion-tax-and-beyond-pleasant-hill" target="_blank" rel="noreferrer" className="social-icon" aria-label="Yelp">YL</a>
          </div>
        </div>

        <div className="footer-col links-col">
          <h4 className="footer-heading">{txt('Go Directly To', 'Ir Directo A')}</h4>
          <a href="#tracks" className="footer-link">{txt('Service Tracks', 'Rutas de Servicio')}</a>
          <a href="#your-plan" className="footer-link">{txt('Your Plan', 'Su Plan')}</a>
          <a href="#tools" className="footer-link">AXION Items</a>
          <a href="#tools" className="footer-link">{txt('Axion Familia Tools', 'Herramientas Axion Familia')}</a>
          <a href="#portal" className="footer-link">{txt('Client Portal', 'Portal del Cliente')}</a>
        </div>

        <div className="footer-col contact-col">
          <h4 className="footer-heading">{txt('Contact', 'Contacto')}</h4>
          <p className="contact-item">
            <strong className="text-highlight">{txt('Address', 'Direccion')}:</strong><br />
            2258 Monument Blvd<br />
            Pleasant Hill, CA 94523
          </p>
          <p className="contact-item">
            <strong className="text-highlight">{txt('Phone', 'Telefono')}:</strong><br />
            <a href="tel:+19254464140" className="footer-link-inline">(925) 446-4140</a><br />
            <span className="lang-tag">EN/ES</span>
          </p>
          <p className="contact-item">
            <strong className="text-highlight">{txt('Email', 'Correo')}:</strong><br />
            <a href="mailto:sgabino@axiontb.com" className="footer-link-inline">sgabino@axiontb.com</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Axion Tax & Beyond. {txt('All rights reserved.', 'Todos los derechos reservados.')}</p>
        <div className="footer-legal">
          <a href="#privacy">{txt('Privacy Summary', 'Resumen de Privacidad')}</a>
          <a href="#terms">{txt('Terms Summary', 'Resumen de Terminos')}</a>
        </div>
      </div>

      <div className="footer-legal-content">
        <section id="privacy" className="legal-panel">
          <h5>{txt('Privacy Summary', 'Resumen de Privacidad')}</h5>
          <p>
            {copy(
              'AXION uses the information you provide to prepare services, organize your portal workflow, and communicate about your tax file. Production security and live delivery depend on the configured hosting and messaging environment.',
              'AXION usa la informacion que usted proporciona para preparar servicios, organizar su flujo en portal y comunicarse sobre su expediente fiscal. La seguridad en produccion y el envio en vivo dependen del entorno configurado de alojamiento y mensajeria.',
              'We use your info for prep, portal workflow, and updates.',
              'Usamos su informacion para preparacion, portal y actualizaciones.'
            )}
          </p>
        </section>
        <section id="terms" className="legal-panel">
          <h5>{txt('Terms Summary', 'Resumen de Terminos')}</h5>
          <p>
            {copy(
              'Educational tools on this site support preparation and planning, but they do not replace tax judgment on a final filing. Final recommendations depend on complete records and a professional review.',
              'Las herramientas educativas de este sitio apoyan preparacion y planificacion, pero no reemplazan el criterio fiscal sobre una declaracion final. Las recomendaciones finales dependen de registros completos y de una revision profesional.',
              'Tools help with prep, not final filing judgment.',
              'Las herramientas ayudan a prepararse, no sustituyen el criterio final.'
            )}
          </p>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
