import React, { useState, useMemo } from 'react';
import { useCms } from '../../context/CmsContext';
import { LeadRfqItem, LeadRfqStatus } from '../../types/cms';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Layers,
  FileText,
  DollarSign,
  Download,
  X,
  Save,
  MessageSquare,
  ShieldCheck,
  Send,
  Calendar,
  Check,
  Printer,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { OfficialSamstrustPdfModal } from '../portal/CommercialAndArchitectureModule';
import { buildAutomatedInvoiceFromLead } from '../../utils/invoiceGenerator';
import { PortalQuoteAndInvoice } from '../../types/portal';

export const LeadPipelineViewer: React.FC = () => {
  const { rfqLeads, updateLeadStatus, updateLeadNotes, exportLeadsToCsv, canManageSales } = useCms();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LeadRfqStatus>('All');
  const [selectedLead, setSelectedLead] = useState<LeadRfqItem | null>(null);

  // Automatic Invoice Generator Modal state
  const [invoiceModalState, setInvoiceModalState] = useState<{
    mode: 'quotation' | 'proforma';
    quote: PortalQuoteAndInvoice;
  } | null>(null);

  // Drawer edit states
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerEngineer, setDrawerEngineer] = useState('');
  const [drawerSavedNotice, setDrawerSavedNotice] = useState(false);

  const engineersList = [
    'Unassigned',
    'Engr. Samuel O. Trust',
    'Chukwuma Eze (Sales Estimator)',
    'Engr. Nnamdi Okoye (Field Lead)',
    'Dr. Folashade Adeleke (Lab QA)',
  ];

  const filteredLeads = useMemo(() => {
    return rfqLeads.filter((lead) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = lead.refCode.toLowerCase().includes(q);
        const matchesCompany = lead.clientCompany.toLowerCase().includes(q);
        const matchesClient = lead.clientName.toLowerCase().includes(q);
        if (!matchesRef && !matchesCompany && !matchesClient) return false;
      }
      if (statusFilter !== 'All' && lead.status !== statusFilter) return false;
      return true;
    });
  }, [rfqLeads, searchQuery, statusFilter]);

  // Aggregate Metrics
  const totalPipelineUSD = rfqLeads.reduce((acc, lead) => acc + lead.totalUSD, 0);
  const newLeadsCount = rfqLeads.filter((l) => l.status === 'New').length;
  const quotedLeadsCount = rfqLeads.filter((l) => l.status === 'Quoted').length;
  const closedLeadsCount = rfqLeads.filter((l) => l.status === 'Closed').length;

  const handleOpenDrawer = (lead: LeadRfqItem) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.internalNotes || '');
    setDrawerEngineer(lead.assignedEngineer || 'Unassigned');
    setDrawerSavedNotice(false);
  };

  const handleSaveDrawerNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    updateLeadNotes(selectedLead.id, drawerNotes, drawerEngineer);
    setDrawerSavedNotice(true);
    setTimeout(() => setDrawerSavedNotice(false), 2000);
  };

  const getStatusBadge = (status: LeadRfqStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assigned':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Quoted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
            Commercial Pipeline &amp; Tender Desk
          </span>
          <h2 className="text-2xl font-bold text-[#164E3D]">Lead &amp; RFQ Pipeline Viewer</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time queue of incoming quotation requests, engineer assignments, and CSV exports for sales accounting.
          </p>
        </div>

        {/* ONE-CLICK EXPORT TO CSV / EXCEL */}
        <button
          type="button"
          onClick={() => exportLeadsToCsv(filteredLeads)}
          className="btn-primary py-2.5 px-5 text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
          <span>Export Pipeline to CSV / Excel</span>
        </button>
      </div>

      {/* METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Leads in Pipeline</span>
          <span className="text-2xl font-mono font-extrabold text-[#164E3D] block">{rfqLeads.length} Dossiers</span>
          <span className="text-[11px] text-slate-500">All registered quotes</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-blue-600">New Unassigned</span>
          <span className="text-2xl font-mono font-extrabold text-blue-700 block">{newLeadsCount} Leads</span>
          <span className="text-[11px] text-slate-500">Requires 4h triage SLA</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-purple-600">Quoted / In Review</span>
          <span className="text-2xl font-mono font-extrabold text-purple-700 block">{quotedLeadsCount} Leads</span>
          <span className="text-[11px] text-slate-500">Commercial pro-forma sent</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-emerald-600">Estimated Pipeline USD</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-800 block">
            ${new Intl.NumberFormat('en-US').format(totalPipelineUSD)}
          </span>
          <span className="text-[11px] text-slate-500">{closedLeadsCount} Closed Deals</span>
        </div>
      </div>

      {/* SEARCH & STATUS FILTER BAR */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, reference code, client..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2ECE7] bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {(['All', 'New', 'Assigned', 'Quoted', 'Closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#164E3D] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-[#E2ECE7] hover:border-slate-300'
              }`}
            >
              {st} {st !== 'All' && `(${rfqLeads.filter((l) => l.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* PIPELINE TABLE */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF9] text-[#164E3D] border-b border-[#E2ECE7] font-bold uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Reference &amp; Date</th>
                <th className="py-3.5 px-4">Company &amp; Client</th>
                <th className="py-3.5 px-4">Delivery State</th>
                <th className="py-3.5 px-4">Equipment &amp; Value</th>
                <th className="py-3.5 px-4">Status Tag</th>
                <th className="py-3.5 px-4">Assigned Engineer</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2ECE7]">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[#164E3D] block">{lead.refCode}</span>
                    <span className="text-[11px] text-slate-400">{lead.createdAt}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block line-clamp-1">{lead.clientCompany}</strong>
                    <span className="text-[11px] text-slate-500">{lead.clientName} &bull; {lead.clientPhone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {lead.deliveryState}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      ${new Intl.NumberFormat('en-US').format(lead.totalUSD)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {lead.itemsCount} {lead.itemsCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {canManageSales ? (
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadRfqStatus)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${getStatusBadge(
                          lead.status
                        )} cursor-pointer`}
                      >
                        <option value="New">New</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-medium text-xs text-slate-800 block">
                      {lead.assignedEngineer || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(lead)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E2ECE7] hover:border-[#164E3D] bg-white text-xs font-semibold text-[#164E3D] hover:bg-[#EBF3F0] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Review complete client dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInvoiceModalState({
                            mode: 'proforma',
                            quote: buildAutomatedInvoiceFromLead(lead),
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#164E3D] hover:bg-[#113c2f] text-white text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Generate official automated Proforma Tax Invoice (PDF)"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED RFQ DOSSIER DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl border-l border-[#E2ECE7] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 bg-[#164E3D] text-white flex items-center justify-between border-b border-emerald-900">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                  Official RFQ Dossier
                </span>
                <h3 className="text-lg font-bold font-mono">{selectedLead.refCode}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
              {/* Client Card */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#AD8921] block">
                  Client &amp; Facility Particulars
                </span>
                <h4 className="text-base font-bold text-[#164E3D]">{selectedLead.clientCompany}</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Contact: <strong>{selectedLead.clientName}</strong></div>
                  <div>Phone: <strong>{selectedLead.clientPhone}</strong></div>
                  <div>Email: <strong className="break-all">{selectedLead.clientEmail}</strong></div>
                  <div>State: <strong>{selectedLead.deliveryState}</strong></div>
                </div>
                <div className="pt-1 text-slate-500 border-t border-slate-200 text-[11px]">
                  Site Address: {selectedLead.deliveryAddress}
                </div>
              </div>

              {/* Line Items Schedule */}
              <div className="space-y-2">
                <span className="font-bold text-[#164E3D] uppercase tracking-wider block">
                  Requested Equipment Schedule ({selectedLead.lineItems.length} lines)
                </span>
                <div className="rounded-xl border border-[#E2ECE7] divide-y divide-[#E2ECE7] bg-white">
                  {selectedLead.lineItems.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-[#AD8921]">{item.model}</span>
                        <strong className="block text-slate-800">{item.name}</strong>
                        <p className="text-[11px] text-slate-500">{item.specs}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-900 block">Qty: {item.quantity}</span>
                        <span className="text-[10px] text-slate-400">
                          ${new Intl.NumberFormat('en-US').format(item.unitPriceUSD * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope & Services */}
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#AD8921] block">
                  Requested Technical Services &amp; Logistics
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>FAT Witness Test: <strong>{selectedLead.services.fatRequired ? 'Yes' : 'No'}</strong></div>
                  <div>Installation &amp; Commissioning: <strong>{selectedLead.services.installationRequired ? 'Yes' : 'No'}</strong></div>
                  <div>ISO 17025 Calibration: <strong>{selectedLead.services.isoCalibrationRequired ? 'Yes' : 'No'}</strong></div>
                  <div>Operator Training: <strong>{selectedLead.services.trainingRequired ? 'Yes' : 'No'}</strong></div>
                  <div>Maintenance SLA: <strong className="uppercase">{selectedLead.services.maintenanceSla}</strong></div>
                  <div>Target Delivery: <strong>{selectedLead.services.deliveryTimeline}</strong></div>
                </div>
              </div>

              {/* Attached Documents */}
              {selectedLead.documentsAttached.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-[#164E3D] uppercase tracking-wider block">
                    Attached Drawings &amp; Specifications
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.documentsAttached.map((doc, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-[#164E3D] font-mono text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#AD8921]" />
                        <span>{doc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AUTOMATED INVOICE & PRO-FORMA GENERATOR */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#164E3D] to-[#0e3529] text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-[#164E3D] flex items-center justify-center font-bold">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AF37] block">
                        Automated Commercial Document Engine
                      </span>
                      <h4 className="text-xs font-bold">Instant Pro-Forma Invoice &amp; Quotation</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-white/10 px-2 py-0.5 rounded">
                    CAC RC 9898142
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-100/90 pt-0.5">
                  <div>Subtotal: <strong>${new Intl.NumberFormat('en-US').format(selectedLead.totalUSD)}</strong></div>
                  <div>Statutory VAT: <strong>7.5% Standard</strong></div>
                  <div>Delivery Zone: <strong>{selectedLead.deliveryState}</strong></div>
                  <div>Est. NGN Total: <strong>₦{Math.round(selectedLead.totalUSD * 1580 * 1.075).toLocaleString()}</strong></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setInvoiceModalState({
                        mode: 'proforma',
                        quote: buildAutomatedInvoiceFromLead(selectedLead),
                      })
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2b] text-[#164E3D] font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Generate Proforma Invoice (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInvoiceModalState({
                        mode: 'quotation',
                        quote: buildAutomatedInvoiceFromLead(selectedLead),
                      })
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Formal Quotation (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Commercial Notes & Assignment Form */}
              <form onSubmit={handleSaveDrawerNotes} className="space-y-3 pt-3 border-t border-[#E2ECE7]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#164E3D] uppercase tracking-wider block">
                    Commercial Triage &amp; Engineer Notes
                  </span>
                  {drawerSavedNotice && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assign Metrology Engineer
                  </label>
                  <select
                    value={drawerEngineer}
                    onChange={(e) => setDrawerEngineer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-xs text-slate-800"
                  >
                    {engineersList.map((eng) => (
                      <option key={eng} value={eng}>{eng}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Internal Sales Accounting Notes / Pro-Forma Ref
                  </label>
                  <textarea
                    rows={3}
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    placeholder="Enter quotation pricing calculations, discount approval, delivery dates..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-xs text-slate-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Dossier Notes &amp; Assignment</span>
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#F8FAF9] border-t border-[#E2ECE7] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Status: <strong>{selectedLead.status}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Automated Samstrust Invoice & Quotation PDF Engine */}
      {invoiceModalState && (
        <OfficialSamstrustPdfModal
          mode={invoiceModalState.mode}
          quoteOrInvoice={invoiceModalState.quote}
          onClose={() => setInvoiceModalState(null)}
          onTriggerToast={(msg) => console.log(msg)}
        />
      )}
    </div>
  );
};
