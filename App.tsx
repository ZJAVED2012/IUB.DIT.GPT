
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
  Fingerprint
} from 'lucide-react';
import { AppView, Message, Device } from './types';
import { MOCK_DEVICES, CONFIG_LIBRARY } from './constants';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [inventorySearch, setInventorySearch] = useState('');
  
  // Persistent State for Devices
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('iub_dit_inventory');
    return saved ? JSON.parse(saved) : MOCK_DEVICES;
  });

  useEffect(() => {
    localStorage.setItem('iub_dit_inventory', JSON.stringify(devices));
  }, [devices]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to IUB.DIT.GPT. I am your specialized Intelligent Assistant for the Directorate of IT, Islamia University of Bahawalpur.\n\nCreated by **Mr. Zeeshan Javed**, AI Engineer, Directorate of IT, The Islamia University of Bahawalpur.\n\nMy core database now includes world-class network intelligence. You can now manage, provision, and decommission devices in the Global Inventory view. How can I assist the Directorate today?",
      timestamp: new Date()
    }
  ]);
  
  // Chat Feature States
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) return;
    if (isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      let response;
      if (currentImage && (input.toLowerCase().includes('edit') || input.toLowerCase().includes('change') || input.toLowerCase().includes('add'))) {
        response = await gemini.editImage(input, currentImage);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.text || "Image processed successfully.",
          image: response.image,
          timestamp: new Date()
        }]);
      } else {
        response = await gemini.chat(input, history, {
          useThinking,
          useSearch,
          useMaps,
          image: currentImage || undefined
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
        content: "Error: Failed to process request. Please ensure API credentials are valid.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsTyping(true);
          const transcription = await gemini.transcribeAudio(base64Audio);
          setInput(prev => prev + (prev ? ' ' : '') + transcription);
          setIsTyping(false);
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Access Denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Device Management Functions
  const addDevice = (newDevice: Device) => setDevices([newDevice, ...devices]);
  const updateDevice = (updated: Device) => setDevices(devices.map(d => d.id === updated.id ? updated : d));
  const removeDevice = (id: string) => setDevices(devices.filter(d => d.id !== id));
  const resetInventory = () => {
    if(confirm("Factory reset inventory database? This cannot be undone.")) {
      setDevices(MOCK_DEVICES);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-100">
      <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-sky-600 rounded-lg shadow-lg shadow-sky-600/20">
            <Network size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">IUB.DIT.GPT</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Directorate of IT</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<MessageSquare size={18} />} label="Intelligent Chat" active={activeView === AppView.CHAT} onClick={() => setActiveView(AppView.CHAT)} />
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Device Inventory" active={activeView === AppView.INVENTORY} onClick={() => setActiveView(AppView.INVENTORY)} />
          <SidebarItem icon={<Video size={18} />} label="Media Lab (Veo)" active={activeView === AppView.MEDIA_LAB} onClick={() => setActiveView(AppView.MEDIA_LAB)} />
          <SidebarItem icon={<Cpu size={18} />} label="Config Library" active={activeView === AppView.CONFIG_LIBRARY} onClick={() => setActiveView(AppView.CONFIG_LIBRARY)} />
          <SidebarItem icon={<ShieldCheck size={18} />} label="Security Hardening" active={activeView === AppView.SECURITY} onClick={() => setActiveView(AppView.SECURITY)} />
          <SidebarItem icon={<DollarSign size={18} />} label="Pricing Analytics" active={activeView === AppView.PRICING} onClick={() => setActiveView(AppView.PRICING)} />
        </nav>

        <div className="px-5 py-4 bg-slate-900/40 border-t border-slate-800/50">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Award size={14} className="text-amber-500" /> Lead Architect
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Mr. Zeeshan Javed</p>
              <p className="text-[10px] text-sky-400 font-bold uppercase tracking-tighter">AI Engineer • Directorate of IT</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 ring-2 ring-slate-800 text-xs">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Admin Node</p>
              <p className="text-[10px] text-slate-500 truncate font-semibold uppercase tracking-tight">Root Access</p>
            </div>
            <LogOut size={16} className="text-slate-500 cursor-pointer hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-slate-900 relative">
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Operational</span>
            </div>
            <div className="h-4 w-px bg-slate-700 mx-2"></div>
            <span className="text-xs font-medium text-slate-500">v4.5.0-Enterprise</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={14} />
              <input 
                type="text" 
                value={activeView === AppView.INVENTORY ? inventorySearch : ''}
                onChange={(e) => activeView === AppView.INVENTORY && setInventorySearch(e.target.value)}
                placeholder={activeView === AppView.INVENTORY ? "Search Device Database..." : "Search DIT Tools..."}
                className="bg-slate-800 border border-slate-700 rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-64 outline-none transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {activeView === AppView.CHAT && (
          <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-6 ${msg.role === 'user' ? 'bg-sky-600 shadow-xl shadow-sky-950/20' : 'bg-slate-800 border border-slate-700'}`}>
                    <div className="flex items-center gap-2 mb-3 text-[10px] opacity-60 font-bold uppercase tracking-[0.2em]">
                      {msg.role === 'assistant' ? 'IUB.DIT.GPT Intelligence Node' : 'Local Terminal'}
                    </div>
                    {msg.image && <img src={msg.image} className="mb-4 rounded-lg max-h-96 w-auto border border-slate-700" alt="Upload" />}
                    <div className="whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm lg:prose-base">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex justify-start"><div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 px-6 flex gap-2"><div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div></div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-8 pt-0">
              <div className="flex gap-2 mb-3">
                <ToolToggle active={useThinking} onClick={() => setUseThinking(!useThinking)} icon={<BrainCircuit size={14} />} label="Thinking" color="purple" />
                <ToolToggle active={useSearch} onClick={() => setUseSearch(!useSearch)} icon={<Globe size={14} />} label="Search" color="sky" />
                <ToolToggle active={useMaps} onClick={() => setUseMaps(!useMaps)} icon={<MapPin size={14} />} label="Maps" color="green" />
              </div>
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Analyze hardware, request configs, or troubleshoot architecture..."
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-4 px-6 pr-44 focus:border-sky-500 outline-none resize-none min-h-[110px] shadow-2xl"
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-sky-400 bg-slate-900 rounded-xl border border-slate-700"><ImageIcon size={20} /></button>
                  <button onMouseDown={startRecording} onMouseUp={stopRecording} className={`p-3 rounded-xl border border-slate-700 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-900 text-slate-400'}`}><Mic size={20} /></button>
                  <button onClick={handleSendMessage} disabled={isTyping || !input.trim()} className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl px-5 py-3 font-bold transition-all ml-2">Execute</button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                <span>Secure IUB-DIT Communication Channel</span>
                <span>Created by Mr. Zeeshan Javed AI Engineer DIT</span>
              </div>
            </div>
          </div>
        )}

        {activeView === AppView.INVENTORY && <InventoryView devices={devices} onAdd={addDevice} onUpdate={updateDevice} onDelete={removeDevice} onReset={resetInventory} searchTerm={inventorySearch} />}
        {activeView === AppView.CONFIG_LIBRARY && <ConfigView configs={CONFIG_LIBRARY} />}
        {activeView === AppView.SECURITY && <SecurityView />}
        {activeView === AppView.PRICING && <PricingView />}
        {activeView === AppView.MEDIA_LAB && <MediaLabView />}
      </main>
    </div>
  );
};

// --- Sub-Components ---

const InventoryView: React.FC<{ devices: Device[], onAdd: (d: Device) => void, onUpdate: (d: Device) => void, onDelete: (id: string) => void, onReset: () => void, searchTerm: string }> = ({ devices, onAdd, onUpdate, onDelete, onReset, searchTerm }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter(d => d.status === 'Online').length,
    maintenance: devices.filter(d => d.status === 'Maintenance').length,
    critical: devices.filter(d => d.status === 'Offline').length
  }), [devices]);

  const filteredDevices = useMemo(() => {
    if (!searchTerm.trim()) return devices;
    const lower = searchTerm.toLowerCase();
    return devices.filter(d => d.name.toLowerCase().includes(lower) || d.brand.toLowerCase().includes(lower) || d.model.toLowerCase().includes(lower) || d.ip.toLowerCase().includes(lower));
  }, [devices, searchTerm]);

  return (
    <div className="p-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-slate-800">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enterprise Asset Management</h2>
          <p className="text-slate-400 mt-1 font-medium">Real-time Directorate NOC Statistics and Global Device Inventory.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsAdding(true)} className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-sky-600/20"><Plus size={18} /> Provision Asset</button>
          <button onClick={onReset} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold border border-slate-700"><RotateCcw size={18} /> Reset Database</button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatBox label="Total Assets" value={stats.total} icon={<Database className="text-sky-500" />} color="sky" />
        <StatBox label="Nodes Online" value={stats.online} icon={<Activity className="text-green-500" />} color="green" />
        <StatBox label="Maintenance" value={stats.maintenance} icon={<Settings className="text-orange-500" />} color="orange" />
        <StatBox label="Offline / Alert" value={stats.critical} icon={<Zap className="text-red-500" />} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDevices.map(device => (
          <DeviceCard key={device.id} device={device} onClick={() => { setSelectedDevice(device); setIsEditing(false); }} />
        ))}
      </div>

      {/* Detail / Edit Modal */}
      {selectedDevice && (
        <DeviceModal 
          device={selectedDevice} 
          isEditing={isEditing}
          onClose={() => setSelectedDevice(null)} 
          onUpdate={(d) => { onUpdate(d); setSelectedDevice(null); }}
          onDelete={(id) => { onDelete(id); setSelectedDevice(null); }}
          onToggleEdit={() => setIsEditing(!isEditing)}
        />
      )}

      {/* Add Modal */}
      {isAdding && (
        <DeviceModal 
          isAdding
          onClose={() => setIsAdding(false)} 
          onAdd={(d) => { onAdd(d); setIsAdding(false); }}
        />
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10`}>{icon}</div>
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
  </div>
);

const DeviceCard: React.FC<{ device: Device, onClick: () => void }> = ({ device, onClick }) => (
  <div onClick={onClick} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-sky-500/50 transition-all shadow-lg group cursor-pointer active:scale-[0.98]">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${device.status === 'Offline' ? 'bg-red-500/10 text-red-500' : 'bg-sky-500/10 text-sky-400'}`}>
        {device.type === 'Switch' ? <Layers size={22} /> : device.type === 'Firewall' ? <ShieldCheck size={22} /> : device.type === 'Router' ? <Network size={22} /> : <Server size={22} />}
      </div>
      <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
        device.status === 'Online' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
        device.status === 'Maintenance' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
        'bg-red-500/10 text-red-500 border-red-500/20'
      }`}>
        {device.status}
      </div>
    </div>
    <h3 className="text-lg font-bold truncate group-hover:text-sky-400 transition-colors">{device.name}</h3>
    <p className="text-xs text-slate-400 mb-6 font-medium">{device.brand} {device.model}</p>
    <div className="space-y-2 pt-4 border-t border-slate-700/50 text-[10px] font-bold uppercase tracking-tighter">
      <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="text-slate-200 mono">{device.ip}</span></div>
      <div className="flex justify-between"><span className="text-slate-500">Last Configured</span><span className="text-slate-300">{device.lastConfig}</span></div>
    </div>
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
    location: 'Main DC',
    lastConfig: new Date().toISOString().split('T')[0],
    specs: '',
    softwareVersion: '',
    powerRequirement: '',
    ports: [],
    licensing: ''
  });

  const handleChange = (field: keyof Device, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><Terminal size={20} /></div>
            <div>
              <h3 className="text-xl font-bold">{isAdding ? 'Provision Global Asset' : isEditing ? 'Edit Configuration Trace' : `Asset Detail: ${formData.name}`}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IUB.DIT Central Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-full transition-all"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Prominent Device ID Section */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-5 mb-2 shadow-inner">
             <div className="p-3.5 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20">
               <Fingerprint size={28} />
             </div>
             <div className="flex-1">
               <label className="block text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] mb-1.5">Primary Asset Identity (UUID)</label>
               <input 
                 type="text" 
                 value={formData.id!} 
                 disabled={!isAdding}
                 onChange={e => handleChange('id', e.target.value)}
                 className={`w-full bg-transparent border-none text-2xl font-black mono outline-none p-0 leading-tight ${!isAdding ? 'text-slate-500 cursor-not-allowed' : 'text-slate-100 focus:text-sky-400'}`}
                 placeholder="DIT-NODE-XXXX"
               />
               <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Unique Global Reference for Directorate Ledger</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Asset Hostname" value={formData.name!} disabled={!isEditing && !isAdding} onChange={v => handleChange('name', v)} />
            <InputField label="Device Brand" value={formData.brand!} disabled={!isEditing && !isAdding} onChange={v => handleChange('brand', v)} />
            <InputField label="Model Series" value={formData.model!} disabled={!isEditing && !isAdding} onChange={v => handleChange('model', v)} />
            <InputField label="Management IP" value={formData.ip!} disabled={!isEditing && !isAdding} onChange={v => handleChange('ip', v)} />
            <SelectField label="Device Type" value={formData.type!} disabled={!isEditing && !isAdding} options={['Router', 'Switch', 'Firewall', 'Server', 'AP', 'Storage']} onChange={v => handleChange('type', v)} />
            <SelectField label="Node Status" value={formData.status!} disabled={!isEditing && !isAdding} options={['Online', 'Offline', 'Maintenance']} onChange={v => handleChange('status', v)} />
            <InputField label="Software / OS Version" value={formData.softwareVersion || ''} disabled={!isEditing && !isAdding} onChange={v => handleChange('softwareVersion', v)} />
            <InputField label="Licensing Tier" value={formData.licensing || ''} disabled={!isEditing && !isAdding} onChange={v => handleChange('licensing', v)} />
            <InputField label="Power Requirements" value={formData.powerRequirement || ''} disabled={!isEditing && !isAdding} onChange={v => handleChange('powerRequirement', v)} />
            <InputField label="Ports & Interfaces" value={formData.ports?.join(', ') || ''} disabled={!isEditing && !isAdding} onChange={v => handleChange('ports', v.split(',').map(s => s.trim()))} />
            <InputField label="Last Configured" value={formData.lastConfig!} disabled={!isEditing && !isAdding} onChange={v => handleChange('lastConfig', v)} />
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Hardware Trace & Specifications</h4>
            <textarea 
              disabled={!isEditing && !isAdding}
              value={formData.specs}
              onChange={e => handleChange('specs', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 min-h-[100px] outline-none focus:border-sky-500 transition-all"
              placeholder="Detail architecture, CPU, RAM, and global throughput specs..."
            />
          </div>
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
          <div className="flex gap-2">
            {!isAdding && (
              <button onClick={() => onDelete!(formData.id!)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Decommission Device"><Trash2 size={20} /></button>
            )}
            <button className="p-3 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-all" title="Export Datasheet"><FileJson size={20} /></button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
            {isAdding ? (
              <button onClick={() => onAdd!(formData as Device)} className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-950/20 active:scale-95 transition-all uppercase tracking-widest"><Save size={16} /> Finalize Provision</button>
            ) : isEditing ? (
              <button onClick={() => onUpdate!(formData as Device)} className="bg-green-600 hover:bg-green-500 text-white px-8 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-green-950/20 active:scale-95 transition-all uppercase tracking-widest"><Save size={16} /> Commit Changes</button>
            ) : (
              <button onClick={onToggleEdit} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 active:scale-95 transition-all uppercase tracking-widest"><Edit3 size={16} /> Enter Edit Mode</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string, value: string, disabled?: boolean, onChange: (v: string) => void }> = ({ label, value, disabled, onChange }) => (
  <div>
    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input 
      type="text" 
      value={value} 
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-slate-950 border ${disabled ? 'border-slate-800 text-slate-500 cursor-not-allowed' : 'border-slate-700 text-slate-100 focus:border-sky-500'} rounded-xl px-4 py-2.5 text-sm outline-none transition-all`}
    />
  </div>
);

const SelectField: React.FC<{ label: string, value: string, disabled?: boolean, options: string[], onChange: (v: any) => void }> = ({ label, value, disabled, options, onChange }) => (
  <div>
    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <select 
      value={value} 
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-slate-950 border ${disabled ? 'border-slate-800 text-slate-500 cursor-not-allowed' : 'border-slate-700 text-slate-100 focus:border-sky-500'} rounded-xl px-4 py-2.5 text-sm outline-none transition-all appearance-none`}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${active ? 'bg-sky-600/10 text-sky-400 border-sky-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'}`}>
    <span className={active ? 'text-sky-400' : 'text-slate-500'}>{icon}</span>{label}
  </button>
);

const ToolToggle: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }> = ({ active, onClick, icon, label, color }) => {
  const colors: any = { purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20', sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20', green: 'text-green-400 bg-green-500/10 border-green-500/20' };
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${active ? colors[color] : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}>{icon} {label}</button>
  );
};

// --- Reused Sections from Previous Build ---
const ConfigView: React.FC<{ configs: any[] }> = ({ configs }) => (
  <div className="p-8 overflow-y-auto">
    <h2 className="text-3xl font-bold mb-2 tracking-tight">CLI Configuration Library</h2>
    <p className="text-slate-400 mb-8 font-medium italic">Standardized templates for IUB Directorate of IT.</p>
    <div className="space-y-6">
      {configs.map(config => (
        <div key={config.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500"><Database size={18} /></div>
              <h3 className="font-bold text-slate-100">{config.title}</h3>
              <span className="px-2 py-0.5 rounded-lg bg-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{config.category}</span>
            </div>
            <button className="text-[10px] font-bold text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-sky-600 hover:text-white transition-all">Copy CLI</button>
          </div>
          <div className="p-6 bg-slate-950 font-mono text-xs sm:text-sm leading-relaxed text-sky-100/90 overflow-x-auto"><pre className="whitespace-pre-wrap">{config.commands}</pre></div>
        </div>
      ))}
    </div>
  </div>
);

const SecurityView: React.FC = () => (
  <div className="p-8 h-full flex items-center justify-center">
    <div className="bg-slate-800 border-2 border-slate-700 border-dashed rounded-3xl p-12 text-center max-w-3xl shadow-2xl">
      <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8"><ShieldCheck size={48} className="text-red-500" /></div>
      <h3 className="text-2xl font-bold mb-4 text-slate-100">Centralized Security Audit Node</h3>
      <p className="text-slate-400 mb-10 leading-relaxed text-lg font-medium">Access latest hardening guides for IUB-DIT infrastructure. Compliance checks and STIGS are generated in real-time by the Core AI.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="bg-slate-700 hover:bg-slate-600 p-5 rounded-2xl font-bold text-sm border border-slate-600 transition-all flex items-center justify-center gap-3"><Database size={18} /> Cisco STIG Baseline</button>
        <button className="bg-slate-700 hover:bg-slate-600 p-5 rounded-2xl font-bold text-sm border border-slate-600 transition-all flex items-center justify-center gap-3"><Server size={18} /> NIST Server Hardening</button>
      </div>
    </div>
  </div>
);

const PricingView: React.FC = () => (
  <div className="p-8 overflow-y-auto">
    <h2 className="text-3xl font-bold tracking-tight mb-8">Market Pricing & Procurement</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg text-green-500"><ExternalLink size={20} /></div>Global Market Analytics</h3>
        <div className="space-y-6">
          <PriceTrendItem label="Cisco Catalyst 9500 (Core)" price="$8,500 - $14,000" trend="up" />
          <PriceTrendItem label="FortiGate 600F Firewall" price="$6,800 - $7,500" trend="stable" />
          <PriceTrendItem label="HP ProLiant DL380 Gen11" price="$5,200 - $9,000" trend="down" />
        </div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-3"><div className="p-2 bg-sky-500/10 rounded-lg text-sky-500"><DollarSign size={20} /></div>Pakistan Local Market (PKR)</h3>
        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Base Conversion Rate</p>
          <p className="text-4xl font-black text-sky-400">1 USD = 280.45 <span className="text-sm font-medium text-slate-500">PKR</span></p>
        </div>
      </div>
    </div>
  </div>
);

const MediaLabView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const handleGenerateVideo = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try { setVideoUrl(await gemini.generateVideo(prompt, '16:9')); } 
    catch (err) { alert("Video generation failed. Check API key."); } 
    finally { setIsGenerating(false); }
  };
  return (
    <div className="p-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-sky-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-500"><Video size={32} /></div>
        <h2 className="text-4xl font-black mb-2 tracking-tight">IUB.DIT.GPT <span className="text-sky-400">Veo Media Lab</span></h2>
        <p className="text-slate-400 font-medium">Professional Visual Computing for Directorate of IT.</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A hyper-realistic data center fly-through..." className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-lg min-h-[150px] outline-none focus:border-sky-500 transition-all mb-6 resize-none" />
        <button onClick={handleGenerateVideo} disabled={isGenerating || !prompt.trim()} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-sky-600/20 transition-all">{isGenerating ? <Loader2 className="animate-spin" /> : <Activity />} Generate Visual Render</button>
      </div>
      {videoUrl && <div className="mt-8 bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"><video src={videoUrl} controls className="w-full aspect-video bg-black" /></div>}
    </div>
  );
};

const PriceTrendItem: React.FC<{ label: string, price: string, trend: 'up' | 'down' | 'stable' }> = ({ label, price, trend }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 px-2 rounded-lg transition-colors group">
    <span className="text-sm font-bold text-slate-200 group-hover:text-sky-400">{label}</span>
    <div className="text-right">
      <p className="text-sm font-black text-slate-100">{price}</p>
      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-slate-400'}`}>{trend}</span>
    </div>
  </div>
);

export default App;
