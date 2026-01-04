
export enum AppView {
  CHAT = 'CHAT',
  INVENTORY = 'INVENTORY',
  CONFIG_LIBRARY = 'CONFIG_LIBRARY',
  SECURITY = 'SECURITY',
  PRICING = 'PRICING',
  MEDIA_LAB = 'MEDIA_LAB'
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
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: 'Router' | 'Switch' | 'Firewall' | 'Server' | 'AP' | 'Storage';
  status: 'Online' | 'Offline' | 'Maintenance';
  ip: string;
  location: string;
  lastConfig: string;
  specs: string;
  softwareVersion?: string;
  powerRequirement?: string;
  ports?: string[];
  licensing?: string;
}

export interface ConfigTemplate {
  id: string;
  title: string;
  category: string;
  commands: string;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';
