import React from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileStack,
  Languages,
  ShieldCheck,
  Star,
  UploadCloud,
  UserRoundSearch,
  WalletCards,
} from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import HeroSection from '../components/HeroSection/HeroSection';
import './HomePage.css';

const HomePage = () => {
  const { language, pickCopy } = useLanguage();
  const isSpanish = language === 'es';
  const txt = (en, es) => (isSpanish ? es : en);
  const copy = (en, es, basicEn = en, basicEs = es) => pickCopy(en, es, basicEn, basicEs);
  const [activeFaxion, setActiveFaxion] = React.useState(0);
  const faxionCardRefs = React.useRef([]);

  const audiencePills = [
    txt('W-2 households', 'Hogares con W-2'),
    txt('1099 and self-employed', '1099 y trabajo independiente'),
    txt('Small business owners', 'Dueños de pequeños negocios'),
    txt('Bilingual and ITIN support', 'Soporte bilingue e ITIN'),
  ];

  const valueCards = [
    {
      icon: <Languages size={22} className="custom-icon-svg" />,
      title: txt('Complex tax questions, explained simply', 'Preguntas fiscales complejas, explicadas simple'),
      body: copy(
        'AXION turns gray-area tax language into clear next steps so people know what matters, what to gather, and what to ask before filing.',
        'AXION convierte el lenguaje fiscal gris en pasos claros para que la gente sepa que importa, que reunir y que preguntar antes de declarar.',
        'We make tax language clear.',
        'Hacemos claro el lenguaje fiscal.'
      ),
    },
    {
      icon: <FileStack size={22} className="custom-icon-svg" />,
      title: txt('The meeting gets cleaner before it ever starts', 'La reunion se limpia antes de que empiece'),
      body: copy(
        'Income forms, business records, and personal documents go into the right lanes first, which means less confusion and less cleanup later.',
        'Los formularios de ingresos, registros del negocio y documentos personales entran primero al carril correcto, lo que significa menos confusion y menos limpieza despues.',
        'Clean files create better meetings.',
        'Archivos limpios crean mejores reuniones.'
      ),
    },
    {
      icon: <ShieldCheck size={22} className="custom-icon-svg" />,
      title: txt('The value is not just filing. It is confidence.', 'El valor no es solo declarar. Es confianza.'),
      body: copy(
        'Clients pay for speed, precision, calm guidance, and stronger judgment when the real filing decisions start to matter.',
        'Los clientes pagan por velocidad, precision, orientacion tranquila y mejor criterio cuando las decisiones reales de declaracion empiezan a importar.',
        'The service delivers clarity and confidence.',
        'El servicio entrega claridad y confianza.'
      ),
    },
  ];

  const axionSteps = [
    {
      step: '01',
      icon: <WalletCards size={20} className="custom-icon-svg" />,
      title: txt('Open your free client profile', 'Abra su perfil de cliente gratis'),
      body: copy(
        'Choose your tax professional and open one secure place to handle your prep from start to finish.',
        'Elija su profesional fiscal y abra un solo lugar seguro para manejar su preparacion de principio a fin.',
        'Open your client profile first.',
        'Abra primero su perfil de cliente.'
      ),
    },
    {
      step: '02',
      icon: <UploadCloud size={20} className="custom-icon-svg" />,
      title: txt('Upload only what matters', 'Suba solo lo que importa'),
      body: copy(
        'W-2, business, and personal records go into simple lanes so nothing gets buried in tax terminology or random uploads.',
        'Los registros W-2, de negocio y personales van a carriles simples para que nada se pierda en la terminologia fiscal o en cargas al azar.',
        'Upload the right documents into the right lanes.',
        'Suba los documentos correctos a los carriles correctos.'
      ),
    },
    {
      step: '03',
      icon: <CalendarDays size={20} className="custom-icon-svg" />,
      title: txt('Meet with a cleaner file and a stronger plan', 'Reunase con un expediente mas limpio y un mejor plan'),
      body: copy(
        'AXION uses that cleaner packet to spend more time on accuracy, missing opportunities, and better tax judgment instead of basic cleanup.',
        'AXION usa ese paquete mas limpio para dedicar mas tiempo a la precision, oportunidades perdidas y mejor criterio fiscal en lugar de limpieza basica.',
        'A cleaner file leads to a better meeting.',
        'Un expediente mas limpio lleva a una mejor reunion.'
      ),
    },
  ];

  const profilePerks = [
    {
      title: txt('Choose your tax professional first', 'Elija primero su profesional fiscal'),
      body: copy(
        'Your workspace, reminders, and prep flow follow the advisor you select at signup.',
        'Su espacio, recordatorios y flujo de preparacion siguen al asesor que elige al registrarse.',
        'Your profile follows your advisor.',
        'Su perfil sigue a su asesor.'
      ),
    },
    {
      title: txt('Book, upload, and prepare in one place', 'Reserve, suba y preparese en un solo lugar'),
      body: copy(
        'The calendar, upload lanes, checklist, and next steps all sit inside the same profile.',
        'El calendario, carriles de carga, checklist y siguientes pasos viven dentro del mismo perfil.',
        'Everything important sits in one place.',
        'Todo lo importante vive en un solo lugar.'
      ),
    },
    {
      title: txt('Client tools unlock at no extra charge', 'Las herramientas del cliente se desbloquean sin costo extra'),
      body: copy(
        'The tax language decoder, amortization help, IRS form recovery, and other guided tools open once your client profile is active.',
        'El decodificador fiscal, ayuda de amortizacion, recuperacion de formularios del IRS y otras herramientas guiadas se abren cuando su perfil de cliente esta activo.',
        'Client tools unlock inside the profile.',
        'Las herramientas se abren dentro del perfil.'
      ),
    },
    {
      title: txt('Stay guided in English or Spanish', 'Mantengase guiado en ingles o espanol'),
      body: copy(
        'The same profile stays clear in both languages so clients are not forced to guess their way through the process.',
        'El mismo perfil se mantiene claro en ambos idiomas para que el cliente no tenga que adivinar durante el proceso.',
        'The profile stays clear in both languages.',
        'El perfil se mantiene claro en ambos idiomas.'
      ),
    },
  ];

  const reviews = [
    {
      id: 1,
      name: 'Maria G.',
      location: 'Concord, CA',
      text: copy(
        'Axion makes tax season stress-free. They explain everything clearly and the secure portal makes the whole process feel organized.',
        'Axion hace la temporada de impuestos mucho mas tranquila. Explican todo claramente y el portal seguro hace que todo el proceso se sienta organizado.',
        'The portal made everything easier to understand.',
        'El portal hizo todo mas facil de entender.'
      ),
    },
    {
      id: 2,
      name: 'James T.',
      location: 'Pleasant Hill, CA',
      text: copy(
        'Fast, accurate, and professional. They found opportunities for my small business and made the prep side feel much less chaotic.',
        'Rapidos, precisos y profesionales. Encontraron oportunidades para mi pequeno negocio y hicieron que la preparacion se sintiera mucho menos caotica.',
        'Fast, accurate, and worth it.',
        'Rapidos, precisos y vale la pena.'
      ),
    },
  ];

  const faxionFacts = [
    {
      number: '01',
      category: txt('IRS Scale', 'Escala del IRS'),
      visualSrc: '/assets/faxion/fact-01.png',
      visualLabel: txt('IRS revenue machine', 'Maquina de ingresos del IRS'),
      takeaway: txt('The IRS collected more than $5.2 trillion in one year.', 'El IRS recaudo mas de $5.2 billones en un solo ano.'),
      body: copy(
        'The IRS is one of the most efficient collection machines on earth. In fiscal year 2025, the federal government pulled in about $5.26 trillion in revenue, which works out to roughly $15,400 collected per person in the country.',
        'El IRS es una de las maquinas de cobro mas eficientes del planeta. En el ano fiscal 2025, el gobierno federal recaudo alrededor de $5.26 billones, o cerca de $15,400 por cada persona del pais.',
        'The IRS collected about $5.26 trillion in 2025.',
        'El IRS recaudo alrededor de $5.26 billones en 2025.'
      ),
    },
    {
      number: '02',
      category: txt('Filing Behavior', 'Como declaran'),
      visualSrc: '/assets/faxion/fact-02.png',
      visualLabel: txt('Professional vs self-prepared filing split', 'Division entre declaracion profesional y auto preparada'),
      takeaway: txt('Filers are almost split 50/50 between pros and DIY.', 'Los contribuyentes estan casi divididos 50/50 entre profesionales y DIY.'),
      body: copy(
        'Recent 2025 filing data shows how tight the split really is. Out of about 68.4 million e-filed returns, 34.4 million were handled by tax professionals and 33.9 million were self-prepared.',
        'Los datos recientes de 2025 muestran lo cerrado que esta el reparto. De unos 68.4 millones de declaraciones electronicas, 34.4 millones las hicieron profesionales y 33.9 millones fueron auto preparadas.',
        'About half use a pro and half go DIY.',
        'Aproximadamente la mitad usa profesional y la otra mitad DIY.'
      ),
    },
    {
      number: '03',
      category: txt('Penalty Risk', 'Riesgo de penalidades'),
      visualSrc: '/assets/faxion/fact-03.png',
      visualLabel: txt('Late-filing penalty exposure', 'Exposicion a penalidades por declarar tarde'),
      takeaway: txt('Late-filing penalties reached $17.8 billion in 2024.', 'Las penalidades por presentar tarde llegaron a $17.8 mil millones en 2024.'),
      body: copy(
        'Trying to wing taxes or ignoring them entirely gets expensive fast. Professional preparers are not just hunting deductions; they also protect clients from brutal late-filing and filing-error costs.',
        'Improvisar impuestos o ignorarlos sale caro muy rapido. Los preparadores no solo buscan deducciones; tambien protegen al cliente contra costos fuertes por retrasos y errores.',
        '$17.8 billion in penalties hit taxpayers in 2024.',
        '$17.8 mil millones en penalidades golpearon a los contribuyentes en 2024.'
      ),
    },
    {
      number: '04',
      category: txt('Income Pressure', 'Presion por ingreso'),
      visualSrc: '/assets/faxion/fact-04.png',
      visualLabel: txt('Tax burden concentration among higher earners', 'Concentracion de la carga fiscal en ingresos altos'),
      takeaway: txt('Just 24% of filers pay 87% of federal income taxes.', 'Solo 24% de los contribuyentes paga 87% de los impuestos federales sobre ingresos.'),
      body: copy(
        'The tax code gets more expensive the higher you climb. Households making over $100,000 carry roughly $1.9 trillion of the burden, which is why serious earners stop gambling on guesswork and move toward premium strategy.',
        'El codigo fiscal se vuelve mas costoso mientras sube el ingreso. Los hogares por encima de $100,000 cargan cerca de $1.9 billones del peso, por eso los ingresos altos dejan de apostar y buscan estrategia premium.',
        'Higher earners carry most of the tax burden.',
        'Los ingresos altos cargan la mayor parte del peso fiscal.'
      ),
    },
    {
      number: '05',
      category: txt('Unclaimed Money', 'Dinero no reclamado'),
      visualSrc: '/assets/faxion/fact-05.png',
      visualLabel: txt('Over $1 billion in unclaimed refunds', 'Mas de $1 mil millones en reembolsos no reclamados'),
      takeaway: txt('More than 1.14 million taxpayers left over $1 billion behind.', 'Mas de 1.14 millones de contribuyentes dejaron atras mas de $1 mil millones.'),
      body: copy(
        'For tax year 2021 alone, the IRS said over a billion dollars sat unclaimed because people never filed to collect what was already theirs.',
        'Solo para el ano fiscal 2021, el IRS dijo que mas de mil millones de dolares quedaron sin reclamar porque la gente nunca presento para cobrar lo que ya era suyo.',
        'Over $1 billion in refunds went unclaimed for 2021.',
        'Mas de $1 mil millones en reembolsos quedaron sin reclamar para 2021.'
      ),
    },
    {
      number: '06',
      category: txt('Refund Reality', 'Realidad del reembolso'),
      visualSrc: '/assets/faxion/fact-06.png',
      visualLabel: txt('Median unclaimed refund value', 'Valor mediano del reembolso no reclamado'),
      takeaway: txt('The median unclaimed refund is close to $800.', 'El reembolso no reclamado mediano se acerca a $800.'),
      body: copy(
        'This is not spare change. The median missed refund was $781, and in several states that middle-of-the-pack check was hovering around $1,000.',
        'No es calderilla. El reembolso perdido mediano fue de $781, y en varios estados ese cheque medio rondaba los $1,000.',
        'The typical missed refund is about $781.',
        'El reembolso perdido tipico es de unos $781.'
      ),
    },
    {
      number: '07',
      category: txt('Missed Filing', 'Presentacion perdida'),
      visualSrc: '/assets/faxion/fact-07.png',
      visualLabel: txt('Filing threshold confusion', 'Confusion sobre el umbral para declarar'),
      takeaway: txt('Millions lose money because they think they do not need to file.', 'Millones pierden dinero porque creen que no necesitan declarar.'),
      body: copy(
        'Low-to-moderate-income workers, students, and part-timers often assume that earning below the filing threshold means there is nothing to claim. That mistake can leave withheld wages sitting with the government.',
        'Trabajadores de ingresos bajos o moderados, estudiantes y personas de medio tiempo suelen pensar que si ganaron poco no hay nada que reclamar. Ese error deja salarios retenidos en manos del gobierno.',
        'Many people skip filing and leave their own withheld money behind.',
        'Mucha gente no declara y deja atras su propio dinero retenido.'
      ),
    },
    {
      number: '08',
      category: txt('DIY Blind Spot', 'Punto ciego DIY'),
      visualSrc: '/assets/faxion/fact-08.png',
      visualLabel: txt('Earned Income Tax Credit blind spot', 'Punto ciego del Earned Income Tax Credit'),
      takeaway: txt('DIY filers often miss the Earned Income Tax Credit.', 'Quienes hacen DIY seguido pierden el Earned Income Tax Credit.'),
      body: copy(
        'A major share of unclaimed money sits inside the EITC. People who self-prepare or never file often do not realize they qualify, so money set aside for them stays untouched.',
        'Una gran parte del dinero no reclamado esta dentro del EITC. Quienes se auto preparan o nunca presentan muchas veces no saben que califican, asi que ese dinero queda intacto.',
        'The EITC is one of the biggest missed opportunities.',
        'El EITC es una de las oportunidades mas perdidas.'
      ),
    },
    {
      number: '09',
      category: txt('Delivery Errors', 'Errores de entrega'),
      visualSrc: '/assets/faxion/fact-09.png',
      visualLabel: txt('Refund delivery mistakes', 'Errores de entrega del reembolso'),
      takeaway: txt('Refund money also gets trapped by simple DIY mistakes.', 'El dinero del reembolso tambien queda atrapado por errores simples de DIY.'),
      body: copy(
        'Wrong routing numbers, outdated addresses, and missed change-of-address filings can send money into limbo even when someone does file.',
        'Numeros de ruta incorrectos, direcciones viejas y cambios de direccion no reportados pueden dejar el dinero en limbo incluso cuando la persona si presenta.',
        'Simple delivery mistakes can trap refund money.',
        'Errores simples de entrega pueden atrapar el reembolso.'
      ),
    },
    {
      number: '10',
      category: txt('Three-Year Deadline', 'Plazo de tres anos'),
      visualSrc: '/assets/faxion/fact-10.png',
      visualLabel: txt('Three-year refund expiration clock', 'Reloj de vencimiento del reembolso a tres anos'),
      takeaway: txt('After three years, an unclaimed refund becomes a permanent 0% loan to the government.', 'Despues de tres anos, un reembolso no reclamado se vuelve un prestamo permanente al 0% para el gobierno.'),
      body: copy(
        'By law, the IRS holds an unclaimed refund for exactly three years from the original filing deadline. Miss that window and the money permanently rolls into the U.S. Treasury for general federal spending.',
        'Por ley, el IRS guarda un reembolso no reclamado por exactamente tres anos desde la fecha original para declarar. Si se pasa esa ventana, el dinero entra de forma permanente al Tesoro de Estados Unidos para gasto federal general.',
        'After three years, the refund is gone for good.',
        'Despues de tres anos, el reembolso se pierde definitivamente.'
      ),
    },
  ];

  const activeFaxionFact = faxionFacts[activeFaxion] || faxionFacts[0];
  const faxionProgress = `${((activeFaxion + 1) / faxionFacts.length) * 100}%`;

  React.useEffect(() => {
    const card = faxionCardRefs.current[activeFaxion];

    if (!card) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    card.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeFaxion]);

  return (
    <div className="home-page">
      <HeroSection />

      <section className="home-trust-strip" aria-label={txt('AXION strengths', 'Fortalezas AXION')}>
        <div>{txt('Bilingual client guidance', 'Orientacion bilingue al cliente')}</div>
        <div>{txt('Secure client profile workflow', 'Flujo seguro de perfil del cliente')}</div>
        <div>{txt('Individuals, 1099, and business prep', 'Preparacion para individuos, 1099 y negocios')}</div>
        <div>{txt('Plain-language tax support', 'Soporte fiscal en lenguaje claro')}</div>
      </section>

      <section className="home-section home-value" id="why-axion">
        <div className="section-header left-header home-value-header">
          <p className="home-kicker">{txt('Why AXION', 'Por que AXION')}</p>
          <h2 className="section-title section-title-light">
            {txt('A premium tax service should feel clear before it feels complex.', 'Un servicio fiscal premium debe sentirse claro antes que complejo.')}
          </h2>
          <p className="section-subtitle section-subtitle-wide">
            {copy(
              'Visitors should understand the value immediately: a cleaner process, calmer guidance, and a stronger meeting once their client profile is open.',
              'Los visitantes deben entender el valor de inmediato: un proceso mas limpio, una guia mas tranquila y una reunion mas fuerte una vez que su perfil de cliente este abierto.',
              'Clear process. Stronger meetings. Better guidance.',
              'Proceso claro. Reuniones mas fuertes. Mejor guia.'
            )}
          </p>
        </div>

        <div className="home-audience-row">
          {audiencePills.map((item) => (
            <span key={item} className="home-audience-pill">{item}</span>
          ))}
        </div>

        <div className="home-value-grid">
          {valueCards.map((card) => (
            <article className="home-value-card glass-panel" key={card.title}>
              <div className="home-value-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-process" id="how-axion-works">
        <div className="section-header left-header">
          <p className="home-kicker">{txt('How AXION Does It', 'Como lo hace AXION')}</p>
          <h2 className="section-title section-title-light">
            {txt('Simple steps build trust faster than tax jargon ever will.', 'Los pasos simples crean confianza mas rapido que la jerga fiscal.')}
          </h2>
          <p className="section-subtitle section-subtitle-wide">
            {copy(
              'The public site should guide people cleanly into one next move: open the client profile, prepare correctly, and show up informed.',
              'El sitio publico debe guiar a la gente limpiamente hacia un solo siguiente paso: abrir el perfil del cliente, prepararse correctamente y llegar informado.',
              'Open the profile. Prepare correctly. Meet stronger.',
              'Abra el perfil. Preparese bien. Llegue mejor.'
            )}
          </p>
        </div>

        <div className="home-process-grid-simple">
          {axionSteps.map((step) => (
            <article className="home-process-card-simple glass-panel" key={step.step}>
              <div className="home-process-meta">
                <span className="home-process-step-badge">{step.step}</span>
                <div className="home-process-icon">{step.icon}</div>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-profile" id="client-profile">
        <div className="home-profile-panel glass-panel">
          <div className="home-profile-copy">
            <p className="home-kicker">{txt('Client Profile', 'Perfil del Cliente')}</p>
            <h2>{txt('This is the move the homepage should drive toward.', 'Este es el movimiento al que la pagina debe llevar.')}</h2>
            <p>
              {copy(
                'Opening a client profile is where AXION becomes more than a brochure. It becomes a working system: advisor selection, booking, uploads, guided prep, and free client tools in one place.',
                'Abrir un perfil de cliente es donde AXION se vuelve mas que un folleto. Se vuelve un sistema de trabajo: seleccion de asesor, citas, cargas, preparacion guiada y herramientas gratis del cliente en un solo lugar.',
                'The client profile turns the site into a working system.',
                'El perfil convierte el sitio en un sistema real.'
              )}
            </p>
            <ul className="home-profile-checklist">
              <li>{txt('Choose your tax professional first', 'Elija primero su profesional fiscal')}</li>
              <li>{txt('Book your meeting from the same profile', 'Reserve su reunion desde el mismo perfil')}</li>
              <li>{txt('Upload documents into clear lanes', 'Suba documentos a carriles claros')}</li>
              <li>{txt('Unlock free client-only tools', 'Desbloquee herramientas gratis para clientes')}</li>
            </ul>
            <div className="home-profile-actions">
              <a href="#portal" className="btn-primary">
                {txt('Create Client Profile', 'Crear Perfil del Cliente')} <ArrowRight size={16} />
              </a>
              <a href="#tools" className="btn-outline">
                {txt('Preview AXION Items', 'Ver AXION Items')}
              </a>
            </div>
          </div>

          <div className="home-profile-side">
            {profilePerks.map((perk) => (
              <article className="home-profile-perk" key={perk.title}>
                <div className="home-profile-perk-top">
                  <CheckCircle2 size={18} className="custom-icon-svg" />
                  <h3>{perk.title}</h3>
                </div>
                <p>{perk.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-recognition" id="recognition">
        <div className="section-header left-header">
          <p className="home-kicker">{txt('Recognition And Trust', 'Reconocimiento y confianza')}</p>
          <h2 className="section-title section-title-light">
            {txt('Proof should support the value story, not distract from it.', 'La prueba debe apoyar la historia de valor, no distraer de ella.')}
          </h2>
          <p className="section-subtitle section-subtitle-wide">
            {copy(
              'Public visitors should see that AXION is trusted, polished, and built to feel credible before they ever upload a single file.',
              'Los visitantes deben ver que AXION es confiable, pulido y creible antes de subir un solo archivo.',
              'Trust matters before the first upload.',
              'La confianza importa antes de la primera carga.'
            )}
          </p>
        </div>

        <div className="home-recognition-grid">
          <article className="home-award-card glass-panel">
            <div className="home-award-media">
              <img src="/assets/google-award-2025-v2.jpg" alt={txt('AXION recognition image', 'Imagen de reconocimiento de AXION')} />
            </div>
            <div className="home-award-copy">
              <span className="home-award-tag">{txt('Premium recognition', 'Reconocimiento premium')}</span>
              <h3>{txt('AXION is positioned to feel high-trust from the first click.', 'AXION esta posicionado para sentirse de alta confianza desde el primer clic.')}</h3>
              <p>
                {copy(
                  'Clean presentation, bilingual support, and a guided prep workflow help the service feel premium before the meeting even begins.',
                  'La presentacion limpia, soporte bilingue y un flujo guiado de preparacion ayudan a que el servicio se sienta premium antes de que la reunion empiece.',
                  'The brand should feel polished and trustworthy.',
                  'La marca debe sentirse pulida y confiable.'
                )}
              </p>
            </div>
          </article>

          <div className="home-review-column">
            {reviews.map((review) => (
              <article className="home-review-card glass-panel" key={review.id}>
                <div className="home-review-stars">
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                </div>
                <p>{review.text}</p>
                <div className="home-review-author">
                  <strong>{review.name}</strong>
                  <span>{review.location}</span>
                </div>
              </article>
            ))}

            <div className="home-review-links">
              <a href="https://www.yelp.com/biz/axion-tax-and-beyond-pleasant-hill" target="_blank" rel="noopener noreferrer" className="btn-outline">
                {txt('Read Yelp reviews', 'Leer reseñas en Yelp')}
              </a>
              <a href="https://www.google.com/search?q=Axion+Tax+%26+Beyond+Pleasant+Hill+reviews" target="_blank" rel="noopener noreferrer" className="btn-outline">
                {txt('Read Google reviews', 'Leer reseñas en Google')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-faxion" id="axion-faxion">
        <div className="section-header left-header">
          <p className="home-kicker">Axion Faxion</p>
          <h2 className="section-title section-title-light">
            {txt('Before people file, they should know what is really at stake.', 'Antes de declarar, la gente debe saber lo que realmente esta en juego.')}
          </h2>
          <p className="section-subtitle section-subtitle-wide">
            {copy(
              'These facts help visitors understand why guided preparation matters. The smarter next step is still the same: open the client profile and stop guessing.',
              'Estos datos ayudan a los visitantes a entender por que importa una preparacion guiada. El siguiente paso inteligente sigue siendo el mismo: abrir el perfil del cliente y dejar de adivinar.',
              'See the stakes, then open the client profile.',
              'Vea lo que esta en juego y luego abra el perfil.'
            )}
          </p>
        </div>

        <div className="faxion-grid">
          <article className="faxion-spotlight glass-panel">
            <div className="faxion-topline">
              <span className="faxion-category">{activeFaxionFact.category}</span>
              <span className="faxion-position">{activeFaxionFact.number} / {String(faxionFacts.length).padStart(2, '0')}</span>
            </div>
            <div className="faxion-spotlight-main">
              <figure className="faxion-spotlight-visual">
                <img src={activeFaxionFact.visualSrc} alt={activeFaxionFact.visualLabel} />
                <figcaption>{activeFaxionFact.visualLabel}</figcaption>
              </figure>

              <div className="faxion-spotlight-copy">
                <div className="faxion-number">{activeFaxionFact.number}</div>
                <h3>{activeFaxionFact.takeaway}</h3>
                <p>{activeFaxionFact.body}</p>
                <div className="faxion-progress" aria-hidden="true">
                  <span style={{ width: faxionProgress }}></span>
                </div>
                <div className="faxion-actions">
                  <button
                    type="button"
                    className="faxion-nav-btn"
                    onClick={() => setActiveFaxion((prev) => (prev === 0 ? faxionFacts.length - 1 : prev - 1))}
                  >
                    {txt('Previous fact', 'Dato anterior')}
                  </button>
                  <button
                    type="button"
                    className="faxion-nav-btn active"
                    onClick={() => setActiveFaxion((prev) => (prev === faxionFacts.length - 1 ? 0 : prev + 1))}
                  >
                    {txt('Next fact', 'Siguiente dato')} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </article>

          <div className="faxion-rail-shell">
            <div className="faxion-rail" aria-label={txt('Axion Faxion fact selector', 'Selector de datos Axion Faxion')}>
              {faxionFacts.map((fact, index) => (
                <button
                  type="button"
                  key={fact.number}
                  ref={(node) => {
                    faxionCardRefs.current[index] = node;
                  }}
                  className={`faxion-rail-card ${index === activeFaxion ? 'active' : ''}`}
                  onClick={() => setActiveFaxion(index)}
                >
                  <img className="faxion-rail-thumb" src={fact.visualSrc} alt={fact.visualLabel} />
                  <div className="faxion-rail-copy">
                    <span className="faxion-rail-number">{fact.number}</span>
                    <span className="faxion-rail-category">{fact.category}</span>
                    <strong>{fact.takeaway}</strong>
                  </div>
                </button>
              ))}
            </div>

            <div className="faxion-rail-footer">
              <div className="faxion-mini-progress" aria-label={txt('Fact progress', 'Progreso de datos')}>
                {faxionFacts.map((fact, index) => (
                  <button
                    type="button"
                    key={`${fact.number}-progress`}
                    className={`faxion-mini-step ${index === activeFaxion ? 'active' : ''}`}
                    onClick={() => setActiveFaxion(index)}
                    aria-label={`${txt('Go to fact', 'Ir al dato')} ${fact.number}`}
                  >
                    <span></span>
                  </button>
                ))}
              </div>

              <div className="faxion-rail-status">
                <span>{activeFaxionFact.number}</span>
                <div className="faxion-rail-status-line" aria-hidden="true">
                  <span style={{ width: faxionProgress }}></span>
                </div>
                <span>{String(faxionFacts.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
