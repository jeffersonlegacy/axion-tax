import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import './YourPlanPage.css';

const YourPlanPage = () => {
  const { pickCopy } = useLanguage();
  const copy = (en, es, basicEn = en, basicEs = es) => pickCopy(en, es, basicEn, basicEs);

  const highlights = [
    {
      title: copy('Free client profile', 'Perfil de cliente gratis'),
      body: copy(
        'Open one workspace, choose your tax professional, and keep every next step in one place.',
        'Abra un solo espacio, elija su profesional de impuestos y mantenga cada siguiente paso en un solo lugar.',
        'One free workspace keeps your prep together.',
        'Un solo espacio gratis mantiene su preparacion unida.'
      ),
    },
    {
      title: copy('Simple document path', 'Ruta simple para documentos'),
      body: copy(
        'You will know what belongs there, what does not, and what AXION still needs before the meeting.',
        'Sabra que va alli, que no va alli y que mas necesita AXION antes de la reunion.',
        'We show you what to upload and what to skip.',
        'Le mostramos que subir y que omitir.'
      ),
    },
    {
      title: copy('Real support before the meeting', 'Apoyo real antes de la reunion'),
      body: copy(
        'The portal is built to reduce confusion, missed forms, and last-minute scrambling.',
        'El portal esta hecho para reducir confusion, formularios faltantes y las prisas de ultima hora.',
        'The portal lowers confusion before the meeting.',
        'El portal reduce la confusion antes de la reunion.'
      ),
    },
  ];

  const steps = [
    {
      number: '01',
      eyebrow: copy('Start Here', 'Empiece aqui'),
      title: copy('Open your free client profile and choose your tax professional.', 'Abra su perfil gratis y elija su profesional de impuestos.'),
      body: copy(
        'This is where AXION becomes personal. You pick the person guiding your file, and the portal starts speaking to you with that advisor in mind.',
        'Aqui es donde AXION se vuelve personal. Usted elige a la persona que guiara su expediente y el portal empieza a hablarle con ese asesor en mente.',
        'Choose your tax professional first so the portal can guide you clearly.',
        'Elija primero a su profesional para que el portal le guie con claridad.'
      ),
      bullet: copy('Best for anyone who wants one secure place to start instead of guessing what to do next.', 'Ideal para quien quiere un solo lugar seguro para empezar en vez de adivinar el siguiente paso.'),
      visual: '/assets/your-plan/portal-main.png',
      alt: copy('AXION client portal overview', 'Vista general del portal del cliente AXION'),
    },
    {
      number: '02',
      eyebrow: copy('Lock In Time', 'Asegure su cita'),
      title: copy('Book the meeting first so the rest of the prep has direction.', 'Reserve primero la reunion para que el resto de la preparacion tenga direccion.'),
      body: copy(
        'Once your date is on the calendar, the portal becomes a plan. You stop drifting and start preparing around a real review.',
        'Una vez que su fecha esta en el calendario, el portal se vuelve un plan. Deja de improvisar y empieza a prepararse para una revision real.',
        'Booking first gives the whole process direction.',
        'Reservar primero le da direccion a todo el proceso.'
      ),
      bullet: copy('Great for busy people who want a calm deadline and fewer back-and-forth messages.', 'Excelente para personas ocupadas que quieren una fecha clara y menos mensajes de ida y vuelta.'),
      visual: '/assets/your-plan/portal-appointment.png',
      alt: copy('AXION appointment booking view', 'Vista de reserva de citas AXION'),
    },
    {
      number: '03',
      eyebrow: copy('Upload Cleanly', 'Suba con orden'),
      title: copy('Upload only what applies to you, in the right lane.', 'Suba solo lo que le aplica, en el carril correcto.'),
      body: copy(
        'Jobs, business income, and personal information are separated for you. That keeps your file clean and helps your tax professional review faster.',
        'Trabajo, ingresos de negocio e informacion personal se separan para usted. Eso mantiene su expediente limpio y ayuda a que su profesional revise mas rapido.',
        'We separate your documents so your file stays clean.',
        'Separamos sus documentos para que su expediente siga limpio.'
      ),
      bullet: copy('Perfect for anyone who usually ends up with a random pile of W-2s, 1099s, IDs, and notes.', 'Perfecto para quien normalmente termina con un monton suelto de W-2, 1099, identificaciones y notas.'),
      visual: '/assets/your-plan/portal-documents.png',
      alt: copy('AXION document upload lanes', 'Carriles de carga de documentos AXION'),
    },
    {
      number: '04',
      eyebrow: copy('Use More Only When It Helps', 'Use mas solo cuando ayude'),
      title: copy('Client-only tools stay ready when your file actually needs them.', 'Las herramientas exclusivas del cliente quedan listas cuando su expediente realmente las necesita.'),
      body: copy(
        'That includes the tax language decoder, amortization support, practical prep help, and IRS form recovery. They stay inside the portal so the public site stays simple.',
        'Eso incluye el decodificador fiscal, apoyo de amortizacion, ayuda practica de preparacion y recuperacion de formularios del IRS. Permanecen dentro del portal para que el sitio publico siga simple.',
        'Deeper tools stay inside your client portal for the right moment.',
        'Las herramientas avanzadas se quedan dentro de su portal para el momento correcto.'
      ),
      bullet: copy('Best for clients who want strong tools available without being overwhelmed on day one.', 'Ideal para clientes que quieren buenas herramientas disponibles sin sentirse abrumados desde el primer dia.'),
      visual: '/assets/your-plan/portal-tools.png',
      alt: copy('AXION client tools inside portal', 'Herramientas del cliente AXION dentro del portal'),
    },
  ];

  const outcomes = [
    copy('Know what to do first', 'Sepa que hacer primero'),
    copy('Bring the right documents', 'Traiga los documentos correctos'),
    copy('Feel guided before the meeting', 'Siéntase guiado antes de la reunion'),
  ];

  return (
    <div className="your-plan-page fade-in" id="your-plan">
      <section className="your-plan-hero glass-panel">
        <div className="your-plan-hero-copy">
          <p className="your-plan-kicker">{copy('YOUR PLAN', 'SU PLAN', 'YOUR PLAN', 'SU PLAN')}</p>
          <h1>{copy('A simple client path that turns tax stress into clear next steps.', 'Una ruta simple para el cliente que convierte el estres fiscal en pasos claros.')}</h1>
          <p className="your-plan-lead">
            {copy(
              'AXION is built to help visitors become prepared clients. The goal is simple: understand your situation, open your profile, bring the right documents, and walk into the meeting already organized.',
              'AXION esta hecho para ayudar a los visitantes a convertirse en clientes preparados. La meta es simple: entender su situacion, abrir su perfil, traer los documentos correctos y llegar a la reunion ya organizado.',
              'AXION turns confusion into a clear client path.',
              'AXION convierte la confusion en una ruta clara para el cliente.'
            )}
          </p>
          <div className="your-plan-actions">
            <a href="#portal" className="btn-primary">
              {copy('Open Client Portal', 'Abrir Portal del Cliente')} <ArrowRight size={16} />
            </a>
            <a href="#tools" className="btn-outline">
              {copy('Preview Client-Only Tools', 'Ver Herramientas Exclusivas')}
            </a>
          </div>
          <div className="your-plan-outcomes">
            {outcomes.map((item) => (
              <span key={item}>
                <CheckCircle2 size={16} className="custom-icon-svg" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <figure className="your-plan-hero-visual">
          <img src="/assets/axion-hero-main.png" alt={copy('AXION client guidance visual', 'Visual de guia para clientes AXION')} />
        </figure>
      </section>

      <section className="your-plan-highlights">
        {highlights.map((item) => (
          <article className="your-plan-highlight glass-panel" key={item.title}>
            <p className="your-plan-kicker">{copy('Why it matters', 'Por que importa', 'Why it matters', 'Por que importa')}</p>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="your-plan-steps">
        <div className="your-plan-section-head">
          <p className="your-plan-kicker">{copy('How AXION Does It', 'Como lo hace AXION')}</p>
          <h2>{copy('Four direct moves. Nothing extra. Nothing confusing.', 'Cuatro movimientos directos. Nada extra. Nada confuso.')}</h2>
          <p>
            {copy(
              'This is the cleanest version of the process from a client point of view.',
              'Esta es la version mas limpia del proceso desde el punto de vista del cliente.',
              'This is the clean client flow.',
              'Este es el flujo limpio del cliente.'
            )}
          </p>
        </div>

        <div className="your-plan-step-list">
          {steps.map((step, index) => (
            <article className={`your-plan-step glass-panel ${index % 2 === 1 ? 'reverse' : ''}`} key={step.number}>
              <div className="your-plan-step-copy">
                <div className="your-plan-step-top">
                  <span className="your-plan-step-number">{step.number}</span>
                  <span className="your-plan-step-eyebrow">{step.eyebrow}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <div className="your-plan-step-note">
                  <ShieldCheck size={16} className="custom-icon-svg" />
                  <span>{step.bullet}</span>
                </div>
              </div>

              <figure className="your-plan-step-visual">
                <img src={step.visual} alt={step.alt} />
              </figure>
            </article>
          ))}
        </div>
      </section>

      <section className="your-plan-close glass-panel">
        <div>
          <p className="your-plan-kicker">{copy('The Value', 'El valor')}</p>
          <h2>{copy('The public site stays simple. The real depth opens once you are inside.', 'El sitio publico se mantiene simple. La verdadera profundidad se abre una vez que entra.')}</h2>
          <p>
            {copy(
              'That is how AXION keeps people calm: clear public guidance, then a stronger client workspace once they are ready to move.',
              'Asi es como AXION mantiene la calma: orientacion publica clara y luego un espacio de cliente mas fuerte una vez que la persona esta lista para avanzar.',
              'Simple outside. Powerful inside.',
              'Simple por fuera. Potente por dentro.'
            )}
          </p>
        </div>
        <div className="your-plan-close-actions">
          <a href="#portal" className="btn-primary">
            {copy('Start In The Client Portal', 'Empezar En El Portal Del Cliente')} <ArrowRight size={16} />
          </a>
          <div className="your-plan-close-note">
            <Sparkles size={16} className="custom-icon-svg" />
            <span>{copy('Free client profile. Guided prep. Bilingual support.', 'Perfil gratis. Preparacion guiada. Apoyo bilingue.')}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default YourPlanPage;
