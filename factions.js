/* Content registry 3.0. Shared combat engine; all units are ground-targetable. */
(() => {
'use strict';
const D=window.RUS_DATA;
const unit=(id,name,hp,damage,cooldown,range,speed,shape,extra={})=>({id,name,hp,damage,cooldown,range,speed,shape,armor:0,role:range>2?'ranged':'melee',color:'#9d9e8b',...extra});
const units=[
 unit('g_infantry','Пехотинец',49,10,1.4,4.3,1.15,'rifle',{sound:'gun'}),
 unit('g_machine','Пулемётчик',70,5,.38,4.7,.72,'machinegun',{sound:'gun',turnDelay:.65}),
 unit('g_flame','Огнемётчик',65,7,1.4,1.8,1.05,'flame',{splash:.85,sound:'flame'}),
 unit('g_mortar','Миномётчик',48,23,4.5,6.3,.65,'mortar',{lob:true,telegraph:1.5,splash:1.1,sound:'blast'}),
 unit('g_officer','Офицер',62,8,1.7,3.6,1.15,'officer',{aura:'might',sound:'gun'}),
 unit('j_samurai','Самурай',125,19,1.4,.95,1.25,'samurai',{armor:.18}),
 unit('j_ninja','Ниндзя',49,12,1.1,.8,2.6,'ninja',{dodge:4,flanker:true,sound:'swish'}),
 unit('j_archer','Лучник храма',52,12,1.7,5.1,1.25,'jbow'),
 unit('j_mage','Звёздная волшебница',48,15,2.5,4.6,1,'anime',{magic:true,aura:'haste',sound:'magic'}),
 unit('j_master','Мастер катаны',94,32,2.4,1.1,1.8,'katana',{telegraph:1.1,sound:'swish'}),
 unit('w_hussar','Крылатый гусар',118,20,1.5,1.3,2.35,'winghorse',{charge:1.7,mounted:true}),
 unit('w_pike','Гусарский копейщик',83,13,1.4,1.65,1.05,'wpike',{antiCavalry:1.6}),
 unit('w_crossbow','Коронный арбалетчик',55,23,2.5,5.1,1,'crossbow'),
 unit('w_knight','Тяжёлый рыцарь',175,20,1.75,1, .8,'knight',{armor:.32}),
 unit('w_banner','Знаменосец',77,9,1.8,1.1,1.2,'banner',{aura:'charge'}),
 unit('e_pike','Копейщик Нила',82,12,1.4,1.5,1.15,'epike'),
 unit('e_archer','Лучник фараона',51,11,1.7,5,1.1,'ebow'),
 unit('e_mummy','Мумия',105,11,1.7,.85,.7,'mummy',{revive:true}),
 unit('e_priest','Жрец Ра',52,13,2.6,4.4,.9,'priest',{magic:true,aura:'curse',sound:'magic'}),
 unit('e_guard','Страж саркофага',172,17,1.7,1,.8,'sarcophagus',{armor:.28,aura:'ward'}),
 unit('r_android','Андроид-солдат',91,12,1.2,1,1.2,'android',{armor:.18,machine:true,sound:'metal'}),
 unit('r_laser','Лазерный стрелок',53,14,1.6,4.8,1.1,'laser',{machine:true,sound:'laser'}),
 unit('r_drone','Боевой дрон',31,7,.9,2.5,2.7,'drone',{machine:true,flanker:true,sound:'laser'}),
 unit('r_repair','Ремонтный робот',61,5,2.5,.9,1,'repair',{machine:true,repair:80,sound:'metal'}),
 unit('r_assault','Штурмовой робот',188,30,2.7,1.1,.7,'assault',{armor:.25,machine:true,telegraph:1.2,sound:'metal'}),
 unit('boss_tiger','Танк «Тигр»',780,16,2.1,4.5,.6,'tiger',{armor:.48,big:true,machine:true,sound:'gun'}),
 unit('boss_kaiju','Сакурадзю — Пожиратель фонарей',900,24,2.6,1.5,.65,'kaiju',{big:true,sound:'roar'}),
 unit('boss_hussar','Великий гусар',740,23,1.8,1.6,1.75,'grandhorse',{big:true,mounted:true,armor:.15}),
 unit('boss_pharaoh','Фараон Золотой Пыли',680,17,2.8,4.8,.8,'pharaoh',{big:true,magic:true,sound:'magic'}),
 unit('boss_mech','Мегаробот «Бездух-9000»',860,23,2.5,1.4,.7,'mech',{big:true,machine:true,armor:.2,sound:'metal'})
];
D.enemies.push(...units);
const bosses=[
 {key:'tiger',name:'ТАНК «ТИГР»',faction:'Железное нашествие',unit:'boss_tiger',ability:'Пушка: красный круг за 2 с. Броню пробивают копья, богатырь и магия. Поддержка: всего 4 пехотинца.',summons:4,attacks:['shell','machinegun'],weakness:'Магия, копейщики, богатырь; любой удар наносит урон.'},
 {key:'kaiju',name:'САКУРАДЗЮ',faction:'Восточная гойда',unit:'boss_kaiju',ability:'Луч: полоса за 2,2 с. Рёв оглушает; хвост бьёт вокруг. После луча уязвим 3 с.',summons:0,attacks:['beam','tail','roar'],weakness:'Рассредоточение и окно уязвимости после луча.'},
 {key:'hussar',name:'ВЕЛИКИЙ ГУСАР',faction:'Крылья над полем',unit:'boss_hussar',ability:'Натиск по полосе за 1,8 с. После рывка уязвим 3 с. Всего 2 всадника поддержки.',summons:2,attacks:['charge'],weakness:'Копья и удар после натиска.'},
 {key:'pharaoh',name:'ФАРАОН',faction:'Проклятие фараона',unit:'boss_pharaoh',ability:'Песчаный круг за 1,8 с. Призванные жрецы дают щит. Всего 2 жреца и 4 мумии.',summons:6,attacks:['sand','curse'],weakness:'Уничтожение жрецов снимает защиту.'},
 {key:'mech',name:'БЕЗДУХ-9000',faction:'Железо без души',unit:'boss_mech',ability:'Ракеты и лазер предупреждают за 2 с. Модули разрушаются вместе с корпусом: на 65% и 35% HP.',summons:3,attacks:['rocket','laser','fist'],weakness:'На 65% HP теряет щит, на 35% — ракетную установку.'}
];
const content=[
 ['iron','Железное нашествие','iron',['Окраина заставы','Миномётный рубеж','Разбитый тракт','Железный двор'],['g_infantry','g_machine','g_flame','g_mortar','g_officer'],'tiger','armor','#737f78','gun'],
 ['japan','Восточная гойда','sakura',['Тропа фонарей','Сад клинков','Горный храм','Долина кайдзю'],['j_samurai','j_ninja','j_archer','j_mage','j_master'],'kaiju','small','#dd9bb0','swish'],
 ['wings','Крылья над полем','meadow',['Крылатая равнина','Копейный тракт','Коронный лагерь','Поле Великого гусара'],['w_hussar','w_pike','w_crossbow','w_knight','w_banner'],'hussar','riders','#b55362','horse'],
 ['egypt','Проклятие фараона','desert',['Берег Нила','Аллея сфинксов','Долина саркофагов','Трон Золотой Пыли'],['e_pike','e_archer','e_mummy','e_priest','e_guard'],'pharaoh','curseRune','#dbb65b','magic'],
 ['machines','Железо без души','factory',['Забытая мастерская','Лазерный коридор','Конвейер безумия','Сердце Бездуха'],['r_android','r_laser','r_drone','r_repair','r_assault'],'mech','fearless','#6cc9d4','laser']
];
const layouts=[[[5,2],[6,7]],[[5,1],[6,8],[7,4]],[[5,3],[6,6],[7,1]],[[6,2],[6,7]]];
const registry=content.map(([id,name,biome,titles,enemies,bossId,trial,color,sound],i)=>({id,name,enemies,bossId,trial,rewards:{normal:21,trial:26,elite:28,boss:56},assets:{renderer:biome,sound,color},map:{biome,titles}}));
for(const [i,f] of registry.entries())for(let v=0;v<4;v++)D.maps.push({id:25+i*4+v,chapter:7+i,faction:f.name,factionId:f.id,title:f.map.titles[v],biome:f.map.biome,budget:110+v*15,obstacles:layouts[v].map(([x,y],j)=>({x,y,type:j===0?'rock':f.id==='japan'?'tree':v===1?'scrub':'rock'})),enemies:f.enemies.map((id,j)=>({id,x:8+Math.floor(j/10),y:[3,5,7,2,8][j]})),variant:v});
D.factions=[...new Set(D.maps.filter(m=>m.id<=24).map(m=>m.faction))].map((name,i)=>({id:['pecheneg','polovtsy','lizard','zombie','dinosaur','empire'][i],name,enemies:[...new Set(D.maps.filter(m=>m.faction===name).flatMap(m=>m.enemies.map(u=>u.id)))],bossId:['khan','batyr','lizard','koschei','ancient','emperor'][i],trial:['militia','riders','noMage','noBear','six','ranged'][i],rewards:{normal:21,trial:26,elite:28,boss:56},assets:{color:['#9f5a36','#2f6876','#365d44','#43494e','#836044','#a33336'][i]},map:{biome:D.maps[i*4].biome}})).concat(registry);
D.attackSpecs={
 shell:{delay:2,damage:48,radius:1.4,sound:'blast'},
 beam:{delay:2.2,damage:48,radius:.72,line:true,magic:true,sound:'laser'},
 tail:{delay:1.5,damage:32,radius:2.3,sound:'metal'},
 roar:{delay:1.3,damage:9,radius:2.7,magic:true,sound:'roar'},
 charge:{delay:1.8,damage:44,radius:.8,line:true,sound:'horse'},
 sand:{delay:1.8,damage:37,radius:1.5,magic:true,sound:'magic'},
 rocket:{delay:2,damage:39,radius:1.35,maxVolleys:3,sound:'blast'},
 laser:{delay:2.1,damage:42,radius:.65,line:true,magic:true,sound:'laser'},
 fist:{delay:1.2,damage:32,radius:1.2,sound:'metal'},
 machinegun:{damage:16,cooldown:2.1,range:4.5,sound:'gun'},
 curse:{duration:3,outgoing:.8}
};
for(const b of bosses){b.cooldown=7;b.attacks=b.attacks.map(id=>({id,...D.attackSpecs[id]}))}
D.newBosses=bosses;
D.trials={
 none:{id:'none',name:'Обычный бой',text:'Без ограничений.'},
 armor:{id:'armor',name:'ЖЕЛЕЗО ПРОТИВ РОДА!',text:'Броня врагов +12%. Копья, богатырь и магия пробивают броню.'},
 small:{id:'small',name:'МАЛЫЕ ПРОТИВ ВЕЛИКОГО!',text:'Не более 8 союзников одновременно, включая призывы.',maxUnits:8},
 riders:{id:'riders',name:'КОННИЦА ПРОТИВ КОННИЦЫ!',text:'Размести минимум двух всадников.',required:{rider:2}},
 curseRune:{id:'curseRune',name:'ПРОКЛЯТИЕ ПИРАМИД!',text:'Одна указанная руна подавлена до конца боя.'},
 fearless:{id:'fearless',name:'ЖЕЛЕЗО НЕ ВЕДАЕТ СТРАХА!',text:'Роботы невосприимчивы к устрашению.'},
 noMage:{id:'noMage',name:'БЕЗ ВОЛХВОВ',text:'Волхвы недоступны. Дальний бой остаётся у лучников.',banned:['volkhv']},
 noBear:{id:'noBear',name:'БЕЗ МЕДВЕДЕЙ',text:'Благословение Велеса не призывает медведей.',noBear:true},
 six:{id:'six',name:'ШЕСТЕРО СМЕЛЫХ',text:'Не более 6 союзников одновременно, включая призывы.',maxUnits:6},
 militia:{id:'militia',name:'ДЕРЕВНЯ ВСТАЛА!',text:'Размести минимум трёх ополченцев.',required:{militia:3}},
 ranged:{id:'ranged',name:'БЛИЖЕ К ПРЕДКАМ',text:'Не больше двух бойцов дальнего боя в построении.',maxRanged:2},
 costly:{id:'costly',name:'ДОРОГАЯ ГОЙДА',text:'Стоимость найма всех русов +20%.',cost:1.2},
 elite:{id:'elite',name:'ВРАЖЕСКИЙ АВАНГАРД',text:'Вражеская конница наносит на 20% больше урона.'}
};
})();
