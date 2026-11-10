const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/../';
const data=fs.readFileSync(root+'game-data.js','utf8');
function load(storage={}){const ctx={window:{},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},Math,console};vm.createContext(ctx);vm.runInContext(data,ctx);return {D:ctx.window.RUS_DATA,ctx,storage}}
for(let seed=1;seed<=200;seed++){
 const storage={'rus-campaign-v2':JSON.stringify({seed,current:0})};const {D}=load(storage);let prev='',maps={};
 for(let i=0;i<120;i++){
  const l=D.getLevel(i);assert(l.enemies.length>0&&l.enemies.length<=40);assert.notEqual(l.faction,prev);prev=l.faction;
  if(maps[l.faction])assert.notEqual(l.mapId,maps[l.faction]);maps[l.faction]=l.mapId;
  const positions=new Set();for(const e of l.enemies){assert(e.x>=8&&e.x<12&&e.y>=0&&e.y<10);assert(!l.obstacles.some(o=>['rock','tree','water'].includes(o.type)&&o.x===e.x&&o.y===e.y));const k=e.x+','+e.y;assert(!positions.has(k));positions.add(k)}
 }
 assert.equal(D.getLevel(0).faction,'Печенеги');assert.equal(new Set(D.levels.slice(0,6).map(l=>l.faction)).size,6);
 for(const f of ['Ящеры','Зомби'])assert(D.levels.slice(0,4).some(l=>l.faction===f));
 for(let i=6;i<120;i+=6)assert.equal(new Set(D.levels.slice(i,i+6).map(l=>l.faction)).size,6);
 D.setCurrent(17);const second=load(storage).D;assert.equal(second.campaign.current,17);assert.equal(JSON.stringify(D.getLevel(17)),JSON.stringify(second.getLevel(17)));assert.equal(JSON.stringify(D.getLevel(105)),JSON.stringify(second.getLevel(105)));
}
console.log('PASS: 200 seeds × 120 levels: order, maps, cycles, spawns, persistence');
const {D,ctx}=load({'rus-auto-unlocked-v1':'24'}),elements=new Map();
const noop=()=>{};const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop:noop}):noop,set:()=>true});
function el(id){if(!elements.has(id))elements.set(id,{id,style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},getContext:()=>context,getBoundingClientRect:()=>({width:844,height:390,left:0,top:0}),querySelectorAll:()=>[],addEventListener:noop,append:noop,add:noop,setAttribute:noop});return elements.get(id)}
Object.assign(ctx,{document:{getElementById:el,createElement:()=>el('el'+Math.random()),body:el('body')},requestAnimationFrame:noop,Event:class{},performance:{now:()=>0}});Object.assign(ctx.window,{dispatchEvent:noop,addEventListener:noop,RUS_ART:{draw:noop}});
let game=fs.readFileSync(root+'game.js','utf8').replace('setupShop();setupLevels();resize();loadLevel(Math.min(D.campaign.current,maxUnlocked-1));', 'window.TEST={state,makeSoldier,attack,updateLightning,tick,loadLevel,startBattle,showResult,placeAt};');vm.runInContext(game,ctx);
const t=ctx.window.TEST;t.state.lightning=[];t.state.pools=[];t.state.time=0;t.state.fxTime=0;
const caster=t.makeSoldier(D.heroes.find(u=>u.id==='volkhv'),'rus',2,4);
const base={...D.enemies.find(u=>u.id==='l_shield'),hp:1000};const target=t.makeSoldier(base,'enemy',5,4),near=t.makeSoldier({...base,id:'z_shambler'},'enemy',5.5,4),far=t.makeSoldier(base,'enemy',10,4);
t.state.units=[caster,target,near,far];t.attack(caster,target);assert.equal(target.hpNow,1000);t.updateLightning(.17);assert.equal(target.hpNow,940);assert.equal(near.hpNow,993);assert.equal(far.hpNow,1000);assert.equal(caster.wait,2.5);t.updateLightning(.2);assert.equal(target.hpNow,940);
console.log('PASS: targeted magic ignores armour, +75% lizards, 22% chain, radius, delay, cooldown');
// A dead caster cannot finish a pending cast.
t.attack(caster,far);caster.hpNow=0;t.updateLightning(.17);assert.equal(far.hpNow,1000);
const fighter=t.makeSoldier(D.heroes.find(u=>u.id==='militia'),'rus',3,4),victim=t.makeSoldier({...base,hp:1},'enemy',4,4);t.state.units=[fighter,victim];t.attack(fighter,victim);assert.equal(victim.hpNow,0);assert.notEqual(victim.deadAt,null);
t.loadLevel(0);const snapshot=JSON.stringify(t.state.level);t.state.selected='volkhv';t.placeAt(1,4);assert.equal(t.state.placed[0].id,'volkhv');t.startBattle();assert(t.state.units.some(u=>u.id==='volkhv'));t.showResult(false);t.loadLevel(0);assert.equal(JSON.stringify(t.state.level),snapshot);t.showResult(true);t.loadLevel(1);assert.equal(t.state.level.id,2);
console.log('PASS: existing melee, recruitment, battle, retry and next-level progression');
