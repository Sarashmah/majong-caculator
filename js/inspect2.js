const fs=require('fs');
const core=fs.readFileSync('D:/Vibecoding/majongcaculator/js/core.js','utf8');
const tiles=fs.readFileSync('D:/Vibecoding/majongcaculator/js/tiles.js','utf8');
const html=fs.readFileSync('D:/Vibecoding/majongcaculator/index.html','utf8');
function line(src,n){const a=src.split('\n');return JSON.stringify(a[n-1]);}
console.log('core L60-62:');
for(let n=60;n<=62;n++)console.log(n,line(core,n));
console.log('core L270-280:');
for(let n=270;n<=280;n++)console.log(n,line(core,n));
console.log('tiles HONOR_NAMES line:',line(tiles,15));
const sw=html.indexOf('seat-wind');
console.log('html seat-wind snippet:',JSON.stringify(html.slice(sw-40,sw+260)));
