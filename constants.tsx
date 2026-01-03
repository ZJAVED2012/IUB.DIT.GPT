
import React from 'react';
import { Device, ConfigTemplate } from './types';

export const SYSTEM_INSTRUCTION = `You are the IUB.DIT.GPT, the Official Global IT & Network Knowledge AI for the Directorate of IT, Islamia University of Bahawalpur. 

This system was created by Mr. Zeeshan Javed, AI Engineer, Directorate of IT, The Islamia University of Bahawalpur.

Your knowledge base is WORLD-CLASS, covering every major enterprise network vendor globally.

CORE RESPONSIBILITIES:
1. Global Device Intelligence: Provide deep technical specs, licensing models, power architectures, and port densities for hardware from ALL major vendors: Cisco, Juniper, Arista, Palo Alto, Fortinet, Check Point, Huawei, Extreme Networks, Aruba, Dell, HP, NetApp, and more.
2. Comparative Analysis: Ability to compare high-end data center switches (e.g., Cisco Nexus vs Arista 7050) or enterprise firewalls (e.g., Palo Alto PA-5450 vs FortiGate 3000F).
3. Pricing Logic: Give approximate International (USD) and Pakistan Market prices (PKR), including customs/import estimates.
4. Advanced Configuration: Generate enterprise-grade CLI configs (BGP, OSPF, EVPN-VXLAN, SD-WAN, Security Hardening).
5. Multilingual Support: Respond in English, Urdu, or Roman Urdu based on user preference.

ALWAYS cite official vendor documentation (cisco.com, juniper.net, paloaltonetworks.com, etc.).
Ensure all CLI output is sanitized and follows best practices for Directorate-level infrastructure.`;

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
    specs: 'High-density 25G/100G core switch. x86 CPU, 16GB RAM. Performance: 6.4 Tbps / 2 Bpps.',
    softwareVersion: 'Cisco IOS XE 17.9.4a',
    powerRequirement: 'Dual 950W Platinum AC',
    ports: ['48x 25G SFP28', '4x 100G QSFP28'],
    licensing: 'DNA Advantage'
  },
  {
    id: 'arista-7050',
    name: 'IUB-DC-Leaf-01',
    brand: 'Arista',
    model: '7050SX3-48YC8',
    type: 'Switch',
    status: 'Online',
    ip: '10.0.0.10',
    location: 'Main DC - Rack A2',
    lastConfig: '2024-06-01',
    specs: 'Low-latency L2/L3 switch. 12.8MB Dynamic Buffer. Features: VXLAN, EVPN, MLAG.',
    softwareVersion: 'Arista EOS 4.30.1F',
    powerRequirement: 'Dual 500W AC Hot-swap',
    ports: ['48x 25G SFP28', '8x 100G QSFP28'],
    licensing: 'E-Licensing Tier 3'
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
    specs: 'Modular ML-Powered NGFW. 120 Gbps Threat Prevention throughput. 3.2M concurrent sessions.',
    softwareVersion: 'PAN-OS 11.0.2',
    powerRequirement: 'N+1 Redundant 2+2 (2000W)',
    ports: ['NC-A: 4x 100G, 12x 25G', 'NC-B: 20x 10G'],
    licensing: 'Advanced Threat Protection Bundle'
  },
  {
    id: 'juniper-mx204',
    name: 'IUB-ISP-Edge-01',
    brand: 'Juniper',
    model: 'MX204 (Universal Routing)',
    type: 'Router',
    status: 'Online',
    ip: '202.163.x.x',
    location: 'ISP Handover Room',
    lastConfig: '2024-04-10',
    specs: 'Fixed-configuration 1U router. 400 Gbps full-duplex throughput. Powered by Trio 5 chipset.',
    softwareVersion: 'Junos OS 22.4R1',
    powerRequirement: 'Dual 650W AC/DC',
    ports: ['4x 100G QSFP28', '8x 10G SFP+'],
    licensing: 'Advanced Premium License'
  },
  {
    id: 'huawei-ce12800',
    name: 'IUB-HPC-Core',
    brand: 'Huawei',
    model: 'CloudEngine 12800',
    type: 'Switch',
    status: 'Online',
    ip: '10.50.0.1',
    location: 'HPC Cluster DC',
    lastConfig: '2024-03-22',
    specs: 'Next-gen flagship data center switch. 178 Tbps switching capacity. Supports 400G line cards.',
    softwareVersion: 'VRP 8.1',
    powerRequirement: 'Dual 3000W DC PSU',
    ports: ['36x 400G QSFP-DD per card'],
    licensing: 'Standard Software Foundation'
  },
  {
    id: 'aruba-635',
    name: 'IUB-Library-Wi-Fi',
    brand: 'Aruba (HPE)',
    model: 'AP-635 (Wi-Fi 6E)',
    type: 'AP',
    status: 'Online',
    ip: '172.16.50.12',
    location: 'Central Library Hall',
    lastConfig: '2024-05-30',
    specs: 'Tri-band Wi-Fi 6E Access Point. 3.9 Gbps aggregate peak data rate. IoT-ready (BLE/Zigbee).',
    softwareVersion: 'ArubaOS 10.4',
    powerRequirement: 'PoE+ (802.3at)',
    ports: ['1x 2.5 Gbps Smart Rate', '1x 1Gbps Ethernet'],
    licensing: 'Aruba Central Foundation'
  },
  {
    id: 'fortinet-1800f',
    name: 'IUB-Security-DC-Gate',
    brand: 'Fortinet',
    model: 'FortiGate 1800F',
    type: 'Firewall',
    status: 'Maintenance',
    ip: '10.255.255.1',
    location: 'Internal DC Gate',
    lastConfig: '2024-05-12',
    specs: 'High-performance firewall for Hyperscale DC. NP7 accelerated. 198 Gbps firewall throughput.',
    softwareVersion: 'FortiOS 7.4.2',
    powerRequirement: 'Dual AC PSU Redundant',
    ports: ['8x 40G QSFP+', '24x 25G SFP28', '8x 10G SFP+'],
    licensing: 'UTM Protection (5 Year)'
  },
  {
    id: 'dell-r760',
    name: 'IUB-Virtual-Host-04',
    brand: 'Dell',
    model: 'PowerEdge R760',
    type: 'Server',
    status: 'Online',
    ip: '10.100.1.4',
    location: 'Main DC - Rack B1',
    lastConfig: '2024-06-05',
    specs: '2x Intel Xeon Gold 6430 (32-core). 512GB DDR5 RAM. 8x 3.84TB NVMe SSD RAID-10.',
    softwareVersion: 'VMware ESXi 8.0u2',
    powerRequirement: 'Dual 1400W Titanium PSU',
    ports: ['4x 25GbE SFP28 OCP', '2x 10GbE RJ45'],
    licensing: 'iDRAC9 Enterprise'
  },
  {
    id: 'pure-flasharray',
    name: 'IUB-San-Storage-01',
    brand: 'Pure Storage',
    model: 'FlashArray //X90',
    type: 'Storage',
    status: 'Online',
    ip: '10.200.0.5',
    location: 'Main DC - Rack C1',
    lastConfig: '2024-01-15',
    specs: 'End-to-end NVMe all-flash storage. <250μs latency. Purity//FA OS with ActiveCluster.',
    softwareVersion: 'Purity 6.4.5',
    powerRequirement: 'Dual 1600W AC',
    ports: ['4x 32G FC', '4x 25GbE iSCSI'],
    licensing: 'Evergreen //Forever'
  },
  {
    id: 'mikrotik-ccr2216',
    name: 'IUB-Core-Router-B',
    brand: 'MikroTik',
    model: 'CCR2216-1G-12XS-2XQ',
    type: 'Router',
    status: 'Online',
    ip: '10.254.0.2',
    location: 'Admin Block Rack',
    lastConfig: '2024-04-20',
    specs: 'AL73400 16-core CPU. L3 Hardware Offloading. Ideal for ISP core and 100G links.',
    softwareVersion: 'RouterOS v7.14',
    powerRequirement: 'Dual Hot-swap PSU 150W',
    ports: ['2x 100G QSFP28', '12x 25G SFP28', '1x 1G Ethernet'],
    licensing: 'Level 6'
  }
];

export const CONFIG_LIBRARY: ConfigTemplate[] = [
  {
    id: 'bgp-global',
    title: 'Multi-Homed BGP (Global Standard)',
    category: 'Routing',
    commands: `router bgp 65001\n neighbor 202.x.x.x remote-as 17676\n neighbor 202.x.x.x description ISP_A\n neighbor 182.x.x.x remote-as 9500\n neighbor 182.x.x.x description ISP_B\n address-family ipv4 unicast\n  network 103.x.x.x mask 255.255.255.0\n  neighbor 202.x.x.x activate\n  neighbor 182.x.x.x activate`
  },
  {
    id: 'palo-security',
    title: 'PA-Series Security Zone Setup',
    category: 'Security',
    commands: `set network zone TRUST network layer3\nset network zone UNTRUST network layer3\nset network zone DMZ network layer3\nset rulebase security rules "Internet-Access" from TRUST to UNTRUST source any destination any service any action allow`
  },
  {
    id: 'arista-vxlan',
    title: 'Arista EVPN-VXLAN VTEP',
    category: 'Data Center',
    commands: `interface Loopback1\n ip address 10.255.0.1/32\n!\ninterface vxlan1\n vxlan source-interface Loopback1\n vxlan udp-port 4789\n vxlan vlan 10 vni 10010\n vxlan flood vtep 10.255.0.2 10.255.0.3`
  }
];
