import { calculateZones, aggregateScore } from '../simulation/thermalModel';
import { useSimStore } from '../simulation/store';

export function ResultsPanel() {
  const state = useSimStore();
  const zones = calculateZones(state);
  const score = aggregateScore(zones);
  return <aside className="panel results">
    <h2>Performance readout</h2>
    <Metric name="Comfort" value={score.comfort} invert={false}/>
    <Metric name="Heat load" value={score.heat} invert/>
    <Metric name="Moisture retention" value={score.moisture} invert/>
    <Metric name="Airflow" value={score.airflow} invert={false}/>
    <h3>Zonal behaviour</h3>
    <div className="zones">
      {zones.map(z => <div className="zone" key={z.zone}>
        <b>{z.zone}</b><span>Heat {pct(z.heat)} · Air {pct(z.airflow)} · Wet {pct(z.moisture)}</span>
      </div>)}
    </div>
    <p className="note">Prototype model: heuristic thermal + moisture approximation, not validated CFD.</p>
  </aside>
}

function Metric({name, value}: {name:string; value:number; invert?: boolean}) {
  return <div className="metric"><div><span>{name}</span><b>{pct(value)}</b></div><progress max={1} value={Math.min(1, value)} /></div>
}
function pct(n:number) { return `${Math.round(n * 100)}%`; }
