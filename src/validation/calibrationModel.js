import { clamp, round } from '../shared/math.js';

export function buildValidationRecord(form, predictedShirt, state) {
  const dryWeight = Number(form.dryWeight) || 0;
  const wetWeight = Number(form.wetWeight) || 0;
  const dryingMinutes = Number(form.dryingMinutes) || 0;
  const comfortEffort = Number(form.comfortEffort) || 5;
  const comfortRest = Number(form.comfortRest) || 5;
  const cling = Number(form.cling) || 5;
  const perceivedHeat = Number(form.perceivedHeat) || 5;
  const wetness = Number(form.wetness) || 5;
  const weightGain = Math.max(0, wetWeight - dryWeight);
  const weightGainPct = dryWeight > 0 ? round((weightGain / dryWeight) * 100, 1) : 0;

  const observedCooling = clamp((comfortEffort * 8) + ((10 - perceivedHeat) * 4) + ((10 - cling) * 2), 0, 100);
  const observedMoisture = clamp(100 - (wetness * 6) - (cling * 3) - Math.min(weightGainPct, 60) - Math.min(dryingMinutes / 2, 25), 0, 100);
  const observedSafety = clamp((comfortRest * 7) + ((10 - perceivedHeat) * 3) + ((10 - cling) * 2), 0, 100);
  const observedOverall = round((observedCooling * 0.42) + (observedMoisture * 0.34) + (observedSafety * 0.24), 1);
  const predictedOverall = predictedShirt?.decision?.overall ?? predictedShirt?.thermalComfort ?? 0;
  const predictionError = round(observedOverall - predictedOverall, 1);

  return {
    id: crypto?.randomUUID ? crypto.randomUUID() : `test-${Date.now()}`,
    createdAt: new Date().toISOString(),
    protocol: form.protocol,
    shirtSlot: form.shirtSlot,
    shirtName: predictedShirt?.name || `Shirt ${form.shirtSlot}`,
    scenario: state.scenario,
    environment: {
      temp: state.temp,
      humidity: state.humidity,
      wind: state.wind,
      sun: state.sun,
      activity: state.activity,
      effort: state.effort,
      sweat: state.sweat
    },
    observed: {
      dryWeight,
      wetWeight,
      weightGain,
      weightGainPct,
      dryingMinutes,
      comfortEffort,
      comfortRest,
      cling,
      perceivedHeat,
      wetness,
      overall: observedOverall,
      cooling: round(observedCooling, 1),
      moisture: round(observedMoisture, 1),
      safety: round(observedSafety, 1),
      notes: form.notes || ''
    },
    predicted: {
      overall: predictedOverall,
      cooling: predictedShirt?.decision?.coolingDuringEffort ?? predictedShirt?.thermalComfort ?? 0,
      moisture: predictedShirt?.decision?.sweatManagement ?? predictedShirt?.moistureScore ?? 0,
      safety: predictedShirt?.decision?.thermalSafety ?? predictedShirt?.comfort?.thermalSafety ?? 0,
      airflow: predictedShirt?.airflowScore ?? 0,
      avgOpenArea: predictedShirt?.surface?.averageOpenArea ?? 0,
      avgDryingHalfLife: predictedShirt?.surface?.avgDryingHalfLife ?? 0
    },
    calibration: {
      predictionError,
      confidence: calibrationConfidence(dryWeight, wetWeight, dryingMinutes, form.notes),
      hint: calibrationHint(predictionError, weightGainPct, dryingMinutes, perceivedHeat, cling)
    }
  };
}

export function summarizeValidation(records) {
  if (!records.length) {
    return {
      count: 0,
      avgError: 0,
      message: 'No validation tests logged yet. Run a field test to start calibrating the simulator.'
    };
  }
  const avgError = round(records.reduce((sum, r) => sum + r.calibration.predictionError, 0) / records.length, 1);
  const absError = round(records.reduce((sum, r) => sum + Math.abs(r.calibration.predictionError), 0) / records.length, 1);
  const latest = records[0];
  return {
    count: records.length,
    avgError,
    absError,
    latest,
    message: absError <= 8
      ? 'Validation is tightening: prediction error is within a useful prototype range.'
      : 'Validation spread is still high: collect repeated tests under matched conditions before trusting rankings.'
  };
}

function calibrationConfidence(dryWeight, wetWeight, dryingMinutes, notes) {
  let score = 35;
  if (dryWeight > 0 && wetWeight > 0) score += 25;
  if (dryingMinutes > 0) score += 18;
  if ((notes || '').length > 20) score += 8;
  return clamp(score, 0, 92);
}

function calibrationHint(error, weightGainPct, dryingMinutes, perceivedHeat, cling) {
  if (error <= -12) return 'Model may be overrating this setup. Increase penalties for cling, wet weight or poor air-gap exchange.';
  if (error >= 12) return 'Model may be underrating this setup. Increase credit for real-world airflow, comfort feel or drying performance.';
  if (weightGainPct > 35) return 'Wet-weight gain is high. Moisture retention should carry more penalty for this material/pattern.';
  if (dryingMinutes > 45) return 'Drying time is long. Dry-back penalty should be stronger in stop-start conditions.';
  if (perceivedHeat >= 8 || cling >= 8) return 'Subjective heat/cling is high. Comfort model should weight skin-contact discomfort more heavily.';
  return 'Prediction and observation are close enough for prototype calibration.';
}
