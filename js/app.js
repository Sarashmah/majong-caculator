(function(){
var state={hand:[],melds:[],dora:[],ura:[]};
function $(id){return document.getElementById(id);}
function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e;}
function zname(t){if(t.suit!=='z')return String(t.rank);if(t.rank<=4)return ['东','南','西','北'][t.rank-1];return ['白','发','中'][t.rank-5];}
function tileBtn(code){var t=parseTile(code);var b=el('div','pai '+t.suit);b.textContent=zname(t);b.dataset.code=code;return b;}
function renderHand(){var row=$('hand-row');row.textContent='';state.hand.forEach(function(c){row.appendChild(tileBtn(c));});}
function renderDora(){var d=$('dora-row');d.textContent='';state.dora.forEach(function(c){d.appendChild(tileBtn(c));});var u=$('ura-row');u.textContent='';state.ura.forEach(function(c){u.appendChild(tileBtn(c));});}
function renderMelds(){var r=$('melds-row');r.textContent='';state.melds.forEach(function(m,i){var chip=el('span','meld-chip');chip.appendChild(el('b',null,{chi:'吃',pon:'碰',minkan:'明杠',ankan:'暗杠'}[m.type]));m.tiles.forEach(function(t){chip.appendChild(tileBtn(t));});var rm=el('button','ghost','x');rm.onclick=function(){state.melds.splice(i,1);renderMelds();};chip.appendChild(rm);r.appendChild(chip);});}
function renderAll(){renderHand();renderDora();renderMelds();}
function buildPickers(){['m','p','s'].forEach(function(s){var box=$('picker-'+s);for(var r=1;r<=9;r++){box.appendChild(tileBtn(r+s));}});var z=$('picker-z');for(var i=1;i<=7;i++){z.appendChild(tileBtn(i+'z'));}}
function onTileClick(e){var b=e.target.closest('.pai');if(!b)return;var c=b.dataset.code;if(b.parentNode===$('hand-row')){var i=state.hand.lastIndexOf(c);if(i>=0){state.hand.splice(i,1);}}else{if(state.hand.length>=14)return;var n=state.hand.filter(function(x){return x===c;}).length;if(n>=4)return;state.hand.push(c);state.hand.sort();}renderAll();}
function bindPick(id){$(id).addEventListener('click',onTileClick);}
function addMeld(){var t=$('meld-type').value;var cs=[$('meld-t1').value.trim(),$('meld-t2').value.trim(),$('meld-t3').value.trim()];var ok=cs.every(function(c){return /^[1-9][mpsz]$/.test(c);});if(t==='chi'){var a=parseTile(cs[0]);if(!ok||a.suit==='z'||cs.length!==3||cs[1]!==(a.rank+1)+a.suit||cs[2]!==(a.rank+2)+a.suit){alert('吃需三张连续同花色');return;}}else{var four=$('meld-t4').value.trim();if(t==='minkan'||t==='ankan'){cs.push(four);}var same=cs.every(function(c){return c===cs[0];});if(!ok||!same){alert('碰/杠需相同牌');return;}}state.melds.push({type:t,tiles:cs.slice()});renderMelds();}
function addDora(isUra){var c=prompt(isUra?'里宝指示牌（如 8m）':'宝牌指示牌（如 8m，表示下一张为宝牌）','');if(!c)return;c=c.trim();if(!/^[1-9][mpsz]$/.test(c)){alert('格式如 8m');return;}(isUra?state.ura:state.dora).push(c);renderDora();}
function calc(){var s={hand:state.hand.slice(),melds:state.melds.map(function(m){return {type:m.type,tiles:m.tiles.slice()};}),winCode:$('win-tile').value.trim(),winType:$('win-tsumo').checked?'tsumo':'ron',dealer:$('dealer').checked,seatWind:$('seat-wind').value,roundWind:$('round-wind').value,riichi:$('riichi').checked,ippatsu:$('ippatsu').checked,doubleRiichi:$('double-riichi').checked,rinshan:$('rinshan').checked,chankan:$('chankan').checked,haitei:$('haitei').checked,houtei:$('houtei').checked,firstTurn:$('first-turn').checked,redFives:parseInt($('red-fives').value,10)||0,doraIndicators:state.dora.slice(),uraIndicators:state.ura.slice()};var r=computeScore(s);renderResult(r);}
function renderResult(r){var b=$('result-body');b.textContent='';
if(!r.ok){b.appendChild(el('p','err',r.error||'无法计算'));return;}
var meta=el('div','result-meta');
meta.appendChild(el('b',null,r.rank||(r.hanTotal+'番')));
meta.appendChild(el('span',null,' '+r.hanTotal+'番'+(r.fu?' · '+r.fu+'符':'')));
b.appendChild(meta);
var tags=el('div','yaku-tags');
(r.yaku||[]).forEach(function(y){tags.appendChild(el('span','yaku-tag',y.name+' '+y.han+'番'));});
if(r.doraHan||r.uraHan||r.redHan)tags.appendChild(el('span','yaku-tag','宝牌'+(r.doraHan+(r.uraHan?'+'+r.uraHan:''))+' 赤'+r.redHan));
b.appendChild(tags);
var tb=el('table','pay-table');var p=r.payments||{};
function row(a,b2,c){var tr=el('tr');tr.appendChild(el('td',null,a));tr.appendChild(el('td',null,b2));tr.appendChild(el('td',null,c));tb.appendChild(tr);}
if(r.winType==='tsumo'){if(r.dealer){row('自摸','每家支付',p.tsumoAll+'点');}else{row('自摸','庄家支付',p.tsumoDealer+'点');row('自摸','闲家各付',p.tsumoAll+'点');}}
else{row('荣和',r.dealer?'庄家支付':'支付',p.ron+'点');}
b.appendChild(tb);
if(r.fuParts&&r.fuParts.length){b.appendChild(el('p','hint',r.fuParts.map(function(x){return x[0]+'('+x[1]+')';}).join(' + ')));}}
if($('hand-row')){
['picker-m','picker-p','picker-s','picker-z'].forEach(bindPick);
$('hand-row').addEventListener('click',onTileClick);
$('dora-row').addEventListener('click',function(e){var b=e.target.closest('.pai');if(!b)return;var c=b.dataset.code;var i=state.dora.lastIndexOf(c);if(i>=0)state.dora.splice(i,1);renderDora();});
$('ura-row').addEventListener('click',function(e){var b=e.target.closest('.pai');if(!b)return;var c=b.dataset.code;var i=state.ura.lastIndexOf(c);if(i>=0)state.ura.splice(i,1);renderDora();});
$('add-meld').addEventListener('click',addMeld);
$('add-dora').addEventListener('click',function(){addDora(false);});
$('add-ura').addEventListener('click',function(){addDora(true);});
$('calc-btn').addEventListener('click',calc);
$('win-tile').addEventListener('keydown',function(e){if(e.key==='Enter')calc();});
buildPickers();renderAll();}
(function(){var list=$('yaku-list');if(!list)return;
function renderYaku(){var q=($('yaku-search').value||'').trim().toLowerCase();
var hide=$('hide-yakuman').checked;var only=$('only-menzen').checked;
list.textContent='';
YAKU_CATALOG.forEach(function(y){var nm=(y.name||'').toLowerCase();
if(hide&&y.kind==='yakuman')return;
if(only&&!y.menzen)return;
if(q&&nm.indexOf(q)<0&&(y.desc||'').toLowerCase().indexOf(q)<0&&y.key.indexOf(q)<0)return;
var card=el('div','yaku-card');
var h=el('h4',null,y.name);
if(y.kind==='yakuman'){h.appendChild(el('span','han',y.units>1?'役满×'+y.units:'役满'));}
else{var v=y.hanOpen==null?y.hanClosed+'番（门清限定）':y.hanClosed+'/'+y.hanOpen+'番';h.appendChild(el('span','han',v));}
card.appendChild(h);
card.appendChild(el('p','desc',y.desc));
if(y.example)card.appendChild(el('p','ex','示例：'+y.example));
list.appendChild(card);});}
$('yaku-search').addEventListener('input',renderYaku);
$('hide-yakuman').addEventListener('change',renderYaku);
$('only-menzen').addEventListener('change',renderYaku);
renderYaku();})();
})();
