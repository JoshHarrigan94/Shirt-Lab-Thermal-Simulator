import { MATERIALS } from '../data/materials';
import { useSimStore } from '../simulation/store';
import type { FitId, PatternId } from '../types/simulation';

const fits: FitId[] = ['compression', 'athletic', 'regular', 'loose', 'baggy'];
const patterns: PatternId[] = ['none', 'mothtech_style', 'spine_vent', 'underarm_focus', 'full_scatter'];

export function Controls() {
  const s = useSimStore();
  return <aside className="panel controls">
    <h1>ShirtLab</h1>
    <p className="lede">3D thermal clothing simulator prototype.</p>

    <label>Material<select value={s.material} onChange={e => s.set('material', e.target.value as any)}>
      {Object.values(MATERIALS).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
    </select></label>

    <label>Fit<select value={s.fit} onChange={e => s.set('fit', e.target.value as FitId)}>
      {fits.map(f => <option key={f} value={f}>{label(f)}</option>)}
    </select></label>

    <label>Perforation pattern<select value={s.pattern} onChange={e => s.set('pattern', e.target.value as PatternId)}>
      {patterns.map(p => <option key={p} value={p}>{label(p)}</option>)}
    </select></label>

    <Slider label="Perforation intensity" value={s.perforationScale} min={0} max={1.5} step={0.05} onChange={v => s.set('perforationScale', v)} />
    <Slider label="Temperature °C" value={s.temperatureC} min={0} max={40} step={1} onChange={v => s.set('temperatureC', v)} />
    <Slider label="Humidity %" value={s.humidityPct} min={10} max={100} step={1} onChange={v => s.set('humidityPct', v)} />
    <Slider label="Wind kph" value={s.windKph} min={0} max={35} step={1} onChange={v => s.set('windKph', v)} />
    <Slider label="Athlete speed kph" value={s.paceKph} min={0} max={28} step={1} onChange={v => s.set('paceKph', v)} />
    <Slider label="Sweat rate" value={s.sweatRate} min={0.1} max={1.4} step={0.01} onChange={v => s.set('sweatRate', v)} />
    <Slider label="Metabolic heat" value={s.metabolicHeat} min={30} max={140} step={1} onChange={v => s.set('metabolicHeat', v)} />
  </aside>
}

function Slider({label, value, min, max, step, onChange}: {label: string; value: number; min: number; max: number; step: number; onChange: (v:number)=>void}) {
  return <label>{label}<div className="sliderRow"><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}/><span>{Number(value).toFixed(step < 1 ? 2 : 0)}</span></div></label>
}

function label(v: string) { return v.split('_').join(' ').replace(/\b\w/g, (c: string) => c.toUpperCase()); }
