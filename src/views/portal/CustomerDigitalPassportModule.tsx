import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  Wrench,
  Download,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  QrCode,
  ShieldCheck,
  MapPin,
  Building2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Sparkles,
  History,
  X,
  Check,
  SlidersHorizontal,
  ArrowUpRight,
  Printer,
  Eye,
  Layers,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import {
  EquipmentAsset,
  CalibrationCertificate,
  EquipmentServiceTimelineEvent,
} from '../../types/portal';
import { computeSyncDigest } from '../../utils/portalSecurity';

interface CustomerDigitalPassportModuleProps {
  activeSubView: 'overview' | 'equipment';
  onNavigateModule: (moduleId: string) => void;
  onScheduleDeviceService: (asset: EquipmentAsset) => void;
  onOpenCertPrintModal: (cert: CalibrationCertificate) => void;
  onShowToast: (msg: string) => void;
}

interface CalendarMilestone {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  monthKey: string; // YYYY-MM
  title: string;
  subtitle: string;
  type: 'calibration_visit' | 'maintenance_window' | 'service_milestone';
  equipmentSerial: string;
  equipmentName: string;
  facilityLocation: string;
  technician?: string;
  badgeText: string;
}

const CALENDAR_MONTHS = [
  { key: '2026-10', label: 'October 2026', daysInMonth: 31, startWeekday: 4 }, // Thu
  { key: '2026-11', label: 'November 2026', daysInMonth: 30, startWeekday: 0 }, // Sun
  { key: '2026-12', label: 'December 2026', daysInMonth: 31, startWeekday: 2 }, // Tue
  { key: '2027-01', label: 'January 2027', daysInMonth: 31, startWeekday: 5 }, // Fri
  { key: '2027-02', label: 'February 2027', daysInMonth: 28, startWeekday: 1 }, // Mon
  { key: '2027-03', label: 'March 2027', daysInMonth: 31, startWeekday: 1 }, // Mon
];

/**
 * Deterministic SVG QR-Code Matrix Generator for Tamper-Evident Certificate Verification
 */
const TamperEvidentQrMatrix: React.FC<{ seedString: string; size?: number }> = ({
  seedString,
  size = 112,
}) => {
  const gridCells = useMemo(() => {
    const digest = computeSyncDigest(seedString);
    const gridSize = 15;
    const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    const drawFinderPattern = (r0: number, c0: number) => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
          const isCenter = r === 2 && c === 2;
          matrix[r0 + r][c0 + c] = isBorder || isCenter;
        }
      }
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, gridSize - 5);
    drawFinderPattern(gridSize - 5, 0);

    let charIdx = 0;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const inTopLeft = r < 6 && c < 6;
        const inTopRight = r < 6 && c >= gridSize - 6;
        const inBottomLeft = r >= gridSize - 6 && c < 6;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        const code = digest.charCodeAt(charIdx % digest.length) + r * 7 + c * 13;
        matrix[r][c] = code % 2 === 0;
        charIdx++;
      }
    }
    return matrix;
  }, [seedString]);

  const cellSize = size / 15;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg bg-white p-1.5 border border-[#164E3D]/20 shadow-2xs shrink-0"
      aria-label="Tamper-evident ISO/IEC 17025 verification QR code"
    >
      {gridCells.map((row, rIdx) =>
        row.map((filled, cIdx) =>
          filled ? (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx * cellSize}
              y={rIdx * cellSize}
              width={cellSize + 0.3}
              height={cellSize + 0.3}
              fill="#164E3D"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const CustomerDigitalPassportModule: React.FC<
  CustomerDigitalPassportModuleProps
> = ({
  activeSubView,
  onNavigateModule,
  onScheduleDeviceService,
  onOpenCertPrintModal,
  onShowToast,
}) => {
  const {
    currentPortalUser,
    equipmentAssets,
    certificates,
    serviceTickets,
    quotesInvoices,
    facilities,
    addEquipmentAsset,
    logSensitiveDocumentDownload,
  } = usePortal();

  // =========================================================================
  // 1. SEARCH & MULTI-FACET FILTER STATE FOR EQUIPMENT REGISTRY
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [selectedOemBrand, setSelectedOemBrand] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCalStatus, setSelectedCalStatus] = useState<string>('ALL');

  // Selected Equipment for "Digital Equipment Passport" Detail View
  const [selectedPassportAssetId, setSelectedPassportAssetId] = useState<
    string | null
  >('eq-01');
  const [qrVerificationBanner, setQrVerificationBanner] = useState<{
    certNumber: string;
    token: string;
    digest: string;
    verifiedAt: string;
  } | null>(null);

  // =========================================================================
  // 2. INTERACTIVE CALENDAR WIDGET STATE
  // =========================================================================
  const [calendarMonthIdx, setCalendarMonthIdx] = useState(0); // 0 = Oct 2026
  const [calendarTypeFilter, setCalendarTypeFilter] = useState<
    'ALL' | 'calibration_visit' | 'maintenance_window' | 'service_milestone'
  >('ALL');
  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState<string>('2026-10-28');

  // =========================================================================
  // 3. MULTI-STEP EQUIPMENT SELF-REGISTRATION WIZARD STATE
  // =========================================================================
  const [selfRegModalOpen, setSelfRegModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [intakeForm, setIntakeForm] = useState({
    // Step 1: Hardware Identity & Serial Tags
    name: '',
    serialNumber: '',
    assetTag: '',
    manufacturer: 'Samstrust Metrology OEM',
    model: '',
    category: 'Weighing & Mass' as EquipmentAsset['category'],
    // Step 2: Specifications, Commissioning & Lab Assignment
    facilityLocation:
      facilities[0]?.facilityName
        ? `${facilities[0].facilityName}, ${facilities[0].state}`
        : 'Grade B Cleanroom Lab, Ikeja, Lagos',
    labRoom: 'Cleanroom Suite B-204 (Analytical Metrology Bay)',
    commissioningDate: '2026-10-15',
    measurementRange: '0.0001 g – 220 g',
    accuracyClass: 'OIML Class I / ±0.1 mg',
    calibrationIntervalMonths: 6 as 6 | 12,
    slaTier: 'Platinum' as EquipmentAsset['slaTier'],
    // Step 3: Baseline Calibration Certificate Upload
    certificateRef: `CERT-ISO17025-2026-${Math.floor(1100 + Math.random() * 899)}`,
    lastCalibrationDate: '2026-10-15',
    nextDueDate: '2027-04-15',
    calibrationStatus: 'Valid' as EquipmentAsset['calibrationStatus'],
    baselineCertFileName: '',
    baselineCertFileSizeKb: 0,
    baselineCertChecksum: '',
    traceabilityNmi: 'PTB Germany / NIST USA Primary Chain',
  });

  // =========================================================================
  // 4. CUSTOMER OVERVIEW KPI METRICS
  // =========================================================================
  const kpiStats = useMemo(() => {
    const totalEquipment = equipmentAssets.length;
    const validCount = equipmentAssets.filter(
      (a) => a.calibrationStatus === 'Valid'
    ).length;

    // Calibration Expiring Soon (<30 Days) or Overdue / Due Soon / In Calibration
    const expiringSoonAssets = equipmentAssets.filter((a) => {
      if (
        a.calibrationStatus === 'Due Soon' ||
        a.calibrationStatus === 'Overdue' ||
        a.calibrationStatus === 'In Calibration'
      ) {
        return true;
      }
      const dueMs = new Date(a.nextDueDate).getTime();
      const nowMs = new Date('2026-10-26').getTime();
      const diffDays = (dueMs - nowMs) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });

    const activeServiceTickets = serviceTickets.filter(
      (t) => t.status !== 'Completed'
    );
    const pendingQuotations = quotesInvoices.filter(
      (q) =>
        q.quoteStatus === 'Sent for Approval' ||
        q.quoteStatus === 'Draft' ||
        q.paymentStatus !== 'Verified & Paid'
    );

    return {
      totalEquipment,
      validCount,
      expiringSoonCount: expiringSoonAssets.length,
      activeTicketsCount: activeServiceTickets.length,
      pendingQuotesCount: pendingQuotations.length,
    };
  }, [equipmentAssets, serviceTickets, quotesInvoices]);

  // =========================================================================
  // 5. CALENDAR MILESTONES GENERATOR (VISITS, MAINTENANCE WINDOWS, DUE DATES)
  // =========================================================================
  const calendarMilestones = useMemo<CalendarMilestone[]>(() => {
    const list: CalendarMilestone[] = [];

    // 1. Scheduled Calibration Visits & Service Tickets
    serviceTickets.forEach((t) => {
      if (!t.scheduledDate || t.scheduledDate === 'Unscheduled') return;
      const monthKey = t.scheduledDate.slice(0, 7);
      const dayOfMonth = Number(t.scheduledDate.slice(8, 10)) || 1;
      const isMaintenance =
        t.serviceType === 'Preventive Maintenance (PPM)' ||
        t.serviceType === 'Emergency Breakdown';

      list.push({
        id: `cal-tkt-${t.id}`,
        date: t.scheduledDate,
        dayOfMonth,
        monthKey,
        title: `${t.serviceType}: ${t.equipmentName}`,
        subtitle: `Ticket ${t.ticketNumber} • Engineer: ${t.assignedTechnician}`,
        type: isMaintenance ? 'maintenance_window' : 'calibration_visit',
        equipmentSerial: t.equipmentSerial,
        equipmentName: t.equipmentName,
        facilityLocation: t.facilityLocation,
        technician: t.assignedTechnician,
        badgeText: t.status,
      });
    });

    // 2. Equipment Calibration Due Milestones & Scheduled Maintenance Windows
    equipmentAssets.forEach((asset) => {
      if (asset.nextDueDate) {
        const monthKey = asset.nextDueDate.slice(0, 7);
        const dayOfMonth = Number(asset.nextDueDate.slice(8, 10)) || 1;
        list.push({
          id: `cal-due-${asset.id}`,
          date: asset.nextDueDate,
          dayOfMonth,
          monthKey,
          title: `Calibration Expiration Milestone: ${asset.name}`,
          subtitle: `S/N: ${asset.serialNumber} • Cert: ${asset.certificateRef}`,
          type: 'service_milestone',
          equipmentSerial: asset.serialNumber,
          equipmentName: asset.name,
          facilityLocation: asset.facilityLocation,
          badgeText: asset.calibrationStatus,
        });
      }
    });

    // 3. Curated Preventive Maintenance Windows & Metrology Audits across Oct-Dec 2026
    const curatedEvents: CalendarMilestone[] = [
      {
        id: 'cal-cur-1',
        date: '2026-10-30',
        dayOfMonth: 30,
        monthKey: '2026-10',
        title: 'Cleanroom HVAC & VAV Fume Hood Maintenance Window',
        subtitle: 'Quarterly HEPA Differential Pressure & Face Velocity Audit',
        type: 'maintenance_window',
        equipmentSerial: 'SN-ST-2025-9102',
        equipmentName: 'VAV Aerodynamic Laboratory Fume Cupboard',
        facilityLocation: 'Toxic Synthesis Wing, Ikeja, Lagos',
        technician: 'Engr. Tunde Bakare',
        badgeText: 'PPM Window',
      },
      {
        id: 'cal-cur-2',
        date: '2026-11-04',
        dayOfMonth: 4,
        monthKey: '2026-11',
        title: 'On-Site ISO/IEC 17025 Multi-Balance Calibration Visit',
        subtitle: 'Primary OIML Class E2 Mass Reference Standard Dispatch',
        type: 'calibration_visit',
        equipmentSerial: 'SN-ST-2025-8841',
        equipmentName: 'Analytical 0.1mg Precision Balance',
        facilityLocation: 'Grade B Cleanroom Lab, Ikeja, Lagos',
        technician: 'Engr. Nnamdi Okoye',
        badgeText: 'Confirmed Visit',
      },
      {
        id: 'cal-cur-3',
        date: '2026-11-18',
        dayOfMonth: 18,
        monthKey: '2026-11',
        title: 'Optical Stray-Light & Deuterium Lamp Preventive Maintenance',
        subtitle: 'Spectroscopy Suite 305 Semi-Annual Optical Alignment',
        type: 'maintenance_window',
        equipmentSerial: 'SN-ST-2025-7730',
        equipmentName: 'UV-Visible Double Beam Scanning Spectrophotometer',
        facilityLocation: 'Assay QC Suite 3, Ikeja, Lagos',
        technician: 'Engr. Nnamdi Okoye',
        badgeText: 'Scheduled PPM',
      },
      {
        id: 'cal-cur-4',
        date: '2026-12-09',
        dayOfMonth: 9,
        monthKey: '2026-12',
        title: 'End-of-Year NAFDAC & ISO 17025 Equipment Readiness Milestone',
        subtitle: 'Full Plant Metrology Traceability & Certificate Audit',
        type: 'service_milestone',
        equipmentSerial: 'SN-ST-2025-8841',
        equipmentName: 'Analytical 0.1mg Precision Balance',
        facilityLocation: 'Grade B Cleanroom Lab, Ikeja, Lagos',
        badgeText: 'Audit Milestone',
      },
    ];

    return [...list, ...curatedEvents].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [serviceTickets, equipmentAssets]);

  const activeCalendarMonth = CALENDAR_MONTHS[calendarMonthIdx];

  const milestonesInActiveMonth = useMemo(() => {
    return calendarMilestones.filter(
      (m) =>
        m.monthKey === activeCalendarMonth.key &&
        (calendarTypeFilter === 'ALL' || m.type === calendarTypeFilter)
    );
  }, [calendarMilestones, activeCalendarMonth.key, calendarTypeFilter]);

  const milestonesOnSelectedDate = useMemo(() => {
    const exact = calendarMilestones.filter(
      (m) =>
        m.date === selectedCalendarDate &&
        (calendarTypeFilter === 'ALL' || m.type === calendarTypeFilter)
    );
    return exact.length > 0 ? exact : milestonesInActiveMonth;
  }, [
    calendarMilestones,
    selectedCalendarDate,
    calendarTypeFilter,
    milestonesInActiveMonth,
  ]);

  // =========================================================================
  // 6. UNIQUE FILTER OPTIONS & FILTERED EQUIPMENT LIST
  // =========================================================================
  const uniqueFacilities = useMemo(
    () => Array.from(new Set(equipmentAssets.map((a) => a.facilityLocation))),
    [equipmentAssets]
  );

  const uniqueBrands = useMemo(
    () => Array.from(new Set(equipmentAssets.map((a) => a.manufacturer))),
    [equipmentAssets]
  );

  const uniqueCategories: EquipmentAsset['category'][] = [
    'Weighing & Mass',
    'Flow Metering',
    'Pressure & DP',
    'Thermal & Cleanroom',
    'Analytical & Optical',
  ];

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return equipmentAssets.filter((asset) => {
      const matchesSearch =
        !q ||
        asset.name.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        asset.assetTag.toLowerCase().includes(q) ||
        asset.model.toLowerCase().includes(q) ||
        asset.manufacturer.toLowerCase().includes(q) ||
        (asset.labRoom && asset.labRoom.toLowerCase().includes(q));

      const matchesFacility =
        selectedFacility === 'ALL' ||
        asset.facilityLocation === selectedFacility;
      const matchesBrand =
        selectedOemBrand === 'ALL' || asset.manufacturer === selectedOemBrand;
      const matchesCategory =
        selectedCategory === 'ALL' || asset.category === selectedCategory;
      const matchesStatus =
        selectedCalStatus === 'ALL' ||
        (selectedCalStatus === 'EXPIRING_SOON'
          ? asset.calibrationStatus === 'Due Soon' ||
            asset.calibrationStatus === 'Overdue' ||
            asset.calibrationStatus === 'In Calibration'
          : asset.calibrationStatus === selectedCalStatus);

      return (
        matchesSearch &&
        matchesFacility &&
        matchesBrand &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    equipmentAssets,
    searchQuery,
    selectedFacility,
    selectedOemBrand,
    selectedCategory,
    selectedCalStatus,
  ]);

  const selectedPassportAsset = useMemo(
    () =>
      equipmentAssets.find((a) => a.id === selectedPassportAssetId) ||
      filteredAssets[0] ||
      equipmentAssets[0] ||
      null,
    [equipmentAssets, selectedPassportAssetId, filteredAssets]
  );

  const passportLinkedCertificates = useMemo(() => {
    if (!selectedPassportAsset) return [];
    const exactMatches = certificates.filter(
      (c) =>
        c.serialNumber === selectedPassportAsset.serialNumber ||
        c.certificateNumber === selectedPassportAsset.certificateRef
    );
    return exactMatches.length > 0
      ? exactMatches
      : certificates.slice(0, 1);
  }, [certificates, selectedPassportAsset]);

  // =========================================================================
  // 7. BASELINE CERTIFICATE FILE UPLOAD HANDLER & SELF-REGISTRATION SUBMIT
  // =========================================================================
  const handleBaselineFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const checksum = computeSyncDigest(
      `${file.name}:${file.size}:${file.lastModified}`
    );
    setIntakeForm((prev) => ({
      ...prev,
      baselineCertFileName: file.name,
      baselineCertFileSizeKb: Math.max(12, Math.round(file.size / 1024)),
      baselineCertChecksum: checksum,
    }));
  };

  const handleAttachSampleBaselineCert = () => {
    const sampleName = `OEM_Baseline_ISO17025_${intakeForm.serialNumber || 'SN2026'}.pdf`;
    const checksum = computeSyncDigest(`${sampleName}:${Date.now()}`);
    setIntakeForm((prev) => ({
      ...prev,
      baselineCertFileName: sampleName,
      baselineCertFileSizeKb: 428,
      baselineCertChecksum: checksum,
    }));
  };

  const handleCompleteSelfRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.name.trim() || !intakeForm.serialNumber.trim()) {
      onShowToast('Please provide the Equipment Name and Serial Number.');
      setWizardStep(1);
      return;
    }

    const normalizedSerial = intakeForm.serialNumber.trim().toUpperCase();
    const normalizedTag =
      intakeForm.assetTag.trim().toUpperCase() ||
      `TAG-${normalizedSerial.slice(-4)}`;

    addEquipmentAsset({
      serialNumber: normalizedSerial,
      assetTag: normalizedTag,
      name: intakeForm.name.trim(),
      manufacturer: intakeForm.manufacturer.trim() || 'Samstrust Metrology OEM',
      model: intakeForm.model.trim() || 'ST-PRO-2026',
      category: intakeForm.category,
      customerCompany: currentPortalUser.organization,
      facilityLocation: intakeForm.facilityLocation,
      labRoom: intakeForm.labRoom,
      commissioningDate: intakeForm.commissioningDate,
      calibrationIntervalMonths: intakeForm.calibrationIntervalMonths,
      measurementRange: intakeForm.measurementRange,
      accuracyClass: intakeForm.accuracyClass,
      calibrationStatus: intakeForm.calibrationStatus,
      lastCalibrationDate: intakeForm.lastCalibrationDate,
      nextDueDate: intakeForm.nextDueDate,
      certificateRef: intakeForm.certificateRef,
      slaTier: intakeForm.slaTier,
      baselineCertFileName:
        intakeForm.baselineCertFileName ||
        `Baseline_${normalizedSerial}_ISO17025.pdf`,
      baselineCertChecksum:
        intakeForm.baselineCertChecksum ||
        computeSyncDigest(normalizedSerial),
    });

    setSelfRegModalOpen(false);
    setWizardStep(1);
    onShowToast(
      `Registered Digital Equipment Passport for ${intakeForm.name} (${normalizedSerial}) with baseline certificate ${intakeForm.certificateRef}.`
    );
  };

  return (
    <div className="space-y-8">
      {/* =====================================================================
          1. CUSTOMER OVERVIEW DASHBOARD: 4 REQUIRED KPI METRIC CARDS
         ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Total Registered Equipment */}
        <button
          type="button"
          onClick={() => {
            setSelectedCalStatus('ALL');
            onNavigateModule('equipment');
          }}
          className="text-left bg-white rounded-[16px] p-5 border border-[#E2ECE7] hover:border-[#164E3D] shadow-xs transition-all flex items-start justify-between group cursor-pointer"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Registered Equipment
            </span>
            <p className="text-3xl font-extrabold text-[#164E3D] mt-1 font-mono">
              {kpiStats.totalEquipment}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1.5">
              <span>{kpiStats.validCount} Active ISO 17025 Passports</span>
              <span aria-hidden="true">·</span>
              <span className="underline group-hover:text-[#164E3D]">
                Inspect Registry
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EBF3F0] text-[#164E3D] group-hover:bg-[#164E3D] group-hover:text-[#D4AF37] transition-colors flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
        </button>

        {/* Card 2: Calibration Expiring Soon (<30 Days) */}
        <button
          type="button"
          onClick={() => {
            setSelectedCalStatus('EXPIRING_SOON');
            onNavigateModule('equipment');
          }}
          className="text-left bg-white rounded-[16px] p-5 border border-[#E2ECE7] hover:border-[#D4AF37] shadow-xs transition-all flex items-start justify-between group cursor-pointer"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Calibration Expiring (&lt;30 Days)
            </span>
            <p className="text-3xl font-extrabold text-amber-600 mt-1 font-mono">
              {kpiStats.expiringSoonCount}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium mt-1.5">
              <span>Requires Recalibration Window</span>
              <span aria-hidden="true">·</span>
              <span className="underline">Filter List</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 group-hover:bg-[#D4AF37] group-hover:text-[#0E3529] transition-colors flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </button>

        {/* Card 3: Active Service Tickets */}
        <button
          type="button"
          onClick={() => onNavigateModule('tickets')}
          className="text-left bg-white rounded-[16px] p-5 border border-[#E2ECE7] hover:border-[#164E3D] shadow-xs transition-all flex items-start justify-between group cursor-pointer"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Service Tickets
            </span>
            <p className="text-3xl font-extrabold text-[#1A2E26] mt-1 font-mono">
              {kpiStats.activeTicketsCount}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1.5">
              <span>Field & Lab Dispatch Queue</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#164E3D] underline">View SLA</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EBF3F0] text-[#164E3D] group-hover:bg-[#164E3D] group-hover:text-[#D4AF37] transition-colors flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
        </button>

        {/* Card 4: Pending Quotations */}
        <button
          type="button"
          onClick={() => onNavigateModule('quotes')}
          className="text-left bg-white rounded-[16px] p-5 border border-[#E2ECE7] hover:border-[#164E3D] shadow-xs transition-all flex items-start justify-between group cursor-pointer"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Quotations
            </span>
            <p className="text-3xl font-extrabold text-[#164E3D] mt-1 font-mono">
              {kpiStats.pendingQuotesCount}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#A17E22] font-semibold mt-1.5">
              <span>Awaiting Approval / Proforma</span>
              <span aria-hidden="true">·</span>
              <span className="underline">Review</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 text-[#0E3529] group-hover:bg-[#D4AF37] transition-colors flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#A17E22] group-hover:text-[#0E3529]" />
          </div>
        </button>
      </div>

      {/* =====================================================================
          CUSTOMER ACTION HEADER BAR
         ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-[16px] border border-[#E2ECE7] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#164E3D]">
            <span>Digital Equipment Passport & Metrology Asset Vault</span>
            <span aria-hidden="true">·</span>
            <span>ISO/IEC 17025:2017 Traceable</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1A2E26] mt-0.5">
            Laboratory Inventory, Calibration Scheduling & Asset Passports
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setWizardStep(1);
              setSelfRegModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border border-[#164E3D]/25 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Self-Register Equipment (3-Step Intake)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedPassportAsset) {
                onScheduleDeviceService(selectedPassportAsset);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#113F31] text-[#D4AF37] text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Schedule Calibration / Service</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. INTERACTIVE CALIBRATION & MAINTENANCE CALENDAR WIDGET
          (Shown on Customer Overview Dashboard)
         ===================================================================== */}
      {activeSubView === 'overview' && (
        <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#E2ECE7] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#F4F8F6] to-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#164E3D] font-semibold">
                <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Interactive Calibration & Maintenance Calendar</span>
              </div>
              <h3 className="text-lg font-bold text-[#1A2E26] mt-0.5">
                Scheduled Calibration Visits, Maintenance Windows & Service Milestones
              </h3>
            </div>

            {/* Segmented Event Type Filter Controls */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F8F6] rounded-xl border border-[#E2ECE7]">
              {[
                { id: 'ALL', label: 'All Schedule Events' },
                { id: 'calibration_visit', label: 'Calibration Visits' },
                { id: 'maintenance_window', label: 'Maintenance Windows' },
                { id: 'service_milestone', label: 'Due Milestones' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setCalendarTypeFilter(
                      tab.id as typeof calendarTypeFilter
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    calendarTypeFilter === tab.id
                      ? 'bg-[#164E3D] text-[#D4AF37] shadow-2xs'
                      : 'text-slate-600 hover:text-[#1A2E26]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E2ECE7]">
            {/* Left 7 Cols: Interactive Monthly Calendar Grid */}
            <div className="lg:col-span-7 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={calendarMonthIdx === 0}
                    onClick={() =>
                      setCalendarMonthIdx((i) => Math.max(0, i - 1))
                    }
                    className="p-2 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] disabled:opacity-40 text-[#164E3D] cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm sm:text-base font-extrabold text-[#164E3D] min-w-[140px] text-center">
                    {activeCalendarMonth.label}
                  </span>
                  <button
                    type="button"
                    disabled={calendarMonthIdx === CALENDAR_MONTHS.length - 1}
                    onClick={() =>
                      setCalendarMonthIdx((i) =>
                        Math.min(CALENDAR_MONTHS.length - 1, i + 1)
                      )
                    }
                    className="p-2 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] disabled:opacity-40 text-[#164E3D] cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Legend */}
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#164E3D]" />
                    Calibration Visit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    PPM Window
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Due Milestone
                  </span>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-mono uppercase text-slate-400 pb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Calendar Day Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: activeCalendarMonth.startWeekday }).map(
                  (_, emptyIdx) => (
                    <div
                      key={`empty-${emptyIdx}`}
                      className="h-16 sm:h-20 rounded-xl bg-slate-50/50 border border-transparent"
                    />
                  )
                )}

                {Array.from({ length: activeCalendarMonth.daysInMonth }).map(
                  (_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `${activeCalendarMonth.key}-${String(
                      dayNum
                    ).padStart(2, '0')}`;
                    const dayEvents = milestonesInActiveMonth.filter(
                      (m) => m.dayOfMonth === dayNum
                    );
                    const isSelected = selectedCalendarDate === dateStr;
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        className={`h-16 sm:h-20 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-sm'
                            : hasEvents
                            ? 'bg-[#F4F8F6] hover:bg-[#EBF3F0] border-[#164E3D]/30 text-[#1A2E26]'
                            : 'bg-white hover:bg-slate-50 border-[#E2ECE7] text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs font-mono font-bold ${
                              isSelected
                                ? 'text-[#D4AF37]'
                                : hasEvents
                                ? 'text-[#164E3D]'
                                : 'text-slate-500'
                            }`}
                          >
                            {dayNum}
                          </span>
                          {hasEvents && (
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                isSelected
                                  ? 'bg-[#D4AF37] text-[#0E3529]'
                                  : 'bg-[#164E3D]/10 text-[#164E3D]'
                              }`}
                            >
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Event Indicators */}
                        <div className="space-y-0.5 w-full overflow-hidden">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`truncate text-[10px] font-medium flex items-center gap-1 ${
                                isSelected ? 'text-emerald-100' : 'text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  ev.type === 'calibration_visit'
                                    ? isSelected
                                      ? 'bg-[#D4AF37]'
                                      : 'bg-[#164E3D]'
                                    : ev.type === 'maintenance_window'
                                    ? 'bg-[#D4AF37]'
                                    : 'bg-red-500'
                                }`}
                              />
                              <span className="truncate">
                                {ev.equipmentSerial}
                              </span>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Right 5 Cols: Selected Date / Month Schedule Inspector */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-[#F4F8F6]/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-[#164E3D] font-bold">
                      Schedule & Milestone Inspector
                    </span>
                    <h4 className="text-sm font-bold text-[#1A2E26]">
                      Events for {selectedCalendarDate} ({milestonesOnSelectedDate.length}{' '}
                      Scheduled)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate('')}
                    className="text-xs font-semibold text-[#164E3D] hover:underline cursor-pointer"
                  >
                    Show All in {activeCalendarMonth.label}
                  </button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {milestonesOnSelectedDate.map((item) => {
                    const matchedAsset = equipmentAssets.find(
                      (a) => a.serialNumber === item.equipmentSerial
                    );
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white border border-[#E2ECE7] hover:border-[#164E3D]/40 shadow-2xs space-y-2.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                          <span className="font-bold text-[#164E3D]">
                            {item.date}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span
                            className={`font-bold ${
                              item.type === 'calibration_visit'
                                ? 'text-emerald-700'
                                : item.type === 'maintenance_window'
                                ? 'text-[#A17E22]'
                                : 'text-red-600'
                            }`}
                          >
                            {item.type === 'calibration_visit'
                              ? 'ISO 17025 Calibration Visit'
                              : item.type === 'maintenance_window'
                              ? 'Maintenance Window (PPM)'
                              : 'Calibration Expiration Milestone'}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-[#1A2E26]">
                            {item.title}
                          </h5>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {item.subtitle}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#164E3D]" />
                            <span>{item.facilityLocation}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2ECE7]">
                          {matchedAsset && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPassportAssetId(matchedAsset.id);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Inspect Digital Passport
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onScheduleDeviceService(matchedAsset)
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-[#164E3D] text-[#D4AF37] hover:bg-[#0E3529] text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Reschedule / Book Visit
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EBF3F0] border border-[#164E3D]/20 flex items-center justify-between gap-3 text-xs">
                <div className="text-[#1A2E26]">
                  <span className="font-bold text-[#164E3D]">
                    Automated SLA Reminders Active:
                  </span>{' '}
                  Email & WhatsApp alerts dispatch 30, 14, and 7 days prior to
                  calibration expiration.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. EQUIPMENT REGISTRY TABLE ("DIGITAL EQUIPMENT PASSPORT" INVENTORY)
          WITH INSTANT SEARCH & 4 MULTI-FACET FILTERS
         ===================================================================== */}
      <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E2ECE7] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#164E3D] font-bold">
                <span>Digital Equipment Passport Registry</span>
                <span aria-hidden="true">·</span>
                <span>
                  Showing {filteredAssets.length} of {equipmentAssets.length}{' '}
                  Registered Instruments
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1A2E26] mt-0.5">
                Laboratory & Process Equipment Inventory
              </h3>
            </div>

            {/* Calibration Status Segmented Filter Bar */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F8F6] rounded-xl border border-[#E2ECE7]">
              {[
                { id: 'ALL', label: 'All Statuses' },
                { id: 'Valid', label: 'Valid' },
                { id: 'Due Soon', label: 'Due Soon' },
                { id: 'In Calibration', label: 'In Calibration' },
                { id: 'Overdue', label: 'Overdue' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedCalStatus(st.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCalStatus === st.id
                      ? 'bg-[#164E3D] text-[#D4AF37] shadow-2xs'
                      : 'text-slate-600 hover:text-[#1A2E26]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & 3 Dropdown Filters (Facility Location, Brand/OEM, Equipment Category) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search serial number, asset tag, model, lab room..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] focus:bg-white focus:border-[#164E3D] text-xs text-[#1A2E26] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter 1: Facility Location */}
            <div className="lg:col-span-3">
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                aria-label="Filter by Facility Location"
                className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs text-[#1A2E26] font-medium outline-none focus:border-[#164E3D]"
              >
                <option value="ALL">All Facility Locations ({uniqueFacilities.length})</option>
                {uniqueFacilities.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Brand / OEM */}
            <div className="lg:col-span-2">
              <select
                value={selectedOemBrand}
                onChange={(e) => setSelectedOemBrand(e.target.value)}
                aria-label="Filter by OEM Brand"
                className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs text-[#1A2E26] font-medium outline-none focus:border-[#164E3D]"
              >
                <option value="ALL">All OEM Brands ({uniqueBrands.length})</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Equipment Category */}
            <div className="lg:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by Equipment Category"
                className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs text-[#1A2E26] font-medium outline-none focus:border-[#164E3D]"
              >
                <option value="ALL">All Categories (5)</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="lg:col-span-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFacility('ALL');
                  setSelectedOemBrand('ALL');
                  setSelectedCategory('ALL');
                  setSelectedCalStatus('ALL');
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8F6] text-[11px] font-mono uppercase text-slate-500 border-b border-[#E2ECE7]">
                <th className="py-3.5 px-4">Serial & Internal Tag</th>
                <th className="py-3.5 px-4">Equipment Name, OEM & Model</th>
                <th className="py-3.5 px-4">Assigned Facility & Lab Room</th>
                <th className="py-3.5 px-4">Commissioned & Due Date</th>
                <th className="py-3.5 px-4">Calibration Status</th>
                <th className="py-3.5 px-4 text-right">Digital Passport Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2ECE7] text-xs">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No registered equipment matches your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = selectedPassportAsset?.id === asset.id;
                  const linkedCert =
                    certificates.find(
                      (c) =>
                        c.certificateNumber === asset.certificateRef ||
                        c.serialNumber === asset.serialNumber
                    ) || certificates[0];

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedPassportAssetId(asset.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF3F0]/85'
                          : 'hover:bg-[#F4F8F6]/60'
                      }`}
                    >
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-[#164E3D] flex items-center gap-1.5">
                          <span>{asset.serialNumber}</span>
                          {isSelected && (
                            <span className="text-[10px] font-sans font-bold text-[#A17E22]">
                              • Inspected
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Asset Tag: {asset.assetTag}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-[#1A2E26]">
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {asset.manufacturer} · {asset.model} · {asset.category}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#1A2E26]">
                          {asset.facilityLocation}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {asset.labRoom || 'Main Analytical Metrology Suite'}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-700">
                        <div>Due: {asset.nextDueDate}</div>
                        <div className="text-[10px] text-slate-500">
                          Comm: {asset.commissioningDate || '2025-01-15'} · Last:{' '}
                          {asset.lastCalibrationDate}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              asset.calibrationStatus === 'Valid'
                                ? 'bg-emerald-600'
                                : asset.calibrationStatus === 'Due Soon'
                                ? 'bg-amber-500'
                                : asset.calibrationStatus === 'In Calibration'
                                ? 'bg-blue-600'
                                : 'bg-red-600'
                            }`}
                          />
                          <span
                            className={
                              asset.calibrationStatus === 'Valid'
                                ? 'text-emerald-800'
                                : asset.calibrationStatus === 'Due Soon'
                                ? 'text-amber-800'
                                : asset.calibrationStatus === 'In Calibration'
                                ? 'text-blue-800'
                                : 'text-red-700'
                            }
                          >
                            {asset.calibrationStatus}
                          </span>
                        </div>
                      </td>

                      <td
                        className="py-4 px-4 text-right space-x-2 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedPassportAssetId(asset.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#164E3D] text-[#D4AF37]'
                              : 'bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border border-[#164E3D]/20'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Passport</span>
                        </button>

                        {linkedCert && (
                          <button
                            type="button"
                            onClick={() => onOpenCertPrintModal(linkedCert)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#164E3D] text-[#164E3D] hover:text-[#D4AF37] border border-[#E2ECE7] font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Cert PDF</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onScheduleDeviceService(asset)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 text-[#0E3529] border border-[#D4AF37]/50 hover:bg-[#D4AF37] font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Schedule</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          4. EQUIPMENT DETAIL VIEW: "DIGITAL EQUIPMENT PASSPORT" INSPECTOR
         ===================================================================== */}
      {selectedPassportAsset && (
        <div className="bg-white rounded-[18px] border-2 border-[#164E3D] shadow-md overflow-hidden">
          {/* Passport Header Banner */}
          <div className="p-6 bg-gradient-to-r from-[#164E3D] via-[#124133] to-[#0E3529] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#D4AF37]">
                <QrCode className="w-4 h-4" />
                <span>DIGITAL EQUIPMENT PASSPORT</span>
                <span aria-hidden="true">·</span>
                <span>S/N: {selectedPassportAsset.serialNumber}</span>
                <span aria-hidden="true">·</span>
                <span>Internal Asset Tag: {selectedPassportAsset.assetTag}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {selectedPassportAsset.name}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90">
                OEM Brand: <strong>{selectedPassportAsset.manufacturer}</strong> · Model:{' '}
                <strong className="font-mono">{selectedPassportAsset.model}</strong> ·
                Category: <strong>{selectedPassportAsset.category}</strong>
              </p>
            </div>

            {/* Required Primary Action Button: "Schedule Service / Calibration for this Device" */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onScheduleDeviceService(selectedPassportAsset)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#e3be42] text-[#0E3529] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Schedule Service / Calibration for this Device</span>
              </button>
            </div>
          </div>

          {/* Passport Body Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Columns: Hardware Specs, Commissioning & Assigned Facility / Lab Room */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-[#164E3D] font-bold">
                      Hardware Specifications & Location
                    </span>
                    <h4 className="text-sm font-bold text-[#1A2E26]">
                      Commissioning & Facility Assignment
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#164E3D]">
                    {selectedPassportAsset.slaTier} SLA
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Equipment Name
                    </dt>
                    <dd className="font-bold text-[#1A2E26] mt-0.5">
                      {selectedPassportAsset.name}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      OEM Brand & Model
                    </dt>
                    <dd className="font-bold text-[#1A2E26] mt-0.5">
                      {selectedPassportAsset.manufacturer} ({selectedPassportAsset.model})
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Serial Number
                    </dt>
                    <dd className="font-mono font-bold text-[#164E3D] mt-0.5">
                      {selectedPassportAsset.serialNumber}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Internal Asset Tag
                    </dt>
                    <dd className="font-mono font-bold text-[#1A2E26] mt-0.5">
                      {selectedPassportAsset.assetTag}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Commissioning Date
                    </dt>
                    <dd className="font-mono font-bold text-[#1A2E26] mt-0.5">
                      {selectedPassportAsset.commissioningDate || '2025-02-10'}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Calibration Interval
                    </dt>
                    <dd className="font-mono font-bold text-[#164E3D] mt-0.5">
                      Every {selectedPassportAsset.calibrationIntervalMonths || 6}{' '}
                      Months
                    </dd>
                  </div>
                  <div className="sm:col-span-2 p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Assigned Facility & Laboratory Room
                    </dt>
                    <dd className="font-bold text-[#1A2E26] mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#164E3D] shrink-0" />
                      <span>{selectedPassportAsset.facilityLocation}</span>
                    </dd>
                    <dd className="text-[11px] font-mono text-[#164E3D] mt-1 pl-5">
                      Lab Room:{' '}
                      {selectedPassportAsset.labRoom ||
                        'Cleanroom Suite B-204 (Analytical Metrology Bay)'}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Measurement Range
                    </dt>
                    <dd className="font-mono font-semibold text-[#1A2E26] mt-0.5">
                      {selectedPassportAsset.measurementRange}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E2ECE7]">
                    <dt className="text-[10px] font-mono uppercase text-slate-400">
                      Accuracy Class / Tolerance
                    </dt>
                    <dd className="font-mono font-semibold text-emerald-800 mt-0.5">
                      {selectedPassportAsset.accuracyClass}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Service History Timeline */}
              <div className="p-5 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#164E3D]" />
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[#164E3D] font-bold">
                        Lifecycle Audit Log
                      </span>
                      <h4 className="text-sm font-bold text-[#1A2E26]">
                        Service, Repair & Calibration Timeline
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {(selectedPassportAsset.serviceHistory || []).length} Events
                  </span>
                </div>

                <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#164E3D]/25">
                  {(selectedPassportAsset.serviceHistory || []).map((ev) => (
                    <div
                      key={ev.id}
                      className="relative bg-white p-3.5 rounded-xl border border-[#E2ECE7] shadow-2xs space-y-1.5"
                    >
                      <span
                        className={`w-3 h-3 rounded-full absolute -left-[19px] top-4 border-2 border-white ${
                          ev.eventType === 'ISO 17025 Calibration'
                            ? 'bg-[#164E3D]'
                            : ev.eventType === 'Preventive Maintenance'
                            ? 'bg-[#D4AF37]'
                            : ev.eventType === 'Repair & Adjustment'
                            ? 'bg-amber-600'
                            : 'bg-emerald-600'
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                        <span className="font-bold text-[#164E3D]">
                          {ev.eventType}
                        </span>
                        <span className="text-slate-500">{ev.date}</span>
                      </div>
                      <h5 className="text-xs font-bold text-[#1A2E26]">
                        {ev.title}
                      </h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {ev.summary}
                      </p>
                      <div className="pt-1.5 border-t border-[#E2ECE7] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                        <span>Engineer: {ev.engineerName}</span>
                        <span className="font-bold text-emerald-700">
                          {ev.outcome}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Calibration Certificate Repository with Tamper-Evident QR Verification */}
            <div className="lg:col-span-7 space-y-5">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2ECE7] pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#164E3D] font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Calibration Certificate Repository</span>
                    </div>
                    <h4 className="text-base font-bold text-[#1A2E26] mt-0.5">
                      Tamper-Evident Digital PDF Certificates & QR Verification
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 font-semibold">
                    ISO/IEC 17025:2017 Accredited
                  </span>
                </div>

                {/* Live QR Verification Banner when user clicks "Verify QR Signature" */}
                {qrVerificationBanner && (
                  <div className="p-4 rounded-2xl bg-[#164E3D] text-white border border-[#D4AF37] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          CRYPTOGRAPHIC QR SIGNATURE VERIFIED • TAMPER-EVIDENT SEAL INTACT
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQrVerificationBanner(null)}
                        className="text-emerald-200 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-100">
                      Certificate <strong>{qrVerificationBanner.certNumber}</strong>{' '}
                      matches Samstrust NMI Ledger token{' '}
                      <code className="font-mono text-[#D4AF37]">
                        {qrVerificationBanner.token}
                      </code>
                      .
                    </p>
                    <p className="text-[11px] font-mono text-emerald-200/90">
                      SHA-256 Seal Digest: {qrVerificationBanner.digest} · Verified:{' '}
                      {qrVerificationBanner.verifiedAt}
                    </p>
                  </div>
                )}

                {/* Certificate Cards for this Equipment */}
                <div className="space-y-4">
                  {passportLinkedCertificates.map((cert) => {
                    const qrSeed = `${cert.certificateNumber}|${cert.serialNumber}|${cert.calibrationDate}|${selectedPassportAsset.qrVerificationToken || 'SAM-QR-VERIFIED'}`;
                    const sealDigest = computeSyncDigest(qrSeed);

                    return (
                      <div
                        key={cert.id}
                        className="p-5 rounded-2xl bg-white border border-[#E2ECE7] shadow-2xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                              <span className="font-extrabold text-[#164E3D]">
                                {cert.certificateNumber}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-700 font-bold">
                                {cert.status} (Tamper-Evident Digital Original)
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-[#1A2E26]">
                              {cert.equipmentName} — {cert.complianceStandard}
                            </h5>
                            <p className="text-xs text-slate-600">
                              Master Reference: {cert.referenceStandardUsed}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[10px]">
                                  CALIBRATED
                                </span>
                                <strong>{cert.calibrationDate}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">
                                  NEXT DUE DATE
                                </span>
                                <strong>{cert.nextDueDate}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">
                                  UNCERTAINTY (k=2)
                                </span>
                                <strong className="text-emerald-800">
                                  {cert.uncertaintyBudgetK2}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Tamper-Evident QR Matrix & Token */}
                          <div className="flex sm:flex-col items-center gap-2 bg-[#F4F8F6] p-3 rounded-2xl border border-[#E2ECE7] shrink-0">
                            <TamperEvidentQrMatrix
                              seedString={qrSeed}
                              size={96}
                            />
                            <div className="text-left sm:text-center font-mono">
                              <div className="text-[10px] font-bold text-[#164E3D]">
                                {selectedPassportAsset.qrVerificationToken ||
                                  'SAM-QR-ISO17025'}
                              </div>
                              <div className="text-[9px] text-slate-500">
                                Scan / Click to Verify
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* As-Found / As-Left Summary Table Preview */}
                        <div className="overflow-x-auto border border-[#E2ECE7] rounded-xl">
                          <table className="w-full text-left border-collapse text-[11px] font-mono">
                            <thead>
                              <tr className="bg-[#F4F8F6] text-slate-600 border-b border-[#E2ECE7]">
                                <th className="py-2 px-3">Test Point</th>
                                <th className="py-2 px-3">Nominal</th>
                                <th className="py-2 px-3">As-Found</th>
                                <th className="py-2 px-3">As-Left</th>
                                <th className="py-2 px-3">Uncertainty</th>
                                <th className="py-2 px-3">Verdict</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2ECE7]">
                              {cert.readings.map((pt) => (
                                <tr key={pt.pointNumber}>
                                  <td className="py-1.5 px-3 font-sans font-semibold">
                                    Pt {pt.pointNumber}
                                  </td>
                                  <td className="py-1.5 px-3">
                                    {pt.nominalValue}
                                  </td>
                                  <td className="py-1.5 px-3">
                                    {pt.asFoundValue}
                                  </td>
                                  <td className="py-1.5 px-3 font-bold text-[#164E3D]">
                                    {pt.asLeftValue}
                                  </td>
                                  <td className="py-1.5 px-3">
                                    {pt.expandedUncertainty}
                                  </td>
                                  <td className="py-1.5 px-3 font-bold text-emerald-700">
                                    {pt.pass ? 'PASS' : 'FAIL'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Tamper-Evident Metadata & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2ECE7]">
                          <div className="text-[11px] font-mono text-slate-500">
                            Tamper-Evident SHA-256 Seal:{' '}
                            <span className="text-[#164E3D] font-bold">
                              {sealDigest}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setQrVerificationBanner({
                                  certNumber: cert.certificateNumber,
                                  token:
                                    selectedPassportAsset.qrVerificationToken ||
                                    'SAM-QR-8841-ISO17025',
                                  digest: sealDigest,
                                  verifiedAt: new Date().toLocaleTimeString(
                                    'en-GB',
                                    { timeZone: 'Africa/Lagos' }
                                  ),
                                });
                                onShowToast(
                                  `QR Cryptographic Signature verified for ${cert.certificateNumber}.`
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border border-[#164E3D]/25 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Verify QR Signature</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const allowed = logSensitiveDocumentDownload(
                                  'Calibration Certificate',
                                  cert.certificateNumber,
                                  cert.customerCompany
                                );
                                if (!allowed) {
                                  onShowToast(
                                    `Anti-IDOR Security Block: ${currentPortalUser.organization} cannot download ${cert.certificateNumber}.`
                                  );
                                  return;
                                }
                                onOpenCertPrintModal(cert);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Tamper-Evident PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. MULTI-STEP EQUIPMENT SELF-REGISTRATION MODAL (3-STEP INTAKE WIZARD)
         ===================================================================== */}
      {selfRegModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0E3529]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-[#164E3D] shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E2ECE7] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#164E3D] font-bold">
                  <span>DIGITAL EQUIPMENT PASSPORT INTAKE</span>
                  <span aria-hidden="true">·</span>
                  <span>STEP {wizardStep} OF 3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#1A2E26] mt-0.5">
                  Multi-Step Laboratory Asset Self-Registration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelfRegModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-Step Progress Bar */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { step: 1, title: '1. Hardware & Serial Tags' },
                { step: 2, title: '2. Specs & Lab Room' },
                { step: 3, title: '3. Baseline Certificate' },
              ].map((s) => {
                const active = wizardStep === s.step;
                const completed = wizardStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setWizardStep(s.step as 1 | 2 | 3)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#164E3D] text-[#D4AF37] border-[#164E3D] font-bold'
                        : completed
                        ? 'bg-[#EBF3F0] text-[#164E3D] border-[#164E3D]/30 font-semibold'
                        : 'bg-[#F4F8F6] text-slate-500 border-[#E2ECE7]'
                    }`}
                  >
                    <div className="text-xs truncate">{s.title}</div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCompleteSelfRegistration} className="space-y-5">
              {/* STEP 1: HARDWARE IDENTITY & SERIAL TAGS */}
              {wizardStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Equipment Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Micro-Analytical Balance 0.01mg"
                        value={intakeForm.name}
                        onChange={(e) =>
                          setIntakeForm({ ...intakeForm, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] focus:bg-white focus:border-[#164E3D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Equipment Category *
                      </label>
                      <select
                        value={intakeForm.category}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            category: e.target.value as EquipmentAsset['category'],
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] outline-none"
                      >
                        {uniqueCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Manufacturer Serial Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SN-ST-2026-9420"
                        value={intakeForm.serialNumber}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            serialNumber: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Internal Plant / Lab Asset Tag *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BZ-QC-BAL-09"
                        value={intakeForm.assetTag}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            assetTag: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        OEM Brand / Manufacturer *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samstrust Metrology OEM"
                        value={intakeForm.manufacturer}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            manufacturer: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Model Designation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ST-MICRO-200X"
                        value={intakeForm.model}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            model: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SPECIFICATIONS, COMMISSIONING DATE & LAB ROOM */}
              {wizardStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Assigned Facility Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={intakeForm.facilityLocation}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            facilityLocation: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Assigned Lab Room / Cleanroom Bay *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cleanroom Suite B-204"
                        value={intakeForm.labRoom}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            labRoom: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Commissioning Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={intakeForm.commissioningDate}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            commissioningDate: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Calibration Cycle
                      </label>
                      <select
                        value={intakeForm.calibrationIntervalMonths}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            calibrationIntervalMonths: Number(
                              e.target.value
                            ) as 6 | 12,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      >
                        <option value={6}>Every 6 Months (Bi-Annual)</option>
                        <option value={12}>Every 12 Months (Annual)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        SLA Coverage Tier
                      </label>
                      <select
                        value={intakeForm.slaTier}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            slaTier: e.target.value as EquipmentAsset['slaTier'],
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] outline-none"
                      >
                        <option value="Platinum">Platinum (4-Hr SLA)</option>
                        <option value="Gold">Gold (12-Hr SLA)</option>
                        <option value="Silver">Silver (48-Hr SLA)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Measurement Range / Capacity *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 0.0001 g – 220 g"
                        value={intakeForm.measurementRange}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            measurementRange: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Manufacturer Accuracy Class / Tolerance *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. OIML Class I (±0.1 mg)"
                        value={intakeForm.accuracyClass}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            accuracyClass: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BASELINE CALIBRATION CERTIFICATE UPLOAD */}
              {wizardStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Baseline Certificate Ref *
                      </label>
                      <input
                        type="text"
                        required
                        value={intakeForm.certificateRef}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            certificateRef: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Baseline Calibration Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={intakeForm.lastCalibrationDate}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            lastCalibrationDate: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Next Calibration Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={intakeForm.nextDueDate}
                        onChange={(e) =>
                          setIntakeForm({
                            ...intakeForm,
                            nextDueDate: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Interactive Baseline Certificate Upload Dropzone */}
                  <div className="p-5 rounded-2xl border-2 border-dashed border-[#164E3D]/35 bg-[#F4F8F6] text-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#164E3D] text-[#D4AF37] flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A2E26]">
                        Upload Baseline OEM / ISO 17025 Calibration Certificate
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accepts PDF, PNG, or JPG. Computes SHA-256 tamper-evident
                        checksum and links QR code.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <label className="px-4 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs cursor-pointer hover:bg-[#0E3529] transition-colors">
                        <span>Choose Certificate File</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleBaselineFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleAttachSampleBaselineCert}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EBF3F0] text-[#164E3D] border border-[#164E3D]/25 font-bold text-xs cursor-pointer"
                      >
                        Attach Sample OEM Baseline PDF
                      </button>
                    </div>

                    {intakeForm.baselineCertFileName && (
                      <div className="p-3 rounded-xl bg-white border border-emerald-300 text-left flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-emerald-900">
                            {intakeForm.baselineCertFileName} (
                            {intakeForm.baselineCertFileSizeKb} KB)
                          </p>
                          <p className="text-[10px] font-mono text-slate-500">
                            SHA-256 Checksum: {intakeForm.baselineCertChecksum}
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wizard Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE7]">
                <div>
                  {wizardStep > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setWizardStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))
                      }
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      &larr; Previous Step
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelfRegModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  {wizardStep < 3 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setWizardStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))
                      }
                      className="px-5 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-extrabold text-xs shadow-md cursor-pointer"
                    >
                      Complete Registration & Issue Passport
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
