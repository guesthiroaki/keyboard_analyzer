import base from './ortho_logos.json';

const keys = base.keys.map((row) => row.map((key) => ({
  ...key,
  legend: [...(key.legend || [])],
})));

const semicolon = keys.flat().find((key) => key.id === ';');
if (semicolon) {
  semicolon.legend = ['し', 'あ', 'も'];
}

const conversion = {
  ...base.conversion,
  'も': { keys: [';'], shift: ['l'], type: 'sim', ime: true },
};

export default {
  ...base,
  name: 'ロゴス配列',
  remark: 'ロゴス配列。D/K=中指同時押しシフト、S/L=薬指同時押しシフト。同じ役割の左右シフトは対称。薬指シフト面の右小指ホームは「も」。H.P.打鍵数(除くシフト)に加え、ヒートマップで文字ターゲット/シフト役を分離表示する。',
  keys,
  conversion,
};
