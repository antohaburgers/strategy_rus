/* Event-driven rune and boss effects. No rendering decisions and no recursive procs.
 * All clocks belong to one battle instance; no setInterval or accumulated listeners. */
(() => {
'use strict';
const R=window.RUS_RUN;
const bear={id:'bear',name:'Медведь Велеса',hp:145,damage:19,cooldown:1.25,range:1,speed:1.6,armor:.08,role:'melee',shape:'bear',cost:0,big:true};
function create(api,active,boss){
 const equipped=new Set(active),has=id=>equipped.has(id),living=team=>api.units().filter(u=>u.hpNow>0&&u.team===team);
 let attacks=0,reborn=false,lastStand=false,nextCall=30,nextStorm=15,nextBoss=({khan:12,batyr:8,lizard:10,koschei:14,emperor:10})[boss?.key]||10,closed=false;
 const flash=id=>window.RUS_RUNE_ART?.activate(id);
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const nearest=(units,t,count,radius=Infinity)=>units.filter(v=>v!==t&&dist(v,t)<=radius).sort((a,b)=>dist(a,t)-dist(b,t)).slice(0,count);
 function proc(source,target,amount,chain=has('wrath')){if(!target||closed)return;if(target.hpNow<=0)target=nearest(living(source.team==='rus'?'enemy':'rus'),target,1)[0];if(!target)return;if(chain&&has('wrath'))flash('wrath');api.bolt(source,target,amount,chain?2:0,false)}
 function start(formation){
  for(const id of active)flash(id);
  if(!has('veles'))return;
  for(let i=4;i<formation.length;i+=5){if(living('rus').filter(u=>u.id==='bear').length>=3)break;api.spawn(bear,'rus',formation[i],{temporary:true,expiresAt:20,summoned:true})}
 }
 function attack(source,target){
  if(closed||source.team!=='rus')return;
  attacks++;
  if(has('fury')&&attacks%10===0){flash('fury');proc(source,target,24*(source.damage/(source.baseDamage||source.damage)))}
  if(has('sky')&&source.magic&&source.attackCount%5===0){flash('sky');proc(source,target,source.damage)}
  if(has('wrath')&&source.magic)flash('wrath');
 }
 function death(unit){
  if(closed||unit.team!=='rus'||unit.expired)return;
  if(has('madness')){flash('madness');for(const ally of nearest(living('rus'),unit,60,3))ally.frenzyUntil=api.time()+5}
  if(has('immortal')&&!reborn){flash('immortal');reborn=true;unit.hpNow=Math.max(1,Math.round(unit.hp*.5));unit.deadAt=null;unit.deadVisualAt=null;unit.deathHandled=false;unit.electric=.25;unit.hurt=.18;return}
  if(has('greatness')&&!lastStand&&living('rus').length===0){flash('greatness');lastStand=true;const base=window.RUS_DATA.heroes.find(u=>u.id==='bogatyr');for(let i=0;i<3;i++)api.spawn(base,'rus',unit,{summoned:true,legendary:true,boost:1.4})}
 }
 function rate(unit){
  let bonus=0;
  if(unit.team==='rus'){
   if(has('berserk')&&unit.hpNow<unit.hp*.3){bonus+=.5;if(!unit._runeBerserk){flash('berserk');unit._runeBerserk=true}}else unit._runeBerserk=false;
   if((unit.frenzyUntil||0)>api.time())bonus+=.25;
  }
  if((unit.hasteUntil||0)>api.time())bonus+=unit.hasteAmount||.25;
  return (1+(unit.runeAttackBonus||0)+bonus)/(1+(unit.runeAttackBonus||0));
 }
 function outgoing(unit){return unit&&(unit.mightUntil||0)>api.time()?1.2:1}
 function incoming(unit){return (unit.wardUntil||0)>api.time()?.8:1}
 function spawnEnemy(id,at){
  if(living('enemy').length>=36)return;
  const base=window.RUS_DATA.enemies.find(u=>u.id===id),bossUnit=api.units().find(u=>u.bossKey===boss?.key);
  const scale=bossUnit?.armyScale||1;
  api.spawn({...base,hp:Math.max(1,Math.round(base.hp*scale)),damage:Math.max(1,Math.round(base.damage*scale))},'enemy',at,{summoned:true});
 }
 function bossTick(time){
  const leader=api.units().find(u=>u.bossKey===boss?.key&&u.hpNow>0);
  if(!leader||time<nextBoss)return;
  leader.abilityFlash=.8;
  if(boss.key==='khan'){nextBoss=time+12;for(let i=0;i<2;i++)spawnEnemy('p_foot',leader)}
  else if(boss.key==='batyr'){nextBoss=time+8;for(const u of nearest(living('enemy'),leader,36,3.5).concat(leader)){u.hasteUntil=time+5;u.hasteAmount=.25;u.mightUntil=time+5}}
  else if(boss.key==='lizard'){nextBoss=time+10;for(const u of living('enemy').filter(u=>u!==leader&&u.id.startsWith('l_'))){u.wardUntil=time+5;u.mightUntil=time+5}}
  else if(boss.key==='koschei'){
   nextBoss=time+14;let raised=0;
   for(const u of api.units())if(raised<2&&u.team==='enemy'&&u.hpNow<=0&&!u.bossKey&&!u.raised&&!u.expired&&u.id.startsWith('z_')&&living('enemy').length<36){u.raised=true;u.hpNow=Math.max(1,Math.round(u.hp*.45));u.deadAt=null;u.deadVisualAt=null;u.deathHandled=false;u.electric=.4;u.target=null;u.wait=.6;raised++}
  }else if(boss.key==='emperor'){nextBoss=time+10;for(const u of living('enemy')){u.hasteUntil=time+5;u.hasteAmount=.35}}
  else nextBoss=time+10;
 }
 function splash(source,target){if(source.bossKey!=='ancient'||closed)return;for(const other of nearest(living('rus'),target,3,1.45))api.damage(other,source.damage*.4,false,source,true)}
 function tick(time){
  if(closed)return;
  for(const u of api.units())if(u.hpNow>0&&u.temporary&&time>=u.expiresAt){u.expired=true;u.hpNow=0;u.deadAt=time;u.deadVisualAt=api.fxTime();u.motion=0}
  if(has('call')&&time>=nextCall){flash('call');nextCall+=30;if(living('rus').filter(u=>u.summoned&&!u.temporary&&!u.legendary).length<5)api.spawn(window.RUS_DATA.heroes.find(u=>u.id==='militia'),'rus',{x:1.5,y:4.5},{summoned:true})}
  if(has('wisdom')&&time>=nextStorm){flash('wisdom');nextStorm+=15;const enemies=living('enemy');for(let i=enemies.length-1;i>0;i--){const j=Math.floor(api.random()*(i+1));[enemies[i],enemies[j]]=[enemies[j],enemies[i]]}const source=living('rus')[0];if(source)for(const t of enemies.slice(0,5))proc(source,t,32,false)}
  if(boss)bossTick(time);
 }
 function end(){closed=true;for(const u of api.units()){u.frenzyUntil=0;u.hasteUntil=0;u.mightUntil=0;u.wardUntil=0;u.abilityFlash=0}}
 return {start,attack,death,rate,outgoing,incoming,splash,tick,end,has,bear};
}
window.RUS_RUNE_EFFECTS={create,bear};
})();
