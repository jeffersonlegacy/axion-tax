import React from 'react';
import { useLanguage } from '../../context/useLanguage';
import './ReviewSection.css';

const ReviewSection = () => {
  const { language } = useLanguage();
  const isSpanish = language === 'es';

  const reviews = [
    {
      id: 1,
      name: "Maria G.",
      location: "Concord, CA",
      text: isSpanish
        ? "Axion hace la temporada de impuestos mucho más fácil. Hablan inglés y español, y explican todo súper claro. Recomiendo mucho su portal seguro."
        : "Axion makes tax season stress-free. They speak both English and Spanish, making it so easy to understand everything. Highly recommend their secure portal!",
      rating: 5
    },
    {
      id: 2,
      name: "James T.",
      location: "Pleasant Hill, CA",
      text: isSpanish
        ? "Rápidos, precisos y muy profesionales. Encontraron deducciones para mi pequeño negocio que yo ni conocía. La contabilidad es excelente."
        : "Fast, accurate, and very professional. They found deductions for my small business I didn't even know about. The bookkeeping service is top-notch.",
      rating: 5
    },
    {
      id: 3,
      name: "Elena R.",
      location: "Concord, CA",
      text: isSpanish
        ? "Excelente servicio. Me ayudaron con mi negocio y fueron muy pacientes explicando todo el proceso. Muy confiables."
        : "Excellent service. They helped with my business and explained the full process patiently. Very trustworthy.",
      rating: 5
    }
  ];

  return (
    <section className="reviews-section">
      <div className="reviews-overlay"></div>
      <div className="reviews-content">
        <h2 className="section-title">{isSpanish ? 'Lo Que Dicen Nuestros Clientes' : 'What Our Clients Say'}</h2>
        <p className="section-subtitle">{isSpanish ? 'Con la confianza de la comunidad de Concord y más allá.' : 'Trusted by the Concord community and beyond.'}</p>
        
        <div className="reviews-grid">
          {reviews.map(review => (
            <div className="review-card glass-panel" key={review.id}>
              <div className="review-stars">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="review-text">"{review.text}"</p>
              <div className="review-author">
                <div className="author-avatar">{review.name.charAt(0)}</div>
                <div className="author-info">
                  <strong>{review.name}</strong>
                  <span>{review.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="external-reviews">
          <p>{isSpanish ? 'Lea más reseñas verificadas en:' : 'Read more verified reviews on:'}</p>
          <div className="platform-links">
            <a href="https://www.yelp.com/biz/axion-tax-and-beyond-pleasant-hill" target="_blank" rel="noopener noreferrer" className="platform-link yelp">
              <span className="platform-icon">Y</span> Yelp
            </a>
            <a href="https://www.google.com/search?q=Axion+Tax+%26+Beyond+Pleasant+Hill+reviews" target="_blank" rel="noopener noreferrer" className="platform-link google">
              <span className="platform-icon">G</span> Google
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
