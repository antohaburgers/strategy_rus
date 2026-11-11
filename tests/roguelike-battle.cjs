const assert=require('assert'),engine=require('./engine.cjs');
function formation(R,T,D,style='mixed'){
 const cells=[];for(let x=3;x>=0;x--)for(let y=1;y<9;y++)cells.push([x,y]);
 const put=id=>{T.state.selected=id;const cell=cells.shift();if(cell)T.placeAt(...cell)};
 for(const [id,n] of Object.entries(R.rules().required||{}))for(let j=0;j<n;j++)put(id);
 const orders={mixed:['shield','volkhv','spear','archer','militia'],militia:['militia'],riders:['rider','spear','militia'],magic:['shield','volkhv','archer','militia'],bears:['militia']};
 const order=orders[style];
 for(let i=0;i<32&&cells.length;i++){
  const id=order[i%order.length],u=D.heroes.find(h=>h.id===id);
  if(R.available(u,T.state.placed)&&T.state.placed.reduce((n,p,j)=>n+R.cost(D.heroes.find(h=>h.id===p.id),j),0)+R.cost(u,T.state.placed.length)<=T.state.budget)put(id);
 }
}
function simulate(T,guard=true){let frames=0;while(T.state.mode==='battle'&&frames++<3100){if(guard&&T.special()?.hazards.some(h=>!h.hit&&h.at-T.state.time<.5))T.special().guard();T.tick(1/30)}return frames/30}
// All factions traverse every stage in the real engine. Boosted army isolates progression from tuning.
let battles=0;
for(let faction=0;faction<11;faction++){
 const {R,T,D}=engine(faction+1),run=R.get();run.chapterPlan=[D.factions[faction].id,D.factions[(faction+1)%11].id,D.factions[(faction+2)%11].id];R.EncounterGenerator.generate();
 for(let stage=0;stage<12;stage++){
  run.runes=['ancestors','veles','staff','immortal'];T.prepareEncounter(run.encounter);formation(R,T,D);assert(!R.validate(T.state.placed));T.startBattle();assert.equal(T.state.mode,'battle');
  for(const u of T.state.units.filter(u=>u.team==='rus')){u.hp*=100;u.hpNow=u.hp;u.damage*=100}
  simulate(T);assert.equal(T.state.mode,'win','faction '+faction+' stage '+stage);assert(T.state.units.length<=140);assert(T.state.particles.length<=240);assert(T.state.lightning.length<=48);assert(T.state.units.every(u=>[u.x,u.y,u.hpNow].every(Number.isFinite)));R.rewardNext();if(run.phase==='bossRune')R.skipBoss();R.next();battles++;
 }
 assert.equal(run.phase,'ended');assert.equal(run.result.completed,true);
}
console.log('PASS:',battles,'real battles, all 11 factions and bosses, finite objects, full-run completion');
// Unit targeting, combat damage, mummy repair budget and telegraphs.
const {R,T,D}=engine(4),run=R.get();run.runes=[];T.prepareEncounter(run.encounter);T.state.mode='battle';
const mk=(id,team,x,y)=>T.makeSoldier([...D.enemies,...D.heroes].find(u=>u.id===id),team,x,y);
let a=mk('volkhv','rus',2,4),b=mk('l_shield','enemy',5,4);b.hp=b.hpNow=1000;T.state.units=[a,b];T.attack(a,b);assert.equal(b.hpNow,1000);T.updateLightning(.17);assert.equal(b.hpNow,940);
// Direct ability API avoids rendering or timing stubs and checks damage is delayed.
let time=0,units=[],spawned=0;const hazardsDamage=[];
const api={units:()=>units,time:()=>time,spawn(d,team,p){spawned++;const u={...d,team,x:p.x,y:p.y,hpNow:d.hp};units.push(u);return u},damage(t,n,magic,src){hazardsDamage.push(n);t.hpNow-=n}};
let C=engine().ctx.window.RUS_FACTION_COMBAT;
for(const boss of D.newBosses){
 spawned=0;time=0;units=[{...D.enemies.find(u=>u.id===boss.unit),team:'enemy',bossKey:boss.key,hpNow:2000,armyScale:1,x:8,y:4},{...D.heroes[0],team:'rus',hpNow:100000,x:3,y:4}];
 const fx=C.create(api);fx.initialize();time=4;fx.tick(time);assert(fx.hazards.length>0,boss.key);const damageBefore=hazardsDamage.length;time=4.5;fx.tick(time);assert.equal(hazardsDamage.length,damageBefore,'warning window');assert(fx.guard());assert(!fx.guard());time=7;fx.tick(time);assert(hazardsDamage.length>damageBefore,'area attack hits');
 for(time=8;time<200;time+=.5)fx.tick(time);assert(spawned<=boss.summons,boss.key+' limited summons');fx.end();assert.equal(fx.hazards.length,0);
}
const mummy={...D.enemies.find(u=>u.id==='e_mummy'),hpNow:0,team:'enemy'},repair={...D.enemies.find(u=>u.id==='r_repair'),hpNow:61,x:4,y:4,team:'enemy'},injured={...D.enemies.find(u=>u.id==='r_assault'),hpNow:1,x:4,y:5,team:'enemy'};
units=[mummy,repair,injured];time=0;const fx=C.create(api);assert(fx.death(mummy,false,null));assert(!fx.death(mummy,false,null));for(time=0;time<100;time+=.5)fx.tick(time);assert.equal(repair.repairLeft,0);assert(injured.hpNow<=81);
// Module destruction changes protection without a new health pool.
const mech={...D.enemies.find(u=>u.id==='boss_mech'),team:'enemy',bossKey:'mech',hpNow:860,x:8,y:4};
units=[mech,{...D.heroes[0],team:'rus',hpNow:10000,x:3,y:4}];time=0;const modular=C.create(api);modular.initialize();
const protectedHit=modular.beforeDamage(mech,100,false,units[1]);mech.hpNow=500;time=.5;modular.tick(time);assert.equal(mech.modules.shield,false);assert.equal(mech.hpNow,500);assert(modular.beforeDamage(mech,100,false,units[1])>protectedHit);
mech.hpNow=250;time=1;modular.tick(time);assert.equal(mech.modules.rockets,false);assert.equal(mech.hpNow,250);assert.equal(mech.hp,860);
const fearCtx=engine();fearCtx.R.get().runes=['dread'];const fearFx=fearCtx.ctx.window.RUS_FACTION_COMBAT.create(api),bear={team:'rus',id:'bear',attackCount:6},robot={...D.enemies.find(u=>u.id==='r_android'),team:'enemy',hpNow:91},human={...D.enemies.find(u=>u.id==='g_infantry'),team:'enemy',hpNow:49};
fearFx.afterAttack(bear,robot);assert(!robot.fearedUntil);fearFx.afterAttack(bear,human);assert(human.fearedUntil>time);
const coreFight=engine(15),CR=coreFight.R,CT=coreFight.T,CD=coreFight.D;CT.prepareEncounter(CR.get().encounter);CT.state.selected='militia';CT.placeAt(1,4);CT.startBattle();const core=CT.makeSoldier({...CD.enemies.find(u=>u.id==='boss_mech'),bossKey:'mech'},'enemy',9,4);core.hpNow=0;CT.state.units.push(core);CT.tick(1/30);assert.equal(CT.state.mode,'win','destroying mech core ends battle with escorts still alive');
console.log('PASS: 5 boss telegraphs/guard, finite summons, repair cap, mummy one-time revival, delayed lightning and damage');
// No artificial buffs: record actual strategy outcomes to identify universally dominant builds.
const summary={};
for(const style of ['mixed','militia','riders','magic','bears']){
 const results=[];
 for(let seed=1;seed<=5;seed++){
  const {R,T,D}=engine(seed*19),run=R.get();run.runes=style==='bears'?['veles','goida','peasants','pack']:style==='riders'?['cavalry','pikes','scouts','svarog']:style==='magic'?['staff','fury','focus','ward']:style==='militia'?['goida','peasants','beard','ancestors']:['ancestors','svarog','pikes','staff'];
  let won=0;
  while(run.phase==='prep'){
   T.prepareEncounter(run.encounter);formation(R,T,D,style);T.startBattle();assert.equal(T.state.mode,'battle');simulate(T);if(T.state.mode!=='win')break;won++;R.rewardNext();if(run.phase==='bossRune')R.skipBoss();R.next();
  }
  results.push(won);
 }
 summary[style]=results;
}
console.log('BALANCE (wins / 12; five fixed seeds, no purchases):',JSON.stringify(summary));
assert(!Object.values(summary).some(results=>results.every(wins=>wins===12)),'a universally winning build needs review');
