# Product Specification: Bucket Flow Calculus Simulator

## 1. Overview

**Bucket Flow Calculus** is an educational web application that teaches the fundamental calculus concept of "rate of change" through an interactive water bucket simulation.

### 1.1 Core Educational Objective

Demonstrate the differential equation:

```
dh/dt = (q_in − q_out) / A
```

Where:
- `h` = water height in bucket (m)
- `q_in` = inflow rate (m³/s)
- `q_out` = outflow rate (m³/s)
- `A` = bucket cross-sectional area (m²)

### 1.2 Learning Goals

Users will understand:
1. **Rate of Change**: How `dh/dt` relates to net flow
2. **Equilibrium**: When `q_in = q_out`, height is constant (`dh/dt = 0`)
3. **Non-linear Dynamics**: How different outflow laws affect system behavior
4. **Conservation of Mass**: Water cannot be created or destroyed; it flows in, out, or spills

---

## 2. User Flows

### 2.1 MVP User Flow: Basic Simulation

**Preconditions**: User opens the app in a browser

**Flow**:
1. Page loads with default parameters
2. Simulation is in **paused** state
3. User observes bucket visualization showing initial water level
4. User clicks **Start** button
5. Simulation runs:
   - Water level changes based on inflow/outflow
   - Charts update in real-time
   - Readouts display current values
6. User adjusts slider (e.g., inflow rate) while simulation runs
7. Simulation responds smoothly to parameter changes
8. User clicks **Pause** to stop simulation
9. User clicks **Reset** to return to initial state

### 2.2 User Flow: Exploring Outflow Laws

**Flow**:
1. User starts with default linear outflow law
2. User runs simulation, observes exponential decay behavior
3. User toggles to **sqrt (Torricelli)** outflow law
4. User observes different decay curve shape
5. User compares behaviors by resetting and switching laws

### 2.3 User Flow: Variable Inflow (Sine Wave)

**Flow**:
1. User selects **Sine** inflow pattern
2. User adjusts amplitude and period parameters
3. User observes oscillating water level
4. User identifies relationship between inflow frequency and level response

### 2.4 User Flow: Overflow Scenario

**Flow**:
1. User sets high inflow rate
2. User runs simulation until bucket fills to `H_MAX`
3. User observes spill indicator activating
4. User sees spill rate in readouts
5. User understands that excess water spills when bucket is full

---

## 3. Acceptance Criteria

### 3.1 Simulation Accuracy

| Criterion | Requirement |
|-----------|-------------|
| AC-SIM-01 | Height `h(t)` is always clamped to `[0, H_MAX]` |
| AC-SIM-02 | Spill activates only when `h == H_MAX` AND `q_net > 0` |
| AC-SIM-03 | Conservation: `q_net = q_in - q_out - q_spill` at all times |
| AC-SIM-04 | Reset returns to deterministic initial state |
| AC-SIM-05 | Parameter changes mid-simulation do not cause discontinuities or crashes |

### 3.2 Performance

| Criterion | Requirement |
|-----------|-------------|
| AC-PERF-01 | Simulation runs at consistent rate regardless of display refresh |
| AC-PERF-02 | No visible stutter on mobile devices |
| AC-PERF-03 | Charts scroll smoothly showing last N seconds of data |
| AC-PERF-04 | Memory usage remains bounded (rolling buffers) |

### 3.3 User Interface

| Criterion | Requirement |
|-----------|-------------|
| AC-UI-01 | Mobile-friendly layout (single column on small screens) |
| AC-UI-02 | All controls accessible without horizontal scrolling |
| AC-UI-03 | Sliders show current value and units |
| AC-UI-04 | Start/Pause button reflects current state |
| AC-UI-05 | Reset is available regardless of simulation state |

### 3.4 Visual Accuracy

| Criterion | Requirement |
|-----------|-------------|
| AC-VIS-01 | Bucket water level visually proportional to `h/H_MAX` |
| AC-VIS-02 | Charts display correct units on axes |
| AC-VIS-03 | Chart legends clearly identify each line |
| AC-VIS-04 | Height chart Y-axis range is `[0, H_MAX]` |

### 3.5 Units

| Criterion | Requirement |
|-----------|-------------|
| AC-UNIT-01 | All internal calculations use SI units (m, m³/s, s) |
| AC-UNIT-02 | Display shows litre conversions where appropriate |
| AC-UNIT-03 | Unit labels are present on all numeric displays |

---

## 4. Feature Breakdown

### 4.1 Core Features (MVP)

- [x] Bucket visualization (SVG)
- [x] Height simulation with explicit Euler integration
- [x] Linear outflow law
- [x] Sqrt outflow law (Torricelli-like)
- [x] Constant inflow
- [x] Sine wave inflow
- [x] Overflow/spill handling
- [x] Parameter controls (sliders)
- [x] Start/Pause/Reset controls
- [x] Real-time readouts
- [x] Height-over-time chart
- [x] Flow rates chart
- [x] Responsive layout

### 4.2 Out of Scope (MVP)

- Multiple buckets
- Custom inflow profiles
- Data export
- Simulation playback/recording
- Sound effects
- 3D visualization
- Server-side components

---

## 5. Parameters

### 5.1 Bucket Geometry

| Parameter | Symbol | Range | Default | Units |
|-----------|--------|-------|---------|-------|
| Max Height | `H_MAX` | 0.1 – 1.0 | 0.4 | m |
| Radius | `r` | 0.05 – 0.5 | 0.15 | m |
| Initial Height | `h0` | 0 – H_MAX | 0.2 | m |

### 5.2 Inflow

| Parameter | Symbol | Range | Default | Units |
|-----------|--------|-------|---------|-------|
| Base Inflow | `Q` | 0 – 0.01 | 0.002 | m³/s |
| Inflow Pattern | — | constant, sine | constant | — |
| Sine Amplitude | `Q_amp` | 0 – 0.01 | 0.001 | m³/s |
| Sine Period | `T` | 1 – 30 | 10 | s |

### 5.3 Outflow

| Parameter | Symbol | Range | Default | Units |
|-----------|--------|-------|---------|-------|
| Outflow Law | — | linear, sqrt | linear | — |
| Linear Coefficient | `k_lin` | 0 – 0.1 | 0.01 | m²/s |
| Sqrt Coefficient | `k_sqrt` | 0 – 0.02 | 0.002 | m^(5/2)/s |

---

## 6. State Machine

```
States:
  - IDLE: Simulation not started or reset
  - RUNNING: Simulation actively updating
  - PAUSED: Simulation frozen at current state

Transitions:
  IDLE    --[Start]--> RUNNING
  RUNNING --[Pause]--> PAUSED
  PAUSED  --[Start]--> RUNNING
  PAUSED  --[Reset]--> IDLE
  RUNNING --[Reset]--> IDLE
```

---

## 7. Error Handling

| Scenario | Behavior |
|----------|----------|
| Invalid parameter input | Clamp to valid range |
| Negative height calculated | Clamp to 0 |
| Height exceeds H_MAX | Clamp to H_MAX, activate spill |
| Browser tab hidden | Pause simulation or cap delta time |
| Window resize | Charts and viz resize gracefully |

---

## 8. Glossary

| Term | Definition |
|------|------------|
| `h` | Water height in bucket (meters) |
| `H_MAX` | Maximum bucket height (meters) |
| `r` | Bucket radius (meters) |
| `A` | Cross-sectional area = π r² (m²) |
| `q_in` | Inflow rate (m³/s) |
| `q_out` | Outflow rate (m³/s) |
| `q_spill` | Overflow rate when bucket full (m³/s) |
| `q_net` | Net flow = q_in - q_out - q_spill (m³/s) |
| `dh/dt` | Rate of change of height (m/s) |
