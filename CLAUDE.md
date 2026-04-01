# bucket-flow-calculus

## Quick Reference
- **Build**: `npm run build` (`tsc -b && vite build`)
- **Dev server**: `npm run dev` → http://localhost:5173
- **Lint**: `npm run lint` (ESLint)
- **Preview**: `npm run preview`
- **Deploy**: `npm run deploy` (gh-pages -d dist)
- **No test runner configured** — recommended: Vitest for physics simulation logic

## Architecture
Educational water bucket simulation teaching calculus — rate of change and accumulation.

```
/src/
  /app/                 → Main page + simulation logic
    BucketFlowPage.tsx  → Primary page component
    types.ts            → Type definitions
    constants.ts        → Physical constants
    math.ts             → Mathematical functions (dh/dt = (q_in - q_out) / A)
    useBucketSimulation.ts → Simulation hook (120 Hz physics loop)
  /components/          → Visualization components
    BucketViz.tsx       → SVG bucket visualization
    ControlsPanel.tsx   → User input controls
    FlowCharts.tsx      → D3 time-series charts
    Readouts.tsx        → Numeric readouts
  /main.tsx             → Entry point
```

## Key Conventions
- **Branch**: `master` (not `main`) — but CI deploys on push to `main`
- **120 Hz physics**: Simulation runs at 120 Hz via requestAnimationFrame — separate from render rate
- **SI units**: All calculations in SI (meters, m³/s), display converts to litres
- **Two outflow laws**: Linear and Torricelli's square-root law — configurable per simulation
- **60-second history buffer**: Charts display last 60 seconds of simulation data
- **D3 + React hybrid**: D3 for chart rendering via refs, React for UI components
- **Key equation**: `dh/dt = (q_in - q_out) / A` (conservation of mass)

## Deployment
- **URL**: GitHub Pages at `https://idealase.github.io/bucket-flow-calculus/`
- **Base path**: `/bucket-flow-calculus/` (set in vite.config.ts)
- **CI**: `deploy.yml` — Node 20, triggers on push to `main`

## Common Pitfalls
- Default branch is `master` but CI triggers on `main` — merge to `main` for auto-deploy
- No test framework installed — physics logic in `math.ts` and `useBucketSimulation.ts` is untested
- 120 Hz simulation can cause performance issues on low-end devices
- D3 chart updates must be coordinated with React lifecycle via refs

## Existing Agent Guidance
See `.github/copilot-instructions.md` for physics model details, D3 patterns, and architecture decisions.

## Sensitive Files
Do not read, log, or commit: any `.env` files, credentials, secrets.
