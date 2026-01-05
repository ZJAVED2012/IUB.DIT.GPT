
export enum AppView {
  CHAT = 'CHAT',
  INVENTORY = 'INVENTORY',
  DEVICE_MANAGEMENT = 'DEVICE_MANAGEMENT',
  CONFIG_LIBRARY = 'CONFIG_LIBRARY',
  SECURITY = 'SECURITY',
  PRICING = 'PRICING',
  MEDIA_LAB = 'MEDIA_LAB',
  LIVE = 'LIVE',
  SYSTEM_EVENTS = 'SYSTEM_EVENTS',
  SETTINGS = 'SETTINGS'
}

export enum Persona {
  ARCHITECT = 'System Architect',
  HARDWARE = 'Hardware Oracle',
  SECURITY = 'Security Sentinel',
  SUPPORT = 'Ops Support',
  NETWORK = 'Nexus Analyst'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
  image?: string;
  video?: string;
  audio?: string;
  isThinking?: boolean;
  persona?: Persona;
}

export type DeviceType = 
  | 'Core Switch' 
  | 'Switch' 
  | 'Router' 
  | 'Firewall' 
  | 'Server' 
  | 'AP' 
  | 'IP Phone' 
  | 'PC' 
  | 'Laptop' 
  | 'Printer' 
  | 'Storage';

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: DeviceType;
  status: 'Online' | 'Offline' | 'Maintenance';
  ip: string;
  ipHistory: string[];
  macAddress: string;
  location: string;
  lastConfig: string;
  specs: string;
  softwareVersion?: string;
  powerRequirement?: string;
  ports?: string[];
  image?: string; // New: Device visual asset
}

export interface SystemEvent {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface ConfigTemplate {
  id: string;
  title: string;
  category: string;
  commands: string;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface ThemeConfig {
  mode: 'dark' | 'light';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}
