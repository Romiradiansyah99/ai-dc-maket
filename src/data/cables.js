// Electrical connections, defined as a cable schedule.
//
// Every entry is a real circuit that would exist in a 2 x 2,500 kVA data center:
// what it connects, what it is made of, how it is routed, and what it carries.
// The scene builds geometry straight from these records, so the drawing and the
// schedule cannot drift apart.
//
//   kind   mv | lv | duct | dc | bl | fiber | earth
//            mv    medium voltage, 20 kV
//            lv    low voltage, IT critical path
//            duct  busduct, the high current runs
//            dc    rack power, downstream of the hall busway
//            bl    building services, generator backed but not UPS backed
//            fiber structured cabling, no power
//   tray   elevation the run sits at, in metres above its own floor
//   via    explicit waypoints, used where the run has to follow a riser
//   at     for walkthroughs: which end the pulse starts from
//   render tubes  : how many parallel cables are drawn, and their radius
//          duct   : drawn as a busduct or tray busbar instead of cables
//
// Riser waypoints are taken from layout.js, so a run cannot pass a floor outside
// the shaft it claims to use.

import { R } from './layout.js';

export const CABLES = [
  /* ---------------------------- MV, 20 kV ---------------------------- */
  {
    id: 'MV-01', from: 'pln', to: 'gardu', kind: 'mv', tray: 'buried',
    voltage: '20 kV, 3 ph, 50 Hz', conductor: '3 x 1C x 240 mm2 Cu/XLPE/SWA/PVC',
    circuits: 2, load: '630 A per feeder', routeNote: 'Utility duct bank, 1.2 m cover, two diverse feeders',
    note: 'The only circuit the site does not own. Utility owns it up to the metering point, and the protection settings are agreed, not chosen.',
    render: { type: 'tubes', n: 3, r: 0.07 }
  },
  {
    id: 'MV-02', from: 'gardu', to: 'mvinc', kind: 'mv', tray: 'buried',
    voltage: '20 kV, 3 ph, 50 Hz', conductor: '3 x 1C x 240 mm2 Cu/XLPE/SWA/PVC',
    circuits: 2, load: '630 A', routeNote: 'Yard duct bank into the MV room, rising at the incomer cubicle',
    note: 'Crosses the building line, so it is the cable most likely to be hit by later civils work. It gets a marker tape and a route drawing.',
    render: { type: 'tubes', n: 3, r: 0.07 }
  },
  {
    id: 'MV-03', from: 'mvinc', to: 'metering', kind: 'mv', tray: 2.45,
    voltage: '20 kV', conductor: 'Busbar, 1,250 A, 3 ph 3 W',
    circuits: 1, load: '630 A', routeNote: 'Top entry busbar, cubicle to cubicle inside the MV lineup',
    note: 'Current transformers sit here. Everything downstream is billed on what this cubicle measures, so it is sealed and tested.',
    render: { type: 'tubes', n: 3, r: 0.06 }
  },
  {
    id: 'MV-04', from: 'metering', to: 'rmu', kind: 'mv', tray: 2.45,
    voltage: '20 kV', conductor: 'Busbar, 1,250 A',
    circuits: 1, load: '630 A', routeNote: 'Cubicle to cubicle, same lineup',
    note: 'Ring main unit. Its two ring switches let one cable section be worked on while the ring stays energised.',
    render: { type: 'tubes', n: 3, r: 0.06 }
  },
  {
    id: 'MV-05', from: 'rmu', to: 'mvswg', kind: 'mv', tray: 2.45,
    voltage: '20 kV', conductor: 'Busbar, 1,250 A',
    circuits: 1, load: '630 A', routeNote: 'Cubicle to cubicle, same lineup',
    note: 'The MV lineup is where the single supply becomes four transformer feeders. One breaker per transformer, no shared protection.',
    render: { type: 'tubes', n: 3, r: 0.06 }
  },
  ...[
    { id: 'MV-06', to: 'trafo', idx: 0, note: 'Feeder to transformer 1. A 2,500 kVA transformer pulls 72 A at 20 kV, so the cable is small and the breaker setting is what protects it.' },
    { id: 'MV-07', to: 'trafo', idx: 1, note: 'Feeder to transformer 2, same rating, separate breaker. A fault on one transformer must not take the other three.' },
    { id: 'MV-08', to: 'trafo', idx: 2, note: 'Feeder to transformer 3. Two transformers per bus, so each LV bus keeps its own 2N pair.' },
    { id: 'MV-09', to: 'trafo', idx: 3, note: 'Feeder to transformer 4, completing the 2N transformer set.' }
  ].map((t) => ({
    id: t.id, from: 'mvswg', to: t.to, toIndex: t.idx, kind: 'mv', tray: 2.5,
    voltage: '20 kV', conductor: '3 x 1C x 95 mm2 Cu/XLPE/SWA', circuits: 1,
    load: '72 A', routeNote: 'MV tray from the lineup to the transformer terminal box',
    note: t.note, render: { type: 'tubes', n: 3, r: 0.05 }
  })),

  /* --------------------------- LV, 400 V ----------------------------- */
  ...[0, 1, 2, 3].map((i) => ({
    id: 'LV-0' + (i + 1), from: 'trafo', fromIndex: i, to: 'msb', kind: 'duct', tray: 3.0,
    voltage: '400 V, 3 ph 4 W + E', conductor: 'Busduct, 4,000 A, copper',
    circuits: 1, load: '3,608 A at 400 V',
    routeNote: 'Busduct from the transformer LV terminals to the main switchboard, one duct per transformer',
    note: 'This is the highest current cable in the building. At 400 V a 2,500 kVA transformer delivers 3,608 A, so it is busduct, not cable, and it is short for a reason.',
    render: { type: 'duct', w: 0.42, h: 0.30 }
  })),
  {
    id: 'LV-05', from: 'msb', to: 'apfc', kind: 'lv', tray: 3.0,
    voltage: '400 V', conductor: '2 x (4C x 185 mm2 Cu/PVC)', circuits: 1, load: '1,000 A',
    routeNote: 'LV tray along the switchboard front, dropping into the APFC panel',
    note: 'Feeds the capacitor banks that hold power factor near 0.98. Without it the utility bills kVA, not kW.',
    render: { type: 'tubes', n: 2, r: 0.06 }
  },
  {
    id: 'LV-06', from: 'msb', to: 'pdb', kind: 'lv', tray: 2.9,
    voltage: '400 V', conductor: '4C x 185 mm2 Cu/PVC', circuits: 1, load: '400 A',
    routeNote: 'LV tray, switchboard to power distribution board',
    note: 'Step one of the critical distribution chain. Everything downstream of here is either UPS protected or deliberately not.',
    render: { type: 'tubes', n: 2, r: 0.055 }
  },
  {
    id: 'LV-07', from: 'pdb', to: 'db', kind: 'lv', tray: 2.5,
    voltage: '400 V', conductor: '4C x 95 mm2 Cu/PVC', circuits: 1, load: '250 A',
    routeNote: 'Tray at high level between the two boards',
    note: 'Final board. Lighting, sockets, and the handful of loads nobody remembers until they trip.',
    render: { type: 'tubes', n: 2, r: 0.045 }
  },
  {
    id: 'LV-08', from: 'msb', to: 'ups', kind: 'lv', tray: 3.0,
    voltage: '400 V', conductor: '4 x (4C x 240 mm2 Cu/PVC)', circuits: 4, load: '1,600 A per UPS',
    routeNote: 'LV tray from the essentials section of the switchboard to each UPS input',
    note: 'UPS input. Everything on the other side of this cable is protected against a 10 second outage, so this cable is the boundary of what the site promises.',
    render: { type: 'tubes', n: 3, r: 0.07 }
  },
  {
    id: 'LV-09', from: 'msb', to: 'sts', kind: 'lv', tray: 3.0,
    voltage: '400 V', conductor: '2 x (4C x 240 mm2 Cu/PVC)', circuits: 2, load: '800 A',
    routeNote: 'LV tray through the transfer switch room',
    note: 'Static transfer switch, the fast path for dual corded IT load. It swaps source in a quarter cycle, not seconds.',
    render: { type: 'tubes', n: 2, r: 0.07 }
  },
  {
    id: 'LV-10', from: 'genset', to: 'ats', kind: 'lv', tray: 'buried',
    voltage: '400 V', conductor: '6 x (4C x 300 mm2 Cu/PVC) per set', circuits: 3, load: '3,608 A per generator',
    routeNote: 'Generator output in trench across the yard, rising into the transfer switch room',
    note: 'Three sets in parallel, each rated to carry the site alone. A buried LV cable at 3,600 A is a busbar in a trench, and the trench has to be drawn.',
    render: { type: 'tubes', n: 3, r: 0.085 }
  },
  {
    id: 'LV-11', from: 'ats', to: 'msb', kind: 'lv', tray: 3.0,
    voltage: '400 V', conductor: '8 x (4C x 300 mm2 Cu/PVC)', circuits: 1, load: '4,000 A',
    routeNote: 'Tray from the ATS output to the switchboard bus',
    note: 'The switchover point. Either the utility or the generators feed this cable, never both, and that is what the ATS guarantees.',
    render: { type: 'tubes', n: 4, r: 0.085 }
  },
  {
    id: 'LV-12', from: 'ups', to: 'pdumain', kind: 'duct', tray: 3.4,
    voltage: '400 V', conductor: 'Busduct, 1,600 A',
    circuits: 1, load: '1,600 A',
    routeNote: `UPS output to the LV busduct riser at x ${R.lv[0]}, z ${R.lv[1]}, then up into the IT electrical room`,
    via: [[R.lv[0] - 0.45, 3.4, -16.8], [R.lv[0] - 0.45, 3.4, R.lv[1]], [R.lv[0] - 0.45, 9.4, R.lv[1]], [13, 9.4, R.lv[1]], [13, 9.4, 11]],
    note: 'The riser run. This is the busduct that leaves the ground floor electrical room and arrives on the white space level, and everything in the hall is fed from where it lands.',
    render: { type: 'duct', w: 0.38, h: 0.28 }
  },
  {
    id: 'LV-13', from: 'sts', to: 'busway', kind: 'duct', tray: 3.4,
    voltage: '400 V', conductor: 'Busduct, 1,600 A',
    circuits: 1, load: '1,600 A',
    routeNote: `STS output up the same riser at x ${R.lv[0]}, z ${R.lv[1]}, then to the hall`,
    via: [[R.lv[0] + 0.10, 3.4, -16.0], [R.lv[0] + 0.10, 3.4, R.lv[1]], [R.lv[0] + 0.10, 9.4, R.lv[1]], [R.lv[0] + 0.10, 9.4, -9.75]],
    note: 'Second source into the hall. Two busducts, two paths, and a rack that can only be fed from both is the point.',
    render: { type: 'duct', w: 0.38, h: 0.28 }
  },

  /* ------------------ Building services, 400 V ----------------------- */
  {
    id: 'BL-01', from: 'msb', to: 'mdbn', kind: 'bl', tray: 2.8,
    voltage: '400 V', conductor: '4 x (4C x 240 mm2 Cu/PVC)', circuits: 2, load: '2,000 A',
    routeNote: 'Tap off the generator backed section of the main switchboard into the building services board',
    note: 'The fork in the road. Left of this cable the load is protected by batteries; right of it the load is protected only by the generators, and cold start is measured in minutes, not milliseconds.',
    render: { type: 'tubes', n: 3, r: 0.07 }
  },
  {
    id: 'BL-02', from: 'mdbn', to: 'chiller', toIndex: 0, kind: 'bl', tray: 3.2,
    voltage: '400 V', conductor: '2 x (4C x 300 mm2 Cu/PVC)', circuits: 2, load: '900 A',
    routeNote: 'Tray across the plant room to the chiller compressor starter panel',
    note: 'Chillers are not on the UPS and never will be: 3 MW of compressor on battery is not a design, it is a fantasy. They are on the generator, and the thermal ride-through covers the restart.',
    render: { type: 'tubes', n: 2, r: 0.075 }
  },
  {
    id: 'BL-03', from: 'mdbn', to: 'pumppri', toIndex: 0, kind: 'bl', tray: 3.0,
    voltage: '400 V', conductor: '4C x 185 mm2 Cu/PVC', circuits: 1, load: '400 A',
    routeNote: 'Tray to the primary pump VFD panel',
    note: 'The pumps come back before the chillers do, because a chiller with no flow trips on evaporator freeze protection within about thirty seconds.',
    render: { type: 'tubes', n: 2, r: 0.055 }
  },
  {
    id: 'BL-04', from: 'mdbn', to: 'crah', toIndex: 2, kind: 'bl', tray: 3.0,
    voltage: '400 V', conductor: '4C x 95 mm2 Cu/PVC', circuits: 1, load: '200 A',
    routeNote: `Building services cables in their own lane of the riser at x 0.65, z ${R.lv[1]}, up to the CRAH line`,
    via: [[R.lv[0] + 0.65, 3.0, -13.2], [R.lv[0] + 0.65, 3.0, R.lv[1]], [R.lv[0] + 0.65, 8.6, R.lv[1]], [7.5, 8.6, R.lv[1]], [7.5, 8.6, -2.2]],
    note: 'A CRAH fan is a small load with a large consequence: without airflow the hall overheats in minutes even with the liquid loop running, because 15 percent of the heat never reaches a cold plate.',
    render: { type: 'tubes', n: 2, r: 0.05 }
  },
  {
    id: 'BL-05', from: 'mdbn', to: 'coolingtower', toIndex: 0, kind: 'bl', tray: 'buried',
    voltage: '400 V', conductor: '2 x (4C x 185 mm2 Cu/PVC)', circuits: 2, load: '500 A',
    routeNote: 'Buried duct bank out of the plant room to the tower yard, rising at the tower control panel',
    note: 'Heat rejection is the load nobody plans for. Lose the tower fans and the condenser water climbs until the chillers trip on high pressure, usually within twenty minutes.',
    render: { type: 'tubes', n: 2, r: 0.06 }
  },
  {
    id: 'BL-06', from: 'mdbn', to: 'ldb', kind: 'bl', tray: 3.0,
    voltage: '400 V', conductor: '4C x 150 mm2 Cu/PVC', circuits: 1, load: '320 A',
    routeNote: `Up the building services lane of the LV riser at x 0.65, z ${R.lv[1]}, to the support floor lighting board`,
    via: [[R.lv[0] + 0.65, 3.0, -13.2], [R.lv[0] + 0.65, 3.0, R.lv[1]], [R.lv[0] + 0.65, 14.4, R.lv[1]], [3, 14.4, R.lv[1]], [3, 14.4, 9]],
    note: 'One riser feeder to a floor board, then a floor board to everything on that floor. Distribution is a tree, not a star, because a cable per load does not fit in a shaft.',
    render: { type: 'tubes', n: 2, r: 0.05 }
  },
  {
    id: 'BL-07', from: 'ldb', to: 'noc', kind: 'bl', tray: 2.6,
    voltage: '400 V', conductor: '4C x 25 mm2 Cu/PVC', circuits: 1, load: '63 A',
    routeNote: 'Tray along the support floor corridor to the NOC distribution board',
    note: 'The NOC is a building load with an IT consequence: it has generator power, not UPS power, so during a transfer the video wall blinks and the operators lose sight of the plant for about ten seconds.',
    render: { type: 'tubes', n: 2, r: 0.04 }
  },
  {
    id: 'BL-09', from: 'mdbn', to: 'dock', kind: 'bl', tray: 3.4,
    voltage: '400 V', conductor: '4C x 25 mm2 Cu/PVC', circuits: 1, load: '63 A',
    routeNote: 'Tray across the goods in area to the dock control panel and door drives',
    note: 'Three roller doors, three levellers and the dock lights. Small load, and the reason a delivery can be unloaded in the rain without the hall losing containment.',
    render: { type: 'tubes', n: 2, r: 0.04 }
  },
  {
    id: 'BL-08', from: 'ldb', to: 'lift', kind: 'bl', tray: 2.4,
    voltage: '400 V', conductor: '4C x 35 mm2 Cu/PVC', circuits: 1, load: '80 A',
    routeNote: 'Short run from the floor board to the lift machine room isolator',
    note: 'The lift is how a 2.2 m rack reaches the staging area and how it reaches the hall. It is on the generator, because a data center with a rack stuck in the lobby is a data center that cannot grow.',
    render: { type: 'tubes', n: 2, r: 0.04 }
  },

  /* ----------------------------- DC side ----------------------------- */
  {
    id: 'DC-01', from: 'pdumain', to: 'busway', kind: 'duct', tray: 3.0,
    voltage: '400 V', conductor: 'Busduct, 3,200 A',
    circuits: 2, load: '3,200 A',
    routeNote: 'Main PDU to the overhead hall busduct, one run per hall',
    note: 'The hall busduct. Power is tapped wherever a rack appears, so the hall can be reconfigured without pulling a single cable. This is the run that AI halls are built around.',
    render: { type: 'duct', w: 0.46, h: 0.32 }
  },
  {
    id: 'DC-02', from: 'busway', to: 'rackpdu', kind: 'dc', tray: 1.4,
    voltage: '400 V, 3 ph + N + E', conductor: '4C x 25 mm2 flexible, 60 kW per feed',
    circuits: 1, load: '87 A per feed',
    routeNote: 'Tap off box on the busduct, flexible drop to the rack PDU',
    note: 'The last copper before the rack. Every tap box is metered, because this is where capacity planning actually happens.',
    render: { type: 'tubes', n: 2, r: 0.035 }
  },
  {
    id: 'DC-03', from: 'rackpdu', to: 'rack', kind: 'dc', tray: 0.45,
    voltage: '400 V to 48 V DC inside the rack', conductor: '4C x 25 mm2 flexible jumper, 0.9 m',
    circuits: 1, load: '87 A per feed',
    routeNote: 'Short flexible jumper from the rack PDU outlet to the rack power shelf',
    note: 'The last metre, and the one that gets unplugged. It is drawn because it is a real cable with a real bend radius, not because it is interesting.',
    render: { type: 'tubes', n: 2, r: 0.03 }
  },

  /* ------------------------ Fiber and comms -------------------------- */
  {
    id: 'FI-01', from: 'fibentry', to: 'odf', kind: 'fiber', tray: 2.6,
    voltage: 'No power, optical', conductor: '2 x 48F OS2, carrier handover to ODF',
    circuits: 2, load: 'n/a',
    routeNote: 'Carrier handover cabinet to the optical distribution frame, in the same MMR',
    note: 'Two carriers, two physical entries, because a fiber cut in a street cabinet is the most common way a working data center loses its customers without losing power.',
    render: { type: 'tubes', n: 2, r: 0.022 }
  },
  {
    id: 'FI-02', from: 'odf', to: 'noc', kind: 'fiber', tray: 2.6,
    voltage: 'No power, optical', conductor: '24F OS2 singlemode in tray',
    circuits: 2, load: 'n/a',
    routeNote: `ODF up the fiber riser at x ${R.fiber[0]}, z ${R.fiber[1]}, to the NOC on the support floor`,
    via: [[R.fiber[0] - 0.4, 8.6, 10], [R.fiber[0] - 0.4, 8.6, R.fiber[1]], [R.fiber[0] - 0.4, 14.6, R.fiber[1]], [15.5, 14.6, R.fiber[1]], [15.5, 14.6, 11]],
    note: 'The same shaft carries the monitoring network to the room where somebody is paid to look at it. A NOC on a different floor from the MMR only works if this cable exists.',
    render: { type: 'tubes', n: 2, r: 0.022 }
  },
  {
    id: 'FI-03', from: 'epms', to: 'odf', kind: 'fiber', tray: 2.6,
    voltage: 'No power, optical', conductor: '12F OS2, Modbus TCP over fiber',
    circuits: 2, load: 'n/a',
    routeNote: `EPMS outstations on the plant floor, up the fiber riser at x ${R.fiber[0]}, z ${R.fiber[1]}, to the ODF`,
    via: [[R.fiber[0] + 0.4, 3.0, -5], [R.fiber[0] + 0.4, 3.0, R.fiber[1]], [R.fiber[0] + 0.4, 8.6, R.fiber[1]], [-24, 8.6, R.fiber[1]], [-24, 8.6, 10]],
    note: 'Metering data leaves the plant room on glass, not copper. A 400 V fault on a copper signal cable travels into the monitoring system and takes the screen down with it.',
    render: { type: 'tubes', n: 2, r: 0.022 }
  },

  /* ----------------------------- Earthing ---------------------------- */
  {
    id: 'ER-01', from: 'msb', to: 'earth', kind: 'earth', tray: 'buried',
    voltage: 'Bonding', conductor: '95 mm2 Cu, green/yellow',
    circuits: 1, load: 'Fault current only',
    routeNote: 'Main earthing conductor from the switchboard earth bar to the site earth pit',
    note: 'Carries nothing in normal operation and everything during a fault. Its impedance is what decides whether protection trips in 0.4 s or not at all.',
    render: { type: 'tubes', n: 1, r: 0.05 }
  },
  {
    id: 'ER-02', from: 'earth', to: 'gardu', kind: 'earth', tray: 'buried',
    voltage: 'Bonding', conductor: '70 mm2 Cu, buried ring',
    circuits: 1, load: 'Fault current only',
    routeNote: 'Buried earth ring tying the substation earth to the building earth',
    note: 'Two earth systems joined. A separate substation earth looks cleaner until a fault finds a path through the building steel instead.',
    render: { type: 'tubes', n: 1, r: 0.045 }
  }
];

export const CABLE_BY_ID = Object.fromEntries(CABLES.map((c) => [c.id, c]));

export const CABLES_TOUCHING = (key) =>
  CABLES.filter((c) => c.from === key || c.to === key);
