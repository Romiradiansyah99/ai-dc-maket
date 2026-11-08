// Cooling equipment reference content: water side and air side.

export const MECH = {

  chiller: {
    tag: 'CH-01..03', name: 'Water Cooled Chiller', sys: 'coolw', sub: 'plant',
    short: '1,800 kW each, 3 units, N+1, VSD',
    philosophy: 'A chiller does not make cold. It takes heat from one place and puts it somewhere you are allowed to dump it.',
    function: 'Cools the facility loop water that will later pick up heat from the technology loop. Three units at 1,800 kW give N+1 for a 2.9 MW heat load at 81 percent loading, which leaves room for the fouling and ambient derating that always arrives after commissioning. Variable speed drive on the compressor is what lets the plant follow a load that swings with GPU job scheduling.',
    spec: [['Cooling capacity', '1,800 kW each'], ['Quantity', '3 (N+1)'], ['Compressor', 'centrifugal, VSD'], ['Leaving water', '18 to 24 C, per design']],
    risks: ['One unit tripping at peak load leaves the remaining two at their limit', 'Approach temperature widening as the condenser fouls, so capacity falls quietly', 'Chilled water setpoint set for legacy comfort cooling rather than warm water AI design'],
    tests: ['Full load capacity test with a load bank or live load', 'Changeover between chillers under load', 'COP and approach measurement at design conditions'],
    refs: [['Heat load', '2.9 MW'], ['Duty capacity', '3,600 kW'], ['Loading', '81 percent']],
    videos: [{ title: 'Centrifugal chiller operation', q: 'centrifugal chiller how it works animation data center' }]
  },

  coolingtower: {
    tag: 'CT-01..02', name: 'Cooling Tower', sys: 'coolw', sub: 'reject',
    short: '2 cells, induced draft, heat rejection to atmosphere',
    philosophy: 'The cooling tower is the building lung. Everything the data center consumes leaves here as vapour.',
    function: 'Rejects condenser heat by evaporating a small fraction of the water. This is the most efficient heat rejection a data center can buy, and it is also the reason the site has a water consumption figure at all. Two cells allow one to be isolated for cleaning while the site runs.',
    spec: [['Cells', '2, induced draft'], ['Heat rejection', '4,500 kW total'], ['Approach', '3 to 5 K'], ['Make up water', 'about 1.5 percent of circulation']],
    risks: ['Water chemistry failing, causing scaling that permanently reduces capacity', 'Legionella risk if the water treatment regime lapses', 'Plume and drift affecting neighbours or recirculating back into the intake'],
    tests: ['Thermal performance test at design wet bulb', 'Water treatment and dosing verification', 'Fan vibration and motor current test'],
    refs: [['Rejection', '4,500 kW'], ['Approach', '3 to 5 K'], ['Water use', 'site KPI']],
    videos: [{ title: 'Cooling tower working principle', q: 'cooling tower how it works animation data center' }]
  },

  drycooler: {
    tag: 'DC-01..02', name: 'Dry Cooler', sys: 'coolw', sub: 'reject',
    short: '2 units, air cooled, water free rejection',
    philosophy: 'The dry cooler is the reason warm water cooling exists: at 30 C supply, the outside air can do the work for free.',
    function: 'Rejects heat to air without evaporation, so it consumes no water. It only makes sense because the technology loop runs warm: at 30 C supply water and a 5 K approach, the dry cooler carries the load whenever ambient is below roughly 25 C, and for the rest of the year the chiller or a hybrid mode takes over.',
    spec: [['Quantity', '2'], ['Type', 'air cooled, EC fans'], ['Capacity', '1,200 kW each at design ambient'], ['Mode', 'dry, hybrid, free cooling']],
    risks: ['Capacity collapsing as ambient rises above the design point', 'Coil fouling from dust, reducing capacity without any alarm', 'Free cooling hours overstated in the energy model'],
    tests: ['Capacity test at design ambient temperature', 'Fan and control sequence verification', 'Free cooling switchover test'],
    refs: [['Capacity', '1,200 kW each'], ['Free cooling', 'below 25 C ambient'], ['Water use', 'zero']],
    videos: [{ title: 'Dry cooler and free cooling', q: 'dry cooler free cooling data center adiabatic explained' }]
  },

  pumppri: {
    tag: 'P-01..03', name: 'Primary Chilled Water Pump', sys: 'coolw', sub: 'plant',
    short: '3 units, 2 duty + 1 standby, VFD, 180 m3/h',
    philosophy: 'The pump does not create flow. It creates a pressure difference, and the loop decides what flow it gets.',
    function: 'Moves facility water from the chillers through the plate heat exchangers. Two duty pumps with one standby means a pump can fail or be serviced without losing the loop. Variable speed control keeps the differential pressure at the furthest heat exchanger rather than at the pump outlet, which is where most of the energy saving lives.',
    spec: [['Quantity', '3 (2 duty + 1 standby)'], ['Flow', '180 m3/h each'], ['Head', '35 m'], ['Control', 'VFD, differential pressure']],
    risks: ['Cavitation from low suction pressure at high flow', 'Standby pump not starting because the auto changeover was never tested', 'Seal leakage running undetected inside a drained floor'],
    tests: ['Flow and head at three load points', 'Duty standby auto changeover', 'NPSH margin verification at maximum flow'],
    refs: [['Flow', '180 m3/h'], ['Head', '35 m'], ['Configuration', '2 duty + 1 standby']],
    videos: [{ title: 'Pump curves and duty points', q: 'centrifugal pump curve duty point VFD explained HVAC' }]
  },

  buffer: {
    tag: 'BT-01', name: 'Buffer Tank', sys: 'coolw', sub: 'plant',
    short: '12 m3, thermal inertia for fast load swings',
    philosophy: 'GPUs change load in milliseconds. Chillers change load in minutes. The tank is the negotiation between the two.',
    function: 'Adds thermal mass so the chiller plant does not see every GPU job start as a step change. Without it the chillers short cycle, which costs efficiency and compressor life. Sizing is driven by the acceptable rate of change on the plant, not by the volume of the loop.',
    spec: [['Volume', '12 m3'], ['Type', 'stratified, insulated'], ['Connection', 'two port, on the return'], ['Instrumentation', 'level, temperature, venting']],
    risks: ['Stratification lost through poor internal design, so the volume is useless', 'Air trapped at the top of the tank', 'Vent and overflow blocked, turning the tank into a pressure vessel'],
    tests: ['Load step response with the tank in and out of service', 'Temperature stratification profile', 'Vent and overflow function'],
    refs: [['Volume', '12 m3'], ['Purpose', 'rate of change control'], ['Connection', 'return side']],
    videos: [{ title: 'Buffer tanks in chilled water systems', q: 'buffer tank chilled water system thermal storage explained HVAC' }]
  },

  phe: {
    tag: 'HX-01..02', name: 'Plate Heat Exchanger', sys: 'coolw', sub: 'sep',
    short: '2 units, hydraulic separation, 1 to 2 K approach',
    philosophy: 'A plate heat exchanger moves heat between two waters without ever letting them touch.',
    function: 'Separates the facility loop, which is open to a cooling tower and therefore dirty, from the technology loop, which runs through cold plates on expensive GPUs. The separation is the whole point: tower water chemistry never reaches the silicon. Approach temperature is the number that matters, because it adds directly to the chiller lift.',
    spec: [['Quantity', '2, one duty one standby'], ['Duty', '3,200 kW each'], ['Approach', '1 to 2 K'], ['Plate material', 'stainless steel, gasketed']],
    risks: ['Internal leakage mixing the two loops, detected only by a chemistry trend', 'Fouling on the facility side widening the approach', 'Gasket failure during a thermal cycle'],
    tests: ['Pressure test on the secondary side', 'Approach measurement at full load', 'Plate inspection and gasket check at first service'],
    refs: [['Duty load', '2,900 kW'], ['Margin', '10 percent'], ['Separation', 'mandatory']],
    videos: [{ title: 'Plate heat exchanger operation', q: 'plate heat exchanger how it works animation HVAC' }]
  },

  cdu: {
    tag: 'CDU-01..06', name: 'Coolant Distribution Unit', sys: 'coolw', sub: 'dist',
    short: '1,200 kW each, 3 per hall, N+1, in row',
    philosophy: 'The CDU exists for one reason: to keep facility water, which is dirty and cheap, away from technology water, which is clean and expensive.',
    function: 'Holds the boundary between the facility loop and the technology cooling loop. Inside every CDU there is a plate heat exchanger, a pump set, filtration and the controls that decide flow to the racks. Three units per hall at 1,200 kW give N+1 against a 1.45 MW hall heat load, so a single CDU can be serviced while the hall runs.',
    spec: [['Capacity', '1,200 kW each'], ['Quantity', '3 per hall, N+1'], ['Pump', 'N+1, VFD'], ['Supply temperature', '32 to 45 C']],
    risks: ['Pump N+1 fine, but filters clogging so flow drops without a clear alarm', 'Corrosion and fouling reducing heat exchanger effectiveness', 'Widening delta T turning the pump into the bottleneck'],
    tests: ['Hydrostatic test of the secondary loop', 'Alternating pump and auto changeover test', 'Flow and delta T verification at full rack load, low flow and high temperature alarm test'],
    refs: [['Hall heat load', '1.45 MW'], ['Duty capacity', '2,400 kW'], ['Delta T', '8 K']],
    videos: [{ title: 'CDU in liquid cooled data centers', q: 'coolant distribution unit CDU liquid cooling data center explained' }]
  },

  manifold: {
    tag: 'MAN-01', name: 'Rack Manifold and Quick Disconnects', sys: 'coolw', sub: 'dist',
    short: 'Supply and return headers, one QD pair per rack',
    philosophy: 'The manifold is the part of a liquid cooled hall that gets touched by human hands, and hands are where leaks come from.',
    function: 'Distributes supply and return coolant above the rack row, with a quick disconnect pair at every rack position. Every rack install and every rack removal opens a coupling, so the manifold is the highest frequency leak point in the building, and the drip tray and leak detection under it are not optional.',
    spec: [['Configuration', 'supply and return header'], ['Tap off', '1 QD pair per rack'], ['Working pressure', '6 to 10 bar'], ['Leak detection', 'cable under the full run']],
    risks: ['QD coupling leaking when a rack is plugged or unplugged', 'Air trapped in the header, so flow is uneven across the row', 'Condensation on uninsulated pipe outside the containment'],
    tests: ['Pressure test at 1.5 times working pressure', 'Repeated connect and disconnect of every QD, dry', 'Flow balancing per rack position'],
    refs: [['Working pressure', '6 to 10 bar'], ['Test pressure', '1.5 x working'], ['Tap off', '1 per rack']],
    videos: [{ title: 'Liquid cooling manifolds and QDs', q: 'liquid cooling manifold quick disconnect data center rack explained' }]
  },

  coldplate: {
    tag: 'CP-01', name: 'Cold Plate and Technology Loop', sys: 'coolw', sub: 'load',
    short: 'Direct to chip, PG25, 45 C return',
    philosophy: 'The cold plate is where the heat actually leaves the silicon, so everything upstream exists only to serve this small piece of copper.',
    function: 'A machined copper plate clamped onto the GPU or CPU package. Heat conducts into the plate and leaves with the coolant, which is why a 100 kW rack can be cooled with a pipe the size of a wrist instead of a wall of air. The coolant is a propylene glycol mixture, chosen for freeze protection and for being less aggressive than water alone.',
    spec: [['Coolant', 'PG25 propylene glycol'], ['Flow per rack', 'about 10 m3/h'], ['Supply', '32 to 45 C'], ['Delta T', '8 to 12 K']],
    risks: ['Uneven flow between nodes on the same manifold, so one GPU throttles', 'Micro channel blockage from debris left in the loop', 'Clamp pressure too high, cracking the package'],
    tests: ['Flow verification per node at full load', 'Pressure and leak test before power on', 'Thermal performance under sustained synthetic load'],
    refs: [['Rack load', '100 kW'], ['Flow per rack', '10 m3/h'], ['Delta T', '8 to 12 K']],
    videos: [{ title: 'Direct to chip liquid cooling', q: 'direct to chip liquid cooling cold plate GPU data center explained' }]
  },

  header: {
    tag: 'HDR-01', name: 'Plant Header and Isolation Valves', sys: 'coolw', sub: 'plant',
    short: 'Supply and return headers, sectionalised',
    philosophy: 'A header is a promise that you can take any one machine out of service without taking the building out with it.',
    function: 'Collects chiller and pump outputs into a common supply and return, with isolation valves arranged so each machine can be removed from the loop while the rest keeps running. Valve placement, not pipe size, is what determines whether maintenance is possible during operation.',
    spec: [['Configuration', 'supply and return headers'], ['Isolation', 'per machine, butterfly valves'], ['Material', 'carbon steel, insulated'], ['Instrumentation', 'pressure and temperature per branch']],
    risks: ['Isolation valves seized, so maintenance requires a full shutdown', 'Air pockets at high points without automatic vents', 'Differential pressure sensor installed at the wrong end of the loop'],
    tests: ['Isolation and drain down of each branch', 'Automatic air vent function', 'Differential pressure transmitter calibration'],
    refs: [['Isolation', 'per machine'], ['Vents', 'automatic at high points'], ['Material', 'carbon steel']],
    videos: [{ title: 'Chilled water plant piping and headers', q: 'chilled water plant primary secondary pumping header design explained' }]
  },

  crah: {
    tag: 'CRAH-01', name: 'Computer Room Air Handler', sys: 'coola', sub: 'air',
    short: '300 kW each, chilled water coil, EC fan wall',
    philosophy: 'In a liquid cooled hall the CRAH is the leftover system, and its small capacity is the point.',
    function: 'Cools the loads that are not on a cold plate: network switches, storage, power shelves, and the room losses. On an AI hall that is a small fraction of the total, so the air system shrinks while the water system grows. Sizing it like a conventional hall is the single most common mistake in a liquid cooled design.',
    spec: [['Capacity', '300 kW sensible each'], ['Coil', 'chilled water, 6 row'], ['Fan', 'EC fan wall, VFD'], ['Supply air', '18 to 22 C']],
    risks: ['Condensate drain blocked, so water finds the floor', 'Coil fouled, reducing capacity with no obvious alarm', 'Airflow short circuiting straight back to the return'],
    tests: ['Airflow and temperature distribution per zone', 'Condensate drain at full flow', 'Single unit failure changeover'],
    refs: [['Air side load', '300 kW'], ['Share of IT load', 'about 9 percent'], ['Supply air', '18 to 22 C']],
    videos: [{ title: 'CRAH units explained', q: 'CRAH computer room air handler data center cooling explained' }]
  },

  containment: {
    tag: 'CAC-01', name: 'Cold Aisle Containment', sys: 'coola', sub: 'contain',
    short: 'Roof panels and self closing doors',
    philosophy: 'Containment is not about making cold air. It is about stopping the cold air you already paid for from leaving.',
    function: 'Seals the cold aisle so supply air reaches the rack intakes instead of mixing with hot exhaust. On a liquid cooled hall its role shifts: most of the heat is on water, so containment mainly protects the remaining air cooled equipment and keeps the room from stratifying.',
    spec: [['Configuration', 'roof panels and doors'], ['Aisle width', '2.4 m'], ['Target delta P', '5 to 10 Pa'], ['Panel height', '2.4 m']],
    risks: ['Roof panels not sealed, so bypass air undermines the whole aisle', 'Doors not self closing, so the aisle is open most of the day', 'Rack removal route blocked by manifolds and cabling'],
    tests: ['Panel and door seal test', 'Differential pressure between cold and hot aisle', 'Single rack removal simulation'],
    refs: [['Aisle width', '2.4 m'], ['Delta P', '5 to 10 Pa'], ['Panel height', '2.4 m']],
    videos: [{ title: 'Hot and cold aisle containment', q: 'cold aisle containment data center airflow explained' }]
  },

  returnpath: {
    tag: 'RAP-01', name: 'Return Air Path and Plenum', sys: 'coola', sub: 'path',
    short: 'Hot aisle return, ceiling plenum',
    philosophy: 'Air that cannot find its way back is air you have to cool twice.',
    function: 'Carries hot exhaust from the rack row back to the CRAH return without mixing into the cold aisle. Return path design is measured, not assumed: a pressure and temperature traverse across the plenum shows whether the hall is actually behaving the way the model says it is.',
    spec: [['Configuration', 'ceiling plenum return'], ['Velocity', 'under 5 m/s'], ['Instrumentation', 'temperature and pressure traverse'], ['Balancing', 'dampers per zone']],
    risks: ['Return path restriction raising hall static pressure', 'Stratification leaving hot air at high level', 'Balancing never performed after fit out'],
    tests: ['Traverse measurement at design airflow', 'Zone balancing and damper setting', 'Temperature profile at three heights'],
    refs: [['Velocity', 'under 5 m/s'], ['Balancing', 'per zone'], ['Profile', 'three heights']],
    videos: [{ title: 'Data center airflow management', q: 'data center airflow management return plenum CFD explained' }]
  }
};
