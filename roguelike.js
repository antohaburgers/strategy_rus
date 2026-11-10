/* Run state and economy. One atomic local save, deterministic encounters and offers.
 * Combat never writes rewards: only a guarded battle -> reward transition can. */
(() => {
'use strict';
const D=window.RUS_DATA,KEY='rus-roguelike-v1',MAX_SLOTS=5;
const rarity=[{name:'Обычная',price:35,color:'#b4bdb4'},{name:'Необычная',price:55,color:'#88c68b'},{name:'Редкая',price:90,color:'#78b8ef'},{name:'Эпическая',price:150,color:'#c39be6'},{name:'Легендарная',price:220,color:'#edcb70'}];
const raw=[
 ['ancestors','Сила предков',0,'+15% к урону всех русов.'],
 ['svarog','Щит Сварога',0,'+20% к максимальному здоровью русов.'],
 ['bast','Быстрые лапти',0,'+15% к скорости передвижения русов.'],
 ['goida','Гойда',0,'Ополченцы, щитоносцы и копейщики стоят на 10% дешевле.'],
 ['beard','Борода богатыря',0,'Бойцы ближнего боя получают +15% здоровья.'],
 ['fury','Ярость Перуна',1,'Каждая десятая обычная атака русов вызывает молнию на 24 урона. Счётчик общий для армии.'],
 ['berserk','Кровь берсерка',1,'При здоровье ниже 30% скорость атаки бойца увеличивается на 50%.'],
 ['arrows','Длинные стрелы предков',1,'Дальность лучников и волхвов увеличена на 20%.'],
 ['tribute','Золотая дань',1,'+15 монет за каждую победу.'],
 ['cunning','Воинская хитрость',1,'Первые три бойца в текущем построении стоят на 20% дешевле.'],
 ['wrath','Гнев Перуна',2,'Дополнительные молнии рун поражают цель и двух ближайших врагов. Цепи волхва наносят 40% урона вместо 22%.'],
 ['veles','Благословение Велеса',2,'Каждый пятый боец в построении призывает медведя на 20 секунд. Не более трёх медведей одновременно.'],
 ['hyperfury','Гиперборейская ярость',2,'+40% урона бойцов ближнего боя, −20% максимального здоровья всех русов.'],
 ['staff','Громовой посох',2,'Волхвы атакуют на 25% быстрее.'],
 ['immortal','Бессмертная рать',2,'Первый погибший русский боец один раз за бой возрождается с 50% здоровья.'],
 ['curse','Проклятие ящеров',3,'+100% урона всех русов, −50% максимального здоровья.'],
 ['sky','Небесная рать',3,'Каждая пятая основная атака волхва вызывает дополнительную молнию.'],
 ['call','Зов предков',3,'Каждые 30 секунд появляется бесплатный ополченец. Не более пяти призванных бойцов одновременно.'],
 ['madness','Безумие богатыря',3,'При гибели русского бойца союзники в радиусе трёх клеток получают +25% скорости атаки на 5 секунд. Повтор обновляет время.'],
 ['wisdom','Мудрость предков',4,'Каждые 15 секунд молния на 32 урона поражает до пяти случайных врагов.'],
 ['hyperborea','Гиперборея',4,'+30% к урону, здоровью и скорости атаки всех русов; +30% к стоимости найма.'],
 ['greatness','Величие предков',4,'Один раз за бой при гибели последнего русского бойца появляются три богатыря с +40% здоровья и урона.']
];
const runes=raw.map(([id,name,tier,description],i)=>({id,name,tier,description,price:rarity[tier].price,color:rarity[tier].color,rarity:rarity[tier].name,symbol:i}));
const runeMap=new Map(runes.map(r=>[r.id,r]));
const bosses=[
 {key:'khan',name:'Хан Всея Степи',faction:'Печенеги',unit:'p_horse',ability:'Каждые 12 секунд призывает двух степных налётчиков.'},
 {key:'batyr',name:'Великий Половецкий Батыр',faction:'Половцы',unit:'c_lancer',ability:'Быстро движется; каждые 8 секунд ускоряет и усиливает ближайших союзников на 5 секунд.'},
 {key:'lizard',name:'Верховный Ящер',faction:'Ящеры',unit:'l_shield',ability:'Усиленная броня; каждые 10 секунд укрепляет других ящеров на 5 секунд.'},
 {key:'koschei',name:'Кощей Бессмертный',faction:'Зомби',unit:'z_brute',ability:'Каждые 14 секунд поднимает до двух павших зомби. Каждый мертвец восстаёт один раз.'},
 {key:'ancient',name:'Великий Древний Ящер',faction:'Динозавры',unit:'d_rex',ability:'Усиленный ближний удар также поражает до трёх врагов рядом с целью.'},
 {key:'emperor',name:'Небесный Император',faction:'Китайское царство',unit:'h_guard',ability:'Каждые 10 секунд на 5 секунд ускоряет атаки всей своей армии на 35%.'}
];
const factions=[...new Set(D.maps.map(m=>m.faction))];
const defs=new Map(D.enemies.map(u=>[u.id,u]));
const clone=o=>JSON.parse(JSON.stringify(o));
const nint=(n,fallback=0)=>Number.isSafeInteger(n)&&n>=0?n:fallback;
function threat(u){return Math.sqrt(u.hp/Math.max(.3,1-u.armor)*u.damage/u.cooldown)*(u.role==='ranged'?1.18:1)*(1+(u.speed-1)*.06)}
const reference=4*threat(defs.get('p_foot'))+threat(defs.get('p_spear'));
function difficulty(cycle,boss=false){const normal=[1,1.2,1.45,1.75,2.1],big=[1.5,1.8,2.2,2.7,3.3];return (boss?big:normal)[cycle-1]||Math.min(1e8,(boss?3.3:2.1)*Math.pow(1.18,Math.min(110,cycle-5)))}
const SaveManager={
 load(){try{
  const x=JSON.parse(localStorage.getItem(KEY));
  if(!x||x.version!==1||!['start','prep','battle','reward','bossRune','shop','ended'].includes(x.phase)||!Number.isInteger(x.seed)||!Number.isInteger(x.rng)||!Array.isArray(x.runes)||!x.stats)return null;
  const validIds=ids=>Array.isArray(ids)&&new Set(ids).size===ids.length&&ids.every(id=>runeMap.has(id));
  if(!validIds(x.runes)||x.runes.length>MAX_SLOTS)return null;
  if(!Number.isSafeInteger(x.coins)||x.coins<0||!Number.isSafeInteger(x.battle)||x.battle<1||!Number.isSafeInteger(x.cycle)||x.cycle<1)return null;
  if(!['wins','bosses','maxCycle','earned'].every(k=>Number.isSafeInteger(x.stats[k])&&x.stats[k]>=0))return null;
  if(x.phase==='start'&&(!validIds(x.startChoices)||x.startChoices.length!==3||x.startChoices.some(id=>runeMap.get(id).tier>1)))return null;
  if(['prep','battle','reward','bossRune','shop'].includes(x.phase)){
   const e=x.encounter;if(!e||!D.maps.some(m=>m.id===e.mapId)||!Array.isArray(e.enemies)||!e.enemies.length||e.enemies.length>36||!Array.isArray(e.obstacles)||!Number.isFinite(e.budget)||e.budget<1||!e.key)return null;
   if(e.enemies.some(u=>!defs.has(u.id)||!Number.isInteger(u.x)||!Number.isInteger(u.y)||u.x<0||u.x>=D.W||u.y<0||u.y>=D.H))return null;
  }
  if(x.phase==='shop'&&(!x.shop||!validIds(x.shop.offers)||!Number.isSafeInteger(x.shop.refreshes)||x.shop.refreshes<0))return null;
  if(x.phase==='bossRune'&&!validIds(x.bossChoices))return null;
  if(['reward','ended'].includes(x.phase)&&!x.result)return null;
  if(x.pending&&(!runeMap.has(x.pending.id)||!['shop','boss'].includes(x.pending.source)||x.pending.price!==(x.pending.source==='shop'?runeMap.get(x.pending.id).price:0)))return null;
  if(!x.lastMaps||!x.seen||!Array.isArray(x.plan)||!Array.isArray(x.formation))return null;
  return x;
 }catch{return null}},
 save(value){try{localStorage.setItem(KEY,JSON.stringify(value));return true}catch{return false}}
};
let run=SaveManager.load(),saveFailed=false;
if(run?.phase==='battle'){run.phase='prep';SaveManager.save(run)}
function random(){run.rng=(run.rng+0x6D2B79F5)>>>0;let t=run.rng;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}
function shuffled(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function publish(){run.revision=nint(run.revision)+1;saveFailed=!SaveManager.save(run);window.dispatchEvent(new Event('rus:run'))}
function pick(pool,count){return shuffled(pool).slice(0,count).map(r=>r.id)}
function newRun(){
 const seed=(Math.random()*4294967294>>>0)+1;
 run={version:1,id:Date.now().toString(36)+'-'+seed.toString(36),seed,rng:seed,revision:0,phase:'start',cycle:1,battle:1,coins:10,runes:[],startChoices:[],bossChoices:[],plan:[],lastFaction:null,lastBoss:null,lastMaps:{},seen:{},encounter:null,shop:null,pending:null,formation:[],stats:{wins:0,bosses:0,maxCycle:1,earned:0},result:null};
 run.startChoices=pick(runes.filter(r=>r.tier<=1),3);publish();return true;
}
function fair(pool){return shuffled(pool).sort((a,b)=>(run.seen[a]||0)-(run.seen[b]||0))}
function makePlan(){
 const plan=[];let previous=run.lastFaction;
 for(let i=0;i<4;i++){const f=fair(factions.filter(f=>f!==previous&&!plan.some(p=>p.faction===f)))[0];plan.push({faction:f,boss:null});run.seen[f]=(run.seen[f]||0)+1;previous=f}
 const options=bosses.filter(b=>b.faction!==previous&&b.key!==run.lastBoss),f=fair(options.map(b=>b.faction))[0],boss=options.find(b=>b.faction===f);
 plan.push({faction:boss.faction,boss:boss.key});run.seen[boss.faction]=(run.seen[boss.faction]||0)+1;run.lastBoss=boss.key;run.plan=plan;
}
function encounter(){
 const slot=(run.battle-1)%5;if(slot===0||run.plan.length!==5)makePlan();
 const planned=run.plan[slot],boss=bosses.find(b=>b.key===planned.boss),maps=D.maps.filter(m=>m.faction===planned.faction);
 const options=maps.filter(m=>m.id!==run.lastMaps[planned.faction]),map=shuffled(options.length?options:maps)[0]||D.maps[0];
 run.lastMaps[planned.faction]=map.id;run.lastFaction=planned.faction;
 const target=reference*difficulty(run.cycle,!!boss)*(boss?1:1+slot*.07),army=[];
 const ids=[...new Set(maps.flatMap(m=>m.enemies.map(e=>e.id)))];
 const pool=ids.map(id=>defs.get(id)).filter(u=>run.cycle>=2||(!u.big&&u.armor<.2));
 if(!pool.length)pool.push(defs.get(ids[0]));
 let used=0;
 if(boss){
  const base=defs.get(boss.unit),b={...base,hp:base.hp*3.2,damage:base.damage*1.2,speed:base.speed*(boss.key==='batyr'?1.3:1),armor:boss.key==='lizard'?.38:base.armor};
  const scale=target*.58/threat(b);b.hp=Math.max(120,Math.round(b.hp*scale));b.damage=Math.max(8,Math.round(b.damage*scale));
  army.push({id:base.id,bossKey:boss.key,bossName:boss.name,stats:{hp:b.hp,damage:b.damage,speed:b.speed,armor:b.armor}});used+=threat(b);
 }
 const countLimit=boss?25:30;
 while(army.length<countLimit){const available=pool.filter(u=>threat(u)<=target-used+reference*.04);if(!available.length)break;const d=available[Math.floor(random()*available.length)];army.push({id:d.id});used+=threat(d)}
 if(!army.length){army.push({id:pool[0].id});used=threat(pool[0])}
 // Only residual power scales stats once unit count is capped, never all three knobs.
 const scale=Math.max(1,target/used);
 const rows=shuffled([0,1,2,3,4,5,6,7,8,9]),blocked=new Set(map.obstacles.filter(o=>['rock','tree','water'].includes(o.type)).map(o=>o.x+','+o.y));
 const cells=[];for(let x=8;x<12;x++)for(const y of rows)if(!blocked.has(x+','+y))cells.push({x,y});
 run.encounter={...clone(map),id:run.battle,key:run.id+':'+run.battle,mapId:map.id,boss:boss?clone(boss):null,cycle:run.cycle,slot:slot+1,power:target,budget:Math.min(230,90+slot*18+(run.cycle-1)*12),enemyScale:scale,enemies:army.slice(0,cells.length).map((e,i)=>({...e,...cells[i]}))};
 run.formation=[];run.phase='prep';run.shop=null;run.pending=null;run.bossChoices=[];
}
function chooseStart(id){if(run?.phase!=='start'||!run.startChoices.includes(id))return false;run.runes=[id];encounter();publish();return true}
function begin(formation){if(run?.phase!=='prep'||!formation?.length)return false;run.formation=clone(formation);run.phase='battle';publish();return true}
const rewards=[30,30,35,40,70];
function victory(key){
 if(run?.phase!=='battle'||run.encounter.key!==key)return false;
 const amount=rewards[(run.battle-1)%5]+(run.runes.includes('tribute')?15:0);run.coins+=amount;run.stats.earned+=amount;run.stats.wins++;if(run.encounter.boss)run.stats.bosses++;
 run.result={battle:run.battle,amount,balance:run.coins,boss:!!run.encounter.boss};run.phase='reward';publish();return true;
}
function defeat(key){
 if(run?.phase!=='battle'||run.encounter.key!==key)return false;
 run.result={...clone(run.stats),runes:run.runes.slice(),battle:run.battle,cycle:run.cycle};run.runes=[];run.coins=0;run.battle=1;run.cycle=1;run.encounter=null;run.shop=null;run.pending=null;run.plan=[];run.formation=[];run.phase='ended';publish();return true;
}
function stock(){
 const available=runes.filter(r=>!run.runes.includes(r.id)&&(r.tier<4||run.cycle>=3));
 const ids=[];if(run.cycle<=2){const cheap=shuffled(available.filter(r=>r.tier===0));if(cheap.length)ids.push(cheap[0].id)}
 const weighted=[];for(const r of available.filter(r=>!ids.includes(r.id)))for(let i=0;i<[8,5,3,2,1][r.tier];i++)weighted.push(r);
 while(ids.length<3&&weighted.length){const r=weighted[Math.floor(random()*weighted.length)];ids.push(r.id);for(let i=weighted.length-1;i>=0;i--)if(weighted[i].id===r.id)weighted.splice(i,1)}
 return ids;
}
function openShop(){if(run?.phase==='shop')return true;if(!['reward','bossRune'].includes(run?.phase))return false;run.shop={offers:stock(),refreshes:0};run.pending=null;run.phase='shop';return true}
function rewardNext(){
 if(run?.phase!=='reward')return false;
 if(run.encounter.boss){run.bossChoices=pick(runes.filter(r=>[2,3].includes(r.tier)&&!run.runes.includes(r.id)),3);run.phase='bossRune'}else openShop();publish();return true;
}
function grant(id,source){
 const r=runeMap.get(id);if(!r||run.runes.includes(id)||run.pending)return false;
 if(source==='shop'&&(run.phase!=='shop'||!run.shop.offers.includes(id)||run.coins<r.price))return false;
 if(source==='boss'&&(run.phase!=='bossRune'||!run.bossChoices.includes(id)))return false;
 run.pending={id,source,price:source==='shop'?r.price:0};
 if(run.runes.length<MAX_SLOTS)return resolvePending(-1);
 publish();return true;
}
function resolvePending(index){
 const p=run?.pending;if(!p||!['shop','bossRune'].includes(run.phase))return false;
 if(index===null){run.pending=null;publish();return true}
 if(run.runes.length>=MAX_SLOTS&&(!Number.isInteger(index)||index<0||index>=MAX_SLOTS))return false;
 if(run.coins<p.price)return false;
 run.coins-=p.price;if(run.runes.length>=MAX_SLOTS)run.runes.splice(index,1,p.id);else run.runes.push(p.id);
 if(p.source==='shop')run.shop.offers=run.shop.offers.filter(id=>id!==p.id);
 run.pending=null;if(p.source==='boss')openShop();publish();return true;
}
function skipBoss(){if(run?.phase!=='bossRune')return false;run.pending=null;openShop();publish();return true}
function sell(id){if(run?.phase!=='shop'||run.pending||!run.runes.includes(id))return false;run.runes=run.runes.filter(x=>x!==id);run.coins+=Math.floor(runeMap.get(id).price*.4);publish();return true}
function refreshPrice(){return run?.shop?Math.min(30,(run.shop.refreshes+1)*10):10}
function refresh(){const price=refreshPrice();if(run?.phase!=='shop'||run.pending||run.coins<price)return false;run.coins-=price;run.shop.refreshes++;run.shop.offers=stock();publish();return true}
function next(){if(run?.phase!=='shop'||run.pending)return false;run.battle++;run.cycle=Math.floor((run.battle-1)/5)+1;run.stats.maxCycle=Math.max(run.stats.maxCycle,run.cycle);encounter();publish();return true}
function saveFormation(formation){if(run?.phase!=='prep')return;run.formation=clone(formation);publish()}
function totals(active,def){
 const has=id=>active.includes(id),melee=def.role!=='ranged';
 return {damage:Math.max(.1,1+(has('ancestors')?.15:0)+(has('hyperfury')&&melee?.4:0)+(has('curse')?1:0)+(has('hyperborea')?.3:0)),hp:Math.max(.1,1+(has('svarog')?.2:0)+(has('beard')&&melee?.15:0)-(has('hyperfury')?.2:0)-(has('curse')?.5:0)+(has('hyperborea')?.3:0)),speed:1+(has('bast')?.15:0),attackSpeed:1+(has('staff')&&def.magic?.25:0)+(has('hyperborea')?.3:0),range:1+(has('arrows')&&def.role==='ranged'?.2:0)};
}
function modify(def,active=run?.runes||[]){const m=totals(active,def);return {...def,hp:Math.max(1,Math.round(def.hp*m.hp)),damage:Math.max(1,Math.round(def.damage*m.damage)),speed:def.speed*m.speed,cooldown:Math.max(.12,def.cooldown/m.attackSpeed),baseDamage:def.damage,runeAttackBonus:m.attackSpeed-1,range:Math.min(Math.hypot(D.W,D.H),def.range*m.range)}}
function cost(def,index,active=run?.runes||[]){let modifier=1;if(active.includes('goida')&&['militia','shield','spear'].includes(def.id))modifier-=.1;if(active.includes('cunning')&&index<3)modifier-=.2;if(active.includes('hyperborea'))modifier+=.3;return Math.max(1,Math.round(def.cost*Math.max(.1,modifier)))}
window.RUS_RUN={get:()=>run,hasRun:()=>!!run&&run.phase!=='ended',saveFailed:()=>saveFailed,newRun,chooseStart,begin,victory,defeat,rewardNext,buy:id=>grant(id,'shop'),chooseBoss:id=>grant(id,'boss'),resolvePending,skipBoss,sell,refresh,refreshPrice,next,saveFormation,modify,cost,rarity,runes,runeMap,bosses,MAX_SLOTS,SaveManager,DifficultyManager:{coefficient:difficulty,threat},EncounterGenerator:{reference}};
})();
