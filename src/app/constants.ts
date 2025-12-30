/**
 * Constants and default values for the Bucket Flow Calculus simulator
 */

import type { SimulationParams } from './types';

// ============================================================================
// SIMULATION CONSTANTS
// ============================================================================

/** Fixed physics timestep in seconds (120 Hz) */
export const FIXED_DT = 1 / 120;

/** Maximum frame delta to prevent spiral of death (s) */
export const MAX_FRAME_DT = 0.1;

/** Target render rate for state updates (Hz) */
export const RENDER_RATE = 30;

/** History window duration in seconds */
export const HISTORY_WINDOW = 60;

/** Samples per second in history buffer */
export const HISTORY_SAMPLE_RATE = 30;

/** Total buffer size for history */
export const HISTORY_BUFFER_SIZE = HISTORY_WINDOW * HISTORY_SAMPLE_RATE;

// ============================================================================
// PARAMETER RANGES
// ============================================================================

export const PARAM_RANGES = {
  /** Max bucket height range [min, max, step] in meters */
  hMax: { min: 0.1, max: 1.0, step: 0.05 },
  
  /** Bucket radius range [min, max, step] in meters */
  radius: { min: 0.05, max: 0.5, step: 0.01 },
  
  /** Initial height range - max is dynamic based on hMax */
  h0: { min: 0, step: 0.01 },
  
  /** Base inflow rate range [min, max, step] in m³/s */
  qBase: { min: 0, max: 0.01, step: 0.0001 },
  
  /** Sine amplitude range [min, max, step] in m³/s */
  qAmp: { min: 0, max: 0.01, step: 0.0001 },
  
  /** Sine period range [min, max, step] in seconds */
  period: { min: 1, max: 30, step: 0.5 },
  
  /** Linear outflow coefficient range [min, max, step] in m²/s */
  kLin: { min: 0, max: 0.1, step: 0.001 },
  
  /** Sqrt outflow coefficient range [min, max, step] in m^(5/2)/s */
  kSqrt: { min: 0, max: 0.02, step: 0.0001 },
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_PARAMS: SimulationParams = {
  bucket: {
    hMax: 0.4,    // 40 cm max height
    radius: 0.15, // 15 cm radius
    h0: 0.2,      // 20 cm initial height (at equilibrium with defaults)
  },
  inflow: {
    pattern: 'constant',
    qBase: 0.002,  // 2 L/s = 0.002 m³/s
    qAmp: 0.001,   // 1 L/s amplitude for sine
    period: 10,    // 10 second period
  },
  outflow: {
    law: 'linear',
    kLin: 0.01,    // With h=0.2, gives qOut = 0.002 m³/s (equilibrium)
    kSqrt: 0.002,  // Torricelli coefficient
  },
};

// ============================================================================
// DISPLAY CONSTANTS
// ============================================================================

/** Chart display window in seconds */
export const CHART_WINDOW = 30;

/** Number formatting precision for different units */
export const DISPLAY_PRECISION = {
  time: 2,       // 0.00 s
  height: 3,     // 0.000 m
  volume: 2,     // 0.00 L
  flowRate: 2,   // 0.00 L/s
} as const;

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  bucket: {
    stroke: '#666666',
    fill: '#f5f5f5',
  },
  water: {
    fill: '#3498db',
    surface: '#2980b9',
  },
  spill: '#e74c3c',
  inflow: '#27ae60',
  outflow: '#e67e22',
  netFlow: '#3498db',
  chartGrid: '#e0e0e0',
  chartAxis: '#666666',
} as const;
