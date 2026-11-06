import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem, ServiceItem } from '../types';
import {
  CmsUser,
  CmsRole,
  HeroSlide,
  FaqItem,
  LeadRfqItem,
  LeadRfqStatus,
  AboutPageContent,
  ServicesPageContent,
  IndustriesPageContent,
  ContactPageContent,
  CustomSubpage,
  MediaAsset,
  ProductCategoryItem,
  BrandPartnerItem,
  ManagedUserAccount,
  SystemAccessScope,
  UserAccountStatus,
  LiveSupportConfig,
  LiveChatSession,
  LiveChatMessage,
} from '../types/cms';
import { PortalRole } from '../types/portal';
import {
  PRODUCTS as INITIAL_PRODUCTS,
  SERVICES as INITIAL_SERVICES,
  BRANDS as INITIAL_BRANDS,
  INITIAL_ABOUT_CONTENT,
  INITIAL_SERVICES_PAGE_CONTENT,
  INITIAL_INDUSTRIES_PAGE_CONTENT,
  INITIAL_CONTACT_CONTENT,
  INITIAL_SUBPAGES,
} from '../data/mockData';

// Standard demo users for rapid role-based access
export const DEMO_CMS_USERS: Record<CmsRole, CmsUser> = {
  'super-admin': {
    id: 'user-super-01',
    name: 'Engr. Samuel O. Trust',
    email: 'superadmin@samstrusttech.com',
    role: 'super-admin',
    title: 'Managing Director & Chief Metrologist',
    avatarUrl: '/assets/aistudio/favicon_d10ca84b.jfif',
  },
  'editor': {
    id: 'user-editor-01',
    name: 'Aisha Bello',
    email: 'editor@samstrusttech.com',
    role: 'editor',
    title: 'Senior Technical Marketing & Content Editor',
  },
  'sales-reviewer': {
    id: 'user-sales-01',
    name: 'Chukwuma Eze',
    email: 'sales@samstrusttech.com',
    role: 'sales-reviewer',
    title: 'Commercial Sales & Metrology Estimator',
  },
  'live-desk-agent': {
    id: 'user-livedesk-01',
    name: 'Chioma Okonkwo',
    email: 'livedesk@samstrusttech.com',
    role: 'live-desk-agent',
    title: 'WhatsApp Live Desk & Client Chat Coordinator',
  },
};

export const INITIAL_MANAGED_USERS: ManagedUserAccount[] = [
  {
    id: 'USR-SAM-001',
    fullName: 'Engr. Samuel O. Trust',
    email: 'admin@samstrusttech.com',
    phone: '+234 802 984 4356',
    jobTitle: 'Managing Director & Chief Metrologist',
    department: 'Executive Governance & ISO 17025 Authority',
    organization: 'Samstrust Technologies Limited (RC 9898142)',
    location: 'Head Office, Ikeja, Lagos',
    systemScope: 'Both (CMS & Portal)',
    cmsRole: 'super-admin',
    portalRole: 'portal-admin',
    status: 'Active',
    passwordPlain: 'Samstrust@2026!',
    mustChangePassword: false,
    twoFactorRequired: true,
    customPermissions: [
      'cms.slider.manage',
      'cms.catalog.manage',
      'cms.pages.manage',
      'cms.services.manage',
      'cms.rfq.triage',
      'cms.livedesk.control',
      'cms.users.manage',
      'portal.assets.manage',
      'portal.dispatch.assign',
      'portal.calibration.certify',
      'portal.quotes.approve',
      'portal.rbac.manage',
      'portal.audit.view',
    ],
    createdAt: '2026-01-10',
    lastLoginAt: '2026-10-31 09:15 WAT',
    createdBy: 'System Bootstrap',
  },
  {
    id: 'USR-SAM-002',
    fullName: 'Aisha Bello',
    email: 'editor@samstrusttech.com',
    phone: '+234 803 551 2094',
    jobTitle: 'Senior Technical Marketing & Content Editor',
    department: 'Corporate Communications & Product Documentation',
    organization: 'Samstrust Technologies Limited',
    location: 'Ikeja HQ, Lagos',
    systemScope: 'CMS Only',
    cmsRole: 'editor',
    portalRole: 'none',
    status: 'Active',
    passwordPlain: 'Editor@ChangeMe123!',
    mustChangePassword: false,
    twoFactorRequired: false,
    customPermissions: [
      'cms.slider.manage',
      'cms.catalog.manage',
      'cms.pages.manage',
      'cms.services.manage',
    ],
    createdAt: '2026-02-14',
    lastLoginAt: '2026-10-30 16:40 WAT',
    createdBy: 'Engr. Samuel O. Trust',
  },
  {
    id: 'USR-SAM-003',
    fullName: 'Chukwuma Eze',
    email: 'sales@samstrusttech.com',
    phone: '+234 802 984 4356',
    jobTitle: 'Commercial Sales & Metrology Estimator',
    department: 'Commercial Quotations & Proforma Billing',
    organization: 'Samstrust Technologies Limited',
    location: 'Ikeja Head Office, Lagos',
    systemScope: 'Both (CMS & Portal)',
    cmsRole: 'sales-reviewer',
    portalRole: 'accounts-sales',
    status: 'Active',
    passwordPlain: 'Sales@Samstrust2026',
    mustChangePassword: false,
    twoFactorRequired: true,
    customPermissions: [
      'cms.rfq.triage',
      'cms.livedesk.control',
      'portal.quotes.approve',
      'portal.assets.manage',
    ],
    createdAt: '2026-02-20',
    lastLoginAt: '2026-10-31 08:30 WAT',
    createdBy: 'Engr. Samuel O. Trust',
  },
  {
    id: 'USR-SAM-008',
    fullName: 'Chioma Okonkwo',
    email: 'livedesk@samstrusttech.com',
    phone: '+234 802 984 4356',
    jobTitle: 'WhatsApp Live Desk & Client Chat Coordinator',
    department: 'Customer Support & Instant Technical Triage',
    organization: 'Samstrust Technologies Limited',
    location: 'Ikeja HQ Support Desk, Lagos',
    systemScope: 'Both (CMS & Portal)',
    cmsRole: 'live-desk-agent',
    portalRole: 'coordinator',
    status: 'Active',
    passwordPlain: 'LiveDesk@Samstrust2026',
    mustChangePassword: false,
    twoFactorRequired: false,
    customPermissions: [
      'cms.livedesk.control',
      'cms.rfq.triage',
      'portal.dispatch.assign',
    ],
    createdAt: '2026-03-18',
    lastLoginAt: '2026-10-31 10:05 WAT',
    createdBy: 'Engr. Samuel O. Trust',
  },
  {
    id: 'USR-SAM-004',
    fullName: 'Engr. Amina Suleiman',
    email: 'a.suleiman@samstrusttech.com',
    phone: '+234 809 412 8830',
    jobTitle: 'Service Coordinator • Dispatch & SLA Planner',
    department: 'National Service Operations Desk',
    organization: 'Samstrust Technologies Limited',
    location: 'Ikeja HQ Operations Center, Lagos',
    systemScope: 'Enterprise Portal Only',
    cmsRole: 'none',
    portalRole: 'coordinator',
    status: 'Active',
    passwordPlain: 'Coord@Samstrust2026',
    mustChangePassword: false,
    twoFactorRequired: true,
    customPermissions: [
      'portal.dispatch.assign',
      'portal.assets.manage',
    ],
    createdAt: '2026-03-05',
    lastLoginAt: '2026-10-30 17:15 WAT',
    createdBy: 'Engr. Samuel O. Trust',
  },
  {
    id: 'USR-SAM-005',
    fullName: 'Engr. Nnamdi Okoye',
    email: 'n.okoye@samstrusttech.com',
    phone: '+234 802 984 4356',
    jobTitle: 'Field Service Technician • COREN Metrologist',
    department: 'Field Instrumentation & Calibration Division',
    organization: 'Samstrust Technologies Limited',
    location: 'Lagos & Port Harcourt Mobile Dispatch',
    systemScope: 'Enterprise Portal Only',
    cmsRole: 'none',
    portalRole: 'technician',
    status: 'Active',
    passwordPlain: 'Tech@Samstrust2026',
    mustChangePassword: false,
    twoFactorRequired: true,
    customPermissions: [
      'portal.calibration.certify',
      'portal.assets.manage',
    ],
    createdAt: '2026-03-12',
    lastLoginAt: '2026-10-31 07:50 WAT',
    createdBy: 'Engr. Samuel O. Trust',
  },
  {
    id: 'USR-CLI-006',
    fullName: 'Dr. Chioma Nwachukwu',
    email: 'c.nwachukwu@biozenith.com',
    phone: '+234 802 334 1188',
    jobTitle: 'Director of Quality Assurance',
    department: 'Quality Assurance & Cleanroom Metrology',
    organization: 'BioZenith Pharmaceuticals Ltd',
    location: 'Ikeja Industrial Zone, Lagos',
    systemScope: 'Enterprise Portal Only',
    cmsRole: 'none',
    portalRole: 'customer',
    status: 'Active',
    passwordPlain: 'Client@BioZenith2026',
    mustChangePassword: false,
    twoFactorRequired: false,
    customPermissions: [
      'portal.assets.manage',
      'portal.quotes.approve',
    ],
    createdAt: '2026-04-18',
    lastLoginAt: '2026-10-29 14:10 WAT',
    createdBy: 'Engr. Samuel O. Trust',
  },
];

const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    order: 1,
    active: true,
    tag: 'METROLOGY & WEIGHING EXCELLENCE',
    title: 'Precision Weighing & Metrology Systems',
    subtext: 'High-accuracy analytical balances, microbalances, and industrial floor scales calibrated for uncompromising accuracy and audit compliance.',
    ctaText: 'Explore Weighing Solutions',
    destinationTab: 'products',
    image: '/assets/aistudio/Gemini_Generated_Image_ndqgbpndqgbpndqg__1__500705da.jfif',
    statLabel: 'Readability',
    statValue: '0.0001 g (0.1 mg)',
    specBadge: 'OIML Class I & II',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'slide-2',
    order: 2,
    active: true,
    tag: 'PROCESS FLOW & INDUSTRIAL METERS',
    title: 'Advanced Bioprocess & Fluid Measurement',
    subtext: 'Electromagnetic, turbine, and rotameter flowmeters paired with bioprocess vessels for sterile, bi-directional process control.',
    ctaText: 'View Flow Instrumentation',
    destinationTab: 'products',
    image: '/assets/aistudio/Gemini_Generated_Image_3r09g53r09g53r09_7495901f.jfif',
    statLabel: 'Flow Accuracy',
    statValue: '±0.2% of Reading',
    specBadge: 'HART / Modbus / SIL 2',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'slide-3',
    order: 3,
    active: true,
    tag: 'TURNKEY LABORATORIES & CONSUMABLES',
    title: 'Complete Laboratory Infrastructure & Consumables',
    subtext: 'Centrifuges, spectrophotometers, magnetic stirrers, volumetric glassware, and certified laboratory grade reagents.',
    ctaText: 'Browse Equipment Catalog',
    destinationTab: 'products',
    image: '/assets/aistudio/lab_0a015732.jfif',
    statLabel: 'Cleanroom Standard',
    statValue: 'ISO 14644 & EN 14175',
    specBadge: 'Batch CoA Certified',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
];

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Field Dispatch',
    question: 'What is the turnaround time for on-site calibration across Nigeria?',
    answer: 'For major industrial hubs (Lagos, Ogun, Port Harcourt, Warri, Abuja, and Kaduna), routine on-site metrology dispatches occur within 48 to 72 hours. For emergency shutdowns or uncalibrated critical instrumentation, our Rapid Response Mobile Teams mobilize within 12 hours.',
    order: 1,
    lastUpdated: '2026-02-15',
  },
  {
    id: 'faq-2',
    category: 'Compliance & Quality',
    question: 'Are Samstrust calibration certificates ISO/IEC 17025 accredited and audit-ready?',
    answer: 'Yes. All calibrations executed in our metrology laboratory or via on-site calibrators adhere strictly to ISO/IEC 17025:2017 principles. Certificates provide full traceability chains to National Metrology Institutes (NMIs), including NIST and DKD, with complete measurement uncertainty budgets.',
    order: 2,
    lastUpdated: '2026-02-20',
  },
  {
    id: 'faq-3',
    category: 'Procurement',
    question: 'Can Samstrust supply OEM spare parts and replacement sensors for legacy plant equipment?',
    answer: 'Yes. We maintain direct supply relationships with leading European, Japanese, and American instrumentation manufacturers. Our engineers can cross-reference legacy models and provide drop-in replacements with exact process flanges and digital protocol interfaces (HART, Foundation Fieldbus, Modbus).',
    order: 3,
    lastUpdated: '2026-03-01',
  },
  {
    id: 'faq-4',
    category: 'Billing & Terms',
    question: 'What payment and procurement terms do you offer corporate and institutional clients?',
    answer: 'We accept payments in Nigerian Naira (NGN), United States Dollars (USD), Euros (EUR), and British Pounds (GBP). For pre-qualified corporate clients, we provide commercial credit terms (Net-30 / Milestone-based) backed by formal purchase orders (PO) and corporate guarantees under RC 9898142.',
    order: 4,
    lastUpdated: '2026-03-05',
  },
];

const INITIAL_RFQS: LeadRfqItem[] = [
  {
    id: 'rfq-seed-01',
    refCode: 'RFQ-SAM-2026-8472',
    clientName: 'Alhaji Ibrahim Danjuma',
    clientCompany: 'Northern Grains & Flour Mills Plc',
    clientEmail: 'i.danjuma@northerngrains.ng',
    clientPhone: '+234 803 445 9901',
    deliveryState: 'Kano State',
    deliveryAddress: 'Plot 18, Bompai Industrial Estate, Kano',
    status: 'Quoted',
    assignedEngineer: 'Chukwuma Eze',
    internalNotes: 'Commercial quote issued. CIF Kano with on-site installation and 1-year Gold AMC contract.',
    totalUSD: 13600,
    itemsCount: 2,
    lineItems: [
      {
        id: 'check-01',
        name: 'High-Speed Automated Industrial Checkweigher',
        model: 'ST-CW-INSPECT-300',
        quantity: 2,
        specs: 'Dynamic Accuracy ±0.15 g | SUS304 Frame | Air Jet Rejection',
        unitPriceUSD: 6800,
      },
    ],
    services: {
      fatRequired: true,
      installationRequired: true,
      isoCalibrationRequired: true,
      trainingRequired: true,
      maintenanceSla: 'gold',
      deliveryTimeline: '2-4 Weeks Standard',
    },
    documentsAttached: ['Packaging_Line_3_Layout.dwg', 'NAFDAC_Weights_Audit.pdf'],
    createdAt: '2026-10-22 09:34',
    updatedAt: '2026-10-23 14:15',
  },
  {
    id: 'rfq-seed-02',
    refCode: 'RFQ-SAM-2026-3195',
    clientName: 'Dr. Chioma Nwachukwu',
    clientCompany: 'BioZenith Pharmaceuticals Ltd',
    clientEmail: 'c.nwachukwu@biozenith.com',
    clientPhone: '+234 802 334 1188',
    deliveryState: 'Lagos State',
    deliveryAddress: 'Plot 12, Commercial Ave, Ikeja Industrial Zone',
    status: 'Assigned',
    assignedEngineer: 'Engr. Nnamdi Okoye',
    internalNotes: 'Assigned for site readiness inspection of cleanroom air ducting before VAV hood delivery.',
    totalUSD: 8980,
    itemsCount: 3,
    lineItems: [
      {
        id: 'bal-01',
        name: 'Analytical & Top-Loading Precision Laboratory Balances',
        model: 'ST-LAB-PRECISION-04',
        quantity: 2,
        specs: '0.0001 g Readability | IsoCAL Automatic | GLP/GMP',
        unitPriceUSD: 1890,
      },
      {
        id: 'safe-01',
        name: 'Certified Laboratory Fume Cupboards & Extraction Systems',
        model: 'ST-FUME-VAV-150',
        quantity: 1,
        specs: 'EN 14175-3 | VAV Aerodynamic Sash | 1500mm Width',
        unitPriceUSD: 5200,
      },
    ],
    services: {
      fatRequired: false,
      installationRequired: true,
      isoCalibrationRequired: true,
      trainingRequired: true,
      maintenanceSla: 'platinum',
      deliveryTimeline: 'Immediate Stock (1-3 Days)',
    },
    documentsAttached: ['Cleanroom_GradeB_P&ID.pdf'],
    createdAt: '2026-10-24 11:20',
    updatedAt: '2026-10-24 16:40',
  },
  {
    id: 'rfq-seed-03',
    refCode: 'RFQ-SAM-2026-5820',
    clientName: 'Engr. Babatunde Alabi',
    clientCompany: 'Atlantic Energy & Refining Group',
    clientEmail: 'babatunde.alabi@atlanticenergy.ng',
    clientPhone: '+234 803 777 2200',
    deliveryState: 'Rivers State (Port Harcourt)',
    deliveryAddress: 'Trans-Amadi Port Terminal Tank Farm, Port Harcourt',
    status: 'New',
    assignedEngineer: 'Unassigned',
    internalNotes: 'Urgent turnaround RFQ for custody transfer flowmeter and differential transmitters.',
    totalUSD: 14160,
    itemsCount: 6,
    lineItems: [
      {
        id: 'flow-01',
        name: 'Electromagnetic Industrial Flowmeter',
        model: 'ST-EMF-8000',
        quantity: 4,
        specs: 'DN100 ANSI 300# | Hastelloy C Electrodes | PTFE Liner',
        unitPriceUSD: 2450,
      },
      {
        id: 'tx-01',
        name: 'Smart Differential & Gauge Pressure Transmitters',
        model: 'ST-DPT-400X',
        quantity: 4,
        specs: 'ATEX Zone 1 | HART 7.0 | Monocrystalline Silicon',
        unitPriceUSD: 1180,
      },
    ],
    services: {
      fatRequired: true,
      installationRequired: true,
      isoCalibrationRequired: true,
      trainingRequired: false,
      maintenanceSla: 'platinum',
      deliveryTimeline: 'Critical Plant Shutdown (Expedited Dispatch)',
    },
    documentsAttached: ['Crude_Metering_Specification_Skid.pdf'],
    createdAt: '2026-10-25 08:15',
    updatedAt: '2026-10-25 08:15',
  },
  {
    id: 'rfq-seed-04',
    refCode: 'RFQ-SAM-2026-1049',
    clientName: 'Prof. Adeleke Olatunji',
    clientCompany: 'Federal University Central Science Laboratory',
    clientEmail: 'olatunji.a@feduni.edu.ng',
    clientPhone: '+234 805 112 4433',
    deliveryState: 'Oyo State (Ibadan)',
    deliveryAddress: 'Department of Pure & Applied Chemistry, University Campus',
    status: 'Closed',
    assignedEngineer: 'Chukwuma Eze',
    internalNotes: 'Delivered and commissioned with Class A glassware certificates.',
    totalUSD: 6980,
    itemsCount: 3,
    lineItems: [
      {
        id: 'spectro-01',
        name: 'UV-Visible Double Beam Scanning Spectrophotometer',
        model: 'ST-UV-SCAN-2800',
        quantity: 1,
        specs: '190-1100 nm | 1.0 nm Bandwidth | 21 CFR Part 11',
        unitPriceUSD: 3200,
      },
      {
        id: 'glass-01',
        name: 'Class A Borosilicate Volumetric Glassware & Pipette Suite',
        model: 'ST-GLASS-CLASS-A',
        quantity: 4,
        specs: 'DIN EN ISO 1042 Class A | Borosilicate 3.3',
        unitPriceUSD: 580,
      },
    ],
    services: {
      fatRequired: false,
      installationRequired: true,
      isoCalibrationRequired: true,
      trainingRequired: true,
      maintenanceSla: 'silver',
      deliveryTimeline: '2-4 Weeks Standard',
    },
    documentsAttached: ['Tetfund_Procurement_Award.pdf'],
    createdAt: '2026-09-15 14:00',
    updatedAt: '2026-10-10 11:30',
  },
];

const INITIAL_MEDIA_LIBRARY: MediaAsset[] = [
  {
    id: 'media-preset-1',
    name: 'Industrial Flowmeter Inline',
    url: '/assets/aistudio/Gemini_Generated_Image_3r09g53r09g53r09_7495901f.jfif',
    format: 'JPEG',
    size: 420000,
    formattedSize: '410.2 KB',
    uploadedAt: '2026-10-25',
  },
  {
    id: 'media-preset-2',
    name: 'Pressure Transmitter',
    url: '/assets/aistudio/Gemini_Generated_Image_iokaf4iokaf4ioka_4fcd315d.jfif',
    format: 'JPEG',
    size: 380000,
    formattedSize: '371.1 KB',
    uploadedAt: '2026-10-25',
  },
  {
    id: 'media-preset-3',
    name: 'Analytical Precision Balance',
    url: '/assets/aistudio/Gemini_Generated_Image_ndqgbpndqgbpndqg__1__500705da.jfif',
    format: 'JPEG',
    size: 512000,
    formattedSize: '500.0 KB',
    uploadedAt: '2026-10-25',
  },
  {
    id: 'media-preset-4',
    name: 'VAV Aerodynamic Fume Cupboard',
    url: '/assets/aistudio/Gemini_Generated_Image_kbf03ikbf03ikbf0_ce47ed91.jfif',
    format: 'JPEG',
    size: 445000,
    formattedSize: '434.6 KB',
    uploadedAt: '2026-10-25',
  },
  {
    id: 'media-preset-5',
    name: 'Checkweigher Inspection Conveyor',
    url: '/assets/aistudio/Gemini_Generated_Image_gy7sdvgy7sdvgy7s_3b972440.jfif',
    format: 'JPEG',
    size: 490000,
    formattedSize: '478.5 KB',
    uploadedAt: '2026-10-25',
  },
  {
    id: 'media-preset-6',
    name: 'Certified Laboratory Glassware & Reagents',
    url: '/assets/aistudio/Gemini_Generated_Image_vuu9dcvuu9dcvuu9__1__035e4350.jfif',
    format: 'JPEG',
    size: 460000,
    formattedSize: '449.2 KB',
    uploadedAt: '2026-10-25',
  },
  {
    id: 'media-preset-7',
    name: 'High-Tech Testing Laboratory Suite',
    url: '/assets/aistudio/lab_0a015732.jfif',
    format: 'JPEG',
    size: 610000,
    formattedSize: '595.7 KB',
    uploadedAt: '2026-10-25',
  },
];

export const INITIAL_CATEGORIES: ProductCategoryItem[] = [
  {
    id: 'flowmeters',
    label: 'Flow Measurement',
    description: 'Coriolis, electromagnetic, ultrasonic & vortex flowmeters for industrial liquid and gas custody transfer.',
    order: 1,
    active: true,
  },
  {
    id: 'transmitters',
    label: 'Process Transmitters',
    description: 'Smart differential, gauge pressure, level and temperature transmitters with HART/Modbus protocols.',
    order: 2,
    active: true,
  },
  {
    id: 'balances',
    label: 'Precision Balances',
    description: 'Analytical 0.0001g, micro-weighing, and top-loading precision balances for QA/QC laboratories.',
    order: 3,
    active: true,
  },
  {
    id: 'process-automation',
    label: 'Automation & Checkweighers',
    description: 'Dynamic in-line checkweighers, industrial belt scales, and automated batching control skids.',
    order: 4,
    active: true,
  },
  {
    id: 'safety-cabinets',
    label: 'Safety & Ventilation',
    description: 'Variable Air Volume (VAV) aerodynamic fume cupboards and certified laminar airflow cleanroom hoods.',
    order: 5,
    active: true,
  },
  {
    id: 'gas-detection',
    label: 'Gas Detection',
    description: 'ATEX Zone 1 fixed & portable multi-gas monitors, toxic leak detectors, and hazardous alarm hubs.',
    order: 6,
    active: true,
  },
  {
    id: 'biotech',
    label: 'Biotechnology & PCR',
    description: 'Thermal cyclers, cleanroom incubators, and molecular diagnostic apparatus for life sciences.',
    order: 7,
    active: true,
  },
  {
    id: 'reagents-consumables',
    label: 'Reagents & Glassware',
    description: 'Certified ISO analytical reagents, standard buffer solutions, and ASTM Class A laboratory glassware.',
    order: 8,
    active: true,
  },
];

export const INITIAL_BRAND_PARTNERS: BrandPartnerItem[] = [
  {
    id: 'brand-samstrust',
    name: 'Samstrust Metrology',
    country: 'Nigeria / UK',
    specialty: 'Primary Measurement Standards & Custody Calibration Skids',
    tier: 'Master OEM Partner',
    website: 'https://samstrusttech.com',
    active: true,
  },
  {
    id: 'brand-endress',
    name: 'Endress+Hauser Partner',
    country: 'Germany / Switzerland',
    specialty: 'Coriolis, Ultrasonic & Vortex Process Instrumentation',
    tier: 'Authorized Distributor',
    website: 'https://www.endress.com',
    active: true,
  },
  {
    id: 'brand-mettler',
    name: 'Mettler Toledo Partner',
    country: 'Switzerland',
    specialty: 'Analytical Balances, Titration & Inline Density Meters',
    tier: 'Certified Metrology Channel',
    website: 'https://www.mt.com',
    active: true,
  },
  {
    id: 'brand-sartorius',
    name: 'Sartorius Partner',
    country: 'Germany',
    specialty: 'Micro-Weighing, Ultra-Pure Water & Cleanroom Systems',
    tier: 'Certified Metrology Channel',
    website: 'https://www.sartorius.com',
    active: true,
  },
  {
    id: 'brand-yokogawa',
    name: 'Yokogawa Alliance',
    country: 'Japan',
    specialty: 'DCS Process Automation & DPharp Pressure Transmitters',
    tier: 'Technology Alliance',
    website: 'https://www.yokogawa.com',
    active: true,
  },
  {
    id: 'brand-fisher',
    name: 'Fisher / Emerson Partner',
    country: 'United States',
    specialty: 'Control Valves, Smart Digital Positioners & Regulators',
    tier: 'Authorized Distributor',
    website: 'https://www.emerson.com',
    active: true,
  },
];

export const INITIAL_LIVE_SUPPORT_CONFIG: LiveSupportConfig = {
  whatsappEnabled: true,
  liveChatEnabled: true,
  defaultActiveChannel: 'livechat',
  whatsappNumber: '2348029844356',
  deskTitle: 'Samstrust Live Desk & Chat',
  agentName: 'Engr. Nnamdi Okoye',
  agentTitle: 'On-Duty Metrology & Sales Engineer',
  agentStatusText: 'Online • Responds in < 2 mins',
  welcomeMessage:
    'Hello! Welcome to Samstrust Technologies Limited (RC 9898142). How can our engineering and ISO/IEC 17025 calibration desk assist your facility today?',
  autoReplyMessage:
    'Thank you for messaging Samstrust Live Desk! Our on-duty metrology engineer has received your message. You can continue chatting here in real time or switch to WhatsApp Direct at any moment.',
  offlineNoticeMessage:
    'Our live desk is currently attending to field dispatches. Leave your message and email below for priority follow-up.',
  position: 'bottom-right',
  showOnMobile: true,
  quickPrompts: [
    'Request formal quotation for equipment',
    'Book emergency ISO 17025 calibration',
    'Inquire about Annual Maintenance Contract (AMC)',
    'Check immediate stock for laboratory reagents',
  ],
};

export const INITIAL_LIVE_CHAT_SESSIONS: LiveChatSession[] = [
  {
    id: 'CHAT-SAM-101',
    visitorName: 'Engr. Kunle Adeyemi',
    visitorEmail: 'k.adeyemi@biozenith.com',
    visitorCompany: 'BioZenith Pharmaceuticals Ltd',
    visitorPhone: '+234 803 910 4421',
    status: 'Active',
    unreadByAdmin: 1,
    createdAt: '2026-10-31 10:15 WAT',
    updatedAt: '2026-10-31 10:18 WAT',
    messages: [
      {
        id: 'msg-1',
        sender: 'agent',
        senderName: 'Engr. Nnamdi Okoye',
        text: 'Hello! Welcome to Samstrust Technologies Limited (RC 9898142). How can our engineering and ISO/IEC 17025 calibration desk assist your facility today?',
        timestamp: '10:15 WAT',
      },
      {
        id: 'msg-2',
        sender: 'visitor',
        senderName: 'Engr. Kunle Adeyemi',
        text: 'Good morning, we need urgent on-site calibration for two analytical balances (0.1mg) and one VAV fume hood at our Sagamu sterile plant next week.',
        timestamp: '10:18 WAT',
      },
    ],
  },
];

interface CmsContextType {
  // Auth
  currentUser: CmsUser | null;
  loginAs: (role: CmsRole) => void;
  loginAsManagedUser: (user: ManagedUserAccount) => void;
  logout: () => void;
  canEditContent: boolean;
  canManageSales: boolean;
  canManageLiveDesk: boolean;
  isSuperAdmin: boolean;

  // Managed Users & Role Administration
  managedUsers: ManagedUserAccount[];
  addManagedUser: (user: Omit<ManagedUserAccount, 'id' | 'createdAt'>) => ManagedUserAccount;
  updateManagedUser: (user: ManagedUserAccount) => void;
  deleteManagedUser: (id: string) => void;
  assignUserRoles: (
    id: string,
    cmsRole: CmsRole | 'none',
    portalRole: PortalRole | 'none',
    systemScope?: SystemAccessScope
  ) => void;
  toggleUserLiveDeskControl: (id: string) => void;
  toggleManagedUserStatus: (id: string, nextStatus?: UserAccountStatus) => void;
  resetManagedUserPassword: (
    id: string,
    newPasswordPlain: string,
    mustChangePassword: boolean
  ) => void;

  // Media Library (Images: PNG, JPG, JPEG, TIFF)
  mediaLibrary: MediaAsset[];
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'uploadedAt'>) => MediaAsset;
  deleteMediaAsset: (id: string) => void;

  // Hero Slides
  heroSlides: HeroSlide[];
  addSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateSlide: (slide: HeroSlide) => void;
  deleteSlide: (id: string) => void;
  moveSlideOrder: (id: string, direction: 'up' | 'down') => void;

  // Products
  products: ProductItem[];
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  updateProduct: (product: ProductItem) => void;
  deleteProduct: (id: string) => void;

  // Categories Setup
  categories: ProductCategoryItem[];
  addCategory: (category: Omit<ProductCategoryItem, 'order'>) => void;
  updateCategory: (category: ProductCategoryItem) => void;
  deleteCategory: (id: string) => void;

  // Brands / OEM Partner Setup
  brands: string[];
  addBrand: (brand: string) => void;
  brandPartners: BrandPartnerItem[];
  addBrandPartner: (brand: Omit<BrandPartnerItem, 'id'>) => void;
  updateBrandPartner: (brand: BrandPartnerItem) => void;
  deleteBrandPartner: (id: string) => void;

  // Services
  services: ServiceItem[];
  updateService: (service: ServiceItem) => void;

  // FAQs
  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id' | 'lastUpdated'>) => void;
  updateFaq: (faq: FaqItem) => void;
  deleteFaq: (id: string) => void;

  // RFQ Pipeline
  rfqLeads: LeadRfqItem[];
  addRfqLead: (lead: Omit<LeadRfqItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLeadStatus: (id: string, status: LeadRfqStatus) => void;
  updateLeadNotes: (id: string, notes: string, assignedEngineer?: string) => void;
  exportLeadsToCsv: (leadsToExport?: LeadRfqItem[]) => void;

  // Editable Pages Content
  aboutContent: AboutPageContent;
  updateAboutContent: (content: Partial<AboutPageContent>) => void;
  servicesContent: ServicesPageContent;
  updateServicesContent: (content: Partial<ServicesPageContent>) => void;
  industriesContent: IndustriesPageContent;
  updateIndustriesContent: (content: Partial<IndustriesPageContent>) => void;
  contactContent: ContactPageContent;
  updateContactContent: (content: Partial<ContactPageContent>) => void;
  resetPageContentToDefault: (page: 'about' | 'services' | 'industries' | 'contact' | 'all') => void;

  // Custom Pages / Subpages
  subpages: CustomSubpage[];
  addSubpage: (subpage: Omit<CustomSubpage, 'id' | 'lastUpdated'>) => void;
  updateSubpage: (subpage: CustomSubpage) => void;
  deleteSubpage: (id: string) => void;
  duplicateSubpage: (id: string) => void;
  reorderSubpages: (startIndex: number, endIndex: number) => void;
  setSubpagesList: (newSubpages: CustomSubpage[]) => void;

  // WhatsApp Live Desk & On-Site Live Chat Control
  liveSupportConfig: LiveSupportConfig;
  updateLiveSupportConfig: (partial: Partial<LiveSupportConfig>) => void;
  liveChatSessions: LiveChatSession[];
  sendVisitorChatMessage: (payload: {
    sessionId?: string;
    visitorName: string;
    visitorEmail: string;
    visitorCompany: string;
    visitorPhone?: string;
    text: string;
  }) => LiveChatSession;
  sendAdminChatReply: (sessionId: string, replyText: string, agentName?: string) => void;
  markChatSessionRead: (sessionId: string) => void;
  updateChatSessionStatus: (sessionId: string, status: 'Active' | 'Resolved') => void;
  deleteChatSession: (sessionId: string) => void;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Managed Users Directory (CMS + Enterprise Portal Roles)
  const [managedUsers, setManagedUsers] = useState<ManagedUserAccount[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_managed_users');
      return stored ? JSON.parse(stored) : INITIAL_MANAGED_USERS;
    } catch {
      return INITIAL_MANAGED_USERS;
    }
  });

  // Live Support Config (WhatsApp Live Desk + Live Chat)
  const [liveSupportConfig, setLiveSupportConfig] = useState<LiveSupportConfig>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_live_support_config');
      return stored ? { ...INITIAL_LIVE_SUPPORT_CONFIG, ...JSON.parse(stored) } : INITIAL_LIVE_SUPPORT_CONFIG;
    } catch {
      return INITIAL_LIVE_SUPPORT_CONFIG;
    }
  });

  // Live Chat Sessions
  const [liveChatSessions, setLiveChatSessions] = useState<LiveChatSession[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_live_chats');
      return stored ? JSON.parse(stored) : INITIAL_LIVE_CHAT_SESSIONS;
    } catch {
      return INITIAL_LIVE_CHAT_SESSIONS;
    }
  });

  // Media Library (Images: PNG, JPG, JPEG, TIFF)
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_media_library');
      return stored ? JSON.parse(stored) : INITIAL_MEDIA_LIBRARY;
    } catch {
      return INITIAL_MEDIA_LIBRARY;
    }
  });

  // Hero Slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_slides');
      return stored ? JSON.parse(stored) : INITIAL_HERO_SLIDES;
    } catch {
      return INITIAL_HERO_SLIDES;
    }
  });

  // Products
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_products');
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories Setup
  const [categories, setCategories] = useState<ProductCategoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_categories');
      return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Brands & Brand / OEM Partners Setup
  const [brandPartners, setBrandPartners] = useState<BrandPartnerItem[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_brand_partners');
      return stored ? JSON.parse(stored) : INITIAL_BRAND_PARTNERS;
    } catch {
      return INITIAL_BRAND_PARTNERS;
    }
  });

  const [brands, setBrands] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_brands');
      if (stored) return JSON.parse(stored);
      return INITIAL_BRAND_PARTNERS.map((b) => b.name);
    } catch {
      return INITIAL_BRAND_PARTNERS.map((b) => b.name);
    }
  });

  // Services
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_services');
      return stored ? JSON.parse(stored) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  // FAQs
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_faqs');
      return stored ? JSON.parse(stored) : INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  });

  // RFQ Pipeline
  const [rfqLeads, setRfqLeads] = useState<LeadRfqItem[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_rfqs');
      return stored ? JSON.parse(stored) : INITIAL_RFQS;
    } catch {
      return INITIAL_RFQS;
    }
  });

  // Editable Pages Content
  const [aboutContent, setAboutContent] = useState<AboutPageContent>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_about');
      return stored ? JSON.parse(stored) : INITIAL_ABOUT_CONTENT;
    } catch {
      return INITIAL_ABOUT_CONTENT;
    }
  });

  const [servicesContent, setServicesContent] = useState<ServicesPageContent>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_services_page');
      return stored ? JSON.parse(stored) : INITIAL_SERVICES_PAGE_CONTENT;
    } catch {
      return INITIAL_SERVICES_PAGE_CONTENT;
    }
  });

  const [industriesContent, setIndustriesContent] = useState<IndustriesPageContent>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_industries_page');
      return stored ? JSON.parse(stored) : INITIAL_INDUSTRIES_PAGE_CONTENT;
    } catch {
      return INITIAL_INDUSTRIES_PAGE_CONTENT;
    }
  });

  const [contactContent, setContactContent] = useState<ContactPageContent>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_contact');
      return stored ? JSON.parse(stored) : INITIAL_CONTACT_CONTENT;
    } catch {
      return INITIAL_CONTACT_CONTENT;
    }
  });

  const [subpages, setSubpages] = useState<CustomSubpage[]>(() => {
    try {
      const stored = localStorage.getItem('samstrust_cms_subpages');
      const seededV2 = localStorage.getItem('samstrust_about_subpages_seeded_v1');
      if (stored) {
        const parsed: CustomSubpage[] = JSON.parse(stored);
        if (!seededV2) {
          const existingIds = new Set(parsed.map((p) => p.id));
          const existingSlugs = new Set(parsed.map((p) => p.slug));
          const missing = INITIAL_SUBPAGES.filter(
            (initPage) => !existingIds.has(initPage.id) && !existingSlugs.has(initPage.slug)
          );
          const merged = [...missing, ...parsed].map((item, idx) => ({
            ...item,
            order: idx + 1,
          }));
          localStorage.setItem('samstrust_about_subpages_seeded_v1', 'true');
          localStorage.setItem('samstrust_cms_subpages', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
      localStorage.setItem('samstrust_about_subpages_seeded_v1', 'true');
      return INITIAL_SUBPAGES;
    } catch {
      return INITIAL_SUBPAGES;
    }
  });

  // Save to localStorage on state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('samstrust_cms_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('samstrust_cms_user');
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('samstrust_cms_media_library', JSON.stringify(mediaLibrary));
    } catch (e) {
      console.warn('Failed to persist media library to localStorage', e);
    }
  }, [mediaLibrary]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_brand_partners', JSON.stringify(brandPartners));
  }, [brandPartners]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_faqs', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_rfqs', JSON.stringify(rfqLeads));
  }, [rfqLeads]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_about', JSON.stringify(aboutContent));
  }, [aboutContent]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_services_page', JSON.stringify(servicesContent));
  }, [servicesContent]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_industries_page', JSON.stringify(industriesContent));
  }, [industriesContent]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_contact', JSON.stringify(contactContent));
  }, [contactContent]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_subpages', JSON.stringify(subpages));
  }, [subpages]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_managed_users', JSON.stringify(managedUsers));
  }, [managedUsers]);

  // Auth functions
  const loginAs = (role: CmsRole) => {
    const user = DEMO_CMS_USERS[role];
    setCurrentUser(user);
  };

  const loginAsManagedUser = (account: ManagedUserAccount) => {
    const effectiveRole: CmsRole =
      account.cmsRole !== 'none'
        ? account.cmsRole
        : account.portalRole === 'portal-admin'
        ? 'super-admin'
        : account.portalRole === 'accounts-sales'
        ? 'sales-reviewer'
        : 'editor';

    setCurrentUser({
      id: account.id,
      name: account.fullName,
      email: account.email,
      role: effectiveRole,
      title: account.jobTitle,
    });

    const nowStr = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT';
    setManagedUsers((prev) =>
      prev.map((u) => (u.id === account.id ? { ...u, lastLoginAt: nowStr } : u))
    );
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isSuperAdmin = currentUser?.role === 'super-admin';
  const canEditContent = isSuperAdmin || currentUser?.role === 'editor';
  const canManageSales =
    isSuperAdmin ||
    currentUser?.role === 'sales-reviewer' ||
    currentUser?.role === 'live-desk-agent';

  const activeManagedRecord = currentUser
    ? managedUsers.find(
        (u) =>
          u.id === currentUser.id ||
          u.email.toLowerCase() === currentUser.email.toLowerCase()
      )
    : undefined;

  const canManageLiveDesk = Boolean(
    isSuperAdmin ||
      currentUser?.role === 'live-desk-agent' ||
      currentUser?.role === 'sales-reviewer' ||
      activeManagedRecord?.customPermissions?.includes('cms.livedesk.control')
  );

  // Managed Users & Role Administration CRUD
  const addManagedUser = (
    userData: Omit<ManagedUserAccount, 'id' | 'createdAt'>
  ): ManagedUserAccount => {
    const newUser: ManagedUserAccount = {
      ...userData,
      id: `USR-${userData.portalRole === 'customer' ? 'CLI' : 'SAM'}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.name || 'System Administrator',
    };
    setManagedUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateManagedUser = (updated: ManagedUserAccount) => {
    setManagedUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser && currentUser.id === updated.id && updated.cmsRole !== 'none') {
      setCurrentUser({
        id: updated.id,
        name: updated.fullName,
        email: updated.email,
        role: updated.cmsRole,
        title: updated.jobTitle,
      });
    }
  };

  const deleteManagedUser = (id: string) => {
    setManagedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const assignUserRoles = (
    id: string,
    cmsRole: CmsRole | 'none',
    portalRole: PortalRole | 'none',
    systemScope?: SystemAccessScope
  ) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const resolvedScope: SystemAccessScope =
          systemScope ||
          (cmsRole !== 'none' && portalRole !== 'none'
            ? 'Both (CMS & Portal)'
            : cmsRole !== 'none'
            ? 'CMS Only'
            : 'Enterprise Portal Only');
        const nextPerms = new Set(u.customPermissions || []);
        if (
          cmsRole === 'live-desk-agent' ||
          cmsRole === 'super-admin' ||
          portalRole === 'portal-admin'
        ) {
          nextPerms.add('cms.livedesk.control');
        }
        return {
          ...u,
          cmsRole,
          portalRole,
          systemScope: resolvedScope,
          customPermissions: Array.from(nextPerms),
        };
      })
    );
  };

  const toggleUserLiveDeskControl = (id: string) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const currentPerms = u.customPermissions || [];
        const hasLiveDesk =
          currentPerms.includes('cms.livedesk.control') ||
          u.cmsRole === 'live-desk-agent';

        if (hasLiveDesk) {
          const nextPerms = currentPerms.filter((p) => p !== 'cms.livedesk.control');
          const nextCmsRole: CmsRole | 'none' =
            u.cmsRole === 'live-desk-agent' ? 'editor' : u.cmsRole;
          return {
            ...u,
            cmsRole: nextCmsRole,
            customPermissions: nextPerms,
          };
        } else {
          const nextPerms = Array.from(
            new Set([...currentPerms, 'cms.livedesk.control'])
          );
          const nextCmsRole: CmsRole =
            u.cmsRole === 'none' ? 'live-desk-agent' : u.cmsRole;
          const nextScope: SystemAccessScope =
            u.portalRole !== 'none' ? 'Both (CMS & Portal)' : 'CMS Only';
          return {
            ...u,
            cmsRole: nextCmsRole,
            systemScope: nextScope,
            customPermissions: nextPerms,
          };
        }
      })
    );
  };

  const toggleManagedUserStatus = (id: string, nextStatus?: UserAccountStatus) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const status: UserAccountStatus =
          nextStatus || (u.status === 'Active' ? 'Suspended' : 'Active');
        return { ...u, status };
      })
    );
  };

  const resetManagedUserPassword = (
    id: string,
    newPasswordPlain: string,
    mustChangePassword: boolean
  ) => {
    setManagedUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              passwordPlain: newPasswordPlain,
              mustChangePassword,
            }
          : u
      )
    );
  };

  // Media Library Management (PNG, JPG, JPEG, TIFF)
  const addMediaAsset = (assetData: Omit<MediaAsset, 'id' | 'uploadedAt'>): MediaAsset => {
    const newAsset: MediaAsset = {
      ...assetData,
      id: `media-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setMediaLibrary((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  const deleteMediaAsset = (id: string) => {
    setMediaLibrary((prev) => prev.filter((item) => item.id !== id));
  };

  // Hero Slide Management
  const addSlide = (slideData: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...slideData,
      id: `slide-${Date.now()}`,
    };
    setHeroSlides((prev) => [...prev, newSlide]);
  };

  const updateSlide = (updated: HeroSlide) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSlide = (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSlideOrder = (id: string, direction: 'up' | 'down') => {
    setHeroSlides((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const newSlides = [...prev];
      const temp = newSlides[index];
      newSlides[index] = newSlides[targetIndex];
      newSlides[targetIndex] = temp;

      // Re-index order property
      return newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  };

  // Products Management
  const addProduct = (productData: Omit<ProductItem, 'id'>) => {
    const newProduct: ProductItem = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updated: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Categories Management
  const addCategory = (catData: Omit<ProductCategoryItem, 'order'>) => {
    const slug = catData.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newCat: ProductCategoryItem = {
      ...catData,
      id: slug,
      order: categories.length + 1,
      active: catData.active ?? true,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (updated: ProductCategoryItem) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Brand / OEM Partner Management
  const addBrandPartner = (brandData: Omit<BrandPartnerItem, 'id'>) => {
    const newPartner: BrandPartnerItem = {
      ...brandData,
      id: `brand-${Date.now()}`,
    };
    setBrandPartners((prev) => [...prev, newPartner]);
    if (!brands.includes(brandData.name)) {
      setBrands((prev) => [...prev, brandData.name]);
    }
  };

  const updateBrandPartner = (updated: BrandPartnerItem) => {
    setBrandPartners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setBrands((prev) => {
      const exists = prev.includes(updated.name);
      return exists ? prev : [...prev, updated.name];
    });
  };

  const deleteBrandPartner = (id: string) => {
    const target = brandPartners.find((b) => b.id === id);
    setBrandPartners((prev) => prev.filter((b) => b.id !== id));
    if (target) {
      setBrands((prev) => prev.filter((b) => b !== target.name));
    }
  };

  const addBrand = (brand: string) => {
    if (!brands.includes(brand)) {
      setBrands((prev) => [...prev, brand]);
      const newPartner: BrandPartnerItem = {
        id: `brand-${Date.now()}`,
        name: brand,
        country: 'Global OEM',
        specialty: 'Process & Metrology Instrumentation',
        tier: 'Certified Metrology Channel',
        active: true,
      };
      setBrandPartners((prev) => [...prev, newPartner]);
    }
  };

  // Services Management
  const updateService = (updated: ServiceItem) => {
    setServices((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? updated : s));
      setServicesContent((sPrev) => ({ ...sPrev, services: next }));
      return next;
    });
  };

  // Editable Public Pages Content Management
  const updateAboutContent = (partial: Partial<AboutPageContent>) => {
    setAboutContent((prev) => ({ ...prev, ...partial }));
  };

  const updateServicesContent = (partial: Partial<ServicesPageContent>) => {
    setServicesContent((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.services) {
        setServices(partial.services);
      }
      return updated;
    });
  };

  const updateIndustriesContent = (partial: Partial<IndustriesPageContent>) => {
    setIndustriesContent((prev) => ({ ...prev, ...partial }));
  };

  const updateContactContent = (partial: Partial<ContactPageContent>) => {
    setContactContent((prev) => ({ ...prev, ...partial }));
  };

  const resetPageContentToDefault = (
    page: 'about' | 'services' | 'industries' | 'contact' | 'all'
  ) => {
    if (page === 'about' || page === 'all') {
      setAboutContent(INITIAL_ABOUT_CONTENT);
      localStorage.setItem('samstrust_cms_about', JSON.stringify(INITIAL_ABOUT_CONTENT));
    }
    if (page === 'services' || page === 'all') {
      setServicesContent(INITIAL_SERVICES_PAGE_CONTENT);
      setServices(INITIAL_SERVICES);
      localStorage.setItem(
        'samstrust_cms_services_page',
        JSON.stringify(INITIAL_SERVICES_PAGE_CONTENT)
      );
      localStorage.setItem('samstrust_cms_services', JSON.stringify(INITIAL_SERVICES));
    }
    if (page === 'industries' || page === 'all') {
      setIndustriesContent(INITIAL_INDUSTRIES_PAGE_CONTENT);
      localStorage.setItem(
        'samstrust_cms_industries_page',
        JSON.stringify(INITIAL_INDUSTRIES_PAGE_CONTENT)
      );
    }
    if (page === 'contact' || page === 'all') {
      setContactContent(INITIAL_CONTACT_CONTENT);
      localStorage.setItem('samstrust_cms_contact', JSON.stringify(INITIAL_CONTACT_CONTENT));
    }
  };

  // Custom Subpages Management
  const addSubpage = (subpageData: Omit<CustomSubpage, 'id' | 'lastUpdated'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newSubpage: CustomSubpage = {
      ...subpageData,
      id: `subpage-${Date.now()}`,
      lastUpdated: today,
    };
    setSubpages((prev) => [...prev, newSubpage]);
  };

  const updateSubpage = (updated: CustomSubpage) => {
    const today = new Date().toISOString().split('T')[0];
    setSubpages((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...updated, lastUpdated: today } : s))
    );
  };

  const deleteSubpage = (id: string) => {
    setSubpages((prev) => prev.filter((s) => s.id !== id));
  };

  const duplicateSubpage = (id: string) => {
    const target = subpages.find((s) => s.id === id);
    if (!target) return;
    const today = new Date().toISOString().split('T')[0];
    const duplicate: CustomSubpage = {
      ...target,
      id: `subpage-${Date.now()}`,
      title: `${target.title} (Copy)`,
      slug: `${target.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      published: false,
      lastUpdated: today,
    };
    setSubpages((prev) => [...prev, duplicate]);
  };

  const reorderSubpages = (startIndex: number, endIndex: number) => {
    setSubpages((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const setSubpagesList = (newSubpages: CustomSubpage[]) => {
    setSubpages(newSubpages.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  // FAQs Management
  const addFaq = (faqData: Omit<FaqItem, 'id' | 'lastUpdated'>) => {
    const newFaq: FaqItem = {
      ...faqData,
      id: `faq-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setFaqs((prev) => [...prev, newFaq]);
  };

  const updateFaq = (updated: FaqItem) => {
    setFaqs((prev) =>
      prev.map((f) =>
        f.id === updated.id
          ? { ...updated, lastUpdated: new Date().toISOString().split('T')[0] }
          : f
      )
    );
  };

  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  // RFQ Pipeline Management
  const addRfqLead = (leadData: Omit<LeadRfqItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    const newLead: LeadRfqItem = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setRfqLeads((prev) => [newLead, ...prev]);
  };

  const updateLeadStatus = (id: string, status: LeadRfqStatus) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    setRfqLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status, updatedAt: now } : lead))
    );
  };

  const updateLeadNotes = (id: string, notes: string, assignedEngineer?: string) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    setRfqLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              internalNotes: notes,
              assignedEngineer: assignedEngineer !== undefined ? assignedEngineer : lead.assignedEngineer,
              updatedAt: now,
            }
          : lead
      )
    );
  };

  // One-Click Export to CSV / Excel
  const exportLeadsToCsv = (leadsToExport?: LeadRfqItem[]) => {
    const data = leadsToExport || rfqLeads;
    if (data.length === 0) return;

    const headers = [
      'Reference Code',
      'Date Submitted',
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Delivery State',
      'Delivery Address',
      'Status',
      'Assigned Engineer',
      'Items Count',
      'Total Value (USD)',
      'Line Items Breakdown',
      'Services Required',
      'Attached Documents',
      'Internal Commercial Notes',
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = data.map((lead) => {
      const lineItemsSummary = lead.lineItems
        .map((item) => `${item.name} [${item.model}] (Qty: ${item.quantity})`)
        .join('; ');

      const servicesSummary = [
        lead.services.fatRequired ? 'FAT Witness' : null,
        lead.services.installationRequired ? 'Installation' : null,
        lead.services.isoCalibrationRequired ? 'ISO 17025 Cert' : null,
        lead.services.trainingRequired ? 'Operator Training' : null,
        `SLA: ${lead.services.maintenanceSla}`,
        `Timeline: ${lead.services.deliveryTimeline}`,
      ]
        .filter(Boolean)
        .join(', ');

      const docsSummary = lead.documentsAttached.join(', ');

      return [
        escapeCsv(lead.refCode),
        escapeCsv(lead.createdAt),
        escapeCsv(lead.clientCompany),
        escapeCsv(lead.clientName),
        escapeCsv(lead.clientEmail),
        escapeCsv(lead.clientPhone),
        escapeCsv(lead.deliveryState),
        escapeCsv(lead.deliveryAddress),
        escapeCsv(lead.status),
        escapeCsv(lead.assignedEngineer || 'Unassigned'),
        escapeCsv(lead.itemsCount),
        escapeCsv(lead.totalUSD),
        escapeCsv(lineItemsSummary),
        escapeCsv(servicesSummary),
        escapeCsv(docsSummary),
        escapeCsv(lead.internalNotes || ''),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Samstrust_RFQ_Pipeline_Export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Persist Live Support Config & Chat Sessions
  useEffect(() => {
    localStorage.setItem('samstrust_cms_live_support_config', JSON.stringify(liveSupportConfig));
  }, [liveSupportConfig]);

  useEffect(() => {
    localStorage.setItem('samstrust_cms_live_chats', JSON.stringify(liveChatSessions));
  }, [liveChatSessions]);

  const updateLiveSupportConfig = (partial: Partial<LiveSupportConfig>) => {
    setLiveSupportConfig((prev) => ({ ...prev, ...partial }));
  };

  const sendVisitorChatMessage = (payload: {
    sessionId?: string;
    visitorName: string;
    visitorEmail: string;
    visitorCompany: string;
    visitorPhone?: string;
    text: string;
  }): LiveChatSession => {
    const nowTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    }) + ' WAT';
    const nowFull = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT';

    const visitorMsg: LiveChatMessage = {
      id: `msg-${Date.now()}-v`,
      sender: 'visitor',
      senderName: payload.visitorName || 'Website Visitor',
      text: payload.text,
      timestamp: nowTime,
    };

    const existing = payload.sessionId
      ? liveChatSessions.find((s) => s.id === payload.sessionId)
      : null;

    if (existing) {
      const updatedSession: LiveChatSession = {
        ...existing,
        visitorName: payload.visitorName || existing.visitorName,
        visitorEmail: payload.visitorEmail || existing.visitorEmail,
        visitorCompany: payload.visitorCompany || existing.visitorCompany,
        visitorPhone: payload.visitorPhone || existing.visitorPhone,
        status: 'Active',
        unreadByAdmin: existing.unreadByAdmin + 1,
        updatedAt: nowFull,
        messages: [...existing.messages, visitorMsg],
      };
      setLiveChatSessions((prev) =>
        prev.map((s) => (s.id === existing.id ? updatedSession : s))
      );
      return updatedSession;
    }

    const welcomeMsg: LiveChatMessage = {
      id: `msg-${Date.now()}-w`,
      sender: 'agent',
      senderName: liveSupportConfig.agentName,
      text: liveSupportConfig.welcomeMessage,
      timestamp: nowTime,
    };

    const autoReplyMsg: LiveChatMessage = {
      id: `msg-${Date.now()}-a`,
      sender: 'agent',
      senderName: liveSupportConfig.agentName,
      text: liveSupportConfig.autoReplyMessage,
      timestamp: nowTime,
    };

    const newSession: LiveChatSession = {
      id: `CHAT-SAM-${Math.floor(100 + Math.random() * 900)}`,
      visitorName: payload.visitorName || 'Facility Visitor',
      visitorEmail: payload.visitorEmail || 'visitor@company.ng',
      visitorCompany: payload.visitorCompany || 'Industrial Client',
      visitorPhone: payload.visitorPhone || '',
      status: 'Active',
      unreadByAdmin: 1,
      createdAt: nowFull,
      updatedAt: nowFull,
      messages: [welcomeMsg, visitorMsg, autoReplyMsg],
    };

    setLiveChatSessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  const sendAdminChatReply = (
    sessionId: string,
    replyText: string,
    agentName?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    }) + ' WAT';
    const nowFull = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT';

    const replyMsg: LiveChatMessage = {
      id: `msg-${Date.now()}-adm`,
      sender: 'agent',
      senderName: agentName || currentUser?.name || liveSupportConfig.agentName,
      text: replyText,
      timestamp: nowTime,
    };

    setLiveChatSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              unreadByAdmin: 0,
              updatedAt: nowFull,
              messages: [...s.messages, replyMsg],
            }
          : s
      )
    );
  };

  const markChatSessionRead = (sessionId: string) => {
    setLiveChatSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, unreadByAdmin: 0 } : s))
    );
  };

  const updateChatSessionStatus = (
    sessionId: string,
    status: 'Active' | 'Resolved'
  ) => {
    setLiveChatSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status, unreadByAdmin: 0 } : s))
    );
  };

  const deleteChatSession = (sessionId: string) => {
    setLiveChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <CmsContext.Provider
      value={{
        currentUser,
        loginAs,
        loginAsManagedUser,
        logout,
        canEditContent,
        canManageSales,
        canManageLiveDesk,
        isSuperAdmin,
        managedUsers,
        addManagedUser,
        updateManagedUser,
        deleteManagedUser,
        assignUserRoles,
        toggleUserLiveDeskControl,
        toggleManagedUserStatus,
        resetManagedUserPassword,
        mediaLibrary,
        addMediaAsset,
        deleteMediaAsset,
        heroSlides,
        addSlide,
        updateSlide,
        deleteSlide,
        moveSlideOrder,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        brands,
        addBrand,
        brandPartners,
        addBrandPartner,
        updateBrandPartner,
        deleteBrandPartner,
        services,
        updateService,
        faqs,
        addFaq,
        updateFaq,
        deleteFaq,
        rfqLeads,
        addRfqLead,
        updateLeadStatus,
        updateLeadNotes,
        exportLeadsToCsv,
        aboutContent,
        updateAboutContent,
        servicesContent,
        updateServicesContent,
        industriesContent,
        updateIndustriesContent,
        contactContent,
        updateContactContent,
        resetPageContentToDefault,
        subpages,
        addSubpage,
        updateSubpage,
        deleteSubpage,
        duplicateSubpage,
        reorderSubpages,
        setSubpagesList,
        liveSupportConfig,
        updateLiveSupportConfig,
        liveChatSessions,
        sendVisitorChatMessage,
        sendAdminChatReply,
        markChatSessionRead,
        updateChatSessionStatus,
        deleteChatSession,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
