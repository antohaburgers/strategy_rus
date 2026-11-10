/* Русы против всех — balance + 24 maps. No external assets. */
(() => {
  const heroes = [
    {id:'militia', name:'Ополченец', short:'Ополч.', cost:8, hp:55, damage:8, cooldown:1.0, range:.75, speed:1.55, armor:0, role:'melee', shape:'sword', color:'#d8b57c'},
    {id:'shield', name:'Щитоносец', short:'Щитоносец', cost:16, hp:125, damage:10, cooldown:1.2, range:.8, speed:1.1, armor:.2, role:'melee', shape:'shield', color:'#8db3d0'},
    {id:'spear', name:'Копейщик', short:'Копейщик', cost:15, hp:78, damage:13, cooldown:1.15, range:1.45, speed:1.25, armor:0, role:'melee', shape:'spear', bonusBig:1.4, color:'#d9c28b'},
    {id:'archer', name:'Лучник', short:'Лучник', cost:20, hp:58, damage:11, cooldown:1.5, range:5, speed:1.35, armor:0, role:'ranged', shape:'bow', color:'#b0bd77'},
    {id:'rider', name:'Конный дружинник', short:'Всадник', cost:32, hp:115, damage:18, cooldown:1.15, range:1.1, speed:2.2, armor:.08, role:'melee', shape:'horse', charge:1.3, color:'#caa071'},
    {id:'bogatyr', name:'Богатырь', short:'Богатырь', cost:48, hp:215, damage:24, cooldown:1.25, range:1.25, speed:1.3, armor:.15, role:'melee', shape:'hero', color:'#ead17b'},
    {id:'volkhv',name:'Волхв',short:'Волхв',cost:36,hp:44,damage:34,cooldown:2.5,range:5.6,speed:.85,armor:0,role:'ranged',shape:'staff',magic:true,color:'#74cddb'}
  ];
  const enemies = [
    {id:'p_foot',name:'Степной налётчик',hp:54,damage:9,cooldown:.95,range:.8,speed:1.85,shape:'sword',color:'#bd704a'},
    {id:'p_spear',name:'Метатель дротиков',hp:48,damage:10,cooldown:1.65,range:3.8,speed:1.55,role:'ranged',shape:'spear',color:'#bc995b'},
    {id:'p_horse',name:'Конный налётчик',hp:98,damage:16,cooldown:1.25,range:1.1,speed:2.35,shape:'horse',charge:1.3,color:'#ba7954'},
    {id:'c_horsebow',name:'Конный лучник',hp:68,damage:11,cooldown:1.5,range:4.2,speed:2.1,role:'ranged',shape:'horsebow',color:'#bfa36d'},
    {id:'c_lancer',name:'Копейщик-всадник',hp:108,damage:19,cooldown:1.35,range:1.2,speed:2.25,shape:'horse',charge:1.3,color:'#ae6b47'},
    {id:'c_guard',name:'Ханский дружинник',hp:145,damage:17,cooldown:1.25,range:.9,speed:1.25,armor:.15,shape:'shield',color:'#95739e'},
    {id:'l_runner',name:'Чешуйчатый бегун',hp:65,damage:11,cooldown:.9,range:.8,speed:1.9,shape:'lizard',color:'#73ba79'},
    {id:'l_shield',name:'Панцирный страж',hp:155,damage:14,cooldown:1.35,range:.9,speed:.95,armor:.25,shape:'lizardShield',color:'#4a8d6d'},
    {id:'l_spitter',name:'Болотный плевун',hp:58,damage:9,cooldown:1.8,range:4.3,speed:1.2,role:'ranged',shape:'lizard',color:'#a0ce65'},
    {id:'z_shambler',name:'Ходячий мертвец',hp:95,damage:9,cooldown:1.35,range:.75,speed:.75,shape:'zombie',color:'#929e8d'},
    {id:'z_runner',name:'Одержимый',hp:65,damage:12,cooldown:1.05,range:.8,speed:1.65,shape:'zombie',color:'#aec6a3'},
    {id:'z_brute',name:'Могильный великан',hp:240,damage:22,cooldown:1.65,range:1.1,speed:.72,shape:'giant',big:true,color:'#748876'},
    {id:'d_raptor',name:'Раптор',hp:63,damage:11,cooldown:.8,range:.85,speed:2.3,shape:'raptor',color:'#8eb074'},
    {id:'d_trike',name:'Трицератопс',hp:230,damage:23,cooldown:1.6,range:1.25,speed:1.05,shape:'trike',big:true,color:'#a77e61'},
    {id:'d_rex',name:'Тираннозавр',hp:360,damage:32,cooldown:1.95,range:1.5,speed:1.15,shape:'rex',big:true,color:'#788e63'},
    {id:'h_spear',name:'Дворцовый копейщик',hp:105,damage:15,cooldown:1.25,range:1.5,speed:1.15,shape:'spear',color:'#d65f4e'},
    {id:'h_crossbow',name:'Арбалетчик',hp:60,damage:16,cooldown:1.9,range:5.3,speed:1.15,role:'ranged',shape:'bow',color:'#cc8d57'},
    {id:'h_guard',name:'Бронированный страж',hp:165,damage:18,cooldown:1.3,range:.9,speed:1.05,armor:.25,shape:'shield',color:'#b7514b'}
  ].map(u=>({...u,armor:u.armor||0,role:u.role||'melee'}));
  const levelsRaw = [
    ['Печенеги','Степная застава','steppe',90,'scrub:5,2 scrub:6,8','p_foot:4 p_spear:1'],
    ['Печенеги','Каменистый брод','river',110,'water:5,0 water:5,1 water:5,2 water:5,7 water:5,8 water:5,9 rock:6,3 rock:6,7','p_foot:4 p_spear:2 p_horse:1'],
    ['Печенеги','Пыльный курган','steppe',135,'rock:6,1 rock:6,8 scrub:5,4 scrub:7,6','p_foot:5 p_spear:3 p_horse:2'],
    ['Печенеги','Стан налётчиков','steppe',165,'rock:5,3 rock:5,6 scrub:6,2 scrub:6,8','p_foot:5 p_spear:3 p_horse:3'],
    ['Половцы','Ковыльная равнина','steppe',100,'scrub:5,1 scrub:5,7 scrub:7,5','c_horsebow:3 c_lancer:2'],
    ['Половцы','Конный тракт','road',120,'rock:5,2 rock:6,7 scrub:6,4','c_horsebow:3 c_lancer:3 c_guard:1'],
    ['Половцы','Красная теснина','canyon',145,'rock:5,0 rock:5,1 rock:5,2 rock:5,7 rock:5,8 rock:5,9 rock:6,0 rock:6,9','c_horsebow:4 c_lancer:3 c_guard:2'],
    ['Половцы','Ставка хана','steppe',175,'rock:6,3 rock:6,6 scrub:5,1 scrub:5,8','c_horsebow:4 c_lancer:4 c_guard:3'],
    ['Ящеры','Топкие берега','marsh',110,'mud:4,3 mud:5,3 mud:5,4 mud:6,4 water:6,1 water:6,8','l_runner:4 l_shield:2'],
    ['Ящеры','Шепчущий лес','forest',135,'tree:5,2 tree:6,4 tree:5,7 scrub:6,7','l_runner:5 l_shield:2 l_spitter:2'],
    ['Ящеры','Каменные зубы','canyon',155,'rock:5,1 rock:5,3 rock:5,6 rock:5,8 rock:7,4','l_runner:5 l_shield:3 l_spitter:3'],
    ['Ящеры','Затерянное капище','marsh',190,'rock:5,4 rock:6,5 mud:4,5 mud:5,6 mud:6,2 tree:7,7','l_runner:5 l_shield:4 l_spitter:4'],
    ['Зомби','Старый погост','grave',115,'tree:5,2 rock:5,7 rock:7,3 scrub:7,6','z_shambler:7 z_runner:1'],
    ['Зомби','Чёрное болото','marsh',140,'mud:5,2 mud:5,3 mud:5,6 mud:6,7 water:6,0 water:6,9','z_shambler:8 z_runner:3'],
    ['Зомби','Разорённая слобода','grave',175,'rock:5,3 rock:5,6 tree:7,2 tree:7,7','z_shambler:9 z_runner:4 z_brute:1'],
    ['Зомби','Полночь мертвецов','grave',215,'tree:5,1 tree:5,8 mud:6,4 rock:6,6','z_shambler:10 z_runner:5 z_brute:2'],
    ['Динозавры','Первобытная поляна','jungle',100,'tree:5,2 tree:6,8 scrub:5,5','d_raptor:6'],
    ['Динозавры','Гнездовье','jungle',135,'rock:6,3 rock:6,7 tree:5,1 tree:5,8','d_raptor:6 d_trike:1'],
    ['Динозавры','Древнее ущелье','canyon',180,'rock:5,0 rock:5,1 rock:5,8 rock:5,9 rock:7,4','d_raptor:8 d_trike:2'],
    ['Динозавры','Долина титанов','jungle',220,'rock:5,2 rock:5,7 mud:6,3 mud:6,6','d_raptor:7 d_trike:2 d_rex:1'],
    ['Китайское царство','Бамбуковая застава','forest',110,'tree:5,1 tree:5,8 scrub:6,3','h_spear:4 h_crossbow:2'],
    ['Китайское царство','Рисовые поля','river',135,'water:5,0 water:5,1 water:5,8 water:5,9 mud:5,3 mud:6,6','h_spear:5 h_crossbow:3 h_guard:1'],
    ['Китайское царство','Каменные ворота','canyon',170,'rock:5,0 rock:5,1 rock:5,2 rock:5,7 rock:5,8 rock:5,9 rock:6,3 rock:6,6','h_spear:5 h_crossbow:4 h_guard:2'],
    ['Китайское царство','Императорский тракт','road',210,'rock:5,2 rock:5,7 tree:6,1 tree:6,8','h_spear:6 h_crossbow:5 h_guard:3']
  ];
  function obstaclesFrom(s){return s.split(/\s+/).filter(Boolean).map(item=>{const [type,xy]=item.split(':');const [x,y]=xy.split(',').map(Number);return {type,x,y}})}
  function spawnFrom(s){const queue=[];for(const item of s.split(/\s+/)){const [id,n]=item.split(':');for(let i=0;i<+n;i++)queue.push(id)}const rows=[4,5,3,6,2,7,1,8,0,9];return queue.map((id,i)=>({id,x:8+Math.floor(i/10),y:rows[i%10]}))}
  const levels=levelsRaw.map((r,i)=>({id:i+1,chapter:Math.floor(i/4)+1,faction:r[0],title:r[1],biome:r[2],budget:r[3],obstacles:obstaclesFrom(r[4]),enemies:spawnFrom(r[5])}));
  // A saved seed reproduces the whole campaign, including retries and future cycles.
  const campaignKey='rus-campaign-v2';
  let saved;try{saved=JSON.parse(localStorage.getItem(campaignKey))}catch{}
  const valid=saved&&Number.isInteger(saved.seed)&&saved.seed>0;
  const campaign=valid?saved:{seed:(Math.random()*4294967294>>>0)+1,current:0};
  campaign.current=Math.max(0,Math.min(9999,Math.floor(Number(campaign.current)||0)));
  function persist(){try{localStorage.setItem(campaignKey,JSON.stringify(campaign))}catch{}}
  persist();
  let randomState=campaign.seed>>>0;
  function random(){randomState=(randomState+0x6D2B79F5)>>>0;let t=randomState;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  const factions=[...new Set(levels.map(l=>l.faction))],byFaction=new Map(factions.map(f=>[f,levels.filter(l=>l.faction===f)]));
  const generated=[],lastMaps=new Map();let cycle=[],previousFaction=null;
  const definitions=new Map(enemies.map(u=>[u.id,u]));
  // Threat includes durability, DPS, armour, reach and mobility; factions share a budget.
  function threat(u){return Math.sqrt(u.hp/(1-u.armor)*u.damage/u.cooldown)*(u.role==='ranged'?1.18:1)*(1+(u.speed-1)*.06)}
  const reference=4*threat(definitions.get('p_foot'))+threat(definitions.get('p_spear'));
  function nextCycle(){
    if(!generated.length){
      const early=shuffle(factions.slice(1)),special=['Ящеры','Зомби'];
      // Shuffle only valid permutations: both special factions occupy positions 2–4.
      while(!special.every(f=>early.indexOf(f)<3)){const next=shuffle(factions.slice(1));early.splice(0,early.length,...next)}
      return [factions[0],...early];
    }
    const next=shuffle(factions);if(next[0]===previousFaction){const j=1+Math.floor(random()*(next.length-1));[next[0],next[j]]=[next[j],next[0]]}return next;
  }
  function generate(){
    if(!cycle.length)cycle=nextCycle();
    const faction=cycle.shift(),index=generated.length,n=index+1,maps=byFaction.get(faction)||levels;
    let choices=maps.filter(m=>m.id!==lastMaps.get(faction));if(!choices.length)choices=maps;
    const map=index===0?levels[0]:(choices[Math.floor(random()*choices.length)]||levels[0]);
    lastMaps.set(faction,map.id);previousFaction=faction;
    // Player economy follows the existing first chapter, then grows smoothly.
    const budget=n<=4?[90,110,135,165][index]:Math.round(n<=24?165+8*(n-4):325+125*(1-Math.exp(-(n-24)/36)));
    const ids=[...new Set(maps.flatMap(m=>m.enemies.map(e=>e.id)))];
    const pool=ids.map(id=>definitions.get(id)).filter(u=>u&&(!(u.big||u.armor>=.15)||n>=7)&&(!u.id.endsWith('rex')||n>=13));
    if(!pool.length)pool.push(definitions.get(ids[0])||enemies[0]);
    const target=reference*budget/90,army=[];let used=0;
    while(army.length<40){
      const affordable=pool.filter(u=>threat(u)<=target-used+target*.07);
      if(!affordable.length)break;
      const def=affordable[Math.floor(random()*affordable.length)];army.push(def.id);used+=threat(def);
    }
    if(!army.length)army.push(pool[0].id);
    const rows=shuffle([0,1,2,3,4,5,6,7,8,9]),blocked=new Set(map.obstacles.filter(o=>['rock','tree','water'].includes(o.type)).map(o=>o.x+','+o.y));
    const cells=[];for(let x=8;x<12;x++)for(const y of rows)if(!blocked.has(x+','+y))cells.push({x,y});
    const enemiesHere=index===0?map.enemies:army.slice(0,cells.length).map((id,i)=>({id,...cells[i]}));
    generated.push({...map,id:n,mapId:map.id,budget,enemies:enemiesHere,enemyScale:index===0?1:Math.max(1,target/(used||target))});
  }
  function getLevel(index){index=Math.max(0,Math.min(9999,Math.floor(index)||0));while(generated.length<=index)generate();return generated[index]}
  function setCurrent(index){campaign.current=index;persist()}
  window.RUS_DATA={W:12,H:10,DEPLOY:4,heroes,enemies,levels:generated,getLevel,setCurrent,campaign};
  for(let i=0;i<Math.max(24,campaign.current+2);i++)getLevel(i);
})();
