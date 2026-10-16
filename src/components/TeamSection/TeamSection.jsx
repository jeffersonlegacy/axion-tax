import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import './TeamSection.css';

const TeamSection = () => {
  const { language } = useLanguage();
  const isSpanish = language === 'es';

  const teamMembers = [
    {
      id: 1,
      name: "Vanessa",
      role: isSpanish ? "Profesional Fiscal Líder" : "Lead Tax Professional",
      desc: isSpanish
        ? "Vanessa es conocida por su paciencia, calidez y gran conocimiento. Se toma el tiempo para explicar cada declaración paso a paso para que usted se sienta tranquilo y bien atendido."
        : "Vanessa is known throughout the community for her patience, warmth, and deep knowledge. She takes the time to walk clients through their returns step-by-step, ensuring they feel completely at ease and well-cared for.",
      imgSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400" // Professional Hispanic female stock
    },
    {
      id: 2,
      name: "Ray",
      role: isSpanish ? "Consultor Fiscal Senior" : "Senior Tax Consultant",
      desc: isSpanish
        ? "Los clientes valoran a Ray por su servicio rápido, amable y eficiente. Con años de experiencia, hace que el proceso sea claro y confiable para individuos y pequeños negocios."
        : "Clients appreciate Ray for his prompt, polite, and highly efficient service. With years of experience, he makes the tax process straightforward and reliable for both individuals and small business owners.",
      imgSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400" // Professional Hispanic male stock
    },
    {
      id: 3,
      name: "Angelica",
      role: isSpanish ? "Preparadora de Impuestos" : "Tax Preparer",
      desc: isSpanish
        ? "Angelica siempre da más. No solo prepara sus impuestos; también le orienta para la próxima temporada para que llegue preparado y se sienta en familia."
        : "Angelica goes the extra mile. She doesn't just file your taxes; she provides excellent advice for the upcoming tax season, making sure you are prepared and treating every client like family.",
      imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400" // Professional Hispanic female stock
    }
  ];

  return (
    <section className="team-section" id="team">
      <div className="section-header">
        <h2 className="section-title">{isSpanish ? 'Conoce a Nuestros Profesionales' : 'Meet Our Professionals'}</h2>
        <p className="section-subtitle">
          {isSpanish
            ? 'Expertos reales dedicados a su claridad financiera. Atendemos con orgullo en inglés y español.'
            : 'Real experts dedicated to your financial clarity. Proudly serving our community in English and Spanish.'}
        </p>
      </div>

      <div className="team-grid">
        {teamMembers.map((member) => (
          <div className="team-card glass-panel" key={member.id}>
            <div className="team-image-container">
              <img src={member.imgSrc} alt={`${member.name} - ${member.role}`} className="team-image" />
              <div className="team-image-overlay"></div>
            </div>
            <div className="team-info">
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-desc">{member.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
