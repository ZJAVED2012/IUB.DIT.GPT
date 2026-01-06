
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
  Mail, Table, BarChart3, PieChart, LineChart, ChevronRight
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

const ExcelDataTable: React.FC<{ data: { headers: string[], rows: any[][] } }> = ({ data }) => {
  const copyToClipboard = () => {
    const csv = [data.headers.join(','), ...data.rows.map(row => row.join(','))].join('\n');
    navigator.clipboard.writeText(csv);
    alert("Copied to clipboard.");
  };
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/20 animate-in zoom-in-95">
      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-400"><Table size={14}/><span className="text-[10px] font-black uppercase">Data Grid</span></div>
        <button onClick={copyToClipboard} className="p-1 hover:text-sky-400 transition-colors"><Copy size={14}/></button>
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
      <div className="flex items-center gap-2 mb-4 text-sky-400">
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
              <rect key={i} x={x} y={y} width={barWidth} height={h} fill="#0ea5e9" fillOpacity="0.6" className="hover:fill-opacity-90 transition-all"/>
            );
          })}
          {data.type === 'line' && (
             <path d={`M ${data.datasets[0].data.map((val: number, i: number) => {
               const x = padding + i * ((chartWidth - padding * 2) / (data.labels.length - 1));
               const y = chartHeight - (val / maxVal) * chartHeight;
               return `${x},${y}`;
             }).join(' L ')}`} fill="none" stroke="#0ea5e9" strokeWidth="2" />
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
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}>
    <div className={active ? '' : 'group-hover:text-sky-400'}>{icon}</div>
    {!collapsed && <span className="text-xs font-bold tracking-tight">{label}</span>}
  </button>
);

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-10 rounded-3xl text-center space-y-8 backdrop-blur-xl animate-in zoom-in-95">
      <IUBDITLogo size={80} />
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">IUB Smart Assistant</h1>
        <p className="text-[10px] text-sky-400 font-black uppercase tracking-[0.4em] mt-1">DIT Neural Terminal</p>
      </div>
      <div className="pt-4 border-t border-white/5 space-y-1">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Lead Engineer: Mr. Zeeshan Javed</p>
        <p className="text-[9px] text-slate-500">+923042012500</p>
      </div>
      <button onClick={onLogin} className="w-full py-4 rounded-2xl bg-sky-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all">Establish Link</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Neural link established. Mr. Zeeshan Javed, how can I assist you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const [useSearch, setUseSearch] = useState(true);
  const [useThinking, setUseThinking] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    const curInput = input;
    const curImage = selectedImage;
    const curVideo = selectedVideo;
    
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
        video: curVideo || undefined
      });

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text, 
        timestamp: new Date() 
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

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-[#070b1d] border-r border-white/5 flex flex-col transition-all duration-300 z-40`}>
        <div className="p-4 border-b border-white/5 flex items-center gap-3 overflow-hidden">
          <IUBDITLogo size={32} />
          {isSidebarOpen && <div className="text-nowrap"><h1 className="font-bold text-white">IUB Smart IT</h1><p className="text-[8px] text-sky-400 font-black uppercase">Directorate of IT</p></div>}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <SidebarItem icon={<MessageSquare size={16}/>} label="Chat Hub" active={activeView === AppView.CHAT} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.CHAT)} />
          <SidebarItem icon={<Video size={16}/>} label="Media Lab" active={activeView === AppView.MEDIA_LAB} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.MEDIA_LAB)} />
          <SidebarItem icon={<LayoutDashboard size={16}/>} label="Inventory" active={activeView === AppView.INVENTORY} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<Settings size={16}/>} label="Settings" active={activeView === AppView.SETTINGS} collapsed={!isSidebarOpen} onClick={() => setActiveView(AppView.SETTINGS)} />
        </nav>
        <div className="p-4 border-t border-white/5">
          {isSidebarOpen ? (
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white">Mr. Zeeshan Javed</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase">AI System Lead</p>
            </div>
          ) : <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-black">ZJ</div>}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#020617]/50 backdrop-blur-md">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white"><Menu size={18}/></button>
          <div className="flex gap-4">
             <button onClick={() => gemini.openKeySelector()} className="text-[9px] font-black uppercase text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-lg hover:bg-sky-500/5 transition-all">Switch Key</button>
             <button onClick={() => setIsLoggedIn(false)} className="text-[9px] font-black uppercase text-slate-500 hover:text-red-400">Logout</button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeView === AppView.CHAT && (
            <div className="flex flex-col h-full max-w-4xl mx-auto px-4 relative">
              <div className="flex-1 overflow-y-auto pt-6 space-y-8 custom-scrollbar pb-32">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-900 border border-white/5 text-slate-200'}`}>
                      {msg.image && <img src={msg.image} className="max-w-full rounded-xl mb-3 border border-white/10" />}
                      {msg.video && <video src={msg.video} controls className="max-w-full rounded-xl mb-3 border border-white/10" />}
                      <div className="text-sm leading-relaxed">
                        {msg.role === 'assistant' ? <ParsedContent content={msg.content}/> : <div className="whitespace-pre-wrap">{msg.content}</div>}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && <div className="flex gap-1 animate-pulse"><div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div><div className="w-1.5 h-1.5 bg-sky-500 rounded-full [animation-delay:0.2s]"></div><div className="w-1.5 h-1.5 bg-sky-500 rounded-full [animation-delay:0.4s]"></div></div>}
                <div ref={chatEndRef} />
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
                {(selectedImage || selectedVideo) && (
                  <div className="mb-2 p-2 bg-slate-900 border border-white/10 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
                    <div className="relative">
                      {selectedImage ? <img src={selectedImage} className="w-16 h-16 object-cover rounded-xl" /> : <video src={selectedVideo!} className="w-16 h-16 object-cover rounded-xl" />}
                      <button onClick={() => { setSelectedImage(null); setSelectedVideo(null); }} className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-white shadow-lg"><X size={10}/></button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-[10px] font-black uppercase text-sky-400">Asset Ready</p>
                       <p className="text-[8px] text-slate-500 truncate">{selectedImage ? 'Image' : 'Video'} attached to buffer</p>
                    </div>
                  </div>
                )}
                <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-2 flex items-center gap-1 shadow-2xl">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-500 hover:text-sky-400 transition-colors"><Paperclip size={20}/></button>
                  <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleFileUpload} />
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Neural command terminal..." className="flex-1 bg-transparent border-none outline-none text-sm p-2 text-white" />
                  <div className="flex gap-1">
                    <button onClick={() => setUseSearch(!useSearch)} className={`p-2 rounded-xl border transition-all ${useSearch ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'border-white/5 text-slate-500'}`}><Globe size={14}/></button>
                    <button onClick={() => setUseThinking(!useThinking)} className={`p-2 rounded-xl border transition-all ${useThinking ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'border-white/5 text-slate-500'}`}><BrainCircuit size={14}/></button>
                    <button onClick={handleSendMessage} className="p-2.5 bg-sky-500 rounded-xl text-white shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all"><Send size={18}/></button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeView === AppView.MEDIA_LAB && <MediaLabView theme={{ mode: 'dark', primaryColor: '#0ea5e9', secondaryColor: '#64748b', fontFamily: '' }} />}
          {activeView === AppView.SETTINGS && <SettingsView theme={{ mode: 'dark', primaryColor: '#0ea5e9', secondaryColor: '#64748b', fontFamily: '' }} onThemeChange={() => {}} />}
          {activeView === AppView.INVENTORY && <InventoryView devices={MOCK_DEVICES} />}
        </div>
      </main>
    </div>
  );
};

const MediaLabView: React.FC<any> = ({ theme }) => {
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
    <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Media Lab</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe visual asset..." className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-sky-500 outline-none resize-none" />
          <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full py-4 rounded-2xl bg-sky-500 text-white font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2">
            {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>} Generate Asset
          </button>
        </div>
        <div className="lg:col-span-2 aspect-video bg-black/40 rounded-3xl border border-dashed border-white/10 flex items-center justify-center relative overflow-hidden">
          {isGenerating && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><RefreshCw className="animate-spin text-sky-500" size={40}/></div>}
          {result ? <img src={result} className="w-full h-full object-contain" /> : <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Awaiting Synthesis</p>}
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<any> = ({ theme, onThemeChange }) => (
  <div className="p-8 max-w-2xl mx-auto space-y-8 h-full">
    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Engine</h2>
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <button onClick={() => gemini.openKeySelector()} className="w-full flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500 rounded-2xl text-white"><KeyRound size={24}/></div>
          <div className="text-left">
            <p className="text-sm font-black text-white uppercase">Project API Key</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Configure authentication gateway</p>
          </div>
        </div>
        <ChevronRight className="text-slate-600 group-hover:text-sky-500 transition-colors" />
      </button>
    </div>
  </div>
);

const InventoryView: React.FC<{ devices: Device[] }> = ({ devices }) => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Device Inventory</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
      {devices.map(d => (
        <div key={d.id} className="bg-white/[0.03] border border-white/10 p-5 rounded-3xl hover:border-sky-500/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${d.status === 'Online' ? 'text-emerald-500' : 'text-rose-500'}`}><Server size={20}/></div>
            <div>
              <h3 className="text-sm font-black text-white">{d.name}</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{d.brand} {d.model}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between">
            <span className="text-[10px] font-black uppercase text-slate-600">IP Addr</span>
            <span className="text-[10px] font-mono text-sky-400">{d.ip}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default App;
