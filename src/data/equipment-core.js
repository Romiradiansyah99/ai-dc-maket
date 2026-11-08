// IT, fire and facility reference content.

export const CORE = {

  rack: {
    tag: 'R-01..32', name: 'AI Rack', sys: 'it', sub: 'rack',
    short: '48U, 100 kW IT, liquid cooled, 1.5 t',
    philosophy: 'Everything in this building is a support system for a box that turns electricity into heat and arithmetic.',
    function: 'Houses the GPU servers, from eight GPU nodes up to rack scale systems. At 100 kW per rack the heat cannot leave through the front door, so almost all of it is captured by cold plates and carried out on water. What remains is a small air load, a large power feed, and a rack that weighs more than a car.',
    spec: [['Height', '48U'], ['IT load', '100 kW'], ['Cooling', 'direct to chip, PG25'], ['Weight', 'about 1,500 kg loaded']],
    risks: ['Quick disconnect leaking onto a live busbar', 'Coolant supply temperature drifting up, so GPUs throttle before anyone notices', 'Floor or rail not rated for the loaded weight'],
    tests: ['Load bank per rack with phase and neutral verification', 'Full stress test with coolant delta T recorded', 'Loop pressure test before any IT equipment is installed, repeated QD connect and disconnect with no drip'],
    refs: [['Load', '100 kW'], ['Weight', '1,500 kg'], ['Coolant', 'PG25']],
    videos: [{ title: 'Inside an AI data hall', q: 'AI data center GPU rack liquid cooling 100kW explained' }]
  },

  odf: {
    tag: 'ODF-01', name: 'MMR / Optical Distribution Frame', sys: 'it', sub: 'network',
    short: 'Meet me room, diverse fiber entry, 400G per port',
    philosophy: 'Every byte this building serves enters through this room, which makes it the single point of failure that nobody notices until it is one.',
    function: 'Terminates the incoming carrier fibers and cross connects them to the internal backbone. Diverse physical entry, ideally on opposite sides of the building, is what separates a real redundant design from a diagram that looks redundant. Patch discipline here determines how much downtime a single fiber fault actually causes.',
    spec: [['Entry', '2 diverse, opposite facades'], ['Capacity', '400G per port'], ['Cross connect', 'LC and MPO'], ['Documentation', 'every port labelled and recorded']],
    risks: ['Both carrier entries entering through the same duct', 'Bending radius violated during routine patching', 'Patch records out of date, so a fault takes hours to trace'],
    tests: ['Loss budget per link, both directions', 'Redundant path failover test', 'Label and documentation audit'],
    refs: [['Entries', '2, diverse'], ['Port speed', '400G'], ['Loss budget', 'per link, measured']],
    videos: [{ title: 'Meet me room and fiber entry', q: 'meet me room MMR data center fiber optic entry explained' }]
  },

  tray: {
    tag: 'CT-01', name: 'Cable Tray and Containment of Services', sys: 'it', sub: 'network',
    short: 'Fiber and copper, separated from power',
    philosophy: 'Cable tray is the physical diagram of which systems are allowed to touch each other.',
    function: 'Carries fiber and copper from the MMR to each rack row, deliberately separated from power routes. The separation is not cosmetic: parallel runs of power and signal cable induce noise, and a tray fire that also contains power cables takes out both the data and the ability to run the room.',
    spec: [['Separation', '300 mm minimum from power'], ['Occupancy', '40 percent maximum fill'], ['Routing', 'overhead, per row'], ['Bonding', 'every tray section']],
    risks: ['Fill above 40 percent, so no cable can be added later', 'Data tray installed on the same supports as power', 'Bending radius violated at the tray exit'],
    tests: ['Fill measurement per route', 'Separation distance verification', 'Tray bonding continuity'],
    refs: [['Separation', '300 mm'], ['Fill', '40 percent max'], ['Bonding', 'continuous']],
    videos: [{ title: 'Structured cabling in data centers', q: 'data center structured cabling cable tray separation explained' }]
  },

  vesda: {
    tag: 'VESDA-01', name: 'Aspirating Smoke Detection', sys: 'fire', sub: 'detect',
    short: 'Laser detection, 3 alarm levels, per hall',
    philosophy: 'In a hall full of cable and air, the fire you can see is already the fire you have lost.',
    function: 'Draws air samples continuously from pipes above the racks and measures obscuration at a level far below a conventional detector. Three alarm levels let the system warn long before it acts, which on a live data hall is the difference between an investigation and a discharge.',
    spec: [['Type', 'aspirating, laser'], ['Alarm levels', 'alert, action, fire'], ['Zones', 'per hall and per return plenum'], ['Sampling', 'capillary to each rack row']],
    risks: ['Sampling pipe blocked, so the detector sees clean air forever', 'Alarm thresholds set so high that the first two levels never trigger', 'Detector calibration drifting without anyone checking the trend'],
    tests: ['Smoke test at the furthest sampling point', 'Three level alarm threshold verification', 'Pipe flow and filter check'],
    refs: [['Levels', '3'], ['Zones', 'per hall'], ['Sensitivity', 'below visible smoke']],
    videos: [{ title: 'VESDA aspirating detection', q: 'VESDA aspirating smoke detection data center explained' }]
  },

  leakdet: {
    tag: 'LD-01', name: 'Liquid Leak Detection', sys: 'fire', sub: 'detect',
    short: 'Sensing cable under manifolds and CDUs, 4 zones',
    philosophy: 'On a water cooled hall, the most likely incident is not a fire. It is a drip.',
    function: 'A sensing cable runs under every manifold, CDU and pump, and raises an alarm with a location when liquid bridges two conductors. This is the primary safety system for daily risk in a liquid cooled building, more relevant than smoke detection, and it must name the zone rather than simply announce that something, somewhere, is wet.',
    spec: [['Zones', '4 per hall'], ['Response', 'under 30 s'], ['Sensor', 'addressable sensing cable'], ['Integration', 'to EPMS and CDU controls']],
    risks: ['Dead zone outside cable coverage', 'Alarm without location, so the search takes longer than the spill', 'Cable damaged by other trades during fit out'],
    tests: ['Test each zone at its furthest point', 'Verify the alarm names the location', 'Integration test to EPMS and automatic CDU trip'],
    refs: [['Zones', '4'], ['Response', 'under 30 s'], ['Coverage', 'full manifold run']],
    videos: [{ title: 'Leak detection in liquid cooled halls', q: 'liquid leak detection sensing cable data center cooling explained' }]
  },

  cleanagent: {
    tag: 'FEA-01', name: 'Clean Agent Suppression', sys: 'fire', sub: 'suppress',
    short: 'Novec 1230, electrical rooms, 10 min hold',
    philosophy: 'Water is the best fire extinguisher in the building and the worst thing you can put on a live switchboard.',
    function: 'Floods an electrical room with a gaseous agent that stops combustion without leaving residue on the equipment. The design concentration has to suit the room volume, and the room has to hold it: an enclosure that leaks cannot hold concentration, and a suppression system that cannot hold is a system that only looks installed.',
    spec: [['Agent', 'Novec 1230'], ['Concentration', '5 to 6 percent'], ['Hold time', '10 minutes minimum'], ['Application', 'MV room, LV room, UPS room']],
    risks: ['Design concentration insufficient for the actual room volume', 'Room not sealed, so agent leaks out before it works', 'No interlock with ventilation and dampers'],
    tests: ['Room integrity and hold time test', 'Concentration and volume verification', 'Damper and ventilation interlock test'],
    refs: [['Concentration', '5 to 6 percent'], ['Hold', '10 min'], ['Residue', 'none']],
    videos: [{ title: 'Clean agent fire suppression', q: 'clean agent fire suppression system data center novec FM200 explained' }]
  },

  preaction: {
    tag: 'SPR-01', name: 'Pre Action Sprinkler System', sys: 'fire', sub: 'suppress',
    short: 'Double interlock, dry pipe, hall protection',
    philosophy: 'A pre action system is a sprinkler system that has to be convinced twice before it opens.',
    function: 'Keeps the pipes dry until both a detection signal and a loss of air pressure agree, which prevents a single damaged head from dumping water on live equipment. It is the compromise between wanting water available and not wanting water present, and the double interlock is the whole reason it is acceptable above a data hall.',
    spec: [['Type', 'double interlock pre action'], ['Pipe', 'normally dry, supervised air'], ['Coverage', 'hall ceiling and void'], ['Alarm', 'flow switch and pressure switch']],
    risks: ['Air supervision lost, converting the system to a wet pipe without anyone knowing', 'Detection cross zoned incorrectly, so the system is slower than intended', 'Head obstructed by containment roof panels'],
    tests: ['Trip test on both interlocks', 'Air supervision loss alarm', 'Full flow test at the test valve'],
    refs: [['Type', 'double interlock'], ['Pipe', 'dry, supervised'], ['Coverage', 'hall and void']],
    videos: [{ title: 'Pre action sprinkler systems', q: 'pre action sprinkler system double interlock data center explained' }]
  },

  firepump: {
    tag: 'FP-01', name: 'Fire Pump Set', sys: 'fire', sub: 'pump',
    short: 'Electric, diesel and jockey pump, 2,000 L/min',
    philosophy: 'The diesel pump is there because the fire that takes the power is the same fire that needs the pump.',
    function: 'Maintains pressure in the fire main with a small jockey pump, then brings in the electric duty pump and the diesel standby as pressure falls. The diesel unit exists because a utility outage and a fire can be the same event, and a pump that needs the grid is a pump that can be defeated by the incident it is meant to fight.',
    spec: [['Set', 'electric, diesel, jockey'], ['Duty', '2,000 L/min at 8 bar'], ['Driver', 'electric and diesel, independent fuel'], ['Start', 'automatic on pressure drop']],
    risks: ['Diesel pump failing to start because of battery or fuel neglect', 'Jockey pump cycling, masking a real leak in the main', 'Start sequence not matched to the hydraulic design'],
    tests: ['Automatic start on pressure drop, each pump', 'Diesel pump start with the electric supply isolated', 'Full flow and pressure test at the remotest hydrant'],
    refs: [['Duty', '2,000 L/min'], ['Pressure', '8 bar'], ['Drivers', 'electric + diesel']],
    videos: [{ title: 'Fire pump set operation', q: 'fire pump electric diesel jockey pump sequence explained' }]
  },

  epo: {
    tag: 'EPO-01', name: 'Emergency Power Off', sys: 'fire', sub: 'epo',
    short: 'Two stations per hall, shunt trip',
    philosophy: 'The EPO stops the electricity and must not stop the water, because the heat in the silicon does not stop when the power does.',
    function: 'Cuts IT power at the source in an emergency, and the critical detail is what it leaves running. On a liquid cooled hall the coolant pumps have to keep turning after an EPO to carry residual heat away from the cold plates, otherwise the hardware is damaged by the shutdown itself.',
    spec: [['Stations', '2 per hall'], ['Action', 'shunt trip of IT breakers'], ['Exclusions', 'CDU pumps and leak detection remain live'], ['Reset', 'documented restart procedure required']],
    risks: ['Coolant pumps wired to trip with the EPO', 'Button unprotected from accidental operation', 'No restart procedure, so recovery takes hours'],
    tests: ['EPO simulation without IT load', 'Verify IT drops while coolant pumps keep running', 'Restart procedure walkthrough and timing'],
    refs: [['Stations', '2 per hall'], ['Trip time', 'under 1 s'], ['Exclusions', 'pumps, detection']],
    videos: [{ title: 'EPO in data centers', q: 'emergency power off EPO data center procedure explained' }]
  },

  noc: {
    tag: 'NOC-01', name: 'NOC and EPMS', sys: 'fac', sub: 'ops',
    short: '24/7 monitoring, one alarm list',
    philosophy: 'A control room is not a wall of screens. It is a decision about which alarm deserves an answer at three in the morning.',
    function: 'Central monitoring of power, cooling, leak detection and fire from a single system. Its real engineering problem is alarm rationalisation: a hall of this type generates thousands of points, and if every one of them can alarm at the top level, the operator is blind by design rather than by accident.',
    spec: [['Coverage', 'EPMS and BMS combined'], ['Shift', '24/7'], ['Alarms', 'tiered, with escalation'], ['Records', 'trends retained 12 months minimum']],
    risks: ['Alarm flood hiding the one alarm that matters', 'NOC losing power during the incident it is monitoring', 'No escalation procedure, so alarms are acknowledged but never acted on'],
    tests: ['End to end alarm test from field device to screen', 'Multiple failure scenario walkthrough', 'NOC on essential power and UPS verification'],
    refs: [['Shift', '24/7'], ['Retention', '12 months'], ['Alarm tiers', '3']],
    videos: [{ title: 'Data center EPMS and BMS', q: 'data center EPMS BMS monitoring system explained' }]
  },

  security: {
    tag: 'SEC-01', name: 'Access Control and Mantrap', sys: 'fac', sub: 'security',
    short: 'Two door interlock, anti passback, CCTV',
    philosophy: 'Physical access is the oldest attack surface in the building, and the only one that arrives with a visitor badge.',
    function: 'Controls who reaches the white space and records when they did. A mantrap with two interlocked doors prevents tailgating, because the threat model is not an intruder breaking in, it is an authorised person holding the door for a stranger. Anti passback makes the record match reality.',
    spec: [['Doors', 'two door interlock'], ['Credentials', 'card and biometric'], ['Enforcement', 'anti passback, all zones'], ['Records', 'CCTV retained 90 days']],
    risks: ['Tailgating because the mantrap door timing is too generous', 'Access rights never reviewed, so former staff retain entry', 'CCTV storage covering fewer days than the retention policy requires'],
    tests: ['Mantrap interlock and anti passback test', 'Access rights review against the staff list', 'CCTV coverage and retention verification'],
    refs: [['Doors', '2, interlocked'], ['Retention', '90 days'], ['Enforcement', 'anti passback']],
    videos: [{ title: 'Data center physical security', q: 'data center physical security mantrap access control explained' }]
  },

  staging: {
    tag: 'STG-01', name: 'Staging and Integration Area', sys: 'fac', sub: 'staging',
    short: '4 rack positions, 2 to 3 days per rack',
    philosophy: 'A rack should fail here, in a room with a drain, not in a hall with a live busway.',
    function: 'Where racks are assembled, filled and tested before entering the white space. On a liquid cooled site this stage takes longer than usual, because every rack has to be pressure tested and its quick disconnects cycled before it is allowed anywhere near the hall.',
    spec: [['Capacity', '4 rack positions'], ['Duration', '2 to 3 days per rack'], ['Services', 'power, coolant, network'], ['Floor', 'rated for loaded rack weight']],
    risks: ['Staging capacity too small, creating a queue to enter the hall', 'Leak testing skipped because the schedule is short', 'Staging floor not rated for the loaded rack weight'],
    tests: ['Quick disconnect and pressure test per rack', 'Burn in under synthetic load', 'Weight and route verification'],
    refs: [['Positions', '4'], ['Duration', '2 to 3 days'], ['Tests', 'pressure, burn in']],
    videos: [{ title: 'Rack staging and integration', q: 'data center staging integration rack commissioning explained' }]
  },

  office: {
    tag: 'OFF-01', name: 'Office and Meeting Rooms', sys: 'fac', sub: 'staging',
    short: 'Operations staff and visitors',
    philosophy: 'The people who keep the building running should not have to walk through it to reach a desk.',
    function: 'Working space for the technical and facilities staff, separated from the white space by the security boundary. Keeping it outside the secure zone means a visitor never needs an escort into the hall, and staff circulate without crossing the equipment they are responsible for.',
    spec: [['Capacity', '30 people'], ['Location', 'outside secure zone'], ['Services', 'normal power, not essential'], ['Acoustics', 'separated from plant noise']],
    risks: ['Access path from office to hall crossing the secure boundary twice', 'Noise from generators and chillers reaching the workspace', 'Office on essential power, wasting UPS capacity'],
    tests: ['Access path walkthrough', 'Noise level measurement at the boundary', 'Confirm office is on normal power, not UPS'],
    refs: [['Capacity', '30'], ['Power', 'normal'], ['Zone', 'outside secure']],
    videos: [{ title: 'Data center facility tour', q: 'data center tour facility operations explained' }]
  },

  epms: {
    tag: 'EPMS-01', name: 'EPMS Outstation and Power Metering', sys: 'fac', sub: 'ops',
    short: 'Every breaker, every kW, one time base',
    philosophy: 'If it is not metered, it is not managed, and a capacity number nobody can prove is a sales number.',
    function: 'Collects power, energy, power quality and breaker status from every board, UPS, PDU and tap off box on site, then publishes it northbound to the NOC. The engineering point is the time base: a kW figure read from the switchboard and a kW figure read from the rack PDU are only comparable if they share a clock, which is why the outstations are time synchronised and the meters are class 0.5S rather than class 1.',
    spec: [['Protocol', 'Modbus TCP and IEC 61850'], ['Meter class', '0.5S on utility boundary'], ['Points', 'about 4,000 per site'], ['Time base', 'NTP synchronised, 1 s resolution']],
    risks: ['Metering on copper signal cable, so a fault takes the monitoring down with the power', 'Points mapped to the wrong breaker, so the operator chases the wrong panel', 'No historian, so the incident cannot be reconstructed afterwards'],
    tests: ['Point to point verification against a reference meter', 'Alarm and event time stamp accuracy', 'Failover test with the primary server offline'],
    refs: [['Points', '4,000'], ['Meter class', '0.5S'], ['Resolution', '1 s']],
    videos: [{ title: 'Power monitoring in data centers', q: 'data center power monitoring EPMS meter Modbus explained' }]
  },

  fibentry: {
    tag: 'CE-01', name: 'Carrier Handover and Fiber Entry', sys: 'it', sub: 'network',
    short: 'Two carriers, two physical routes',
    philosophy: 'The most common way a working data center loses its customers is not power. It is a digger in a street two kilometres away.',
    function: 'The boundary where carrier fiber becomes the site responsibility. Two carriers on two physically separate routes, terminating in separate cabinets, because two fibers in the same duct are one fiber. From here the fiber crosses to the optical distribution frame and is patched to the halls.',
    spec: [['Carriers', '2, diverse physical routes'], ['Entry', 'separate ducts, separate manholes'], ['Termination', '2 x 48F OS2 to ODF'], ['Protection', 'diverse path to the meet me room']],
    risks: ['Both carriers actually sharing one duct despite the contract saying otherwise', 'Fiber entry below the flood level with no sealed penetration', 'Patch records drifting from reality within a year'],
    tests: ['Optical loss budget end to end on every strand', 'Diversity survey with photographic evidence of both routes', 'Failover from carrier A to carrier B with live traffic'],
    refs: [['Strands', '2 x 48F'], ['Routes', '2, surveyed'], ['Loss budget', 'under 3 dB']],
    videos: [{ title: 'Fiber entry and carrier diversity', q: 'data center fiber entry MMR carrier diversity meet me room explained' }]
  },

  lift: {
    tag: 'LIFT-01', name: 'Goods and Passenger Lift', sys: 'fac', sub: 'support',
    short: '2,500 kg goods car, generator backed',
    philosophy: 'A rack weighs a tonne and lives on the upper floor. The lift is data center infrastructure that nobody puts in the redundancy calculation.',
    function: 'Moves equipment from the loading bay to staging and from staging to the halls. The goods car is sized for a fully populated rack plus its pallet, and the machine room sits above the shaft. It runs on the generator, because during an outage is exactly when a failed rack needs to leave the building, and it has a manual lowering arrangement for the case where the generator is the thing that failed.',
    spec: [['Capacity', '2,500 kg goods car'], ['Serves', 'L0 to L2, all levels'], ['Power', 'MDB-N, generator backed'], ['Standby', 'manual lowering, battery rescue descent']],
    risks: ['Car too small for a populated rack, so racks are stripped to move them', 'Lift on a board that sheds on generator overload', 'No landing door interlock maintenance, so the shaft becomes an access route'],
    tests: ['Load test at 125 percent rated capacity', 'Rescue descent with normal power isolated', 'Door interlock and levelling accuracy at every landing'],
    refs: [['Capacity', '2,500 kg'], ['Levels', '3'], ['Rescue', 'manual, battery backed']],
    videos: [{ title: 'Goods lift in a data center', q: 'data center goods lift equipment delivery staging rack movement' }]
  },
};
