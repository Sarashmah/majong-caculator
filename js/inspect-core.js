const fs=require('fs');
const s=fs.readFileSync('D:/Vibecoding/majongcaculator/js/core.js','utf8');
function cp(str){return [...str].map(function(ch){return ch.codePointAt(0).toString(16);}).join(' ');}
const lines=s.split('\n');
for(let i=0;i<lines.length;i++){
  if(lines[i].indexOf('WIND_LIST')>=0||lines[i].indexOf('WIND_ORDER')>=0){
    console.log((i+1)+': '+JSON.stringify(lines[i])+' cp='+cp(lines[i]));
  }
}
const yi=s.indexOf('const seatIdx = WIND_LIST.indexOf(ctx.seatWindName)');
console.log('--- yakuhai section ---');
console.log(s.slice(yi-10,yi+900).replace(/[^\x20-\x7e\u4e00-\u9fff\n]/g,'?'));
console.log('--- isYakuhaiTile ---');
const y2=s.indexOf('function isYakuhaiTile');
console.log(s.slice(y2,y2+320).replace(/[^\x20-\x7e\u4e00-\u9fff\n]/g,'?'));
