# Capacity ledger

Every capacity in the model, checked against the load it actually carries. The point of this file is that anyone can audit the numbers instead of trusting the drawing.

## Load basis

| Item | Value | Note |
|---|---|---|
| Racks | 32 | 8 per row, 2 rows per hall, 2 halls |
| Rack load | 100 kW | high density liquid cooled class |
| IT load | 3,200 kW | 32 x 100 kW |
| PUE | 1.25 | warm water cooling, water side heat rejection |
| Site load | 4,000 kW | IT plus cooling and losses |
| Power factor | 0.95 | after correction |
| Site apparent power | 4,211 kVA | |
| Site current at 400 V | 6,078 A | |
| Heat to water | 2,900 kW | racks, manifolds, CDUs |
| Heat to air | 300 kW | network, storage, room losses |

## Sizing check

| Equipment | Installed | Duty capacity | Load carried | Loading | Redundancy |
|---|---|---|---|---|---|
| Transformer | 4 x 2,500 kVA, two buses | 5,000 kVA per bus | 2,105 kVA per bus | 42% | 2N, one bus carries the site |
| MV switchgear | 630 A at 20 kV, 6 feeders | 21.8 MVA | 4.4 MVA | 20% | 2 incomers |
| LV main switchboard | 6,400 A per bus | 4,434 kVA per bus | 2,105 kVA per bus | 47% | two buses |
| UPS | 4 x 1,000 kW per bus | 4,000 kW per bus | 1,600 kW per bus | 40% | 2N |
| Main PDU | 2,800 A per hall | 1,940 kVA | 1,684 kVA | 87% | dual output |
| Busway | 3,200 A | 2,217 kVA | 1,684 kVA | 76% | dual run |
| Rack PDU | 2 x 60 kW | 120 kW | 100 kW | 83% | dual corded |
| Generator | 3 x 2,500 kW | 5,000 kW with one out | 4,000 kW | 80% | N+1 |
| Chiller | 3 x 1,800 kW | 3,600 kW | 2,900 kW | 81% | N+1 |
| Cooling tower | 2 cells, 4,500 kW | 4,500 kW | 3,480 kW rejection | 77% | 2 cells |
| Dry cooler | 2 x 1,200 kW | 2,400 kW | free cooling only | n/a | 2 units |
| Primary pump | 3 x 180 m3/h | 360 m3/h | 326 m3/h | 91% | 2 duty + 1 standby |
| Plate heat exchanger | 2 x 3,200 kW | 3,200 kW | 2,900 kW | 91% | 1 duty + 1 standby |
| CDU | 3 x 1,200 kW per hall | 2,400 kW per hall | 1,450 kW per hall | 60% | N+1 per hall |
| Fuel storage | 2 x 25 m3 day, 100 m3 bulk | 50 m3 day | 40 m3 for 48 h | 80% | bulk backup |

## What this ledger is not

It is not a costed design and it is not a code compliance exercise. It is a consistency check on the drawing: if a figure in the model changes, this table has to change with it, and no row is allowed to end up with negative margin.

Two choices dominate everything else:

1. **Rack density of 100 kW.** At 130 kW per rack, class GB200 style, every power figure above rises by about 30 percent and the hall footprint barely moves.
2. **Tier III intent.** N+1 mechanical and 2N electrical. Tier IV would double the UPS and add a second utility path with its own transformer bank.

## Corrections made against the first draft of this model

The initial drawing had a set of figures that did not survive the check above. They are listed because the difference between a model that is pretty and a model that is defensible is exactly this list.

| Item | First draft | Corrected | Why it failed |
|---|---|---|---|
| Generator | 2 x 2.5 MW called N+1 | 3 x 2.5 MW | with one unit out, 2.5 MW cannot carry 4 MW |
| Transformer | 2 x 2,500 kVA called N+1 | 4 x 2,500 kVA on two buses | one remaining transformer could not carry the site |
| LV switchboard | 4,000 A | 6,400 A | 4,000 A is 2.73 MW, below the 4 MW site load |
| Main PDU | 1,600 A | 2,800 A | 1.09 MW against 1.6 MW per hall |
| Busway | 2,500 A | 3,200 A | 99 percent of rating before derating |
| Chiller | 3 x 1,500 kW | 3 x 1,800 kW | duty capacity 3,000 kW for a 2,900 kW load |
| Chilled water | 18 to 24 C | warm water basis | contradicts the 32 to 45 C technology loop it feeds |
| UPS autonomy | 10 min | 5 min | 40 minutes more battery than the transfer needs |
| CDU count | 2 per hall | 3 per hall | N+1 needs three to cover 1.45 MW per hall |
| Fuel tanks | 2 x 30 m3 at 24 h | 2 x 25 m3 at 48 h | the stated volume and the stated endurance disagreed |
