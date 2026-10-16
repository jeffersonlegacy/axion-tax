import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, FileText, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import './ScheduleCWizard.css';

const IRS_SCHEDULE_C_FORM_URL = 'https://www.irs.gov/pub/irs-pdf/f1040sc.pdf';
const IRS_SCHEDULE_C_INSTRUCTIONS_URL = 'https://www.irs.gov/pub/irs-pdf/i1040sc.pdf';
const IRS_SCHEDULE_C_VERSION = '2025';
const IRS_STANDARD_MILEAGE_RATE_2025 = 0.7;

const parseMoney = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatMoney = (value, locale = 'en-US') => {
  return value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatCurrency = (value, locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const briefText = (value = '') => {
  const normalized = String(value).trim();
  if (!normalized) return normalized;
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return (match ? match[0] : normalized).trim();
};

const expenseInputRows = [
  { line: '8', key: 'advertising', helpKey: 'line8', label: { en: 'Advertising', es: 'Publicidad' } },
  { line: '10', key: 'commissionsFees', helpKey: 'line10', label: { en: 'Commissions and fees', es: 'Comisiones y honorarios' } },
  { line: '11', key: 'contractLabor', helpKey: 'line11', label: { en: 'Contract labor (see line 11 instructions)', es: 'Trabajo por contrato (ver instrucciones línea 11)' } },
  { line: '12', key: 'depletion', helpKey: 'line12', label: { en: 'Depletion', es: 'Agotamiento' } },
  { line: '13', key: 'depreciation179', helpKey: 'line13', label: { en: 'Depreciation and section 179 expense deduction', es: 'Depreciación y deducción de gastos sección 179' } },
  { line: '14', key: 'employeeBenefits', helpKey: 'line14', label: { en: 'Employee benefit programs (other than line 19)', es: 'Programas de beneficios para empleados (excepto línea 19)' } },
  { line: '15', key: 'insurance', helpKey: 'line15', label: { en: 'Insurance (other than health)', es: 'Seguro (excepto salud)' } },
  { line: '16a', key: 'interestMortgage', helpKey: 'line16a', label: { en: 'Interest: mortgage (paid to banks, etc.)', es: 'Intereses: hipoteca (pagado a bancos, etc.)' } },
  { line: '16b', key: 'interestOther', helpKey: 'line16b', label: { en: 'Interest: other', es: 'Intereses: otros' } },
  { line: '17', key: 'legalProfessional', helpKey: 'line17', label: { en: 'Legal and professional services', es: 'Servicios legales y profesionales' } },
  { line: '18', key: 'officeExpense', helpKey: 'line18', label: { en: 'Office expense', es: 'Gastos de oficina' } },
  { line: '19', key: 'pensionProfitSharing', helpKey: 'line19', label: { en: 'Pension and profit-sharing plans', es: 'Planes de pensión y reparto de utilidades' } },
  { line: '20a', key: 'rentLeaseVehicles', helpKey: 'line20a', label: { en: 'Rent or lease: vehicles, machinery, and equipment', es: 'Renta o arrendamiento: vehículos, maquinaria y equipo' } },
  { line: '20b', key: 'rentLeaseOther', helpKey: 'line20b', label: { en: 'Rent or lease: other business property', es: 'Renta o arrendamiento: otra propiedad del negocio' } },
  { line: '21', key: 'repairsMaintenance', helpKey: 'line21', label: { en: 'Repairs and maintenance', es: 'Reparaciones y mantenimiento' } },
  { line: '22', key: 'supplies', helpKey: 'line22', label: { en: 'Supplies (not included in Part III)', es: 'Suministros (no incluidos en Parte III)' } },
  { line: '23', key: 'taxesLicenses', helpKey: 'line23', label: { en: 'Taxes and licenses', es: 'Impuestos y licencias' } },
  { line: '24a', key: 'travel', helpKey: 'line24a', label: { en: 'Travel and lodging', es: 'Viaje y hospedaje' } },
  { line: '25', key: 'utilities', helpKey: 'line25', label: { en: 'Utilities', es: 'Servicios públicos' } },
  { line: '26', key: 'wages', helpKey: 'line26', label: { en: 'Wages (less employment credits)', es: 'Salarios (menos créditos laborales)' } },
  { line: '27a', key: 'energyEfficientBldgDeduction', helpKey: 'line27a', label: { en: 'Energy efficient commercial bldgs deduction (Form 7205)', es: 'Deducción por edificios comerciales energéticamente eficientes (Formulario 7205)' } }
];

const scheduleCHelpContent = {
  businessA: { title: 'Top Line A - Principal Business', explanation: 'Say what you actually do to make money. Keep it plain and specific.', examples: ['Rideshare driver', 'Mobile barber', 'Freelance graphic designer'] },
  businessB: { title: 'Top Line B - Business Code', explanation: 'This is your NAICS activity code. It tells the IRS your industry.', examples: ['Rideshare: 485300', 'Independent artist/writer: 711510', 'Check IRS instructions NAICS table'] },
  businessC: { title: 'Top Line C - Business Name', explanation: 'Use your business name if you have one. If not, your legal name is fine.', examples: ['Jefferson Legacy LLC', 'J. Legacy Consulting', 'Leave blank only if truly none'] },
  businessD: { title: 'Top Line D - EIN', explanation: 'Put your EIN if you have one. If you do not, leave it blank and file with SSN as allowed.', examples: ['12-3456789', 'Single-member LLC with EIN', 'Sole prop with no EIN: blank'] },
  businessF: { title: 'Top Line F - Accounting Method', explanation: 'Cash means money when received/paid. Accrual means when earned/incurred.', examples: ['Cash: most solo businesses', 'Accrual: inventory-heavy operations', 'Stay consistent year to year'] },
  businessG: { title: 'Top Line G - Material Participation', explanation: 'This asks if you actively ran the business. Most owner-operators answer yes.', examples: ['You did client work yourself: Yes', 'Passive investor only: No', 'Day-to-day manager: Yes'] },
  line1: { title: 'Line 1 - Gross Receipts', explanation: 'Total money your business brought in before expenses.', examples: ['Stripe sales + cash sales', '1099-NEC income', 'Do not subtract fees here'] },
  line2: { title: 'Line 2 - Returns/Allowances', explanation: 'Refunds or discounts you gave customers back.', examples: ['Refunded canceled service', 'Product return reimbursements', 'No refunds: enter 0'] },
  line3: { title: 'Line 3 - Net Sales', explanation: 'This is line 1 minus line 2. The tool calculates it for you.', examples: ['$100,000 - $2,000 = $98,000', 'Higher refunds lower this line', 'Check refund records'] },
  line4: { title: 'Line 4 - Cost of Goods Sold', explanation: 'Pulled from Part III line 42. Only for inventory-based businesses.', examples: ['Retail inventory costs', 'Manufacturing material costs', 'Service business often 0'] },
  line5: { title: 'Line 5 - Gross Profit', explanation: 'Your sales profit after COGS, before other income/expenses.', examples: ['Line 3 minus line 4', 'Key profitability checkpoint', 'Low margin? review pricing'] },
  line6: { title: 'Line 6 - Other Income', explanation: 'Business-related income not in line 1.', examples: ['Fuel tax credits/refunds', 'Prizes tied to business activity', 'Reimbursements not in sales'] },
  line7: { title: 'Line 7 - Gross Income', explanation: 'Main top-line income number for Schedule C.', examples: ['Line 5 + line 6', 'Used later in profit/loss', 'Must match your records'] },
  line35: { title: 'Line 35 - Beginning Inventory', explanation: 'Inventory value at start of tax year.', examples: ['Ending inventory from prior year', 'Cost basis, not retail value', 'Service businesses usually 0'] },
  line36: { title: 'Line 36 - Purchases', explanation: 'What you paid for inventory items for resale, minus personal withdrawals.', examples: ['Wholesale stock purchases', 'Bulk product buys', 'Exclude personal use items'] },
  line37: { title: 'Line 37 - Cost of Labor', explanation: 'Direct labor costs tied to producing goods (not your own pay).', examples: ['Assembly contractor labor', 'Production worker costs', 'Owner draw is not included'] },
  line38: { title: 'Line 38 - Materials/Supplies', explanation: 'Items consumed in making/selling products.', examples: ['Packaging supplies', 'Raw materials', 'Small parts used in products'] },
  line39: { title: 'Line 39 - Other Costs', explanation: 'Other production/inventory costs that do not fit above.', examples: ['Inbound freight on inventory', 'Storage linked to inventory', 'Keep detail backup'] },
  line40: { title: 'Line 40 - Total Available Inventory', explanation: 'Sum of lines 35 to 39. Auto-calculated.', examples: ['Beginning inventory + purchases + labor + materials + other', 'Pre-end-of-year total', 'Math is automatic'] },
  line41: { title: 'Line 41 - Ending Inventory', explanation: 'Inventory value left at year end.', examples: ['Physical count at Dec 31', 'Use cost method consistently', 'Lower ending inventory raises COGS'] },
  line42: { title: 'Line 42 - Cost of Goods Sold', explanation: 'Line 40 minus line 41, auto-calculated.', examples: ['What inventory cost was actually sold', 'Flows to line 4', 'Cannot be negative'] },
  line8: { title: 'Line 8 - Advertising', explanation: 'Money spent to get customers.', examples: ['Facebook/Google ads', 'Flyers and promo printing', 'Sponsored posts'] },
  line9: { title: 'Line 9 - Car/Truck Expense', explanation: 'Calculated from your business miles using the standard rate.', examples: ['Business miles x 70 cents (2025)', 'Commuting miles are not deductible', 'Keep a mileage log'] },
  line10: { title: 'Line 10 - Commissions/Fees', explanation: 'Amounts paid to others for sales/referrals.', examples: ['Affiliate payouts', 'Referral commissions', 'Marketplace selling fees'] },
  line11: { title: 'Line 11 - Contract Labor', explanation: 'Payments to independent contractors helping your business.', examples: ['Freelance editor', 'Subcontractor installer', 'Issue 1099-NEC when required'] },
  line12: { title: 'Line 12 - Depletion', explanation: 'Special deduction for natural resource extraction businesses.', examples: ['Oil/gas/mineral operations', 'Most businesses: 0', 'Use instructions if applicable'] },
  line13: { title: 'Line 13 - Depreciation/179', explanation: 'Deduction for business assets over time or accelerated under Section 179.', examples: ['Laptop used for business', 'Equipment purchases', 'Often linked to Form 4562'] },
  line14: { title: 'Line 14 - Employee Benefits', explanation: 'Benefit program costs for employees, not owner personal benefits.', examples: ['Group life insurance', 'Dependent care assistance', 'Exclude owner-only health insurance here'] },
  line15: { title: 'Line 15 - Insurance (Other Than Health)', explanation: 'Business insurance premiums not elsewhere deducted.', examples: ['General liability', 'Professional liability', 'Commercial property coverage'] },
  line16a: { title: 'Line 16a - Mortgage Interest', explanation: 'Interest on business mortgage to banks/financial institutions.', examples: ['Office mortgage interest', 'Warehouse mortgage interest', 'Interest only, not principal'] },
  line16b: { title: 'Line 16b - Other Interest', explanation: 'Other business loan/credit interest.', examples: ['Business line of credit interest', 'Equipment financing interest', 'Credit card interest (business only)'] },
  line17: { title: 'Line 17 - Legal/Professional', explanation: 'Fees paid to professionals for business support.', examples: ['Bookkeeper fees', 'CPA/tax prep for business return', 'Attorney contract review'] },
  line18: { title: 'Line 18 - Office Expense', explanation: 'Ordinary office costs for running the business.', examples: ['Printer ink and paper', 'Small office tools', 'Postage and shipping supplies'] },
  line19: { title: 'Line 19 - Pension/Profit Sharing', explanation: 'Employer contributions to employee retirement plans.', examples: ['SEP contributions for employees', '401(k) employer match', 'Not owner draws'] },
  line20a: { title: 'Line 20a - Rent/Lease (Vehicles/Equipment)', explanation: 'Rent or lease costs for vehicles/machinery/equipment.', examples: ['Equipment lease payment', 'Machine rental', 'Business vehicle lease share'] },
  line20b: { title: 'Line 20b - Rent/Lease (Other Property)', explanation: 'Rent for office/store/other business property.', examples: ['Office rent', 'Studio rent', 'Storage unit for business inventory'] },
  line21: { title: 'Line 21 - Repairs/Maintenance', explanation: 'Costs to keep business property in working order.', examples: ['Equipment repair', 'Routine maintenance', 'Not major improvements/capital upgrades'] },
  line22: { title: 'Line 22 - Supplies', explanation: 'Consumable supplies used in operations not in inventory section.', examples: ['Cleaning supplies', 'Salon consumables', 'Shop materials used up quickly'] },
  line23: { title: 'Line 23 - Taxes/Licenses', explanation: 'Business-related taxes and licensing fees.', examples: ['City business license', 'Payroll taxes paid by employer', 'State/local business taxes'] },
  line24a: { title: 'Line 24a - Travel', explanation: 'Overnight business travel costs (not commuting).', examples: ['Hotel for client trip', 'Flight to conference', 'Out-of-town rideshare/taxi'] },
  line24bInput: { title: 'Line 24b - Meals (Entered)', explanation: 'Enter total business meal spending; tool will apply the deductible percentage.', examples: ['Client lunch', 'Travel meal during business trip', 'Personal meals do not count'] },
  line24bDeductible: { title: 'Line 24b - Deductible Meals', explanation: 'Schedule C generally allows only part of meal cost. Tool applies 50% here.', examples: ['$400 entered -> $200 deductible', 'Need business purpose and receipt', 'Rules can vary in special cases'] },
  line25: { title: 'Line 25 - Utilities', explanation: 'Business utility bills.', examples: ['Business internet', 'Electricity for office', 'Phone line used for business'] },
  line26: { title: 'Line 26 - Wages', explanation: 'Employee wages paid by the business.', examples: ['Staff payroll gross wages', 'Exclude your owner draw', 'Subtract employment credits as applicable'] },
  line27a: { title: 'Line 27a - Energy Efficient Bldg Deduction', explanation: 'Special deduction linked to Form 7205 for qualifying commercial buildings.', examples: ['Commercial energy upgrades', 'Most small businesses enter 0', 'Use support docs'] },
  line27b: { title: 'Line 27b - Other Expenses Total', explanation: 'Auto total from Part V line 48.', examples: ['Bank fees + software + education', 'Must be ordinary and necessary', 'Keep receipts and notes'] },
  line28: { title: 'Line 28 - Total Expenses', explanation: 'Total deductible expenses before home office.', examples: ['Includes line 9 and 24b deductions', 'Auto-calculated', 'Cross-check unusual spikes'] },
  line29: { title: 'Line 29 - Tentative Profit/Loss', explanation: 'Line 7 minus line 28 before home office.', examples: ['Positive means profit so far', 'Negative means loss so far', 'Auto-calculated'] },
  line30: { title: 'Line 30 - Home Office Expense', explanation: 'Business-use-of-home deduction from Form 8829 or simplified method.', examples: ['Direct Form 8829 amount', 'Simplified method amount', 'Enter 0 if not claiming'] },
  line30a: { title: 'Line 30a - Simplified Method Inputs', explanation: 'Enter home and business square footage for a quick estimate.', examples: ['Only regular/exclusive business area', 'Separate workspace measurements', 'Tool caps business area at 300 sq ft'] },
  line30b: { title: 'Line 30b - Simplified Estimate', explanation: 'Estimate is business square feet x $5, max 300 sq ft.', examples: ['200 sq ft -> $1,000', '350 sq ft still capped at $1,500', 'Use as planning helper'] },
  line31: { title: 'Line 31 - Net Profit/Loss', explanation: 'Final Schedule C result before carryovers and other forms.', examples: ['Flows to Form 1040 Schedule 1', 'Also impacts self-employment tax', 'Auto-calculated from lines 29 and 30'] },
  line32a: { title: 'Line 32a - At-Risk Question', explanation: 'Answer yes if your invested/business money is fully at risk.', examples: ['No guarantees/protection from loss: Yes', 'Protected/financed in special ways: maybe No', 'When unsure, review IRS at-risk rules'] },
  line43: { title: 'Line 43 - Vehicle In-Service Date', explanation: 'Date you first used this vehicle for business.', examples: ['Started delivery driving June 1', 'First business-use date', 'Not purchase date unless same'] },
  line44: { title: 'Line 44 - Vehicle Miles', explanation: 'Break out miles by business, commuting, and other personal use.', examples: ['Business: client/site trips', 'Commuting: home to regular workplace', 'Other: personal driving'] },
  line44t: { title: 'Line 44 Total Miles', explanation: 'Auto sum of all mileage categories.', examples: ['Business + commuting + other', 'Should align with odometer records', 'Auto-calculated'] },
  line45: { title: 'Line 45 - Personal Use Availability', explanation: 'Was the vehicle available for personal use after work?', examples: ['Same vehicle used personally: Yes', 'Dedicated fleet vehicle: No', 'Be honest and consistent'] },
  line46: { title: 'Line 46 - Another Personal Vehicle', explanation: 'Whether you/your spouse had another car for personal use.', examples: ['Second household vehicle: Yes', 'Only one mixed-use car: No', 'Supports mileage treatment'] },
  line47a: { title: 'Line 47a - Evidence Support', explanation: 'Do you have records proving the deduction?', examples: ['Mileage logs', 'Receipts and calendar records', 'Digital tracking app exports'] },
  line47b: { title: 'Line 47b - Written Evidence', explanation: 'Is your evidence documented in writing?', examples: ['Written mileage log: Yes', 'App-based logs: Yes', 'Memory only: No'] },
  line48: { title: 'Line 48 - Other Expenses Detail', explanation: 'List and total expenses that do not fit lines 8-27a.', examples: ['Software subscriptions', 'Bank/payment processing fees', 'Business education/certifications'] }
};

const scheduleCHelpContentEs = {
  businessA: { title: 'Línea superior A - Actividad principal', explanation: 'Escriba qué hace para generar ingresos, de forma clara y específica.', examples: ['Conductor de rideshare', 'Barbero móvil', 'Diseñador freelance'] },
  businessB: { title: 'Línea superior B - Código de negocio', explanation: 'Este es su código NAICS; indica al IRS su industria.', examples: ['Rideshare: 485300', 'Artista independiente: 711510', 'Revise tabla NAICS del IRS'] },
  businessC: { title: 'Línea superior C - Nombre del negocio', explanation: 'Use el nombre comercial si existe; si no, su nombre legal.', examples: ['Jefferson Legacy LLC', 'J. Legacy Consulting', 'En blanco solo si no tiene'] },
  businessD: { title: 'Línea superior D - EIN', explanation: 'Ingrese su EIN si tiene; si no, puede declarar con SSN cuando aplique.', examples: ['12-3456789', 'LLC unipersonal con EIN', 'Sin EIN: dejar en blanco'] },
  businessF: { title: 'Línea superior F - Método contable', explanation: 'Efectivo = cuando cobra/paga. Devengo = cuando gana/incurre.', examples: ['Efectivo: común en pequeños negocios', 'Devengo: negocios con inventario', 'Sea consistente cada año'] },
  businessG: { title: 'Línea superior G - Participación material', explanation: 'Pregunta si usted operó activamente el negocio.', examples: ['Trabajó usted mismo: Sí', 'Solo inversionista pasivo: No', 'Manejo diario: Sí'] },
  line1: { title: 'Línea 1 - Ingresos brutos', explanation: 'Total de dinero que entró al negocio antes de gastos.', examples: ['Ventas Stripe + efectivo', 'Ingresos 1099-NEC', 'No reste comisiones aquí'] },
  line2: { title: 'Línea 2 - Devoluciones/descuentos', explanation: 'Reembolsos o descuentos devueltos a clientes.', examples: ['Reembolso por cancelación', 'Devolución de producto', 'Sin devoluciones: 0'] },
  line3: { title: 'Línea 3 - Ventas netas', explanation: 'Línea 1 menos línea 2; el sistema lo calcula.', examples: ['100,000 - 2,000 = 98,000', 'Más devoluciones reducen esta línea', 'Revise sus registros'] },
  line4: { title: 'Línea 4 - Costo de bienes vendidos', explanation: 'Viene de la Parte III, línea 42; típico en negocios con inventario.', examples: ['Costo de inventario minorista', 'Material de manufactura', 'Servicios: suele ser 0'] },
  line5: { title: 'Línea 5 - Ganancia bruta', explanation: 'Ganancia después de COGS y antes de otros ingresos/gastos.', examples: ['Línea 3 menos línea 4', 'Indicador de margen', 'Si es bajo, revise precios'] },
  line6: { title: 'Línea 6 - Otros ingresos', explanation: 'Ingresos del negocio no incluidos en línea 1.', examples: ['Créditos/reembolsos de combustible', 'Premios ligados al negocio', 'Reembolsos comerciales'] },
  line7: { title: 'Línea 7 - Ingreso bruto', explanation: 'Número principal de ingreso en Schedule C.', examples: ['Línea 5 + línea 6', 'Base para utilidad/pérdida', 'Debe cuadrar con sus libros'] },
  line35: { title: 'Línea 35 - Inventario inicial', explanation: 'Valor de inventario al inicio del año fiscal.', examples: ['Inventario final del año anterior', 'Valor costo, no precio venta', 'Servicios: usualmente 0'] },
  line36: { title: 'Línea 36 - Compras', explanation: 'Compras de inventario para reventa, menos retiros personales.', examples: ['Compra al mayoreo', 'Inventario por lotes', 'Excluya uso personal'] },
  line37: { title: 'Línea 37 - Costo de mano de obra', explanation: 'Mano de obra directa para producir bienes (no su propio pago).', examples: ['Contratista de ensamblaje', 'Costos de producción', 'No incluya retiro del dueño'] },
  line38: { title: 'Línea 38 - Materiales y suministros', explanation: 'Insumos usados para producir/vender productos.', examples: ['Empaque', 'Materia prima', 'Partes consumibles'] },
  line39: { title: 'Línea 39 - Otros costos', explanation: 'Costos de producción que no caben en las líneas anteriores.', examples: ['Flete de inventario', 'Almacenaje de inventario', 'Conserve detalle'] },
  line40: { title: 'Línea 40 - Total disponible inventario', explanation: 'Suma de líneas 35 a 39 (automática).', examples: ['Inventario inicial + compras + mano de obra', 'Total previo a cierre', 'Cálculo automático'] },
  line41: { title: 'Línea 41 - Inventario final', explanation: 'Valor de inventario restante al cierre del año.', examples: ['Conteo físico 31 dic', 'Método de costo consistente', 'Menor inventario final sube COGS'] },
  line42: { title: 'Línea 42 - Costo de bienes vendidos', explanation: 'Línea 40 menos línea 41 (automático).', examples: ['Costo realmente vendido', 'Pasa a línea 4', 'No puede ser negativo'] },
  line8: { title: 'Línea 8 - Publicidad', explanation: 'Gastos para atraer clientes.', examples: ['Anuncios Meta/Google', 'Flyers impresos', 'Publicaciones patrocinadas'] },
  line9: { title: 'Línea 9 - Auto/camión', explanation: 'Calculado por millas de negocio con tarifa estándar.', examples: ['Millas de negocio x 70 centavos (2025)', 'Commuting no deducible', 'Guarde bitácora'] },
  line10: { title: 'Línea 10 - Comisiones/honorarios', explanation: 'Pagos a terceros por ventas o referidos.', examples: ['Comisiones de afiliados', 'Pago por referidos', 'Tarifas de marketplaces'] },
  line11: { title: 'Línea 11 - Trabajo por contrato', explanation: 'Pagos a contratistas independientes.', examples: ['Editor freelance', 'Subcontratista instalador', '1099-NEC cuando aplique'] },
  line12: { title: 'Línea 12 - Agotamiento', explanation: 'Deducción especial para extracción de recursos naturales.', examples: ['Petróleo/gas/minería', 'La mayoría: 0', 'Revise instrucciones'] },
  line13: { title: 'Línea 13 - Depreciación/179', explanation: 'Deducción de activos por tiempo o acelerada por sección 179.', examples: ['Laptop del negocio', 'Compra de equipo', 'Puede requerir Form 4562'] },
  line14: { title: 'Línea 14 - Beneficios a empleados', explanation: 'Costos de beneficios para empleados (no beneficios personales del dueño).', examples: ['Seguro de vida grupal', 'Cuidado de dependientes', 'No ponga seguro médico del dueño aquí'] },
  line15: { title: 'Línea 15 - Seguro (no salud)', explanation: 'Primas de seguro del negocio no deducidas en otra línea.', examples: ['Responsabilidad general', 'Responsabilidad profesional', 'Seguro comercial'] },
  line16a: { title: 'Línea 16a - Interés hipotecario', explanation: 'Interés de hipoteca comercial pagado a bancos.', examples: ['Interés oficina', 'Interés bodega', 'Solo interés, no principal'] },
  line16b: { title: 'Línea 16b - Otros intereses', explanation: 'Intereses de préstamos o crédito comercial.', examples: ['Línea de crédito', 'Financiamiento de equipo', 'Tarjeta empresarial'] },
  line17: { title: 'Línea 17 - Legal/profesional', explanation: 'Honorarios de profesionales que apoyan al negocio.', examples: ['Bookkeeper', 'CPA fiscal', 'Abogado contractual'] },
  line18: { title: 'Línea 18 - Gasto de oficina', explanation: 'Gastos ordinarios de operación de oficina.', examples: ['Tinta y papel', 'Herramientas pequeñas', 'Papelería/envíos'] },
  line19: { title: 'Línea 19 - Pensión/reparto utilidades', explanation: 'Aportaciones patronales a retiro de empleados.', examples: ['SEP para empleados', 'Match 401(k)', 'No retiros del dueño'] },
  line20a: { title: 'Línea 20a - Renta/arrendamiento (vehículos/equipo)', explanation: 'Renta o lease de vehículos, maquinaria o equipo.', examples: ['Lease de equipo', 'Renta de maquinaria', 'Parte empresarial del auto'] },
  line20b: { title: 'Línea 20b - Renta/arrendamiento (otra propiedad)', explanation: 'Renta de oficina, local u otra propiedad de negocio.', examples: ['Renta oficina', 'Renta estudio', 'Bodega de inventario'] },
  line21: { title: 'Línea 21 - Reparaciones/mantenimiento', explanation: 'Costos para mantener propiedad del negocio operando.', examples: ['Reparar equipo', 'Mantenimiento rutinario', 'No mejoras capitales'] },
  line22: { title: 'Línea 22 - Suministros', explanation: 'Suministros consumibles no incluidos en inventario.', examples: ['Limpieza', 'Consumibles de salón', 'Material de uso rápido'] },
  line23: { title: 'Línea 23 - Impuestos/licencias', explanation: 'Impuestos y licencias del negocio.', examples: ['Licencia municipal', 'Impuestos patronales', 'Impuestos estatales/locales'] },
  line24a: { title: 'Línea 24a - Viaje', explanation: 'Gastos de viaje de negocio con pernocta (no commuting).', examples: ['Hotel por cliente', 'Vuelo a conferencia', 'Taxi/rideshare en viaje'] },
  line24bInput: { title: 'Línea 24b - Comidas (capturado)', explanation: 'Ingrese el gasto total en comidas de negocio; el sistema aplica porcentaje deducible.', examples: ['Comida con cliente', 'Comida en viaje', 'No incluye consumo personal'] },
  line24bDeductible: { title: 'Línea 24b - Comidas deducibles', explanation: 'Generalmente solo parte del gasto en comidas es deducible. Aquí se aplica 50%.', examples: ['400 ingresado -> 200 deducible', 'Conserve recibo y motivo', 'Puede variar en casos especiales'] },
  line25: { title: 'Línea 25 - Servicios públicos', explanation: 'Facturas de servicios del negocio.', examples: ['Internet comercial', 'Luz oficina', 'Teléfono negocio'] },
  line26: { title: 'Línea 26 - Salarios', explanation: 'Sueldos pagados a empleados.', examples: ['Nómina del personal', 'No retiros del dueño', 'Considere créditos laborales'] },
  line27a: { title: 'Línea 27a - Deducción energía edificios', explanation: 'Deducción especial ligada al Formulario 7205.', examples: ['Mejoras energéticas', 'Muchos negocios: 0', 'Mantenga soporte'] },
  line27b: { title: 'Línea 27b - Total otros gastos', explanation: 'Total automático desde Parte V línea 48.', examples: ['Software + banco + capacitación', 'Debe ser ordinario y necesario', 'Guarde comprobantes'] },
  line28: { title: 'Línea 28 - Total gastos', explanation: 'Total deducible antes de uso de hogar.', examples: ['Incluye línea 9 y 24b', 'Cálculo automático', 'Revise variaciones grandes'] },
  line29: { title: 'Línea 29 - Utilidad/pérdida tentativa', explanation: 'Línea 7 menos línea 28 antes de oficina en casa.', examples: ['Positivo = utilidad', 'Negativo = pérdida', 'Automático'] },
  line30: { title: 'Línea 30 - Uso de hogar', explanation: 'Deducción por uso de hogar (Form 8829 o método simplificado).', examples: ['Monto de Form 8829', 'Monto simplificado', '0 si no aplica'] },
  line30a: { title: 'Línea 30a - Entradas método simplificado', explanation: 'Ingrese pies cuadrados de casa y área de negocio para estimación rápida.', examples: ['Solo área regular/exclusiva', 'Mediciones separadas', 'Tope 300 ft²'] },
  line30b: { title: 'Línea 30b - Estimación simplificada', explanation: 'Estimado = pies cuadrados de negocio x $5, máximo 300 ft².', examples: ['200 ft² -> $1,000', '350 ft² sigue en tope $1,500', 'Úselo para planear'] },
  line31: { title: 'Línea 31 - Utilidad/pérdida neta', explanation: 'Resultado final Schedule C antes de otros formularios.', examples: ['Fluye a Schedule 1', 'Impacta self-employment tax', 'Automático con líneas 29 y 30'] },
  line32a: { title: 'Línea 32a - Pregunta de riesgo', explanation: 'Responda sí si su dinero invertido está completamente en riesgo.', examples: ['Sin protección contra pérdida: Sí', 'Con protección/financiamiento especial: quizá No', 'Si duda, revise reglas at-risk'] },
  line43: { title: 'Línea 43 - Fecha en servicio vehículo', explanation: 'Fecha en que usó por primera vez el vehículo para negocio.', examples: ['Inició entregas 1 junio', 'Primera fecha de uso comercial', 'No necesariamente fecha compra'] },
  line44: { title: 'Línea 44 - Millas del vehículo', explanation: 'Separe millas de negocio, commuting y otras personales.', examples: ['Negocio: visitas/trabajo', 'Commuting: casa a trabajo fijo', 'Other: uso personal'] },
  line44t: { title: 'Línea 44 Total millas', explanation: 'Suma automática de todas las categorías de millas.', examples: ['Negocio + commuting + other', 'Debe cuadrar con odómetro', 'Automático'] },
  line45: { title: 'Línea 45 - Disponibilidad uso personal', explanation: '¿El vehículo estuvo disponible para uso personal fuera de horario?', examples: ['Vehículo mixto: Sí', 'Vehículo dedicado flota: No', 'Sea consistente'] },
  line46: { title: 'Línea 46 - Otro vehículo personal', explanation: 'Si usted o su cónyuge tenían otro vehículo para uso personal.', examples: ['Segundo auto hogar: Sí', 'Solo un auto mixto: No', 'Apoya tratamiento de millas'] },
  line47a: { title: 'Línea 47a - Evidencia de respaldo', explanation: '¿Tiene registros que respalden la deducción?', examples: ['Bitácora millas', 'Recibos y calendario', 'Apps de rastreo'] },
  line47b: { title: 'Línea 47b - Evidencia escrita', explanation: '¿La evidencia está documentada por escrito?', examples: ['Bitácora escrita: Sí', 'Registros en app: Sí', 'Solo memoria: No'] },
  line48: { title: 'Línea 48 - Detalle otros gastos', explanation: 'Liste y totalice gastos que no entran en líneas 8 a 27a.', examples: ['Suscripciones software', 'Comisiones bancarias/pagos', 'Capacitación del negocio'] }
};

const defaultHelp = {
  en: {
    title: 'Schedule C Line Help',
    explanation: 'Click any line to see what it means in plain English and how to fill it out.',
    examples: ['Use this while entering values', 'Keep records behind each number', 'When unsure, open IRS instructions link']
  },
  es: {
    title: 'Guia de linea Schedule C',
    explanation: 'Seleccione una linea para ver que significa y como llenarla en lenguaje simple.',
    examples: ['Use esto mientras captura datos', 'Guarde soporte de cada numero', 'Si tiene dudas, abra instrucciones del IRS']
  }
};

const ScheduleCWizard = ({ onComplete }) => {
  const { language, copyMode, pickCopy } = useLanguage();
  const isSpanish = language === 'es';
  const copy = (en, es, basicEn = en, basicEs = es) => pickCopy(en, es, basicEn, basicEs);
  const locale = isSpanish ? 'es-US' : 'en-US';
  const tx = (en, es) => (isSpanish ? es : en);

  const rowIdRef = useRef(2);
  const sheetRef = useRef(null);
  const helpPanelRef = useRef(null);
  const [activeHelpKey, setActiveHelpKey] = useState('line1');
  const [helpPanelOffset, setHelpPanelOffset] = useState(0);

  const [data, setData] = useState({
    principalBusiness: '',
    businessCode: '',
    businessName: '',
    ein: '',
    accountingMethod: 'cash',
    materiallyParticipated: 'yes',
    investmentRisk: 'all',

    grossReceipts: '',
    returnsAllowances: '',
    otherIncome: '',

    inventoryBeginning: '',
    purchases: '',
    costOfLabor: '',
    materialsSupplies: '',
    otherCostsPartIII: '',
    inventoryEnd: '',

    advertising: '',
    commissionsFees: '',
    contractLabor: '',
    depletion: '',
    depreciation179: '',
    employeeBenefits: '',
    insurance: '',
    interestMortgage: '',
    interestOther: '',
    legalProfessional: '',
    officeExpense: '',
    pensionProfitSharing: '',
    rentLeaseVehicles: '',
    rentLeaseOther: '',
    repairsMaintenance: '',
    supplies: '',
    taxesLicenses: '',
    travel: '',
    meals: '',
    utilities: '',
    wages: '',
    energyEfficientBldgDeduction: '',

    homeOfficeExpense: '',
    homeSquareFootage: '',
    businessSquareFootage: '',

    vehicleInServiceDate: '',
    businessMiles: '',
    commutingMiles: '',
    otherMiles: '',
    vehicleAvailableForPersonalUse: 'no',
    otherVehicleAvailable: 'no',
    evidenceToSupportDeduction: 'yes',
    writtenEvidence: 'yes',

    otherExpensesRows: [{ id: 1, description: '', amount: '' }]
  });

  const calculations = useMemo(() => {
    const line1 = parseMoney(data.grossReceipts);
    const line2 = parseMoney(data.returnsAllowances);
    const line3 = line1 - line2;

    const line35 = parseMoney(data.inventoryBeginning);
    const line36 = parseMoney(data.purchases);
    const line37 = parseMoney(data.costOfLabor);
    const line38 = parseMoney(data.materialsSupplies);
    const line39 = parseMoney(data.otherCostsPartIII);
    const line40 = line35 + line36 + line37 + line38 + line39;
    const line41 = parseMoney(data.inventoryEnd);
    const line42 = Math.max(line40 - line41, 0);

    const line4 = line42;
    const line5 = line3 - line4;
    const line6 = parseMoney(data.otherIncome);
    const line7 = line5 + line6;

    const businessMiles = parseMoney(data.businessMiles);
    const commutingMiles = parseMoney(data.commutingMiles);
    const otherMiles = parseMoney(data.otherMiles);
    const totalMiles = businessMiles + commutingMiles + otherMiles;
    const line9 = businessMiles * IRS_STANDARD_MILEAGE_RATE_2025;

    const line24b = parseMoney(data.meals) * 0.5;

    const line48 = data.otherExpensesRows.reduce((sum, row) => {
      return sum + parseMoney(row.amount);
    }, 0);

    const line27b = line48;

    const line30Input = parseMoney(data.homeOfficeExpense);
    const simplifiedHomeOffice = Math.min(parseMoney(data.businessSquareFootage), 300) * 5;
    const line30 = line30Input > 0 ? line30Input : simplifiedHomeOffice;

    const line28 = expenseInputRows.reduce((sum, row) => {
      return sum + parseMoney(data[row.key]);
    }, 0) + line9 + line24b + line27b;

    const line29 = line7 - line28;
    const line31 = line29 - line30;

    return {
      line1,
      line2,
      line3,
      line4,
      line5,
      line6,
      line7,
      line35,
      line36,
      line37,
      line38,
      line39,
      line40,
      line41,
      line42,
      line9,
      line24b,
      line27b,
      line28,
      line29,
      line30,
      line31,
      line48,
      totalMiles,
      simplifiedHomeOffice
    };
  }, [data]);

  const aiInsight = useMemo(() => {
    if (calculations.line31 < 0) {
      return copyMode === 'basic'
        ? (isSpanish
          ? `Perdida neta: ${formatCurrency(Math.abs(calculations.line31), locale)}.`
          : `Net loss: ${formatCurrency(Math.abs(calculations.line31), locale)}.`)
        : (isSpanish
          ? `El borrador actual muestra una pérdida neta de ${formatCurrency(Math.abs(calculations.line31), locale)}. Verifique que cada gasto tenga documentación de respaldo clara.`
          : `Current draft shows a net loss of ${formatCurrency(Math.abs(calculations.line31), locale)}. Verify each expense has clean support documents.`);
    }

    if (calculations.line31 > 0) {
      return copyMode === 'basic'
        ? (isSpanish
          ? `Ganancia neta: ${formatCurrency(calculations.line31, locale)}.`
          : `Net profit: ${formatCurrency(calculations.line31, locale)}.`)
        : (isSpanish
          ? `El borrador actual muestra una ganancia neta de ${formatCurrency(calculations.line31, locale)}. Planifique reservas de impuestos estimados ahora para evitar sorpresas.`
          : `Current draft shows net profit of ${formatCurrency(calculations.line31, locale)}. Plan estimated tax reserves now to avoid surprises.`);
    }

    return copyMode === 'basic'
      ? (isSpanish ? 'Ingrese sus datos del IRS.' : 'Enter your IRS values.')
      : (isSpanish
        ? 'Ingrese los valores reales de las líneas del IRS para generar un borrador preciso antes de declarar.'
        : 'Enter your actual IRS line values to generate an accurate draft before filing.');
  }, [calculations.line31, copyMode, isSpanish, locale]);

  const activeHelp = isSpanish
    ? (scheduleCHelpContentEs[activeHelpKey] || defaultHelp.es)
    : (scheduleCHelpContent[activeHelpKey] || defaultHelp.en);
  const activeHelpExplanation = copyMode === 'basic' ? briefText(activeHelp.explanation) : activeHelp.explanation;
  const activeHelpExamples = copyMode === 'basic' ? activeHelp.examples.slice(0, 1) : activeHelp.examples;

  const handleWorksheetInteraction = (event) => {
    if (!(event.target instanceof Element)) return;
    const helpTarget = event.target.closest('[data-help-key]');
    if (!helpTarget) return;
    const helpKey = helpTarget.getAttribute('data-help-key');
    if (helpKey) setActiveHelpKey(helpKey);
  };

  const helpClassName = (baseClassName, helpKey) => {
    if (!helpKey) return baseClassName;
    return activeHelpKey === helpKey ? `${baseClassName} active-help` : baseClassName;
  };

  useEffect(() => {
    const updateHelpPanelPosition = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth <= 1100) {
        setHelpPanelOffset(0);
        return;
      }

      const sheet = sheetRef.current;
      const panel = helpPanelRef.current;
      if (!sheet || !panel) return;

      const activeRow = sheet.querySelector(`[data-help-key="${activeHelpKey}"]`);
      if (!activeRow) {
        setHelpPanelOffset(0);
        return;
      }

      const sheetRect = sheet.getBoundingClientRect();
      const rowRect = activeRow.getBoundingClientRect();
      const desiredTop = Math.max(0, rowRect.top - sheetRect.top - 8);

      const maxOffset = Math.max(0, sheet.scrollHeight - panel.offsetHeight - 8);
      setHelpPanelOffset(Math.min(desiredTop, maxOffset));
    };

    updateHelpPanelPosition();
    window.addEventListener('resize', updateHelpPanelPosition);
    return () => window.removeEventListener('resize', updateHelpPanelPosition);
  }, [activeHelpKey, calculations.line31, data.otherExpensesRows.length]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const addOtherExpenseRow = () => {
    rowIdRef.current += 1;
    setData((prev) => ({
      ...prev,
      otherExpensesRows: [
        ...prev.otherExpensesRows,
        { id: rowIdRef.current, description: '', amount: '' }
      ]
    }));
  };

  const updateOtherExpenseRow = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      otherExpensesRows: prev.otherExpensesRows.map((row) => {
        if (row.id !== id) return row;
        return { ...row, [field]: value };
      })
    }));
  };

  const removeOtherExpenseRow = (id) => {
    setData((prev) => ({
      ...prev,
      otherExpensesRows: prev.otherExpensesRows.filter((row) => row.id !== id)
    }));
  };

  const submitWizard = () => {
    const summary = {
      gross: calculations.line7,
      expenses: calculations.line28 + calculations.line30,
      net: calculations.line31
    };

    const payload = {
      ...data,
      computedLines: calculations,
      scheduleVersion: IRS_SCHEDULE_C_VERSION
    };

    if (onComplete) onComplete(payload, summary);
  };

  return (
    <div className="wizard-container">
      <div className="wizard-main glass-panel">
        <div className="irs-header-row">
          <div>
            <h2 className="step-title">{tx('IRS-Aligned Schedule C Worksheet', 'Hoja Schedule C alineada al IRS')}</h2>
            <p className="step-desc">
              {copy(
                `Mirrors IRS Schedule C (Form 1040) ${IRS_SCHEDULE_C_VERSION} line structure from the official form.`,
                `Refleja la estructura de líneas del Schedule C (Formulario 1040) ${IRS_SCHEDULE_C_VERSION} del IRS según el formulario oficial.`,
                `Matches IRS Schedule C ${IRS_SCHEDULE_C_VERSION}.`,
                `Coincide con Schedule C ${IRS_SCHEDULE_C_VERSION} del IRS.`
              )}
            </p>
          </div>
          <div className="irs-link-group">
            <a href={IRS_SCHEDULE_C_FORM_URL} target="_blank" rel="noopener noreferrer" className="btn-outline irs-link-btn">
              <FileText size={16} /> {tx('Official Form', 'Formulario oficial')} <ExternalLink size={14} />
            </a>
            <a href={IRS_SCHEDULE_C_INSTRUCTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-outline irs-link-btn">
              {tx('Instructions', 'Instrucciones')} <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="ai-assistant-card">
          <div className="ai-header">
            <FileText size={18} className="ai-icon" />
            <span>{tx('IRS WORKSHEET STATUS', 'ESTADO DE LA HOJA IRS')}</span>
          </div>
          <p className="ai-text">{aiInsight}</p>
        </div>

        <div className="wizard-metrics">
          <article className="wizard-metric-card">
            <span>{tx('Gross income', 'Ingreso bruto')}</span>
            <strong>{formatCurrency(calculations.line7, locale)}</strong>
            <small>{tx('Line 7', 'Línea 7')}</small>
          </article>
          <article className="wizard-metric-card">
            <span>{tx('Total expenses', 'Gastos totales')}</span>
            <strong>{formatCurrency(calculations.line28 + calculations.line30, locale)}</strong>
            <small>{tx('Lines 28 + 30', 'Líneas 28 + 30')}</small>
          </article>
          <article className="wizard-metric-card">
            <span>{tx('Vehicle deduction', 'Deducción del vehículo')}</span>
            <strong>{formatCurrency(calculations.line9, locale)}</strong>
            <small>{tx('Line 9 estimate', 'Estimado línea 9')}</small>
          </article>
          <article className="wizard-metric-card">
            <span>{tx('Net result', 'Resultado neto')}</span>
            <strong className={calculations.line31 < 0 ? 'negative' : ''}>{formatCurrency(calculations.line31, locale)}</strong>
            <small>{tx('Line 31', 'Línea 31')}</small>
          </article>
        </div>

        <div className="worksheet-layout">
          <div className="worksheet-primary">
          <div className="irs-sheet-frame">
          <div className="irs-sheet" ref={sheetRef} onClickCapture={handleWorksheetInteraction} onFocusCapture={handleWorksheetInteraction}>
            <div className="irs-sheet-header">
              <div>
                <span className="irs-sheet-kicker">{tx('Working draft', 'Borrador de trabajo')}</span>
                <h3>SCHEDULE C (Form 1040)</h3>
                <p>{tx('Profit or Loss From Business (Sole Proprietorship)', 'Ganancia o pérdida de negocio (propietario único)')}</p>
              </div>
              <div className="irs-sheet-meta">
                <span>OMB No. 1545-0074</span>
                <strong>{IRS_SCHEDULE_C_VERSION}</strong>
              </div>
            </div>

            <section className="irs-section">
              <h4>{tx('Top of Form (Business Information)', 'Parte superior del formulario (Información del negocio)')}</h4>
              <div className="top-form-grid">
                <label data-help-key="businessA" className={helpClassName('top-form-item', 'businessA')}>
                {tx('A. Principal business or profession', 'A. Actividad o profesión principal')}
                <input type="text" name="principalBusiness" value={data.principalBusiness} onChange={handleInputChange} placeholder={tx('e.g., Rideshare services', 'ej., Servicios de rideshare')} />
              </label>
                <label data-help-key="businessB" className={helpClassName('top-form-item', 'businessB')}>
                {tx('B. Business code', 'B. Código del negocio')}
                <input type="text" name="businessCode" value={data.businessCode} onChange={handleInputChange} placeholder={tx('NAICS code', 'Código NAICS')} />
              </label>
                <label data-help-key="businessC" className={helpClassName('top-form-item', 'businessC')}>
                {tx('C. Business name', 'C. Nombre del negocio')}
                <input type="text" name="businessName" value={data.businessName} onChange={handleInputChange} placeholder={tx('Business legal name', 'Nombre legal del negocio')} />
              </label>
                <label data-help-key="businessD" className={helpClassName('top-form-item', 'businessD')}>
                {tx('D. EIN (if any)', 'D. EIN (si aplica)')}
                <input type="text" name="ein" value={data.ein} onChange={handleInputChange} placeholder="XX-XXXXXXX" />
              </label>
                <label data-help-key="businessF" className={helpClassName('top-form-item', 'businessF')}>
                {tx('F. Accounting method', 'F. Método contable')}
                <select name="accountingMethod" value={data.accountingMethod} onChange={handleInputChange}>
                  <option value="cash">{tx('Cash', 'Efectivo')}</option>
                  <option value="accrual">{tx('Accrual', 'Devengo')}</option>
                  <option value="other">{tx('Other', 'Otro')}</option>
                </select>
              </label>
                <label data-help-key="businessG" className={helpClassName('top-form-item', 'businessG')}>
                {tx('G. Materially participated?', 'G. ¿Participó materialmente?')}
                <select name="materiallyParticipated" value={data.materiallyParticipated} onChange={handleInputChange}>
                  <option value="yes">{tx('Yes', 'Sí')}</option>
                  <option value="no">{tx('No', 'No')}</option>
                </select>
              </label>
              </div>
            </section>

            <section className="irs-section">
              <h4>{tx('Part I - Income', 'Parte I - Ingresos')}</h4>
              <div className="line-list">
                <div className={helpClassName('line-item', 'line1')} data-help-key="line1">
                  <span className="line-num">1</span>
                  <label>{tx('Gross receipts or sales', 'Ingresos o ventas brutas')}</label>
                  <input type="number" step="0.01" name="grossReceipts" value={data.grossReceipts} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item', 'line2')} data-help-key="line2">
                  <span className="line-num">2</span>
                  <label>{tx('Returns and allowances', 'Devoluciones y descuentos')}</label>
                  <input type="number" step="0.01" name="returnsAllowances" value={data.returnsAllowances} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item readonly', 'line3')} data-help-key="line3">
                  <span className="line-num">3</span>
                  <label>{tx('Subtract line 2 from line 1', 'Reste la línea 2 de la línea 1')}</label>
                  <div className="line-value">{formatMoney(calculations.line3, locale)}</div>
                </div>
                <div className={helpClassName('line-item readonly', 'line4')} data-help-key="line4">
                  <span className="line-num">4</span>
                  <label>{tx('Cost of goods sold (from line 42)', 'Costo de bienes vendidos (de la línea 42)')}</label>
                  <div className="line-value">{formatMoney(calculations.line4, locale)}</div>
                </div>
                <div className={helpClassName('line-item readonly', 'line5')} data-help-key="line5">
                  <span className="line-num">5</span>
                  <label>{tx('Gross profit (line 3 minus line 4)', 'Ganancia bruta (línea 3 menos línea 4)')}</label>
                  <div className="line-value">{formatMoney(calculations.line5, locale)}</div>
                </div>
                <div className={helpClassName('line-item', 'line6')} data-help-key="line6">
                  <span className="line-num">6</span>
                  <label>{tx('Other income, including federal/state gasoline or fuel tax credit or refund', 'Otros ingresos, incluyendo crédito o reembolso federal/estatal por gasolina o combustible')}</label>
                  <input type="number" step="0.01" name="otherIncome" value={data.otherIncome} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item readonly highlight', 'line7')} data-help-key="line7">
                  <span className="line-num">7</span>
                  <label>{tx('Gross income (line 5 plus line 6)', 'Ingreso bruto (línea 5 más línea 6)')}</label>
                  <div className="line-value">{formatMoney(calculations.line7, locale)}</div>
                </div>
              </div>
            </section>

            <section className="irs-section">
              <h4>{tx('Part III - Cost of Goods Sold', 'Parte III - Costo de bienes vendidos')}</h4>
              <div className="line-list">
                <div className={helpClassName('line-item', 'line35')} data-help-key="line35">
                  <span className="line-num">35</span>
                  <label>{tx('Inventory at beginning of year', 'Inventario al inicio del año')}</label>
                  <input type="number" step="0.01" name="inventoryBeginning" value={data.inventoryBeginning} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item', 'line36')} data-help-key="line36">
                  <span className="line-num">36</span>
                  <label>{tx('Purchases less cost of items withdrawn for personal use', 'Compras menos costo de artículos retirados para uso personal')}</label>
                  <input type="number" step="0.01" name="purchases" value={data.purchases} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item', 'line37')} data-help-key="line37">
                  <span className="line-num">37</span>
                  <label>{tx('Cost of labor (do not include any amounts paid to yourself)', 'Costo de mano de obra (no incluya pagos a usted mismo)')}</label>
                  <input type="number" step="0.01" name="costOfLabor" value={data.costOfLabor} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item', 'line38')} data-help-key="line38">
                  <span className="line-num">38</span>
                  <label>{tx('Materials and supplies', 'Materiales y suministros')}</label>
                  <input type="number" step="0.01" name="materialsSupplies" value={data.materialsSupplies} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item', 'line39')} data-help-key="line39">
                  <span className="line-num">39</span>
                  <label>{tx('Other costs', 'Otros costos')}</label>
                  <input type="number" step="0.01" name="otherCostsPartIII" value={data.otherCostsPartIII} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item readonly', 'line40')} data-help-key="line40">
                  <span className="line-num">40</span>
                  <label>{tx('Add lines 35 through 39', 'Sume las líneas 35 a 39')}</label>
                  <div className="line-value">{formatMoney(calculations.line40, locale)}</div>
                </div>
                <div className={helpClassName('line-item', 'line41')} data-help-key="line41">
                  <span className="line-num">41</span>
                  <label>{tx('Inventory at end of year', 'Inventario al final del año')}</label>
                  <input type="number" step="0.01" name="inventoryEnd" value={data.inventoryEnd} onChange={handleInputChange} />
                </div>
                <div className={helpClassName('line-item readonly highlight', 'line42')} data-help-key="line42">
                  <span className="line-num">42</span>
                  <label>{tx('Cost of goods sold (line 40 minus line 41)', 'Costo de bienes vendidos (línea 40 menos línea 41)')}</label>
                  <div className="line-value">{formatMoney(calculations.line42, locale)}</div>
                </div>
              </div>
            </section>

            <section className="irs-section">
              <h4>{tx('Part II - Expenses', 'Parte II - Gastos')}</h4>
              <div className="line-list">
                {expenseInputRows.map((row) => (
                  <div className={helpClassName('line-item', row.helpKey)} data-help-key={row.helpKey} key={row.line}>
                    <span className="line-num">{row.line}</span>
                    <label>{isSpanish ? row.label.es : row.label.en}</label>
                    <input type="number" step="0.01" name={row.key} value={data[row.key]} onChange={handleInputChange} />
                  </div>
                ))}

                <div className={helpClassName('line-item readonly', 'line9')} data-help-key="line9">
                  <span className="line-num">9</span>
                  <label>{tx('Car and truck expenses (standard mileage at 70 cents for 2025)', 'Gastos de auto y camión (milla estándar de 70 centavos para 2025)')}</label>
                  <div className="line-value">{formatMoney(calculations.line9, locale)}</div>
                </div>

                <div className={helpClassName('line-item', 'line24bInput')} data-help-key="line24bInput">
                  <span className="line-num">24b</span>
                  <label>{tx('Meals spending entered (tool applies 50% deductibility)', 'Gasto en comidas ingresado (la herramienta aplica 50% deducible)')}</label>
                  <input type="number" step="0.01" name="meals" value={data.meals} onChange={handleInputChange} />
                </div>

                <div className={helpClassName('line-item readonly', 'line24bDeductible')} data-help-key="line24bDeductible">
                  <span className="line-num">24b</span>
                  <label>{tx('Deductible meals (50% of meals entered)', 'Comidas deducibles (50% de comidas ingresadas)')}</label>
                  <div className="line-value">{formatMoney(calculations.line24b, locale)}</div>
                </div>

                <div className={helpClassName('line-item readonly', 'line27b')} data-help-key="line27b">
                  <span className="line-num">27b</span>
                  <label>{tx('Other expenses (from line 48)', 'Otros gastos (de la línea 48)')}</label>
                  <div className="line-value">{formatMoney(calculations.line27b, locale)}</div>
                </div>

                <div className={helpClassName('line-item readonly', 'line28')} data-help-key="line28">
                  <span className="line-num">28</span>
                  <label>{tx('Total expenses before business use of home', 'Gastos totales antes del uso comercial del hogar')}</label>
                  <div className="line-value">{formatMoney(calculations.line28, locale)}</div>
                </div>

                <div className={helpClassName('line-item readonly', 'line29')} data-help-key="line29">
                  <span className="line-num">29</span>
                  <label>{tx('Tentative profit or (loss) (line 7 minus line 28)', 'Utilidad o (pérdida) tentativa (línea 7 menos línea 28)')}</label>
                  <div className="line-value">{formatMoney(calculations.line29, locale)}</div>
                </div>

                <div className={helpClassName('line-item', 'line30')} data-help-key="line30">
                  <span className="line-num">30</span>
                  <label>{tx('Expenses for business use of home (Form 8829 or simplified method)', 'Gastos por uso comercial del hogar (Formulario 8829 o método simplificado)')}</label>
                  <input type="number" step="0.01" name="homeOfficeExpense" value={data.homeOfficeExpense} onChange={handleInputChange} placeholder={tx('Optional manual entry', 'Entrada manual opcional')} />
                </div>

                <div className={helpClassName('line-item home-office-helper', 'line30a')} data-help-key="line30a">
                  <span className="line-num">30a</span>
                  <label>{tx('Simplified method helper (square feet)', 'Ayudante método simplificado (pies cuadrados)')}</label>
                  <div className="inline-fields">
                    <input type="number" step="1" name="homeSquareFootage" value={data.homeSquareFootage} onChange={handleInputChange} placeholder={tx('Home sq ft', 'Pies cuadrados de hogar')} />
                    <input type="number" step="1" name="businessSquareFootage" value={data.businessSquareFootage} onChange={handleInputChange} placeholder={tx('Business sq ft', 'Pies cuadrados de negocio')} />
                  </div>
                </div>

                <div className={helpClassName('line-item readonly', 'line30b')} data-help-key="line30b">
                  <span className="line-num">30b</span>
                  <label>{tx('Simplified method estimate (max 300 sq ft x $5)', 'Estimación método simplificado (máx 300 ft² x $5)')}</label>
                  <div className="line-value">{formatMoney(calculations.simplifiedHomeOffice, locale)}</div>
                </div>

                <div className={helpClassName('line-item readonly highlight', 'line31')} data-help-key="line31">
                  <span className="line-num">31</span>
                  <label>{tx('Net profit or (loss) (line 29 minus line 30)', 'Utilidad o (pérdida) neta (línea 29 menos línea 30)')}</label>
                  <div className={`line-value ${calculations.line31 < 0 ? 'negative' : ''}`}>
                    {formatMoney(calculations.line31, locale)}
                  </div>
                </div>
              </div>

              <div className={helpClassName('risk-box', 'line32a')} data-help-key="line32a">
                <span>{tx('32a. All investment in this activity is at risk?', '32a. ¿Toda la inversión en esta actividad está en riesgo?')}</span>
                <select name="investmentRisk" value={data.investmentRisk} onChange={handleInputChange}>
                  <option value="all">{tx('Yes', 'Sí')}</option>
                  <option value="some">{tx('No', 'No')}</option>
                </select>
              </div>
            </section>

            <section className="irs-section">
              <h4>{tx('Part IV - Information on Your Vehicle', 'Parte IV - Información de su vehículo')}</h4>
              <div className="line-list">
                <div className={helpClassName('line-item', 'line43')} data-help-key="line43">
                <span className="line-num">43</span>
                <label>{tx('When did you place your vehicle in service for business purposes?', '¿Cuándo puso su vehículo en servicio para fines de negocio?')}</label>
                <input type="date" name="vehicleInServiceDate" value={data.vehicleInServiceDate} onChange={handleInputChange} />
              </div>
                <div className={helpClassName('line-item mileage-grid', 'line44')} data-help-key="line44">
                <span className="line-num">44</span>
                <label>{tx('Vehicle miles driven during the year', 'Millas del vehículo recorridas durante el año')}</label>
                <div className="inline-fields">
                  <input type="number" step="1" name="businessMiles" value={data.businessMiles} onChange={handleInputChange} placeholder={tx('Business', 'Negocio')} />
                  <input type="number" step="1" name="commutingMiles" value={data.commutingMiles} onChange={handleInputChange} placeholder={tx('Commuting', 'Traslado')} />
                  <input type="number" step="1" name="otherMiles" value={data.otherMiles} onChange={handleInputChange} placeholder={tx('Other', 'Otro')} />
                </div>
              </div>
                <div className={helpClassName('line-item readonly', 'line44t')} data-help-key="line44t">
                <span className="line-num">44t</span>
                <label>{tx('Total miles', 'Millas totales')}</label>
                <div className="line-value">{formatMoney(calculations.totalMiles, locale)}</div>
              </div>
                <div className={helpClassName('line-item', 'line45')} data-help-key="line45">
                <span className="line-num">45</span>
                <label>{tx('Was your vehicle available for personal use during off-duty hours?', '¿Su vehículo estuvo disponible para uso personal fuera del horario de trabajo?')}</label>
                <select name="vehicleAvailableForPersonalUse" value={data.vehicleAvailableForPersonalUse} onChange={handleInputChange}>
                  <option value="yes">{tx('Yes', 'Sí')}</option>
                  <option value="no">{tx('No', 'No')}</option>
                </select>
              </div>
                <div className={helpClassName('line-item', 'line46')} data-help-key="line46">
                <span className="line-num">46</span>
                <label>{tx('Do you (or your spouse) have another vehicle available for personal use?', '¿Usted (o su cónyuge) tiene otro vehículo disponible para uso personal?')}</label>
                <select name="otherVehicleAvailable" value={data.otherVehicleAvailable} onChange={handleInputChange}>
                  <option value="yes">{tx('Yes', 'Sí')}</option>
                  <option value="no">{tx('No', 'No')}</option>
                </select>
              </div>
                <div className={helpClassName('line-item', 'line47a')} data-help-key="line47a">
                <span className="line-num">47a</span>
                <label>{tx('Do you have evidence to support your deduction?', '¿Tiene evidencia que respalde su deducción?')}</label>
                <select name="evidenceToSupportDeduction" value={data.evidenceToSupportDeduction} onChange={handleInputChange}>
                  <option value="yes">{tx('Yes', 'Sí')}</option>
                  <option value="no">{tx('No', 'No')}</option>
                </select>
              </div>
                <div className={helpClassName('line-item', 'line47b')} data-help-key="line47b">
                <span className="line-num">47b</span>
                <label>{tx('If yes, is the evidence written?', 'Si respondió sí, ¿la evidencia está por escrito?')}</label>
                <select name="writtenEvidence" value={data.writtenEvidence} onChange={handleInputChange}>
                  <option value="yes">{tx('Yes', 'Sí')}</option>
                  <option value="no">{tx('No', 'No')}</option>
                </select>
                </div>
              </div>
            </section>

            <section className={helpClassName('irs-section', 'line48')} data-help-key="line48">
              <h4>{tx('Part V - Other Expenses', 'Parte V - Otros gastos')}</h4>
              <div className="other-expenses-table">
                {data.otherExpensesRows.map((row) => (
                  <div className="other-expense-row" key={row.id}>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(event) => updateOtherExpenseRow(row.id, 'description', event.target.value)}
                    placeholder={tx('Expense description', 'Descripción del gasto')}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={row.amount}
                    onChange={(event) => updateOtherExpenseRow(row.id, 'amount', event.target.value)}
                    placeholder={tx('Amount', 'Monto')}
                  />
                  <button
                    type="button"
                    className="btn-remove-row"
                    onClick={() => removeOtherExpenseRow(row.id)}
                    disabled={data.otherExpensesRows.length === 1}
                    aria-label={tx('Remove other expense row', 'Quitar fila de gasto')}
                  >
                    <Trash2 size={14} />
                  </button>
                  </div>
                ))}
              </div>
              <div className="other-expenses-actions">
                <button type="button" className="btn-outline" onClick={addOtherExpenseRow}>
                  <Plus size={16} /> {tx('Add Expense Row', 'Agregar fila de gasto')}
                </button>
                <div className="line-value-inline">{tx('Line 48 total', 'Total línea 48')}: {formatMoney(calculations.line48, locale)}</div>
              </div>
            </section>

            <section className="irs-summary-strip">
              <div>
                <span>{tx('Line 7 Gross Income', 'Línea 7 Ingreso bruto')}</span>
                <strong>{formatCurrency(calculations.line7, locale)}</strong>
              </div>
              <div>
                <span>{tx('Line 28 Expenses', 'Línea 28 Gastos')}</span>
                <strong>{formatCurrency(calculations.line28, locale)}</strong>
              </div>
              <div>
                <span>{tx('Line 30 Home Office', 'Línea 30 Oficina en casa')}</span>
                <strong>{formatCurrency(calculations.line30, locale)}</strong>
              </div>
              <div>
                <span>{tx('Line 31 Net Profit/Loss', 'Línea 31 Utilidad/Pérdida neta')}</span>
                <strong className={calculations.line31 < 0 ? 'negative' : ''}>{formatCurrency(calculations.line31, locale)}</strong>
              </div>
            </section>
          </div>
          </div>
          </div>

          <aside className="worksheet-sidebar">
            <div className="sidebar-stack">
              <section className="sidebar-card sidebar-summary-card">
                <span className="sidebar-kicker">{tx('Quick read', 'Lectura rápida')}</span>
                <h3>{tx('Before you save this draft', 'Antes de guardar este borrador')}</h3>
                <ul className="sidebar-summary-list">
                  <li>{tx('Use exact totals whenever you already have the real number.', 'Use totales exactos cuando ya tenga el número real.')}</li>
                  <li>{tx('If a line feels unclear, click it once and the guide will explain it here.', 'Si una línea se siente confusa, haga clic una vez y la guía la explicará aquí.')}</li>
                  <li>{tx('Keep receipts, mileage logs, and inventory detail behind every deduction.', 'Guarde recibos, bitácoras de millaje y detalle de inventario detrás de cada deducción.')}</li>
                </ul>
              </section>

              <section
                ref={helpPanelRef}
                className="line-help-panel sidebar-card glass-panel"
                style={{ transform: `translateY(${helpPanelOffset}px)` }}
              >
                <div className="line-help-header">
                  <span>{tx('Line Guide', 'Guía de líneas')}</span>
                  <strong>{activeHelp.title}</strong>
                </div>
                <p className="line-help-text">{activeHelpExplanation}</p>
                <div className="line-help-examples">
                  <h5>{tx('Examples', 'Ejemplos')}</h5>
                  <ul>
                    {activeHelpExamples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </aside>
        </div>

        <div className="wizard-footer">
          <p className="final-instruction">
            {tx(
              'This worksheet mirrors the IRS line structure for review and preparation only. Final filing must use official IRS forms and instructions.',
              'Esta hoja refleja la estructura de líneas del IRS solo para revisión y preparación. La presentación final debe usar formularios e instrucciones oficiales del IRS.'
            )}
          </p>
          <button className="btn-primary submit-pulse" onClick={submitWizard}>
            {tx('Save IRS-Aligned Draft', 'Guardar borrador alineado al IRS')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCWizard;
