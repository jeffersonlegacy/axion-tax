import 'dotenv/config';
import compression from 'compression';
import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import twilio from 'twilio';
import { getTaxProfessionalById } from '../src/data/taxProfessionals.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const dataDir = process.env.VERCEL ? '/tmp/axion-data' : path.join(projectRoot, 'server', 'data');
const uploadsDir = path.join(dataDir, 'uploads');
const consentLogFile = path.join(dataDir, 'update-consents.json');
const portalStoreFile = path.join(dataDir, 'portal-workspaces.json');
const port = Number(process.env.PORT || 8797);
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const DEMO_WORKSPACE_ID = 'ws_demo_axion_2026';
const DEMO_WORKSPACE_TOKEN = 'demo_axion_workspace_token_2026';
const DEMO_CLIENT_EMAIL = 'demo.client@axiontax.com';

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const configuredChannels = {
  email: Boolean(resendClient && process.env.RESEND_FROM_EMAIL),
  text: Boolean(twilioClient && process.env.TWILIO_FROM_NUMBER),
};

const UPLOAD_LANES = new Set(['jobs', 'business', 'personal']);
const DEFAULT_CHECKLIST = {
  appointment: false,
  income: false,
  personal: false,
  business: false,
  priorYear: false,
};
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

const sanitizeTaxProfessional = (value) => {
  const advisor = getTaxProfessionalById(normalizeString(value));
  if (!advisor) return null;
  return {
    id: advisor.id,
    name: advisor.name,
    phone: advisor.phone,
  };
};

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));

const updatesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many update requests. Please wait a moment and try again.',
  },
});

const portalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many portal requests. Please wait a moment and try again.',
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const buildSeedDemoWorkspace = () => {
  const now = new Date().toISOString();
  const futureDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  return {
    id: DEMO_WORKSPACE_ID,
    token: DEMO_WORKSPACE_TOKEN,
    createdAt: now,
    updatedAt: now,
    client: {
      firstName: 'Elena',
      lastName: 'Vance',
      email: DEMO_CLIENT_EMAIL,
      phone: '(707) 555-0184',
    },
    taxProfessional: {
      id: 'marcus',
      name: 'Marcus',
      phone: '(510) 555-0188',
    },
    appointments: [
      {
        id: 'appt_demo_01',
        date: futureDate,
        time: '11:30 AM',
        type: '1099 & Schedule C Strategy Review',
        status: 'Scheduled',
        createdAt: now,
      },
    ],
    documents: [
      {
        id: 'doc_demo_w2',
        laneId: 'jobs',
        kind: 'upload',
        name: '2025-W2-Bay-Area-Health-Systems.svg',
        note: 'Seeded Demo Fixture [W-2] · Box 1 Wages: $94,200.00 · Fed Withheld: $14,820.00 · SHA-256: 8f4c...e91a',
        mimeType: 'image/svg+xml',
        size: 1840,
        storedName: '2025-W2-Bay-Area-Health-Systems.svg',
        uploadedAt: now,
      },
      {
        id: 'doc_demo_1099',
        laneId: 'business',
        kind: 'upload',
        name: '2025-1099-NEC-Stripe-Consulting.svg',
        note: 'Seeded Demo Fixture [1099-NEC] · Box 1 Nonemployee Comp: $68,400.00 · Payer TIN Sample · SHA-256: 3a9d...b102',
        mimeType: 'image/svg+xml',
        size: 1920,
        storedName: '2025-1099-NEC-Stripe-Consulting.svg',
        uploadedAt: now,
      },
      {
        id: 'doc_demo_sched_c',
        laneId: 'business',
        kind: 'schedule-c-summary',
        name: 'Schedule C Summary 2025.txt',
        note: 'Gross $68,400 | Expenses $16,250 | Net $52,150',
        mimeType: 'text/plain',
        size: 420,
        storedName: 'schedule-c-summary-2025.txt',
        uploadedAt: now,
      },
      {
        id: 'doc_demo_id',
        laneId: 'personal',
        kind: 'upload',
        name: 'CA-Real-ID-Verification-Vance.svg',
        note: 'Seeded Demo Fixture [Gov ID] · Primary Taxpayer Identity & Address Sample',
        mimeType: 'image/svg+xml',
        size: 1640,
        storedName: 'CA-Real-ID-Verification-Vance.svg',
        uploadedAt: now,
      },
    ],
    checklist: {
      appointment: true,
      income: true,
      personal: true,
      business: true,
      priorYear: false,
    },
    updates: {
      channel: 'email',
      email: DEMO_CLIENT_EMAIL,
      phone: '(707) 555-0184',
      appointmentUpdates: true,
      documentReminders: true,
      statusUpdates: true,
      taxDeadlineReminders: true,
      consent: true,
      active: true,
    },
    scheduleC: {
      summary: {
        gross: '$68,400',
        expenses: '$16,250',
        net: '$52,150',
      },
      payload: {
        scheduleVersion: '2025',
      },
      updatedAt: now,
      scheduleVersion: '2025',
    },
  };
};

const makeDemoSvg = (title, subtitle, lines) => `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="440" viewBox="0 0 760 440">
  <rect width="760" height="440" fill="#0d0d0d"/>
  <rect x="20" y="20" width="720" height="400" rx="14" fill="#141414" stroke="#e60000" stroke-width="2"/>
  <text x="48" y="72" fill="#e60000" font-family="monospace" font-size="14" font-weight="bold">AXION OCR VERIFIED TAX RECORD</text>
  <text x="48" y="112" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">${title}</text>
  <text x="48" y="142" fill="#a8a8a8" font-family="sans-serif" font-size="15">${subtitle}</text>
  <line x1="48" y1="166" x2="712" y2="166" stroke="#2c2c2c" stroke-width="1"/>
  ${lines.map((line, idx) => `<text x="48" y="${208 + idx * 38}" fill="#e5e5e5" font-family="monospace" font-size="15">${line}</text>`).join('\n  ')}
</svg>`;

const ensureDataStore = async () => {
  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadsDir, { recursive: true });

  const demoUploadDir = path.join(uploadsDir, DEMO_WORKSPACE_ID);
  await mkdir(demoUploadDir, { recursive: true });

  const demoW2Path = path.join(demoUploadDir, '2025-W2-Bay-Area-Health-Systems.svg');
  if (!existsSync(demoW2Path)) {
    await writeFile(demoW2Path, makeDemoSvg(
      'Form W-2 · Wage and Tax Statement (2025)',
      'Employer: Bay Area Health Systems Inc. · Employee: Elena Vance',
      [
        'Box 1  Wages, tips, other comp:       $94,200.00',
        'Box 2  Federal income tax withheld:   $14,820.00',
        'Box 3  Social security wages:         $94,200.00',
        'Box 16 State wages (CA):              $94,200.00',
        'OCR Pipeline Status:                  PASS (Confidence 99.4%)',
      ]
    ), 'utf8');
  }

  const demo1099Path = path.join(demoUploadDir, '2025-1099-NEC-Stripe-Consulting.svg');
  if (!existsSync(demo1099Path)) {
    await writeFile(demo1099Path, makeDemoSvg(
      'Form 1099-NEC · Nonemployee Compensation (2025)',
      'Payer: Stripe / Vance Clinical Advisory LLC · Recipient: Elena Vance',
      [
        'Box 1  Nonemployee compensation:      $68,400.00',
        'Box 4  Federal income tax withheld:   $0.00',
        'Schedule C Mapping:                   Gross Receipts (Line 1)',
        'OCR Pipeline Status:                  PASS (Confidence 99.1%)',
      ]
    ), 'utf8');
  }

  const demoIdPath = path.join(demoUploadDir, 'CA-Real-ID-Verification-Vance.svg');
  if (!existsSync(demoIdPath)) {
    await writeFile(demoIdPath, makeDemoSvg(
      'California REAL ID · Identity & Residency Verification',
      'Holder: Elena Vance · Vacaville, CA',
      [
        'Document Class:                       Government Photo ID',
        'Address Match:                        Verified (Solano County, CA)',
        'Expiration Check:                     Valid through 2029',
        'OCR Pipeline Status:                  PASS (Identity Confirmed)',
      ]
    ), 'utf8');
  }

  const demoSchedPath = path.join(demoUploadDir, 'schedule-c-summary-2025.txt');
  if (!existsSync(demoSchedPath)) {
    await writeFile(demoSchedPath, [
      'Schedule C Summary (2025)',
      'Client: Elena Vance (Vance Clinical Advisory)',
      'Gross Income: $68,400',
      'Expenses: $16,250',
      'Net Profit or Loss: $52,150',
    ].join('\n'), 'utf8');
  }

  if (!existsSync(consentLogFile)) {
    await writeFile(consentLogFile, '[]', 'utf8');
  }

  if (!existsSync(portalStoreFile)) {
    await writeFile(portalStoreFile, JSON.stringify({ workspaces: [buildSeedDemoWorkspace()] }, null, 2), 'utf8');
  }
};

const readJsonFile = async (filePath, fallback) => {
  await ensureDataStore();
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJsonFile = async (filePath, payload) => {
  await ensureDataStore();
  await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
};

const readConsentLog = async () => readJsonFile(consentLogFile, []);

const appendConsentLog = async (entry) => {
  const current = await readConsentLog();
  current.push(entry);
  await writeJsonFile(consentLogFile, current);
};

const readPortalStore = async () => readJsonFile(portalStoreFile, { workspaces: [] });

const writePortalStore = async (store) => {
  await writeJsonFile(portalStoreFile, store);
};

const normalizeString = (value) => String(value || '').trim();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeString(value));
const digitsOnly = (value) => normalizeString(value).replace(/\D/g, '');
const isValidPhone = (value) => digitsOnly(value).length >= 10;
const sanitizeFilename = (value) => normalizeString(value)
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '') || 'file';
const createId = (prefix) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
const createToken = () => crypto.randomBytes(24).toString('hex');

const topicLabels = (preferences, language = 'en') => {
  const txt = (en, es) => (language === 'es' ? es : en);
  return [
    preferences?.appointmentUpdates ? txt('appointment reminders', 'recordatorios de cita') : null,
    preferences?.documentReminders ? txt('document reminders', 'recordatorios de documentos') : null,
    preferences?.statusUpdates ? txt('return status updates', 'actualizaciones del estado de la declaracion') : null,
    preferences?.taxDeadlineReminders ? txt('deadline reminders', 'recordatorios de fechas limite') : null,
  ].filter(Boolean);
};

const maskEmail = (value) => {
  const trimmed = normalizeString(value);
  if (!trimmed.includes('@')) return trimmed;
  const [local, domain] = trimmed.split('@');
  const safeLocal = local.length <= 2 ? `${local[0] || ''}*` : `${local.slice(0, 2)}***`;
  return `${safeLocal}@${domain}`;
};

const maskPhone = (value) => {
  const digits = digitsOnly(value);
  if (digits.length < 4) return value || '';
  return `***-***-${digits.slice(-4)}`;
};

const buildOptInMessage = ({ preferences, context, language = 'en' }) => {
  const txt = (en, es) => (language === 'es' ? es : en);
  const advisorName = normalizeString(context?.advisorName) || txt('your AXION tax professional', 'su profesional fiscal de AXION');
  const advisorPhone = normalizeString(context?.advisorPhone);
  const topics = topicLabels(preferences, language);
  const appointmentLine = context?.nextAppointment
    ? txt(
      `Next meeting: ${context.nextAppointment.date} at ${context.nextAppointment.time}`,
      `Proxima cita: ${context.nextAppointment.date} a las ${context.nextAppointment.time}`
    )
    : txt('No meeting is booked yet.', 'Todavia no hay cita reservada.');
  const missingItems = Array.isArray(context?.reminderItems) ? context.reminderItems.length : 0;
  const subject = txt('AXION updates are now active', 'Las actualizaciones de AXION ya estan activas');
  const text = [
    txt(`Your update preferences with ${advisorName} are on.`, `Sus preferencias de actualizacion con ${advisorName} ya estan activas.`),
    `${txt('Delivery', 'Canal')}: ${preferences.channel}`,
    `${txt('Updates selected', 'Actualizaciones elegidas')}: ${topics.join(', ')}`,
    appointmentLine,
    missingItems > 0
      ? txt(`Current missing item count: ${missingItems}`, `Cantidad actual de faltantes: ${missingItems}`)
      : txt('No critical missing items right now.', 'No hay faltantes criticos en este momento.'),
    advisorPhone
      ? txt(`If anything changes, call ${advisorName} at ${advisorPhone}.`, `Si algo cambia, llame a ${advisorName} al ${advisorPhone}.`)
      : txt(`If anything changes, reply directly to ${advisorName}.`, `Si algo cambia, responda directamente a ${advisorName}.`)
  ].join('\n');
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>${subject}</h2>
      <p>${txt(`Your update preferences with ${advisorName} are on.`, `Sus preferencias de actualizacion con ${advisorName} ya estan activas.`)}</p>
      <p><strong>${txt('Delivery', 'Canal')}:</strong> ${preferences.channel}</p>
      <p><strong>${txt('Updates selected', 'Actualizaciones elegidas')}:</strong> ${topics.join(', ')}</p>
      <p>${appointmentLine}</p>
      <p>${missingItems > 0
        ? txt(`Current missing item count: ${missingItems}`, `Cantidad actual de faltantes: ${missingItems}`)
        : txt('No critical missing items right now.', 'No hay faltantes criticos en este momento.')}</p>
      <p>${advisorPhone
        ? txt(`Questions? Call ${advisorName} at ${advisorPhone}.`, `Preguntas? Llame a ${advisorName} al ${advisorPhone}.`)
        : txt(`Questions? Reply to ${advisorName}.`, `Preguntas? Responda a ${advisorName}.`)}</p>
    </div>
  `;
  const sms = txt(
    `${advisorName} updates are active. Topics: ${topics.join(', ')}. ${appointmentLine}`,
    `Las actualizaciones de ${advisorName} estan activas. Temas: ${topics.join(', ')}. ${appointmentLine}`
  );

  return { subject, text, html, sms };
};

const buildTestUpdateMessage = ({ preferences, context, language = 'en' }) => {
  const txt = (en, es) => (language === 'es' ? es : en);
  const advisorName = normalizeString(context?.advisorName) || txt('your AXION tax professional', 'su profesional fiscal de AXION');
  const appointmentLine = context?.nextAppointment
    ? txt(
      `Next meeting: ${context.nextAppointment.date} at ${context.nextAppointment.time}.`,
      `Proxima cita: ${context.nextAppointment.date} a las ${context.nextAppointment.time}.`
    )
    : txt('No meeting booked yet.', 'Todavia no hay cita reservada.');
  const summary = txt(
    `This is a live test update from ${advisorName}. Readiness score: ${context?.readinessScore || 0}/100. Checklist progress: ${context?.checklistPct || 0}%.`,
    `Esta es una actualizacion real de prueba de ${advisorName}. Puntaje de preparacion: ${context?.readinessScore || 0}/100. Avance del checklist: ${context?.checklistPct || 0}%.`
  );
  const text = [
    summary,
    appointmentLine,
    txt(`Your contact preference with ${advisorName} is working from the client portal.`, `Su preferencia de contacto con ${advisorName} esta funcionando desde el portal del cliente.`)
  ].join('\n');
  const subject = txt(`${advisorName} live update test`, `Prueba real de actualizacion de ${advisorName}`);
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>${subject}</h2>
      <p>${summary}</p>
      <p>${appointmentLine}</p>
      <p>${txt(`Your contact preference with ${advisorName} is working from the client portal.`, `Su preferencia de contacto con ${advisorName} esta funcionando desde el portal del cliente.`)}</p>
    </div>
  `;
  const sms = `${subject}: ${summary} ${appointmentLine}`;
  return { subject, text, html, sms };
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!configuredChannels.email) {
    throw new Error('Email delivery is not configured on this server.');
  }
  const result = await resendClient.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
    text,
  });
  return { channel: 'email', id: result?.data?.id || null };
};

const sendText = async ({ to, body }) => {
  if (!configuredChannels.text) {
    throw new Error('SMS delivery is not configured on this server.');
  }
  const result = await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER,
    to,
  });
  return { channel: 'text', id: result?.sid || null };
};

const validatePreferencePayload = ({ preferences }) => {
  if (!preferences || typeof preferences !== 'object') return 'Missing update preferences.';
  const topics = topicLabels(preferences, 'en');
  if (!preferences.consent) return 'Consent is required before updates can be sent.';
  if (topics.length === 0) return 'Choose at least one update type.';
  if ((preferences.channel === 'email' || preferences.channel === 'both') && !isValidEmail(preferences.email)) {
    return 'A valid email address is required for email updates.';
  }
  if ((preferences.channel === 'text' || preferences.channel === 'both') && !isValidPhone(preferences.phone)) {
    return 'A valid phone number is required for text updates.';
  }
  return null;
};

const deliverMessages = async ({ preferences, context, language, builder }) => {
  const payload = builder({ preferences, context, language });
  const deliveries = [];
  if (preferences.channel === 'email' || preferences.channel === 'both') {
    deliveries.push(await sendEmail({
      to: preferences.email.trim(),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }));
  }
  if (preferences.channel === 'text' || preferences.channel === 'both') {
    deliveries.push(await sendText({
      to: preferences.phone.trim(),
      body: payload.sms,
    }));
  }
  return deliveries;
};

const mergeChecklist = (source = {}) => ({
  ...DEFAULT_CHECKLIST,
  ...(source && typeof source === 'object' ? source : {}),
});

const buildWorkspaceResponse = (workspace) => {
  const documents = Array.isArray(workspace.documents) ? workspace.documents : [];
  const laneCounts = documents.reduce((acc, doc) => {
    acc[doc.laneId] = (acc[doc.laneId] || 0) + 1;
    return acc;
  }, { jobs: 0, business: 0, personal: 0 });

  return {
    id: workspace.id,
    client: workspace.client,
    taxProfessional: workspace.taxProfessional || null,
    appointments: workspace.appointments || [],
    documents,
    checklist: mergeChecklist(workspace.checklist),
    updates: { ...DEFAULT_UPDATES, ...(workspace.updates || {}) },
    scheduleC: workspace.scheduleC || null,
    laneCounts,
    updatedAt: workspace.updatedAt,
    createdAt: workspace.createdAt,
  };
};

const getWorkspaceContext = async (token, _req = null) => {
  const store = await readPortalStore();
  let index = store.workspaces.findIndex((entry) => entry.token === token);
  if (index === -1 && token === DEMO_WORKSPACE_TOKEN) {
    const seeded = buildSeedDemoWorkspace();
    store.workspaces.push(seeded);
    await writePortalStore(store);
    index = store.workspaces.length - 1;
  }
  if (index === -1) return null;
  return { store, index, workspace: store.workspaces[index] };
};

const readPortalToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return normalizeString(req.headers['x-portal-token'] || req.query.token);
};

const readAdminToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return normalizeString(req.headers['x-admin-token']);
};

const portalAuth = async (req, res, next) => {
  const token = readPortalToken(req);
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Portal access token is required.' });
  }

  const context = await getWorkspaceContext(token, req);
  if (!context) {
    return res.status(401).json({ ok: false, error: 'Portal session was not found. Please reopen your workspace.' });
  }

  req.portalToken = token;
  req.portalStore = context.store;
  req.portalIndex = context.index;
  req.portalWorkspace = context.workspace;
  return next();
};

const adminAuth = (req, res, next) => {
  const adminToken = normalizeString(process.env.AXION_ADMIN_TOKEN);
  if (!adminToken) {
    return res.status(404).json({ ok: false, error: 'This endpoint is not enabled.' });
  }

  if (readAdminToken(req) !== adminToken) {
    return res.status(403).json({ ok: false, error: 'Admin token is required.' });
  }

  return next();
};

const persistPortalWorkspace = async (req, workspace) => {
  req.portalStore.workspaces[req.portalIndex] = workspace;
  await writePortalStore(req.portalStore);
};

const makeDocumentRecord = ({ laneId, file, note = '', kind = 'upload', storedName }) => ({
  id: createId('doc'),
  laneId,
  kind,
  name: file.originalname,
  note: normalizeString(note),
  mimeType: file.mimetype,
  size: file.size,
  storedName,
  uploadedAt: new Date().toISOString(),
});

const handleHealthCheck = (_req, res) => {
  res.json({
    ok: true,
    service: 'axion-tax',
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    emailConfigured: configuredChannels.email,
    textConfigured: configuredChannels.text,
  });
};

app.get('/healthz', handleHealthCheck);
app.get('/api/healthz', handleHealthCheck);

app.use('/api/updates', updatesRateLimiter);
app.use('/api/portal', portalRateLimiter);

app.get('/api/updates/health', (_req, res) => {
  res.json({ ok: true, configuredChannels });
});

app.get('/api/updates/logs', adminAuth, async (req, res) => {
  try {
    const language = req.query.language === 'es' ? 'es' : 'en';
    const logs = await readConsentLog();
    const recent = logs
      .slice()
      .reverse()
      .slice(0, 8)
      .map((entry) => ({
        type: entry.type,
        createdAt: entry.createdAt,
        channel: entry.preferences?.channel || 'unknown',
        topics: topicLabels(entry.preferences, language),
        email: maskEmail(entry.preferences?.email),
        phone: maskPhone(entry.preferences?.phone),
        deliveries: Array.isArray(entry.deliveries) ? entry.deliveries : [],
      }));

    return res.json({ ok: true, items: recent });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to read update logs right now.',
    });
  }
});

app.post('/api/updates/opt-in', portalAuth, async (req, res) => {
  const { preferences, context = {}, language = 'en' } = req.body || {};
  const validationError = validatePreferencePayload({ preferences });
  if (validationError) return res.status(400).json({ ok: false, error: validationError });

  try {
    const deliveries = await deliverMessages({
      preferences,
      context,
      language,
      builder: buildOptInMessage,
    });

    const logEntry = {
      type: 'opt-in',
      createdAt: new Date().toISOString(),
      preferences,
      context,
      deliveries,
    };
    await appendConsentLog(logEntry);

    return res.json({
      ok: true,
      message: language === 'es'
        ? 'La autorizacion quedo guardada y el mensaje de confirmacion fue enviado.'
        : 'Your opt-in was saved and a confirmation update was sent.',
      deliveries,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to send update right now.',
    });
  }
});

app.post('/api/updates/test', portalAuth, async (req, res) => {
  const { preferences, context = {}, language = 'en' } = req.body || {};
  const validationError = validatePreferencePayload({ preferences });
  if (validationError) return res.status(400).json({ ok: false, error: validationError });

  try {
    const deliveries = await deliverMessages({
      preferences,
      context,
      language,
      builder: buildTestUpdateMessage,
    });

    const logEntry = {
      type: 'test',
      createdAt: new Date().toISOString(),
      preferences,
      context,
      deliveries,
    };
    await appendConsentLog(logEntry);

    return res.json({
      ok: true,
      message: language === 'es' ? 'La actualizacion de prueba fue enviada.' : 'The live test update was sent.',
      deliveries,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to send test update right now.',
    });
  }
});

app.post('/api/portal/access', async (req, res) => {
  const isDemoRequest = Boolean(req.body?.demo) || normalizeString(req.body?.email).toLowerCase() === DEMO_CLIENT_EMAIL;
  const firstName = normalizeString(req.body?.firstName) || (isDemoRequest ? 'Elena' : '');
  const lastName = normalizeString(req.body?.lastName) || (isDemoRequest ? 'Vance' : '');
  const email = normalizeString(req.body?.email).toLowerCase() || (isDemoRequest ? DEMO_CLIENT_EMAIL : '');
  const phone = normalizeString(req.body?.phone) || (isDemoRequest ? '(707) 555-0184' : '');
  const taxProfessional = sanitizeTaxProfessional(req.body?.taxProfessionalId) || (isDemoRequest ? sanitizeTaxProfessional('marcus') : null);

  if (!firstName || !lastName) {
    return res.status(400).json({ ok: false, error: 'First and last name are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'A valid email is required.' });
  }
  if (!taxProfessional) {
    return res.status(400).json({ ok: false, error: 'Select a tax professional to continue.' });
  }

  const store = await readPortalStore();
  const existingIndex = store.workspaces.findIndex((entry) => entry.client?.email?.toLowerCase() === email);
  const nextToken = isDemoRequest ? DEMO_WORKSPACE_TOKEN : createToken();
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    const existing = store.workspaces[existingIndex];
    const workspace = {
      ...existing,
      token: nextToken,
      client: {
        ...existing.client,
        firstName,
        lastName,
        email,
        phone,
      },
      taxProfessional,
      updates: {
        ...DEFAULT_UPDATES,
        ...(existing.updates || {}),
        email,
        phone,
      },
      updatedAt: now,
    };

    store.workspaces[existingIndex] = workspace;
    await writePortalStore(store);

    return res.status(200).json({
      ok: true,
      token: workspace.token,
      workspace: buildWorkspaceResponse(workspace),
      configuredChannels,
    });
  }

  if (isDemoRequest) {
    const demoWorkspace = buildSeedDemoWorkspace();
    store.workspaces.push(demoWorkspace);
    await writePortalStore(store);
    return res.status(200).json({
      ok: true,
      token: demoWorkspace.token,
      workspace: buildWorkspaceResponse(demoWorkspace),
      configuredChannels,
    });
  }

  const workspace = {
    id: createId('ws'),
    token: nextToken,
    createdAt: now,
    updatedAt: now,
    client: { firstName, lastName, email, phone },
    taxProfessional,
    appointments: [],
    documents: [],
    checklist: { ...DEFAULT_CHECKLIST },
    updates: { ...DEFAULT_UPDATES, email, phone },
    scheduleC: null,
  };

  store.workspaces.push(workspace);
  await writePortalStore(store);

  return res.status(201).json({
    ok: true,
    token: workspace.token,
    workspace: buildWorkspaceResponse(workspace),
    configuredChannels,
  });
});

app.get('/api/portal/workspace', portalAuth, async (req, res) => {
  return res.json({
    ok: true,
    workspace: buildWorkspaceResponse(req.portalWorkspace),
    configuredChannels,
  });
});

app.post('/api/portal/appointments', portalAuth, async (req, res) => {
  const date = normalizeString(req.body?.date);
  const time = normalizeString(req.body?.time);
  const type = normalizeString(req.body?.type) || 'Tax Preparation Session';

  if (!date || !time) {
    return res.status(400).json({ ok: false, error: 'Date and time are required.' });
  }

  const workspace = {
    ...req.portalWorkspace,
    appointments: [
      ...req.portalWorkspace.appointments,
      {
        id: createId('appt'),
        date,
        time,
        type,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
      },
    ],
    checklist: {
      ...mergeChecklist(req.portalWorkspace.checklist),
      appointment: true,
    },
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.status(201).json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

app.delete('/api/portal/appointments/:appointmentId', portalAuth, async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const appointments = req.portalWorkspace.appointments.filter((item) => item.id !== appointmentId);
  const workspace = {
    ...req.portalWorkspace,
    appointments,
    checklist: {
      ...mergeChecklist(req.portalWorkspace.checklist),
      appointment: appointments.length > 0,
    },
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

app.patch('/api/portal/appointments/:appointmentId', portalAuth, async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const date = normalizeString(req.body?.date);
  const time = normalizeString(req.body?.time);
  const type = normalizeString(req.body?.type);

  if (!date || !time) {
    return res.status(400).json({ ok: false, error: 'Date and time are required.' });
  }

  const exists = req.portalWorkspace.appointments.some((item) => item.id === appointmentId);
  if (!exists) {
    return res.status(404).json({ ok: false, error: 'Appointment not found.' });
  }

  const appointments = req.portalWorkspace.appointments.map((item) => (
    item.id === appointmentId
      ? {
        ...item,
        date,
        time,
        type: type || item.type,
        updatedAt: new Date().toISOString(),
      }
      : item
  ));

  const workspace = {
    ...req.portalWorkspace,
    appointments,
    checklist: {
      ...mergeChecklist(req.portalWorkspace.checklist),
      appointment: appointments.length > 0,
    },
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

app.patch('/api/portal/checklist', portalAuth, async (req, res) => {
  const checklist = mergeChecklist(req.body?.checklist);
  const workspace = {
    ...req.portalWorkspace,
    checklist,
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

app.patch('/api/portal/updates', portalAuth, async (req, res) => {
  const updates = {
    ...DEFAULT_UPDATES,
    ...(req.portalWorkspace.updates || {}),
    ...(req.body?.updates && typeof req.body.updates === 'object' ? req.body.updates : {}),
  };

  const workspace = {
    ...req.portalWorkspace,
    updates,
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.json({ ok: true, workspace: buildWorkspaceResponse(workspace), configuredChannels });
});

app.post('/api/portal/documents', portalAuth, upload.single('file'), async (req, res) => {
  const laneId = normalizeString(req.body?.laneId);
  const note = normalizeString(req.body?.note);
  const file = req.file;

  if (!UPLOAD_LANES.has(laneId)) {
    return res.status(400).json({ ok: false, error: 'A valid upload lane is required.' });
  }
  if (!file) {
    return res.status(400).json({ ok: false, error: 'A file is required.' });
  }

  const workspaceDir = path.join(uploadsDir, req.portalWorkspace.id);
  await mkdir(workspaceDir, { recursive: true });

  const storedName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
  const storedPath = path.join(workspaceDir, storedName);
  await writeFile(storedPath, file.buffer);

  const document = makeDocumentRecord({ laneId, file, note, storedName });
  const checklist = mergeChecklist(req.portalWorkspace.checklist);
  if (laneId === 'jobs') checklist.income = true;
  if (laneId === 'business') checklist.business = true;
  if (laneId === 'personal') checklist.personal = true;

  const workspace = {
    ...req.portalWorkspace,
    documents: [...req.portalWorkspace.documents, document],
    checklist,
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.status(201).json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

app.patch('/api/portal/documents/:documentId', portalAuth, async (req, res) => {
  const documentId = req.params.documentId;
  const name = normalizeString(req.body?.name);
  const note = normalizeString(req.body?.note);

  const documents = req.portalWorkspace.documents.map((doc) => (
    doc.id === documentId
      ? { ...doc, name: name || doc.name, note, updatedAt: new Date().toISOString() }
      : doc
  ));

  const workspace = {
    ...req.portalWorkspace,
    documents,
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

app.delete('/api/portal/documents/:documentId', portalAuth, async (req, res) => {
  const documentId = req.params.documentId;
  const document = req.portalWorkspace.documents.find((item) => item.id === documentId);
  if (!document) {
    return res.status(404).json({ ok: false, error: 'Document not found.' });
  }

  const storedPath = path.join(uploadsDir, req.portalWorkspace.id, document.storedName);
  if (existsSync(storedPath)) {
    await rm(storedPath, { force: true });
  }

  const documents = req.portalWorkspace.documents.filter((item) => item.id !== documentId);
  const checklist = mergeChecklist(req.portalWorkspace.checklist);
  checklist.income = documents.some((doc) => doc.laneId === 'jobs');
  checklist.business = Boolean(req.portalWorkspace.scheduleC) || documents.some((doc) => doc.laneId === 'business');
  checklist.personal = documents.some((doc) => doc.laneId === 'personal');

  const workspace = {
    ...req.portalWorkspace,
    documents,
    checklist,
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

app.get('/api/portal/documents/:documentId/download', portalAuth, async (req, res) => {
  const documentId = req.params.documentId;
  const document = req.portalWorkspace.documents.find((item) => item.id === documentId);
  if (!document) {
    return res.status(404).json({ ok: false, error: 'Document not found.' });
  }

  const storedPath = path.join(uploadsDir, req.portalWorkspace.id, document.storedName);
  if (!existsSync(storedPath)) {
    return res.status(404).json({ ok: false, error: 'Stored file not found.' });
  }

  return res.download(storedPath, document.name);
});

app.post('/api/portal/schedule-c', portalAuth, async (req, res) => {
  const summary = req.body?.summary;
  const payload = req.body?.payload;
  if (!summary || typeof summary !== 'object') {
    return res.status(400).json({ ok: false, error: 'Schedule C summary is required.' });
  }

  const scheduleVersion = normalizeString(payload?.scheduleVersion) || String(new Date().getFullYear());
  const workspaceDir = path.join(uploadsDir, req.portalWorkspace.id);
  await mkdir(workspaceDir, { recursive: true });

  const storedName = `schedule-c-summary-${scheduleVersion}.txt`;
  const storedPath = path.join(workspaceDir, storedName);
  const lines = [
    `Schedule C Summary (${scheduleVersion})`,
    `Generated: ${new Date().toISOString()}`,
    `Gross Income: ${summary.gross}`,
    `Expenses: ${summary.expenses}`,
    `Net Profit or Loss: ${summary.net}`,
  ];
  await writeFile(storedPath, lines.join('\n'), 'utf8');

  const existing = req.portalWorkspace.documents.find((item) => item.kind === 'schedule-c-summary');
  const documents = existing
    ? req.portalWorkspace.documents.map((item) => item.id === existing.id ? {
      ...item,
      name: `Schedule C Summary ${scheduleVersion}.txt`,
      note: `Gross ${summary.gross} | Net ${summary.net}`,
      storedName,
      uploadedAt: new Date().toISOString(),
      size: Buffer.byteLength(lines.join('\n')),
      mimeType: 'text/plain',
    } : item)
    : [
      ...req.portalWorkspace.documents,
      {
        id: createId('doc'),
        laneId: 'business',
        kind: 'schedule-c-summary',
        name: `Schedule C Summary ${scheduleVersion}.txt`,
        note: `Gross ${summary.gross} | Net ${summary.net}`,
        mimeType: 'text/plain',
        size: Buffer.byteLength(lines.join('\n')),
        storedName,
        uploadedAt: new Date().toISOString(),
      },
    ];

  const workspace = {
    ...req.portalWorkspace,
    scheduleC: {
      summary,
      payload,
      updatedAt: new Date().toISOString(),
      scheduleVersion,
    },
    documents,
    checklist: {
      ...mergeChecklist(req.portalWorkspace.checklist),
      business: true,
    },
    updatedAt: new Date().toISOString(),
  };

  await persistPortalWorkspace(req, workspace);
  return res.status(201).json({ ok: true, workspace: buildWorkspaceResponse(workspace) });
});

if (isProduction && !process.env.VERCEL) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(port, async () => {
    await ensureDataStore();
    console.log(`AXION API listening on http://127.0.0.1:${port}`);
  });
}

export default app;
