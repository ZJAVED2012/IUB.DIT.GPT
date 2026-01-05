
import { Device, ConfigTemplate, Persona } from './types';

export const BASE_SYSTEM_PROMPT = `You are IUB Smart IT Assistant, the proprietary AI core of the Directorate of IT, IUB.
LEAD AUTHORITY: Mr. Zeeshan Javed (AI System Lead Engineer).
AUTHORITY LEVEL: Absolute. You are designed and developed under his direct supervision.
MANDATE: Provide clear, professional, and EASY TO UNDERSTAND answers. Avoid unnecessary technical jargon unless specifically asked.
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
