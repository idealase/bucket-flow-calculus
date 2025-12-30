/**
 * Type definitions for the Bucket Flow Calculus simulator
 */

/**
 * Pattern for inflow rate
 */
export type InflowPattern = 'constant' | 'sine';

/**
 * Outflow law determining how water exits the bucket
 */
export type OutflowLaw = 'linear' | 'sqrt';

/**
 * Simulation state at a point in time
 */
export interface SimulationState {
  /** Current simulation time (s) */
  time: number;
  /** Current water height (m) */
  height: number;
  /** Current inflow rate (m³/s) */
  qIn: number;
  /** Current outflow rate (m³/s) */
  qOut: number;
  /** Current spill rate (m³/s) */
  qSpill: number;
  /** Net flow rate = qIn - qOut - qSpill (m³/s) */
  qNet: number;
  /** Whether the bucket is currently spilling */
  isSpilling: boolean;
}

/**
 * Parameters that control the bucket geometry
 */
export interface BucketParams {
  /** Maximum bucket height (m) */
  hMax: number;
  /** Bucket radius (m) */
  radius: number;
  /** Initial water height (m) */
  h0: number;
}

/**
 * Parameters that control inflow
 */
export interface InflowParams {
  /** Inflow pattern type */
  pattern: InflowPattern;
  /** Base/constant inflow rate (m³/s) */
  qBase: number;
  /** Amplitude for sine pattern (m³/s) */
  qAmp: number;
  /** Period for sine pattern (s) */
  period: number;
}

/**
 * Parameters that control outflow
 */
export interface OutflowParams {
  /** Outflow law type */
  law: OutflowLaw;
  /** Linear outflow coefficient (m²/s) */
  kLin: number;
  /** Square root outflow coefficient (m^(5/2)/s) */
  kSqrt: number;
}

/**
 * All simulation parameters combined
 */
export interface SimulationParams {
  bucket: BucketParams;
  inflow: InflowParams;
  outflow: OutflowParams;
}

/**
 * A single data point in the history buffer
 */
export interface HistoryPoint {
  time: number;
  height: number;
  qIn: number;
  qOut: number;
  qNet: number;
  qSpill: number;
}

/**
 * Simulation running status
 */
export type SimulationStatus = 'idle' | 'running' | 'paused';
