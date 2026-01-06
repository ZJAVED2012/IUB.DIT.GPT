
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
  Mail, Table, BarChart3, PieChart, LineChart
} from 'lucide-react';
import { AppView, Message, Device, AspectRatio, ImageSize, Persona, SystemEvent, ThemeConfig, DeviceType } from './types';
import { MOCK_DEVICES, CONFIG_LIBRARY } from './constants';
import { gemini, decodeBase64, decodeAudioData, encode } from './services/geminiService';

const IUBDITLogo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
    <div className="absolute inset-0 bg-sky-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    <div className="relative p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
      <BrainCircuit size={size * 0.6} className="animate-pulse" />
    </div>
  </div>
);

// --- Excel-like Data Table Component ---
const ExcelDataTable: React.FC<{ data: { headers: string[], rows: any[][] } }> = ({ data }) => {
  const [theme] = useState(() => {
    const saved = localStorage.getItem('iub_dit_theme_v1');
    return saved ? JSON.parse(saved) : { mode: 'dark' };
  });

  const copyToClipboard = () => {
    const csv = [data.headers.join(','), ...data.rows.map(row => row.join(','))].join('\n');
    navigator.clipboard.writeText(csv);
    alert("Data copied to clipboard in CSV format.");
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/20 animate-in zoom-in-95 duration-500">
      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table size={14} className="theme-primary-text" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Excel Logic Matrix</span>
        </div>
        <button onClick={copyToClipboard} className="p-1 hover:theme-primary-text transition-colors">
          <Copy size={14} />
        </button>
      </div>
      <div className="overflow-x-auto max-w-full custom-scrollbar">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-white/5">
              {data.headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 border-r border-b border-white/10 font-black uppercase tracking-wider text-[9px] text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-white/5 transition-colors group">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 border-r border-b border-white/5 text-slate-300 font-medium">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Neural Graph Component (SVG Based) ---
const NeuralDataGraph: React.FC<{ data: { type: string, title: string, labels: string[], datasets: any[] } }> = ({ data }) => {
  const maxVal = Math.max(...data.datasets.flatMap(ds => ds.data), 10);
  const chartHeight = 160;
  const chartWidth = 400;
  const padding = 30;

  return (
    <div className="my-4 p-4 rounded-xl border border-white/10 bg-black/20 shadow-2xl animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {data.type === 'bar' ? <BarChart3 size={16} /> : data.type === 'line' ? <LineChart size={16} /> : <PieChart size={16} />}
          <h4 className="text-[10px] font-black uppercase tracking-widest theme-primary-text">{data.title}</h4>
        </div>
        <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]">Neural Vis Node</span>
      </div>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/7' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line 
              key={i} 
              x1={padding} 
              y1={chartHeight - (p * chartHeight)} 
              x2={chartWidth - padding} 
              y2={chartHeight - (p * chartHeight)} 
              stroke="white" 
              strokeOpacity="0.05" 
              strokeDasharray="2,2" 
            />
          ))}

          {data.type === 'bar' && data.datasets[0].data.map((val: number, i: number) => {
            const barWidth = (chartWidth - padding * 2) / data.labels.length - 10;
            const h = (val / maxVal) * chartHeight;
            const x = padding + i * ((chartWidth - padding * 2) / data.labels.length) + 5;
            const y = chartHeight - h;
            return (
              <g key={i} className="group cursor-help">
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={h} 
                  fill="var(--primary)" 
                  fillOpacity="0.6" 
                  className="transition-all hover:fill-opacity-90"
                />
                <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fontSize="8" fill="white" opacity="0.4" className="font-bold uppercase">{data.labels[i]}</text>
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="9" fill="white" className="font-bold opacity-0 group-hover:opacity-100 transition-opacity">{val}</text>
              </g>
            );
          })}

          {data.type === 'line' && (
            <path 
              d={`M ${data.datasets[0].data.map((val: number, i: number) => {
                const x = padding + i * ((chartWidth - padding * 2) / (data.labels.length - 1));
                const y = chartHeight - (val / maxVal) * chartHeight;
                return `${x},${y}`;
              }).join(' L ')}`}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_var(--primary)]"
            />
          )}
        </svg>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 items-center justify-center border-t border-white/5 pt-3">
        {data.datasets.map((ds, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full theme-primary-bg"></div>
            <span className="text-[8px] font-black uppercase text-slate-500">{ds.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Message Content Parser ---
const ParsedContent: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(```json:table\n[\s\S]*?```|```json:graph\n[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```json:table')) {
          try {
            const jsonStr = part.replace('```json:table\n', '').replace('```', '');
            const data = JSON.parse(jsonStr);
            return <ExcelDataTable key={i} data={data} />;
          } catch (e) { return <pre key={i} className="text-[10px] text-red-400">Error parsing table data</pre>; }
        }
        if (part.startsWith('```json:graph')) {
          try {
            const jsonStr = part.replace('```json:graph\n', '').replace('```', '');
            const data = JSON.parse(jsonStr);
            return <NeuralDataGraph key={i} data={data} />;
          } catch (e) { return <pre key={i} className="text-[10px] text-red-400">Error parsing graph data</pre>; }
        }
        return <div key={i} className="whitespace-pre-wrap">{part}</div>;
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [lastErrorWasQuota, setLastErrorWasQuota] = useState(false);

  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('iub_dit_devices_v1');
    return saved ? JSON.parse(saved) : MOCK_DEVICES;
  });

  useEffect(() => {
    if (!isResetting) {
      localStorage.setItem('iub_dit_devices_v1', JSON.stringify(devices));
    }
  }, [devices, isResetting]);

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('iub_dit_theme_v1');
    return saved ? JSON.parse(saved) : {
      mode: 'dark',
      primaryColor: '#0ea5e9',
      secondaryColor: '#64748b',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    };
  });

  useEffect(() => {
    if (!isResetting) {
      localStorage.setItem('iub_dit_theme_v1', JSON.stringify(theme));
    }
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--secondary', theme.secondaryColor);
    root.style.setProperty('--font-main', theme.fontFamily);
    
    if (theme.mode === 'light') {
      root.style.setProperty('--bg-main', '#f8fafc');
      root.style.setProperty('--bg-sidebar', '#ffffff');
      root.style.setProperty('--text-main', '#0f172a');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border', 'rgba(15, 23, 42, 0.05)');
    } else {
      root.style.setProperty('--bg-main', '#020617');
      root.style.setProperty('--bg-sidebar', '#070b1d');
      root.style.setProperty('--text-main', '#f1f5f9');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.05)');
    }
  }, [theme, isResetting]);
  
  const INITIAL_MESSAGE: Message = { 
    id: '1', 
    role: 'assistant', 
    content: "Neural link established. Welcome, Mr. Zeeshan Javed. I am your specialized IUB Smart IT Assistant. How can we optimize the infrastructure today?", 
    timestamp: new Date() 
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('iub_dit_chat_history_v2');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [INITIAL_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useFast, setUseFast] = useState(false);
  const [useSearch, setUseSearch] = useState(true); 
  const [useMaps, setUseMaps] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<Persona>(Persona.ARCHITECT);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isResetting) {
      localStorage.setItem('iub_dit_chat_history_v2', JSON.stringify(messages));
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isResetting]);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage && !selectedVideo) return;
    if (isTyping) return;

    setLastErrorWasQuota(false);
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      image: selectedImage || undefined,
      video: selectedVideo || undefined,
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    const curInput = input;
    const curImage = selectedImage;
    const curVideo = selectedVideo;
    setInput(''); setSelectedImage(null); setSelectedVideo(null); setIsTyping(true);

    try {
      const history = messages.slice(-10).map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.content }] 
      }));
      
      const response = await gemini.chat(curInput, history, { 
        useThinking, 
        useSearch, 
        useFast, 
        useMaps, 
        image: curImage || undefined, 
        video: curVideo || undefined,
        persona: activePersona 
      });

      if (response) {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: response.text, 
          sources: response.sources, 
          persona: activePersona, 
          timestamp: new Date() 
        }]);
      }
    } catch (err: any) {
      let errorMessage = "Neural uplink synchronization fault. Please verify parameters and retry.";
      if (err?.message === "RESOURCE_EXHAUSTED") {
        setLastErrorWasQuota(true);
        errorMessage = "SYSTEM OVERLOAD: The current project quota has been exhausted. \n\nFIX ACTIONS:\n1. Enable 'Fast Response' (Lite model) for higher rate limits.\n2. Use the 'Switch Project' button above to use a different API key.\n3. Wait 60 seconds for the buffer to recycle.";
      } else {
        errorMessage = `UPLINK FAILURE: ${err?.message || "Internal Synchronization Error"}. Ensure terminal parameters are correct.`;
      }
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: errorMessage, 
        timestamp: new Date() 
      }]);
    } finally { setIsTyping(false); }
  };

  const handleSwitchKey = async () => {
    await gemini.openKeySelector();
  };

  const handleClearData = async () => {
    if (window.confirm("CRITICAL SYSTEM RESET: Purge all neural logs and device registrations? This cannot be undone.")) {
      setIsResetting(true);
      
      localStorage.removeItem('iub_dit_devices_v1');
      localStorage.removeItem('iub_dit_chat_history_v2');
      localStorage.removeItem('iub_dit_theme_v1');
      localStorage.clear();

      setMessages([INITIAL_MESSAGE]);
      setDevices(MOCK_DEVICES);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleExportData = () => {
    const logText = messages.map(m => `[${m.timestamp.toLocaleString()}] ${m.role.toUpperCase()}: ${m.content}`).join('\n---\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IUB_DIT_Logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const transcribeAudio = async () => {
    if (isRecording) return;
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const text = await gemini.transcribe(base64);
          if (text) setInput(prev => (prev ? prev + ' ' : '') + text);
          setIsRecording(false);
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 4000);
    } catch (e) { setIsRecording(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (file.type.startsWith('image/')) setSelectedImage(result);
      else if (file.type.startsWith('video/')) setSelectedVideo(result);
    };
    reader.readAsDataURL(file);
  };

  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className={`flex h-screen overflow-hidden ${theme.mode === 'light' ? 'bg-[#f8fafc]' : 'bg-[#020617] text-slate-300'}`} style={{ fontFamily: theme.fontFamily }}>
      {/* Neural Purge Overlay */}
      {isResetting && (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
           <Eraser size={64} className="text-red-500 animate-bounce" />
           <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Purge Active</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Defragmenting Neural Cache & Hardware Registries</p>
           </div>
           <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full theme-primary-bg animate-[scan_1.5s_infinite]"></div>
           </div>
        </div>
      )}

      <aside className={`${isSidebarOpen ? 'w-60' : 'w-16'} ${theme.mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#070b1d] border-white/5'} border-r flex flex-col transition-all duration-300 z-40 relative shadow-xl`}>
        <div className={`p-4 border-b ${theme.mode === 'light' ? 'border-slate-200' : 'border-white/5'} flex items-center gap-3 overflow-hidden text-nowrap`}>
          <IUBDITLogo size={32} />
          {isSidebarOpen && (
            <div>
              <h1 className={`font-bold text-lg tracking-tight ${theme.mode === 'light' ? 'text-slate-900' : 'text-white'}`}>IUB Smart Assistant</h1>
              <p className={`text-[8px] theme-primary-text opacity-60 font-black uppercase tracking-widest`}>Directorate of IT</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<MessageSquare size={16} />} label="Chat Hub" active={activeView === AppView.CHAT} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CHAT)} />
          <SidebarItem icon={<Radio size={16} />} label="Device Manager" active={activeView === AppView.DEVICE_MANAGEMENT} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.DEVICE_MANAGEMENT)} />
          <SidebarItem icon={<Video size={16} />} label="Media Lab" active={activeView === AppView.MEDIA_LAB} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.MEDIA_LAB)} />
          <SidebarItem icon={<Phone size={16} />} label="Voice Proxy" active={activeView === AppView.LIVE} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.LIVE)} />
          <SidebarItem icon={<LayoutDashboard size={16} />} label="Inventory" active={activeView === AppView.INVENTORY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<Settings size={16} />} label="Theme Engine" active={activeView === AppView.SETTINGS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SETTINGS)} />
          
          <div className={`pt-4 mt-4 border-t ${theme.mode === 'light' ? 'border-slate-200' : 'border-white/5'} space-y-1`}>
            <SidebarItem icon={<Download size={16} />} label="Export Logs" active={false} collapsed={!isSidebarOpen} onClick={handleExportData} />
            <SidebarItem icon={<Trash2 size={16} className="text-red-400" />} label="Clear Cache" active={false} collapsed={!isSidebarOpen} onClick={handleClearData} />
          </div>
        </nav>

        <div className={`p-4 border-t ${theme.mode === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-white/5 bg-white/[0.02]'} transition-all duration-300`}>
          {isSidebarOpen ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black tracking-tight ${theme.mode === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Mr. Zeeshan Javed</span>
                <BadgeCheck size={12} className="text-sky-500 fill-sky-500/20" />
              </div>
              <p className="text-[8px] font-bold text-slate-500 uppercase leading-tight">AI System Lead Engineer</p>
              <p className="text-[8px] font-bold theme-primary-text uppercase tracking-widest mt-1">DIT IUB</p>
              <div className="mt-2 space-y-0.5 opacity-60">
                 <p className="text-[7px] font-bold flex items-center gap-1"><Mail size={8} /> zeeshan.javed@iub.edu.pk</p>
                 <p className="text-[7px] font-bold flex items-center gap-1"><Mail size={8} /> zeeshanjaved6767@gmail.com</p>
                 <p className="text-[7px] font-bold flex items-center gap-1"><Phone size={8} /> +923042012500</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Mr. Zeeshan Javed (AI Lead)">
              <div className="w-8 h-8 rounded-full theme-primary-bg flex items-center justify-center text-white text-[10px] font-black">ZJ</div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className={`h-14 border-b ${theme.mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617] border-white/5'} flex items-center justify-between px-6 sticky top-0 z-30`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-black/5 rounded-lg text-slate-400"><Menu size={16} /></button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1 h-1 rounded-full theme-primary-bg animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Lead Engineer node: Zeeshan Javed</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={handleSwitchKey} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-sky-400 hover:bg-sky-500/10 transition-all active:scale-95"
                title="Switch API Key to bypass quota"
              >
                <KeyRound size={12} /> Switch Project
             </button>
             <button onClick={() => setIsLoggedIn(false)} className="px-3 py-1.5 text-[9px] font-bold uppercase text-slate-500 hover:text-red-400 transition-colors">Exit</button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-hidden">
            {activeView === AppView.CHAT && (
              <div className="flex flex-col h-full max-w-4xl mx-auto px-4 relative">
                <div className="flex-1 overflow-y-auto pt-4 space-y-6 custom-scrollbar pb-32">
                  {messages.map((msg) => {
                    const hasUrdu = /[\u0600-\u06FF]/.test(msg.content);
                    return (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${msg.role === 'user' ? 'theme-primary-bg text-white' : theme.mode === 'light' ? 'bg-white border border-slate-200 text-slate-900' : 'bg-slate-900 border border-white/5 text-slate-200'}`}>
                          <div className={`flex items-center justify-between mb-2 text-[8px] font-bold uppercase tracking-widest opacity-50 ${hasUrdu ? 'flex-row-reverse' : ''}`}>
                            <span className="flex items-center gap-1.5">{msg.role === 'assistant' ? 'Neural Node' : 'Lead Engineer'}</span>
                            <span>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          
                          {/* Use the new ParsedContent component to handle tables and graphs */}
                          <div className={`text-sm leading-normal ${hasUrdu ? 'urdu-text' : ''}`}>
                            {msg.role === 'assistant' ? <ParsedContent content={msg.content} /> : <div className="whitespace-pre-wrap">{msg.content}</div>}
                          </div>

                          {msg.role === 'assistant' && msg.content.includes("RESOURCE_EXHAUSTED") && (
                            <button 
                              onClick={handleSwitchKey}
                              className="mt-4 w-full py-2 rounded-xl bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/20 transition-all flex items-center justify-center gap-2"
                            >
                              <KeyRound size={14} /> Switch Project Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className={`${theme.mode === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/5'} border rounded-xl p-3 flex items-center gap-3`}>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 theme-primary-bg rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 theme-primary-bg rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1 h-1 theme-primary-bg rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                        <span className="text-[9px] font-bold theme-primary-text uppercase tracking-widest">Neural Synthesis in Progress</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                {!isTyping && (
                   <div className="absolute bottom-24 left-1/2 -translate-x-1/2 opacity-30 flex items-center gap-2 select-none pointer-events-none">
                      <div className="w-6 h-[1px] bg-slate-500"></div>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">Designed by Mr. Zeeshan Javed • DIT IUB</span>
                      <div className="w-6 h-[1px] bg-slate-500"></div>
                   </div>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
                  <div className={`${theme.mode === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0f172a] border-white/10 shadow-xl'} border rounded-2xl p-2 flex items-center gap-1`}>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:theme-primary-text"><Paperclip size={18} /></button>
                    <input type="file" id="chat-file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
                    <button onClick={transcribeAudio} className={`p-2 ${isRecording ? 'text-red-500' : 'text-slate-500'}`}><Mic size={18} /></button>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Neural command terminal (e.g., 'show device stats in a bar graph')..." className="flex-1 bg-transparent border-none outline-none text-sm p-2" />
                    <div className="flex gap-1">
                      <ToolToggle active={useSearch} onClick={() => { setUseSearch(!useSearch); setUseMaps(false); setUseFast(false); }} icon={<Globe size={14} />} title="Search Grounding" />
                      <ToolToggle 
                        active={useFast} 
                        onClick={() => { setUseFast(!useFast); setUseSearch(false); setUseMaps(false); }} 
                        icon={<Bolt size={14} />} 
                        title="Fast Response (Use this if quota exceeded)" 
                        className={lastErrorWasQuota && !useFast ? 'animate-pulse text-amber-500 border-amber-500/50' : ''}
                      />
                      <ToolToggle active={useThinking} onClick={() => setUseThinking(!useThinking)} icon={<BrainCircuit size={14} />} title="Thinking Mode" />
                      <button onClick={handleSendMessage} className="p-2 theme-primary-bg rounded-lg text-white shadow-md"><Send size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === AppView.MEDIA_LAB && <MediaLabView theme={theme} />}
            {activeView === AppView.SETTINGS && <SettingsView theme={theme} onThemeChange={setTheme} />}
            {activeView === AppView.LIVE && <LiveSessionView />}
            {activeView === AppView.INVENTORY && <InventoryView devices={devices} />}
            {activeView === AppView.DEVICE_MANAGEMENT && <DeviceManagementView devices={devices} onUpdate={(d) => setDevices(prev => prev.map(dev => dev.id === d.id ? d : dev))} />}
          </div>
        </div>
      </main>
    </div>
  );
};

const MediaLabView: React.FC<{ theme: ThemeConfig }> = ({ theme }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'generate' | 'edit' | 'video'>('generate');
  const [aspect, setAspect] = useState<AspectRatio>('16:9');
  const [size, setSize] = useState<ImageSize>('1K');
  const [status, setStatus] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imgRef, setImgRef] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAction = async () => {
    if (!prompt && mode !== 'edit') return;
    setBusy(true); setMediaUrl(null); setStatus('Establishing Pipeline...');
    try {
      if (mode === 'generate') {
        setStatus('Synthesizing Plate (Gemini 3 Pro Image)...');
        const url = await gemini.generateImage(prompt, { aspectRatio: aspect, imageSize: size });
        if (url) setMediaUrl(url);
      } else if (mode === 'edit') {
        setStatus('Recalibrating Asset (Gemini 2.5 Flash Image)...');
        const url = await gemini.editImage(prompt, imgRef!);
        if (url) setMediaUrl(url);
      } else if (mode === 'video') {
        setStatus('Temporal Link Simulation (Veo 3.1)...');
        const url = await gemini.generateVideo(prompt, aspect === '9:16' ? '9:16' : '16:9', imgRef || undefined);
        if (url) setMediaUrl(url);
      }
      setStatus('Complete.');
    } catch (e: any) { 
      setStatus(e?.message === 'RESOURCE_EXHAUSTED' ? 'SYSTEM OVERLOAD: Quota Exceeded. Try switching API keys or projects.' : 'Fault Detected.'); 
    }
    finally { setBusy(false); }
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Media Lab</h2>
            <div className="p-2 theme-primary-bg rounded-lg text-white"><Sparkles size={18} /></div>
          </div>
          
          <div className={`relative flex-1 max-w-md w-full ${theme.mode === 'light' ? 'text-slate-900' : 'text-white'}`}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets, templates or history..." 
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${theme.mode === 'light' ? 'bg-white border-slate-200 focus:border-sky-500 shadow-sm' : 'bg-slate-900/60 border-white/5 focus:theme-primary-border shadow-inner'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6 p-6 rounded-2xl border bg-slate-900/40 border-white/5">
            <div className="flex gap-1 p-1 bg-black/20 rounded-xl w-fit">
              {['generate', 'edit', 'video'].map((m) => (
                <button key={m} onClick={() => setMode(m as any)} className={`px-4 py-2 rounded-lg text-[10px] uppercase font-bold transition-all ${mode === m ? 'theme-primary-bg text-white' : 'text-slate-500 hover:text-slate-300'}`}>{m}</button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Framing Grid</label>
                <div className="grid grid-cols-4 gap-1">
                  {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(v => (
                    <button key={v} onClick={() => setAspect(v as any)} className={`p-2 rounded-lg border text-[8px] font-bold transition-all ${aspect === v ? 'theme-primary-border theme-primary-text bg-current-10' : 'border-white/5 text-slate-500 hover:border-white/20'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Synthesis Fidelity</label>
                <div className="grid grid-cols-3 gap-1">
                  {['1K', '2K', '4K'].map(v => (
                    <button key={v} onClick={() => setSize(v as any)} className={`p-2 rounded-lg border text-[8px] font-bold transition-all ${size === v ? 'theme-primary-border theme-primary-text bg-current-10' : 'border-white/5 text-slate-500 hover:border-white/20'}`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>

            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Neural synthesis prompt..." className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:theme-primary-border outline-none" />
            
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button onClick={() => document.getElementById('media-ref-upl')?.click()} className="text-[10px] font-bold uppercase theme-primary-text flex items-center gap-2 hover:underline"><UploadCloud size={16} /> {imgRef ? 'Ref Asset Loaded' : 'Upload Reference'}</button>
              <input type="file" id="media-ref-upl" hidden accept="image/*" onChange={e => {
                const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImgRef(ev.target?.result as string); r.readAsDataURL(f); }
              }} />
              <button onClick={handleAction} disabled={busy} className="px-8 py-3 theme-primary-bg rounded-xl text-[10px] font-bold uppercase text-white shadow-lg">{busy ? 'Synthesizing...' : 'Initialize Pipeline'}</button>
            </div>
            {status && <p className="text-[10px] theme-primary-text font-bold uppercase tracking-widest animate-pulse">{status}</p>}
          </div>
          <div className="lg:col-span-5 border border-white/5 rounded-2xl bg-black/20 flex items-center justify-center p-6 min-h-[400px]">
            {mediaUrl ? (
              <div className="space-y-4 w-full text-center">
                {mode === 'video' ? <video src={mediaUrl} controls autoPlay loop className="rounded-xl shadow-2xl" /> : <img src={mediaUrl} className="rounded-xl shadow-2xl" />}
                <a href={mediaUrl} download className="inline-flex items-center gap-2 px-6 py-2 theme-primary-bg rounded-lg text-[10px] font-bold uppercase text-white"><Download size={14} /> Download Asset</a>
              </div>
            ) : <div className="text-center opacity-20"><Binary size={48} className="mx-auto mb-2" /><p className="text-[8px] font-black uppercase tracking-widest">Awaiting Uplink</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const DeviceManagementView: React.FC<{ devices: Device[], onUpdate: (d: Device) => void }> = ({ devices, onUpdate }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [schematicStyle, setSchematicStyle] = useState<'Blueprint' | 'Digital Twin' | 'X-Ray'>('Blueprint');
  const [copiedIp, setCopiedIp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleMaintenanceToggle = () => {
    if (!selectedDevice) return;
    const newStatus = selectedDevice.status === 'Maintenance' ? 'Online' : 'Maintenance';
    const updated = { ...selectedDevice, status: newStatus as any };
    onUpdate(updated);
    setSelectedDevice(updated);
  };

  const handleGenerateSchematic = async () => {
    if (!selectedDevice) return;
    setIsGenerating(true);
    try {
      let promptPrefix = "";
      if (schematicStyle === 'Blueprint') {
        promptPrefix = "Professional technical blueprint engineering drawing, blue background with clean white technical lines, ISO standard, isometric view.";
      } else if (schematicStyle === 'Digital Twin') {
        promptPrefix = "Photorealistic 3D digital twin render, studio lighting, hyper-realistic, high-tech industrial aesthetic, floating in void.";
      } else if (schematicStyle === 'X-Ray') {
        promptPrefix = "Internal hardware X-Ray vision view, transparent outer casing revealing complex circuitry and chips, tech-noir aesthetic, glowing trace paths.";
      }

      const prompt = `${promptPrefix} A ${selectedDevice.brand} ${selectedDevice.model} ${selectedDevice.type}. Highly detailed engineering schematic with component callouts and technical labels.`;
      
      const url = await gemini.generateImage(prompt, { aspectRatio: '1:1', imageSize: '1K' });
      if (url) {
        onUpdate({ ...selectedDevice, image: url });
        setSelectedDevice({ ...selectedDevice, image: url });
      }
    } catch (e) { 
      console.error(e);
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex justify-between items-end">
        <div><h2 className="text-2xl font-bold">Mesh Node Control</h2><p className="text-[10px] uppercase text-slate-500 tracking-[0.3em]">Real-time hardware visualization</p></div>
        <div className="flex items-center gap-2">
           <Radio size={20} className="theme-primary-text animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-4 overflow-y-auto custom-scrollbar space-y-2">
          {devices.map(d => {
            const statusColor = d.status === 'Online' ? 'bg-emerald-500' : d.status === 'Offline' ? 'bg-rose-500' : 'bg-amber-500';
            return (
              <button 
                key={d.id} 
                onClick={() => setSelectedDevice(d)} 
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${selectedDevice?.id === d.id ? 'theme-primary-border bg-current-5 shadow-lg' : 'border-white/5 bg-slate-900/40'}`}
              >
                <div className={`p-2 rounded-lg ${selectedDevice?.id === d.id ? 'theme-primary-bg text-white' : 'bg-slate-800'}`}><Server size={16} /></div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold truncate">{d.name}</p>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColor} shadow-[0_0_8px_rgba(0,0,0,0.5)] animate-pulse shadow-current`}></div>
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase">{d.brand} • {d.type}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-2xl p-6 overflow-y-auto custom-scrollbar relative">
          {selectedDevice ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Maintenance Alert Banner */}
              {selectedDevice.status === 'Maintenance' && (
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-in zoom-in-95 duration-300">
                  <ShieldAlert size={20} className="text-amber-500 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Operational Isolation Active</h4>
                    <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">This node is currently isolated for maintenance. Automated neural scans and system-wide alerts are suspended to prevent false positives.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-64 h-64 rounded-xl border-2 border-dashed border-white/10 bg-black flex items-center justify-center overflow-hidden relative group shrink-0 shadow-2xl">
                  {selectedDevice.image ? (
                    <>
                      <img src={selectedDevice.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <a href={selectedDevice.image} download={`${selectedDevice.name}_Schematic.png`} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40"><FileDown size={20} /></a>
                         <button onClick={() => setSelectedDevice({...selectedDevice, image: undefined})} className="p-2 bg-red-500/20 backdrop-blur-md rounded-lg text-red-400 hover:bg-red-500/40"><Trash2 size={20} /></button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon size={40} className="opacity-10 mx-auto" />
                      <p className="text-[8px] font-black uppercase text-slate-700 tracking-[0.2em]">Missing Visual Matrix</p>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-10">
                      <Loader2 size={32} className="animate-spin theme-primary-text" />
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] theme-primary-text animate-pulse">Synthesizing Asset...</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <DeviceField label="Host Identity" value={selectedDevice.name} />
                    <DeviceField label="Link Status" value={selectedDevice.status} />
                    
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Active Logic IP</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold mono text-sky-400 truncate">{selectedDevice.ip}</p>
                        <button 
                          onClick={() => handleCopyIp(selectedDevice.ip)} 
                          title="Copy Command (IP)"
                          className={`p-1.5 rounded-lg border transition-all ${copiedIp ? 'theme-primary-bg text-white border-transparent' : 'border-white/5 text-slate-500 hover:bg-black/20'}`}
                        >
                          {copiedIp ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    <DeviceField label="Hardware Vendor" value={selectedDevice.brand} />
                  </div>

                  {/* Maintenance Mode Toggle Control */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Maintenance Protocol</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase">Suspend Automated Monitoring</p>
                     </div>
                     <button 
                        onClick={handleMaintenanceToggle}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 border p-1 ${selectedDevice.status === 'Maintenance' ? 'theme-primary-bg theme-primary-border' : 'bg-slate-800 border-white/10'}`}
                     >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${selectedDevice.status === 'Maintenance' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Palette size={12} className="theme-primary-text" /> AI Schematic Style
                    </label>
                    <div className="flex gap-2 p-1 bg-black/30 rounded-xl w-fit border border-white/5">
                      {[
                        { id: 'Blueprint', icon: <FileText size={14} /> },
                        { id: 'Digital Twin', icon: <Cube size={14} /> },
                        { id: 'X-Ray', icon: <Cpu size={14} /> }
                      ].map(style => (
                        <button 
                          key={style.id} 
                          onClick={() => setSchematicStyle(style.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${schematicStyle === style.id ? 'theme-primary-bg text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {style.icon} {style.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                      <UploadCloud size={16} /> Upload CORE
                    </button>
                    <input type="file" id="dev-file" ref={fileInputRef} hidden accept="image/*" onChange={e => {
                      const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => { onUpdate({...selectedDevice, image: ev.target?.result as string}); setSelectedDevice({...selectedDevice, image: ev.target?.result as string}); }; r.readAsDataURL(f); }
                    }} />
                    <button 
                      onClick={handleGenerateSchematic} 
                      disabled={isGenerating} 
                      className="flex-1 py-3 theme-primary-bg rounded-xl text-[9px] font-black uppercase text-white tracking-[0.2em] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      <Wand2 size={18} /> Generate AI {schematicStyle}
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Network Genealogy Timeline */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <History size={16} className="theme-primary-text" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.25em]">Network Genealogy Audit</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[9px] font-black uppercase theme-primary-text shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                       Audit Buffer: {selectedDevice.ipHistory?.length || 0} Fragments
                    </div>
                 </div>
                 
                 <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[21px] before:top-1 before:bottom-1 before:w-px before:bg-gradient-to-b before:from-sky-500/50 before:via-white/5 before:to-white/5">
                    {selectedDevice.ipHistory && selectedDevice.ipHistory.length > 0 ? (
                      [...selectedDevice.ipHistory].reverse().map((oldIp, idx) => {
                        const isCurrent = oldIp === selectedDevice.ip;
                        return (
                          <div key={idx} className="relative flex items-center gap-6 group">
                             <div className={`absolute left-[-5px] w-2.5 h-2.5 rounded-full border-2 transition-all duration-500 z-10 ${isCurrent ? 'theme-primary-bg theme-primary-border shadow-[0_0_12px_var(--primary)] animate-pulse scale-110' : 'bg-slate-900 border-white/20'}`}></div>
                             
                             <div className={`flex-1 flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 group/item ${isCurrent ? 'bg-sky-500/5 border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.05)]' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black mono tracking-tighter ${isCurrent ? 'theme-primary-text' : 'text-slate-600'}`}>
                                      [v.{String(selectedDevice.ipHistory.length - idx).padStart(2, '0')}]
                                    </span>
                                    <span className={`mono text-sm font-bold tracking-tight ${isCurrent ? 'text-white' : 'text-slate-400'} group-hover/item:text-sky-400 transition-colors`}>
                                      {oldIp}
                                    </span>
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-black uppercase text-emerald-400 tracking-widest">Active</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-[9px] font-bold uppercase text-slate-600 tracking-widest">
                                     <span className="flex items-center gap-1"><Terminal size={10} /> Log ID: {Math.floor(Math.random() * 900000 + 100000)}</span>
                                     <span className="flex items-center gap-1"><BadgeCheck size={10} /> Verified by System Core</span>
                                  </div>
                                </div>
                                <div className="mt-3 sm:mt-0 flex items-center gap-2">
                                  <button 
                                     onClick={() => handleCopyIp(oldIp)} 
                                     title="Copy Command ID"
                                     className={`p-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'theme-primary-bg text-white shadow-lg' : 'text-slate-500 hover:text-sky-400 hover:bg-sky-400/10'}`}
                                  >
                                     <Copy size={14} /> {isCurrent ? 'Active Command' : 'Copy'}
                                  </button>
                                </div>
                             </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
                         <History size={32} className="mb-3 text-slate-600 animate-spin-slow" />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Genetic Memory Buffer Empty</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Layers2 size={48} />
              <p className="text-[10px] uppercase font-bold mt-4">Select Grid Node</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ theme: ThemeConfig, onThemeChange: (t: ThemeConfig) => void }> = ({ theme, onThemeChange }) => {
  const primaryColors = [{ name: 'Sky', value: '#0ea5e9' }, { name: 'Emerald', value: '#10b981' }, { name: 'Rose', value: '#f43f5e' }, { name: 'Amber', value: '#f59e0b' }];
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700">
      <h2 className="text-2xl font-bold tracking-tight">Interface Customization Hub</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Appearance Mode</label>
          <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5 shadow-inner">
            <button onClick={() => onThemeChange({...theme, mode: 'light'})} className={`flex-1 py-3 rounded-lg text-[10px] uppercase font-bold transition-all ${theme.mode === 'light' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Light Spectrum</button>
            <button onClick={() => onThemeChange({...theme, mode: 'dark'})} className={`flex-1 py-3 rounded-lg text-[10px] uppercase font-bold transition-all ${theme.mode === 'dark' ? 'theme-primary-bg text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Dark Matter</button>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Primary Logic Accent</label>
          <div className="grid grid-cols-4 gap-3">
            {primaryColors.map(c => (
              <button key={c.value} onClick={() => onThemeChange({...theme, primaryColor: c.value})} className={`h-12 rounded-xl border-2 transition-all hover:scale-110 shadow-lg ${theme.primaryColor === c.value ? 'border-white scale-105' : 'border-transparent'}`} style={{backgroundColor: c.value}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveSessionView: React.FC = () => {
  const [active, setActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = gemini.connectLive({
        onopen: () => setActive(true),
        onmessage: async (m) => {},
        onerror: (e) => console.error(e),
        onclose: () => setActive(false)
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { console.error(e); }
  };
  const stopSession = () => { sessionRef.current?.close(); setActive(false); };
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in fade-in duration-1000">
      <div className={`w-40 h-40 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${active ? 'theme-primary-border theme-primary-text bg-current-5 animate-pulse' : 'border-white/10 text-slate-500'}`}><Phone size={64} /></div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter">Bi-Directional Voice Link</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em]">Real-time neural relay protocol.</p>
      </div>
      <button onClick={active ? stopSession : startSession} className={`px-12 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${active ? 'bg-red-600 text-white hover:bg-red-500' : 'theme-primary-bg text-white hover:opacity-90'}`}>{active ? 'Terminate Uplink' : 'Initialize Voice Proxy'}</button>
    </div>
  );
};

const InventoryView: React.FC<{ devices: Device[] }> = ({ devices }) => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
    <div className="mb-10"><h2 className="text-2xl font-bold tracking-tight">Logical Inventory</h2><p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">DIT Hardware Infrastructure Mapping</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {devices.map(d => (
        <div key={d.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 hover:theme-primary-border transition-all shadow-lg group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-800 rounded-xl theme-primary-text group-hover:scale-110 transition-transform">
              {d.image ? <img src={d.image} className="w-8 h-8 rounded object-cover" /> : <Server size={22} />}
            </div>
            <div>
              <p className="text-[7px] font-black uppercase text-slate-500 tracking-widest">{d.type}</p>
              <h3 className="text-base font-bold tracking-tight">{d.name}</h3>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/5"><span className="text-[9px] font-bold uppercase text-slate-600 tracking-widest">Logic Node IP:</span> <span className="mono text-xs theme-primary-text font-bold">{d.ip}</span></div>
        </div>
      ))}
    </div>
  </div>
);

const DeviceField: React.FC<{ label: string, value: string, mono?: boolean }> = ({ label, value, mono }) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{label}</p>
    <p className={`text-sm font-semibold truncate ${mono ? 'mono text-sky-400' : 'text-slate-200'}`}>{value}</p>
  </div>
);

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void }> = ({ icon, label, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-semibold transition-all group ${active ? 'theme-primary-bg text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:bg-black/20 hover:theme-primary-text'}`}>{icon}{!collapsed && <span className="truncate tracking-tight">{label}</span>}</button>
);

const ToolToggle: React.FC<{ active: boolean, onClick: () => void, icon: any, title?: string, className?: string }> = ({ active, onClick, icon, title, className }) => (
  <button onClick={onClick} title={title} className={`p-2.5 rounded-xl border transition-all ${active ? 'theme-primary-bg text-white border-transparent shadow-lg scale-110' : 'text-slate-500 border-white/5 hover:bg-black/20 hover:border-white/10'} ${className}`}>{icon}</button>
);

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const aistudio = (window as any).aistudio;
    if (aistudio && !(await aistudio.hasSelectedApiKey())) { await aistudio.openSelectKey(); onLogin(); }
    else { setTimeout(onLogin, 1200); }
  };
  return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center space-y-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-1000">
        <div className="space-y-4">
          <IUBDITLogo size={80} />
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">IUB Smart Assistant</h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.5em]">Neural Authentication Node</p>
          <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Engineer: Mr. Zeeshan Javed</p>
             <div className="flex flex-col items-center gap-1">
                <p className="text-[8px] font-bold text-sky-500 uppercase tracking-widest">DIT IUB</p>
                <div className="space-y-0.5 mt-1">
                   <p className="text-[9px] text-slate-500 font-medium lowercase flex items-center justify-center gap-1.5"><Mail size={10} className="text-slate-600" /> zeeshan.javed@iub.edu.pk</p>
                   <p className="text-[9px] text-slate-500 font-medium lowercase flex items-center justify-center gap-1.5"><Mail size={10} className="text-slate-600" /> zeeshanjaved6767@gmail.com</p>
                   <p className="text-[9px] text-slate-500 font-medium lowercase flex items-center justify-center gap-1.5"><Phone size={10} className="text-slate-600" /> +923042012500</p>
                </div>
             </div>
          </div>
        </div>
        <button onClick={handleLogin} disabled={loading} className="w-full py-5 theme-primary-bg rounded-2xl text-white font-black uppercase text-[11px] tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:opacity-90 active:scale-95 transition-all">{loading ? 'Synchronizing Node...' : 'Establish System Link'}</button>
      </div>
    </div>
  );
};

export default App;
