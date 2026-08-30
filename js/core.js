// core.js — 日麻点数计算核心引擎（依赖 tiles.js）
'use strict';

/* ==================== 役种目录（同时供役种一览页使用） ==================== */
const YAKU_CATALOG = [
  { key: 'riichi', name: '立直', hanClosed: 1, hanOpen: null, menzen: true, desc: '门清听牌后宣言立直（需付1000点棒）', example: '任意门清听牌形' },
  { key: 'doubleRiichi', name: '双重立直', hanClosed: 2, hanOpen: null, menzen: true, desc: '在自己第一巡且无人鸣牌时立直', example: '任意门清听牌形' },
  { key: 'ippatsu', name: '一发', hanClosed: 1, hanOpen: null, menzen: true, desc: '立直后一巡内和了，期间无人吃碰杠', example: '立直 + 一发' },
  { key: 'menzenTsumo', name: '门前清自摸和', hanClosed: 1, hanOpen: null, menzen: true, desc: '门清状态下自摸和牌', example: '任意门清自摸' },
  { key: 'pinfu', name: '平和', hanClosed: 1, hanOpen: null, menzen: true, desc: '4组顺子 + 非役牌雀头 + 两面听牌（自摸20符/荣和30符）', example: '234m 456m 789m 234p 55s' },
  { key: 'tanyao', name: '断幺九', hanClosed: 1, hanOpen: 1, menzen: false, desc: '全部由 2-8 的数牌组成', example: '234m 345p 456s 678m 55p' },
  { key: 'iipeikou', name: '一杯口', hanClosed: 1, hanOpen: null, menzen: true, desc: '门清：有两组完全相同的顺子', example: '234m 234m 567p 678s 88m' },
  { key: 'yakuhai', name: '役牌', hanClosed: 1, hanOpen: 1, menzen: false, desc: '白/发/中任一或自风、场风做雀头，每种 1 番（双风雀头计 2 番；七对子不计役牌）', example: '白白白 + 任意顺子' },
  { key: 'rinshan', name: '岭上开花', hanClosed: 1, hanOpen: 1, menzen: false, desc: '杠后补牌自摸和牌', example: '任意杠后自摸' },
  { key: 'chankan', name: '抢杠', hanClosed: 1, hanOpen: 1, menzen: false, desc: '荣和他人加杠的牌', example: '任意荣和' },
  { key: 'haitei', name: '海底摸月', hanClosed: 1, hanOpen: 1, menzen: false, desc: '最后一张牌自摸和牌', example: '任意自摸' },
  { key: 'houtei', name: '河底捞鱼', hanClosed: 1, hanOpen: 1, menzen: false, desc: '最后一张牌荣和和牌', example: '任意荣和' },
  { key: 'sanshokuDoujun', name: '三色同顺', hanClosed: 2, hanOpen: 1, menzen: false, desc: '万/筒/索三个花色有相同数字的三组顺子', example: '234m 234p 234s' },
  { key: 'ittsu', name: '一气通贯', hanClosed: 2, hanOpen: 1, menzen: false, desc: '同花色有 123、456、789 三组顺子', example: '123m 456m 789m' },
  { key: 'chanta', name: '混全带幺九', hanClosed: 2, hanOpen: 1, menzen: false, desc: '所有面子与雀头都包含幺九牌（允许字牌）', example: '123m 789p 123s 111z 99s' },
  { key: 'chiitoitsu', name: '七对子', hanClosed: 2, hanOpen: null, menzen: true, desc: '7 组对子（固定 25 符；四种相同牌不构成七对子）', example: '11m 33m 55p 77p 22s 88s 中中' },
  { key: 'toitoi', name: '对对和', hanClosed: 2, hanOpen: 2, menzen: false, desc: '4 组刻子或杠子', example: '111m 333s 555p 999m 77s' },
  { key: 'sanankou', name: '三暗刻', hanClosed: 2, hanOpen: 2, menzen: false, desc: '3 组暗刻（自摸形成的刻子也算暗刻）', example: '111m 333m 555p 678s 77p' },
  { key: 'sankantsu', name: '三杠子', hanClosed: 2, hanOpen: 2, menzen: false, desc: '3 组杠子', example: '明杠×2 + 暗杠' },
  { key: 'shousangen', name: '小三元', hanClosed: 2, hanOpen: 2, menzen: false, desc: '白/发/中其中两组做刻子，一组做雀头', example: '白白白 发发发 中中' },
  { key: 'honroutou', name: '混老头', hanClosed: 2, hanOpen: 2, menzen: false, desc: '只由幺九数牌与字牌组成', example: '111m 999p 999s 东东东 中中' },
  { key: 'sanshokuDoukou', name: '三色同刻', hanClosed: 2, hanOpen: 2, menzen: false, desc: '万/筒/索有相同数字的三组刻子', example: '555m 555p 555s' },
  { key: 'honitsu', name: '混一色', hanClosed: 3, hanOpen: 2, menzen: false, desc: '一种数牌花色 + 字牌', example: '123m 456m 789m 中中中 东东' },
  { key: 'junchan', name: '纯全带幺九', hanClosed: 3, hanOpen: 2, menzen: false, desc: '所有面子与雀头都包含幺九数牌（不含字牌）', example: '123m 789p 111s 123s 99m' },
  { key: 'ryanpeikou', name: '二杯口', hanClosed: 3, hanOpen: null, menzen: true, desc: '两组完全相同的顺子各出现两次', example: '234m 234m 567p 567p 88s' },
  { key: 'chinitsu', name: '清一色', hanClosed: 6, hanOpen: 5, menzen: false, desc: '只由一种数牌花色组成', example: '123m 345m 567m 789m 55m' },
  { key: 'kokushi', name: '国士无双', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '13 种幺九牌各 1 张 + 其中一种 1 对（必为门清）', example: '1m9m 1p9p 1s9s 东南西北白发中' },
  { key: 'kokushi13', name: '国士无双十三面听', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 2, desc: '13 张幺九牌全齐后任意一张和了（多数规则按倍役满）', example: '13 种幺九牌 + 任意幺九和了' },
  { key: 'suuankou', name: '四暗刻', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '4 组暗刻（荣和时仅单骑听牌成立）', example: '111m 333m 555p 999s 77p' },
  { key: 'suuankouTanki', name: '四暗刻单骑', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 2, desc: '4 组暗刻 + 单骑雀头和了（多数规则按倍役满）', example: '111m 333m 555p 999s 7p（单骑和）' },
  { key: 'daisangen', name: '大三元', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '白/发/中各一组刻子', example: '白白白 发发发 中中中' },
  { key: 'shousuushi', name: '小四喜', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '三组风牌刻子 + 一组风牌雀头', example: '东东东 南南南 西西西 北北' },
  { key: 'daisuushi', name: '大四喜', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 2, desc: '四组风牌刻子', example: '东东东 南南南 西西西 北北北' },
  { key: 'tsuuiisou', name: '字一色', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '全部由字牌组成（七对子形也成立）', example: '东东东 南南南 西西 白白白 中中中' },
  { key: 'ryuuiisou', name: '绿一色', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '只由绿色的索子（23468s）与发组成（需一般形）', example: '234s 234s 666s 88s 发发发' },
  { key: 'chinroutou', name: '清老头', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '只由 1、9 数牌组成（需一般形）', example: '111m 999m 111s 999p 11m' },
  { key: 'chuuren', name: '九莲宝灯', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '门清清一色：1112345678999 + 同花色任意一张和了', example: '111m 2345678m 999m + 任意 m' },
  { key: 'chuurenJunsei', name: '纯正九莲宝灯', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 2, desc: '以 1112345678999 的九面听形和了（多数规则按倍役满）', example: '111m 2345678m 999m 任意和了' },
  { key: 'suukantsu', name: '四杠子', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '四组杠子', example: '杠×4' },
  { key: 'tenhou', name: '天和', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '庄家第一巡自摸', example: '庄家第一巡自摸' },
  { key: 'chiihou', name: '地和', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '闲家第一巡自摸（庄家未鸣牌）', example: '闲家第一巡自摸' },
  { key: 'renhou', name: '人和', hanClosed: 13, hanOpen: null, kind: 'yakuman', units: 1, desc: '闲家第一巡荣和（部分规则按满贯，本站按役满）', example: '闲家第一巡荣和' },
];
const YAKU_DEFS = Object.fromEntries(YAKU_CATALOG.map(y => [y.key, y]));

const WIND_LIST = ['东', '南', '西', '北'];

/* ==================== 基础工具 ==================== */
function countMap(codes) {
  const m = new Map();
  codes.forEach(c => m.set(c, (m.get(c) || 0) + 1));
  return m;
}
function hasN(counts, code, n) { return (counts.get(code) || 0) >= n; }
function isYakuhaiTile(t, seatWindName, roundWindName) {
  if (t.honor >= 5) return true;
  return t.honor === (WIND_LIST.indexOf(seatWindName) + 1) || t.honor === (WIND_LIST.indexOf(roundWindName) + 1);
}

/* ==================== 手牌分解 ==================== */
// 将暗牌分解为 targetGroups 组面子（含可能的暗杠）+ 1 组雀头，返回所有可行解（每组含 type 与 codes）
function decomposeHidden(codes, targetGroups) {
  targetGroups = targetGroups === undefined ? 4 : targetGroups;
  if (targetGroups < 0 || targetGroups > 4) return [];
  const counts = countMap(codes);
  const results = [];
  const groups = []; // 只存面子（顺子/刻子/杠子）
  let pairCodes = null;
  function rec(pairUsed) {
    let first = null;
    for (const [c, n] of counts) { if (n > 0) { first = c; break; } }
    if (first === null) {
      if (groups.length === targetGroups && pairUsed) {
        const sol = groups.map(g => ({ type: g.type, codes: g.codes.slice() }));
        sol.push({ type: 'pair', codes: pairCodes.slice() });
        results.push(sol);
      }
      return;
    }
    const t = parseTile(first);
    const pushGroup = (type, nTake) => {
      groups.push({ type: type, codes: Array(nTake).fill(first) });
      counts.set(first, counts.get(first) - nTake);
    };
    const popGroup = (nTake) => {
      groups.pop();
      counts.set(first, counts.get(first) + nTake);
    };
    if (!pairUsed && hasN(counts, first, 2)) {
      pairCodes = [first, first];
      counts.set(first, counts.get(first) - 2);
      rec(true);
      counts.set(first, counts.get(first) + 2);
      pairCodes = null;
    }
    if (hasN(counts, first, 3)) { pushGroup('triplet', 3); rec(pairUsed); popGroup(3); }
    if (hasN(counts, first, 4)) { pushGroup('quad', 4); rec(pairUsed); popGroup(4); }
    if (t.suit !== 'z' && t.rank <= 7
      && hasN(counts, (t.rank + 1) + t.suit, 1)
      && hasN(counts, (t.rank + 2) + t.suit, 1)) {
      const c1 = (t.rank + 1) + t.suit, c2 = (t.rank + 2) + t.suit;
      groups.push({ type: 'seq', codes: [first, c1, c2].sort() });
      counts.set(first, counts.get(first) - 1);
      counts.set(c1, counts.get(c1) - 1);
      counts.set(c2, counts.get(c2) - 1);
      rec(pairUsed);
      groups.pop();
      counts.set(first, counts.get(first) + 1);
      counts.set(c1, counts.get(c1) + 1);
      counts.set(c2, counts.get(c2) + 1);
    }
  }
  rec(false);
  return results;
}

function isChiitoitsu(codes) {
  if (codes.length !== 14) return false;
  const counts = countMap(codes);
  return [...counts.values()].every(n => n === 2);
}
function isKokushi(codes) {
  if (codes.length !== 14) return false;
  const orphans = ['1m','9m','1p','9p','1s','9s','1z','2z','3z','4z','5z','6z','7z'];
  const counts = countMap(codes);
  let dup = 0;
  for (const o of orphans) {
    const n = counts.get(o) || 0;
    if (n === 0 || n > 2) return false;
    if (n === 2) dup++;
  }
  return dup === 1;
}

/* ==================== 待牌判定 ==================== */
function waitOf(winCode, group) {
  if (group.type === 'pair') return 'tanki';
  if (group.type === 'triplet' || group.type === 'quad') return 'shanpon';
  const others = group.codes.filter(c => c !== winCode);
  if (others.length !== 2) return 'none';
  const a = parseTile(others[0]), b = parseTile(others[1]);
  if (a.suit !== b.suit) return 'none';
  const d = Math.abs(a.rank - b.rank);
  if (d === 2) return 'kanchan';
  if (d === 1) {
    const lo = Math.min(a.rank, b.rank);
    if (lo === 1 || lo === 8) return 'penchan';
    return 'ryanmen';
  }
  return 'none';
}

/* ==================== 暗刻计数 ==================== */
// 荣和时，和了牌完成的刻子按明刻处理（三暗刻/四暗刻判定同理）
function ankoCount(groups, winCode, winType) {
  let n = 0;
  for (const g of groups) {
    if (g.type === 'quad') { if (g.closed) n++; continue; }
    if (g.type === 'triplet') {
      const hasWin = g.codes.includes(winCode);
      if (hasWin && winType === 'ron') continue;
      n++;
    }
  }
  return n;
}

/* ==================== 宝牌计数 ==================== */
function countDora(codes, indicators) {
  let n = 0;
  for (const ind of indicators) {
    const d = doraOf(parseTile(ind));
    n += codes.filter(c => c === d.code).length;
  }
  return n;
}

/* ==================== 符数计算 ==================== */
function computeFu(ctx) {
  // ctx: { groups, pair, winCode, winType, concealed, pinfu, seatWindName, roundWindName, wait }
  const parts = [];
  let fu = 20;
  parts.push(['基本符', 20]);
  const groups = ctx.groups;
  const pair = ctx.pair;
  const winGroup = [...groups, pair].find(g => g.codes.includes(ctx.winCode));
  const wait = ctx.wait || waitOf(ctx.winCode, winGroup);

  // 门清荣和 +10（平和荣和同样是 30 符）
  if (ctx.winType === 'ron' && ctx.concealed) { fu += 10; parts.push(['门清荣和', 10]); }
  // 自摸 +2（平和自摸保持 20 符）
  if (ctx.winType === 'tsumo' && !ctx.pinfu) { fu += 2; parts.push(['自摸', 2]); }
  if (wait === 'tanki') { fu += 2; parts.push(['单骑听牌', 2]); }
  else if (wait === 'kanchan') { fu += 2; parts.push(['坎张听牌', 2]); }
  else if (wait === 'penchan') { fu += 2; parts.push(['边张听牌', 2]); }

  const pairTile = parseTile(pair.codes[0]);
  if (isYakuhaiTile(pairTile, ctx.seatWindName, ctx.roundWindName)) {
    const isSeat = pairTile.honor === (WIND_LIST.indexOf(ctx.seatWindName) + 1);
    const isRound = pairTile.honor === (WIND_LIST.indexOf(ctx.roundWindName) + 1);
    const isDoubleWind = isSeat && isRound && pairTile.honor < 5;
    const f = isDoubleWind ? 4 : 2;
    fu += f;
    parts.push(['役牌雀头' + (isDoubleWind ? '（双风）' : ''), f]);
  }

  for (const g of groups) {
    const t = parseTile(g.codes[0]);
    const terminal = t.suit === 'z' || t.rank === 1 || t.rank === 9;
    if (g.type === 'seq') continue;
    if (g.type === 'triplet') {
      const winIn = g.codes.includes(ctx.winCode);
      const anko = g.closed && !(winIn && ctx.winType === 'ron');
      const f = anko ? (terminal ? 8 : 4) : (terminal ? 4 : 2);
      fu += f;
      parts.push([(anko ? '暗刻' : '明刻') + (terminal ? '（幺九/字牌）' : ''), f]);
    }
    if (g.type === 'quad') {
      const f = g.closed ? (terminal ? 32 : 16) : (terminal ? 16 : 8);
      fu += f;
      parts.push([(g.closed ? '暗杠' : '明杠') + (terminal ? '（幺九/字牌）' : ''), f]);
    }
  }

  if (!ctx.pinfu && fu < 30) { fu = 30; parts.push(['最低符数（非平和）', 30]); }
  const rounded = Math.ceil(fu / 10) * 10;
  parts.push(['符数切上（取整到10）', rounded]);
  return { fu: rounded, parts: parts };
}

/* ==================== 常规役种判定 ==================== */
function detectNormalYaku(ctx) {
  // ctx: { groups, pair, wait, concealed(door), winType, allCodes, seatWindName, roundWindName, settings, ankoCount }
  const yaku = [];
  const groups = ctx.groups;
  const pair = ctx.pair;
  const pairTile = pair ? parseTile(pair.codes[0]) : null;
  const wait = ctx.wait;

  if (ctx.settings.doubleRiichi) yaku.push({ key: 'doubleRiichi', name: '双重立直', han: 2 });
  else if (ctx.settings.riichi) yaku.push({ key: 'riichi', name: '立直', han: 1 });
  if (ctx.settings.riichi && ctx.settings.ippatsu) yaku.push({ key: 'ippatsu', name: '一发', han: 1 });
  if (ctx.concealed && ctx.winType === 'tsumo') yaku.push({ key: 'menzenTsumo', name: '门前清自摸和', han: 1 });
  if (ctx.settings.rinshan && ctx.winType === 'tsumo') yaku.push({ key: 'rinshan', name: '岭上开花', han: 1 });
  if (ctx.settings.chankan && ctx.winType === 'ron') yaku.push({ key: 'chankan', name: '抢杠', han: 1 });
  if (ctx.settings.haitei && ctx.winType === 'tsumo') yaku.push({ key: 'haitei', name: '海底摸月', han: 1 });
  if (ctx.settings.houtei && ctx.winType === 'ron') yaku.push({ key: 'houtei', name: '河底捞鱼', han: 1 });

  const pinfu = ctx.concealed && groups.length === 4 && groups.every(g => g.type === 'seq') && (!pairTile || !isYakuhaiTile(pairTile, ctx.seatWindName, ctx.roundWindName)) && wait === 'ryanmen';
  if (pinfu) yaku.push({ key: 'pinfu', name: '平和', han: 1 });

  if (ctx.allCodes.every(c => { const t = parseTile(c); return t.suit !== 'z' && t.rank >= 2 && t.rank <= 8; })) {
    yaku.push({ key: 'tanyao', name: '断幺九', han: 1 });
  }

  if (ctx.concealed) {
    const seqs = groups.filter(g => g.type === 'seq');
    const sigCount = {};
    seqs.forEach(g => { const s = g.codes.join(''); sigCount[s] = (sigCount[s] || 0) + 1; });
    const dupN = Object.values(sigCount).filter(n => n >= 2).length;
    if (dupN >= 2) yaku.push({ key: 'ryanpeikou', name: '二杯口', han: 3 });
    else if (dupN === 1) yaku.push({ key: 'iipeikou', name: '一杯口', han: 1 });
  }

  const seatIdx = WIND_LIST.indexOf(ctx.seatWindName) + 1;
  const roundIdx = WIND_LIST.indexOf(ctx.roundWindName) + 1;
  for (const g of groups) {
    if (g.type !== 'triplet' && g.type !== 'quad') continue;
    const h = parseTile(g.codes[0]).honor;
    if (h >= 5) yaku.push({ key: 'yakuhai', name: '役牌（' + HONOR_NAMES[h - 1] + '）', han: 1 });
    if (h === seatIdx) yaku.push({ key: 'yakuhai', name: '役牌（自风' + ctx.seatWindName + '）', han: 1 });
    if (h === roundIdx) yaku.push({ key: 'yakuhai', name: '役牌（场风' + ctx.roundWindName + '）', han: 1 });
  }
  if (pairTile) {
    if (pairTile.honor >= 5) yaku.push({ key: 'yakuhai', name: '役牌（' + HONOR_NAMES[pairTile.honor - 1] + '）', han: 1 });
    if (pairTile.honor === seatIdx) yaku.push({ key: 'yakuhai', name: '役牌（自风' + ctx.seatWindName + '）', han: 1 });
    if (pairTile.honor === roundIdx) yaku.push({ key: 'yakuhai', name: '役牌（场风' + ctx.roundWindName + '）', han: 1 });
  }

  // 三色同顺 / 一气通贯
  const seqsAll = groups.filter(g => g.type === 'seq');
  const seqBySuit = { m: [], p: [], s: [] };
  seqsAll.forEach(g => { const t = parseTile(g.codes[0]); seqBySuit[t.suit].push(String(t.rank) + String(t.rank + 1) + String(t.rank + 2)); });
  const commonSeq = seqBySuit.m.filter(x => seqBySuit.p.includes(x) && seqBySuit.s.includes(x));
  if (commonSeq.length > 0) yaku.push({ key: 'sanshokuDoujun', name: '三色同顺', han: ctx.concealed ? 2 : 1 });
  for (const s of ['m', 'p', 's']) {
    if (seqBySuit[s].includes('123') && seqBySuit[s].includes('456') && seqBySuit[s].includes('789')) {
      yaku.push({ key: 'ittsu', name: '一气通贯', han: ctx.concealed ? 2 : 1 });
    }
  }

  // 三色同刻 / 对对和 / 三暗刻 / 三杠子 / 小三元
  const trips = groups.filter(g => g.type === 'triplet' || g.type === 'quad');
  const tripBySuit = { m: [], p: [], s: [] };
  trips.forEach(g => { const t = parseTile(g.codes[0]); if (t.suit !== 'z') tripBySuit[t.suit].push(String(t.rank)); });
  const commonTrip = tripBySuit.m.filter(x => tripBySuit.p.includes(x) && tripBySuit.s.includes(x));
  if (commonTrip.length > 0) yaku.push({ key: 'sanshokuDoukou', name: '三色同刻', han: 2 });

  if (groups.every(g => g.type === 'triplet' || g.type === 'quad')) yaku.push({ key: 'toitoi', name: '对对和', han: 2 });
  if (ctx.ankoCount >= 3) yaku.push({ key: 'sanankou', name: '三暗刻', han: 2 });
  const kanCount = groups.filter(g => g.type === 'quad').length;
  if (kanCount >= 3) yaku.push({ key: 'sankantsu', name: '三杠子', han: 2 });

  const dragonTrips = trips.filter(g => parseTile(g.codes[0]).honor >= 5);
  if (dragonTrips.length === 2 && pairTile && pairTile.honor >= 5) yaku.push({ key: 'shousangen', name: '小三元', han: 2 });

  // 混老头
  if (ctx.allCodes.every(c => isTerminalHonor(parseTile(c)))) yaku.push({ key: 'honroutou', name: '混老头', han: 2 });

  // 混一色 / 清一色
  const suitsUsed = {};
  ctx.allCodes.forEach(c => { suitsUsed[parseTile(c).suit] = true; });
  const suitKeys = Object.keys(suitsUsed);
  if (!suitsUsed.z && suitKeys.length === 1) yaku.push({ key: 'chinitsu', name: '清一色', han: ctx.concealed ? 6 : 5 });
  else if (suitsUsed.z && suitKeys.length === 2) yaku.push({ key: 'honitsu', name: '混一色', han: ctx.concealed ? 3 : 2 });

  // 混全带幺九 / 纯全带幺九
  const allGroups = pair ? groups.concat([pair]) : groups.slice();
  const everyGroupHasTH = allGroups.every(g => g.codes.some(c => isTerminalHonor(parseTile(c))));
  const everyTileTH = ctx.allCodes.every(c => isTerminalHonor(parseTile(c)));
  const hasHonorTile = ctx.allCodes.some(c => isHonor(parseTile(c)));
  if (everyGroupHasTH && !everyTileTH) yaku.push({ key: 'chanta', name: '混全带幺九', han: ctx.concealed ? 2 : 1 });
  if (!hasHonorTile && !everyTileTH && allGroups.every(g => g.codes.some(c => isTerminal(parseTile(c))))) {
    yaku.push({ key: 'junchan', name: '纯全带幺九', han: ctx.concealed ? 3 : 2 });
  }

  return yaku;
}

// 七对子适用的内容役白名单
const CHIITOITSU_YAKU_KEYS = new Set(['riichi','doubleRiichi','ippatsu','menzenTsumo','rinshan','chankan','haitei','houtei','tanyao','honroutou','honitsu','chinitsu']);

/* ==================== 役满判定 ==================== */
function detectYakuman(ctx) {
  // ctx: { handType, groups, pair, concealed, winCode, winType, allCodes, dealer, settings }
  const yakuman = [];
  const groups = ctx.groups || [];
  const pair = ctx.pair || null;

  if (ctx.handType === 'kokushi') {
    const winN = countMap(ctx.allCodes).get(ctx.winCode) || 0;
    if (winN === 1 && ctx.settings.doubleYakumanVariants) yakuman.push({ key: 'kokushi13', name: '国士无双十三面听', units: 2 });
    else yakuman.push({ key: 'kokushi', name: '国士无双', units: 1 });
  }

  if (ctx.handType === 'standard' && groups.length > 0) {
    const trips = groups.filter(g => g.type === 'triplet' || g.type === 'quad');
    const pairTile = pair ? parseTile(pair.codes[0]) : null;
    const windTrips = trips.filter(g => { const h = parseTile(g.codes[0]).honor; return h >= 1 && h <= 4; });
    const dragonTrips = trips.filter(g => parseTile(g.codes[0]).honor >= 5);
    const winInPair = pair ? pair.codes.includes(ctx.winCode) : false;

    if (ctx.ankoCount === 4) {
      if (winInPair && ctx.settings.doubleYakumanVariants) yakuman.push({ key: 'suuankouTanki', name: '四暗刻单骑', units: 2 });
      else yakuman.push({ key: 'suuankou', name: '四暗刻', units: 1 });
    }
    if (dragonTrips.length === 3) yakuman.push({ key: 'daisangen', name: '大三元', units: 1 });
    if (windTrips.length === 4) yakuman.push({ key: 'daisuushi', name: '大四喜', units: 2 });
    else if (windTrips.length === 3 && pairTile && pairTile.honor >= 1 && pairTile.honor <= 4) {
      yakuman.push({ key: 'shousuushi', name: '小四喜', units: 1 });
    }
    const kanN = groups.filter(g => g.type === 'quad').length;
    if (kanN === 4) yakuman.push({ key: 'suukantsu', name: '四杠子', units: 1 });
  }

  // 内容型役满
  const all = ctx.allCodes;
  if (all.every(c => isHonor(parseTile(c)))) yakuman.push({ key: 'tsuuiisou', name: '字一色', units: 1 });
  const greenSet = new Set(['2s', '3s', '4s', '6s', '8s', '6z']);
  if (ctx.handType === 'standard' && all.every(c => greenSet.has(c))) yakuman.push({ key: 'ryuuiisou', name: '绿一色', units: 1 });
  if (ctx.handType === 'standard' && all.every(c => isTerminal(parseTile(c)))) yakuman.push({ key: 'chinroutou', name: '清老头', units: 1 });

  // 九莲宝灯（门清一色）
  if (ctx.concealed && ctx.handType === 'standard') {
    const suitsUsed = {};
    all.forEach(c => { suitsUsed[parseTile(c).suit] = true; });
    const keys = Object.keys(suitsUsed);
    if (keys.length === 1 && keys[0] !== 'z') {
      const counts = countMap(all);
      let ok = true;
      for (let r = 1; r <= 9; r++) {
        const n = counts.get(r + keys[0]) || 0;
        if ((r === 1 || r === 9) && n < 3) ok = false;
        if (r >= 2 && r <= 8 && n < 1) ok = false;
      }
      if (ok) {
        const preCounts = countMap(all);
        preCounts.set(ctx.winCode, preCounts.get(ctx.winCode) - 1);
        let junsei = true;
        for (let r = 1; r <= 9; r++) {
          const n = preCounts.get(r + keys[0]) || 0;
          if ((r === 1 || r === 9) && n !== 3) junsei = false;
          if (r >= 2 && r <= 8 && n !== 1) junsei = false;
        }
        if (junsei) yakuman.push({ key: 'chuurenJunsei', name: '纯正九莲宝灯', units: 2 });
        else yakuman.push({ key: 'chuuren', name: '九莲宝灯', units: 1 });
      }
    }
  }

  // 天和 / 地和 / 人和
  if (ctx.settings.firstTurn) {
    if (ctx.dealer && ctx.winType === 'tsumo') yakuman.push({ key: 'tenhou', name: '天和', units: 1 });
    else if (!ctx.dealer && ctx.winType === 'tsumo') yakuman.push({ key: 'chiihou', name: '地和', units: 1 });
    else if (!ctx.dealer && ctx.winType === 'ron') yakuman.push({ key: 'renhou', name: '人和', units: 1 });
  }

  if (yakuman.length === 0) return null;
  return { units: yakuman.reduce((s, y) => s + y.units, 0), names: yakuman };
}

/* ==================== 点数计算 ==================== */
function betterThan(a, b) {
  return (a.hanTotal || 0) > (b.hanTotal || 0)
    || ((a.hanTotal || 0) === (b.hanTotal || 0) && (a.fu || 0) > (b.fu || 0));
}

function scorePayment(ctx) {
  const han = ctx.hanTotal;
  const fu = ctx.fu || 0;
  let base, rank;
  if (han >= 13) { base = 8000; rank = '数え役満（役满）'; }
  else if (han >= 11) { base = 6000; rank = '三倍满'; }
  else if (han >= 8) { base = 4000; rank = '倍满'; }
  else if (han >= 6) { base = 3000; rank = '跳满'; }
  else {
    const raw = fu * Math.pow(2, han + 2);
    if (raw >= 2000) { base = 2000; rank = '满贯'; }
    else { base = raw; rank = ''; }
  }
  const r100 = x => Math.ceil(x / 100) * 100;
  let payments;
  if (ctx.dealer) {
    payments = { ron: r100(base * 6), tsumoAll: r100(base * 2), label: '亲家（庄家）' };
  } else {
    payments = { ron: r100(base * 4), tsumoDealer: r100(base * 2), tsumoAll: r100(base), label: '闲家' };
  }
  ctx.base = base; ctx.rank = rank; ctx.payments = payments; ctx.score = payments;
  return { base, rank, payments };
}

function scoreYakuman(ctx, yakuman) {
  const base = 8000 * yakuman.units;
  const rank = yakuman.units >= 3 ? yakuman.units + '倍役满' : yakuman.units === 2 ? '倍役满' : '役满';
  const r100 = x => Math.ceil(x / 100) * 100;
  let payments;
  if (ctx.dealer) {
    payments = { ron: r100(base * 6), tsumoAll: r100(base * 2), label: '亲家（庄家）' };
  } else {
    payments = { ron: r100(base * 4), tsumoDealer: r100(base * 2), tsumoAll: r100(base), label: '闲家' };
  }
  ctx.base = base; ctx.rank = rank; ctx.payments = payments; ctx.score = payments;
  ctx.hanTotal = yakuman.units; ctx.hanYaku = yakuman.units; ctx.fu = null; ctx.fuParts = null;
  return { base, rank, payments };
}

/* ==================== 主入口 ==================== */
function computeScore(settings) {
  const err = (msg) => ({ ok: false, error: msg });
  const hand = settings.hand || [];
  const melds = (settings.melds || []).map(m => {
    const t = parseTile(m.tiles[0]);
    const isTerm = t.suit === 'z' || t.rank === 1 || t.rank === 9;
    if (m.type === 'chi') return { type: 'seq', codes: m.tiles.slice().sort(), open: true, closed: false };
    if (m.type === 'pon') return { type: 'triplet', codes: m.tiles.slice(), open: true, closed: false, terminal: isTerm };
    if (m.type === 'minkan') return { type: 'quad', codes: m.tiles.slice(), open: true, closed: false, terminal: isTerm };
    return { type: 'quad', codes: m.tiles.slice(), open: false, closed: true, terminal: isTerm }; // ankan
  });
  const concealed = melds.length === 0;

  // 暗牌数量校验：14 − 3×副露数（暗杠在暗牌中不占额外明副露，但总数要加 1）
  const hiddenQuads = hand.filter(c => (countMap(hand).get(c) || 0) >= 4);
  const kanTypes = new Set();
  hand.forEach(c => { if ((countMap(hand).get(c) || 0) >= 4) kanTypes.add(c); });
  const extraKan = kanTypes.size; // 暗牌中的杠子数
  const meldKans = melds.filter(m => m.type === 'quad').length;
  const expectedLen = 14 + extraKan + meldKans - 3 * melds.length;
  if (hand.length !== expectedLen) {
    return err('暗牌数量应为 ' + expectedLen + ' 张，当前为 ' + hand.length + ' 张。' + (melds.length ? '请检查副露设置。' : ''));
  }
  if (hand.length === 0) return err('请先添加手牌。');

  const allCodes = hand.concat(melds.flatMap(m => m.codes));
  const cnt = countMap(allCodes);
  for (const [c, n] of cnt) if (n > 4) return err('同种牌最多 4 张（' + c + ' 出现 ' + n + ' 张）。');

  if (!hand.includes(settings.winCode)) return err('和了牌必须位于暗牌中。');
  const winType = settings.winType || 'ron';
  const isRiichi = !!(settings.riichi || settings.doubleRiichi);
  if (isRiichi && !concealed) return err('立直/双重立直要求门清（无副露）。');

  const seatWindName = settings.seatWind || '东';
  const roundWindName = settings.roundWind || '东';
  const dealer = !!settings.dealer;
  const doraIndicators = settings.doraIndicators || [];
  const uraIndicators = settings.uraIndicators || [];

  const baseCtx = {
    settings, concealed, allCodes, winCode: settings.winCode, winType: winType, dealer,
    seatWindName, roundWindName, doraIndicators, uraIndicators,
  };

  const candidates = [];
  const handType = concealed ? (isKokushi(hand) ? 'kokushi' : isChiitoitsu(hand) ? 'chiitoitsu' : 'standard') : 'standard';
  if (handType === 'kokushi') candidates.push({ handType: 'kokushi', groups: [], pair: null, solution: null });
  if (handType === 'chiitoitsu') candidates.push({ handType: 'chiitoitsu', groups: [], pair: null, solution: null });
  if (handType !== 'kokushi') {
    const target = 4 - melds.length;
    const decomps = decomposeHidden(hand.slice().sort(), target);
    for (const sol of decomps) {
      const grp = sol.filter(g => g.type !== 'pair');
      const pair = sol.find(g => g.type === 'pair');
      const groups = grp.map(g => ({ ...g, open: false, closed: true })).concat(melds);
      candidates.push({ handType: 'standard', groups, pair, solution: sol });
    }
  }
  if (candidates.length === 0) return err('不是可和牌型：无法分解为 4 组面子 + 雀头（或七对子/国士无双）。');

  let best = null;
  for (const cand of candidates) {
    const ctx = Object.assign({}, baseCtx, { handType: cand.handType, groups: cand.groups, pair: cand.pair, solution: cand.solution });

    if (ctx.handType === 'kokushi') {
      const yakuman = detectYakuman(ctx);
      scoreYakuman(ctx, yakuman);
      best = pickBest(best, ctx);
      continue;
    }
    if (ctx.handType === 'chiitoitsu') {
      const yakuman = detectYakuman(ctx);
      if (yakuman) { scoreYakuman(ctx, yakuman); best = pickBest(best, ctx); continue; }
      ctx.wait = 'tanki';
      ctx.ankoCount = 0;
      const yaku = detectNormalYaku(ctx).filter(y => CHIITOITSU_YAKU_KEYS.has(y.key));
      yaku.push({ key: 'chiitoitsu', name: '七对子', han: 2 });
      ctx.yaku = yaku;
      ctx.fu = 25;
      ctx.fuParts = [['七对子固定符数', 25]];
      ctx.hanYaku = yaku.reduce((s, y) => s + y.han, 0);
      ctx.doraHan = countDora(allCodes, doraIndicators);
      ctx.uraHan = (concealed && isRiichi) ? countDora(allCodes, uraIndicators) : 0;
      ctx.redHan = settings.redFives || 0;
      ctx.hanTotal = ctx.hanYaku + ctx.doraHan + ctx.uraHan + ctx.redHan;
      scorePayment(ctx);
      best = pickBest(best, ctx);
      continue;
    }
    // standard（包括副露形）
    if (ctx.groups.length === 0) continue;
    const winGroup = [...ctx.groups, ctx.pair].find(g => g.codes.includes(ctx.winCode));
    if (!winGroup) continue;
    ctx.wait = waitOf(ctx.winCode, winGroup);
    ctx.ankoCount = ankoCount(ctx.groups, ctx.winCode, ctx.winType);

    const yakuman = detectYakuman(ctx);
    if (yakuman) { scoreYakuman(ctx, yakuman); best = pickBest(best, ctx); continue; }

    const yaku = detectNormalYaku(ctx);
    ctx.yaku = yaku;
    ctx.pinfu = !!yaku.find(y => y.key === 'pinfu');
    const fuCalc = computeFu(ctx);
    ctx.fu = fuCalc.fu;
    ctx.fuParts = fuCalc.parts;
    ctx.hanYaku = yaku.reduce((s, y) => s + y.han, 0);
    ctx.doraHan = countDora(allCodes, doraIndicators);
    ctx.uraHan = (concealed && isRiichi) ? countDora(allCodes, uraIndicators) : 0;
    ctx.redHan = settings.redFives || 0;
    ctx.hanTotal = ctx.hanYaku + ctx.doraHan + ctx.uraHan + ctx.redHan;
    scorePayment(ctx);
    best = pickBest(best, ctx);
  }

  if (best && !best.yakuman && best.hanYaku === 0) return err('没有可成立的役种（无役，宝牌不计役），不能和牌。请检查是否漏选了立直/门清自摸等。');
  if (!best) return err('不是可和牌型：无法分解为 4 组面子 + 雀头（或七对子/国士无双）。');

  return {
    ok: true,
    handType: best.handType,
    yaku: best.yaku || [],
    yakuman: best.yakuman || null,
    doraHan: best.doraHan, uraHan: best.uraHan, redHan: best.redHan,
    hanYaku: best.hanYaku, hanTotal: best.hanTotal,
    fu: best.fu, fuParts: best.fuParts,
    wait: best.wait, ankoCount: best.ankoCount,
    groups: best.groups || [], pair: best.pair || null,
    base: best.base, rank: best.rank, payments: best.payments,
    concealed: concealed,
    winType: winType, winCode: settings.winCode,
  };
}

function pickBest(best, ctx) {
  if (!best || betterThan(ctx, best)) return ctx;
  return best;
}

/* ==================== Node 导出（测试用） ==================== */
if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, { YAKU_CATALOG, YAKU_DEFS, decomposeHidden, isChiitoitsu, isKokushi, waitOf, ankoCount, countDora, computeFu, detectNormalYaku, detectYakuman, computeScore, scorePayment, scoreYakuman, WIND_LIST });
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { YAKU_CATALOG, YAKU_DEFS, decomposeHidden, isChiitoitsu, isKokushi, waitOf, ankoCount, countDora, computeFu, detectNormalYaku, detectYakuman, computeScore, scorePayment, scoreYakuman, WIND_LIST };
}
