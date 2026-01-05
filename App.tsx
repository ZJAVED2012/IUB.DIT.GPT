
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
  Cpu as CpuIcon, Bolt, Radio, MonitorSmartphone, PlusCircle, Trash, Laptop, Printer, PhoneForwarded, Eye, Filter, History, Radar, Eraser
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

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="p-1.5 hover:bg-white/10 rounded-md transition-all text-slate-400 hover:text-sky-400"
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
    </button>
  );
};

const STYLE_PRESETS = [
  { id: 'photorealistic', name: 'Photorealistic', description: 'Hyper-realistic, high detail, 8k, cinematic lighting, professional photography.' },
  { id: 'blueprint', name: 'Blueprint', description: 'Technical architectural drawing, cyanotype style, white ink on blue background, precise lines, CAD documentation.' },
  { id: 'isometric', name: 'Isometric 3D', description: 'Clean isometric 3D render, vibrant colors, soft ambient occlusion shadows, stylized network equipment.' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon accents, futuristic technology, rainy environment, high contrast, pink and teal lighting.' },
  { id: 'minimalist', name: 'Minimalist', description: 'Flat vector design, simple geometric shapes, clean aesthetics, pastel corporate palette.' },
  { id: 'oil-painting', name: 'Oil Painting', description: 'Classic fine art style, visible heavy brushstrokes, rich textures, impasto technique.' },
  { id: 'sketch', name: 'Pencil Sketch', description: 'Hand-drawn pencil sketch, graphite texture, cross-hatching, artistic shading on paper.' },
  { id: 'pop-art', name: 'Pop Art', description: 'Andy Warhol style, bold saturated colors, halftone patterns, high contrast, vibrant commercial art.' },
  { id: 'claymation', name: 'Claymation', description: 'Clay model style, hand-sculpted look, tactile surfaces, stop-motion animation aesthetic.' },
  { id: 'origami', name: 'Origami', description: 'Paper fold art, high detail sharp creases, clean white and colored paper textures.' },
  { id: 'retro-futurism', name: 'Retro Futurism', description: '1950s atomic age vision of the future, sleek chrome, rocket ship curves, vintage sci-fi colors.' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft delicate watercolor paint, wet-on-wet technique, beautiful pigment bleeds, hand-painted feel.' }
];

const ASPECT_RATIO_OPTIONS: { label: string; value: AspectRatio; icon: any }[] = [
  { label: '1:1 Square', value: '1:1', icon: <Square size={14} /> },
  { label: '2:3 Classic', value: '2:3', icon: <Smartphone size={14} /> },
  { label: '3:2 Landscape', value: '3:2', icon: <Monitor size={14} /> },
  { label: '3:4 Portrait', value: '3:4', icon: <Smartphone size={14} className="scale-y-110" /> },
  { label: '4:3 Standard', value: '4:3', icon: <Monitor size={14} className="scale-x-90" /> },
  { label: '9:16 Social', value: '9:16', icon: <Smartphone size={14} className="scale-y-125" /> },
  { label: '16:9 Widescreen', value: '16:9', icon: <Monitor size={14} className="scale-x-110" /> },
  { label: '21:9 Ultrawide', value: '21:9', icon: <Monitor size={14} className="scale-x-150" /> },
];

const RESOLUTION_OPTIONS: { label: string; value: ImageSize; desc: string }[] = [
  { label: '1K', value: '1K', desc: 'Standard Quality' },
  { label: '2K', value: '2K', desc: 'High Detail' },
  { label: '4K', value: '4K', desc: 'Ultra High Fidelity' },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Device State
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('iub_dit_devices_v1');
    return saved ? JSON.parse(saved) : MOCK_DEVICES;
  });

  useEffect(() => {
    localStorage.setItem('iub_dit_devices_v1', JSON.stringify(devices));
  }, [devices]);

  // Theme Management
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
    localStorage.setItem('iub_dit_theme_v1', JSON.stringify(theme));
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
  }, [theme]);
  
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

  const [searchQuery, setSearchQuery] = useState('');
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);

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
    localStorage.setItem('iub_dit_chat_history_v2', JSON.stringify(messages));
    if (!searchQuery) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, searchQuery]);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage && !selectedVideo) return;
    if (isTyping) return;

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
        errorMessage = "SYSTEM OVERLOAD: Gemini API quota exceeded for the current neural cycle. Please wait for at least 60 seconds before retrying, or switch to a paid API key if available.";
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

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
  };

  const handleClearData = () => {
    const confirmed = window.confirm("CRITICAL SYSTEM RESET: Purge all neural logs, device assets, and session caches? This will restore the system to factory default.");
    if (confirmed) {
      // Robust cleanup of all browser storage
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clearing indexedDB if any (though not explicitly used, good practice)
        if (window.indexedDB) {
          window.indexedDB.databases().then(dbs => {
            dbs.forEach(db => {
              if (db.name) window.indexedDB.deleteDatabase(db.name);
            });
          });
        }
        
        // Hard reload ensuring no cache is used
        window.location.reload();
      } catch (e) {
        console.error("Cleanup failed:", e);
        // Fallback reload
        window.location.href = window.location.href.split('#')[0];
      }
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

  const generateMockEvents = () => {
    const messagesPool = ["Neural gateway initialized.", "Authorized access attempt.", "Uplink latency exceeding standard.", "Security patch deployed."];
    const newEvents = Array.from({ length: 8 }, (_, i) => ({
      id: `evt-${Date.now()}-${i}`,
      timestamp: new Date(),
      message: messagesPool[Math.floor(Math.random() * messagesPool.length)],
      type: 'info' as const
    }));
    setSystemEvents(newEvents);
  };

  const playTTS = async (text: string) => {
    try {
      const base64 = await gemini.generateSpeech(text);
      if (base64) {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decodeBase64(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) { console.error(e); }
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
          <SidebarItem icon={<Bell size={16} />} label="Alerts" active={activeView === AppView.SYSTEM_EVENTS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SYSTEM_EVENTS)} />
          <SidebarItem icon={<LayoutDashboard size={16} />} label="Inventory" active={activeView === AppView.INVENTORY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<Terminal size={16} />} label="CLI Vault" active={activeView === AppView.CONFIG_LIBRARY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CONFIG_LIBRARY)} />
          <SidebarItem icon={<ShieldCheck size={16} />} label="Security" active={activeView === AppView.SECURITY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SECURITY)} />
          <SidebarItem icon={<Settings size={16} />} label="Theme Engine" active={activeView === AppView.SETTINGS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SETTINGS)} />
          
          <div className={`pt-4 mt-4 border-t ${theme.mode === 'light' ? 'border-slate-200' : 'border-white/5'} space-y-1`}>
            <SidebarItem icon={<Download size={16} />} label="Export Logs" active={false} collapsed={!isSidebarOpen} onClick={handleExportData} />
            <SidebarItem icon={<Trash2 size={16} className="text-red-400" />} label="Clear Cache" active={false} collapsed={!isSidebarOpen} onClick={handleClearData} />
          </div>
        </nav>
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
          <div className="flex items-center gap-3">
             <button onClick={() => setIsLoggedIn(false)} className="text-[9px] font-bold uppercase text-slate-500 hover:text-red-400 transition-colors">Exit</button>
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
                          <div className={`text-sm leading-normal whitespace-pre-wrap ${hasUrdu ? 'urdu-text' : ''}`}>{msg.content}</div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className={`mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-2 ${hasUrdu ? 'justify-end' : ''}`}>
                              {msg.sources.map((s, i) => (
                                <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold hover:bg-white/10">
                                  <ExternalLink size={10} className="text-sky-400" /> {s.title}
                                </a>
                              ))}
                            </div>
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
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
                  <div className={`${theme.mode === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0f172a] border-white/10 shadow-xl'} border rounded-2xl p-2 flex items-center gap-1`}>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:theme-primary-text"><Paperclip size={18} /></button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
                    <button onClick={transcribeAudio} className={`p-2 ${isRecording ? 'text-red-500' : 'text-slate-500'}`}><Mic size={18} /></button>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Neural command terminal..." className="flex-1 bg-transparent border-none outline-none text-sm p-2" />
                    <div className="flex gap-1">
                      <ToolToggle active={useSearch} onClick={() => { setUseSearch(!useSearch); setUseMaps(false); setUseFast(false); }} icon={<Globe size={14} />} title="Search Grounding" />
                      <ToolToggle active={useMaps} onClick={() => { setUseMaps(!useMaps); setUseSearch(false); setUseFast(false); }} icon={<MapPin size={14} />} title="Maps Grounding" />
                      <ToolToggle active={useThinking} onClick={() => setUseThinking(!useThinking)} icon={<BrainCircuit size={14} />} title="Thinking Mode" />
                      <ToolToggle active={useFast} onClick={() => { setUseFast(!useFast); setUseSearch(false); setUseMaps(false); }} icon={<Bolt size={14} />} title="Fast Response" />
                      <button onClick={handleSendMessage} className="p-2 theme-primary-bg rounded-lg text-white shadow-md"><Send size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === AppView.MEDIA_LAB && <MediaLabView theme={theme} />}
            {activeView === AppView.SETTINGS && <SettingsView theme={theme} onThemeChange={setTheme} />}
            {activeView === AppView.LIVE && <LiveSessionView />}
            {activeView === AppView.SYSTEM_EVENTS && <SystemEventsView events={systemEvents} onGenerate={generateMockEvents} />}
            {activeView === AppView.INVENTORY && <InventoryView devices={devices} />}
            {activeView === AppView.DEVICE_MANAGEMENT && <DeviceManagementView devices={devices} onUpdate={handleUpdateDevice} />}
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

  const handleAction = async () => {
    if (!prompt && mode !== 'edit') return;
    if (mode === 'edit' && !imgRef) return;
    setBusy(true); setMediaUrl(null);
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
      setStatus(e?.message === 'RESOURCE_EXHAUSTED' ? 'Neural Overload: Quota Exceeded.' : 'Fault Detected.'); 
    }
    finally { setBusy(false); }
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Media Lab</h2>
          <div className="p-2 theme-primary-bg rounded-lg text-white"><Sparkles size={18} /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6 p-6 rounded-2xl border bg-slate-900/40 border-white/5">
            <div className="flex gap-1 p-1 bg-black/20 rounded-xl w-fit">
              <button onClick={() => setMode('generate')} className={`px-4 py-2 rounded-lg text-[10px] uppercase font-bold transition-all ${mode === 'generate' ? 'theme-primary-bg text-white' : 'text-slate-500 hover:text-slate-300'}`}>Generate</button>
              <button onClick={() => setMode('edit')} className={`px-4 py-2 rounded-lg text-[10px] uppercase font-bold transition-all ${mode === 'edit' ? 'theme-primary-bg text-white' : 'text-slate-500 hover:text-slate-300'}`}>Edit</button>
              <button onClick={() => setMode('video')} className={`px-4 py-2 rounded-lg text-[10px] uppercase font-bold transition-all ${mode === 'video' ? 'theme-primary-bg text-white' : 'text-slate-500 hover:text-slate-300'}`}>Video</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Framing Grid</label>
                <div className="grid grid-cols-4 gap-1">
                  {ASPECT_RATIO_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setAspect(opt.value)} className={`p-2 rounded-lg border text-[8px] font-bold transition-all ${aspect === opt.value ? 'theme-primary-border theme-primary-text bg-current-10' : 'border-white/5 text-slate-500 hover:border-white/20'}`}>{opt.value}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Synthesis Fidelity</label>
                <div className="grid grid-cols-3 gap-1">
                  {RESOLUTION_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setSize(opt.value)} className={`p-2 rounded-lg border text-[8px] font-bold transition-all ${size === opt.value ? 'theme-primary-border theme-primary-text bg-current-10' : 'border-white/5 text-slate-500 hover:border-white/20'}`}>{opt.value}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Instruction Set</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={mode === 'edit' ? "e.g. Add a retro filter / Remove background person" : "Neural synthesis prompt..."} className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:theme-primary-border outline-none transition-all" />
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button onClick={() => document.getElementById('media-ref-upl')?.click()} className="text-[10px] font-bold uppercase theme-primary-text flex items-center gap-2 hover:underline transition-all"><UploadCloud size={16} /> {imgRef ? 'Asset Buffered' : 'Upload Reference Asset'}</button>
              <input type="file" id="media-ref-upl" hidden accept="image/*" onChange={e => {
                const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImgRef(ev.target?.result as string); r.readAsDataURL(f); }
              }} />
              <button onClick={handleAction} disabled={busy} className="px-8 py-3 theme-primary-bg rounded-xl text-[10px] font-bold uppercase text-white shadow-lg active:scale-95 transition-all">{busy ? 'Synthesis In Progress...' : 'Initialize Pipeline'}</button>
            </div>
            {status && <p className="text-[10px] theme-primary-text font-bold uppercase tracking-widest animate-pulse">{status}</p>}
          </div>
          
          <div className="lg:col-span-5 border border-white/5 rounded-2xl bg-black/20 flex flex-col items-center justify-center p-6 min-h-[450px] relative overflow-hidden shadow-inner">
            {mediaUrl ? (
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  {mode === 'video' ? <video src={mediaUrl} controls autoPlay loop className="max-w-full h-auto" /> : <img src={mediaUrl} className="max-w-full h-auto" />}
                </div>
                <a href={mediaUrl} download className="flex items-center gap-2 px-8 py-3 theme-primary-bg rounded-xl text-[10px] font-bold uppercase text-white shadow-xl hover:opacity-90 transition-all"><Download size={16} /> Export Master Asset</a>
              </div>
            ) : (
              <div className="text-center opacity-20 space-y-4">
                <Binary size={64} className="mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Awaiting Uplink</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DeviceManagementView: React.FC<{ devices: Device[], onUpdate: (d: Device) => void }> = ({ devices, onUpdate }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDevice) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdate({ ...selectedDevice, image: result });
      setSelectedDevice({ ...selectedDevice, image: result });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSchematic = async () => {
    if (!selectedDevice) return;
    setIsGenerating(true);
    try {
      const prompt = `Highly detailed technical product schematic of a ${selectedDevice.brand} ${selectedDevice.model} ${selectedDevice.type}, industrial clean background, 8k resolution, professional photography style.`;
      const url = await gemini.generateImage(prompt, { aspectRatio: '1:1', imageSize: '1K' });
      if (url) {
        onUpdate({ ...selectedDevice, image: url });
        setSelectedDevice({ ...selectedDevice, image: url });
      }
    } catch (e) {
      console.error("Schematic generation failed.", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mesh Node Control</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-1">Real-time hardware gateway and asset visualization.</p>
        </div>
        <Radio size={24} className="theme-primary-text animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Device List */}
        <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
          {devices.map(d => (
            <button 
              key={d.id}
              onClick={() => setSelectedDevice(d)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group ${
                selectedDevice?.id === d.id 
                ? 'theme-primary-border bg-current-10 shadow-lg' 
                : 'border-white/5 bg-slate-900/40 hover:border-white/20'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${selectedDevice?.id === d.id ? 'theme-primary-bg text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                <Server size={18} />
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-bold truncate ${selectedDevice?.id === d.id ? 'theme-primary-text' : 'text-slate-200'}`}>{d.name}</p>
                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">{d.brand} • {d.type}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Details and Asset Manager */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-3xl p-8 overflow-y-auto custom-scrollbar relative">
          {selectedDevice ? (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Image Section */}
                <div className="w-full md:w-64 space-y-4">
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center overflow-hidden relative group">
                    {selectedDevice.image ? (
                      <img src={selectedDevice.image} className="w-full h-full object-cover" alt="Node Asset" />
                    ) : (
                      <ImageIcon size={48} className="text-slate-700 opacity-50" />
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <Loader2 size={24} className="animate-spin theme-primary-text" />
                        <span className="text-[8px] font-black uppercase theme-primary-text tracking-widest">Synthesizing...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      <UploadCloud size={14} /> Upload Asset
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                    <button 
                      disabled={isGenerating}
                      onClick={handleGenerateSchematic}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 theme-primary-bg hover:opacity-90 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      <Wand2 size={14} /> Generate Schematic
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <DeviceField label="Host Logic Name" value={selectedDevice.name} />
                  <DeviceField label="Asset Category" value={selectedDevice.type} />
                  <DeviceField label="Logic IP" value={selectedDevice.ip} mono />
                  <DeviceField label="Mesh Status" value={selectedDevice.status} highlight={selectedDevice.status === 'Online'} />
                  <DeviceField label="Hardware Vendor" value={selectedDevice.brand} />
                  <DeviceField label="Model Sequence" value={selectedDevice.model} />
                  <DeviceField label="Physical Cell" value={selectedDevice.location} />
                  <DeviceField label="Hardware ID" value={selectedDevice.macAddress} mono />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Technical Specifications</h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-5 rounded-2xl border border-white/5">
                  {selectedDevice.specs}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
              <Layers2 size={64} className="theme-primary-text" />
              <div className="space-y-1">
                <h3 className="text-xl font-bold uppercase tracking-tighter">Awaiting Link</h3>
                <p className="text-[10px] uppercase tracking-widest">Select a logical node from the mesh to begin recalibration.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeviceField: React.FC<{ label: string, value: string, mono?: boolean, highlight?: boolean }> = ({ label, value, mono, highlight }) => (
  <div className="space-y-1.5">
    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{label}</p>
    <p className={`text-sm font-semibold tracking-tight ${mono ? 'mono text-sky-400' : 'text-slate-200'} ${highlight ? 'text-emerald-400' : ''}`}>
      {value}
    </p>
  </div>
);

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

const SystemEventsView: React.FC<{ events: SystemEvent[], onGenerate: () => void }> = ({ events, onGenerate }) => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-500">
    <div className="flex justify-between items-end mb-10">
      <div><h2 className="text-2xl font-bold tracking-tight">Sentinel Telemetry</h2><p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Real-time Node Monitoring</p></div>
      <button onClick={onGenerate} className="px-6 py-2.5 theme-primary-bg rounded-xl text-[10px] font-bold uppercase text-white shadow-xl active:scale-95 transition-all">Refresh Mesh Status</button>
    </div>
    <div className="space-y-4 pb-20">
      {events.map(e => (
        <div key={e.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex gap-5 hover:border-white/10 transition-all shadow-sm group">
          <div className="p-3 bg-current-5 rounded-xl theme-primary-text group-hover:scale-110 transition-transform"><Info size={20} /></div>
          <div><p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{e.timestamp.toLocaleTimeString()}</p><p className="text-sm font-medium tracking-tight text-slate-200">{e.message}</p></div>
        </div>
      ))}
    </div>
  </div>
);

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

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void }> = ({ icon, label, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-semibold transition-all group ${active ? 'theme-primary-bg text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:bg-black/20 hover:theme-primary-text'}`}>{icon}{!collapsed && <span className="truncate tracking-tight">{label}</span>}</button>
);

const ToolToggle: React.FC<{ active: boolean, onClick: () => void, icon: any, title?: string }> = ({ active, onClick, icon, title }) => (
  <button onClick={onClick} title={title} className={`p-2.5 rounded-xl border transition-all ${active ? 'theme-primary-bg text-white border-transparent shadow-lg scale-110' : 'text-slate-500 border-white/5 hover:bg-black/20 hover:border-white/10'}`}>{icon}</button>
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
        </div>
        <button onClick={handleLogin} disabled={loading} className="w-full py-5 theme-primary-bg rounded-2xl text-white font-black uppercase text-[11px] tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:opacity-90 active:scale-95 transition-all">{loading ? 'Synchronizing Node...' : 'Establish System Link'}</button>
      </div>
    </div>
  );
};

export default App;
