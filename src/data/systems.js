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
      {
        id: 'itpwr', name: 'IT Critical Power (UPS backed)',
        items: ['msb', 'pdb', 'db', 'apfc', 'ats', 'sts', 'ups', 'bbu', 'pdumain', 'busway', 'rackpdu']
      },
      {
        id: 'bldgpwr', name: 'Building Services (generator only)',
        items: ['mdbn', 'ldb']
      },
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
      { id: 'network', name: 'Network & Cabling', items: ['fibentry', 'odf', 'tray'] }
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
      { id: 'ops', name: 'Operations & Monitoring', items: ['noc', 'epms'] },
      { id: 'security', name: 'Security', items: ['security'] },
      { id: 'staging', name: 'Goods In & Staging', items: ['dock', 'staging'] },
      { id: 'support', name: 'Support Space', items: ['office', 'lift'] }
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

// Guided walkthroughs.
//
// Every stage names the connection it travels along: a cable id for the electrical
// path, a pipe id for the cooling loop. The animation is built from that connection's
// real geometry, so the pulse follows the tray, the riser and the drop instead of
// cutting across the building in a straight line.
export const FLOWS = [
  {
    id: 'power',
    name: 'Electrical Path',
    blurb: 'Utility to the silicon, one cable at a time.',
    color: '#1F4E8C',
    kind: 'cable',
    nodes: [
      { k: 'pln', state: '20 kV', link: null, note: 'Two diverse feeders arrive from the utility substation. This is the only source the site does not own.' },
      { k: 'gardu', state: '20 kV', link: 'MV-01', note: 'Customer substation: metering, protection and the first isolation point. The pulse you just watched ran inside the actual MV cable, in its duct bank.' },
      { k: 'mvinc', state: '20 kV', link: 'MV-02', note: 'MV incomer with a vacuum breaker. This is the switch that makes the whole building quiet.' },
      { k: 'metering', state: '20 kV', link: 'MV-03', note: 'CT and VT cubicle. Everything downstream is billed on what this cubicle measures, so it is sealed and tested.' },
      { k: 'rmu', state: '20 kV ring', link: 'MV-04', note: 'Ring main unit upstream of the transformer, so one cable section can be isolated while the ring stays live.' },
      { k: 'mvswg', state: '20 kV bus', link: 'MV-05', note: 'MV lineup splits the supply to each transformer on a dedicated feeder, one breaker per transformer.' },
      { k: 'trafo', state: '400 V', link: 'MV-06', note: 'Step down, 20 kV to 400 V. Voltage falls, current rises, and the difference is paid in heat.' },
      { k: 'msb', state: '400 V bus', link: 'LV-01', note: 'Main switchboard, 6,400 A per bus. The busduct you just followed carries 3,608 A per transformer, which is why it is a duct and not a cable.' },
      { k: 'ups', state: 'AC to DC to AC', link: 'LV-08', note: 'Double conversion holds the IT load steady and covers the seconds the generator needs. The generator and ATS sit on the same bus, one cable away.' },
      { k: 'pdumain', state: '400 V', link: 'LV-12', note: 'Main PDU. The pulse climbed the LV busway riser at x 1.5 to get here, the only electrical route that crosses a floor.' },
      { k: 'busway', state: '400 V, 3,200 A', link: 'DC-01', note: 'Overhead busway: power can be moved without moving cable, which is what makes the hall reconfigurable.' },
      { k: 'rackpdu', state: '400 V, 60 kW per feed', link: 'DC-02', note: 'Tap off box on the busway, flexible drop to the rack PDU. This is where capacity planning actually happens, because every outlet is metered.' },
      { k: 'rack', state: '48 V DC internal', link: 'DC-03', note: 'The rack converts to 48 V DC and delivers sub 1 V at the die. Everything upstream existed for this.' }
    ]
  },
  {
    id: 'coolw',
    name: 'Cooling Water Loop',
    blurb: 'Heat leaves the GPU on water, one pipe at a time.',
    color: '#0E7E88',
    kind: 'pipe',
    nodes: [
      { k: 'rack', state: 'cold plate', link: null, note: 'Heat conducts from the die into a copper cold plate. This is the only place heat actually leaves silicon.' },
      { k: 'manifold', state: '45 C return', link: 'TP-03', note: 'The pulse ran up the flexible hose from the rack into the manifold, through a non-spill coupling.' },
      { k: 'cdu', state: '38 C supply, 8 K delta', link: 'TP-01', note: 'The CDU pump moves technology loop water through an internal heat exchanger. Facility water never touches the racks, and the two legs you just saw are insulated DN200.' },
      { k: 'phe', state: '1 to 2 K approach', link: 'CHW-01', note: 'This run dropped through the hall floor into the trench and crossed to the heat exchanger room. Two waters exchange heat without ever mixing.' },
      { k: 'pumppri', state: '180 m3/h, VFD', link: 'CHW-02', note: 'Primary pump holds differential pressure at the furthest coil, not at its own outlet.' },
      { k: 'header', state: 'supply header', link: 'CHW-03', note: 'Pump discharge into the header. From here the flow splits to whichever chillers are running.' },
      { k: 'chiller', state: '26 C entering, 32 C leaving', link: 'CHW-04', note: 'One branch per chiller, butterfly isolation at each. Three machines, N+1, sized for two and a half of flow.' },
      { k: 'coolingtower', state: 'rejection, 3 to 5 K approach', link: 'CND-01', note: 'The pulse went down into the buried condenser main and out to the tower yard. Evaporation rejects the heat, and everything the site consumes leaves here as vapour.' },
      { k: 'drycooler', state: 'free cooling below 25 C', link: 'FRE-01', note: 'A parallel path, not a series one: below roughly 25 C ambient the dry cooler carries the load and the chillers stop. The pipe lights up as an alternative, which is exactly what it is.' }
    ]
  },
  {
    id: 'outage',
    name: 'Utility Failure & Generator Pickup',
    blurb: 'What actually happens in the ninety seconds after the lights go out upstream.',
    color: '#8A1F2B',
    kind: 'cable',
    nodes: [
      {
        k: 'pln', t: 't+0 s', state: 'Utility lost', link: null,
        note: 'Both 20 kV feeders dead. Either the utility substation tripped, a feeder was dug through, or the grid is doing what grids do. From this second the site is on its own.'
      },
      {
        k: 'ups', t: 't+0 s', state: 'IT load on battery', link: 'LV-12', at: 'from',
        note: 'No interruption at the rack. The double conversion UPS was already carrying the load through its inverter, so the only change is that the rectifier stops charging and the battery starts discharging. The pulse you watched is the UPS output, and it never blinked.'
      },
      {
        k: 'ats', t: 't+1 s', state: 'Transfer initiated', link: null,
        note: 'The transfer switch controller sees loss of normal supply on both inputs — utility contactor open, no voltage, no frequency. It starts a timer and issues the engine start signal to all three generators at once, not in sequence.'
      },
      {
        k: 'genset', t: 't+2 s', state: 'Cranking', link: null,
        note: 'Three sets crank simultaneously. First engine to reach rated speed and voltage closes its breaker to the paralleling bus. Nine seconds is normal; twelve is slow but acceptable; thirty means somebody is walking to the yard with a torch.'
      },
      {
        k: 'ats', t: 't+9 s', state: 'Emergency source available', link: 'LV-10', at: 'from',
        note: 'Generator voltage and frequency inside window, so the ATS accepts the emergency source. The pulse ran inside the buried generator cables — the trench across the yard that everybody forgets until it floods.'
      },
      {
        k: 'msb', t: 't+11 s', state: 'Site on generator', link: 'LV-11', at: 'from',
        note: 'Transfer complete. The main switchboard is re-energised from the generators, the UPS goes back to charging, and the IT load never knew. Total outage seen by a GPU: zero seconds. Total outage seen by the chillers: eleven seconds, and they are still spinning down.'
      },
      {
        k: 'mdbn', t: 't+20 s', state: 'Building load re-energised', link: 'BL-01', at: 'from',
        note: 'This is the branch that was never on batteries. Building services come back on the generator with no ride-through at all: pumps, tower fans, CRAH fans, lighting, NOC. Everything downstream of this board saw a real gap in supply.'
      },
      {
        k: 'chiller', t: 't+4 min', state: 'Chiller restart', link: 'BL-02', at: 'from',
        note: 'Chillers restart last and slowest. Compressor start is 900 A per machine, and three of them on a cold generator is how a pickup turns into a second outage. The sequence staggers them, and the warm water loop buys the time: 32 racks of coolant holds the GPUs below throttle for roughly six minutes with no chillers running at all.'
      },
      {
        k: 'ups', t: 't+10 min', state: 'Battery recharge', link: 'LV-08', at: 'to',
        note: 'Load is stable, so the chargers pull the battery back up. Recharge is limited to about ten percent of capacity, because a fast recharge on a 3.2 MW site is another generator load step nobody needs during an outage.'
      },
      {
        k: 'rack', t: 't+45 min', state: 'Steady state', link: 'DC-03', at: 'to',
        note: 'Fully back to normal, except the fuel gauge. At 4 MW the site is burning about 840 litres an hour, and the 48 hour autonomy figure started counting at t+0 s.'
      },
      {
        k: 'pln', t: 't+2 h', state: 'Utility restored, retransfer', link: null,
        note: 'Supply returns. The ATS waits for a stability window — typically five minutes — before retransferring, then the generators run a cool down cycle and stop. If it retransferred on the first flicker, the site would bounce between sources until something broke.'
      }
    ]
  }
];

export const FLOW_BY_ID = Object.fromEntries(FLOWS.map((f) => [f.id, f]));
