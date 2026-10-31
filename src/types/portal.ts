export type PortalRole =
  | 'customer'
  | 'technician'
  | 'coordinator'
  | 'accounts-sales'
  | 'portal-admin';

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: PortalRole;
  roleTitle: string;
  organization: string;
  department: string;
  location: string;
  avatarInitials: string;
  phone: string;
}

export interface EquipmentServiceTimelineEvent {
  id: string;
  date: string;
  eventType:
    | 'ISO 17025 Calibration'
    | 'Preventive Maintenance'
    | 'Repair & Adjustment'
    | 'Initial Commissioning';
  title: string;
  engineerName: string;
  summary: string;
  outcome: 'Passed (In-Tolerance)' | 'Adjusted to Spec' | 'Commissioned' | 'Scheduled';
  certificateOrReportRef?: string;
}

export interface EquipmentAsset {
  id: string;
  serialNumber: string;
  assetTag: string;
  name: string;
  model: string;
  manufacturer: string;
  category: 'Weighing & Mass' | 'Flow Metering' | 'Pressure & DP' | 'Thermal & Cleanroom' | 'Analytical & Optical';
  customerCompany: string;
  facilityLocation: string;
  labRoom?: string;
  commissioningDate?: string;
  calibrationIntervalMonths?: 6 | 12;
  measurementRange: string;
  accuracyClass: string;
  calibrationStatus: 'Valid' | 'Due Soon' | 'Overdue' | 'In Calibration';
  lastCalibrationDate: string;
  nextDueDate: string;
  certificateRef: string;
  slaTier: 'Platinum' | 'Gold' | 'Silver';
  baselineCertFileName?: string;
  baselineCertChecksum?: string;
  qrVerificationToken?: string;
  serviceHistory?: EquipmentServiceTimelineEvent[];
}

export interface CalibrationReadingPoint {
  pointNumber: number;
  nominalValue: string;
  asFoundValue: string;
  asFoundError: string;
  asLeftValue: string;
  asLeftError: string;
  expandedUncertainty: string;
  toleranceLimit: string;
  pass: boolean;
}

export interface CalibrationCertificate {
  id: string;
  certificateNumber: string;
  serialNumber: string;
  equipmentName: string;
  model: string;
  customerCompany: string;
  facilityLocation: string;
  calibrationDate: string;
  nextDueDate: string;
  technicianName: string;
  approvingMetrologist: string;
  environmentalTemp: string;
  environmentalHumidity: string;
  barometricPressure: string;
  referenceStandardUsed: string;
  traceabilityNmi: string;
  uncertaintyBudgetK2: string;
  complianceStandard: string;
  status: 'Issued' | 'Pending Review';
  readings: CalibrationReadingPoint[];
  workReportSummary: string;
}

export interface SiteChecklistItem {
  id: string;
  label: string;
  category: 'Safety & ATEX' | 'Environmental' | 'Mechanical & Electrical' | 'Metrological';
  checked: boolean;
}

export interface ReplacedPartLogItem {
  id: string;
  partNumber: string;
  partName: string;
  quantity: number;
  batchOrSerial: string;
  category: 'Seal / Gasket' | 'Sensor / Cell' | 'Filter / Consumable' | 'Electronic Module';
}

export interface CustomerSignatureRecord {
  signedByName: string;
  signedByTitle: string;
  signedAt: string;
  signatureDataUrl: string;
  clientRemarks?: string;
}

export interface FaultAttachmentFile {
  id: string;
  fileName: string;
  fileSizeKb: number;
  fileCategory: 'Error Log' | 'Equipment Photo' | 'Diagnostic Dump';
  uploadedAt: string;
}

export interface TechnicianDirectoryProfile {
  id: string;
  name: string;
  hubLocation: string;
  corenReg: string;
  availability: 'Available' | 'On-Site Dispatch' | 'In Transit';
  certifications: string[];
  specialties: string[];
  primaryCalibrationKit: string;
  defaultOriginHub: string;
  activeAssignedCount: number;
  phone: string;
}

export type FsmKanbanStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Scheduled'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Parts'
  | 'Completed'
  | 'Closed';

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  customerCompany: string;
  contactPerson: string;
  contactPhone: string;
  facilityLocation: string;
  equipmentSerial: string;
  equipmentName: string;
  isUnlistedDevice?: boolean;
  unlistedDeviceSpecs?: {
    manufacturer: string;
    model: string;
    category: string;
  };
  serviceType:
    | 'On-site ISO Calibration'
    | 'ISO 17025 Calibration'
    | 'Preventive Maintenance'
    | 'Preventive Maintenance (PPM)'
    | 'Emergency Breakdown'
    | 'Installation & Commissioning'
    | 'User Training';
  urgencyRating?: 'Routine' | 'Urgent' | 'Critical Production Stoppage';
  priority: 'Critical (4-Hr SLA)' | 'High (12-Hr SLA)' | 'Standard (48-Hr SLA)';
  slaTier: 'Platinum' | 'Gold' | 'Silver';
  status:
    | FsmKanbanStatus
    | 'Pending Triage'
    | 'Dispatched';
  assignedTechnician: string;
  scheduledDate: string;
  slaDeadline: string;
  slaStatus: 'Within SLA' | 'At Risk' | 'Breached';
  description: string;
  errorCodeLogs?: string;
  uploadedAttachments?: FaultAttachmentFile[];
  checklist: SiteChecklistItem[];
  ambientConditions?: {
    temperatureC: string;
    relativeHumidityPct: string;
    barometricPressureHpa: string;
    validatedForMetrology: boolean;
  };
  testWeightsAndStandardsUsed?: string;
  calibrationReadings?: CalibrationReadingPoint[];
  partsReplacedLog?: ReplacedPartLogItem[];
  customerSignOff?: CustomerSignatureRecord;
  routePlan?: {
    originHub: string;
    destinationAddress: string;
    distanceKm: string;
    estimatedTransitMin: string;
    calibrationKitAssigned: string;
    routeNotes: string;
  };
  workReportNotes?: string;
  issuedCertificateNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalQuoteAndInvoice {
  id: string;
  quoteRef: string;
  proformaInvoiceRef: string;
  linkedRfqRef?: string;
  linkedTicketRef?: string;
  customerCompany: string;
  contactName: string;
  contactEmail: string;
  deliveryState: string;
  currencyMode?: 'NGN' | 'USD';
  freightChargeUSD?: number;
  paymentValidityTerms?: string;
  lineItems: {
    id: string;
    description: string;
    model: string;
    qty: number;
    unitPriceUSD: number;
  }[];
  subtotalUSD: number;
  discountPercent: number;
  vatPercent: number;
  totalUSD: number;
  exchangeRateNGN: number;
  quoteStatus: 'Draft' | 'Sent for Approval' | 'Customer Approved' | 'Revision Requested' | 'Rejected';
  paymentStatus: 'Unpaid' | 'Awaiting Verification' | 'Verified & Paid';
  paymentMethod: 'Corporate PO (Net-30)' | 'Bank Wire Transfer (NGN)' | 'DOM Account Wire (USD)';
  paymentReference?: string;
  uploadedPurchaseOrder?: {
    poNumber: string;
    fileName: string;
    mimeType: string;
    fileSizeKb: number;
    uploadedAt: string;
    sha256Checksum: string;
    verifiedBySecurityFilter: boolean;
  };
  issuedDate: string;
  validUntil: string;
  notes: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoles: PortalRole[];
  category: 'calibration' | 'dispatch' | 'quote' | 'payment' | 'security';
  recordRef?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: PortalRole;
  action: string;
  module:
    | 'Equipment Registry'
    | 'Calibration Bench'
    | 'Dispatch & SLA'
    | 'Commercial & Invoicing'
    | 'RBAC & Security'
    | 'Authentication & 2FA'
    | 'Document Vault'
    | 'IDOR Guard';
  targetRef: string;
  ipAddress: string;
  severity: 'Normal' | 'Elevated' | 'Critical';
  eventCategory?:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'TWO_FACTOR_CHALLENGE'
    | 'PASSWORD_RESET'
    | 'PRIVILEGE_CHANGE'
    | 'DOCUMENT_DOWNLOAD'
    | 'IDOR_BLOCKED'
    | 'ONBOARDING'
    | 'OPERATIONAL';
  integrityHash?: string;
}

export interface RbacPermissionRow {
  id: string;
  moduleName: string;
  capability: string;
  permissions: Record<PortalRole, boolean>;
}

export interface PortalSystemConfig {
  exchangeRateNGN: number;
  vatPercent: number;
  calibrationRecallDays: number;
  certPrefix: string;
  platinumSlaHours: number;
  goldSlaHours: number;
  silverSlaHours: number;
  strictTwoManSignoff: boolean;
  autoEmailCertificates: boolean;
}

export type FacilityCategory =
  | 'Central Testing Lab'
  | 'Satellite QA Unit'
  | 'Factory Bay'
  | 'Cleanroom Suite'
  | 'Terminal Metering Skid';

export interface CustomerFacility {
  id: string;
  companyName: string;
  cacNumber: string;
  facilityName: string;
  facilityType: FacilityCategory;
  address: string;
  state: string;
  siteContactName: string;
  siteContactPhone: string;
  accessSafetyProtocol: string;
  isPrimary: boolean;
  status: 'Active Operation' | 'Scheduled Turnaround' | 'Commissioning';
  instrumentCount: number;
}

export type PersonnelDesignation =
  | 'Procurement Manager'
  | 'Laboratory Analyst'
  | 'Receiving Officer'
  | 'QA / Metrology Lead'
  | 'Plant Safety Coordinator';

export interface AuthorizedPersonnel {
  id: string;
  companyName: string;
  fullName: string;
  designation: PersonnelDesignation;
  email: string;
  phone: string;
  assignedFacilityName: string;
  canApproveQuotes: boolean;
  canSignSiteChecklists: boolean;
  canDownloadCertificates: boolean;
  active: boolean;
  addedDate: string;
}

export interface NotificationPreferenceItem {
  id: 'quotes' | 'dispatches' | 'calibration_due' | 'security_alerts';
  label: string;
  description: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface CompanyOnboardingProfile {
  id: string;
  companyName: string;
  cacRegistrationNumber: string; // e.g., RC 1849201 or BN 2948102
  tinNumber: string;
  laboratoryFacilityType: string;
  primaryFacilityAddress: string;
  state: string;
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  whatsappNumber: string;
  passwordHash: string;
  passwordSalt: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'TOTP Authenticator' | 'Corporate Email + SMS';
  sessionTimeoutMinutes: number;
  onboardedAt: string;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  createdAtMs: number;
  expiresAtMs: number;
  used: boolean;
}

export interface PortalSessionState {
  isAuthenticated: boolean;
  authenticatedAtMs: number;
  expiresAtMs: number;
  sessionDurationMinutes: number;
  twoFactorVerified: boolean;
  authMethod: 'Password + 2FA' | 'Password (Standard)' | 'Onboarding Auto-Session';
  passwordHashPreview: string;
}

export interface IdorVerificationResult {
  allowed: boolean;
  httpStatus: 200 | 403;
  resourceType: 'Calibration Certificate' | 'Proforma Invoice / Quote' | 'Equipment Asset';
  resourceId: string;
  resourceOwner: string;
  requestingOrganization: string;
  requestingRole: PortalRole;
  reason: string;
  timestamp: string;
}

