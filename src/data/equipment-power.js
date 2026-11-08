// Electrical equipment reference content.
// Figures are design values for THIS model (32 racks x 100 kW, PUE 1.25), not a vendor datasheet.

export const POWER = {

  pln: {
    tag: 'UTL-01', name: 'Utility Incomer (PLN 20 kV)', sys: 'elec', sub: 'source',
    short: '20 kV, dual feeder, 6 MVA contracted',
    philosophy: 'Everything in this building ultimately comes from a wire that leaves the site. Protect that wire before you protect anything else.',
    function: 'The point of supply from the utility. Two independent feeders from two different substations are preferred, because two feeders from the same busbar give the appearance of redundancy without the substance of it. Capacity and connection date at this boundary decide whether the data center can be energised at all.',
    spec: [['Voltage', '20 kV, 3 phase, 3 wire'], ['Contracted capacity', '6 MVA'], ['Feeders', '2, diverse routes'], ['Earthing', 'Separate MV earth grid']],
    risks: ['Capacity promised but not yet available at the substation', 'Both feeders sharing one route, so one trench fault takes both', 'Connection lead time longer than the construction programme'],
    tests: ['Confirm available fault level in writing from the utility', 'Primary injection and protection relay test on both incomers', 'Phase sequence and phasing check before first energisation'],
    refs: [['Fault level', '25 kA / 1 s'], ['Reliability target', 'N+1 feeders'], ['Status', 'utility confirmation required']],
    videos: [{ title: 'How electricity reaches a data center', q: 'medium voltage incoming substation data center explained' }]
  },

  genset: {
    tag: 'GEN-01..03', name: 'Diesel Generator Set', sys: 'elec', sub: 'source',
    short: '2.5 MW each, 3 units, N+1',
    philosophy: 'A generator is not there for the outage. It is there for the two hours after the outage, when nobody is watching.',
    function: 'Starts on loss of utility and carries the whole building load within ten seconds. Three units give N+1 for a 4 MW site load: with one unit out of service the remaining 5 MW still covers the building at 80 percent loading. Two units would leave the site unable to carry full load after a single failure, which is why the count matters more than the rating.',
    spec: [['Rating', '2,500 kW prime, 11 kV or 415 V'], ['Quantity', '3 (N+1)'], ['Start time', 'under 10 s to full load'], ['Fuel', 'diesel, 48 h autonomy']],
    risks: ['Battery or fuel problem found only during a real outage', 'Capacity shortfall at site load if only two units are installed', 'Exhaust and noise limits breached at the site boundary'],
    tests: ['Automatic start and load acceptance at 100 percent rated load', 'Step load test at 0.1 Hz frequency dip maximum', 'Full load rejection and recovery'],
    refs: [['Site load', '4.0 MW'], ['Spinning reserve', '1 x 2.5 MW'], ['Emissions', 'per local permit']],
    videos: [{ title: 'Data center generator sequence of operation', q: 'data center standby generator sequence of operation explained' }]
  },

  fueltank: {
    tag: 'FT-01', name: 'Fuel Storage and Day Tanks', sys: 'elec', sub: 'source',
    short: '2 x 25 m3 day tanks, 100 m3 bulk, bunded',
    philosophy: 'A generator without fuel is a very expensive piece of sound insulation.',
    function: 'Day tanks sit close to the generators so the fuel run is short and the pumps are small. Bulk storage carries the endurance figure, and every tank sits inside a bund of 110 percent of its volume. At 4 MW the site burns roughly 840 litres per hour, so 48 hours of autonomy needs about 40 cubic metres of usable fuel.',
    spec: [['Day tanks', '2 x 25 m3'], ['Bulk storage', '100 m3'], ['Bunding', '110 percent of largest tank'], ['Autonomy', '48 h at site load']],
    risks: ['Fuel quality degrades in storage, particularly with biodiesel blends', 'Bund capacity reduced by rainwater if drains are not maintained', 'Transfer pump failure leaves day tanks dry during a long outage'],
    tests: ['Level alarms and bund leak detection', 'Fuel polishing and quality sampling', 'Transfer pump auto-start from low level'],
    refs: [['Consumption', '210 L/h per MW'], ['Autonomy', '48 h'], ['Bund', '110 percent']],
    videos: [{ title: 'Diesel fuel systems for standby power', q: 'data center diesel fuel oil system day tank bulk storage explained' }]
  },

  gardu: {
    tag: 'SUB-01', name: 'Customer Substation (Gardu Induk)', sys: 'elec', sub: 'source',
    short: '20 kV switchgear, metering, protection',
    philosophy: 'This is where the utility stops being someone else\'s problem and becomes yours.',
    function: 'The interface between the utility network and the site. It holds the incoming cubicles, metering, protection and the first isolation point. In practice the schedule of this room governs the project: permits, land use and utility approval all land here before any equipment in the building can be commissioned.',
    spec: [['Voltage', '20 kV'], ['Configuration', '2 incoming, 6 outgoing feeders'], ['Protection', 'OCR, earth fault, under/over voltage'], ['Metering', 'utility owned CT and VT']],
    risks: ['Permit and land acquisition running behind the build programme', 'Protection coordination not agreed with the utility', 'Feeder trench crossing third party land'],
    tests: ['Protection setting agreed and sealed with the utility', 'Interlock and isolation sequence test', 'Metering accuracy against a reference meter'],
    refs: [['Configuration', '2 in / 6 out'], ['Fault level', '25 kA'], ['Ownership boundary', 'utility meter']],
    videos: [{ title: 'Medium voltage substation walkthrough', q: '20 kV customer substation gardu induk walkthrough switchgear' }]
  },

  mvinc: {
    tag: 'MV-01', name: 'MV Incomer Cubicle', sys: 'elec', sub: 'mv',
    short: '20 kV, 630 A, vacuum circuit breaker',
    philosophy: 'The incomer is the one device you operate when you want the whole building to be quiet.',
    function: 'Receives the utility feeder and provides the first means of isolation and protection for the site. It carries the protection relay that decides whether a downstream fault trips one feeder or darkens the building.',
    spec: [['Voltage', '20 kV'], ['Rated current', '630 A'], ['Breaker', 'vacuum, withdrawable'], ['Protection', 'overcurrent, earth fault, UV']],
    risks: ['Arc flash boundary not marked, so work is done inside it', 'Relay settings left at factory default', 'Withdrawable contacts not serviced, causing hot joints'],
    tests: ['Primary injection of the current transformers', 'Secondary injection of the protection relay', 'Mechanical operations and interlock check'],
    refs: [['Rating', '630 A'], ['Fault withstand', '25 kA / 1 s'], ['Arc flash', 'label per site study']],
    videos: [{ title: 'Vacuum circuit breaker operation', q: 'medium voltage vacuum circuit breaker operation animation' }]
  },

  metering: {
    tag: 'MTR-01', name: 'CT / VT Metering Cubicle', sys: 'elec', sub: 'mv',
    short: 'Current and voltage transformers, tariff metering',
    philosophy: 'You cannot manage what you do not meter, and you cannot argue with a utility about a number you never measured.',
    function: 'Steps current and voltage down to values the meter and the protection relays can use. In a site of this size it feeds both the tariff meter and the building EPMS, so energy and demand are recorded continuously rather than reconstructed from invoices.',
    spec: [['CT ratio', '400/5 A'], ['VT ratio', '20000/110 V'], ['Class', '0.2S for tariff, 5P10 for protection'], ['Output', 'pulse and Modbus to EPMS']],
    risks: ['Open secondary on a live CT, which is a lethal voltage hazard', 'Wrong CT ratio installed, silently scaling every reading', 'Metering not integrated, so PUE is estimated instead of measured'],
    tests: ['Ratio and polarity test on every CT and VT', 'Burden test on the meter circuit', 'Cross-check against a portable reference meter'],
    refs: [['CT', '400/5 A'], ['Accuracy', '0.2S'], ['PUE basis', 'measured, not assumed']],
    videos: [{ title: 'Instrument transformers explained', q: 'current transformer voltage transformer metering explained' }]
  },

  rmu: {
    tag: 'RMU-01', name: 'Ring Main Unit', sys: 'elec', sub: 'mv',
    short: '20 kV, 2 ring switches, 1 tee-off, SF6 or vacuum',
    philosophy: 'The RMU exists so that one faulted cable section can be isolated without switching the whole ring.',
    function: 'A compact MV switchboard used where the load does not justify a full lineup, typically two ring switches plus a transformer tee-off. It sits on the medium voltage side, upstream of the transformer, and it is what allows the utility to sectionalise the ring while the rest of the network stays live.',
    spec: [['Voltage', '20 kV'], ['Configuration', '2 ring, 1 tee-off'], ['Switching', 'load break switch, earthing switch'], ['Insulation', 'SF6 or vacuum, sealed for life']],
    risks: ['SF6 pressure loss detected only at failure', 'Cable termination work done live on the ring', 'Mechanical interlock defeated during maintenance'],
    tests: ['Gas pressure and dew point check', 'Load break and earthing switch operation', 'Cable termination partial discharge test'],
    refs: [['Configuration', '2 ring + 1 tee'], ['Rating', '630 A ring, 200 A tee'], ['Position', 'upstream of transformer']],
    videos: [{ title: 'Ring main unit explained', q: 'ring main unit RMU 20kV operation explained' }]
  },

  mvswg: {
    tag: 'MVS-01', name: 'MV Switchgear Lineup', sys: 'elec', sub: 'mv',
    short: '6 feeders, vacuum breakers, busbar 630 A',
    philosophy: 'The lineup is a set of decisions, and every decision has to be reversible without a shutdown.',
    function: 'Distributes medium voltage to each transformer and to the chillers where they are MV fed. Withdrawable breakers allow a feeder to be isolated and removed while the busbar stays live. Busbar and arc rating, not the breaker count, decide whether this room is safe.',
    spec: [['Busbar', '630 A'], ['Feeders', '6, withdrawable VCB'], ['Fault rating', '25 kA / 1 s'], ['Internal arc', 'IAC class per IEC 62271-200']],
    risks: ['Internal arc rating lower than the site fault level', 'Wrong breaker withdrawn under load', 'Room ventilation and pressure relief missing'],
    tests: ['Interlock and shutter operation on every cubicle', 'Primary injection per feeder', 'Arc flash boundary and labelling verification'],
    refs: [['Feeders', '6'], ['Busbar', '630 A'], ['Arc rating', 'IAC A FLR 25 kA']],
    videos: [{ title: 'MV switchgear and interlocks', q: 'medium voltage switchgear interlock withdrawable breaker explained' }]
  },

  trafo: {
    tag: 'TX-01..04', name: 'Dry-Type Transformer', sys: 'elec', sub: 'tx',
    short: '2,500 kVA, 20 kV / 400 V, Dyn11',
    philosophy: 'A transformer trades voltage for current. Nothing is created, only converted, and the difference is paid in heat.',
    function: 'Steps 20 kV down to 400 V for distribution. Four units on two buses give a true 2N arrangement: each bus carries 2.1 MVA of the 4.2 MVA site load, so 42 percent loading in normal operation, and either bus alone can still carry the whole site. Dry type is used indoors because it contains no oil to burn or contain.',
    spec: [['Rating', '2,500 kVA each'], ['Ratio', '20 kV / 400 V'], ['Vector group', 'Dyn11'], ['Cooling', 'AN/AF, class F insulation']],
    risks: ['Winding temperature rise from harmonic currents drawn by server rectifiers', 'Loading one bus past 5,000 kVA during maintenance of the other', 'Neutral conductor undersized for third harmonic current'],
    tests: ['Ratio and vector group verification', 'Insulation resistance and winding resistance', 'Thermal imaging at full site load'],
    refs: [['Loading at design', '42 percent per bus'], ['Impedance', '5.75 percent'], ['Redundancy', '2N, two buses']],
    videos: [{ title: 'How a transformer works', q: 'how transformer works step down voltage animation explained' }]
  },

  msb: {
    tag: 'MSB-01', name: 'LV Main Switchboard', sys: 'elec', sub: 'lv',
    short: '400 V, 6,400 A busbar, ACB incomers',
    philosophy: 'The main switchboard is where the building decides which loads are essential and which loads it is willing to lose.',
    function: 'Takes the transformer outputs and splits them into the feeders that matter: UPS, chiller plant, CRAH, fire pump, and general power. Busbar rating must exceed the site design current with margin, which for a 4 MW site is roughly 6,400 A per bus, not the 4,000 A that looks adequate at first glance.',
    spec: [['Voltage', '400 / 230 V, 3 phase 4 wire'], ['Busbar', '6,400 A per bus'], ['Incomers', 'ACB with adjustable protection'], ['Metering', 'per feeder, to EPMS']],
    risks: ['Busbar rated below site design current, so the board cannot be fully loaded', 'Protection coordination not studied, causing cascading trips', 'Neutral bar not rated for harmonic load'],
    tests: ['Primary current injection on every ACB', 'Protection coordination study validated by test', 'Thermal imaging at full load, all joints'],
    refs: [['Site current', '6,078 A at 4.0 MW, 0.95 pf'], ['Busbar', '6,400 A'], ['Margin', '5 percent']],
    videos: [{ title: 'LV switchboard and ACB', q: 'low voltage main switchboard air circuit breaker explained' }]
  },

  pdb: {
    tag: 'PDB-01', name: 'Power Distribution Board', sys: 'elec', sub: 'lv',
    short: 'MCCB outgoing, mechanical services',
    philosophy: 'One board, one kind of load, so that losing it takes down one system rather than the building.',
    function: 'Splits a single source into grouped circuits, and the grouping is the engineering: chillers on one board, CRAH on another, pumps on a third. A board that mixes essential and non essential loads forces you to protect for the worst case and carries everything down together.',
    spec: [['Voltage', '400 / 230 V'], ['Incomer', 'MCCB, 1,600 A'], ['Outgoing', '8 to 12 ways'], ['Form', 'Form 3b or better']],
    risks: ['Essential and non essential loads mixed on one board', 'Spare ways exhausted, forcing temporary tapping', 'Cable schedules out of date after site changes'],
    tests: ['Breaker trip test and setting verification', 'Insulation resistance of every outgoing circuit', 'Thermal imaging under load'],
    refs: [['Incomer', '1,600 A'], ['Outgoing', '8 to 12'], ['Spare capacity', '20 percent minimum']],
    videos: [{ title: 'Distribution boards explained', q: 'power distribution board PDB explained electrical' }]
  },

  db: {
    tag: 'DB-01', name: 'Final Distribution Board', sys: 'elec', sub: 'lv',
    short: 'Lighting, small power, control circuits',
    philosophy: 'The smallest board still decides whether the control room keeps its lights on during an incident.',
    function: 'Final circuit distribution for lighting, small power, and control supplies. On a data center the important detail is which of these sit on the generator backed bus: the NOC, the fire detection panel, and the control supplies for the plant all have to survive a utility loss.',
    spec: [['Voltage', '230 / 400 V'], ['Incomer', 'MCB, 63 to 250 A'], ['Circuits', 'RCBO protected'], ['Source', 'essential bus where required']],
    risks: ['Safety services fed from a non essential board', 'RCBO nuisance tripping from cumulative leakage', 'Labelling lost, so nobody knows what a breaker feeds'],
    tests: ['RCD trip time and current', 'Circuit identification and labelling audit', 'Loss of utility test on safety supplies'],
    refs: [['Incomer', '63 to 250 A'], ['Protection', '30 mA RCD for socket circuits'], ['Source', 'essential where safety related']],
    videos: [{ title: 'Final circuit protection', q: 'distribution board RCBO protection explained electrical installation' }]
  },

  apfc: {
    tag: 'APFC-01', name: 'Power Factor Correction Panel', sys: 'elec', sub: 'lv',
    short: 'Automatic capacitor banks, target 0.98',
    philosophy: 'A data center does not have a power factor problem, it has a harmonics problem that shows up as one.',
    function: 'Switches capacitor stages to hold displacement power factor near unity and avoid utility penalty. On a rectifier heavy site the correction must be detuned, because plain capacitors resonate with the harmonic spectrum of server power supplies and fail early.',
    spec: [['Target', '0.98 lagging'], ['Stages', '8 to 12, automatic'], ['Detuning', '7 percent reactor'], ['Control', 'PF controller with harmonic measurement']],
    risks: ['Capacitor resonance with 5th and 7th harmonics', 'Overcorrection at light load, leading power factor', 'Contactors not rated for capacitor switching'],
    tests: ['Stage stepping and controller response', 'Harmonic measurement before and after correction', 'Capacitor discharge and reclose timing'],
    refs: [['Target PF', '0.98'], ['Detuning', '7 percent'], ['THD limit', '8 percent at LV bus']],
    videos: [{ title: 'Power factor correction basics', q: 'power factor correction capacitor bank detuned reactor explained' }]
  },

  ats: {
    tag: 'ATS-01', name: 'Automatic Transfer Switch', sys: 'elec', sub: 'backup',
    short: 'Utility to generator, open transition, 4 pole',
    philosophy: 'This is the only device in the building whose entire job is to do nothing until the last possible moment.',
    function: 'Senses loss of the utility source, confirms the generator is ready, then transfers the load. Four pole switching is used so the neutral is broken as well, which matters when the two sources have different earthing. Transfer time has to be shorter than the UPS ride through, or the whole exercise is decoration.',
    spec: [['Configuration', 'open transition, 4 pole'], ['Rating', '3,200 A'], ['Transfer time', 'under 10 s including generator start'], ['Control', 'auto, manual, test mode']],
    risks: ['Transfer slower than UPS autonomy, so the load drops anyway', 'Generator not ready when the transfer is called', 'Retransfer uncontrolled, causing a second disturbance'],
    tests: ['Full load transfer and retransfer, timed', 'Transfer with one generator unavailable', 'Neutral and earth continuity check at both sources'],
    refs: [['Transfer', 'under 10 s'], ['Poles', '4'], ['Basis', 'shorter than UPS ride through']],
    videos: [{ title: 'ATS operation explained', q: 'automatic transfer switch ATS generator operation explained' }]
  },

  sts: {
    tag: 'STS-01', name: 'Static Transfer Switch', sys: 'elec', sub: 'backup',
    short: 'Solid state, sub cycle transfer, IT bus',
    philosophy: 'When a mechanical switch is too slow, the transfer has to happen inside one cycle of the waveform.',
    function: 'Transfers the IT load between two independent feeds in a fraction of a cycle, because static switches have no moving parts to move. It is placed close to the load, since every metre of cable between the switch and the load adds impedance that erodes the whole point.',
    spec: [['Type', 'SCR based, 3 phase'], ['Transfer time', 'under 4 ms'], ['Rating', '1,000 A'], ['Bypass', 'manual maintenance bypass']],
    risks: ['Both sources from the same upstream, so the switch protects nothing', 'SCR failure in shorted mode, tying the two sources together', 'Maintenance bypass operated without a procedure'],
    tests: ['Transfer and retransfer under full load, waveform capture', 'SCR fault mode simulation', 'Bypass procedure walkthrough'],
    refs: [['Transfer', 'under 4 ms'], ['Rating', '1,000 A'], ['Sources', 'independent required']],
    videos: [{ title: 'Static transfer switch in data centers', q: 'static transfer switch STS data center explained' }]
  },

  ups: {
    tag: 'UPS-01..04', name: 'Uninterruptible Power Supply', sys: 'elec', sub: 'backup',
    short: '500 kW modules, 2N, 5 min autonomy',
    philosophy: 'A UPS is not there to keep you running. It is there to buy the ten seconds the generator needs.',
    function: 'Double conversion rectifier and inverter keeps the IT load on a clean, regulated supply and bridges the gap between utility loss and generator acceptance. Autonomy is matched to that gap, not to the length of the outage: 5 minutes covers a failed transfer with margin, while 10 minutes buys battery the site will never use.',
    spec: [['Topology', 'double conversion, IGBT rectifier'], ['Capacity', '4 x 1,000 kW per bus'], ['Autonomy', '5 min at full IT load'], ['Efficiency', '96 percent in double conversion']],
    risks: ['Ride through shorter than generator start time', 'Battery room temperature too high, so design life is never reached', 'Load above module capacity after an unplanned rack install'],
    tests: ['Full load discharge test to end voltage', 'Transfer to maintenance bypass and back', 'Battery cell monitoring and alarm verification'],
    refs: [['IT load', '3.2 MW'], ['Autonomy', '5 min'], ['Configuration', '2N']],
    videos: [{ title: 'UPS double conversion explained', q: 'UPS double conversion online rectifier inverter explained data center' }]
  },

  bbu: {
    tag: 'BBU-01', name: 'Battery Backup Unit (Rack Level)', sys: 'elec', sub: 'backup',
    short: 'Rack mounted, 48 V DC, 1 to 3 min',
    philosophy: 'When the rack itself is the load, the cheapest place to hold energy is inside the rack.',
    function: 'Holds a short ride through at the rack, in parallel with the central UPS or replacing part of it. On high density racks the central battery needed for ten minutes becomes physically enormous, so the industry moved the last minute of autonomy into the rack and kept the central plant small.',
    spec: [['Output', '48 V DC, 30 to 60 kW per shelf'], ['Autonomy', '1 to 3 min'], ['Location', 'rack mounted, 4U'], ['Monitoring', 'per shelf, to EPMS']],
    risks: ['Cell imbalance between shelves, so effective capacity is the weakest shelf', 'Thermal runaway in a confined rack space', 'Discharge test skipped because it interrupts the IT load'],
    tests: ['Shelf level capacity and balancing test', 'Alarm and changeover to bypass', 'Thermal imaging under discharge'],
    refs: [['Voltage', '48 V DC'], ['Autonomy', '1 to 3 min'], ['Form factor', '4U']],
    videos: [{ title: 'Rack level battery backup', q: 'rack battery backup unit BBU data center 48V explained' }]
  },

  pdumain: {
    tag: 'PDU-01', name: 'Main Power Distribution Unit', sys: 'elec', sub: 'rackpwr',
    short: '2,800 A per hall, dual output to hall busway',
    philosophy: 'The main PDU is a busbar with a brain, and the brain is the metering.',
    function: 'Distributes UPS output to the hall busway and meters each hall separately. Per hall metering is what makes capacity planning possible: without it the operator knows the site total and nothing about where the next rack can go.',
    spec: [['Rating', '2,800 A per hall'], ['Input', 'UPS output, 400 V'], ['Output', 'busway feed, 2 per hall'], ['Metering', 'per hall and per output, to EPMS']],
    risks: ['Load imbalance between halls going unnoticed', 'Breaker rating not selected for the actual rack density', 'No metering, so capacity is guessed'],
    tests: ['Breaker trip test and settings', 'Metering calibration against a reference meter', 'Load bank test at hall design load'],
    refs: [['Rating', '2,800 A'], ['Hall current', '2,432 A at 1.6 MW'], ['Loading', '87 percent']],
    videos: [{ title: 'Data center power distribution chain', q: 'data center PDU busway power distribution explained' }]
  },

  busway: {
    tag: 'BW-01', name: 'Overhead Busway', sys: 'elec', sub: 'rackpwr',
    short: '3,200 A, plug in tap off, 400 V',
    philosophy: 'The busway exists so you can move power without moving cable.',
    function: 'Runs above the rack rows and lets a tap off box be added, moved, or removed while the hall is live. At 1.6 MW per hall the design current is about 2,400 A, so a 3,200 A busway keeps the run inside 75 percent of rating after derating for ambient temperature inside a hot aisle.',
    spec: [['Rating', '3,200 A'], ['Voltage', '400 V, 3 phase 5 wire'], ['Tap off', '250 A per rack position'], ['Enclosure', 'IP55, derated for ambient']],
    risks: ['Tap off box not torqued, causing a hot joint under load', 'Derating ignored at high ambient, so the run is overloaded', 'Busway used as a support for trays or cable'],
    tests: ['Torque verification on every joint and tap off', 'Thermal imaging at full hall load', 'Phase identification and interlock check'],
    refs: [['Hall current', '2,400 A at 1.6 MW'], ['Rating', '3,200 A'], ['Loading', '75 percent']],
    videos: [{ title: 'Busway systems in data centers', q: 'overhead busway data center power tap off box explained' }]
  },

  rackpdu: {
    tag: 'RPDU-01', name: 'Rack PDU', sys: 'elec', sub: 'rackpwr',
    short: '3 phase, metered per outlet, dual corded',
    philosophy: 'At 100 kW per rack, metering per outlet is the only way to know what any single GPU node actually costs.',
    function: 'Final distribution inside the rack, with per outlet current and energy measurement. Dual corded racks are fed from two independent busways so that one busway or one PDU can be maintained without dropping the rack, which is also why phase balance across the two feeds has to be designed rather than discovered.',
    spec: [['Input', '400 V, 3 phase, 2 feeds'], ['Outlets', 'C13 and C19, 24 to 42'], ['Metering', 'per outlet, 1 percent accuracy'], ['Rating', '60 kW per feed']],
    risks: ['Phase imbalance between the two feeds', 'Outlet rating exceeded by high density GPU nodes', 'Metering not connected, so rack level PUE is unavailable'],
    tests: ['Per outlet metering accuracy check', 'Feed A and B changeover with the rack live', 'Thermal imaging at full rack load'],
    refs: [['Rack load', '100 kW'], ['Per feed', '60 kW'], ['Feeds', '2, independent']],
    videos: [{ title: 'Metered rack PDUs explained', q: 'rack PDU metered per outlet data center explained' }]
  },

  earth: {
    tag: 'E-GRID', name: 'Earthing and Bonding System', sys: 'elec', sub: 'earth',
    short: 'Combined earth grid, below 1 ohm',
    philosophy: 'Earthing is the part of the design nobody sees until it is the only thing that matters.',
    function: 'Bonds every metallic enclosure, the building steel, the neutral point of the transformers and the lightning protection into one reference. A single combined grid avoids the potential differences that destroy electronics during a fault, and it is measured before the building is handed over, not after.',
    spec: [['Configuration', 'combined earth grid'], ['Resistance', 'under 1 ohm, measured'], ['Conductors', 'copper, exothermic joints'], ['Bonding', 'all enclosures, steel, LPS']],
    risks: ['Separate earth systems creating a potential difference', 'Joint corrosion after years in soil', 'Resistance measured at installation only, never again'],
    tests: ['Fall of potential resistance measurement', 'Continuity of every bond', 'Earth loop impedance at the furthest point'],
    refs: [['Resistance', 'under 1 ohm'], ['System', 'combined'], ['Re-test', 'annually']],
    videos: [{ title: 'Earthing and bonding explained', q: 'earthing bonding system substation explained ground grid' }]
  },

  lps: {
    tag: 'LPS-01', name: 'Lightning Protection System', sys: 'elec', sub: 'earth',
    short: 'Air termination, down conductors, SPD coordination',
    philosophy: 'Lightning does not need to hit the building to destroy the equipment inside it.',
    function: 'Intercepts a strike at the air termination network and carries it to earth outside the equipment. The surge protection devices are the part that actually protects the servers: a coordinated set from the MV incoming down to the rack, with each stage letting the next one do its job.',
    spec: [['Air termination', 'mesh, class III'], ['Down conductors', 'minimum 2, on opposite corners'], ['SPD', 'type 1 at MSB, type 2 at DB, type 3 at rack'], ['Earth', 'bonded to combined grid']],
    risks: ['SPD not coordinated, so a downstream device takes the full surge', 'Down conductor shared with a cable route', 'Lightning risk assessment skipped for a site in a high flash density area'],
    tests: ['Continuity of air termination and down conductors', 'SPD status indicators after a storm season', 'Surge counter and replacement log'],
    refs: [['Class', 'III'], ['Down conductors', '2 minimum'], ['SPD', '3 stage coordination']],
    videos: [{ title: 'Lightning protection and surge devices', q: 'lightning protection system surge protection device coordination explained' }]
  },

  mdbn: {
    tag: 'MDB-N', name: 'Building Services Board (MDB-N)', sys: 'elec', sub: 'bldgpwr',
    short: '2,000 A, generator backed, no UPS',
    philosophy: 'Not every load deserves a battery, and the ones that do not are the ones that decide whether the batteries matter.',
    function: 'This is where the electrical system forks. Everything upstream of this board is on the IT critical path: UPS, static transfer switch, dual cord. Everything downstream is on the generator only, with no ride through at all. Chillers, primary pumps, tower fans, CRAH fans, lighting and the NOC all sit here. The design logic is simple arithmetic: 3.2 MW of IT load justifies a battery that costs more than the chillers, and 2.5 MW of compressors does not. The consequence is a four minute chiller restart, which the warm water loop is sized to cover.',
    spec: [['Rating', '2,000 A, 400 V'], ['Source', 'generator backed, no UPS'], ['Loads', 'chillers, pumps, towers, CRAH, lighting, NOC'], ['Selectivity', 'one level below the main switchboard, fully discriminated']],
    risks: ['Chiller starting current tripping the generator on pickup', 'Non critical load shed missing, so the generator is overloaded before the IT load transfers', 'Building load and IT load on the same board, so a chiller fault takes the hall with it'],
    tests: ['Load step test with the chillers starting in sequence', 'Non critical load shed and reconnection sequence', 'Discrimination check against the main switchboard protection'],
    refs: [['Building load', '0.8 MW'], ['IT load', '3.2 MW'], ['Chiller restart', '4 min']],
    videos: [{ title: 'Critical vs non critical power in a data center', q: 'data center critical non-critical power distribution redundancy explained' }]
  },

  ldb: {
    tag: 'LDB-01', name: 'Floor Lighting and Small Power Board', sys: 'elec', sub: 'bldgpwr',
    short: '320 A, one board per floor',
    philosophy: 'Distribution is a tree, not a star. A cable per load does not fit in a shaft, so one feeder climbs and everything on the floor taps off it.',
    function: 'Fed by a single riser cable from the building services board, then distributes to lighting, small power, the NOC, the lift and the security systems on the support floor. The reason it exists as a separate board rather than as more ways in the main switchboard is fault containment and cable economy: a fault in a floor board takes one floor, not the building, and the riser carries 320 A instead of 2,000.',
    spec: [['Rating', '320 A, 400 V'], ['Fed by', '4C x 150 mm2 from MDB-N'], ['Serves', 'lighting, small power, NOC, lift, security'], ['Metering', 'per way, reported to EPMS']],
    risks: ['Floor board fed from a single cable with no spare capacity for fit out', 'Lighting and lift on the same board, so a lighting fault strands the lift', 'No surge protection, so a lightning event takes out the NOC screens'],
    tests: ['Insulation resistance and continuity on every final circuit', 'RCD trip test at the board and at the furthest outlet', 'Phase rotation and voltage drop at the furthest point'],
    refs: [['Riser feeder', '320 A'], ['Voltage drop limit', '4 percent'], ['RCD', '30 mA for sockets']],
    videos: [{ title: 'Final distribution boards explained', q: 'distribution board final circuit MCB RCD explained electrical installation' }]
  },
};
