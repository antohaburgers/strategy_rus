/* Abilities plug into the same damage, spawn and movement APIs as ordinary attacks. */
(() => {
'use strict';
function create(api){
 const D=window.RUS_DATA,R=window.RUS_RUN,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 let closed=false,nextAura=0,guardUntil=0,guardReady=0;const hazards=[];
 const living=team=>api.units().filter(u=>u.hpNow>0&&u.team===team);
 function sound(kind){window.RUS_AUDIO?.effect?.(kind)}
 function summon(u,id,count){
  for(let i=0;i<count&&(u.supportLeft||0)>0;i++){
   u.supportLeft--;const d=D.enemies.find(v=>v.id===id),scale=u.armyScale||1;
   if(d)api.spawn({...d,hp:Math.round(d.hp*scale),damage:Math.round(d.damage*scale)},'enemy',u,{summoned:true});
  }
 }
 function warn(u,target,kind,delay,damage,radius=1.2,line=false,magic=false){
  if(hazards.length>=16)return;
  const dx=target.x-u.x,dy=target.y-u.y,len=Math.hypot(dx,dy)||1;
  const end=line?{x:Math.max(.2,Math.min(11.8,u.x+dx/len*10)),y:Math.max(.2,Math.min(9.8,u.y+dy/len*10))}:{x:target.x,y:target.y};
  hazards.push({source:u,x:end.x,y:end.y,sx:u.x,sy:u.y,kind,at:api.time()+delay,expires:api.time()+delay+.5,damage,radius,line,magic,hit:false});
  u.specialCastUntil=api.time()+delay;u.abilityFlash=delay;sound('warning');
 }
 function cast(u,target,id){const a=D.attackSpecs[id];warn(u,target,id,a.delay,a.damage,a.radius,!!a.line,!!a.magic)}
 function lineDistance(v,h){const dx=h.x-h.sx,dy=h.y-h.sy,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((v.x-h.sx)*dx+(v.y-h.sy)*dy)/l)):0;return Math.hypot(v.x-h.sx-dx*t,v.y-h.sy-dy*t)}
 function resolve(h){
  if(h.source.hpNow<=0)return;const u=h.source;
  for(const v of living(u.team==='rus'?'enemy':'rus'))if((h.line?lineDistance(v,h):Math.hypot(v.x-h.x,v.y-h.y))<=h.radius){
   api.damage(v,h.damage,h.magic,u,true);
   if(h.kind==='roar'&&v.hpNow>0)v.stunnedUntil=api.time()+.8;
  }
  if(h.kind==='charge'){
   // Traverse the route through the common collision-aware movement implementation.
   u.chargeGoal={x:h.x,y:h.y};u.chargeUntil=api.time()+1.1;u.vulnerableFrom=api.time()+1.1;u.vulnerableUntil=api.time()+4.1;
  }
  if(['beam','laser'].includes(h.kind))u.vulnerableUntil=api.time()+3;
  sound(({shell:'blast',rocket:'blast',beam:'laser',laser:'laser',charge:'horse',sand:'magic',roar:'roar',tail:'metal'})[h.kind]||u.sound||'metal');
 }
 function initialize(){for(const u of living('enemy'))if(u.bossKey){u.nextSpecial=4;u.specialIndex=0;u.supportLeft=D.newBosses.find(b=>b.key===u.bossKey)?.summons||0;if(u.bossKey==='mech')u.modules={shield:true,rockets:true}}}
 function bossTick(u,time){
  if(u.bossKey==='mech'){
   if(u.modules.shield&&u.hpNow/u.hp<=.65){u.modules.shield=false;u.abilityFlash=.9;sound('metal')}
   if(u.modules.rockets&&u.hpNow/u.hp<=.35){u.modules.rockets=false;u.abilityFlash=.9;sound('blast')}
  }
  if(time<(u.nextSpecial||4)||time<(u.specialCastUntil||0))return;
  const targets=living('rus');if(!targets.length)return;
  let target=targets[(u.specialIndex||0)%targets.length];u.specialIndex=(u.specialIndex||0)+1;
  const turn=u.specialIndex;
  u.nextSpecial=time+(D.newBosses.find(b=>b.key===u.bossKey)?.cooldown||7);
  if(u.bossKey==='tiger'){
   target=targets.slice().sort((a,b)=>b.hp-a.hp)[0];cast(u,target,'shell');if(turn<=2)summon(u,'g_infantry',2);
  }else if(u.bossKey==='kaiju'){
   if(turn%3===1)cast(u,target,'beam');
   else if(turn%3===2)cast(u,u,'tail');
   else cast(u,u,'roar');
  }else if(u.bossKey==='hussar'){
   cast(u,target,'charge');if(turn<=2)summon(u,'w_hussar',1);
  }else if(u.bossKey==='pharaoh'){
   cast(u,target,'sand');
   if(turn===1)summon(u,'e_priest',2);else summon(u,'e_mummy',2);
   for(const t of targets){t.cursedUntil=time+3}
  }else if(u.bossKey==='mech'){
   if(turn%2&&u.modules.rockets&&(u.volleys||0)<D.attackSpecs.rocket.maxVolleys){cast(u,target,'rocket');u.volleys=(u.volleys||0)+1}
   else cast(u,target,'laser');
   if(turn<=3)summon(u,'r_drone',1);
  }else if(u.bossKey==='ancient')warn(u,target,'tail',1.6,36,1.55);
 }
 function tick(time){
  if(closed)return;
  for(const h of hazards)if(!h.hit&&time>=h.at){h.hit=true;resolve(h)}
  for(let i=hazards.length-1;i>=0;i--)if(time>hazards[i].expires||hazards[i].source.hpNow<=0)hazards.splice(i,1);
  if(time>=nextAura){
   nextAura=time+.5;
   for(const u of living('enemy')){
    if(u.aura)for(const v of living('enemy').filter(v=>dist(u,v)<=2.8)){
     if(u.aura==='might')v.mightUntil=time+.7;
     if(u.aura==='haste'){v.hasteUntil=time+.7;v.hasteAmount=.18}
     if(u.aura==='charge'&&v.mounted)v.mightUntil=time+.7;
     if(u.aura==='ward')v.wardUntil=time+.7;
    }
    if(u.aura==='curse')for(const v of living('rus').filter(v=>dist(u,v)<=3.5))v.cursedUntil=time+.7;
    if(u.repair){
     u.repairLeft??=u.repair;
     const ally=living('enemy').filter(v=>v!==u&&v.machine&&v.hpNow<v.hp&&dist(u,v)<=3).sort((a,b)=>a.hpNow/a.hp-b.hpNow/b.hp)[0];
     if(ally&&u.repairLeft>0){const n=Math.min(8,u.repairLeft,ally.hp-ally.hpNow);ally.hpNow+=n;u.repairLeft-=n;u.abilityFlash=.35}
    }
   }
  }
  for(const u of living('enemy'))if(u.bossKey)bossTick(u,time);
 }
 function attack(u,t){
  if(u.telegraph){warn(u,t,u.lob?'shell':u.id==='j_master'?'katana':'fist',u.telegraph,u.damage,u.splash||.8,false,u.magic);u.attackCount++;u.wait=u.cooldown;return true}
  return false;
 }
 function beforeDamage(t,amount,magic,source){
  if(t.dodge&&!magic){t.incomingCount=(t.incomingCount||0)+1;if(t.incomingCount%t.dodge===0){t.abilityFlash=.25;return 0}}
  if(t.team==='rus'&&api.time()<guardUntil)amount*=.35;
  if(t.team==='rus'&&magic&&R.activeRunes().includes('ward'))amount*=.8;
  if(t.bossKey==='pharaoh'&&living('enemy').some(v=>v.id==='e_priest'&&v.summoned))amount*=.65;
  if(t.bossKey==='mech'&&t.modules?.shield)amount*=.8;
  if((t.vulnerableUntil||0)>api.time()&&api.time()>=(t.vulnerableFrom||0))amount*=1.4;
  if(source?.team==='rus'){
   const active=R.activeRunes();
   if(magic&&t.machine&&active.includes('stormiron'))amount*=1.3;
   if(source.id==='bogatyr'&&t.bossKey&&active.includes('duelist'))amount*=1.35;
  }
  return amount;
 }
 function death(t,magic,source){
  if(t.aura==='might')for(const v of living('enemy'))v.mightUntil=0;
  if(t.revive&&!t.raised&&!(magic&&source?.team==='rus'&&R.activeRunes().includes('silence'))){t.raised=true;t.hpNow=Math.round(t.hp*.24);t.deathHandled=false;t.wait=1.2;t.electric=.5;return true}
  return false;
 }
 function afterAttack(u,t){
  if(u.splash)for(const v of living(t.team).filter(v=>v!==t&&dist(t,v)<=u.splash).slice(0,8))api.damage(v,u.damage*.55,false,u,true);
  if(u.antiCavalry&&(t.mounted||t.shape?.includes('horse')||t.id==='rider'))api.damage(t,u.damage*(u.antiCavalry-1),false,u,true);
  if(u.team==='rus'&&u.id==='bear'&&u.attackCount%6===0&&R.activeRunes().includes('dread')&&!t.machine){t.fearedUntil=api.time()+1}
 }
 function guard(){if(closed||api.time()<guardReady)return false;guardUntil=api.time()+2.2;guardReady=api.time()+9;sound('magic');return true}
 function status(){return {guardUntil,guardReady}}
 return {initialize,tick,attack,beforeDamage,death,afterAttack,guard,status,hazards,end(){closed=true;hazards.length=0}};
}
window.RUS_FACTION_COMBAT={create};
})();
