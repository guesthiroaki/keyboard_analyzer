import kuromoji from './kuromoji/kuromoji.js';
import {analyzeKeyboard, kanaToHira, conv_aozora, conv_kana, eisuHankaku} from './analyzer_ext.js';
import bridge1177 from './keyboards/ortho_w160_1177.js';
import production9834 from './keyboards/ortho_w160_9834.js';
import conditional1170 from './keyboards/ortho_w160_1170.js';

const candidates = [
  ['1177 bridge', bridge1177],
  ['9834 production', production9834],
  ['1170 conditional', conditional1170],
];

const textEl = document.querySelector('#text');
const skipConvEl = document.querySelector('#skip-conv');
const kanaOnlyEl = document.querySelector('#kana-only');
const aozoraEl = document.querySelector('#aozora');
const runEl = document.querySelector('#run');
const copyEl = document.querySelector('#copy');
const statusEl = document.querySelector('#status');
const tableEl = document.querySelector('#results');
const tbodyEl = tableEl.querySelector('tbody');

let tokenizer = null;
let lastRows = [];

function prepareText(text) {
  const htext = eisuHankaku(text);
  if (skipConvEl.checked) return htext;
  if (!tokenizer) throw new Error('tokenizer is not ready');

  const parsed = tokenizer.tokenize(htext);
  const karray = [];
  for (const pa of parsed) {
    if (pa.pos === '記号') {
      karray.push(pa.surface_form);
    } else if (pa.reading) {
      karray.push(kanaToHira(pa.reading));
    } else {
      karray.push(kanaToHira(pa.surface_form));
    }
  }

  let out = karray.join('');
  if (kanaOnlyEl.checked) out = conv_kana(out);
  if (aozoraEl.checked) out = conv_aozora(out);
  return out;
}

function row(label, result) {
  return {
    candidate: label,
    nKana: result.nKana,
    nUncounted: result.nUncounted,
    nAction: result.nAction,
    nType: result.nType,
    nShift: result.nShift,
    nReShift: result.nReShift,
    nDouyubi: result.nDouyubi,
    nDangoe: result.nDangoe,
    nKougo: result.nKougo,
    nHomeNS: result.nHomeNS,
    left: result.left,
    right: result.right,
    handDiff: Math.abs(result.left - result.right),
  };
}

function render(rows) {
  tbodyEl.replaceChildren();
  for (const r of rows) {
    const tr = document.createElement('tr');
    for (const key of ['candidate','nKana','nUncounted','nAction','nType','nShift','nReShift','nDouyubi','nDangoe','nKougo','nHomeNS','left','right','handDiff']) {
      const td = document.createElement('td');
      td.textContent = r[key];
      tr.appendChild(td);
    }
    tbodyEl.appendChild(tr);
  }
  tableEl.hidden = false;
  copyEl.disabled = false;
}

function toTsv(rows) {
  const fields = ['candidate','nKana','nUncounted','nAction','nType','nShift','nReShift','nDouyubi','nDangoe','nKougo','nHomeNS','left','right','handDiff'];
  return [fields.join('\t'), ...rows.map((r) => fields.map((f) => r[f]).join('\t'))].join('\n') + '\n';
}

runEl.addEventListener('click', () => {
  try {
    statusEl.textContent = '分析中…';
    const prepared = prepareText(textEl.value);
    lastRows = candidates.map(([label, keyboard]) => row(label, analyzeKeyboard(prepared, keyboard)));
    render(lastRows);
    const bad = lastRows.filter((r) => r.nUncounted !== 0);
    statusEl.textContent = bad.length
      ? `完了。ただし未入力あり: ${bad.map((r) => `${r.candidate}=${r.nUncounted}`).join(', ')}`
      : `完了。変換後かな ${lastRows[0]?.nKana ?? 0}、3候補とも未入力0。`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `エラー: ${err.message ?? err}`;
  }
});

copyEl.addEventListener('click', async () => {
  if (!lastRows.length) return;
  await navigator.clipboard.writeText(toTsv(lastRows));
  statusEl.textContent = '比較結果TSVをクリップボードへコピーしました。';
});

kuromoji.builder({dicPath: 'dict'}).build((error, built) => {
  if (error) {
    console.error(error);
    statusEl.textContent = `辞書読み込みエラー: ${error.message ?? error}`;
    return;
  }
  tokenizer = built;
  runEl.disabled = false;
  statusEl.textContent = '準備完了。3候補を同一条件で比較できます。';
});
