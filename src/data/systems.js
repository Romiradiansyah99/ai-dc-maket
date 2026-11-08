// Single source of truth: system tree, equipment catalogue, guided walkthroughs.

import { POWER } from './equipment-power.js';
import { MECH } from './equipment-mech.js';
import { CORE } from './equipment-core.js';

export const EQUIPMENT = { ...POWER, ...MECH, ...CORE };

export const SYSTEMS = [
  {
    id: 'elec', name: 'Electrical', short: 'E',
    subsystems: [
      { id: 'source', name: 'Utility & Generation', items: ['pln', 'gardu', 'genset', 'fueltank'] },
      { id: 'mv', name: 'Medium Voltage Distribution', items: ['mvinc', 'metering', 'rmu', 'mvswg'] },
      { id: 'tx', name: 'Transformation', items: ['trafo'] },
      { id: 'lv', name: 'Low Voltage Distribution', items: ['msb', 'pdb', 'db', 'apfc'] },
      { id: 'backup', name: 'Transfer & Backup', items: ['ats', 'sts', 'ups', 'bbu'] },
      { id: 'rackpwr', name: 'Rack Power', items: ['pdumain', 'busway', 'rackpdu'] },
      { id: 'earth', name: 'Earthing & Lightning', items: ['earth', 'lps'] }
    ]
  },
  {
    id: 'coolw', name: 'Cooling, Water', short: 'W',
    subsystems: [
      { id: 'reject', name: 'Heat Rejection', items: ['coolingtower', 'drycooler'] },
      { id: 'plant', name: 'Chiller Plant', items: ['chiller', 'pumppri', 'buffer', 'header'] },
      { id: 'sep', name: 'Hydraulic Separation', items: ['phe'] },
      { id: 'dist', name: 'Coolant Distribution', items: ['cdu', 'manifold'] },
      { id: 'load', name: 'Heat Capture', items: ['coldplate'] }
    ]
  },
  {
    id: 'coola', name: 'Cooling, Air', short: 'A',
    subsystems: [
      { id: 'air', name: 'Air Handling', items: ['crah'] },
      { id: 'contain', name: 'Containment', items: ['containment'] },
      { id: 'path', name: 'Return Air Path', items: ['returnpath'] }
    ]
  },
  {
    id: 'it', name: 'IT Infrastructure', short: 'I',
    subsystems: [
      { id: 'rack', name: 'Racks', items: ['rack'] },
      { id: 'network', name: 'Network & Cabling', items: ['odf', 'tray'] }
    ]
  },
  {
    id: 'fire', name: 'Fire & Life Safety', short: 'F',
    subsystems: [
      { id: 'detect', name: 'Detection', items: ['vesda', 'leakdet'] },
      { id: 'suppress', name: 'Suppression', items: ['cleanagent', 'preaction'] },
      { id: 'pump', name: 'Fire Water', items: ['firepump'] },
      { id: 'epo', name: 'Emergency Power Off', items: ['epo'] }
    ]
  },
  {
    id: 'fac', name: 'Facility & Operations', short: 'O',
    subsystems: [
      { id: 'ops', name: 'Operations', items: ['noc'] },
      { id: 'security', name: 'Security', items: ['security'] },
      { id: 'staging', name: 'Staging', items: ['staging'] },
      { id: 'support', name: 'Support Space', items: ['office'] }
    ]
  }
];

export const SYS_COLOR = {
  elec: '#1F4E8C',
  coolw: '#0E6E78',
  coola: '#5A6B82',
  it: '#2E6FD0',
  fire: '#A31621',
  fac: '#7C8CA6'
};

// Lookup: equipment key -> { system, subsystem, index }
export const INDEX = (() => {
  const map = {};
  for (const s of SYSTEMS) {
    for (const sub of s.subsystems) {
      for (const k of sub.items) {
        map[k] = { system: s.id, systemName: s.name, sub: sub.id, subName: sub.name };
      }
    }
  }
  return map;
})();

// Guided walkthroughs. Each node points at an equipment key; the scene supplies the position.
export const FLOWS = [
  {
    id: 'power',
    name: 'Electrical Path',
    blurb: 'Utility to the silicon, one stage at a time.',
    color: '#1F4E8C',
    nodes: [
      { k: 'pln', state: '20 kV', note: 'Two diverse feeders arrive from the utility substation. This is the only source the site does not own.' },
      { k: 'gardu', state: '20 kV', note: 'Customer substation: metering, protection and the first isolation point. Permits and utility approval land here.' },
      { k: 'mvinc', state: '20 kV', note: 'MV incomer with a vacuum breaker. This is the switch that makes the whole building quiet.' },
      { k: 'rmu', state: '20 kV ring', note: 'Ring main unit upstream of the transformer, so one cable section can be isolated while the ring stays live.' },
      { k: 'mvswg', state: '20 kV bus', note: 'MV lineup splits the supply to each transformer on a dedicated feeder.' },
      { k: 'trafo', state: '400 V', note: 'Step down, 20 kV to 400 V. Voltage falls, current rises, and the difference is paid in heat.' },
      { k: 'msb', state: '400 V bus', note: 'Main switchboard, 6,300 A per bus. From here the site decides what is essential and what is not.' },
      { k: 'ats', state: '400 V, source swap', note: 'On loss of utility the ATS waits for the generator, then transfers. Transfer must beat UPS autonomy.' },
      { k: 'ups', state: 'AC to DC to AC', note: 'Double conversion holds the IT load steady and covers the ten seconds the generator needs.' },
      { k: 'pdumain', state: '400 V', note: 'Main PDU feeds the hall busway and meters each hall separately, which is what makes capacity planning possible.' },
      { k: 'busway', state: '400 V, 3,200 A', note: 'Overhead busway: power can be moved without moving cable.' },
      { k: 'rackpdu', state: '400 V, 60 kW per feed', note: 'Rack PDU, dual corded from two independent busways, metered per outlet.' },
      { k: 'rack', state: '48 V DC internal', note: 'The rack converts to 48 V DC and delivers sub 1 V at the die. Everything upstream existed for this.' }
    ]
  },
  {
    id: 'coolw',
    name: 'Cooling Water Loop',
    blurb: 'Heat leaves the GPU on water, not on air.',
    color: '#0E6E78',
    nodes: [
      { k: 'coldplate', state: '45 C return', note: 'Heat conducts from the die into a copper cold plate and leaves with the coolant. This is the only place heat actually leaves silicon.' },
      { k: 'manifold', state: '38 C return to CDU', note: 'Manifold collects return from every rack through quick disconnects. Highest touch frequency, highest leak risk.' },
      { k: 'cdu', state: '32 C supply, 8 K delta', note: 'CDU pump moves technology loop water through an internal heat exchanger. Facility water never touches the racks.' },
      { k: 'phe', state: '1 to 2 K approach', note: 'Plate heat exchanger separates the two loops. Two waters exchange heat without ever mixing.' },
      { k: 'pumppri', state: '180 m3/h, VFD', note: 'Primary pump holds differential pressure at the furthest exchanger, not at the pump outlet.' },
      { k: 'chiller', state: '18 to 24 C leaving', note: 'Chiller lifts the heat to a level the condenser water can carry away.' },
      { k: 'coolingtower', state: 'rejection, 3 to 5 K approach', note: 'Evaporation rejects the heat to atmosphere. Everything the site consumes leaves here as vapour.' },
      { k: 'drycooler', state: 'free cooling below 25 C', note: 'Below roughly 25 C ambient the dry cooler carries the load with no water at all, which is why warm water design matters.' }
    ]
  },
  {
    id: 'coola',
    name: 'Cooling Air Loop',
    blurb: 'The small remainder, and why it is still critical.',
    color: '#5A6B82',
    nodes: [
      { k: 'crah', state: '18 to 22 C supply', note: 'CRAH cools everything not on a cold plate: switches, storage, power shelves, room losses.' },
      { k: 'containment', state: '5 to 10 Pa', note: 'Containment keeps paid for cold air at the rack intake instead of mixing with exhaust.' },
      { k: 'rack', state: 'air side load', note: 'The rack takes what it needs on air and rejects the rest on water.' },
      { k: 'returnpath', state: 'return plenum', note: 'Hot air finds its way back to the CRAH without crossing the cold aisle.' }
    ]
  },
  {
    id: 'safety',
    name: 'Safety Chain',
    blurb: 'Detection, decision, action.',
    color: '#A31621',
    nodes: [
      { k: 'vesda', state: 'alert, action, fire', note: 'Aspirating detection sees smoke far below the visible threshold and warns in three stages.' },
      { k: 'leakdet', state: 'under 30 s, located', note: 'On a water cooled hall the likelier incident is a drip, not a fire. Alarm must name the zone.' },
      { k: 'epo', state: 'IT off, pumps on', note: 'EPO cuts IT power but leaves coolant pumps running, because residual heat does not stop with the power.' },
      { k: 'cleanagent', state: '5 to 6 percent, 10 min hold', note: 'Electrical rooms are flooded with gas. Water on a live switchboard is not an option.' },
      { k: 'preaction', state: 'double interlock', note: 'Above the hall, pipes stay dry until two independent signals agree.' },
      { k: 'firepump', state: '8 bar, auto start', note: 'Diesel standby carries the fire main when the fire has already taken the grid.' }
    ]
  }
];
