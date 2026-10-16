import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ClipboardCheck, Download, PiggyBank, TriangleAlert } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import './ClientToolsSection.css';

const STORAGE_KEY = 'axion-tools-state-v3';

const checklistCatalog = [
  { id: 'identity', en: 'Government photo ID for each filer', es: 'Identificacion oficial con foto de cada contribuyente' },
  { id: 'ssn_itin', en: 'SSN or ITIN letters/cards', es: 'Cartas o tarjetas de SSN o ITIN' },
  { id: 'w2_1099', en: 'All W-2 and 1099 income forms', es: 'Todos los formularios de ingresos W-2 y 1099' },
  { id: 'business_income', en: 'Business income report (cash, apps, invoices)', es: 'Reporte de ingresos del negocio (efectivo, apps, facturas)' },
  { id: 'expenses', en: 'Expense receipts and categorized totals', es: 'Recibos de gastos y totales por categoria' },
  { id: 'mileage', en: 'Mileage log or vehicle usage summary', es: 'Bitacora de millaje o resumen de uso del vehiculo' },
  { id: 'bank', en: 'Business or personal bank statements that support your return', es: 'Estados de cuenta personales o del negocio que respalden su declaracion' },
  { id: 'dependents', en: 'Dependent documentation and childcare receipts', es: 'Documentos de dependientes y recibos de cuidado infantil' },
  { id: 'health', en: '1095-A or other health coverage forms', es: 'Formulario 1095-A u otros formularios de cobertura medica' },
  { id: 'last_return', en: 'Last year tax return copy', es: 'Copia de la declaracion del ano anterior' }
];

const DEFAULT_RESERVE_INPUTS = {
  monthlyRevenue: '',
  monthlyExpenses: '',
  reserveRate: '28'
};

const DEFAULT_DEADLINE_YEAR = '2026';

const getDefaultChecklistState = () => checklistCatalog.reduce((acc, item) => {
  acc[item.id] = false;
  return acc;
}, {});

const normalizeInputState = (defaults, source) => {
  const normalized = {};

  Object.keys(defaults).forEach((key) => {
    normalized[key] = typeof source?.[key] === 'string' ? source[key] : defaults[key];
  });

  return normalized;
};

const mergeChecklistState = (source) => {
  const defaults = getDefaultChecklistState();
  if (!source || typeof source !== 'object') return defaults;

  Object.keys(defaults).forEach((key) => {
    defaults[key] = Boolean(source[key]);
  });

  return defaults;
};

const getPersistedToolState = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const buildDeadlineEvents = (year) => {
  const nextYear = year + 1;
  return [
    {
      date: `${year}-01-31`,
      titleEn: 'W-2 and 1099 collection checkpoint',
      titleEs: 'Revision de recepcion W-2 y 1099',
      noteEn: 'Confirm all payers have been accounted for before prep begins.',
      noteEs: 'Confirme que todos los pagadores esten incluidos antes de iniciar la preparacion.'
    },
    {
      date: `${year}-04-15`,
      titleEn: 'Federal filing and payment target',
      titleEs: 'Fecha federal de declaracion y pago',
      noteEn: 'Main filing day for most individual returns and tax payments.',
      noteEs: 'Fecha principal para la mayoria de las declaraciones individuales y pagos.'
    },
    {
      date: `${year}-06-15`,
      titleEn: 'Quarterly estimated tax payment (Q2)',
      titleEs: 'Pago estimado trimestral (Q2)',
      noteEn: 'Useful for self-employed clients making quarterly transfers.',
      noteEs: 'Util para clientes independientes que hacen pagos trimestrales.'
    },
    {
      date: `${year}-09-15`,
      titleEn: 'Quarterly estimated tax payment (Q3)',
      titleEs: 'Pago estimado trimestral (Q3)',
      noteEn: 'Review cash flow and refresh your reserve plan before this date.',
      noteEs: 'Revise su flujo de caja y ajuste su reserva antes de esta fecha.'
    },
    {
      date: `${year}-10-15`,
      titleEn: 'Extended return filing deadline',
      titleEs: 'Fecha limite de declaracion con prorroga',
      noteEn: 'Final filing day for returns already placed on extension.',
      noteEs: 'Fecha final para declaraciones ya puestas en prorroga.'
    },
    {
      date: `${nextYear}-01-15`,
      titleEn: 'Quarterly estimated tax payment (Q4)',
      titleEs: 'Pago estimado trimestral (Q4)',
      noteEn: `Final estimated payment target for ${year} self-employment income.`,
      noteEs: `Ultimo pago estimado para ingresos de trabajo independiente de ${year}.`
    }
  ];
};

const parseAmount = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const toCurrency = (value, locale = 'en-US') => new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(value);

const formatDisplayDate = (isoDate, locale = 'en-US') => new Date(`${isoDate}T12:00:00`).toLocaleDateString(locale, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

const incrementIsoDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
};

const escapeIcsText = (value) => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/,/g, '\\,')
  .replace(/;/g, '\\;');

const toIcsDate = (isoDate) => isoDate.replaceAll('-', '');

const downloadFile = (filename, content, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const ClientToolsSection = ({
  embedded = false,
  showHeader = true,
  standalone = false,
  pulseTarget = '',
  visibleTools = ['reserve', 'checklist', 'deadline']
}) => {
  const { language, pickCopy } = useLanguage();
  const isSpanish = language === 'es';
  const copy = (en, es, basicEn = en, basicEs = es) => pickCopy(en, es, basicEn, basicEs);
  const locale = isSpanish ? 'es-US' : 'en-US';
  const persistedState = useMemo(() => getPersistedToolState(), []);
  const visibleToolSet = useMemo(() => new Set(visibleTools), [visibleTools]);

  const [reserveInputs, setReserveInputs] = useState(() => normalizeInputState(DEFAULT_RESERVE_INPUTS, persistedState?.reserveInputs));
  const [deadlineYear, setDeadlineYear] = useState(() => (
    typeof persistedState?.deadlineYear === 'string' ? persistedState.deadlineYear : DEFAULT_DEADLINE_YEAR
  ));
  const [checklistState, setChecklistState] = useState(() => mergeChecklistState(persistedState?.checklistState));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reserveInputs,
      deadlineYear,
      checklistState
    }));
  }, [checklistState, deadlineYear, reserveInputs]);

  const reserveResult = useMemo(() => {
    const monthlyRevenue = parseAmount(reserveInputs.monthlyRevenue);
    const monthlyExpenses = parseAmount(reserveInputs.monthlyExpenses);
    const reserveRate = Math.max(0, parseAmount(reserveInputs.reserveRate));
    const monthlyNet = Math.max(0, monthlyRevenue - monthlyExpenses);
    const monthlyReserve = (monthlyNet * reserveRate) / 100;

    return {
      monthlyNet,
      monthlyReserve,
      weeklyReserve: monthlyReserve / 4,
      quarterlyReserve: monthlyReserve * 3
    };
  }, [reserveInputs.monthlyExpenses, reserveInputs.monthlyRevenue, reserveInputs.reserveRate]);

  const completedChecklistCount = useMemo(() => Object.values(checklistState).filter(Boolean).length, [checklistState]);
  const checklistProgress = Math.round((completedChecklistCount / checklistCatalog.length) * 100);

  const deadlineEvents = useMemo(() => {
    const parsedYear = Number(deadlineYear);
    if (!Number.isInteger(parsedYear) || parsedYear < 2020 || parsedYear > 2100) return [];
    return buildDeadlineEvents(parsedYear);
  }, [deadlineYear]);

  const toggleChecklistItem = (id) => {
    setChecklistState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markAllChecklist = () => {
    setChecklistState(checklistCatalog.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {}));
  };

  const clearChecklist = () => {
    setChecklistState(getDefaultChecklistState());
  };

  const updateReserveInput = (field, value) => {
    setReserveInputs((prev) => ({ ...prev, [field]: value }));
  };

  const downloadChecklistSummary = () => {
    const header = isSpanish ? 'Checklist de preparacion - Axion' : 'Axion document readiness checklist';
    const lines = checklistCatalog.map((item) => {
      const label = isSpanish ? item.es : item.en;
      const status = checklistState[item.id] ? (isSpanish ? 'Listo' : 'Ready') : (isSpanish ? 'Pendiente' : 'Pending');
      return `- ${label}: ${status}`;
    });

    const body = [
      header,
      `${isSpanish ? 'Progreso' : 'Progress'}: ${checklistProgress}%`,
      '',
      ...lines
    ].join('\n');

    downloadFile('axion-document-readiness.txt', body);
  };

  const downloadDeadlineIcs = () => {
    if (deadlineEvents.length === 0) return;

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Axion Tax & Beyond//Deadline Calendar//EN'
    ];

    deadlineEvents.forEach((event, index) => {
      const start = toIcsDate(event.date);
      const end = toIcsDate(incrementIsoDate(event.date));
      const uid = `${start}-${index}@axiontb.com`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${start}T120000Z`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${escapeIcsText(isSpanish ? event.titleEs : event.titleEn)}`,
        `DESCRIPTION:${escapeIcsText(isSpanish ? event.noteEs : event.noteEn)}`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    downloadFile(`axion-deadlines-${deadlineYear}.ics`, lines.join('\r\n'), 'text/calendar;charset=utf-8');
  };

  return (
    <section className={`client-tools${embedded ? ' embedded' : ''}${standalone ? ' standalone' : ''}`} id={embedded ? undefined : 'tools'}>
      {showHeader && (
        <div className="section-header">
          <h2 className="section-title">{isSpanish ? 'Herramientas de Cliente' : 'Client Tools'}</h2>
          <p className="section-subtitle">
            {copy(
              'Simple tools that help clients arrive organized, understand quarterly saving, and keep key dates in view.',
              'Herramientas simples para llegar organizado, entender la reserva trimestral y mantener fechas clave visibles.',
              'Tools for cleaner preparation.',
              'Herramientas para una preparacion mas limpia.'
            )}
          </p>
        </div>
      )}

      <div className={`tools-grid ${visibleTools.length === 1 ? 'single-tool-grid' : ''}`}>
        {visibleToolSet.has('reserve') && (
          <article className={`tool-card glass-panel ${pulseTarget === 'quarterly-reserve-planner' ? 'section-pulse' : ''}`} id={standalone ? 'quarterly-reserve-planner' : undefined}>
            <div className="tool-head">
              <PiggyBank size={22} className="custom-icon-svg" />
              <h3>{isSpanish ? 'Reserva Fiscal Trimestral' : 'Quarterly Tax Reserve'}</h3>
            </div>
            <p className="tool-subtext">
              {copy(
                'Built for first-timers: enter what comes in each month, subtract your core business expenses, then use the reserve rate as your training-wheel target.',
                'Hecho para quien empieza: ponga lo que entra cada mes, reste sus gastos base y use la tasa de reserva como una meta practica para apartar dinero.',
                'A beginner-friendly way to plan quarterly tax savings.',
                'Una forma simple de planear ahorros trimestrales.'
              )}
            </p>

            <div className="tool-form-grid">
              <label>
                {isSpanish ? 'Ingreso mensual bruto' : 'Monthly gross revenue'}
                <input type="number" value={reserveInputs.monthlyRevenue} onChange={(event) => updateReserveInput('monthlyRevenue', event.target.value)} placeholder="0" />
              </label>
              <label>
                {isSpanish ? 'Gastos mensuales del negocio' : 'Monthly business expenses'}
                <input type="number" value={reserveInputs.monthlyExpenses} onChange={(event) => updateReserveInput('monthlyExpenses', event.target.value)} placeholder="0" />
              </label>
              <label>
                {isSpanish ? 'Tasa de reserva (%)' : 'Reserve rate (%)'}
                <input type="number" min="0" max="100" value={reserveInputs.reserveRate} onChange={(event) => updateReserveInput('reserveRate', event.target.value)} placeholder="28" />
              </label>
            </div>

            <div className="reserve-metrics">
              <div className="metric-item">
                <span>{isSpanish ? 'Neto mensual estimado' : 'Estimated monthly net'}</span>
                <strong>{toCurrency(reserveResult.monthlyNet, locale)}</strong>
              </div>
              <div className="metric-item">
                <span>{isSpanish ? 'Apartar por mes' : 'Set aside monthly'}</span>
                <strong>{toCurrency(reserveResult.monthlyReserve, locale)}</strong>
              </div>
              <div className="metric-item">
                <span>{isSpanish ? 'Apartar por semana' : 'Set aside weekly'}</span>
                <strong>{toCurrency(reserveResult.weeklyReserve, locale)}</strong>
              </div>
              <div className="metric-item">
                <span>{isSpanish ? 'Meta para cada trimestre' : 'Quarterly transfer target'}</span>
                <strong>{toCurrency(reserveResult.quarterlyReserve, locale)}</strong>
              </div>
            </div>

            <div className="tool-inline-note">
              <TriangleAlert size={16} />
              <span>
                {copy(
                  'If you are brand new to estimated payments, start by moving this amount into a separate savings account after each month closes.',
                  'Si apenas empieza con pagos estimados, comience moviendo este monto a una cuenta aparte al cerrar cada mes.',
                  'Move this amount into a separate savings account each month.',
                  'Mueva este monto a una cuenta aparte cada mes.'
                )}
              </span>
            </div>
          </article>
        )}

        {visibleToolSet.has('checklist') && (
          <article className={`tool-card glass-panel ${pulseTarget === 'tax-readiness-checklist' ? 'section-pulse' : ''}`} id={standalone ? 'tax-readiness-checklist' : undefined}>
            <div className="tool-head">
              <ClipboardCheck size={22} className="custom-icon-svg" />
              <h3>{isSpanish ? 'Checklist de Documentos' : 'Document Readiness Checklist'}</h3>
            </div>
            <p className="tool-subtext">
              {copy(
                'Check off what you already have so the Axion team spends less time chasing paper and more time reviewing strategy.',
                'Marque lo que ya tiene para que el equipo Axion pase menos tiempo persiguiendo papeles y mas tiempo revisando estrategia.',
                'Track what you already gathered.',
                'Marque lo que ya reunio.'
              )}
            </p>

            <div className="progress-strip">
              <div className="progress-fill" style={{ width: `${checklistProgress}%` }}></div>
              <span>{checklistProgress}%</span>
            </div>

            <ul className="checklist">
              {checklistCatalog.map((item) => (
                <li key={item.id}>
                  <label>
                    <input type="checkbox" checked={checklistState[item.id]} onChange={() => toggleChecklistItem(item.id)} />
                    <span>{isSpanish ? item.es : item.en}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="tool-action-row">
              <button className="btn-outline" onClick={markAllChecklist}>
                <CheckCircle2 size={16} /> {isSpanish ? 'Marcar todo' : 'Check all'}
              </button>
              <button className="btn-outline" onClick={clearChecklist}>
                {isSpanish ? 'Limpiar' : 'Clear'}
              </button>
            </div>

            <div className="tool-action-row">
              <button className="btn-primary" onClick={downloadChecklistSummary}>
                <Download size={16} /> {isSpanish ? 'Exportar checklist' : 'Export checklist'}
              </button>
            </div>

            <div className="tool-explainer">
              <strong>{isSpanish ? 'Que hace este boton de exportar' : 'What the export button is for'}</strong>
              <p>
                {copy(
                  'It downloads a simple text copy of your checklist so you can send it to yourself, text it to a family member, or use it while gathering documents away from your computer.',
                  'Descarga una copia simple de su checklist para enviarsela a usted mismo, mandarla a un familiar o usarla mientras reúne documentos lejos de la computadora.',
                  'It downloads a simple version of your checklist.',
                  'Descarga una version simple de su checklist.'
                )}
              </p>
              <p>
                {copy(
                  'On iPhone: open the downloaded file from Files, then use Share to message or email it. On Android: open Downloads or Files, tap the file, then share it through Messages, Gmail, or WhatsApp.',
                  'En iPhone: abra el archivo desde Files y luego use Share para mandarlo por mensaje o correo. En Android: abra Downloads o Files, toque el archivo y compártalo por Messages, Gmail o WhatsApp.',
                  'iPhone: open in Files and share. Android: open in Downloads/Files and share.',
                  'iPhone: abra en Files y comparta. Android: abra en Downloads/Files y comparta.'
                )}
              </p>
            </div>
          </article>
        )}

        {visibleToolSet.has('deadline') && (
          <article className={`tool-card glass-panel ${pulseTarget === 'tax-deadline-planner' ? 'section-pulse' : ''}`} id={standalone ? 'tax-deadline-planner' : undefined}>
            <div className="tool-head">
              <CalendarDays size={22} className="custom-icon-svg" />
              <h3>{isSpanish ? 'Calendario de Fechas Fiscales' : 'Deadline Calendar'}</h3>
            </div>
            <p className="tool-subtext">
              {copy(
                'Keep the filing year visible and export the key dates into your own calendar if you want reminders.',
                'Mantenga visible el ano fiscal y exporte fechas clave a su calendario si quiere recordatorios.',
                'See the important filing dates and export them.',
                'Vea las fechas importantes y exportelas.'
              )}
            </p>

            <div className="deadline-controls">
              <label>
                {isSpanish ? 'Ano tributario' : 'Tax year'}
                <input type="number" min="2020" max="2100" value={deadlineYear} onChange={(event) => setDeadlineYear(event.target.value)} />
              </label>
              <button className="btn-primary" onClick={downloadDeadlineIcs} disabled={deadlineEvents.length === 0}>
                <Download size={16} /> {isSpanish ? 'Exportar calendario (.ics)' : 'Export calendar (.ics)'}
              </button>
            </div>

            <ul className="deadline-list">
              {deadlineEvents.map((event) => (
                <li key={`${event.date}-${event.titleEn}`}>
                  <div>
                    <strong>{isSpanish ? event.titleEs : event.titleEn}</strong>
                    <span>{isSpanish ? event.noteEs : event.noteEn}</span>
                  </div>
                  <time>{formatDisplayDate(event.date, locale)}</time>
                </li>
              ))}
              {deadlineEvents.length === 0 && (
                <li className="deadline-empty">
                  {isSpanish ? 'Ingrese un ano valido entre 2020 y 2100.' : 'Enter a valid year between 2020 and 2100.'}
                </li>
              )}
            </ul>
          </article>
        )}
      </div>

      <p className="tools-disclaimer">
        {copy(
          'These planning tools help clients prepare cleanly. They do not replace a final tax position or a professional review.',
          'Estas herramientas ayudan a prepararse mejor. No reemplazan una posicion fiscal final ni una revision profesional.',
          'Planning tools only.',
          'Herramientas de planificacion.'
        )}
      </p>
    </section>
  );
};

export default ClientToolsSection;
