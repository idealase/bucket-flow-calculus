# UI Behavior Specification

## 1. Layout

### 1.1 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column |
| Tablet/Desktop | ≥ 768px | Two columns |

### 1.2 Mobile Layout (Single Column)

```
┌────────────────────────┐
│    Bucket Flow Calc    │  ← Header
├────────────────────────┤
│                        │
│    [Bucket Viz SVG]    │  ← Visualization
│                        │
├────────────────────────┤
│  ▶ Start   ⟲ Reset    │  ← Primary Controls
├────────────────────────┤
│  Readouts Panel        │  ← Current values
│  t: 0.00s  h: 0.20m    │
│  q_in: 2.00 L/s ...    │
├────────────────────────┤
│  Height Chart          │  ← h(t) over time
│  [═══════════════════] │
├────────────────────────┤
│  Flow Chart            │  ← q_in, q_out, q_net
│  [═══════════════════] │
├────────────────────────┤
│  Parameter Controls    │  ← Sliders, toggles
│  (collapsible)         │
└────────────────────────┘
```

### 1.3 Desktop Layout (Two Columns)

```
┌────────────────────────────────────────────────┐
│              Bucket Flow Calculus              │
├─────────────────────┬──────────────────────────┤
│                     │  Readouts                │
│   [Bucket Viz]      │  t: 0.00s  h: 0.20m      │
│                     │  q_in: 2.00 L/s ...      │
│                     ├──────────────────────────┤
│  ▶ Start  ⟲ Reset  │  Height Chart            │
│                     │  [═══════════════════]   │
├─────────────────────┼──────────────────────────┤
│  Parameter Controls │  Flow Chart              │
│  [Sliders...]       │  [═══════════════════]   │
└─────────────────────┴──────────────────────────┘
```

---

## 2. Components

### 2.1 BucketViz (SVG Visualization)

**Purpose**: Visual representation of the bucket and water level

**Requirements**:
- Responsive SVG with `viewBox` (aspect ratio preserved)
- Maximum width: 400px on desktop, 100% on mobile
- Minimum height: 300px

**Visual Elements**:
1. **Bucket outline**: Gray stroke, rounded bottom optional
2. **Water fill**: Blue rectangle, height proportional to `h/H_MAX`
3. **Water surface**: Slightly darker blue line at top of water
4. **Height markers**: Optional tick marks at 25%, 50%, 75%, 100%
5. **Inflow indicator**: Arrow or stream at top (visible when `q_in > 0`)
6. **Outflow indicator**: Arrow or stream at bottom, scaled by `q_out`
7. **Spill indicator**: Red highlight or animation when spilling

**Animation**:
- Water level animates smoothly (CSS transition or direct update)
- No lag behind actual simulation state

**Colors**:
```css
--bucket-stroke: #666666
--bucket-fill: #f5f5f5
--water-fill: #3498db
--water-surface: #2980b9
--spill-indicator: #e74c3c
--inflow-arrow: #27ae60
--outflow-arrow: #e67e22
```

### 2.2 ControlsPanel

**Purpose**: User input for all simulation parameters

**Layout**: Vertical stack of control groups

#### Control Groups

**1. Bucket Geometry**
| Control | Type | Range | Step | Default | Label |
|---------|------|-------|------|---------|-------|
| H_MAX | Slider | 0.1–1.0 | 0.05 | 0.4 | Max Height (m) |
| r | Slider | 0.05–0.5 | 0.01 | 0.15 | Radius (m) |
| h0 | Slider | 0–H_MAX | 0.01 | 0.2 | Initial Height (m) |

**2. Inflow**
| Control | Type | Options/Range | Default | Label |
|---------|------|---------------|---------|-------|
| Pattern | Toggle | Constant / Sine | Constant | Inflow Pattern |
| Q | Slider | 0–0.01 | 0.002 | Inflow Rate (m³/s) |
| Q_amp | Slider | 0–0.01 | 0.001 | Amplitude (m³/s) |
| T | Slider | 1–30 | 10 | Period (s) |

*Note: Q_amp and T only visible when Pattern = Sine*

**3. Outflow**
| Control | Type | Options/Range | Default | Label |
|---------|------|---------------|---------|-------|
| Law | Toggle | Linear / Sqrt | Linear | Outflow Law |
| k_lin | Slider | 0–0.1 | 0.01 | Linear Coeff (m²/s) |
| k_sqrt | Slider | 0–0.02 | 0.002 | Sqrt Coeff |

*Note: Show k_lin when Law = Linear, k_sqrt when Law = Sqrt*

#### Slider Behavior
- Show current value next to slider
- Value updates in real-time as slider moves
- Format numbers to appropriate precision
- Include unit label

**Example Slider HTML Structure**:
```html
<label>
  <span class="label-text">Inflow Rate (m³/s)</span>
  <input type="range" min="0" max="0.01" step="0.0001" value="0.002" />
  <span class="value-display">0.0020</span>
</label>
```

### 2.3 Primary Controls (Buttons)

| Button | Label | Icon | Action |
|--------|-------|------|--------|
| Start/Pause | "Start" / "Pause" | ▶ / ⏸ | Toggle simulation running state |
| Reset | "Reset" | ⟲ | Reset to initial conditions |

**Button States**:
- Start: Enabled when paused/idle
- Pause: Enabled when running
- Reset: Always enabled

### 2.4 Readouts Panel

**Purpose**: Display current simulation values

**Layout**: Grid or flex layout, 2-3 columns on desktop, 2 columns on mobile

**Values to Display**:
| Label | Value | Units | Format |
|-------|-------|-------|--------|
| Time | t | s | `0.00` |
| Height | h | m | `0.000` |
| Volume | V | L | `0.00` |
| Inflow | q_in | L/s | `0.00` |
| Outflow | q_out | L/s | `0.00` |
| Net Flow | q_net | L/s | `±0.00` |
| Spill | q_spill | L/s | `0.00` (red if > 0) |

**Styling**:
- Monospace font for numbers
- Clear visual hierarchy
- Spill value highlighted in red when active

### 2.5 FlowCharts (D3 + SVG)

#### 2.5.1 Height Chart

**Purpose**: Show h(t) over time

**Specifications**:
- X-axis: Time (last WINDOW seconds, default 30s)
- Y-axis: Height (0 to H_MAX)
- Line: Single blue line for h(t)
- Grid: Light gray horizontal lines at 25%, 50%, 75%

**Axes**:
- X-axis label: "Time (s)"
- Y-axis label: "Height (m)"
- Ticks: Every 5s on X, appropriate intervals on Y

#### 2.5.2 Flow Chart

**Purpose**: Show flow rates over time

**Specifications**:
- X-axis: Time (same window as height chart)
- Y-axis: Flow rate (auto-scaled or 0 to max observed)
- Lines:
  - Green: q_in (inflow)
  - Orange: q_out (outflow)
  - Blue: q_net (net flow)
  - Red (dashed): q_spill (optional, only when > 0)

**Legend**:
- Position: Top-right corner inside chart
- Items: Colored line sample + label for each series

#### 2.5.3 Chart Behavior

**Scrolling**:
- Charts show rolling window of last N seconds
- Smooth left-scrolling as time advances
- No user pan/zoom in MVP

**Responsiveness**:
- Use ResizeObserver to detect container size changes
- Redraw axes and scales on resize
- Maintain aspect ratio (approximately 2:1 width:height)

**Performance**:
- Limit data points to what's visible (buffer last WINDOW + margin)
- Use D3 line generator with SVG path
- Update at ~30 FPS max (throttle if needed)

---

## 3. Interaction Patterns

### 3.1 Slider Interaction

**On Drag**:
1. Update displayed value immediately
2. Update simulation parameter immediately
3. Simulation responds on next physics step

**On Touch (Mobile)**:
1. Larger touch target (min 44px height)
2. Value tooltip follows finger position
3. No conflict with page scroll

### 3.2 Button Interaction

**Start/Pause**:
- Immediate state change
- Visual feedback (button label changes)

**Reset**:
- Stops simulation if running
- Returns all state variables to initial values
- Clears chart history
- Does NOT reset parameter sliders

### 3.3 Parameter Changes While Running

- Allowed: All parameters can be changed while simulation runs
- Behavior: Changes take effect on next physics step
- Exception: Changing h0 does nothing while running (only affects reset)

---

## 4. Accessibility

### 4.1 Keyboard Navigation

- All controls focusable via Tab
- Sliders adjustable via arrow keys
- Buttons activatable via Enter/Space
- Focus indicators visible

### 4.2 Screen Reader Support

- Meaningful labels on all controls
- ARIA labels for visualization
- Live region for readout updates (optional)

### 4.3 Color Considerations

- Do not rely solely on color for information
- Chart lines have distinct patterns or widths
- Sufficient contrast ratios

---

## 5. Performance Requirements

### 5.1 Frame Rate

- Target: 60 FPS rendering
- Acceptable: 30 FPS minimum
- Physics: Independent 120 Hz fixed step

### 5.2 Memory

- Chart buffer: ~3600 samples (60s × 60 samples/s)
- Each sample: ~48 bytes (6 numbers × 8 bytes)
- Total: ~170 KB for history (bounded)

### 5.3 Initial Load

- Target: < 2s to interactive on 3G
- Bundle size: < 200 KB gzipped

---

## 6. Mobile Considerations

### 6.1 Touch Targets

- Minimum size: 44×44 px
- Spacing between targets: ≥ 8px

### 6.2 Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

*Note: `user-scalable=no` prevents zoom on slider interaction, but consider accessibility implications*

### 6.3 Orientation

- Support both portrait and landscape
- Layout adjusts to available space
- No forced orientation

### 6.4 Performance

- Reduce chart sample rate on low-power devices if needed
- Use `will-change` hints sparingly
- Prefer CSS transforms for animations

---

## 7. Error States

### 7.1 No JavaScript

Show message: "This simulator requires JavaScript to run."

### 7.2 Unsupported Browser

Show message if SVG or required features unavailable.

### 7.3 Parameter Conflicts

- If h0 > H_MAX, clamp h0 to H_MAX
- Show visual indicator that value was adjusted
