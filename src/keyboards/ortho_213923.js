import base from './ortho_7414.json';

const legends = {
  q: ['ー', ''], w: ['ま', 'ひ'], e: ['き', 'そ'], r: ['っ', 'ゆ'], t: ['わ', ''],
  y: ['お', ''], u: ['BS', 'む'], i: ['に', 'ほ'], o: ['な', ''], p: ['ね', ''],
  a: ['し', 'よ'], s: ['の', 'ふ'], d: ['か', 'け'], f: ['ん', 'ら'], g: ['る', 'や'],
  h: ['く', 'み'], j: ['う', 'せ'], k: ['い', 'れ'], l: ['と', 'を'], ';': ['て', 'え'],
  z: ['さ', ''], x: ['も', 'へ'], c: ['は', 'め'], v: ['つ', '、'], b: ['こ', ''],
  n: ['あ', ''], m: ['た', '。'], ',': ['す', 'ろ'], '.': ['り', 'ぬ'], '/': ['ち', ''],
};

const keys = base.keys.map((row) => row.map((key) => ({
  ...key,
  legend: legends[key.id] ? [...legends[key.id]] : [...(key.legend || [])],
})));

const symbolLoc = new Map();
for (const [key, [normal, center]] of Object.entries(legends)) {
  if (normal && normal !== 'BS') symbolLoc.set(normal, {key, center: false});
  if (center) symbolLoc.set(center, {key, center: true});
}

function baseEntry(symbol) {
  const loc = symbolLoc.get(symbol);
  if (!loc) throw new Error(`missing base symbol: ${symbol}`);
  const out = {keys: [loc.key], shift: loc.center ? ['center'] : [], type: 'sim', ime: true};
  if (loc.center) out.renzsft = true;
  return out;
}

const leftKeys = new Set(['q','w','e','r','t','a','s','d','f','g','z','x','c','v','b']);

function derivedEntry(baseSymbol, kind) {
  const loc = symbolLoc.get(baseSymbol);
  if (!loc) throw new Error(`missing derived base: ${baseSymbol}`);
  const left = leftKeys.has(loc.key);
  const physicalShift = kind === 'voiced'
    ? (left ? 'j' : 'f')
    : (left ? 'k' : 'd');
  const shift = loc.center ? ['center', physicalShift] : [physicalShift];
  const out = {keys: [loc.key], shift, type: 'sim', ime: true};
  if (loc.center) out.renzsft = true;
  return out;
}

const fixed = {
  キ: 'e', シ: 'r', チ: 'g', ニ: 'c', ヒ: 'a', ミ: 'w', リ: 's', ジ: 'v',
  'ゃ': 'h', 'ゅ': 'o', 'ょ': 'i',
};

function chord(first, second, shift = []) {
  return {keys: [fixed[first], fixed[second]], shift, type: 'sim', ime: true};
}

const conversion = {
  ' ': {keys: ['center'], shift: [], type: 'seq'},
  '　': {keys: ['center'], shift: [], type: 'seq', ime: true},
};

for (const symbol of symbolLoc.keys()) {
  conversion[symbol] = baseEntry(symbol);
}

for (const [symbol, baseSymbol] of Object.entries({
  が:'か', ぎ:'き', ぐ:'く', げ:'け', ご:'こ',
  ざ:'さ', じ:'し', ず:'す', ぜ:'せ', ぞ:'そ',
  だ:'た', ぢ:'ち', づ:'つ', で:'て', ど:'と',
  ば:'は', び:'ひ', ぶ:'ふ', べ:'へ', ぼ:'ほ',
})) {
  conversion[symbol] = derivedEntry(baseSymbol, 'voiced');
}

for (const [symbol, baseSymbol] of Object.entries({
  ぱ:'は', ぴ:'ひ', ぷ:'ふ', ぺ:'へ', ぽ:'ほ',
})) {
  conversion[symbol] = derivedEntry(baseSymbol, 'second');
}

for (const [stem, first] of [['き','キ'], ['し','シ'], ['ち','チ'], ['に','ニ'], ['ひ','ヒ'], ['み','ミ'], ['り','リ']]) {
  for (const [small, second] of [['ゃ','ゃ'], ['ゅ','ゅ'], ['ょ','ょ']]) {
    conversion[stem + small] = chord(first, second);
  }
}

for (const [stem, first] of [['ぎ','キ'], ['び','ヒ']]) {
  for (const [small, second] of [['ゃ','ゃ'], ['ゅ','ゅ'], ['ょ','ょ']]) {
    conversion[stem + small] = chord(first, second, ['f']);
  }
}

for (const [small, second] of [['ゃ','ゃ'], ['ゅ','ゅ'], ['ょ','ょ']]) {
  conversion['じ' + small] = chord('ジ', second);
  conversion['ぴ' + small] = chord('ヒ', second, ['d']);
}

export default {
  ...base,
  name: '213.923版',
  remark: '9009を局所仕上げした213.922767候補。す/き配置を修正し、Center「や」を右小指下段から左インナーホームへ移動。optimizerの現行mora resolverと同じ濁音・半濁音・拗音規則でkeyboard_analyzer用conversionを再構成。',
  keys,
  arpeggio: [],
  conversion,
};
