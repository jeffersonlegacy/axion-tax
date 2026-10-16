import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/useLanguage';
import { BookOpenText, ChevronDown, ChevronRight } from 'lucide-react';
import ClientToolsSection from '../components/ClientToolsSection/ClientToolsSection';
import './ServicesPage.css';

const meaningCategories = [
  {
    id: 'important',
    title: 'Most Important Terms',
    terms: [
      {
        term: 'AGI (Adjusted Gross Income)',
        explain: 'Think of AGI as your "income after the IRS starter edits." A lot of credits and deductions are based on this number.',
        legal: 'Defined in IRC Section 62.'
      },
      {
        term: 'Taxable Income',
        explain: 'This is the part of your income that actually gets taxed after deductions. Smaller taxable income usually means smaller tax bill.',
        legal: 'Determined under IRC Section 63.'
      },
      {
        term: 'Standard Deduction',
        explain: 'A built-in discount on your income. Most people take this unless itemizing gives a bigger benefit.',
        legal: 'Authorized by IRC Section 63(c).'
      },
      {
        term: 'Itemized Deductions',
        explain: 'Instead of the standard deduction, you list specific deductible expenses. Worth it only if total is higher than standard deduction.',
        legal: 'Claimed on Schedule A under IRC Section 63(d).'
      },
      {
        term: 'Tax Credit',
        explain: 'A dollar-for-dollar tax reducer. If you owe $2,000 and get a $500 credit, now you owe $1,500. Beautiful math.',
        legal: 'Credits are authorized by specific Internal Revenue Code sections.'
      },
      {
        term: 'Withholding',
        explain: 'Money taken from your paycheck during the year and pre-paid to IRS/state on your behalf.',
        legal: 'Federal income tax withholding governed by IRC Chapter 24.'
      },
      {
        term: 'Estimated Tax',
        explain: 'Quarterly pay-as-you-go payments, common for self-employed people. Skip these and penalties can show up.',
        legal: 'Required under IRC Sections 6654 and 6655 when thresholds are met.'
      },
      {
        term: 'Basis',
        explain: 'Your tax "starting value" in an asset. Basis helps determine gain/loss when you sell.',
        legal: 'General basis rules in IRC Section 1012.'
      }
    ]
  },
  {
    id: 'misunderstood',
    title: 'Most Misunderstood Terms',
    terms: [
      {
        term: 'Write-Off',
        explain: 'A write-off is not free money. It just reduces taxable profit. It does not mean IRS buys your TV.',
        legal: 'Business expenses must be ordinary and necessary under IRC Section 162.'
      },
      {
        term: 'Refund',
        explain: 'A refund is usually your own overpaid money coming back. It is not bonus money from nowhere.',
        legal: 'Refund claims generally filed under IRC Section 6511 timing rules.'
      },
      {
        term: 'Dependent',
        explain: 'Not every child or relative automatically qualifies. IRS has relationship, support, residency, and other tests.',
        legal: 'Dependent tests under IRC Section 152.'
      },
      {
        term: 'Home Office Deduction',
        explain: 'Only applies to space used regularly and exclusively for business. Kitchen table usually does not pass.',
        legal: 'Business-use-of-home rules in IRC Section 280A.'
      },
      {
        term: 'Audit',
        explain: 'Audit means IRS is reviewing your return details. It does not automatically mean fraud.',
        legal: 'Examinations conducted under IRS administrative authority.'
      },
      {
        term: '1099-K',
        explain: '1099-K reports payment processing totals, not necessarily taxable profit by itself. Records still matter.',
        legal: 'Third-party network reporting under IRC Section 6050W.'
      },
      {
        term: 'Hobby vs Business',
        explain: 'If you run it like a real business with profit motive, rules differ from a hobby. IRS cares about facts.',
        legal: 'Profit motive analysis under IRC Section 183 and related regulations.'
      },
      {
        term: 'Extension',
        explain: 'Extension gives you more time to file, not more time to pay. Payment due date usually stays put.',
        legal: 'Automatic extension procedures under Treasury Regulations and IRS instructions.'
      }
    ]
  },
  {
    id: 'critical',
    title: 'Critical Terms',
    terms: [
      {
        term: 'Statute of Limitations',
        explain: 'The legal time window for IRS assessment or your refund claim. Miss the window and options shrink fast.',
        legal: 'Assessment period generally in IRC Section 6501; refund claims in IRC Section 6511.'
      },
      {
        term: 'Substantiation',
        explain: 'Fancy word for proof. If you claim it, keep records to back it up.',
        legal: 'Recordkeeping requirements under IRC Section 6001 and related rules.'
      },
      {
        term: 'Reasonable Cause',
        explain: 'Valid explanation that can reduce some penalties if you can show good-faith effort.',
        legal: 'Penalty relief standards appear in IRC penalty provisions and IRS guidance.'
      },
      {
        term: 'Underpayment Penalty',
        explain: 'Penalty for paying too little tax during the year. Estimated payments help avoid this surprise.',
        legal: 'Individual underpayment rules in IRC Section 6654.'
      },
      {
        term: 'Accuracy-Related Penalty',
        explain: 'Penalty for substantial understatement or negligence. Clean documentation is your best friend here.',
        legal: 'Penalty framework in IRC Section 6662.'
      },
      {
        term: 'Installment Agreement',
        explain: 'IRS payment plan when you cannot pay in full immediately.',
        legal: 'Collection installment authority under IRC Section 6159.'
      },
      {
        term: 'Offer in Compromise',
        explain: 'Settlement option for qualifying taxpayers who cannot fully pay tax debt. Hard to get, but real.',
        legal: 'Compromise authority under IRC Section 7122.'
      },
      {
        term: 'Innocent Spouse Relief',
        explain: 'Relief from joint tax liability in certain spouse-related situations.',
        legal: 'Relief framework under IRC Section 6015.'
      }
    ]
  },
  {
    id: 'littleknown',
    title: 'Little-Known Terms',
    terms: [
      {
        term: 'Safe Harbor (Estimated Tax)',
        explain: 'A legal shortcut to avoid underpayment penalties if you pay enough based on prior-year/current-year formulas.',
        legal: 'Safe harbor amounts in IRC Section 6654 and IRS instructions.'
      },
      {
        term: 'Qualified Business Income (QBI)',
        explain: 'Potential deduction for eligible business owners that can cut taxable income significantly.',
        legal: 'QBI deduction under IRC Section 199A.'
      },
      {
        term: 'Section 179',
        explain: 'Lets many businesses deduct qualifying equipment cost faster instead of over many years.',
        legal: 'Expensing election under IRC Section 179.'
      },
      {
        term: 'Bonus Depreciation',
        explain: 'Extra first-year depreciation for qualifying property. Rules and percentages vary by year.',
        legal: 'Additional first-year depreciation under IRC Section 168(k).'
      },
      {
        term: 'Accountable Plan',
        explain: 'Proper reimbursement setup so employee business reimbursements are not treated as taxable wages.',
        legal: 'Business expense reimbursement rules under Treasury Reg. Section 1.62-2.'
      },
      {
        term: 'SALT Cap',
        explain: 'Limit on deducting state/local taxes when itemizing. This catches many high-tax-state filers off guard.',
        legal: 'State and local tax deduction limits under IRC Section 164(b)(6).'
      },
      {
        term: 'Depreciation Recapture',
        explain: 'Part of your gain can be taxed differently when selling depreciated property. Surprise party nobody asked for.',
        legal: 'Recapture rules under IRC Sections 1245 and 1250.'
      },
      {
        term: 'Net Operating Loss (NOL)',
        explain: 'Business loss rules that may offset income in other years, subject to current limitations.',
        legal: 'NOL provisions under IRC Section 172.'
      }
    ]
  },
  {
    id: 'strategies',
    title: 'Tax Strategies',
    terms: [
      {
        term: 'Income Bunching',
        explain: 'Timing income into one year and deductions into another to improve total tax outcome.',
        legal: 'General planning approach within existing timing rules of the Internal Revenue Code.'
      },
      {
        term: 'Deduction Bunching',
        explain: 'Grouping deductible expenses in alternating years to beat standard deduction more often.',
        legal: 'Often applied with itemized deduction planning under Schedule A rules.'
      },
      {
        term: 'Entity Selection',
        explain: 'Choosing sole prop, S corp, partnership, etc., based on tax and legal fit. This one can move real money.',
        legal: 'Entity taxation governed by multiple IRC chapters and entity election rules.'
      },
      {
        term: 'Accountable Reimbursements',
        explain: 'Owner/employee reimbursements done correctly to preserve deductions and avoid wage treatment.',
        legal: 'Treasury Reg. Section 1.62-2 requirements must be met.'
      },
      {
        term: 'Cost Segregation',
        explain: 'Engineering-based method to accelerate depreciation on building components.',
        legal: 'Uses asset classification and depreciation rules under IRC Section 168.'
      },
      {
        term: 'Retirement Contribution Planning',
        explain: 'Using SEP, Solo 401(k), IRA, etc. to lower current taxes and build long-term wealth.',
        legal: 'Retirement plan deduction limits and eligibility governed by multiple IRC provisions.'
      },
      {
        term: 'Tax-Loss Harvesting',
        explain: 'Selling losing investments to offset gains. Useful, but wash-sale rules can bite.',
        legal: 'Capital loss and wash-sale rules under IRC Sections 1211 and 1091.'
      },
      {
        term: 'Charitable Stacking',
        explain: 'Concentrating donations into selected years for larger itemized benefit.',
        legal: 'Charitable deduction standards under IRC Section 170.'
      }
    ]
  },
  {
    id: 'methods',
    title: 'Tax Methods',
    terms: [
      {
        term: 'Cash Method',
        explain: 'Report income when money arrives and expenses when paid. Common for small businesses.',
        legal: 'Accounting methods under IRC Section 446 and related regulations.'
      },
      {
        term: 'Accrual Method',
        explain: 'Report income when earned and expenses when incurred, even if money moves later.',
        legal: 'Accounting method rules under IRC Section 446 and IRC Section 461.'
      },
      {
        term: 'Completed Contract Method',
        explain: 'Certain long-term contract income recognized when contract completes.',
        legal: 'Long-term contract accounting under IRC Section 460.'
      },
      {
        term: 'Percentage-of-Completion',
        explain: 'Recognizes income progressively as project work gets done.',
        legal: 'Primary long-term contract method under IRC Section 460.'
      },
      {
        term: 'Specific Identification',
        explain: 'Method for choosing which specific investment shares you sold.',
        legal: 'Allowed basis-identification method for securities under IRS rules.'
      },
      {
        term: 'FIFO (First In, First Out)',
        explain: 'Default lot method: oldest shares sold first unless you specifically identify otherwise.',
        legal: 'Common tax lot convention under securities basis reporting rules.'
      },
      {
        term: 'Actual Expense Method (Vehicle)',
        explain: 'Deduct actual business-use portion of car costs with records.',
        legal: 'Vehicle expense substantiation and deduction rules under IRC Section 274 and related guidance.'
      },
      {
        term: 'Standard Mileage Method',
        explain: 'Simple per-mile rate method for business vehicle deduction if eligible.',
        legal: 'Rate published annually by IRS in revenue procedures/notices.'
      }
    ]
  },
  {
    id: 'legal',
    title: 'Legal Definitions You Should Know',
    terms: [
      {
        term: 'Ordinary and Necessary',
        explain: 'The core test for business expense deductibility. Common in your trade and helpful for business.',
        legal: 'Defined by case law and codified via IRC Section 162.'
      },
      {
        term: 'Constructive Receipt',
        explain: 'If money is made available to you, IRS can treat it as received even if you did not pick it up yet.',
        legal: 'Doctrine reflected in Treasury Reg. Section 1.451-2.'
      },
      {
        term: 'At-Risk Rules',
        explain: 'Limits losses to the amount you actually have at financial risk in the activity.',
        legal: 'At-risk limitation under IRC Section 465.'
      },
      {
        term: 'Passive Activity Loss',
        explain: 'Losses from passive activities may be limited and not fully deductible against active income.',
        legal: 'Passive activity limits under IRC Section 469.'
      },
      {
        term: 'Related-Party Transaction',
        explain: 'Deals between related parties face extra IRS scrutiny and special loss/disallowance rules.',
        legal: 'Related-party rules under IRC Sections 267 and 707.'
      },
      {
        term: 'Reasonable Compensation',
        explain: 'For certain entities, owner pay must be reasonable based on role and market rates.',
        legal: 'Compensation reasonableness standards developed through IRC provisions and case law.'
      },
      {
        term: 'Substantial Authority',
        explain: 'A strong legal standard used to support return positions and reduce some penalties.',
        legal: 'Accuracy-related penalty standards and regulations under IRC Section 6662.'
      },
      {
        term: 'Burden of Proof',
        explain: 'In many tax disputes, taxpayer must prove facts and support positions with records.',
        legal: 'General burden framework in IRC Section 7491 (with conditions).'
      }
    ]
  }
];

const CATEGORY_TITLE_ES = {
  important: 'Términos Más Importantes',
  misunderstood: 'Términos Más Confundidos',
  critical: 'Términos Críticos',
  littleknown: 'Términos Poco Conocidos',
  strategies: 'Estrategias Fiscales',
  methods: 'Métodos Fiscales',
  legal: 'Definiciones Legales que Debe Conocer'
};

const TERM_ES_MAP = {
  'AGI (Adjusted Gross Income)': { term: 'AGI (Ingreso Bruto Ajustado)', explain: 'Piense en AGI como su ingreso despues de los primeros ajustes permitidos por el IRS. Muchos creditos y deducciones parten de este numero.', legal: 'Definido en la Seccion 62 del IRC.' },
  'Taxable Income': { term: 'Ingreso Gravable', explain: 'Es la parte del ingreso que realmente paga impuestos despues de deducciones. Menos ingreso gravable suele significar menos impuesto.', legal: 'Determinado bajo la Seccion 63 del IRC.' },
  'Standard Deduction': { term: 'Deduccion Estandar', explain: 'Es un descuento base sobre su ingreso. La mayoria la usa, salvo que detallar deducciones le convenga mas.', legal: 'Autorizada por la Seccion 63(c) del IRC.' },
  'Itemized Deductions': { term: 'Deducciones Detalladas', explain: 'En vez de la deduccion estandar, lista gastos deducibles especificos. Solo conviene si el total supera la estandar.', legal: 'Se reclama en Schedule A bajo la Seccion 63(d) del IRC.' },
  'Tax Credit': { term: 'Credito Fiscal', explain: 'Reduce su impuesto dolar por dolar. Si debe 2,000 y obtiene un credito de 500, ahora debe 1,500.', legal: 'Los creditos se autorizan en secciones especificas del Internal Revenue Code.' },
  Withholding: { term: 'Retenciones', explain: 'Dinero que se descuenta de su cheque durante el ano y se paga por adelantado al IRS/estado.', legal: 'Regulado por el Capitulo 24 del IRC.' },
  'Estimated Tax': { term: 'Impuesto Estimado', explain: 'Pagos trimestrales anticipados, comunes para trabajo independiente. Si no los hace, pueden llegar penalidades.', legal: 'Requerido por las Secciones 6654 y 6655 del IRC cuando aplican umbrales.' },
  Basis: { term: 'Base', explain: 'Es su valor fiscal inicial en un activo. La base ayuda a calcular ganancia o perdida al vender.', legal: 'Reglas generales en la Seccion 1012 del IRC.' },
  'Write-Off': { term: 'Deduccion (Write-Off)', explain: 'No es dinero gratis. Solo reduce utilidad gravable; no significa que el IRS paga su compra personal.', legal: 'Los gastos deben ser ordinarios y necesarios bajo la Seccion 162 del IRC.' },
  Refund: { term: 'Reembolso', explain: 'Normalmente es su propio dinero pagado de mas que regresa. No es un bono nuevo.', legal: 'Las reclamaciones de reembolso siguen tiempos de la Seccion 6511 del IRC.' },
  Dependent: { term: 'Dependiente', explain: 'No todo hijo o familiar califica automaticamente. El IRS revisa relacion, apoyo, residencia y mas.', legal: 'Pruebas de dependiente bajo la Seccion 152 del IRC.' },
  'Home Office Deduction': { term: 'Deduccion de Oficina en Casa', explain: 'Aplica cuando el espacio se usa de forma regular y exclusiva para negocio. Mesa del comedor casi nunca pasa.', legal: 'Reglas de uso del hogar en la Seccion 280A del IRC.' },
  Audit: { term: 'Auditoria', explain: 'Significa que el IRS revisa detalles de su declaracion. No implica fraude automaticamente.', legal: 'Examenes realizados bajo autoridad administrativa del IRS.' },
  '1099-K': { term: '1099-K', explain: 'Reporta totales de cobros procesados, no ganancia neta final por si solo. Sus registros siguen siendo clave.', legal: 'Reporte de redes de pago bajo la Seccion 6050W del IRC.' },
  'Hobby vs Business': { term: 'Hobby vs Negocio', explain: 'Si lo opera con intencion real de ganancia, las reglas cambian frente a hobby. El IRS mira hechos, no etiquetas.', legal: 'Analisis de motivo de ganancia bajo la Seccion 183 del IRC y reglamentos relacionados.' },
  Extension: { term: 'Prorroga', explain: 'Da mas tiempo para presentar, no mas tiempo para pagar. La fecha de pago usualmente no cambia.', legal: 'Procedimientos automaticos bajo reglamentos del Tesoro e instrucciones del IRS.' },
  'Statute of Limitations': { term: 'Estatuto de Limitaciones', explain: 'Ventana legal para que IRS evalua o usted reclame reembolso. Si vence, sus opciones se reducen rapido.', legal: 'Periodo de evaluacion en Seccion 6501; reembolsos en Seccion 6511 del IRC.' },
  Substantiation: { term: 'Sustentacion', explain: 'Es prueba. Si lo reclama, debe poder demostrarlo con documentos.', legal: 'Requisitos de registros bajo la Seccion 6001 del IRC y reglas relacionadas.' },
  'Reasonable Cause': { term: 'Causa Razonable', explain: 'Explicacion valida que puede reducir ciertas penalidades si demuestra buena fe.', legal: 'Estandares de alivio en disposiciones de penalidad e instrucciones del IRS.' },
  'Underpayment Penalty': { term: 'Penalidad por Pago Insuficiente', explain: 'Penalidad por pagar menos impuesto del debido durante el ano. Pagos estimados ayudan a evitarla.', legal: 'Reglas individuales en la Seccion 6654 del IRC.' },
  'Accuracy-Related Penalty': { term: 'Penalidad por Exactitud', explain: 'Penalidad por subdeclaracion sustancial o negligencia. Buena documentacion es su mejor defensa.', legal: 'Marco de penalidad en la Seccion 6662 del IRC.' },
  'Installment Agreement': { term: 'Acuerdo en Plazos', explain: 'Plan de pago con IRS cuando no puede pagar todo de inmediato.', legal: 'Autoridad de cobro en la Seccion 6159 del IRC.' },
  'Offer in Compromise': { term: 'Oferta de Compromiso', explain: 'Opcion para negociar deuda tributaria si califica y no puede pagar por completo.', legal: 'Autoridad de compromiso en la Seccion 7122 del IRC.' },
  'Innocent Spouse Relief': { term: 'Alivio de Conyuge Inocente', explain: 'Alivio de deuda conjunta en situaciones especificas entre conyuges.', legal: 'Marco legal en la Seccion 6015 del IRC.' },
  'Safe Harbor (Estimated Tax)': { term: 'Puerto Seguro (Impuesto Estimado)', explain: 'Atajo legal para evitar penalidad por estimados si paga suficiente con base en formulas del ano previo o actual.', legal: 'Montos de puerto seguro en Seccion 6654 e instrucciones del IRS.' },
  'Qualified Business Income (QBI)': { term: 'Ingreso de Negocio Calificado (QBI)', explain: 'Deduccion potencial para dueños elegibles de negocio que puede bajar mucho el ingreso gravable.', legal: 'Deduccion QBI bajo la Seccion 199A del IRC.' },
  'Section 179': { term: 'Seccion 179', explain: 'Permite deducir equipo calificado mas rapido, en lugar de depreciarlo por muchos anos.', legal: 'Eleccion de gasto inmediato bajo la Seccion 179 del IRC.' },
  'Bonus Depreciation': { term: 'Depreciacion Acelerada (Bonus)', explain: 'Depreciacion adicional en el primer ano para propiedad calificada; porcentajes cambian por ano.', legal: 'Bajo la Seccion 168(k) del IRC.' },
  'Accountable Plan': { term: 'Plan de Reembolso Comprobable', explain: 'Estructura correcta de reembolsos para que no se traten como salario gravable.', legal: 'Reglas bajo Treasury Reg. 1.62-2.' },
  'SALT Cap': { term: 'Tope SALT', explain: 'Limite para deducir impuestos estatales/locales al detallar. Suele sorprender en estados de alta carga fiscal.', legal: 'Limite bajo la Seccion 164(b)(6) del IRC.' },
  'Depreciation Recapture': { term: 'Recaptura de Depreciacion', explain: 'Al vender propiedad depreciada, parte de la ganancia puede tributar distinto.', legal: 'Reglas de recaptura en Secciones 1245 y 1250 del IRC.' },
  'Net Operating Loss (NOL)': { term: 'Perdida Operativa Neta (NOL)', explain: 'Reglas de perdida de negocio que pueden compensar ingresos de otros anos, con limites vigentes.', legal: 'Disposiciones NOL en la Seccion 172 del IRC.' },
  'Income Bunching': { term: 'Agrupacion de Ingresos', explain: 'Mover ingresos entre anos para mejorar el resultado fiscal total.', legal: 'Estrategia de planeacion dentro de reglas de tiempo del IRC.' },
  'Deduction Bunching': { term: 'Agrupacion de Deducciones', explain: 'Concentrar gastos deducibles en anos alternos para superar la deduccion estandar mas seguido.', legal: 'Se aplica con planeacion de Schedule A.' },
  'Entity Selection': { term: 'Seleccion de Entidad', explain: 'Elegir sole prop, S corp, partnership, etc., segun encaje fiscal y legal. Puede mover mucho dinero.', legal: 'Regido por multiples capitulos del IRC y reglas de eleccion de entidad.' },
  'Accountable Reimbursements': { term: 'Reembolsos Comprobables', explain: 'Reembolsos bien hechos para mantener deducciones y evitar tratamiento como salario.', legal: 'Debe cumplir Treasury Reg. 1.62-2.' },
  'Cost Segregation': { term: 'Segregacion de Costos', explain: 'Metodo tecnico para acelerar depreciacion en componentes de edificios.', legal: 'Usa clasificacion de activos y reglas de Seccion 168 del IRC.' },
  'Retirement Contribution Planning': { term: 'Planeacion de Aportaciones de Retiro', explain: 'Usar SEP, Solo 401(k), IRA y similares para bajar impuestos actuales y construir patrimonio.', legal: 'Limites y elegibilidad bajo multiples disposiciones del IRC.' },
  'Tax-Loss Harvesting': { term: 'Cosecha de Perdidas Fiscales', explain: 'Vender inversiones con perdida para compensar ganancias. Ojo con regla wash-sale.', legal: 'Reglas bajo Secciones 1211 y 1091 del IRC.' },
  'Charitable Stacking': { term: 'Agrupacion de Donativos', explain: 'Concentrar donaciones en anos seleccionados para mayor beneficio detallado.', legal: 'Reglas de deduccion caritativa bajo Seccion 170 del IRC.' },
  'Cash Method': { term: 'Metodo de Efectivo', explain: 'Reporta ingreso cuando entra dinero y gasto cuando se paga. Comun en negocios pequenos.', legal: 'Metodos contables bajo Seccion 446 del IRC.' },
  'Accrual Method': { term: 'Metodo de Devengo', explain: 'Reporta ingreso cuando se gana y gasto cuando se incurre, aunque el dinero se mueva despues.', legal: 'Reglas bajo Secciones 446 y 461 del IRC.' },
  'Completed Contract Method': { term: 'Metodo de Contrato Completado', explain: 'Para ciertos contratos largos, reconoce ingreso al completar el contrato.', legal: 'Bajo Seccion 460 del IRC.' },
  'Percentage-of-Completion': { term: 'Metodo de Porcentaje de Avance', explain: 'Reconoce ingreso de forma progresiva segun avance del proyecto.', legal: 'Metodo principal para contratos largos bajo Seccion 460 del IRC.' },
  'Specific Identification': { term: 'Identificacion Especifica', explain: 'Metodo para elegir que acciones especificas vendio.', legal: 'Permitido bajo reglas de base para valores del IRS.' },
  'FIFO (First In, First Out)': { term: 'FIFO (Primero en Entrar, Primero en Salir)', explain: 'Metodo por defecto: se venden primero las acciones mas antiguas salvo identificacion especifica.', legal: 'Convencion comun en reglas de reporte de base.' },
  'Actual Expense Method (Vehicle)': { term: 'Metodo de Gastos Reales (Vehiculo)', explain: 'Deduce la porcion de uso de negocio sobre costos reales del auto, con soporte.', legal: 'Reglas de vehiculo bajo Seccion 274 del IRC y guias relacionadas.' },
  'Standard Mileage Method': { term: 'Metodo de Millaje Estandar', explain: 'Metodo simple por tarifa por milla para deduccion vehicular si califica.', legal: 'Tarifa publicada anualmente por IRS.' },
  'Ordinary and Necessary': { term: 'Ordinario y Necesario', explain: 'Prueba central para deducir gastos de negocio: comun en su industria y util para operar.', legal: 'Desarrollado por jurisprudencia y codificado via Seccion 162 del IRC.' },
  'Constructive Receipt': { term: 'Recepcion Constructiva', explain: 'Si el dinero esta disponible para usted, IRS puede tratarlo como recibido aunque no lo retire aun.', legal: 'Doctrina reflejada en Treasury Reg. 1.451-2.' },
  'At-Risk Rules': { term: 'Reglas At-Risk', explain: 'Limita perdidas al monto realmente en riesgo financiero en la actividad.', legal: 'Limitacion bajo Seccion 465 del IRC.' },
  'Passive Activity Loss': { term: 'Perdida por Actividad Pasiva', explain: 'Perdidas pasivas pueden quedar limitadas y no compensar totalmente ingreso activo.', legal: 'Limites bajo Seccion 469 del IRC.' },
  'Related-Party Transaction': { term: 'Transaccion con Parte Relacionada', explain: 'Operaciones entre partes relacionadas tienen mas escrutinio y reglas especiales.', legal: 'Reglas bajo Secciones 267 y 707 del IRC.' },
  'Reasonable Compensation': { term: 'Compensacion Razonable', explain: 'En ciertas entidades, pago del dueño debe ser razonable segun funciones y mercado.', legal: 'Estandares desarrollados por disposiciones del IRC y jurisprudencia.' },
  'Substantial Authority': { term: 'Autoridad Sustancial', explain: 'Estandar legal fuerte para respaldar posiciones y reducir ciertas penalidades.', legal: 'Estandar en reglamentos de la Seccion 6662 del IRC.' },
  'Burden of Proof': { term: 'Carga de la Prueba', explain: 'En muchas disputas fiscales, el contribuyente debe probar hechos con soporte.', legal: 'Marco general en Seccion 7491 del IRC (con condiciones).' }
};
const FAVORITES_STORAGE_KEY = 'axion-meaning-favorites-v1';
const RECENT_STORAGE_KEY = 'axion-meaning-recent-v1';
const MAX_RECENT_TERMS = 12;
const RELATED_TERM_MAP = {
  'important-AGI (Adjusted Gross Income)': ['important-Taxable Income', 'important-Standard Deduction', 'important-Itemized Deductions'],
  'important-Taxable Income': ['important-AGI (Adjusted Gross Income)', 'important-Standard Deduction', 'important-Tax Credit'],
  'important-Standard Deduction': ['important-Itemized Deductions', 'important-Taxable Income', 'strategies-Deduction Bunching'],
  'important-Itemized Deductions': ['important-Standard Deduction', 'strategies-Deduction Bunching', 'littleknown-SALT Cap'],
  'important-Estimated Tax': ['critical-Underpayment Penalty', 'littleknown-Safe Harbor (Estimated Tax)', 'misunderstood-Extension'],
  'misunderstood-Write-Off': ['legal-Ordinary and Necessary', 'critical-Substantiation', 'methods-Actual Expense Method (Vehicle)'],
  'misunderstood-1099-K': ['misunderstood-Hobby vs Business', 'important-Estimated Tax', 'legal-Burden of Proof'],
  'critical-Underpayment Penalty': ['important-Estimated Tax', 'littleknown-Safe Harbor (Estimated Tax)', 'misunderstood-Extension'],
  'littleknown-Qualified Business Income (QBI)': ['strategies-Entity Selection', 'legal-Reasonable Compensation', 'littleknown-Section 179'],
  'littleknown-Section 179': ['littleknown-Bonus Depreciation', 'strategies-Cost Segregation', 'methods-Accrual Method'],
  'strategies-Entity Selection': ['littleknown-Qualified Business Income (QBI)', 'legal-Reasonable Compensation', 'strategies-Accountable Reimbursements'],
  'strategies-Tax-Loss Harvesting': ['important-Basis', 'methods-Specific Identification', 'methods-FIFO (First In, First Out)'],
  'methods-Standard Mileage Method': ['methods-Actual Expense Method (Vehicle)', 'critical-Substantiation', 'misunderstood-Write-Off'],
  'legal-Ordinary and Necessary': ['misunderstood-Write-Off', 'critical-Substantiation', 'misunderstood-Home Office Deduction'],
  'legal-Burden of Proof': ['critical-Substantiation', 'misunderstood-Audit', 'legal-Substantial Authority']
};

const getDifficultyByCategory = (categoryId) => {
  if (categoryId === 'important' || categoryId === 'misunderstood') return 'beginner';
  if (categoryId === 'critical' || categoryId === 'littleknown') return 'intermediate';
  return 'advanced';
};

const parseAmount = (value) => {
  const numeric = Number(String(value).replaceAll(',', '').replaceAll('$', '').trim());
  return Number.isFinite(numeric) ? numeric : 0;
};

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));

const formatCurrency = (value, locale = 'en-US') => new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(value || 0);

const parseLoanDocumentText = (text) => {
  const source = text.replace(/\s+/g, ' ');
  const amountMatch = source.match(/(?:loan amount|principal|amount financed|original balance)[^0-9]{0,18}\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  const rateMatch = source.match(/(?:interest rate|apr|rate)[^0-9]{0,14}([0-9]+(?:\.[0-9]+)?)/i);
  const termMatch = source.match(/(?:loan term|term|number of payments)[^0-9]{0,14}([0-9]{1,4})\s*(months|month|mo|years|year|yrs|yr)?/i);
  const dateMatch = source.match(/(?:first payment date|start date|loan date)[^A-Za-z0-9]{0,12}([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i);

  let termMonths = 0;
  if (termMatch) {
    const raw = Number(termMatch[1]);
    const unit = (termMatch[2] || '').toLowerCase();
    termMonths = unit.startsWith('y') ? raw * 12 : raw;
  }

  return {
    principal: amountMatch ? String(parseAmount(amountMatch[1])) : '',
    annualRate: rateMatch ? String(Number(rateMatch[1])) : '',
    termMonths: termMonths > 0 ? String(termMonths) : '',
    startDate: dateMatch ? new Date(dateMatch[1]).toISOString().slice(0, 10) : ''
  };
};

const briefText = (value = '') => {
  const normalized = String(value).trim();
  if (!normalized) return normalized;
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return (match ? match[0] : normalized).trim();
};

const PortalToolSection = ({ id, pulseTarget, isOpen, onToggle, eyebrow, step, title, audience, children }) => (
  <section className={`tool-section portal-tool-shell glass-panel ${pulseTarget === id ? 'section-pulse' : ''}`} id={id}>
    <button
      type="button"
      className={`portal-tool-toggle ${isOpen ? 'open' : ''}`}
      onClick={() => onToggle(id)}
      aria-expanded={isOpen}
    >
      <div className="portal-tool-toggle-copy">
        {eyebrow ? <div className="tool-module-eyebrow">{eyebrow}</div> : null}
        <p className="tool-module-step">{step}</p>
        <h2>{title}</h2>
        <p className="portal-tool-audience">{audience}</p>
      </div>
      <span className="portal-tool-toggle-icon" aria-hidden="true">
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </span>
    </button>
    {isOpen && <div className="portal-tool-content">{children}</div>}
  </section>
);

const buildAmortizationRows = ({ principal, annualRate, termMonths, startDate }) => {
  const loanPrincipal = parseAmount(principal);
  const rate = clampNumber(parseAmount(annualRate), 0, 99.99) / 100 / 12;
  const months = clampNumber(Math.round(parseAmount(termMonths)), 1, 600);
  if (!loanPrincipal || !months) return { monthlyPayment: 0, rows: [], totalInterest: 0, totalPaid: 0 };

  const monthlyPayment = rate === 0
    ? loanPrincipal / months
    : (loanPrincipal * rate) / (1 - (1 + rate) ** (-months));

  let balance = loanPrincipal;
  let totalInterest = 0;
  const rows = [];
  const originDate = startDate ? new Date(`${startDate}T12:00:00`) : new Date();

  for (let month = 1; month <= months; month += 1) {
    const interest = balance * rate;
    const principalPaid = month === months ? balance : Math.max(0, monthlyPayment - interest);
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;

    const paymentDate = new Date(originDate);
    paymentDate.setMonth(originDate.getMonth() + month - 1);

    rows.push({
      month,
      paymentDate: paymentDate.toISOString().slice(0, 10),
      payment: monthlyPayment,
      interest,
      principal: principalPaid,
      balance
    });
  }

  return {
    monthlyPayment,
    rows,
    totalInterest,
    totalPaid: monthlyPayment * months
  };
};

const ServicesPage = ({ portalUnlocked = false, embedded = false }) => {
  const { language, copyMode, pickCopy } = useLanguage();
  const isSpanish = language === 'es';
  const copy = (en, es, basicEn = en, basicEs = es) => pickCopy(en, es, basicEn, basicEs);
  const locale = isSpanish ? 'es-US' : 'en-US';
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [activeTermKey, setActiveTermKey] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loanType, setLoanType] = useState('mortgage');
  const [loanInputs, setLoanInputs] = useState({
    principal: '',
    annualRate: '',
    termMonths: '',
    startDate: new Date().toISOString().slice(0, 10)
  });
  const [loanUploadFeedback, setLoanUploadFeedback] = useState('');
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [pulseTarget, setPulseTarget] = useState('');
  const [openPortalTool, setOpenPortalTool] = useState('');
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [recentViewed, setRecentViewed] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(window.localStorage.getItem(RECENT_STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const loanResults = useMemo(() => buildAmortizationRows(loanInputs), [loanInputs]);
  const togglePortalTool = (toolId) => {
    setOpenPortalTool((prev) => (prev === toolId ? '' : toolId));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const meaningView = useMemo(() => {
    const filteredCategories = meaningCategories
      .filter((category) => categoryFilter === 'all' || category.id === categoryFilter)
      .map((category) => {
        const localizedTerms = category.terms.map((entry) => {
          const esEntry = TERM_ES_MAP[entry.term];
          return {
            ...entry,
            originalTerm: entry.term,
            term: isSpanish && esEntry ? esEntry.term : entry.term,
            explain: isSpanish && esEntry ? esEntry.explain : entry.explain,
            legal: isSpanish && esEntry ? esEntry.legal : entry.legal
          };
        });

        const terms = localizedTerms.filter((entry) => {
          if (!normalizedQuery) return true;
          const haystack = `${entry.originalTerm || ''} ${entry.term} ${entry.explain} ${entry.legal}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        });

        return {
          ...category,
          displayTitle: isSpanish ? CATEGORY_TITLE_ES[category.id] || category.title : category.title,
          terms: terms.filter((entry) => {
            const termKey = `${category.id}-${entry.originalTerm || entry.term}`;
            const difficulty = getDifficultyByCategory(category.id);
            const matchesFavorites = favoritesOnly ? favoriteSet.has(termKey) : true;
            const matchesDifficulty = difficultyFilter === 'all' || difficulty === difficultyFilter;
            return matchesFavorites && matchesDifficulty;
          })
        };
      })
      .filter((category) => category.terms.length > 0);

    const flatTerms = filteredCategories.flatMap((category) =>
      category.terms.map((entry) => ({
        ...entry,
        categoryId: category.id,
        categoryTitle: category.displayTitle,
        difficulty: getDifficultyByCategory(category.id),
        key: `${category.id}-${entry.originalTerm || entry.term}`
      }))
    );

    return { filteredCategories, flatTerms };
  }, [categoryFilter, difficultyFilter, favoriteSet, favoritesOnly, isSpanish, normalizedQuery]);

  const activeTerm = useMemo(() => {
    if (meaningView.flatTerms.length === 0) return null;
    return meaningView.flatTerms.find((term) => term.key === activeTermKey) || meaningView.flatTerms[0];
  }, [activeTermKey, meaningView.flatTerms]);

  const totalTermCount = meaningCategories.reduce((sum, category) => sum + category.terms.length, 0);
  const visibleTermCount = meaningView.flatTerms.length;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = useMemo(() => {
    const set = new Set();
    meaningView.flatTerms.forEach((entry) => {
      const first = entry.term.trim().charAt(0).toUpperCase();
      set.add(/[A-Z]/.test(first) ? first : '#');
    });
    return set;
  }, [meaningView.flatTerms]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentViewed));
  }, [recentViewed]);

  const rememberTerm = (termKey) => {
    setRecentViewed((prev) => [termKey, ...prev.filter((item) => item !== termKey)].slice(0, MAX_RECENT_TERMS));
  };

  const activateTerm = (termKey) => {
    setActiveTermKey(termKey);
    rememberTerm(termKey);
  };

  const jumpToLetter = (letter) => {
    const target = meaningView.flatTerms.find((entry) => {
      const first = entry.term.trim().charAt(0).toUpperCase();
      const normalizedFirst = /[A-Z]/.test(first) ? first : '#';
      return normalizedFirst === letter;
    });

    if (!target) return;
    activateTerm(target.key);
    const element = document.getElementById(`term-anchor-${target.key}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleFavorite = (termKey) => {
    setFavorites((prev) => {
      if (prev.includes(termKey)) return prev.filter((item) => item !== termKey);
      return [...prev, termKey];
    });
  };

  const openTerm = (termKey) => {
    activateTerm(termKey);
    const element = document.getElementById(`term-anchor-${termKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const copyActiveTerm = async () => {
    if (!activeTerm) return;
    const text = `${activeTerm.term}\n\n${activeTerm.explain}\n\n${isSpanish ? 'Referencia fiscal' : 'Tax reference'}: ${activeTerm.legal}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt(isSpanish ? 'Copie este texto:' : 'Copy this text:', text);
    }
  };

  const shareActiveTerm = async () => {
    if (!activeTerm) return;
    const text = `${activeTerm.term} — ${activeTerm.explain} (${isSpanish ? 'Referencia fiscal' : 'Tax reference'}: ${activeTerm.legal})`;
    if (navigator.share) {
      try {
        await navigator.share({ title: activeTerm.term, text });
        return;
      } catch {
        // user canceled share flow
      }
    }
    await copyActiveTerm();
  };

  const exportFavoritesCsv = () => {
    const favoritesFlat = meaningCategories.flatMap((category) =>
      category.terms.map((entry) => ({
        key: `${category.id}-${entry.term}`,
        category: isSpanish ? CATEGORY_TITLE_ES[category.id] || category.title : category.title,
        term: isSpanish && TERM_ES_MAP[entry.term] ? TERM_ES_MAP[entry.term].term : entry.term,
        difficulty: getDifficultyByCategory(category.id),
        explain: isSpanish && TERM_ES_MAP[entry.term] ? TERM_ES_MAP[entry.term].explain : entry.explain,
        legal: isSpanish && TERM_ES_MAP[entry.term] ? TERM_ES_MAP[entry.term].legal : entry.legal
      }))
    ).filter((item) => favoriteSet.has(item.key));

    if (favoritesFlat.length === 0) return;

    const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const header = isSpanish
      ? ['Categoria', 'Termino', 'Nivel', 'Explicacion', 'Fundamento legal']
      : ['Category', 'Term', 'Difficulty', 'Explanation', 'Legal'];
    const rows = favoritesFlat.map((item) => [
      item.category,
      item.term,
      item.difficulty,
      item.explain,
      item.legal
    ]);

    const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'axion-favorite-tax-terms.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const recentTerms = recentViewed
    .map((key) => meaningView.flatTerms.find((entry) => entry.key === key))
    .filter(Boolean);

  const relatedTerms = useMemo(() => {
    if (!activeTerm) return [];

    const byKey = new Map(meaningView.flatTerms.map((entry) => [entry.key, entry]));
    const manual = RELATED_TERM_MAP[activeTerm.key] || [];
    const result = [];
    const seen = new Set([activeTerm.key]);

    manual.forEach((key) => {
      const entry = byKey.get(key);
      if (entry && !seen.has(entry.key)) {
        seen.add(entry.key);
        result.push(entry);
      }
    });

    if (result.length >= 4) return result.slice(0, 4);

    meaningView.flatTerms.forEach((entry) => {
      if (seen.has(entry.key)) return;
      const sameCategory = entry.categoryId === activeTerm.categoryId;
      const tokenOverlap = activeTerm.term.split(/[^A-Za-z0-9]+/)
        .filter((token) => token.length > 3)
        .some((token) => entry.term.toLowerCase().includes(token.toLowerCase()) || entry.explain.toLowerCase().includes(token.toLowerCase()));

      if (sameCategory || tokenOverlap) {
        seen.add(entry.key);
        result.push(entry);
      }
    });

    return result.slice(0, 4);
  }, [activeTerm, meaningView.flatTerms]);

  const handleLoanInputChange = (field, value) => {
    setLoanInputs((prev) => ({ ...prev, [field]: value }));
  };

  const jumpToTool = (targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPulseTarget(targetId);
    window.setTimeout(() => {
      setPulseTarget((prev) => (prev === targetId ? '' : prev));
    }, 900);
  };

  const handleLoanTypeChange = (type) => {
    setLoanType(type);
    setShowFullSchedule(false);
    setLoanUploadFeedback(
      type === 'car'
        ? copy('Car loan mode active. You can paste values or upload your auto contract.', 'Modo Auto activo. Puede pegar datos o subir contrato de auto.', 'Car mode active.', 'Modo auto activo.')
        : copy('Mortgage mode active. Upload your document or enter values manually.', 'Modo Hipoteca activo. Cargue su documento o ingrese datos manualmente.', 'Mortgage mode active.', 'Modo hipoteca activo.')
    );
    setLoanInputs({
      principal: '',
      annualRate: '',
      termMonths: type === 'car' ? '60' : '360',
      startDate: new Date().toISOString().slice(0, 10)
    });
  };

  const clearLoanInputs = () => {
    setLoanInputs({
      principal: '',
      annualRate: '',
      termMonths: loanType === 'car' ? '60' : '360',
      startDate: new Date().toISOString().slice(0, 10)
    });
    setShowFullSchedule(false);
    setLoanUploadFeedback(copy('Inputs cleared. Enter new values.', 'Campos limpios. Ingrese nuevos datos.', 'Inputs cleared.', 'Campos limpios.'));
  };

  const downloadAmortizationCsv = () => {
    if (loanResults.rows.length === 0) return;
    const headers = isSpanish
      ? ['Mes', 'Fecha', 'Pago', 'Principal', 'Interes', 'Saldo']
      : ['Month', 'Date', 'Payment', 'Principal', 'Interest', 'Balance'];
    const csvRows = loanResults.rows.map((row) => [
      row.month,
      row.paymentDate,
      row.payment.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.balance.toFixed(2)
    ]);
    const csv = [headers, ...csvRows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = loanType === 'car' ? 'car-loan-amortization.csv' : 'mortgage-amortization.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleLoanFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rawText = await file.text();
      const extracted = parseLoanDocumentText(rawText);
      setLoanInputs((prev) => ({
        principal: extracted.principal || prev.principal,
        annualRate: extracted.annualRate || prev.annualRate,
        termMonths: extracted.termMonths || prev.termMonths,
        startDate: extracted.startDate || prev.startDate
      }));

      const extractedCount = Object.values(extracted).filter(Boolean).length;
      setLoanUploadFeedback(
        extractedCount > 0
          ? copy(`${extractedCount} fields detected. Review and confirm values.`, `Se detectaron ${extractedCount} campos. Revise y confirme.`, `${extractedCount} fields detected.`, `${extractedCount} campos detectados.`)
          : copy('No fields auto-detected. Enter values manually.', 'No se detectaron campos automaticos. Ingrese datos manualmente.', 'No fields auto-detected.', 'No se detectaron campos.')
      );
    } catch {
      setLoanUploadFeedback(copy('Could not read this file. Try a different format or enter values manually.', 'No pudimos leer el archivo. Intente otro formato o ingrese datos manualmente.', 'Could not read this file.', 'No pudimos leer el archivo.'));
    } finally {
      event.target.value = '';
    }
  };

  const visibleScheduleRows = showFullSchedule ? loanResults.rows : loanResults.rows.slice(0, 24);
  const familiaTools = [
    {
      id: 'decoder',
      title: isSpanish ? 'Decodificador Fiscal' : 'Tax Language Decoder',
      value: isSpanish
        ? 'Busque terminos, guarde favoritos y entienda lenguaje fiscal sin sentirse perdido.'
        : 'Search terms, save favorites, and understand tax language without feeling lost.'
    },
    {
      id: 'amortization',
      title: isSpanish ? 'Laboratorio de Amortización' : 'Amortization Lab',
      value: isSpanish
        ? 'Modele hipoteca o auto, vea interes vs principal y descargue el calendario completo.'
        : 'Model mortgage or auto financing, see interest vs principal, and download the full schedule.'
    },
    {
      id: 'reserve',
      title: isSpanish ? 'Reserva Fiscal Trimestral' : 'Quarterly Tax Reserve',
      value: isSpanish
        ? 'Aprenda cuanto apartar por semana, mes y trimestre sin adivinar.'
        : 'Learn how much to set aside weekly, monthly, and quarterly without guessing.'
    },
    {
      id: 'checklist',
      title: isSpanish ? 'Checklist de Documentos' : 'Document Readiness Checklist',
      value: isSpanish
        ? 'Marque lo que ya tiene y exporte una lista simple para reunir documentos mas rapido.'
        : 'Track what you already have and export a simple list to gather documents faster.'
    },
    {
      id: 'irs',
      title: isSpanish ? 'Captura IRS W-2/1099' : 'IRS W-2/1099 Capture',
      value: isSpanish
        ? 'Revise lo reportado a su nombre, capture pantallas limpias y subalas al portal correcto.'
        : 'Review what was filed under your name, capture clean screenshots, and upload them into the right portal lane.'
    }
  ];
  const moneyFinderChecklist = [
    isSpanish ? 'Su nombre actual y nombres anteriores o mal escritos comunes' : 'Your current name plus older names or common misspellings',
    isSpanish ? 'Direcciones actuales y anteriores' : 'Current and past addresses',
    isSpanish ? 'SSN o ITIN si va a revisar herramientas del IRS' : 'SSN or ITIN for IRS-related tools',
    isSpanish ? 'Estado civil fiscal y monto esperado si usara Where\'s My Refund?' : 'Filing status and expected refund amount for Where\'s My Refund?',
    isSpanish ? 'Lista de estados donde vivio o trabajo' : 'A list of states where you lived or worked',
  ];
  const moneyFinderSections = [
    {
      title: isSpanish ? '1. Reembolsos del IRS' : '1. IRS refunds',
      body: isSpanish
        ? 'Si ya presento y el dinero nunca llego, empiece con Where\'s My Refund?. Si un cheque se perdio, Form 3911 ayuda a iniciar el rastreo. Si nunca presento, recuerde la regla de tres anos para reclamar un reembolso.'
        : 'If you already filed and the money never arrived, start with Where\'s My Refund?. If a check was lost, Form 3911 helps start a refund trace. If you never filed, remember the three-year rule for claiming a refund.',
      gather: [
        isSpanish ? 'SSN o ITIN' : 'SSN or ITIN',
        isSpanish ? 'Estado civil fiscal' : 'Filing status',
        isSpanish ? 'Monto exacto del reembolso esperado' : 'Exact expected refund amount',
      ],
      needs: [
        isSpanish ? 'Use Where\'s My Refund? si ya presento' : 'Use Where\'s My Refund? if you already filed',
        isSpanish ? 'Use Form 3911 si el cheque se perdio o nunca llego' : 'Use Form 3911 if the check was lost or never arrived',
        isSpanish ? 'Si nunca presento, prepare la declaracion atrasada antes de intentar reclamar' : 'If you never filed, prepare the late return before trying to claim it',
      ],
      links: [
        { href: 'https://www.irs.gov/wheres-my-refund', label: isSpanish ? 'Where\'s My Refund?' : 'Where\'s My Refund?' },
        { href: 'https://www.irs.gov/forms-pubs/about-form-3911', label: isSpanish ? 'Formulario 3911' : 'Form 3911' },
        { href: 'https://www.irs.gov/filing/time-you-can-claim-a-credit-or-refund', label: isSpanish ? 'Regla de 3 anos' : '3-year refund rule' },
      ],
    },
    {
      title: isSpanish ? '2. Propiedad no reclamada del estado' : '2. State unclaimed property',
      body: isSpanish
        ? 'Aqui suele estar el mayor tesoro escondido: cuentas olvidadas, cheques sin cobrar, reembolsos de servicios y mas. Busque primero en MissingMoney y despues revise directamente cualquier estado donde vivio o trabajo.'
        : 'This is usually the biggest goldmine: forgotten accounts, uncashed checks, utility refunds, and more. Start with MissingMoney, then check directly with any state where you lived or worked.',
      gather: [
        isSpanish ? 'Nombre actual y nombres anteriores' : 'Current name and old names',
        isSpanish ? 'Direcciones viejas y actuales' : 'Current and past addresses',
        isSpanish ? 'Lista de estados donde vivio o trabajo' : 'A list of states where you lived or worked',
      ],
      needs: [
        isSpanish ? 'Busque primero en MissingMoney para una busqueda amplia' : 'Search MissingMoney first for a broad sweep',
        isSpanish ? 'Despues abra el directorio estatal o el portal de su estado' : 'Then open the state directory or your state portal directly',
        isSpanish ? 'Pruebe apellido de soltera, apodos y errores comunes de ortografia' : 'Try maiden names, nicknames, and common misspellings',
      ],
      links: [
        { href: 'https://www.missingmoney.com/', label: isSpanish ? 'MissingMoney' : 'MissingMoney' },
        { href: 'https://www.unclaimed.org/', label: isSpanish ? 'NAUPA / directorio estatal' : 'NAUPA / state directory' },
        { href: 'https://ucpi.sco.ca.gov/en/Property/SearchIndex', label: isSpanish ? 'California State Controller' : 'California State Controller' },
      ],
    },
    {
      title: isSpanish ? '3. Bases federales especiales' : '3. Specialized federal databases',
      body: isSpanish
        ? 'Algun dinero se queda atrapado fuera del IRS. Si tuvo bonos de ahorro, bancos cerrados, salarios no pagados o pensiones viejas, revise estas bases oficiales gratis.'
        : 'Some money gets trapped outside the IRS. If you had savings bonds, closed banks, unpaid wages, or old pensions, check these free official databases.',
      gather: [
        isSpanish ? 'Nombre legal completo' : 'Full legal name',
        isSpanish ? 'Nombre del empleador, banco o plan si lo recuerda' : 'Employer, bank, or plan name if you remember it',
        isSpanish ? 'Ciudades o estados donde trabajo o abrio cuentas' : 'Cities or states where you worked or held accounts',
      ],
      needs: [
        isSpanish ? 'TreasuryHunt para bonos de ahorro vencidos' : 'TreasuryHunt for matured savings bonds',
        isSpanish ? 'FDIC para bancos cerrados y depositos no reclamados' : 'FDIC for failed banks and unclaimed deposits',
        isSpanish ? 'DOL y PBGC para salarios no pagados y pensiones viejas' : 'DOL and PBGC for unpaid wages and old pensions',
      ],
      links: [
        { href: 'https://treasuryhunt.gov/', label: isSpanish ? 'TreasuryHunt.gov' : 'TreasuryHunt.gov' },
        { href: 'https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/unclaimed-funds', label: isSpanish ? 'FDIC fondos no reclamados' : 'FDIC unclaimed funds' },
        { href: 'https://www.dol.gov/agencies/whd/wow', label: isSpanish ? 'Department of Labor - WOW' : 'Department of Labor - WOW' },
        { href: 'https://www.pbgc.gov/search-unclaimed-pensions', label: isSpanish ? 'PBGC pensiones no reclamadas' : 'PBGC unclaimed pensions' },
      ],
    },
  ];

  return (
    <div className={`services-page fade-in${embedded ? ' services-page-embedded' : ''}`}>
      <section className="axion-items-hero glass-panel">
        <div className="axion-items-hero-copy">
          <span className="axion-items-kicker">
            {portalUnlocked
              ? (isSpanish ? 'Herramientas activas para clientes' : 'Active client workspace tools')
              : (isSpanish ? 'Beneficios incluidos para clientes' : 'Included client-only perks')}
          </span>
          <h2>AXION ITEMS</h2>
          <p className="axion-items-subtitle">
            {portalUnlocked
              ? copy(
                'These are the working tools inside your Axion client experience: practical, bilingual, and built to make your prep calmer before the meeting.',
                'Estas son las herramientas activas dentro de su experiencia Axion: practicas, bilingues y hechas para que su preparacion llegue mas tranquila a la reunion.',
                'These are your live client tools.',
                'Estas son sus herramientas activas.'
              )
              : copy(
                'Public visitors can preview the value here. The real tools unlock inside the Client Portal at no extra charge once you join the Axion Familia.',
                'Los visitantes pueden ver el valor aqui. Las herramientas reales se desbloquean dentro del Portal del Cliente sin costo extra una vez que entra a la Axion Familia.',
                'Preview the value here. Unlock the tools in the portal.',
                'Vea el valor aqui. Desbloquee las herramientas en el portal.'
              )}
          </p>
          <div className="axion-items-jump">
            {portalUnlocked ? (
              <>
                <button type="button" className="axion-jump-btn" onClick={() => jumpToTool('tax-language-decoder')}>
                  {isSpanish ? 'Decodificador Fiscal' : 'Tax Language Decoder'}
                </button>
                <button type="button" className="axion-jump-btn" onClick={() => jumpToTool('amortization-lab')}>
                  {isSpanish ? 'Laboratorio de Amortización' : 'Amortization Lab'}
                </button>
                <button type="button" className="axion-jump-btn" onClick={() => jumpToTool('smart-tools')}>
                  {isSpanish ? 'Preparación y Calendario' : 'Prep and Calendar'}
                </button>
                <button type="button" className="axion-jump-btn" onClick={() => jumpToTool('irs-w2-1099-capture')}>
                  {isSpanish ? 'Captura IRS (ID.me)' : 'IRS Capture (ID.me)'}
                </button>
              </>
            ) : (
              <>
                <a className="axion-jump-btn" href="#portal">
                  {isSpanish ? 'Entrar a Axion Familia' : 'Enter Axion Familia'}
                </a>
                <button type="button" className="axion-jump-btn" onClick={() => jumpToTool('familia-tools')}>
                  {isSpanish ? 'Ver funciones exclusivas' : 'See exclusive features'}
                </button>
                <button type="button" className="axion-jump-btn" onClick={() => jumpToTool('find-my-money')}>
                  {isSpanish ? 'Buscar dinero perdido' : 'Find lost money'}
                </button>
                <button type="button" className="axion-jump-btn" onClick={() => jumpToTool('tax-deadline-planner')}>
                  {isSpanish ? 'Abrir calendario publico' : 'Open public deadline calendar'}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="axion-items-hero-visual">
          <img
            src="/assets/axion-items-visual.png"
            alt={isSpanish ? 'Mapa visual de herramientas AXION' : 'AXION tools visual map'}
          />
          <div className="axion-items-hero-badge">
            {portalUnlocked
              ? copy(
                'Everything here exists to save meeting time and reduce missing-document chaos.',
                'Todo aqui existe para ahorrar tiempo de reunion y reducir el caos por documentos faltantes.',
                'Tools that save time.',
                'Herramientas que ahorran tiempo.'
              )
              : copy(
                'Preview the system here. Unlock the workflow when your client workspace opens.',
                'Vea el sistema aqui. Desbloquee el flujo cuando se abra su espacio de cliente.',
                'Preview here, unlock in portal.',
                'Vea aqui, desbloquee en portal.'
              )}
          </div>
        </div>
      </section>

      {!portalUnlocked && (
        <>
          <section className={`tool-section familia-preview-section glass-panel ${pulseTarget === 'familia-tools' ? 'section-pulse' : ''}`} id="familia-tools">
            <div className="tool-module-header">
              <div className="tool-module-eyebrow">AXION FAMILIA</div>
              <p className="tool-module-step">{isSpanish ? 'Vista previa exclusiva' : 'Exclusive preview'}</p>
              <h2>{isSpanish ? 'Herramientas desbloqueadas dentro del portal' : 'Tools unlocked inside the portal'}</h2>
              <p>
                {copy(
                  'These tools are included for clients because they save meeting time, reduce confusion, and create a cleaner prep packet before review starts.',
                  'Estas herramientas vienen incluidas para clientes porque ahorran tiempo de reunion, reducen confusion y dejan un paquete de preparacion mas limpio antes de la revision.',
                  'These tools unlock for clients inside the portal.',
                  'Estas herramientas se desbloquean para clientes dentro del portal.'
                )}
              </p>
            </div>

            <div className="familia-preview-showcase">
              <figure className="familia-preview-visual">
                <img
                  src="/assets/your-plan/portal-tools.png"
                  alt={isSpanish ? 'Vista previa de herramientas dentro del portal AXION' : 'Preview of AXION tools inside the portal'}
                />
              </figure>
              <div className="familia-preview-callout">
                <strong>{isSpanish ? 'Lo que se desbloquea' : 'What unlocks'}</strong>
                <p>
                  {copy(
                    'Clients do not just get calculators. They get a guided workflow where language help, reserve planning, document tracking, and IRS recovery all live in one place.',
                    'Los clientes no solo obtienen calculadoras. Obtienen un flujo guiado donde ayuda de lenguaje, plan de reservas, seguimiento de documentos y recuperacion del IRS viven en un solo lugar.',
                    'Clients unlock guided tools inside one workflow.',
                    'Los clientes desbloquean herramientas guiadas dentro de un solo flujo.'
                  )}
                </p>
              </div>
            </div>

            <div className="familia-preview-grid">
              {familiaTools.map((tool) => (
                <article key={tool.id} className="familia-preview-card">
                  <p className="familia-preview-kicker">{isSpanish ? 'Solo clientes' : 'Clients only'}</p>
                  <h3>{tool.title}</h3>
                  <p>{tool.value}</p>
                </article>
              ))}
            </div>

            <div className="familia-preview-footer">
              <p>
                {copy(
                  'Join the Axion Familia to open the full bilingual workflow: understand the language, gather the right files, estimate reserves, and recover missing IRS income forms without guessing.',
                  'Entre a la Axion Familia para abrir el flujo bilingue completo: entender el lenguaje, reunir archivos correctos, estimar reservas y recuperar formularios del IRS sin adivinar.',
                  'Join to unlock the full workflow.',
                  'Entre para desbloquear el flujo completo.'
                )}
              </p>
              <a href="#portal" className="btn-primary">
                {isSpanish ? 'Abrir Portal del Cliente' : 'Open Client Portal'}
              </a>
            </div>
          </section>

          <section className="tool-section money-finder-section glass-panel" id="find-my-money">
            <div className="tool-module-header">
              <div className="tool-module-eyebrow">AXION ITEMS</div>
              <p className="tool-module-step">{isSpanish ? 'Publico y gratis' : 'Public and free'}</p>
              <h2>{isSpanish ? 'Find My Money' : 'Find My Money'}</h2>
              <p>
                {copy(
                  'A plain-English playbook to check for missing refunds, unclaimed state property, and money trapped in specialty federal databases. Every link below is official or free.',
                  'Una guia clara para revisar reembolsos faltantes, propiedad estatal no reclamada y dinero atrapado en bases federales especiales. Cada enlace aqui es oficial o gratis.',
                  'Check missing refunds and unclaimed money with official links.',
                  'Revise reembolsos faltantes y dinero no reclamado con enlaces oficiales.'
                )}
              </p>
            </div>

            <div className="money-finder-warning">
              <strong>{isSpanish ? 'Atajo AXION:' : 'AXION shortcut:'}</strong>
              <span>
                {copy(
                  'Do not pay a locator service just to search. These official tools are free.',
                  'No pague a un localizador solo por buscar. Estas herramientas oficiales son gratis.',
                  'Do not pay a locator service. These searches are free.',
                  'No pague a un localizador. Estas busquedas son gratis.'
                )}
              </span>
            </div>

            <div className="money-finder-grid">
              {moneyFinderSections.map((section) => (
                <article key={section.title} className="money-finder-card">
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                  <div className="money-finder-meta">
                    <div>
                      <strong>{isSpanish ? 'Reuna primero' : 'Gather first'}</strong>
                      <ul>
                        {section.gather.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>{isSpanish ? 'Informacion clave' : 'Key info needed'}</strong>
                      <ul>
                        {section.needs.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="money-finder-links">
                    {section.links.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="table-toggle-btn">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="money-finder-checklist">
              <h3>{isSpanish ? 'Antes de buscar, tenga esto listo' : 'Have this ready before you search'}</h3>
              <ul>
                {moneyFinderChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                {copy(
                  'Search with your current name, old addresses, maiden names, and common misspellings. That one detail alone is often the difference between “nothing found” and a match.',
                  'Busque con su nombre actual, direcciones viejas, apellido de soltera y errores comunes de ortografia. Ese detalle solo muchas veces cambia un “no encontramos nada” por una coincidencia real.',
                  'Try old names, addresses, and misspellings too.',
                  'Pruebe tambien nombres viejos, direcciones y errores comunes.'
                )}
              </p>
            </div>
          </section>

          <section className="tool-section smart-tools-section glass-panel" id="tax-deadline-planner">
            <div className="tool-module-header">
              <div className="tool-module-eyebrow">AXION ITEMS</div>
              <p className="tool-module-step">{isSpanish ? 'Publico y util para todos' : 'Public and useful for everyone'}</p>
              <h2>{isSpanish ? 'Calendario de fechas clave' : 'Deadline Calendar'}</h2>
              <p>
                {copy(
                  'This one stays public because it helps visitors see the season ahead. The deeper prep tools unlock once your workspace opens.',
                  'Este se mantiene publico porque ayuda a ver la temporada por delante. Las herramientas de preparacion mas profundas se desbloquean cuando abre su espacio.',
                  'Public calendar here. Client tools unlock in the portal.',
                  'Calendario publico aqui. Herramientas del cliente en el portal.'
                )}
              </p>
            </div>
            <ClientToolsSection embedded showHeader={false} standalone pulseTarget={pulseTarget} visibleTools={['deadline']} />
          </section>
        </>
      )}

      {portalUnlocked && (
        <>
      <PortalToolSection
        id="tax-language-decoder"
        pulseTarget={pulseTarget}
        isOpen={openPortalTool === 'tax-language-decoder'}
        onToggle={togglePortalTool}
        step={isSpanish ? 'Herramienta de claridad' : 'Clarity tool'}
        title={language === 'en' ? 'Tax Language Decoder' : 'Decodificador de Lenguaje Fiscal'}
        audience={copy(
          'Best for anyone who keeps seeing tax words they kind of recognize but still do not actually understand.',
          'Ideal para quien sigue viendo palabras fiscales que mas o menos reconoce, pero todavia no entiende de verdad.',
          'For clients who want tax language explained simply.',
          'Para clientes que quieren lenguaje fiscal explicado simple.'
        )}
      >
      <div className="decoder-section meaning-directory">
          <div className="meaning-header">
            <div className="meaning-badge">
              <BookOpenText size={16} />
              <span>{language === 'en' ? 'Tax Language Decoder' : 'Decodificador de Lenguaje Fiscal'}</span>
            </div>
            <p className="tool-module-step">{isSpanish ? 'Paso 1 de 9' : 'Step 1 of 9'}</p>
            <h2>{language === 'en' ? 'Tax Language Decoder' : 'Decodificador de Lenguaje Fiscal'}</h2>
            <p className="meaning-subtitle">{language === 'en' ? 'What Does That Mean?' : '¿Qué Significa Eso?'}</p>
            <p>
              {copy(
                'A large directory of high-impact tax terms, misunderstood concepts, and strategy language. Select any term to view a plain-English explanation and a useful tax reference in the side panel.',
                'Un directorio grande de terminos fiscales clave, conceptos confundidos y lenguaje de estrategia. Seleccione un termino para ver una explicacion clara y una referencia fiscal util en el panel lateral.',
                'Click a term for a plain explanation and tax reference.',
                'Haga clic en un termino para ver explicacion y referencia fiscal.'
              )}
            </p>
            <p className="meaning-counts">
              {isSpanish
                ? `${visibleTermCount} de ${totalTermCount} términos visibles`
                : `${visibleTermCount} of ${totalTermCount} terms visible`}
            </p>
            <p className="meaning-note">
              {copy(
                'Use this as an educational starting point. Real treatment still depends on your documents, facts, and professional review.',
                'Use esto como punto de partida educativo. La aplicacion real depende de sus documentos, hechos y revision profesional.',
                'Educational use only.',
                'Uso educativo.'
              )}
            </p>
          </div>

          <div className="meaning-controls">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={isSpanish ? 'Buscar términos, estrategias o reglas...' : 'Search terms, strategies, or rules...'}
              className="meaning-search"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="meaning-filter"
            >
              <option value="all">{isSpanish ? 'Todas las categorías' : 'All categories'}</option>
              {meaningCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {isSpanish ? CATEGORY_TITLE_ES[category.id] || category.title : category.title}
                </option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value)}
              className="meaning-filter"
            >
              <option value="all">{isSpanish ? 'Todos los niveles' : 'All levels'}</option>
              <option value="beginner">{isSpanish ? 'Principiante' : 'Beginner'}</option>
              <option value="intermediate">{isSpanish ? 'Intermedio' : 'Intermediate'}</option>
              <option value="advanced">{isSpanish ? 'Avanzado' : 'Advanced'}</option>
            </select>
            <button type="button" className={`favorites-toggle ${favoritesOnly ? 'active' : ''}`} onClick={() => setFavoritesOnly((prev) => !prev)}>
              {favoritesOnly
                ? (isSpanish ? 'Viendo solo favoritos' : 'Showing favorites only')
                : (isSpanish ? 'Mostrar favoritos' : 'Show favorites')}
            </button>
          </div>

          {recentTerms.length > 0 && (
            <div className="recent-row">
              <span>{isSpanish ? 'Vistos recientemente:' : 'Recently viewed:'}</span>
              <div className="recent-list">
                {recentTerms.map((entry) => (
                  <button type="button" className="recent-pill" key={entry.key} onClick={() => openTerm(entry.key)}>
                    {entry.term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="az-jump">
            {[...alphabet, '#'].map((letter) => (
              <button
                type="button"
                key={letter}
                disabled={!availableLetters.has(letter)}
                onClick={() => jumpToLetter(letter)}
                className="az-letter"
              >
                {letter}
              </button>
            ))}
          </div>

          {meaningView.flatTerms.length === 0 ? (
            <div className="meaning-empty">
              {isSpanish ? 'No encontramos términos con ese filtro. Intente otra palabra.' : 'No terms found with that filter. Try another keyword.'}
            </div>
          ) : (
            <div className="meaning-layout">
              <div className="meaning-categories">
                {meaningView.filteredCategories.map((category) => (
                  <div className="meaning-category" key={category.id}>
                    <h3>{category.displayTitle}</h3>
                    <div className="term-cloud">
                      {category.terms.map((entry) => {
                        const termKey = `${category.id}-${entry.originalTerm || entry.term}`;
                        const isActive = termKey === activeTerm?.key;
                        return (
                          <button
                            type="button"
                            className={`term-pill ${isActive ? 'active' : ''}`}
                            key={termKey}
                            id={`term-anchor-${termKey}`}
                            onClick={() => openTerm(termKey)}
                          >
                            <span className="term-label">{entry.term}</span>
                            <span className="term-fav" aria-hidden="true">{favoriteSet.has(termKey) ? '★' : '☆'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <aside className="meaning-detail">
                <span className="detail-kicker">{activeTerm?.categoryTitle}</span>
                <h3>{activeTerm?.term}</h3>
                <span className="detail-level">
                  {isSpanish ? 'Nivel' : 'Level'}: {activeTerm?.difficulty === 'beginner'
                    ? (isSpanish ? 'Principiante' : 'Beginner')
                    : activeTerm?.difficulty === 'intermediate'
                      ? (isSpanish ? 'Intermedio' : 'Intermediate')
                      : (isSpanish ? 'Avanzado' : 'Advanced')}
                </span>
                <p>{copyMode === 'basic' ? briefText(activeTerm?.explain) : activeTerm?.explain}</p>
                <p className="detail-legal">
                  <strong>{isSpanish ? 'Referencia fiscal' : 'Tax reference'}:</strong> {activeTerm?.legal}
                </p>
                {relatedTerms.length > 0 && (
                  <div className="related-block">
                    <span className="related-title">{isSpanish ? 'Términos relacionados' : 'Related terms'}</span>
                    <div className="related-list">
                      {relatedTerms.map((entry) => (
                        <button key={entry.key} type="button" className="related-chip" onClick={() => openTerm(entry.key)}>
                          {entry.term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="detail-actions">
                  <button type="button" className="detail-btn" onClick={() => activeTerm && toggleFavorite(activeTerm.key)}>
                    {activeTerm && favoriteSet.has(activeTerm.key)
                      ? (isSpanish ? 'Quitar de favoritos' : 'Remove favorite')
                      : (isSpanish ? 'Guardar favorito' : 'Save favorite')}
                  </button>
                  <button type="button" className="detail-btn" onClick={copyActiveTerm}>
                    {isSpanish ? 'Copiar' : 'Copy'}
                  </button>
                  <button type="button" className="detail-btn" onClick={shareActiveTerm}>
                    {isSpanish ? 'Compartir' : 'Share'}
                  </button>
                  <button type="button" className="detail-btn" onClick={exportFavoritesCsv} disabled={favorites.length === 0}>
                    {isSpanish ? 'Exportar favoritos CSV' : 'Export favorites CSV'}
                  </button>
                </div>
                <p className="detail-disclaimer">
                  {copy(
                    'Useful for understanding the concept. It does not replace a final tax position or personalized advice.',
                    'Util para entender mejor una idea. No sustituye una posicion fiscal final ni una recomendacion personalizada.',
                    'Helpful for learning. Not final advice.',
                    'Util para aprender. No es consejo final.'
                  )}
                </p>
              </aside>
            </div>
          )}
        </div>
        </PortalToolSection>

        <PortalToolSection
          id="amortization-lab"
          pulseTarget={pulseTarget}
          isOpen={openPortalTool === 'amortization-lab'}
          onToggle={togglePortalTool}
          step={isSpanish ? 'Herramienta de préstamo' : 'Loan tool'}
          title={isSpanish ? 'Laboratorio de Amortización' : 'Amortization Lab'}
          audience={copy(
            'Best for homeowners, car-loan holders, or anyone trying to understand how much interest is really eating the payment.',
            'Ideal para propietarios de vivienda, personas con prestamo de auto o quien quiere entender cuanto interes realmente se esta comiendo el pago.',
            'For mortgages, car loans, and interest clarity.',
            'Para hipotecas, autos y claridad sobre interes.'
          )}
        >
          <div className="amortization-section">

          <article className="edu-tool-card">
            <p className="tool-intro">
              {copy(
                'See each payment split between principal and interest, what financing really costs, and how your balance drops month by month.',
                'Vea cada pago separado entre principal e interes, cuanto cuesta financiar y como baja su saldo mes a mes.',
                'See the full loan picture fast.',
                'Vea rapido el panorama del prestamo.'
              )}
            </p>

            <div className="loan-type-toggle">
              <button type="button" className={loanType === 'mortgage' ? 'active' : ''} onClick={() => handleLoanTypeChange('mortgage')}>
                {isSpanish ? 'Hipoteca' : 'Mortgage'}
              </button>
              <button type="button" className={loanType === 'car' ? 'active' : ''} onClick={() => handleLoanTypeChange('car')}>
                {isSpanish ? 'Auto' : 'Car Loan'}
              </button>
            </div>

            <div className="loan-upload-row">
              <label className="upload-label">
                {isSpanish ? 'Subir documento para extraer datos' : 'Upload document to extract values'}
                <input type="file" accept=".txt,.csv,.json,.pdf" onChange={handleLoanFileUpload} />
              </label>
              <span className="upload-help">
                {copy(
                  'Tip: TXT, CSV, and JSON usually parse best. PDF works when it contains selectable text.',
                  'Tip: TXT, CSV y JSON suelen leerse mejor. PDF funciona si trae texto seleccionable.',
                  'TXT, CSV, and text PDFs work best.',
                  'TXT, CSV y PDF con texto funcionan mejor.'
                )}
              </span>
              {loanUploadFeedback && <span className="upload-status">{loanUploadFeedback}</span>}
            </div>

            <div className="loan-input-grid">
              <label>
                {isSpanish ? 'Monto del préstamo' : 'Loan amount'}
                <input type="number" step="0.01" value={loanInputs.principal} onChange={(event) => handleLoanInputChange('principal', event.target.value)} />
              </label>
              <label>
                {isSpanish ? 'Tasa anual (%)' : 'Annual rate (%)'}
                <input type="number" step="0.01" value={loanInputs.annualRate} onChange={(event) => handleLoanInputChange('annualRate', event.target.value)} />
              </label>
              <label>
                {isSpanish ? 'Plazo (meses)' : 'Term (months)'}
                <input type="number" step="1" value={loanInputs.termMonths} onChange={(event) => handleLoanInputChange('termMonths', event.target.value)} />
              </label>
              <label>
                {isSpanish ? 'Fecha de inicio' : 'Start date'}
                <input type="date" value={loanInputs.startDate} onChange={(event) => handleLoanInputChange('startDate', event.target.value)} />
              </label>
            </div>

            <div className="loan-summary-grid">
              <div>
                <span>{isSpanish ? 'Pago mensual' : 'Monthly payment'}</span>
                <strong>{formatCurrency(loanResults.monthlyPayment, locale)}</strong>
              </div>
              <div>
                <span>{isSpanish ? 'Total interés' : 'Total interest'}</span>
                <strong>{formatCurrency(loanResults.totalInterest, locale)}</strong>
              </div>
              <div>
                <span>{isSpanish ? 'Total pagado' : 'Total paid'}</span>
                <strong>{formatCurrency(loanResults.totalPaid, locale)}</strong>
              </div>
            </div>

            <div className="loan-action-row">
              <button type="button" className="table-toggle-btn" onClick={clearLoanInputs}>
                {isSpanish ? 'Limpiar' : 'Clear'}
              </button>
              <button type="button" className="table-toggle-btn" onClick={downloadAmortizationCsv} disabled={loanResults.rows.length === 0}>
                {isSpanish ? 'Descargar CSV completo' : 'Download Full CSV'}
              </button>
            </div>

            <div className="amortization-table-wrap">
              <table className="amortization-table">
                <thead>
                  <tr>
                    <th>{isSpanish ? 'Mes' : 'Month'}</th>
                    <th>{isSpanish ? 'Fecha' : 'Date'}</th>
                    <th>{isSpanish ? 'Pago' : 'Payment'}</th>
                    <th className="principal-col">{isSpanish ? 'Principal' : 'Principal'}</th>
                    <th className="interest-col">{isSpanish ? 'Interés' : 'Interest'}</th>
                    <th>{isSpanish ? 'Saldo' : 'Balance'}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleScheduleRows.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{row.paymentDate}</td>
                      <td>{formatCurrency(row.payment, locale)}</td>
                      <td className="principal-col">{formatCurrency(row.principal, locale)}</td>
                      <td className="interest-col">{formatCurrency(row.interest, locale)}</td>
                      <td>{formatCurrency(row.balance, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loanResults.rows.length > 24 && (
              <button type="button" className="table-toggle-btn" onClick={() => setShowFullSchedule((prev) => !prev)}>
                {showFullSchedule
                  ? (isSpanish ? 'Ver menos filas' : 'Show fewer rows')
                  : (isSpanish ? 'Ver tabla completa' : 'Show full table')}
              </button>
            )}
          </article>
        </div>
        </PortalToolSection>

        <PortalToolSection
          id="smart-tools"
          pulseTarget={pulseTarget}
          isOpen={openPortalTool === 'smart-tools'}
          onToggle={togglePortalTool}
          step={isSpanish ? 'Herramientas de preparación' : 'Prep tools'}
          title={isSpanish ? 'Flujo de preparación del cliente' : 'Client prep workflow'}
          audience={copy(
            'Best for clients who want to know what to gather, how much to reserve, and what deadline is coming next without getting overwhelmed.',
            'Ideal para clientes que quieren saber que reunir, cuanto apartar y que fecha viene despues sin sentirse abrumados.',
            'For clients who want a cleaner prep checklist and reserve plan.',
            'Para clientes que quieren un checklist y reserva mas claros.'
          )}
        >
          <div className="smart-tools-section">
          <ClientToolsSection embedded showHeader={false} standalone pulseTarget={pulseTarget} visibleTools={['checklist', 'reserve', 'deadline']} />
        </div>
        </PortalToolSection>

        <PortalToolSection
          id="irs-w2-1099-capture"
          pulseTarget={pulseTarget}
          isOpen={openPortalTool === 'irs-w2-1099-capture'}
          onToggle={togglePortalTool}
          step={isSpanish ? 'Recuperación de formularios' : 'Form recovery'}
          title={isSpanish ? 'Captura IRS W-2/1099' : 'IRS W-2/1099 Capture'}
          audience={copy(
            'Best for clients who are missing a W-2 or 1099, misplaced one, or are not sure what was reported under their name.',
            'Ideal para clientes a quienes les falta un W-2 o 1099, lo perdieron o no estan seguros de que se reporto bajo su nombre.',
            'For clients missing income forms or unsure what was filed.',
            'Para clientes con formularios faltantes o dudas sobre lo reportado.'
          )}
        >
          <div className="irs-capture-section">

          <article className="irs-capture-card">
            <h3>{isSpanish ? 'Captura IRS de W-2/1099 (ID.me)' : 'IRS W-2/1099 Capture Tool (ID.me)'}</h3>
            <p>
              {copy(
                'Use your IRS Online Account to view information return documents (W-2 and certain 1099 forms), capture screenshots, and upload them to the portal.',
                'Use su cuenta del IRS para ver documentos de informacion tributaria (W-2 y ciertos 1099), tomar capturas y subirlas al portal.',
                'Open IRS records, capture forms, upload them.',
                'Abra registros IRS, capture formularios y subalos.'
              )}
            </p>
            <div className="irs-use-case">
              <h4>{isSpanish ? 'Cuándo usarlo' : 'Use Case Scenarios'}</h4>
              <ul>
                <li>{copy('Use this if you did not receive a W-2/1099 in the mail or misplaced it.', 'Si no recibió un W-2/1099 por correo o lo perdió.', 'Missing or lost form.', 'Formulario perdido o faltante.')}</li>
                <li>{copy('Use this if you are unsure whether a job or payer submitted a form to the IRS under your SSN.', 'Si no esta seguro de que un empleador o pagador reporto informacion al IRS a su nombre.', 'Not sure what was reported.', 'No esta seguro de lo reportado.')}</li>
                <li>{copy('Use this to make your tax session faster by ensuring all income forms are accounted for.', 'Si quiere llegar a su cita con todo completo y evitar retrasos.', 'Use it to arrive fully prepared.', 'Use esto para llegar preparado.')}</li>
              </ul>
            </div>
            <div className="irs-capture-actions">
              <a href="https://www.irs.gov/payments/online-account-for-individuals" target="_blank" rel="noopener noreferrer" className="table-toggle-btn">
                {isSpanish ? 'Abrir IRS Online Account' : 'Open IRS Online Account'}
              </a>
              <a href="https://www.irs.gov/individuals/get-transcript" target="_blank" rel="noopener noreferrer" className="table-toggle-btn">
                {isSpanish ? 'Abrir Get Transcript' : 'Open Get Transcript'}
              </a>
            </div>
            <h4>{isSpanish ? 'Pasos exactos (dónde hacer clic)' : 'Exact Walkthrough (Where To Click)'}</h4>
            <ol className="irs-capture-steps">
              <li>{copy('Sign in or create your IRS account (this typically uses ID.me verification; have your government photo ID ready).', 'Inicie sesión o cree su cuenta IRS (normalmente usa verificación con ID.me; tenga identificación oficial lista).', 'Sign in with IRS / ID.me.', 'Entre con IRS / ID.me.')}</li>
              <li>{copy('After login, open Tax Records (or Records and Status) and find Information Returns / Wage and Income.', 'Después de entrar, abra Tax Records (o Records and Status) y busque Information Returns / Wage and Income.', 'Open Tax Records and Wage & Income.', 'Abra Tax Records y Wage & Income.')}</li>
              <li>{copy('Choose the correct tax year and take one screenshot of the full forms list.', 'Seleccione el año fiscal correcto y tome una captura de la lista completa de formularios mostrados.', 'Select year and capture the full list.', 'Seleccione el año y capture la lista.')}</li>
              <li>{copy('Open each visible form (W-2, 1099-NEC, 1099-MISC, 1099-K, 1099-INT, 1099-DIV, and others) and take one screenshot per form.', 'Abra cada formulario visible (W-2, 1099-NEC, 1099-MISC, 1099-K, 1099-INT, 1099-DIV, etc.) y tome una captura por formulario.', 'Open each form and capture it.', 'Abra cada formulario y capturelo.')}</li>
              <li>{copy('Upload to the Client Portal using these exact lanes: Jobs (W-2) = W-2 forms, Business (1099 & Expenses) = all 1099 forms, Personal Information = the full-list screenshot and any note about missing forms.', 'Suba al Portal de Clientes usando estos carriles exactos: Trabajos (W-2) = formularios W-2, Negocio (1099 y Gastos) = todos los 1099, Información Personal = la captura de la lista completa y cualquier nota sobre formularios faltantes.', 'Upload screenshots into the matching lanes.', 'Suba capturas en los carriles correctos.')}</li>
            </ol>
            <div className="irs-video-wrap">
              <video controls preload="metadata" className="irs-demo-video">
                <source src="/assets/irs-capture-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </article>
        </div>
        </PortalToolSection>
        </>
      )}
    </div>
  );
};

export default ServicesPage;
