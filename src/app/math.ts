/**
 * Mathematical functions for the Bucket Flow Calculus simulator
 * 
 * All calculations use SI units:
 * - Height: meters (m)
 * - Volume: cubic meters (m³)
 * - Flow rate: cubic meters per second (m³/s)
 * - Time: seconds (s)
 * - Area: square meters (m²)
 */

import type { InflowParams, OutflowParams } from './types';

/**
 * Calculate bucket cross-sectional area from radius
 * 
 * A = π r²
 * 
 * @param radius - Bucket radius in meters
 * @returns Cross-sectional area in m²
 */
export function calculateArea(radius: number): number {
  return Math.PI * radius * radius;
}

/**
 * Calculate water volume from height and area
 * 
 * V = A × h
 * 
 * @param height - Water height in meters
 * @param area - Cross-sectional area in m²
 * @returns Volume in m³
 */
export function calculateVolume(height: number, area: number): number {
  return area * height;
}

/**
 * Convert volume from m³ to litres
 * 
 * @param volumeM3 - Volume in cubic meters
 * @returns Volume in litres
 */
export function volumeToLitres(volumeM3: number): number {
  return volumeM3 * 1000;
}

/**
 * Convert flow rate from m³/s to L/s
 * 
 * @param flowM3s - Flow rate in m³/s
 * @returns Flow rate in L/s
 */
export function flowToLitresPerSecond(flowM3s: number): number {
  return flowM3s * 1000;
}

/**
 * Calculate inflow rate based on current time and inflow parameters
 * 
 * Constant: q_in = Q_base
 * Sine: q_in = max(0, Q_base + Q_amp × sin(2π t / T))
 * 
 * @param time - Current simulation time in seconds
 * @param params - Inflow parameters
 * @returns Inflow rate in m³/s (always >= 0)
 */
export function calculateInflow(time: number, params: InflowParams): number {
  if (params.pattern === 'constant') {
    return Math.max(0, params.qBase);
  }
  
  // Sine pattern
  const sineValue = Math.sin((2 * Math.PI * time) / params.period);
  const qIn = params.qBase + params.qAmp * sineValue;
  
  // Ensure non-negative flow
  return Math.max(0, qIn);
}

/**
 * Calculate outflow rate based on current height and outflow parameters
 * 
 * Linear: q_out = k_lin × h
 * Sqrt (Torricelli): q_out = k_sqrt × √h
 * 
 * @param height - Current water height in meters
 * @param params - Outflow parameters
 * @returns Outflow rate in m³/s (always >= 0)
 */
export function calculateOutflow(height: number, params: OutflowParams): number {
  // Ensure non-negative height for calculation
  const h = Math.max(0, height);
  
  if (params.law === 'linear') {
    return params.kLin * h;
  }
  
  // Square root (Torricelli-like) outflow
  return params.kSqrt * Math.sqrt(h);
}

/**
 * Calculate spill rate when bucket is full
 * 
 * Spill occurs when h == hMax and q_in > q_out
 * q_spill = max(0, q_in - q_out) when at max height
 * 
 * @param height - Current water height in meters
 * @param hMax - Maximum bucket height in meters
 * @param qIn - Inflow rate in m³/s
 * @param qOut - Outflow rate in m³/s
 * @returns Spill rate in m³/s (always >= 0)
 */
export function calculateSpill(
  height: number,
  hMax: number,
  qIn: number,
  qOut: number
): number {
  // Only spill when at maximum height and net inflow is positive
  if (height >= hMax && qIn > qOut) {
    return qIn - qOut;
  }
  return 0;
}

/**
 * Calculate rate of change of height
 * 
 * dh/dt = (q_in - q_out - q_spill) / A
 * 
 * @param qIn - Inflow rate in m³/s
 * @param qOut - Outflow rate in m³/s
 * @param qSpill - Spill rate in m³/s
 * @param area - Bucket cross-sectional area in m²
 * @returns Rate of height change in m/s
 */
export function calculateDhDt(
  qIn: number,
  qOut: number,
  qSpill: number,
  area: number
): number {
  // Avoid division by zero
  if (area <= 0) {
    return 0;
  }
  return (qIn - qOut - qSpill) / area;
}

/**
 * Perform one integration step using explicit Euler method
 * 
 * h(t + dt) = h(t) + dt × dh/dt
 * 
 * The result is clamped to [0, hMax] to maintain invariants
 * 
 * @param height - Current water height in meters
 * @param dhdt - Rate of height change in m/s
 * @param dt - Time step in seconds
 * @param hMax - Maximum bucket height in meters
 * @returns New water height in meters, clamped to [0, hMax]
 */
export function integrateEuler(
  height: number,
  dhdt: number,
  dt: number,
  hMax: number
): number {
  const newHeight = height + dhdt * dt;
  
  // Clamp to valid range
  return clamp(newHeight, 0, hMax);
}

/**
 * Clamp a value to a range
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate equilibrium height for given parameters
 * 
 * At equilibrium, q_in = q_out, so dh/dt = 0
 * 
 * Linear: h_eq = q_in / k_lin
 * Sqrt: h_eq = (q_in / k_sqrt)²
 * 
 * @param qIn - Constant inflow rate in m³/s
 * @param outflowParams - Outflow parameters
 * @param hMax - Maximum bucket height for clamping
 * @returns Equilibrium height in meters
 */
export function calculateEquilibriumHeight(
  qIn: number,
  outflowParams: OutflowParams,
  hMax: number
): number {
  if (qIn <= 0) {
    return 0;
  }
  
  let hEq: number;
  
  if (outflowParams.law === 'linear') {
    if (outflowParams.kLin <= 0) {
      return hMax; // No outflow means bucket fills up
    }
    hEq = qIn / outflowParams.kLin;
  } else {
    if (outflowParams.kSqrt <= 0) {
      return hMax;
    }
    hEq = Math.pow(qIn / outflowParams.kSqrt, 2);
  }
  
  return clamp(hEq, 0, hMax);
}

/**
 * Perform a complete physics step
 * 
 * @param height - Current water height in meters
 * @param time - Current simulation time in seconds
 * @param dt - Time step in seconds
 * @param hMax - Maximum bucket height in meters
 * @param area - Bucket cross-sectional area in m²
 * @param inflowParams - Inflow parameters
 * @param outflowParams - Outflow parameters
 * @returns Object containing new height and flow rates
 */
export function physicsStep(
  height: number,
  time: number,
  dt: number,
  hMax: number,
  area: number,
  inflowParams: InflowParams,
  outflowParams: OutflowParams
): {
  height: number;
  qIn: number;
  qOut: number;
  qSpill: number;
  qNet: number;
} {
  // Calculate flow rates at current state
  const qIn = calculateInflow(time, inflowParams);
  const qOut = calculateOutflow(height, outflowParams);
  const qSpill = calculateSpill(height, hMax, qIn, qOut);
  const qNet = qIn - qOut - qSpill;
  
  // Calculate rate of change
  const dhdt = calculateDhDt(qIn, qOut, qSpill, area);
  
  // Integrate to get new height
  const newHeight = integrateEuler(height, dhdt, dt, hMax);
  
  return {
    height: newHeight,
    qIn,
    qOut,
    qSpill,
    qNet,
  };
}
