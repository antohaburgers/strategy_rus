const assert=require('assert'),engine=require('./engine.cjs');
const formation=(R,D)=>{const army=[];for(const [id,n] of Object.entries(R.rules().required||{militia:1}))for(let i=0;i<n;i++)army.push({id,x:1.5,y:army.length+.5});return army};
const seen=new Set();
for(let seed=1;seed<=60;seed++){
 const {R,D}=engine(seed),run=R.get();assert.equal(R.slots(),4);assert.equal(D.factions.length,11);assert.equal(D.maps.length,44);assert.equal(R.runes.length,37);
 const plan=run.chapterPlan.slice();assert.equal(new Set(plan).size,3);
 let coins=10;
 for(let i=0;i<12;i++){
  const e=run.encounter,army=formation(R,D);seen.add(e.faction);assert.equal(e.slot,i%4+1);assert.equal(!!e.boss,i%4===3);assert(!R.validate(army));assert(R.begin(army));assert(R.victory(e.key));assert(!R.victory(e.key));coins+=[21,26,28,56][i%4];assert.equal(run.coins,coins);
  assert(R.rewardNext());if(e.boss){assert.equal(run.phase,'bossRune');assert(R.bossGift('coins'));coins+=42}else assert.equal(run.phase,'shop');assert(R.next());
 }
 assert.equal(run.phase,'ended');assert.equal(run.result.completed,true);assert.equal(run.stats.bosses,3);assert.equal(run.stats.wins,12);assert.deepStrictEqual(run.chapterPlan,plan);
}
assert.equal(seen.size,11);
const {R,T,D,storage}=engine(8),run=R.get();
run.encounter.rules={...D.trials.riders};assert(R.validate([{id:'militia',x:.5,y:.5}]).includes('Конный дружинник'));assert(!R.begin([{id:'militia',x:.5,y:.5}]));assert(!R.validate([{id:'rider',x:.5,y:.5},{id:'rider',x:1.5,y:.5}]));
run.encounter.rules={...D.trials.six};assert(!R.available(D.heroes[0],Array(6).fill({id:'militia'})));
run.encounter.rules={...D.trials.noMage};assert(!R.available(D.heroes.find(h=>h.id==='volkhv'),[]));
run.encounter.rules={...D.trials.none};run.runes=['ancestors','svarog','bast','beard'];R.begin([{id:'militia',x:.5,y:.5}]);R.victory(run.encounter.key);R.rewardNext();run.coins=1000;run.shop.offers=['pikes'];assert(R.buy('pikes'));assert(run.pending);const before=run.coins;assert(R.resolvePending(0));assert.equal(run.coins,before-R.runeMap.get('pikes').price);assert.equal(run.runes.length,4);assert(!R.resolvePending(0));
assert(R.charm());const rune=run.runes[0];R.hammer(rune);assert.equal(run.freeUpgrades,0);assert(run.forgeMessage);assert(R.SaveManager.load());
// v1 migration preserves current encounter, balance and a grandfathered fifth rune.
const old=JSON.parse(JSON.stringify(R.get()));delete old.contentVersion;delete old.stage;delete old.slots;old.runes=['ancestors','svarog','bast','beard','fury'];old.coins=63;old.phase='prep';old.plan=[];old.formation=[{id:'militia',x:.5,y:.5}];old.encounter.rules=undefined;
const migrated=engine(1,old).R.get();assert.equal(migrated.coins,63);assert.equal(migrated.runes.length,5);assert.equal(migrated.slots,5);assert.equal(migrated.encounter.key,old.encounter.key);assert.equal(migrated.formation.length,1);
console.log('PASS: 60 complete 12-battle run transitions, all 11 factions, unique chapters/bosses, rewards once, constraints, forge, charms, slot replacement and v1 migration');
