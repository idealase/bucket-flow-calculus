/**
 * Custom hook for running the bucket flow simulation
 * 
 * Uses requestAnimationFrame with a fixed-timestep accumulator pattern
 * to ensure frame-rate independent physics simulation.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import type { SimulationState, SimulationParams, HistoryPoint, SimulationStatus } from './types';
import { calculateArea, physicsStep } from './math';
import {
  FIXED_DT,
  MAX_FRAME_DT,
  HISTORY_BUFFER_SIZE,
  HISTORY_SAMPLE_RATE,
} from './constants';

/**
 * Return type for the useBucketSimulation hook
 */
export interface UseBucketSimulationResult {
  /** Current simulation state */
  state: SimulationState;
  /** History of simulation points for charts */
  history: HistoryPoint[];
  /** Current simulation status */
  status: SimulationStatus;
  /** Start or resume the simulation */
  start: () => void;
  /** Pause the simulation */
  pause: () => void;
  /** Reset the simulation to initial conditions */
  reset: () => void;
}

/**
 * Create initial simulation state from parameters
 */
function createInitialState(params: SimulationParams): SimulationState {
  return {
    time: 0,
    height: params.bucket.h0,
    qIn: 0,
    qOut: 0,
    qSpill: 0,
    qNet: 0,
    isSpilling: false,
  };
}

/**
 * Hook for running the bucket flow physics simulation
 * 
 * @param params - Simulation parameters (bucket geometry, inflow, outflow)
 * @returns Simulation state, history, and control functions
 */
export function useBucketSimulation(params: SimulationParams): UseBucketSimulationResult {
  // Published state (updated at ~30 FPS)
  const [state, setState] = useState<SimulationState>(() => createInitialState(params));
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [status, setStatus] = useState<SimulationStatus>('idle');

  // Refs for simulation loop (to avoid stale closures)
  const paramsRef = useRef(params);
  const stateRef = useRef(state);
  const historyRef = useRef<HistoryPoint[]>([]);
  const statusRef = useRef(status);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef(0);
  const lastPublishRef = useRef(0);
  const stepCountRef = useRef(0);

  // Update params ref when params change
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // Calculate publish interval in simulation time
  const publishInterval = 1 / HISTORY_SAMPLE_RATE;

  /**
   * Run physics steps for accumulated time
   */
  const runPhysics = useCallback(() => {
    const params = paramsRef.current;
    const area = calculateArea(params.bucket.radius);
    
    while (accumulatorRef.current >= FIXED_DT) {
      // Get current simulation time from step count (avoids float drift)
      const simTime = stepCountRef.current * FIXED_DT;
      
      // Run one physics step
      const result = physicsStep(
        stateRef.current.height,
        simTime,
        FIXED_DT,
        params.bucket.hMax,
        area,
        params.inflow,
        params.outflow
      );

      // Update state ref
      stateRef.current = {
        time: simTime + FIXED_DT,
        height: result.height,
        qIn: result.qIn,
        qOut: result.qOut,
        qSpill: result.qSpill,
        qNet: result.qNet,
        isSpilling: result.qSpill > 0,
      };

      accumulatorRef.current -= FIXED_DT;
      stepCountRef.current += 1;
    }
  }, []);

  /**
   * Record a history point and publish state
   */
  const publishState = useCallback(() => {
    const currentState = stateRef.current;
    
    // Add to history buffer
    const historyPoint: HistoryPoint = {
      time: currentState.time,
      height: currentState.height,
      qIn: currentState.qIn,
      qOut: currentState.qOut,
      qNet: currentState.qNet,
      qSpill: currentState.qSpill,
    };

    historyRef.current = [...historyRef.current, historyPoint];
    
    // Trim history to buffer size
    if (historyRef.current.length > HISTORY_BUFFER_SIZE) {
      historyRef.current = historyRef.current.slice(-HISTORY_BUFFER_SIZE);
    }

    // Publish to React state
    setState(currentState);
    setHistory([...historyRef.current]);
    lastPublishRef.current = currentState.time;
  }, []);

  /**
   * Animation frame callback
   */
  const tick = useCallback((timestamp: number) => {
    if (statusRef.current !== 'running') {
      return;
    }

    // Calculate frame delta
    const frameDt = lastTimeRef.current > 0
      ? (timestamp - lastTimeRef.current) / 1000
      : 0;
    lastTimeRef.current = timestamp;

    // Clamp frame delta to prevent spiral of death
    const clampedDt = Math.min(frameDt, MAX_FRAME_DT);
    accumulatorRef.current += clampedDt;

    // Run physics
    runPhysics();

    // Publish state at target rate
    if (stateRef.current.time - lastPublishRef.current >= publishInterval) {
      publishState();
    }

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(tick);
  }, [runPhysics, publishState, publishInterval]);

  /**
   * Start or resume the simulation
   */
  const start = useCallback(() => {
    if (statusRef.current === 'running') return;

    statusRef.current = 'running';
    setStatus('running');
    lastTimeRef.current = 0;

    // If starting from idle, ensure initial state is published
    if (historyRef.current.length === 0) {
      publishState();
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick, publishState]);

  /**
   * Pause the simulation
   */
  const pause = useCallback(() => {
    statusRef.current = 'paused';
    setStatus('paused');

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  /**
   * Reset the simulation to initial conditions
   */
  const reset = useCallback(() => {
    // Stop animation frame
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Reset all refs
    const initialState = createInitialState(paramsRef.current);
    stateRef.current = initialState;
    historyRef.current = [];
    accumulatorRef.current = 0;
    lastTimeRef.current = 0;
    lastPublishRef.current = 0;
    stepCountRef.current = 0;
    statusRef.current = 'idle';

    // Publish reset state
    setState(initialState);
    setHistory([]);
    setStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    state,
    history,
    status,
    start,
    pause,
    reset,
  };
}
