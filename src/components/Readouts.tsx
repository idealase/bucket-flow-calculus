/**
 * Readouts - Display current simulation values
 */

import type { SimulationState } from '../app/types';
import { flowToLitresPerSecond, calculateArea, volumeToLitres, calculateVolume } from '../app/math';
import { DISPLAY_PRECISION, COLORS } from '../app/constants';

interface ReadoutsProps {
  state: SimulationState;
  bucketRadius: number;
}

interface ReadoutItemProps {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  color?: string;
}

function ReadoutItem({ label, value, unit, highlight, color }: ReadoutItemProps) {
  return (
    <div className={`readout-item ${highlight ? 'highlight' : ''}`}>
      <span className="readout-label">{label}</span>
      <span className="readout-value" style={color ? { color } : undefined}>
        {value}
        <span className="readout-unit">{unit}</span>
      </span>
    </div>
  );
}

export function Readouts({ state, bucketRadius }: ReadoutsProps) {
  const area = calculateArea(bucketRadius);
  const volume = calculateVolume(state.height, area);
  const volumeLitres = volumeToLitres(volume);
  
  // Convert flows to L/s for display
  const qInLs = flowToLitresPerSecond(state.qIn);
  const qOutLs = flowToLitresPerSecond(state.qOut);
  const qNetLs = flowToLitresPerSecond(state.qNet);
  const qSpillLs = flowToLitresPerSecond(state.qSpill);

  return (
    <div className="readouts-panel">
      <div className="readouts-grid">
        <ReadoutItem
          label="Time"
          value={state.time.toFixed(DISPLAY_PRECISION.time)}
          unit="s"
        />
        <ReadoutItem
          label="Height"
          value={state.height.toFixed(DISPLAY_PRECISION.height)}
          unit="m"
        />
        <ReadoutItem
          label="Volume"
          value={volumeLitres.toFixed(DISPLAY_PRECISION.volume)}
          unit="L"
        />
        <ReadoutItem
          label="Inflow"
          value={qInLs.toFixed(DISPLAY_PRECISION.flowRate)}
          unit="L/s"
          color={COLORS.inflow}
        />
        <ReadoutItem
          label="Outflow"
          value={qOutLs.toFixed(DISPLAY_PRECISION.flowRate)}
          unit="L/s"
          color={COLORS.outflow}
        />
        <ReadoutItem
          label="Net Flow"
          value={(qNetLs >= 0 ? '+' : '') + qNetLs.toFixed(DISPLAY_PRECISION.flowRate)}
          unit="L/s"
          color={COLORS.netFlow}
        />
        {state.isSpilling && (
          <ReadoutItem
            label="Spill"
            value={qSpillLs.toFixed(DISPLAY_PRECISION.flowRate)}
            unit="L/s"
            highlight
            color={COLORS.spill}
          />
        )}
      </div>
    </div>
  );
}
