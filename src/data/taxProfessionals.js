export const TAX_PROFESSIONALS = [
  {
    id: 'ray',
    name: 'Ray',
    phone: '(510) 555-5555',
    quote: {
      en: 'I keep the process calm, clear, and moving. If something feels confusing, we will straighten it out together.',
      es: 'Mantengo el proceso tranquilo, claro y en movimiento. Si algo se siente confuso, lo vamos a aclarar juntos.',
    },
    specialties: {
      en: ['W-2 households', 'Self-employed filers', 'Clean document prep'],
      es: ['Hogares con W-2', 'Contribuyentes independientes', 'Preparacion limpia de documentos'],
    },
  },
  {
    id: 'bianca',
    name: 'Bianca',
    phone: '(510) 555-0142',
    quote: {
      en: 'I like turning tax stress into a simple plan. We will focus on what matters and skip the noise.',
      es: 'Me gusta convertir el estres fiscal en un plan simple. Vamos a enfocarnos en lo que importa y dejar fuera el ruido.',
    },
    specialties: {
      en: ['Families with dependents', 'Bilingual support', 'Late or missing forms'],
      es: ['Familias con dependientes', 'Apoyo bilingue', 'Formularios tardios o faltantes'],
    },
  },
  {
    id: 'marcus',
    name: 'Marcus',
    phone: '(510) 555-0188',
    quote: {
      en: 'If your taxes have moving parts, that is fine. I help business owners and side hustlers get organized fast.',
      es: 'Si sus impuestos tienen varias piezas moviendose, esta bien. Ayudo a duenos de negocio y trabajadores independientes a organizarse rapido.',
    },
    specialties: {
      en: ['1099 income', 'Schedule C cleanup', 'Quarterly planning'],
      es: ['Ingresos 1099', 'Limpieza de Schedule C', 'Planificacion trimestral'],
    },
  },
];

export const getTaxProfessionalById = (id) => TAX_PROFESSIONALS.find((entry) => entry.id === id) || null;
