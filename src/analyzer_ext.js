import * as base from './analyzer.js';

export const hankaku = base.hankaku;
export const eisuHankaku = base.eisuHankaku;
export const kanaToHira = base.kanaToHira;
export const conv_aozora = base.conv_aozora;
export const conv_kana = base.conv_kana;
export const numKanji = base.numKanji;
export const numEisu = base.numEisu;

function resetRoleCounts(keyboard) {
  for (const key of keyboard.keys.flat()) {
    key.target_count = 0;
    key.shift_role_count = 0;
    key.target_value = 0;
    key.shift_role_value = 0;
  }
}

function findConversion(text, index, conversion) {
  for (let len = 3; len > 0; len--) {
    const raw = text.substr(index, len);
    if (raw in conversion) {
      return { combo: conversion[raw], length: len };
    }
    const half = base.hankaku(raw);
    if (half in conversion) {
      return { combo: conversion[half], length: len };
    }
  }
  return null;
}

function addTarget(keydic, id) {
  if (keydic[id]) keydic[id].target_count++;
}

function addShiftRole(keydic, id) {
  if (keydic[id]) keydic[id].shift_role_count++;
}

function countOneAction(combo, keyboard, keydic, heldShift) {
  const keys = combo.keys || [];
  const shifts = combo.shift || [];

  // Explicit shift representation used by Logos / 179.747 / ordinary Shift.
  if (shifts.length > 0) {
    for (const id of keys) addTarget(keydic, id);
    for (const id of shifts) {
      if (!(combo.renzsft && heldShift.includes(id))) {
        addShiftRole(keydic, id);
      }
    }
    return [...shifts];
  }

  // Some layouts (notably 新下駄) encode a simultaneous shift as the
  // first member of keys[].  Only keys explicitly listed by the layout are
  // treated as modifier roles; other simultaneous chords remain targets.
  if (
    combo.type === 'sim' &&
    keys.length > 1 &&
    Array.isArray(keyboard.chordShiftKeys) &&
    keyboard.chordShiftKeys.includes(keys[0])
  ) {
    addShiftRole(keydic, keys[0]);
    for (const id of keys.slice(1)) addTarget(keydic, id);
  } else {
    for (const id of keys) addTarget(keydic, id);
  }

  return [];
}

function annotateRoleCounts(text, keyboard) {
  resetRoleCounts(keyboard);
  const keydic = Object.fromEntries(keyboard.keys.flat().map((key) => [key.id, key]));
  let heldShift = [];

  for (let i = 0; i < text.length; i++) {
    const found = findConversion(text, i, keyboard.conversion);
    if (!found) continue;

    const combo = found.combo;
    if (combo.type === 'seq' && (combo.keys || []).length > 1) {
      for (const id of combo.keys) {
        heldShift = countOneAction({ ...combo, keys: [id] }, keyboard, keydic, heldShift);
      }
    } else {
      heldShift = countOneAction(combo, keyboard, keydic, heldShift);
    }

    i += found.length - 1;
  }

  let maxTarget = 0;
  let maxShiftRole = 0;
  for (const key of keyboard.keys.flat()) {
    maxTarget = Math.max(maxTarget, key.target_count);
    maxShiftRole = Math.max(maxShiftRole, key.shift_role_count);
  }
  for (const key of keyboard.keys.flat()) {
    key.target_value = maxTarget > 0 ? key.target_count / maxTarget : 0;
    key.shift_role_value = maxShiftRole > 0 ? key.shift_role_count / maxShiftRole : 0;
  }
}

export function analyzeKeyboard(text, keyboard) {
  const result = base.analyzeKeyboard(text, keyboard);
  annotateRoleCounts(text, keyboard);
  return result;
}
