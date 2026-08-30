const fs=require('fs');
const D=['4z','4z','4z','1m','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m'];
const F=['1z','1z','1m','2m','3m','4m','5m','6m','7m','8m','9m','2p','3p','4p'];
const A=['1z','1z','1z','2m','3m','4m','5m','6m','7m','8m','9m','5m','5m','1m'];
const SW='\u4e1c';const TW='\u6771';
require('D:/Vibecoding/majongcaculator/js/tiles.js');
const core=require('D:/Vibecoding/majongcaculator/js/core.js');
console.log('WIND_LIST cp:',[...core.WIND_LIST.join('')].map(c=>c.codePointAt(0).toString(16)).join(' '));
console.log('indexOf(SW simple)=',core.WIND_LIST.indexOf(SW),'indexOf(TW trad)=',core.WIND_LIST.indexOf(TW));
function go(name,hand,win,seat){
 const r=core.computeScore({hand:hand,winCode:win,winType:'ron',dealer:false,seatWind:seat,roundWind:seat,riichi:false,melds:[],doraIndicators:[],uraIndicators:[],redFives:0});
 if(!r.ok){console.log(name,(seat===SW?'simple':'trad'),'ERR',r.error);return;}
 console.log(name,(seat===SW?'simple':'trad'),'yaku=',JSON.stringify((r.yaku||[]).map(y=>y.key+':'+y.han)),'han=',r.hanTotal,'groups=',JSON.stringify((r.groups||[]).map(g=>g.type+g.codes.join(''))),'pair=',r.pair?r.pair.codes.join(''):'null');
}
go('D 北刻',D,'5m',SW);
go('D 北刻',D,'5m',TW);
go('F 东雀头',F,'1z',SW);
go('F 东雀头',F,'1z',TW);
console.log('decompose A unsorted len=',core.decomposeHidden(A,4).length);
console.log('decompose A sorted len=',core.decomposeHidden(A.slice().sort(),4).length);
console.log('sortedA sol:',JSON.stringify(core.decomposeHidden(A.slice().sort(),4).map(s=>s.map(g=>g.type+g.codes.join('')).join(' '))));
