
import { Device, ConfigTemplate, Persona } from './types';

export const BASE_SYSTEM_PROMPT = `You are IUB.DIT.GPT v5.0, the proprietary AI core of the Directorate of IT, IUB.
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
    id: 'cisco-9500',
    name: 'IUB-DC-Core-01',
    brand: 'Cisco',
    model: 'Catalyst 9500',
    type: 'Switch',
    status: 'Online',
    ip: '10.0.0.1',
    location: 'Main DC - Rack A1',
    lastConfig: '2024-05-15',
    specs: 'Core Network Backbone Switch.',
    softwareVersion: 'IOS XE 17.9',
    powerRequirement: 'Dual 950W',
    ports: ['48x 25G', '4x 100G']
  },
  {
    id: 'palo-alto-5450',
    name: 'IUB-Edge-Firewall',
    brand: 'Palo Alto',
    model: 'PA-5450',
    type: 'Firewall',
    status: 'Online',
    ip: '192.168.100.1',
    location: 'Edge Enclosure',
    lastConfig: '2024-05-28',
    specs: 'Main Internet Security Gate.',
    softwareVersion: 'PAN-OS 11.0',
    powerRequirement: 'Redundant 2000W',
    ports: ['Multi-Gigabit SFP+']
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
