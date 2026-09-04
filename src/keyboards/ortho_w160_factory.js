import base from './ortho_7414.json';

// Keep the keyboard_analyzer representation aligned with the current
// japanese_corne_30key_qp_ring production model.  In particular, the upper
// outer q/p positions are intentionally struck by the ring fingers.
const fingerOverride = { q: 1, p: 8 };

const leftKeys = new Set(['q','w','e','r','t','a','s','d','f','g','z','x','c','v','b']);

const fixed = {
  キ: 'e', シ: 'r', チ: 'g', ニ: 'c', ヒ: 'a', ミ: 'w', リ: 's', ジ: 'v',
  'ゃ': 'h', 'ゅ': 'o', 'ょ': 'i',
};

function chord(first, second, shift = []) {
  return {keys: [fixed[first], fixed[second]], shift, type: 'sim', ime: true};
}

export default function makeW160Layout({name, remark, legends}) {
  const keys = base.keys.map((row) => row.map((key) => ({
    ...key,
    finger: fingerOverride[key.id] ?? key.finger,
    legend: legends[key.id] ? [...legends[key.id]] : [...(key.legend || [])],
  })));

  const symbolLoc = new Map();
  for (const [key, [normal, center]] of Object.entries(legends)) {
    if (normal && normal !== 'BS') symbolLoc.set(normal, {key, center: false});
    if (center) symbolLoc.set(center, {key, center: true});
  }

  function baseEntry(symbol) {
    const loc = symbolLoc.get(symbol);
    if (!loc) throw new Error(`missing W160 base symbol: ${symbol}`);
    const out = {keys: [loc.key], shift: loc.center ? ['center'] : [], type: 'sim', ime: true};
    if (loc.center) out.renzsft = true;
    return out;
  }

  function derivedEntry(baseSymbol, kind) {
    const loc = symbolLoc.get(baseSymbol);
    if (!loc) throw new Error(`missing W160 derived base: ${baseSymbol}`);
    const left = leftKeys.has(loc.key);
    // production mora_input chooses the physical shift on the hand opposite
    // the primary key: voiced f/j, second d/k.
    const physicalShift = kind === 'voiced'
      ? (left ? 'j' : 'f')
      : (left ? 'k' : 'd');
    const shift = loc.center ? ['center', physicalShift] : [physicalShift];
    const out = {keys: [loc.key], shift, type: 'sim', ime: true};
    if (loc.center) out.renzsft = true;
    return out;
  }

  const conversion = {
    ' ': {keys: ['center'], shift: [], type: 'seq'},
    '　': {keys: ['center'], shift: [], type: 'seq', ime: true},
  };

  for (const symbol of symbolLoc.keys()) conversion[symbol] = baseEntry(symbol);

  for (const [symbol, baseSymbol] of Object.entries({
    が:'か', ぎ:'き', ぐ:'く', げ:'け', ご:'こ',
    ざ:'さ', じ:'し', ず:'す', ぜ:'せ', ぞ:'そ',
    だ:'た', ぢ:'ち', づ:'つ', で:'て', ど:'と',
    ば:'は', び:'ひ', ぶ:'ふ', べ:'へ', ぼ:'ほ',
  })) conversion[symbol] = derivedEntry(baseSymbol, 'voiced');

  for (const [symbol, baseSymbol] of Object.entries({
    ぱ:'は', ぴ:'ひ', ぷ:'ふ', ぺ:'へ', ぽ:'ほ',
  })) conversion[symbol] = derivedEntry(baseSymbol, 'second');

  // Clean youon event keys are fixed physical bindings in production.
  for (const [stem, first] of [['き','キ'], ['し','シ'], ['ち','チ'], ['に','ニ'], ['ひ','ヒ'], ['み','ミ'], ['り','リ']]) {
    for (const [small, second] of [['ゃ','ゃ'], ['ゅ','ゅ'], ['ょ','ょ']]) {
      conversion[stem + small] = chord(first, second);
    }
  }

  // Voiced/semi-voiced youon uses the fixed left-hand physical shift keys.
  for (const [stem, first] of [['ぎ','キ'], ['び','ヒ']]) {
    for (const [small, second] of [['ゃ','ゃ'], ['ゅ','ゅ'], ['ょ','ょ']]) {
      conversion[stem + small] = chord(first, second, ['f']);
    }
  }
  for (const [small, second] of [['ゃ','ゃ'], ['ゅ','ゅ'], ['ょ','ょ']]) {
    conversion['じ' + small] = chord('ジ', second);
    conversion['ぴ' + small] = chord('ヒ', second, ['d']);
  }

  return {
    ...base,
    name,
    remark,
    keys,
    arpeggio: [],
    conversion,
  };
}
