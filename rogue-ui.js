/* Run screens use normal DOM controls; the existing battlefield remains Canvas. */
(() => {
'use strict';
const R=window.RUS_RUN,A=window.RUS_RUNE_ART,$=id=>document.getElementById(id),screen=$('runScreen'),modal=$('runModal');
let selected=null,lastChoicePhase=null,previousRun=R.get()?.id,previousRunes=new Set(R.get()?.runes||[]),revealTimer,whisperTimer;
const phrases=new Map(),pulseTimes=new Map();
function phrase(key,values){if(!phrases.has(key)){if(phrases.size>=64)phrases.delete(phrases.keys().next().value);phrases.set(key,values[Math.floor(Math.random()*values.length)])}return phrases.get(key)}
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n}
function button(text,fn,className=''){const b=el('button',className,text);b.type='button';b.addEventListener('click',fn);return b}
function symbol(r,size=160){return A.create(r,size)}
function slotIcon(id){const r=R.runeMap.get(id),b=button('',()=>describe(id),'runeSlot');b.style.setProperty('--rune',A.info(r).school.color);b.dataset.rune=id;b.setAttribute('aria-label',r.name+' — '+r.rarity+' · '+A.info(r).school.name+'. '+r.description);b.title=r.name;b.classList.toggle('weakenedRune',R.rules().weakened===id);b.append(symbol(r,64));return b}
function slots(host,editable=false){
 host.replaceChildren();const run=R.get();
 for(let i=0;i<R.slots();i++){const id=run?.runes[i];if(!id){host.append(el('div','emptySlot','—'));continue}const r=R.runeMap.get(id);if(!editable){host.append(slotIcon(id));continue}
  const box=el('div','ownedRune');box.style.setProperty('--rune',r.color);box.append(slotIcon(id),el('span','ownedName',r.name+((run.upgrades?.[id]||0)?' +'+run.upgrades[id]:'')));const b=button('ПРОДАТЬ · '+Math.floor(r.price*.4),()=>R.sell(id),'sellRune');b.disabled=!!run.pending;box.append(b);
  const lvl=run.upgrades?.[id]||0,forge=button(lvl>=2?'УСИЛЕНА ДО +2':run.freeUpgrades>0?'МОЛОТ · БЕСПЛАТНО':'МОЛОТ · '+(35+lvl*20),()=>dialog('Молот Сварога','65% — улучшение; 20% — без эффекта; 15% — разрушение руны. Улучшение даёт +6% урона и +4% здоровья дружине, максимум +2.',[['ОТМЕНА',null,'quietButton'],['УДАРИТЬ',()=>R.hammer(id),'goldButton']]),'sellRune');forge.disabled=!!run.pending||lvl>=2||(run.freeUpgrades<=0&&run.coins<35+lvl*20);box.append(forge);host.append(box);
 }
}
function closeModal(){if(!document.body.classList.contains('at-title'))window.RUS_BATTLE.resume();modal.hidden=true;modal.replaceChildren();$('app').inert=!screen.hidden||document.body.classList.contains('at-title');screen.inert=false}
function dialog(title,text,actions){if(window.RUS_BATTLE.getMode()==='battle')window.RUS_BATTLE.pause();modal.replaceChildren();const card=el('div','modalCard');card.append(el('h2','',title),el('p','',text));const row=el('div','modalActions');for(const [label,action,kind] of actions)row.append(button(label,()=>{closeModal();action?.()},kind||''));card.append(row);modal.append(card);modal.hidden=false;screen.inert=true;$('app').inert=true;row.querySelector('button')?.focus({preventScroll:true})}
function describe(id){const r=R.runeMap.get(id);if(!r)return;const meta=A.info(r);dialog(r.name,r.rarity+' · '+r.description,[['ПОНЯТНО',null,'goldButton']]);const plate=el('div','artifactDetail');plate.style.setProperty('--school',meta.school.color);plate.append(symbol(r),el('strong','',meta.school.name),el('small','',meta.material));modal.querySelector('.modalCard').prepend(plate)}
function card(id,action,label){
 const r=R.runeMap.get(id),box=el('article','runeCard');const meta=A.info(r);box.style.setProperty('--rune',meta.school.color);box.style.setProperty('--school',meta.school.color);box.dataset.rune=id;box.dataset.school=meta.school.id;box.classList.toggle('legendaryCard',r.tier===4);
 const top=el('div','runeCardTop'),labels=el('div','artifactLabels'),tier=el('span','rarityLabel',r.rarity);tier.style.color=r.color;labels.append(el('strong','schoolLabel',meta.school.name),el('small','materialLabel',meta.material),tier);top.append(symbol(r),labels);box.append(top,el('h3','',r.name),el('p','',r.description));
 const b=button(label,action,'runeAction');box.append(b);return {box,b};
}
function header(kicker,title,detail){const h=el('header','runHeader');h.append(el('div','runKicker',kicker),el('h2','',title),el('p','runLead',detail));screen.append(h)}
function footer(){const f=el('footer','runFooter');screen.append(f);return f}
function renderPending(run){
 const r=R.runeMap.get(run.pending.id);header('БЛАГОСЛОВЕНИЯ РОДА','Заменить руну','Для «'+r.name+'» нужен свободный слот. '+(run.pending.price?'Покупка: '+run.pending.price+' монет. Монеты спишутся после выбора.':'Награда босса — бесплатно.'));
 const notice=el('div','pendingRune');notice.style.setProperty('--rune',r.color);notice.append(symbol(r),el('div','',r.description));screen.append(notice);
 const grid=el('div','replaceGrid');run.runes.forEach((id,i)=>{const old=R.runeMap.get(id),b=button('',()=>R.resolvePending(i),'replaceCard');b.style.setProperty('--rune',old.color);b.append(symbol(old),el('strong','',old.name),el('span','',old.description),el('small','','ЗАМЕНИТЬ'));grid.append(b)});screen.append(grid);footer().append(button(run.pending.source==='boss'?'ОТКАЗАТЬСЯ ОТ РУНЫ':'ОТКАЗАТЬСЯ ОТ ЗАМЕНЫ',()=>run.pending.source==='boss'?R.skipBoss():R.resolvePending(null),'quietButton'));
}
function render(){
 const run=R.get(),atTitle=document.body.classList.contains('at-title');screen.dataset.phase=run?.pending?'replace':run?.phase||'';
 $('startGame').textContent=R.hasRun()?'ПРОДОЛЖИТЬ ГОЙДУ!':'НАЧАТЬ ГОЙДУ!';$('newGame').hidden=!R.hasRun();
 $('runCoins').textContent='● '+(run?.coins||0);slots($('activeRunes'));
 $('runMenuSummary').textContent=run&&run.phase!=='ended'?'Глава '+run.cycle+' · бой '+run.battle+' · '+run.coins+' монет':'Новый забег ждёт дружину.';
 $('saveNotice').hidden=!R.saveFailed();if(!['prep','battle'].includes(run?.phase))$('bossStatus').hidden=true;
 if(run?.phase==='prep'&&(window.RUS_BATTLE.getLevelKey()!==run.encounter.key||window.RUS_BATTLE.getMode()!=='prep'))window.RUS_BATTLE.prepare(run.encounter);
 if(['prep','battle'].includes(run?.phase))updateBoss(window.RUS_BATTLE.getHUDUnits());
 const overlay=run&&!['prep','battle'].includes(run.phase)&&!atTitle;
 screen.hidden=!overlay;$('app').inert=!!overlay||atTitle;
 if(!overlay)return;
 screen.replaceChildren();
 if(run.pending){renderPending(run);return}
 if(run.phase==='start'||run.phase==='bossRune'){
  const boss=run.phase==='bossRune';if(lastChoicePhase!==run.phase+run.battle){selected=null;lastChoicePhase=run.phase+run.battle}
  header(boss?'БОСС ПОВЕРЖЕН':phrase(run.id+':start',['СЛАВА РОДУ!','ПРЕДКИ ЗОВУТ!','ГОЙДА!']),boss?'Благословение за победу':'Выбери первую руну',boss?'Выбери одну награду: руну, монеты, оберег или редкий пятый слот. Четыре активные руны по умолчанию.':'Выбери благословение бесплатно. В кошеле 10 монет на первый поход. Одно поражение завершит забег.');
  const grid=el('div','runeGrid'),ids=boss?run.bossChoices:run.startChoices;
  for(const id of ids){const {box}=card(id,()=>{selected=id;render()},selected===id?'ВЫБРАНО':'ВЫБРАТЬ');box.classList.toggle('chosenRune',selected===id);grid.append(box)}screen.append(grid);
  const f=footer(),confirm=button(boss?'ПОЛУЧИТЬ РУНУ':'НАЧАТЬ ПЕРВЫЙ БОЙ',()=>boss?R.chooseBoss(selected):R.chooseStart(selected),'goldButton');confirm.disabled=!ids.includes(selected);f.append(confirm);if(boss){
   f.append(button('42 МОНЕТЫ',()=>R.bossGift('coins'),'quietButton'),button('ОБЕРЕГ НА СЛЕДУЮЩИЙ БОЙ',()=>R.bossGift('charm'),'quietButton'));
   if(run.slotOffer&&R.slots()<5)f.append(button('РЕДКИЙ ПЯТЫЙ СЛОТ',()=>R.bossGift('slot'),'goldButton'));
   f.append(button('ПРОПУСТИТЬ НАГРАДУ',()=>R.skipBoss(),'quietButton'));
  }
 }else if(run.phase==='reward'){
  header(phrase(run.id+':win:'+run.battle,run.encounter.faction==='Ящеры'||run.encounter.faction==='Динозавры'?['ПЕРУН ДОВОЛЕН!','РУСЬ СТОИТ!','ЯЩЕРЫ ПОСРАМЛЕНЫ!']:['ПЕРУН ДОВОЛЕН!','РУСЬ СТОИТ!']),'ПОБЕДА! ГОЙДА!',run.result.boss?'Босс пал. Древние боги заметили дружину.':'Дружина выстояла. Впереди новые враги и благословения.');
  const coins=el('div','rewardCoins','+'+run.result.amount);coins.append(el('small','','монет за победу'));screen.append(coins,el('p','rewardBalance','В кошеле: '+run.coins+' монет'));
  footer().append(button(run.result.boss?'ВЫБРАТЬ РУНУ БОССА':'В ЛАВКУ ВЕЛЕСА',()=>R.rewardNext(),'goldButton'));
 }else if(run.phase==='shop'){
  screen.append(A.shopBackdrop(window.innerWidth,window.innerHeight));
  header(phrase(run.id+':shop:'+run.battle,['Ведай силу предков','Перун благословляет','Мудрость не продаётся. Руны продаются','Слава Роду!','Велес знает цену']),'ЛАВКА ВЕЛЕСА','Глава '+run.cycle+' · после боя '+run.battle);
  const wallet=el('div','shopWallet',run.coins+' монет');screen.append(wallet);
  const grid=el('div','runeGrid');for(const id of run.shop.offers){const r=R.runeMap.get(id),{box,b}=card(id,()=>R.buy(id),'КУПИТЬ · '+r.price);b.disabled=run.coins<r.price;grid.append(box)}if(!run.shop.offers.length)grid.append(el('p','runLead','Прилавок пуст. Обнови ассортимент или отправляйся в бой.'));screen.append(grid);
  screen.append(el('div','slotsLabel','ТВОИ РУНЫ · '+run.runes.length+' / '+R.slots()));const owned=el('div','ownedGrid');slots(owned,true);screen.append(owned);
  screen.append(el('p','forgeMessage',run.forgeMessage||'Молот Сварога: один бесплатный удар за забег, затем за монеты. Риск разрушения — 15%.'));
  const charm=button('ОБЕРЕГ ('+run.charms.length+'/2) · 24',()=>R.charm(),'quietButton');charm.disabled=run.coins<24||run.charms.length>=2;screen.append(charm,el('p','charmDetail','Оберегов: '+run.charms.length+' / 2 · −20% урона в начале следующего боя на '+(run.charms.length>1?18:12)+' с. Сгорают после боя.'));
  const f=footer(),refresh=button('ОБНОВИТЬ · '+R.refreshPrice(),()=>R.refresh(),'quietButton');refresh.disabled=run.coins<R.refreshPrice();f.append(refresh,button((run.stage===11?'ЗАВЕРШИТЬ ПОХОД':run.stage%4===2?'К БОССУ!':'В БОЙ!')+' →',()=>R.next(),'goldButton'));
 }else if(run.phase==='ended'){
  const result=run.result;if(result.completed)header('РУСЬ ПРОБУДИЛАСЬ','СЛАВА РОДУ! ПОХОД ЗАВЕРШЁН','Три главы пройдены. Технологии не помогли. Следующий забег принесёт других врагов и руны.');else header(phrase(run.id+':end',['ПЕРУН ОТВЕРНУЛСЯ','ПРЕДКИ РАЗОЧАРОВАНЫ','ГОЙДА ОТМЕНЯЕТСЯ']),'ПЕРУН НЕДОВОЛЕН','Благословения рассеялись. Новая гойда начнётся с чистого листа.');
  const stats=el('div','endStats');for(const [name,val] of [['Победы',result.wins],['Боссы',result.bosses],['Макс. глава',result.maxCycle],['Заработано монет',result.earned]]){const item=el('div','');item.append(el('strong','',String(val)),el('span','',name));stats.append(item)}screen.append(stats,el('div','slotsLabel','РУНЫ В КОНЦЕ ЗАБЕГА'));
  const list=el('div','finalRunes');for(const id of result.runes||[]){const r=R.runeMap.get(id),item=button(r.name,()=>describe(id),'finalRune');item.style.setProperty('--rune',r.color);list.append(item)}screen.append(list);footer().append(button('НАЧАТЬ НОВУЮ ГОЙДУ!',startNew,'goldButton'));
 }
}
function hideTitle(){const title=$('titleScreen');title.hidden=true;title.classList.add('hidden');document.body.classList.remove('at-title');$('app').removeAttribute('inert');$('app').removeAttribute('aria-hidden');window.RUS_BATTLE.resume();window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('rus:start'))}
function launch(){if(!R.hasRun())R.newRun();hideTitle();render()}
function startNew(){window.RUS_BATTLE.stop();R.newRun();hideTitle();render()}
function resetPrompt(){if(!R.hasRun()){startNew();return}dialog('Начать новую гойду?','Текущий забег, все его монеты и руны будут сброшены.',[['ОСТАВИТЬ ЗАБЕГ',null,'quietButton'],['СБРОСИТЬ И НАЧАТЬ',startNew,'goldButton']])}
function showTitle(){window.RUS_BATTLE.pause();screen.hidden=true;const title=$('titleScreen');title.hidden=false;title.classList.remove('hidden');document.body.classList.add('at-title');$('app').inert=true;window.dispatchEvent(new Event('resize'));render()}
function updateBoss(units){const b=units.find(u=>u.bossKey&&u.hpNow>0),host=$('bossStatus');host.hidden=!b;if(!b)return;$('bossName').textContent=b.bossName;$('bossHealth').value=b.hpNow;$('bossHealth').max=b.hp;$('bossHP').textContent=Math.ceil(b.hpNow)+' / '+b.hp+(b.bossKey==='mech'?' · Щит '+(b.modules?.shield===false?'×':'✓')+' · Ракеты '+(b.modules?.rockets===false?'×':'✓'):'')}
const revelation=el('section','runeRevelation');revelation.id='runeRevelation';revelation.hidden=true;revelation.tabIndex=0;revelation.setAttribute('role','button');revelation.setAttribute('aria-label','Пропустить появление легендарной руны');document.body.append(revelation);
function dismissRevelation(){clearTimeout(revealTimer);revelation.hidden=true;revelation.replaceChildren();screen.inert=false;$('app').inert=!screen.hidden||document.body.classList.contains('at-title')}
revelation.addEventListener('click',dismissRevelation);revelation.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dismissRevelation()}});
function reveal(id){
 const r=R.runeMap.get(id),meta=A.info(r);clearTimeout(revealTimer);revelation.replaceChildren();revelation.dataset.school=meta.school.id;revelation.style.setProperty('--school',meta.school.color);
 const halo=el('div','revelationHalo');halo.setAttribute('aria-hidden','true');
 for(let i=0;i<16;i++){const particle=el('i','');particle.style.setProperty('--angle',(i*22.5)+'deg');particle.style.setProperty('--length',(100+i%4*15)+'px');particle.style.setProperty('--delay',(i%4*.035)+'s');halo.append(particle)}
 const relic=el('div','revealedArtifact');relic.append(symbol(r,320));
 revelation.append(halo,el('div','revelationSchool',meta.school.name),relic,el('h2','',r.name),el('p','',phrase(R.get().id+':rune:'+id,['МУДРОСТЬ ПРЕДКОВ ОБРЕТЕНА!','ВЕДАТЬ!','СИЛА РОДА ПРОБУДИЛАСЬ!'])),el('small','','Коснись, чтобы продолжить'));
 revelation.hidden=false;screen.inert=true;$('app').inert=true;revelation.focus({preventScroll:true});revealTimer=setTimeout(dismissRevelation,1400);
}
function onRunChange(){
 const run=R.get(),fresh=run&&run.id===previousRun?run.runes.filter(id=>!previousRunes.has(id)):[];
 previousRun=run?.id;previousRunes=new Set(run?.runes||[]);render();
 const legendary=fresh.find(id=>R.runeMap.get(id).tier===4);if(legendary){reveal(legendary);return}
 if(fresh.length){const whisper=$('runeWhisper');clearTimeout(whisperTimer);whisper.textContent=phrase(run.id+':gift:'+run.battle,['ВЕДАТЬ!','СЛАВА РОДУ!','ПРЕДКИ ЗОВУТ!']);whisper.classList.add('whisperVisible');whisperTimer=setTimeout(()=>{whisper.classList.remove('whisperVisible');whisper.textContent=''},1500)}
}
window.addEventListener('rus:rune-activation',event=>{
 const id=event.detail?.id,now=performance.now();if(!id||now-(pulseTimes.get(id)||-1000)<500||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;pulseTimes.set(id,now);
 const target=$('activeRunes').querySelector('[data-rune="'+id+'"]');if(!target||target.classList.contains('runeActivated'))return;target.classList.add('runeActivated');target.addEventListener('animationend',()=>target.classList.remove('runeActivated'),{once:true});
});
window.RUS_UI={launch,startNew,resetPrompt,showTitle,updateBoss,render};
window.addEventListener('rus:run',onRunChange);$('newGame').addEventListener('click',resetPrompt);
render();
})();
