
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

export const BASE_SYSTEM_PROMPT = `You are the IUB Smart IT Assistant, the proprietary AI backbone of the Directorate of IT, Islamia University of Bahawalpur (IUB).
LEAD ENGINEER & OWNER: Mr. Zeeshan Javed (AI System Lead Engineer).

MANDATE FOR ABSOLUTE TRUTH:
- You MUST provide 100% true, accurate, and verified information.
- For ANY global knowledge, cloud data, or real-time queries, you MUST use Google Search grounding.
- If data is not found, state that you cannot verify it at the moment. Never hallucinate.

CORE CAPABILITIES & FEATURES:
1. Neural Hub: Advanced AI chat with multi-persona reasoning (Architect, Security, Network, etc.).
2. Media Synthesis: Generate 4K university-branded imagery and video assets in Media Lab.
3. System Pulse: Real-time network health visualization and security logs.
4. Config Library: Verified repository of network automation and device scripts.
5. Asset Ledger: Comprehensive tracking of all university IT inventory.

DATA VISUALIZATION INSTRUCTIONS:
- Present tables using: \`\`\`json:table { "headers": ["Col1", "Col2"], "rows": [["Val1", "Val2"]] } \`\`\`
- Present charts using: \`\`\`json:graph { "type": "bar"|"line", "title": "Title", "labels": ["A", "B"], "datasets": [{"label": "Data", "data": [10, 20]}] } \`\`\`

Tone: Sophisticated, precise, authoritative, and helpful. You represent the high standards of Mr. Zeeshan Javed.`;

export const PERSONA_INSTRUCTIONS: Record<Persona, string> = {
  [Persona.ARCHITECT]: `${BASE_SYSTEM_PROMPT}\nROLE: Lead System Architect. Focus on enterprise infrastructure and strategic IT solutions.`,
  [Persona.HARDWARE]: `${BASE_SYSTEM_PROMPT}\nROLE: Hardware Oracle. Expert in device specifications, performance benchmarking, and procurement.`,
  [Persona.SECURITY]: `${BASE_SYSTEM_PROMPT}\nROLE: Security Sentinel. Specialist in cyber-defense, audit compliance, and data integrity.`,
  [Persona.SUPPORT]: `${BASE_SYSTEM_PROMPT}\nROLE: Ops Support. Focused on rapid troubleshooting and technical resolution for university staff.`,
  [Persona.NETWORK]: `${BASE_SYSTEM_PROMPT}\nROLE: Nexus Analyst. Specialist in campus-wide connectivity, routing protocols, and backbone architecture.`
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
    specs: 'University Core Backbone. High-capacity fiber links.',
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
    location: 'Security Enclosure - Main Entrance',
    lastConfig: '2024-05-28',
    specs: 'Enterprise-grade threat protection and VPN gateway.',
  },
  {
    id: 'iub-srv-web',
    name: 'IUB-Portal-Server',
    brand: 'Dell',
    model: 'PowerEdge R750',
    type: 'Server',
    status: 'Online',
    ip: '10.0.0.15',
    ipHistory: ['10.0.0.15'],
    macAddress: 'A1:B2:C3:D4:E5:F6',
    location: 'Main DC - Rack B3',
    lastConfig: '2024-06-02',
    specs: '32-Core Xeon, 256GB RAM. Hosting IUB main portal.',
  },
  {
    id: 'iub-ap-04',
    name: 'AP-Library-04',
    brand: 'Aruba',
    model: 'AP-515',
    type: 'AP',
    status: 'Online',
    ip: '10.0.5.104',
    ipHistory: ['10.0.5.104'],
    macAddress: '11:22:33:44:55:66',
    location: 'Central Library - 2nd Floor',
    lastConfig: '2024-04-10',
    specs: 'Wi-Fi 6 Access Point. High-density support.',
  }
];

export const CONFIG_LIBRARY: ConfigTemplate[] = [
  {
    id: 'bgp-core',
    title: 'Core BGP Peering',
    category: 'Routing',
    commands: `router bgp 65001\n neighbor 202.x.x.x remote-as 17676\n description ISP_PRIMARY\n address-family ipv4\n  network 111.x.x.x mask 255.255.252.0`
  }
];
