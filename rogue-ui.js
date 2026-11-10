/* Run screens use normal DOM controls; the existing battlefield remains Canvas. */
(() => {
'use strict';
const R=window.RUS_RUN,$=id=>document.getElementById(id),screen=$('runScreen'),modal=$('runModal');
let selected=null,lastChoicePhase=null;
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n}
function button(text,fn,className=''){const b=el('button',className,text);b.type='button';b.addEventListener('click',fn);return b}
function symbol(r){const canvas=el('canvas','runeSymbol');canvas.width=64;canvas.height=64;canvas.setAttribute('aria-hidden','true');const g=canvas.getContext('2d'),index=r.symbol;g.translate(32,32);g.strokeStyle=r.color;g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(0,-22);g.lineTo(0,22);for(let k=0;k<2;k++){const y=-12+k*19,dir=((index>>k)&1)?1:-1;g.moveTo(0,y+dir*7);g.lineTo(-14,y-dir*5);g.moveTo(0,y+dir*7);g.lineTo(14,y-dir*5)}if(index%3===0){g.moveTo(-8,0);g.lineTo(8,0)}if(index>=19){g.moveTo(-21,-17);g.lineTo(-21,17);g.moveTo(21,-17);g.lineTo(21,17)}g.stroke();return canvas}
function slotIcon(id){const r=R.runeMap.get(id),b=button('',()=>describe(id),'runeSlot');b.style.setProperty('--rune',r.color);b.setAttribute('aria-label',r.name+' — '+r.description);b.title=r.name;b.append(symbol(r));return b}
function slots(host,editable=false){
 host.replaceChildren();const run=R.get();
 for(let i=0;i<5;i++){const id=run?.runes[i];if(!id){host.append(el('div','emptySlot','—'));continue}const r=R.runeMap.get(id);if(!editable){host.append(slotIcon(id));continue}
  const box=el('div','ownedRune');box.style.setProperty('--rune',r.color);box.append(slotIcon(id),el('span','ownedName',r.name));const b=button('ПРОДАТЬ · '+Math.floor(r.price*.4),()=>R.sell(id),'sellRune');b.disabled=!!run.pending;box.append(b);host.append(box);
 }
}
function closeModal(){if(!document.body.classList.contains('at-title'))window.RUS_BATTLE.resume();modal.hidden=true;modal.replaceChildren();$('app').inert=!screen.hidden||document.body.classList.contains('at-title');screen.inert=false}
function dialog(title,text,actions){if(window.RUS_BATTLE.getMode()==='battle')window.RUS_BATTLE.pause();modal.replaceChildren();const card=el('div','modalCard');card.append(el('h2','',title),el('p','',text));const row=el('div','modalActions');for(const [label,action,kind] of actions)row.append(button(label,()=>{closeModal();action?.()},kind||''));card.append(row);modal.append(card);modal.hidden=false;screen.inert=true;$('app').inert=true;row.querySelector('button')?.focus({preventScroll:true})}
function describe(id){const r=R.runeMap.get(id);if(r)dialog(r.name,r.rarity+' · '+r.description,[['ПОНЯТНО',null,'goldButton']])}
function card(id,action,label){
 const r=R.runeMap.get(id),box=el('article','runeCard');box.style.setProperty('--rune',r.color);box.dataset.rune=id;
 const top=el('div','runeCardTop');top.append(symbol(r),el('span','rarityLabel',r.rarity));box.append(top,el('h3','',r.name),el('p','',r.description));
 const b=button(label,action,'runeAction');box.append(b);return {box,b};
}
function header(kicker,title,detail){const h=el('header','runHeader');h.append(el('div','runKicker',kicker),el('h2','',title),el('p','runLead',detail));screen.append(h)}
function footer(){const f=el('footer','runFooter');screen.append(f);return f}
function renderPending(run){
 const r=R.runeMap.get(run.pending.id);header('ПЯТЬ БЛАГОСЛОВЕНИЙ','Заменить руну','Для «'+r.name+'» нужен свободный слот. '+(run.pending.price?'Покупка: '+run.pending.price+' монет. Монеты спишутся после выбора.':'Награда босса — бесплатно.'));
 const notice=el('div','pendingRune');notice.style.setProperty('--rune',r.color);notice.append(symbol(r),el('div','',r.description));screen.append(notice);
 const grid=el('div','replaceGrid');run.runes.forEach((id,i)=>{const old=R.runeMap.get(id),b=button('',()=>R.resolvePending(i),'replaceCard');b.style.setProperty('--rune',old.color);b.append(symbol(old),el('strong','',old.name),el('span','',old.description),el('small','','ЗАМЕНИТЬ'));grid.append(b)});screen.append(grid);footer().append(button(run.pending.source==='boss'?'ОТКАЗАТЬСЯ ОТ РУНЫ':'ОТКАЗАТЬСЯ ОТ ЗАМЕНЫ',()=>run.pending.source==='boss'?R.skipBoss():R.resolvePending(null),'quietButton'));
}
function render(){
 const run=R.get(),atTitle=document.body.classList.contains('at-title');screen.dataset.phase=run?.pending?'replace':run?.phase||'';
 $('startGame').textContent=R.hasRun()?'ПРОДОЛЖИТЬ ГОЙДУ!':'НАЧАТЬ ГОЙДУ!';$('newGame').hidden=!R.hasRun();
 $('runCoins').textContent='● '+(run?.coins||0);slots($('activeRunes'));
 $('runMenuSummary').textContent=run&&run.phase!=='ended'?'Цикл '+run.cycle+' · бой '+run.battle+' · '+run.coins+' монет':'Новый забег ждёт дружину.';
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
  header(boss?'БОСС ПОВЕРЖЕН':'НОВЫЙ ЗАБЕГ',boss?'Благословение за победу':'Выбери первую руну',boss?'Одна редкая или эпическая руна бесплатно. До пяти рун одновременно.':'Выбери благословение бесплатно. В кошеле 10 монет на первый поход. Одно поражение завершит забег.');
  const grid=el('div','runeGrid'),ids=boss?run.bossChoices:run.startChoices;
  for(const id of ids){const {box}=card(id,()=>{selected=id;render()},selected===id?'ВЫБРАНО':'ВЫБРАТЬ');box.classList.toggle('chosenRune',selected===id);grid.append(box)}screen.append(grid);
  const f=footer(),confirm=button(boss?'ПОЛУЧИТЬ РУНУ':'НАЧАТЬ ПЕРВЫЙ БОЙ',()=>boss?R.chooseBoss(selected):R.chooseStart(selected),'goldButton');confirm.disabled=!ids.includes(selected);f.append(confirm);if(boss)f.append(button('ОТКАЗАТЬСЯ И ПОЙТИ В ЛАВКУ',()=>R.skipBoss(),'quietButton'));
 }else if(run.phase==='reward'){
  header('БОЙ '+run.result.battle+' ЗАВЕРШЁН','ПОБЕДА! ГОЙДА!',run.result.boss?'Босс пал. Древние боги заметили дружину.':'Дружина выстояла. Впереди новые враги и благословения.');
  const coins=el('div','rewardCoins','+'+run.result.amount);coins.append(el('small','','монет за победу'));screen.append(coins,el('p','rewardBalance','В кошеле: '+run.coins+' монет'));
  footer().append(button(run.result.boss?'ВЫБРАТЬ РУНУ БОССА':'В ЛАВКУ ВЕЛЕСА',()=>R.rewardNext(),'goldButton'));
 }else if(run.phase==='shop'){
  header('ЦИКЛ '+run.cycle+' · ПОСЛЕ БОЯ '+run.battle,'ЛАВКА ВЕЛЕСА','Три руны на прилавке. Покупай, продавай и собирай сочетания.');
  const wallet=el('div','shopWallet','● '+run.coins+' монет');screen.append(wallet);
  const grid=el('div','runeGrid');for(const id of run.shop.offers){const r=R.runeMap.get(id),{box,b}=card(id,()=>R.buy(id),'КУПИТЬ · '+r.price);b.disabled=run.coins<r.price;grid.append(box)}if(!run.shop.offers.length)grid.append(el('p','runLead','Прилавок пуст. Обнови ассортимент или отправляйся в бой.'));screen.append(grid);
  screen.append(el('div','slotsLabel','ТВОИ РУНЫ · '+run.runes.length+' / 5'));const owned=el('div','ownedGrid');slots(owned,true);screen.append(owned);
  const f=footer(),refresh=button('ОБНОВИТЬ · '+R.refreshPrice(),()=>R.refresh(),'quietButton');refresh.disabled=run.coins<R.refreshPrice();f.append(refresh,button((run.battle%5===4?'К БОССУ!':'В БОЙ!')+' →',()=>R.next(),'goldButton'));
 }else if(run.phase==='ended'){
  const result=run.result;header('ЗАБЕГ ЗАВЕРШЁН','ПЕРУН НЕДОВОЛЕН','Благословения рассеялись. Новая гойда начнётся с чистого листа.');
  const stats=el('div','endStats');for(const [name,val] of [['Победы',result.wins],['Боссы',result.bosses],['Макс. цикл',result.maxCycle],['Заработано монет',result.earned]]){const item=el('div','');item.append(el('strong','',String(val)),el('span','',name));stats.append(item)}screen.append(stats,el('div','slotsLabel','РУНЫ В КОНЦЕ ЗАБЕГА'));
  const list=el('div','finalRunes');for(const id of result.runes||[]){const r=R.runeMap.get(id),item=button(r.name,()=>describe(id),'finalRune');item.style.setProperty('--rune',r.color);list.append(item)}screen.append(list);footer().append(button('НАЧАТЬ НОВУЮ ГОЙДУ!',startNew,'goldButton'));
 }
}
function hideTitle(){const title=$('titleScreen');title.hidden=true;title.classList.add('hidden');document.body.classList.remove('at-title');$('app').removeAttribute('inert');$('app').removeAttribute('aria-hidden');window.RUS_BATTLE.resume();window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('rus:start'))}
function launch(){if(!R.hasRun())R.newRun();hideTitle();render()}
function startNew(){window.RUS_BATTLE.stop();R.newRun();hideTitle();render()}
function resetPrompt(){if(!R.hasRun()){startNew();return}dialog('Начать новую гойду?','Текущий забег, все его монеты и руны будут сброшены.',[['ОСТАВИТЬ ЗАБЕГ',null,'quietButton'],['СБРОСИТЬ И НАЧАТЬ',startNew,'goldButton']])}
function showTitle(){window.RUS_BATTLE.pause();screen.hidden=true;const title=$('titleScreen');title.hidden=false;title.classList.remove('hidden');document.body.classList.add('at-title');$('app').inert=true;window.dispatchEvent(new Event('resize'));render()}
function updateBoss(units){const b=units.find(u=>u.bossKey&&u.hpNow>0),host=$('bossStatus');host.hidden=!b;if(!b)return;$('bossName').textContent=b.bossName;$('bossHealth').value=b.hpNow;$('bossHealth').max=b.hp;$('bossHP').textContent=Math.ceil(b.hpNow)+' / '+b.hp}
window.RUS_UI={launch,startNew,resetPrompt,showTitle,updateBoss,render};
window.addEventListener('rus:run',render);$('newGame').addEventListener('click',resetPrompt);
render();
})();
