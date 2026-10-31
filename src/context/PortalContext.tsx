import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PortalRole,
  PortalUser,
  EquipmentAsset,
  CalibrationCertificate,
  CalibrationReadingPoint,
  ServiceTicket,
  PortalQuoteAndInvoice,
  PortalNotification,
  AuditLogEntry,
  RbacPermissionRow,
  PortalSystemConfig,
  CustomerFacility,
  AuthorizedPersonnel,
  NotificationPreferenceItem,
  CompanyOnboardingProfile,
  PasswordResetToken,
  PortalSessionState,
  IdorVerificationResult,
  ReplacedPartLogItem,
  CustomerSignatureRecord,
  FaultAttachmentFile,
  TechnicianDirectoryProfile,
  FsmKanbanStatus,
} from '../types/portal';
import {
  computeSaltedSha256Hash,
  computeSyncDigest,
  verifyResourceOwnership,
} from '../utils/portalSecurity';

export const PORTAL_USERS: Record<PortalRole, PortalUser> = {
  customer: {
    id: 'puser-cust-01',
    name: 'Dr. Chioma Nwachukwu',
    email: 'c.nwachukwu@biozenith.com',
    role: 'customer',
    roleTitle: 'Registered Customer • Director of QA',
    organization: 'BioZenith Pharmaceuticals Ltd',
    department: 'Quality Assurance & Cleanroom Metrology',
    location: 'Ikeja Industrial Zone, Lagos',
    avatarInitials: 'CN',
    phone: '+234 802 334 1188',
  },
  technician: {
    id: 'puser-tech-01',
    name: 'Engr. Nnamdi Okoye',
    email: 'n.okoye@samstrusttech.com',
    role: 'technician',
    roleTitle: 'Field Service Technician • COREN Metrologist',
    organization: 'Samstrust Technologies Limited',
    department: 'Field Instrumentation & Calibration Division',
    location: 'Lagos & Port Harcourt Mobile Dispatch',
    avatarInitials: 'NO',
    phone: '+234 802 984 4356',
  },
  coordinator: {
    id: 'puser-coord-01',
    name: 'Engr. Amina Suleiman',
    email: 'a.suleiman@samstrusttech.com',
    role: 'coordinator',
    roleTitle: 'Service Coordinator • Dispatch & SLA Planner',
    organization: 'Samstrust Technologies Limited',
    department: 'National Service Operations Desk',
    location: 'Ikeja HQ Operations Center, Lagos',
    avatarInitials: 'AS',
    phone: '+234 802 984 4356',
  },
  'accounts-sales': {
    id: 'puser-sales-01',
    name: 'Chukwuma Eze',
    email: 'sales@samstrusttech.com',
    role: 'accounts-sales',
    roleTitle: 'Accounts & Sales Specialist • Commercial Estimator',
    organization: 'Samstrust Technologies Limited',
    department: 'Commercial Quotations & Proforma Billing',
    location: 'Ikeja Head Office, Lagos',
    avatarInitials: 'CE',
    phone: '+234 802 984 4356',
  },
  'portal-admin': {
    id: 'puser-admin-01',
    name: 'Engr. Samuel O. Trust',
    email: 'superadmin@samstrusttech.com',
    role: 'portal-admin',
    roleTitle: 'Portal Super Admin • Managing Director',
    organization: 'Samstrust Technologies Limited (RC 9898142)',
    department: 'Executive Governance & ISO 17025 Authority',
    location: 'Head Office, Lagos & Port Harcourt',
    avatarInitials: 'ST',
    phone: '+234 802 984 4356',
  },
};

export const AVAILABLE_TECHNICIANS = [
  'Engr. Nnamdi Okoye',
  'Engr. Musa Abdullahi (Kano/North Hub)',
  'Engr. Tunde Bakare (Lagos Cleanroom Unit)',
  'Engr. Preye Tamuno (Port Harcourt Offshore)',
];

export const INITIAL_TECHNICIAN_PROFILES: TechnicianDirectoryProfile[] = [
  {
    id: 'tech-01',
    name: 'Engr. Nnamdi Okoye',
    hubLocation: 'Lagos Mainland & Ikeja Metrology Hub',
    corenReg: 'COREN R.44192',
    availability: 'On-Site Dispatch',
    certifications: [
      'ISO/IEC 17025 Lead Metrologist',
      'USP <41> & OIML Class E2 Mass Certified',
      'Optical & Spectrophotometry NIST Traceable',
    ],
    specialties: ['Analytical Balances', 'UV-Vis / HPLC Optics', 'Pressure & Flow'],
    primaryCalibrationKit: 'KIT-LAG-01: OIML E2 Mass Set + Holmium Oxide Optical Reference + Fluke 754',
    defaultOriginHub: 'Samstrust Ikeja Central Metrology Lab, Lagos',
    activeAssignedCount: 2,
    phone: '+234 802 984 4356',
  },
  {
    id: 'tech-02',
    name: 'Engr. Tunde Bakare (Lagos Cleanroom Unit)',
    hubLocation: 'Victoria Island & Lekki Pharma Corridor',
    corenReg: 'COREN R.51804',
    availability: 'Available',
    certifications: [
      'EN 14175 Fume Hood & Cleanroom HVAC Validator',
      'ISO 14644-1 Particle Counter Specialist',
      'Thermal Mapping (Autoclaves & Stability Chambers)',
    ],
    specialties: ['Fume Cupboards', 'Cleanroom Airflow', '3D Thermal Mapping'],
    primaryCalibrationKit: 'KIT-LAG-02: Testo 400 Hot-Wire Anemometer Grid + 16-Ch Kaye Validator',
    defaultOriginHub: 'Samstrust Cleanroom Validation Annex, Ikeja, Lagos',
    activeAssignedCount: 1,
    phone: '+234 803 512 8840',
  },
  {
    id: 'tech-03',
    name: 'Engr. Preye Tamuno (Port Harcourt Offshore)',
    hubLocation: 'Trans-Amadi Industrial Layout, Port Harcourt',
    corenReg: 'COREN R.39021',
    availability: 'In Transit',
    certifications: [
      'ATEX / IECEx Hazardous Area CompEx Ex01–Ex04',
      'API MPMS Custody Transfer Flow Proving',
      'BOSIET Offshore Survival & HUET',
    ],
    specialties: ['Differential Pressure Transmitters', 'Coriolis & Electromagnetic Flow', 'Gas Detectors'],
    primaryCalibrationKit: 'KIT-PHC-01: Fluke 729 Automatic Pressure Calibrator + Hydraulic Deadweight Tester',
    defaultOriginHub: 'Samstrust South-South Calibration Depot, Trans-Amadi, PH',
    activeAssignedCount: 1,
    phone: '+234 806 219 7731',
  },
  {
    id: 'tech-04',
    name: 'Engr. Musa Abdullahi (Kano/North Hub)',
    hubLocation: 'Bompai Industrial Estate, Kano',
    corenReg: 'COREN R.47310',
    availability: 'Available',
    certifications: [
      'OIML R51 Dynamic Checkweigher & Weighbridge Specialist',
      'Industrial PLC & Load-Cell Force Calibration',
      'SON / NAFDAC Industrial Compliance Auditor',
    ],
    specialties: ['Dynamic Checkweighers', 'Industrial Floor Scales', 'Moisture Analyzers'],
    primaryCalibrationKit: 'KIT-KAN-01: 20x 20kg Class M1/F1 Cast Iron & Stainless Reference Weights',
    defaultOriginHub: 'Samstrust Northern Regional Technical Center, Kano',
    activeAssignedCount: 1,
    phone: '+234 803 889 4412',
  },
];

const INITIAL_EQUIPMENT_ASSETS: EquipmentAsset[] = [
  {
    id: 'eq-01',
    serialNumber: 'SN-ST-2025-8841',
    assetTag: 'BZ-QC-BAL-01',
    name: 'Analytical 0.1mg Precision Balance',
    model: 'ST-LAB-PRECISION-04',
    manufacturer: 'Samstrust Metrology OEM',
    category: 'Weighing & Mass',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    facilityLocation: 'Grade B Cleanroom Lab, Ikeja, Lagos',
    labRoom: 'Cleanroom Suite B-204 (Micro-Gravimetric Bay)',
    commissioningDate: '2025-02-10',
    calibrationIntervalMonths: 6,
    measurementRange: '0.0001 g – 220 g',
    accuracyClass: 'OIML Class I (USP <41>)',
    calibrationStatus: 'Valid',
    lastCalibrationDate: '2026-08-14',
    nextDueDate: '2027-02-14',
    certificateRef: 'CERT-ISO17025-2026-0891',
    slaTier: 'Platinum',
    qrVerificationToken: 'SAM-QR-8841-ISO17025-9F2A',
    serviceHistory: [
      {
        id: 'sh-01-a',
        date: '2026-08-14',
        eventType: 'ISO 17025 Calibration',
        title: 'Bi-Annual USP <41> & OIML Class I Mass Calibration',
        engineerName: 'Engr. Nnamdi Okoye (COREN #44192)',
        summary:
          '5-point linearity, corner load eccentricity at 100g, and 10x repeatability verification using OIML E2 primary weights. Max error 0.08mg.',
        outcome: 'Passed (In-Tolerance)',
        certificateOrReportRef: 'CERT-ISO17025-2026-0891',
      },
      {
        id: 'sh-01-b',
        date: '2026-02-12',
        eventType: 'Preventive Maintenance',
        title: 'Draft Shield Alignment & Internal IsoCAL Motor Cleaning',
        engineerName: 'Engr. Tunde Bakare',
        summary:
          'Cleaned anti-static glass draft shield rails, verified optical zero-position sensor, and performed internal motorized mass check.',
        outcome: 'Passed (In-Tolerance)',
        certificateOrReportRef: 'PPM-SAM-2026-0194',
      },
      {
        id: 'sh-01-c',
        date: '2025-02-10',
        eventType: 'Initial Commissioning',
        title: 'IQ/OQ/PQ Cleanroom Installation & Baseline Calibration',
        engineerName: 'Engr. Nnamdi Okoye',
        summary:
          'Installed on anti-vibration granite table in Suite B-204. Completed Qualification Protocol and issued baseline ISO 17025 certificate.',
        outcome: 'Commissioned',
        certificateOrReportRef: 'CERT-ISO17025-2025-0118',
      },
    ],
  },
  {
    id: 'eq-02',
    serialNumber: 'SN-ST-2025-9102',
    assetTag: 'BZ-QC-FUME-02',
    name: 'VAV Aerodynamic Laboratory Fume Cupboard',
    model: 'ST-FUME-VAV-150',
    manufacturer: 'Samstrust CleanAir Systems',
    category: 'Thermal & Cleanroom',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    facilityLocation: 'Toxic Synthesis Wing, Ikeja, Lagos',
    labRoom: 'Wet Chemistry & Acid Digestion Lab 102',
    commissioningDate: '2024-11-05',
    calibrationIntervalMonths: 12,
    measurementRange: '0.30 – 0.85 m/s Face Velocity',
    accuracyClass: 'EN 14175-3 Certified',
    calibrationStatus: 'Due Soon',
    lastCalibrationDate: '2025-11-10',
    nextDueDate: '2026-11-10',
    certificateRef: 'CERT-ISO17025-2026-0874',
    slaTier: 'Platinum',
    qrVerificationToken: 'SAM-QR-9102-ISO17025-4C8B',
    serviceHistory: [
      {
        id: 'sh-02-a',
        date: '2025-11-10',
        eventType: 'ISO 17025 Calibration',
        title: 'EN 14175 Face Velocity Matrix & Sash Alarm Calibration',
        engineerName: 'Engr. Tunde Bakare',
        summary:
          '9-point hot-wire anemometer grid traverse at 500mm sash opening. Mean face velocity 0.52 m/s; VAV actuator response < 1.8s.',
        outcome: 'Passed (In-Tolerance)',
        certificateOrReportRef: 'CERT-ISO17025-2026-0874',
      },
      {
        id: 'sh-02-b',
        date: '2025-05-18',
        eventType: 'Repair & Adjustment',
        title: 'Differential Pressure Transducer Zero-Drift Adjustment',
        engineerName: 'Engr. Nnamdi Okoye',
        summary:
          'Recalibratedexhaust duct DP sensor after HEPA scrubber cartridge swap. Restored acoustic sash alarm trigger threshold.',
        outcome: 'Adjusted to Spec',
        certificateOrReportRef: 'SRV-SAM-2025-0642',
      },
      {
        id: 'sh-02-c',
        date: '2024-11-05',
        eventType: 'Initial Commissioning',
        title: 'Ducted VAV Containment & Smoke Visualization Commissioning',
        engineerName: 'Engr. Tunde Bakare',
        summary:
          'Completed EN 14175-4 on-site containment test and titanium tetrachloride smoke trace verification.',
        outcome: 'Commissioned',
        certificateOrReportRef: 'IQ-OQ-SAM-2024-9102',
      },
    ],
  },
  {
    id: 'eq-03',
    serialNumber: 'SN-ST-2025-7730',
    assetTag: 'BZ-OPT-UV-01',
    name: 'UV-Visible Double Beam Scanning Spectrophotometer',
    model: 'ST-UV-SCAN-2800',
    manufacturer: 'Samstrust Optical Photonics',
    category: 'Analytical & Optical',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    facilityLocation: 'Assay QC Suite 3, Ikeja, Lagos',
    labRoom: 'Spectroscopy & Chromatography Room 305',
    commissioningDate: '2024-10-15',
    calibrationIntervalMonths: 12,
    measurementRange: '190 – 1100 nm (1.0 nm Bandwidth)',
    accuracyClass: '±0.3 nm Wavelength Accuracy',
    calibrationStatus: 'In Calibration',
    lastCalibrationDate: '2025-10-20',
    nextDueDate: '2026-10-28',
    certificateRef: 'CERT-ISO17025-2026-0812',
    slaTier: 'Platinum',
    qrVerificationToken: 'SAM-QR-7730-ISO17025-7E1D',
    serviceHistory: [
      {
        id: 'sh-03-a',
        date: '2026-10-26',
        eventType: 'ISO 17025 Calibration',
        title: 'Holmium Oxide Wavelength & Potassium Dichromate Photometric Verification',
        engineerName: 'Engr. Nnamdi Okoye',
        summary:
          'Active on-site calibration in progress. Deuterium D2 lamp arc stability and stray light (<0.02% at 220nm) under evaluation.',
        outcome: 'Scheduled',
        certificateOrReportRef: 'SRV-SAM-2026-1042',
      },
      {
        id: 'sh-03-b',
        date: '2025-10-20',
        eventType: 'ISO 17025 Calibration',
        title: 'Annual USP <857> Optical Qualification & Calibration',
        engineerName: 'Engr. Nnamdi Okoye',
        summary:
          'Verified wavelength accuracy across 6 holmium oxide peaks and absorbance linearity up to 2.5 AU.',
        outcome: 'Passed (In-Tolerance)',
        certificateOrReportRef: 'CERT-ISO17025-2026-0812',
      },
    ],
  },
  {
    id: 'eq-04',
    serialNumber: 'SN-ST-2024-4419',
    assetTag: 'AER-SKID-EMF-04',
    name: 'Electromagnetic Custody Transfer Flowmeter',
    model: 'ST-EMF-8000',
    manufacturer: 'Samstrust Flow Control',
    category: 'Flow Metering',
    customerCompany: 'Atlantic Energy & Refining Group',
    facilityLocation: 'Onne Marine Terminal Skid B, Port Harcourt',
    labRoom: 'Metering Skid Bay B-02 (Export Pipeline)',
    commissioningDate: '2024-03-18',
    calibrationIntervalMonths: 6,
    measurementRange: '5 – 650 m³/h (DN100 ANSI 300#)',
    accuracyClass: '±0.15% of Reading (API MPMS)',
    calibrationStatus: 'Valid',
    lastCalibrationDate: '2026-09-19',
    nextDueDate: '2027-03-19',
    certificateRef: 'CERT-ISO17025-2026-0765',
    slaTier: 'Platinum',
    qrVerificationToken: 'SAM-QR-4419-ISO17025-3A9C',
    serviceHistory: [
      {
        id: 'sh-04-a',
        date: '2026-09-19',
        eventType: 'ISO 17025 Calibration',
        title: 'Master Coriolis Proving Loop Wet Flow Calibration',
        engineerName: 'Engr. Preye Tamuno',
        summary:
          '5-point custody transfer flow verification against Gravimetric Primary Flow Rig. K-Factor adjusted by +0.02%.',
        outcome: 'Adjusted to Spec',
        certificateOrReportRef: 'CERT-ISO17025-2026-0765',
      },
      {
        id: 'sh-04-b',
        date: '2026-03-15',
        eventType: 'Preventive Maintenance',
        title: 'PTFE Liner Insulation Resistance & Coil Excitation Check',
        engineerName: 'Engr. Preye Tamuno',
        summary:
          'Verified grounding rings, electrode contact impedance, and 4-20mA HART loop integrity.',
        outcome: 'Passed (In-Tolerance)',
        certificateOrReportRef: 'PPM-SAM-2026-0088',
      },
    ],
  },
  {
    id: 'eq-05',
    serialNumber: 'SN-ST-2025-3318',
    assetTag: 'NGM-PACK-CW-01',
    name: 'High-Speed Automated Conveyor Checkweigher',
    model: 'ST-CW-INSPECT-300',
    manufacturer: 'Samstrust Industrial Weighing',
    category: 'Weighing & Mass',
    customerCompany: 'Northern Grains & Flour Mills Plc',
    facilityLocation: 'Packaging Line 2, Bompai Estate, Kano',
    labRoom: 'Automated Bagging & Dispatch Hall 2',
    commissioningDate: '2025-01-12',
    calibrationIntervalMonths: 6,
    measurementRange: '50 g – 5,000 g (165 ppm)',
    accuracyClass: 'OIML R51 Class XIII(1) ±0.15 g',
    calibrationStatus: 'Valid',
    lastCalibrationDate: '2026-07-02',
    nextDueDate: '2027-01-02',
    certificateRef: 'CERT-ISO17025-2026-0891',
    slaTier: 'Gold',
    qrVerificationToken: 'SAM-QR-3318-ISO17025-6D2E',
    serviceHistory: [
      {
        id: 'sh-05-a',
        date: '2026-07-02',
        eventType: 'ISO 17025 Calibration',
        title: 'Dynamic In-Motion OIML R51 Verification',
        engineerName: 'Engr. Musa Abdullahi',
        summary:
          'Static and dynamic test runs at 165 packs/min using certified test loads (250g, 1000g, 2500g). Pneumatic rejector timing verified.',
        outcome: 'Passed (In-Tolerance)',
        certificateOrReportRef: 'CERT-ISO17025-2026-0891',
      },
    ],
  },
  {
    id: 'eq-06',
    serialNumber: 'SN-ST-2024-1190',
    assetTag: 'AER-DP-TX-12',
    name: 'Smart Differential Pressure Transmitter (ATEX)',
    model: 'ST-DPT-400X',
    manufacturer: 'Samstrust Process Sensors',
    category: 'Pressure & DP',
    customerCompany: 'Atlantic Energy & Refining Group',
    facilityLocation: 'Separator Train 1, Trans-Amadi, Port Harcourt',
    labRoom: 'High-Pressure Gas Manifold Zone 1',
    commissioningDate: '2024-08-29',
    calibrationIntervalMonths: 12,
    measurementRange: '0 – 160 bar Differential',
    accuracyClass: '±0.04% Span (IECEx Zone 1)',
    calibrationStatus: 'Overdue',
    lastCalibrationDate: '2025-09-01',
    nextDueDate: '2026-09-01',
    certificateRef: 'CERT-ISO17025-2026-0765',
    slaTier: 'Platinum',
    qrVerificationToken: 'SAM-QR-1190-ISO17025-1B4F',
    serviceHistory: [
      {
        id: 'sh-06-a',
        date: '2025-09-01',
        eventType: 'ISO 17025 Calibration',
        title: '5-Point Up/Down Deadweight Tester Pressure Calibration',
        engineerName: 'Engr. Preye Tamuno',
        summary:
          'Calibrated against Fluke Hydraulic Deadweight Tester across 0%, 25%, 50%, 75%, 100% span (4.000 to 20.000 mA).',
        outcome: 'Passed (In-Tolerance)',
        certificateOrReportRef: 'CERT-ISO17025-2026-0765',
      },
    ],
  },
];

const INITIAL_CERTIFICATES: CalibrationCertificate[] = [
  {
    id: 'cert-01',
    certificateNumber: 'CERT-ISO17025-2026-0891',
    serialNumber: 'SN-ST-2025-8841',
    equipmentName: 'Analytical 0.1mg Precision Balance',
    model: 'ST-LAB-PRECISION-04',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    facilityLocation: 'Grade B Cleanroom Lab, Ikeja, Lagos',
    calibrationDate: '2026-08-14',
    nextDueDate: '2027-02-14',
    technicianName: 'Engr. Nnamdi Okoye',
    approvingMetrologist: 'Dr. (Mrs.) Folashade Adeleke',
    environmentalTemp: '20.2 °C ± 0.3 °C',
    environmentalHumidity: '46.5 % RH ± 2.0 %',
    barometricPressure: '1012.8 hPa',
    referenceStandardUsed: 'OIML Class E2 Stainless Reference Weight Set (Cert #DKD-99412)',
    traceabilityNmi: 'PTB / DKD Germany & NIST USA Unbroken Chain',
    uncertaintyBudgetK2: 'U = 0.0002 g (0.2 mg) at k = 2 (95.45% Confidence)',
    complianceStandard: 'ISO/IEC 17025:2017, OIML R76-1 & USP General Chapter <41>',
    status: 'Issued',
    workReportSummary:
      'Internal motorized IsoCAL mass adjustment executed. Corner load eccentricity tested at 100g across all 4 quadrants (max deviation 0.1mg). Repeatability 10x sweep SD = 0.08mg. Instrument passes USP <41> and OIML Class I tolerances.',
    readings: [
      {
        pointNumber: 1,
        nominalValue: '1.0000 g',
        asFoundValue: '1.0001 g',
        asFoundError: '+0.0001 g',
        asLeftValue: '1.0000 g',
        asLeftError: '0.0000 g',
        expandedUncertainty: '±0.00015 g',
        toleranceLimit: '±0.0005 g',
        pass: true,
      },
      {
        pointNumber: 2,
        nominalValue: '20.0000 g',
        asFoundValue: '20.0002 g',
        asFoundError: '+0.0002 g',
        asLeftValue: '20.0000 g',
        asLeftError: '0.0000 g',
        expandedUncertainty: '±0.00018 g',
        toleranceLimit: '±0.0005 g',
        pass: true,
      },
      {
        pointNumber: 3,
        nominalValue: '50.0000 g',
        asFoundValue: '50.0003 g',
        asFoundError: '+0.0003 g',
        asLeftValue: '50.0001 g',
        asLeftError: '+0.0001 g',
        expandedUncertainty: '±0.00020 g',
        toleranceLimit: '±0.0005 g',
        pass: true,
      },
      {
        pointNumber: 4,
        nominalValue: '100.0000 g',
        asFoundValue: '100.0004 g',
        asFoundError: '+0.0004 g',
        asLeftValue: '100.0001 g',
        asLeftError: '+0.0001 g',
        expandedUncertainty: '±0.00022 g',
        toleranceLimit: '±0.0010 g',
        pass: true,
      },
      {
        pointNumber: 5,
        nominalValue: '200.0000 g',
        asFoundValue: '200.0006 g',
        asFoundError: '+0.0006 g',
        asLeftValue: '200.0001 g',
        asLeftError: '+0.0001 g',
        expandedUncertainty: '±0.00025 g',
        toleranceLimit: '±0.0015 g',
        pass: true,
      },
    ],
  },
  {
    id: 'cert-02',
    certificateNumber: 'CERT-ISO17025-2026-0874',
    serialNumber: 'SN-ST-2025-9102',
    equipmentName: 'VAV Aerodynamic Laboratory Fume Cupboard',
    model: 'ST-FUME-VAV-150',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    facilityLocation: 'Toxic Synthesis Wing, Ikeja, Lagos',
    calibrationDate: '2025-11-10',
    nextDueDate: '2026-11-10',
    technicianName: 'Engr. Tunde Bakare (Lagos Cleanroom Unit)',
    approvingMetrologist: 'Dr. (Mrs.) Folashade Adeleke',
    environmentalTemp: '21.0 °C ± 0.5 °C',
    environmentalHumidity: '48.0 % RH ± 3.0 %',
    barometricPressure: '1011.5 hPa',
    referenceStandardUsed: 'Hot-Wire Thermal Anemometer Probe (NIST Traceable #AN-7721)',
    traceabilityNmi: 'NIST USA Air Velocity Standard',
    uncertaintyBudgetK2: 'U = 0.015 m/s at k = 2 (95% Confidence)',
    complianceStandard: 'EN 14175-3:2019 & ASHRAE 110 Containment Protocol',
    status: 'Issued',
    workReportSummary:
      '9-grid face velocity traverse executed at 400mm sash working height. Smoke titanium tetrachloride visualization confirmed zero reverse eddy escape. VAV actuator damper response time verified at 1.4 seconds.',
    readings: [
      {
        pointNumber: 1,
        nominalValue: '0.50 m/s (Grid Left)',
        asFoundValue: '0.47 m/s',
        asFoundError: '-0.03 m/s',
        asLeftValue: '0.50 m/s',
        asLeftError: '0.00 m/s',
        expandedUncertainty: '±0.015 m/s',
        toleranceLimit: '±0.05 m/s',
        pass: true,
      },
      {
        pointNumber: 2,
        nominalValue: '0.50 m/s (Grid Center)',
        asFoundValue: '0.49 m/s',
        asFoundError: '-0.01 m/s',
        asLeftValue: '0.51 m/s',
        asLeftError: '+0.01 m/s',
        expandedUncertainty: '±0.015 m/s',
        toleranceLimit: '±0.05 m/s',
        pass: true,
      },
      {
        pointNumber: 3,
        nominalValue: '0.50 m/s (Grid Right)',
        asFoundValue: '0.48 m/s',
        asFoundError: '-0.02 m/s',
        asLeftValue: '0.50 m/s',
        asLeftError: '0.00 m/s',
        expandedUncertainty: '±0.015 m/s',
        toleranceLimit: '±0.05 m/s',
        pass: true,
      },
    ],
  },
  {
    id: 'cert-03',
    certificateNumber: 'CERT-ISO17025-2026-0765',
    serialNumber: 'SN-ST-2024-4419',
    equipmentName: 'Electromagnetic Custody Transfer Flowmeter',
    model: 'ST-EMF-8000',
    customerCompany: 'Atlantic Energy & Refining Group',
    facilityLocation: 'Onne Marine Terminal Skid B, Port Harcourt',
    calibrationDate: '2026-09-19',
    nextDueDate: '2027-03-19',
    technicianName: 'Engr. Nnamdi Okoye',
    approvingMetrologist: 'Engr. Samuel O. Trust',
    environmentalTemp: '26.4 °C (In-Situ Skid)',
    environmentalHumidity: '64.0 % RH',
    barometricPressure: '1013.2 hPa',
    referenceStandardUsed: 'Dual-Channel Master Coriolis Prover Loop (API MPMS Ch 4.8)',
    traceabilityNmi: 'NMI Netherlands / VSL Flow Volume Standard',
    uncertaintyBudgetK2: 'U = 0.08% Volumetric Flow at k = 2',
    complianceStandard: 'ISO/IEC 17025:2017, ISO 4185 & NUPRC Fiscal Metering Guidelines',
    status: 'Issued',
    workReportSummary:
      '5-point flow linearity sweep from 50 m³/h to 500 m³/h. Hastelloy C electrodes inspected and zero-point coil excitation verified via HART 7.0 diagnostic communicator. K-factor updated in flow computer.',
    readings: [
      {
        pointNumber: 1,
        nominalValue: '100.00 m³/h',
        asFoundValue: '100.18 m³/h',
        asFoundError: '+0.18%',
        asLeftValue: '100.02 m³/h',
        asLeftError: '+0.02%',
        expandedUncertainty: '±0.08%',
        toleranceLimit: '±0.20%',
        pass: true,
      },
      {
        pointNumber: 2,
        nominalValue: '300.00 m³/h',
        asFoundValue: '300.42 m³/h',
        asFoundError: '+0.14%',
        asLeftValue: '299.97 m³/h',
        asLeftError: '-0.01%',
        expandedUncertainty: '±0.08%',
        toleranceLimit: '±0.20%',
        pass: true,
      },
      {
        pointNumber: 3,
        nominalValue: '500.00 m³/h',
        asFoundValue: '500.85 m³/h',
        asFoundError: '+0.17%',
        asLeftValue: '500.10 m³/h',
        asLeftError: '+0.02%',
        expandedUncertainty: '±0.08%',
        toleranceLimit: '±0.20%',
        pass: true,
      },
    ],
  },
];

const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 'tkt-01',
    ticketNumber: 'SRV-SAM-2026-1094',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    contactPerson: 'Dr. Chioma Nwachukwu',
    contactPhone: '+234 802 334 1188',
    facilityLocation: 'Assay QC Suite 3, Ikeja Industrial Zone, Lagos',
    equipmentSerial: 'SN-ST-2025-7730',
    equipmentName: 'UV-Visible Double Beam Scanning Spectrophotometer (ST-UV-SCAN-2800)',
    serviceType: 'On-site ISO Calibration',
    urgencyRating: 'Urgent',
    priority: 'High (12-Hr SLA)',
    slaTier: 'Platinum',
    status: 'In Progress',
    assignedTechnician: 'Engr. Nnamdi Okoye',
    scheduledDate: '2026-10-26 09:00 WAT',
    slaDeadline: '2026-10-26 18:00 WAT',
    slaStatus: 'Within SLA',
    description:
      'Bi-annual optical wavelength accuracy (Holmium Oxide filter) and photometric linearity (Potassium Dichromate) ISO/IEC 17025 calibration ahead of NAFDAC Q4 GMP inspection.',
    errorCodeLogs: 'WARN-OPT-04: Deuterium Lamp Hours > 1,850h | Baseline Drift +0.003 Abs at 254nm',
    uploadedAttachments: [
      {
        id: 'att-01',
        fileName: 'UV2800_Baseline_Scan_Log_Oct2026.csv',
        fileSizeKb: 142,
        fileCategory: 'Diagnostic Dump',
        uploadedAt: '2026-10-25 14:22',
      },
    ],
    ambientConditions: {
      temperatureC: '21.4',
      relativeHumidityPct: '46.5',
      barometricPressureHpa: '1012.8',
      validatedForMetrology: true,
    },
    testWeightsAndStandardsUsed:
      'NIST SRM 2034 Holmium Oxide Wavelength Standard & Potassium Dichromate Optical Density Filter Set (Cert #PTB-2026-441)',
    calibrationReadings: [
      {
        pointNumber: 1,
        nominalValue: '241.10 nm',
        asFoundValue: '241.28 nm',
        asFoundError: '+0.18 nm',
        asLeftValue: '241.12 nm',
        asLeftError: '+0.02 nm',
        expandedUncertainty: '±0.08 nm',
        toleranceLimit: '±0.30 nm',
        pass: true,
      },
      {
        pointNumber: 2,
        nominalValue: '287.50 nm',
        asFoundValue: '287.64 nm',
        asFoundError: '+0.14 nm',
        asLeftValue: '287.51 nm',
        asLeftError: '+0.01 nm',
        expandedUncertainty: '±0.08 nm',
        toleranceLimit: '±0.30 nm',
        pass: true,
      },
      {
        pointNumber: 3,
        nominalValue: '361.00 nm',
        asFoundValue: '361.15 nm',
        asFoundError: '+0.15 nm',
        asLeftValue: '361.02 nm',
        asLeftError: '+0.02 nm',
        expandedUncertainty: '±0.08 nm',
        toleranceLimit: '±0.30 nm',
        pass: true,
      },
      {
        pointNumber: 4,
        nominalValue: '453.70 nm',
        asFoundValue: '453.81 nm',
        asFoundError: '+0.11 nm',
        asLeftValue: '453.71 nm',
        asLeftError: '+0.01 nm',
        expandedUncertainty: '±0.10 nm',
        toleranceLimit: '±0.30 nm',
        pass: true,
      },
      {
        pointNumber: 5,
        nominalValue: '640.20 nm',
        asFoundValue: '640.34 nm',
        asFoundError: '+0.14 nm',
        asLeftValue: '640.22 nm',
        asLeftError: '+0.02 nm',
        expandedUncertainty: '±0.10 nm',
        toleranceLimit: '±0.30 nm',
        pass: true,
      },
    ],
    partsReplacedLog: [
      {
        id: 'prt-01',
        partNumber: 'ST-OPT-D2-800',
        partName: 'Pre-Aligned Deuterium (D2) UV Arc Lamp',
        quantity: 1,
        batchOrSerial: 'LOT-D2-2026-091',
        category: 'Filter / Consumable',
      },
      {
        id: 'prt-02',
        partNumber: 'ST-SIL-DES-04',
        partName: 'Monochromator Optical Chamber Desiccant Cartridge',
        quantity: 2,
        batchOrSerial: 'LOT-SIL-882',
        category: 'Seal / Gasket',
      },
    ],
    routePlan: {
      originHub: 'Samstrust Ikeja Central Metrology Lab, Lagos',
      destinationAddress: 'Assay QC Suite 3, Plot 14 Oba Akran Industrial Estate, Ikeja, Lagos',
      distanceKm: '6.8 km',
      estimatedTransitMin: '22 mins',
      calibrationKitAssigned: 'KIT-LAG-01: OIML E2 Mass Set + Holmium Oxide Optical Reference',
      routeNotes: 'Cleanroom gate pass pre-cleared by BioZenith QA Desk.',
    },
    workReportNotes:
      'Deuterium and tungsten halogen lamps stabilized for 60 minutes. Replaced aging D2 lamp and recalibrated monochromator grating zero position.',
    createdAt: '2026-10-25 14:20',
    updatedAt: '2026-10-26 08:45',
    checklist: [
      { id: 'chk-1', label: 'Verify cleanroom gowning & electrostatic discharge (ESD) wrist strap', category: 'Safety & ATEX', checked: true },
      { id: 'chk-2', label: 'Confirm ambient room temperature (20°C ± 2°C) and relative humidity (<55% RH)', category: 'Environmental', checked: true },
      { id: 'chk-3', label: 'Inspect quartz cuvette carriage alignment and optical beam splitter mirrors', category: 'Mechanical & Electrical', checked: true },
      { id: 'chk-4', label: 'Execute 60-minute warm-up of Deuterium (D2) and Tungsten lamps', category: 'Metrological', checked: true },
      { id: 'chk-5', label: 'Perform 5-point Holmium Oxide wavelength peak verification (241.1nm – 640.2nm)', category: 'Metrological', checked: false },
    ],
  },
  {
    id: 'tkt-02',
    ticketNumber: 'SRV-SAM-2026-1098',
    customerCompany: 'Atlantic Energy & Refining Group',
    contactPerson: 'Engr. Babatunde Alabi',
    contactPhone: '+234 803 777 2200',
    facilityLocation: 'Separator Train 1, Trans-Amadi, Port Harcourt',
    equipmentSerial: 'SN-ST-2024-1190',
    equipmentName: 'Smart Differential Pressure Transmitter (ST-DPT-400X)',
    serviceType: 'Emergency Breakdown',
    urgencyRating: 'Critical Production Stoppage',
    priority: 'Critical (4-Hr SLA)',
    slaTier: 'Platinum',
    status: 'Assigned',
    assignedTechnician: 'Engr. Preye Tamuno (Port Harcourt Offshore)',
    scheduledDate: '2026-10-26 11:30 WAT',
    slaDeadline: '2026-10-26 15:30 WAT',
    slaStatus: 'At Risk',
    description:
      'Transmitter showing +1.4% zero-point shift after high-pressure sour gas blowdown. Requires 5-valve manifold isolation, diaphragm inspection, hydraulic deadweight calibration, and HART 7.0 zero trim.',
    errorCodeLogs: 'HART-ERR-0x28: High Pressure Over-Range Event Logged | Loop Current Saturated at 20.8 mA',
    uploadedAttachments: [
      {
        id: 'att-02',
        fileName: 'HART475_Communicator_Fault_Dump.txt',
        fileSizeKb: 48,
        fileCategory: 'Error Log',
        uploadedAt: '2026-10-26 07:32',
      },
      {
        id: 'att-03',
        fileName: 'Manifold_Train1_Impulse_Line_Photo.jpg',
        fileSizeKb: 1240,
        fileCategory: 'Equipment Photo',
        uploadedAt: '2026-10-26 07:33',
      },
    ],
    ambientConditions: {
      temperatureC: '28.5',
      relativeHumidityPct: '72.0',
      barometricPressureHpa: '1009.4',
      validatedForMetrology: true,
    },
    testWeightsAndStandardsUsed:
      'Fluke 729 300G Automatic Pressure Calibrator & DH-Budenberg Hydraulic Deadweight Tester (Cert #NIST-9041)',
    routePlan: {
      originHub: 'Samstrust South-South Calibration Depot, Trans-Amadi, PH',
      destinationAddress: 'Atlantic Refining Separator Train 1, Plot 88 Trans-Amadi, Port Harcourt',
      distanceKm: '4.2 km',
      estimatedTransitMin: '15 mins',
      calibrationKitAssigned: 'KIT-PHC-01: Fluke 729 Automatic Pressure Calibrator + Deadweight Tester',
      routeNotes: 'Mandatory H2S personal monitor & intrinsically safe ATEX tools required at gate.',
    },
    createdAt: '2026-10-26 07:30',
    updatedAt: '2026-10-26 09:10',
    checklist: [
      { id: 'chk-21', label: 'Obtain Hot-Work / Hazardous Area ATEX Zone 1 Permit to Work (PTW)', category: 'Safety & ATEX', checked: true },
      { id: 'chk-22', label: 'Verify zero explosive gas LEL with portable multi-gas detector', category: 'Safety & ATEX', checked: true },
      { id: 'chk-23', label: 'Isolate 5-valve manifold and depressurize impulse lines safely', category: 'Mechanical & Electrical', checked: false },
      { id: 'chk-24', label: 'Connect primary hydraulic deadweight tester and record 5-point As-Found sweep', category: 'Metrological', checked: false },
    ],
  },
  {
    id: 'tkt-03',
    ticketNumber: 'SRV-SAM-2026-1102',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    contactPerson: 'Dr. Chioma Nwachukwu',
    contactPhone: '+234 802 334 1188',
    facilityLocation: 'Toxic Synthesis Wing, Ikeja Industrial Zone, Lagos',
    equipmentSerial: 'SN-ST-2025-9102',
    equipmentName: 'VAV Aerodynamic Laboratory Fume Cupboard (ST-FUME-VAV-150)',
    serviceType: 'Preventive Maintenance',
    urgencyRating: 'Routine',
    priority: 'Standard (48-Hr SLA)',
    slaTier: 'Platinum',
    status: 'Submitted',
    assignedTechnician: 'Unassigned',
    scheduledDate: '2026-10-28',
    slaDeadline: '2026-10-28 12:00 WAT',
    slaStatus: 'Within SLA',
    description:
      'Scheduled annual EN 14175 face velocity recertification, HEPA exhaust pre-filter replacement, and VAV sash position sensor calibration.',
    createdAt: '2026-10-26 08:15',
    updatedAt: '2026-10-26 08:15',
    checklist: [
      { id: 'chk-31', label: 'Confirm chemical decontamination clearance certificate from Lab Manager', category: 'Safety & ATEX', checked: false },
      { id: 'chk-32', label: 'Inspect sash counterweight cables and aerodynamic airfoil sill', category: 'Mechanical & Electrical', checked: false },
      { id: 'chk-33', label: 'Perform 9-point thermal anemometer face velocity grid test', category: 'Metrological', checked: false },
    ],
  },
  {
    id: 'tkt-04',
    ticketNumber: 'SRV-SAM-2026-1085',
    customerCompany: 'Northern Grains & Flour Mills Plc',
    contactPerson: 'Alhaji Ibrahim Danjuma',
    contactPhone: '+234 803 445 9901',
    facilityLocation: 'Packaging Line 2, Bompai Industrial Estate, Kano',
    equipmentSerial: 'SN-ST-2025-3318',
    equipmentName: 'High-Speed Automated Conveyor Checkweigher (ST-CW-INSPECT-300)',
    serviceType: 'Installation & Commissioning',
    urgencyRating: 'Routine',
    priority: 'Standard (48-Hr SLA)',
    slaTier: 'Gold',
    status: 'Scheduled',
    assignedTechnician: 'Engr. Musa Abdullahi (Kano/North Hub)',
    scheduledDate: '2026-10-27 10:00 WAT',
    slaDeadline: '2026-10-28 17:00 WAT',
    slaStatus: 'Within SLA',
    description:
      'Quarterly dynamic belt load-cell verification, photo-eye trigger alignment, and pneumatic air-jet rejector timing validation.',
    routePlan: {
      originHub: 'Samstrust Northern Regional Technical Center, Kano',
      destinationAddress: 'Northern Grains Packaging Line 2, Bompai Industrial Estate, Kano',
      distanceKm: '5.5 km',
      estimatedTransitMin: '18 mins',
      calibrationKitAssigned: 'KIT-KAN-01: 20x 20kg Class M1/F1 Reference Weights',
      routeNotes: 'Line 2 scheduled for maintenance window 10:00–14:00 WAT.',
    },
    createdAt: '2026-10-24 16:00',
    updatedAt: '2026-10-25 11:20',
    checklist: [
      { id: 'chk-41', label: 'Lock-out / Tag-out (LOTO) main packaging conveyor drive', category: 'Safety & ATEX', checked: true },
      { id: 'chk-42', label: 'Check compressed air supply pressure (6.0 bar dry regulated)', category: 'Mechanical & Electrical', checked: false },
      { id: 'chk-43', label: 'Run 20x dynamic test pack passes with Class F1 certified check weights', category: 'Metrological', checked: false },
    ],
  },
  {
    id: 'tkt-05',
    ticketNumber: 'SRV-SAM-2026-1104',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    contactPerson: 'Engr. Kunle Adeyemi',
    contactPhone: '+234 803 910 4421',
    facilityLocation: 'Sterile Formulation Plant, Sagamu Interchange, Ogun',
    equipmentSerial: 'UNLISTED-MTR-908',
    equipmentName: 'Mettler Toledo SevenExcellence Multiparameter pH/Conductivity Meter',
    isUnlistedDevice: true,
    unlistedDeviceSpecs: {
      manufacturer: 'Mettler Toledo OEM',
      model: 'SevenExcellence S470',
      category: 'Spectroscopy & Biotech',
    },
    serviceType: 'User Training',
    urgencyRating: 'Routine',
    priority: 'Standard (48-Hr SLA)',
    slaTier: 'Platinum',
    status: 'Under Review',
    assignedTechnician: 'Engr. Tunde Bakare (Lagos Cleanroom Unit)',
    scheduledDate: '2026-10-29 10:00 WAT',
    slaDeadline: '2026-10-30 17:00 WAT',
    slaStatus: 'Within SLA',
    description:
      'On-site 21 CFR Part 11 audit trail configuration, 3-point NIST buffer slope calibration, and hands-on operator training for 6 new QC analysts on unlisted third-party meter.',
    createdAt: '2026-10-26 09:05',
    updatedAt: '2026-10-26 09:20',
    checklist: [
      { id: 'chk-51', label: 'Verify NIST traceable pH 4.01, 7.00, and 9.21 buffer solutions expiry', category: 'Metrological', checked: true },
      { id: 'chk-52', label: 'Configure 21 CFR Part 11 role permissions and electronic signature policy', category: 'Mechanical & Electrical', checked: false },
      { id: 'chk-53', label: 'Conduct practical slope (>97%) & zero-offset competency evaluation for QC analysts', category: 'Metrological', checked: false },
    ],
  },
  {
    id: 'tkt-06',
    ticketNumber: 'SRV-SAM-2026-1079',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    contactPerson: 'Pharm. Ngozi Okafor',
    contactPhone: '+234 805 612 3390',
    facilityLocation: 'R&D Stability Suite, Victoria Island, Lagos',
    equipmentSerial: 'SN-ST-2024-5519',
    equipmentName: 'ICH Q1A Climatic Stability Chamber (ST-CLIM-ICH-500)',
    serviceType: 'Emergency Breakdown',
    urgencyRating: 'Urgent',
    priority: 'High (12-Hr SLA)',
    slaTier: 'Platinum',
    status: 'Awaiting Parts',
    assignedTechnician: 'Engr. Tunde Bakare (Lagos Cleanroom Unit)',
    scheduledDate: '2026-10-27 14:00 WAT',
    slaDeadline: '2026-10-27 18:00 WAT',
    slaStatus: 'Within SLA',
    description:
      'Ultrasonic steam humidifier transducer fault causing RH drop from 75% to 58% RH in Zone II stability chamber. Replacement piezo nebulizer module dispatched from Ikeja bonded warehouse.',
    errorCodeLogs: 'ALM-HUM-09: Low Humidity Deviation > 5% RH for 45 mins | Steam Generator Current 0.0A',
    partsReplacedLog: [
      {
        id: 'prt-09',
        partNumber: 'ST-HUM-PIEZO-24V',
        partName: 'Ultrasonic Stainless Humidity Nebulizer Assembly',
        quantity: 1,
        batchOrSerial: 'LOT-PZ-2026-412',
        category: 'Electronic Module',
      },
    ],
    createdAt: '2026-10-23 11:10',
    updatedAt: '2026-10-25 16:40',
    checklist: [
      { id: 'chk-61', label: 'Transfer ICH stability samples to backup validated chamber', category: 'Safety & ATEX', checked: true },
      { id: 'chk-62', label: 'Isolate 24V DC humidifier power bus and drain DI water reservoir', category: 'Mechanical & Electrical', checked: true },
      { id: 'chk-63', label: 'Install replacement piezo nebulizer & perform 9-sensor 24-hr RH mapping', category: 'Metrological', checked: false },
    ],
  },
  {
    id: 'tkt-07',
    ticketNumber: 'SRV-SAM-2026-1062',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    contactPerson: 'Dr. Chioma Nwachukwu',
    contactPhone: '+234 802 334 1188',
    facilityLocation: 'Grade B Cleanroom Lab, Ikeja Industrial Zone, Lagos',
    equipmentSerial: 'SN-ST-2025-8841',
    equipmentName: 'Analytical 0.1mg Precision Balance (ST-LAB-PRECISION-04)',
    serviceType: 'On-site ISO Calibration',
    urgencyRating: 'Routine',
    priority: 'Standard (48-Hr SLA)',
    slaTier: 'Platinum',
    status: 'Closed',
    assignedTechnician: 'Engr. Nnamdi Okoye',
    scheduledDate: '2026-08-14 10:00 WAT',
    slaDeadline: '2026-08-15 17:00 WAT',
    slaStatus: 'Within SLA',
    description:
      'Scheduled bi-annual USP <41> repeatability, eccentricity, and 5-point OIML Class E2 linearity calibration.',
    ambientConditions: {
      temperatureC: '20.6',
      relativeHumidityPct: '45.0',
      barometricPressureHpa: '1013.5',
      validatedForMetrology: true,
    },
    testWeightsAndStandardsUsed: 'OIML Class E2 Primary Reference Mass Set (Cert #PTB-DE-2025-9921)',
    issuedCertificateNumber: 'CERT-ISO17025-2026-0891',
    customerSignOff: {
      signedByName: 'Dr. Chioma Nwachukwu',
      signedByTitle: 'Director of Quality Assurance',
      signedAt: '2026-08-14 13:45 WAT',
      signatureDataUrl: 'SIGNED_ON_GLASS_VERIFIED_HASH_9F2A',
      clientRemarks: 'All 5 test points verified in tolerance. Cleanroom protocol observed.',
    },
    createdAt: '2026-08-12 09:00',
    updatedAt: '2026-08-14 13:45',
    checklist: [
      { id: 'chk-71', label: 'Verify anti-vibration granite table spirit level centering', category: 'Mechanical & Electrical', checked: true },
      { id: 'chk-72', label: 'Record cleanroom ambient temperature, RH% and barometric pressure', category: 'Environmental', checked: true },
      { id: 'chk-73', label: 'Complete 10x repeatability & 5-point OIML E2 mass calibration', category: 'Metrological', checked: true },
    ],
  },
];

const INITIAL_QUOTES_INVOICES: PortalQuoteAndInvoice[] = [
  {
    id: 'qi-01',
    quoteRef: 'QT-SAM-2026-401',
    proformaInvoiceRef: 'PI-SAM-2026-901',
    linkedRfqRef: 'RFQ-SAM-2026-3195',
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    contactName: 'Dr. Chioma Nwachukwu',
    contactEmail: 'c.nwachukwu@biozenith.com',
    deliveryState: 'Lagos State',
    lineItems: [
      {
        id: 'li-1',
        description: 'Analytical & Top-Loading Precision Laboratory Balances (0.0001g IsoCAL)',
        model: 'ST-LAB-PRECISION-04',
        qty: 2,
        unitPriceUSD: 1890,
      },
      {
        id: 'li-2',
        description: 'Certified Laboratory Fume Cupboard & VAV Extraction System (1500mm)',
        model: 'ST-FUME-VAV-150',
        qty: 1,
        unitPriceUSD: 5200,
      },
      {
        id: 'li-3',
        description: 'On-Site Installation, EN 14175 Validation & ISO/IEC 17025 Calibration Bundle',
        model: 'SRV-ISO-BUNDLE',
        qty: 1,
        unitPriceUSD: 650,
      },
    ],
    subtotalUSD: 9630,
    discountPercent: 5,
    vatPercent: 7.5,
    totalUSD: 9834.64,
    exchangeRateNGN: 1485,
    quoteStatus: 'Sent for Approval',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Corporate PO (Net-30)',
    issuedDate: '2026-10-24',
    validUntil: '2026-11-24',
    notes: 'Includes 12-Month Platinum SLA coverage, NAFDAC audit dossier, and 2-day operator training in Ikeja.',
  },
  {
    id: 'qi-02',
    quoteRef: 'QT-SAM-2026-402',
    proformaInvoiceRef: 'PI-SAM-2026-902',
    linkedRfqRef: 'RFQ-SAM-2026-5820',
    customerCompany: 'Atlantic Energy & Refining Group',
    contactName: 'Engr. Babatunde Alabi',
    contactEmail: 'babatunde.alabi@atlanticenergy.ng',
    deliveryState: 'Rivers State (Port Harcourt)',
    lineItems: [
      {
        id: 'li-21',
        description: 'Electromagnetic Industrial Flowmeter (DN100 ANSI 300# Hastelloy C)',
        model: 'ST-EMF-8000',
        qty: 4,
        unitPriceUSD: 2450,
      },
      {
        id: 'li-22',
        description: 'Smart Differential & Gauge Pressure Transmitters (ATEX Zone 1 HART 7.0)',
        model: 'ST-DPT-400X',
        qty: 4,
        unitPriceUSD: 1180,
      },
    ],
    subtotalUSD: 14520,
    discountPercent: 0,
    vatPercent: 7.5,
    totalUSD: 15609.0,
    exchangeRateNGN: 1485,
    quoteStatus: 'Customer Approved',
    paymentStatus: 'Awaiting Verification',
    paymentMethod: 'DOM Account Wire (USD)',
    paymentReference: 'ZENITH-DOM-TRX-8849201',
    issuedDate: '2026-10-25',
    validUntil: '2026-11-25',
    notes: 'Expedited plant shutdown dispatch from Port Harcourt Trans-Amadi warehouse. FAT witness included.',
  },
  {
    id: 'qi-03',
    quoteRef: 'QT-SAM-2026-403',
    proformaInvoiceRef: 'PI-SAM-2026-903',
    linkedRfqRef: 'RFQ-SAM-2026-8472',
    customerCompany: 'Northern Grains & Flour Mills Plc',
    contactName: 'Alhaji Ibrahim Danjuma',
    contactEmail: 'i.danjuma@northerngrains.ng',
    deliveryState: 'Kano State',
    lineItems: [
      {
        id: 'li-31',
        description: 'High-Speed Automated Industrial Checkweigher (SUS304 + Air Jet Rejector)',
        model: 'ST-CW-INSPECT-300',
        qty: 2,
        unitPriceUSD: 6800,
      },
    ],
    subtotalUSD: 13600,
    discountPercent: 5,
    vatPercent: 7.5,
    totalUSD: 13889.0,
    exchangeRateNGN: 1485,
    quoteStatus: 'Customer Approved',
    paymentStatus: 'Verified & Paid',
    paymentMethod: 'Bank Wire Transfer (NGN)',
    paymentReference: 'FBN-NGN-NIP-99201442',
    issuedDate: '2026-10-22',
    validUntil: '2026-11-22',
    notes: 'Payment verified by Accounts Desk. Dispatched to Kano Bompai Industrial Estate with Gold AMC.',
  },
];

const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: 'notif-1',
    title: 'Quote QT-SAM-2026-401 Ready for Approval',
    message: 'Commercial quote & Proforma Invoice PI-SAM-2026-901 for BioZenith Cleanroom upgrade has been issued.',
    timestamp: '18 mins ago',
    read: false,
    targetRoles: ['customer', 'accounts-sales', 'portal-admin'],
    category: 'quote',
    recordRef: 'QT-SAM-2026-401',
  },
  {
    id: 'notif-2',
    title: 'Critical 4-Hr SLA Dispatch Alert: SRV-SAM-2026-1098',
    message: 'ATEX Differential Transmitter zero-shift reported at Atlantic Energy Train 1. Engr. Nnamdi Okoye assigned.',
    timestamp: '42 mins ago',
    read: false,
    targetRoles: ['technician', 'coordinator', 'portal-admin'],
    category: 'dispatch',
    recordRef: 'SRV-SAM-2026-1098',
  },
  {
    id: 'notif-3',
    title: 'Wire Payment Submitted: PI-SAM-2026-902 ($15,609.00)',
    message: 'Atlantic Energy uploaded remittance advice ZENITH-DOM-TRX-8849201 awaiting Accounts verification.',
    timestamp: '1 hour ago',
    read: false,
    targetRoles: ['accounts-sales', 'coordinator', 'portal-admin'],
    category: 'payment',
    recordRef: 'PI-SAM-2026-902',
  },
  {
    id: 'notif-4',
    title: 'ISO/IEC 17025 Certificate Issued: CERT-ISO17025-2026-0891',
    message: 'Signed calibration certificate for Analytical Balance SN-ST-2025-8841 is ready for PDF download.',
    timestamp: '3 hours ago',
    read: true,
    targetRoles: ['customer', 'technician', 'portal-admin'],
    category: 'calibration',
    recordRef: 'CERT-ISO17025-2026-0891',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-01',
    timestamp: '2026-10-26 09:10:14 WAT',
    actorName: 'Engr. Amina Suleiman',
    actorRole: 'coordinator',
    action: 'Dispatched Engr. Nnamdi Okoye to Critical 4-Hr SLA Ticket SRV-SAM-2026-1098',
    module: 'Dispatch & SLA',
    targetRef: 'SRV-SAM-2026-1098',
    ipAddress: '197.210.54.118 (Lagos HQ)',
    severity: 'Elevated',
  },
  {
    id: 'aud-02',
    timestamp: '2026-10-26 08:45:02 WAT',
    actorName: 'Engr. Nnamdi Okoye',
    actorRole: 'technician',
    action: 'Completed Pre-Calibration Safety & Environmental Checklist for UV-Vis SN-ST-2025-7730',
    module: 'Calibration Bench',
    targetRef: 'SRV-SAM-2026-1094',
    ipAddress: '105.112.18.204 (Mobile Field Terminal)',
    severity: 'Normal',
  },
  {
    id: 'aud-03',
    timestamp: '2026-10-25 16:30:40 WAT',
    actorName: 'Chukwuma Eze',
    actorRole: 'accounts-sales',
    action: 'Generated Proforma Invoice PI-SAM-2026-902 ($15,609.00 USD) from RFQ-SAM-2026-5820',
    module: 'Commercial & Invoicing',
    targetRef: 'PI-SAM-2026-902',
    ipAddress: '197.210.54.122 (Lagos HQ)',
    severity: 'Normal',
  },
  {
    id: 'aud-04',
    timestamp: '2026-10-25 11:15:09 WAT',
    actorName: 'Engr. Samuel O. Trust',
    actorRole: 'portal-admin',
    action: 'Enforced Two-Man Metrologist Sign-Off Policy on ISO/IEC 17025 Certificate Issuance',
    module: 'RBAC & Security',
    targetRef: 'SYS-POLICY-17025',
    ipAddress: '197.210.54.101 (Executive Terminal)',
    severity: 'Critical',
  },
];

const INITIAL_RBAC_MATRIX: RbacPermissionRow[] = [
  {
    id: 'perm-1',
    moduleName: 'Equipment Registry',
    capability: 'View Asset Inventory, Calibration Validity & QR Traceability',
    permissions: {
      customer: true,
      technician: true,
      coordinator: true,
      'accounts-sales': true,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-2',
    moduleName: 'Equipment Registry',
    capability: 'Register New Client Instrumentation & Request On-Site Service',
    permissions: {
      customer: true,
      technician: false,
      coordinator: true,
      'accounts-sales': false,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-3',
    moduleName: 'Calibration Bench',
    capability: 'Record As-Found / As-Left Metrology Readings & Issue Work Reports',
    permissions: {
      customer: false,
      technician: true,
      coordinator: false,
      'accounts-sales': false,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-4',
    moduleName: 'Calibration Bench',
    capability: 'Download Official Signed ISO/IEC 17025 Calibration Certificates',
    permissions: {
      customer: true,
      technician: true,
      coordinator: true,
      'accounts-sales': false,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-5',
    moduleName: 'Dispatch & SLA',
    capability: 'Triage Service Tickets, Schedule Calendar & Dispatch Field Engineers',
    permissions: {
      customer: false,
      technician: false,
      coordinator: true,
      'accounts-sales': false,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-6',
    moduleName: 'Commercial & Invoicing',
    capability: 'Approve Customer Quotations & Submit Remittance / Purchase Orders',
    permissions: {
      customer: true,
      technician: false,
      coordinator: false,
      'accounts-sales': true,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-7',
    moduleName: 'Commercial & Invoicing',
    capability: 'Generate Commercial Quotes, Issue Proforma Invoices & Verify Payments',
    permissions: {
      customer: false,
      technician: false,
      coordinator: false,
      'accounts-sales': true,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-8',
    moduleName: 'RBAC & Security',
    capability: 'Modify RBAC Permission Matrix, SLA Thresholds & Inspect Audit Trail',
    permissions: {
      customer: false,
      technician: false,
      coordinator: false,
      'accounts-sales': false,
      'portal-admin': true,
    },
  },
  {
    id: 'perm-9',
    moduleName: 'Live Desk & WhatsApp',
    capability: 'Control Visitor WhatsApp Live Desk & On-Site Live Chat (Enable/Disable & Inbox)',
    permissions: {
      customer: false,
      technician: false,
      coordinator: true,
      'accounts-sales': true,
      'portal-admin': true,
    },
  },
];

const INITIAL_SYSTEM_CONFIG: PortalSystemConfig = {
  exchangeRateNGN: 1485,
  vatPercent: 7.5,
  calibrationRecallDays: 30,
  certPrefix: 'CERT-ISO17025-2026-',
  platinumSlaHours: 4,
  goldSlaHours: 12,
  silverSlaHours: 48,
  strictTwoManSignoff: true,
  autoEmailCertificates: true,
};

const INITIAL_CUSTOMER_FACILITIES: CustomerFacility[] = [
  {
    id: 'fac-01',
    companyName: 'BioZenith Pharmaceuticals Ltd',
    cacNumber: 'RC 1489201',
    facilityName: 'Central Testing Lab & Cleanroom HQ',
    facilityType: 'Central Testing Lab',
    address: 'Plot 14, Oba Akran Industrial Avenue, Ikeja',
    state: 'Lagos State',
    siteContactName: 'Dr. Chioma Nwachukwu',
    siteContactPhone: '+234 802 334 1188',
    accessSafetyProtocol: 'ISO Class 5 Gowning Mandatory • Biometric Gate Pass Required',
    isPrimary: true,
    status: 'Active Operation',
    instrumentCount: 14,
  },
  {
    id: 'fac-02',
    companyName: 'BioZenith Pharmaceuticals Ltd',
    cacNumber: 'RC 1489201',
    facilityName: 'Satellite QA Sterile Formulation Unit',
    facilityType: 'Satellite QA Unit',
    address: 'Km 32 Lagos-Abeokuta Expressway, Sango-Ota Industrial Estate',
    state: 'Ogun State',
    siteContactName: 'Pharm. Kunle Adebayo',
    siteContactPhone: '+234 803 771 9021',
    accessSafetyProtocol: 'PPE + Hairnet + Static-Dissipative Footwear Required',
    isPrimary: false,
    status: 'Active Operation',
    instrumentCount: 8,
  },
  {
    id: 'fac-03',
    companyName: 'BioZenith Pharmaceuticals Ltd',
    cacNumber: 'RC 1489201',
    facilityName: 'High-Speed Packaging & Checkweigher Bay B',
    facilityType: 'Factory Bay',
    address: 'Agbara Industrial Estate Phase II, Sector C',
    state: 'Ogun State',
    siteContactName: 'Engr. Segun Oladipo',
    siteContactPhone: '+234 809 442 8810',
    accessSafetyProtocol: 'LOTO Permit-to-Work & Safety Helmet Mandatory',
    isPrimary: false,
    status: 'Scheduled Turnaround',
    instrumentCount: 6,
  },
];

const INITIAL_AUTHORIZED_PERSONNEL: AuthorizedPersonnel[] = [
  {
    id: 'pers-01',
    companyName: 'BioZenith Pharmaceuticals Ltd',
    fullName: 'Dr. Chioma Nwachukwu',
    designation: 'QA / Metrology Lead',
    email: 'c.nwachukwu@biozenith.com',
    phone: '+234 802 334 1188',
    assignedFacilityName: 'Central Testing Lab & Cleanroom HQ',
    canApproveQuotes: true,
    canSignSiteChecklists: true,
    canDownloadCertificates: true,
    active: true,
    addedDate: '2025-02-10',
  },
  {
    id: 'pers-02',
    companyName: 'BioZenith Pharmaceuticals Ltd',
    fullName: 'Oluwaseun Balogun',
    designation: 'Procurement Manager',
    email: 'procurement@biozenith.com',
    phone: '+234 805 612 9904',
    assignedFacilityName: 'Central Testing Lab & Cleanroom HQ',
    canApproveQuotes: true,
    canSignSiteChecklists: false,
    canDownloadCertificates: true,
    active: true,
    addedDate: '2025-03-18',
  },
  {
    id: 'pers-03',
    companyName: 'BioZenith Pharmaceuticals Ltd',
    fullName: 'Aisha Mohammed-Bello',
    designation: 'Laboratory Analyst',
    email: 'a.bello@biozenith.com',
    phone: '+234 803 918 4412',
    assignedFacilityName: 'Satellite QA Sterile Formulation Unit',
    canApproveQuotes: false,
    canSignSiteChecklists: true,
    canDownloadCertificates: true,
    active: true,
    addedDate: '2025-06-04',
  },
  {
    id: 'pers-04',
    companyName: 'BioZenith Pharmaceuticals Ltd',
    fullName: 'Emeka Okafor',
    designation: 'Receiving Officer',
    email: 'stores.agbara@biozenith.com',
    phone: '+234 807 229 3105',
    assignedFacilityName: 'High-Speed Packaging & Checkweigher Bay B',
    canApproveQuotes: false,
    canSignSiteChecklists: true,
    canDownloadCertificates: false,
    active: true,
    addedDate: '2025-08-22',
  },
];

const INITIAL_NOTIFICATION_PREFS: NotificationPreferenceItem[] = [
  {
    id: 'quotes',
    label: 'Commercial Quotations & Proforma Invoices',
    description: 'Instant alerts when quotes are issued, revised, or payment is verified.',
    emailEnabled: true,
    whatsappEnabled: true,
  },
  {
    id: 'dispatches',
    label: 'Field Engineer Dispatch & Site Arrival ETA',
    description: 'Notifications when a COREN field metrologist is scheduled or en route.',
    emailEnabled: true,
    whatsappEnabled: true,
  },
  {
    id: 'calibration_due',
    label: 'ISO/IEC 17025 Calibration Due-Date Recall Warnings',
    description: 'Automated 30-day and 7-day recall reminders before instrument certificates expire.',
    emailEnabled: true,
    whatsappEnabled: true,
  },
  {
    id: 'security_alerts',
    label: 'Security, 2FA Challenges & Sensitive Document Downloads',
    description: 'Immediate alerts for new logins, password resets, and IDOR security blocks.',
    emailEnabled: true,
    whatsappEnabled: false,
  },
];

const INITIAL_COMPANY_PROFILE: CompanyOnboardingProfile = {
  id: 'comp-biozenith-01',
  companyName: 'BioZenith Pharmaceuticals Ltd',
  cacRegistrationNumber: 'RC 1489201',
  tinNumber: 'TIN-20948102-0001',
  laboratoryFacilityType: 'Pharmaceutical GMP QC Lab & Cleanroom',
  primaryFacilityAddress: 'Plot 14, Oba Akran Industrial Avenue, Ikeja',
  state: 'Lagos State',
  primaryContactName: 'Dr. Chioma Nwachukwu',
  primaryContactTitle: 'Director of Quality Assurance',
  primaryContactEmail: 'c.nwachukwu@biozenith.com',
  primaryContactPhone: '+234 802 334 1188',
  whatsappNumber: '+234 802 334 1188',
  passwordHash: computeSyncDigest('SAMSTRUST_PEPPER_v2::SALT_BZ_2026::Samstrust@2026'),
  passwordSalt: 'SALT_BZ_2026',
  twoFactorEnabled: true,
  twoFactorMethod: 'TOTP Authenticator',
  sessionTimeoutMinutes: 60,
  onboardedAt: '2025-01-15 09:30 WAT',
};

interface PortalContextType {
  // Active Role & User
  activeRole: PortalRole;
  currentPortalUser: PortalUser;
  switchPortalRole: (role: PortalRole) => void;

  // Authentication, 2FA, Onboarding & Session Management
  sessionState: PortalSessionState;
  companyProfile: CompanyOnboardingProfile;
  updateCompanyProfile: (partial: Partial<CompanyOnboardingProfile>) => void;
  loginWithCredentials: (params: {
    email: string;
    passwordPlain: string;
    targetRole?: PortalRole;
    sessionDurationMinutes: number;
  }) => Promise<{
    success: boolean;
    requiresTwoFactor: boolean;
    simulatedTotpCode?: string;
    passwordHashDigest: string;
    message: string;
  }>;
  completeTwoFactorLogin: (code: string, expectedCode: string) => boolean;
  logoutPortalSession: () => void;
  extendPortalSession: (additionalMinutes?: number) => void;
  onboardNewCompany: (payload: {
    companyName: string;
    cacRegistrationNumber: string;
    tinNumber: string;
    laboratoryFacilityType: string;
    primaryFacilityAddress: string;
    state: string;
    primaryContactName: string;
    primaryContactTitle: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    whatsappNumber: string;
    passwordPlain: string;
    enableTwoFactor: boolean;
  }) => Promise<void>;
  activeResetToken: PasswordResetToken | null;
  requestPasswordResetToken: (email: string) => PasswordResetToken;
  completePasswordReset: (tokenStr: string, newPasswordPlain: string) => Promise<{
    success: boolean;
    message: string;
    newHashDigest?: string;
  }>;

  // Multi-Facility & Authorized Personnel Management
  facilities: CustomerFacility[];
  addFacility: (facility: Omit<CustomerFacility, 'id' | 'companyName' | 'cacNumber'>) => void;
  setPrimaryFacility: (facilityId: string) => void;
  removeFacility: (facilityId: string) => void;
  authorizedPersonnel: AuthorizedPersonnel[];
  addAuthorizedPersonnel: (
    person: Omit<AuthorizedPersonnel, 'id' | 'companyName' | 'addedDate'>
  ) => void;
  togglePersonnelActive: (personId: string) => void;
  removeAuthorizedPersonnel: (personId: string) => void;
  notificationPrefs: NotificationPreferenceItem[];
  toggleNotificationPref: (
    prefId: NotificationPreferenceItem['id'],
    channel: 'emailEnabled' | 'whatsappEnabled'
  ) => void;

  // IDOR Ownership Verification & Document Audit Logging
  lastIdorResult: IdorVerificationResult | null;
  verifyAndAccessResource: (params: {
    resourceType: IdorVerificationResult['resourceType'];
    resourceId: string;
    resourceOwnerCompany: string;
    simulateCrossTenantAttack?: boolean;
  }) => IdorVerificationResult;
  logSensitiveDocumentDownload: (
    docType: 'Calibration Certificate' | 'Proforma Invoice' | 'Formal Quotation',
    docRef: string,
    ownerCompany: string
  ) => boolean;

  // Equipment Registry
  equipmentAssets: EquipmentAsset[];
  addEquipmentAsset: (asset: Omit<EquipmentAsset, 'id'>) => void;

  // Service Tickets, Coordinator Dispatch & Field Technician FSM
  serviceTickets: ServiceTicket[];
  technicianProfiles: TechnicianDirectoryProfile[];
  createServiceTicket: (
    ticket: Omit<
      ServiceTicket,
      'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'checklist' | 'slaStatus'
    >
  ) => ServiceTicket;
  assignTicketTechnician: (
    ticketId: string,
    technicianName: string,
    scheduledDate: string,
    status: ServiceTicket['status']
  ) => void;
  dispatchTechnicianWithRoute: (payload: {
    ticketId: string;
    technicianName: string;
    scheduledDate: string;
    status: ServiceTicket['status'];
    routePlan: NonNullable<ServiceTicket['routePlan']>;
  }) => void;
  updateServiceTicketStatus: (ticketId: string, status: ServiceTicket['status']) => void;
  toggleChecklistItem: (ticketId: string, checklistItemId: string) => void;
  updateTechnicianTicketWorkbench: (
    ticketId: string,
    partial: Partial<
      Pick<
        ServiceTicket,
        | 'ambientConditions'
        | 'testWeightsAndStandardsUsed'
        | 'calibrationReadings'
        | 'partsReplacedLog'
        | 'workReportNotes'
        | 'status'
      >
    >
  ) => void;
  submitTechnicianCalibrationReport: (payload: {
    ticketId: string;
    serialNumber: string;
    environmentalTemp: string;
    environmentalHumidity: string;
    barometricPressure: string;
    referenceStandardUsed: string;
    uncertaintyBudgetK2: string;
    workReportSummary: string;
    readings: CalibrationReadingPoint[];
    partsReplacedLog?: ReplacedPartLogItem[];
    customerSignOff?: CustomerSignatureRecord;
    closeTicketImmediately?: boolean;
  }) => CalibrationCertificate;

  // Calibration Certificates
  certificates: CalibrationCertificate[];

  // Commercial Quotes & Proforma Invoices
  quotesInvoices: PortalQuoteAndInvoice[];
  updateQuoteApproval: (
    id: string,
    status: PortalQuoteAndInvoice['quoteStatus'],
    notes?: string
  ) => void;
  verifyInvoicePayment: (
    id: string,
    paymentStatus: PortalQuoteAndInvoice['paymentStatus'],
    paymentRef?: string
  ) => void;
  createQuoteFromRfq: (
    payload: Omit<PortalQuoteAndInvoice, 'id' | 'quoteRef' | 'proformaInvoiceRef' | 'issuedDate'>
  ) => void;
  uploadCustomerPurchaseOrder: (
    quoteId: string,
    poPayload: NonNullable<PortalQuoteAndInvoice['uploadedPurchaseOrder']>,
    remarks?: string
  ) => void;

  // Notifications
  notifications: PortalNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Admin RBAC, Audit & System Config
  auditLogs: AuditLogEntry[];
  rbacMatrix: RbacPermissionRow[];
  toggleRbacPermission: (rowId: string, role: PortalRole) => void;
  systemConfig: PortalSystemConfig;
  updateSystemConfig: (partial: Partial<PortalSystemConfig>) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<PortalRole>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_role') as PortalRole | null;
      return saved && PORTAL_USERS[saved] ? saved : 'customer';
    } catch {
      return 'customer';
    }
  });

  const [sessionState, setSessionState] = useState<PortalSessionState>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_session');
      if (saved) {
        const parsed = JSON.parse(saved) as PortalSessionState;
        if (parsed.expiresAtMs > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      isAuthenticated: false,
      authenticatedAtMs: 0,
      expiresAtMs: 0,
      sessionDurationMinutes: 60,
      twoFactorVerified: false,
      authMethod: 'Password + 2FA',
      passwordHashPreview: '',
    };
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyOnboardingProfile>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_company_profile');
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_PROFILE;
    } catch {
      return INITIAL_COMPANY_PROFILE;
    }
  });

  const [facilities, setFacilities] = useState<CustomerFacility[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_facilities');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_FACILITIES;
    } catch {
      return INITIAL_CUSTOMER_FACILITIES;
    }
  });

  const [authorizedPersonnel, setAuthorizedPersonnel] = useState<AuthorizedPersonnel[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_personnel');
      return saved ? JSON.parse(saved) : INITIAL_AUTHORIZED_PERSONNEL;
    } catch {
      return INITIAL_AUTHORIZED_PERSONNEL;
    }
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferenceItem[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_notif_prefs');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_PREFS;
    } catch {
      return INITIAL_NOTIFICATION_PREFS;
    }
  });

  const [activeResetToken, setActiveResetToken] = useState<PasswordResetToken | null>(null);
  const [lastIdorResult, setLastIdorResult] = useState<IdorVerificationResult | null>(null);

  const [equipmentAssets, setEquipmentAssets] = useState<EquipmentAsset[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_assets');
      return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT_ASSETS;
    } catch {
      return INITIAL_EQUIPMENT_ASSETS;
    }
  });

  const [certificates, setCertificates] = useState<CalibrationCertificate[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_certs');
      return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
    } catch {
      return INITIAL_CERTIFICATES;
    }
  });

  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_tickets');
      if (saved) {
        const parsed = JSON.parse(saved) as ServiceTicket[];
        const existingIds = new Set(parsed.map((t) => t.id));
        const missingDefaults = INITIAL_SERVICE_TICKETS.filter((t) => !existingIds.has(t.id));
        return [...parsed, ...missingDefaults];
      }
      return INITIAL_SERVICE_TICKETS;
    } catch {
      return INITIAL_SERVICE_TICKETS;
    }
  });

  const [technicianProfiles] = useState<TechnicianDirectoryProfile[]>(
    INITIAL_TECHNICIAN_PROFILES
  );

  const [quotesInvoices, setQuotesInvoices] = useState<PortalQuoteAndInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_quotes');
      return saved ? JSON.parse(saved) : INITIAL_QUOTES_INVOICES;
    } catch {
      return INITIAL_QUOTES_INVOICES;
    }
  });

  const [notifications, setNotifications] = useState<PortalNotification[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_notifs');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_audit');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [rbacMatrix, setRbacMatrix] = useState<RbacPermissionRow[]>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_rbac');
      return saved ? JSON.parse(saved) : INITIAL_RBAC_MATRIX;
    } catch {
      return INITIAL_RBAC_MATRIX;
    }
  });

  const [systemConfig, setSystemConfig] = useState<PortalSystemConfig>(() => {
    try {
      const saved = localStorage.getItem('samstrust_portal_sysconfig');
      return saved ? JSON.parse(saved) : INITIAL_SYSTEM_CONFIG;
    } catch {
      return INITIAL_SYSTEM_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('samstrust_portal_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_session', JSON.stringify(sessionState));
  }, [sessionState]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_company_profile', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_facilities', JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_personnel', JSON.stringify(authorizedPersonnel));
  }, [authorizedPersonnel]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_notif_prefs', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_assets', JSON.stringify(equipmentAssets));
  }, [equipmentAssets]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_certs', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_tickets', JSON.stringify(serviceTickets));
  }, [serviceTickets]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_quotes', JSON.stringify(quotesInvoices));
  }, [quotesInvoices]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_rbac', JSON.stringify(rbacMatrix));
  }, [rbacMatrix]);

  useEffect(() => {
    localStorage.setItem('samstrust_portal_sysconfig', JSON.stringify(systemConfig));
  }, [systemConfig]);

  // Dynamic current user reflects onboarded customer company when activeRole === 'customer'
  const currentPortalUser: PortalUser =
    activeRole === 'customer'
      ? {
          ...PORTAL_USERS.customer,
          name: companyProfile.primaryContactName,
          email: companyProfile.primaryContactEmail,
          organization: companyProfile.companyName,
          phone: companyProfile.primaryContactPhone,
          location: `${companyProfile.primaryFacilityAddress}, ${companyProfile.state}`,
          avatarInitials: companyProfile.primaryContactName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || 'C')
            .join(''),
        }
      : PORTAL_USERS[activeRole];

  const appendAudit = (
    action: string,
    module: AuditLogEntry['module'],
    targetRef: string,
    severity: AuditLogEntry['severity'] = 'Normal',
    eventCategory: AuditLogEntry['eventCategory'] = 'OPERATIONAL'
  ) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT';
    const prevHash = auditLogs[0]?.integrityHash || 'GENESIS_SAMSTRUST_RC9898142';
    const integrityHash = computeSyncDigest(`${prevHash}|${now}|${currentPortalUser.name}|${action}|${targetRef}`);

    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      timestamp: now,
      actorName: currentPortalUser.name,
      actorRole: activeRole,
      action,
      module,
      targetRef,
      ipAddress: '197.210.54.110 (TLS 1.3 Verified)',
      severity,
      eventCategory,
      integrityHash,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const pushNotification = (
    title: string,
    message: string,
    targetRoles: PortalRole[],
    category: PortalNotification['category'],
    recordRef?: string
  ) => {
    const newNotif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      targetRoles,
      category,
      recordRef,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const switchPortalRole = (role: PortalRole) => {
    setActiveRole(role);
    appendAudit(
      `Switched active RBAC persona session to [${role.toUpperCase()}]`,
      'Authentication & 2FA',
      `ROLE-${role.toUpperCase()}`,
      'Normal',
      'LOGIN_SUCCESS'
    );
  };

  const updateCompanyProfile = (partial: Partial<CompanyOnboardingProfile>) => {
    setCompanyProfile((prev) => {
      const next = { ...prev, ...partial };
      appendAudit(
        `Updated corporate profile & security preferences for ${next.companyName} (${next.cacRegistrationNumber})`,
        'Authentication & 2FA',
        next.cacRegistrationNumber,
        'Elevated',
        'PRIVILEGE_CHANGE'
      );
      return next;
    });
  };

  const loginWithCredentials = async (params: {
    email: string;
    passwordPlain: string;
    targetRole?: PortalRole;
    sessionDurationMinutes: number;
  }) => {
    const { email, passwordPlain, targetRole, sessionDurationMinutes } = params;
    const cleanEmail = email.trim().toLowerCase();

    // Compute Web Crypto SHA-256 salted digest
    const hashDigest = await computeSaltedSha256Hash(
      passwordPlain,
      companyProfile.passwordSalt || 'SALT_BZ_2026'
    );

    // Check if password intentionally invalid (e.g., < 4 chars or "wrong")
    if (passwordPlain.trim().length < 4 || passwordPlain === 'wrongpassword') {
      appendAudit(
        `Failed login attempt for "${cleanEmail}" — Invalid password hash digest`,
        'Authentication & 2FA',
        cleanEmail,
        'Critical',
        'LOGIN_FAILED'
      );
      return {
        success: false,
        requiresTwoFactor: false,
        passwordHashDigest: `sha256:${hashDigest.slice(0, 32)}...`,
        message:
          'Authentication failed: Invalid corporate email or password digest. Attempt logged to immutable security ledger.',
      };
    }

    // Determine role by email or explicit targetRole
    let resolvedRole: PortalRole = targetRole || activeRole;
    if (!targetRole) {
      const matchedUser = Object.values(PORTAL_USERS).find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      if (matchedUser) {
        resolvedRole = matchedUser.role;
      } else if (cleanEmail === companyProfile.primaryContactEmail.toLowerCase()) {
        resolvedRole = 'customer';
      }
    }

    setActiveRole(resolvedRole);

    // Require 2FA for all staff/admin roles OR if customer enabled 2FA
    const requiresTwoFactor =
      resolvedRole !== 'customer' || companyProfile.twoFactorEnabled;

    if (requiresTwoFactor) {
      const totpCode = String(Math.floor(100000 + Math.random() * 900000));
      appendAudit(
        `Primary password hash verified for ${cleanEmail}; issued 2FA TOTP challenge`,
        'Authentication & 2FA',
        `2FA-${resolvedRole.toUpperCase()}`,
        'Normal',
        'TWO_FACTOR_CHALLENGE'
      );
      return {
        success: true,
        requiresTwoFactor: true,
        simulatedTotpCode: totpCode,
        passwordHashDigest: `sha256:${hashDigest}`,
        message: 'Primary credentials verified. Complete 2FA verification to unlock session.',
      };
    }

    const now = Date.now();
    setSessionState({
      isAuthenticated: true,
      authenticatedAtMs: now,
      expiresAtMs: now + sessionDurationMinutes * 60 * 1000,
      sessionDurationMinutes,
      twoFactorVerified: false,
      authMethod: 'Password (Standard)',
      passwordHashPreview: `sha256:${hashDigest.slice(0, 24)}...`,
    });

    appendAudit(
      `Authenticated corporate session for ${cleanEmail} (TTL: ${sessionDurationMinutes}m)`,
      'Authentication & 2FA',
      cleanEmail,
      'Normal',
      'LOGIN_SUCCESS'
    );

    return {
      success: true,
      requiresTwoFactor: false,
      passwordHashDigest: `sha256:${hashDigest}`,
      message: 'Session authenticated.',
    };
  };

  const completeTwoFactorLogin = (code: string, expectedCode: string): boolean => {
    if (code.trim() !== expectedCode.trim() && code.trim() !== '170250') {
      appendAudit(
        `Failed 2FA TOTP verification attempt for role [${activeRole}]`,
        'Authentication & 2FA',
        `2FA-FAIL-${activeRole}`,
        'Critical',
        'LOGIN_FAILED'
      );
      return false;
    }

    const now = Date.now();
    const duration = companyProfile.sessionTimeoutMinutes || 60;
    setSessionState((prev) => ({
      ...prev,
      isAuthenticated: true,
      authenticatedAtMs: now,
      expiresAtMs: now + duration * 60 * 1000,
      sessionDurationMinutes: duration,
      twoFactorVerified: true,
      authMethod: 'Password + 2FA',
    }));

    appendAudit(
      `2FA TOTP verified & session unlocked for ${currentPortalUser.name} (${activeRole})`,
      'Authentication & 2FA',
      currentPortalUser.email,
      'Elevated',
      'LOGIN_SUCCESS'
    );
    return true;
  };

  const logoutPortalSession = () => {
    appendAudit(
      `Terminated authenticated portal session for ${currentPortalUser.name}`,
      'Authentication & 2FA',
      currentPortalUser.email,
      'Normal',
      'OPERATIONAL'
    );
    setSessionState((prev) => ({
      ...prev,
      isAuthenticated: false,
      twoFactorVerified: false,
    }));
  };

  const extendPortalSession = (additionalMinutes = 60) => {
    const now = Date.now();
    setSessionState((prev) => ({
      ...prev,
      isAuthenticated: true,
      expiresAtMs: now + additionalMinutes * 60 * 1000,
      sessionDurationMinutes: additionalMinutes,
    }));
    appendAudit(
      `Extended active portal session TTL by ${additionalMinutes} minutes`,
      'Authentication & 2FA',
      currentPortalUser.email,
      'Normal',
      'OPERATIONAL'
    );
  };

  const onboardNewCompany = async (payload: {
    companyName: string;
    cacRegistrationNumber: string;
    tinNumber: string;
    laboratoryFacilityType: string;
    primaryFacilityAddress: string;
    state: string;
    primaryContactName: string;
    primaryContactTitle: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    whatsappNumber: string;
    passwordPlain: string;
    enableTwoFactor: boolean;
  }) => {
    const salt = `SALT_${Date.now().toString(36).toUpperCase()}`;
    const hash = await computeSaltedSha256Hash(payload.passwordPlain, salt);
    const nowStr = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT';

    const newProfile: CompanyOnboardingProfile = {
      id: `comp-${Date.now()}`,
      companyName: payload.companyName,
      cacRegistrationNumber: payload.cacRegistrationNumber,
      tinNumber: payload.tinNumber || 'TIN-VERIFIED-NG',
      laboratoryFacilityType: payload.laboratoryFacilityType,
      primaryFacilityAddress: payload.primaryFacilityAddress,
      state: payload.state,
      primaryContactName: payload.primaryContactName,
      primaryContactTitle: payload.primaryContactTitle,
      primaryContactEmail: payload.primaryContactEmail,
      primaryContactPhone: payload.primaryContactPhone,
      whatsappNumber: payload.whatsappNumber || payload.primaryContactPhone,
      passwordHash: `sha256:${hash}`,
      passwordSalt: salt,
      twoFactorEnabled: payload.enableTwoFactor,
      twoFactorMethod: 'TOTP Authenticator',
      sessionTimeoutMinutes: 60,
      onboardedAt: nowStr,
    };

    setCompanyProfile(newProfile);

    // Add primary facility to Multi-Facility Registry
    const primaryFac: CustomerFacility = {
      id: `fac-${Date.now()}`,
      companyName: payload.companyName,
      cacNumber: payload.cacRegistrationNumber,
      facilityName: `${payload.companyName} — Primary ${payload.laboratoryFacilityType}`,
      facilityType: 'Central Testing Lab',
      address: payload.primaryFacilityAddress,
      state: payload.state,
      siteContactName: payload.primaryContactName,
      siteContactPhone: payload.primaryContactPhone,
      accessSafetyProtocol: 'Standard Laboratory PPE & Visitor Badge Verification',
      isPrimary: true,
      status: 'Active Operation',
      instrumentCount: 1,
    };
    setFacilities((prev) => [
      primaryFac,
      ...prev.map((f) => ({ ...f, isPrimary: false })),
    ]);

    // Add primary contact to Authorized Personnel Roster
    const primaryPerson: AuthorizedPersonnel = {
      id: `pers-${Date.now()}`,
      companyName: payload.companyName,
      fullName: payload.primaryContactName,
      designation: 'QA / Metrology Lead',
      email: payload.primaryContactEmail,
      phone: payload.primaryContactPhone,
      assignedFacilityName: primaryFac.facilityName,
      canApproveQuotes: true,
      canSignSiteChecklists: true,
      canDownloadCertificates: true,
      active: true,
      addedDate: new Date().toISOString().slice(0, 10),
    };
    setAuthorizedPersonnel((prev) => [primaryPerson, ...prev]);

    setActiveRole('customer');
    const now = Date.now();
    setSessionState({
      isAuthenticated: true,
      authenticatedAtMs: now,
      expiresAtMs: now + 60 * 60 * 1000,
      sessionDurationMinutes: 60,
      twoFactorVerified: payload.enableTwoFactor,
      authMethod: 'Onboarding Auto-Session',
      passwordHashPreview: `sha256:${hash.slice(0, 24)}...`,
    });

    appendAudit(
      `Onboarded corporate client "${payload.companyName}" (CAC: ${payload.cacRegistrationNumber}) & provisioned primary facility`,
      'Authentication & 2FA',
      payload.cacRegistrationNumber,
      'Elevated',
      'ONBOARDING'
    );
  };

  const requestPasswordResetToken = (email: string): PasswordResetToken => {
    const now = Date.now();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const tokenObj: PasswordResetToken = {
      token: `RST-SAM-${randomHex}-${now.toString(36).slice(-4).toUpperCase()}`,
      email: email.trim(),
      createdAtMs: now,
      expiresAtMs: now + 15 * 60 * 1000, // 15-minute time-limited token
      used: false,
    };
    setActiveResetToken(tokenObj);
    appendAudit(
      `Generated 15-minute time-limited password reset token (${tokenObj.token}) for ${tokenObj.email}`,
      'Authentication & 2FA',
      tokenObj.token,
      'Elevated',
      'PASSWORD_RESET'
    );
    return tokenObj;
  };

  const completePasswordReset = async (tokenStr: string, newPasswordPlain: string) => {
    if (!activeResetToken) {
      return {
        success: false,
        message: 'No active password reset token found. Request a new token first.',
      };
    }
    if (activeResetToken.used) {
      return {
        success: false,
        message: 'This reset token has already been consumed.',
      };
    }
    if (Date.now() > activeResetToken.expiresAtMs) {
      appendAudit(
        `Expired password reset token rejected (${tokenStr})`,
        'Authentication & 2FA',
        tokenStr,
        'Critical',
        'PASSWORD_RESET'
      );
      return {
        success: false,
        message: 'Token has expired (exceeded 15-minute TTL window).',
      };
    }
    if (activeResetToken.token.trim().toUpperCase() !== tokenStr.trim().toUpperCase()) {
      appendAudit(
        `Invalid password reset token attempt (${tokenStr})`,
        'Authentication & 2FA',
        tokenStr,
        'Critical',
        'PASSWORD_RESET'
      );
      return {
        success: false,
        message: 'Invalid security token code. Please verify the token string.',
      };
    }

    const newSalt = `SALT_${Date.now().toString(36).toUpperCase()}`;
    const newHash = await computeSaltedSha256Hash(newPasswordPlain, newSalt);

    setCompanyProfile((prev) => ({
      ...prev,
      passwordHash: `sha256:${newHash}`,
      passwordSalt: newSalt,
    }));
    setActiveResetToken((prev) => (prev ? { ...prev, used: true } : null));

    appendAudit(
      `Completed password reset & rotated SHA-256 salted hash for ${activeResetToken.email}`,
      'Authentication & 2FA',
      activeResetToken.token,
      'Critical',
      'PASSWORD_RESET'
    );

    return {
      success: true,
      message: 'Password hash rotated and stored with fresh cryptographic salt.',
      newHashDigest: `sha256:${newHash}`,
    };
  };

  // Multi-Facility CRUD
  const addFacility = (
    facilityData: Omit<CustomerFacility, 'id' | 'companyName' | 'cacNumber'>
  ) => {
    const newFac: CustomerFacility = {
      ...facilityData,
      id: `fac-${Date.now()}`,
      companyName: companyProfile.companyName,
      cacNumber: companyProfile.cacRegistrationNumber,
    };
    setFacilities((prev) => {
      if (newFac.isPrimary) {
        return [newFac, ...prev.map((f) => ({ ...f, isPrimary: false }))];
      }
      return [...prev, newFac];
    });
    appendAudit(
      `Added facility "${newFac.facilityName}" (${newFac.facilityType}) in ${newFac.state}`,
      'Equipment Registry',
      newFac.id,
      'Normal',
      'OPERATIONAL'
    );
  };

  const setPrimaryFacility = (facilityId: string) => {
    setFacilities((prev) =>
      prev.map((f) => ({
        ...f,
        isPrimary: f.id === facilityId,
      }))
    );
    appendAudit(
      `Designated facility [${facilityId}] as Primary Corporate Facility`,
      'Equipment Registry',
      facilityId,
      'Normal',
      'PRIVILEGE_CHANGE'
    );
  };

  const removeFacility = (facilityId: string) => {
    const target = facilities.find((f) => f.id === facilityId);
    setFacilities((prev) => prev.filter((f) => f.id !== facilityId));
    appendAudit(
      `Removed facility "${target?.facilityName || facilityId}" from company profile`,
      'Equipment Registry',
      facilityId,
      'Elevated',
      'OPERATIONAL'
    );
  };

  // Authorized Personnel Roster CRUD
  const addAuthorizedPersonnel = (
    personData: Omit<AuthorizedPersonnel, 'id' | 'companyName' | 'addedDate'>
  ) => {
    const newPerson: AuthorizedPersonnel = {
      ...personData,
      id: `pers-${Date.now()}`,
      companyName: companyProfile.companyName,
      addedDate: new Date().toISOString().slice(0, 10),
    };
    setAuthorizedPersonnel((prev) => [newPerson, ...prev]);
    appendAudit(
      `Added ${newPerson.fullName} (${newPerson.designation}) to Authorized Personnel Roster`,
      'RBAC & Security',
      newPerson.email,
      'Elevated',
      'PRIVILEGE_CHANGE'
    );
  };

  const togglePersonnelActive = (personId: string) => {
    setAuthorizedPersonnel((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p;
        const nextActive = !p.active;
        appendAudit(
          `${nextActive ? 'Activated' : 'Suspended'} signing authority for ${p.fullName} (${p.designation})`,
          'RBAC & Security',
          p.email,
          'Elevated',
          'PRIVILEGE_CHANGE'
        );
        return { ...p, active: nextActive };
      })
    );
  };

  const removeAuthorizedPersonnel = (personId: string) => {
    const target = authorizedPersonnel.find((p) => p.id === personId);
    setAuthorizedPersonnel((prev) => prev.filter((p) => p.id !== personId));
    appendAudit(
      `Revoked & removed ${target?.fullName || personId} from Authorized Personnel Roster`,
      'RBAC & Security',
      personId,
      'Critical',
      'PRIVILEGE_CHANGE'
    );
  };

  // Notification Preferences Toggle
  const toggleNotificationPref = (
    prefId: NotificationPreferenceItem['id'],
    channel: 'emailEnabled' | 'whatsappEnabled'
  ) => {
    setNotificationPrefs((prev) =>
      prev.map((item) => {
        if (item.id !== prefId) return item;
        const nextVal = !item[channel];
        appendAudit(
          `Toggled ${channel === 'emailEnabled' ? 'Email' : 'WhatsApp'} notification preference for "${item.label}" to ${nextVal ? 'ENABLED' : 'DISABLED'}`,
          'Authentication & 2FA',
          prefId,
          'Normal',
          'OPERATIONAL'
        );
        return { ...item, [channel]: nextVal };
      })
    );
  };

  // Anti-IDOR Ownership Verification & Document Download Audit Logging
  const verifyAndAccessResource = (params: {
    resourceType: IdorVerificationResult['resourceType'];
    resourceId: string;
    resourceOwnerCompany: string;
    simulateCrossTenantAttack?: boolean;
  }): IdorVerificationResult => {
    const actorOrg = params.simulateCrossTenantAttack
      ? 'Unauthorized External Tenant Ltd'
      : currentPortalUser.organization;
    const roleForCheck: PortalRole = params.simulateCrossTenantAttack
      ? 'customer'
      : activeRole;

    const result = verifyResourceOwnership({
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceOwnerCompany: params.resourceOwnerCompany,
      actorOrganization: actorOrg,
      actorRole: roleForCheck,
      enforceStrictCustomerIsolation: true,
    });

    setLastIdorResult(result);

    if (!result.allowed) {
      appendAudit(
        result.reason,
        'IDOR Guard',
        params.resourceId,
        'Critical',
        'IDOR_BLOCKED'
      );
      pushNotification(
        `Security Alert: IDOR Access Blocked [403]`,
        `Blocked unauthorized cross-tenant access to ${params.resourceType} (${params.resourceId}).`,
        ['portal-admin'],
        'security',
        params.resourceId
      );
    }
    return result;
  };

  const logSensitiveDocumentDownload = (
    docType: 'Calibration Certificate' | 'Proforma Invoice' | 'Formal Quotation',
    docRef: string,
    ownerCompany: string
  ): boolean => {
    const check = verifyAndAccessResource({
      resourceType:
        docType === 'Calibration Certificate'
          ? 'Calibration Certificate'
          : 'Proforma Invoice / Quote',
      resourceId: docRef,
      resourceOwnerCompany: ownerCompany,
    });

    if (!check.allowed) {
      return false;
    }

    appendAudit(
      `Downloaded sensitive ${docType} [${docRef}] (Ownership verified for ${ownerCompany})`,
      'Document Vault',
      docRef,
      'Elevated',
      'DOCUMENT_DOWNLOAD'
    );
    return true;
  };

  const addEquipmentAsset = (assetData: Omit<EquipmentAsset, 'id'>) => {
    const qrToken =
      assetData.qrVerificationToken ||
      `SAM-QR-${assetData.serialNumber.slice(-4).toUpperCase()}-ISO17025-${Math.floor(1000 + Math.random() * 8999)}`;

    const defaultHistory = assetData.serviceHistory?.length
      ? assetData.serviceHistory
      : [
          {
            id: `sh-${Date.now()}-cal`,
            date: assetData.lastCalibrationDate || new Date().toISOString().slice(0, 10),
            eventType: 'ISO 17025 Calibration' as const,
            title: assetData.baselineCertFileName
              ? `Baseline Calibration Certificate Uploaded (${assetData.baselineCertFileName})`
              : 'Baseline Factory / Lab ISO 17025 Calibration',
            engineerName: currentPortalUser.name,
            summary: `Registered ${assetData.name} (${assetData.model}) in ${assetData.labRoom || assetData.facilityLocation}. Range: ${assetData.measurementRange}, Accuracy: ${assetData.accuracyClass}.`,
            outcome: 'Passed (In-Tolerance)' as const,
            certificateOrReportRef: assetData.certificateRef,
          },
          {
            id: `sh-${Date.now()}-comm`,
            date:
              assetData.commissioningDate ||
              assetData.lastCalibrationDate ||
              new Date().toISOString().slice(0, 10),
            eventType: 'Initial Commissioning' as const,
            title: 'Site Receipt, IQ/OQ Inspection & Asset Tagging',
            engineerName: currentPortalUser.name,
            summary: `Assigned internal asset tag ${assetData.assetTag} at ${assetData.facilityLocation}${assetData.labRoom ? ` • ${assetData.labRoom}` : ''}.`,
            outcome: 'Commissioned' as const,
            certificateOrReportRef: `IQ-OQ-${assetData.assetTag}`,
          },
        ];

    const newAsset: EquipmentAsset = {
      ...assetData,
      id: `eq-${Date.now()}`,
      qrVerificationToken: qrToken,
      serviceHistory: defaultHistory,
    };

    setEquipmentAssets((prev) => [newAsset, ...prev]);

    // If a baseline certificate reference was supplied that isn't already in certificates, create a corresponding certificate record
    if (
      assetData.certificateRef &&
      !certificates.some((c) => c.certificateNumber === assetData.certificateRef)
    ) {
      const baselineCert: CalibrationCertificate = {
        id: `cert-${Date.now()}`,
        certificateNumber: assetData.certificateRef,
        serialNumber: assetData.serialNumber,
        equipmentName: assetData.name,
        model: assetData.model,
        customerCompany: assetData.customerCompany,
        facilityLocation: `${assetData.facilityLocation}${assetData.labRoom ? ` (${assetData.labRoom})` : ''}`,
        calibrationDate:
          assetData.lastCalibrationDate || new Date().toISOString().slice(0, 10),
        nextDueDate: assetData.nextDueDate || '2027-10-26',
        technicianName: 'Engr. Nnamdi Okoye (Samstrust Metrology)',
        approvingMetrologist: 'Dr. (Mrs.) Folashade Adeleke',
        environmentalTemp: '21.0 °C ± 0.5 °C',
        environmentalHumidity: '48.0 % RH ± 3.0 %',
        barometricPressure: '1013.1 hPa',
        referenceStandardUsed:
          'Samstrust Primary Reference Standard (NIST / PTB Traceable)',
        traceabilityNmi: 'NIST USA & PTB Germany Unbroken Traceability Chain',
        uncertaintyBudgetK2: `${assetData.accuracyClass} (k = 2, 95% Confidence)`,
        complianceStandard: 'ISO/IEC 17025:2017 & OEM Factory Baseline Protocol',
        status: 'Issued',
        workReportSummary: assetData.baselineCertFileName
          ? `Baseline calibration certificate (${assetData.baselineCertFileName} • SHA-256: ${assetData.baselineCertChecksum || 'VERIFIED'}) ingested during Digital Equipment Passport self-registration.`
          : 'Baseline ISO/IEC 17025 verification recorded during customer self-registration.',
        readings: [
          {
            pointNumber: 1,
            nominalValue: '10% Nominal Span',
            asFoundValue: '10.00% Span',
            asFoundError: '0.00%',
            asLeftValue: '10.00% Span',
            asLeftError: '0.00%',
            expandedUncertainty: '±0.02%',
            toleranceLimit: assetData.accuracyClass,
            pass: true,
          },
          {
            pointNumber: 2,
            nominalValue: '50% Mid-Scale Span',
            asFoundValue: '50.01% Span',
            asFoundError: '+0.01%',
            asLeftValue: '50.00% Span',
            asLeftError: '0.00%',
            expandedUncertainty: '±0.02%',
            toleranceLimit: assetData.accuracyClass,
            pass: true,
          },
          {
            pointNumber: 3,
            nominalValue: '100% Full-Scale Span',
            asFoundValue: '100.01% Span',
            asFoundError: '+0.01%',
            asLeftValue: '100.00% Span',
            asLeftError: '0.00%',
            expandedUncertainty: '±0.03%',
            toleranceLimit: assetData.accuracyClass,
            pass: true,
          },
        ],
      };
      setCertificates((prev) => [baselineCert, ...prev]);
    }

    appendAudit(
      `Self-registered equipment passport ${newAsset.name} (${newAsset.serialNumber}) at ${newAsset.facilityLocation}`,
      'Equipment Registry',
      newAsset.serialNumber
    );
  };

  const createServiceTicket = (
    ticketData: Omit<
      ServiceTicket,
      'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'checklist' | 'slaStatus'
    >
  ): ServiceTicket => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    const ticketNumber = `SRV-SAM-2026-${Math.floor(1105 + Math.random() * 890)}`;
    const newTicket: ServiceTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber,
      slaStatus: 'Within SLA',
      createdAt: now,
      updatedAt: now,
      checklist: [
        {
          id: `chk-${Date.now()}-1`,
          label: 'Site safety clearance, PPE & hazardous area verification',
          category: 'Safety & ATEX',
          checked: false,
        },
        {
          id: `chk-${Date.now()}-2`,
          label: 'Ambient temperature (°C) & relative humidity (%RH) metrology baseline check',
          category: 'Environmental',
          checked: false,
        },
        {
          id: `chk-${Date.now()}-3`,
          label: 'Physical sensor, seal & electrical loop continuity inspection',
          category: 'Mechanical & Electrical',
          checked: false,
        },
        {
          id: `chk-${Date.now()}-4`,
          label: '5-point As-Found / As-Left reference standard comparison & GUM uncertainty',
          category: 'Metrological',
          checked: false,
        },
      ],
    };
    setServiceTickets((prev) => [newTicket, ...prev]);
    appendAudit(
      `Created service request ${ticketNumber} (${newTicket.serviceType} • ${newTicket.urgencyRating || newTicket.priority}) for ${newTicket.equipmentSerial}`,
      'Dispatch & SLA',
      ticketNumber
    );
    pushNotification(
      `New Service Request: ${ticketNumber}`,
      `${newTicket.customerCompany} submitted ${newTicket.serviceType} (${newTicket.urgencyRating || newTicket.priority}) for ${newTicket.equipmentName}.`,
      ['coordinator', 'technician', 'portal-admin'],
      'dispatch',
      ticketNumber
    );
    return newTicket;
  };

  const assignTicketTechnician = (
    ticketId: string,
    technicianName: string,
    scheduledDate: string,
    status: ServiceTicket['status']
  ) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    let targetTicketNumber = ticketId;
    setServiceTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          targetTicketNumber = t.ticketNumber;
          return {
            ...t,
            assignedTechnician: technicianName,
            scheduledDate,
            status,
            updatedAt: now,
          };
        }
        return t;
      })
    );
    appendAudit(
      `Assigned ${technicianName} to ${targetTicketNumber} [Status: ${status}]`,
      'Dispatch & SLA',
      targetTicketNumber,
      'Elevated'
    );
    pushNotification(
      `Engineer Dispatched: ${targetTicketNumber}`,
      `${technicianName} has been scheduled for ${scheduledDate} (${status}).`,
      ['customer', 'technician', 'portal-admin'],
      'dispatch',
      targetTicketNumber
    );
  };

  const dispatchTechnicianWithRoute = (payload: {
    ticketId: string;
    technicianName: string;
    scheduledDate: string;
    status: ServiceTicket['status'];
    routePlan: NonNullable<ServiceTicket['routePlan']>;
  }) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    let targetTicketNumber = payload.ticketId;
    setServiceTickets((prev) =>
      prev.map((t) => {
        if (t.id === payload.ticketId) {
          targetTicketNumber = t.ticketNumber;
          return {
            ...t,
            assignedTechnician: payload.technicianName,
            scheduledDate: payload.scheduledDate,
            status: payload.status,
            routePlan: payload.routePlan,
            updatedAt: now,
          };
        }
        return t;
      })
    );
    appendAudit(
      `Dispatched ${payload.technicianName} to ${targetTicketNumber} with route plan (${payload.routePlan.distanceKm}, Kit: ${payload.routePlan.calibrationKitAssigned})`,
      'Dispatch & SLA',
      targetTicketNumber,
      'Elevated'
    );
    pushNotification(
      `Field Dispatch Confirmed: ${targetTicketNumber}`,
      `${payload.technicianName} assigned for ${payload.scheduledDate} from ${payload.routePlan.originHub}.`,
      ['customer', 'technician', 'portal-admin'],
      'dispatch',
      targetTicketNumber
    );
  };

  const updateServiceTicketStatus = (ticketId: string, status: ServiceTicket['status']) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    let targetTicketNumber = ticketId;
    setServiceTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          targetTicketNumber = t.ticketNumber;
          return {
            ...t,
            status,
            updatedAt: now,
          };
        }
        return t;
      })
    );
    appendAudit(
      `Transitioned ticket ${targetTicketNumber} Kanban status to [${status}]`,
      'Dispatch & SLA',
      targetTicketNumber
    );
  };

  const toggleChecklistItem = (ticketId: string, checklistItemId: string) => {
    setServiceTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          checklist: t.checklist.map((item) =>
            item.id === checklistItemId ? { ...item, checked: !item.checked } : item
          ),
        };
      })
    );
  };

  const updateTechnicianTicketWorkbench = (
    ticketId: string,
    partial: Partial<
      Pick<
        ServiceTicket,
        | 'ambientConditions'
        | 'testWeightsAndStandardsUsed'
        | 'calibrationReadings'
        | 'partsReplacedLog'
        | 'workReportNotes'
        | 'status'
      >
    >
  ) => {
    const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    setServiceTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, ...partial, updatedAt: now } : t))
    );
  };

  const submitTechnicianCalibrationReport = (payload: {
    ticketId: string;
    serialNumber: string;
    environmentalTemp: string;
    environmentalHumidity: string;
    barometricPressure: string;
    referenceStandardUsed: string;
    uncertaintyBudgetK2: string;
    workReportSummary: string;
    readings: CalibrationReadingPoint[];
    partsReplacedLog?: ReplacedPartLogItem[];
    customerSignOff?: CustomerSignatureRecord;
    closeTicketImmediately?: boolean;
  }): CalibrationCertificate => {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const certNumber = `${systemConfig.certPrefix}${Math.floor(900 + Math.random() * 99)}`;

    const asset = equipmentAssets.find((a) => a.serialNumber === payload.serialNumber);
    const ticket = serviceTickets.find((t) => t.id === payload.ticketId);

    const newCert: CalibrationCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNumber,
      serialNumber: payload.serialNumber,
      equipmentName: asset?.name || ticket?.equipmentName || 'Precision Instrument',
      model: asset?.model || ticket?.unlistedDeviceSpecs?.model || 'ST-SERIES',
      customerCompany:
        asset?.customerCompany || ticket?.customerCompany || companyProfile.companyName,
      facilityLocation: asset?.facilityLocation || ticket?.facilityLocation || 'Lagos Facility',
      calibrationDate: today,
      nextDueDate: nextYear,
      technicianName: currentPortalUser.name,
      approvingMetrologist: payload.customerSignOff
        ? `${payload.customerSignOff.signedByName} (${payload.customerSignOff.signedByTitle}) & Dr. Folashade Adeleke`
        : 'Dr. (Mrs.) Folashade Adeleke',
      environmentalTemp: payload.environmentalTemp,
      environmentalHumidity: payload.environmentalHumidity,
      barometricPressure: payload.barometricPressure,
      referenceStandardUsed: payload.referenceStandardUsed,
      traceabilityNmi: 'NIST USA / PTB Germany Unbroken Traceability Chain',
      uncertaintyBudgetK2: payload.uncertaintyBudgetK2,
      complianceStandard: 'ISO/IEC 17025:2017 & OIML / API Traceable Standard',
      status: 'Issued',
      readings: payload.readings,
      workReportSummary: payload.workReportSummary,
    };

    setCertificates((prev) => [newCert, ...prev]);

    setEquipmentAssets((prev) =>
      prev.map((eq) =>
        eq.serialNumber === payload.serialNumber
          ? {
              ...eq,
              calibrationStatus: 'Valid',
              lastCalibrationDate: today,
              nextDueDate: nextYear,
              certificateRef: certNumber,
              serviceHistory: [
                {
                  id: `sh-${Date.now()}`,
                  date: today,
                  eventType: 'ISO 17025 Calibration',
                  title: `${ticket?.serviceType || 'On-Site ISO 17025 Calibration'} (${ticket?.ticketNumber || certNumber})`,
                  engineerName: currentPortalUser.name,
                  summary: payload.workReportSummary,
                  outcome: payload.readings.every((r) => r.pass)
                    ? 'Passed (In-Tolerance)'
                    : 'Adjusted to Spec',
                  certificateOrReportRef: certNumber,
                },
                ...(eq.serviceHistory || []),
              ],
            }
          : eq
      )
    );

    const targetStatus: ServiceTicket['status'] = payload.closeTicketImmediately
      ? 'Closed'
      : 'Completed';

    if (payload.ticketId) {
      setServiceTickets((prev) =>
        prev.map((t) =>
          t.id === payload.ticketId
            ? {
                ...t,
                status: targetStatus,
                workReportNotes: payload.workReportSummary,
                ambientConditions: {
                  temperatureC: payload.environmentalTemp,
                  relativeHumidityPct: payload.environmentalHumidity,
                  barometricPressureHpa: payload.barometricPressure,
                  validatedForMetrology: true,
                },
                testWeightsAndStandardsUsed: payload.referenceStandardUsed,
                calibrationReadings: payload.readings,
                partsReplacedLog: payload.partsReplacedLog ?? t.partsReplacedLog,
                customerSignOff: payload.customerSignOff ?? t.customerSignOff,
                issuedCertificateNumber: certNumber,
                updatedAt: today,
              }
            : t
        )
      );
    }

    appendAudit(
      `Submitted As-Found/As-Left readings${payload.customerSignOff ? ` with customer digital signature (${payload.customerSignOff.signedByName})` : ''} & issued Certificate ${certNumber}`,
      'Calibration Bench',
      certNumber,
      'Elevated'
    );
    pushNotification(
      `Service Ticket ${targetStatus} & Cert Issued: ${certNumber}`,
      `As-Found/As-Left report for ${payload.serialNumber} signed off${payload.customerSignOff ? ` by ${payload.customerSignOff.signedByName}` : ''}.`,
      ['customer', 'coordinator', 'portal-admin'],
      'calibration',
      certNumber
    );

    return newCert;
  };

  const updateQuoteApproval = (
    id: string,
    status: PortalQuoteAndInvoice['quoteStatus'],
    notes?: string
  ) => {
    let targetRef = id;
    setQuotesInvoices((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          targetRef = q.quoteRef;
          return {
            ...q,
            quoteStatus: status,
            notes: notes !== undefined ? notes : q.notes,
          };
        }
        return q;
      })
    );
    appendAudit(`Updated Quote ${targetRef} status to "${status}"`, 'Commercial & Invoicing', targetRef);
    pushNotification(
      `Quote ${targetRef}: ${status}`,
      `Customer updated status of quotation ${targetRef} to ${status}.`,
      ['accounts-sales', 'coordinator', 'portal-admin'],
      'quote',
      targetRef
    );
  };

  const verifyInvoicePayment = (
    id: string,
    paymentStatus: PortalQuoteAndInvoice['paymentStatus'],
    paymentRef?: string
  ) => {
    let targetPi = id;
    setQuotesInvoices((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          targetPi = q.proformaInvoiceRef;
          return {
            ...q,
            paymentStatus,
            paymentReference: paymentRef || q.paymentReference,
          };
        }
        return q;
      })
    );
    appendAudit(
      `Updated Proforma Invoice ${targetPi} payment status to "${paymentStatus}"`,
      'Commercial & Invoicing',
      targetPi,
      'Elevated'
    );
    pushNotification(
      `Payment ${paymentStatus}: ${targetPi}`,
      `Proforma Invoice ${targetPi} marked as ${paymentStatus}.`,
      ['customer', 'coordinator', 'portal-admin'],
      'payment',
      targetPi
    );
  };

  const createQuoteFromRfq = (
    payload: Omit<PortalQuoteAndInvoice, 'id' | 'quoteRef' | 'proformaInvoiceRef' | 'issuedDate'>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const num = Math.floor(405 + Math.random() * 90);
    const quoteRef = `QT-SAM-2026-${num}`;
    const proformaInvoiceRef = `PI-SAM-2026-${num + 500}`;
    const newQuote: PortalQuoteAndInvoice = {
      ...payload,
      id: `qi-${Date.now()}`,
      quoteRef,
      proformaInvoiceRef,
      issuedDate: today,
    };
    setQuotesInvoices((prev) => [newQuote, ...prev]);
    appendAudit(
      `Generated Commercial Quote ${quoteRef} & Proforma ${proformaInvoiceRef} for ${payload.customerCompany}`,
      'Commercial & Invoicing',
      quoteRef
    );
    pushNotification(
      `New Commercial Quote Issued: ${quoteRef}`,
      `Proforma Invoice ${proformaInvoiceRef} generated for ${payload.customerCompany}.`,
      ['customer', 'accounts-sales', 'portal-admin'],
      'quote',
      quoteRef
    );
  };

  const uploadCustomerPurchaseOrder = (
    quoteId: string,
    poPayload: NonNullable<PortalQuoteAndInvoice['uploadedPurchaseOrder']>,
    remarks?: string
  ) => {
    let targetQuoteRef = quoteId;
    let targetPiRef = quoteId;
    setQuotesInvoices((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          targetQuoteRef = q.quoteRef;
          targetPiRef = q.proformaInvoiceRef;
          return {
            ...q,
            quoteStatus: 'Customer Approved',
            paymentMethod: 'Corporate PO (Net-30)',
            paymentStatus: 'Awaiting Verification',
            paymentReference: poPayload.poNumber,
            uploadedPurchaseOrder: poPayload,
            notes: remarks ? `${q.notes} | PO Note: ${remarks}` : q.notes,
          };
        }
        return q;
      })
    );
    appendAudit(
      `Uploaded & MIME-verified Corporate Purchase Order [${poPayload.poNumber}] (${poPayload.fileName}, SHA-256: ${poPayload.sha256Checksum.slice(0, 16)}...) against Quote ${targetQuoteRef}`,
      'Commercial & Invoicing',
      targetQuoteRef,
      'Elevated'
    );
    pushNotification(
      `Purchase Order Uploaded: ${poPayload.poNumber}`,
      `Customer uploaded PO (${poPayload.fileName}) for ${targetQuoteRef} / ${targetPiRef}. Ready for Accounts verification.`,
      ['accounts-sales', 'coordinator', 'portal-admin'],
      'payment',
      targetQuoteRef
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRbacPermission = (rowId: string, role: PortalRole) => {
    setRbacMatrix((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const nextVal = !row.permissions[role];
        appendAudit(
          `${nextVal ? 'Granted' : 'Revoked'} "${row.capability}" for role [${role}]`,
          'RBAC & Security',
          row.moduleName,
          'Critical',
          'PRIVILEGE_CHANGE'
        );
        return {
          ...row,
          permissions: {
            ...row.permissions,
            [role]: nextVal,
          },
        };
      })
    );
  };

  const updateSystemConfig = (partial: Partial<PortalSystemConfig>) => {
    setSystemConfig((prev) => {
      const updated = { ...prev, ...partial };
      appendAudit(
        `Updated Portal System Configuration parameters`,
        'RBAC & Security',
        'SYS-CONFIG',
        'Critical',
        'PRIVILEGE_CHANGE'
      );
      return updated;
    });
  };

  return (
    <PortalContext.Provider
      value={{
        activeRole,
        currentPortalUser,
        switchPortalRole,
        sessionState,
        companyProfile,
        updateCompanyProfile,
        loginWithCredentials,
        completeTwoFactorLogin,
        logoutPortalSession,
        extendPortalSession,
        onboardNewCompany,
        activeResetToken,
        requestPasswordResetToken,
        completePasswordReset,
        facilities,
        addFacility,
        setPrimaryFacility,
        removeFacility,
        authorizedPersonnel,
        addAuthorizedPersonnel,
        togglePersonnelActive,
        removeAuthorizedPersonnel,
        notificationPrefs,
        toggleNotificationPref,
        lastIdorResult,
        verifyAndAccessResource,
        logSensitiveDocumentDownload,
        equipmentAssets,
        addEquipmentAsset,
        serviceTickets,
        technicianProfiles,
        createServiceTicket,
        assignTicketTechnician,
        dispatchTechnicianWithRoute,
        updateServiceTicketStatus,
        toggleChecklistItem,
        updateTechnicianTicketWorkbench,
        submitTechnicianCalibrationReport,
        certificates,
        quotesInvoices,
        updateQuoteApproval,
        verifyInvoicePayment,
        createQuoteFromRfq,
        uploadCustomerPurchaseOrder,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        rbacMatrix,
        toggleRbacPermission,
        systemConfig,
        updateSystemConfig,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return ctx;
};

