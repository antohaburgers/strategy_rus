/* Integration: the existing pathfinder, movement, damage and rune hooks run at 30 Hz. */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path'),root=path.resolve(__dirname,'..');
function engine(seed=17){
 const elements=new Map(),noop=()=>{},storage={};const context=new Proxy({},{get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop:noop}):noop,set:()=>true});
 function el(id){if(!elements.has(id))elements.set(id,{id,style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},getContext:()=>context,getBoundingClientRect:()=>({width:844,height:390,left:0,top:0}),querySelectorAll:()=>[],querySelector:()=>el('cost'),addEventListener:noop,append:noop,add:noop,setAttribute:noop});return elements.get(id)}
 const ctx={window:{dispatchEvent:noop,addEventListener:noop,RUS_ART:{draw:noop}},document:{getElementById:el,createElement:()=>el('el'+Math.random()),body:el('body')},Event:class{},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},Math,Date,performance:{now:()=>0},requestAnimationFrame:noop,console};vm.createContext(ctx);
 for(const f of ['game-data.js','roguelike.js','rune-effects.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
 let game=fs.readFileSync(path.join(root,'game.js'),'utf8').replace('window.RUS_BATTLE={','window.TEST={state,makeSoldier,attack,applyDamage,updateLightning,tick,prepareEncounter,placeAt,startBattle,clearArmy,spawn};window.RUS_BATTLE={');vm.runInContext(game,ctx);
 const R=ctx.window.RUS_RUN,T=ctx.window.TEST,D=ctx.window.RUS_DATA;R.newRun();R.get().seed=R.get().rng=seed;R.get().startChoices=['ancestors','svarog','goida'];R.chooseStart('ancestors');return {R,T,D,ctx};
}
function formation(T){T.state.selected='volkhv';T.placeAt(1,4);T.state.selected='shield';T.placeAt(3,4);T.placeAt(3,5);T.state.selected='archer';T.placeAt(1,5);T.state.selected='militia';for(let y=1;y<9;y++){T.placeAt(2,y);if(T.state.placed.reduce((n,p)=>n+1,0)>25)break}}
for(let seed=1;seed<=3;seed++){
 const {R,T}=engine(seed);
 for(let battle=1;battle<=35;battle++){
  const run=R.get();run.runes=R.runes.slice((battle%4)*5,(battle%4)*5+5).map(r=>r.id);if(battle%7===0)run.runes=['wisdom','hyperborea','greatness','immortal','veles'];
  T.prepareEncounter(run.encounter);formation(T);T.startBattle();assert.equal(T.state.mode,'battle');
  // Keep this a stability/progression test; small separate fights below check balance.
  for(const u of T.state.units.filter(u=>u.team==='rus')){u.hp*=100;u.hpNow=u.hp;u.damage*=100}
  let frames=0;while(T.state.mode==='battle'&&frames++<2300)T.tick(1/30);
  assert.equal(T.state.mode,'win','fight '+battle+' should complete');assert(T.state.units.length<=140);assert(T.state.lightning.length<=48);assert(T.state.particles.length<=240);assert(T.state.units.every(u=>Number.isFinite(u.hpNow)&&Number.isFinite(u.x)&&u.x>=0&&u.x<12&&u.y>=0&&u.y<10));
  assert.equal(run.stats.wins,battle);R.rewardNext();if(run.phase==='bossRune')R.skipBoss();assert.equal(run.phase,'shop');R.next();
 }
 assert.equal(R.get().stats.wins,35);assert.equal(R.get().stats.bosses,7);
}
console.log('PASS: 3 × 35 actual simulated battles: AI/pathfinding, damage, summons, runes, boss fights, bounded objects, rewards and next encounter');
const {R,T,D}=engine();T.prepareEncounter(R.get().encounter);R.get().runes=[];
const caster=T.makeSoldier(D.heroes.find(u=>u.id==='volkhv'),'rus',2,4),base={...D.enemies.find(u=>u.id==='l_shield'),hp:1000};const target=T.makeSoldier(base,'enemy',5,4),near=T.makeSoldier({...base,id:'z_shambler'},'enemy',5.5,4),far=T.makeSoldier(base,'enemy',10,4);T.state.units=[caster,target,near,far];T.attack(caster,target);assert.equal(target.hpNow,1000);T.updateLightning(.17);assert.equal(target.hpNow,940);assert.equal(near.hpNow,993);assert.equal(far.hpNow,1000);assert.equal(caster.wait,2.5);T.updateLightning(.2);assert.equal(target.hpNow,940);
console.log('PASS: targeted volkhv delay, +75% lizard damage, armour bypass, 22% secondary damage and range');
// An intentionally weak formation must finish the run, with no retry path.
T.prepareEncounter(R.get().encounter);T.state.selected='militia';T.placeAt(1,4);T.startBattle();for(const u of T.state.units.filter(u=>u.team==='rus'))u.hpNow=1;let frames=0;while(T.state.mode==='battle'&&frames++<2300)T.tick(1/30);assert.equal(R.get().phase,'ended');assert.equal(R.get().coins,0);assert.equal(R.get().runes.length,0);
console.log('PASS: real defeat resets the run; no replay/reward transition available');
