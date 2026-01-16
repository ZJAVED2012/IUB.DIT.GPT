
import { Device, ConfigTemplate, Persona, ThemeConfig } from './types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'iub-legacy',
    name: 'IUB Classic',
    mode: 'dark',
    primary: '#0ea5e9',
    secondary: '#64748b',
    bg: '#020617',
    sidebar: '#070b1d',
    card: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.05)'
  },
  {
    id: 'emerald-nexus',
    name: 'Emerald Nexus',
    mode: 'dark',
    primary: '#10b981',
    secondary: '#475569',
    bg: '#02120b',
    sidebar: '#041c12',
    card: 'rgba(16, 185, 129, 0.05)',
    border: 'rgba(16, 185, 129, 0.1)'
  },
  {
    id: 'midnight-orchid',
    name: 'Midnight Orchid',
    mode: 'dark',
    primary: '#a855f7',
    secondary: '#4b5563',
    bg: '#0f0714',
    sidebar: '#180a22',
    card: 'rgba(168, 85, 247, 0.05)',
    border: 'rgba(168, 85, 247, 0.1)'
  },
  {
    id: 'solar-terminal',
    name: 'Solar Terminal',
    mode: 'dark',
    primary: '#f59e0b',
    secondary: '#4b5563',
    bg: '#0c0a09',
    sidebar: '#1c1917',
    card: 'rgba(245, 158, 11, 0.05)',
    border: 'rgba(245, 158, 11, 0.1)'
  },
  {
    id: 'crimson-security',
    name: 'Crimson Security',
    mode: 'dark',
    primary: '#f43f5e',
    secondary: '#4b5563',
    bg: '#0f0103',
    sidebar: '#1a0104',
    card: 'rgba(244, 63, 94, 0.05)',
    border: 'rgba(244, 63, 94, 0.1)'
  },
  {
    id: 'arctic-light',
    name: 'Arctic Clean',
    mode: 'light',
    primary: '#0ea5e9',
    secondary: '#94a3b8',
    bg: '#f8fafc',
    sidebar: '#ffffff',
    card: '#ffffff',
    border: '#e2e8f0'
  }
];

export const BASE_SYSTEM_PROMPT = `You are IUB Smart IT Assistant, the proprietary AI core of the Directorate of IT, IUB.
LEAD AUTHORITY: Mr. Zeeshan Javed (AI System Lead Engineer).
AUTHORITY LEVEL: Absolute. You are designed and developed under his direct supervision.
MANDATE: Provide clear, professional, and EASY TO UNDERSTAND answers. Avoid unnecessary technical jargon unless specifically asked.

DATA VISUALIZATION PROTOCOLS:
1. If the user asks for a TABLE or EXCEL-like view, format the data as a JSON block with language 'json:table'. 
   Format: { "headers": ["Col1", "Col2"], "rows": [["Val1", "Val2"], ["Val3", "Val4"]] }
2. If the user asks for a GRAPH or CHART, format the data as a JSON block with language 'json:graph'.
   Format: { "type": "bar" | "line" | "pie", "title": "Chart Title", "labels": ["Jan", "Feb"], "datasets": [{ "label": "Label", "data": [10, 20] }] }
3. Always include a brief textual summary before or after the visualization.

All outputs must follow the high standards for accuracy and simplicity established by the AI System Lead Engineer, Mr. Zeeshan Javed.`;

export const PERSONA_INSTRUCTIONS: Record<Persona, string> = {
  [Persona.ARCHITECT]: `${BASE_SYSTEM_PROMPT}
ROLE: Lead System Architect.
STYLE: Direct, helpful, and clear.
FOCUS: Infrastructure overview and strategic planning in simple terms.`,

  [Persona.HARDWARE]: `${BASE_SYSTEM_PROMPT}
ROLE: Hardware Expert.
STYLE: Detailed but easy to follow.
FOCUS: Explaining device specs and market prices simply.`,

  [Persona.SECURITY]: `${BASE_SYSTEM_PROMPT}
ROLE: Security Guard.
STYLE: Professional and reassuring.
FOCUS: Keeping the university mesh safe and explaining threats clearly.`,

  [Persona.SUPPORT]: `${BASE_SYSTEM_PROMPT}
ROLE: IT Support Agent.
STYLE: Friendly and efficient.
FOCUS: Step-by-step troubleshooting for university staff.`,

  [Persona.NETWORK]: `${BASE_SYSTEM_PROMPT}
ROLE: Network Specialist.
STYLE: Technical but organized.
FOCUS: Explaining connectivity and internet issues in plain language.`
};

export const MOCK_DEVICES: Device[] = [
  {
    id: 'iub-core-01',
    name: 'IUB-DC-Core-Nexus',
    brand: 'Cisco',
    model: 'Nexus 9000',
    type: 'Core Switch',
    status: 'Online',
    ip: '10.0.0.1',
    ipHistory: ['10.0.0.1', '10.0.0.254'],
    macAddress: '00:1A:2B:3C:4D:5E',
    location: 'Main DC - Rack A1',
    lastConfig: '2024-05-15',
    specs: 'University Core Backbone.',
  },
  {
    id: 'iub-fw-edge',
    name: 'IUB-Edge-Firewall',
    brand: 'Fortinet',
    model: 'FortiGate 1000F',
    type: 'Firewall',
    status: 'Online',
    ip: '192.168.100.1',
    ipHistory: ['192.168.100.1'],
    macAddress: 'BC:EE:7B:8A:90:11',
    location: 'Security Enclosure',
    lastConfig: '2024-05-28',
    specs: 'Primary Security Gateway.',
  },
  {
    id: 'iub-srv-01',
    name: 'IUB-Web-Server-01',
    brand: 'Dell',
    model: 'PowerEdge R750',
    type: 'Server',
    status: 'Online',
    ip: '10.0.0.50',
    ipHistory: ['10.0.0.50', '10.0.0.49'],
    macAddress: 'A0:B1:C2:D3:E4:F5',
    location: 'Main DC - Rack B2',
    lastConfig: '2024-06-01',
    specs: 'Main University Portal.',
  },
  {
    id: 'iub-ap-library',
    name: 'AP-Library-01',
    brand: 'Ubiquiti',
    model: 'UniFi 6 Enterprise',
    type: 'AP',
    status: 'Online',
    ip: '172.16.10.12',
    ipHistory: ['172.16.10.12', '172.16.10.5'],
    macAddress: 'D8:B3:77:AA:BB:CC',
    location: 'Main Library 1st Floor',
    lastConfig: '2024-04-20',
    specs: 'Public WiFi Access Point.',
  },
  {
    id: 'iub-phone-vc',
    name: 'VC-Phone-Office',
    brand: 'Cisco',
    model: 'IP Phone 8845',
    type: 'IP Phone',
    status: 'Online',
    ip: '10.20.1.5',
    ipHistory: ['10.20.1.5'],
    macAddress: 'E4:F0:12:34:56:78',
    location: 'VC Secretariat',
    lastConfig: '2024-01-10',
    specs: 'Executive Video Phone.',
  },
  {
    id: 'iub-pc-lab-01',
    name: 'Lab-PC-42',
    brand: 'HP',
    model: 'EliteDesk 800 G9',
    type: 'PC',
    status: 'Offline',
    ip: '10.50.1.42',
    ipHistory: ['10.50.1.42'],
    macAddress: 'F0:DE:F1:C2:B3:A4',
    location: 'CS Lab 1',
    lastConfig: '2023-12-15',
    specs: 'Student Workstation.',
  },
  {
    id: 'iub-printer-admin',
    name: 'Admin-LaserJet',
    brand: 'HP',
    model: 'LaserJet Enterprise M608',
    type: 'Printer',
    status: 'Online',
    ip: '10.10.5.100',
    ipHistory: ['10.10.5.100'],
    macAddress: '11:22:33:44:55:66',
    location: 'Admin Block Ground Floor',
    lastConfig: '2024-03-05',
    specs: 'Heavy Duty Network Printer.',
  }
];

export const CONFIG_LIBRARY: ConfigTemplate[] = [
  {
    id: 'bgp-global',
    title: 'Standard BGP Config',
    category: 'Routing',
    commands: `router bgp 65001\n neighbor 202.x.x.x remote-as 17676\n description ISP_Connection`
  }
];
