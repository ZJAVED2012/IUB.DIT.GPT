
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, MessageSquare, ShieldCheck, Search, Cpu, Network, DollarSign,
  Server, Activity, Plus, Award, Video, Globe, BrainCircuit, X, Loader2, 
  Terminal, Layers, Zap, Volume2, ScanSearch, ShieldAlert,
  Paperclip, Send, Phone, PhoneOff, MapPin, Sparkles, 
  Shield, Menu, Bell, Info, AlertTriangle, CheckCircle, Trash2, Mic,
  Image as ImageIcon, Wand2, UploadCloud, Download, ExternalLink,
  UserCircle, Binary, Film, Copyright, RefreshCw, Copy, Check, FileText, Database,
  Play, Palette, SlidersHorizontal, Settings, Sun, Moon, Type as TypeIcon,
  Maximize, Monitor, Square, Smartphone, Layers2, Box, Aperture,
  Bolt, Radio, MonitorSmartphone, PlusCircle, Trash, Laptop, Printer, PhoneForwarded, Eye, Filter, History, Radar, Eraser, KeyRound, BadgeCheck, ListRestart, FileDown, Box as Cube,
  Mail, Table, BarChart3, PieChart, LineChart, ChevronRight, Palette as ThemeIcon, 
  RadioTower, Workflow, Headphones, Code2, ShieldSafe, Cpu as CpuIcon
} from 'lucide-react';
import { AppView, Message, Device, AspectRatio, ImageSize, Persona, SystemEvent, ThemeConfig, DeviceType, ConfigTemplate } from './types';
import { MOCK_DEVICES, CONFIG_LIBRARY, THEMES } from './constants';
import { gemini, decodeBase64, decodeAudioData, encode } from './services/geminiService';

const IUBDITLogo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
    <div className="absolute inset-0 bg-sky-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
    <div className="relative p-3 bg-gradient-to-br from-sky-500/20 to-sky-600/10 rounded-2xl border-2 border-sky-400/30 text-sky-400 shadow-2xl shadow-sky-500/20 flex items-center justify-center">
      <BrainCircuit size={size * 0.7} className="stroke-[1.5px]" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full animate-ping opacity-75"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 rounded-full"></div>
    </div>
  </div>
);

const ExcelDataTable: React.FC<{ data: { headers: string[], rows: any[][] } }> = ({ data }) => {
  const copyToClipboard = () => {
    const csv = [data.headers.join(','), ...data.rows.map(row => row.join(','))].join('\n');
    navigator.clipboard.writeText(csv);
    alert("Copied to clipboard.");
  };
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/20 animate-in zoom-in-95">
      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--primary)]"><Table size={14}/><span className="text-[10px] font-black uppercase">Data Grid</span></div>
        <button onClick={copyToClipboard} className="p-1 hover:text-[var(--primary)] transition-colors"><Copy size={14}/></button>
      </div>
      <div className="overflow-x-auto max-w-full custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-white/5">
              {data.headers.map((h, i) => <th key={i} className="px-4 py-2 border-r border-b border-white/10 font-black uppercase text-[9px] text-slate-400">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-white/5 transition-colors">
                {row.map((cell, ci) => <td key={ci} className="px-4 py-2 border-r border-b border-white/5 text-slate-300 font-medium">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const NeuralDataGraph: React.FC<{ data: any }> = ({ data }) => {
  const maxVal = Math.max(...data.datasets.flatMap((ds: any) => ds.data), 10);
  const chartHeight = 120;
  const chartWidth = 350;
  const padding = 20;

  return (
    <div className="my-4 p-4 rounded-xl border border-white/10 bg-black/20 shadow-2xl">
      <div className="flex items-center gap-2 mb-4 text-[var(--primary)]">
        {data.type === 'bar' ? <BarChart3 size={16}/> : <LineChart size={16}/>}
        <h4 className="text-[10px] font-black uppercase">{data.title}</h4>
      </div>
      <div className="relative w-full aspect-[16/6]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`} className="w-full h-full overflow-visible">
          {data.type === 'bar' && data.datasets[0].data.map((val: number, i: number) => {
            const barWidth = (chartWidth - padding * 2) / data.labels.length - 10;
            const h = (val / maxVal) * chartHeight;
            const x = padding + i * ((chartWidth - padding * 2) / data.labels.length) + 5;
            const y = chartHeight - h;
            return (
              <rect key={i} x={x} y={y} width={barWidth} height={h} fill="var(--primary)" fillOpacity="0.6" className="hover:fill-opacity-90 transition-all"/>
            );
          })}
          {data.type === 'line' && (
             <path d={`M ${data.datasets[0].data.map((val: number, i: number) => {
               const x = padding + i * ((chartWidth - padding * 2) / (data.labels.length - 1));
               const y = chartHeight - (val / maxVal) * chartHeight;
               return `${x},${y}`;
             }).join(' L ')}`} fill="none" stroke="var(--primary)" strokeWidth="2" />
          )}
        </svg>
      </div>
    </div>
  );
};

const ParsedContent: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(```json:table\n[\s\S]*?```|```json:graph\n[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```json:table')) {
          try { return <ExcelDataTable key={i} data={JSON.parse(part.replace('```json:table\n', '').replace('```', ''))}/>; } 
          catch (e) { return <pre key={i} className="text-red-400">Table Error</pre>; }
        }
        if (part.startsWith('```json:graph')) {
          try { return <NeuralDataGraph key={i} data={JSON.parse(part.replace('```json:graph\n', '').replace('```', ''))}/>; }
          catch (e) { return <pre key={i} className="text-red-400">Graph Error</pre>; }
        }
        return <div key={i} className="whitespace-pre-wrap">{part}</div>;
      })}
    </div>
  );
};

const SidebarItem: React.FC<any> = ({ icon, label, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active ? 'bg-[var(--primary)] text-white shadow-lg shadow-sky-500/10 scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}>
    <div className={active ? '' : 'group-hover:text-[var(--primary)] transition-colors'}>{icon}</div>
    {!collapsed && <span className="text-xs font-bold tracking-tight">{label}</span>}
  </button>
);

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-4 z-[9999]">
    <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-10 rounded-3xl text-center space-y-8 backdrop-blur-3xl animate-in zoom-in-95 duration-500 shadow-2xl">
      <div className="flex justify-center">
        <IUBDITLogo size={80} />
      </div>
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">IUB Smart Assistant</h1>
        <p className="text-[10px] text-sky-400 font-black uppercase tracking-[0.4em] mt-1">DIT Neural Terminal</p>
      </div>
      <div className="pt-6 border-t border-white/5 space-y-3">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">AI System Lead Engineer</p>
          <p className="text-sm font-black text-white">Mr. Zeeshan Javed</p>
        </div>
        <div className="flex flex-col gap-1.5 items-center">
          <a href="mailto:zeeshan.javed@iub.edu.pk" className="flex items-center gap-2 text-[10px] text-sky-400 hover:text-sky-300 transition-colors bg-sky-400/5 px-3 py-1.5 rounded-full border border-sky-400/10">
            <Mail size={12}/> zeeshan.javed@iub.edu.pk
          </a>
          <a href="mailto:zeeshanjaved6767@gmail.com" className="flex items-center gap-2 text-[10px] text-sky-400 hover:text-sky-300 transition-colors bg-sky-400/5 px-3 py-1.5 rounded-full border border-sky-400/10">
            <Mail size={12}/> zeeshanjaved6767@gmail.com
          </a>
        </div>
        <div className="pt-2 flex items-center justify-center gap-2 text-slate-400">
          <Phone size={12} className="text-sky-500" />
          <p className="text-[11px] font-bold tracking-widest">+92 304 2012500</p>
        </div>
      </div>
      <button onClick={onLogin} className="w-full py-4 rounded-2xl bg-sky-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all">Establish Neural Link</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('dit_terminal_theme');
    if (saved) {
      const parsed = JSON.parse(saved);
      return THEMES.find(t => t.id === parsed.id) || THEMES[0];
    }
    return THEMES[0];
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Neural link established. Mr. Zeeshan Javed, how can I assist you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(Persona.ARCHITECT);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const [useSearch, setUseSearch] = useState(true);
  const [useThinking, setUseThinking] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--secondary', currentTheme.secondary);
    root.style.setProperty('--bg-main', currentTheme.bg);
    root.style.setProperty('--bg-sidebar', currentTheme.sidebar);
    root.style.setProperty('--card-bg', currentTheme.card);
    root.style.setProperty('--border-color', currentTheme.border);
    root.style.setProperty('--text-main', currentTheme.mode === 'dark' ? '#f1f5f9' : '#0f172a');
    root.style.setProperty('--text-muted', currentTheme.mode === 'dark' ? '#94a3b8' : '#64748b');
    localStorage.setItem('dit_terminal_theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage && !selectedVideo) return;
    if (isTyping) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      image: selectedImage || undefined,
      video: selectedVideo || undefined,
      timestamp: new Date(),
      persona: selectedPersona
    };
    
    setMessages(prev => [...prev, userMsg]);
    const curInput = input;
    const curImage = selectedImage;
    const curVideo = selectedVideo;
    const curPersona = selectedPersona;
    
    setInput(''); setSelectedImage(null); setSelectedVideo(null); setIsTyping(true);

    try {
      const history = messages.slice(-8).map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.content }] 
      }));
      
      const response = await gemini.chat(curInput, history, { 
        useThinking, 
        useSearch,
        image: curImage || undefined,
        video: curVideo || undefined,
        persona: curPersona
      });

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text, 
        timestamp: new Date(),
        persona: curPersona
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `Error: ${err.message}`, 
        timestamp: new Date() 
      }]);
    } finally { setIsTyping(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (file.type.startsWith('image/')) {
        setSelectedImage(res);
        setSelectedVideo(null);
      } else if (file.type.startsWith('video/')) {
        setSelectedVideo(res);
        setSelectedImage(null);
      }
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

  const isUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className={`flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500 overflow-hidden`}>
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-16'} bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 z-40 relative shadow-2xl`}>
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3 overflow-hidden">
          <IUBDITLogo size={36} />
          {isSidebarOpen && <div className="text-nowrap ml-1"><h1 className="font-bold text-[var(--text-main)] text-sm tracking-tight">IUB Smart Assistant</h1><p className="text-[8px] text-[var(--primary)] font-black uppercase tracking-widest">Directorate of IT</p></div>}
        </div>
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<MessageSquare size={18}/>} label="Neural Hub" active={activeView === AppView.CHAT} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CHAT)} />
          <SidebarItem icon={<Video size={18}/>} label="Media Synthesis" active={activeView === AppView.MEDIA_LAB} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.MEDIA_LAB)} />
          <SidebarItem icon={<RadioTower size={18}/>} label="System Pulse" active={activeView === AppView.SYSTEM_EVENTS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SYSTEM_EVENTS)} />
          <SidebarItem icon={<Code2 size={18}/>} label="Config Library" active={activeView === AppView.CONFIG_LIBRARY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CONFIG_LIBRARY)} />
          <SidebarItem icon={<LayoutDashboard size={18}/>} label="Asset Ledger" active={activeView === AppView.INVENTORY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<Settings size={18}/>} label="System Config" active={activeView === AppView.SETTINGS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SETTINGS)} />
        </nav>
        <div className="p-4 border-t border-[var(--border-color)] bg-black bg-opacity-10">
          {isSidebarOpen ? (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">AI System Lead Engineer</p>
                <p className="text-xs font-bold text-sky-400">Mr. Zeeshan Javed</p>
              </div>
              <div className="space-y-1 opacity-90">
                <a href="mailto:zeeshan.javed@iub.edu.pk" className="flex items-center gap-2 text-[9px] text-slate-400 hover:text-sky-400 truncate transition-colors">
                  <Mail size={10} className="shrink-0"/> zeeshan.javed@iub.edu.pk
                </a>
                <a href="mailto:zeeshanjaved6767@gmail.com" className="flex items-center gap-2 text-[9px] text-slate-400 hover:text-sky-400 truncate transition-colors">
                  <Mail size={10} className="shrink-0"/> zeeshanjaved6767@gmail.com
                </a>
                <div className="pt-2 flex items-center gap-2 text-[10px] font-black text-[var(--primary)] tracking-widest border-t border-white/5 mt-2 pt-2">
                  <Phone size={10} /> +92 304 2012500
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-[10px] font-black shadow-lg">ZJ</div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--bg-main)] bg-opacity-60 backdrop-blur-xl transition-colors duration-500 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] bg-white/5 rounded-xl transition-all active:scale-95"><Menu size={20}/></button>
            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest opacity-80">{activeView.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => gemini.openKeySelector()} className="group flex items-center gap-2 text-[9px] font-black uppercase text-[var(--primary)] border border-[var(--primary)] border-opacity-20 px-4 py-2 rounded-xl hover:bg-[var(--primary)] hover:bg-opacity-10 transition-all shadow-lg shadow-sky-500/5">
                <KeyRound size={12} className="group-hover:rotate-12 transition-transform" /> Switch Key
             </button>
             <button onClick={() => setIsLoggedIn(false)} className="text-[9px] font-black uppercase text-slate-500 hover:text-rose-500 transition-colors bg-white/5 px-4 py-2 rounded-xl">Logout</button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeView === AppView.CHAT && (
            <div className="flex flex-col h-full max-w-5xl mx-auto px-6 relative">
              <div className="flex items-center justify-center gap-2 py-4 border-b border-white/5 bg-[var(--bg-main)] sticky top-0 z-10">
                {Object.values(Persona).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setSelectedPersona(p)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectedPersona === p ? 'bg-[var(--primary)] text-white shadow-lg shadow-sky-500/20' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto pt-6 space-y-10 custom-scrollbar pb-36 px-4">
                {messages.map(msg => {
                  const hasUrdu = isUrdu(msg.content);
                  return (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                      <div className={`max-w-[85%] rounded-3xl p-5 shadow-2xl relative group ${msg.role === 'user' ? 'bg-gradient-to-br from-sky-600 to-sky-700 text-white border border-sky-400/20' : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-main)]'} ${hasUrdu ? 'rtl-container' : ''}`}>
                        {msg.persona && msg.role === 'assistant' && (
                          <div className="text-[8px] font-black uppercase text-sky-400 mb-2 tracking-[0.2em]">{msg.persona}</div>
                        )}
                        {msg.image && <img src={msg.image} className="max-w-full rounded-2xl mb-4 border-4 border-white/5 shadow-lg" />}
                        {msg.video && <video src={msg.video} controls className="max-w-full rounded-2xl mb-4 border-4 border-white/5 shadow-lg" />}
                        <div className={`text-[15px] leading-relaxed tracking-tight ${hasUrdu ? 'urdu-text' : 'whitespace-pre-wrap font-medium'}`}>
                          {msg.role === 'assistant' ? <ParsedContent content={msg.content}/> : <div>{msg.content}</div>}
                        </div>
                        <div className={`absolute -bottom-6 ${msg.role === 'user' ? 'right-2' : 'left-2'} text-[8px] font-black uppercase text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center gap-3 bg-white/5 w-fit px-5 py-3 rounded-2xl animate-pulse">
                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-[10px] font-black uppercase text-sky-500/60 ml-2">Neural Synthesis</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
                {(selectedImage || selectedVideo) && (
                  <div className="mb-3 p-3 bg-[var(--card-bg)] border-2 border-[var(--primary)] border-opacity-20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 shadow-2xl backdrop-blur-xl">
                    <div className="relative shrink-0">
                      {selectedImage ? <img src={selectedImage} className="w-16 h-16 object-cover rounded-xl border border-white/10" /> : <video src={selectedVideo!} className="w-16 h-16 object-cover rounded-xl border border-white/10" />}
                      <button onClick={() => { setSelectedImage(null); setSelectedVideo(null); }} className="absolute -top-2 -right-2 bg-rose-500 p-1.5 rounded-full text-white shadow-xl hover:scale-110 transition-all"><X size={12}/></button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-[10px] font-black uppercase text-[var(--primary)] tracking-widest">Asset Ready</p>
                       <p className="text-[11px] text-[var(--text-muted)] truncate font-bold">{selectedImage ? 'Image Processed' : 'Video Stream'}</p>
                    </div>
                  </div>
                )}
                <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-3xl p-3 flex items-center gap-2 shadow-2xl backdrop-blur-3xl ring-1 ring-white/5">
                  <button onClick={() => fileInputRef.current?.click()} className="p-3 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10 rounded-2xl transition-all"><Paperclip size={22}/></button>
                  <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Enter system command..." className="flex-1 bg-transparent border-none outline-none text-[15px] p-2 text-[var(--text-main)] font-medium" />
                  <div className="flex gap-2">
                    <button onClick={() => setUseSearch(!useSearch)} className={`p-3 rounded-2xl border transition-all ${useSearch ? 'bg-[var(--primary)] bg-opacity-20 border-[var(--primary)] border-opacity-40 text-[var(--primary)] shadow-lg shadow-sky-500/10' : 'border-white/5 text-slate-600'}`}><Globe size={18}/></button>
                    <button onClick={() => setUseThinking(!useThinking)} className={`p-3 rounded-2xl border transition-all ${useThinking ? 'bg-[var(--primary)] bg-opacity-20 border-[var(--primary)] border-opacity-40 text-[var(--primary)] shadow-lg shadow-sky-500/10' : 'border-white/5 text-slate-600'}`}><BrainCircuit size={18}/></button>
                    <button onClick={handleSendMessage} className="p-3.5 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl text-white shadow-xl shadow-sky-500/20 active:scale-95 transition-all"><Send size={22}/></button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeView === AppView.MEDIA_LAB && <MediaLabView />}
          {activeView === AppView.SETTINGS && <SettingsView currentTheme={currentTheme} onThemeChange={setCurrentTheme} />}
          {activeView === AppView.INVENTORY && <InventoryView devices={MOCK_DEVICES} />}
          {activeView === AppView.SYSTEM_EVENTS && <SystemEventsView />}
          {activeView === AppView.CONFIG_LIBRARY && <ConfigLibraryView />}
        </div>
      </main>
    </div>
  );
};

const ConfigLibraryView: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState('Routing');
  const cats = ['Routing', 'Switching', 'Security', 'Automation'];
  
  const templates: ConfigTemplate[] = [
    { id: 'bgp-1', title: 'IUB Core BGP Mesh', category: 'Routing', commands: 'router bgp 65001\n neighbor 10.0.0.1 remote-as 65001\n neighbor 10.0.0.1 update-source Loopback0' },
    { id: 'vlan-1', title: 'Admin Segment VLAN', category: 'Switching', commands: 'vlan 10\n name ADMIN_BLOCK\n exit\n interface gig1/0/1\n switchport mode access\n switchport access vlan 10' },
    { id: 'fw-1', title: 'Campus Edge ACL', category: 'Security', commands: 'access-list 101 permit ip any any\n ip inspect name FW_POLICY tcp\n ip inspect name FW_POLICY udp' },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-500 rounded-2xl text-white"><Code2 size={28}/></div>
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">Config Library</h2>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Verified IUB System Scripts</p>
        </div>
      </div>
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {cats.map(c => (
          <button key={c} onClick={() => setSelectedCat(c)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCat === c ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.filter(t => t.category === selectedCat).map(t => (
          <div key={t.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 space-y-4 group hover:border-indigo-500 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-white">{t.title}</h3>
              <button onClick={() => { navigator.clipboard.writeText(t.commands); alert('Copied!'); }} className="p-2 bg-white/5 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"><Copy size={16}/></button>
            </div>
            <pre className="bg-black/40 p-4 rounded-2xl text-[11px] font-mono text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">{t.commands}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

const MediaLabView: React.FC = () => {
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
    <div className="p-8 max-w-6xl mx-auto space-y-10 overflow-y-auto h-full custom-scrollbar">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-sky-500 rounded-2xl text-white"><Aperture size={28}/></div>
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">Media Lab</h2>
          <p className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">Neural Vision Studio</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl space-y-4">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Vision Prompt</label>
             <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe asset..." className="w-full h-48 bg-black/20 border border-white/5 rounded-2xl p-5 text-[15px] focus:border-[var(--primary)] outline-none resize-none font-medium text-white transition-all" />
             <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full py-5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black uppercase text-xs shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all">
               {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>} Synthesize Asset
             </button>
          </div>
        </div>
        <div className="lg:col-span-8 aspect-video bg-[var(--card-bg)] rounded-[40px] border-2 border-dashed border-white/5 flex items-center justify-center relative overflow-hidden group shadow-inner">
          {isGenerating && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-md"><RefreshCw className="animate-spin text-[var(--primary)] mb-4" size={56}/><p className="text-[10px] font-black uppercase text-sky-400 tracking-[0.4em] animate-pulse">Synthesizing Pixels</p></div>}
          {result ? <div className="relative w-full h-full group"><img src={result} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8"><button onClick={() => window.open(result, '_blank')} className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-white transition-all"><Download size={24}/></button></div></div> : <div className="text-center space-y-4"><div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10"><ImageIcon className="text-slate-700" size={32} /></div><p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.5em] mt-4">Awaiting Synthesis</p></div>}
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ currentTheme: ThemeConfig, onThemeChange: (t: ThemeConfig) => void }> = ({ currentTheme, onThemeChange }) => (
  <div className="p-8 max-w-5xl mx-auto space-y-16 h-full overflow-y-auto custom-scrollbar pb-32">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-purple-500 rounded-2xl text-white"><ThemeIcon size={28}/></div>
      <div>
        <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">System Skin</h2>
        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Interface Environment Config</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {THEMES.map(theme => (
        <button key={theme.id} onClick={() => onThemeChange(theme)} className={`group relative flex flex-col items-start p-5 rounded-[32px] border-4 transition-all duration-500 ${currentTheme.id === theme.id ? 'border-[var(--primary)] scale-[1.05] shadow-2xl z-10' : 'border-white/5 hover:border-white/20 hover:bg-white/5'}`} style={{ backgroundColor: theme.sidebar }}>
          <div className="w-full h-32 rounded-2xl mb-5 overflow-hidden relative shadow-inner" style={{ backgroundColor: theme.bg }}><div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent"></div><div className="absolute top-4 left-4 w-16 h-3 rounded-full" style={{ backgroundColor: theme.primary }}></div><div className="absolute bottom-4 left-4 right-4 h-12 rounded-xl" style={{ backgroundColor: theme.card }}></div></div>
          <div className="flex items-center justify-between w-full px-2"><span className="text-sm font-black uppercase tracking-tight text-white">{theme.name}</span>{currentTheme.id === theme.id && <div className="p-1 bg-[var(--primary)] rounded-full text-white shadow-lg"><CheckCircle size={16} /></div>}</div>
          <div className="flex gap-2 mt-3 px-2"><div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.primary }}></div><div className="w-4 h-4 rounded-full opacity-50 ring-2 ring-white/10" style={{ backgroundColor: theme.secondary }}></div></div>
        </button>
      ))}
    </div>
    <div className="pt-16 border-t border-[var(--border-color)]">
      <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-[40px] p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Shield size={120}/></div>
        <button onClick={() => gemini.openKeySelector()} className="w-full flex items-center justify-between group/btn relative z-10">
          <div className="flex items-center gap-6"><div className="p-5 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl text-white shadow-xl shadow-sky-500/30"><KeyRound size={32}/></div><div className="text-left"><p className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">API Gateway Key</p><p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Neural Auth Secure Link</p></div></div>
          <div className="p-3 bg-white/5 rounded-2xl group-hover/btn:bg-sky-500/20 transition-all"><ChevronRight className="text-[var(--text-muted)] group-hover/btn:text-[var(--primary)]" size={24} /></div>
        </button>
      </div>
    </div>
  </div>
);

const InventoryView: React.FC<{ devices: Device[] }> = ({ devices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const types = ['All', ...Array.from(new Set(devices.map(d => d.type)))];
  const filtered = devices.filter(d => (filterType === 'All' || d.type === filterType) && (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.ip.includes(searchTerm)));

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-2xl text-white"><Database size={28}/></div>
          <div><h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">Asset Ledger</h2><p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">IT Inventory Ledger</p></div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 border-r border-white/10"><Search size={16} className="text-slate-500" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter assets..." className="bg-transparent border-none outline-none text-[13px] text-white w-40" /></div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-transparent text-[11px] font-black uppercase text-sky-400 outline-none px-3 cursor-pointer">{types.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(d => (
          <div key={d.id} className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-6 rounded-[32px] hover:border-[var(--primary)] hover:bg-white/5 transition-all duration-300 group shadow-xl">
            <div className="flex items-start justify-between mb-6"><div className="p-3 bg-white/5 rounded-2xl text-[var(--primary)] group-hover:scale-110 transition-transform"><Server size={24}/></div><div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${d.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500'}`}>{d.status}</div></div>
            <div className="space-y-1"><h3 className="text-[15px] font-black text-[var(--text-main)] tracking-tight">{d.name}</h3><p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{d.brand} • {d.model}</p></div>
            <div className="mt-8 pt-5 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Type</span><span className="text-[10px] font-bold text-slate-400">{d.type}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">IP Link</span><span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary)] bg-opacity-5 px-2 py-0.5 rounded-lg border border-[var(--primary)] border-opacity-10">{d.ip}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Sector</span><span className="text-[9px] font-bold text-slate-400">{d.location}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SystemEventsView: React.FC = () => {
  const events = [
    { id: 1, type: 'Security', message: 'Firewall detected and blocked intrusion attempt from IP 192.168.1.105', time: '10:45 AM', status: 'Blocked' },
    { id: 2, type: 'Network', message: 'Core Backbone Nexus-01 latency spiked to 45ms. Auto-balancing traffic.', time: '11:12 AM', status: 'Resolved' },
    { id: 3, type: 'System', message: 'New Device "AP-Admin-04" provisioned and synchronized with central ledger.', time: '12:05 PM', status: 'Success' },
    { id: 4, type: 'Auth', message: 'SSH access granted to User: Zeeshan_Javed on Terminal Node-A.', time: '12:30 PM', status: 'Info' },
    { id: 5, type: 'Backup', message: 'University Cloud Storage backup cycle initiated (Progress: 88%)', time: '01:15 PM', status: 'Active' },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-rose-500 rounded-2xl text-white"><RadioTower size={28}/></div>
        <div><h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">System Pulse</h2><p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Real-time Directorate Log</p></div>
      </div>
      <div className="space-y-4 max-w-4xl">
        {events.map(ev => (
          <div key={ev.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl flex gap-6 items-center group hover:bg-white/5 transition-all">
            <div className="w-24 text-[10px] font-black uppercase text-slate-500 tracking-widest shrink-0">{ev.time}</div>
            <div className="h-10 w-[2px] bg-white/5"></div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1"><span className="text-[10px] font-black uppercase tracking-widest text-sky-500">{ev.type}</span><span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${ev.status === 'Blocked' || ev.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'}`}>{ev.status}</span></div>
              <p className="text-sm font-medium text-slate-300">{ev.message}</p>
            </div>
            <button className="p-3 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"><Eye size={18}/></button>
          </div>
        ))}
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] text-center"><p className="text-2xl font-black text-emerald-500">99.9%</p><p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Uptime Index</p></div>
        <div className="bg-sky-500/5 border border-sky-500/10 p-6 rounded-[32px] text-center"><p className="text-2xl font-black text-sky-500">1,240</p><p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Active Nodes</p></div>
        <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-[32px] text-center"><p className="text-2xl font-black text-rose-500">0</p><p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Critical Alarms</p></div>
      </div>
    </div>
  );
};

export default App;
