/**
 * BucketFlowPage - Main page component that brings together all the pieces
 */

import { useState } from 'react';
import type { SimulationParams } from './types';
import { DEFAULT_PARAMS } from './constants';
import { useBucketSimulation } from './useBucketSimulation';
import { BucketViz } from '../components/BucketViz';
import { ControlsPanel } from '../components/ControlsPanel';
import { Readouts } from '../components/Readouts';
import { FlowCharts } from '../components/FlowCharts';

export function BucketFlowPage() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  
  const { state, history, status, start, pause, reset } = useBucketSimulation(params);

  return (
    <div className="bucket-flow-page">
      <header className="page-header">
        <h1>Bucket Flow Calculus</h1>
        <p className="subtitle">
          Learn rate of change through flow: <code>dh/dt = (q_in - q_out) / A</code>
        </p>
      </header>

      <main className="main-content">
        <div className="viz-column">
          <section className="bucket-section">
            <BucketViz
              height={state.height}
              hMax={params.bucket.hMax}
              qIn={state.qIn}
              qOut={state.qOut}
              isSpilling={state.isSpilling}
            />
          </section>

          <section className="readouts-section">
            <Readouts state={state} bucketRadius={params.bucket.radius} />
          </section>

          <section className="controls-section">
            <ControlsPanel
              params={params}
              onParamsChange={setParams}
              status={status}
              onStart={start}
              onPause={pause}
              onReset={reset}
            />
          </section>
        </div>

        <div className="charts-column">
          <section className="charts-section">
            <FlowCharts
              history={history}
              hMax={params.bucket.hMax}
              currentTime={state.time}
            />
          </section>
        </div>
      </main>

      <footer className="page-footer">
        <p>
          An educational tool demonstrating calculus concepts through fluid dynamics.
          <br />
          <a href="https://github.com/idealase/bucket-flow-calculus" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
