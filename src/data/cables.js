// Electrical connections, defined as a cable schedule.
//
// Every entry is a real circuit that would exist in a 2 x 2,500 kVA data center:
// what it connects, what it is made of, how it is routed, and what it carries.
// The scene builds geometry straight from these records, so the drawing and the
// schedule cannot drift apart.
//
//   kind   mv | lv | duct | dc | earth
//   tray   elevation the run sits at, in metres above its own floor
//   via    explicit waypoints, used where the run has to follow a riser
//   render tubes  : how many parallel cables are drawn, and their radius
//          duct   : drawn as a busduct or tray busbar instead of cables

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
    render: { type: 'duct', w: 0.34, h: 0.22 }
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
    note: 'Step one of the distribution chain. From here the site splits into cooling plant, small power and mechanical services.',
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
    id: 'LV-12', from: 'ups', to: 'pdumain', kind: 'duct', tray: 3.0,
    voltage: '400 V', conductor: 'Busduct, 1,600 A',
    circuits: 1, load: '1,600 A',
    routeNote: 'UPS output to the LV busway riser at x 1.5, z 11, then up to the white space',
    via: [[1.5, 3.4, -16.8], [1.5, 3.4, 11], [1.5, 9.4, 11], [1.5, 9.4, 12.6]],
    note: 'Crosses a floor. Upside down in the drawing on purpose: this is the only electrical run that has to pass through a shaft, and the shaft is shared with everything else.',
    render: { type: 'duct', w: 0.3, h: 0.2 }
  },
  {
    id: 'LV-13', from: 'sts', to: 'busway', kind: 'duct', tray: 3.0,
    voltage: '400 V', conductor: 'Busduct, 1,600 A',
    circuits: 1, load: '1,600 A',
    routeNote: 'STS output to the hall busway through the same riser',
    via: [[1.5, 3.4, -16.0], [1.5, 3.4, 11], [1.5, 9.4, 11], [1.5, 9.4, -9.75]],
    note: 'Second source into the hall. Two busways, two paths, and a rack that can only be fed from both is the point.',
    render: { type: 'duct', w: 0.3, h: 0.2 }
  },

  /* ----------------------------- DC side ----------------------------- */
  {
    id: 'DC-01', from: 'pdumain', to: 'busway', kind: 'duct', tray: 3.0,
    voltage: '400 V', conductor: 'Busduct, 3,200 A',
    circuits: 2, load: '3,200 A',
    routeNote: 'Main PDU to the overhead hall busway, one run per hall',
    note: 'The hall busway. Power is tapped wherever a rack appears, so the hall can be reconfigured without pulling a single cable.',
    render: { type: 'duct', w: 0.36, h: 0.24 }
  },
  {
    id: 'DC-02', from: 'busway', to: 'rackpdu', kind: 'dc', tray: 1.4,
    voltage: '400 V, 3 ph + N + E', conductor: '4C x 25 mm2 flexible, 60 kW per feed',
    circuits: 1, load: '87 A per feed',
    routeNote: 'Tap off box on the busway, flexible drop to the rack PDU',
    note: 'The last copper before the rack. Every tap box is metered, because this is where capacity planning actually happens.',
    render: { type: 'tubes', n: 2, r: 0.035 }
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
