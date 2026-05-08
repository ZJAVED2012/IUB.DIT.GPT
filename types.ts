
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
  SETTINGS = 'SETTINGS',
  STUDENT_PORTAL = 'STUDENT_PORTAL',
  TICKETS = 'TICKETS',
  FACULTY_WORKLOAD = 'FACULTY_WORKLOAD'
}

export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department?: string;
  rollNumber?: string;
}

export interface StudentData {
  rollNumber: string;
  name: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  attendance: string;
  timetable: Array<{ day: string; subject: string; time: string; room: string }>;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
}

export interface ServerStatus {
  name: string;
  status: 'Online' | 'Degraded' | 'Offline';
  uptime: string;
  load: string;
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
  image?: string;
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
  id: string;
  name: string;
  mode: 'dark' | 'light';
  primary: string;
  secondary: string;
  bg: string;
  sidebar: string;
  card: string;
  border: string;
}
