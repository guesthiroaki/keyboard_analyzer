import base from './jis_shingeta.json';

const byId = Object.fromEntries(base.keys.flat().map((key) => [key.id, key]));

// OCRしやすいよう、文字キーだけをJISの段ズレなしで左詰め表示する。
// 解析自体は base.keys をそのまま使うので、Space・英数・制御キーの変換は維持される。
const displayIds = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const displayKeys = displayIds.map((row) => row.map((id) => byId[id]));

export default {
  ...base,
  name: '新下駄',
  remark: `${base.remark || ''} 文字キーはOCRしやすい格子表示。`,
  displayKeys,
  // 新下駄の変換表では同時押しシフトが keys[] の先頭に入る。
  // S/D/K/L は中指・薬指ホームのシフト、I/O は拗音系セレクタとして扱う。
  chordShiftKeys: ['s', 'd', 'k', 'l', 'i', 'o'],
};
