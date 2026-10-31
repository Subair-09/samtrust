import React, { useState, useEffect, useRef } from 'react';
import { useCms } from '../context/CmsContext';
import {
  MessageSquare,
  MessageCircle,
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  User,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const {
    liveSupportConfig,
    liveChatSessions,
    sendVisitorChatMessage,
  } = useCms();

  const {
    whatsappEnabled,
    liveChatEnabled,
    defaultActiveChannel,
    whatsappNumber,
    deskTitle,
    agentName,
    agentTitle,
    agentStatusText,
    welcomeMessage,
    position,
    showOnMobile,
    quickPrompts,
  } = liveSupportConfig;

  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'livechat' | 'whatsapp'>(() => {
    if (liveChatEnabled && whatsappEnabled) return defaultActiveChannel;
    return liveChatEnabled ? 'livechat' : 'whatsapp';
  });

  // Sync activeChannel whenever admin toggles channels
  useEffect(() => {
    if (liveChatEnabled && !whatsappEnabled) {
      setActiveChannel('livechat');
    } else if (whatsappEnabled && !liveChatEnabled) {
      setActiveChannel('whatsapp');
    } else if (liveChatEnabled && whatsappEnabled) {
      setActiveChannel(defaultActiveChannel);
    }
  }, [whatsappEnabled, liveChatEnabled, defaultActiveChannel]);

  // Visitor Live Chat State
  const [visitorSessionId, setVisitorSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('samstrust_visitor_chat_session_id');
    } catch {
      return null;
    }
  });
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [showProfileBar, setShowProfileBar] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = visitorSessionId
    ? liveChatSessions.find((s) => s.id === visitorSessionId) || null
    : null;

  useEffect(() => {
    if (isOpen && activeChannel === 'livechat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeChannel, activeSession?.messages.length]);

  // If Admin disabled BOTH WhatsApp Live Desk and Live Chat for visitors, render nothing
  if (!whatsappEnabled && !liveChatEnabled) {
    return null;
  }

  const cleanPhone = (whatsappNumber || '2348029844356').replace(/[^0-9]/g, '');

  const buildWhatsAppUrl = (customText?: string) => {
    const textToSend =
      customText ||
      whatsappInput.trim() ||
      'Hello Samstrust Technologies, I would like to inquire about your engineering instrumentation and calibration services.';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
  };

  const handleSendLiveChat = (textToSend?: string) => {
    const finalMsg = (textToSend ?? chatInput).trim();
    if (!finalMsg) return;

    const session = sendVisitorChatMessage({
      sessionId: visitorSessionId || undefined,
      visitorName: visitorName.trim() || 'Website Visitor',
      visitorEmail: visitorEmail.trim() || 'visitor@facility.ng',
      visitorCompany: visitorCompany.trim() || 'Corporate Inquiry',
      text: finalMsg,
    });

    if (!visitorSessionId) {
      setVisitorSessionId(session.id);
      try {
        localStorage.setItem('samstrust_visitor_chat_session_id', session.id);
      } catch {
        // ignore storage restrictions
      }
    }

    if (!textToSend) {
      setChatInput('');
    }
  };

  const positionClasses =
    position === 'bottom-left'
      ? 'bottom-4 sm:bottom-6 left-4 sm:left-6 items-start'
      : 'bottom-4 sm:bottom-6 right-4 sm:right-6 items-end';

  const mobileVisibilityClass = showOnMobile ? 'flex' : 'hidden sm:flex';

  return (
    <div className={`fixed ${positionClasses} z-50 ${mobileVisibilityClass} flex-col`}>
      {/* Floating Support Drawer */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-[370px] bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col">
          {/* Top Header */}
          <div className="p-4 bg-[#164E3D] text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <img
                      src="/assets/aistudio/favicon_d10ca84b.jfif"
                      alt="Samstrust Emblem"
                      loading="lazy"
                      decoding="async"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#164E3D]" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold tracking-tight truncate">
                    {deskTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">
                      {agentName} &bull; {agentStatusText}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close Live Support Desk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Channel Switcher (Shown when BOTH Live Chat and WhatsApp are enabled by Admin) */}
            {liveChatEnabled && whatsappEnabled && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0D3327]/80 border border-emerald-800/70">
                <button
                  type="button"
                  onClick={() => setActiveChannel('livechat')}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeChannel === 'livechat'
                      ? 'bg-[#D4AF37] text-[#0E3529] shadow-2xs'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Live Web Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('whatsapp')}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeChannel === 'whatsapp'
                      ? 'bg-[#25D366] text-white shadow-2xs'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Desk</span>
                </button>
              </div>
            )}
          </div>

          {/* ===============================================================
              MODE A: ON-SITE LIVE WEB CHAT
             =============================================================== */}
          {activeChannel === 'livechat' && liveChatEnabled && (
            <>
              {/* Optional Visitor Identity Strip */}
              <div className="px-4 py-2 bg-[#EBF3F0] border-b border-[#E2ECE7] flex items-center justify-between text-[11px]">
                <span className="text-[#164E3D] font-semibold truncate">
                  {visitorName
                    ? `Chatting as: ${visitorName} (${visitorCompany || 'Client'})`
                    : 'Instant Engineering Live Chat'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowProfileBar(!showProfileBar)}
                  className="text-[#AD8921] hover:underline font-bold shrink-0 cursor-pointer"
                >
                  {showProfileBar ? 'Hide Details' : 'Add Name/Email'}
                </button>
              </div>

              {showProfileBar && (
                <div className="p-3 bg-slate-50 border-b border-[#E2ECE7] grid grid-cols-1 gap-2 text-xs">
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Your Name (e.g. Engr. Musa)"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={visitorCompany}
                      onChange={(e) => setVisitorCompany(e.target.value)}
                      placeholder="Company / Lab Name"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                    <input
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      placeholder="Work Email"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Live Chat Messages Stream */}
              <div className="p-4 bg-[#F4F8F6] space-y-3 max-h-[340px] min-h-[250px] overflow-y-auto">
                {/* Initial Welcome Bubble if no session yet */}
                {!activeSession && (
                  <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-[#E2ECE7] text-xs text-slate-700 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#164E3D] font-bold">
                      <span>{agentName}</span>
                      <span>{agentTitle}</span>
                    </div>
                    <p className="leading-relaxed">{welcomeMessage}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-end">
                      <span>Live On-Site Support</span>
                      <ShieldCheck className="w-3 h-3 text-[#AD8921]" />
                    </div>
                  </div>
                )}

                {/* Existing Session Messages */}
                {activeSession?.messages.map((msg) => {
                  const isVisitor = msg.sender === 'visitor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isVisitor ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isVisitor
                            ? 'bg-[#164E3D] text-white rounded-br-xs'
                            : 'bg-white text-slate-700 border border-[#E2ECE7] rounded-tl-xs'
                        }`}
                      >
                        {!isVisitor && (
                          <span className="block text-[10px] font-mono font-bold text-[#AD8921] mb-0.5">
                            {msg.senderName}
                          </span>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 px-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Quick Prompts */}
                {(!activeSession || activeSession.messages.length <= 3) &&
                  quickPrompts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-1">
                        Instant Topics:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {quickPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendLiveChat(prompt)}
                            className="w-full text-left p-2 rounded-xl bg-white hover:bg-emerald-50 border border-[#E2ECE7] hover:border-emerald-300 text-xs text-slate-700 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <span className="truncate pr-2">{prompt}</span>
                            <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#164E3D] shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </div>

              {/* Live Chat Input Footer */}
              <div className="p-3 bg-white border-t border-[#E2ECE7]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendLiveChat();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message to live engineer..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0D3327] text-[#D4AF37] shadow-xs transition-colors cursor-pointer"
                    title="Send Live Chat Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ===============================================================
              MODE B: WHATSAPP LIVE DESK
             =============================================================== */}
          {activeChannel === 'whatsapp' && whatsappEnabled && (
            <>
              <div className="p-4 bg-[#F4F8F6] space-y-3 max-h-[360px] overflow-y-auto">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E2ECE7] text-xs text-slate-700 shadow-2xs space-y-2">
                  <p className="leading-relaxed">{welcomeMessage}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="font-mono text-[#164E3D] font-semibold">
                      +{cleanPhone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span>Verified WhatsApp Desk</span>
                      <ShieldCheck className="w-3 h-3 text-[#25D366]" />
                    </span>
                  </div>
                </div>

                {quickPrompts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Start WhatsApp Chat With Topic:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {quickPrompts.map((prompt, idx) => (
                        <a
                          key={idx}
                          href={buildWhatsAppUrl(prompt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-[#E2ECE7] hover:border-emerald-300 text-xs text-slate-700 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate pr-2">{prompt}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#25D366] shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white border-t border-[#E2ECE7] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="Type message for WhatsApp..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white"
                  />
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setIsOpen(false);
                      setWhatsappInput('');
                    }}
                    className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center"
                    title="Launch WhatsApp"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#164E3D] hover:bg-[#1C5D49] text-white shadow-xl hover:shadow-2xl transition-all duration-200 border border-emerald-700/60 cursor-pointer active:scale-95"
        aria-label="Open Live Desk & WhatsApp Support"
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${
            whatsappEnabled ? 'bg-[#25D366]' : 'bg-[#D4AF37] text-[#0E3529]'
          }`}
        >
          {whatsappEnabled && !liveChatEnabled ? (
            <MessageSquare className="w-4 h-4 fill-white text-[#25D366]" />
          ) : (
            <MessageCircle className="w-4 h-4" />
          )}
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#D4AF37] block leading-none mb-0.5">
            {whatsappEnabled && liveChatEnabled
              ? 'WhatsApp & Live Chat'
              : whatsappEnabled
              ? 'Direct WhatsApp Line'
              : 'On-Site Support'}
          </span>
          <span className="text-xs font-bold text-white block leading-tight">
            {whatsappEnabled && liveChatEnabled
              ? 'Live Engineering Desk'
              : whatsappEnabled
              ? 'WhatsApp Live Desk'
              : 'Live Web Chat'}
          </span>
        </div>
        <span className="sm:hidden text-xs font-bold">
          {whatsappEnabled && !liveChatEnabled ? 'WhatsApp' : 'Live Chat'}
        </span>
      </button>
    </div>
  );
};
