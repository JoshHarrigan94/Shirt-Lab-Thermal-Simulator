import { materials } from '../materials/materialPresets.js';
import { fits } from '../garment/fitPresets.js';
import { perforations } from '../perforation/perforationPresets.js';
import { activities } from '../environment/activityPresets.js';
import { defaultState } from '../app/defaultState.js';
import { compare } from '../comparison/compareShirts.js';
import { scenarios } from '../comparison/scenarios.js';
import { validationProtocols, buildValidationRecord, summarizeValidation, loadValidationRecords, saveValidationRecord, clearValidationRecords, exportValidationJSON } from '../validation/index.js';

const $ = id => document.getElementById(id);

export class UIController {
  constructor(scene) {
    this.scene = scene;
    this.state = { ...defaultState };
    this.result = null;
    this.initSelect('scenario', scenarios);
    this.initSelect('activity', activities);
    this.initSelect('materialA', materials);
    this.initSelect('materialB', materials);
    this.initSelect('materialC', materials);
    this.initSelect('fitA', fits);
    this.initSelect('fitB', fits);
    this.initSelect('fitC', fits);
    this.initSelect('patternA', perforations);
    this.initSelect('patternB', perforations);
    this.initSelect('patternC', perforations);
    this.initSelect('validationProtocol', validationProtocols);
    this.initRanges();
    this.validationRecords = loadValidationRecords();
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
        if (el.id === 'scenario') this.applyScenario(value);
        this.updateLabels();
        this.run();
      });
    });
    $('runBtn').addEventListener('click', () => this.run());
    $('resetBtn').addEventListener('click', () => this.reset());
    $('saveValidationBtn')?.addEventListener('click', () => this.saveValidation());
    $('clearValidationBtn')?.addEventListener('click', () => this.clearValidation());
    $('exportValidationBtn')?.addEventListener('click', () => this.exportValidation());
    document.querySelectorAll('.view-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.view = btn.dataset.view;
        this.renderLegend();
        if (this.result) this.scene.update(this.result, this.state.view);
      });
    });
    document.querySelectorAll('.camera-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.camera-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.scene.setCameraPreset(btn.dataset.camera);
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
    if ($('scenarioDescription')) {
      $('scenarioDescription').textContent = scenarios[this.state.scenario]?.description || 'Custom manual scenario.';
    }
  }

  applyScenario(key) {
    const scenario = scenarios[key];
    if (!scenario) return;
    this.state = { ...this.state, ...scenario.patch, scenario: key };
    Object.entries(scenario.patch).forEach(([controlId, value]) => {
      const el = $(controlId);
      if (el) el.value = value;
    });
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
    const { a, b, c, winner, gap, claimCheck, valueWinner, interpretation, cards, shirts } = this.result;
    $('winner').textContent = `Shirt ${winner}`;
    $('coolingGap').textContent = `${gap} pts`; // overall decision gap
    $('claimCheck').textContent = claimCheck;
    $('valueView').textContent = `Shirt ${valueWinner}`;
    $('interpretation').textContent = interpretation;
    this.renderRankingCards(cards);
    this.renderScoreBreakdown(shirts);
    this.renderZoneTable(a, b, c);
    this.renderReadout(a, b, c);
    this.renderLegend();
    this.renderValidation();
  }

  renderRankingCards(cards) {
    $('rankingCards').innerHTML = cards.map(card => `
      <div class="rank-card rank-${card.rank}">
        <div class="rank-header"><span>#${card.rank} · Shirt ${card.slot}</span><strong>${card.overall}</strong></div>
        <p>${card.name}</p>
        <div class="mini-grid">
          <span>Cooling <b>${card.cooling}</b></span>
          <span>Sweat <b>${card.sweat}</b></span>
          <span>Safety <b>${card.safety}</b></span>
          <span>Value <b>${card.value}</b></span>
        </div>
        <small><b>Strength:</b> ${card.strengths}</small>
        <small><b>Risk:</b> ${card.risks}</small>
      </div>
    `).join('');
  }

  renderScoreBreakdown(shirts) {
    const rows = shirts.map(shirt => `
      <div class="table-row score-row">
        <span>Shirt ${shirt.slot}</span>
        <span>${shirt.decision.overall}</span>
        <span>${shirt.decision.coolingDuringEffort}</span>
        <span>${shirt.decision.sweatManagement}</span>
        <span>${shirt.decision.thermalSafety}</span>
        <span>${shirt.decision.value}</span>
      </div>
    `).join('');
    $('scoreBreakdown').innerHTML = `<div class="table-head score-row"><span>Shirt</span><span>Overall</span><span>Cooling</span><span>Sweat</span><span>Safety</span><span>Value</span></div>${rows}`;
  }

  renderZoneTable(a, b, c) {
    const rows = a.zones.map((az, idx) => {
      const bz = b.zones[idx];
      const cz = c.zones[idx];
      const best = [{...az, slot: 'A'}, {...bz, slot: 'B'}, {...cz, slot: 'C'}].sort((x, y) => y.comfortScore - x.comfortScore)[0];
      return `<div class="table-row zone-row-3">
        <span>${az.label}</span>
        <span>${az.comfortScore}</span>
        <span>${bz.comfortScore}</span>
        <span>${cz.comfortScore}</span>
        <strong>Shirt ${best.slot}</strong>
      </div>`;
    }).join('');
    $('zoneTable').innerHTML = `<div class="table-head zone-row-3"><span>Zone</span><span>A</span><span>B</span><span>C</span><span>Best</span></div>${rows}`;
  }

  renderReadout(a, b, c) {
    $('physicsReadout').innerHTML = `
      <div><span>Shirt A</span><strong>${a.name}</strong></div>
      <div><span>Decision / thermal comfort</span><strong>${a.decision.overall} / ${a.thermalComfort}</strong></div>
      <div><span>Airflow score</span><strong>${a.airflowScore}</strong></div>
      <div><span>Moisture score</span><strong>${a.moistureScore}</strong></div>
      <div><span>Value score</span><strong>${a.valueScore}</strong></div>
      <div><span>Surface cells</span><strong>${a.surface.cellCount}</strong></div>
      <div><span>Avg / max open area</span><strong>${a.surface.averageOpenArea}% / ${a.surface.maxOpenArea}%</strong></div>
      <div><span>Estimated holes</span><strong>${a.surface.estimatedHoleCount}</strong></div>
      <div><span>Placement efficiency</span><strong>${a.perforationAnalysis.placementEfficiency}×</strong></div>
      <div><span>Fragility / clog risk</span><strong>${a.perforationAnalysis.fragility}% / ${a.perforationAnalysis.clogRisk}%</strong></div>
      <div><span>Hottest / wettest cell</span><strong>${a.surface.hottestCell} / ${a.surface.wettestCell}</strong></div>
      <div><span>Microclimate / drying half-life</span><strong>${a.surface.avgMicroclimateTemp}°C / ${a.surface.avgDryingHalfLife} min</strong></div>
      <div><span>Convective / evaporative flux</span><strong>${a.physics.avgConvectiveFlux} / ${a.physics.avgEvaporationFlux}</strong></div>
      <div><span>Worst pocket risk</span><strong>${a.surface.worstPocketRisk}%</strong></div>
      <hr />
      <div><span>Shirt B</span><strong>${b.name}</strong></div>
      <div><span>Decision / thermal comfort</span><strong>${b.decision.overall} / ${b.thermalComfort}</strong></div>
      <div><span>Airflow score</span><strong>${b.airflowScore}</strong></div>
      <div><span>Moisture score</span><strong>${b.moistureScore}</strong></div>
      <div><span>Value score</span><strong>${b.valueScore}</strong></div>
      <div><span>Surface cells</span><strong>${b.surface.cellCount}</strong></div>
      <div><span>Avg / max open area</span><strong>${b.surface.averageOpenArea}% / ${b.surface.maxOpenArea}%</strong></div>
      <div><span>Estimated holes</span><strong>${b.surface.estimatedHoleCount}</strong></div>
      <div><span>Placement efficiency</span><strong>${b.perforationAnalysis.placementEfficiency}×</strong></div>
      <div><span>Fragility / clog risk</span><strong>${b.perforationAnalysis.fragility}% / ${b.perforationAnalysis.clogRisk}%</strong></div>
      <div><span>Hottest / wettest cell</span><strong>${b.surface.hottestCell} / ${b.surface.wettestCell}</strong></div>
      <div><span>Microclimate / drying half-life</span><strong>${b.surface.avgMicroclimateTemp}°C / ${b.surface.avgDryingHalfLife} min</strong></div>
      <div><span>Convective / evaporative flux</span><strong>${b.physics.avgConvectiveFlux} / ${b.physics.avgEvaporationFlux}</strong></div>
      <div><span>Worst pocket risk</span><strong>${b.surface.worstPocketRisk}%</strong></div>

      <hr />
      <div><span>Shirt C</span><strong>${c.name}</strong></div>
      <div><span>Decision / thermal comfort</span><strong>${c.decision.overall} / ${c.thermalComfort}</strong></div>
      <div><span>Airflow score</span><strong>${c.airflowScore}</strong></div>
      <div><span>Moisture score</span><strong>${c.moistureScore}</strong></div>
      <div><span>Value score</span><strong>${c.valueScore}</strong></div>
      <div><span>Surface cells</span><strong>${c.surface.cellCount}</strong></div>
      <div><span>Avg / max open area</span><strong>${c.surface.averageOpenArea}% / ${c.surface.maxOpenArea}%</strong></div>
      <div><span>Estimated holes</span><strong>${c.surface.estimatedHoleCount}</strong></div>
      <div><span>Placement efficiency</span><strong>${c.perforationAnalysis.placementEfficiency}×</strong></div>
      <div><span>Fragility / clog risk</span><strong>${c.perforationAnalysis.fragility}% / ${c.perforationAnalysis.clogRisk}%</strong></div>
      <div><span>Hottest / wettest cell</span><strong>${c.surface.hottestCell} / ${c.surface.wettestCell}</strong></div>
      <div><span>Microclimate / drying half-life</span><strong>${c.surface.avgMicroclimateTemp}°C / ${c.surface.avgDryingHalfLife} min</strong></div>
      <div><span>Convective / evaporative flux</span><strong>${c.physics.avgConvectiveFlux} / ${c.physics.avgEvaporationFlux}</strong></div>
      <div><span>Worst pocket risk</span><strong>${c.surface.worstPocketRisk}%</strong></div>
      <hr />
      <div><span>Apparent wind</span><strong>${a.apparentWind} km/h</strong></div>
      <div><span>Heat load</span><strong>${a.heatLoad}</strong></div>
      <div><span>Model credibility</span><strong>${a.credibilityScore}% prototype / needs validation</strong></div>
    `;
  }


  saveValidation() {
    if (!this.result) this.result = compare(this.state);
    const slot = $('validationShirt').value;
    const predicted = this.result.shirts.find(s => s.slot === slot);
    const form = {
      protocol: $('validationProtocol').value,
      shirtSlot: slot,
      dryWeight: $('dryWeight').value,
      wetWeight: $('wetWeight').value,
      dryingMinutes: $('dryingMinutes').value,
      comfortEffort: $('comfortEffort').value,
      comfortRest: $('comfortRest').value,
      cling: $('cling').value,
      perceivedHeat: $('perceivedHeat').value,
      wetness: $('wetness').value,
      notes: $('validationNotes').value
    };
    const record = buildValidationRecord(form, predicted, this.state);
    this.validationRecords = saveValidationRecord(record);
    this.renderValidation();
  }

  clearValidation() {
    this.validationRecords = clearValidationRecords();
    this.renderValidation();
  }

  exportValidation() {
    const data = exportValidationJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shirtlab-validation-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  renderValidation() {
    const summary = summarizeValidation(this.validationRecords || []);
    if ($('validationSummary')) {
      $('validationSummary').innerHTML = `
        <div><span>Logged tests</span><strong>${summary.count}</strong></div>
        <div><span>Avg prediction error</span><strong>${summary.avgError} pts</strong></div>
        <div><span>Mean absolute error</span><strong>${summary.absError || 0} pts</strong></div>
        <div><span>Status</span><strong>${summary.message}</strong></div>
      `;
    }
    if ($('validationLog')) {
      const records = (this.validationRecords || []).slice(0, 5);
      $('validationLog').innerHTML = records.length ? records.map(r => `
        <div class="validation-record">
          <div><strong>${r.shirtName}</strong><span>${new Date(r.createdAt).toLocaleString()} · ${validationProtocols[r.protocol]?.label || r.protocol}</span></div>
          <div class="mini-grid">
            <span>Observed <b>${r.observed.overall}</b></span>
            <span>Predicted <b>${r.predicted.overall}</b></span>
            <span>Error <b>${r.calibration.predictionError}</b></span>
            <span>Confidence <b>${r.calibration.confidence}%</b></span>
          </div>
          <small>${r.calibration.hint}</small>
        </div>
      `).join('') : '<p class="helper-text">No tests logged yet. Add dry/wet shirt weights and comfort scores after a real run.</p>';
    }
  }

  renderLegend() {
    const labels = {
      thermal: ['Cooler', 'Warmer'],
      airflow: ['Lower airflow', 'Higher airflow'],
      moisture: ['Dryer fabric', 'Wetter fabric'],
      perforation: ['Closed fabric', 'More open area'],
      comfort: ['Lower comfort', 'Higher comfort']
    }[this.state.view];
    $('legend').innerHTML = `<span>${labels[0]}</span><div class="gradient ${this.state.view}"></div><span>${labels[1]}</span>`;
  }
}
