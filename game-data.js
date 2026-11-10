/* Русы против всех — balance + 24 maps. No external assets. */
(() => {
  const heroes = [
    {id:'militia', name:'Ополченец', short:'Ополч.', cost:8, hp:55, damage:8, cooldown:1.0, range:.75, speed:1.55, armor:0, role:'melee', shape:'sword', color:'#d8b57c'},
    {id:'shield', name:'Щитоносец', short:'Щитоносец', cost:16, hp:125, damage:10, cooldown:1.2, range:.8, speed:1.1, armor:.2, role:'melee', shape:'shield', color:'#8db3d0'},
    {id:'spear', name:'Копейщик', short:'Копейщик', cost:15, hp:78, damage:13, cooldown:1.15, range:1.45, speed:1.25, armor:0, role:'melee', shape:'spear', bonusBig:1.4, color:'#d9c28b'},
    {id:'archer', name:'Лучник', short:'Лучник', cost:20, hp:58, damage:11, cooldown:1.5, range:5, speed:1.35, armor:0, role:'ranged', shape:'bow', color:'#b0bd77'},
    {id:'rider', name:'Конный дружинник', short:'Всадник', cost:32, hp:115, damage:18, cooldown:1.15, range:1.1, speed:2.2, armor:.08, role:'melee', shape:'horse', charge:1.3, color:'#caa071'},
    {id:'bogatyr', name:'Богатырь', short:'Богатырь', cost:48, hp:215, damage:24, cooldown:1.25, range:1.25, speed:1.3, armor:.15, role:'melee', shape:'hero', color:'#ead17b'}
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
  function spawnFrom(s){const queue=[];for(const item of s.split(/\s+/)){const [id,n]=item.split(':');for(let i=0;i<+n;i++)queue.push(id)}const rows=[4,5,3,6,2,7,1,8,0,9];return queue.map((id,i)=>({id,x:14+Math.floor(i/10),y:rows[i%10]+2}))}
  const levels=levelsRaw.map((r,i)=>({id:i+1,chapter:Math.floor(i/4)+1,faction:r[0],title:r[1],biome:r[2],budget:r[3],obstacles:obstaclesFrom(r[4]).map(o=>({...o,x:o.x+3,y:o.y+2})),enemies:spawnFrom(r[5])}));
  window.RUS_DATA={W:18,H:12,DEPLOY:5,heroes,enemies,levels};
})();