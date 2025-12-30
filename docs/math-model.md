# Mathematical Model: Bucket Flow Calculus

## 1. System Description

The system models a cylindrical bucket with:
- Inflow from the top (controlled)
- Outflow from the bottom (dependent on water level)
- Potential overflow (spill) when full

### 1.1 Physical Setup

```
        ┌─────────────┐ ← Inflow q_in
        │             │
        │  ~~~water~~ │ ← Height h
        │  ~~~~~~~~~~~│
        │             │
        └──────┬──────┘
               │
               ▼ Outflow q_out
```

---

## 2. State Variables

| Variable | Symbol | Units | Domain |
|----------|--------|-------|--------|
| Water Height | `h(t)` | m (meters) | [0, H_MAX] |
| Time | `t` | s (seconds) | [0, ∞) |

### 2.1 Derived Quantities

| Quantity | Formula | Units |
|----------|---------|-------|
| Cross-sectional Area | `A = π r²` | m² |
| Water Volume | `V = A · h` | m³ |
| Volume (litres) | `V_L = V × 1000` | L |

---

## 3. Governing Equation

The fundamental conservation of mass equation:

$$
\frac{dh}{dt} = \frac{q_{in}(t) - q_{out}(h) - q_{spill}(h, q_{in}, q_{out})}{A}
$$

### 3.1 Physical Interpretation

- `dh/dt` = rate of change of water height (m/s)
- `q_in - q_out` = net volumetric flow rate (m³/s)
- Dividing by `A` converts volume rate to height rate

### 3.2 Dimensional Analysis

```
[dh/dt] = m/s
[q/A] = (m³/s) / m² = m/s ✓
```

---

## 4. Inflow Models

### 4.1 Constant Inflow

$$
q_{in}(t) = Q
$$

Where:
- `Q` = constant inflow rate (m³/s)
- Range: [0, 0.01] m³/s (0 to 10 L/s)

### 4.2 Sinusoidal Inflow

$$
q_{in}(t) = \max\left(0, Q_{base} + Q_{amp} \cdot \sin\left(\frac{2\pi t}{T}\right)\right)
$$

Where:
- `Q_base` = baseline inflow (m³/s)
- `Q_amp` = amplitude of oscillation (m³/s)
- `T` = period of oscillation (s)
- `max(0, ...)` ensures non-negative flow

**Note**: If `Q_amp > Q_base`, the inflow will be zero for part of the cycle.

---

## 5. Outflow Models

### 5.1 Linear Outflow

$$
q_{out}(h) = k_{lin} \cdot h
$$

Where:
- `k_lin` = linear outflow coefficient (m²/s)
- Range: [0, 0.1] m²/s

**Physical interpretation**: Outflow proportional to hydrostatic pressure (∝ height). This approximates a valve with linear pressure-flow relationship.

**Dimensional check**:
```
[q_out] = [k_lin] · [h] = (m²/s) · m = m³/s ✓
```

### 5.2 Square Root (Torricelli-like) Outflow

$$
q_{out}(h) = k_{sqrt} \cdot \sqrt{\max(h, 0)}
$$

Where:
- `k_sqrt` = Torricelli coefficient (m^(5/2)/s)
- Range: [0, 0.02] m^(5/2)/s

**Physical interpretation**: Based on Torricelli's law, where exit velocity `v = √(2gh)`. This models a simple orifice at the bottom.

**Full Torricelli derivation**:
```
v = √(2gh)           Exit velocity
q = A_orifice · v    Volumetric flow
q = A_orifice · √(2g) · √h
q = k_sqrt · √h      Where k_sqrt = A_orifice · √(2g)
```

**Dimensional check**:
```
[q_out] = [k_sqrt] · [√h] = (m^(5/2)/s) · m^(1/2) = m³/s ✓
```

---

## 6. Overflow (Spill) Model

When the bucket is full and inflow exceeds outflow:

$$
q_{spill} = 
\begin{cases}
q_{in} - q_{out} & \text{if } h = H_{MAX} \text{ and } q_{in} > q_{out} \\
0 & \text{otherwise}
\end{cases}
$$

**Conservation check**: When spilling,
```
q_net = q_in - q_out - q_spill = q_in - q_out - (q_in - q_out) = 0
```

This ensures `dh/dt = 0` at maximum height (no overflow past `H_MAX`).

---

## 7. Boundary Conditions and Clamping

### 7.1 Height Bounds

After each integration step:

$$
h_{new} = \text{clamp}(h_{new}, 0, H_{MAX})
$$

### 7.2 Non-negative Flows

All flow rates must be non-negative:
- `q_in ≥ 0`
- `q_out ≥ 0`
- `q_spill ≥ 0`

### 7.3 Initial Conditions

At `t = 0`:
- `h(0) = h_0` (user-specified initial height)
- `0 ≤ h_0 ≤ H_MAX`

---

## 8. Numerical Method

### 8.1 Explicit Euler Method

We use forward Euler integration for simplicity and educational clarity:

$$
h(t + \Delta t) = h(t) + \Delta t \cdot \frac{dh}{dt}
$$

Expanded:

$$
h_{n+1} = h_n + \Delta t \cdot \frac{q_{in}(t_n) - q_{out}(h_n)}{A}
$$

### 8.2 Fixed Time Step

- `Δt = 1/120 s` (fixed physics step)
- Independent of display frame rate

### 8.3 Accumulator Pattern

```
accumulator = 0
fixedDt = 1/120

onFrame(frameDt):
    accumulator += min(frameDt, 0.1)  // Cap to prevent spiral of death
    
    while accumulator >= fixedDt:
        integratePhysics(fixedDt)
        accumulator -= fixedDt
```

### 8.4 Stability Analysis

For linear outflow, the system has form:
$$
\frac{dh}{dt} = \frac{q_{in}}{A} - \frac{k_{lin}}{A} \cdot h
$$

This is stable if:
$$
\Delta t < \frac{2A}{k_{lin}}
$$

**With our defaults**:
- `A = π × 0.15² ≈ 0.0707 m²`
- `k_lin = 0.01 m²/s`
- Stability limit: `Δt < 14.14 s`
- Our `Δt = 1/120 ≈ 0.0083 s` → **Stable by large margin**

For sqrt outflow, local stability depends on current height, but remains stable for practical parameters.

---

## 9. Equilibrium Analysis

### 9.1 Finding Equilibrium Height

At equilibrium, `dh/dt = 0`, so `q_in = q_out`.

**Linear outflow equilibrium**:
$$
Q = k_{lin} \cdot h_{eq}
$$
$$
h_{eq} = \frac{Q}{k_{lin}}
$$

**Sqrt outflow equilibrium**:
$$
Q = k_{sqrt} \cdot \sqrt{h_{eq}}
$$
$$
h_{eq} = \left(\frac{Q}{k_{sqrt}}\right)^2
$$

### 9.2 Default Values Check

With defaults (`Q = 0.002 m³/s`, `k_lin = 0.01 m²/s`):
$$
h_{eq} = \frac{0.002}{0.01} = 0.2 \text{ m}
$$

This equals our default initial height, so simulation starts at equilibrium.

---

## 10. Unit Conversions

### 10.1 Volume

| From | To | Formula |
|------|----|---------|
| m³ | L (litres) | `V_L = V_m3 × 1000` |
| L | m³ | `V_m3 = V_L / 1000` |

### 10.2 Flow Rate

| From | To | Formula |
|------|----|---------|
| m³/s | L/s | `q_Ls = q_m3s × 1000` |
| L/s | m³/s | `q_m3s = q_Ls / 1000` |

### 10.3 Display Conventions

- Heights: show in meters (m) or centimeters (cm)
- Volumes: show in litres (L) for intuition
- Flow rates: show in L/s for intuition, m³/s for precision

---

## 11. Implementation Notes

### 11.1 Numerical Precision

- Use `Number` (64-bit float) for all calculations
- Avoid accumulated floating-point error in time by using integer step counts
- Apply clamping after each step to prevent drift

### 11.2 Time Tracking

```typescript
// Prefer integer step counting
let stepCount = 0;
const fixedDt = 1 / 120;

function getSimTime(): number {
  return stepCount * fixedDt;
}
```

### 11.3 History Buffer

For charts showing last N seconds:
```typescript
const HISTORY_DURATION = 60; // seconds
const SAMPLES_PER_SECOND = 30;
const BUFFER_SIZE = HISTORY_DURATION * SAMPLES_PER_SECOND;

// Use circular buffer or shift array
```

---

## 12. Invariants

The following must always be true:

1. `0 ≤ h ≤ H_MAX`
2. `q_in ≥ 0`
3. `q_out ≥ 0`
4. `q_spill ≥ 0`
5. `q_net = q_in - q_out - q_spill`
6. `|dh/dt| ≤ q_in / A` (maximum rate bounded by inflow)
7. When `h = H_MAX`: `q_spill = max(0, q_in - q_out)`
8. When `h < H_MAX`: `q_spill = 0`
