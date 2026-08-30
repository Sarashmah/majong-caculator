// tiles.js — 牌模型与渲染辅助（纯数据，无 DOM 依赖）
'use strict';

// 花色定义
const SUITS = [
  { id: 'm', name: '万子', kanji: '萬' },
  { id: 'p', name: '筒子', kanji: '筒' },
  { id: 's', name: '索子', kanji: '索' },
];

// 字牌（1z=东 2z=南 3z=西 4z=北 5z=白 6z=发 7z=中）
const HONOR_NAMES = ['东', '南', '西', '北', '白', '发', '中'];
const HONOR_TYPES = ['wind', 'wind', 'wind', 'wind', 'dragon', 'dragon', 'dragon'];

// 由代码解析牌：'5m' '1z' 等
function parseTile(code) {
  const num = parseInt(code[0], 10);
  const suit = code[1];
  if (suit === 'z' || suit === 'Z') {
    return { code: num + 'z', suit: 'z', rank: num, honor: num, name: HONOR_NAMES[num - 1], type: HONOR_TYPES[num - 1] };
  }
  const s = suit.toLowerCase();
  const suitDef = SUITS.find(x => x.id === s);
  return { code: num + s, suit: s, rank: num, honor: 0, name: String(num), type: 'suit' };
}

const ALL_TILES = (() => {
  const list = [];
  for (const s of SUITS) for (let r = 1; r <= 9; r++) list.push(parseTile(r + s.id));
  for (let i = 1; i <= 7; i++) list.push(parseTile(i + 'z'));
  return list;
})();

// 是否幺九（数牌1/9 或 字牌）
function isTerminalHonor(t) {
  return t.suit === 'z' || t.rank === 1 || t.rank === 9;
}
function isTerminal(t) { return t.suit !== 'z' && (t.rank === 1 || t.rank === 9); }
function isHonor(t) { return t.suit === 'z'; }
function isSimple(t) { return t.suit !== 'z' && t.rank >= 2 && t.rank <= 8; }

// 宝牌规则：指示牌的后一张（1→2 … 9→1；东→南→西→北；白→发→中）
function doraOf(t) {
  if (t.suit === 'z') {
    if (t.honor <= 4) return parseTile((t.honor % 4) + 1 + 'z');
    return parseTile((t.honor === 5 ? 6 : t.honor === 6 ? 7 : 5) + 'z');
  }
  return parseTile((t.rank % 9) + 1 + t.suit);
}

const WIND_ORDER = ['东', '南', '西', '北'];

// 排序：万→筒→索→字
function tileSortKey(t) {
  const suitOrder = { m: 0, p: 1, s: 2, z: 3 };
  return suitOrder[t.suit] * 10 + t.rank;
}
function sortTiles(tiles) { return [...tiles].sort((a, b) => tileSortKey(a) - tileSortKey(b)); }

function tilesToCodes(tiles) { return tiles.map(t => t.code); }
function codesToTiles(codes) { return codes.map(parseTile); }
function sameTile(a, b) { return a.code === b.code; }

// 在 Node 环境中导出

// 浏览器/Node 通用全局导出
if (typeof globalThis !== 'undefined') {
  globalThis.SUITS = SUITS;
  globalThis.HONOR_NAMES = HONOR_NAMES;
  globalThis.parseTile = parseTile;
  globalThis.ALL_TILES = ALL_TILES;
  globalThis.isTerminalHonor = isTerminalHonor;
  globalThis.isTerminal = isTerminal;
  globalThis.isHonor = isHonor;
  globalThis.isSimple = isSimple;
  globalThis.doraOf = doraOf;
  globalThis.WIND_ORDER = WIND_ORDER;
  globalThis.sortTiles = sortTiles;
  globalThis.tilesToCodes = tilesToCodes;
  globalThis.codesToTiles = codesToTiles;
  globalThis.sameTile = sameTile;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUITS, HONOR_NAMES, parseTile, ALL_TILES, isTerminalHonor, isTerminal, isHonor, isSimple, doraOf, WIND_ORDER, sortTiles, tilesToCodes, codesToTiles, sameTile };
}
