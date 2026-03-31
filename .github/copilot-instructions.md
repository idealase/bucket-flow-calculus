# bucket-flow-calculus — Copilot Instructions

## Project Overview

An interactive water bucket simulation that teaches calculus concepts — specifically rate of change and accumulation. Users control inflow rate while the simulator computes outflow (linear or Torricelli's law), water height over time, and equilibrium. Core equation: `dh/dt = (q_in - q_out) / A`. Built with React, TypeScript, and D3.js time-series charts.

## Tech Stack

- **Frontend**: React 18.3 / Vite 6.0 / TypeScript 5.6
- **Visualization**: D3.js 7.9 (line chart generators + scales) and programmatic SVG (bucket viz)
- **Data**: In-memory simulation state (no persistence)
- **Styling**: Vanilla CSS (`src/App.css`, `src/index.css`)
- **Testing**: None configured yet
- **Linting**: ESLint 9 with react-hooks and react-refresh plugins
- **Deployment**: GitHub Pages via GitHub Actions
- **CI/CD**: GitHub Actions (`deploy.yml`) — builds and deploys on push to `main`

## Quick Commands

```bash
# Install dependencies
npm ci

# Start dev server
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Lint
npm run lint

# Preview production build
npm run preview

# Deploy to GitHub Pages (manual, via gh-pages package)
npm run deploy

# Type check (part of build via tsc -b)
npx tsc -b
```

## Project Structure

```
bucket-flow-calculus/
├── src/
│   ├── app/                    # Core simulation logic
│   │   ├── BucketFlowPage.tsx  # Main page component (orchestrator)
│   │   ├── constants.ts        # Physics & UI constants
│   │   ├── math.ts             # Physics calculations (outflow, equilibrium)
│   │   ├── types.ts            # TypeScript interfaces (BucketState, HistoryPoint)
│   │   └── useBucketSimulation.ts  # Simulation hook (120 Hz Euler integration)
│   ├── components/             # UI components
│   │   ├── BucketViz.tsx       # SVG bucket visualization (water level, overflow)
│   │   ├── ControlsPanel.tsx   # Parameter sliders and controls
│   │   ├── FlowCharts.tsx      # D3 time-series charts (HeightChart + FlowChart)
│   │   └── Readouts.tsx        # Numeric readout displays
│   ├── App.tsx                 # Root app component
│   ├── App.css
│   ├── index.css
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts
├── docs/                       # Design specs and documentation
├── public/                     # Static assets
├── .github/
│   ├── workflows/deploy.yml
│   └── copilot-instructions.md
├── package.json
├── eslint.config.js
├── tsconfig.json
└── vite.config.ts              # base: '/bucket-flow-calculus/'
```

## Coding Conventions

### General
- Use TypeScript strict mode — no `any` types
- Keep physics/math logic in `src/app/math.ts` and `src/app/constants.ts` — pure functions only
- Simulation state managed via custom React hook (`useBucketSimulation`)
- Use SI units internally (meters, m³/s, seconds)

### Naming
- Components: PascalCase (`BucketViz.tsx`, `FlowCharts.tsx`)
- Hooks: `use` prefix (`useBucketSimulation.ts`)
- Physics functions: descriptive camelCase (`computeOutflow`, `equilibriumHeight`)
- Types/interfaces: PascalCase (`BucketState`, `HistoryPoint`)

### File Organization
- One component per file
- Physics logic in `src/app/` — separate from visual components in `src/components/`
- Types co-located with logic in `src/app/types.ts`

### Git
- Conventional commits: `feat|fix|docs|chore|refactor|test|ci: description`
- Branch naming: `type/issue-number-short-description`
- Default branch: `master`

## Architecture Decisions

- **React + D3 hybrid**: D3 used only as a math/utility library (scales, line generators, curves) — all DOM rendering done by React via JSX SVG elements. No D3 DOM manipulation.
- **120 Hz simulation**: Euler method numerical integration at high frequency for smooth animation via `requestAnimationFrame` in `useBucketSimulation`
- **Two outflow laws**: Linear (`q_out = k × h`) and Torricelli (`q_out = k × √h`) — switchable at runtime
- **History buffer**: 60-second rolling window at 30 samples/second (1,800 max points) for chart data
- **Vite base path**: Set to `/bucket-flow-calculus/` for GitHub Pages deployment
- **No state management library**: Single custom hook manages all simulation state

## D3 Visualization Patterns

D3 is used **only** in `src/components/FlowCharts.tsx` as a calculation library — NOT for DOM manipulation.

### Usage Pattern
```typescript
import * as d3 from 'd3';

// Scales: map data domain to pixel range
const xScale = d3.scaleLinear().domain([timeStart, timeEnd]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, maxHeight]).range([height, 0]);

// Line generators: produce SVG path strings
const lineGen = d3.line<HistoryPoint>()
  .x(d => xScale(d.time))
  .y(d => yScale(d.height))
  .curve(d3.curveMonotoneX);

// Rendered in JSX: <path d={lineGen(data)} />
```

### Chart Types
| Chart | Type | Data Fields | Axes |
|-------|------|-------------|------|
| HeightChart | Single-line time series | time, height | X: seconds (30s window), Y: meters |
| FlowChart | Multi-line time series | time, qIn, qOut, qNet | X: seconds (30s window), Y: m³/s |

### Data Format
```typescript
interface HistoryPoint {
  time: number;    // Seconds since start
  height: number;  // Water height in meters
  qIn: number;     // Inflow rate m³/s
  qOut: number;    // Outflow rate m³/s
  qNet: number;    // Net flow (qIn - qOut) m³/s
  qSpill: number;  // Overflow rate m³/s
}
```

### Key D3 Methods Used
- `d3.scaleLinear()` — linear scales for both axes
- `d3.line<T>()` — line path generators
- `d3.curveMonotoneX` — smooth monotone interpolation
- `yScale.ticks(5)` — generate axis tick values
- All rendering via React `<svg>`, `<path>`, `<line>`, `<text>` — no `d3.select()`

## Deployment

- **URL**: https://idealase.github.io/bucket-flow-calculus/
- **Build path**: `dist/`
- **Method**: GitHub Pages via GitHub Actions (auto-deploy on push to `main`)
- **Base path**: `/bucket-flow-calculus/` (configured in `vite.config.ts`)

### Deployment Checklist
1. Lint passes: `npm run lint`
2. Build succeeds: `npm run build`
3. Push to `main` triggers GitHub Actions deploy
4. Verify: `curl -s https://idealase.github.io/bucket-flow-calculus/`

## Testing Strategy

- **Status**: No testing framework configured yet
- **Recommended**: Vitest for unit tests on physics logic
- **Priority**: `src/app/math.ts` (outflow calculations, equilibrium) is ideal for unit testing — pure functions with no side effects
- **Test location**: Co-located `*.test.ts` files recommended

## Common Pitfalls

- **Base path**: Vite base is `/bucket-flow-calculus/` — all asset paths must be relative. Dev server runs at `http://localhost:5173/bucket-flow-calculus/`
- **SI units**: All internal calculations use meters and m³/s. Display formatting happens in components, never in math functions
- **Simulation frequency**: The sim runs at 120 Hz (requestAnimationFrame) but history is sampled at 30 Hz. Don't confuse simulation dt with sampling interval
- **Outflow law switching**: Changing between Linear and Torricelli mid-simulation is valid but may cause a discontinuity in the charts — this is expected physics behavior
- **History buffer size**: The 1,800-point buffer uses a sliding window. Don't assume all history is available — only the last 60 seconds

## Related Repos

- **idealase.github.io**: Meta-repo with agentic SDLC docs and shared templates

## Agent-Specific Instructions

### Scope Control
- Stay within the files listed in the issue. Do not refactor unrelated code.
- If you discover a bug outside your scope, note it in the PR but don't fix it.
- Maximum diff size: 200 lines for size/S, 500 lines for size/M

### PR Format
- Title: conventional commit format (`feat: add dark mode toggle`)
- Body: reference the issue (`Closes #42`)
- Include a "Changes" section listing what was modified and why
- Include a "Testing" section showing test commands run and results

### What NOT to Do
- Do not modify CI/CD workflows unless the issue specifically asks for it
- Do not update dependencies unless the issue specifically asks for it
- Do not add new dev dependencies without explicit instruction
- Do not modify nginx configs, systemd units, or deployment scripts
- Do not read or modify `.env` files, credentials, or secrets
