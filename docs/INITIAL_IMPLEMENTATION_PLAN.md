# Trykktap Kalkulator - Implementation Plan

## Overview

A mobile-first web application for calculating pressure delivery in firefighting water supply chains. The primary goal is ensuring adequate pressure reaches terminals, accounting for elevation changes and friction losses.

**Target Users:** Firefighters coordinating water supply in the field  
**Primary Device:** Mobile phones/tablets  
**Language:** Norwegian UI (English code, localization-ready)  
**Pressure Unit:** Bar

---

## Critical Constraints

| Parameter | Value | Impact |
|-----------|-------|--------|
| Max pump pressure | **10 bar** | Elevation alone can consume entire budget |
| Elevation factor | 1 bar per 10m | +100m = 10 bar loss |
| Terminal requirement | 6-8 bar | Cannons need adequate pressure |
| Hose sections | 20m fixed | Chainable segments |

---

## Reference Use Case

```
Scenario:
  Water source:  500 moh
  Fire point:    600 moh
  Elevation:     +100m → 10 bar loss
  Distance:      300m → 15× 20m hose sections
  Terminals:     3× water shooters @ 6 bar minimum

Single pump at source (10 bar):
  10 bar - 10 bar (elevation) - friction = NEGATIVE ❌
  
Solution: Relay pump mid-chain
  Pump 1 at 500 moh → Pump 2 at ~550 moh → Terminals at 600 moh
  Each pump handles ~50m elevation (5 bar) + friction ✅
```

This validates that **mid-chain pump placement is essential** for mountain/hill operations.

---

## Technology Stack

### Decision: React + TypeScript Web App

| Option | Pros | Cons |
|--------|------|------|
| **React + TypeScript** ✅ | Vast documentation, excellent community, many visual editor libs, simple sharing | Requires learning frontend |
| Kotlin Multiplatform | Familiar JVM syntax | Experimental web support, limited editor libraries |
| Java Desktop (JavaFX) | Native feel | Poor mobile support, complex distribution |

### Core Libraries

| Library | Purpose | Why |
|---------|---------|-----|
| [React Flow](https://reactflow.dev/) | Visual node-based editor | MIT license, touch support, excellent docs |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management | Simple API, TypeScript-first |
| [Vite](https://vitejs.dev/) | Build tool | Fast dev server, simple config |

---

## MVP Equipment Specifications

### Pumps

| ID | Name | Output Pressure | Max Flow | Notes |
|----|------|-----------------|----------|-------|
| `pump-ziegler` | Ziegler | 10 bar | 3000 l/min | Large vehicle pump |
| `pump-otter` | Otter | 10 bar | 800 l/min | Portable pump |

> Both pumps operate at 10 bar max. Difference is flow capacity.

### Hoses (20m sections)

| ID | Name | Diameter | Friction Loss* | Use Case |
|----|------|----------|----------------|----------|
| `hose-1.5` | Slange 1½" | 1½" (38mm) | ~0.5 bar/section | Final delivery, short runs |
| `hose-2.5` | Slange 2½" | 2½" (65mm) | ~0.15 bar/section | Standard supply |
| `hose-4` | Slange 4" | 4" (102mm) | ~0.02 bar/section | Main supply lines |

*At typical flow rates — actual calculation based on flow

### Connectors

| ID | Name | Inputs | Outputs | Pressure Loss |
|----|------|--------|---------|---------------|
| `splitter-2` | Grenrør 1→2 | 1 | 2 | ~0.2 bar |
| `splitter-3` | Grenrør 1→3 | 1 | 3 | ~0.3 bar |

### Terminals

| ID | Name | Flow Rate | Required Pressure |
|----|------|-----------|-------------------|
| `terminal-cannon` | Vannkanon | 500-2000 l/min | 6-8 bar |
| `terminal-wall` | Vannvegg | 200-400 l/min | 4-6 bar |

---

## Project Structure

```
trykktap-kalkulator/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── IMPLEMENTATION_PLAN.md
│
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Main app component
│   ├── index.css                   # Global styles (mobile-first)
│   │
│   ├── constants/
│   │   └── icons.ts                # Equipment icons & colors
│   │
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── Editor.tsx          # React Flow wrapper (modular)
│   │   │   ├── EditorAdapter.ts    # Interface for swappable editors
│   │   │   └── nodes/
│   │   │       ├── SourceNode.tsx  # Water source point
│   │   │       ├── PumpNode.tsx    # Pump (placeable anywhere)
│   │   │       ├── HoseNode.tsx    # 20m hose segment
│   │   │       ├── SplitterNode.tsx
│   │   │       └── TerminalNode.tsx
│   │   │
│   │   ├── Palette/
│   │   │   └── Palette.tsx         # Equipment drag palette
│   │   │
│   │   ├── Toolbar/
│   │   │   └── Toolbar.tsx         # Save/share/clear actions
│   │   │
│   │   └── PressureDisplay/
│   │       └── PressureDisplay.tsx # Summary & warnings
│   │
│   ├── engine/
│   │   ├── pressure.ts             # Core pressure calculations
│   │   ├── friction.ts             # Hazen-Williams formula
│   │   ├── elevation.ts            # Elevation loss (1 bar/10m)
│   │   └── validate.ts             # Check terminal requirements
│   │
│   ├── models/
│   │   ├── equipment.ts            # Equipment type definitions
│   │   ├── layout.ts               # Layout/node/edge types
│   │   └── calculation.ts          # Calculation result types
│   │
│   ├── services/
│   │   ├── storage.ts              # localStorage persistence
│   │   ├── share.ts                # URL encoding, JSON export
│   │   └── import.ts               # JSON import
│   │
│   ├── store/
│   │   └── useLayoutStore.ts       # Zustand state store
│   │
│   └── i18n/
│       ├── index.ts                # Translation hook
│       └── nb.ts                   # Norwegian strings
│
└── docs/                           # Additional documentation
```

---

## Pressure Calculation Logic

### Formula

```typescript
traverse(node, incomingPressure, previousElevation):
  
  if node is Pump:
    // Pump resets pressure to max output
    pressure = 10 bar
  else:
    // Calculate losses
    elevationLoss = (node.elevation - previousElevation) / 10  // bar
    frictionLoss = calculateFriction(flow, diameter, 20m)      // bar
    pressure = incomingPressure - elevationLoss - frictionLoss
  
  if node is Terminal:
    status = pressure >= node.requiredPressure ? "OK" : "WARNING"
  
  // Continue to connected nodes
  for each downstream node:
    traverse(downstream, pressure, node.elevation)
```

### Friction Loss (Hazen-Williams)

```
ΔP = (10.67 × Q^1.852 × L) / (C^1.852 × D^4.87)

Where:
  Q = Flow rate (m³/s)
  L = Hose length (20m per section)
  C = Roughness coefficient (~120 for fire hose)
  D = Internal diameter (m)
```

### Elevation Loss

```
ΔP = Δh / 10

Where:
  Δh = elevation change in meters
  Result in bar (1 bar ≈ 10m water column)
```

---

## Implementation Phases

### Phase 1: Project Setup ✅

- [x] Initialize Vite + React + TypeScript
- [x] Update `.gitignore` for Node.js
- [x] Configure path aliases
- [x] Set up mobile-first CSS variables
- [x] Create i18n structure with Norwegian strings

**Deliverable:** Running dev server with placeholder UI

### Phase 2: Data Models & State ✅

- [x] Define TypeScript interfaces for equipment
- [x] Create equipment catalog (8 items)
- [x] Define node/edge types with elevation
- [x] Set up Zustand store

**Deliverable:** Type-safe equipment definitions, working state

### Phase 3: Visual Editor ✅

- [x] Integrate React Flow
- [x] Create `EditorAdapter` interface for modularity
- [x] Build custom node components with elevation input
- [x] Implement drag-from-palette (bottom of screen)
- [x] Node deletion UI
- [x] Add connection validation
- [x] Mobile touch optimization

**Deliverable:** Working visual editor with equipment placement

### Phase 4: Pressure Engine ✅

- [x] Implement elevation loss calculation
- [x] Implement friction loss formula
- [x] Build graph traversal algorithm
- [x] Calculate pressure at each node
- [x] Display results on nodes
- [x] Add warnings for insufficient pressure

**Deliverable:** Real-time pressure calculations

---

## Stretch Goals

### Persistence & Sharing (Future)

- [ ] localStorage save/load
- [ ] URL encoding for share links
- [ ] JSON export download
- [ ] JSON import
- [ ] Copy-to-clipboard

**Deliverable:** Complete save/load/share functionality

---

## Design Decisions

### 1. Editor Modularity

The visual editor is wrapped behind an interface:

```typescript
interface EditorAdapter {
  addNode(equipment: Equipment, position: Position): void
  removeNode(nodeId: string): void
  connect(sourceId: string, targetId: string): void
  getLayout(): Layout
  setLayout(layout: Layout): void
  onLayoutChange(callback: (layout: Layout) => void): void
}
```

This allows swapping React Flow for another library without rewriting business logic.

### 2. Mobile-First Layout

- Bottom-anchored equipment palette (thumb-reachable)
- Large touch targets (minimum 44px)
- Pinch-to-zoom on canvas
- No hover-dependent interactions
- Collapsible panels to maximize canvas

### 3. Elevation Input

Each node displays and allows editing of elevation (moh). Visual indicators show:
- Absolute elevation value
- Pressure at that point
- Color-coded status

### 4. Persistence Strategy

| Method | Use Case |
|--------|----------|
| localStorage | Auto-save current layout |
| URL params | Quick share links |
| JSON file | Handover exports |

### 5. Localization

All UI strings centralized in `src/i18n/nb.ts`:
- Norwegian as primary language
- English stubs for future expansion
- TypeScript-enforced key safety

---

## Visual Design Notes

### Pressure Color Coding

| Pressure | Color | Meaning |
|----------|-------|---------|
| > 8 bar | 🟢 Green | Excellent |
| 6-8 bar | 🟡 Yellow | Adequate |
| < 6 bar | 🔴 Red | Insufficient |

### Node Display

Each node shows:
- Equipment icon
- Name (Norwegian)
- Elevation (moh)
- Current pressure (bar)
- Status indicator

---

## Open Items

1. **Exact friction coefficients** — Placeholder values used; need real specs per hose type

2. **Terminal flow rates** — Need confirmation of typical l/min for cannons and walls

3. **Pump flow limits** — Should we warn when total flow exceeds pump capacity?
