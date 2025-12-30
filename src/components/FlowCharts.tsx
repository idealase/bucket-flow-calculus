/**
 * FlowCharts - D3-powered charts for height and flow rates over time
 */

import { useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { HistoryPoint } from '../app/types';
import { CHART_WINDOW, COLORS } from '../app/constants';
import { flowToLitresPerSecond } from '../app/math';

interface FlowChartsProps {
  history: HistoryPoint[];
  hMax: number;
  currentTime: number;
}

interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
}

function useChartDimensions(
  _aspectRatio = 2
): ChartDimensions {
  const margin = { top: 20, right: 60, bottom: 30, left: 50 };
  
  // Get container width using ResizeObserver would be ideal,
  // but for simplicity, we use a default size
  const width = 400;
  const height = width / _aspectRatio;
  
  return {
    width,
    height,
    margin,
    innerWidth: width - margin.left - margin.right,
    innerHeight: height - margin.top - margin.bottom,
  };
}

interface HeightChartProps {
  history: HistoryPoint[];
  hMax: number;
  currentTime: number;
}

export function HeightChart({ history, hMax, currentTime }: HeightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const dims = useChartDimensions();
  
  // Calculate time range for x-axis
  const timeRange = useMemo(() => {
    const endTime = Math.max(currentTime, CHART_WINDOW);
    const startTime = endTime - CHART_WINDOW;
    return [startTime, endTime] as [number, number];
  }, [currentTime]);
  
  // Filter history to visible range
  const visibleHistory = useMemo(() => {
    return history.filter(
      (p) => p.time >= timeRange[0] - 1 && p.time <= timeRange[1] + 1
    );
  }, [history, timeRange]);
  
  // Create scales
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(timeRange)
      .range([0, dims.innerWidth]);
  }, [timeRange, dims.innerWidth]);
  
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, hMax])
      .range([dims.innerHeight, 0]);
  }, [hMax, dims.innerHeight]);
  
  // Create line generator
  const lineGenerator = useMemo(() => {
    return d3
      .line<HistoryPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.height))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);
  
  // Generate path data
  const pathData = useMemo(() => {
    if (visibleHistory.length < 2) return '';
    return lineGenerator(visibleHistory) || '';
  }, [visibleHistory, lineGenerator]);
  
  // X-axis ticks
  const xTicks = useMemo(() => {
    const ticks = [];
    const step = 5;
    const start = Math.ceil(timeRange[0] / step) * step;
    for (let t = start; t <= timeRange[1]; t += step) {
      ticks.push(t);
    }
    return ticks;
  }, [timeRange]);
  
  // Y-axis ticks
  const yTicks = useMemo(() => {
    return yScale.ticks(5);
  }, [yScale]);

  return (
    <div className="chart-container" ref={containerRef}>
      <h4 className="chart-title">Height h(t)</h4>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        className="chart-svg"
      >
        <g transform={`translate(${dims.margin.left}, ${dims.margin.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={dims.innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke={COLORS.chartGrid}
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Height line */}
          <path
            d={pathData}
            fill="none"
            stroke={COLORS.water.fill}
            strokeWidth={2}
          />
          
          {/* X-axis */}
          <g transform={`translate(0, ${dims.innerHeight})`}>
            <line x1={0} x2={dims.innerWidth} y1={0} y2={0} stroke={COLORS.chartAxis} />
            {xTicks.map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
                <line y1={0} y2={5} stroke={COLORS.chartAxis} />
                <text
                  y={18}
                  textAnchor="middle"
                  fontSize={10}
                  fill={COLORS.chartAxis}
                >
                  {tick}s
                </text>
              </g>
            ))}
          </g>
          
          {/* Y-axis */}
          <g>
            <line x1={0} x2={0} y1={0} y2={dims.innerHeight} stroke={COLORS.chartAxis} />
            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={-5} x2={0} stroke={COLORS.chartAxis} />
                <text
                  x={-8}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize={10}
                  fill={COLORS.chartAxis}
                >
                  {tick.toFixed(2)}
                </text>
              </g>
            ))}
            <text
              transform={`translate(-35, ${dims.innerHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={11}
              fill={COLORS.chartAxis}
            >
              Height (m)
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function FlowChart({ history, currentTime }: { history: HistoryPoint[]; currentTime: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const dims = useChartDimensions();
  
  // Calculate time range for x-axis
  const timeRange = useMemo(() => {
    const endTime = Math.max(currentTime, CHART_WINDOW);
    const startTime = endTime - CHART_WINDOW;
    return [startTime, endTime] as [number, number];
  }, [currentTime]);
  
  // Filter history to visible range
  const visibleHistory = useMemo(() => {
    return history.filter(
      (p) => p.time >= timeRange[0] - 1 && p.time <= timeRange[1] + 1
    );
  }, [history, timeRange]);
  
  // Calculate y-domain based on visible data (in L/s)
  const yDomain = useMemo(() => {
    if (visibleHistory.length === 0) return [0, 5];
    
    const allFlows = visibleHistory.flatMap((p) => [
      flowToLitresPerSecond(p.qIn),
      flowToLitresPerSecond(p.qOut),
      flowToLitresPerSecond(Math.abs(p.qNet)),
    ]);
    
    const maxFlow = Math.max(...allFlows, 1);
    const minFlow = Math.min(...visibleHistory.map(p => flowToLitresPerSecond(p.qNet)), 0);
    
    return [Math.min(minFlow, 0), maxFlow * 1.1];
  }, [visibleHistory]);
  
  // Create scales
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(timeRange)
      .range([0, dims.innerWidth]);
  }, [timeRange, dims.innerWidth]);
  
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(yDomain)
      .range([dims.innerHeight, 0]);
  }, [yDomain, dims.innerHeight]);
  
  // Create line generators for each flow
  const createLineGenerator = (accessor: (d: HistoryPoint) => number) => {
    return d3
      .line<HistoryPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(accessor(d)))
      .curve(d3.curveMonotoneX);
  };
  
  const qInLine = useMemo(() => {
    const gen = createLineGenerator((d) => flowToLitresPerSecond(d.qIn));
    return visibleHistory.length >= 2 ? gen(visibleHistory) || '' : '';
  }, [visibleHistory, xScale, yScale]);
  
  const qOutLine = useMemo(() => {
    const gen = createLineGenerator((d) => flowToLitresPerSecond(d.qOut));
    return visibleHistory.length >= 2 ? gen(visibleHistory) || '' : '';
  }, [visibleHistory, xScale, yScale]);
  
  const qNetLine = useMemo(() => {
    const gen = createLineGenerator((d) => flowToLitresPerSecond(d.qNet));
    return visibleHistory.length >= 2 ? gen(visibleHistory) || '' : '';
  }, [visibleHistory, xScale, yScale]);
  
  // X-axis ticks
  const xTicks = useMemo(() => {
    const ticks = [];
    const step = 5;
    const start = Math.ceil(timeRange[0] / step) * step;
    for (let t = start; t <= timeRange[1]; t += step) {
      ticks.push(t);
    }
    return ticks;
  }, [timeRange]);
  
  // Y-axis ticks
  const yTicks = useMemo(() => {
    return yScale.ticks(5);
  }, [yScale]);
  
  const legendItems = [
    { color: COLORS.inflow, label: 'q_in' },
    { color: COLORS.outflow, label: 'q_out' },
    { color: COLORS.netFlow, label: 'q_net' },
  ];

  return (
    <div className="chart-container" ref={containerRef}>
      <h4 className="chart-title">Flow Rates</h4>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        className="chart-svg"
      >
        <g transform={`translate(${dims.margin.left}, ${dims.margin.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={dims.innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke={COLORS.chartGrid}
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Zero line */}
          {yDomain[0] < 0 && (
            <line
              x1={0}
              x2={dims.innerWidth}
              y1={yScale(0)}
              y2={yScale(0)}
              stroke={COLORS.chartAxis}
              strokeWidth={1}
            />
          )}
          
          {/* Flow lines */}
          <path d={qInLine} fill="none" stroke={COLORS.inflow} strokeWidth={2} />
          <path d={qOutLine} fill="none" stroke={COLORS.outflow} strokeWidth={2} />
          <path d={qNetLine} fill="none" stroke={COLORS.netFlow} strokeWidth={2} strokeDasharray="4,2" />
          
          {/* X-axis */}
          <g transform={`translate(0, ${dims.innerHeight})`}>
            <line x1={0} x2={dims.innerWidth} y1={0} y2={0} stroke={COLORS.chartAxis} />
            {xTicks.map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
                <line y1={0} y2={5} stroke={COLORS.chartAxis} />
                <text
                  y={18}
                  textAnchor="middle"
                  fontSize={10}
                  fill={COLORS.chartAxis}
                >
                  {tick}s
                </text>
              </g>
            ))}
          </g>
          
          {/* Y-axis */}
          <g>
            <line x1={0} x2={0} y1={0} y2={dims.innerHeight} stroke={COLORS.chartAxis} />
            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={-5} x2={0} stroke={COLORS.chartAxis} />
                <text
                  x={-8}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize={10}
                  fill={COLORS.chartAxis}
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            ))}
            <text
              transform={`translate(-35, ${dims.innerHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={11}
              fill={COLORS.chartAxis}
            >
              Flow (L/s)
            </text>
          </g>
          
          {/* Legend */}
          <g transform={`translate(${dims.innerWidth - 70}, 5)`}>
            {legendItems.map((item, i) => (
              <g key={item.label} transform={`translate(0, ${i * 16})`}>
                <line
                  x1={0}
                  x2={20}
                  y1={6}
                  y2={6}
                  stroke={item.color}
                  strokeWidth={2}
                  strokeDasharray={item.label === 'q_net' ? '4,2' : undefined}
                />
                <text x={25} y={10} fontSize={10} fill={COLORS.chartAxis}>
                  {item.label}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

export function FlowCharts({ history, hMax, currentTime }: FlowChartsProps) {
  return (
    <div className="flow-charts">
      <HeightChart history={history} hMax={hMax} currentTime={currentTime} />
      <FlowChart history={history} currentTime={currentTime} />
    </div>
  );
}
