
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
  Cpu as CpuIcon, Bolt
} from 'lucide-react';
import { AppView, Message, Device, AspectRatio, ImageSize, Persona, SystemEvent, ThemeConfig } from './types';
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
  { label: '1K', value: '1K', desc: 'Standard HD Quality' },
  { label: '2K', value: '2K', desc: 'Professional High Detail' },
  { label: '4K', value: '4K', desc: 'Ultra High Fidelity' },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Theme Management
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('iub_dit_theme_v1');
    return saved ? JSON.parse(saved) : {
      mode: 'dark',
      primaryColor: '#0ea5e9', // Default Sky
      secondaryColor: '#64748b', // Slate
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
    content: "Neural link established. Welcome, Mr. Zeeshan Javed. I am your specialized AI assistant for the IUB Directorate of IT. How can we optimize the infrastructure today?", 
    timestamp: new Date() 
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('iub_dit_chat_history_v2');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [INITIAL_MESSAGE];
  });

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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Neural uplink synchronization fault. Please verify parameters and retry.", 
        timestamp: new Date() 
      }]);
    } finally { setIsTyping(false); }
  };

  const handleClearData = () => {
    if (window.confirm("CRITICAL SYSTEM RESET: This will purge all neural logs, reset interface preferences, and terminate the current session. Proceed with purge?")) {
      // 1. Wipe all localStorage keys
      localStorage.removeItem('iub_dit_chat_history_v2');
      localStorage.removeItem('iub_dit_theme_v1');
      
      // 2. Reset critical states
      setMessages([INITIAL_MESSAGE]);
      setSystemEvents([]);
      setSelectedImage(null);
      setSelectedVideo(null);
      
      // 3. Force Log Out to re-initialize environment
      setIsLoggedIn(false);
      setActiveView(AppView.CHAT);
      
      // 4. Optional: Reload to ensure all service workers and buffers are cleared
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const logText = messages.map(m => {
      const time = m.timestamp.toLocaleString();
      const role = m.role === 'assistant' ? 'DIT_AI' : 'LEAD_ENGINEER';
      return `[${time}] ${role}: ${m.content}\n${m.image ? '[IMAGE_ATTACHED]\n' : ''}${m.video ? '[VIDEO_ATTACHED]\n' : ''}\n`;
    }).join('---\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IUB_DIT_NeuralLog_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMockEvents = () => {
    const types: Array<'info' | 'warning' | 'error' | 'success'> = ['info', 'warning', 'error', 'success'];
    const messagesPool = [
      "Neural gateway initialized for Lead Engineer Zeeshan Javed.",
      "Periodic mesh scan completed. 0 threats detected.",
      "Unauthorized access attempt blocked at Edge-Firewall.",
      "Uplink latency exceeding standard thresholds at Node-02.",
      "Core switch IUB-DC-Core-01 firmware update available.",
      "Backup sequence successful for Student Records database.",
      "Ambient temperature in Rack A1 normalized.",
      "SSL certificate for portal.iub.edu.pk renewed.",
      "Power redundancy failure detected in Secondary PSU of Firewall.",
      "DNS resolution latency improved by 15ms after cache flush.",
      "BGP session with Upstream ISP re-established.",
      "Security patch KB882103 deployed to all virtual clusters."
    ];

    const newEvents = Array.from({ length: 8 }, (_, i) => ({
      id: `evt-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
      message: messagesPool[Math.floor(Math.random() * messagesPool.length)],
      type: types[Math.floor(Math.random() * types.length)]
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
    } catch (e) { console.error("Speech generation failure.", e); }
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
          if (text) {
            setInput(prev => (prev ? prev + ' ' : '') + text);
          }
          setIsRecording(false);
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 4000);
    } catch (e) { 
      console.error("Transcription service offline.", e); 
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (file.type.startsWith('image/')) {
        setSelectedImage(result);
        setSelectedVideo(null);
      } else if (file.type.startsWith('video/')) {
        setSelectedVideo(result);
        setSelectedImage(null);
      }
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
              <h1 className={`font-bold text-lg tracking-tight ${theme.mode === 'light' ? 'text-slate-900' : 'text-white'}`}>IUB.<span className="theme-primary-text">DIT</span></h1>
              <p className={`text-[8px] theme-primary-text opacity-60 font-black uppercase tracking-widest`}>Neural Terminal v5.2</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<MessageSquare size={16} />} label="Chat Hub" active={activeView === AppView.CHAT} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CHAT)} />
          <SidebarItem icon={<Video size={16} />} label="Media Lab" active={activeView === AppView.MEDIA_LAB} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.MEDIA_LAB)} />
          <SidebarItem icon={<Phone size={16} />} label="Voice Proxy" active={activeView === AppView.LIVE} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.LIVE)} />
          <SidebarItem icon={<Bell size={16} />} label="Alerts" active={activeView === AppView.SYSTEM_EVENTS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SYSTEM_EVENTS)} />
          <SidebarItem icon={<LayoutDashboard size={16} />} label="Assets" active={activeView === AppView.INVENTORY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<Terminal size={16} />} label="CLI Vault" active={activeView === AppView.CONFIG_LIBRARY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CONFIG_LIBRARY)} />
          <SidebarItem icon={<ShieldCheck size={16} />} label="Security" active={activeView === AppView.SECURITY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SECURITY)} />
          <SidebarItem icon={<DollarSign size={16} />} label="Pricing" active={activeView === AppView.PRICING} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.PRICING)} />
          <SidebarItem icon={<Settings size={16} />} label="Theme Engine" active={activeView === AppView.SETTINGS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SETTINGS)} />
          
          <div className={`pt-4 mt-4 border-t ${theme.mode === 'light' ? 'border-slate-200' : 'border-white/5'} space-y-1`}>
            {isSidebarOpen && <p className="px-3 mb-2 text-[7px] font-black uppercase tracking-widest text-slate-500">Maintenance</p>}
            <SidebarItem icon={<Download size={16} />} label="Export Logs" active={false} collapsed={!isSidebarOpen} onClick={handleExportData} />
            <SidebarItem icon={<Trash2 size={16} className="text-red-400 group-hover:text-red-300" />} label="Clear Cache" active={false} collapsed={!isSidebarOpen} onClick={handleClearData} />
          </div>
        </nav>

        <div className={`p-3 border-t ${theme.mode === 'light' ? 'border-slate-200' : 'border-white/5'} cursor-pointer hover:bg-white/5 transition-colors`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 shrink-0 flex items-center justify-center theme-primary-text">
                <UserCircle size={20} />
             </div>
             {isSidebarOpen && (
               <div className="overflow-hidden">
                 <p className={`text-[11px] font-bold ${theme.mode === 'light' ? 'text-slate-900' : 'text-white'} truncate`}>Zeeshan Javed</p>
                 <p className="text-[8px] text-slate-500 uppercase tracking-tighter">AI Lead Engineer</p>
               </div>
             )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className={`h-14 border-b ${theme.mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617] border-white/5'} flex items-center justify-between px-6 sticky top-0 z-30`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 hover:bg-black/5 rounded-lg text-slate-400 transition-colors`}><Menu size={16} /></button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1 h-1 rounded-full theme-primary-bg animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Lead Engineer node: Zeeshan Javed</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 theme-primary-text bg-current-10 px-3 py-1 rounded-md border border-current-10`} style={{ backgroundColor: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}20` }}>
              <Activity size={12} className="animate-bounce" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Active Link</span>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="text-[9px] font-bold uppercase text-slate-500 hover:text-red-400 transition-colors">Exit</button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-hidden">
            {activeView === AppView.CHAT && (
              <div className="flex flex-col h-full max-w-4xl mx-auto px-4 relative">
                <div className="flex-1 overflow-y-auto pt-6 space-y-6 custom-scrollbar pb-32">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg group/msg ${
                        msg.role === 'user' 
                        ? 'theme-primary-bg text-white' 
                        : theme.mode === 'light' ? 'bg-white border border-slate-200 text-slate-900' : 'bg-slate-900 border border-white/5 text-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2 text-[8px] font-bold uppercase tracking-widest opacity-50">
                          <span className="flex items-center gap-1.5">
                            {msg.role === 'assistant' ? <><BrainCircuit size={10} /> DIT Neural Node</> : <><UserCircle size={10} /> Lead Engineer</>}
                          </span>
                          <div className="flex items-center gap-2">
                             <span>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             <div className="flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                               <CopyButton text={msg.content} />
                               {msg.role === 'assistant' && (
                                 <button onClick={() => playTTS(msg.content)} className="p-1.5 hover:bg-black/10 rounded-md text-slate-400 hover:text-sky-400 transition-colors"><Volume2 size={12} /></button>
                               )}
                             </div>
                          </div>
                        </div>
                        <div className="text-sm leading-normal whitespace-pre-wrap">{msg.content}</div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.sources.map((s, i) => (
                              <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-[9px] font-bold hover:bg-white/20 transition-colors">
                                <ExternalLink size={10} /> {s.title}
                              </a>
                            ))}
                          </div>
                        )}
                        {msg.image && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-black/10">
                            <img src={msg.image} className="w-full h-auto object-cover" alt="Neural Analysis Output" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                  <div className={`${theme.mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'} border rounded-2xl p-2 shadow-xl`}>
                    {(selectedImage || selectedVideo) && (
                      <div className="mx-1 mb-2 flex items-center gap-2 p-2 bg-black/5 rounded-lg">
                        <div className="w-10 h-10 rounded-md border border-sky-500/30 overflow-hidden bg-black flex items-center justify-center">
                          {selectedImage ? (
                            <img src={selectedImage} className="w-full h-full object-cover" alt="Asset Ref" />
                          ) : (
                            <Film className="theme-primary-text" size={16} />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[9px] font-bold truncate">Buffered Asset Ready for Analysis</p>
                        </div>
                        <button onClick={() => { setSelectedImage(null); setSelectedVideo(null); }} className="p-1 hover:text-red-400 text-slate-500 transition-colors"><X size={14} /></button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:theme-primary-text transition-colors"><Paperclip size={18} /></button>
                      <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
                      <button onClick={transcribeAudio} className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:theme-primary-text'}`}><Mic size={18} /></button>
                      
                      <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                        placeholder="Neural prompt or command terminal..." 
                        className={`flex-1 bg-transparent border-none outline-none text-[13px] ${theme.mode === 'light' ? 'text-slate-900' : 'text-white'} py-2 placeholder:text-slate-400 px-2`}
                      />
                      
                      <div className="flex items-center gap-1 pr-1">
                        <ToolToggle active={useSearch} onClick={() => { setUseSearch(!useSearch); setUseMaps(false); setUseFast(false); }} icon={<Globe size={14} />} title="Search Grounding" />
                        <ToolToggle active={useMaps} onClick={() => { setUseMaps(!useMaps); setUseSearch(false); setUseFast(false); }} icon={<MapPin size={14} />} title="Maps Grounding" />
                        <ToolToggle active={useThinking} onClick={() => setUseThinking(!useThinking)} icon={<BrainCircuit size={14} />} title="High-Intensity Thinking" />
                        <ToolToggle active={useFast} onClick={() => { setUseFast(!useFast); setUseSearch(false); setUseMaps(false); }} icon={<Bolt size={14} />} title="Fast Response (Lite)" />
                        <button onClick={handleSendMessage} className="p-2 theme-primary-bg hover:opacity-90 rounded-lg text-white transition-all shadow-md">
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === AppView.SETTINGS && <SettingsView theme={theme} onThemeChange={setTheme} />}
            {activeView === AppView.MEDIA_LAB && <MediaLabView theme={theme} />}
            {activeView === AppView.LIVE && <LiveSessionView />}
            {activeView === AppView.SYSTEM_EVENTS && <SystemEventsView events={systemEvents} onGenerate={generateMockEvents} />}
            {activeView === AppView.INVENTORY && <InventoryView devices={MOCK_DEVICES} />}
            {activeView === AppView.CONFIG_LIBRARY && <ConfigView configs={CONFIG_LIBRARY} />}
            {activeView === AppView.SECURITY && <SecurityView />}
            {activeView === AppView.PRICING && <PricingView />}
          </div>

          <footer className={`h-8 border-t ${theme.mode === 'light' ? 'border-slate-200 bg-slate-50' : 'border-white/5 bg-black/20'} flex items-center justify-between px-6 text-[8px] font-bold uppercase tracking-widest text-slate-500`}>
             <div><Copyright size={8} className="inline mr-1" /> {new Date().getFullYear()} Directorate of IT, IUB</div>
             <div className={`${theme.mode === 'light' ? 'text-slate-600' : 'text-white'}`}>IUB.DIT.GPT v5.2 (PRO) | Designed & Developed by AI System Lead Engineer</div>
          </footer>
        </div>
      </main>
    </div>
  );
};

const SettingsView: React.FC<{ theme: ThemeConfig, onThemeChange: (t: ThemeConfig) => void }> = ({ theme, onThemeChange }) => {
  const primaryColors = [
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Slate', value: '#475569' }
  ];

  const fonts = [
    { name: 'Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
    { name: 'Inter UI', value: "'Inter', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Monospace', value: "'JetBrains Mono', monospace" }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-2xl mx-auto space-y-10">
        <div>
          <h2 className={`text-2xl font-bold ${theme.mode === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>Theme Engine</h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Interface Customization Hub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Sun size={12} /> Appearance Mode</label>
              <div className={`p-1 rounded-xl flex gap-1 ${theme.mode === 'light' ? 'bg-slate-200' : 'bg-slate-900 border border-white/5'}`}>
                <button 
                  onClick={() => onThemeChange({ ...theme, mode: 'light' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${theme.mode === 'light' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-white'}`}
                >
                  <Sun size={14} /> Light
                </button>
                <button 
                  onClick={() => onThemeChange({ ...theme, mode: 'dark' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${theme.mode === 'dark' ? 'theme-primary-bg text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
                >
                  <Moon size={14} /> Dark
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><TypeIcon size={12} /> Typography</label>
              <div className="grid grid-cols-1 gap-2">
                {fonts.map(font => (
                  <button 
                    key={font.value}
                    onClick={() => onThemeChange({ ...theme, fontFamily: font.value })}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${theme.fontFamily === font.value ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-slate-200 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10'}`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Palette size={12} /> Primary Accent</label>
            <div className="grid grid-cols-2 gap-3">
              {primaryColors.map(color => (
                <button 
                  key={color.value}
                  onClick={() => onThemeChange({ ...theme, primaryColor: color.value })}
                  className={`group relative overflow-hidden flex flex-col gap-2 p-3 rounded-2xl border transition-all ${theme.primaryColor === color.value ? 'border-current shadow-lg' : 'border-slate-200 dark:border-white/5'}`}
                  style={{ borderColor: theme.primaryColor === color.value ? color.value : undefined }}
                >
                  <div className="w-full h-12 rounded-lg shadow-inner" style={{ backgroundColor: color.value }}></div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.primaryColor === color.value ? 'text-white' : 'text-slate-500'}`} style={{ color: theme.primaryColor === color.value ? color.value : undefined }}>{color.name}</span>
                  {theme.primaryColor === color.value && <div className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm"><Check size={10} className="text-sky-600" style={{ color: color.value }} /></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaLabView: React.FC<{ theme: ThemeConfig }> = ({ theme }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [stylePreset, setStylePreset] = useState('photorealistic');
  const [imgFile, setImgFile] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [aspect, setAspect] = useState<AspectRatio>('16:9');
  const [size, setSize] = useState<ImageSize>('1K');

  const handleAction = async () => {
    if (!prompt && !imgFile) return;
    setBusy(true); setMediaUrl(null);
    try {
      if (mode === 'image') {
        const synthSteps = ['Synchronizing Latent Noise...', 'Mapping Neural Styles...', 'Refining 4-Cycle Diffusion...', 'Decoding Master Plate...'];
        let step = 0;
        const interval = setInterval(() => {
          if (step < synthSteps.length) setStatus(synthSteps[step++]);
          else clearInterval(interval);
        }, 1200);

        const selectedStyle = STYLE_PRESETS.find(s => s.id === stylePreset);
        const finalPrompt = `${prompt}. Style: ${selectedStyle?.description || ''}. ${negativePrompt ? `Negative constraints: ${negativePrompt}` : ''}`;
        
        const url = await gemini.generateImage(finalPrompt, { aspectRatio: aspect, imageSize: size });
        
        clearInterval(interval);
        if (url) setMediaUrl(url);
      } else {
        setStatus('Initializing Veo 3.1 Temporal Link...');
        // Veo only supports 16:9 or 9:16
        const validAspect = (aspect === '9:16' ? '9:16' : '16:9');
        const url = await gemini.generateVideo(prompt, validAspect, imgFile || undefined, '720p');
        if (url) setMediaUrl(url);
      }
      setStatus('Operational Complete.');
    } catch (e) { setStatus('Synthesis Interface Fault Detected.'); console.error(e); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${theme.mode === 'light' ? 'text-slate-900' : 'text-white'}`}>Media Lab</h2>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">High-Fidelity Neural Synthesis Engine</p>
          </div>
          <Sparkles size={24} className="theme-primary-text" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-7 flex flex-col gap-6 p-6 rounded-2xl border ${theme.mode === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/40 border-white/5'}`}>
            <div className={`flex gap-1 p-1 rounded-xl w-fit ${theme.mode === 'light' ? 'bg-slate-100' : 'bg-black/20'}`}>
              <button onClick={() => setMode('image')} className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'image' ? 'theme-primary-bg text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Image Synthesis</button>
              <button onClick={() => setMode('video')} className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'video' ? 'theme-primary-bg text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Veo Video Gen</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <Box size={12} /> Proportional Framing
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(mode === 'video' ? ASPECT_RATIO_OPTIONS.filter(o => o.value === '16:9' || o.value === '9:16') : ASPECT_RATIO_OPTIONS).map(opt => (
                    <button 
                      key={opt.value}
                      onClick={() => setAspect(opt.value)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${aspect === opt.value ? 'theme-primary-border bg-current-10 theme-primary-text shadow-sm' : 'border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-400'}`}
                    >
                      {opt.icon}
                      <span className="text-[8px] font-bold uppercase">{opt.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'image' && (
                <div className="space-y-3 animate-in fade-in duration-500">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <CpuIcon size={12} /> Neural Fidelity
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {RESOLUTION_OPTIONS.map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => setSize(opt.value)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${size === opt.value ? 'theme-primary-border bg-current-10 theme-primary-text shadow-sm' : 'border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-400'}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] font-bold uppercase">{opt.value} Master Plate</span>
                          <span className="text-[8px] opacity-60 font-medium">{opt.desc}</span>
                        </div>
                        {size === opt.value && <CheckCircle size={12} className="theme-primary-text" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mode === 'image' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <Palette size={12} /> Artistic Matrix
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STYLE_PRESETS.map(style => (
                    <button 
                      key={style.id} 
                      onClick={() => setStylePreset(style.id)}
                      className={`px-2 py-3 rounded-xl text-[9px] font-bold border text-center leading-tight transition-all ${stylePreset === style.id ? 'theme-primary-border bg-current-10 theme-primary-text shadow-sm' : 'border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-400'}`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Synthesis Instruction</label>
              <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)}
                placeholder={mode === 'image' ? "Detailed description of the architectural or hardware master plate..." : "Veo 3.1 Cinematic prompt: An sweeping aerial tour of the IUB campus..."}
                className={`w-full h-28 rounded-xl p-4 text-sm outline-none resize-none transition-all ${theme.mode === 'light' ? 'bg-slate-50 border-slate-200 focus:border-sky-500' : 'bg-black/20 border-white/10 focus:border-sky-500/50'}`}
              />
            </div>

            {mode === 'image' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <SlidersHorizontal size={12} /> Neural Inhibition (Negative Prompt)
                </label>
                <input 
                  value={negativePrompt} 
                  onChange={e => setNegativePrompt(e.target.value)}
                  placeholder="Items to exclude from synthesis (e.g., distortion, text, blur)..."
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${theme.mode === 'light' ? 'bg-slate-50 border-slate-200 focus:border-sky-500' : 'bg-black/20 border-white/10 focus:border-sky-500/50'}`}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
              <button onClick={() => document.getElementById('media-ref-lab')?.click()} className="text-[10px] font-black uppercase tracking-widest theme-primary-text hover:underline flex items-center gap-2 transition-all">
                <UploadCloud size={16} /> {imgFile ? 'Buffered Asset Replaced' : 'Buffer Reference Asset'}
              </button>
              <input type="file" id="media-ref-lab" hidden accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader(); r.onload = (ev) => setImgFile(ev.target?.result as string); r.readAsDataURL(f);
                }
              }} />
              <button 
                onClick={handleAction} 
                disabled={busy || (!prompt && !imgFile)} 
                className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 text-white shadow-xl theme-primary-bg hover:opacity-90 active:scale-95`}
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Initiate Synthesis
              </button>
            </div>
            {busy && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
                   <div className="h-full theme-primary-bg animate-[shimmer_2s_infinite_linear]" style={{ width: '60%' }}></div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] theme-primary-text text-center">{status}</p>
              </div>
            )}
          </div>

          <div className={`lg:col-span-5 flex flex-col rounded-2xl border overflow-hidden ${theme.mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
             <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-current-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latent Buffer Output</h3>
                {mediaUrl && <span className="text-[8px] font-bold theme-primary-text bg-current-10 px-2 py-0.5 rounded uppercase">Uplink Ready</span>}
             </div>
             <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[500px] relative">
               {mediaUrl ? (
                 <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-1000">
                    <div className="relative group/output">
                      <div className="absolute -inset-4 bg-sky-500/10 rounded-[32px] blur-3xl opacity-0 group-hover/output:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
                        {mode === 'image' ? (
                          <img src={mediaUrl} className="max-h-[450px] w-full object-contain" alt="Neural Synthesis Result" />
                        ) : (
                          <video src={mediaUrl} controls autoPlay loop className="max-h-[450px] w-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <a href={mediaUrl} download className="flex items-center gap-3 px-8 py-3 theme-primary-bg hover:opacity-90 rounded-xl text-[11px] font-bold text-white transition-all shadow-xl uppercase tracking-widest active:scale-95">
                        <Download size={16} /> 
                        Export Neural Asset
                      </a>
                      <div className="flex items-center gap-2 px-3 py-1 bg-current-10 rounded-full theme-primary-text border border-current-10">
                        <CpuIcon size={10} />
                        <span className="text-[9px] font-bold uppercase">{mode === 'image' ? `${size} Fidelity Plate` : 'Veo 3.1 Stream'}</span>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="text-center space-y-6 max-w-xs opacity-30">
                    <div className="relative inline-block">
                      <Binary size={64} className="mx-auto text-slate-400" />
                      {busy && <div className="absolute inset-0 theme-primary-text animate-ping"><Binary size={64} /></div>}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2">Awaiting Neural Link</p>
                      <p className="text-[9px] leading-relaxed font-medium">System is idle. Initiate synthesis instruction to generate proprietary DIT media plates.</p>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveSessionView: React.FC = () => {
  const [active, setActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const sessionPromise = gemini.connectLive({
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for(let i=0; i<inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
          setActive(true);
        },
        onmessage: async (m) => {
          const interrupted = m.serverContent?.interrupted;
          if (interrupted) {
            sourcesRef.current.forEach(s => {
              try { s.stop(); } catch(err) {}
            });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
          const base64 = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64 && audioCtxRef.current) {
            const buf = await decodeAudioData(decodeBase64(base64), audioCtxRef.current, 24000, 1);
            const src = audioCtxRef.current.createBufferSource();
            src.buffer = buf;
            src.connect(audioCtxRef.current.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
            src.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buf.duration;
            sourcesRef.current.add(src);
            src.onended = () => sourcesRef.current.delete(src);
          }
        },
        onerror: (e) => console.error("Neural link error.", e),
        onclose: () => setActive(false)
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { console.error("Voice Proxy Gateway Error", e); }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in duration-1000">
      <div className={`w-32 h-32 border rounded-full flex items-center justify-center mb-8 transition-all duration-700 ${active ? 'theme-primary-border bg-current-10 shadow-lg' : 'border-white/10'}`}>
        {active ? <Phone size={40} className="theme-primary-text animate-pulse" /> : <PhoneOff size={40} className="text-slate-500" />}
      </div>
      <h2 className="text-2xl font-bold mb-2">Voice Proxy Gateway</h2>
      <p className="text-slate-500 text-[10px] mb-8 font-medium uppercase tracking-[0.3em]">Real-time bi-directional neural stream active</p>
      <button 
        onClick={active ? stopSession : startSession}
        className={`px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl ${active ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' : 'theme-primary-bg hover:opacity-90 shadow-sky-600/20'} text-white`}
      >
        {active ? 'Terminate Proxy' : 'Initialize Voice Link'}
      </button>
    </div>
  );
};

const SystemEventsView: React.FC<{ events: SystemEvent[], onGenerate: () => void }> = ({ events, onGenerate }) => {
  const [scanning, setScanning] = useState(false);

  const handleRunDiagnostic = () => {
    setScanning(true);
    setTimeout(() => {
      onGenerate();
      setScanning(false);
    }, 1500);
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sentinel Log</h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Real-time Perimeter Defense Matrix</p>
        </div>
        <button 
          onClick={handleRunDiagnostic}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 theme-primary-bg hover:opacity-90 disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg transition-all shadow-lg group"
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />}
          {scanning ? 'Mapping Defense Grid...' : 'Initiate Diagnostic'}
        </button>
      </div>
      <div className="space-y-3 pb-10">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event.id} type={event.type} time={event.timestamp.toLocaleTimeString([], { hour12: false })} msg={event.message} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 text-slate-500">
            <Activity size={48} className="mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No diagnostic telemetry detected. Run sentinel scan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EventCard: React.FC<{type: 'success'|'warning'|'info'|'error', time: string, msg: string}> = ({type, time, msg}) => (
  <div className="bg-current-5 border border-white/5 rounded-xl p-4 flex items-start gap-4 hover:border-white/10 transition-colors group">
    <div className={`p-2 rounded-lg transition-colors ${
      type === 'success' ? 'text-green-500 bg-green-500/5 group-hover:bg-green-500/10' :
      type === 'error' ? 'text-red-500 bg-red-500/5 group-hover:bg-red-500/10' : 
      type === 'warning' ? 'text-orange-500 bg-orange-500/5 group-hover:bg-orange-500/10' : 'theme-primary-text bg-current-5 group-hover:opacity-80'
    }`}>
      {type === 'success' ? <CheckCircle size={16} /> : type === 'warning' ? <AlertTriangle size={16} /> : type === 'error' ? <ShieldAlert size={16} /> : <Info size={16} />}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[8px] font-bold uppercase text-slate-500">{time}</span>
      </div>
      <p className="text-xs font-medium group-hover:opacity-100 transition-colors">{msg}</p>
    </div>
  </div>
);

const InventoryView: React.FC<{ devices: Device[] }> = ({ devices }) => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight">Logical Inventory</h2>
      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Asset Mapping Grid</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map(d => (
        <div key={d.id} className="bg-current-5 border border-white/5 rounded-xl p-4 hover:theme-primary-border transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-current-10 rounded-lg theme-primary-text group-hover:theme-primary-bg group-hover:text-white transition-all"><Server size={18} /></div>
            <div>
              <p className="text-[7px] text-slate-500 font-bold uppercase">{d.type}</p>
              <h3 className="text-sm font-bold">{d.name}</h3>
            </div>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-white/5">
            <div className="flex justify-between text-[10px]"><span className="text-slate-500">IP Link:</span> <span className="theme-primary-text mono">{d.ip}</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-slate-500">Node Status:</span> <span className="text-green-500">{d.status}</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-slate-500">Logical Node:</span> <span className="text-slate-400">{d.location}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ConfigView: React.FC<{ configs: any[] }> = ({ configs }) => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight">Instruction Vault</h2>
      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">DIT Standard Command Repository</p>
    </div>
    <div className="space-y-4">
      {configs.map(c => (
        <div key={c.id} className="bg-current-5 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group/config">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold">{c.title}</h3>
              <span className="text-[8px] uppercase px-2 py-0.5 bg-current-10 theme-primary-text rounded-md border border-current-10">{c.category}</span>
            </div>
            <CopyButton text={c.commands} />
          </div>
          <pre className="bg-black/10 p-4 rounded-lg theme-primary-text mono text-[11px] border border-white/5 overflow-x-auto shadow-inner">{c.commands}</pre>
        </div>
      ))}
    </div>
  </div>
);

const SecurityView: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in-95 duration-700">
    <div className="p-8 bg-red-500/5 rounded-full border border-red-500/10 mb-8">
      <ShieldAlert size={64} className="text-red-500 animate-pulse" />
    </div>
    <h2 className="text-2xl font-bold mb-2 tracking-tight">Neural Perimeter Defense</h2>
    <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em]">Sentinel Pro endpoints active and monitoring mesh nodes.</p>
  </div>
);

const PricingView: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in-95 duration-700">
    <div className="p-8 bg-green-500/5 rounded-full border border-green-500/10 mb-8">
      <ScanSearch size={64} className="text-green-500" />
    </div>
    <h2 className="text-2xl font-bold mb-2 tracking-tight">Grounding Procurement Matrix</h2>
    <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em]">Live vendor grounding data synchronized with DIT hub.</p>
  </div>
);

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void }> = ({ icon, label, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all group ${active ? 'theme-primary-bg text-white shadow-lg' : 'text-slate-500 hover:theme-primary-text hover:bg-black/5'}`}>
    <div className={active ? 'text-white' : 'text-slate-500 group-hover:theme-primary-text'}>{icon}</div>
    {!collapsed && <span className="truncate tracking-tight">{label}</span>}
  </button>
);

const ToolToggle: React.FC<{ active: boolean, onClick: () => void, icon: any, title?: string }> = ({ active, onClick, icon, title }) => (
  <button onClick={onClick} title={title} className={`p-2 rounded-lg transition-all border ${active ? 'theme-primary-bg text-white shadow-md' : 'text-slate-500 border-transparent hover:bg-black/5'}`}>
    {icon}
  </button>
);

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const aistudio = (window as any).aistudio;
    if (aistudio && !hasKey) {
      await aistudio.openSelectKey();
      onLogin();
    } else {
      setTimeout(onLogin, 1500);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] text-center relative z-10 animate-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center mb-8">
          <IUBDITLogo size={64} />
          <h2 className="text-2xl font-extrabold text-white mt-4 tracking-tighter">IUB DIT PORTAL</h2>
          <p className="text-sky-500 text-[9px] font-black uppercase tracking-[0.5em] mt-1">Authorized Node Authentication</p>
        </div>
        <div className="relative mb-8 inline-block group">
          <div className="absolute -inset-2 bg-sky-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative w-24 h-24 rounded-2xl border border-slate-800 p-2 bg-slate-950 flex items-center justify-center text-sky-400 shadow-inner group-hover:border-sky-500/30 transition-all">
            <UserCircle size={48} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-sky-600 p-1.5 rounded-lg border-4 border-slate-900 text-white shadow-xl">
            <Shield size={14} />
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white tracking-tight">Lead AI Authority</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 leading-relaxed">
            AI System Engineer <br/>
            <span className="text-sky-500/60 font-black">Directorate of IT IUB</span>
          </p>
        </div>
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 group"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} className="group-hover:rotate-12 transition-transform" />}
          {loading ? 'Verifying Neural Credentials...' : 'Initialize Terminal Uplink'}
        </button>
      </div>
    </div>
  );
};

export default App;
