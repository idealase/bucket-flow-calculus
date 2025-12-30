/**
 * BucketViz - SVG visualization of the bucket and water level
 */

import { COLORS } from '../app/constants';

interface BucketVizProps {
  /** Current water height in meters */
  height: number;
  /** Maximum bucket height in meters */
  hMax: number;
  /** Current inflow rate (for visualization) */
  qIn: number;
  /** Current outflow rate (for visualization) */
  qOut: number;
  /** Whether the bucket is currently spilling */
  isSpilling: boolean;
}

export function BucketViz({ height, hMax, qIn, qOut, isSpilling }: BucketVizProps) {
  // Calculate water fill percentage
  const fillPercent = hMax > 0 ? Math.max(0, Math.min(1, height / hMax)) : 0;
  
  // SVG dimensions (viewBox coordinates)
  const viewWidth = 200;
  const viewHeight = 300;
  
  // Bucket dimensions
  const bucketWidth = 120;
  const bucketHeight = 200;
  const bucketX = (viewWidth - bucketWidth) / 2;
  const bucketY = 50;
  
  // Water dimensions
  const waterHeight = bucketHeight * fillPercent;
  const waterY = bucketY + bucketHeight - waterHeight;
  
  // Inflow/outflow visualization scaling
  const maxFlowViz = 0.01; // Max flow for visualization (m³/s)
  const inflowWidth = Math.min(1, qIn / maxFlowViz) * 20 + 4;
  const outflowWidth = Math.min(1, qOut / maxFlowViz) * 15 + 2;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      className="bucket-viz"
      style={{ maxWidth: '100%', height: 'auto' }}
      aria-label={`Bucket visualization. Water level at ${(fillPercent * 100).toFixed(0)}%`}
    >
      {/* Definitions for gradients */}
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.water.surface} />
          <stop offset="10%" stopColor={COLORS.water.fill} />
          <stop offset="100%" stopColor={COLORS.water.fill} />
        </linearGradient>
        <linearGradient id="bucketGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#888" />
          <stop offset="50%" stopColor="#aaa" />
          <stop offset="100%" stopColor="#888" />
        </linearGradient>
      </defs>
      
      {/* Inflow stream (when there's inflow) */}
      {qIn > 0 && (
        <g className="inflow-stream">
          <rect
            x={viewWidth / 2 - inflowWidth / 2}
            y={0}
            width={inflowWidth}
            height={Math.max(waterY, bucketY)}
            fill={COLORS.inflow}
            opacity={0.7}
          />
          {/* Splash effect at water surface */}
          <ellipse
            cx={viewWidth / 2}
            cy={waterY}
            rx={inflowWidth * 0.8}
            ry={4}
            fill={COLORS.water.surface}
            opacity={0.8}
          />
        </g>
      )}
      
      {/* Bucket container (back wall) */}
      <rect
        x={bucketX}
        y={bucketY}
        width={bucketWidth}
        height={bucketHeight}
        fill={COLORS.bucket.fill}
        stroke={COLORS.bucket.stroke}
        strokeWidth={3}
      />
      
      {/* Water */}
      {waterHeight > 0 && (
        <rect
          x={bucketX + 2}
          y={waterY}
          width={bucketWidth - 4}
          height={waterHeight - 2}
          fill="url(#waterGradient)"
        />
      )}
      
      {/* Water surface line */}
      {waterHeight > 0 && (
        <line
          x1={bucketX + 2}
          y1={waterY}
          x2={bucketX + bucketWidth - 2}
          y2={waterY}
          stroke={COLORS.water.surface}
          strokeWidth={3}
        />
      )}
      
      {/* Height markers */}
      {[0.25, 0.5, 0.75, 1].map((mark) => (
        <g key={mark}>
          <line
            x1={bucketX - 8}
            y1={bucketY + bucketHeight * (1 - mark)}
            x2={bucketX}
            y2={bucketY + bucketHeight * (1 - mark)}
            stroke={COLORS.bucket.stroke}
            strokeWidth={1}
          />
          <text
            x={bucketX - 12}
            y={bucketY + bucketHeight * (1 - mark) + 4}
            fontSize={10}
            textAnchor="end"
            fill={COLORS.bucket.stroke}
          >
            {(mark * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      
      {/* Outflow pipe */}
      <rect
        x={viewWidth / 2 - 10}
        y={bucketY + bucketHeight}
        width={20}
        height={15}
        fill={COLORS.bucket.stroke}
      />
      
      {/* Outflow stream (when there's water and outflow) */}
      {qOut > 0 && height > 0 && (
        <rect
          x={viewWidth / 2 - outflowWidth / 2}
          y={bucketY + bucketHeight + 15}
          width={outflowWidth}
          height={viewHeight - bucketY - bucketHeight - 15}
          fill={COLORS.outflow}
          opacity={0.7}
        />
      )}
      
      {/* Spill indicator */}
      {isSpilling && (
        <g className="spill-indicator">
          {/* Left spill */}
          <path
            d={`
              M ${bucketX - 5} ${bucketY}
              Q ${bucketX - 20} ${bucketY + 30} ${bucketX - 15} ${bucketY + 60}
            `}
            stroke={COLORS.spill}
            strokeWidth={4}
            fill="none"
            opacity={0.8}
          />
          {/* Right spill */}
          <path
            d={`
              M ${bucketX + bucketWidth + 5} ${bucketY}
              Q ${bucketX + bucketWidth + 20} ${bucketY + 30} ${bucketX + bucketWidth + 15} ${bucketY + 60}
            `}
            stroke={COLORS.spill}
            strokeWidth={4}
            fill="none"
            opacity={0.8}
          />
          {/* Warning text */}
          <text
            x={viewWidth / 2}
            y={bucketY - 10}
            fontSize={12}
            textAnchor="middle"
            fill={COLORS.spill}
            fontWeight="bold"
          >
            OVERFLOW
          </text>
        </g>
      )}
      
      {/* Bucket side edges (drawn last for layering) */}
      <line
        x1={bucketX}
        y1={bucketY}
        x2={bucketX}
        y2={bucketY + bucketHeight}
        stroke={COLORS.bucket.stroke}
        strokeWidth={4}
      />
      <line
        x1={bucketX + bucketWidth}
        y1={bucketY}
        x2={bucketX + bucketWidth}
        y2={bucketY + bucketHeight}
        stroke={COLORS.bucket.stroke}
        strokeWidth={4}
      />
      
      {/* Bottom */}
      <line
        x1={bucketX}
        y1={bucketY + bucketHeight}
        x2={viewWidth / 2 - 10}
        y2={bucketY + bucketHeight}
        stroke={COLORS.bucket.stroke}
        strokeWidth={4}
      />
      <line
        x1={viewWidth / 2 + 10}
        y1={bucketY + bucketHeight}
        x2={bucketX + bucketWidth}
        y2={bucketY + bucketHeight}
        stroke={COLORS.bucket.stroke}
        strokeWidth={4}
      />
    </svg>
  );
}
