# Architecture

The whole thing is a static site. No bundler, no framework, no build step, no server. That is a deliberate constraint: the model has to open from a phone browser and it has to keep working years from now without a toolchain.

## Runtime shape

```
index.html
  └── src/main.js                      boot
        ├── src/scene/build.js         geometry for the site
        │     ├── src/scene/kit.js     primitives, merging, pencil outlines
        │     └── src/data/layout.js   where everything sits
        ├── src/controls.js            camera and pointer handling
        ├── src/scene/flow.js          animated paths
        └── src/ui.js                  tree, panel, walkthrough
              └── src/data/systems.js  hierarchy and walkthrough definitions
                    └── src/data/equipment-*.js   equipment content
```

One renderer, one orthographic camera, one `requestAnimationFrame` loop. Nothing is reactive; the UI is plain DOM built from template strings, and state lives in a single object in `main.js`.

## Geometry

`kit.js` exposes a `Builder` that accumulates primitives. Each primitive contributes three things:

1. A solid, cloned and transformed into place.
2. An outline, generated from `EdgesGeometry` and then subdivided with a small deterministic displacement, so straight edges render as slightly hand drawn lines instead of perfect vectors.
3. A colour key.

At `finish()`, solids are merged per colour and all outlines are merged into a single `LineSegments`. A group of twenty primitives therefore costs two or three draw calls instead of forty. The full site is about 172 objects and stays well inside a frame budget on integrated graphics.

Colour tinting happens per equipment group: the steel and fill tones are nudged 16 percent toward the system colour, which is why electrical reads cool blue and cooling reads teal without turning the drawing into a paint chart.

## Navigation

`controls.js` implements the camera directly rather than using `OrbitControls`, because the required behaviour is zoom toward the cursor, and orbit controls only zoom toward the centre.

The camera is orthographic, which is what makes the model read as a drawing. Zoom is a scalar on the projection; panning moves the target in camera space; zoom toward the cursor works by finding the world point under the pointer, applying the zoom, finding that same screen point again, and translating the target by the difference. That one trick is the difference between a model that feels like SketchUp and one that feels like a slideshow.

## Data model

`src/data/systems.js` is the single source of truth for structure:

```js
SYSTEMS = [{ id, name, subsystems: [{ id, name, items: [equipmentKey] }] }]
```

`INDEX` is derived from that at load time and answers "which system and subsystem does this key belong to". The tree, the breadcrumb in the panel, the system filter and the walkthrough all read from it.

Equipment content lives in three files split by discipline. Every entry has the same shape, and the panel renders that shape directly. Adding an entry never requires touching the UI.

Walkthroughs are declared as an ordered list of stages. Each stage carries an equipment key, a state badge, one sentence of narration, and the id of the connection it travels along:

```js
{ k: 'msb', t: 't+11 s', state: 'Site on generator', link: 'LV-11', at: 'from' }
```

The animation does not interpolate between equipment positions. `main.js` looks the connection up in the cable or pipe layer, reverses the polyline if the stage declares the other end, and hands that polyline to `flow.js`. The pulse therefore runs inside the tray, up the riser and down the drop, because that is the geometry it was given. `at` exists because the outage scenario starts and ends at the same equipment twice, so the previous stage is not a reliable direction hint.

## Risers

A shaft is a hole in the slab, not a decoration beside the building. `src/data/layout.js` exports both the shaft table and a `R` map of shaft centres:

```js
R = { lv: [0, 9], chw: [4, 9], fire: [6.6, 9], fiber: [0, 13.5], lift: [6.6, 13.5] }
```

Cable and pipe schedules import `R` and take their vertical waypoints from it, so a run cannot cross a slab outside the shaft it claims to use. Each service travels in its own lane inside the shaft, which is why two busducts and two chilled water legs do not occupy the same 0.4 m of space.

`tools/check_risers.mjs` enforces it. It loads the live scene, finds every vertical leg that crosses a slab plane, and fails if that leg is more than 1.15 m from a shaft centre. Deliberate trench penetrations are listed with a reason rather than hidden:

```
cables 38, pipes 17, floor crossings 12

riser usage
  lv     LV-12, LV-13, BL-04, BL-06
  lift   BL-08
  fiber  FI-02, FI-03
  chw    CHW-07, CHW-08
  fire   FIRE-01, FIRE-02

outside a shaft
  CHW-01 at slab 6 trench — CDU to heat exchanger, drops through the hall floor into the plant trench

PASS 12 crossings, 1 explained trench penetration(s), every shaft in use, no page errors
```

## Grade

Buried services sit at negative Y: MV duct banks at -1.6 m, LV and fiber at -1.1 m, condenser water at -1.4 m. Buried runs leave the equipment at floor level, dive into the trench, and come back up at the far end. Trench walls, gravel bed and a marker tape are drawn with the pipe, because a buried main without a trench is just a line under a white slab.

The ground is a separate merged group with its own material, rendered at 34 percent opacity so the buried network reads through it. The `Ground` checkbox hides it entirely for a clean plan of the duct banks.

## Levels

Levels are filtered by visibility, not by rebuilding. Each equipment group carries its own level; each level of the building shell is its own merged group. Exploded view applies a vertical offset per level based on its index. Risers are hidden in exploded view because their geometry is absolute.

## Adding a level or moving equipment

Change `src/data/layout.js` for rooms and riser positions, then the `PLACE` map in `src/scene/build.js` for equipment spots. Placement accepts `[x, z, rotationY, yOffset]`, where the offset is used for overhead services such as busway, manifold and sprinkler.

## Performance notes

- Pixel ratio is capped at 1.75, which is the point where extra pixels stop being visible and start being expensive.
- Outlines are merged per group; they are not separate objects per edge.
- Labels are HTML through `CSS2DRenderer`, and are hidden unless a level is isolated, which removes the collision problem entirely rather than solving it with leader lines.
- Busy geometry (rack rows, cooling tower fans) uses fewer outline subdivisions than hero equipment.
- Busduct is drawn in three metre lengths with a joint collar at each coupling and a hanger every third metre. It reads as copper because the previous version, a plain pale box, disappeared against the structure and looked like nothing was there.

## What was deliberately left out

No physics, no CFD, no thermal solver, no BMS integration. The model explains arrangement and sequence; the numbers in the panels are design values with a stated basis, not live simulation output.
