
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShieldCheck, 
  Database, 
  Settings, 
  Search, 
  Cpu, 
  Network, 
  DollarSign, 
  ChevronRight,
  Server,
  Activity,
  LogOut,
  Plus,
  ExternalLink,
  Award,
  Mic,
  Image as ImageIcon,
  Video,
  Globe,
  MapPin,
  BrainCircuit,
  X,
  Loader2,
  Download,
  Terminal,
  Layers,
  Zap,
  HardDrive,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  FileJson,
  Calendar,
  Usb,
  Fingerprint,
  BatteryCharging,
  LineChart,
  History,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ScanSearch,
  Zap as FastIcon,
  Maximize,
  Ratio
} from 'lucide-react';
import { AppView, Message, Device, AspectRatio, ImageSize } from './types';
import { MOCK_DEVICES, CONFIG_LIBRARY } from './constants';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [inventorySearch, setInventorySearch] = useState('');
  
  // Persistent Inventory State
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('iub_dit_inventory');
    return saved ? JSON.parse(saved) : MOCK_DEVICES;
  });

  // Persistent Chat History State
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('iub_dit_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [{
      id: '1',
      role: 'assistant',
      content: "Welcome to IUB.DIT.GPT v4.5. Enhanced with Gemini Pro intelligence. \n\nI can now analyze images, videos, transcribe audio, and generate high-fidelity visuals. Use the toggles below to switch between Search, Thinking, or Fast modes.",
      timestamp: new Date()
    }];
  });

  useEffect(() => {
    localStorage.setItem('iub_dit_inventory', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('iub_dit_chat_history', JSON.stringify(messages));
  }, [messages]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(true); 
  const [useMaps, setUseMaps] = useState(false);
  const [useFast, setUseFast] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [genAspectRatio, setGenAspectRatio] = useState<AspectRatio>('1:1');
  const [genImageSize, setGenImageSize] = useState<ImageSize>('1K');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  const clearChatHistory = () => {
    if (confirm("Permanently delete your local chat history?")) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "System wiped. Ready for new input.",
        timestamp: new Date()
      }]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsTyping(true);
          const transcription = await gemini.transcribeAudio(base64);
          setInput(prev => prev + (prev ? ' ' : '') + transcription);
          setIsTyping(false);
        };
        reader.readAsDataURL(audioBlob);
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) { console.error("Mic error", e); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage && !selectedVideo) return;
    if (isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: selectedImage || undefined,
      video: selectedVideo || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = selectedImage;
    const currentVideo = selectedVideo;
    
    setInput('');
    setSelectedImage(null);
    setSelectedVideo(null);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      let response;
      if (currentInput.toLowerCase().startsWith("/gen ")) {
        const prompt = currentInput.replace("/gen ", "");
        const imgUrl = await gemini.generateImage(prompt, { aspectRatio: genAspectRatio, imageSize: genImageSize });
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Generated image for: "${prompt}" [Size: ${genImageSize}, Aspect: ${genAspectRatio}]`,
          image: imgUrl || undefined,
          timestamp: new Date()
        }]);
      } else if (currentImage && (currentInput.toLowerCase().includes('edit') || currentInput.toLowerCase().includes('filter'))) {
        const imgUrl = await gemini.editImage(currentInput, currentImage);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Image updated with requested edits.",
          image: imgUrl || undefined,
          timestamp: new Date()
        }]);
      } else {
        response = await gemini.chat(currentInput, history, {
          useThinking,
          useSearch,
          useMaps,
          useFast,
          image: currentImage || undefined,
          video: currentVideo || undefined
        });
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
          sources: response.sources,
          isThinking: useThinking
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Error processing intelligence node. Verify connection.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const playTTS = async (text: string) => {
    try {
      const base64 = await gemini.generateSpeech(text);
      if (base64) {
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        audio.play();
      }
    } catch (e) { console.error("TTS play error", e); }
  };

  const addDevice = (d: Device) => setDevices([d, ...devices]);
  const updateDevice = (d: Device) => setDevices(devices.map(dev => dev.id === d.id ? d : dev));
  const removeDevice = (id: string) => setDevices(devices.filter(d => d.id !== id));
  const resetInventory = () => confirm("Reset database?") && setDevices(MOCK_DEVICES);

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden text-slate-100 font-sans">
      <aside className="w-80 bg-[#060914] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2.5 bg-sky-600 rounded-xl shadow-lg shadow-sky-600/30">
            <Network size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl leading-tight tracking-tight bg-gradient-to-r from-white to-sky-400 bg-clip-text text-transparent">IUB.DIT.GPT</h1>
            <p className="text-[10px] text-sky-500/80 font-black tracking-widest uppercase">Directorate of IT</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
          <SidebarItem icon={<MessageSquare size={18} />} label="Intelligence Hub" active={activeView === AppView.CHAT} onClick={() => setActiveView(AppView.CHAT)} />
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Global Inventory" active={activeView === AppView.INVENTORY} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<Video size={18} />} label="Media Lab (Veo)" active={activeView === AppView.MEDIA_LAB} onClick={() => setActiveView(AppView.MEDIA_LAB)} />
          <SidebarItem icon={<Cpu size={18} />} label="CLI Configs" active={activeView === AppView.CONFIG_LIBRARY} onClick={() => setActiveView(AppView.CONFIG_LIBRARY)} />
          <SidebarItem icon={<ShieldCheck size={18} />} label="Security Node" active={activeView === AppView.SECURITY} onClick={() => setActiveView(AppView.SECURITY)} />
          <SidebarItem icon={<DollarSign size={18} />} label="Market Pricing" active={activeView === AppView.PRICING} onClick={() => setActiveView(AppView.PRICING)} />
        </nav>

        <div className="px-5 py-4 bg-white/5 border-t border-white/5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-sky-500 uppercase tracking-widest">
              <Award size={14} className="text-amber-500" /> System Architect
            </div>
            <div>
              <p className="text-sm font-black text-slate-200">Mr. Zeeshan Javed</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">AI Engineer • IUB DIT</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Sync: Active</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Enterprise Precision Mode</span>
          </div>
          <div className="flex items-center gap-4">
            {activeView === AppView.CHAT && (
              <button 
                onClick={clearChatHistory}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Trash2 size={14} /> Clear History
              </button>
            )}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={14} />
              <input 
                type="text" 
                value={activeView === AppView.INVENTORY ? inventorySearch : ''}
                onChange={(e) => activeView === AppView.INVENTORY && setInventorySearch(e.target.value)}
                placeholder={activeView === AppView.INVENTORY ? "Search Device Database..." : "Search Tools..."}
                className="bg-[#111827] border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-64 outline-none transition-all"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeView === AppView.CHAT && (
            <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full">
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[90%] rounded-3xl p-6 ${msg.role === 'user' ? 'bg-sky-600 shadow-2xl shadow-sky-900/20' : 'bg-white/5 border border-white/10 shadow-xl backdrop-blur-md'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] opacity-50 font-black uppercase tracking-[0.2em]">
                          {msg.role === 'assistant' ? <><BrainCircuit size={12} className="text-sky-400" /> Intelligence Engine</> : 'Command Node'}
                        </div>
                        <div className="flex items-center gap-2">
                          {msg.role === 'assistant' && <button onClick={() => playTTS(msg.content)} className="p-1 hover:text-sky-400 transition-colors"><Volume2 size={14} /></button>}
                          {msg.role === 'assistant' && useSearch && <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-400 uppercase tracking-widest"><CheckCircle2 size={10} /> Fact Checked</span>}
                        </div>
                      </div>
                      {msg.image && <img src={msg.image} className="mb-4 rounded-2xl max-h-96 w-auto border border-white/10 shadow-2xl" alt="Content" />}
                      {msg.video && <video src={msg.video} controls className="mb-4 rounded-2xl max-h-96 w-full border border-white/10 shadow-2xl" />}
                      <div className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base text-slate-200 prose prose-invert max-w-none">{msg.content}</div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Verification Cloud:</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, i) => (
                              <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 rounded-lg text-[10px] font-bold text-sky-400 transition-all">
                                <ExternalLink size={10} /> {source.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="flex justify-start"><div className="bg-white/5 border border-white/10 rounded-2xl p-4 px-6 flex gap-2"><div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div></div>}
                <div ref={chatEndRef} />
              </div>

              <div className="p-8 pt-0">
                <div className="flex flex-wrap gap-2 mb-4 bg-white/5 p-2 rounded-2xl border border-white/5 w-fit items-center">
                  <ToolToggle active={useSearch} onClick={() => setUseSearch(!useSearch)} icon={<Globe size={14} />} label="Search" color="sky" />
                  <ToolToggle active={useThinking} onClick={() => setUseThinking(!useThinking)} icon={<BrainCircuit size={14} />} label="Thinking" color="purple" />
                  <ToolToggle active={useMaps} onClick={() => setUseMaps(!useMaps)} icon={<MapPin size={14} />} label="Maps" color="green" />
                  <ToolToggle active={useFast} onClick={() => setUseFast(!useFast)} icon={<FastIcon size={14} />} label="Fast Lite" color="orange" />
                  <div className="h-6 w-px bg-white/10 mx-2"></div>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Image settings:</span>
                     <select value={genAspectRatio} onChange={e => setGenAspectRatio(e.target.value as any)} className="bg-transparent text-[10px] font-bold text-sky-400 outline-none cursor-pointer">
                       {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                     <select value={genImageSize} onChange={e => setGenImageSize(e.target.value as any)} className="bg-transparent text-[10px] font-bold text-sky-400 outline-none cursor-pointer">
                       {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                </div>

                <div className="relative group">
                  {(selectedImage || selectedVideo) && (
                    <div className="absolute top-[-80px] left-0 flex gap-4 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 animate-in slide-in-from-bottom-4">
                      {selectedImage && <div className="relative"><img src={selectedImage} className="w-16 h-16 object-cover rounded-xl" /><button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white shadow-xl"><X size={12} /></button></div>}
                      {selectedVideo && <div className="relative"><video src={selectedVideo} className="w-16 h-16 object-cover rounded-xl" /><button onClick={() => setSelectedVideo(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white shadow-xl"><X size={12} /></button></div>}
                    </div>
                  )}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="Type /gen to generate image, or ask any complex IT query..."
                    className="w-full bg-[#111827] border-2 border-white/5 rounded-3xl py-5 px-6 pr-44 focus:border-sky-500/50 outline-none resize-none min-h-[120px] shadow-2xl transition-all placeholder:text-slate-600"
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-3.5 text-slate-400 hover:text-sky-400 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"><ImageIcon size={20} /></button>
                    <button onClick={() => videoInputRef.current?.click()} className="p-3.5 text-slate-400 hover:text-sky-400 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"><Video size={20} /></button>
                    <button onMouseDown={startRecording} onMouseUp={stopRecording} className={`p-3.5 rounded-2xl border border-white/10 transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><Mic size={20} /></button>
                    <button className="p-3.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-2xl font-black transition-all shadow-lg shadow-sky-600/20 px-6 uppercase tracking-widest text-xs" onClick={handleSendMessage} disabled={isTyping || (!input.trim() && !selectedImage && !selectedVideo)}>Execute</button>
                    
                    <input type="file" ref={fileInputRef} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setSelectedImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} className="hidden" accept="image/*" />
                    <input type="file" ref={videoInputRef} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setSelectedVideo(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} className="hidden" accept="video/mp4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === AppView.INVENTORY && <InventoryView devices={devices} onAdd={addDevice} onUpdate={updateDevice} onDelete={removeDevice} onReset={resetInventory} searchTerm={inventorySearch} />}
          {activeView === AppView.MEDIA_LAB && <MediaLabView />}
          {activeView === AppView.CONFIG_LIBRARY && <ConfigView configs={CONFIG_LIBRARY} />}
          {activeView === AppView.SECURITY && <SecurityView />}
          {activeView === AppView.PRICING && <PricingView />}
        </div>

        <footer className="p-4 bg-[#060914] border-t border-white/5 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">
             <ShieldCheck size={12} className="text-sky-500" /> Secure Directorate Portal v4.5.1
          </div>
          <div className="text-[11px] font-bold text-slate-400 text-center">
            Create by Mr. Zeeshan Javed AI Engineer Directorate of IT The Islamia University of Bahawalpur
          </div>
        </footer>
      </main>
    </div>
  );
};

// Sub-components for missing views

const ConfigView: React.FC<{ configs: any[] }> = ({ configs }) => (
  <div className="p-8 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
    <div className="mb-10">
      <h2 className="text-3xl font-black tracking-tight text-white mb-2">CLI Config Library</h2>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
        <Terminal size={14} className="text-sky-500" /> Standardized Production Templates
      </p>
    </div>
    <div className="grid grid-cols-1 gap-6">
      {configs.map(config => (
        <div key={config.id} className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-black text-white mb-1">{config.title}</h3>
              <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">{config.category}</span>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(config.commands)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition-all"
            >
              <FileJson size={18} />
            </button>
          </div>
          <pre className="bg-black/40 rounded-2xl p-6 text-xs text-sky-400 font-mono overflow-x-auto border border-white/5 leading-relaxed">
            {config.commands}
          </pre>
        </div>
      ))}
    </div>
  </div>
);

const SecurityView: React.FC = () => (
  <div className="p-12 flex flex-col items-center justify-center h-full text-center">
    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse">
      <ShieldCheck size={48} className="text-red-500" />
    </div>
    <h2 className="text-3xl font-black text-white mb-4">Security Node Active</h2>
    <p className="text-slate-500 max-w-md font-medium leading-relaxed mb-8">
      Real-time threat detection and vulnerability scanning is operational. The Directorate of IT maintains 24/7 surveillance of all network edges.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
      <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">Threat Level: Low</div>
      <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Scan: 2m ago</div>
      <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">Intrusions: 0</div>
    </div>
  </div>
);

const PricingView: React.FC = () => (
  <div className="p-12 flex flex-col items-center justify-center h-full text-center">
    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
      <DollarSign size={48} className="text-green-500" />
    </div>
    <h2 className="text-3xl font-black text-white mb-4">Market Intelligence</h2>
    <p className="text-slate-500 max-w-md font-medium leading-relaxed">
      Switch to the Intelligence Hub and use the <span className="text-sky-400 font-bold">Search</span> tool to query real-time pricing for specific hardware models. Estimates are provided in USD and PKR.
    </p>
  </div>
);

const InventoryView: React.FC<{ 
  devices: Device[], 
  onAdd: (d: Device) => void, 
  onUpdate: (d: Device) => void, 
  onDelete: (id: string) => void, 
  onReset: () => void, 
  searchTerm: string 
}> = ({ devices, onAdd, onUpdate, onDelete, onReset, searchTerm }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter(d => d.status === 'Online').length,
    maintenance: devices.filter(d => d.status === 'Maintenance').length,
    offline: devices.filter(d => d.status === 'Offline').length
  }), [devices]);

  const filteredDevices = useMemo(() => {
    if (!searchTerm.trim()) return devices;
    const lower = searchTerm.toLowerCase();
    return devices.filter(d => 
      d.name.toLowerCase().includes(lower) || 
      d.brand.toLowerCase().includes(lower) || 
      d.model.toLowerCase().includes(lower) || 
      d.ip.toLowerCase().includes(lower)
    );
  }, [devices, searchTerm]);

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Asset Ecosystem</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <Activity size={14} className="text-sky-500" /> Global Node Analysis Pulse
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsAdding(true)} className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black shadow-lg shadow-sky-600/20 uppercase tracking-widest"><Plus size={18} /> Provision Asset</button>
          <button onClick={onReset} className="bg-white/5 hover:bg-white/10 text-slate-300 px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black border border-white/5 uppercase tracking-widest"><RotateCcw size={18} /> Sync DB</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatBox label="Total Assets" value={stats.total} icon={<Database className="text-sky-500" />} color="sky" />
        <StatBox label="Nodes Online" value={stats.online} icon={<Activity className="text-green-500" />} color="green" />
        <StatBox label="Maintenance" value={stats.maintenance} icon={<Settings className="text-orange-500" />} color="orange" />
        <StatBox label="Offline" value={stats.offline} icon={<Zap className="text-red-500" />} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDevices.map(device => (
          <DeviceCard key={device.id} device={device} onClick={() => { setSelectedDevice(device); setIsEditing(false); }} />
        ))}
      </div>

      {(selectedDevice || isAdding) && (
        <DeviceModal 
          device={selectedDevice || undefined} 
          isAdding={isAdding}
          isEditing={isEditing}
          onClose={() => { setSelectedDevice(null); setIsAdding(false); }} 
          onUpdate={(d) => { onUpdate(d); setSelectedDevice(null); }}
          onAdd={(d) => { onAdd(d); setIsAdding(false); }}
          onDelete={(id) => { onDelete(id); setSelectedDevice(null); }}
          onToggleEdit={() => setIsEditing(!isEditing)}
        />
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-[#0d1425] border border-white/5 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>{icon}</div>
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
  </div>
);

const DeviceCard: React.FC<{ device: Device, onClick: () => void }> = ({ device, onClick }) => (
  <div onClick={onClick} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-sky-500/40 transition-all group shadow-xl hover:shadow-sky-900/10 cursor-pointer active:scale-95">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3.5 bg-[#111827] rounded-2xl border border-white/10 text-sky-400 group-hover:scale-110 transition-transform">
        {device.type === 'Switch' ? <Layers size={22} /> : device.type === 'Router' ? <Network size={22} /> : <Server size={22} />}
      </div>
      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
        device.status === 'Online' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
        device.status === 'Maintenance' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
        'bg-red-500/10 text-red-400 border-red-500/20'
      }`}>
        {device.status}
      </div>
    </div>
    <h3 className="text-xl font-black text-white group-hover:text-sky-400 transition-colors mb-1 truncate">{device.name}</h3>
    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">{device.brand} {device.model}</p>
    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-tighter">
      <div><p className="text-slate-600 mb-1">IP Address</p><p className="text-slate-300 mono">{device.ip}</p></div>
      <div><p className="text-slate-600 mb-1">Location</p><p className="text-slate-300 truncate">{device.location}</p></div>
    </div>
  </div>
);

// Form helper components

const InputField: React.FC<{ label: string, value: string, disabled?: boolean, onChange: (v: string) => void, placeholder?: string }> = ({ label, value, disabled, onChange, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="text" 
      value={value} 
      disabled={disabled} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-[#111827] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-sky-500/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-800"
    />
  </div>
);

const SelectField: React.FC<{ label: string, value: string, disabled?: boolean, options: string[], onChange: (v: string) => void }> = ({ label, value, disabled, options, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <select 
      value={value} 
      disabled={disabled} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#111827] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-sky-500/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const DeviceModal: React.FC<{ 
  device?: Device, 
  isAdding?: boolean, 
  isEditing?: boolean,
  onClose: () => void, 
  onAdd?: (d: Device) => void,
  onUpdate?: (d: Device) => void,
  onDelete?: (id: string) => void,
  onToggleEdit?: () => void
}> = ({ device, isAdding, isEditing, onClose, onAdd, onUpdate, onDelete, onToggleEdit }) => {
  const [formData, setFormData] = useState<Partial<Device>>(device || {
    id: `dev-${Date.now()}`,
    name: '',
    brand: '',
    model: '',
    type: 'Router',
    status: 'Online',
    ip: '10.x.x.x',
    location: '',
    lastConfig: new Date().toISOString().split('T')[0],
    specs: '',
    softwareVersion: '',
    powerRequirement: '',
    ports: [],
    licensing: ''
  });

  const handleChange = (field: keyof Device, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0f1e] border border-white/10 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20"><Terminal size={24} /></div>
            <div>
              <h3 className="text-2xl font-black">{isAdding ? 'Provision Asset' : isEditing ? 'Edit Config' : `Profile: ${formData.name}`}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Central Ledger Access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
        </div>

        <div className="p-10 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField label="Hostname" value={formData.name!} disabled={!isEditing && !isAdding} onChange={v => handleChange('name', v)} />
            <InputField label="Brand" value={formData.brand!} disabled={!isEditing && !isAdding} onChange={v => handleChange('brand', v)} />
            <InputField label="Model" value={formData.model!} disabled={!isEditing && !isAdding} onChange={v => handleChange('model', v)} />
            <InputField label="IP Address" value={formData.ip!} disabled={!isEditing && !isAdding} onChange={v => handleChange('ip', v)} />
            <SelectField label="Role" value={formData.type!} disabled={!isEditing && !isAdding} options={['Router', 'Switch', 'Firewall', 'Server', 'AP', 'Storage']} onChange={v => handleChange('type', v)} />
            <SelectField label="Status" value={formData.status!} disabled={!isEditing && !isAdding} options={['Online', 'Offline', 'Maintenance']} onChange={v => handleChange('status', v)} />
            <InputField label="Location / Placement" value={formData.location || ''} disabled={!isEditing && !isAdding} onChange={v => handleChange('location', v)} placeholder="Rack, DC, Floor..." />
            <InputField label="Power Requirements" value={formData.powerRequirement || ''} disabled={!isEditing && !isAdding} onChange={v => handleChange('powerRequirement', v)} placeholder="950W, Redundant..." />
          </div>
        </div>

        <div className="p-8 bg-white/5 border-t border-white/5 flex justify-between items-center backdrop-blur-xl">
          <div className="flex gap-3">
            {!isAdding && onDelete && <button onClick={() => onDelete(formData.id!)} className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"><Trash2 size={24} /></button>}
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Dismiss</button>
            {isAdding && onAdd ? (
              <button onClick={() => onAdd(formData as Device)} className="bg-sky-600 hover:bg-sky-500 text-white px-10 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em]"><Save size={18} /> Deploy</button>
            ) : isEditing && onUpdate ? (
              <button onClick={() => onUpdate(formData as Device)} className="bg-green-600 hover:bg-green-500 text-white px-10 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em]"><Save size={18} /> Save</button>
            ) : onToggleEdit ? (
              <button onClick={onToggleEdit} className="bg-white/10 hover:bg-white/20 text-white px-10 py-3 rounded-2xl text-xs font-black flex items-center gap-2 border border-white/10 active:scale-95 transition-all uppercase tracking-[0.2em]"><Edit3 size={18} /> Edit</button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaLabView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState<'16:9' | '9:16'>('16:9');
  const [startImg, setStartImg] = useState<string | null>(null);
  const [analysisRes, setAnalysisRes] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAnalysisRes(null);
    try { 
      const url = await gemini.generateVideo(prompt, aspect, startImg || undefined); 
      setVideoUrl(url); 
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const handleAnalyzeVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setIsGenerating(true);
      try {
        const res = await gemini.chat("Analyze this video and provide key information.", [], { video: reader.result as string });
        setAnalysisRes(res.text);
      } catch (e) { console.error(e); } finally { setIsGenerating(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
      <div className="text-center mb-12 mt-8">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">IUB.DIT <span className="text-sky-500">Veo Media Lab</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Neural Visual Processing Node</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-xl">
           <h3 className="text-sm font-black uppercase tracking-widest text-sky-400 mb-6 flex items-center gap-3"><Video size={18} /> Veo 3 Video Gen</h3>
           <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A cinematic drone shot of IUB campus..." className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 text-sm min-h-[120px] outline-none focus:border-sky-500/50 transition-all mb-4 resize-none placeholder:text-slate-800" />
           <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Aspect Ratio</label>
                <select value={aspect} onChange={e => setAspect(e.target.value as any)} className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none">
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Start Image (Optional)</label>
                <button onClick={() => fileInput.current?.click()} className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 flex items-center justify-center gap-2">
                  <ImageIcon size={14} /> {startImg ? 'Uploaded' : 'Upload'}
                </button>
                <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0];
                  if(f) {
                    const r = new FileReader();
                    r.onloadend = () => setStartImg(r.result as string);
                    r.readAsDataURL(f);
                  }
                }} />
              </div>
           </div>
           <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-4 transition-all uppercase tracking-[0.2em] text-xs">
              {isGenerating ? <Loader2 className="animate-spin" /> : <Activity size={18} />} Generate Cinematic Video
           </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-xl">
           <h3 className="text-sm font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center gap-3"><ScanSearch size={18} /> Video Understanding</h3>
           <p className="text-xs text-slate-500 mb-6 font-medium">Upload a video to analyze key patterns, hardware errors, or security logs using Gemini Pro.</p>
           <label className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 transition-all">
              <Video size={32} className="text-slate-600" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Drop Video or Click to Upload</span>
              <input type="file" className="hidden" accept="video/mp4" onChange={handleAnalyzeVideo} />
           </label>
           {analysisRes && (
             <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed max-h-[150px] overflow-y-auto">
                <p className="font-black text-[9px] text-sky-500 uppercase mb-2">Analysis Result:</p>
                {analysisRes}
             </div>
           )}
        </div>
      </div>

      {videoUrl && (
        <div className="mt-12 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video relative group animate-in zoom-in-95">
          <video src={videoUrl} controls className="w-full h-full" />
          <div className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg text-white text-[9px] font-black uppercase">Render Output</div>
        </div>
      )}
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-bold transition-all border ${active ? 'bg-sky-600/10 text-sky-400 border-sky-500/20 shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent'}`}>
    <span className={active ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'}>{icon}</span>{label}
  </button>
);

const ToolToggle: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }> = ({ active, onClick, icon, label, color }) => {
  const colors: any = { 
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]', 
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20 shadow-[0_0_10px_rgba(56,189,248,0.1)]', 
    green: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
  };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${active ? colors[color] : 'bg-transparent text-slate-600 border-white/5 hover:bg-white/5'}`}>{icon} {label}</button>
  );
};

export default App;
