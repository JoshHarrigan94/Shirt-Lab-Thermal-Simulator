export const scenarios = {
  temperateTempo: {
    label: 'Temperate tempo run',
    description: 'Moderate UK-style running conditions where fit and sweat handling matter as much as raw ventilation.',
    patch: { activity: 'tempoRun', effort: 7, sweat: 7, temp: 24, humidity: 60, wind: 8, sun: 4 }
  },
  hotDryRace: {
    label: 'Hot dry race',
    description: 'High evaporative potential: perforations, mesh and movement-driven air exchange should shine.',
    patch: { activity: 'race', effort: 9, sweat: 8, temp: 32, humidity: 30, wind: 10, sun: 8 }
  },
  hotHumidStill: {
    label: 'Hot humid still air',
    description: 'Evaporation is suppressed, so simple hole count is less valuable than wet-zone exchange and drying.',
    patch: { activity: 'tempoRun', effort: 8, sweat: 9, temp: 30, humidity: 85, wind: 2, sun: 5 }
  },
  coolWindyWet: {
    label: 'Cool windy wet',
    description: 'High open-area shirts can become liabilities once wet because chill-after-stop risk rises.',
    patch: { activity: 'hike', effort: 6, sweat: 6, temp: 9, humidity: 90, wind: 24, sun: 1 }
  },
  stopStartSession: {
    label: 'Stop-start intervals',
    description: 'Tests whether a shirt cools during effort without becoming cold, clingy or saturated during rest.',
    patch: { activity: 'tempoRun', effort: 8, sweat: 8, temp: 18, humidity: 65, wind: 6, sun: 3 }
  }
};
