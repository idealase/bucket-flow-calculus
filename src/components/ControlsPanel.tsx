/**
 * ControlsPanel - User controls for simulation parameters
 */

import type { SimulationParams, SimulationStatus } from '../app/types';
import { PARAM_RANGES } from '../app/constants';

interface ControlsPanelProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  status: SimulationStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  precision?: number;
}

function Slider({ label, value, min, max, step, unit, onChange, precision = 4 }: SliderProps) {
  return (
    <label className="slider-control">
      <span className="slider-label">{label}</span>
      <div className="slider-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <span className="slider-value">
          {value.toFixed(precision)} {unit}
        </span>
      </div>
    </label>
  );
}

interface ToggleProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function Toggle({ label, options, value, onChange }: ToggleProps) {
  return (
    <div className="toggle-control">
      <span className="toggle-label">{label}</span>
      <div className="toggle-buttons">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`toggle-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ControlsPanel({
  params,
  onParamsChange,
  status,
  onStart,
  onPause,
  onReset,
}: ControlsPanelProps) {
  const updateBucket = (updates: Partial<typeof params.bucket>) => {
    const newBucket = { ...params.bucket, ...updates };
    // Clamp h0 to hMax if needed
    if (newBucket.h0 > newBucket.hMax) {
      newBucket.h0 = newBucket.hMax;
    }
    onParamsChange({ ...params, bucket: newBucket });
  };

  const updateInflow = (updates: Partial<typeof params.inflow>) => {
    onParamsChange({ ...params, inflow: { ...params.inflow, ...updates } });
  };

  const updateOutflow = (updates: Partial<typeof params.outflow>) => {
    onParamsChange({ ...params, outflow: { ...params.outflow, ...updates } });
  };

  return (
    <div className="controls-panel">
      {/* Primary Controls */}
      <div className="control-group primary-controls">
        <button
          className={`btn btn-primary ${status === 'running' ? 'pause' : 'start'}`}
          onClick={status === 'running' ? onPause : onStart}
        >
          {status === 'running' ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          ⟲ Reset
        </button>
      </div>

      {/* Bucket Geometry */}
      <div className="control-group">
        <h3>Bucket Geometry</h3>
        <Slider
          label="Max Height"
          value={params.bucket.hMax}
          min={PARAM_RANGES.hMax.min}
          max={PARAM_RANGES.hMax.max}
          step={PARAM_RANGES.hMax.step}
          unit="m"
          precision={2}
          onChange={(v) => updateBucket({ hMax: v })}
        />
        <Slider
          label="Radius"
          value={params.bucket.radius}
          min={PARAM_RANGES.radius.min}
          max={PARAM_RANGES.radius.max}
          step={PARAM_RANGES.radius.step}
          unit="m"
          precision={2}
          onChange={(v) => updateBucket({ radius: v })}
        />
        <Slider
          label="Initial Height"
          value={params.bucket.h0}
          min={PARAM_RANGES.h0.min}
          max={params.bucket.hMax}
          step={PARAM_RANGES.h0.step}
          unit="m"
          precision={2}
          onChange={(v) => updateBucket({ h0: v })}
        />
      </div>

      {/* Inflow Parameters */}
      <div className="control-group">
        <h3>Inflow</h3>
        <Toggle
          label="Pattern"
          options={[
            { value: 'constant', label: 'Constant' },
            { value: 'sine', label: 'Sine Wave' },
          ]}
          value={params.inflow.pattern}
          onChange={(v) => updateInflow({ pattern: v as 'constant' | 'sine' })}
        />
        <Slider
          label="Base Rate"
          value={params.inflow.qBase}
          min={PARAM_RANGES.qBase.min}
          max={PARAM_RANGES.qBase.max}
          step={PARAM_RANGES.qBase.step}
          unit="m³/s"
          precision={4}
          onChange={(v) => updateInflow({ qBase: v })}
        />
        {params.inflow.pattern === 'sine' && (
          <>
            <Slider
              label="Amplitude"
              value={params.inflow.qAmp}
              min={PARAM_RANGES.qAmp.min}
              max={PARAM_RANGES.qAmp.max}
              step={PARAM_RANGES.qAmp.step}
              unit="m³/s"
              precision={4}
              onChange={(v) => updateInflow({ qAmp: v })}
            />
            <Slider
              label="Period"
              value={params.inflow.period}
              min={PARAM_RANGES.period.min}
              max={PARAM_RANGES.period.max}
              step={PARAM_RANGES.period.step}
              unit="s"
              precision={1}
              onChange={(v) => updateInflow({ period: v })}
            />
          </>
        )}
      </div>

      {/* Outflow Parameters */}
      <div className="control-group">
        <h3>Outflow</h3>
        <Toggle
          label="Law"
          options={[
            { value: 'linear', label: 'Linear' },
            { value: 'sqrt', label: 'Sqrt (Torricelli)' },
          ]}
          value={params.outflow.law}
          onChange={(v) => updateOutflow({ law: v as 'linear' | 'sqrt' })}
        />
        {params.outflow.law === 'linear' ? (
          <Slider
            label="k (linear)"
            value={params.outflow.kLin}
            min={PARAM_RANGES.kLin.min}
            max={PARAM_RANGES.kLin.max}
            step={PARAM_RANGES.kLin.step}
            unit="m²/s"
            precision={3}
            onChange={(v) => updateOutflow({ kLin: v })}
          />
        ) : (
          <Slider
            label="k (sqrt)"
            value={params.outflow.kSqrt}
            min={PARAM_RANGES.kSqrt.min}
            max={PARAM_RANGES.kSqrt.max}
            step={PARAM_RANGES.kSqrt.step}
            unit="m^(5/2)/s"
            precision={4}
            onChange={(v) => updateOutflow({ kSqrt: v })}
          />
        )}
      </div>
    </div>
  );
}
