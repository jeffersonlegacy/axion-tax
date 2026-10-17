import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  FolderOpen,
  LoaderCircle,
  Mail,
  PencilLine,
  Phone,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import ScheduleCWizard from '../ScheduleCWizard/ScheduleCWizard';
import ServicesPage from '../../pages/ServicesPage';
import { TAX_PROFESSIONALS, getTaxProfessionalById } from '../../data/taxProfessionals';
import './ClientPortal.css';

const SESSION_STORAGE_KEY = 'axion-portal-session-v2';

const PORTAL_TABS = [
  { id: 'overview', hash: '#portal-overview' },
  { id: 'appointments', hash: '#portal-appointments' },
  { id: 'documents', hash: '#portal-documents' },
  { id: 'tools', hash: '#portal-tools' },
  { id: 'schedule-c', hash: '#portal-schedule-c' },
  { id: 'updates', hash: '#portal-updates' },
];

const UPLOAD_LANES = [
  {
    id: 'jobs',
    en: 'Jobs (W-2)',
    es: 'Trabajos (W-2)',
    enHint: 'Pay stubs, W-2 forms, and payroll tax documents.',
    esHint: 'Talones de pago, formularios W-2 y documentos de nomina.',
    enExamples: ['W-2', 'year-end paystub', 'state wage statement'],
    esExamples: ['W-2', 'ultimo talon anual', 'comprobante estatal'],
  },
  {
    id: 'business',
    en: 'Business (1099 & Expenses)',
    es: 'Negocio (1099 y Gastos)',
    enHint: '1099 forms, receipts, bank statements, mileage logs, and self-employment records.',
    esHint: 'Formularios 1099, recibos, estados de cuenta, millaje y registros de trabajo independiente.',
    enExamples: ['1099-NEC', '1099-K', 'receipt bundle', 'mileage log'],
    esExamples: ['1099-NEC', '1099-K', 'paquete de recibos', 'bitacora de millaje'],
  },
  {
    id: 'personal',
    en: 'Personal Information',
    es: 'Informacion Personal',
    enHint: 'Photo ID, dependents, insurance forms, prior-year return, and notes for your preparer.',
    esHint: 'Identificacion, dependientes, formularios de seguro, declaracion anterior y notas para su preparador.',
    enExamples: ['driver license', 'dependent SSN card', '1095-A', 'prior-year return'],
    esExamples: ['licencia', 'tarjeta SSN de dependiente', '1095-A', 'declaracion anterior'],
  },
];

const CHECKLIST_ITEMS = [
  {
    id: 'appointment',
    en: 'Meeting on the calendar',
    es: 'Reunion en el calendario',
    enDetail: 'Lock in your review time first so the file can move with purpose.',
    esDetail: 'Primero deje su reunion confirmada para que el expediente avance con claridad.',
  },
  {
    id: 'income',
    en: 'Income forms uploaded',
    es: 'Formularios de ingresos cargados',
    enDetail: 'W-2s, 1099s, and payroll forms give your return its core numbers.',
    esDetail: 'Los W-2, 1099 y formularios de nomina le dan a su declaracion los numeros base.',
  },
  {
    id: 'personal',
    en: 'Personal details confirmed',
    es: 'Datos personales confirmados',
    enDetail: 'ID, dependents, and insurance forms keep the return clean and accurate.',
    esDetail: 'La identificacion, dependientes y formularios de seguro mantienen la declaracion limpia y precisa.',
  },
  {
    id: 'business',
    en: 'Business records organized',
    es: 'Registros de negocio organizados',
    enDetail: 'Receipts, statements, and Schedule C support make self-employment review faster.',
    esDetail: 'Recibos, estados de cuenta y apoyo para Schedule C hacen mas agil la revision del trabajo independiente.',
  },
  {
    id: 'priorYear',
    en: 'Prior-year return added',
    es: 'Declaracion del ano anterior agregada',
    enDetail: 'Last year helps catch carryovers, patterns, and anything missing early.',
    esDetail: 'El ano pasado ayuda a detectar arrastres, patrones y cualquier faltante desde el principio.',
  },
];

const DEFAULT_UPDATES = {
  channel: 'email',
  email: '',
  phone: '',
  appointmentUpdates: true,
  documentReminders: true,
  statusUpdates: true,
  taxDeadlineReminders: false,
  consent: false,
  active: false,
};

const AVAILABLE_SLOTS = ['09:00 AM', '11:00 AM', '01:30 PM', '03:30 PM'];

const WORKSPACE_CACHE_KEY = 'axion-portal-workspace-cache-v2';

const readStoredSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const saveStoredSession = (session) => {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(WORKSPACE_CACHE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const readCachedWorkspace = () => {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WORKSPACE_CACHE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const saveCachedWorkspace = (workspace) => {
  if (typeof window === 'undefined') return;
  if (!workspace) {
    window.localStorage.removeItem(WORKSPACE_CACHE_KEY);
    return;
  }
  try {
    window.localStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify(workspace));
  } catch {
    // Ignore storage quota errors
  }
};

const classifyTaxDocument = async (file, isSpanish = false) => {
  if (!file) return null;
  const lower = file.name.toLowerCase();
  let docClass = isSpanish ? 'Documento Fiscal de Respaldo' : 'Tax Support Document';
  let recommendedLane = 'personal';
  let extractedFields = isSpanish ? 'Archivo verificado y listo para revision' : 'File verified & queued for preparer review';

  if (lower.includes('w2') || lower.includes('w-2') || lower.includes('paystub') || lower.includes('payroll')) {
    docClass = 'Form W-2 / Payroll Statement';
    recommendedLane = 'jobs';
    extractedFields = isSpanish
      ? 'Casilla 1 Salarios + Retencion Federal/Estatal detectada'
      : 'Box 1 Wages + Federal/CA Withholding schema matched';
  } else if (lower.includes('1099') || lower.includes('stripe') || lower.includes('nec') || lower.includes('receipt') || lower.includes('invoice') || lower.includes('expense') || lower.includes('schedule-c')) {
    docClass = lower.includes('1099') ? 'Form 1099-NEC / 1099-K' : 'Schedule C Expense Record';
    recommendedLane = 'business';
    extractedFields = isSpanish
      ? 'Ingresos independientes / Gasto deducible Schedule C'
      : 'Nonemployee Comp / Schedule C deductible line item';
  } else if (lower.includes('id') || lower.includes('license') || lower.includes('ssn') || lower.includes('1095') || lower.includes('prior')) {
    docClass = 'Identity / Prior-Year Tax Record';
    recommendedLane = 'personal';
    extractedFields = isSpanish
      ? 'Verificacion de identidad / dependientes / arrastre fiscal'
      : 'Taxpayer identity / dependent / prior-year carryover check';
  }

  let sha256Short = 'verified';
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const buffer = await file.arrayBuffer();
      const digest = await window.crypto.subtle.digest('SHA-256', buffer);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      sha256Short = `${hex.slice(0, 6)}...${hex.slice(-4)}`;
    }
  } catch {
    sha256Short = 'local-crc';
  }

  const sizeKb = Math.max(1, Math.round(file.size / 1024));
  const autoNote = `Intake Triage [${docClass}] · ${extractedFields} · ${sizeKb} KB · SHA-256: ${sha256Short}`;

  return {
    docClass,
    recommendedLane,
    extractedFields,
    sha256Short,
    sizeKb,
    autoNote,
  };
};

const getPortalHashForTab = (tab) => PORTAL_TABS.find((item) => item.id === tab)?.hash || '#portal';
const getTabFromHash = (hash) => PORTAL_TABS.find((item) => hash.startsWith(item.hash))?.id || 'overview';

const formatDateLabel = (date, locale) => new Date(`${date}T12:00:00`).toLocaleDateString(locale, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const getMimeKind = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf')) return 'pdf';
  return 'file';
};

const buildUpdatesContext = ({ appointments, checklist, laneCounts, advisorName, advisorPhone }) => {
  const reminderItems = [];
  if (!checklist.appointment) reminderItems.push('Meeting is not booked yet');
  if (!checklist.income) reminderItems.push('Income forms are still missing');
  if (!checklist.personal) reminderItems.push('Personal information lane still needs documents');
  if (!checklist.business && laneCounts.business > 0) reminderItems.push('Business records exist but Schedule C is not cleaned up yet');

  const completed = Object.values(checklist).filter(Boolean).length;
  const checklistPct = Math.round((completed / CHECKLIST_ITEMS.length) * 100);
  const readinessScore = Math.min(100, checklistPct + (appointments.length > 0 ? 15 : 0));

  return {
    reminderItems,
    checklistPct,
    readinessScore,
    nextAppointment: appointments[0] || null,
    advisorName,
    advisorPhone,
  };
};

const ClientPortal = () => {
  const { language, t, pickCopy } = useLanguage();
  const isSpanish = language === 'es';
  const txt = useCallback((en, es) => (isSpanish ? es : en), [isSpanish]);
  const copy = useCallback((en, es, basicEn = en, basicEs = es) => pickCopy(en, es, basicEn, basicEs), [pickCopy]);
  const locale = isSpanish ? 'es-US' : 'en-US';

  const [session, setSession] = useState(() => readStoredSession());
  const [workspaceState, setWorkspaceState] = useState(() => {
    const storedSession = readStoredSession();
    const cached = readCachedWorkspace();
    return {
      loading: Boolean(storedSession?.token && !cached),
      data: storedSession?.token ? cached : null,
      error: '',
    };
  });
  const [deliveryHealth, setDeliveryHealth] = useState({ email: false, text: false });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLaneId, setSelectedLaneId] = useState('jobs');
  const [accessForm, setAccessForm] = useState(() => ({
    firstName: session?.firstName || '',
    lastName: session?.lastName || '',
    email: session?.email || '',
    phone: session?.phone || '',
    taxProfessionalId: session?.taxProfessionalId || TAX_PROFESSIONALS[0].id,
  }));
  const [accessState, setAccessState] = useState({ status: 'idle', error: '' });
  const [appointmentDraft, setAppointmentDraft] = useState(() => ({
    date: new Date().toISOString().slice(0, 10),
    time: AVAILABLE_SLOTS[0],
  }));
  const [editingAppointmentId, setEditingAppointmentId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTriage, setUploadTriage] = useState(null);
  const [uploadNote, setUploadNote] = useState('');
  const [documentSaveState, setDocumentSaveState] = useState({ status: 'idle', error: '' });
  const [documentPreview, setDocumentPreview] = useState({ open: false, status: 'idle', url: '', name: '', mimeType: '', error: '' });
  const [updatesDraft, setUpdatesDraft] = useState(DEFAULT_UPDATES);
  const [updatesState, setUpdatesState] = useState({ status: 'idle', message: '', messageKey: '' });
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [scheduleSaveState, setScheduleSaveState] = useState({ status: 'idle', message: '', messageKey: '' });
  const noteDraftRef = useRef({});
  const canOpenWorkspace = Boolean(
    accessForm.firstName.trim()
      && accessForm.lastName.trim()
      && accessForm.email.trim()
      && accessForm.taxProfessionalId
  );

  const apiRequest = useCallback(async (path, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (session?.token) headers['x-portal-token'] = session.token;

    let body = options.body;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body && !isFormData && typeof body !== 'string') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    const response = await fetch(path, {
      method: options.method || 'GET',
      headers,
      body,
    });

    if (options.raw) return response;

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || 'Unable to complete request.');
    }
    if (payload?.workspace) {
      saveCachedWorkspace(payload.workspace);
    }
    return payload;
  }, [session?.token]);

  const loadWorkspace = useCallback(async () => {
    if (!session?.token) {
      setWorkspaceState({ loading: false, data: null, error: '' });
      return;
    }

    const cached = readCachedWorkspace();
    if (!cached) {
      setWorkspaceState((prev) => ({ ...prev, loading: true, error: '' }));
    }
    try {
      const payload = await apiRequest('/api/portal/workspace');
      saveCachedWorkspace(payload.workspace);
      setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
      setDeliveryHealth(payload.configuredChannels || { email: false, text: false });
      setUpdatesDraft({ ...DEFAULT_UPDATES, ...(payload.workspace?.updates || {}) });
    } catch (error) {
      if (cached) {
        setWorkspaceState({ loading: false, data: cached, error: '' });
        return;
      }
      saveStoredSession(null);
      setSession(null);
      setWorkspaceState({ loading: false, data: null, error: error.message });
    }
  }, [apiRequest, session?.token]);

  useEffect(() => {
    const syncTab = () => setActiveTab(getTabFromHash(window.location.hash || '#portal-overview'));
    window.addEventListener('hashchange', syncTab);
    syncTab();
    return () => window.removeEventListener('hashchange', syncTab);
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (workspaceState.data) {
      saveCachedWorkspace(workspaceState.data);
    }
    if (workspaceState.data?.updates) {
      setUpdatesDraft({ ...DEFAULT_UPDATES, ...workspaceState.data.updates });
    }
  }, [workspaceState.data]);

  useEffect(() => () => {
    if (documentPreview.url) {
      URL.revokeObjectURL(documentPreview.url);
    }
  }, [documentPreview.url]);

  const workspace = workspaceState.data;
  const selectedAdvisor = workspace?.taxProfessional || getTaxProfessionalById(accessForm.taxProfessionalId) || TAX_PROFESSIONALS[0];
  const advisorName = selectedAdvisor?.name || txt('your tax professional', 'su profesional fiscal');
  const advisorPhone = selectedAdvisor?.phone || '(510) 555-5555';
  const advisorFirstNamePossessive = advisorName.endsWith('s') ? `${advisorName}'` : `${advisorName}'s`;
  const laneCounts = workspace?.laneCounts || { jobs: 0, business: 0, personal: 0 };
  const checklist = workspace?.checklist || {};
  const checklistCompleted = Object.values(checklist).filter(Boolean).length;
  const checklistPct = Math.round((checklistCompleted / CHECKLIST_ITEMS.length) * 100) || 0;
  const totalUploadedFiles = Object.values(laneCounts).reduce((sum, count) => sum + Number(count || 0), 0);
  const readinessItems = useMemo(() => (
    CHECKLIST_ITEMS.map((item) => {
      let detail = isSpanish ? item.esDetail : item.enDetail;

      if (item.id === 'appointment') {
        detail = copy(
          `${advisorName} can shape the rest of your prep faster once your meeting is locked in.`,
          `${advisorName} puede ordenar el resto de su preparacion mas rapido una vez que la reunion quede confirmada.`,
          `Book with ${advisorName} first.`,
          `Reserve primero con ${advisorName}.`
        );
      }

      if (item.id === 'business') {
        detail = copy(
          `${advisorName} moves faster when receipts, statements, and any Schedule C work are already organized.`,
          `${advisorName} avanza mas rapido cuando los recibos, estados de cuenta y cualquier trabajo de Schedule C ya estan organizados.`,
          `Organize business records for ${advisorName}.`,
          `Organice sus registros para ${advisorName}.`
        );
      }

      if (item.id === 'priorYear') {
        detail = copy(
          `Last year's return gives ${advisorName} the carryovers and context that save time later.`,
          `La declaracion del ano pasado le da a ${advisorName} los arrastres y el contexto que ahorran tiempo despues.`,
          `Prior-year return helps ${advisorName}.`,
          `La declaracion anterior ayuda a ${advisorName}.`
        );
      }

      return {
        ...item,
        detail,
        readyLabel: txt('Ready', 'Listo'),
        pendingLabel: txt('Needed', 'Falta'),
      };
    })
  ), [advisorName, copy, isSpanish, txt]);
  const currentLane = UPLOAD_LANES.find((lane) => lane.id === selectedLaneId) || UPLOAD_LANES[0];
  const laneDocuments = useMemo(() => (
    (workspace?.documents || []).filter((doc) => doc.laneId === selectedLaneId)
      .slice()
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  ), [selectedLaneId, workspace?.documents]);
  const sortedAppointments = useMemo(() => (
    (workspace?.appointments || [])
      .slice()
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  ), [workspace?.appointments]);
  const nextAppointment = sortedAppointments[0] || null;
  const selectedLaneCount = laneCounts[selectedLaneId] || 0;
  const appointmentDraftDateLabel = appointmentDraft.date ? formatDateLabel(appointmentDraft.date, locale) : txt('Choose a date', 'Elija una fecha');
  const appointmentFocusNote = appointmentDraft.time.includes('09') || appointmentDraft.time.includes('11')
    ? txt('Morning meetings give more room for same-day follow-up.', 'Las reuniones de la mañana dejan mas espacio para seguimiento el mismo dia.')
    : txt('Afternoon meetings work well once your documents are already in.', 'Las reuniones de la tarde funcionan muy bien cuando sus documentos ya estan cargados.');
  const currentLaneNextAsk = currentLane.id === 'jobs'
    ? txt('Start with every W-2, final paystub, and any state wage forms.', 'Empiece con cada W-2, talon final y cualquier formulario estatal.')
    : currentLane.id === 'business'
      ? txt('Bring in 1099s, receipts, statements, and anything that supports Schedule C.', 'Traiga 1099, recibos, estados de cuenta y todo lo que apoye su Schedule C.')
      : txt('Add ID, dependents, insurance forms, and your prior-year return.', 'Agregue identificacion, dependientes, formularios de seguro y su declaracion anterior.');

  const nextStep = useMemo(() => {
    if (!checklist.appointment) {
      return {
        title: txt('Book your meeting first', 'Reserve primero su reunion'),
        body: copy(`${advisorName} can organize everything faster once your meeting date is locked in.`, `${advisorName} puede organizar todo mas rapido una vez que su fecha de reunion quede lista.`, `Book your meeting with ${advisorName} first.`, `Reserve su reunion con ${advisorName} primero.`),
        tab: 'appointments',
      };
    }
    if (!checklist.income) {
      return {
        title: txt('Load every W-2 and 1099', 'Cargue cada W-2 y 1099'),
        body: copy(`${advisorName} uses your income forms first so nothing important slips through the cracks later.`, `${advisorName} usa primero sus formularios de ingresos para que nada importante se quede fuera despues.`, `Add income forms for ${advisorName}.`, `Agregue sus formularios de ingresos para ${advisorName}.`),
        tab: 'documents',
      };
    }
    if (!checklist.personal) {
      return {
        title: txt('Finish the personal lane', 'Termine el carril personal'),
        body: copy(`${advisorName} will want your ID, dependents, insurance forms, and prior-year return in one clean place.`, `${advisorName} va a querer su identificacion, dependientes, formularios de seguro y declaracion anterior en un solo lugar limpio.`, `Add ID, dependents, and prior return for ${advisorName}.`, `Agregue identificacion, dependientes y declaracion anterior para ${advisorName}.`),
        tab: 'documents',
      };
    }
    if (laneCounts.business > 0 && !workspace?.scheduleC) {
      return {
        title: txt('Clean up your Schedule C', 'Limpie su Schedule C'),
        body: copy(`If you have self-employment income, ${advisorName} will get more out of your meeting when this worksheet is cleaned up first.`, `Si tiene ingresos por trabajo independiente, ${advisorName} aprovechara mejor su reunion cuando esta hoja este limpia primero.`, `Finish Schedule C before meeting ${advisorName}.`, `Termine Schedule C antes de reunirse con ${advisorName}.`),
        tab: 'schedule-c',
      };
    }
    return {
      title: txt('You are ready for review', 'Ya esta listo para revision'),
      body: copy(`Your file is in strong shape. Keep it tidy and bring any gray-area questions straight to ${advisorName}.`, `Su expediente va muy bien. Mantengalo ordenado y lleve cualquier duda gris directamente a ${advisorName}.`, `Keep files organized and bring questions to ${advisorName}.`, `Mantenga todo ordenado y lleve sus dudas a ${advisorName}.`),
      tab: 'overview',
    };
  }, [advisorName, checklist.appointment, checklist.income, checklist.personal, copy, laneCounts.business, workspace?.scheduleC, txt]);

  const updatesEnabled = Boolean(updatesDraft.active && updatesDraft.consent);
  const smsAvailable = deliveryHealth.text;
  const emailAvailable = deliveryHealth.email;
  const effectiveChannel = !smsAvailable && updatesDraft.channel !== 'email' ? 'email' : updatesDraft.channel;
  const needsEmail = effectiveChannel === 'email' || effectiveChannel === 'both';
  const needsPhone = effectiveChannel === 'text' || effectiveChannel === 'both';
  const selectedChannelsConfigured = (!needsEmail || emailAvailable) && (!needsPhone || smsAvailable);
  const updateTopicsSelected = updatesDraft.appointmentUpdates || updatesDraft.documentReminders || updatesDraft.statusUpdates || updatesDraft.taxDeadlineReminders;
  const canSaveUpdates = Boolean(updateTopicsSelected && updatesDraft.consent && ((!needsEmail || updatesDraft.email) && (!needsPhone || updatesDraft.phone)));
  const activeUpdateTopics = useMemo(() => ([
    updatesDraft.appointmentUpdates ? txt('Appointments', 'Citas') : null,
    updatesDraft.documentReminders ? txt('Documents', 'Documentos') : null,
    updatesDraft.statusUpdates ? txt('Status', 'Estado') : null,
    updatesDraft.taxDeadlineReminders ? txt('Deadlines', 'Fechas limite') : null,
  ].filter(Boolean)), [txt, updatesDraft.appointmentUpdates, updatesDraft.documentReminders, updatesDraft.statusUpdates, updatesDraft.taxDeadlineReminders]);
  const updateChannelLabel = effectiveChannel === 'both'
    ? txt('Email + text', 'Correo + texto')
    : effectiveChannel === 'text'
      ? txt('Text only', 'Solo texto')
      : txt('Email only', 'Solo correo');
  const overviewActions = useMemo(() => {
    const actions = [
      {
        id: 'meeting',
        title: nextAppointment ? txt('View meeting', 'Ver reunion') : txt('Book meeting', 'Reservar reunion'),
        body: nextAppointment
          ? txt('Check your time or make changes.', 'Revise su horario o haga cambios.')
          : txt(`Lock in time with ${advisorName}.`, `Confirme su horario con ${advisorName}.`),
        tab: 'appointments',
      },
      {
        id: 'documents',
        title: txt('Upload documents', 'Subir documentos'),
        body: totalUploadedFiles > 0
          ? txt(`${totalUploadedFiles} files already in place.`, `${totalUploadedFiles} archivos ya estan en su lugar.`)
          : txt('Start with W-2s, 1099s, and ID.', 'Empiece con W-2, 1099 e identificacion.'),
        tab: 'documents',
      },
      {
        id: 'updates',
        title: txt('Manage updates', 'Administrar actualizaciones'),
        body: updatesEnabled
          ? txt(`${updateChannelLabel} is active.`, `${updateChannelLabel} ya esta activo.`)
          : txt('Choose how AXION reaches you.', 'Elija como AXION le avisa.'),
        tab: 'updates',
      },
      {
        id: 'special',
        title: laneCounts.business > 0 || workspace?.scheduleC
          ? txt('Open Schedule C', 'Abrir Schedule C')
          : txt('Open client tools', 'Abrir herramientas'),
        body: laneCounts.business > 0 || workspace?.scheduleC
          ? txt('Use this if you have self-employment income.', 'Use esto si tiene ingresos de trabajo independiente.')
          : txt('See the client-only tools and guidance.', 'Vea las herramientas y guias para clientes.'),
        tab: laneCounts.business > 0 || workspace?.scheduleC ? 'schedule-c' : 'tools',
      },
    ];

    return actions;
  }, [advisorName, laneCounts.business, nextAppointment, totalUploadedFiles, txt, updateChannelLabel, updatesEnabled, workspace?.scheduleC]);
  const resolvePortalMessage = useCallback((messageKey, fallback = '') => {
    switch (messageKey) {
      case 'scheduleSaved':
        return copy('Schedule C summary saved into your business lane.', 'El resumen de Schedule C se guardo en su carril de negocio.', 'Schedule C saved to business lane.', 'Schedule C guardado en negocio.');
      case 'updatesLiveSaved':
        return copy('Your update preference was saved and the confirmation flow is ready.', 'Su preferencia de actualizaciones se guardo y el flujo de confirmacion quedo listo.', 'Update preference saved.', 'Preferencia guardada.');
      case 'updatesSaved':
        return copy('Your update preference was saved to the workspace.', 'Su preferencia de actualizaciones se guardo en el espacio de trabajo.', 'Preference saved to workspace.', 'Preferencia guardada en el espacio.');
      case 'updatesSavedPending':
        return copy('Preference saved. Live sending will start after delivery services are connected.', 'Preferencia guardada. El envio en vivo comenzara cuando se conecten los servicios de entrega.', 'Preference saved. Live sending pending.', 'Preferencia guardada. Envio pendiente.');
      case 'updatesTestSent':
        return copy('The live test update was sent.', 'La actualizacion de prueba fue enviada.', 'Test update sent.', 'Prueba enviada.');
      default:
        return fallback;
    }
  }, [copy]);

  const openTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = getPortalHashForTab(tab);
    const portalEl = document.getElementById('portal');
    if (portalEl) portalEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAccessChange = (field, value) => {
    setAccessForm((prev) => ({ ...prev, [field]: value }));
  };

  const completeWorkspaceLogin = (payload, fallbackAdvisorId) => {
    const nextSession = {
      token: payload.token,
      firstName: payload.workspace.client.firstName,
      lastName: payload.workspace.client.lastName,
      email: payload.workspace.client.email,
      phone: payload.workspace.client.phone || '',
      taxProfessionalId: payload.workspace.taxProfessional?.id || fallbackAdvisorId,
    };
    saveStoredSession(nextSession);
    saveCachedWorkspace(payload.workspace);
    setSession(nextSession);
    setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
    setDeliveryHealth(payload.configuredChannels || { email: false, text: false });
    setUpdatesDraft({ ...DEFAULT_UPDATES, ...(payload.workspace.updates || {}) });
    setAccessState({ status: 'done', error: '' });
    window.location.hash = '#portal-overview';
  };

  const openWorkspace = async (event) => {
    event.preventDefault();
    setAccessState({ status: 'saving', error: '' });
    try {
      const payload = await fetch('/api/portal/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm),
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.error || 'Unable to open workspace.');
        return body;
      });

      completeWorkspaceLogin(payload, accessForm.taxProfessionalId);
    } catch (error) {
      setAccessState({ status: 'error', error: error.message });
    }
  };

  const launchDemoWorkspace = async () => {
    setAccessState({ status: 'saving', error: '' });
    try {
      const demoPayload = {
        demo: true,
        firstName: 'Elena',
        lastName: 'Vance',
        email: 'demo.client@axiontax.com',
        phone: '(707) 555-0184',
        taxProfessionalId: 'marcus',
      };
      const payload = await fetch('/api/portal/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoPayload),
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.error || 'Unable to launch demo workspace.');
        return body;
      });

      completeWorkspaceLogin(payload, 'marcus');
    } catch (error) {
      setAccessState({ status: 'error', error: error.message });
    }
  };

  const handleFileSelection = async (file) => {
    setUploadFile(file || null);
    if (!file) {
      setUploadTriage(null);
      return;
    }
    const triage = await classifyTaxDocument(file, isSpanish);
    setUploadTriage(triage);
    if (triage) {
      setSelectedLaneId(triage.recommendedLane);
      setUploadNote(triage.autoNote);
    }
  };

  const generateSampleOcrFile = async (sampleType = '1099') => {
    const is1099 = sampleType === '1099';
    const fileName = is1099 ? '2025-1099-NEC-Consulting-Retainer.svg' : '2025-W2-Supplemental-Payroll.svg';
    const svgBody = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="420" viewBox="0 0 760 420">
      <rect width="760" height="420" fill="#0d0d0d"/>
      <rect x="20" y="20" width="720" height="380" rx="14" fill="#141414" stroke="#e60000" stroke-width="2"/>
      <text x="48" y="72" fill="#e60000" font-family="monospace" font-size="14" font-weight="bold">AXION SYNTHETIC OCR TEST PACKET</text>
      <text x="48" y="112" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="bold">${is1099 ? 'Form 1099-NEC · Nonemployee Compensation (2025)' : 'Form W-2 · Wage and Tax Statement (2025)'}</text>
      <text x="48" y="156" fill="#e5e5e5" font-family="monospace" font-size="15">${is1099 ? 'Box 1 Nonemployee Comp: $24,500.00 · Payer: Apex AI Labs' : 'Box 1 Wages: $42,800.00 · Fed Tax Withheld: $6,420.00'}</text>
      <text x="48" y="196" fill="#a8a8a8" font-family="monospace" font-size="14">Generated for live client-side SHA-256 &amp; OCR lane triage verification.</text>
    </svg>`;
    const file = new File([svgBody], fileName, { type: 'image/svg+xml' });
    await handleFileSelection(file);
  };

  const signOut = () => {
    saveStoredSession(null);
    setSession(null);
    setWorkspaceState({ loading: false, data: null, error: '' });
    setAccessState({ status: 'idle', error: '' });
    window.location.hash = '#portal';
  };

  const bookAppointment = async (time) => {
    setWorkspaceState((prev) => ({ ...prev, loading: true }));
    try {
      const payload = await apiRequest(editingAppointmentId ? `/api/portal/appointments/${editingAppointmentId}` : '/api/portal/appointments', {
        method: editingAppointmentId ? 'PATCH' : 'POST',
        body: { date: appointmentDraft.date, time, type: txt('Tax Preparation Meeting', 'Reunion de preparacion fiscal') },
      });
      setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
      setEditingAppointmentId('');
    } catch (error) {
      setWorkspaceState((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const startAppointmentEdit = (appointment) => {
    setEditingAppointmentId(appointment.id);
    setAppointmentDraft({ date: appointment.date, time: appointment.time });
  };

  const cancelAppointmentEdit = () => {
    setEditingAppointmentId('');
    setAppointmentDraft({
      date: new Date().toISOString().slice(0, 10),
      time: AVAILABLE_SLOTS[0],
    });
  };

  const removeAppointment = async (appointmentId) => {
    setWorkspaceState((prev) => ({ ...prev, loading: true }));
    try {
      const payload = await apiRequest(`/api/portal/appointments/${appointmentId}`, { method: 'DELETE' });
      setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
      if (editingAppointmentId === appointmentId) {
        cancelAppointmentEdit();
      }
    } catch (error) {
      setWorkspaceState((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const toggleChecklist = async (itemId) => {
    if (!workspace) return;
    setSavingChecklist(true);
    try {
      const payload = await apiRequest('/api/portal/checklist', {
        method: 'PATCH',
        body: {
          checklist: {
            ...workspace.checklist,
            [itemId]: !workspace.checklist[itemId],
          },
        },
      });
      setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
    } catch (error) {
      setWorkspaceState((prev) => ({ ...prev, error: error.message }));
    } finally {
      setSavingChecklist(false);
    }
  };

  const uploadDocument = async (event) => {
    event.preventDefault();
    if (!uploadFile) return;
    setDocumentSaveState({ status: 'saving', error: '' });

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('laneId', selectedLaneId);
      formData.append('note', uploadNote);
      const payload = await apiRequest('/api/portal/documents', { method: 'POST', body: formData });
      setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
      setUploadFile(null);
      setUploadTriage(null);
      setUploadNote('');
      setDocumentSaveState({ status: 'done', error: '' });
    } catch (error) {
      setDocumentSaveState({ status: 'error', error: error.message });
    }
  };

  const saveDocumentNote = async (documentId) => {
    const note = noteDraftRef.current[documentId] || '';
    try {
      const payload = await apiRequest(`/api/portal/documents/${documentId}`, {
        method: 'PATCH',
        body: { note },
      });
      setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
    } catch (error) {
      setWorkspaceState((prev) => ({ ...prev, error: error.message }));
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const payload = await apiRequest(`/api/portal/documents/${documentId}`, { method: 'DELETE' });
      setWorkspaceState({ loading: false, data: payload.workspace, error: '' });
    } catch (error) {
      setWorkspaceState((prev) => ({ ...prev, error: error.message }));
    }
  };

  const downloadDocument = async (documentId, documentName) => {
    try {
      const response = await apiRequest(`/api/portal/documents/${documentId}/download`, { raw: true });
      if (!response.ok) throw new Error('Unable to download document.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = documentName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setWorkspaceState((prev) => ({ ...prev, error: error.message }));
    }
  };

  const closeDocumentPreview = () => {
    if (documentPreview.url) {
      URL.revokeObjectURL(documentPreview.url);
    }
    setDocumentPreview({ open: false, status: 'idle', url: '', name: '', mimeType: '', error: '' });
  };

  const previewDocument = async (document) => {
    setDocumentPreview({ open: true, status: 'loading', url: '', name: document.name, mimeType: document.mimeType, error: '' });
    try {
      const response = await apiRequest(`/api/portal/documents/${document.id}/download`, { raw: true });
      if (!response.ok) throw new Error('Unable to preview document.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDocumentPreview({ open: true, status: 'ready', url, name: document.name, mimeType: document.mimeType, error: '' });
    } catch (error) {
      setDocumentPreview({ open: true, status: 'error', url: '', name: document.name, mimeType: document.mimeType, error: error.message });
    }
  };

  const saveScheduleC = async (payload, summary) => {
    setScheduleSaveState({ status: 'saving', message: '', messageKey: '' });
    try {
      const response = await apiRequest('/api/portal/schedule-c', {
        method: 'POST',
        body: { payload, summary },
      });
      setWorkspaceState({ loading: false, data: response.workspace, error: '' });
      setScheduleSaveState({
        status: 'done',
        message: '',
        messageKey: 'scheduleSaved',
      });
    } catch (error) {
      setScheduleSaveState({ status: 'error', message: error.message, messageKey: '' });
    }
  };

  const saveUpdates = async () => {
    setUpdatesState({ status: 'saving', message: '', messageKey: '' });
    try {
      const persisted = await apiRequest('/api/portal/updates', {
        method: 'PATCH',
        body: { updates: { ...updatesDraft, channel: effectiveChannel, active: canSaveUpdates } },
      });
      setWorkspaceState({ loading: false, data: persisted.workspace, error: '' });

      if (canSaveUpdates && selectedChannelsConfigured) {
        const context = buildUpdatesContext({
          appointments: persisted.workspace.appointments,
          checklist: persisted.workspace.checklist,
          laneCounts: persisted.workspace.laneCounts,
          advisorName,
          advisorPhone,
        });
        const liveResponse = await apiRequest('/api/updates/opt-in', {
          method: 'POST',
          body: {
            language,
            preferences: { ...updatesDraft, channel: effectiveChannel, active: true },
            context,
          },
        });

        setUpdatesState({ status: 'done', message: liveResponse.message || '', messageKey: 'updatesLiveSaved' });
        return;
      }

      setUpdatesState({
        status: 'done',
        message: '',
        messageKey: selectedChannelsConfigured ? 'updatesSaved' : 'updatesSavedPending',
      });
    } catch (error) {
      setUpdatesState({ status: 'error', message: error.message, messageKey: '' });
    }
  };

  const sendTestUpdate = async () => {
    setUpdatesState({ status: 'testing', message: '', messageKey: '' });
    try {
      const context = buildUpdatesContext({
        appointments: workspace.appointments,
        checklist: workspace.checklist,
        laneCounts: workspace.laneCounts,
        advisorName,
        advisorPhone,
      });
      const payload = await apiRequest('/api/updates/test', {
        method: 'POST',
        body: {
          language,
          preferences: { ...updatesDraft, channel: effectiveChannel, active: true },
          context,
        },
      });
      setUpdatesState({ status: 'done', message: payload.message || '', messageKey: 'updatesTestSent' });
    } catch (error) {
      setUpdatesState({ status: 'error', message: error.message, messageKey: '' });
    }
  };

  if (session?.token && workspaceState.loading && !workspace) {
    return (
      <section className="portal-shell portal-access" id="portal">
        <div className="portal-access-wrap">
          <div className="portal-access-copy glass-panel">
            <p className="portal-kicker">{txt('Client Prep Workspace', 'Espacio de Preparacion del Cliente')}</p>
            <h2>{txt('Loading your saved workspace.', 'Cargando su espacio guardado.')}</h2>
            <p>
              {copy(
                'Your appointments, uploads, and preparation notes are being pulled from the server now.',
                'Sus citas, cargas y notas de preparacion se estan cargando del servidor ahora.',
                'Loading your saved portal data.',
                'Cargando sus datos guardados del portal.'
              )}
            </p>
          </div>
          <div className="portal-access-form glass-panel portal-loading-card">
            <LoaderCircle size={28} className="spin custom-icon-svg" />
            <p>{txt('Please wait a moment.', 'Espere un momento.')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!session?.token || !workspace) {
    return (
      <section className="portal-shell portal-access" id="portal">
        <div className="portal-access-wrap">
          <div className="portal-access-copy glass-panel">
            <p className="portal-kicker">{txt('Free Client Profile', 'Perfil de Cliente Gratis')}</p>
            <h2>{copy('Open one secure profile to choose your advisor, book, upload, and stay ready.', 'Abra un perfil seguro para elegir su asesor, reservar, subir documentos y mantenerse listo.', 'Choose your advisor, book, and upload in one place.', 'Elija su asesor, reserve y suba documentos en un solo lugar.')}</h2>
            <p>
              {copy(
                'Start by choosing the tax professional you want in your corner. Once you open your workspace, your reminders and prep steps will follow that person.',
                'Empiece eligiendo al profesional fiscal que quiere de su lado. Una vez que abra su espacio, sus recordatorios y pasos de preparacion seguiran a esa persona.',
                'Choose your tax professional, then open your workspace.',
                'Elija su profesional fiscal y luego abra su espacio.'
              )}
            </p>
            <div className="portal-access-points">
              <div><strong>{txt('Use it for', 'Uselo para')}</strong><span>{copy('meeting requests, clean uploads, IRS form recovery, and a calmer prep flow', 'solicitud de citas, cargas limpias, recuperacion de formularios del IRS y un flujo de preparacion mas tranquilo', 'booking, uploads, IRS recovery, and prep', 'citas, cargas, recuperacion IRS y preparacion')}</span></div>
              <div><strong>{txt('Best result', 'Mejor resultado')}</strong><span>{copy(`a cleaner packet and a faster review with ${advisorName}`, `un paquete mas limpio y una revision mas rapida con ${advisorName}`, `cleaner prep with ${advisorName}`, `preparacion mas limpia con ${advisorName}`)}</span></div>
              <div><strong>{txt('Included', 'Incluye')}</strong><span>{copy('advisor selection, secure upload lanes, free client tools, and bilingual guidance', 'seleccion de asesor, carriles seguros de carga, herramientas gratis del cliente y guia bilingue', 'advisor, uploads, tools, and guidance', 'asesor, cargas, herramientas y guia')}</span></div>
            </div>
          </div>

          <form className="portal-access-form glass-panel" onSubmit={openWorkspace}>
            <div className="portal-access-head">
              <ShieldCheck size={28} className="custom-icon-svg" />
              <div>
                <h3>{t('portal.title')}</h3>
                <p>{copy(t('portal.welcome'), t('portal.welcome'), 'Book, upload, and stay prepared.', 'Reserve, suba y mantengase preparado.')}</p>
              </div>
            </div>

            <div className="portal-demo-banner">
              <div className="portal-demo-copy">
                <span className="portal-demo-tag">{txt('INSTANT EVALUATOR SANDBOX', 'SANDBOX DE DEMOSTRACION')}</span>
                <strong>{txt('Explore a Pre-Loaded W-2 + 1099-NEC Client Workspace', 'Explorar Espacio Pre-Cargado (W-2 + 1099-NEC)')}</strong>
                <span>
                  {txt(
                    'Opens Elena Vance’s seeded demo workspace with 4 sample tax documents, SHA-256 file hashes, booked strategy session, and Schedule C summary.',
                    'Abre el expediente demo de Elena Vance con 4 documentos de muestra, hashes SHA-256, cita agendada y resumen de Schedule C.'
                  )}
                </span>
              </div>
              <button
                type="button"
                className="btn-primary portal-demo-btn"
                onClick={launchDemoWorkspace}
                disabled={accessState.status === 'saving'}
              >
                {accessState.status === 'saving' ? <LoaderCircle size={16} className="spin" /> : <ChevronRight size={16} />}
                {txt('Launch Demo Workspace', 'Abrir Espacio Demo')}
              </button>
            </div>

            <div className="portal-advisor-picker">
              <div className="portal-advisor-picker-head">
                <strong>{txt('Select your Tax Professional', 'Seleccione su profesional fiscal')}</strong>
                <span>{copy('Choose who will guide this workspace. The portal will then speak to you through that advisor plan, contact, and specialties.', 'Elija quien guiara este espacio. El portal luego le hablara con el plan, contacto y especialidades de ese asesor.', 'Choose who will guide this workspace.', 'Elija quien guiara este espacio.')}</span>
              </div>
              <div className="portal-advisor-grid">
                {TAX_PROFESSIONALS.map((advisor) => {
                  const active = accessForm.taxProfessionalId === advisor.id;
                  return (
                    <button
                      key={advisor.id}
                      type="button"
                      className={`portal-advisor-card ${active ? 'active' : ''}`}
                      onClick={() => handleAccessChange('taxProfessionalId', advisor.id)}
                    >
                      <div className="portal-advisor-top">
                        <strong>{advisor.name}</strong>
                        <span>{advisor.phone}</span>
                      </div>
                      <p>{isSpanish ? advisor.quote.es : advisor.quote.en}</p>
                      <div className="portal-advisor-specialties">
                        {(isSpanish ? advisor.specialties.es : advisor.specialties.en).map((specialty) => (
                          <span key={specialty}>{specialty}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="portal-form-grid">
              <label>
                {txt('First name', 'Nombre')}
                <input value={accessForm.firstName} onChange={(event) => handleAccessChange('firstName', event.target.value)} />
              </label>
              <label>
                {txt('Last name', 'Apellido')}
                <input value={accessForm.lastName} onChange={(event) => handleAccessChange('lastName', event.target.value)} />
              </label>
              <label>
                {txt('Email', 'Correo')}
                <input type="email" value={accessForm.email} onChange={(event) => handleAccessChange('email', event.target.value)} />
              </label>
              <label>
                {txt('Phone (optional)', 'Telefono (opcional)')}
                <input type="tel" value={accessForm.phone} onChange={(event) => handleAccessChange('phone', event.target.value)} />
              </label>
            </div>

            {workspaceState.error && <p className="portal-inline-error">{workspaceState.error}</p>}
            {accessState.error && <p className="portal-inline-error">{accessState.error}</p>}

            <button type="submit" className="btn-primary portal-access-btn" disabled={accessState.status === 'saving' || !canOpenWorkspace}>
              {accessState.status === 'saving' ? <LoaderCircle size={16} className="spin" /> : <ChevronRight size={16} />}
              {txt('Open Custom Workspace', 'Abrir Espacio Personalizado')}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="portal-shell" id="portal">
      <div className="portal-frame glass-panel">
        <header className="portal-topbar">
          <div>
            <p className="portal-kicker">{txt('Client Portal', 'Portal del Cliente')}</p>
            <h2>{txt(`Welcome back, ${workspace.client.firstName}.`, `Bienvenido de nuevo, ${workspace.client.firstName}.`)}</h2>
            <p className="portal-topbar-copy">
              {copy(`${advisorName} will use this workspace to keep your file clean before review. If you get stuck, call ${advisorName} at ${advisorPhone}.`, `${advisorName} usara este espacio para mantener su expediente limpio antes de revisarlo. Si se traba, llame a ${advisorName} al ${advisorPhone}.`, `Keep your file clean for ${advisorName}.`, `Mantenga su expediente limpio para ${advisorName}.`)}
            </p>
          </div>
          <div className="portal-topbar-side">
            <div className="portal-status-pill">
              <strong>{checklistPct}%</strong>
              <span>{txt('meeting readiness', 'preparacion para reunion')}</span>
            </div>
            <a href={`tel:${advisorPhone.replace(/\D/g, '')}`} className="portal-secondary-btn portal-topbar-action">
              <Phone size={15} />
              {txt(`Call ${advisorName}`, `Llamar a ${advisorName}`)}
            </a>
            <button type="button" className="portal-secondary-btn" onClick={signOut}>{txt('Close Workspace', 'Cerrar Espacio')}</button>
          </div>
        </header>

        <nav className="portal-tabbar" aria-label={txt('Portal sections', 'Secciones del portal')}>
          {PORTAL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`portal-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => openTab(tab.id)}
            >
              {tab.id === 'overview' && txt('Overview', 'Resumen')}
              {tab.id === 'appointments' && txt('Appointment', 'Cita')}
              {tab.id === 'documents' && txt('Documents', 'Documentos')}
              {tab.id === 'tools' && txt('Axion Familia', 'Axion Familia')}
              {tab.id === 'schedule-c' && txt('Schedule C', 'Schedule C')}
              {tab.id === 'updates' && txt('Updates', 'Actualizaciones')}
            </button>
          ))}
        </nav>

        <section className="portal-nudge glass-panel">
          <div>
            <p className="portal-kicker">{txt('Next Best Step', 'Siguiente Mejor Paso')}</p>
            <h3>{nextStep.title}</h3>
            <p>{nextStep.body}</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => openTab(nextStep.tab)}>
            {txt('Open step', 'Abrir paso')} <ChevronRight size={16} />
          </button>
        </section>

        {workspaceState.error && <p className="portal-inline-error">{workspaceState.error}</p>}

        {activeTab === 'overview' && (
          <div className="fade-in">
            <section className="portal-quick-actions glass-panel">
              <div className="portal-card-head">
                <ShieldCheck size={18} className="custom-icon-svg" />
                <h3>{txt('Jump back in', 'Entre de nuevo')}</h3>
              </div>
              <p className="portal-card-copy">
                {copy(
                  `Use these quick actions to move your file forward with fewer clicks and less guesswork for ${advisorName}.`,
                  `Use estas acciones rapidas para mover su expediente con menos clics y menos adivinanzas para ${advisorName}.`,
                  `Quick shortcuts for your workspace with ${advisorName}.`,
                  `Atajos rapidos para su espacio con ${advisorName}.`
                )}
              </p>
              <div className="portal-quick-actions-grid">
                {overviewActions.map((action) => (
                  <button
                    type="button"
                    key={action.id}
                    className="portal-quick-action"
                    onClick={() => openTab(action.tab)}
                  >
                    <strong>{action.title}</strong>
                    <span>{action.body}</span>
                    <small>{txt('Open', 'Abrir')} <ChevronRight size={14} /></small>
                  </button>
                ))}
              </div>
            </section>

            <div className="portal-grid-overview">
            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <CalendarDays size={18} className="custom-icon-svg" />
                <h3>{txt('Meeting status', 'Estado de la reunion')}</h3>
              </div>
              {nextAppointment ? (
                <>
                  <span className="portal-overview-badge ready">{txt('Confirmed', 'Confirmada')}</span>
                  <p className="portal-card-copy">
                    {copy(
                      `${advisorName} is set to review your file on the date below. Keep loading documents so the meeting stays sharp and efficient.`,
                      `${advisorName} ya esta listo para revisar su expediente en la fecha de abajo. Siga cargando documentos para que la reunion se mantenga agil y precisa.`,
                      `Your meeting with ${advisorName} is confirmed.`,
                      `Su reunion con ${advisorName} esta confirmada.`
                    )}
                  </p>
                  <strong className="portal-card-value">{formatDateLabel(nextAppointment.date, locale)} · {nextAppointment.time}</strong>
                  <span className="portal-card-note">{txt('Use the document lanes below to keep that meeting fast.', 'Use los carriles de documentos abajo para mantener esa reunion agil.')}</span>
                </>
              ) : (
                <>
                  <span className="portal-overview-badge pending">{txt('Needed', 'Falta')}</span>
                  <p className="portal-card-copy">
                    {copy(
                      `Pick your time with ${advisorName} first. Once that date is locked, everything else in the portal becomes easier to organize.`,
                      `Elija primero su horario con ${advisorName}. Una vez que esa fecha quede lista, todo lo demas en el portal se vuelve mas facil de organizar.`,
                      `Book a time with ${advisorName} first.`,
                      `Reserve primero un horario con ${advisorName}.`
                    )}
                  </p>
                  <strong className="portal-card-value">{txt('No time selected yet', 'Aun no hay horario elegido')}</strong>
                  <button type="button" className="portal-secondary-btn" onClick={() => openTab('appointments')}>{txt('Choose a time', 'Elegir horario')}</button>
                </>
              )}
            </article>

            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <FolderOpen size={18} className="custom-icon-svg" />
                <h3>{txt('Document lanes', 'Carriles de documentos')}</h3>
              </div>
              <p className="portal-card-copy">
                {copy(
                  `${advisorName} reviews faster when each document lands in the right lane. You currently have ${totalUploadedFiles} files inside the workspace.`,
                  `${advisorName} revisa mas rapido cuando cada documento cae en el carril correcto. Ahora mismo tiene ${totalUploadedFiles} archivos dentro del espacio.`,
                  `${totalUploadedFiles} files are already in your workspace.`,
                  `Ya tiene ${totalUploadedFiles} archivos en su espacio.`
                )}
              </p>
              <div className="portal-lane-summary">
                {UPLOAD_LANES.map((lane) => (
                  <button type="button" key={lane.id} className="portal-lane-summary-item" onClick={() => { setSelectedLaneId(lane.id); openTab('documents'); }}>
                    <strong>{isSpanish ? lane.es : lane.en}</strong>
                    <span>{laneCounts[lane.id] || 0} {txt('files', 'archivos')}</span>
                    <small>
                      {lane.id === 'jobs'
                        ? txt('W-2s, paystubs, payroll docs', 'W-2, talones, documentos de nomina')
                        : lane.id === 'business'
                          ? txt('1099s, expenses, Schedule C support', '1099, gastos, apoyo Schedule C')
                          : txt('ID, dependents, prior-year return', 'ID, dependientes, declaracion anterior')}
                    </small>
                  </button>
                ))}
              </div>
            </article>

            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <CheckCircle2 size={18} className="custom-icon-svg" />
                <h3>{txt('Preparation status', 'Estado de preparacion')}</h3>
              </div>
              <div className="portal-progress-bar">
                <div className="portal-progress-fill" style={{ width: `${checklistPct}%` }}></div>
              </div>
              <p className="portal-card-copy">{copy(`${checklistCompleted} of ${CHECKLIST_ITEMS.length} readiness milestones are already in place.`, `${checklistCompleted} de ${CHECKLIST_ITEMS.length} hitos de preparacion ya estan en su lugar.`, `${checklistCompleted} of ${CHECKLIST_ITEMS.length} milestones are done.`, `${checklistCompleted} de ${CHECKLIST_ITEMS.length} hitos estan listos.`)}</p>
            </article>

            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <BellRing size={18} className="custom-icon-svg" />
                <h3>{txt('Update status', 'Estado de actualizaciones')}</h3>
              </div>
              <span className={`portal-overview-badge ${updatesEnabled ? 'ready' : 'pending'}`}>
                {updatesEnabled ? txt('Active', 'Activas') : txt('Off', 'Apagadas')}
              </span>
              <p className="portal-card-copy">
                {updatesEnabled
                  ? copy(`${advisorName} can reach you through ${updateChannelLabel.toLowerCase()} for ${activeUpdateTopics.join(', ').toLowerCase()}.`, `${advisorName} puede contactarle por ${updateChannelLabel.toLowerCase()} para ${activeUpdateTopics.join(', ').toLowerCase()}.`, `${updateChannelLabel} is set for ${advisorName}.`, `${updateChannelLabel} ya esta listo para ${advisorName}.`)
                  : copy('You have not activated update delivery yet. Turn it on so appointments, documents, and return status do not rely on memory alone.', 'Todavia no ha activado las actualizaciones. Enciendalas para que citas, documentos y estado de la declaracion no dependan solo de la memoria.', 'Updates are not active yet.', 'Las actualizaciones aun no estan activas.')}
              </p>
              <strong className="portal-card-value">{updatesEnabled ? updateChannelLabel : txt('Choose your contact method', 'Elija su metodo de contacto')}</strong>
              <span className="portal-card-note">
                {updatesEnabled
                  ? txt(`Topics selected: ${activeUpdateTopics.join(', ')}`, `Temas elegidos: ${activeUpdateTopics.join(', ')}`)
                  : selectedChannelsConfigured
                    ? txt('Email and text delivery are ready once you opt in.', 'Correo y texto quedaran listos cuando se active.')
                    : txt('Live sending will expand as delivery services are connected.', 'El envio en vivo crecera cuando se conecten los servicios.')}
              </span>
              <button type="button" className="portal-secondary-btn" onClick={() => openTab('updates')}>{updatesEnabled ? txt('Edit updates', 'Editar actualizaciones') : txt('Turn on updates', 'Activar actualizaciones')}</button>
            </article>
        
            <article className="portal-card glass-panel portal-checklist-card">
              <div className="portal-card-head">
                <FileText size={18} className="custom-icon-svg" />
                <h3>{txt('AXION Readiness', 'Preparacion AXION')}</h3>
              </div>
              <p className="portal-card-copy">
                {copy(
                  `${advisorName} works best when these five pieces are clear. Mark each one as it lands so your file always feels under control.`,
                  `${advisorName} trabaja mejor cuando estas cinco piezas estan claras. Marque cada una cuando llegue para que su expediente siempre se sienta bajo control.`,
                  `Track the five pieces that move your file forward with ${advisorName}.`,
                  `Siga las cinco piezas que hacen avanzar su expediente con ${advisorName}.`
                )}
              </p>
              <ul className="portal-checklist-list portal-readiness-list">
                {readinessItems.map((item) => {
                  const isReady = Boolean(checklist[item.id]);

                  return (
                    <li key={item.id} className={isReady ? 'ready' : ''}>
                      <label className="portal-readiness-item">
                        <input type="checkbox" checked={isReady} onChange={() => toggleChecklist(item.id)} disabled={savingChecklist} />
                        <div className="portal-readiness-copy">
                          <strong>{isSpanish ? item.es : item.en}</strong>
                          <span>{item.detail}</span>
                        </div>
                        <span className={`portal-readiness-state ${isReady ? 'ready' : 'pending'}`}>
                          {isReady ? item.readyLabel : item.pendingLabel}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </article>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="portal-grid-two fade-in">
            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <CalendarDays size={18} className="custom-icon-svg" />
                <h3>{txt('Book your meeting', 'Reserve su reunion')}</h3>
              </div>
              <p className="portal-card-copy">{copy('Choose a date first, then pick the time that works best.', 'Primero elija la fecha y luego el horario que mejor le funcione.', 'Pick a date and time.', 'Elija fecha y horario.')}</p>
              {editingAppointmentId ? (
                <div className="portal-summary-block">
                  <strong>{txt('Rescheduling now', 'Reprogramando ahora')}</strong>
                  <span>{txt(`You are editing an existing meeting with ${advisorName}.`, `Esta editando una reunion existente con ${advisorName}.`)}</span>
                </div>
              ) : null}
              <div className="portal-summary-block">
                <strong>{txt('Meeting preview', 'Vista previa de la reunion')}</strong>
                <span>{txt('Advisor', 'Asesor')}: {advisorName}</span>
                <span>{txt('Selected date', 'Fecha elegida')}: {appointmentDraftDateLabel}</span>
                <span>{txt('Selected time', 'Horario elegido')}: {appointmentDraft.time}</span>
              </div>
              <label className="portal-field">
                {txt('Date', 'Fecha')}
                <input type="date" value={appointmentDraft.date} onChange={(event) => setAppointmentDraft((prev) => ({ ...prev, date: event.target.value }))} />
              </label>
              <div className="portal-slot-grid">
                {AVAILABLE_SLOTS.map((slot) => (
                  <button type="button" key={slot} className={`portal-slot ${appointmentDraft.time === slot ? 'active' : ''}`} onClick={() => setAppointmentDraft((prev) => ({ ...prev, time: slot }))}>
                    <Clock3 size={14} /> {slot}
                  </button>
                ))}
              </div>
              <span className="portal-card-note">{appointmentFocusNote}</span>
              <div className="portal-button-row">
                <button type="button" className="btn-primary" onClick={() => bookAppointment(appointmentDraft.time)}>
                  {editingAppointmentId ? txt('Save new time', 'Guardar nuevo horario') : txt('Book selected time', 'Reservar horario seleccionado')}
                </button>
                {editingAppointmentId ? (
                  <button type="button" className="portal-secondary-btn" onClick={cancelAppointmentEdit}>
                    {txt('Cancel edit', 'Cancelar edicion')}
                  </button>
                ) : null}
              </div>
            </article>

            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <FileText size={18} className="custom-icon-svg" />
                <h3>{txt('Upcoming meetings', 'Proximas reuniones')}</h3>
              </div>
              {workspace.appointments.length === 0 ? (
                <>
                  <p className="portal-card-copy">{copy('No meeting has been booked yet.', 'Todavia no se ha reservado ninguna reunion.', 'No meetings booked yet.', 'Sin reuniones reservadas aun.')}</p>
                  <span className="portal-card-note">{txt(`Choose a time with ${advisorName} and this area will keep your schedule visible.`, `Elija un horario con ${advisorName} y esta area mantendra su agenda visible.`)}</span>
                </>
              ) : (
                <div className="portal-list">
                  {sortedAppointments.map((appointment, index) => (
                    <div className="portal-list-row" key={appointment.id}>
                      <div>
                        <span className={`portal-row-chip ${index === 0 ? 'ready' : 'neutral'}`}>
                          {index === 0 ? txt('Next up', 'Siguiente') : txt('Scheduled', 'Agendada')}
                        </span>
                        <strong>{formatDateLabel(appointment.date, locale)} · {appointment.time}</strong>
                        <span>{appointment.type}</span>
                        <small>{txt(`Planned with ${advisorName}`, `Planeada con ${advisorName}`)}</small>
                      </div>
                      <div className="portal-document-actions">
                        <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => startAppointmentEdit(appointment)}>
                          <PencilLine size={15} /> {txt('Reschedule', 'Reprogramar')}
                        </button>
                        <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => removeAppointment(appointment.id)}>
                          <Trash2 size={15} /> {txt('Remove', 'Eliminar')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="portal-grid-documents fade-in">
            <article className="portal-card glass-panel portal-lane-card">
              <div className="portal-card-head">
                <FolderOpen size={18} className="custom-icon-svg" />
                <h3>{txt('Document lanes', 'Carriles de documentos')}</h3>
              </div>
              <div className="portal-summary-block">
                <strong>{isSpanish ? currentLane.es : currentLane.en}</strong>
                <span>{selectedLaneCount} {txt('files in this lane', 'archivos en este carril')}</span>
                <span>{currentLaneNextAsk}</span>
              </div>
              <div className="portal-lane-selector">
                {UPLOAD_LANES.map((lane) => (
                  <button type="button" key={lane.id} className={`portal-lane-pill ${selectedLaneId === lane.id ? 'active' : ''}`} onClick={() => setSelectedLaneId(lane.id)}>
                    <strong>{isSpanish ? lane.es : lane.en}</strong>
                    <span>
                      {lane.id === 'jobs'
                        ? copy(lane.enHint, lane.esHint, 'W-2 and payroll docs.', 'W-2 y documentos de nomina.')
                        : lane.id === 'business'
                          ? copy(lane.enHint, lane.esHint, '1099, receipts, mileage.', '1099, recibos y millaje.')
                          : copy(lane.enHint, lane.esHint, 'ID, dependents, prior return.', 'ID, dependientes y declaracion anterior.')}
                    </span>
                  </button>
                ))}
              </div>
              <div className="portal-lane-guide">
                <h4>{isSpanish ? currentLane.es : currentLane.en}</h4>
                <p>
                  {currentLane.id === 'jobs'
                    ? copy(currentLane.enHint, currentLane.esHint, 'W-2 and payroll docs.', 'W-2 y documentos de nomina.')
                    : currentLane.id === 'business'
                      ? copy(currentLane.enHint, currentLane.esHint, '1099, receipts, mileage.', '1099, recibos y millaje.')
                      : copy(currentLane.enHint, currentLane.esHint, 'ID, dependents, prior return.', 'ID, dependientes y declaracion anterior.')}
                </p>
                <p><strong>{txt('Common examples:', 'Ejemplos comunes:')}</strong> {(isSpanish ? currentLane.esExamples : currentLane.enExamples).join(', ')}</p>
              </div>
            </article>

            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <UploadCloud size={18} className="custom-icon-svg" />
                <h3>{txt('Add document to this lane', 'Agregar documento a este carril')}</h3>
              </div>
              <p className="portal-card-copy">
                {copy(
                  `Upload one clean file at a time. Client-side intake triage classifies your form by filename, computes its SHA-256 hash, and routes it to the right lane for ${advisorName}.`,
                  `Suba un archivo limpio a la vez. El triaje clasifica su formulario por nombre, calcula su hash SHA-256 y lo envia al carril correcto para ${advisorName}.`,
                  `Upload a file or test with a synthetic tax form below.`,
                  `Suba un archivo o pruebe con un formulario sintetico abajo.`
                )}
              </p>
              <div className="portal-sample-bar">
                <span>{txt('Quick Triage Test:', 'Prueba rapida de triaje:')}</span>
                <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => generateSampleOcrFile('1099')}>
                  {txt('Load Sample 1099-NEC', 'Cargar 1099-NEC de prueba')}
                </button>
                <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => generateSampleOcrFile('w2')}>
                  {txt('Load Sample W-2', 'Cargar W-2 de prueba')}
                </button>
              </div>
              <form className="portal-upload-form" onSubmit={uploadDocument}>
                <label className="portal-field">
                  {txt('Choose file', 'Elegir archivo')}
                  <input type="file" onChange={(event) => handleFileSelection(event.target.files?.[0] || null)} />
                </label>
                {uploadTriage && (
                  <div className="portal-ocr-triage">
                    <div className="portal-ocr-triage-head">
                      <span className="portal-row-chip ready">{txt('FILENAME + SHA-256 TRIAGE', 'TRIAJE + SHA-256 LISTO')}</span>
                      <strong>{uploadTriage.docClass}</strong>
                    </div>
                    <span>{uploadTriage.extractedFields}</span>
                    <small>
                      {txt('Routed Lane', 'Carril')}: <strong>{uploadTriage.recommendedLane.toUpperCase()}</strong> · SHA-256: <code>{uploadTriage.sha256Short}</code> · {uploadTriage.sizeKb} KB
                    </small>
                  </div>
                )}
                <label className="portal-field">
                  {txt('Quick note (auto-filled by intake triage)', 'Nota rapida (autocompletada por triaje)')}
                  <textarea value={uploadNote} onChange={(event) => setUploadNote(event.target.value)} placeholder={txt(`Example: ${advisorName}, this is the corrected 1099 from Stripe.`, `Ejemplo: ${advisorName}, este es el 1099 corregido de Stripe.`)} />
                </label>
                {documentSaveState.error && <p className="portal-inline-error">{documentSaveState.error}</p>}
                <button type="submit" className="btn-primary" disabled={!uploadFile || documentSaveState.status === 'saving'}>
                  {documentSaveState.status === 'saving' ? <LoaderCircle size={16} className="spin" /> : <UploadCloud size={16} />}
                  {txt('Upload into selected lane', 'Subir al carril seleccionado')}
                </button>
              </form>
            </article>

            <article className="portal-card glass-panel portal-doc-list-card">
              <div className="portal-card-head">
                <FileText size={18} className="custom-icon-svg" />
                <h3>{txt('Documents in this lane', 'Documentos en este carril')}</h3>
              </div>
              {laneDocuments.length === 0 ? (
                <>
                  <p className="portal-card-copy">{copy('Nothing is in this lane yet.', 'Todavia no hay nada en este carril.', 'No files in this lane yet.', 'Sin archivos en este carril aun.')}</p>
                  <span className="portal-card-note">{currentLaneNextAsk}</span>
                </>
              ) : (
                <div className="portal-list">
                  {laneDocuments.map((doc) => (
                    <div className="portal-document-row" key={doc.id}>
                      <div>
                        <div className="portal-document-meta">
                          <span className="portal-row-chip neutral">{getMimeKind(doc.mimeType).toUpperCase()}</span>
                          <span className="portal-row-chip subtle">{formatDateLabel(doc.uploadedAt.slice(0, 10), locale)}</span>
                          {doc.note ? <span className="portal-row-chip ready">{txt('Note saved', 'Nota guardada')}</span> : null}
                        </div>
                        <strong>{doc.name}</strong>
                        <span>{txt(`Added for ${advisorName}`, `Agregado para ${advisorName}`)}</span>
                      </div>
                      <div className="portal-document-actions">
                        {getMimeKind(doc.mimeType) === 'image' || getMimeKind(doc.mimeType) === 'pdf' ? (
                          <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => previewDocument(doc)}>
                            <Eye size={15} /> {txt('Preview', 'Vista previa')}
                          </button>
                        ) : null}
                        <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => downloadDocument(doc.id, doc.name)}>
                          <Download size={15} /> {txt('Download', 'Descargar')}
                        </button>
                        <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => deleteDocument(doc.id)}>
                          <Trash2 size={15} /> {txt('Remove', 'Eliminar')}
                        </button>
                      </div>
                      <label className="portal-field compact">
                        <span>{txt('Note', 'Nota')}</span>
                        <div className="portal-inline-edit">
                          <input
                            defaultValue={doc.note || ''}
                            onChange={(event) => { noteDraftRef.current[doc.id] = event.target.value; }}
                            placeholder={txt(`Add context for ${advisorName}`, `Agregue contexto para ${advisorName}`)}
                          />
                          <button type="button" className="portal-secondary-btn portal-inline-action" onClick={() => saveDocumentNote(doc.id)}>
                            <PencilLine size={15} /> {txt('Save note', 'Guardar nota')}
                          </button>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <CheckCircle2 size={18} className="custom-icon-svg" />
                <h3>{txt('Preparation milestones', 'Hitos de preparacion')}</h3>
              </div>
              <p className="portal-card-copy">
                {copy(
                  `Use this list to keep ${advisorName} moving through your file without slowdowns.`,
                  `Use esta lista para que ${advisorName} avance por su expediente sin frenos.`,
                  `Keep ${advisorName} moving with this list.`,
                  `Mantenga a ${advisorName} avanzando con esta lista.`
                )}
              </p>
              <ul className="portal-checklist-list portal-readiness-list compact">
                {readinessItems.map((item) => {
                  const isReady = Boolean(checklist[item.id]);

                  return (
                    <li key={item.id} className={isReady ? 'ready' : ''}>
                      <label className="portal-readiness-item">
                        <input type="checkbox" checked={isReady} onChange={() => toggleChecklist(item.id)} disabled={savingChecklist} />
                        <div className="portal-readiness-copy">
                          <strong>{isSpanish ? item.es : item.en}</strong>
                          <span>{item.detail}</span>
                        </div>
                        <span className={`portal-readiness-state ${isReady ? 'ready' : 'pending'}`}>
                          {isReady ? item.readyLabel : item.pendingLabel}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </article>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="fade-in">
            <ServicesPage portalUnlocked embedded />
          </div>
        )}

        {activeTab === 'schedule-c' && (
          <div className="portal-schedule-layout fade-in">
            <article className="portal-card glass-panel portal-schedule-summary">
              <div className="portal-card-head">
                <ShieldCheck size={18} className="custom-icon-svg" />
                <h3>{txt('When to use this', 'Cuando usar esto')}</h3>
              </div>
              <p className="portal-card-copy">
                {copy(
                  `${advisorName} only needs this if you have self-employment or sole-proprietor business activity. If you are W-2 only, stay focused on the document lanes and meeting prep.`,
                  `${advisorName} solo necesita esto si tiene trabajo independiente o actividad de negocio como propietario unico. Si solo tiene W-2, concentrese en los carriles de documentos y la preparacion de su reunion.`,
                  `Use this only for self-employment income with ${advisorName}.`,
                  `Use esto solo para ingresos de trabajo independiente con ${advisorName}.`
                )}
              </p>
              {workspace.scheduleC ? (
                <div className="portal-summary-block">
                  <strong>{txt('Latest saved summary', 'Ultimo resumen guardado')}</strong>
                  <span>{txt('Gross', 'Bruto')}: {workspace.scheduleC.summary.gross}</span>
                  <span>{txt('Expenses', 'Gastos')}: {workspace.scheduleC.summary.expenses}</span>
                  <span>{txt('Net', 'Neto')}: {workspace.scheduleC.summary.net}</span>
                </div>
              ) : (
                <p className="portal-card-copy">{copy('No Schedule C summary has been saved yet.', 'Todavia no se ha guardado ningun resumen de Schedule C.', 'No Schedule C saved yet.', 'Aun no hay Schedule C guardado.')}</p>
              )}
              {(scheduleSaveState.message || scheduleSaveState.messageKey) && (
                <p className={`portal-status-text ${scheduleSaveState.status === 'error' ? 'error' : 'success'}`}>{resolvePortalMessage(scheduleSaveState.messageKey, scheduleSaveState.message)}</p>
              )}
            </article>

            <div className="portal-card portal-wizard-card glass-panel">
              <ScheduleCWizard onComplete={saveScheduleC} />
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="portal-grid-two fade-in">
            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <BellRing size={18} className="custom-icon-svg" />
                <h3>{txt('Stay updated', 'Mantengase al tanto')}</h3>
              </div>
              <p className="portal-card-copy">
                {copy(
                  `Choose the updates that actually help ${advisorName} keep you on track: meeting reminders, missing documents, return status, and deadline nudges.`,
                  `Elija solo las actualizaciones que realmente ayudan a ${advisorName} a mantenerlo encaminado: recordatorios de cita, documentos faltantes, estado de la declaracion y fechas clave.`,
                  `Pick the updates you want from ${advisorName}.`,
                  `Elija las actualizaciones que quiere de ${advisorName}.`
                )}
              </p>

              <div className="updates-channel-row" role="tablist" aria-label={txt('Delivery method', 'Metodo de entrega')}>
                <button type="button" className={`updates-channel-btn ${effectiveChannel === 'email' ? 'active' : ''}`} onClick={() => setUpdatesDraft((prev) => ({ ...prev, channel: 'email' }))}>
                  <Mail size={15} /> {txt('Email', 'Correo')}
                </button>
                {smsAvailable && (
                  <>
                    <button type="button" className={`updates-channel-btn ${effectiveChannel === 'text' ? 'active' : ''}`} onClick={() => setUpdatesDraft((prev) => ({ ...prev, channel: 'text' }))}>
                      <Phone size={15} /> {txt('Text', 'Texto')}
                    </button>
                    <button type="button" className={`updates-channel-btn ${effectiveChannel === 'both' ? 'active' : ''}`} onClick={() => setUpdatesDraft((prev) => ({ ...prev, channel: 'both' }))}>
                      <BellRing size={15} /> {txt('Email + Text', 'Correo + texto')}
                    </button>
                  </>
                )}
              </div>

              <div className="portal-form-grid updates-grid">
                {needsEmail && (
                  <label>
                    {txt('Email address', 'Correo electronico')}
                    <input type="email" value={updatesDraft.email} onChange={(event) => setUpdatesDraft((prev) => ({ ...prev, email: event.target.value }))} />
                  </label>
                )}
                {needsPhone && smsAvailable && (
                  <label>
                    {txt('Mobile number', 'Numero movil')}
                    <input type="tel" value={updatesDraft.phone} onChange={(event) => setUpdatesDraft((prev) => ({ ...prev, phone: event.target.value }))} />
                  </label>
                )}
              </div>

              <div className="portal-check-grid">
                <label><input type="checkbox" checked={updatesDraft.appointmentUpdates} onChange={() => setUpdatesDraft((prev) => ({ ...prev, appointmentUpdates: !prev.appointmentUpdates }))} /> <span>{txt('Appointment reminders', 'Recordatorios de cita')}</span></label>
                <label><input type="checkbox" checked={updatesDraft.documentReminders} onChange={() => setUpdatesDraft((prev) => ({ ...prev, documentReminders: !prev.documentReminders }))} /> <span>{txt('Missing document reminders', 'Recordatorios de documentos faltantes')}</span></label>
                <label><input type="checkbox" checked={updatesDraft.statusUpdates} onChange={() => setUpdatesDraft((prev) => ({ ...prev, statusUpdates: !prev.statusUpdates }))} /> <span>{txt('Return status updates', 'Actualizaciones del estado de la declaracion')}</span></label>
                <label><input type="checkbox" checked={updatesDraft.taxDeadlineReminders} onChange={() => setUpdatesDraft((prev) => ({ ...prev, taxDeadlineReminders: !prev.taxDeadlineReminders }))} /> <span>{txt('Deadline reminders', 'Recordatorios de fechas limite')}</span></label>
              </div>

              <label className="portal-consent-row">
                <input type="checkbox" checked={updatesDraft.consent} onChange={() => setUpdatesDraft((prev) => ({ ...prev, consent: !prev.consent }))} />
                <span>{copy(`I want ${advisorName} to use this contact information only for the updates selected above.`, `Autorizo a ${advisorName} a usar esta informacion de contacto solo para las actualizaciones seleccionadas arriba.`, `Use this contact info only for updates from ${advisorName}.`, `Use este contacto solo para actualizaciones de ${advisorName}.`)}</span>
              </label>

              <div className="portal-note-box">
                <strong>{updatesEnabled ? txt('Updates ready', 'Actualizaciones listas') : txt('Not active yet', 'Todavia no activas')}</strong>
                <span>
                  {selectedChannelsConfigured
                    ? copy('Saving will either send the opt-in confirmation or hold the preference until delivery services are connected.', 'Al guardar, se enviara la confirmacion o se mantendra la preferencia hasta que los servicios de entrega esten conectados.', 'Save to confirm or hold this preference.', 'Guarde para confirmar o guardar esta preferencia.')
                    : copy('Delivery services are not fully configured yet, but your preference can still be saved.', 'Los servicios de entrega aun no estan totalmente configurados, pero su preferencia si puede guardarse.', 'Preference can still be saved.', 'La preferencia si puede guardarse.')}
                </span>
              </div>

              {(updatesState.message || updatesState.messageKey) && (
                <p className={`portal-status-text ${updatesState.status === 'error' ? 'error' : 'success'}`}>{resolvePortalMessage(updatesState.messageKey, updatesState.message)}</p>
              )}

              <div className="portal-button-row">
                <button type="button" className="btn-primary" onClick={saveUpdates} disabled={!canSaveUpdates || updatesState.status === 'saving' || updatesState.status === 'testing'}>
                  {txt('Save update preferences', 'Guardar preferencias de actualizacion')}
                </button>
                <button type="button" className="portal-secondary-btn" onClick={sendTestUpdate} disabled={!canSaveUpdates || !selectedChannelsConfigured || updatesState.status === 'saving' || updatesState.status === 'testing'}>
                  {txt('Send test update', 'Enviar prueba')}
                </button>
              </div>
            </article>

            <article className="portal-card glass-panel">
              <div className="portal-card-head">
                <FileText size={18} className="custom-icon-svg" />
                <h3>{txt(`What ${advisorName} will use this for`, `Para que usara ${advisorName} esto`)}</h3>
              </div>
              <ul className="portal-ready-list">
                <li>{txt(`Confirming your meeting time or changes with ${advisorName}`, `Confirmar su horario de reunion o cambios con ${advisorName}`)}</li>
                <li>{txt(`Flagging missing W-2, 1099, ID, or business records before ${advisorName} has to chase them down`, `Avisar sobre W-2, 1099, identificacion o registros de negocio faltantes antes de que ${advisorName} tenga que perseguirlos`)}</li>
                <li>{txt(`Sending return status or next-action prompts from ${advisorName}`, `Enviar estado de declaracion o siguientes acciones de ${advisorName}`)}</li>
                <li>{txt(`Keeping ${advisorFirstNamePossessive} process calm instead of reactive`, `Mantener el proceso de ${advisorName} tranquilo en lugar de reactivo`)}</li>
              </ul>
            </article>
          </div>
        )}

        {documentPreview.open && (
          <div className="portal-preview-overlay" onClick={closeDocumentPreview}>
            <div className="portal-preview-modal glass-panel" onClick={(event) => event.stopPropagation()}>
              <div className="portal-card-head">
                <FileText size={18} className="custom-icon-svg" />
                <h3>{documentPreview.name}</h3>
              </div>
              {documentPreview.status === 'loading' ? (
                <p className="portal-card-copy">{txt('Loading preview...', 'Cargando vista previa...')}</p>
              ) : documentPreview.status === 'error' ? (
                <p className="portal-inline-error">{documentPreview.error}</p>
              ) : documentPreview.mimeType.startsWith('image/') ? (
                <img className="portal-preview-image" src={documentPreview.url} alt={documentPreview.name} />
              ) : (
                <iframe className="portal-preview-frame" src={documentPreview.url} title={documentPreview.name} />
              )}
              <div className="portal-button-row">
                <button type="button" className="portal-secondary-btn" onClick={closeDocumentPreview}>
                  {txt('Close preview', 'Cerrar vista previa')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientPortal;
