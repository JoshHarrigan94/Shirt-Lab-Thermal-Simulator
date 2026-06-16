import { summarizeValidation } from './calibrationModel.js';

const KEY = 'shirtlab.validation.records.v1';

export function loadValidationRecords() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveValidationRecord(record) {
  const records = [record, ...loadValidationRecords()].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(records));
  return records;
}

export function clearValidationRecords() {
  localStorage.removeItem(KEY);
  return [];
}

export function exportValidationJSON() {
  const records = loadValidationRecords();
  return JSON.stringify({ exportedAt: new Date().toISOString(), summary: summarizeValidation(records), records }, null, 2);
}
