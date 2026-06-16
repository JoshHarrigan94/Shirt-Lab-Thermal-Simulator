import { materials, fits, perforations, activities, defaultState } from './data.js';
import { compare } from './simulation.js';

const $ = id => document.getElementById(id);

export class UIController {
  constructor(scene) {
    this.scene = scene;
    this.state = { ...defaultState };
    this.result = null;
    this.initSelect('activity', activities);
    this.initSelect('materialA', materials);
    this.initSelect('materialB', materials);
    this.initSelect('fitA', fits);
    this.initSelect('fitB', fits);
    this.initSelect('patternA', perforations);
    this.initSelect('patternB', perforations);
    this.initRanges();
    this.initEvents();
    this.render();
  }

  initSelect(id, options) {
    const el = $(id);
    Object.entries(options).forEach(([key, value]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = value.label;
      el.appendChild(opt);
    });
    el.value = this.state[id];
  }

  initRanges() {
    ['effort', 'sweat', 'temp', 'humidity', 'wind', 'sun'].forEach(id => {
      $(id).value = this.state[id];
    });
    this.updateLabels();
  }

  initEvents() {
    document.querySelectorAll('select,input').forEach(el => {
      el.addEventListener('input', () => {
        const value = el.type === 'range' ? Number(el.value) : el.value;
        this.state[el.id] = value;
        this.updateLabels();
        this.run();
      });
    });
    $('runBtn').addEventListener('click', () => this.run());
    $('resetBtn').addEventListener('click', () => this.reset());
    document.querySelectorAll('.view-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.view = btn.dataset.view;
        this.renderLegend();
        if (this.result) this.scene.update(this.result, this.state.view);
      });
    });
  }

  updateLabels() {
    $('effortValue').textContent = this.state.effort;
    $('sweatValue').textContent = this.state.sweat;
    $('tempValue').textContent = `${this.state.temp}°C`;
    $('humidityValue').textContent = `${this.state.humidity}%`;
    $('windValue').textContent = `${this.state.wind} km/h`;
    $('sunValue').textContent = this.state.sun;
  }

  reset() {
    this.state = { ...defaultState };
    Object.keys(this.state).forEach(key => {
      const el = $(key);
      if (el) el.value = this.state[key];
    });
    this.updateLabels();
    this.run();
  }

  run() {
    this.result = compare(this.state);
    this.render();
    this.scene.update(this.result, this.state.view);
  }

  render() {
    if (!this.result) this.result = compare(this.state);
    const { a, b, winner, gap, claimCheck, valueWinner, interpretation } = this.result;
    $('winner').textContent = `Shirt ${winner}`;
    $('coolingGap').textContent = `${gap} pts`;
    $('claimCheck').textContent = claimCheck;
    $('valueView').textContent = `Shirt ${valueWinner}`;
    $('interpretation').textContent = interpretation;
    this.renderZoneTable(a, b);
    this.renderReadout(a, b);
    this.renderLegend();
  }

  renderZoneTable(a, b) {
    const rows = a.zones.map((az, idx) => {
      const bz = b.zones[idx];
      const diff = (az.comfortScore - bz.comfortScore).toFixed(1);
      return `<div class="table-row">
        <span>${az.label}</span>
        <span>${az.comfortScore}</span>
        <span>${bz.comfortScore}</span>
        <strong class="${diff >= 0 ? 'pos' : 'neg'}">${diff >= 0 ? '+' : ''}${diff}</strong>
      </div>`;
    }).join('');
    $('zoneTable').innerHTML = `<div class="table-head"><span>Zone</span><span>A</span><span>B</span><span>Δ</span></div>${rows}`;
  }

  renderReadout(a, b) {
    $('physicsReadout').innerHTML = `
      <div><span>Shirt A</span><strong>${a.name}</strong></div>
      <div><span>Thermal comfort</span><strong>${a.thermalComfort}</strong></div>
      <div><span>Airflow score</span><strong>${a.airflowScore}</strong></div>
      <div><span>Moisture score</span><strong>${a.moistureScore}</strong></div>
      <div><span>Value score</span><strong>${a.valueScore}</strong></div>
      <hr />
      <div><span>Shirt B</span><strong>${b.name}</strong></div>
      <div><span>Thermal comfort</span><strong>${b.thermalComfort}</strong></div>
      <div><span>Airflow score</span><strong>${b.airflowScore}</strong></div>
      <div><span>Moisture score</span><strong>${b.moistureScore}</strong></div>
      <div><span>Value score</span><strong>${b.valueScore}</strong></div>
      <hr />
      <div><span>Apparent wind</span><strong>${a.apparentWind} km/h</strong></div>
      <div><span>Heat load</span><strong>${a.heatLoad}</strong></div>
    `;
  }

  renderLegend() {
    const labels = {
      thermal: ['Cooler', 'Warmer'],
      airflow: ['Lower airflow', 'Higher airflow'],
      moisture: ['Dryer fabric', 'Wetter fabric'],
      perforation: ['Closed fabric', 'More open area']
    }[this.state.view];
    $('legend').innerHTML = `<span>${labels[0]}</span><div class="gradient ${this.state.view}"></div><span>${labels[1]}</span>`;
  }
}
