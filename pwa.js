/* Mobile shell. Map gestures remain owned by the game's pointer handlers. */
(() => {
'use strict';
const release=document.querySelector('meta[name="app-version"]').content,update=document.getElementById('updateGame'),install=document.getElementById('installGame');
const busy=()=>window.RUS_GAME_IS_BUSY?.()===true;
let registration,waiting,newVersion=false,reloadPending=false,reloading=false,installPrompt,checking=false;
function reload(){if(reloading)return;reloading=true;location.reload()}
function applyWhenSafe(){
 if(busy())return;
 if(waiting){waiting.postMessage({type:'ACTIVATE_UPDATE'});waiting=null;return}
 if(newVersion||reloadPending)reload();
}
function offerUpdate(){update.classList.remove('hidden');applyWhenSafe()}
update.addEventListener('click',()=>{if(busy()){update.textContent='Обновится после боя / сброса армии';return}applyWhenSafe()});
window.addEventListener('rus:state',applyWhenSafe);
async function checkVersion(){
 if(checking||document.visibilityState==='hidden'||!navigator.onLine)return;checking=true;
 try{await registration?.update();const r=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});if(r.ok&&(await r.json()).version!==release){newVersion=true;offerUpdate()}}catch{}finally{checking=false}
}
if('serviceWorker' in navigator){
 let controlled=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!controlled){controlled=true;return}reloadPending=true;offerUpdate()});
 navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(r=>{
  registration=r;
  const found=()=>{if(r.waiting){waiting=r.waiting;offerUpdate()}};found();
  r.addEventListener('updatefound',()=>{const worker=r.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')found()})});
  checkVersion();
 }).catch(()=>{});
}
window.addEventListener('online',checkVersion);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkVersion()});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;install.classList.remove('hidden')});
window.addEventListener('appinstalled',()=>{install.classList.add('hidden');installPrompt=null});
install.addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;install.classList.add('hidden')});
for(const type of ['gesturestart','gesturechange','gestureend'])document.addEventListener(type,e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{if(e.touches.length>1&&!e.target.closest?.('#battle'))e.preventDefault()},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
document.addEventListener('contextmenu',e=>{if(!e.target.closest?.('select,option'))e.preventDefault()});
document.addEventListener('selectstart',e=>{if(!e.target.closest?.('select,option'))e.preventDefault()});
})();
