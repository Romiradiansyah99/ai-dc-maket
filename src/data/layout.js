// Site, levels, rooms and equipment placement.
// Units are metres. X = building length, Z = building depth, Y = up.

export const SITE = { w: 100, d: 80 };

export const BUILDING = { w: 60, d: 40, slab: 0.7, floorH: 6 };

export const LEVELS = [
  { id: 'L0', name: 'Plant & Yard', subtitle: 'Power, cooling plant, fire, operations', y: 0 },
  { id: 'L1', name: 'White Space', subtitle: 'Data halls, CDUs, network entry', y: 6 },
  { id: 'L2', name: 'Support', subtitle: 'Staging, NOC, offices, security', y: 12 }
];

export const ROOF_Y = 18;

// Rooms are drawn as partitions, labelled, and used to place equipment.
export const ROOMS = {
  L0: [
    { id: 'mv-room', name: 'MV Room', x: [-29, -19], z: [-19, -11] },
    { id: 'tx-room', name: 'Transformer Room', x: [-18, -8], z: [-19, -11] },
    { id: 'lv-room', name: 'LV Switch Room', x: [-7, 3], z: [-19, -11] },
    { id: 'ups-room', name: 'UPS & Battery Room', x: [4, 14], z: [-19, -11] },
    { id: 'ats-room', name: 'Transfer Switch Room', x: [15, 22], z: [-19, -11] },
    { id: 'chiller-plant', name: 'Chiller Plant', x: [-29, -6], z: [-9, 11] },
    { id: 'pump-room', name: 'Pump & Heat Exchanger Room', x: [-5, 4], z: [-9, 3] },
    { id: 'fire-pump-room', name: 'Fire Pump Room', x: [5, 12], z: [-9, 3] },
    { id: 'epms-room', name: 'EPMS / Metering Room', x: [13, 22], z: [-9, 3] },
    { id: 'store', name: 'Maintenance Store', x: [23, 29], z: [-19, -4] },
    { id: 'lobby', name: 'Entry Lobby & Mantrap', x: [-24, -14], z: [13, 19] },
    { id: 'riser-l0', name: 'Riser & Switch Room', x: [-3, 8], z: [6.5, 18] }
  ],
  L1: [
    { id: 'dh01', name: 'Data Hall 01', x: [-29, -2], z: [-19, 1] },
    { id: 'dh02', name: 'Data Hall 02', x: [2, 29], z: [-19, 1] },
    { id: 'mmr', name: 'MMR / ODF', x: [-29, -17], z: [3, 19] },
    { id: 'network', name: 'Network Room', x: [-15, -4], z: [3, 19] },
    { id: 'electrical', name: 'IT Electrical / PDU Room', x: [9, 17], z: [3, 19] },
    { id: 'riser-l1', name: 'Riser Room', x: [-3, 8], z: [6.5, 18] }
  ],
  L2: [
    { id: 'staging', name: 'Staging & Integration', x: [-29, -8], z: [-19, 1] },
    { id: 'office', name: 'Office & Meeting', x: [-7, 8], z: [-19, -4] },
    { id: 'security', name: 'Security & Access Control', x: [9, 18], z: [-19, -6] },
    { id: 'break', name: 'Break Room', x: [19, 29], z: [-19, -6] },
    { id: 'training', name: 'Training Room', x: [-29, -10], z: [3, 19] },
    { id: 'noc', name: 'NOC / Network Operations', x: [9, 22], z: [3, 19] },
    { id: 'riser-l2', name: 'Riser Room', x: [-3, 8], z: [6.5, 18] }
  ]
};

// Grade-level plant outside the building shell.
export const YARD = [
  { id: 'gardu', name: 'Customer Substation (Gardu Induk)', x: [-48, -34], z: [-16, -2], kind: 'gardu' },
  { id: 'genset-yard', name: 'Generator Yard', x: [-30, -12], z: [-38, -26], kind: 'yard' },
  { id: 'fuel-farm', name: 'Fuel Farm', x: [-11, -5], z: [-38, -26], kind: 'yard' },
  { id: 'ct-yard', name: 'Cooling Tower Yard', x: [-4, 16], z: [-38, -26], kind: 'yard' },
  { id: 'dc-yard', name: 'Dry Cooler Yard', x: [17, 30], z: [-38, -26], kind: 'yard' }
];

// Vertical shafts tying the levels together.
//
// Every one of these runs from the ground floor to the roof, because that is what a
// shaft does: it serves every level, and a spare floor is a spare sleeve. The cable,
// pipe and fiber schedules all take their waypoints from these coordinates, so a
// riser cannot drift away from the services it is supposed to contain.
export const R = {
  lv: [0.0, 9.0],      // LV busduct riser
  chw: [4.0, 9.0],     // chilled water riser
  fire: [6.6, 9.0],    // fire riser
  fiber: [0.0, 13.5],  // fiber and comms riser
  lift: [6.6, 13.5]    // goods lift shaft
};

export const RISERS = [
  { id: 'lv', name: 'LV Busduct Riser', x: R.lv[0], z: R.lv[1], from: 0, to: 18, kind: 'busway' },
  { id: 'chw', name: 'Chilled Water Riser', x: R.chw[0], z: R.chw[1], from: 0, to: 18, kind: 'pipe' },
  { id: 'fire', name: 'Fire Riser', x: R.fire[0], z: R.fire[1], from: 0, to: 18, kind: 'pipe' },
  { id: 'fiber', name: 'Fiber & Comms Riser', x: R.fiber[0], z: R.fiber[1], from: 0, to: 18, kind: 'tray' },
  { id: 'lift', name: 'Goods & Passenger Lift', x: R.lift[0], z: R.lift[1], from: 0, to: 18, kind: 'lift' }
];

// Buried services. Negative Y is below finished floor level, which is grade.
export const BURIED = { cable: -1.1, pipe: -1.4, mv: -1.6 };

// Data hall internals. Two rows of eight AI racks per hall.
export const HALL = {
  rackW: 0.6, rackH: 2.2, rackD: 1.2, rackPitch: 1.65,
  rows: [-12.5, -7.0],       // z of each rack row (cold aisle between)
  rackStartX: -26.5,
  racksPerRow: 8,
  cduX: [-10.5, -8.6, -6.7],
  aisle: { z: [-11.2, -8.3], h: 2.4 }
};

export const HALLS = [
  { id: 'dh01', name: 'Data Hall 01', x0: -29, label: 'DH-01' },
  { id: 'dh02', name: 'Data Hall 02', x0: 2, label: 'DH-02' }
];
