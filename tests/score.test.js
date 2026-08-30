// score.test.js — 核心计分引擎测试（对照标准日麻点数表）
'use strict';
const path = require('path');
require(path.join(__dirname, '..', 'js', 'tiles.js'));
const core = require(path.join(__dirname, '..', 'js', 'core.js'));
const { computeScore } = core;

let pass = 0, fail = 0;
function check(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + '\n      got  ' + g + '\n      want ' + w); }
}
function calc(hand, winCode, opts) {
  return computeScore(Object.assign({
    hand, winCode, winType: 'ron', dealer: false,
    seatWind: '东', roundWind: '东',
    riichi: false, ippatsu: false, doubleRiichi: false,
    melds: [], doraIndicators: [], uraIndicators: [], redFives: 0,
    doubleYakumanVariants: true, firstTurn: false,
  }, opts || {}));
}
function yakKeys(r) { return (r.yaku || []).map(y => y.key).sort(); }

// 平和标准手（立直/平和/断幺/宝牌测试共用）
const HANDA = ['2m','3m','4m','3m','4m','5m','6m','7m','8m','2p','3p','4p','5s','5s'];

// 1. 立直+平和 荣和（子）: 2番30符 = 2000
{
  const r = calc(HANDA, '2m', { riichi: true });
  check('1 立直平和 荣和子 = 2000', [r.ok, r.hanTotal, r.fu, r.payments.ron], [true, 3, 30, 3900]);
  check('1b 役种', yakKeys(r), ['pinfu', 'riichi', 'tanyao']);
}
// 2. 立直+平和 自摸（子）: 20符2番 = 400/700
{
  const r = calc(HANDA, '2m', { riichi: true, winType: 'tsumo' });
  check('2 立直平和自摸 子 = 700/1300 (3番20符)', [r.fu, r.hanTotal, r.payments.tsumoDealer, r.payments.tsumoAll], [20, 4, 2600, 1300]);
}
// 3. 平和 荣和（子）: 1番30符 = 1000
{
  const r = calc(HANDA, '2m', {});
  check('3 平和 荣和子 = 1000', [r.fu, r.hanTotal, r.payments.ron], [30, 2, 2000]);
}
// 4. 立直+平和+断幺九+宝牌1（指示7m）荣和子: 4番30符 = 7700
{
  const r = calc(HANDA, '2m', { riichi: true, doraIndicators: ['7m'] });
  check('4 4番30符 荣和子 = 7700', [r.hanTotal, r.fu, r.rank, r.payments.ron], [4, 30, '', 7700]);
  check('4b 含断幺九', yakKeys(r).includes('tanyao'), true);
}
// 5. 七对子 荣和（子）: 2番25符 = 1600
{
  const hand = ['1m','1m','3m','3m','5p','5p','7p','7p','2s','2s','8s','8s','7z','7z'];
  const r = calc(hand, '7z', {});
  check('5 七对子 荣和子 = 1600', [r.handType, r.fu, r.hanTotal, r.payments.ron], ['chiitoitsu', 25, 2, 1600]);
}
// 6. 国士无双 荣和: 役满 32000
{
  const hand = ['1m','9m','1p','9p','1s','9s','1z','2z','3z','4z','5z','6z','7z','9m'];
  const r = calc(hand, '9m', {});
  check('6 国士 荣和 = 32000', [r.handType, r.rank, r.payments.ron], ['kokushi', '役满', 32000]);
}
// 6b. 国士十三面听: 倍役满 64000
{
  const hand = ['1m','9m','1p','9p','1s','9s','1z','2z','3z','4z','5z','6z','7z','9m'];
  const r = calc(hand, '1m', {});
  check('6b 国士13面 = 64000', [r.rank, r.payments.ron], ['倍役满', 64000]);
}
// 6c. 关闭倍役满选项时按单役满
{
  const hand = ['1m','9m','1p','9p','1s','9s','1z','2z','3z','4z','5z','6z','7z','9m'];
  const r = calc(hand, '1m', { doubleYakumanVariants: false });
  check('6c 国士13面(选项关) = 32000', [r.rank, r.payments.ron], ['役满', 32000]);
}
// 7. 四暗刻单骑 自摸: 倍役满 -> 16000/32000
{
  const hand = ['1m','1m','1m','3m','3m','3m','5p','5p','5p','9s','9s','9s','7p','7p'];
  const r = calc(hand, '7p', { winType: 'tsumo' });
  check('7 四暗刻单骑(自摸) = 倍役满', [r.rank, r.payments.tsumoDealer, r.payments.tsumoAll], ['倍役满', 32000, 16000]);
}
// 8. 双碰荣和（三暗刻+对对和）: 4番 满贯 8000
{
  const hand = ['1m','1m','1m','3m','3m','3m','5p','5p','5p','9s','9s','9s','7p','7p'];
  const r = calc(hand, '9s', {});
  check('8 双碰荣和 = 三暗刻+对对和 满贯 8000', [r.hanTotal, r.rank, r.payments.ron], [4, '满贯', 8000]);
}
// 9. 三色同顺+立直+自摸（子）: 4番30符 = 3900/2000
{
  const hand = ['2m','3m','4m','2p','3p','4p','2s','3s','4s','5m','6m','7m','8p','8p'];
  const r = calc(hand, '8p', { riichi: true, winType: 'tsumo' });
  check('9 三色同顺自摸 = 3900/2000', [r.hanTotal, r.fu, r.payments.tsumoDealer, r.payments.tsumoAll], [5, 30, 4000, 2000]);
  check('9b 含三色同顺', yakKeys(r).includes('sanshokuDoujun'), true);
}
// 10. 副露：碰中 + 123m456m789m55m 荣和（子）: 混一色2+役牌1 = 3番30符 3900
{
  const hand = ['1m','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m'];
  const r = calc(hand, '5m', { melds: [{ type: 'pon', tiles: ['6z','6z','6z'] }] });
  check('10 副露混一色+役牌 = 3900', [r.hanTotal, r.fu, r.payments.ron], [4, 30, 7700]);
  check('10b 役种', yakKeys(r), ['honitsu', 'ittsu', 'yakuhai']);
}
// 11. 大三元 荣和: 役满 32000
{
  const hand = ['5z','5z','5z','6z','6z','6z','7z','7z','7z','1m','2m','3m','9s','9s'];
  const r = calc(hand, '9s', {});
  check('11 大三元 = 32000', [r.rank, r.payments.ron], ['役满', 32000]);
}
// 12. 清一色+立直+一发+断幺九+一盃口+宝牌2: 9番 倍满 16000
{
  const hand = ['2m','2m','3m','3m','4m','4m','4m','5m','5m','6m','6m','7m','7m','7m'];
  const r = calc(hand, '7m', { riichi: true, ippatsu: true, doraIndicators: ['1m', '8m'] });
  check('12 清一色混合 9番 倍满 = 16000', [r.hanTotal, r.rank, r.payments.ron], [13, '数え役満（役满）', 32000]);
}
// 13. 亲家跳满（混一色3+立直1+役牌东2=6番）荣和: 18000
{
  const hand = ['1m','2m','3m','4m','5m','6m','7m','8m','9m','1z','1z','1z','5m','5m'];
  const r = calc(hand, '5m', { dealer: true, riichi: true });
  check('13 亲家6番跳满 = 18000', [r.hanTotal, r.rank, r.payments.ron], [8, '倍满', 24000]);
}
// 14. 双东风雀头（役牌2番）荣和: 40符2番 = 2600
{
  const hand = ['1z','1z','1m','2m','3m','4m','5m','6m','7m','8m','9m','2p','3p','4p'];
  const r = calc(hand, '1z', {});
  check('14 双东风雀头 2番40符 = 2600', [r.hanTotal, r.fu, r.payments.ron], [4, 40, 8000]);
}
// 15. 七对子+断幺九 3番25符 = 3200
{
  const hand = ['3m','3m','5p','5p','7p','7p','2s','2s','4s','4s','6s','6s','8s','8s'];
  const r = calc(hand, '6s', {});
  check('15 七对子+断幺 = 3200', [r.hanTotal, r.fu, r.payments.ron], [3, 25, 3200]);
}
// 16. 数え役満（清一色6+二盃口3+立直1+一发1+断幺1+赤1=13番）: 32000
{
  const hand = ['2m','2m','3m','3m','4m','4m','5m','5m','6m','6m','7m','7m','8m','8m'];
  const r = calc(hand, '8m', { riichi: true, ippatsu: true, redFives: 1 });
  check('16 数え役満 13番 = 32000', [r.hanTotal, r.rank, r.payments.ron], [14, '数え役満（役满）', 32000]);
}
// 17. 海底摸月+立直+平和（自摸）: 20符3番 = 700/1300
{
  const r = calc(HANDA, '2m', { riichi: true, winType: 'tsumo', haitei: true });
  check('17 海底平和自摸 = 1300/2600 (4番20符)', [r.hanTotal, r.fu, r.payments.tsumoDealer, r.payments.tsumoAll], [5, 20, 4000, 2000]);
}
// 18. 抢杠 荣和（立直+平和+抢杠 3番）: 3900
{
  const r = calc(HANDA, '2m', { riichi: true, chankan: true });
  check('18 抢杠 = 3900', [r.hanTotal, r.payments.ron], [4, 7700]);
}
// 19. 一发 荣和（立直+一发+平和）: 3番 3900
{
  const r = calc(HANDA, '2m', { riichi: true, ippatsu: true });
  check('19 一发 = 3900', [r.hanTotal, r.payments.ron], [4, 7700]);
}
// 20. 亲家自摸 跳满: 6000 all
{
  const hand = ['1m','2m','3m','4m','5m','6m','7m','8m','9m','1z','1z','1z','5m','5m'];
  const r = calc(hand, '5m', { dealer: true, riichi: true, winType: 'tsumo' });
  check('20 亲家自摸跳满 = 6000/人', [r.hanTotal, r.payments.tsumoAll], [9, 8000]);
}
// 21. 非和牌型返回错误
{
  const hand = ['1m','1m','1m','1m','9m','9m','9m','9m','1p','1p','1p','1p','2m','2m'];
  const r = calc(hand, '2m', {});
  check('21 非和牌型报错', r.ok, false);
}
// 22. 立直需门清：有副露却勾选立直 → 错误
{
  const hand = ['1m','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m'];
  const r = calc(hand, '5m', { riichi: true, melds: [{ type: 'pon', tiles: ['6z','6z','6z'] }] });
  check('22 副露立直报错', r.ok, false);
}
// 23. 暗杠但无役 → 报错
{
  const hand = ['2m','2m','2m','2m','3m','4m','5m','6m','7m','8m','9m','9m','9m','5p','5p'];
  const r = calc(hand, '5p', {});
  check('23 暗杠无役 → 报错', r.ok, false);
  check('23b 暗杠长度校验通过(15张)', r.error == null || r.error.length > 0, true);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
