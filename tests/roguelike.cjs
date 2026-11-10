const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
function load(storage={}){const ctx={window:{dispatchEvent(){}},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},Math,Date,Event:class{},console};vm.createContext(ctx);for(const f of ['game-data.js','roguelike.js','rune-effects.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);return {ctx,D:ctx.window.RUS_DATA,R:ctx.window.RUS_RUN,FX:ctx.window.RUS_RUNE_EFFECTS,storage}}
const json=o=>JSON.stringify(o);
for(let seed=1;seed<=60;seed++){
 const storage={'rus-music-volume-v1':'.24','rus-sound-volume-v1':'.42'},a=load(storage),{R}=a;
 R.newRun();let run=R.get();run.seed=run.rng=seed;assert.equal(run.startChoices.length,3);assert(run.startChoices.every(id=>R.runeMap.get(id).tier<=1));assert(R.chooseStart(run.startChoices[0]));
 const seen=new Set(),lastMap={},bossKeys=[],coinsBefore=run.coins;
 for(let i=1;i<=35;i++){
  run=R.get();assert.equal(run.battle,i);assert.equal(run.cycle,Math.floor((i-1)/5)+1);assert.equal(!!run.encounter.boss,i%5===0);assert.equal(new Set(run.plan.slice(0,4).map(p=>p.faction)).size,4);
  const e=run.encounter;assert(e.enemies.length>0&&e.enemies.length<=30);if(i>1)assert.notEqual(e.faction,run.previousTestFaction);run.previousTestFaction=e.faction;
  if(lastMap[e.faction])assert.notEqual(e.mapId,lastMap[e.faction]);lastMap[e.faction]=e.mapId;seen.add(e.faction);
  if(e.boss){assert.notEqual(e.boss.key,bossKeys.at(-1));bossKeys.push(e.boss.key);assert.equal(e.enemies.filter(u=>u.bossKey).length,1)}
  const coords=new Set();for(const u of e.enemies){assert(u.x>=8&&u.x<12&&u.y>=0&&u.y<10);assert(!e.obstacles.some(o=>['tree','rock','water'].includes(o.type)&&o.x===u.x&&o.y===u.y));assert(!coords.has(u.x+','+u.y));coords.add(u.x+','+u.y)}
  assert.equal(json(load(storage).R.get().encounter),json(e),'reload keeps encounter');
  assert(R.begin([{id:'militia',x:1.5,y:4.5}]));assert.equal(load(storage).R.get().phase,'prep','battle reload restarts same encounter');
  const before=run.coins;assert(R.victory(e.key));const earned=[30,30,35,40,70][(i-1)%5]+(run.runes.includes('tribute')?15:0);assert.equal(run.coins,before+earned);assert(!R.victory(e.key));assert.equal(run.coins,before+earned);
  R.rewardNext();if(run.phase==='bossRune'){assert.equal(run.bossChoices.length,3);assert(run.bossChoices.every(id=>[2,3].includes(R.runeMap.get(id).tier)));R.chooseBoss(run.bossChoices[0]);if(run.pending)R.resolvePending(0)}
  assert.equal(run.phase,'shop');assert.equal(new Set(run.shop.offers).size,run.shop.offers.length);assert(run.shop.offers.every(id=>!run.runes.includes(id)));if(run.cycle<3)assert(run.shop.offers.every(id=>R.runeMap.get(id).tier<4));assert.equal(json(load(storage).R.get().shop),json(run.shop),'reload does not reroll shop');
  const affordable=run.shop.offers.find(id=>R.runeMap.get(id).price<=run.coins);if(affordable){const balance=run.coins,price=R.runeMap.get(affordable).price;R.buy(affordable);if(run.pending){assert.equal(run.coins,balance);R.resolvePending(0)}assert.equal(run.coins,balance-price);assert(!R.buy(affordable));assert(run.runes.length<=5)}
  if(i%3===0&&run.runes.length>1){const id=run.runes[0],balance=run.coins;assert(R.sell(id));assert.equal(run.coins,balance+Math.floor(R.runeMap.get(id).price*.4));assert(!R.sell(id))}
  assert(R.next());
 }
 assert.equal(seen.size,6);assert.equal(run.stats.wins,35);assert.equal(run.stats.bosses,7);R.begin([{id:'militia',x:1.5,y:4.5}]);assert(R.defeat(run.encounter.key));assert.equal(run.phase,'ended');assert.equal(run.runes.length,0);assert.equal(run.coins,0);assert.equal(run.battle,1);assert.equal(run.cycle,1);assert.equal(run.result.wins,35);assert(!R.next());assert(!R.victory('old'));assert.equal(load(storage).R.get().phase,'ended');R.newRun();assert.equal(R.get().phase,'start');assert.equal(R.get().stats.wins,0);assert.equal(storage['rus-music-volume-v1'],'.24');assert.equal(storage['rus-sound-volume-v1'],'.42');
}
console.log('PASS: 60 runs × 35 wins: cycles, six factions, boss rotation, maps, spawns, idempotent rewards/purchases, shop persistence, death reset, audio settings');
const {R,D,FX}=load();assert.equal(R.runes.length,22);assert.equal(new Set(R.runes.map(r=>r.id)).size,22);assert.equal(R.runeMap.get('goida').name,'Гойда');assert.equal(R.runeMap.get('arrows').name,'Длинные стрелы предков');assert.equal(R.runeMap.get('wisdom').name,'Мудрость предков');assert.equal(R.runeMap.get('hyperborea').name,'Гиперборея');assert.equal(R.runeMap.get('greatness').name,'Величие предков');assert.equal(R.bosses.find(b=>b.key==='ancient').name,'Великий Древний Ящер');
const base=D.heroes.find(u=>u.id==='militia'),mage=D.heroes.find(u=>u.id==='volkhv'),archer=D.heroes.find(u=>u.id==='archer');
assert.equal(R.modify(base,['ancestors','curse','hyperfury','hyperborea']).damage,Math.round(base.damage*2.85));assert.equal(R.modify(base,['svarog','beard','hyperfury','curse','hyperborea']).hp,Math.round(base.hp*.95));assert.equal(R.modify(base,['curse','hyperfury']).hp,Math.round(base.hp*.3));assert.equal(R.modify(archer,['arrows']).range,6);assert.equal(R.modify(mage,['staff','hyperborea']).cooldown,2.5/1.55);assert.equal(R.modify(base,['bast']).speed,base.speed*1.15);assert.equal(R.cost(base,0,['goida','cunning','hyperborea']),base.cost);assert.equal(R.cost(base,3,['goida']),7);assert.equal(base.damage,8);
console.log('PASS: additive modifiers, base definitions immutable, class-specific stats and hiring costs');
function arena(active,boss=null){let time=0,units=[],bolts=[],damage=[];const api={units:()=>units,time:()=>time,fxTime:()=>time,random:()=>.25,spawn:(def,team,origin,extra={})=>{if(units.filter(u=>u.hpNow>0&&u.team===team).length>=(team==='enemy'?36:52))return null;const u={...R.modify(def,team==='rus'?active:[]),...extra,team,x:origin.x,y:origin.y,hpNow:def.hp,attackCount:0};if(extra.boost){u.hp*=extra.boost;u.hpNow=u.hp;u.damage*=extra.boost}units.push(u);return u},bolt:(...args)=>bolts.push(args),damage:(...args)=>damage.push(args)};const fx=FX.create(api,active,boss);return {api,fx,units,bolts,damage,setTime:t=>time=t}}
function soldier(id,team='rus',x=2,y=4){const d=[...D.heroes,...D.enemies].find(d=>d.id===id);return {...d,team,x,y,hpNow:d.hp,attackCount:1,baseDamage:d.damage}}
{
 const a=arena(['fury','wrath']),u=soldier('militia'),t=soldier('l_runner','enemy',5);a.units.push(u,t);for(let i=0;i<20;i++)a.fx.attack(u,t);assert.equal(a.bolts.length,2);assert.equal(a.bolts[0][3],2);
}
{
 const a=arena(['sky']),u=soldier('volkhv'),t=soldier('l_runner','enemy');u.attackCount=5;a.fx.attack(u,t);assert.equal(a.bolts.length,1);assert.equal(a.bolts[0][2],u.damage);
}
{
 const a=arena(['berserk','madness']),u=soldier('militia'),v=soldier('shield');a.units.push(u,v);u.hpNow=1;assert.equal(a.fx.rate(u),1.5);v.hpNow=0;a.fx.death(v);assert.equal(a.fx.rate(u),1.75);a.setTime(6);assert.equal(a.fx.rate(u),1.5);a.fx.end();assert.equal(u.frenzyUntil,0);
}
{
 const a=arena(['veles']);a.fx.start(Array.from({length:40},(_,i)=>({x:1.5,y:i%10+.5})));assert.equal(a.units.length,3);assert(a.units.every(u=>u.id==='bear'));a.setTime(21);a.fx.tick(21);assert(a.units.every(u=>u.hpNow===0&&u.expired));
}
{
 const a=arena(['immortal','greatness']),u=soldier('militia');a.units.push(u);u.hpNow=0;a.fx.death(u);assert.equal(u.hpNow,Math.round(u.hp*.5));u.hpNow=0;a.fx.death(u);assert.equal(a.units.filter(u=>u.legendary).length,3);for(const v of a.units)v.hpNow=0;a.fx.death(u);assert.equal(a.units.length,4);
}
{
 const a=arena(['call','wisdom']),u=soldier('volkhv');a.units.push(u,...Array.from({length:8},(_,i)=>soldier('p_foot','enemy',5,i)));a.setTime(15);a.fx.tick(15);assert.equal(a.bolts.length,5);assert.equal(new Set(a.bolts.map(b=>b[1])).size,5);assert(a.bolts.every(b=>b[3]===0));a.setTime(30);a.fx.tick(30);assert.equal(a.units.filter(u=>u.id==='militia').length,1);a.fx.end();a.setTime(90);a.fx.tick(90);assert.equal(a.units.filter(u=>u.id==='militia').length,1);
}
for(const boss of R.bosses){const a=arena([],boss),leader=soldier(boss.unit,'enemy',7,4);leader.bossKey=boss.key;const ally=soldier(boss.faction==='Зомби'?'z_runner':'l_runner','enemy',7,5);a.units.push(leader,ally);if(boss.key==='koschei')ally.hpNow=0;a.setTime(16);a.fx.tick(16);if(boss.key==='khan')assert.equal(a.units.length,4);if(boss.key==='batyr')assert(ally.hasteUntil>16&&ally.mightUntil>16);if(boss.key==='lizard')assert(ally.wardUntil>16);if(boss.key==='koschei')assert(ally.hpNow>0&&ally.raised);if(boss.key==='emperor')assert(ally.hasteUntil>16);if(boss.key==='ancient'){const target=soldier('militia','rus',6,4),other=soldier('shield','rus',6,5);a.units.push(target,other);a.fx.splash(leader,target);assert.equal(a.damage.length,1)}}
console.log('PASS: all event rune mechanics, proc limits, summon expiry, resurrection/last stand ordering, timed buffs and six distinct boss abilities');
// Full-slot purchases are transactional; cancelling or reloading cannot lose money.
R.newRun();R.chooseStart(R.get().startChoices[0]);R.begin([{id:'militia',x:1.5,y:4.5}]);R.victory(R.get().encounter.key);R.rewardNext();let run=R.get();run.runes=R.runes.slice(0,5).map(r=>r.id);run.coins=500;run.shop.offers=['wisdom','staff','immortal'];run.cycle=3;assert(R.buy('wisdom'));assert.equal(run.coins,500);assert(run.pending);R.resolvePending(null);assert.equal(run.coins,500);assert.equal(run.runes.length,5);assert(R.buy('wisdom'));R.resolvePending(2);assert.equal(run.coins,280);assert(run.runes.includes('wisdom'));assert(!R.buy('wisdom'));assert.equal(R.refreshPrice(),10);R.refresh();assert.equal(R.refreshPrice(),20);R.refresh();assert.equal(R.refreshPrice(),30);R.refresh();assert.equal(R.refreshPrice(),30);run.coins=0;assert(!R.refresh());assert.equal(run.coins,0);
console.log('PASS: five slots, replacement/cancellation atomicity, 10/20/30 refresh prices and non-negative wallet');
