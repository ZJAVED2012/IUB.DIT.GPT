
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, MessageSquare, ShieldCheck, Search, Cpu, Network, DollarSign,
  Server, Activity, Plus, Award, Video, Globe, BrainCircuit, X, Loader2, 
  Terminal, Layers, Zap, Volume2, ScanSearch, ShieldAlert,
  Paperclip, Send, Phone, PhoneOff, MapPin, Sparkles, 
  Shield, Menu, Bell, Info, AlertTriangle, CheckCircle, Trash2, Mic,
  Image as ImageIcon, Wand2, UploadCloud, Download, ExternalLink,
  UserCircle, Binary, Film, Copyright, RefreshCw, Copy, Check
} from 'lucide-react';
import { AppView, Message, Device, AspectRatio, ImageSize, Persona, SystemEvent } from './types';
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

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('iub_dit_chat_history_v2');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [
      { id: '1', role: 'assistant', content: "Neural link established. Welcome, Mr. Zeeshan Javed. I am your specialized AI assistant for the IUB Directorate of IT. AI System Lead Engineer identified. How can we optimize the infrastructure today?", timestamp: new Date() }
    ];
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
  const videoInputRef = useRef<HTMLInputElement>(null);

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
        content: "Operational error detected. Uplink failed.", 
        timestamp: new Date() 
      }]);
    } finally { setIsTyping(false); }
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
      console.error(e); 
      setIsRecording(false);
    }
  };

  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 font-sans overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-60' : 'w-16'} bg-[#070b1d] border-r border-white/5 flex flex-col transition-all duration-300 z-40 relative`}>
        <div className="p-4 border-b border-white/5 flex items-center gap-3 overflow-hidden text-nowrap">
          <IUBDITLogo size={32} />
          {isSidebarOpen && (
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">IUB.<span className="text-sky-500">DIT</span></h1>
              <p className="text-[8px] text-sky-500/60 font-black uppercase tracking-widest">Neural Terminal v5.2</p>
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
        </nav>

        {isSidebarOpen && (
          <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Lead Engineer</p>
            <p className="text-[9px] font-bold text-sky-400">Mr. Zeeshan Javed</p>
          </div>
        )}

        <div className="p-3 border-t border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 shrink-0 flex items-center justify-center text-sky-400">
                <UserCircle size={20} />
             </div>
             {isSidebarOpen && (
               <div className="overflow-hidden">
                 <p className="text-[11px] font-bold text-white truncate">Zeeshan Javed</p>
                 <p className="text-[8px] text-slate-500 uppercase tracking-tighter">AI Lead Engineer</p>
               </div>
             )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="h-14 border-b border-white/5 bg-[#020617] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"><Menu size={16} /></button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-sky-500 animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Lead Engineer node: Zeeshan Javed</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sky-400 bg-sky-400/5 px-3 py-1 rounded-md border border-sky-400/10">
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
                        ? 'bg-sky-600 text-white' 
                        : 'bg-slate-900 border border-white/5 text-slate-200'
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
                                 <button onClick={() => playTTS(msg.content)} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-sky-400 transition-colors"><Volume2 size={12} /></button>
                               )}
                             </div>
                          </div>
                        </div>
                        <div className="text-sm leading-normal whitespace-pre-wrap">{msg.content}</div>
                        
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap gap-2">
                            {msg.sources.map((src, i) => (
                              <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded text-[9px] text-slate-400 hover:text-white transition-colors">
                                <ExternalLink size={8} /> {src.title}
                              </a>
                            ))}
                          </div>
                        )}
                        
                        {msg.image && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                            <img src={msg.image} className="w-full h-auto object-cover" alt="Output" />
                          </div>
                        )}
                        {msg.video && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                            <video src={msg.video} controls className="w-full bg-black" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className="bg-slate-900 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-sky-500 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                        <span className="text-[9px] font-bold text-sky-500 uppercase tracking-widest">Processing</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
                  <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-2 shadow-xl">
                    {(selectedImage || selectedVideo) && (
                      <div className="mx-1 mb-2 flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <div className="w-10 h-10 rounded-md border border-sky-500/30 overflow-hidden bg-black flex items-center justify-center">
                          {selectedImage ? (
                            <img src={selectedImage} className="w-full h-full object-cover" alt="Buffered" />
                          ) : (
                            <Film className="text-sky-500" size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[8px] font-bold uppercase text-sky-500 tracking-widest">Buffer Locked</p>
                        </div>
                        <button onClick={() => { setSelectedImage(null); setSelectedVideo(null); }} className="p-1 hover:text-red-400 text-slate-500"><X size={14} /></button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-sky-400 transition-colors" title="Image"><Paperclip size={18} /></button>
                      <button onClick={() => videoInputRef.current?.click()} className="p-2 text-slate-500 hover:text-sky-400 transition-colors" title="Video"><Film size={18} /></button>
                      <button onClick={transcribeAudio} className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-sky-400'}`} title="Transcribe Audio"><Mic size={18} /></button>
                      
                      <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                        placeholder="Command terminal..." 
                        className="flex-1 bg-transparent border-none outline-none text-[13px] text-white py-2 placeholder:text-slate-600 px-2"
                      />
                      
                      <div className="flex items-center gap-1 pr-1">
                        <ToolToggle active={useSearch} onClick={() => { setUseSearch(!useSearch); setUseMaps(false); setUseFast(false); }} icon={<Globe size={14} />} title="Search Grounding" />
                        <ToolToggle active={useMaps} onClick={() => { setUseMaps(!useMaps); setUseSearch(false); setUseFast(false); }} icon={<MapPin size={14} />} title="Maps Grounding" />
                        <ToolToggle active={useThinking} onClick={() => setUseThinking(!useThinking)} icon={<BrainCircuit size={14} />} title="Thinking Mode" />
                        <ToolToggle active={useFast} onClick={() => { setUseFast(!useFast); setUseSearch(false); setUseMaps(false); }} icon={<Zap size={14} />} title="Fast Mode" />
                        <button onClick={handleSendMessage} className="p-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white transition-colors">
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => { setSelectedImage(ev.target?.result as string); setSelectedVideo(null); };
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => { setSelectedVideo(ev.target?.result as string); setSelectedImage(null); };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </div>
                </div>
              </div>
            )}

            {activeView === AppView.MEDIA_LAB && <MediaLabView />}
            {activeView === AppView.LIVE && <LiveSessionView />}
            {activeView === AppView.SYSTEM_EVENTS && <SystemEventsView />}
            {activeView === AppView.INVENTORY && <InventoryView devices={MOCK_DEVICES} />}
            {activeView === AppView.CONFIG_LIBRARY && <ConfigView configs={CONFIG_LIBRARY} />}
            {activeView === AppView.SECURITY && <SecurityView />}
            {activeView === AppView.PRICING && <PricingView />}
          </div>

          <footer className="h-8 border-t border-white/5 bg-black/20 flex items-center justify-between px-6 text-[8px] font-bold uppercase tracking-widest text-slate-600">
             <div><Copyright size={8} className="inline mr-1" /> {new Date().getFullYear()} Directorate of IT, IUB</div>
             <div className="text-white">IUB.DIT.GPT v5.0 | Designed & Developed by Mr. Zeeshan Javed (AI System Lead Engineer)</div>
          </footer>
        </div>
      </main>
    </div>
  );
};

const MediaLabView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
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
        setStatus('Initializing render...');
        const url = await gemini.generateImage(prompt, { aspectRatio: aspect, imageSize: size });
        if (url) setMediaUrl(url);
      } else {
        setStatus('Synthesizing temporal stream...');
        const validAspect = (aspect === '9:16' ? '9:16' : '16:9');
        const url = await gemini.generateVideo(prompt, validAspect, imgFile || undefined, '720p');
        if (url) setMediaUrl(url);
      }
      setStatus('Complete.');
    } catch (e) { setStatus('Error.'); console.error(e); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Media Lab</h2>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Neural Rendering Engine</p>
          </div>
          <Sparkles size={24} className="text-sky-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-white/5 rounded-xl p-6 space-y-6">
            <div className="flex gap-1 p-1 bg-black/20 rounded-lg w-fit">
              <button onClick={() => setMode('image')} className={`px-4 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${mode === 'image' ? 'bg-sky-600 text-white' : 'text-slate-500'}`}>IMAGE GEN</button>
              <button onClick={() => setMode('video')} className={`px-4 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${mode === 'video' ? 'bg-sky-600 text-white' : 'text-slate-500'}`}>VIDEO SYNTH</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">Aspect Ratio</label>
                 <select value={aspect} onChange={e => setAspect(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] font-medium outline-none">
                   <option value="1:1">1:1 Square</option>
                   <option value="16:9">16:9 Cinematic</option>
                   <option value="9:16">9:16 Portrait</option>
                   <option value="2:3">2:3 Classic</option>
                   <option value="3:2">3:2 Wide</option>
                   <option value="3:4">3:4 Standard</option>
                   <option value="4:3">4:3 Desktop</option>
                   <option value="21:9">21:9 UltraWide</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">Resolution</label>
                 <select value={size} onChange={e => setSize(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] font-medium outline-none">
                   <option value="1K">1K HD</option>
                   {mode === 'image' && <option value="2K">2K Pro</option>}
                   {mode === 'image' && <option value="4K">4K Ultra</option>}
                 </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">Synthesis Prompt</label>
              <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)}
                placeholder={mode === 'image' ? "Ultra-detailed network architecture..." : "Cinematic drone shot of IUB campus..."}
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-[13px] outline-none resize-none focus:border-sky-500/30 transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button onClick={() => document.getElementById('media-ref')?.click()} className="text-[9px] font-bold uppercase tracking-widest text-sky-400 hover:underline flex items-center gap-2">
                <UploadCloud size={14} /> {imgFile ? 'Change Reference' : 'Upload Source Photo'}
              </button>
              <input type="file" id="media-ref" hidden accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader(); r.onload = (ev) => setImgFile(ev.target?.result as string); r.readAsDataURL(f);
                }
              }} />
              <button onClick={handleAction} disabled={busy || (!prompt && !imgFile)} className="bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all disabled:opacity-50">
                {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                Process
              </button>
            </div>
            {busy && <p className="text-[8px] text-center uppercase tracking-widest text-sky-500 animate-pulse">{status}</p>}
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col min-h-[400px]">
             <h3 className="text-[9px] font-bold uppercase text-slate-500 mb-4 border-b border-white/5 pb-2">Output Preview</h3>
             {mediaUrl ? (
               <div className="flex-1 flex flex-col justify-center items-center gap-4 animate-in fade-in duration-700">
                  {mode === 'image' ? <img src={mediaUrl} className="max-h-[350px] rounded-lg shadow-2xl w-full object-contain" /> : <video src={mediaUrl} controls autoPlay loop className="max-h-[350px] rounded-lg w-full" />}
                  <a href={mediaUrl} download className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-full text-[10px] font-bold text-white transition-all shadow-lg"><Download size={14} /> Download Asset</a>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-700 space-y-4">
                  <Binary size={48} className="opacity-10" />
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-20">Awaiting Neural Sequence</p>
                  {imgFile && (
                    <div className="p-2 border border-white/5 rounded-lg">
                       <p className="text-[8px] uppercase text-sky-500 font-bold mb-2">Reference Photo Loaded</p>
                       <img src={imgFile} className="h-20 w-auto rounded opacity-50 grayscale" />
                    </div>
                  )}
               </div>
             )}
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
        onerror: (e) => console.error(e),
        onclose: () => setActive(false)
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { console.error("Voice Gateway Error", e); }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in duration-1000">
      <div className={`w-32 h-32 border rounded-full flex items-center justify-center mb-8 transition-all duration-700 ${active ? 'border-sky-500 bg-sky-500/10 shadow-[0_0_50px_rgba(14,165,233,0.3)]' : 'border-white/10'}`}>
        {active ? <Phone size={40} className="text-sky-400 animate-pulse" /> : <PhoneOff size={40} className="text-slate-800" />}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Voice Proxy Gateway</h2>
      <p className="text-slate-500 text-[10px] mb-8 font-medium uppercase tracking-[0.3em]">Low-latency bi-directional stream initialized</p>
      <button 
        onClick={active ? stopSession : startSession}
        className={`px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl ${active ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20'}`}
      >
        {active ? 'Terminate Link' : 'Initialize Connection'}
      </button>
    </div>
  );
};

const SystemEventsView: React.FC = () => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Events</h2>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Real-time Alert Matrix</p>
      </div>
    </div>
    <div className="space-y-3">
      <EventCard type="success" time="14:22:04" msg="Neural gateway initialized for Lead Engineer Zeeshan Javed." />
      <EventCard type="info" time="11:30:58" msg="Periodic mesh scan completed. 0 threats detected." />
      <EventCard type="error" time="09:12:33" msg="Unauthorized access attempt blocked at Edge-Firewall." />
      <EventCard type="warning" time="08:45:12" msg="Uplink latency exceeding standard thresholds at Node-02." />
    </div>
  </div>
);

const EventCard: React.FC<{type: 'success'|'warning'|'info'|'error', time: string, msg: string}> = ({type, time, msg}) => (
  <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex items-start gap-4 hover:border-white/10 transition-colors group">
    <div className={`p-2 rounded-lg transition-colors ${
      type === 'success' ? 'text-green-500 bg-green-500/5 group-hover:bg-green-500/10' :
      type === 'error' ? 'text-red-500 bg-red-500/5 group-hover:bg-red-500/10' : 
      type === 'warning' ? 'text-orange-500 bg-orange-500/5 group-hover:bg-orange-500/10' : 'text-sky-500 bg-sky-500/5 group-hover:bg-sky-500/10'
    }`}>
      {type === 'success' ? <CheckCircle size={16} /> : type === 'warning' ? <AlertTriangle size={16} /> : type === 'error' ? <ShieldAlert size={16} /> : <Info size={16} />}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[8px] font-bold uppercase text-slate-500">{time}</span>
      </div>
      <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{msg}</p>
    </div>
  </div>
);

const InventoryView: React.FC<{ devices: Device[] }> = ({ devices }) => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white tracking-tight">Asset Ledger</h2>
      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Logical Inventory Mapping</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map(d => (
        <div key={d.id} className="bg-slate-900 border border-white/5 rounded-xl p-4 hover:border-sky-500/20 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all"><Server size={18} /></div>
            <div>
              <p className="text-[7px] text-slate-500 font-bold uppercase">{d.type}</p>
              <h3 className="text-sm font-bold text-white">{d.name}</h3>
            </div>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-white/5">
            <div className="flex justify-between text-[10px]"><span className="text-slate-500">IP:</span> <span className="text-sky-400 mono">{d.ip}</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-slate-500">Status:</span> <span className="text-green-500">{d.status}</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-slate-500">Node:</span> <span className="text-slate-400">{d.location}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ConfigView: React.FC<{ configs: any[] }> = ({ configs }) => (
  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white tracking-tight">CLI Vault</h2>
      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Repository Access</p>
    </div>
    <div className="space-y-4">
      {configs.map(c => (
        <div key={c.id} className="bg-slate-900 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group/config">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-white">{c.title}</h3>
              <span className="text-[8px] uppercase px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-md border border-sky-500/10">{c.category}</span>
            </div>
            <CopyButton text={c.commands} />
          </div>
          <pre className="bg-black/40 p-4 rounded-lg text-sky-400 mono text-[11px] border border-white/5 overflow-x-auto shadow-inner">{c.commands}</pre>
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
    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Perimeter Security Matrix</h2>
    <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em]">Mesh endpoints monitored by Gemini Sentinel Pro.</p>
  </div>
);

const PricingView: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in-95 duration-700">
    <div className="p-8 bg-green-500/5 rounded-full border border-green-500/10 mb-8">
      <ScanSearch size={64} className="text-green-500" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Market Analytics Oracle</h2>
    <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em]">Procurement grounding matrix synced with global vendors.</p>
  </div>
);

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void }> = ({ icon, label, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all group ${active ? 'bg-sky-500/10 text-sky-400 border border-sky-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    <div className={active ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-300'}>{icon}</div>
    {!collapsed && <span className="truncate tracking-tight">{label}</span>}
  </button>
);

const ToolToggle: React.FC<{ active: boolean, onClick: () => void, icon: any, title?: string }> = ({ active, onClick, icon, title }) => (
  <button onClick={onClick} title={title} className={`p-2 rounded-lg transition-all border ${active ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'text-slate-600 border-transparent hover:bg-white/5'}`}>
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
          <h2 className="text-2xl font-extrabold text-white mt-4 tracking-tighter">DIT PORTAL</h2>
          <p className="text-sky-500 text-[9px] font-black uppercase tracking-[0.5em] mt-1">Administrative Terminal Access</p>
        </div>

        <div className="relative mb-8 inline-block group">
          <div className="absolute -inset-2 bg-sky-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative w-24 h-24 rounded-2xl border border-slate-800 p-2 bg-slate-950 flex items-center justify-center text-sky-400 shadow-inner group-hover:border-sky-500/30 transition-all">
            <UserCircle size={48} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-sky-600 p-1.5 rounded-lg border-4 border-slate-900 text-white shadow-xl">
            <Award size={14} />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-white tracking-tight">Mr. Zeeshan Javed</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 leading-relaxed">
            AI System Lead Engineer <br/>
            <span className="text-sky-500/60 font-black">Directorate of IT IUB</span>
          </p>
        </div>

        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 group"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} className="group-hover:rotate-12 transition-transform" />}
          {loading ? 'Decrypting Authentication...' : 'Initialize Terminal Uplink'}
        </button>

        <p className="mt-8 text-[8px] text-white font-bold uppercase tracking-widest leading-relaxed opacity-80">
          IUB.DIT.GPT v5.0 | Directorate of IT IUB <br/> 
          Designed & Developed by Mr. Zeeshan Javed
        </p>
      </div>
    </div>
  );
};

export default App;
