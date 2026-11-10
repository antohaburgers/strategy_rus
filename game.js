/* Русы против всех — Canvas auto-battler prototype 0.1 */
(() => {
'use strict';
const D=window.RUS_DATA, W=D.W, H=D.H, TW=72, TH=40;
const $=id=>document.getElementById(id);
const c=$('battle'), g=c.getContext('2d'), field=$('field');
const blockedKinds=new Set(['rock','tree','water']);
const sightKinds=new Set(['rock','tree']);
const unitDefs=new Map([...D.heroes,...D.enemies].map(x=>[x.id,x]));
const biomes={
 steppe:['#8ba56b','#78945a','#9eb27b'],river:['#87a66b','#7c9e69','#a1b57c'],
 forest:['#61875c','#739568','#83a471'],marsh:['#66866e','#73917a','#567a67'],
 canyon:['#ad956d','#bd9e70','#9e8361'],grave:['#6d806d','#7b8973','#576f63'],
 jungle:['#638f65','#77a072','#537d5b'],road:['#90a16e','#a4ae7c','#85966a']
};
let maxUnlocked=1;
try{maxUnlocked=Math.min(24,Math.max(1,Number(localStorage.getItem('rus-auto-unlocked-v1'))||1))}catch{}
let state={index:0,mode:'prep',selected:'militia',placed:[],units:[],shots:[],obstacles:new Map(),
  budget:90,time:0,level:null,zoom:1,panX:0,panY:0,last:0,accum:0,hint:'',hover:null};
let screenW=360,screenH=400,dpr=1,idCounter=1;
const key=(x,y)=>x+','+y;
const iso=(x,y)=>({x:(x-y)*TW/2,y:(x+y)*TH/2});
const mapMid=iso(W/2,H/2);
const at=(x,y)=>state.obstacles.get(key(x,y));
const inMap=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const solid=(x,y)=>!inMap(x,y)||blockedKinds.has(at(x,y));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function hash(x,y,s=0){let n=Math.sin((x+1)*127.1+(y+2)*311.7+(s+state.index)*73.3)*43758.5453;return n-Math.floor(n)}
function remaining(){return state.budget-state.placed.reduce((v,p)=>v+unitDefs.get(p.id).cost,0)}
function notify(t){state.hint=t;$('tip').textContent=t}
function fitZoom(){return clamp(Math.min((screenW-22)/((W+H)*TW/2+25),(screenH-30)/((W+H)*TH/2+42)),.30,1.25)}
function resetCamera(){state.zoom=fitZoom();state.panX=0;state.panY=0}
function resize(){
 const r=field.getBoundingClientRect();screenW=Math.max(1,r.width);screenH=Math.max(1,r.height);
 dpr=Math.min(2,window.devicePixelRatio||1);
 c.width=Math.round(screenW*dpr);c.height=Math.round(screenH*dpr);
 if(!state.zoom||!state.last)resetCamera();
}
function makeSoldier(def,team,x,y){
 return {...def,team,x,y,hpNow:def.hp,idNum:idCounter++,wait:0,acquire:0,
 target:null,path:[],pathGoal:'',repath:0,flash:0,attackCount:0,walk:0,deadAt:null};
}
function updateControls(){
 $('budget').textContent='⚜ '+remaining()+' / '+state.budget;
 $('chapter').textContent='Глава '+state.level.chapter+' — '+state.level.faction;
 $('battleTime').textContent=state.mode==='prep'?'Подготовка':state.mode==='battle'?'Бой '+Math.floor(state.time)+' с':state.mode==='win'?'Победа':'Поражение';
 $('mapTitle').textContent=state.level.id+' / 24 · '+state.level.title;
 $('fight').disabled=state.mode!=='prep'||state.placed.length===0;
 $('fight').classList.toggle('hidden',state.mode!=='prep');
 $('clear').classList.toggle('hidden',state.mode!=='prep');
 $('retry').classList.toggle('hidden',state.mode==='prep');
 $('next').classList.toggle('hidden',state.mode!=='win'||state.index===D.levels.length-1);
 $('shop').querySelectorAll('[data-id]').forEach(el=>{
  const u=unitDefs.get(el.dataset.id);
  el.disabled=state.mode!=='prep'||remaining()<u.cost;
  el.classList.toggle('selected',state.selected===u.id);
 });
}
function setupShop(){
 const shop=$('shop');shop.innerHTML='';
 for(const u of D.heroes){
  const button=document.createElement('button');button.className='unitCard';
  button.dataset.id=u.id;button.title=u.name+' — '+u.hp+' HP';
  const n=document.createElement('span');n.className='unitName';n.textContent=u.short;
  const price=document.createElement('span');price.className='unitCost';price.textContent='⚜ '+u.cost;
  const role=document.createElement('span');role.className='unitHint';role.textContent=
    ({militia:'Дешёвый',shield:'Держит строй',spear:'Против конницы',archer:'Дальний бой',rider:'Обходит фланг',bogatyr:'Герой'})[u.id];
  button.append(n,price,role);
  button.addEventListener('click',()=>{state.selected=u.id;notify('Выбран: '+u.name+'. Коснись пустой клетки в синей зоне.');updateControls()});
  shop.append(button);
 }
}
function setupLevels(){
 const sel=$('level');sel.innerHTML='';
 D.levels.forEach((l,i)=>{const o=document.createElement('option');o.value=i;o.textContent=l.id+'. '+l.title;o.disabled=l.id>maxUnlocked;sel.add(o)});
 sel.addEventListener('change',()=>loadLevel(Number(sel.value)));
}
function loadLevel(i){
 state.index=i;state.level=D.levels[i];state.budget=state.level.budget;
 state.obstacles=new Map(state.level.obstacles.map(o=>[key(o.x,o.y),o.type]));
 state.placed=[];state.units=[];state.shots=[];state.time=0;state.mode='prep';
 state.selected='militia';state.hover=null;
 $('result').classList.add('hidden');$('level').value=String(i);
 resetCamera();notify('Выбери воина и коснись свободной клетки слева. В бой можно отправить любую армию в пределах бюджета.');
 updateControls();
}
function placeAt(x,y){
 if(state.mode!=='prep')return;
 if(!inMap(x,y)){notify('За пределами поля.');return}
 const existing=state.placed.findIndex(u=>Math.floor(u.x)===x&&Math.floor(u.y)===y);
 if(existing>=0){const old=state.placed.splice(existing,1)[0];notify(unitDefs.get(old.id).name+' вернулся в запас.');updateControls();return}
 if(x>=4){notify('Тут нельзя разместить русов: нужна синяя область слева.');return}
 if(solid(x,y)){notify('Здесь препятствие — клетка занята.');return}
 const def=unitDefs.get(state.selected);
 if(remaining()<def.cost){notify('Не хватает очков на '+def.name+'.');return}
 state.placed.push({id:def.id,x:x+.5,y:y+.5});notify(def.name+' размещён. Можно добавить ещё или нажать «В БОЙ!».');updateControls();
}
function startBattle(){
 if(state.placed.length===0){notify('Сначала поставь хотя бы одного воина.');return}
 state.units=[
 ...state.placed.map(p=>makeSoldier(unitDefs.get(p.id),'rus',p.x,p.y)),
 ...state.level.enemies.map(p=>makeSoldier(unitDefs.get(p.id),'enemy',p.x+.5,p.y+.5))
 ];
 state.time=0;state.shots=[];state.mode='battle';$('result').classList.add('hidden');
 notify('Бой идёт автоматически. Обе армии используют одинаковый алгоритм поиска целей и обхода препятствий.');
 updateControls();
}
function clearArmy(){state.placed=[];notify('Армия распущена. Бюджет восстановлен.');updateControls()}
function showResult(win){
 state.mode=win?'win':'lose';
 $('resultTitle').textContent=win?'ПОБЕДА РУСОВ!':'РУСЫ ОТСТУПИЛИ';
 $('resultText').textContent=win?'Хорошая расстановка! Следующая битва открыта.':'Поменяй состав или построение и попробуй ещё раз.';
 $('result').classList.remove('hidden');
 if(win&&state.level.id>=maxUnlocked&&maxUnlocked<24){
  maxUnlocked=state.level.id+1;
  try{localStorage.setItem('rus-auto-unlocked-v1',String(maxUnlocked))}catch{}
  setupLevels();$('level').value=String(state.index);
 }
 notify(win?'Победа! Можно повторить эту битву или идти дальше.':'Поражение. Пересмотри построение: бой можно бесплатно переиграть.');
 updateControls();
}
function traceClear(ax,ay,bx,by,kinds){
 const len=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(len*5));
 for(let i=1;i<n;i++){const t=i/n,x=Math.floor(ax+(bx-ax)*t),y=Math.floor(ay+(by-ay)*t);if(kinds.has(at(x,y)))return false}
 return true;
}
function astar(ax,ay,bx,by){
 const sx=clamp(Math.floor(ax),0,W-1),sy=clamp(Math.floor(ay),0,H-1),
       ex=clamp(Math.floor(bx),0,W-1),ey=clamp(Math.floor(by),0,H-1);
 if(sx===ex&&sy===ey)return [];
 const startKey=key(sx,sy),goal=key(ex,ey);
 const open=[{x:sx,y:sy,g:0,f:0,k:startKey}],best=new Map([[startKey,0]]),prev=new Map(),closed=new Set();
 const moves=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 while(open.length){
  open.sort((a,b)=>a.f-b.f);const cur=open.shift();if(closed.has(cur.k))continue;
  if(cur.k===goal){const path=[];let z=goal;while(z!==startKey&&prev.has(z)){const [x,y]=z.split(',').map(Number);path.push({x:x+.5,y:y+.5});z=prev.get(z)}return path.reverse()}
  closed.add(cur.k);
  for(const [dx,dy] of moves){
   const nx=cur.x+dx,ny=cur.y+dy,nk=key(nx,ny);
   if(solid(nx,ny)||closed.has(nk))continue;
   if(dx&&dy&&(solid(cur.x+dx,cur.y)||solid(cur.x,cur.y+dy)))continue;
   const ncost=cur.g+(dx&&dy?1.414:1)*(at(nx,ny)==='mud'?1.55:1);
   if(ncost>=(best.get(nk)??Infinity))continue;
   best.set(nk,ncost);prev.set(nk,cur.k);
   open.push({x:nx,y:ny,g:ncost,f:ncost+Math.hypot(nx-ex,ny-ey),k:nk});
  }
 }
 return [];
}
function acquire(u){
 let candidate=null,score=Infinity;
 for(const v of state.units){
  if(v.team===u.team||v.hpNow<=0)continue;
  const d=distance(u,v);
  const s=d+(u.role==='ranged'&&v.role==='ranged'?-0.12:0);
  if(s<score){score=s;candidate=v}
 }
 return candidate;
}
function move(u,goal,dt){
 let dx=goal.x-u.x,dy=goal.y-u.y,dist=Math.hypot(dx,dy);
 if(dist<.08)return;
 dx/=dist;dy/=dist;
 // Мягкое расталкивание не превращает союзников в непроходимые стены.
 let avoidX=0,avoidY=0;
 for(const v of state.units){
  if(v===u||v.hpNow<=0)continue;
  const dd=Math.hypot(u.x-v.x,u.y-v.y);
  if(dd>0&&dd<.46){avoidX+=(u.x-v.x)/dd*(.46-dd)*1.4;avoidY+=(u.y-v.y)/dd*(.46-dd)*1.4}
 }
 dx+=avoidX;dy+=avoidY;
 const norm=Math.hypot(dx,dy)||1;dx/=norm;dy/=norm;
 const terrain=at(Math.floor(u.x),Math.floor(u.y));
 const modifier=terrain==='mud'?.55:terrain==='scrub'?.8:1;
 const step=Math.min(dist,u.speed*modifier*dt);
 const nx=clamp(u.x+dx*step,.08,W-.08),ny=clamp(u.y+dy*step,.08,H-.08);
 if(!solid(Math.floor(nx),Math.floor(ny))){u.x=nx;u.y=ny;u.walk+=step;return}
 if(!solid(Math.floor(nx),Math.floor(u.y))){u.x=nx;u.walk+=step;return}
 if(!solid(Math.floor(u.x),Math.floor(ny))){u.y=ny;u.walk+=step;return}
 u.repath=0;u.path=[];
}
function chase(u,t,dt){
 const direct=traceClear(u.x,u.y,t.x,t.y,blockedKinds);
 if(direct){move(u,t,dt);return}
 u.repath-=dt;const goalKey=key(Math.floor(t.x),Math.floor(t.y));
 if(u.repath<=0||u.pathGoal!==goalKey||!u.path.length){
  u.path=astar(u.x,u.y,t.x,t.y);u.pathGoal=goalKey;u.repath=.55+(u.idNum%4)*.08;
 }
 if(!u.path.length)return;
 while(u.path.length>1&&distance(u,u.path[0])<.23)u.path.shift();
 move(u,u.path[0],dt);
}
function attack(u,t){
 let damage=u.damage;
 if(u.id==='spear'&&(t.big||['horse','horsebow'].includes(t.shape)))damage*=u.bonusBig||1;
 if(u.charge&&u.attackCount===0)damage*=u.charge;
 damage=Math.max(1,Math.round(damage*(1-t.armor)));
 t.hpNow=Math.max(0,t.hpNow-damage);
 u.attackCount++;u.wait=u.cooldown;u.flash=.23;
 if(u.role==='ranged')state.shots.push({x:u.x,y:u.y,tx:t.x,ty:t.y,time:0,duration:.28,enemy:u.team==='enemy'});
 if(t.hpNow===0)t.deadAt=state.time;
}
function tick(dt){
 if(state.mode!=='battle')return;
 state.time+=dt;
 for(const u of state.units){
  if(u.hpNow<=0)continue;
  u.wait=Math.max(0,u.wait-dt);u.flash=Math.max(0,u.flash-dt);
  u.acquire-=dt;
  if(!u.target||u.target.hpNow<=0||u.acquire<=0){u.target=acquire(u);u.acquire=.35+(u.idNum%4)*.07}
  const t=u.target;if(!t)continue;
  const d=distance(u,t),seen=traceClear(u.x,u.y,t.x,t.y,sightKinds);
  const inRange=d<=u.range+.12&&(u.role!=='ranged'||seen);
  if(inRange){
   if(u.wait===0)attack(u,t);
   // Лучники пытаются отступить, если их прижали к ближнему бою.
   if(u.role==='ranged'&&d<1.35){const away={x:clamp(u.x+(u.x-t.x)*2,.1,W-.1),y:clamp(u.y+(u.y-t.y)*2,.1,H-.1)};move(u,away,dt)}
  }else{
   chase(u,t,dt);
  }
 }
 state.shots=state.shots.filter(p=>(p.time+=dt)<p.duration);
 const rus=state.units.filter(u=>u.team==='rus'&&u.hpNow>0),foes=state.units.filter(u=>u.team==='enemy'&&u.hpNow>0);
 if(!rus.length||!foes.length){showResult(!!rus.length);return}
 if(state.time>=75){
  const health=team=>state.units.filter(u=>u.team===team).reduce((sum,u)=>sum+u.hpNow/u.hp,0);
  showResult(health('rus')>=health('enemy'));
 }
}
function screenPoint(e){const rect=c.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top}}
function cellAt(p){
 const px=(p.x-screenW/2-state.panX)/state.zoom+mapMid.x,
       py=(p.y-screenH/2-state.panY)/state.zoom+mapMid.y;
 return{x:Math.floor(px/TW+py/TH),y:Math.floor(py/TH-px/TW)};
}
function poly(pts,fill,stroke=null,width=1){
 g.beginPath();g.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();
 if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke()}
}
function oval(x,y,rx,ry,col){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=col;g.fill()}
function segment(x1,y1,x2,y2,col,w=2){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineCap='round';g.lineWidth=w;g.strokeStyle=col;g.stroke()}
function drawDiamond(p,fill,stroke){
 poly([[p.x,p.y-TH/2],[p.x+TW/2,p.y],[p.x,p.y+TH/2],[p.x-TW/2,p.y]],fill,stroke,.75)
}
function tile(x,y){
 const p=iso(x+.5,y+.5),biome=biomes[state.level.biome]||biomes.steppe;
 const colors=biome[clamp(Math.floor(hash(x,y,1)*3),0,2)];
 const o=at(x,y);
 let fill=colors;
 if(o==='water')fill='#407f91';
 if(o==='mud')fill='#666b4f';
 if(o==='road')fill='#ad9470';
 drawDiamond(p,fill,'#1e41221c');
 if(state.mode==='prep'&&x<4)drawDiamond(p,'#62adf421');
 if(state.mode==='prep'&&x>=8)drawDiamond(p,'#e86e5d12');
 if(o==='water'){
  for(let i=0;i<2;i++){const xx=p.x-17+hash(x,y,i)*29,yy=p.y-3+i*5;segment(xx,yy,xx+12,yy-2,'#c0e5dc7a',1.1)}
 }else{
  for(let i=0;i<3;i++){
   const qx=p.x+(hash(x,y,20+i)-.5)*TW*.65,qy=p.y+(hash(x,y,30+i)-.5)*TH*.55;
   segment(qx,qy,qx-1,qy-3,fill==='#ad9470'?'#c5ac83':'#b2bc8a',.8)
  }
 }
}
function objectDraw(o){
 const p=iso(o.x+.5,o.y+.5);
 g.save();g.translate(p.x,p.y);
 if(o.type==='tree'){
  oval(4,5,19,7,'#15301c50');
  segment(0,1,0,-36,'#6c5037',7);
  for(let i=0;i<3;i++){const y=-22-i*12,r=22-i*5;poly([[0,y-29],[-r,y+11],[r,y+11]],i%2?'#326648':'#447751','#244e35',1.4)}
 }else if(o.type==='rock'){
  oval(2,5,23,7,'#1027165c');
  poly([[-19,2],[-17,-11],[-7,-24],[13,-22],[20,-8],[14,4]],'#829188','#485c58',1.4);
  poly([[-17,-11],[-7,-24],[13,-22],[-1,-12]],'#b5b8a5');
  poly([[13,-22],[20,-8],[14,4],[0,-3],[-1,-12]],'#647a71');
 }else if(o.type==='scrub'){
  for(let j=-2;j<=2;j++){const xx=j*6;oval(xx,-3-Math.abs(j%2)*2,7,8,j%2?'#6c985a':'#4d8350')}
 }else if(o.type==='mud'){
  oval(0,0,24,10,'#5b5e47c9');oval(-6,-1,9,2,'#928c66');oval(11,4,6,2,'#858362')
 }else if(o.type==='road'){
  poly([[-27,-5],[-8,-13],[26,4],[9,12]],'#c2a27a8f');
 }
 g.restore();
}
function unitDraw(u){
 const p=iso(u.x,u.y),dead=u.hpNow<=0;
 g.save();g.translate(p.x,p.y);
 if(dead){g.globalAlpha=.36;g.rotate(.55)}
 const shape=u.shape||'sword',enemy=u.team==='enemy';
 const big=u.big||shape==='hero';
 if(big)g.scale(1.18,1.18);
 const bob=dead?0:Math.sin(u.walk*11)*1.5;
 oval(0,4,17,5,'#1a251b69');
 if(shape==='horse'||shape==='horsebow'){
  segment(-9,-9,-11,2,'#52372a',3.5);segment(-1,-10,0,2,'#52372a',3.5);
  segment(10,-9,13,2,'#52372a',3.5);segment(17,-9,18,2,'#52372a',3.5);
  oval(2,-15+bob,21,9,'#775840');oval(18,-22+bob,7,12,'#775840');
  oval(23,-28+bob,5,5,'#af8d71');
  segment(-10,-20,-18,-27,'#5f4433',3);
  oval(-2,-33+bob,7,10,u.color);oval(-2,-44+bob,6,6,enemy?'#a7886e':'#e5b99b');
  poly([[-9,-48+bob],[-3,-54+bob],[4,-47+bob]],enemy?'#6f513b':'#637e9b');
  if(shape==='horsebow')segment(4,-33+bob,19,-49+bob,'#e4ce8b',2);
  else segment(6,-32+bob,19,-54+bob,'#c4c6c9',3);
 }else if(shape==='raptor'||shape==='trike'||shape==='rex'){
  const size=shape==='rex'?1.35:shape==='trike'?1.2:1;
  g.scale(size,size);
  segment(-9,-15,-23,-23,u.color,8);segment(-6,-7,-9,2,'#586a40',5);segment(8,-9,11,2,'#586a40',5);
  oval(0,-18+bob,18,11,u.color);
  oval(16,-29+bob,10,8,u.color);
  poly([[20,-29+bob],[33,-25+bob],[20,-22+bob]],'#b0aa76');
  oval(19,-32+bob,2,2,'#172116');
  if(shape==='trike'){segment(15,-33,28,-49,'#ddd8af',3);segment(24,-29,35,-40,'#ddd8af',3)}
  if(shape==='rex'){oval(12,-41+bob,7,13,u.color);segment(17,-37,24,-29,'#576c49',4)}
 }else{
  const undead=shape==='zombie'||shape==='giant',lizard=shape.startsWith('lizard');
  if(lizard){poly([[-5,-11],[-20,-13],[-12,-7],[0,-5]],'#417f5e')}
  segment(-5,-10+bob,-8,0,undead?'#5b6356':'#644b38',4);
  segment(5,-10+bob,8,0,undead?'#5b6356':'#644b38',4);
  g.fillStyle=u.color;g.beginPath();g.roundRect(-8,-31+bob,16,22,4);g.fill();
  if(shape==='shield'||shape==='lizardShield'||shape==='hero'){
   oval(-11,-22+bob,8,13,enemy?'#6c463b':'#5c7f9e');
   oval(-11,-22+bob,4,8,enemy?'#b77a5a':'#d4c08a');
  }
  oval(0,-38+bob,lizard?8:7,8,lizard?'#5a9d6b':undead?'#a7b19b':'#e8b899');
  if(lizard){poly([[4,-41+bob],[14,-38+bob],[3,-34+bob]],'#6abf74');oval(6,-41+bob,1.8,1.8,'#111d14')}
  else{oval(2,-39+bob,1.2,1.2,'#3a322b')}
  if(!undead&&!lizard)poly([[-8,-40+bob],[-6,-48+bob],[5,-48+bob],[9,-39+bob]],enemy?'#72614e':shape==='hero'?'#c4a348':'#77879b');
  if(shape==='spear'){segment(9,-18+bob,19,-56+bob,'#805e3f',3);poly([[19,-61+bob],[15,-53+bob],[21,-53+bob]],'#d9d9cb')}
  else if(shape==='bow'){g.beginPath();g.strokeStyle='#e1c38b';g.lineWidth=3;g.arc(12,-27+bob,14,-1.1,1.1);g.stroke();segment(18,-40+bob,18,-15+bob,'#f3dfbf',1)}
  else if(shape==='lizard'){segment(7,-22+bob,19,-17+bob,'#a6c783',4)}
  else{segment(8,-18+bob,18,-40+bob,'#c5c9cb',3.5)}
 }
 if(u.flash>0&&!dead){g.strokeStyle='#fff0aa';g.lineWidth=3;g.beginPath();g.arc(0,-18,25,-1.2,1.2);g.stroke()}
 if(!dead){
  const hpY=(big||shape==='rex'||shape==='horse'||shape==='horsebow')?-59:-54;
  g.fillStyle='#1a221ce6';g.fillRect(-16,hpY,32,4);
  g.fillStyle=enemy?'#ee8976':'#96d3a5';g.fillRect(-16,hpY,32*u.hpNow/u.hp,4);
  g.strokeStyle='#17231a';g.lineWidth=.6;g.strokeRect(-16,hpY,32,4);
 }
 g.restore();
}
function render(){
 if(!c.width||!c.height)return;
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,screenW,screenH);
 g.fillStyle='#203628';g.fillRect(0,0,screenW,screenH);
 g.save();g.translate(screenW/2+state.panX,screenH/2+state.panY);
 g.scale(state.zoom,state.zoom);g.translate(-mapMid.x,-mapMid.y);
 for(let sum=0;sum<=W+H-2;sum++)for(let y=Math.max(0,sum-W+1);y<=Math.min(H-1,sum);y++)tile(sum-y,y);
 if(state.hover&&state.mode==='prep'&&inMap(state.hover.x,state.hover.y)){
  const p=iso(state.hover.x+.5,state.hover.y+.5);
  const ok=state.hover.x<4&&!solid(state.hover.x,state.hover.y);
  drawDiamond(p,ok?'#bde6a075':'#e879647d',ok?'#e0f2ce':'#f7ae9b');
 }
 const drawables=[];
 state.level.obstacles.forEach(o=>{if(o.type!=='water')drawables.push({sort:iso(o.x+.5,o.y+.5).y,kind:'obstacle',value:o})});
 if(state.mode==='prep'){
  state.placed.forEach(p=>drawables.push({sort:iso(p.x,p.y).y,kind:'unit',value:{...unitDefs.get(p.id),team:'rus',x:p.x,y:p.y,hpNow:unitDefs.get(p.id).hp,walk:0,flash:0}}));
  state.level.enemies.forEach(p=>drawables.push({sort:iso(p.x+.5,p.y+.5).y,kind:'unit',value:{...unitDefs.get(p.id),team:'enemy',x:p.x+.5,y:p.y+.5,hpNow:unitDefs.get(p.id).hp,walk:0,flash:0}}));
 }else state.units.forEach(u=>drawables.push({sort:iso(u.x,u.y).y,kind:'unit',value:u}));
 drawables.sort((a,b)=>a.sort-b.sort);
 for(const d of drawables)if(d.kind==='unit')unitDraw(d.value);else objectDraw(d.value);
 for(const p of state.shots){const a=iso(p.x,p.y),b=iso(p.tx,p.ty),t=clamp(p.time/p.duration,0,1);
  const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t-22;oval(x,y,3,2,p.enemy?'#f4b29a':'#ffe28b')}
 g.restore();
}
const pointers=new Map();let gesture=false;
function pointerEnd(e,cancel=false){
 const p=pointers.get(e.pointerId);if(!p)return;
 const tap=!cancel&&!gesture&&pointers.size===1&&!p.moved;
 if(tap){const cell=cellAt({x:p.x,y:p.y});placeAt(cell.x,cell.y)}
 pointers.delete(e.pointerId);if(pointers.size===0)gesture=false;
}
c.addEventListener('pointerdown',e=>{
 e.preventDefault();c.setPointerCapture(e.pointerId);const p=screenPoint(e);
 pointers.set(e.pointerId,{x:p.x,y:p.y,startX:p.x,startY:p.y,moved:false});
 if(pointers.size>1)gesture=true;
});
c.addEventListener('pointermove',e=>{
 const p=pointers.get(e.pointerId),n=screenPoint(e);state.hover=cellAt(n);if(!p)return;
 const before=[...pointers.values()].map(a=>({...a}));
 if(Math.hypot(n.x-p.startX,n.y-p.startY)>8)p.moved=true;
 p.x=n.x;p.y=n.y;
 if(pointers.size===1&&p.moved){state.panX+=n.x-before[0].x;state.panY+=n.y-before[0].y}
 if(pointers.size===2){
  gesture=true;const now=[...pointers.values()];
  const length=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
  const oldDist=length(before),newDist=length(now);
  if(oldDist>3)state.zoom=clamp(state.zoom*newDist/oldDist,.27,2.8);
  const avg=a=>({x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});
  const a=avg(before),b=avg(now);state.panX+=b.x-a.x;state.panY+=b.y-a.y;
 }
});
c.addEventListener('pointerup',e=>pointerEnd(e));
c.addEventListener('pointercancel',e=>pointerEnd(e,true));
c.addEventListener('lostpointercapture',e=>{if(pointers.has(e.pointerId))pointerEnd(e,true)});
c.addEventListener('contextmenu',e=>e.preventDefault());
c.addEventListener('wheel',e=>{e.preventDefault();state.zoom=clamp(state.zoom*(e.deltaY>0?.9:1.1),.27,2.8)},{passive:false});
$('plus').addEventListener('click',()=>state.zoom=clamp(state.zoom*1.2,.27,2.8));
$('minus').addEventListener('click',()=>state.zoom=clamp(state.zoom/1.2,.27,2.8));
$('clear').addEventListener('click',clearArmy);
$('fight').addEventListener('click',startBattle);
$('retry').addEventListener('click',()=>loadLevel(state.index));
$('next').addEventListener('click',()=>loadLevel(Math.min(state.index+1,D.levels.length-1)));
function frame(t){
 const delta=Math.min(.08,(t-(state.last||t))/1000);
 state.last=t;state.accum=Math.min(.15,state.accum+delta);
 let count=0;while(state.accum>=1/30&&count++<5){tick(1/30);state.accum-=1/30}
 render();requestAnimationFrame(frame);
}
setupShop();setupLevels();resize();loadLevel(0);
if('ResizeObserver' in window)new ResizeObserver(resize).observe(field);
else window.addEventListener('resize',resize);
requestAnimationFrame(frame);
})();
