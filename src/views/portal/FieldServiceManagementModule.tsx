import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Upload,
  FileText,
  Camera,
  MapPin,
  Truck,
  UserCheck,
  ShieldCheck,
  Thermometer,
  Droplets,
  Gauge,
  Scale,
  Package,
  PenTool,
  Trash2,
  Award,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Tablet,
  Maximize2,
  Check,
  X,
  Search,
  Sparkles,
  Navigation,
  ClipboardCheck,
  RotateCcw,
} from 'lucide-react';
import {
  ServiceTicket,
  FsmKanbanStatus,
  CalibrationReadingPoint,
  ReplacedPartLogItem,
  FaultAttachmentFile,
  CalibrationCertificate,
} from '../../types/portal';
import { usePortal } from '../../context/PortalContext';

export const FSM_KANBAN_COLUMNS: {
  status: FsmKanbanStatus;
  label: string;
  accentColor: string;
  badgeClass: string;
}[] = [
  {
    status: 'Submitted',
    label: 'Submitted',
    accentColor: 'border-t-slate-500',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    status: 'Under Review',
    label: 'Under Review',
    accentColor: 'border-t-amber-500',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
  },
  {
    status: 'Scheduled',
    label: 'Scheduled',
    accentColor: 'border-t-sky-600',
    badgeClass: 'bg-sky-50 text-sky-900 border-sky-300',
  },
  {
    status: 'Assigned',
    label: 'Assigned',
    accentColor: 'border-t-indigo-600',
    badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-300',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    accentColor: 'border-t-[#D4AF37]',
    badgeClass: 'bg-[#D4AF37]/20 text-[#0E3529] border-[#D4AF37]',
  },
  {
    status: 'Awaiting Parts',
    label: 'Awaiting Parts',
    accentColor: 'border-t-rose-500',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
  },
  {
    status: 'Completed',
    label: 'Completed',
    accentColor: 'border-t-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
  },
  {
    status: 'Closed',
    label: 'Closed',
    accentColor: 'border-t-[#164E3D]',
    badgeClass: 'bg-[#164E3D] text-[#D4AF37] border-[#164E3D]',
  },
];

export const normalizeKanbanStatus = (status: ServiceTicket['status']): FsmKanbanStatus => {
  if (status === 'Pending Triage') return 'Submitted';
  if (status === 'Dispatched') return 'Assigned';
  return status;
};

export const mapUrgencyToPriority = (
  urgency: NonNullable<ServiceTicket['urgencyRating']>
): ServiceTicket['priority'] => {
  switch (urgency) {
    case 'Critical Production Stoppage':
      return 'Critical (4-Hr SLA)';
    case 'Urgent':
      return 'High (12-Hr SLA)';
    case 'Routine':
    default:
      return 'Standard (48-Hr SLA)';
  }
};

// ============================================================================
// 1. CUSTOMER SERVICE REQUEST INTAKE MODAL (Registered or Unlisted Device)
// ============================================================================
interface CustomerServiceRequestIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEquipmentSerial?: string;
  initialDescription?: string;
  onTicketCreated?: (ticket: ServiceTicket) => void;
}

export const CustomerServiceRequestIntakeModal: React.FC<
  CustomerServiceRequestIntakeModalProps
> = ({
  isOpen,
  onClose,
  initialEquipmentSerial,
  initialDescription,
  onTicketCreated,
}) => {
  const { equipmentAssets, facilities, currentPortalUser, companyProfile, createServiceTicket } =
    usePortal();

  const [deviceMode, setDeviceMode] = useState<'registered' | 'unlisted'>('registered');
  const [selectedSerial, setSelectedSerial] = useState<string>(
    initialEquipmentSerial || equipmentAssets[0]?.serialNumber || ''
  );

  // Unlisted device fields
  const [unlistedName, setUnlistedName] = useState('');
  const [unlistedOem, setUnlistedOem] = useState('');
  const [unlistedModel, setUnlistedModel] = useState('');
  const [unlistedSerial, setUnlistedSerial] = useState('');
  const [unlistedCategory, setUnlistedCategory] = useState('Weighing & Mass');
  const [unlistedFacility, setUnlistedFacility] = useState(
    facilities[0]?.facilityName
      ? `${facilities[0].facilityName}, ${facilities[0].state}`
      : 'Grade B Cleanroom Lab, Ikeja, Lagos'
  );

  const [serviceType, setServiceType] = useState<ServiceTicket['serviceType']>(
    'On-site ISO Calibration'
  );
  const [urgencyRating, setUrgencyRating] =
    useState<NonNullable<ServiceTicket['urgencyRating']>>('Urgent');
  const [preferredDate, setPreferredDate] = useState('2026-11-04');
  const [problemDescription, setProblemDescription] = useState(initialDescription || '');
  const [errorCodeLogs, setErrorCodeLogs] = useState('');
  const [attachments, setAttachments] = useState<FaultAttachmentFile[]>([]);

  useEffect(() => {
    if (initialEquipmentSerial) {
      setDeviceMode('registered');
      setSelectedSerial(initialEquipmentSerial);
    }
    if (initialDescription !== undefined) {
      setProblemDescription(initialDescription);
    }
  }, [initialEquipmentSerial, initialDescription]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added: FaultAttachmentFile[] = Array.from(files).map((file, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      fileName: file.name,
      fileSizeKb: Math.max(12, Math.round(file.size / 1024)),
      fileCategory: file.name.match(/\.(jpg|jpeg|png|webp)$/i)
        ? 'Equipment Photo'
        : file.name.match(/\.(csv|dump|dat)$/i)
          ? 'Diagnostic Dump'
          : 'Error Log',
      uploadedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }));
    setAttachments((prev) => [...prev, ...added]);
  };

  const handleAddSampleDiagnostic = (
    name: string,
    category: FaultAttachmentFile['fileCategory'],
    sizeKb: number
  ) => {
    if (attachments.some((a) => a.fileName === name)) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}-${Math.floor(Math.random() * 999)}`,
        fileName: name,
        fileSizeKb: sizeKb,
        fileCategory: category,
        uploadedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedAsset = equipmentAssets.find((a) => a.serialNumber === selectedSerial);

    const isUnlisted = deviceMode === 'unlisted';
    const finalEquipmentName = isUnlisted
      ? `${unlistedName.trim() || 'Unlisted Laboratory Instrument'} (${unlistedModel.trim() || 'OEM-STD'})`
      : matchedAsset?.name || 'Registered Instrument';
    const finalSerial = isUnlisted
      ? unlistedSerial.trim() || `UNLISTED-${Math.floor(1000 + Math.random() * 8999)}`
      : matchedAsset?.serialNumber || selectedSerial;
    const finalFacility = isUnlisted
      ? unlistedFacility
      : matchedAsset?.facilityLocation || companyProfile.primaryFacilityAddress;

    const priority = mapUrgencyToPriority(urgencyRating);
    const slaDeadline =
      urgencyRating === 'Critical Production Stoppage'
        ? `${preferredDate} (4-Hr Rapid Response)`
        : urgencyRating === 'Urgent'
          ? `${preferredDate} (12-Hr Priority SLA)`
          : `${preferredDate} (48-Hr Standard SLA)`;

    const created = createServiceTicket({
      customerCompany: companyProfile.companyName || currentPortalUser.organization,
      contactPerson: currentPortalUser.name,
      contactPhone: currentPortalUser.phone,
      facilityLocation: finalFacility,
      equipmentSerial: finalSerial,
      equipmentName: finalEquipmentName,
      isUnlistedDevice: isUnlisted,
      unlistedDeviceSpecs: isUnlisted
        ? {
            manufacturer: unlistedOem.trim() || 'Third-Party OEM',
            model: unlistedModel.trim() || 'Custom Model',
            category: unlistedCategory,
          }
        : undefined,
      serviceType,
      urgencyRating,
      priority,
      slaTier: matchedAsset?.slaTier || 'Platinum',
      status: 'Submitted',
      assignedTechnician: 'Unassigned',
      scheduledDate: `${preferredDate} 09:00 WAT`,
      slaDeadline,
      description:
        problemDescription.trim() ||
        `Requested ${serviceType} (${urgencyRating}) for ${finalEquipmentName} [${finalSerial}].`,
      errorCodeLogs: errorCodeLogs.trim() || undefined,
      uploadedAttachments: attachments.length > 0 ? attachments : undefined,
    });

    if (onTicketCreated) {
      onTicketCreated(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E3529]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[18px] max-w-2xl w-full border border-[#E2ECE7] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#164E3D] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold block">
              Samstrust Field Service Management (FSM)
            </span>
            <h3 className="text-lg font-bold tracking-tight mt-0.5">
              Submit Service & Calibration Ticket Request
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
          {/* 1. Device Selection Mode: Registered Passport vs. Unlisted Device */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Target Instrument Source
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#F4F8F6] rounded-xl border border-[#E2ECE7]">
              <button
                type="button"
                onClick={() => setDeviceMode('registered')}
                className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  deviceMode === 'registered'
                    ? 'bg-[#164E3D] text-[#D4AF37] shadow-xs'
                    : 'text-slate-600 hover:text-[#1A2E26]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Select Registered Equipment ({equipmentAssets.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('unlisted')}
                className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  deviceMode === 'unlisted'
                    ? 'bg-[#164E3D] text-[#D4AF37] shadow-xs'
                    : 'text-slate-600 hover:text-[#1A2E26]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Specify Unlisted / Third-Party Device</span>
              </button>
            </div>
          </div>

          {deviceMode === 'registered' ? (
            <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-3">
              <div>
                <label className="block font-bold text-[#1A2E26] mb-1">
                  Registered Digital Equipment Passport *
                </label>
                <select
                  value={selectedSerial}
                  onChange={(e) => setSelectedSerial(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2ECE7] font-medium text-[#1A2E26]"
                >
                  {equipmentAssets.map((asset) => (
                    <option key={asset.id} value={asset.serialNumber}>
                      {asset.name} — S/N: {asset.serialNumber} ({asset.facilityLocation})
                    </option>
                  ))}
                </select>
              </div>
              {(() => {
                const selectedAsset = equipmentAssets.find(
                  (a) => a.serialNumber === selectedSerial
                );
                if (!selectedAsset) return null;
                return (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-600 pt-1">
                    <span>OEM: {selectedAsset.manufacturer}</span>
                    <span>·</span>
                    <span>Model: {selectedAsset.model}</span>
                    <span>·</span>
                    <span>Tag: {selectedAsset.assetTag}</span>
                    <span>·</span>
                    <span className="text-[#164E3D] font-bold">
                      Status: {selectedAsset.calibrationStatus}
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#D4AF37]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-[#A17E22]">
                  Unlisted Hardware Intake Specification
                </span>
                <span className="text-[11px] text-slate-500">
                  Will be auto-indexed on technician arrival
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Instrument Name / Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sartorius Cubis II Microbalance"
                    value={unlistedName}
                    onChange={(e) => setUnlistedName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Serial Number / Tag *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-SART-2024-882"
                    value={unlistedSerial}
                    onChange={(e) => setUnlistedSerial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    OEM Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sartorius / Agilent / Endress+Hauser"
                    value={unlistedOem}
                    onChange={(e) => setUnlistedOem(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    placeholder="e.g. MCA225S-2S00-U"
                    value={unlistedModel}
                    onChange={(e) => setUnlistedModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Metrology Category
                  </label>
                  <select
                    value={unlistedCategory}
                    onChange={(e) => setUnlistedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                  >
                    <option value="Weighing & Mass">Weighing & Mass</option>
                    <option value="Flow Metering">Flow Metering</option>
                    <option value="Spectroscopy & Biotech">Spectroscopy & Biotech</option>
                    <option value="Pressure & Differential">Pressure & Differential</option>
                    <option value="Thermal & Cleanroom">Thermal & Cleanroom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Facility / Lab Location
                  </label>
                  <input
                    type="text"
                    value={unlistedFacility}
                    onChange={(e) => setUnlistedFacility(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Service Type & Urgency Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                2. Service Type Selection *
              </label>
              <select
                value={serviceType}
                onChange={(e) =>
                  setServiceType(e.target.value as ServiceTicket['serviceType'])
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-bold text-[#164E3D]"
              >
                <option value="On-site ISO Calibration">On-site ISO Calibration</option>
                <option value="Preventive Maintenance">Preventive Maintenance</option>
                <option value="Emergency Breakdown">Emergency Breakdown</option>
                <option value="Installation & Commissioning">
                  Installation & Commissioning
                </option>
                <option value="User Training">User Training</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Preferred Site Visit Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
              />
            </div>
          </div>

          {/* 3. Urgency Rating Cards */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              3. Urgency Rating & SLA Response Tier *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  {
                    rating: 'Routine',
                    sla: 'Standard (48-Hr SLA)',
                    desc: 'Scheduled calibration or routine PPM window',
                  },
                  {
                    rating: 'Urgent',
                    sla: 'High (12-Hr SLA)',
                    desc: 'Audit deadline or intermittent instrument drift',
                  },
                  {
                    rating: 'Critical Production Stoppage',
                    sla: 'Critical (4-Hr SLA)',
                    desc: 'Line down / batch release halt — immediate dispatch',
                  },
                ] as const
              ).map((item) => {
                const active = urgencyRating === item.rating;
                return (
                  <button
                    key={item.rating}
                    type="button"
                    onClick={() => setUrgencyRating(item.rating)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      active
                        ? item.rating === 'Critical Production Stoppage'
                          ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20'
                          : 'bg-[#EBF3F0] border-[#164E3D] ring-2 ring-[#164E3D]/20'
                        : 'bg-[#F4F8F6] border-[#E2ECE7] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`font-bold text-xs ${
                          item.rating === 'Critical Production Stoppage' && active
                            ? 'text-red-800'
                            : 'text-[#1A2E26]'
                        }`}
                      >
                        {item.rating}
                      </span>
                      {active && <CheckCircle2 className="w-4 h-4 text-[#164E3D] shrink-0" />}
                    </div>
                    <span className="block font-mono text-[10px] font-bold text-[#164E3D] mt-1">
                      {item.sla}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1 leading-snug">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Problem Description & Error Code Logs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                4. Problem Description, Metrology Scope & Site Access Notes *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe fault symptoms, required calibration test points, cleanroom gowning rules, or safety permits required..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Instrument Error Codes / Diagnostic Alarm Strings (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ERR-CAL-09: Internal Reference Weight Motor Timeout | HART Code 0x28"
                value={errorCodeLogs}
                onChange={(e) => setErrorCodeLogs(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono text-xs"
              />
            </div>
          </div>

          {/* 5. Upload Error Codes, Photos, or Fault Logs */}
          <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-dashed border-[#164E3D]/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[#1A2E26] block">
                  5. Upload Fault Photos, Error Logs or Diagnostic Dumps (Optional)
                </span>
                <span className="text-[11px] text-slate-500">
                  Attach LCD error photos, CSV chromatogram/balance logs, or HART diagnostic files
                </span>
              </div>
              <label className="px-3.5 py-2 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Browse Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick simulation buttons for testing */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Quick Attach Sample:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleAddSampleDiagnostic('Instrument_LCD_Error_Photo.jpg', 'Equipment Photo', 840)
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E2ECE7] hover:border-[#164E3D] text-[11px] font-medium text-slate-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3 h-3 text-[#164E3D]" />
                <span>+ LCD Fault Photo</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddSampleDiagnostic('Error_Code_Dump_2026.log', 'Error Log', 64)
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E2ECE7] hover:border-[#164E3D] text-[11px] font-medium text-slate-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-[#A17E22]" />
                <span>+ Error Log File</span>
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#E2ECE7]">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#EBF3F0] text-[#164E3D] font-mono text-[10px] font-bold">
                        {att.fileCategory}
                      </span>
                      <span className="font-mono font-semibold text-[#1A2E26]">
                        {att.fileName}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        ({att.fileSizeKb} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((item) => item.id !== att.id))
                      }
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E2ECE7]">
            <span className="text-[11px] font-mono text-slate-500">
              Requester: <strong>{currentPortalUser.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Submit Field Service Ticket</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CUSTOMER FACING SERVICE REQUEST MODULE
// ============================================================================
interface CustomerServiceRequestModuleProps {
  onOpenNewRequestModal: () => void;
  onInspectCertificate?: (cert: CalibrationCertificate) => void;
  onShowToast: (msg: string) => void;
}

export const CustomerServiceRequestModule: React.FC<CustomerServiceRequestModuleProps> = ({
  onOpenNewRequestModal,
  onInspectCertificate,
}) => {
  const { serviceTickets, certificates } = usePortal();
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

  const filteredTickets = useMemo(() => {
    return serviceTickets.filter((t) => {
      const matchesUrgency =
        urgencyFilter === 'ALL' ||
        t.urgencyRating === urgencyFilter ||
        (urgencyFilter === 'Critical Production Stoppage' &&
          t.priority === 'Critical (4-Hr SLA)') ||
        (urgencyFilter === 'Urgent' && t.priority === 'High (12-Hr SLA)') ||
        (urgencyFilter === 'Routine' && t.priority === 'Standard (48-Hr SLA)');

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.equipmentName.toLowerCase().includes(q) ||
        t.equipmentSerial.toLowerCase().includes(q) ||
        t.serviceType.toLowerCase().includes(q);

      return matchesUrgency && matchesSearch;
    });
  }, [serviceTickets, urgencyFilter, searchQuery]);

  return (
    <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-[#E2ECE7] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
            Field Service Management (FSM) — Client Queue
          </span>
          <h3 className="text-lg font-bold text-[#1A2E26]">
            Service Requests, Engineer Dispatches & Sign-Off History
          </h3>
        </div>
        <button
          type="button"
          onClick={onOpenNewRequestModal}
          className="px-4 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Request Service / Calibration</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-5 py-3.5 bg-[#F4F8F6] border-b border-[#E2ECE7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'Routine', 'Urgent', 'Critical Production Stoppage'] as const).map(
            (urg) => (
              <button
                key={urg}
                type="button"
                onClick={() => setUrgencyFilter(urg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  urgencyFilter === urg
                    ? 'bg-[#164E3D] text-[#D4AF37]'
                    : 'bg-white text-slate-600 border border-[#E2ECE7] hover:text-[#164E3D]'
                }`}
              >
                {urg === 'ALL' ? `All Requests (${serviceTickets.length})` : urg}
              </button>
            )
          )}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket #, serial, service type..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E2ECE7] text-xs"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F8F6]/60 text-[11px] font-mono uppercase text-slate-500 border-b border-[#E2ECE7]">
              <th className="py-3.5 px-4">Ticket & Urgency</th>
              <th className="py-3.5 px-4">Target Instrument</th>
              <th className="py-3.5 px-4">Service Type</th>
              <th className="py-3.5 px-4">Field Engineer & Route</th>
              <th className="py-3.5 px-4">Kanban Status</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2ECE7] text-xs">
            {filteredTickets.map((t) => {
              const normalizedStatus = normalizeKanbanStatus(t.status);
              const colMeta = FSM_KANBAN_COLUMNS.find((c) => c.status === normalizedStatus);
              return (
                <tr key={t.id} className="hover:bg-[#F4F8F6]/60 transition-colors">
                  <td className="py-4 px-4 font-mono">
                    <div className="font-bold text-[#164E3D]">{t.ticketNumber}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t.urgencyRating || t.priority}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#1A2E26] flex items-center gap-1.5">
                      <span>{t.equipmentName}</span>
                      {t.isUnlistedDevice && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px]">
                          Unlisted Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      S/N: {t.equipmentSerial} · {t.facilityLocation}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-[#1A2E26]">{t.serviceType}</span>
                    {t.uploadedAttachments && t.uploadedAttachments.length > 0 && (
                      <div className="text-[10px] font-mono text-[#164E3D] mt-0.5">
                        {t.uploadedAttachments.length} diagnostic attachment(s)
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-800">{t.assignedTechnician}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {t.scheduledDate}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        colMeta?.badgeClass || 'bg-[#EBF3F0] text-[#164E3D]'
                      }`}
                    >
                      {normalizedStatus}
                    </span>
                    {t.customerSignOff && (
                      <div className="text-[10px] font-mono text-emerald-700 mt-1">
                        Signed: {t.customerSignOff.signedByName}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1.5 rounded-xl bg-[#F4F8F6] hover:bg-[#164E3D] text-[#164E3D] hover:text-[#D4AF37] border border-[#E2ECE7] font-bold text-xs transition-colors cursor-pointer"
                    >
                      Inspect FSM Record
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Ticket Inspector Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-[#0E3529]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] max-w-2xl w-full p-6 border border-[#E2ECE7] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-start justify-between border-b border-[#E2ECE7] pb-3">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#164E3D]">
                  {selectedTicket.ticketNumber} · {selectedTicket.serviceType}
                </span>
                <h4 className="text-base font-bold text-[#1A2E26] mt-0.5">
                  {selectedTicket.equipmentName} ({selectedTicket.equipmentSerial})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F4F8F6] p-4 rounded-2xl border border-[#E2ECE7]">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Facility & Contact
                </span>
                <p className="font-bold text-[#1A2E26]">{selectedTicket.facilityLocation}</p>
                <p className="text-slate-600 mt-0.5">
                  {selectedTicket.contactPerson} · {selectedTicket.contactPhone}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Dispatch & Urgency
                </span>
                <p className="font-bold text-[#164E3D]">
                  Status: {normalizeKanbanStatus(selectedTicket.status)} (
                  {selectedTicket.urgencyRating || selectedTicket.priority})
                </p>
                <p className="font-mono text-slate-600 mt-0.5">
                  Engineer: {selectedTicket.assignedTechnician}
                </p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Reported Problem / Service Scope
              </span>
              <p className="p-3 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-slate-700">
                {selectedTicket.description}
              </p>
              {selectedTicket.errorCodeLogs && (
                <p className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 font-mono text-[11px] text-amber-900">
                  Diagnostic Code: {selectedTicket.errorCodeLogs}
                </p>
              )}
            </div>

            {selectedTicket.routePlan && (
              <div className="p-3.5 rounded-xl bg-[#EBF3F0]/60 border border-[#164E3D]/20 space-y-1">
                <div className="font-bold text-[#164E3D] flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Engineer Route & Calibration Kit Plan</span>
                </div>
                <p className="font-mono text-[11px] text-slate-700">
                  Origin: {selectedTicket.routePlan.originHub} · Distance:{' '}
                  {selectedTicket.routePlan.distanceKm} ({selectedTicket.routePlan.estimatedTransitMin})
                </p>
                <p className="text-[11px] text-slate-600">
                  Assigned Kit: <strong>{selectedTicket.routePlan.calibrationKitAssigned}</strong>
                </p>
              </div>
            )}

            {selectedTicket.customerSignOff && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>Customer Digital Signature on Glass Verified</span>
                  <span className="font-mono text-[10px]">
                    {selectedTicket.customerSignOff.signedAt}
                  </span>
                </div>
                <p className="text-emerald-800">
                  Signed by: <strong>{selectedTicket.customerSignOff.signedByName}</strong> (
                  {selectedTicket.customerSignOff.signedByTitle})
                </p>
                {selectedTicket.customerSignOff.clientRemarks && (
                  <p className="text-emerald-700 italic">
                    "{selectedTicket.customerSignOff.clientRemarks}"
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2ECE7]">
              {selectedTicket.issuedCertificateNumber && onInspectCertificate && (
                <button
                  type="button"
                  onClick={() => {
                    const found = certificates.find(
                      (c) => c.certificateNumber === selectedTicket.issuedCertificateNumber
                    );
                    if (found) {
                      setSelectedTicket(null);
                      onInspectCertificate(found);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Certificate ({selectedTicket.issuedCertificateNumber})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. SERVICE COORDINATOR DISPATCH CONSOLE (Kanban + Calendar + Dispatch Drawer)
// ============================================================================
interface CoordinatorDispatchConsoleProps {
  onShowToast: (msg: string) => void;
}

export const CoordinatorDispatchConsole: React.FC<CoordinatorDispatchConsoleProps> = ({
  onShowToast,
}) => {
  const {
    serviceTickets,
    technicianProfiles,
    updateServiceTicketStatus,
    dispatchTechnicianWithRoute,
  } = usePortal();

  const [viewMode, setViewMode] = useState<'kanban' | 'calendar' | 'table'>('kanban');
  const [dispatchDrawerTicket, setDispatchDrawerTicket] = useState<ServiceTicket | null>(
    null
  );

  // Dispatch Drawer state
  const [selectedTechName, setSelectedTechName] = useState<string>(
    technicianProfiles[0]?.name || 'Engr. Nnamdi Okoye'
  );
  const [dispatchDate, setDispatchDate] = useState<string>('2026-10-27 09:30 WAT');
  const [dispatchTargetStatus, setDispatchTargetStatus] =
    useState<FsmKanbanStatus>('Assigned');
  const [originHub, setOriginHub] = useState<string>(
    technicianProfiles[0]?.defaultOriginHub || 'Samstrust Ikeja Central Metrology Lab, Lagos'
  );
  const [distanceKm, setDistanceKm] = useState<string>('8.4 km');
  const [estimatedTransitMin, setEstimatedTransitMin] = useState<string>('25 mins');
  const [calibrationKitAssigned, setCalibrationKitAssigned] = useState<string>(
    technicianProfiles[0]?.primaryCalibrationKit || ''
  );
  const [routeNotes, setRouteNotes] = useState<string>(
    'Verify security gate clearance and cleanroom PPE kit prior to departure.'
  );

  const openDispatchDrawer = (ticket: ServiceTicket) => {
    setDispatchDrawerTicket(ticket);
    const matchedProfile =
      technicianProfiles.find((tp) => tp.name === ticket.assignedTechnician) ||
      technicianProfiles[0];
    setSelectedTechName(matchedProfile.name);
    setDispatchDate(
      ticket.scheduledDate && ticket.scheduledDate !== 'Pending Coordinator Schedule'
        ? ticket.scheduledDate
        : '2026-10-27 09:30 WAT'
    );
    const norm = normalizeKanbanStatus(ticket.status);
    setDispatchTargetStatus(
      norm === 'Submitted' || norm === 'Under Review' ? 'Assigned' : norm
    );
    setOriginHub(ticket.routePlan?.originHub || matchedProfile.defaultOriginHub);
    setDistanceKm(ticket.routePlan?.distanceKm || '7.5 km');
    setEstimatedTransitMin(ticket.routePlan?.estimatedTransitMin || '24 mins');
    setCalibrationKitAssigned(
      ticket.routePlan?.calibrationKitAssigned || matchedProfile.primaryCalibrationKit
    );
    setRouteNotes(
      ticket.routePlan?.routeNotes ||
        'Standard metrology dispatch protocol. Confirm client lab readiness 30 mins prior.'
    );
  };

  const handleSelectTechProfile = (techName: string) => {
    setSelectedTechName(techName);
    const profile = technicianProfiles.find((p) => p.name === techName);
    if (profile) {
      setOriginHub(profile.defaultOriginHub);
      setCalibrationKitAssigned(profile.primaryCalibrationKit);
    }
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchDrawerTicket) return;
    dispatchTechnicianWithRoute({
      ticketId: dispatchDrawerTicket.id,
      technicianName: selectedTechName,
      scheduledDate: dispatchDate,
      status: dispatchTargetStatus,
      routePlan: {
        originHub,
        destinationAddress: dispatchDrawerTicket.facilityLocation,
        distanceKm,
        estimatedTransitMin,
        calibrationKitAssigned,
        routeNotes,
      },
    });
    onShowToast(
      `Dispatched ${selectedTechName} to ${dispatchDrawerTicket.ticketNumber} [${dispatchTargetStatus}]`
    );
    setDispatchDrawerTicket(null);
  };

  // Group tickets by 8 Kanban columns
  const ticketsByKanban = useMemo(() => {
    const map: Record<FsmKanbanStatus, ServiceTicket[]> = {
      Submitted: [],
      'Under Review': [],
      Scheduled: [],
      Assigned: [],
      'In Progress': [],
      'Awaiting Parts': [],
      Completed: [],
      Closed: [],
    };
    serviceTickets.forEach((t) => {
      const norm = normalizeKanbanStatus(t.status);
      map[norm].push(t);
    });
    return map;
  }, [serviceTickets]);

  return (
    <div className="space-y-6">
      {/* Top Coordinator Control Bar */}
      <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
            Central Field Service Dispatch & SLA Control Tower
          </span>
          <h2 className="text-xl font-bold text-[#1A2E26]">
            Coordinator Dispatch Console — 8-Stage Kanban & Route Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Triage incoming service requests, inspect COREN engineer certifications, plan routes,
            and track live SLA compliance.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F8F6] rounded-xl border border-[#E2ECE7]">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-2xs'
                : 'text-slate-600 hover:text-[#164E3D]'
            }`}
          >
            8-Stage Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-2xs'
                : 'text-slate-600 hover:text-[#164E3D]'
            }`}
          >
            Dispatch Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-2xs'
                : 'text-slate-600 hover:text-[#164E3D]'
            }`}
          >
            Triage Table
          </button>
        </div>
      </div>

      {/* Engineer Availability Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {technicianProfiles.map((tech) => (
          <div
            key={tech.id}
            className="bg-white rounded-[16px] border border-[#E2ECE7] p-4 shadow-2xs flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-[#164E3D]">
                  {tech.corenReg}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tech.availability === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tech.availability === 'On-Site Dispatch'
                        ? 'bg-[#D4AF37]/25 text-[#0E3529]'
                        : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {tech.availability}
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#1A2E26] mt-1">{tech.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{tech.hubLocation}</p>
            </div>
            <div className="pt-2.5 border-t border-[#E2ECE7] text-[11px] text-slate-600">
              <div className="font-mono text-[10px] text-slate-500 truncate">
                {tech.certifications[0]}
              </div>
              <div className="flex items-center justify-between mt-1 font-mono">
                <span>Specialties: {tech.specialties.length}</span>
                <span className="font-bold text-[#164E3D]">
                  Load: {tech.activeAssignedCount} Job(s)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW 1: 8-STAGE KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3.5 min-w-[1280px]">
            {FSM_KANBAN_COLUMNS.map((col) => {
              const colTickets = ticketsByKanban[col.status];
              return (
                <div
                  key={col.status}
                  className={`bg-white rounded-[16px] border border-[#E2ECE7] border-t-4 ${col.accentColor} shadow-2xs flex flex-col min-h-[420px]`}
                >
                  <div className="p-3 border-b border-[#E2ECE7] flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1A2E26]">{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F4F8F6] text-[#164E3D] font-mono text-[11px] font-bold">
                      {colTickets.length}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-2.5 flex-1 bg-[#F4F8F6]/50">
                    {colTickets.length === 0 ? (
                      <div className="h-32 rounded-xl border border-dashed border-[#E2ECE7] flex items-center justify-center text-[11px] text-slate-400 p-3 text-center">
                        No tickets in {col.label}
                      </div>
                    ) : (
                      colTickets.map((ticket) => {
                        const colIndex = FSM_KANBAN_COLUMNS.findIndex(
                          (c) => c.status === col.status
                        );
                        const prevStatus =
                          colIndex > 0 ? FSM_KANBAN_COLUMNS[colIndex - 1].status : null;
                        const nextStatus =
                          colIndex < FSM_KANBAN_COLUMNS.length - 1
                            ? FSM_KANBAN_COLUMNS[colIndex + 1].status
                            : null;

                        return (
                          <div
                            key={ticket.id}
                            className="bg-white rounded-xl border border-[#E2ECE7] p-3 shadow-2xs hover:border-[#164E3D]/50 transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-[11px] text-[#164E3D]">
                                {ticket.ticketNumber}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                  ticket.priority.includes('Critical')
                                    ? 'bg-red-100 text-red-800'
                                    : ticket.priority.includes('High')
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {ticket.urgencyRating || ticket.priority.split(' ')[0]}
                              </span>
                            </div>

                            <div>
                              <p className="font-bold text-xs text-[#1A2E26] line-clamp-2 leading-snug">
                                {ticket.equipmentName}
                              </p>
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                {ticket.customerCompany}
                              </p>
                            </div>

                            <div className="text-[10px] text-slate-600 space-y-0.5 pt-1 border-t border-[#E2ECE7]">
                              <div className="font-semibold text-[#164E3D]">
                                {ticket.serviceType}
                              </div>
                              <div className="truncate">
                                Tech: <strong>{ticket.assignedTechnician}</strong>
                              </div>
                              <div className="font-mono text-slate-400">
                                {ticket.scheduledDate}
                              </div>
                            </div>

                            {/* Quick Stage Advance & Dispatch Drawer Trigger */}
                            <div className="pt-2 border-t border-[#E2ECE7] flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1">
                                {prevStatus && (
                                  <button
                                    type="button"
                                    title={`Move back to ${prevStatus}`}
                                    onClick={() => {
                                      updateServiceTicketStatus(ticket.id, prevStatus);
                                      onShowToast(
                                        `${ticket.ticketNumber} moved to ${prevStatus}`
                                      );
                                    }}
                                    className="p-1 rounded bg-[#F4F8F6] hover:bg-slate-200 text-slate-600 cursor-pointer"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {nextStatus && (
                                  <button
                                    type="button"
                                    title={`Advance to ${nextStatus}`}
                                    onClick={() => {
                                      updateServiceTicketStatus(ticket.id, nextStatus);
                                      onShowToast(
                                        `${ticket.ticketNumber} advanced to ${nextStatus}`
                                      );
                                    }}
                                    className="p-1 rounded bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-[#D4AF37] cursor-pointer"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => openDispatchDrawer(ticket)}
                                className="px-2 py-1 rounded-lg bg-[#164E3D] text-[#D4AF37] font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Dispatch</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DISPATCH CALENDAR SCHEDULE */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2ECE7] pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#164E3D] font-bold">
                National Metrology Dispatch Schedule
              </span>
              <h3 className="text-base font-bold text-[#1A2E26]">
                Field Engineer Calendar & Route Windows (October – November 2026)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Click any scheduled slot to open Technician Dispatch & Route Drawer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceTickets.map((ticket) => {
              const norm = normalizeKanbanStatus(ticket.status);
              return (
                <div
                  key={ticket.id}
                  onClick={() => openDispatchDrawer(ticket)}
                  className="p-4 rounded-2xl bg-[#F4F8F6] hover:bg-[#EBF3F0]/60 border border-[#E2ECE7] hover:border-[#164E3D] transition-all cursor-pointer flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#164E3D] text-[#D4AF37] font-mono text-[11px] font-bold">
                        {ticket.scheduledDate}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#164E3D]">
                        {norm}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1A2E26] mt-2">
                      {ticket.equipmentName}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {ticket.customerCompany} · {ticket.facilityLocation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E2ECE7] text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Engineer:</span>
                      <span className="font-bold text-[#1A2E26]">
                        {ticket.assignedTechnician}
                      </span>
                    </div>
                    {ticket.routePlan && (
                      <div className="font-mono text-[10px] text-[#164E3D]">
                        Route: {ticket.routePlan.distanceKm} ({ticket.routePlan.estimatedTransitMin}
                        )
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: SLA TRIAGE TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F8F6] text-[11px] font-mono uppercase text-slate-500 border-b border-[#E2ECE7]">
                  <th className="py-3.5 px-4">Ticket & SLA</th>
                  <th className="py-3.5 px-4">Client & Equipment</th>
                  <th className="py-3.5 px-4">Service Type</th>
                  <th className="py-3.5 px-4">Assigned Engineer</th>
                  <th className="py-3.5 px-4">Kanban Status</th>
                  <th className="py-3.5 px-4 text-right">Dispatch Drawer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE7]">
                {serviceTickets.map((ticket) => {
                  const norm = normalizeKanbanStatus(ticket.status);
                  return (
                    <tr key={ticket.id} className="hover:bg-[#F4F8F6]/60">
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-[#164E3D]">{ticket.ticketNumber}</div>
                        <span className="text-[10px] text-slate-500">
                          {ticket.urgencyRating || ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#1A2E26]">
                          {ticket.customerCompany}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ticket.equipmentName} ({ticket.equipmentSerial})
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#164E3D]">
                        {ticket.serviceType}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-[#1A2E26]">
                          {ticket.assignedTechnician}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {ticket.scheduledDate}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={norm}
                          onChange={(e) => {
                            updateServiceTicketStatus(
                              ticket.id,
                              e.target.value as FsmKanbanStatus
                            );
                            onShowToast(
                              `Updated ${ticket.ticketNumber} status to ${e.target.value}`
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#EBF3F0] border border-[#164E3D]/30 font-bold text-[#164E3D] text-xs"
                        >
                          {FSM_KANBAN_COLUMNS.map((c) => (
                            <option key={c.status} value={c.status}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDispatchDrawer(ticket)}
                          className="px-3 py-1.5 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Open Dispatch Drawer</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLIDE-OVER TECHNICIAN DISPATCH & ROUTE PLANNING DRAWER */}
      {dispatchDrawerTicket && (
        <div className="fixed inset-0 z-50 bg-[#0E3529]/70 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-[#E2ECE7] flex flex-col overflow-hidden">
            <div className="bg-[#164E3D] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold block">
                  Engineer Dispatch & Route Planning Drawer
                </span>
                <h3 className="text-base font-bold mt-0.5">
                  {dispatchDrawerTicket.ticketNumber} · {dispatchDrawerTicket.customerCompany}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDispatchDrawerTicket(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmDispatch}
              className="p-6 space-y-5 overflow-y-auto flex-1 text-xs"
            >
              {/* Target Ticket Summary */}
              <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#164E3D]">
                    {dispatchDrawerTicket.serviceType}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-amber-800">
                    {dispatchDrawerTicket.urgencyRating || dispatchDrawerTicket.priority}
                  </span>
                </div>
                <p className="font-bold text-sm text-[#1A2E26]">
                  {dispatchDrawerTicket.equipmentName} ({dispatchDrawerTicket.equipmentSerial})
                </p>
                <p className="text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#164E3D] shrink-0" />
                  <span>Destination: {dispatchDrawerTicket.facilityLocation}</span>
                </p>
              </div>

              {/* Select Field Engineer with Availability & Certifications */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Select Accredited Field Engineer (Availability & Certifications)
                </label>
                <div className="space-y-2.5">
                  {technicianProfiles.map((tech) => {
                    const isSelected = selectedTechName === tech.name;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => handleSelectTechProfile(tech.name)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EBF3F0] border-[#164E3D] ring-2 ring-[#164E3D]/20'
                            : 'bg-white border-[#E2ECE7] hover:bg-[#F4F8F6]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-[#1A2E26] flex items-center gap-2">
                            <span>{tech.name}</span>
                            <span className="font-mono text-[10px] text-[#164E3D]">
                              ({tech.corenReg})
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tech.availability === 'Available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {tech.availability}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Hub: {tech.hubLocation} · Active Load: {tech.activeAssignedCount} job(s)
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tech.certifications.map((cert) => (
                            <span
                              key={cert}
                              className="px-2 py-0.5 rounded bg-white border border-[#E2ECE7] font-mono text-[10px] text-slate-700"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Window & Kanban Target Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Scheduled Dispatch Date & Time
                  </label>
                  <input
                    type="text"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Kanban Stage
                  </label>
                  <select
                    value={dispatchTargetStatus}
                    onChange={(e) =>
                      setDispatchTargetStatus(e.target.value as FsmKanbanStatus)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-bold text-[#164E3D]"
                  >
                    {FSM_KANBAN_COLUMNS.map((c) => (
                      <option key={c.status} value={c.status}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route Planning & Primary Calibration Kit */}
              <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-3">
                <div className="font-bold text-[#164E3D] flex items-center gap-1.5">
                  <Navigation className="w-4 h-4" />
                  <span>3. Route Planning & Primary Reference Kit Assignment</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Origin Metrology Hub
                  </label>
                  <input
                    type="text"
                    value={originHub}
                    onChange={(e) => setOriginHub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Estimated Route Distance
                    </label>
                    <input
                      type="text"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Estimated Transit Time
                    </label>
                    <input
                      type="text"
                      value={estimatedTransitMin}
                      onChange={(e) => setEstimatedTransitMin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary Calibration Standards Kit Assigned
                  </label>
                  <input
                    type="text"
                    value={calibrationKitAssigned}
                    onChange={(e) => setCalibrationKitAssigned(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Logistics & Site Security Access Instructions
                  </label>
                  <input
                    type="text"
                    value={routeNotes}
                    onChange={(e) => setRouteNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2ECE7]">
                <button
                  type="button"
                  onClick={() => setDispatchDrawerTicket(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Engineer Dispatch & Route</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. FIELD TECHNICIAN MOBILE-FIRST INTERFACE (Rugged Tablet / Touch Workbench)
// ============================================================================
interface FieldTechnicianMobileWorkspaceProps {
  onCertificateIssued: (cert: CalibrationCertificate) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_CALIBRATION_POINTS: CalibrationReadingPoint[] = [
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
    asLeftValue: '50.01',
    asLeftError: '+0.01',
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
    asLeftValue: '100.02',
    asLeftError: '+0.02',
    expandedUncertainty: '±0.04',
    toleranceLimit: '±0.20',
    pass: true,
  },
];

export const FieldTechnicianMobileWorkspace: React.FC<
  FieldTechnicianMobileWorkspaceProps
> = ({ onCertificateIssued, onShowToast }) => {
  const {
    serviceTickets,
    currentPortalUser,
    toggleChecklistItem,
    submitTechnicianCalibrationReport,
  } = usePortal();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    serviceTickets[0]?.id || 'tkt-01'
  );
  const [ruggedTabletMode, setRuggedTabletMode] = useState<boolean>(false);

  const activeTicket = useMemo(
    () =>
      serviceTickets.find((t) => t.id === selectedTicketId) ||
      serviceTickets[0] ||
      null,
    [serviceTickets, selectedTicketId]
  );

  // Ambient conditions state
  const [tempC, setTempC] = useState('21.4');
  const [humidityPct, setHumidityPct] = useState('46.5');
  const [pressureHpa, setPressureHpa] = useState('1012.8');
  const [testWeightsUsed, setTestWeightsUsed] = useState(
    'OIML Class E2 Primary Reference Mass Set (Cert #PTB-2026-441) & Fluke 754 Documenting Calibrator'
  );
  const [uncertaintyK2, setUncertaintyK2] = useState('±0.025% FS (k=2, 95% CL)');
  const [workSummary, setWorkSummary] = useState(
    'Ambient metrology conditions verified. Performed 5-point As-Found sweep, executed internal span/zero trim, and validated As-Left linearity within ISO/IEC 17025 tolerance.'
  );

  // Readings state
  const [readings, setReadings] = useState<CalibrationReadingPoint[]>(
    DEFAULT_CALIBRATION_POINTS
  );

  // Parts replaced log state
  const [partsLog, setPartsLog] = useState<ReplacedPartLogItem[]>([
    {
      id: 'prt-init-1',
      partNumber: 'ST-SEAL-PTFE-09',
      partName: 'PTFE Manifold Isolation O-Ring Seal Kit',
      quantity: 1,
      batchOrSerial: 'LOT-PTFE-2026-88',
      category: 'Seal / Gasket',
    },
  ]);
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartBatch, setNewPartBatch] = useState('');
  const [newPartCategory, setNewPartCategory] =
    useState<ReplacedPartLogItem['category']>('Filter / Consumable');

  // Customer Digital Signature Pad on Glass state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(true);
  const [signatoryName, setSignatoryName] = useState(
    activeTicket?.contactPerson || 'Dr. Chioma Nwachukwu'
  );
  const [signatoryTitle, setSignatoryTitle] = useState(
    'Director of Quality Assurance / Lab Manager'
  );
  const [clientRemarks, setClientRemarks] = useState(
    'Instrument calibrated on-site and verified in tolerance. Work area left clean.'
  );
  const [closeImmediatelyOnSignOff, setCloseImmediatelyOnSignOff] = useState(true);

  // Sync ticket data when switching active ticket
  useEffect(() => {
    if (!activeTicket) return;
    setTempC(activeTicket.ambientConditions?.temperatureC || '21.4');
    setHumidityPct(activeTicket.ambientConditions?.relativeHumidityPct || '46.5');
    setPressureHpa(activeTicket.ambientConditions?.barometricPressureHpa || '1012.8');
    if (activeTicket.testWeightsAndStandardsUsed) {
      setTestWeightsUsed(activeTicket.testWeightsAndStandardsUsed);
    }
    if (activeTicket.calibrationReadings && activeTicket.calibrationReadings.length > 0) {
      setReadings(activeTicket.calibrationReadings);
    } else {
      setReadings(DEFAULT_CALIBRATION_POINTS);
    }
    if (activeTicket.partsReplacedLog) {
      setPartsLog(activeTicket.partsReplacedLog);
    } else {
      setPartsLog([]);
    }
    setSignatoryName(activeTicket.contactPerson || 'Dr. Chioma Nwachukwu');
  }, [activeTicket?.id]);

  // Draw initial sample signature on glass canvas
  const drawSampleSignatureOnCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#164E3D';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(28, 72);
    ctx.bezierCurveTo(55, 25, 85, 88, 122, 46);
    ctx.bezierCurveTo(148, 22, 165, 78, 198, 52);
    ctx.bezierCurveTo(230, 35, 265, 68, 315, 44);
    ctx.stroke();

    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText(
      `SIGNED ON GLASS • ${new Date().toISOString().slice(0, 10)} • SAMSTRUST FSM`,
      24,
      98
    );
    setHasDrawnSignature(true);
  };

  useEffect(() => {
    drawSampleSignatureOnCanvas();
  }, [selectedTicketId]);

  const getCanvasCoords = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    setHasDrawnSignature(true);
    ctx.strokeStyle = '#164E3D';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Validate ambient lab conditions
  const numericTemp = parseFloat(tempC);
  const numericRh = parseFloat(humidityPct);
  const ambientValid =
    !isNaN(numericTemp) &&
    numericTemp >= 15 &&
    numericTemp <= 32 &&
    !isNaN(numericRh) &&
    numericRh >= 25 &&
    numericRh <= 80;

  // Update reading row with automatic error computation
  const handleReadingChange = (
    idx: number,
    field: 'nominalValue' | 'asFoundValue' | 'asLeftValue',
    val: string
  ) => {
    setReadings((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const updated = { ...row, [field]: val };
        const nom = parseFloat(updated.nominalValue);
        const found = parseFloat(updated.asFoundValue);
        const left = parseFloat(updated.asLeftValue);
        if (!isNaN(nom) && !isNaN(found)) {
          const diff = found - nom;
          updated.asFoundError = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;
        }
        if (!isNaN(nom) && !isNaN(left)) {
          const diffL = left - nom;
          updated.asLeftError = `${diffL >= 0 ? '+' : ''}${diffL.toFixed(2)}`;
        }
        return updated;
      })
    );
  };

  const handleAddReplacedPart = () => {
    if (!newPartName.trim()) return;
    const item: ReplacedPartLogItem = {
      id: `prt-${Date.now()}`,
      partNumber: newPartNumber.trim() || `ST-PRT-${Math.floor(100 + Math.random() * 899)}`,
      partName: newPartName.trim(),
      quantity: Math.max(1, newPartQty),
      batchOrSerial: newPartBatch.trim() || `LOT-2026-${Math.floor(10 + Math.random() * 89)}`,
      category: newPartCategory,
    };
    setPartsLog((prev) => [...prev, item]);
    setNewPartNumber('');
    setNewPartName('');
    setNewPartQty(1);
    setNewPartBatch('');
  };

  const handleFinalSubmitAndSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (!hasDrawnSignature) {
      onShowToast(
        'Please capture the Customer Digital Signature on Glass before closing the service ticket.'
      );
      return;
    }

    const sigDataUrl =
      canvasRef.current?.toDataURL('image/png') || 'SIGNED_ON_GLASS_VERIFIED';

    const cert = submitTechnicianCalibrationReport({
      ticketId: activeTicket.id,
      serialNumber: activeTicket.equipmentSerial,
      environmentalTemp: `${tempC} °C`,
      environmentalHumidity: `${humidityPct} %RH`,
      barometricPressure: `${pressureHpa} hPa`,
      referenceStandardUsed: testWeightsUsed,
      uncertaintyBudgetK2: uncertaintyK2,
      workReportSummary: workSummary,
      readings,
      partsReplacedLog: partsLog,
      customerSignOff: {
        signedByName: signatoryName.trim() || activeTicket.contactPerson,
        signedByTitle: signatoryTitle.trim() || 'Authorized Facility Representative',
        signedAt: new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT',
        signatureDataUrl: sigDataUrl,
        clientRemarks: clientRemarks.trim(),
      },
      closeTicketImmediately: closeImmediatelyOnSignOff,
    });

    onShowToast(
      `Customer signature verified! Ticket ${activeTicket.ticketNumber} ${
        closeImmediatelyOnSignOff ? 'Closed' : 'Completed'
      } & Certificate ${cert.certificateNumber} issued.`
    );
    onCertificateIssued(cert);
  };

  return (
    <div
      className={`space-y-6 transition-all ${
        ruggedTabletMode
          ? 'max-w-3xl mx-auto p-4 sm:p-6 rounded-[28px] bg-[#0E3529] border-4 border-[#D4AF37]/70 shadow-2xl'
          : ''
      }`}
    >
      {/* Top Rugged Tablet / Mobile Floor Bar */}
      <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#164E3D] text-[#D4AF37] flex items-center justify-center shrink-0">
            <Tablet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#164E3D] font-bold block">
              Field Technician Mobile-First Interface
            </span>
            <h2 className="text-lg font-bold text-[#1A2E26]">
              Rugged Tablet Metrology Bench & On-Glass Sign-Off
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRuggedTabletMode((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
              ruggedTabletMode
                ? 'bg-[#D4AF37] text-[#0E3529] border-[#D4AF37]'
                : 'bg-[#F4F8F6] text-[#164E3D] border-[#E2ECE7] hover:bg-[#EBF3F0]'
            }`}
          >
            {ruggedTabletMode ? (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Exit Rugged Tablet Frame</span>
              </>
            ) : (
              <>
                <Tablet className="w-4 h-4" />
                <span>Preview Rugged Tablet Floor Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${
          ruggedTabletMode ? 'gap-6' : 'lg:grid-cols-12 gap-8'
        }`}
      >
        {/* Left Column: Assigned Dispatches & Pre-Service Checklist + Ambient Lab Conditions */}
        <div className={`${ruggedTabletMode ? '' : 'lg:col-span-5'} space-y-6`}>
          {/* Assigned Jobs Selector */}
          <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A17E22] font-bold">
                  Mobile Dispatch Queue
                </span>
                <h3 className="text-base font-bold text-[#1A2E26]">
                  Select Active Site Job ({serviceTickets.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {serviceTickets.map((ticket) => {
                const isSelected = ticket.id === activeTicket?.id;
                const norm = normalizeKanbanStatus(ticket.status);
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EBF3F0] border-[#164E3D] shadow-xs'
                        : 'bg-[#F4F8F6] border-[#E2ECE7] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-[#164E3D]">
                        {ticket.ticketNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-[#E2ECE7] text-[#1A2E26]">
                        {norm}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#1A2E26]">{ticket.equipmentName}</p>
                    <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                      S/N: {ticket.equipmentSerial} · {ticket.customerCompany}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#E2ECE7] flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate">
                        {ticket.facilityLocation}
                      </span>
                      <span className="font-mono font-bold text-[#164E3D] shrink-0 ml-2">
                        {ticket.serviceType}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-Service Checklist & Ambient Laboratory Conditions */}
          {activeTicket && (
            <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-5 space-y-5">
              <div className="border-b border-[#E2ECE7] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                    Step 1 · Pre-Service Protocol
                  </span>
                  <h3 className="text-base font-bold text-[#1A2E26]">
                    Ambient Lab Conditions & Safety Checklist
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                    ambientValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {ambientValid ? 'ISO 17025 ENV VALID' : 'CHECK ENV LIMITS'}
                </span>
              </div>

              {/* Ambient Laboratory Conditions (Temperature °C, Relative Humidity %, Barometric hPa) */}
              <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-3">
                <div className="text-[11px] font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4" />
                  <span>Ambient Metrology Conditions (Required)</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                      Temp (°C)
                    </label>
                    <input
                      type="text"
                      value={tempC}
                      onChange={(e) => setTempC(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2ECE7] font-mono text-sm font-bold text-[#1A2E26]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                      Humidity (%RH)
                    </label>
                    <input
                      type="text"
                      value={humidityPct}
                      onChange={(e) => setHumidityPct(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2ECE7] font-mono text-sm font-bold text-[#1A2E26]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                      Pressure (hPa)
                    </label>
                    <input
                      type="text"
                      value={pressureHpa}
                      onChange={(e) => setPressureHpa(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2ECE7] font-mono text-sm font-bold text-[#1A2E26]"
                    />
                  </div>
                </div>
              </div>

              {/* Touch-Friendly Site Checklist */}
              <div className="space-y-2">
                {activeTicket.checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors min-h-[48px] ${
                      item.checked
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-[#F4F8F6] border-[#E2ECE7] text-[#1A2E26]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklistItem(activeTicket.id, item.id)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#164E3D] focus:ring-[#164E3D]"
                    />
                    <div className="flex-1">
                      <span
                        className={`font-semibold ${
                          item.checked ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                        Category: {item.category}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: As-Found/As-Left Table, Parts Replaced Log & Customer Digital Signature Pad */}
        <div className={`${ruggedTabletMode ? '' : 'lg:col-span-7'}`}>
          <form
            onSubmit={handleFinalSubmitAndSignOff}
            className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-5 sm:p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2ECE7] pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                  Steps 2–4 · ISO/IEC 17025 Field Calibration & Sign-Off
                </span>
                <h3 className="text-lg font-bold text-[#1A2E26]">
                  Measurement Recording, Parts Log & Customer Signature on Glass
                </h3>
              </div>
              {activeTicket && (
                <span className="px-3 py-1.5 rounded-xl bg-[#164E3D] text-[#D4AF37] font-mono text-xs font-bold">
                  {activeTicket.equipmentSerial}
                </span>
              )}
            </div>

            {/* Test Weights & Reference Standards Used */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Test Weights & Reference Standards Used (NIST / PTB Traceable)
                </label>
                <input
                  type="text"
                  value={testWeightsUsed}
                  onChange={(e) => setTestWeightsUsed(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Expanded Uncertainty (k=2)
                </label>
                <input
                  type="text"
                  value={uncertaintyK2}
                  onChange={(e) => setUncertaintyK2(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs font-mono"
                />
              </div>
            </div>

            {/* Step 2: As-Found vs. As-Left Measurement Recording Table */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1A2E26] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#164E3D]" />
                  <span>Step 2: As-Found vs. As-Left Calibration Readings</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReadings((prev) =>
                      prev.map((r) => ({
                        ...r,
                        asLeftValue: r.nominalValue,
                        asLeftError: '0.00',
                        pass: true,
                      }))
                    );
                    onShowToast('Zero-trimmed As-Left readings to match Nominal reference points.');
                  }}
                  className="px-3 py-1 rounded-lg bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-[#D4AF37] font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Auto-Trim As-Left to Nominal
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E2ECE7] rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#164E3D] text-white font-mono text-[11px] uppercase">
                      <th className="py-2.5 px-3">Pt #</th>
                      <th className="py-2.5 px-3">Nominal</th>
                      <th className="py-2.5 px-3">As-Found</th>
                      <th className="py-2.5 px-3">As-Left</th>
                      <th className="py-2.5 px-3">As-Left Err</th>
                      <th className="py-2.5 px-3">Tolerance</th>
                      <th className="py-2.5 px-3">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2ECE7] font-mono">
                    {readings.map((pt, index) => (
                      <tr key={pt.pointNumber} className="bg-white">
                        <td className="py-2.5 px-3 font-sans font-bold text-[#1A2E26]">
                          #{pt.pointNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={pt.nominalValue}
                            onChange={(e) =>
                              handleReadingChange(index, 'nominalValue', e.target.value)
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-[#F4F8F6] border border-[#E2ECE7] text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={pt.asFoundValue}
                            onChange={(e) =>
                              handleReadingChange(index, 'asFoundValue', e.target.value)
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={pt.asLeftValue}
                            onChange={(e) =>
                              handleReadingChange(index, 'asLeftValue', e.target.value)
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs font-bold text-[#164E3D]"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{pt.asLeftError}</td>
                        <td className="py-2.5 px-3 text-slate-500">{pt.toleranceLimit}</td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() =>
                              setReadings((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, pass: !r.pass } : r
                                )
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              pt.pass
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {pt.pass ? 'PASS' : 'OOT'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3: Parts / Consumables Replaced Log */}
            <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1A2E26] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#164E3D]" />
                  <span>Step 3: Parts & Consumables Replaced Log ({partsLog.length})</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPartsLog((prev) => [
                        ...prev,
                        {
                          id: `prt-${Date.now()}`,
                          partNumber: 'ST-HEPA-PRE-02',
                          partName: 'Antimicrobial HEPA Exhaust Pre-Filter Pad',
                          quantity: 1,
                          batchOrSerial: 'LOT-HEPA-2026',
                          category: 'Filter / Consumable',
                        },
                      ])
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E2ECE7] hover:border-[#164E3D] text-[11px] font-semibold text-[#164E3D] cursor-pointer"
                  >
                    + Quick Add HEPA Pre-Filter
                  </button>
                </div>
              </div>

              {/* Add Part Form Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Part # (e.g. ST-OPT-04)"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  className="sm:col-span-3 px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Part / Consumable Description"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="sm:col-span-4 px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs"
                />
                <input
                  type="number"
                  min={1}
                  value={newPartQty}
                  onChange={(e) => setNewPartQty(Number(e.target.value) || 1)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddReplacedPart}
                  className="sm:col-span-3 px-3 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Part</span>
                </button>
              </div>

              {partsLog.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {partsLog.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#164E3D]">
                          {part.partNumber}
                        </span>
                        <span className="font-semibold text-[#1A2E26]">{part.partName}</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Qty: {part.quantity} · {part.batchOrSerial}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPartsLog((prev) => prev.filter((p) => p.id !== part.id))
                        }
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Work Report Summary */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Field Engineer Metrology & Maintenance Work Report
              </label>
              <textarea
                rows={2}
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs"
              />
            </div>

            {/* Step 4: Customer Digital Signature Pad on Glass */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F8F6] border-2 border-[#164E3D]/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#164E3D] font-bold block">
                    Step 4 · Immediate On-Site Job Handover
                  </span>
                  <h4 className="text-sm font-bold text-[#1A2E26] flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-[#164E3D]" />
                    <span>Customer Digital Signature Pad on Glass</span>
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={drawSampleSignatureOnCanvas}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E2ECE7] hover:border-[#164E3D] text-[11px] font-semibold text-[#164E3D] cursor-pointer"
                  >
                    Apply Verified Signature
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E2ECE7] hover:border-red-400 text-[11px] font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Glass</span>
                  </button>
                </div>
              </div>

              {/* Interactive HTML5 Glass Signature Canvas */}
              <div className="relative rounded-2xl bg-white border-2 border-dashed border-[#164E3D]/40 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={540}
                  height={120}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="w-full h-[120px] touch-none cursor-crosshair"
                />
                {!hasDrawnSignature && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-400">
                    Sign here with finger or stylus on glass to authorize job completion
                  </div>
                )}
              </div>

              {/* Signatory Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Customer Signatory Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2ECE7] cursor-pointer text-xs">
                <span className="font-semibold text-[#1A2E26]">
                  Instant Service Ticket Closure (`Closed`) upon Customer Signature
                </span>
                <input
                  type="checkbox"
                  checked={closeImmediatelyOnSignOff}
                  onChange={(e) => setCloseImmediatelyOnSignOff(e.target.checked)}
                  className="w-4 h-4 rounded text-[#164E3D]"
                />
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Field Metrologist: <strong>{currentPortalUser.name}</strong>
              </span>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>
                  Sign Off on Glass, Close Ticket & Issue ISO 17025 Certificate
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
