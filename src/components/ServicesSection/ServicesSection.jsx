import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import { BarChart3, Briefcase, ShieldCheck } from 'lucide-react';
import './ServicesSection.css';

const ServicesSection = () => {
  const { language, t } = useLanguage();
  
  const services = [
    {
      id: 'tax',
      title: language === 'en' ? 'Tax Preparation' : 'Preparación de Impuestos',
      desc: language === 'en' 
        ? 'Expert preparation for individuals and small businesses. We specialize in maximizing your refund while ensuring full IRS compliance.' 
        : 'Preparación experta para individuos y pequeñas empresas. Nos especializamos en maximizar su reembolso asegurando el cumplimiento total del IRS.',
      icon: <BarChart3 size={32} className="custom-icon-svg" />,
      link: "#tools"
    },
    {
      id: 'bookkeeping',
      title: language === 'en' ? 'Full Bookkeeping' : 'Contabilidad Completa',
      desc: language === 'en'
        ? 'Accurate financial tracking. We handle your records with professionalism so you can focus on your business.'
        : 'Seguimiento financiero preciso. Manejamos sus registros con profesionalismo para que pueda concentrarse en su negocio.',
      icon: <Briefcase size={32} className="custom-icon-svg" />,
      link: "#portal"
    },
    {
      id: 'itin',
      title: language === 'en' ? 'ITIN & Notary' : 'ITIN y Notario',
      desc: language === 'en'
        ? 'IRS Acceptance Agent services. Fast, reliable ITIN applications and notary services.'
        : 'Servicios de Agente de Aceptación del IRS. Solicitudes de ITIN y servicios notariales rápidos y confiables.',
      icon: <ShieldCheck size={32} className="custom-icon-svg" />,
      link: "#portal"
    }
  ];

  return (
    <section className="services" id="services">
      <div className="section-header">
        <h2 className="section-title">{t('services.title')}</h2>
        <p className="section-subtitle">{t('services.subtitle')}</p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div className="service-card glass-panel" key={service.id}>
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.desc}</p>
            <a href={service.link} className="service-link">
              {t('services.learnMore')} <span>→</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
