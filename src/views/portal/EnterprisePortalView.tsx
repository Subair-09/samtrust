import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Wrench,
  Calendar,
  FileText,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FlaskConical,
  Cog,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Printer,
  ArrowUpRight,
  UserCheck,
  CreditCard,
  Activity,
  Award,
  Sliders,
  Lock,
  ExternalLink,
  Check,
  X,
  ClipboardCheck,
  Sparkles,
  Building2,
  KeyRound,
  LogOut,
  Database,
  MessageCircle,
} from 'lucide-react';
import { NavTab } from '../../types';
import {
  PortalRole,
  EquipmentAsset,
  CalibrationCertificate,
  ServiceTicket,
  PortalQuoteAndInvoice,
  CalibrationReadingPoint,
} from '../../types/portal';
import {
  usePortal,
  PORTAL_USERS,
  AVAILABLE_TECHNICIANS,
} from '../../context/PortalContext';
import { useCms } from '../../context/CmsContext';
import { PortalAuthSuite } from './PortalAuthSuite';
import { PortalProfileFacilityView } from './PortalProfileFacilityView';
import { CustomerDigitalPassportModule } from './CustomerDigitalPassportModule';
import {
  CustomerServiceRequestModule,
  CustomerServiceRequestIntakeModal,
  CoordinatorDispatchConsole,
  FieldTechnicianMobileWorkspace,
} from './FieldServiceManagementModule';
import {
  CustomerDocumentCenter,
  StaffQuotationBuilderAndEngine,
  DatabaseAndHardeningBlueprintConsole,
} from './CommercialAndArchitectureModule';
import { UserRoleManager } from '../admin/UserRoleManager';
import { LiveChatDeskManager } from '../admin/LiveChatDeskManager';

interface EnterprisePortalViewProps {
  onNavigate: (tab: NavTab, subpageSlug?: string) => void;
}

const ROLE_META: Record<
  PortalRole,
  {
    label: string;
    shortLabel: string;
    description: string;
  }
> = {
  customer: {
    label: 'Registered Customer',
    shortLabel: 'Customer',
    description:
      'Equipment registry, multi-facility profile, service requests, quote approvals & ISO/IEC 17025 certificate downloads',
  },
  technician: {
    label: 'Field Service Technician',
    shortLabel: 'Technician',
    description:
      'Assigned jobs, site visit checklists, As-Found/As-Left calibration readings & signed work reports',
  },
  coordinator: {
    label: 'Service Coordinator',
    shortLabel: 'Coordinator',
    description:
      'Ticket review, calendar scheduling, engineer dispatch & live SLA compliance tracking',
  },
  'accounts-sales': {
    label: 'Accounts & Sales Specialist',
    shortLabel: 'Accounts & Sales',
    description:
      'RFQ processing (shared with public site), quote generator, proforma invoicing & payment verification',
  },
  'portal-admin': {
    label: 'Portal Super Admin',
    shortLabel: 'Super Admin',
    description:
      'System configurations, 5-role RBAC permissions matrix, IDOR guard & immutable security audit trail',
  },
};

export const EnterprisePortalView: React.FC<EnterprisePortalViewProps> = ({
  onNavigate,
}) => {
  const {
    activeRole,
    currentPortalUser,
    switchPortalRole,
    sessionState,
    companyProfile,
    facilities,
    logoutPortalSession,
    logSensitiveDocumentDownload,
    equipmentAssets,
    addEquipmentAsset,
    serviceTickets,
    createServiceTicket,
    assignTicketTechnician,
    toggleChecklistItem,
    submitTechnicianCalibrationReport,
    certificates,
    quotesInvoices,
    updateQuoteApproval,
    verifyInvoicePayment,
    createQuoteFromRfq,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    auditLogs,
    rbacMatrix,
    toggleRbacPermission,
    systemConfig,
    updateSystemConfig,
  } = usePortal();

  const { rfqLeads, updateLeadStatus, products, managedUsers, liveChatSessions } = useCms();

  const availableUsers = useMemo(() => Object.values(PORTAL_USERS), []);

  // Shell State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [authModalTab, setAuthModalTab] = useState<
    'login' | 'onboarding' | 'reset' | '2fa' | null
  >(null);

  // Modals & Interactive Workbenches
  const [selectedCertForPrint, setSelectedCertForPrint] =
    useState<CalibrationCertificate | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] =
    useState<PortalQuoteAndInvoice | null>(null);
  const [registerAssetModalOpen, setRegisterAssetModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [quoteGeneratorModalOpen, setQuoteGeneratorModalOpen] = useState(false);

  // Technician Workbench State
  const [activeTechTicketId, setActiveTechTicketId] = useState<string>(
    serviceTickets[0]?.id || 'tkt-01'
  );
  const [calEnvTemp, setCalEnvTemp] = useState('23.2 °C');
  const [calEnvHumidity, setCalEnvHumidity] = useState('47 %RH');
  const [calBarometric, setCalBarometric] = useState('1013.2 hPa');
  const [calRefStandard, setCalRefStandard] = useState(
    'Fluke 754 Documenting Process Calibrator & OIML Class E2 Mass Set (Cert #NIST-88412)'
  );
  const [calUncertainty, setCalUncertainty] = useState('±0.025% FS (k=2, 95% CL)');
  const [calRemarks, setCalRemarks] = useState(
    'Instrument Zero and Span adjusted on-site. Post-adjustment As-Left linearity verified within ISO/IEC 17025 tolerance across all 5 test points.'
  );
  const [calPoints, setCalPoints] = useState<CalibrationReadingPoint[]>([
    {
      pointNumber: 1,
      nominalValue: '0.00',
      asFoundValue: '0.04',
      asFoundError: '+0.04',
      asLeftValue: '0.00',
      asLeftError: '0.00',
      expandedUncertainty: '±0.02',
      toleranceLimit: '±0.10',
      pass: true,
    },
    {
      pointNumber: 2,
      nominalValue: '25.00',
      asFoundValue: '25.08',
      asFoundError: '+0.08',
      asLeftValue: '25.01',
      asLeftError: '+0.01',
      expandedUncertainty: '±0.02',
      toleranceLimit: '±0.10',
      pass: true,
    },
    {
      pointNumber: 3,
      nominalValue: '50.00',
      asFoundValue: '50.14',
      asFoundError: '+0.14',
      asLeftValue: '50.02',
      asLeftError: '+0.02',
      expandedUncertainty: '±0.03',
      toleranceLimit: '±0.15',
      pass: true,
    },
    {
      pointNumber: 4,
      nominalValue: '75.00',
      asFoundValue: '75.18',
      asFoundError: '+0.18',
      asLeftValue: '75.02',
      asLeftError: '+0.02',
      expandedUncertainty: '±0.03',
      toleranceLimit: '±0.15',
      pass: true,
    },
    {
      pointNumber: 5,
      nominalValue: '100.00',
      asFoundValue: '100.22',
      asFoundError: '+0.22',
      asLeftValue: '100.03',
      asLeftError: '+0.03',
      expandedUncertainty: '±0.04',
      toleranceLimit: '±0.20',
      pass: true,
    },
  ]);

  // Customer New Asset Form
  const [newAssetForm, setNewAssetForm] = useState({
    serialNumber: '',
    assetTag: '',
    name: '',
    manufacturer: '',
    model: '',
    category: 'Flow Metering' as EquipmentAsset['category'],
    facilityLocation: 'Grade B Cleanroom Lab, Ikeja, Lagos',
    measurementRange: '0 – 250 m³/h',
    accuracyClass: '±0.15% of Reading',
  });

  // Customer New Service Request Form
  const [newTicketForm, setNewTicketForm] = useState({
    equipmentSerial: equipmentAssets[0]?.serialNumber || 'SN-ST-2025-8841',
    serviceType: 'ISO 17025 Calibration' as ServiceTicket['serviceType'],
    priority: 'High (12-Hr SLA)' as ServiceTicket['priority'],
    scheduledDate: '2026-11-15',
    contactPerson: currentPortalUser.name,
    contactPhone: currentPortalUser.phone,
    description: '',
  });

  // Accounts & Sales Quote Generator Form
  const [newQuoteForm, setNewQuoteForm] = useState({
    customerCompany: 'BioZenith Pharmaceuticals Ltd',
    contactName: 'Dr. Chioma Nwachukwu',
    contactEmail: 'c.nwachukwu@biozenith.com',
    deliveryState: 'Lagos State',
    selectedProductId: products[0]?.id || '',
    qty: 2,
    customServiceDesc:
      'On-Site ISO/IEC 17025 Commissioning & 5-Point Calibration Certification',
    customServiceUSD: 850,
    validUntil: '2026-12-31',
    paymentMethod: 'Bank Wire Transfer (NGN)' as PortalQuoteAndInvoice['paymentMethod'],
  });

  // Audit Filter State
  const [auditSearch, setAuditSearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Format currency helper
  const formatAmount = (usdAmount: number, rateNGN = systemConfig.exchangeRateNGN) => {
    if (displayCurrency === 'USD') {
      return `$${usdAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    const ngn = Math.round(usdAmount * rateNGN);
    return `₦${ngn.toLocaleString('en-NG')}`;
  };

  // Role-specific sidebar navigation items
  const roleNavItems = useMemo(() => {
    const profileItem = {
      id: 'profile-facilities',
      label: 'Profile, Facilities & 2FA',
      icon: Building2,
      count: facilities.length,
    };

    switch (activeRole) {
      case 'customer':
        return [
          { id: 'overview', label: 'Client Dashboard', icon: Activity },
          profileItem,
          {
            id: 'equipment',
            label: 'Equipment Registry',
            icon: FlaskConical,
            count: equipmentAssets.length,
          },
          {
            id: 'tickets',
            label: 'Service Requests',
            icon: Wrench,
            count: serviceTickets.length,
          },
          {
            id: 'quotes',
            label: 'Document Center (Quotes & PO)',
            icon: FileText,
            count: quotesInvoices.length,
          },
          {
            id: 'certificates',
            label: 'Calibration Certificates',
            icon: Award,
            count: certificates.length,
          },
        ];
      case 'technician':
        return [
          { id: 'overview', label: 'Field Operations Overview', icon: Activity },
          {
            id: 'jobs',
            label: 'Assigned Jobs & Checklists',
            icon: ClipboardCheck,
            count: serviceTickets.length,
          },
          {
            id: 'calibration-bench',
            label: 'As-Found / As-Left Bench',
            icon: Sliders,
          },
          {
            id: 'certificates',
            label: 'Issued Certificates',
            icon: Award,
            count: certificates.length,
          },
          profileItem,
        ];
      case 'coordinator':
        return [
          { id: 'overview', label: 'Dispatch & SLA Overview', icon: Activity },
          {
            id: 'dispatch',
            label: 'Ticket Review & Dispatch',
            icon: Calendar,
            count: serviceTickets.length,
          },
          { id: 'sla-tracker', label: 'SLA Compliance Matrix', icon: Clock },
          {
            id: 'equipment',
            label: 'Master Asset Registry',
            icon: FlaskConical,
            count: equipmentAssets.length,
          },
          {
            id: 'live-desk',
            label: 'Live Desk & WhatsApp',
            icon: MessageCircle,
            count: liveChatSessions.length,
          },
          profileItem,
        ];
      case 'accounts-sales':
        return [
          { id: 'overview', label: 'Quotation & Invoice Engine', icon: Activity },
          {
            id: 'rfq-pipeline',
            label: 'Public RFQ Pipeline',
            icon: Sparkles,
            count: rfqLeads.length,
          },
          {
            id: 'quotes',
            label: 'Quotes, POs & Proforma',
            icon: FileText,
            count: quotesInvoices.length,
          },
          { id: 'payments', label: 'Payment Verification', icon: CreditCard },
          {
            id: 'live-desk',
            label: 'Live Desk & WhatsApp',
            icon: MessageCircle,
            count: liveChatSessions.length,
          },
          profileItem,
        ];
      case 'portal-admin':
        return [
          { id: 'overview', label: 'Executive System Health', icon: Activity },
          {
            id: 'live-desk',
            label: 'Live Desk & WhatsApp',
            icon: MessageCircle,
            count: liveChatSessions.length,
          },
          {
            id: 'users-roles',
            label: 'Users & Role Management',
            icon: UserCheck,
            count: managedUsers.length,
          },
          {
            id: 'db-blueprint',
            label: 'MySQL Schema & Hardening',
            icon: Database,
            count: 11,
          },
          { id: 'rbac', label: 'RBAC Permissions Matrix', icon: Lock },
          {
            id: 'audit',
            label: 'Security Audit Trail',
            icon: ShieldCheck,
            count: auditLogs.length,
          },
          { id: 'config', label: 'System Configurations', icon: Settings },
          profileItem,
        ];
    }
  }, [
    activeRole,
    facilities.length,
    equipmentAssets.length,
    serviceTickets.length,
    quotesInvoices.length,
    certificates.length,
    rfqLeads.length,
    auditLogs.length,
    managedUsers.length,
    liveChatSessions.length,
  ]);

  // Handle Role Change
  const handleSelectRole = (role: PortalRole) => {
    switchPortalRole(role);
    setActiveModule('overview');
    setRoleSwitcherOpen(false);
    showToast(`Switched active session to ${ROLE_META[role].label}`);
  };

  // Global Search Results (Equipment Serial, Quote Ref, Ticket Number, Customer Name)
  const globalSearchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return null;

    const matchedAssets = equipmentAssets.filter(
      (a) =>
        a.serialNumber.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.customerCompany.toLowerCase().includes(q)
    );

    const matchedQuotes = quotesInvoices.filter(
      (qt) =>
        qt.quoteRef.toLowerCase().includes(q) ||
        qt.proformaInvoiceRef.toLowerCase().includes(q) ||
        qt.customerCompany.toLowerCase().includes(q) ||
        qt.contactName.toLowerCase().includes(q)
    );

    const matchedTickets = serviceTickets.filter(
      (t) =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.equipmentSerial.toLowerCase().includes(q) ||
        t.customerCompany.toLowerCase().includes(q) ||
        t.equipmentName.toLowerCase().includes(q)
    );

    const matchedCerts = certificates.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.customerCompany.toLowerCase().includes(q)
    );

    return {
      matchedAssets,
      matchedQuotes,
      matchedTickets,
      matchedCerts,
      total:
        matchedAssets.length +
        matchedQuotes.length +
        matchedTickets.length +
        matchedCerts.length,
    };
  }, [globalSearch, equipmentAssets, quotesInvoices, serviceTickets, certificates]);

  // Unread notifications count
  const unreadNotifCount = useMemo(
    () =>
      notifications.filter(
        (n) => !n.read && n.targetRoles.includes(activeRole)
      ).length,
    [notifications, activeRole]
  );

  // Submit New Equipment Asset
  const handleRegisterAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetForm.serialNumber || !newAssetForm.name) return;
    addEquipmentAsset({
      serialNumber: newAssetForm.serialNumber.toUpperCase(),
      assetTag: newAssetForm.assetTag.toUpperCase() || 'TAG-NEW-01',
      name: newAssetForm.name,
      manufacturer: newAssetForm.manufacturer || 'Samstrust Metrology OEM',
      model: newAssetForm.model || 'ST-PRO-SERIES',
      category: newAssetForm.category,
      customerCompany: currentPortalUser.organization,
      facilityLocation: newAssetForm.facilityLocation,
      measurementRange: newAssetForm.measurementRange,
      accuracyClass: newAssetForm.accuracyClass,
      lastCalibrationDate: new Date().toISOString().slice(0, 10),
      nextDueDate: '2027-05-15',
      calibrationStatus: 'Valid',
      certificateRef: 'CERT-ISO17025-2026-0891',
      slaTier: 'Platinum',
    });
    setRegisterAssetModalOpen(false);
    setNewAssetForm({
      serialNumber: '',
      assetTag: '',
      name: '',
      manufacturer: '',
      model: '',
      category: 'Flow Metering',
      facilityLocation: 'Grade B Cleanroom Lab, Ikeja, Lagos',
      measurementRange: '0 – 250 m³/h',
      accuracyClass: '±0.15% of Reading',
    });
    showToast('Equipment asset registered in ISO/IEC 17025 Metrology Registry.');
  };

  // Submit New Service Ticket
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset =
      equipmentAssets.find((a) => a.serialNumber === newTicketForm.equipmentSerial) ||
      equipmentAssets[0];
    if (!asset) return;
    createServiceTicket({
      equipmentSerial: asset.serialNumber,
      equipmentName: asset.name,
      customerCompany: currentPortalUser.organization,
      facilityLocation: asset.facilityLocation,
      serviceType: newTicketForm.serviceType,
      priority: newTicketForm.priority,
      slaTier: asset.slaTier,
      status: 'Pending Triage',
      scheduledDate: newTicketForm.scheduledDate,
      slaDeadline: `${newTicketForm.scheduledDate} 16:00 WAT`,
      assignedTechnician: AVAILABLE_TECHNICIANS[0],
      contactPerson: newTicketForm.contactPerson,
      contactPhone: newTicketForm.contactPhone,
      description:
        newTicketForm.description ||
        `Scheduled ${newTicketForm.serviceType} requested via Client Portal for ${asset.name} (${asset.serialNumber}).`,
    });
    setNewTicketModalOpen(false);
    setNewTicketForm({ ...newTicketForm, description: '' });
    showToast('Service Request Ticket submitted & routed to Service Coordinator.');
  };

  // Submit Technician As-Found / As-Left Calibration Certificate
  const handleIssueCalibrationCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket =
      serviceTickets.find((t) => t.id === activeTechTicketId) || serviceTickets[0];
    if (!ticket) return;

    const newCert = submitTechnicianCalibrationReport({
      ticketId: ticket.id,
      serialNumber: ticket.equipmentSerial,
      environmentalTemp: calEnvTemp,
      environmentalHumidity: calEnvHumidity,
      barometricPressure: calBarometric,
      referenceStandardUsed: calRefStandard,
      uncertaintyBudgetK2: calUncertainty,
      workReportSummary: calRemarks,
      readings: calPoints,
    });

    showToast(
      `ISO/IEC 17025 Certificate ${newCert.certificateNumber} issued for ${ticket.equipmentSerial} & job marked Completed.`
    );
  };

  // Convert Public Website RFQ Lead into Formal Portal Quote & Proforma Invoice
  const handleConvertRfqToQuote = (leadId: string) => {
    const lead = rfqLeads.find((l) => l.id === leadId);
    if (!lead) return;

    const lineItems =
      lead.lineItems.length > 0
        ? lead.lineItems.map((item, idx) => ({
            id: `li-${Date.now()}-${idx}`,
            description: item.name,
            model: item.model || `SAM-OEM-${100 + idx}`,
            qty: item.quantity,
            unitPriceUSD: item.unitPriceUSD || 1450,
          }))
        : [
            {
              id: `li-${Date.now()}-1`,
              description: 'Turnkey Instrumentation & ISO 17025 Calibration Package',
              model: 'SAM-SRV-17025',
              qty: 1,
              unitPriceUSD: lead.totalUSD || 2200,
            },
          ];

    const subtotalUSD = lineItems.reduce(
      (acc, item) => acc + item.qty * item.unitPriceUSD,
      0
    );
    const vatFactor = 1 + systemConfig.vatPercent / 100;
    const totalUSD = Math.round(subtotalUSD * vatFactor * 100) / 100;

    createQuoteFromRfq({
      linkedRfqRef: lead.refCode,
      customerCompany: lead.clientCompany,
      contactName: lead.clientName,
      contactEmail: lead.clientEmail,
      deliveryState: lead.deliveryState,
      lineItems,
      subtotalUSD,
      discountPercent: 0,
      vatPercent: systemConfig.vatPercent,
      totalUSD,
      exchangeRateNGN: systemConfig.exchangeRateNGN,
      quoteStatus: 'Sent for Approval',
      paymentStatus: 'Unpaid',
      paymentMethod: 'Bank Wire Transfer (NGN)',
      validUntil: '2026-12-31',
      notes:
        'Includes ISO/IEC 17025 traceable calibration certificates and 12-month OEM warranty.',
    });

    updateLeadStatus(lead.id, 'Quoted');
    showToast(
      `Converted Web RFQ ${lead.refCode} into formal Quote & Proforma Invoice.`
    );
  };

  // Submit Custom Quote Generator
  const handleCreateCustomQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const prod =
      products.find((p) => p.id === newQuoteForm.selectedProductId) || products[0];
    const unitPriceUSD = prod?.basePriceUSD || 1850;
    const equipTotalUSD = unitPriceUSD * newQuoteForm.qty;
    const srvUSD = Number(newQuoteForm.customServiceUSD) || 0;
    const subtotalUSD = equipTotalUSD + srvUSD;
    const totalUSD =
      Math.round(subtotalUSD * (1 + systemConfig.vatPercent / 100) * 100) / 100;

    createQuoteFromRfq({
      linkedRfqRef: `RFQ-DIRECT-${Math.floor(100 + Math.random() * 899)}`,
      customerCompany: newQuoteForm.customerCompany,
      contactName: newQuoteForm.contactName,
      contactEmail: newQuoteForm.contactEmail,
      deliveryState: newQuoteForm.deliveryState,
      lineItems: [
        {
          id: `li-gen-1`,
          description: prod?.name || 'Precision Process Instrument',
          model: prod?.model || 'ST-FLOW-800',
          qty: newQuoteForm.qty,
          unitPriceUSD,
        },
        ...(srvUSD > 0
          ? [
              {
                id: `li-gen-2`,
                description: newQuoteForm.customServiceDesc,
                model: 'SAM-CAL-17025',
                qty: 1,
                unitPriceUSD: srvUSD,
              },
            ]
          : []),
      ],
      subtotalUSD,
      discountPercent: 0,
      vatPercent: systemConfig.vatPercent,
      totalUSD,
      exchangeRateNGN: systemConfig.exchangeRateNGN,
      quoteStatus: 'Sent for Approval',
      paymentStatus: 'Unpaid',
      paymentMethod: newQuoteForm.paymentMethod,
      validUntil: newQuoteForm.validUntil,
      notes: '100% Proforma Settlement or Approved Corporate PO prior to dispatch.',
    });

    setQuoteGeneratorModalOpen(false);
    showToast(
      'New Commercial Quote & Proforma Invoice generated and dispatched to Customer Portal.'
    );
  };

  const activeTechTicket =
    serviceTickets.find((t) => t.id === activeTechTicketId) || serviceTickets[0];

  // If the user locks/logs out of their session, display the full-screen Authentication & CAC Onboarding Gateway
  if (!sessionState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F8F6]">
        <div className="bg-[#164E3D] text-white px-6 py-3 flex items-center justify-between border-b border-[#0E3529]">
          <div className="flex items-center gap-2 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>SAMSTRUST ENTERPRISE PORTAL • SESSION LOCKED</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
          >
            &larr; Return to Public Corporate Website
          </button>
        </div>
        <PortalAuthSuite
          onAuthenticated={() =>
            showToast('Authenticated corporate session & verified security policy.')
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F4F8F6] text-[#1A2E26] font-sans antialiased">
      {/* =====================================================================
          1. LEFT SIDEBAR (COLLAPSIBLE / EXPANDED, DEEP FOREST EMERALD #164E3D)
         ===================================================================== */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } bg-[#164E3D] text-white flex flex-col justify-between border-r border-[#0E3529] transition-all duration-300 shrink-0 select-none z-30`}
      >
        {/* Top Brand Identity with Precision Flask & Industrial Gear Motif */}
        <div>
          <div className="h-20 px-4 flex items-center justify-between border-b border-emerald-800/70 bg-[#113F31]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative w-11 h-11 rounded-2xl bg-[#0E3529] border border-[#D4AF37]/50 flex items-center justify-center shrink-0 shadow-md">
                <Cog className="w-7 h-7 text-[#D4AF37]/40 absolute" />
                <FlaskConical className="w-5 h-5 text-[#D4AF37] relative z-10" />
              </div>
              {!sidebarCollapsed && (
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white">
                      SAMSTRUST
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#0E3529] font-bold">
                      PORTAL
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 font-mono truncate">
                    RC 9898142 • ISO 17025
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-[#D4AF37] hover:bg-[#0E3529] transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Active Persona / RBAC Badge inside Sidebar */}
          {!sidebarCollapsed && (
            <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-[#0E3529]/90 border border-emerald-800/80">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80">
                  Active RBAC Persona
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              </div>
              <p className="text-xs font-bold text-[#D4AF37] truncate">
                {ROLE_META[activeRole].label}
              </p>
              <p className="text-[11px] text-emerald-100/80 truncate mt-0.5">
                {currentPortalUser.name}
              </p>
              <p className="text-[10px] text-emerald-300/60 font-mono truncate">
                {currentPortalUser.organization}
              </p>
            </div>
          )}

          {/* Role-Specific Navigation Menu */}
          <div className="px-3 py-4 space-y-1.5">
            {!sidebarCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300/70">
                Role Workspace Modules
              </div>
            )}
            {roleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
                  } py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0E3529] font-bold shadow-sm'
                      : 'text-emerald-100/90 hover:bg-[#0E3529] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#0E3529]' : 'text-[#D4AF37]'
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed &&
                    'count' in item &&
                    typeof item.count === 'number' && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-[#0E3529] text-[#D4AF37]'
                            : 'bg-emerald-950/90 text-emerald-200 border border-emerald-800'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                </button>
              );
            })}
          </div>

          {/* Quick Role Switcher Pill List inside Sidebar (when expanded) */}
          {!sidebarCollapsed && (
            <div className="px-4 pt-2 border-t border-emerald-800/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/70 mb-2">
                Switch RBAC Role Matrix
              </div>
              <div className="grid grid-cols-1 gap-1">
                {availableUsers.map((u) => {
                  const active = u.role === activeRole;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectRole(u.role)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-950/95 text-[#D4AF37] border border-[#D4AF37]/50 font-semibold'
                          : 'text-emerald-200/80 hover:bg-[#0E3529] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{ROLE_META[u.role].shortLabel}</span>
                      {active && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Portal Footer & Public Site Return */}
        <div className="p-3 border-t border-emerald-800/80 bg-[#113F31] space-y-2">
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center' : 'justify-between'
            } px-3 py-2 rounded-xl bg-[#0E3529] hover:bg-emerald-950 text-emerald-200 hover:text-[#D4AF37] border border-emerald-800/80 text-xs font-medium transition-colors cursor-pointer`}
            title="Switch to Website CMS Editor"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
              {!sidebarCollapsed && <span>Website CMS Admin</span>}
            </span>
            {!sidebarCollapsed && <ArrowUpRight className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center' : 'justify-between'
            } px-3 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-[#0E3529] text-white border border-[#D4AF37]/30 text-xs font-semibold transition-colors cursor-pointer`}
            title="Return to Public Corporate Website"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              {!sidebarCollapsed && <span>Public Website</span>}
            </span>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-mono text-[#D4AF37]">samstrusttech.com</span>
            )}
          </button>
        </div>
      </aside>

      {/* =====================================================================
          2. MAIN APPLICATION COLUMN (TOP ACTION BAR + WORKSPACE STAGE)
         ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP ACTION BAR */}
        <header className="h-20 bg-white border-b border-[#E2ECE7] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          {/* Left: Global Search Input (Equipment Serial, Quote Ref, Customer Name) */}
          <div className="relative flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search equipment serial (SN-ST-2025-8841), quote ref (QT-SAM-...), customer name..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs sm:text-sm text-[#1A2E26] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#164E3D] focus:ring-2 focus:ring-[#164E3D]/15 transition-all"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Global Search Instant Results Dropdown */}
            {searchFocused && globalSearchResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] p-4 z-50 max-h-[420px] overflow-y-auto space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-2">
                  <span className="text-xs font-bold text-[#164E3D]">
                    Global Search Matches ({globalSearchResults.total})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Serials • Quotes • Tickets • Certificates
                  </span>
                </div>

                {globalSearchResults.total === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No matching equipment serials, quotes, or customer records found for "{globalSearch}".
                  </p>
                ) : (
                  <>
                    {globalSearchResults.matchedAssets.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Equipment Assets ({globalSearchResults.matchedAssets.length})
                        </p>
                        <div className="space-y-1.5">
                          {globalSearchResults.matchedAssets.map((asset) => (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => {
                                setActiveModule('equipment');
                                setSearchFocused(false);
                              }}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-[#F4F8F6] border border-transparent hover:border-[#E2ECE7] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                            >
                              <div>
                                <p className="text-xs font-bold text-[#1A2E26]">
                                  {asset.name}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  S/N: {asset.serialNumber} • Tag: {asset.assetTag} •{' '}
                                  {asset.customerCompany}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 text-[#164E3D] border border-emerald-200">
                                {asset.calibrationStatus}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {globalSearchResults.matchedQuotes.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Quotes & Proforma Invoices ({globalSearchResults.matchedQuotes.length})
                        </p>
                        <div className="space-y-1.5">
                          {globalSearchResults.matchedQuotes.map((qt) => (
                            <button
                              key={qt.id}
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceForPrint(qt);
                                setSearchFocused(false);
                              }}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-[#F4F8F6] border border-transparent hover:border-[#E2ECE7] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                            >
                              <div>
                                <p className="text-xs font-bold text-[#164E3D] font-mono">
                                  {qt.quoteRef} / {qt.proformaInvoiceRef}
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  {qt.customerCompany} ({qt.contactName})
                                </p>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#1A2E26]">
                                {formatAmount(qt.totalUSD, qt.exchangeRateNGN)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {globalSearchResults.matchedCerts.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Calibration Certificates ({globalSearchResults.matchedCerts.length})
                        </p>
                        <div className="space-y-1.5">
                          {globalSearchResults.matchedCerts.map((cert) => (
                            <button
                              key={cert.id}
                              type="button"
                              onClick={() => {
                                setSelectedCertForPrint(cert);
                                setSearchFocused(false);
                              }}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-[#F4F8F6] border border-transparent hover:border-[#E2ECE7] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                            >
                              <div>
                                <p className="text-xs font-bold text-[#164E3D] font-mono">
                                  {cert.certificateNumber}
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  {cert.equipmentName} • S/N: {cert.serialNumber}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#0E3529] font-mono text-[10px] font-bold">
                                View Cert
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Auth/Onboarding + Currency Toggle + Notification Center + Role/User Profile Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Trigger for Auth, 2FA & CAC Onboarding Suite */}
            <button
              type="button"
              onClick={() => setAuthModalTab('login')}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-[#D4AF37] border border-[#164E3D]/25 text-xs font-bold transition-colors cursor-pointer"
              title="Open Authentication, 2FA & CAC Onboarding Suite"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Auth, 2FA &amp; CAC Onboarding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('profile-facilities')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                activeModule === 'profile-facilities'
                  ? 'bg-[#D4AF37] text-[#0E3529] border-[#D4AF37]'
                  : 'bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border-[#E2ECE7]'
              }`}
              title="Manage Multi-Facility Addresses, Authorized Roster & IDOR Security"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Facilities &amp; Profile ({ companyProfile.cacRegistrationNumber })</span>
            </button>

            {/* Currency Switcher Pill */}
            <button
              type="button"
              onClick={() =>
                setDisplayCurrency((prev) => (prev === 'NGN' ? 'USD' : 'NGN'))
              }
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] border border-[#E2ECE7] text-xs font-mono cursor-pointer transition-colors"
              title="Toggle NGN / USD Display Currency"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-slate-600">
                <strong className="text-[#164E3D]">{displayCurrency}</strong> (₦
                {systemConfig.exchangeRateNGN.toLocaleString()}/$)
              </span>
            </button>

            {/* Notification Bell with Unread Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setRoleSwitcherOpen(false);
                }}
                className="relative p-2.5 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border border-[#E2ECE7] transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 rounded-full bg-[#D4AF37] text-[#0E3529] font-mono font-extrabold text-[11px] flex items-center justify-center border-2 border-white shadow-xs">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-[#164E3D] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs font-bold">Portal Notification Center</span>
                      </div>
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-[#D4AF37] hover:underline font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E2ECE7]">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 text-left transition-colors cursor-pointer ${
                            n.read
                              ? 'bg-white hover:bg-slate-50'
                              : 'bg-[#F4F8F6] hover:bg-[#EBF3F0]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-[#1A2E26]">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-1.5">
                            {n.timestamp}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile & Role Persona Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setRoleSwitcherOpen(!roleSwitcherOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl bg-[#164E3D] hover:bg-[#113F31] text-white border border-[#0E3529] transition-all cursor-pointer shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-[#0E3529] font-extrabold text-xs flex items-center justify-center font-mono">
                  {currentPortalUser.avatarInitials}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{currentPortalUser.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#D4AF37]">
                    {ROLE_META[activeRole].label}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
              </button>

              {roleSwitcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleSwitcherOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] z-50 overflow-hidden">
                    <div className="p-3.5 bg-[#F4F8F6] border-b border-[#E2ECE7]">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Interactive RBAC Persona Switcher
                      </p>
                      <p className="text-xs font-bold text-[#164E3D] mt-0.5">
                        Switch Between All 5 Enterprise Roles
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      {availableUsers.map((u) => {
                        const isCurrent = u.role === activeRole;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectRole(u.role)}
                            className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#EBF3F0] border border-[#164E3D]/30'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                isCurrent
                                  ? 'bg-[#164E3D] text-[#D4AF37]'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.avatarInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-[#1A2E26] truncate">
                                  {ROLE_META[u.role].label}
                                </p>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37] text-[#0E3529]">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 truncate">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {ROLE_META[u.role].description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-2.5 bg-slate-50 border-t border-[#E2ECE7] flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRoleSwitcherOpen(false);
                            setAuthModalTab('onboarding');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#164E3D]/10 text-[#164E3D] hover:bg-[#164E3D] hover:text-[#D4AF37] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          CAC Onboarding & 2FA
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRoleSwitcherOpen(false);
                            logoutPortalSession();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Lock / Sign Out
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#E2ECE7]">
                        <span className="text-[10px] font-mono text-slate-400">
                          SHA-256: {sessionState.passwordHashPreview.slice(0, 12)}...
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigate('home')}
                          className="text-[11px] font-semibold text-[#164E3D] hover:underline cursor-pointer"
                        >
                          Exit to Public Website &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* TOAST FEEDBACK BANNER */}
        {toastMessage && (
          <div className="mx-4 sm:mx-8 mt-4 px-4 py-3 rounded-2xl bg-[#164E3D] text-white border border-[#D4AF37] shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===================================================================
            3. MAIN WORKSPACE CONTENT STAGE
           =================================================================== */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          {/* Role Context Banner & Quick Role Selector Bar */}
          <div className="rounded-[18px] bg-gradient-to-r from-[#164E3D] via-[#124133] to-[#0E3529] text-white p-6 shadow-md border border-emerald-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#D4AF37] text-[#0E3529]">
                  {ROLE_META[activeRole].label}
                </span>
                <span className="text-xs font-mono text-emerald-200/90">
                  {currentPortalUser.department} • {currentPortalUser.organization}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome back, {currentPortalUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
                {ROLE_META[activeRole].description}
              </p>
            </div>

            {/* Instant Role Matrix Bar for Reviewers */}
            <div className="bg-[#0E3529]/90 p-3 rounded-2xl border border-emerald-800/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>RBAC Role Matrix Switcher (Instant Preview)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableUsers.map((u) => {
                  const active = u.role === activeRole;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectRole(u.role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#D4AF37] text-[#0E3529] font-bold shadow-xs'
                          : 'bg-emerald-950/70 text-emerald-100 hover:bg-emerald-900 border border-emerald-800/70'
                      }`}
                    >
                      {ROLE_META[u.role].shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =================================================================
              KPI QUICK-STATISTIC METRIC CARDS (FOR STAFF & ADMIN ROLES)
              (Customer role renders its specialized 4 KPI cards inside CustomerDigitalPassportModule)
             ================================================================= */}
          {activeRole !== 'customer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="bg-white rounded-[16px] p-5 border border-[#E2ECE7] shadow-xs flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Registered Assets
                  </span>
                  <p className="text-3xl font-extrabold text-[#164E3D] mt-1 font-mono">
                    {equipmentAssets.length}
                  </p>
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    {equipmentAssets.filter((a) => a.calibrationStatus === 'Valid').length} ISO
                    17025 Compliant
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center">
                  <FlaskConical className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-[16px] p-5 border border-[#E2ECE7] shadow-xs flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Active Service Jobs
                  </span>
                  <p className="text-3xl font-extrabold text-[#1A2E26] mt-1 font-mono">
                    {serviceTickets.filter((t) => t.status !== 'Completed').length}
                  </p>
                  <p className="text-xs text-amber-700 font-medium mt-1">
                    {serviceTickets.filter((t) => t.priority.includes('Critical')).length}{' '}
                    Critical 4-Hr SLA Jobs
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-[16px] p-5 border border-[#E2ECE7] shadow-xs flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quotes & Proforma
                  </span>
                  <p className="text-3xl font-extrabold text-[#164E3D] mt-1 font-mono">
                    {quotesInvoices.length}
                  </p>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    +{rfqLeads.length} Shared Public RFQ Leads
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-[16px] p-5 border border-[#E2ECE7] shadow-xs flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Calibration Certs
                  </span>
                  <p className="text-3xl font-extrabold text-[#164E3D] mt-1 font-mono">
                    {certificates.length}
                  </p>
                  <p className="text-xs text-[#A17E22] font-semibold mt-1">
                    100% NIST / PTB Traceable
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 text-[#0E3529] flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#A17E22]" />
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              ROLE 1: REGISTERED CUSTOMER WORKSPACE
              (Overview Dashboard, Calibration Calendar & Digital Equipment Passport)
             ================================================================= */}
          {activeRole === 'customer' && (
            <div className="space-y-8">
              {(activeModule === 'overview' || activeModule === 'equipment') && (
                <CustomerDigitalPassportModule
                  activeSubView={activeModule === 'equipment' ? 'equipment' : 'overview'}
                  onNavigateModule={(modId) => setActiveModule(modId)}
                  onScheduleDeviceService={(asset) => {
                    setNewTicketForm((prev) => ({
                      ...prev,
                      equipmentSerial: asset.serialNumber,
                      description: `Requested on-site ISO/IEC 17025 calibration / service for ${asset.name} (${asset.model}) located at ${asset.facilityLocation} (${asset.labRoom || 'Main Lab'}).`,
                    }));
                    setNewTicketModalOpen(true);
                  }}
                  onOpenCertPrintModal={(cert) => setSelectedCertForPrint(cert)}
                  onShowToast={showToast}
                />
              )}

              {/* Section B & C: Customer Portal Document Center (Quotes, PO Upload, Proforma & ISO Certificates) */}
              {(activeModule === 'overview' ||
                activeModule === 'quotes' ||
                activeModule === 'certificates') && (
                <CustomerDocumentCenter onShowToast={showToast} />
              )}

              {/* Section D: Field Service Management (FSM) — Customer Service Request Module */}
              {(activeModule === 'overview' || activeModule === 'tickets') && (
                <CustomerServiceRequestModule
                  onOpenNewRequestModal={() => setNewTicketModalOpen(true)}
                  onInspectCertificate={(cert) => setSelectedCertForPrint(cert)}
                  onShowToast={showToast}
                />
              )}
            </div>
          )}

          {/* =================================================================
              ROLE 2: FIELD SERVICE TECHNICIAN MOBILE-FIRST WORKSPACE
             ================================================================= */}
          {activeRole === 'technician' && activeModule !== 'profile-facilities' && (
            <FieldTechnicianMobileWorkspace
              onCertificateIssued={(cert) => setSelectedCertForPrint(cert)}
              onShowToast={showToast}
            />
          )}

          {/* =================================================================
              ROLE 3: SERVICE COORDINATOR DISPATCH CONSOLE (Kanban, Calendar & Drawer)
             ================================================================= */}
          {activeRole === 'coordinator' &&
            activeModule !== 'profile-facilities' &&
            activeModule !== 'live-desk' && (
              <CoordinatorDispatchConsole onShowToast={showToast} />
            )}

          {/* =================================================================
              ROLE 4: ACCOUNTS & SALES SPECIALIST WORKSPACE
             ================================================================= */}
          {activeRole === 'accounts-sales' &&
            activeModule !== 'profile-facilities' &&
            activeModule !== 'live-desk' && (
            <div className="space-y-8">
              <StaffQuotationBuilderAndEngine onShowToast={showToast} />

              {/* Shared Public Website RFQ Leads Table */}
              <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#E2ECE7] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                      Shared Public Website Database
                    </span>
                    <h3 className="text-lg font-bold text-[#1A2E26]">
                      Incoming Web RFQ Submissions ({rfqLeads.length})
                    </h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F4F8F6] text-[11px] font-mono uppercase text-slate-500 border-b border-[#E2ECE7]">
                        <th className="py-3.5 px-4">RFQ Reference</th>
                        <th className="py-3.5 px-4">Client & Contact</th>
                        <th className="py-3.5 px-4">Requested Scope</th>
                        <th className="py-3.5 px-4">Lead Status</th>
                        <th className="py-3.5 px-4 text-right">Commercial Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2ECE7] text-xs">
                      {rfqLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-[#F4F8F6]/60">
                          <td className="py-4 px-4 font-mono font-bold text-[#164E3D]">
                            {lead.refCode}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#1A2E26]">
                              {lead.clientCompany}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {lead.clientName} • {lead.clientEmail}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-700">
                              {lead.itemsCount} Equipment Line(s) • {lead.deliveryState}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              Timeline: {lead.services.deliveryTimeline} | SLA:{' '}
                              {lead.services.maintenanceSla}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF3F0] text-[#164E3D]">
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleConvertRfqToQuote(lead.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#0E3529] hover:bg-[#e2be46] font-bold text-xs transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Generate Quote & PI</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Proforma Invoicing & Payment Verification Table */}
              <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#E2ECE7]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#A17E22] font-bold">
                    Accounts Receivable & Treasury
                  </span>
                  <h3 className="text-lg font-bold text-[#1A2E26]">
                    Issued Quotes, Proforma Invoices & Payment Verification
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F4F8F6] text-[11px] font-mono uppercase text-slate-500 border-b border-[#E2ECE7]">
                        <th className="py-3.5 px-4">Quote / Proforma #</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Gross Total</th>
                        <th className="py-3.5 px-4">Settlement Status</th>
                        <th className="py-3.5 px-4 text-right">Treasury & Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2ECE7] text-xs">
                      {quotesInvoices.map((qt) => (
                        <tr key={qt.id} className="hover:bg-[#F4F8F6]/60">
                          <td className="py-4 px-4 font-mono">
                            <div className="font-bold text-[#164E3D]">
                              {qt.proformaInvoiceRef}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Quote: {qt.quoteRef}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#1A2E26]">
                              {qt.customerCompany}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {qt.contactName}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-sm">
                            {formatAmount(qt.totalUSD, qt.exchangeRateNGN)}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                qt.paymentStatus === 'Verified & Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {qt.paymentStatus}
                            </span>
                            {qt.paymentReference && (
                              <div className="text-[10px] font-mono text-slate-500 mt-1">
                                Ref: {qt.paymentReference}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                            {qt.paymentStatus !== 'Verified & Paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const ref = `ZENITH-NIP-${new Date()
                                    .toISOString()
                                    .slice(0, 10)
                                    .replace(/-/g, '')}-${Math.floor(
                                    1000 + Math.random() * 9000
                                  )}`;
                                  verifyInvoicePayment(qt.id, 'Verified & Paid', ref);
                                  showToast(
                                    `Payment verified for ${qt.proformaInvoiceRef} (${ref})`
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#164E3D] text-[#D4AF37] hover:bg-[#0E3529] font-bold text-xs cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Verify Payment</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForPrint(qt)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border border-[#E2ECE7] font-semibold text-xs cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View PI</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              LIVE DESK & WHATSAPP CONTROL CONSOLE
             ================================================================= */}
          {activeModule === 'live-desk' && <LiveChatDeskManager />}

          {/* =================================================================
              ROLE 5: PORTAL SUPER ADMIN WORKSPACE
             ================================================================= */}
          {activeRole === 'portal-admin' && activeModule === 'users-roles' && (
            <UserRoleManager contextMode="portal" />
          )}

          {activeRole === 'portal-admin' &&
            activeModule !== 'profile-facilities' &&
            activeModule !== 'users-roles' &&
            activeModule !== 'live-desk' && (
              <div className="space-y-8">
                {/* MySQL/MariaDB 11-Table Schema & System Hardening Blueprint Console */}
                <DatabaseAndHardeningBlueprintConsole onShowToast={showToast} />
                {/* 1. RBAC Permissions Matrix */}
                <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-[#E2ECE7] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                        Enterprise Access Governance
                      </span>
                      <h3 className="text-lg font-bold text-[#1A2E26]">
                        Interactive 5-Role RBAC Permissions Matrix
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-500">
                        Click any cell to toggle live role capability permissions
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveModule('users-roles')}
                        className="px-3.5 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 hover:bg-[#0E3529] transition-colors cursor-pointer shadow-xs"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Manage Users &amp; Assign Roles ({managedUsers.length})</span>
                      </button>
                    </div>
                  </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#164E3D] text-white text-[11px] font-mono uppercase">
                        <th className="py-3.5 px-4">Capability / Resource</th>
                        <th className="py-3.5 px-4 text-center">Customer</th>
                        <th className="py-3.5 px-4 text-center">Technician</th>
                        <th className="py-3.5 px-4 text-center">Coordinator</th>
                        <th className="py-3.5 px-4 text-center">Accounts/Sales</th>
                        <th className="py-3.5 px-4 text-center">Super Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2ECE7] text-xs">
                      {rbacMatrix.map((row) => (
                        <tr key={row.id} className="hover:bg-[#F4F8F6]/60">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#1A2E26]">
                              {row.capability}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              Module: {row.moduleName}
                            </div>
                          </td>
                          {(
                            [
                              'customer',
                              'technician',
                              'coordinator',
                              'accounts-sales',
                              'portal-admin',
                            ] as PortalRole[]
                          ).map((rKey) => {
                            const allowed = row.permissions[rKey];
                            return (
                              <td key={rKey} className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleRbacPermission(row.id, rKey)}
                                  className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                                    allowed
                                      ? 'bg-emerald-100 text-[#164E3D] border border-emerald-300'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                                  }`}
                                  title={`Toggle ${row.capability} for ${rKey}`}
                                >
                                  {allowed ? (
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                  ) : (
                                    <X className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. System Configurations & 3. Security Audit Trail */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* System Config Form (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-6 space-y-4">
                  <div className="border-b border-[#E2ECE7] pb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#A17E22] font-bold">
                      Global Parameters
                    </span>
                    <h3 className="text-base font-bold text-[#1A2E26]">
                      Portal System Configurations
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Certificate Numbering Prefix
                      </label>
                      <input
                        type="text"
                        value={systemConfig.certPrefix}
                        onChange={(e) =>
                          updateSystemConfig({ certPrefix: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Exchange Rate (NGN/USD)
                        </label>
                        <input
                          type="number"
                          value={systemConfig.exchangeRateNGN}
                          onChange={(e) =>
                            updateSystemConfig({
                              exchangeRateNGN: Number(e.target.value) || 1600,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Statutory VAT (%)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={systemConfig.vatPercent}
                          onChange={(e) =>
                            updateSystemConfig({
                              vatPercent: Number(e.target.value) || 7.5,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Platinum SLA (Hours)
                        </label>
                        <input
                          type="number"
                          value={systemConfig.platinumSlaHours}
                          onChange={(e) =>
                            updateSystemConfig({
                              platinumSlaHours: Number(e.target.value) || 4,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Cal Recall Notice (Days)
                        </label>
                        <input
                          type="number"
                          value={systemConfig.calibrationRecallDays}
                          onChange={(e) =>
                            updateSystemConfig({
                              calibrationRecallDays: Number(e.target.value) || 30,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                        />
                      </div>
                    </div>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] cursor-pointer">
                      <span className="font-semibold text-[#1A2E26]">
                        Require Strict Dual Metrologist Sign-Off
                      </span>
                      <input
                        type="checkbox"
                        checked={systemConfig.strictTwoManSignoff}
                        onChange={(e) =>
                          updateSystemConfig({
                            strictTwoManSignoff: e.target.checked,
                          })
                        }
                        className="rounded text-[#164E3D]"
                      />
                    </label>
                  </div>
                </div>

                {/* Security & Operational Audit Trail Inspection (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-[#E2ECE7] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                        Immutable Compliance Ledger
                      </span>
                      <h3 className="text-base font-bold text-[#1A2E26]">
                        Audit Trail Inspection ({auditLogs.length} Events)
                      </h3>
                    </div>
                    <input
                      type="text"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Filter audit trail..."
                      className="px-3 py-1.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs"
                    />
                  </div>
                  <div className="overflow-y-auto max-h-[380px] divide-y divide-[#E2ECE7]">
                    {auditLogs
                      .filter(
                        (log) =>
                          !auditSearch ||
                          log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.targetRef.toLowerCase().includes(auditSearch.toLowerCase())
                      )
                      .map((log) => (
                        <div key={log.id} className="p-4 hover:bg-[#F4F8F6]/60 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#164E3D]">{log.action}</span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {log.timestamp}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-500">
                            <span>Actor: {log.actorName}</span>
                            <span>•</span>
                            <span>Role: {log.actorRole}</span>
                            <span>•</span>
                            <span>Module: {log.module}</span>
                            <span>•</span>
                            <span>Ref: {log.targetRef}</span>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              MODULE: PROFILE, MULTI-FACILITY & SECURITY / ANTI-IDOR SUITE
             ================================================================= */}
          {activeModule === 'profile-facilities' && (
            <PortalProfileFacilityView
              onOpenAuthModal={(tab) => setAuthModalTab(tab)}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* =====================================================================
          MODAL 1: PRINTABLE ISO/IEC 17025 CALIBRATION CERTIFICATE
         ===================================================================== */}
      {selectedCertForPrint && (
        <div className="fixed inset-0 z-50 bg-[#0E3529]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border-2 border-[#D4AF37] shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between border-b-2 border-[#164E3D] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#164E3D] text-[#D4AF37] flex items-center justify-center">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#164E3D] tracking-tight">
                    SAMSTRUST TECHNOLOGIES LIMITED
                  </h3>
                  <p className="text-xs font-mono text-slate-600">
                    ISO/IEC 17025:2017 Accredited Metrology Laboratory • RC 9898142
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="px-3 py-1 rounded-lg bg-[#164E3D] text-[#D4AF37] text-xs font-bold">
                  {selectedCertForPrint.certificateNumber}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Issued: {selectedCertForPrint.calibrationDate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F8F6] p-4 rounded-2xl border border-[#E2ECE7] text-xs">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">
                  Customer Organization
                </p>
                <p className="font-bold text-[#1A2E26]">
                  {selectedCertForPrint.customerCompany}
                </p>
                <p className="text-slate-600 mt-1">
                  Instrument: <strong>{selectedCertForPrint.equipmentName}</strong>
                </p>
                <p className="font-mono text-slate-600">
                  S/N: {selectedCertForPrint.serialNumber} | Model:{' '}
                  {selectedCertForPrint.model}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">
                  Metrology Traceability & Ambient Conditions
                </p>
                <p className="font-mono text-slate-700">
                  Temp: {selectedCertForPrint.environmentalTemp} | Humidity:{' '}
                  {selectedCertForPrint.environmentalHumidity}
                </p>
                <p className="text-slate-600 mt-1">
                  Master Std: {selectedCertForPrint.referenceStandardUsed}
                </p>
                <p className="font-mono text-emerald-800 font-bold mt-1">
                  Uncertainty: {selectedCertForPrint.uncertaintyBudgetK2}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E2ECE7] rounded-xl">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#164E3D] text-white text-[11px]">
                    <th className="py-2 px-3">Point #</th>
                    <th className="py-2 px-3">Nominal</th>
                    <th className="py-2 px-3">As-Found</th>
                    <th className="py-2 px-3">As-Left</th>
                    <th className="py-2 px-3">Tolerance</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE7]">
                  {selectedCertForPrint.readings.map((r) => (
                    <tr key={r.pointNumber}>
                      <td className="py-2 px-3 font-sans font-semibold">
                        Point {r.pointNumber}
                      </td>
                      <td className="py-2 px-3">{r.nominalValue}</td>
                      <td className="py-2 px-3">{r.asFoundValue}</td>
                      <td className="py-2 px-3 font-bold text-[#164E3D]">
                        {r.asLeftValue}
                      </td>
                      <td className="py-2 px-3">{r.toleranceLimit}</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">
                        {r.pass ? 'PASS' : 'FAIL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div>
                <strong>Metrologist Work Summary:</strong>{' '}
                {selectedCertForPrint.workReportSummary}
              </div>
              <div className="text-[11px] font-mono text-emerald-800 pt-1 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Tamper-Evident QR Verification: https://samstrusttech.com/verify/
                  {selectedCertForPrint.certificateNumber}
                </span>
                <span>NMI Chain: {selectedCertForPrint.traceabilityNmi}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E2ECE7] text-xs">
              <div>
                <p className="text-slate-400 font-mono text-[10px] uppercase">
                  Calibrated By
                </p>
                <p className="font-bold text-[#1A2E26]">
                  {selectedCertForPrint.technicianName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-mono text-[10px] uppercase">
                  Authorized Signatory
                </p>
                <p className="font-bold text-[#164E3D]">
                  {selectedCertForPrint.approvingMetrologist}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const allowed = logSensitiveDocumentDownload(
                    'Calibration Certificate',
                    selectedCertForPrint.certificateNumber,
                    selectedCertForPrint.customerCompany
                  );
                  if (!allowed) {
                    showToast(
                      `Anti-IDOR Security Block: ${currentPortalUser.organization} is not authorized to download ${selectedCertForPrint.certificateNumber}.`
                    );
                    return;
                  }
                  showToast(
                    `Ownership verified. Logged download of ${selectedCertForPrint.certificateNumber} to immutable audit ledger.`
                  );
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Verify Ownership & Download Official PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCertForPrint(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: PRINTABLE PROFORMA INVOICE / COMMERCIAL QUOTE
         ===================================================================== */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-[#0E3529]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border-2 border-[#164E3D] shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-[#E2ECE7] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-[#D4AF37] text-[#0E3529] font-mono text-[10px] font-bold uppercase">
                  Official Commercial Proforma Invoice
                </span>
                <h3 className="text-xl font-extrabold text-[#164E3D] mt-1">
                  SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142)
                </h3>
                <p className="text-xs text-slate-500">
                  Info@samstrusttech.com • +234 802 984 4356 • www.samstrusttech.com
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-[#164E3D]">
                  {selectedInvoiceForPrint.proformaInvoiceRef}
                </div>
                <div className="text-slate-500">
                  Quote: {selectedInvoiceForPrint.quoteRef}
                </div>
                <div className="text-slate-400">
                  Date: {selectedInvoiceForPrint.issuedDate}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F8F6] p-4 rounded-2xl text-xs">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">Billed To</p>
                <p className="font-bold text-[#1A2E26]">
                  {selectedInvoiceForPrint.customerCompany}
                </p>
                <p className="text-slate-600">
                  Attn: {selectedInvoiceForPrint.contactName}
                </p>
                <p className="text-slate-500">{selectedInvoiceForPrint.contactEmail}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">
                  Remittance & Settlement Terms
                </p>
                <p className="font-semibold text-[#164E3D]">
                  Method: {selectedInvoiceForPrint.paymentMethod}
                </p>
                <p className="text-slate-600 mt-1">{selectedInvoiceForPrint.notes}</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E2ECE7] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#164E3D] text-white font-mono text-[11px]">
                    <th className="py-2.5 px-3">Model / SKU</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE7]">
                  {selectedInvoiceForPrint.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#164E3D]">
                        {item.model}
                      </td>
                      <td className="py-2.5 px-3">{item.description}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{item.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatAmount(
                          item.unitPriceUSD,
                          selectedInvoiceForPrint.exchangeRateNGN
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {formatAmount(
                          item.qty * item.unitPriceUSD,
                          selectedInvoiceForPrint.exchangeRateNGN
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end space-y-1 text-xs font-mono">
              <div>
                Subtotal:{' '}
                {formatAmount(
                  selectedInvoiceForPrint.subtotalUSD,
                  selectedInvoiceForPrint.exchangeRateNGN
                )}
              </div>
              <div>
                VAT ({selectedInvoiceForPrint.vatPercent}%):{' '}
                {formatAmount(
                  selectedInvoiceForPrint.totalUSD - selectedInvoiceForPrint.subtotalUSD,
                  selectedInvoiceForPrint.exchangeRateNGN
                )}
              </div>
              <div className="text-base font-extrabold text-[#164E3D]">
                Total Payable:{' '}
                {formatAmount(
                  selectedInvoiceForPrint.totalUSD,
                  selectedInvoiceForPrint.exchangeRateNGN
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2ECE7]">
              <button
                type="button"
                onClick={() => {
                  const allowed = logSensitiveDocumentDownload(
                    'Proforma Invoice',
                    selectedInvoiceForPrint.proformaInvoiceRef,
                    selectedInvoiceForPrint.customerCompany
                  );
                  if (!allowed) {
                    showToast(
                      `Anti-IDOR Security Block: ${currentPortalUser.organization} is not authorized to download ${selectedInvoiceForPrint.proformaInvoiceRef}.`
                    );
                    return;
                  }
                  showToast(
                    `Ownership verified. Logged download of ${selectedInvoiceForPrint.proformaInvoiceRef} to immutable audit ledger.`
                  );
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Verify Ownership & Download Proforma PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: REGISTER NEW EQUIPMENT ASSET
         ===================================================================== */}
      {registerAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0E3529]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRegisterAssetSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E2ECE7] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
              <h3 className="text-base font-bold text-[#164E3D]">
                Register New Equipment in Metrology Registry
              </h3>
              <button
                type="button"
                onClick={() => setRegisterAssetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-ST-2026-9941"
                  value={newAssetForm.serialNumber}
                  onChange={(e) =>
                    setNewAssetForm({ ...newAssetForm, serialNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Plant Asset Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. FT-401-A"
                  value={newAssetForm.assetTag}
                  onChange={(e) =>
                    setNewAssetForm({ ...newAssetForm, assetTag: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">
                Equipment Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ultrasonic Clamp-On Flowmeter"
                value={newAssetForm.name}
                onChange={(e) =>
                  setNewAssetForm({ ...newAssetForm, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Samstrust Flow Control"
                  value={newAssetForm.manufacturer}
                  onChange={(e) =>
                    setNewAssetForm({ ...newAssetForm, manufacturer: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  placeholder="e.g. ST-EMF-9000"
                  value={newAssetForm.model}
                  onChange={(e) =>
                    setNewAssetForm({ ...newAssetForm, model: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2ECE7]">
              <button
                type="button"
                onClick={() => setRegisterAssetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] text-xs font-bold cursor-pointer"
              >
                Register Instrument
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: CUSTOMER SERVICE REQUEST INTAKE MODAL (Registered or Unlisted)
         ===================================================================== */}
      <CustomerServiceRequestIntakeModal
        isOpen={newTicketModalOpen}
        onClose={() => setNewTicketModalOpen(false)}
        initialEquipmentSerial={newTicketForm.equipmentSerial}
        initialDescription={newTicketForm.description}
        onTicketCreated={(created) => {
          showToast(
            `Service ticket ${created.ticketNumber} (${created.serviceType} · ${created.urgencyRating || created.priority}) submitted to Coordinator Dispatch Console.`
          );
        }}
      />

      {/* =====================================================================
          MODAL 5: COMMERCIAL QUOTE & PROFORMA GENERATOR
         ===================================================================== */}
      {quoteGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0E3529]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomQuote}
            className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E2ECE7] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
              <h3 className="text-base font-bold text-[#164E3D]">
                Commercial Quote & Proforma Invoice Generator
              </h3>
              <button
                type="button"
                onClick={() => setQuoteGeneratorModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Organization
                </label>
                <input
                  type="text"
                  required
                  value={newQuoteForm.customerCompany}
                  onChange={(e) =>
                    setNewQuoteForm({
                      ...newQuoteForm,
                      customerCompany: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuoteForm.contactName}
                    onChange={(e) =>
                      setNewQuoteForm({ ...newQuoteForm, contactName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newQuoteForm.paymentMethod}
                    onChange={(e) =>
                      setNewQuoteForm({
                        ...newQuoteForm,
                        paymentMethod:
                          e.target.value as PortalQuoteAndInvoice['paymentMethod'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                  >
                    <option value="Bank Wire Transfer (NGN)">
                      Bank Wire Transfer (NGN)
                    </option>
                    <option value="Corporate PO (Net-30)">Corporate PO (Net-30)</option>
                    <option value="DOM Account Wire (USD)">DOM Account Wire (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Catalog Instrument (Shared DB)
                  </label>
                  <select
                    value={newQuoteForm.selectedProductId}
                    onChange={(e) =>
                      setNewQuoteForm({
                        ...newQuoteForm,
                        selectedProductId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={newQuoteForm.qty}
                    onChange={(e) =>
                      setNewQuoteForm({
                        ...newQuoteForm,
                        qty: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Calibration / Commissioning Scope
                  </label>
                  <input
                    type="text"
                    value={newQuoteForm.customServiceDesc}
                    onChange={(e) =>
                      setNewQuoteForm({
                        ...newQuoteForm,
                        customServiceDesc: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Service (USD)
                  </label>
                  <input
                    type="number"
                    value={newQuoteForm.customServiceUSD}
                    onChange={(e) =>
                      setNewQuoteForm({
                        ...newQuoteForm,
                        customServiceUSD: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2ECE7]">
              <button
                type="button"
                onClick={() => setQuoteGeneratorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] text-xs font-bold cursor-pointer"
              >
                Issue Quote & Proforma
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL 7: AUTHENTICATION, 2FA, CAC ONBOARDING & PASSWORD RESET SUITE
         ===================================================================== */}
      {authModalTab && (
        <PortalAuthSuite
          isModal
          initialTab={authModalTab}
          onCloseModal={() => setAuthModalTab(null)}
          onAuthenticated={() => {
            setAuthModalTab(null);
            showToast(
              'Corporate session authenticated & security audit ledger updated.'
            );
          }}
        />
      )}
    </div>
  );
};
