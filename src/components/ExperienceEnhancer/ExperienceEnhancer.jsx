import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  FileSearch,
  FileStack,
  Globe2,
  Languages,
  LayoutDashboard,
  Search,
  Sparkles,
  WandSparkles,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import './ExperienceEnhancer.css';

const ExperienceEnhancer = () => {
  const { language: siteLanguage } = useLanguage();
  const [dockOpen, setDockOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [iqLanguage, setIqLanguage] = useState(siteLanguage === 'es' ? 'es' : 'en');
  const [activeQuestion, setActiveQuestion] = useState('start');
  const isSpanish = iqLanguage === 'es';
  const shortcutPrefix = typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl';

  useEffect(() => {
    setIqLanguage(siteLanguage === 'es' ? 'es' : 'en');
  }, [siteLanguage]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
        setDockOpen(true);
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const goTo = (hash) => {
    if (typeof window === 'undefined') return;
    window.location.hash = hash;
    setDockOpen(false);
    setPaletteOpen(false);
  };

  const questions = useMemo(() => ([
    {
      id: 'start',
      icon: Sparkles,
      en: {
        question: 'I have no idea where to start.',
        answer: 'Perfect. That is honestly the most normal answer on this site. Start with Your Plan, then open the client portal once you know your lane.',
        cta: 'Open Your Plan',
      },
      es: {
        question: 'No tengo idea por donde empezar.',
        answer: 'Perfecto. Esa es una respuesta totalmente normal aqui. Empiece con Su Plan y luego abra el portal cuando ya sepa su carril.',
        cta: 'Abrir Su Plan',
      },
      run: () => goTo('#your-plan'),
    },
    {
      id: 'book',
      icon: CalendarClock,
      en: {
        question: 'I just want to book my tax meeting.',
        answer: 'Clean. Go straight to the client portal and lock in the meeting first. Everything else gets easier once there is an actual date on the calendar.',
        cta: 'Book Meeting',
      },
      es: {
        question: 'Solo quiero reservar mi cita de impuestos.',
        answer: 'Perfecto. Vaya directo al portal y asegure la cita primero. Todo lo demas se vuelve mas facil cuando ya existe una fecha real en el calendario.',
        cta: 'Reservar cita',
      },
      run: () => goTo('#portal-appointments'),
    },
    {
      id: 'docs',
      icon: FileStack,
      en: {
        question: 'What documents am I supposed to bring?',
        answer: 'That is one of the classics. Use the client portal upload lanes so W-2s, 1099s, ID, and business records land in the right spot instead of becoming a mystery pile.',
        cta: 'Open Document Lanes',
      },
      es: {
        question: '¿Que documentos se supone que debo llevar?',
        answer: 'Ese es uno de los clasicos. Use los carriles del portal para que W-2, 1099, identificacion y documentos de negocio caigan en el lugar correcto en vez de convertirse en un monton misterioso.',
        cta: 'Abrir carriles de documentos',
      },
      run: () => goTo('#portal-documents'),
    },
    {
      id: 'missing-forms',
      icon: FileSearch,
      en: {
        question: 'I am missing a W-2 or 1099.',
        answer: 'No panic. That happens a lot. Start in AXION Items for the IRS capture guidance, then upload those screenshots into the portal so nothing gets missed in the meeting.',
        cta: 'Go To IRS Capture Help',
      },
      es: {
        question: 'Me falta un W-2 o 1099.',
        answer: 'Sin panico. Eso pasa mucho. Empiece en AXION Items con la guia de captura del IRS y luego suba esas capturas al portal para que nada se pierda en la reunion.',
        cta: 'Ir a ayuda de captura IRS',
      },
      run: () => goTo('#tools'),
    },
    {
      id: 'terms',
      icon: Search,
      en: {
        question: 'These tax words are cooking me. Translate please.',
        answer: 'Respectfully, yes. The Tax Language Decoder exists for exactly that. It turns IRS-sounding words into normal-human language.',
        cta: 'Open Decoder Preview',
      },
      es: {
        question: 'Estas palabras de impuestos me estan friendo. Traduzca por favor.',
        answer: 'Con todo respeto, si. El Decodificador Fiscal existe exactamente para eso. Convierte palabras del IRS en lenguaje de persona normal.',
        cta: 'Abrir vista del decodificador',
      },
      run: () => goTo('#tools'),
    },
    {
      id: 'business',
      icon: WandSparkles,
      en: {
        question: 'I am self-employed. Do I need Schedule C?',
        answer: 'Maybe, and this is where things stop being cute. If you have sole-proprietor or 1099 business activity, the Schedule C workspace helps organize the draft before filing.',
        cta: 'Open Schedule C',
      },
      es: {
        question: 'Soy independiente. ¿Necesito Schedule C?',
        answer: 'Tal vez, y aqui es donde la cosa deja de ser tan linda. Si tiene actividad de negocio como propietario unico o ingresos 1099, el espacio de Schedule C ayuda a organizar el borrador antes de presentar.',
        cta: 'Abrir Schedule C',
      },
      run: () => goTo('#portal-schedule-c'),
    },
    {
      id: 'money',
      icon: LayoutDashboard,
      en: {
        question: 'Can I check for lost refunds or unclaimed money?',
        answer: 'Yes, and you should do it with free official tools, not a random locator charging you for vibes. The Find My Money section walks it out clearly.',
        cta: 'Find My Money',
      },
      es: {
        question: '¿Puedo revisar reembolsos perdidos o dinero no reclamado?',
        answer: 'Si, y debe hacerlo con herramientas oficiales gratis, no con un localizador raro cobrandole por pura vibra. La seccion Find My Money lo explica con claridad.',
        cta: 'Buscar dinero perdido',
      },
      run: () => goTo('#find-my-money'),
    },
  ]), []);

  const quickActions = useMemo(() => ([
    {
      id: 'portal',
      icon: LayoutDashboard,
      label: isSpanish ? 'Portal del cliente' : 'Client portal',
      run: () => goTo('#portal'),
    },
    {
      id: 'tools',
      icon: Sparkles,
      label: isSpanish ? 'AXION Items' : 'AXION Items',
      run: () => goTo('#tools'),
    },
    {
      id: 'calendar',
      icon: CalendarClock,
      label: isSpanish ? 'Calendario fiscal' : 'Deadline calendar',
      run: () => goTo('#tax-deadline-planner'),
    },
  ]), [isSpanish]);

  const commandActions = useMemo(
    () =>
      questions.map((item) => ({
        id: item.id,
        icon: item.icon,
        label: isSpanish ? item.es.question : item.en.question,
        tags: `${item.en.question} ${item.es.question}`.toLowerCase(),
        run: item.run,
      })),
    [isSpanish, questions]
  );

  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commandActions;
    return commandActions.filter((action) => action.tags.includes(normalized));
  }, [commandActions, query]);

  return (
    <>
      <button
        type="button"
        className="axion-iq-fab"
        onClick={() => setDockOpen((prev) => !prev)}
        aria-label={isSpanish ? 'Abrir AXION Ayuda' : 'Open AXION Ayuda'}
      >
        <Bot size={18} />
        <span>AXION Ayuda</span>
      </button>

      {dockOpen && (
        <aside className="axion-iq-dock glass-panel">
          <div className="iq-dock-head">
            <div>
              <p className="iq-kicker">{isSpanish ? 'Conserje del sitio' : 'Site concierge'}</p>
              <h3>AXION Ayuda</h3>
            </div>
            <button type="button" onClick={() => setDockOpen(false)} aria-label={isSpanish ? 'Cerrar' : 'Close'}>
              <X size={16} />
            </button>
          </div>

          <div className="iq-intro-card">
            <strong>
              {isSpanish ? 'Haga clic en una pregunta comun.' : 'Pick the question that sounds like you.'}
            </strong>
            <p>
              {isSpanish
                ? 'Yo hago la parte amable, usted hace clic, y juntos llegamos al lugar correcto sin drama tributario.'
                : 'I do the friendly part, you do the clicking, and together we avoid tax-season chaos.'}
            </p>
          </div>

          <div className="iq-language-row" role="group" aria-label={isSpanish ? 'Idioma de AXION Ayuda' : 'AXION Ayuda language'}>
            <span><Languages size={14} /> {isSpanish ? 'Idioma de ayuda' : 'Help language'}</span>
            <div className="iq-segmented">
              <button type="button" className={iqLanguage === 'en' ? 'active' : ''} onClick={() => setIqLanguage('en')}>
                English
              </button>
              <button type="button" className={iqLanguage === 'es' ? 'active' : ''} onClick={() => setIqLanguage('es')}>
                Español
              </button>
            </div>
          </div>

          <div className="iq-shortcuts">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.id} type="button" onClick={action.run}>
                  <Icon size={14} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>

          <div className="iq-question-list">
            {questions.map((item) => {
              const Icon = item.icon;
              const content = isSpanish ? item.es : item.en;
              const isActive = activeQuestion === item.id;
              return (
                <article key={item.id} className={`iq-question-card ${isActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="iq-question-trigger"
                    onClick={() => setActiveQuestion((prev) => (prev === item.id ? '' : item.id))}
                    aria-expanded={isActive}
                  >
                    <div className="iq-question-top">
                      <div className="iq-question-icon">
                        <Icon size={15} />
                      </div>
                      <strong>{content.question}</strong>
                    </div>
                    <ChevronDown size={16} className="iq-question-chevron" />
                  </button>

                  {isActive && (
                    <div className="iq-question-answer">
                      <p>{content.answer}</p>
                      <div className="iq-question-actions">
                        <button type="button" className="iq-question-cta" onClick={item.run}>
                          <span>{content.cta}</span>
                          <ChevronRight size={15} />
                        </button>
                        <button type="button" className="iq-question-dismiss" onClick={() => setActiveQuestion('')}>
                          {isSpanish ? 'Ver otras preguntas' : 'See other questions'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <button type="button" className="iq-search-trigger" onClick={() => setPaletteOpen(true)}>
            <Search size={15} />
            <span>{isSpanish ? 'Buscar otra pregunta o accion' : 'Search another question or action'}</span>
            <kbd>{shortcutPrefix} + K</kbd>
          </button>
        </aside>
      )}

      {paletteOpen && (
        <div className="axion-command-wrap" onClick={() => setPaletteOpen(false)} role="presentation">
          <div className="axion-command" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="axion-command-head">
              <Search size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isSpanish ? 'Busque una pregunta o accion...' : 'Search a question or action...'}
              />
              <button type="button" className="axion-command-language" onClick={() => setIqLanguage((prev) => (prev === 'en' ? 'es' : 'en'))}>
                <Globe2 size={14} />
                {iqLanguage === 'en' ? 'ES' : 'EN'}
              </button>
              <kbd>Esc</kbd>
            </div>
            <div className="axion-command-list">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.id} type="button" onClick={action.run} className="axion-command-item">
                    <Icon size={16} />
                    <span>{action.label}</span>
                  </button>
                );
              })}
              {filteredActions.length === 0 && (
                <p className="axion-command-empty">
                  {isSpanish ? 'Nada aparecio. Pruebe otra palabra o abra una pregunta comun.' : 'Nothing popped up. Try another word or use one of the common questions.'}
                </p>
              )}
            </div>
            <div className="axion-command-foot">
              <span>{isSpanish ? 'Atajo:' : 'Shortcut:'} <kbd>{shortcutPrefix} + K</kbd></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExperienceEnhancer;
