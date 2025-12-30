# Bucket Flow Calculus

An educational web application that teaches calculus concepts through an interactive water bucket simulation.

## What It Is

This simulator demonstrates the fundamental calculus relationship between **rate of change** and **accumulation**:

$$
\frac{dh}{dt} = \frac{q_{in} - q_{out}}{A}
$$

Where:
- `h` = water height in bucket (meters)
- `q_in` = inflow rate (m³/s)
- `q_out` = outflow rate (m³/s)
- `A` = bucket cross-sectional area (m²)

Users can:
- Watch water level rise and fall based on inflow/outflow rates
- Adjust parameters in real-time and see immediate effects
- Explore different outflow laws (linear vs. Torricelli's square root)
- Observe equilibrium points where inflow equals outflow
- See real-time charts of height and flow rates over time

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Local Development

```bash
# Clone the repository
git clone https://github.com/<username>/bucket-flow-calculus.git
cd bucket-flow-calculus

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/bucket-flow-calculus/` in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Live Demo

Visit: `https://<username>.github.io/bucket-flow-calculus/`

## The Math

### Conservation of Mass

Water entering the bucket minus water leaving equals the change in stored water:

```
Rate of volume change = Inflow - Outflow
A × (dh/dt) = q_in - q_out
```

### Outflow Laws

**Linear Outflow**: `q_out = k × h`
- Outflow proportional to height
- Results in exponential decay

**Torricelli (Square Root) Outflow**: `q_out = k × √h`
- Based on Torricelli's law for fluid through an orifice
- Exit velocity proportional to √(2gh)

### Equilibrium

When `q_in = q_out`, the water level stays constant (`dh/dt = 0`).

For linear outflow: `h_eq = q_in / k`

## Features

- **Real-time simulation** with physics running at 120 Hz
- **Interactive controls** for all parameters
- **SVG bucket visualization** with animated water level
- **D3-powered charts** showing height and flow rates over time
- **Mobile-friendly** responsive design
- **SI units** with litre conversions for intuitive understanding

## Project Structure

```
bucket-flow-calculus/
├── docs/                    # Documentation
│   ├── spec.md             # Product specification
│   ├── math-model.md       # Mathematical model
│   ├── ui-behavior.md      # UI specifications
│   └── deployment.md       # Deployment guide
├── src/
│   ├── app/                # Core simulation logic
│   │   ├── BucketFlowPage.tsx
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── math.ts
│   │   └── useBucketSimulation.ts
│   ├── components/         # React components
│   │   ├── BucketViz.tsx
│   │   ├── ControlsPanel.tsx
│   │   ├── FlowCharts.tsx
│   │   └── Readouts.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment
└── package.json
```

## Deploying to GitHub Pages

1. Push your code to GitHub
2. Go to repository **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push to `main` branch to trigger deployment
5. Access at `https://<username>.github.io/bucket-flow-calculus/`

See [docs/deployment.md](docs/deployment.md) for detailed instructions.

## Documentation

- [Product Specification](docs/spec.md) - Features and acceptance criteria
- [Mathematical Model](docs/math-model.md) - Equations and numerical methods
- [UI Behavior](docs/ui-behavior.md) - Layout and interaction specifications
- [Deployment Guide](docs/deployment.md) - GitHub Pages setup

## Technologies

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **D3** - Charts and data visualization
- **GitHub Actions** - CI/CD for deployment

## License

MIT
