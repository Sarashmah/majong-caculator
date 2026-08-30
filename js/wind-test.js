const fs=require('fs');
const tiles=require('D:/Vibecoding/majongcaculator/js/tiles.js');
const core=require('D:/Vibecoding/majongcaculator/js/core.js');
const html=fs.readFileSync('D:/Vibecoding/majongcaculator/index.html','utf8');
function selOpts(id){const m=html.match(new RegExp('id="'+id+'"[^>]*>([\s\S]*?)<\/select>'));if(!m)return null;return [...m[1].matchAll(/<option>([^<]*)<\/option>/g)].map(x=>x[1]);}
console.log('seat-wind options:',JSON.stringify(selOpts('seat-wind')));
console.log('round-wind options:',JSON.stringify(selOpts('round-wind')));
function calc(hand,win,opts){return core.computeScore(Object.assign({hand,winCode:win,winType:'ron',dealer:false,seatWind:'东',roundWind:'东',riichi:false,melds:[],doraIndicators:[],uraIndicators:[],redFives:0},opts||{}));}
function show(name,hand,win,opts){const r=calc(hand,win,opts);console.log(name,'=>',r.ok?JSON.stringify((r.yaku||[]).map(y=>y.key+':'+y.han))+' han='+r.hanTotal+' fu='+r.fu+' rank='+JSON.stringify(r.rank):'ERR '+r.error);}
// A 东刻 自风东 场风东 → 双风役牌2番
show('A 东刻双风',['1z','1z','1z','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m','1m'],'1m',{});
// B 东刻 自风南 场风东 → 场风役牌1番
show('B 东刻场风',['1z','1z','1z','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m','1m'],'1m',{seatWind:'南'});
// C 南刻 自风南 场风东 → 自风役牌1番
show('C 南刻自风',['2z','2z','2z','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m','1m'],'1m',{seatWind:'南'});
// D 北刻 自风东 场风东 → 北非场自风 → 不算役牌
show('D 北刻非役',['4z','4z','4z','1m','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m'],'5m',{});
// E 西刻 自风西 场风西 → 双风2番
show('E 西刻双风',['3z','3z','3z','1m','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m'],'5m',{seatWind:'西',roundWind:'西'});
// F 东雀头 自风东 场风东 → 双风雀头2番
show('F 东雀头双风',['1z','1z','1m','2m','3m','4m','5m','6m','7m','8m','9m','2p','3p','4p'],'1z',{});
