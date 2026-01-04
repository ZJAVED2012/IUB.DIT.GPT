
import { Device, ConfigTemplate } from './types';

export const SYSTEM_INSTRUCTION = `You are the IUB.DIT.GPT v4.5, the Official Precision Intelligence AI for the Directorate of IT, Islamia University of Bahawalpur. 

DEVELOPER: Created by Mr. Zeeshan Javed, AI Engineer, Directorate of IT, The Islamia University of Bahawalpur.

OPERATIONAL MANDATE:
- Provide 100% ACCURATE, verified, and real-time information.
- ALWAYS use the googleSearch tool for hardware specs, current market pricing (USD/PKR), and recent cybersecurity threats.
- If you are unsure, use search grounding to verify the facts before responding.
- Support deep technical analysis of enterprise infrastructure from Cisco, Juniper, Arista, Palo Alto, and others.

ACCURACY PROTOCOL:
1. Grounding: Cite your sources. If you pull data from the web, ensure the user sees the source.
2. Market Data: For pricing, state that these are current estimates and can vary based on import duties in Pakistan.
3. Multilingual: Fluidly switch between English, Urdu, and Roman Urdu.

Your primary goal is to ensure the Directorate of IT has the most reliable intelligence in the region.`;

export const MOCK_DEVICES: Device[] = [
  {
    id: 'cisco-9500',
    name: 'IUB-DC-Core-01',
    brand: 'Cisco',
    model: 'Catalyst 9500-48Y4C',
    type: 'Switch',
    status: 'Online',
    ip: '10.0.0.1',
    location: 'Main DC - Rack A1',
    lastConfig: '2024-05-15',
    specs: 'High-density 25G/100G core switch. Performance: 6.4 Tbps / 2 Bpps.',
    softwareVersion: 'Cisco IOS XE 17.9.4a',
    powerRequirement: 'Dual 950W Platinum AC',
    ports: ['48x 25G SFP28', '4x 100G QSFP28']
  },
  {
    id: 'palo-alto-5450',
    name: 'IUB-Edge-Threat-Defense',
    brand: 'Palo Alto',
    model: 'PA-5450',
    type: 'Firewall',
    status: 'Online',
    ip: '192.168.100.1',
    location: 'Edge Enclosure',
    lastConfig: '2024-05-28',
    specs: 'Modular ML-Powered NGFW. 120 Gbps Threat Prevention throughput.',
    softwareVersion: 'PAN-OS 11.0.2',
    powerRequirement: 'N+1 Redundant 2+2 (2000W)',
    ports: ['NC-A: 4x 100G, 12x 25G']
  },
  {
    id: 'juniper-mx204',
    name: 'IUB-ISP-Edge-01',
    brand: 'Juniper',
    model: 'MX204',
    type: 'Router',
    status: 'Online',
    ip: '202.163.x.x',
    location: 'ISP Handover Room',
    lastConfig: '2024-04-10',
    specs: 'Fixed-configuration 1U router. 400 Gbps throughput. Trio 5 chipset.',
    softwareVersion: 'Junos OS 22.4R1',
    powerRequirement: 'Dual 650W AC/DC',
    ports: ['4x 100G QSFP28', '8x 10G SFP+']
  }
];

export const CONFIG_LIBRARY: ConfigTemplate[] = [
  {
    id: 'bgp-global',
    title: 'Multi-Homed BGP (Global Standard)',
    category: 'Routing',
    commands: `router bgp 65001\n neighbor 202.x.x.x remote-as 17676\n neighbor 202.x.x.x description ISP_A\n neighbor 182.x.x.x remote-as 9500\n neighbor 182.x.x.x description ISP_B\n address-family ipv4 unicast\n  network 103.x.x.x mask 255.255.255.0`
  }
];
