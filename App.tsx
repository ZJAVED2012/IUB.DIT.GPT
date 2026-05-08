
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, MessageSquare, Search, Cpu, Network, DollarSign,
  Server, Video, Globe, BrainCircuit, X, Loader2, 
  Paperclip, Send, Phone, ImageIcon, Download, ExternalLink,
  Copy, CheckCircle, Database, Settings, Menu, KeyRound, 
  FileText, FileUp, RadioTower, Maximize, Brain,
  Activity, Sparkles, ShieldCheck, Zap, Terminal, Layers,
  ScanSearch, ShieldAlert, SlidersHorizontal, BarChart3, LineChart,
  Eye, Filter, History, Radar, Lock, Bell, ChevronRight, Palette, Users
} from 'lucide-react';
import { AppView, Message, Device, AspectRatio, ImageSize, Persona, ThemeConfig, ConfigTemplate, SystemEvent, SupportTicket, StudentData } from './types';
import { MOCK_DEVICES, THEMES } from './constants';
import { gemini } from './services/geminiService';

const IUBDITLogo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
    <div className="absolute inset-0 bg-[var(--primary)] opacity-20 rounded-2xl blur-xl group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
    <div className="relative p-2 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/30 text-[var(--primary)] shadow-2xl flex items-center justify-center">
      <Brain size={size * 0.6} className="stroke-[1.5px]" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--primary)] rounded-full animate-ping opacity-75"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--primary)] rounded-full"></div>
    </div>
  </div>
);

const ExcelDataTable: React.FC<{ data: { headers: string[], rows: any[][] } }> = ({ data }) => {
  if (!data?.headers || !data?.rows || !Array.isArray(data.headers) || !Array.isArray(data.rows)) {
    return (
      <div className="my-6 p-4 rounded-xl border border-rose-400/20 bg-rose-400/5 text-rose-400 text-xs ltr text-left" style={{ direction: 'ltr', textAlign: 'left' }}>
        Malformed Table Data: Headers and rows must be arrays.
      </div>
    );
  }
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-[var(--border-color)] shadow-xl bg-[var(--card-bg)] backdrop-blur-md ltr text-left" style={{ direction: 'ltr', textAlign: 'left' }}>
      <div className="overflow-x-auto max-w-full custom-scrollbar">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-[var(--primary)]/5 border-b border-[var(--border-color)]">
              {data.headers.map((h, i) => (
                <th key={i} className="px-5 py-4 font-black uppercase text-[10px] text-[var(--text-muted)] tracking-widest text-left">
                  {String(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-[var(--border-color)] hover:bg-[var(--primary)]/5 transition-colors">
                {Array.isArray(row) ? row.map((cell, ci) => (
                  <td key={ci} className="px-5 py-4 text-[var(--text-main)] font-medium text-left">
                    {cell !== null && cell !== undefined ? String(cell) : '-'}
                  </td>
                )) : <td colSpan={data.headers.length} className="px-5 py-4 text-rose-400 italic text-left">Invalid row data</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const NeuralDataGraph: React.FC<{ data: any }> = ({ data }) => {
  if (!data?.datasets || !data?.labels || !Array.isArray(data.datasets) || data.datasets.length === 0) return null;
  const maxVal = Math.max(...(data.datasets || []).flatMap((ds: any) => ds.data || [0]), 10);
  return (
    <div className="my-6 p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl relative overflow-hidden group ltr text-left" style={{ direction: 'ltr', textAlign: 'left' }}>
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Activity size={80} />
      </div>
      <div className="flex items-center gap-3 mb-8 text-[var(--primary)]">
        <BarChart3 size={20}/>
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">{data.title || 'Data Visualization'}</h4>
      </div>
      <div className="h-48 flex items-end gap-4 px-2">
        {data.datasets[0].data && Array.isArray(data.datasets[0].data) ? data.datasets[0].data.map((val: number, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3">
            <div 
              className="w-full bg-gradient-to-t from-[var(--primary)]/10 to-[var(--primary)]/60 hover:to-[var(--primary)] rounded-t-xl transition-all duration-500 shadow-lg"
              style={{ height: `${(val / maxVal) * 100}%` }}
            />
            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase rotate-45 origin-left truncate w-full mt-2 tracking-tighter">{data.labels[i] || `Point ${i+1}`}</span>
          </div>
        )) : <div className="w-full text-center text-rose-400 text-xs">No data points available</div>}
      </div>
    </div>
  );
};

const ParsedContent: React.FC<{ content: string }> = ({ content }) => {
  // More robust regex to match code blocks with optional whitespace
  const parts = content.split(/(```json:table\s*[\s\S]*?```|```json:graph\s*[\s\S]*?```)/g);
  
  return (
    <div className="space-y-5">
      {parts.map((part, i) => {
        if (part.startsWith('```json:table')) {
          try {
            // Clean up the string to get just the JSON content
            const jsonStr = part
              .replace(/^```json:table\s*/, '')
              .replace(/```$/, '')
              .trim();
            return <ExcelDataTable key={i} data={JSON.parse(jsonStr)}/>;
          } 
          catch (e) { 
            console.error("Table Parse Error:", e);
            return <pre key={i} className="text-rose-400 text-xs p-4 bg-rose-400/5 rounded-xl border border-rose-400/20">Table Engine Error: Invalid JSON Format</pre>; 
          }
        }
        if (part.startsWith('```json:graph')) {
          try {
            const jsonStr = part
              .replace(/^```json:graph\s*/, '')
              .replace(/```$/, '')
              .trim();
            return <NeuralDataGraph key={i} data={JSON.parse(jsonStr)}/>;
          }
          catch (e) { 
            console.error("Graph Parse Error:", e);
            return <pre key={i} className="text-rose-400 text-xs p-4 bg-rose-400/5 rounded-xl border border-rose-400/20">Graph Engine Error: Invalid JSON Format</pre>; 
          }
        }
        // Skip empty parts
        if (!part.trim()) return null;
        return <div key={i} className="whitespace-pre-wrap leading-relaxed tracking-tight">{part}</div>;
      })}
    </div>
  );
};

const SidebarItem: React.FC<any> = ({ icon, label, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${active ? 'bg-[var(--primary)] text-white shadow-xl scale-[1.02]' : 'text-[var(--text-muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]'}`}>
    {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-r-full"></div>}
    <div className={`${active ? '' : 'group-hover:text-[var(--primary)] transition-colors'} shrink-0`}>{icon}</div>
    {!collapsed && <span className="text-xs font-bold tracking-tight">{label}</span>}
  </button>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Neural link established. Mr. Zeeshan Javed, I am the IUB Smart IT Assistant. How can I serve the Directorate today?", timestamp: new Date(), persona: Persona.ARCHITECT }
  ]);
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: "IUB-TKT-9821", subject: "LMS Login Issue", status: "In Progress", priority: "High", createdAt: new Date(Date.now() - 172800000) },
    { id: "IUB-TKT-9754", subject: "WiFi Connectivity in Library", status: "Open", priority: "Medium", createdAt: new Date(Date.now() - 86400000) },
    { id: "IUB-TKT-9612", subject: "Fee Challan Generation Error", status: "Resolved", priority: "High", createdAt: new Date(Date.now() - 345600000) }
  ]);
  const [currentStudent, setCurrentStudent] = useState<StudentData | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(Persona.ARCHITECT);
  const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
  const [useSearch, setUseSearch] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--bg-main', currentTheme.bg);
    root.style.setProperty('--bg-sidebar', currentTheme.sidebar);
    root.style.setProperty('--card-bg', currentTheme.card);
    root.style.setProperty('--border-color', currentTheme.border);
    root.style.setProperty('--text-main', currentTheme.mode === 'dark' ? '#f1f5f9' : '#0f172a');
    root.style.setProperty('--text-muted', currentTheme.mode === 'dark' ? '#94a3b8' : '#64748b');
  }, [currentTheme]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !attachment) return;
    
    const userMsgId = Date.now().toString();
    const userMsg: Message = { 
      id: userMsgId, 
      role: 'user', 
      content: input, 
      image: attachment?.type.startsWith('image/') ? attachment.url : undefined,
      video: attachment?.type.startsWith('video/') ? attachment.url : undefined,
      timestamp: new Date(),
      persona: selectedPersona
    };
    
    setMessages(prev => [...prev, userMsg]);
    const curInput = input;
    const curAttachment = attachment;
    
    setInput(''); setAttachment(null); setIsTyping(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      persona: selectedPersona,
      sources: []
    };

    setMessages(prev => [...prev, assistantMsg]);

    try {
      let history = (messages || []).slice(-15).map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.content }] 
      }));

      const runChat = async (currentPrompt: string, currentHistory: any[]) => {
        const stream = gemini.chatStream(currentPrompt, currentHistory, { 
          useSearch, 
          persona: selectedPersona,
          image: curAttachment?.type.startsWith('image/') ? curAttachment.url : undefined,
          video: curAttachment?.type.startsWith('video/') ? curAttachment.url : undefined
        });

        let fullText = '';
        let sources: any[] = [];
        let functionCalls: any[] = [];
        let lastChunk: any = null;

        for await (const chunk of stream) {
          lastChunk = chunk;
          fullText += chunk.text || '';
          
          const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
          if (groundingMetadata?.groundingChunks) {
            groundingMetadata.groundingChunks.forEach((c: any) => {
              if (c.web) sources.push({ title: c.web.title, uri: c.web.uri });
            });
          }

          if (chunk.functionCalls) {
            functionCalls.push(...chunk.functionCalls);
          }

          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: fullText, sources } : m
          ));
        }

        if (functionCalls.length > 0) {
          setIsTyping(true);
          const toolResponses = await Promise.all(functionCalls.map(async (call) => {
            const result = await gemini.handleToolCall(call.name, call.args);
            
            if (call.name === 'create_support_ticket' && result.ticketId) {
              const newTicket: SupportTicket = {
                id: result.ticketId,
                subject: call.args.issue || "Technical Issue",
                status: result.status as any || 'Open',
                priority: result.priority as any || 'Medium',
                createdAt: new Date()
              };
              setTickets(prev => [newTicket, ...prev]);
            }

            if (call.name === 'get_student_data' && result.rollNumber) {
              setCurrentStudent(result);
              setActiveView(AppView.STUDENT_PORTAL);
            }

            return {
              functionResponse: {
                name: call.name,
                response: { result }
              }
            };
          }));

          // Add the model's call and our response to history
          const updatedHistory = [
            ...currentHistory,
            { role: 'user', parts: [{ text: currentPrompt }] },
            { role: 'model', parts: lastChunk.candidates[0].content.parts },
            { role: 'user', parts: toolResponses }
          ];

          // Continue the conversation with tool results
          await runChat("", updatedHistory);
        } else {
          setIsTyping(false);
        }
      };

      await runChat(curInput, history);

    } catch (err: any) {
      setIsTyping(false);
      const isQuota = err?.message?.toLowerCase().includes("quota") || err?.message?.toLowerCase().includes("429");
      const errorMsg = isQuota 
        ? "Neural Link Saturation: High-priority re-routing in progress. Please attempt synchronization again in a moment for peak performance."
        : `Neural Core Interface Alert: ${err.message || 'Unknown Protocol Error'}.`;
        
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, content: errorMsg } : m
      ));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({ url: event.target?.result as string, type: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  if (!isLoggedIn) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center p-6 z-[9999] overflow-hidden ${currentTheme.mode === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/10 via-transparent to-emerald-900/5 opacity-50"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-10 md:p-12 rounded-[50px] space-y-8 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.15)] border relative z-10 ${currentTheme.mode === 'dark' ? 'bg-white/[0.02] border-white/10 ring-1 ring-white/10' : 'bg-white border-slate-200 ring-1 ring-slate-100'}`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <IUBDITLogo size={80} />
            <div className="space-y-2">
              <h1 className={`text-2xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {isSignUp ? 'Create Neural ID' : 'Neural Terminal Authenticate'}
              </h1>
              <p className="text-[9px] text-sky-600 font-black uppercase tracking-[0.4em] px-4 py-1.5 bg-sky-600/5 border border-sky-600/20 rounded-full inline-block">
                Directorate of IT • Secure Node
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Full Identity Name</label>
                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-sky-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-sky-400'}`}>
                  <BrainCircuit size={18} className="text-sky-500" />
                  <input 
                    type="text" 
                    placeholder="e.g. Mr. Zeeshan Javed"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full font-bold uppercase tracking-tight" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Email / Registry Number</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-sky-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-sky-400'}`}>
                <Network size={18} className="text-sky-500" />
                <input 
                  type="text" 
                  placeholder="identity@iub.edu.pk"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-full font-bold" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Neural Access Code</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-sky-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-sky-400'}`}>
                <KeyRound size={18} className="text-sky-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-full font-bold" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsLoggedIn(true)}
            className="group relative w-full py-5 rounded-3xl bg-sky-600 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="flex items-center justify-center gap-3 relative z-10">
              <Zap size={16} fill="currentColor" /> 
              {isSignUp ? 'Initialize Profile' : 'Establish Secure Link'}
            </div>
          </button>

          <div className="text-center pt-2">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:text-sky-500 transition-colors"
            >
              {isSignUp ? 'Already have a Neural ID? Authenticate' : 'New to IUB DIT? Create Neural ID'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 opacity-30 pt-4 border-t border-[var(--border-color)]">
            <ShieldCheck size={14} className={currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'} />
            <span className={`text-[8px] font-black uppercase tracking-widest ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Enterprise Link Layer Secured</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans`}>
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 z-40 relative shadow-xl overflow-hidden`}>
        <div className="h-16 border-b border-[var(--border-color)] flex items-center gap-4 px-6 shrink-0">
          <IUBDITLogo size={36} />
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-xs uppercase tracking-tighter text-nowrap">IUB IT ASSISTANT</span>
              <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest opacity-80">Directorate</span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto custom-scrollbar pt-6">
          <SidebarItem icon={<MessageSquare size={20}/>} label="Neural Hub" active={activeView === AppView.CHAT} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CHAT)} />
          <SidebarItem icon={<FileText size={20}/>} label="Student Portal" active={activeView === AppView.STUDENT_PORTAL} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.STUDENT_PORTAL)} />
          <SidebarItem icon={<Users size={20}/>} label="Faculty Workload" active={activeView === AppView.FACULTY_WORKLOAD} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.FACULTY_WORKLOAD)} />
          <SidebarItem icon={<ShieldAlert size={20}/>} label="Support Tickets" active={activeView === AppView.TICKETS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.TICKETS)} />
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Asset Ledger" active={activeView === AppView.INVENTORY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<ShieldCheck size={20}/>} label="Security Core" active={activeView === AppView.SECURITY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SECURITY)} />
          <SidebarItem icon={<Video size={20}/>} label="Media Lab" active={activeView === AppView.MEDIA_LAB} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.MEDIA_LAB)} />
          <SidebarItem icon={<RadioTower size={20}/>} label="System Pulse" active={activeView === AppView.SYSTEM_EVENTS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SYSTEM_EVENTS)} />
          
          <div className="pt-6 pb-2">
             {!isSidebarOpen ? <div className="h-px bg-[var(--border-color)] mx-4" /> : <p className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] px-4">Institutional</p>}
          </div>
          
          <SidebarItem icon={<Settings size={20}/>} label="Interface" active={activeView === AppView.SETTINGS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SETTINGS)} />
        </nav>
        {isSidebarOpen && (
          <div className={`p-4 border-t border-[var(--border-color)] m-4 rounded-2xl border ${currentTheme.mode === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg">
                <Brain size={20} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className={`text-[11px] font-black uppercase truncate ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Mr. Zeeshan Javed</span>
                <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-tighter">AI Lead Engineer</span>
              </div>
            </div>
            <div className="h-1 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                 <div className="h-full bg-[var(--primary)] w-[98.4%] shadow-[0_0_8px_var(--primary)] transition-all duration-1000"></div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--bg-main)]/80 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-all border shadow-sm active:scale-95 ${currentTheme.mode === 'dark' ? 'text-slate-400 hover:text-white bg-white/5 border-white/10' : 'text-slate-600 hover:text-sky-600 bg-slate-100 border-slate-200'}`}><Menu size={18}/></button>
            <div className="h-6 w-px bg-[var(--border-color)]"></div>
            <div className="flex flex-col">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">{activeView} CORE</h2>
              <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">DIT Institutional Node</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className={`hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-xl border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Neural Link Sync</span>
            </div>
            <button onClick={() => gemini.openKeySelector()} className="text-[9px] font-black uppercase text-sky-600 border border-sky-600/30 px-5 py-2 rounded-xl hover:bg-sky-600/10 transition-all active:scale-95">Establish Key</button>
            <button onClick={() => setIsLoggedIn(false)} className="text-[9px] font-black uppercase text-rose-500 hover:bg-rose-500/10 p-2.5 rounded-xl border border-transparent hover:border-rose-500/20 transition-all active:scale-95"><X size={18}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeView === AppView.CHAT && (
            <div className="flex flex-col h-full max-w-5xl mx-auto px-6 relative">
              <div className="flex items-center justify-center gap-3 py-6">
                {(Object.values(Persona) || []).map(p => (
                  <button key={p} onClick={() => setSelectedPersona(p)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${selectedPersona === p ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg' : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--primary)]/30'}`}>{p}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto pt-2 space-y-8 custom-scrollbar pb-40 px-2">
                {(messages || []).map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-300`}>
                    <div className={`w-full max-w-[90%] md:max-w-[80%] rounded-[32px] p-8 shadow-xl group relative ${msg.role === 'user' ? 'bg-sky-600/5 border border-sky-600/20' : 'bg-[var(--card-bg)] border border-[var(--border-color)]'}`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div> {msg.persona} Output
                          </span>
                          <button onClick={() => { navigator.clipboard.writeText(msg.content); alert('Information copied to clipboard.'); }} className={`p-1.5 transition-all opacity-0 group-hover:opacity-100 rounded-lg active:scale-90 border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-sky-600'}`} title="Copy Log"><Copy size={14}/></button>
                        </div>
                      )}
                      {msg.image && <img src={msg.image} className="max-w-full rounded-2xl mb-6 border border-[var(--border-color)] shadow-lg" />}
                      <div className={`text-[15px] leading-relaxed tracking-tight ${/[\u0600-\u06FF]/.test(msg.content) ? 'urdu-text' : 'font-medium'}`}>
                        {msg.role === 'assistant' ? <ParsedContent content={msg.content}/> : <div>{msg.content}</div>}
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-[var(--border-color)] space-y-3">
                          <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.2em] flex items-center gap-2">
                            <Globe size={14} className="text-[var(--primary)]"/> Grounded Verification
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, idx) => (
                              <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[10px] font-bold transition-all shadow-sm group ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'}`}>
                                <span className="max-w-[120px] truncate">{source.title}</span> <ExternalLink size={10} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-8 pt-3 border-t border-[var(--border-color)] flex items-center justify-between opacity-30">
                         <span className="text-[8px] font-black uppercase tracking-[0.2em]">IUB DIT PRIORITY NODE</span>
                         <span className="text-[8px] font-black uppercase">{msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-4 bg-[var(--card-bg)] w-fit px-8 py-4 rounded-[24px] animate-pulse border border-[var(--border-color)]">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
                <div className="flex justify-center mb-4 gap-2">
                  <button onClick={() => setInput("Check MyIUB server status")} className="px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest hover:border-[var(--primary)] transition-all">Server Status</button>
                  <button onClick={() => setInput("Show my timetable for Roll No 123")} className="px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest hover:border-[var(--primary)] transition-all">My Timetable</button>
                  <button onClick={() => setInput("Create a ticket for LMS login issue")} className="px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest hover:border-[var(--primary)] transition-all">Open Ticket</button>
                </div>
                {attachment && (
                  <div className={`mb-3 p-4 border rounded-2xl flex items-center gap-4 text-xs animate-in slide-in-from-bottom-4 shadow-xl backdrop-blur-3xl ring-1 ${currentTheme.mode === 'dark' ? 'bg-white/[0.02] border-white/10 ring-white/10' : 'bg-white border-slate-200 ring-slate-100'}`}>
                    <div className="p-2 bg-sky-600/10 rounded-xl text-sky-600">
                      {attachment.type.startsWith('image/') ? <ImageIcon size={20}/> : <FileText size={20}/>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="truncate font-bold text-[12px]">{attachment.name}</p>
                    </div>
                    <button onClick={() => setAttachment(null)} className="p-2 text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/10 active:scale-90"><X size={16}/></button>
                  </div>
                )}
                <div className={`backdrop-blur-3xl border rounded-[32px] p-2.5 flex items-center gap-2 shadow-2xl ring-1 focus-within:ring-2 focus-within:ring-sky-500/30 transition-all ${currentTheme.mode === 'dark' ? 'bg-white/[0.05] border-white/10 ring-white/10' : 'bg-white border-slate-200 ring-slate-100'}`}>
                  <button onClick={() => fileInputRef.current?.click()} className={`p-4 rounded-2xl transition-all active:scale-90 ${currentTheme.mode === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'}`}><Paperclip size={24}/></button>
                  <input type="file" ref={fileInputRef} hidden accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
                  <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                    placeholder="Establish Neural Inquiry..." 
                    className="flex-1 bg-transparent border-none outline-none text-[15px] px-2 placeholder:text-slate-400 font-medium" 
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setUseSearch(!useSearch)} title="Search Grounding" className={`p-4 rounded-2xl transition-all border ${useSearch ? 'text-sky-600 bg-sky-600/10 border-sky-600/30 shadow-lg' : 'text-slate-400 border-transparent'}`}><Globe size={20}/></button>
                    <button onClick={handleSendMessage} className="p-4 bg-sky-600 rounded-2xl text-white shadow-xl active:scale-95 transition-all hover:scale-105 hover:bg-sky-700"><Send size={24} className="ml-1" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeView === AppView.INVENTORY && <InventoryView devices={MOCK_DEVICES} currentTheme={currentTheme} />}
          {activeView === AppView.STUDENT_PORTAL && (
            <StudentPortalView 
              currentTheme={currentTheme} 
              studentData={currentStudent} 
              onSearch={async (id) => {
                setIsTyping(true);
                const data = await gemini.handleToolCall('get_student_data', { identifier: id });
                setCurrentStudent(data);
                setIsTyping(false);
              }}
            />
          )}
          {activeView === AppView.FACULTY_WORKLOAD && <FacultyWorkloadView currentTheme={currentTheme} />}
          {activeView === AppView.TICKETS && <TicketsView tickets={tickets} currentTheme={currentTheme} />}
          {activeView === AppView.MEDIA_LAB && <MediaLabView currentTheme={currentTheme} />}
          {activeView === AppView.SYSTEM_EVENTS && <SystemPulseView currentTheme={currentTheme} />}
          {activeView === AppView.SETTINGS && <SettingsView currentTheme={currentTheme} onThemeChange={setCurrentTheme} />}

          {![AppView.CHAT, AppView.INVENTORY, AppView.MEDIA_LAB, AppView.SETTINGS, AppView.SYSTEM_EVENTS].includes(activeView) && (
            <div className="p-10 text-center flex flex-col items-center justify-center h-full space-y-8">
              <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-3xl flex items-center justify-center text-[var(--primary)] animate-pulse border-2 border-[var(--primary)]/20 shadow-xl">
                <Database size={48}/>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-main)]">Synchronizing Node</h2>
                <p className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Module: {activeView.replace('_', ' ')}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StudentPortalView: React.FC<{ 
  currentTheme: ThemeConfig, 
  studentData: StudentData | null,
  onSearch: (id: string) => void 
}> = ({ currentTheme, studentData, onSearch }) => {
  const [searchId, setSearchId] = useState('');

  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar pb-32 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className={`text-4xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Student Portal</h2>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full inline-block border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>Academic Dashboard</p>
        </div>
        
        <div className={`flex items-center gap-4 p-3 px-6 rounded-2xl border transition-all shadow-md focus-within:ring-2 focus-within:ring-sky-500/20 ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-sky-500/40' : 'bg-white border-slate-200 focus-within:border-sky-400'}`}>
          <Search size={20} className="text-[var(--text-muted)]" />
          <input 
            value={searchId} 
            onChange={e => setSearchId(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && onSearch(searchId)}
            placeholder="Roll No / CNIC..." 
            className={`bg-transparent border-none outline-none text-[15px] w-48 placeholder:text-slate-400 font-medium ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`} 
          />
          <button 
            onClick={() => onSearch(searchId)}
            className="px-4 py-1.5 bg-sky-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-sky-700 transition-colors"
          >
            Fetch
          </button>
        </div>
      </div>

      {!studentData ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-4">
          <ScanSearch size={64} className="text-[var(--text-muted)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Enter Roll Number to Synchronize Data</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
              <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Fee Status</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${studentData.feeStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <p className={`text-2xl font-black ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{studentData.feeStatus}</p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
              <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Attendance</p>
              <p className={`text-2xl font-black ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{studentData.attendance}</p>
            </div>
            <div className="p-8 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
              <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Student Name</p>
              <p className={`text-xl font-black ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{studentData.name}</p>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-3 mb-8">
              <History size={20} className="text-[var(--primary)]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Weekly Timetable: {studentData.rollNumber}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Day</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Subject</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Time</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.timetable.map((item, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-color)] hover:bg-[var(--primary)]/5 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold">{item.day}</td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--primary)]">{item.subject}</td>
                      <td className="px-6 py-4 text-xs font-medium">{item.time}</td>
                      <td className="px-6 py-4 text-xs font-mono">{item.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FacultyWorkloadView: React.FC<{ currentTheme: ThemeConfig }> = ({ currentTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const workloadData = [
    { faculty: "Dr. Ahmed Khan", course: "Advanced Algorithms", time: "08:30 AM - 10:00 AM", room: "CS-101", status: "In Session", department: "Computer Science" },
    { faculty: "Prof. Sarah Malik", course: "Database Systems", time: "10:30 AM - 12:00 PM", room: "Lab-03", status: "Upcoming", department: "Information Technology" },
    { faculty: "Dr. Usman Ali", course: "Machine Learning", time: "01:00 PM - 02:30 PM", room: "CS-205", status: "Cancelled", department: "Computer Science" },
    { faculty: "Ms. Fatima Noor", course: "Software Engineering", time: "02:45 PM - 04:15 PM", room: "CS-102", status: "Postponed", department: "Software Engineering" },
    { faculty: "Dr. Zeeshan Javed", course: "Cloud Computing", time: "04:30 PM - 06:00 PM", room: "Lab-01", status: "Scheduled", department: "Computer Science" },
    { faculty: "Prof. Amna Bibi", course: "AI Ethics", time: "09:00 AM - 10:30 AM", room: "CS-105", status: "Completed", department: "Software Engineering" }
  ];

  const filteredData = workloadData.filter(item => 
    item.faculty.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar pb-32 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h2 className={`text-4xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Faculty Workload</h2>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full inline-block border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>Real-Time Scheduling & Allocation</p>
        </div>
        
        <div className={`flex items-center gap-4 p-3 px-6 rounded-2xl border transition-all shadow-md focus-within:ring-2 focus-within:ring-sky-500/20 ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-sky-500/40' : 'bg-white border-slate-200 focus-within:border-sky-400'}`}>
          <Search size={20} className="text-[var(--text-muted)]" />
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search Faculty / Dept..." 
            className={`bg-transparent border-none outline-none text-[15px] w-64 placeholder:text-slate-400 font-medium ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`} 
          />
        </div>

        <div className="flex gap-4">
          <div className={`p-4 rounded-2xl border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} shadow-lg`}>
            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Active Sessions</p>
            <p className={`text-xl font-black ${currentTheme.mode === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
          <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Total Faculty</p>
          <p className={`text-2xl font-black ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>45</p>
        </div>
        <div className="p-6 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
          <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Rooms Occupied</p>
          <p className={`text-2xl font-black ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>18/25</p>
        </div>
        <div className="p-6 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
          <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Avg Workload</p>
          <p className={`text-2xl font-black ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>18 hrs/wk</p>
        </div>
        <div className="p-6 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
          <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">System Sync</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className={`text-xs font-black uppercase ${currentTheme.mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Live</p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-[40px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-[var(--primary)]" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Class Allocation Matrix</h3>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-[9px] font-black uppercase tracking-widest">Today</button>
            <button className="px-4 py-2 rounded-xl text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">Weekly</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Faculty Member</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Course Module</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Time Slot</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Room</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="border-b border-[var(--border-color)] hover:bg-[var(--primary)]/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-[10px]">{item.faculty.split(' ').map(n => n[0]).join('')}</div>
                      <span className="text-xs font-bold">{item.faculty}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{item.department}</td>
                  <td className="px-6 py-5 text-xs font-bold text-[var(--primary)]">{item.course}</td>
                  <td className="px-6 py-5 text-xs font-medium">{item.time}</td>
                  <td className="px-6 py-5 text-xs font-mono">{item.room}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      item.status === 'In Session' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.status === 'Upcoming' ? 'bg-sky-500/10 text-sky-500' :
                      item.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500' :
                      item.status === 'Postponed' ? 'bg-amber-500/10 text-amber-500' :
                      item.status === 'Completed' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TicketsView: React.FC<{ tickets: SupportTicket[], currentTheme: ThemeConfig }> = ({ tickets, currentTheme }) => {
  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar pb-32 max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <h2 className={`text-4xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Support Tickets</h2>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full inline-block border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>DIT Helpdesk Integration</p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Create New Ticket</button>
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="p-6 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between hover:border-[var(--primary)]/40 transition-all shadow-xl group">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'}`}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-mono font-bold text-[var(--primary)]">{ticket.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${ticket.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>{ticket.priority} Priority</span>
                </div>
                <h3 className={`text-lg font-black tracking-tight ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ticket.subject}</h3>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mt-1">Created on {ticket.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">Status</p>
                <span className={`text-xs font-black uppercase tracking-tighter ${ticket.status === 'Resolved' ? 'text-emerald-500' : ticket.status === 'In Progress' ? 'text-amber-500' : 'text-sky-500'}`}>{ticket.status}</span>
              </div>
              <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-all group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const InventoryView: React.FC<{ devices: Device[], currentTheme: ThemeConfig }> = ({ devices, currentTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="space-y-3">
          <h2 className={`text-4xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Asset Ledger</h2>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full inline-block border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>DIT Institutional Center</p>
        </div>
        <div className={`flex items-center gap-4 p-3 px-6 rounded-2xl border transition-all shadow-md focus-within:ring-2 focus-within:ring-sky-500/20 ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-sky-500/40' : 'bg-white border-slate-200 focus-within:border-sky-400'}`}>
          <Search size={20} className="text-[var(--text-muted)]" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search Ledger..." className={`bg-transparent border-none outline-none text-[15px] w-64 placeholder:text-slate-400 font-medium ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {devices.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
          <div key={d.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[32px] hover:border-[var(--primary)]/40 hover:-translate-y-1.5 transition-all group shadow-lg relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="p-4 bg-[var(--primary)]/5 rounded-2xl text-[var(--primary)] group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-md border border-[var(--primary)]/10"><Server size={24}/></div>
              <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${d.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>{d.status}</div>
            </div>
            <h3 className={`text-[18px] font-black mb-1 leading-tight ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{d.name}</h3>
            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] mb-8">{d.brand} • {d.model}</p>
            <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
              <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">NETWORK IP</span><span className={`text-[12px] font-mono font-bold ${currentTheme.mode === 'dark' ? 'text-sky-400' : 'text-sky-600'}`}>{d.ip}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">ZONE</span><span className={`text-[10px] font-black uppercase ${currentTheme.mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{d.location}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SystemPulseView: React.FC<{ currentTheme: ThemeConfig }> = ({ currentTheme }) => {
  const events: SystemEvent[] = [
    { id: '1', timestamp: new Date(), message: 'Network Core backbone synchronization established successfully.', type: 'success' },
    { id: '2', timestamp: new Date(Date.now() - 60000), message: 'Anomalous traffic detected in Campus Zone D (Potential IDS Trigger).', type: 'warning' },
    { id: '3', timestamp: new Date(Date.now() - 150000), message: 'Data Center Main Storage Pool reaching 90% capacity threshold.', type: 'error' },
    { id: '4', timestamp: new Date(Date.now() - 400000), message: 'Automated institutional backup process initiated successfully.', type: 'info' },
  ];
  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar pb-32 max-w-5xl mx-auto">
      <div className="mb-12 space-y-3">
        <h2 className={`text-4xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>System Pulse</h2>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full inline-block border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>Live Infrastructure Monitor</p>
      </div>
      <div className="space-y-5">
        {events.map(event => (
          <div key={event.id} className="p-6 rounded-[24px] bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center gap-6 hover:bg-[var(--primary)]/5 transition-all group shadow-md">
             <div className={`p-4 rounded-xl shadow-lg group-hover:scale-105 transition-transform ${
               event.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
               event.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
               event.type === 'error' ? 'bg-rose-500/10 text-rose-500' :
               'bg-sky-500/10 text-sky-500'
             }`}>
               {event.type === 'success' ? <CheckCircle size={24}/> : 
                event.type === 'warning' ? <ShieldAlert size={24}/> :
                event.type === 'error' ? <Zap size={24}/> :
                <RadioTower size={24}/>}
             </div>
             <div className="flex-1">
               <p className={`text-[15px] font-bold mb-1 tracking-tight ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{event.message}</p>
               <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.1em]">{event.timestamp.toLocaleString()}</span>
             </div>
             <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors group-hover:translate-x-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

const MediaLabView: React.FC<{ currentTheme: ThemeConfig }> = ({ currentTheme }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true); setResult(null);
    try {
      const url = await gemini.generateImage(prompt, { aspectRatio: '16:9', imageSize: '1K' });
      setResult(url);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };
  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 overflow-y-auto h-full custom-scrollbar pb-32">
      <div className="space-y-3">
        <h2 className={`text-4xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Media Lab</h2>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full inline-block border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>Neural Synthesis Hub</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <div className="p-10 rounded-[40px] bg-[var(--card-bg)] border border-[var(--border-color)] space-y-8 shadow-xl">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] ml-2">Latent Description</label>
               <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe asset architecture..." className={`w-full h-48 border-2 rounded-[24px] p-6 text-[15px] focus:border-sky-500 outline-none resize-none transition-all font-medium ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} />
            </div>
            <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-5 rounded-[24px] bg-sky-600 text-white font-black uppercase tracking-[0.1em] text-[12px] shadow-lg flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 transition-all group overflow-hidden">
              {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20} />} 
              {isGenerating ? 'Synthesizing...' : 'Generate Visual'}
            </button>
          </div>
        </div>
        <div className={`lg:col-span-7 aspect-video rounded-[48px] border-2 border-dashed flex items-center justify-center overflow-hidden shadow-inner group relative backdrop-blur-xl ${currentTheme.mode === 'dark' ? 'bg-black/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
          {isGenerating && (
            <div className="flex flex-col items-center gap-6">
               <Loader2 className="animate-spin text-sky-600" size={60}/>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 animate-pulse">Computing Vectors...</p>
            </div>
          )}
          {result ? (
            <div className="w-full h-full relative group/img">
              <img src={result} className="w-full h-full object-cover animate-in fade-in duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                 <button className="p-4 bg-white text-black rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-xl"><Download size={24}/></button>
                 <button className="p-4 bg-white text-black rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-xl"><Maximize size={24}/></button>
              </div>
            </div>
          ) : !isGenerating && (
            <div className="flex flex-col items-center gap-4 text-slate-400 opacity-20">
               <ImageIcon size={64} />
               <div className="text-[9px] font-black uppercase tracking-[0.4em] text-center">Neural Render Empty</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ currentTheme: ThemeConfig, onThemeChange: (t: ThemeConfig) => void }> = ({ currentTheme, onThemeChange }) => (
  <div className="p-10 max-w-6xl mx-auto space-y-16 h-full overflow-y-auto custom-scrollbar pb-32">
    <div className="space-y-4 text-center">
      <h2 className={`text-5xl font-black uppercase tracking-tighter ${currentTheme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Interface Configuration</h2>
      <p className={`text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2 rounded-full inline-block border ${currentTheme.mode === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>Global Neural Environment Preferences</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {THEMES.map(theme => (
        <button key={theme.id} onClick={() => onThemeChange(theme)} className={`flex flex-col items-start p-8 rounded-[40px] border-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl relative group overflow-hidden ${currentTheme.id === theme.id ? 'border-sky-500 bg-sky-500/5 ring-4 ring-sky-500/5' : 'border-[var(--border-color)] hover:border-sky-400/30'}`} style={{ backgroundColor: theme.sidebar }}>
          <div className={`w-full h-32 rounded-[28px] mb-8 shadow-inner border transition-transform duration-700 group-hover:rotate-1 ${theme.mode === 'dark' ? 'bg-[#020617] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
             <div className="w-1/4 h-full rounded-l-[27px] border-r border-inherit" style={{ backgroundColor: theme.sidebar }}></div>
          </div>
          <div className="space-y-2 relative z-10 text-left">
            <span className={`text-[15px] font-black uppercase tracking-tight ${theme.mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{theme.name}</span>
            <div className="flex gap-1.5">
               <div className="w-3.5 h-3.5 rounded-full shadow-md" style={{ backgroundColor: theme.primary }}></div>
               <div className="w-3.5 h-3.5 rounded-full opacity-20 shadow-md" style={{ backgroundColor: theme.secondary }}></div>
            </div>
          </div>
        </button>
      ))}
    </div>
    <div className="pt-20 border-t border-[var(--border-color)] text-center">
       <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.5em] opacity-30">Directorate of IT • AI Platform v5.2 Maintenance Node</p>
    </div>
  </div>
);

export default App;
