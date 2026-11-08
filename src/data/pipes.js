// Piping schedule.
//
// The cooling plant and the fire main, defined as pipe runs rather than decoration:
// what it connects, the medium and its temperature, the line size, the design flow,
// whether it is insulated, and how it is routed. The scene builds the geometry from
// these records, so the drawing and the schedule cannot disagree.
//
//   service   chws | chwr  : chilled water supply / return, facility loop
//             cnds | cndr  : condenser water supply / return, chiller to tower
//             techs | techr: technology loop, warm water, 32 to 45 C
//             fire         : fire main, wet or preaction
//             make         : make-up and buffer
//   elev      metres above the run's own floor, or 'buried'
//   dn        nominal bore in mm, used for the drawn radius
//   pair      draws a parallel supply and return leg, offset to the side

export const PIPES = [
  /* ---------------- technology loop, inside the halls ---------------- */
  {
    id: 'TP-01', from: 'manifold', to: 'cdu', toIndex: 0, service: 'techr', pair: 'techs',
    dn: 200, medium: 'Coolant, 35% propylene glycol', temp: '45 C return / 38 C supply',
    flow: '130 m3/h per CDU', insulation: 'Closed cell, 19 mm', elev: 2.35,
    routeNote: 'Hall pipework at high level, manifold to CDU, both legs on shared supports',
    note: 'The technology loop never leaves the hall. It carries heat from the cold plates to the CDU, and it is the only pipe that a rack can leak into the room.'
  },
  {
    id: 'TP-02', from: 'manifold', to: 'cdu', fromIndex: 1, toIndex: 3, service: 'techr', pair: 'techs',
    dn: 200, medium: 'Coolant, 35% propylene glycol', temp: '45 C return / 38 C supply',
    flow: '130 m3/h per CDU', insulation: 'Closed cell, 19 mm', elev: 2.35,
    routeNote: 'Second hall, same arrangement, independent piping',
    note: 'Two halls, two technology loops. A leak or a pump failure in one hall must not drain the other.'
  },
  {
    id: 'TP-03', from: 'rack', to: 'manifold', service: 'techr', dn: 50,
    medium: 'Coolant, quick disconnect hose', temp: '45 C return',
    flow: '4 m3/h per rack', insulation: 'Hose, no insulation', elev: 2.3,
    routeNote: 'Rack drops from the manifold, flexible hose through a non-spill coupling',
    note: 'The only flexible pipe in the plant, and the one most likely to be opened by a person. Every coupling is dripless by design, because the alternative is coolant on a live busway.'
  },

  /* ------------------ facility loop, chilled water ------------------- */
  {
    id: 'CHW-01', from: 'cdu', to: 'phe', toIndex: 0, service: 'chwr', pair: 'chws',
    dn: 250, medium: 'Water, treated', temp: '32 C return / 26 C supply',
    flow: '180 m3/h', insulation: 'Closed cell, 25 mm', elev: 0.45,
    via: [[-8.5, 0.45, -9.75], [-8.5, 0.45, -5.0], [-2.4, 0.45, -5.0]],
    routeNote: 'Drops through the hall floor into the trench, runs to the heat exchanger room',
    note: 'Crosses a floor, so it passes through a fire stopped penetration. This is the pipe that makes the halls independent of where the chillers are.'
  },
  {
    id: 'CHW-02', from: 'phe', to: 'pumppri', toIndex: 0, service: 'chws',
    dn: 250, medium: 'Water, treated', temp: '26 C supply',
    flow: '180 m3/h', insulation: 'Closed cell, 25 mm', elev: 1.5,
    routeNote: 'Heat exchanger outlet to pump suction, short and direct',
    note: 'Suction side. Any air here becomes cavitation at the impeller, which is why the strainer and the air separator sit on this leg.'
  },
  {
    id: 'CHW-03', from: 'pumppri', to: 'header', fromIndex: 0, toIndex: 0, service: 'chws',
    dn: 250, medium: 'Water, treated', temp: '26 C supply',
    flow: '180 m3/h', insulation: 'Closed cell, 25 mm', elev: 1.6,
    routeNote: 'Pump discharge to the supply header, check valve and isolation valve at the pump',
    note: 'Pumped, not pulled. The header then feeds whichever chillers are running, and the pumps hold differential pressure at the furthest coil, not at their own outlet.'
  },
  {
    id: 'CHW-04', from: 'header', to: 'chiller', toIndex: 0, service: 'chws',
    dn: 250, medium: 'Water, treated', temp: '26 C entering evaporator',
    flow: '180 m3/h', insulation: 'Closed cell, 25 mm', elev: 1.7,
    routeNote: 'Supply header to chiller evaporator, butterfly isolation at each branch',
    note: 'One branch per chiller. Three chillers, N+1, so the header is sized for two and a half machines of flow, not three.'
  },
  {
    id: 'CHW-05', from: 'chiller', to: 'phe', toIndex: 0, service: 'chwr',
    dn: 250, medium: 'Water, treated', temp: '32 C leaving evaporator',
    flow: '180 m3/h', insulation: 'Closed cell, 25 mm', elev: 1.7,
    routeNote: 'Chiller return to the heat exchanger, closing the facility loop',
    note: 'The loop closes here. Heat picked up in the halls is handed to the condenser water on the other side of this exchanger.'
  },
  {
    id: 'CHW-06', from: 'pumppri', to: 'buffer', fromIndex: 1, service: 'make',
    dn: 80, medium: 'Water, treated', temp: 'Ambient',
    flow: 'Make-up, 1 m3/h', insulation: 'None', elev: 1.2,
    routeNote: 'Buffer and make-up connection at the pump room wall',
    note: 'Small pipe, large consequence. Without make-up water the loop slowly loses inventory and the pumps air bind at three in the morning.'
  },

  /* ---------------------- condenser water loop ----------------------- */
  {
    id: 'CND-01', from: 'chiller', to: 'coolingtower', toIndex: 0, service: 'cndr',
    dn: 300, medium: 'Water, treated with biocide', temp: '37 C return to tower',
    flow: '220 m3/h', insulation: 'None, heat rejection', elev: 'buried',
    routeNote: 'Buried condenser water main from the chiller room to the tower yard',
    note: 'Hot leg to the tower. Uninsulated on purpose: this pipe is trying to lose heat, and insulating it would only hide the loss inside the building.'
  },
  {
    id: 'CND-02', from: 'coolingtower', to: 'chiller', toIndex: 0, service: 'cnds',
    dn: 300, medium: 'Water, treated with biocide', temp: '29 C from tower',
    flow: '220 m3/h', insulation: 'None', elev: 'buried',
    routeNote: 'Buried return main, tower basin to condenser inlet, with strainer at the pump',
    note: 'Cold leg back. Every degree above the wet bulb costs compressor power, so this is the pipe where tower maintenance shows up on the electricity bill.'
  },
  {
    id: 'CND-03', from: 'chiller', to: 'coolingtower', fromIndex: 2, toIndex: 1, service: 'cndr',
    dn: 300, medium: 'Water, treated with biocide', temp: '37 C return',
    flow: '220 m3/h', insulation: 'None', elev: 'buried',
    routeNote: 'Second tower cell, common header arrangement',
    note: 'Two cells, so one can be cleaned while the plant keeps running. A tower that cannot be isolated is a tower that never gets cleaned.'
  },

  /* ------------------------- free cooling ---------------------------- */
  {
    id: 'FRE-01', from: 'drycooler', to: 'chiller', toIndex: 0, service: 'cnds',
    dn: 200, medium: 'Glycol, 30%', temp: 'Ambient, switchover below 25 C',
    flow: '160 m3/h', insulation: 'Closed cell, 19 mm', elev: 'buried',
    routeNote: 'Dry cooler loop into the condenser return, isolated by a changeover valve',
    note: 'The whole point of warm water design. Below about 25 C ambient the dry cooler carries the load and the chillers stop, which is most of the year in most climates.'
  },

  /* ------------------------ CRAH chilled water ----------------------- */
  {
    id: 'CHW-07', from: 'header', to: 'crah', toIndex: 2, service: 'chws',
    dn: 150, medium: 'Water, treated', temp: '18 to 22 C supply',
    flow: '45 m3/h', insulation: 'Closed cell, 25 mm', elev: 1.8,
    via: [[-20, 1.8, 9.4], [11.5, 1.8, 9.4], [11.5, 8.4, 9.4], [11.5, 8.4, -2.2], [7.5, 8.4, -2.2]],
    routeNote: 'Up the chilled water riser to the white space, then along the CRAH line',
    note: 'The riser is the reason a CRAH on the first floor can be fed from a chiller on the ground floor. Everything vertical in this building passes through four shafts.'
  },
  {
    id: 'CHW-08', from: 'header', to: 'crah', toIndex: 3, service: 'chws',
    dn: 150, medium: 'Water, treated', temp: '18 to 22 C supply',
    flow: '45 m3/h', insulation: 'Closed cell, 25 mm', elev: 1.8,
    via: [[-20, 1.8, 9.4], [11.5, 1.8, 9.4], [11.5, 8.4, 9.4], [11.5, 8.4, -2.2], [23.5, 8.4, -2.2]],
    routeNote: 'Second hall branch from the same riser',
    note: 'Same riser, second branch. Two halls fed from one shaft means one fire stop to maintain, and one place to look when the flow balance is wrong.'
  },

  /* ----------------------------- fire -------------------------------- */
  {
    id: 'FIRE-01', from: 'firepump', to: 'preaction', toIndex: 0, service: 'fire',
    dn: 150, medium: 'Water, fire main', temp: 'Ambient',
    flow: '1,500 L/min', insulation: 'None, red', elev: 1.9,
    via: [[8.2, 1.9, -2.4], [8.5, 1.9, 11], [8.5, 10.9, 11], [8.5, 10.9, -11.8], [-15.5, 10.9, -11.8]],
    routeNote: 'Fire pump discharge up the fire riser at x 8.5, z 11, then along the hall ceiling',
    note: 'Dry until two signals agree. The pipe above a data hall is deliberately empty, because a burst pipe over live racks costs more than a fire.'
  },
  {
    id: 'FIRE-02', from: 'firepump', to: 'preaction', toIndex: 1, service: 'fire',
    dn: 150, medium: 'Water, fire main', temp: 'Ambient',
    flow: '1,500 L/min', insulation: 'None, red', elev: 1.9,
    via: [[8.2, 1.9, -2.4], [8.5, 1.9, 11], [8.5, 10.9, 11], [8.5, 10.9, -11.8], [15.5, 10.9, -11.8]],
    routeNote: 'Same riser, branch to the second hall ceiling',
    note: 'One riser serves both halls. That is a deliberate single point of failure, and it is why the fire pump has a diesel standby.'
  }
];

export const PIPE_BY_ID = Object.fromEntries(PIPES.map((p) => [p.id, p]));

export const PIPES_TOUCHING = (key) => PIPES.filter((p) => p.from === key || p.to === key);

// Service colours follow the usual plant room convention: chilled water blue,
// condenser water teal, technology loop amber, fire red, make-up grey.
export const SERVICE = {
  chws: { name: 'Chilled water supply', color: 0x1F4E8C, short: 'CHWS' },
  chwr: { name: 'Chilled water return', color: 0x3E6FA8, short: 'CHWR' },
  cnds: { name: 'Condenser water supply', color: 0x0E7E88, short: 'CNDS' },
  cndr: { name: 'Condenser water return', color: 0x1C9AA6, short: 'CNDR' },
  techs: { name: 'Technology loop supply', color: 0xC2701E, short: 'TECHS' },
  techr: { name: 'Technology loop return', color: 0x8C4E12, short: 'TECHR' },
  fire: { name: 'Fire main', color: 0xA31621, short: 'FIRE' },
  make: { name: 'Make-up water', color: 0x5A6B82, short: 'MAKE' }
};
