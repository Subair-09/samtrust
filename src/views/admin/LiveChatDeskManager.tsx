import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { LiveChatSession, ManagedUserAccount } from '../../types/cms';
import {
  MessageSquare,
  MessageCircle,
  Power,
  Send,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit3,
  Users,
  UserPlus,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Building2,
  Mail,
  Phone,
  Smartphone,
  Monitor,
  FileSpreadsheet,
  X,
} from 'lucide-react';

export const LiveChatDeskManager: React.FC = () => {
  const {
    liveSupportConfig,
    updateLiveSupportConfig,
    liveChatSessions,
    sendAdminChatReply,
    markChatSessionRead,
    updateChatSessionStatus,
    deleteChatSession,
    addRfqLead,
    currentUser,
    managedUsers,
    updateManagedUser,
    deleteManagedUser,
    toggleUserLiveDeskControl,
  } = useCms();

  const [activeSubTab, setActiveSubTab] = useState<'controls' | 'inbox' | 'operators'>('controls');
  const [editingOperator, setEditingOperator] = useState<ManagedUserAccount | null>(null);
  const [editOpName, setEditOpName] = useState('');
  const [editOpEmail, setEditOpEmail] = useState('');
  const [editOpPhone, setEditOpPhone] = useState('');
  const [editOpTitle, setEditOpTitle] = useState('');
  const [confirmDeleteOpId, setConfirmDeleteOpId] = useState<string | null>(null);

  const assignedOperators = managedUsers.filter(
    (u) =>
      u.cmsRole === 'super-admin' ||
      u.cmsRole === 'live-desk-agent' ||
      u.customPermissions?.includes('cms.livedesk.control')
  );

  const handleStartEditOperator = (op: ManagedUserAccount) => {
    setEditingOperator(op);
    setEditOpName(op.fullName);
    setEditOpEmail(op.email);
    setEditOpPhone(op.phone);
    setEditOpTitle(op.jobTitle);
  };

  const handleSaveEditOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOperator || !editOpName.trim() || !editOpEmail.trim()) return;
    updateManagedUser({
      ...editingOperator,
      fullName: editOpName.trim(),
      email: editOpEmail.trim().toLowerCase(),
      phone: editOpPhone.trim(),
      jobTitle: editOpTitle.trim() || editingOperator.jobTitle,
    });
    showToast(`Updated assigned Live Desk user ${editOpName.trim()}.`);
    setEditingOperator(null);
  };

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    liveChatSessions[0]?.id || ''
  );
  const [adminReplyText, setAdminReplyText] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const selectedSession: LiveChatSession | null =
    liveChatSessions.find((s) => s.id === selectedSessionId) ||
    liveChatSessions[0] ||
    null;

  const unreadSessionsCount = liveChatSessions.reduce(
    (sum, s) => sum + (s.unreadByAdmin || 0),
    0
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !adminReplyText.trim()) return;
    sendAdminChatReply(
      selectedSession.id,
      adminReplyText.trim(),
      currentUser?.name || liveSupportConfig.agentName
    );
    setAdminReplyText('');
    showToast(`Sent live reply to ${selectedSession.visitorName}.`);
  };

  const handleConvertToRfqLead = (session: LiveChatSession) => {
    const refCode = `RFQ-CHAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const visitorMessagesSummary = session.messages
      .filter((m) => m.sender === 'visitor')
      .map((m) => m.text)
      .join(' | ');

    addRfqLead({
      refCode,
      clientName: session.visitorName,
      clientCompany: session.visitorCompany || 'Live Chat Inquiry',
      clientEmail: session.visitorEmail || 'visitor@company.ng',
      clientPhone: session.visitorPhone || '+234 800 000 0000',
      deliveryState: 'Lagos State',
      deliveryAddress: `${session.visitorCompany} Facility (Captured via Live Chat)`,
      status: 'New',
      assignedEngineer: currentUser?.name || liveSupportConfig.agentName,
      internalNotes: `Escalated from Live Web Chat (${session.id}). Visitor Inquiry: ${visitorMessagesSummary}`,
      totalUSD: 1850,
      itemsCount: 1,
      lineItems: [
        {
          id: `chat-item-${Date.now()}`,
          name: 'Custom Instrumentation / Calibration Inquiry (From Live Chat)',
          model: 'ST-LIVE-DESK-REQ',
          quantity: 1,
          specs: visitorMessagesSummary.slice(0, 120) || 'On-site metrology & equipment request',
          unitPriceUSD: 1850,
          isCustom: true,
        },
      ],
      services: {
        fatRequired: false,
        installationRequired: true,
        isoCalibrationRequired: true,
        trainingRequired: false,
        maintenanceSla: 'gold',
        deliveryTimeline: '2-4 Weeks Standard',
      },
      documentsAttached: [],
    });

    showToast(
      `Converted chat with ${session.visitorName} into Pipeline Lead (${refCode})!`
    );
  };

  const handleAddQuickPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;
    updateLiveSupportConfig({
      quickPrompts: [...liveSupportConfig.quickPrompts, newPromptText.trim()],
    });
    setNewPromptText('');
    showToast('Added new quick inquiry prompt for visitors.');
  };

  const handleRemoveQuickPrompt = (idx: number) => {
    updateLiveSupportConfig({
      quickPrompts: liveSupportConfig.quickPrompts.filter((_, i) => i !== idx),
    });
  };

  const visitorVisibilityStatus =
    liveSupportConfig.whatsappEnabled && liveSupportConfig.liveChatEnabled
      ? {
          label: 'Both Enabled (WhatsApp + Live Web Chat)',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        }
      : liveSupportConfig.whatsappEnabled
      ? {
          label: 'WhatsApp Live Desk Only',
          badgeClass: 'bg-green-100 text-green-900 border-green-300',
        }
      : liveSupportConfig.liveChatEnabled
      ? {
          label: 'On-Site Live Chat Only',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        }
      : {
          label: 'Both Disabled (Hidden for Visitors)',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#164E3D] text-white border border-[#D4AF37] shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Master Status */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EBF3F0] text-[#164E3D] text-[11px] font-mono font-bold uppercase tracking-wider">
            <MessageCircle className="w-3.5 h-3.5 text-[#AD8921]" />
            <span>Visitor Engagement &amp; Live Support Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#164E3D] tracking-tight">
            WhatsApp Live Desk &amp; On-Site Live Chat Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Enable or disable WhatsApp Live Desk and On-Site Live Web Chat for website visitors, customize greeting prompts, and respond to live visitor inquiries in real time.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Current Visitor Widget State
          </span>
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${visitorVisibilityStatus.badgeClass}`}
          >
            {visitorVisibilityStatus.label}
          </span>
        </div>
      </div>

      {/* Master Enable / Disable Control Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: WhatsApp Live Desk Master Switch */}
        <div
          className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
            liveSupportConfig.whatsappEnabled
              ? 'bg-white border-[#25D366] shadow-sm'
              : 'bg-slate-50 border-slate-200 opacity-85'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  liveSupportConfig.whatsappEnabled
                    ? 'bg-[#25D366] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    WhatsApp Live Desk
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      liveSupportConfig.whatsappEnabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {liveSupportConfig.whatsappEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Allows visitors to launch direct WhatsApp engineering chats to{' '}
                  <strong className="font-mono text-[#164E3D]">
                    +{liveSupportConfig.whatsappNumber}
                  </strong>{' '}
                  with pre-filled equipment and calibration topics.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !liveSupportConfig.whatsappEnabled;
                updateLiveSupportConfig({ whatsappEnabled: next });
                showToast(
                  `WhatsApp Live Desk is now ${
                    next ? 'ENABLED' : 'DISABLED'
                  } for website visitors.`
                );
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                liveSupportConfig.whatsappEnabled
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{liveSupportConfig.whatsappEnabled ? 'Disable' : 'Enable'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: On-Site Live Web Chat Master Switch */}
        <div
          className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
            liveSupportConfig.liveChatEnabled
              ? 'bg-white border-[#164E3D] shadow-sm'
              : 'bg-slate-50 border-slate-200 opacity-85'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  liveSupportConfig.liveChatEnabled
                    ? 'bg-[#164E3D] text-[#D4AF37] shadow-sm'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    On-Site Live Web Chat
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      liveSupportConfig.liveChatEnabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {liveSupportConfig.liveChatEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Allows visitors to chat directly inside the browser without leaving the website. Messages appear in the Admin Live Chat Inbox below.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !liveSupportConfig.liveChatEnabled;
                updateLiveSupportConfig({ liveChatEnabled: next });
                showToast(
                  `On-Site Live Web Chat is now ${
                    next ? 'ENABLED' : 'DISABLED'
                  } for website visitors.`
                );
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                liveSupportConfig.liveChatEnabled
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] shadow-sm'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{liveSupportConfig.liveChatEnabled ? 'Disable' : 'Enable'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick One-Click Visibility Presets */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#164E3D]">
          Quick Visitor Visibility Presets:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              updateLiveSupportConfig({ whatsappEnabled: true, liveChatEnabled: true });
              showToast('Enabled BOTH WhatsApp Live Desk and On-Site Live Chat for visitors.');
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#164E3D] border border-emerald-200 text-xs font-bold cursor-pointer"
          >
            Enable Both Channels
          </button>

          <button
            type="button"
            onClick={() => {
              updateLiveSupportConfig({ whatsappEnabled: true, liveChatEnabled: false });
              showToast('Set visitor support widget to WhatsApp Live Desk Only.');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
          >
            WhatsApp Only
          </button>

          <button
            type="button"
            onClick={() => {
              updateLiveSupportConfig({ whatsappEnabled: false, liveChatEnabled: true });
              showToast('Set visitor support widget to On-Site Live Web Chat Only.');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
          >
            Live Web Chat Only
          </button>

          <button
            type="button"
            onClick={() => {
              updateLiveSupportConfig({ whatsappEnabled: false, liveChatEnabled: false });
              showToast('Disabled BOTH WhatsApp and Live Chat. Widget is now hidden for visitors.');
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
          >
            Disable Both (Hide Widget)
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Configuration vs Live Chat Inbox vs Assigned Operators */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2ECE7] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('controls')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'controls'
              ? 'bg-[#164E3D] text-[#D4AF37] shadow-sm'
              : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Desk Configuration &amp; Quick Prompts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('inbox')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'inbox'
              ? 'bg-[#164E3D] text-[#D4AF37] shadow-sm'
              : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Visitor Live Chat Inbox ({liveChatSessions.length})</span>
          {unreadSessionsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              {unreadSessionsCount} New
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('operators')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'operators'
              ? 'bg-[#164E3D] text-[#D4AF37] shadow-sm'
              : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Assigned Users &amp; Operators ({assignedOperators.length})</span>
        </button>
      </div>

      {/* =====================================================================
          SUB-TAB 1: DESK CONFIGURATION & QUICK PROMPTS
         ===================================================================== */}
      {activeSubTab === 'controls' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Channel & Agent Configuration */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-[#164E3D] border-b border-slate-100 pb-3">
              Channel Routing, Agent Profile &amp; Automated Greetings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp Direct Number (Digits Only)
                </label>
                <input
                  type="text"
                  value={liveSupportConfig.whatsappNumber}
                  onChange={(e) =>
                    updateLiveSupportConfig({ whatsappNumber: e.target.value })
                  }
                  placeholder="2348029844356"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Default Active Tab (When Both Enabled)
                </label>
                <select
                  value={liveSupportConfig.defaultActiveChannel}
                  onChange={(e) =>
                    updateLiveSupportConfig({
                      defaultActiveChannel: e.target.value as 'whatsapp' | 'livechat',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:border-[#164E3D]"
                >
                  <option value="livechat">On-Site Live Web Chat First</option>
                  <option value="whatsapp">WhatsApp Live Desk First</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Widget Header Title
                </label>
                <input
                  type="text"
                  value={liveSupportConfig.deskTitle}
                  onChange={(e) =>
                    updateLiveSupportConfig({ deskTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  On-Duty Engineer / Agent Name
                </label>
                <input
                  type="text"
                  value={liveSupportConfig.agentName}
                  onChange={(e) =>
                    updateLiveSupportConfig({ agentName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status Subtext
                </label>
                <input
                  type="text"
                  value={liveSupportConfig.agentStatusText}
                  onChange={(e) =>
                    updateLiveSupportConfig({ agentStatusText: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Floating Button Position
                </label>
                <select
                  value={liveSupportConfig.position}
                  onChange={(e) =>
                    updateLiveSupportConfig({
                      position: e.target.value as 'bottom-right' | 'bottom-left',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:border-[#164E3D]"
                >
                  <option value="bottom-right">Bottom Right Corner</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Welcome Greeting Message
                </label>
                <textarea
                  rows={2}
                  value={liveSupportConfig.welcomeMessage}
                  onChange={(e) =>
                    updateLiveSupportConfig({ welcomeMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Instant Automated Reply Message (Live Chat)
                </label>
                <textarea
                  rows={2}
                  value={liveSupportConfig.autoReplyMessage}
                  onChange={(e) =>
                    updateLiveSupportConfig({ autoReplyMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={liveSupportConfig.showOnMobile}
                  onChange={(e) =>
                    updateLiveSupportConfig({ showOnMobile: e.target.checked })
                  }
                  className="rounded text-[#164E3D]"
                />
                <span>Display floating support button on mobile phones &amp; tablets</span>
              </label>
            </div>
          </div>

          {/* Right 5 Cols: Quick Inquiry Prompts Manager */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#164E3D]">
                  Visitor Quick Inquiry Prompts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  One-tap buttons visitors can click to start a WhatsApp or Live Chat conversation.
                </p>
              </div>

              <form onSubmit={handleAddQuickPrompt} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="Add new quick inquiry topic..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] text-xs font-bold flex items-center gap-1 hover:bg-[#0E3529] cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {liveSupportConfig.quickPrompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="font-medium text-slate-800">{prompt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuickPrompt(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                      title="Remove prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-[#164E3D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#AD8921] shrink-0" />
              <span>
                All changes are saved automatically and reflected immediately on the live visitor widget.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: VISITOR LIVE CHAT INBOX & REAL-TIME REPLY CONSOLE
         ===================================================================== */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Sessions List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2ECE7] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-[#F4F8F6] border-b border-[#E2ECE7] flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#164E3D]">
                Visitor Conversations ({liveChatSessions.length})
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {liveChatSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No visitor live chat sessions recorded yet.
                </div>
              ) : (
                liveChatSessions.map((session) => {
                  const isSelected = selectedSession?.id === session.id;
                  const lastMsg = session.messages[session.messages.length - 1];
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => {
                        setSelectedSessionId(session.id);
                        markChatSessionRead(session.id);
                      }}
                      className={`w-full text-left p-4 transition-colors cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[#EBF3F0] border-l-4 border-[#164E3D]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {session.visitorName}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {session.unreadByAdmin > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              {session.unreadByAdmin} new
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              session.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-[#164E3D] truncate">
                        {session.visitorCompany} &bull; {session.visitorEmail}
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {lastMsg.text}
                        </p>
                      )}
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Updated: {session.updatedAt}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right 8 Cols: Selected Chat Thread & Reply Box */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2ECE7] shadow-xs overflow-hidden flex flex-col">
            {selectedSession ? (
              <>
                {/* Thread Header */}
                <div className="p-4 sm:p-5 bg-[#F4F8F6] border-b border-[#E2ECE7] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#164E3D]">
                        {selectedSession.visitorName}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {selectedSession.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedSession.visitorCompany} &bull;{' '}
                      <span className="font-mono">{selectedSession.visitorEmail}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConvertToRfqLead(selectedSession)}
                      className="px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0E3529] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Convert to RFQ Pipeline Lead</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateChatSessionStatus(
                          selectedSession.id,
                          selectedSession.status === 'Active' ? 'Resolved' : 'Active'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      {selectedSession.status === 'Active'
                        ? 'Mark Resolved'
                        : 'Reopen Chat'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        deleteChatSession(selectedSession.id);
                        showToast('Deleted chat session.');
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="p-5 space-y-3 max-h-[360px] min-h-[260px] overflow-y-auto bg-[#F8FAF9]">
                  {selectedSession.messages.map((msg) => {
                    const isVisitor = msg.sender === 'visitor';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isVisitor ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isVisitor
                              ? 'bg-white border border-[#E2ECE7] text-slate-800 rounded-tl-xs'
                              : 'bg-[#164E3D] text-white rounded-br-xs'
                          }`}
                        >
                          <div
                            className={`text-[10px] font-mono font-bold mb-1 ${
                              isVisitor ? 'text-[#164E3D]' : 'text-[#D4AF37]'
                            }`}
                          >
                            {msg.senderName} ({isVisitor ? 'Visitor' : 'Samstrust Desk'})
                          </div>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Admin Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-4 bg-white border-t border-[#E2ECE7] flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder={`Reply to ${selectedSession.visitorName} as ${
                      currentUser?.name || liveSupportConfig.agentName
                    }...`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400">
                Select a conversation on the left to read and reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: ASSIGNED USERS & OPERATORS (EDIT / UNASSIGN / DELETE)
         ===================================================================== */}
      {activeSubTab === 'operators' && (
        <div className="bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#164E3D] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#AD8921]" />
                <span>
                  Assigned WhatsApp Live Desk &amp; On-Site Live Chat Operators (
                  {assignedOperators.length})
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit user details, set the active on-duty widget engineer, unassign Live Desk control, or delete assigned user accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                defaultValue=""
                onChange={(e) => {
                  const targetId = e.target.value;
                  if (!targetId) return;
                  const targetUser = managedUsers.find((u) => u.id === targetId);
                  if (targetUser) {
                    toggleUserLiveDeskControl(targetUser.id);
                    showToast(
                      `Assigned WhatsApp Live Desk & On-Site Live Chat Control to ${targetUser.fullName}.`
                    );
                  }
                  e.target.value = '';
                }}
                className="px-3.5 py-2 rounded-xl border border-teal-300 bg-teal-50/70 text-xs font-bold text-[#164E3D] focus:outline-none cursor-pointer"
              >
                <option value="">+ Assign Existing User to Live Desk...</option>
                {managedUsers
                  .filter(
                    (u) =>
                      u.cmsRole !== 'super-admin' &&
                      u.cmsRole !== 'live-desk-agent' &&
                      !u.customPermissions?.includes('cms.livedesk.control')
                  )
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F8F6] border-b border-[#E2ECE7] text-[11px] font-mono uppercase text-slate-500">
                  <th className="py-3 px-4">Assigned Operator</th>
                  <th className="py-3 px-4">Direct Phone / WhatsApp</th>
                  <th className="py-3 px-4">Assigned Roles</th>
                  <th className="py-3 px-4">Active Widget Status</th>
                  <th className="py-3 px-4 text-right">Edit / Unassign / Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedOperators.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No users are currently assigned to WhatsApp Live Desk &amp; On-Site Live Chat Control.
                    </td>
                  </tr>
                ) : (
                  assignedOperators.map((op) => {
                    const isOnDuty =
                      liveSupportConfig.agentName.toLowerCase() ===
                      op.fullName.toLowerCase();
                    return (
                      <tr key={op.id} className="hover:bg-[#F4F8F6]/60">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{op.fullName}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {op.email}
                          </div>
                          <div className="text-[11px] text-[#164E3D] font-medium">
                            {op.jobTitle}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {op.phone || '+234 802 984 4356'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-[#164E3D] font-bold text-[10px]">
                              CMS: {op.cmsRole}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px]">
                              Portal: {op.portalRole}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isOnDuty ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Active Widget Engineer
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const digits = (op.phone || '').replace(/\D/g, '');
                                updateLiveSupportConfig({
                                  agentName: op.fullName,
                                  ...(digits.length >= 10
                                    ? { whatsappNumber: digits }
                                    : {}),
                                });
                                showToast(
                                  `Set ${op.fullName} as the active On-Duty Engineer on the visitor widget.`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-[#164E3D] text-[11px] font-semibold cursor-pointer"
                            >
                              Set as Active Widget Agent
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditOperator(op)}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-[#164E3D] hover:bg-[#164E3D] hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                toggleUserLiveDeskControl(op.id);
                                showToast(
                                  `Unassigned WhatsApp Live Desk & On-Site Live Chat Control from ${op.fullName}.`
                                );
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold cursor-pointer"
                            >
                              Unassign
                            </button>

                            {confirmDeleteOpId === op.id ? (
                              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (managedUsers.length <= 1) {
                                      showToast(
                                        'Cannot delete the last remaining user account.'
                                      );
                                      setConfirmDeleteOpId(null);
                                      return;
                                    }
                                    deleteManagedUser(op.id);
                                    setConfirmDeleteOpId(null);
                                    showToast(`Deleted user account ${op.fullName}.`);
                                  }}
                                  className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteOpId(null)}
                                  className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteOpId(op.id)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-600 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to Edit Assigned Operator */}
      {editingOperator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#164E3D] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-extrabold">
                  Edit Assigned Live Desk User — {editingOperator.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingOperator(null)}
                className="text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOperator} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editOpName}
                  onChange={(e) => setEditOpName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={editOpEmail}
                  onChange={(e) => setEditOpEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Job Title / Designation
                </label>
                <input
                  type="text"
                  value={editOpTitle}
                  onChange={(e) => setEditOpTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Direct Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={editOpPhone}
                  onChange={(e) => setEditOpPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (managedUsers.length <= 1) {
                      showToast('Cannot delete the last remaining user account.');
                      return;
                    }
                    deleteManagedUser(editingOperator.id);
                    setEditingOperator(null);
                    showToast(`Deleted user account ${editingOperator.fullName}.`);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete User</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOperator(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold uppercase tracking-wider hover:bg-[#0E3529] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
