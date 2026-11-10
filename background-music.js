/* User supplied soundtrack, continuous across menus and battles. */
(() => {
'use strict';
const track=new Audio('./audio/Russ_music.mp3');
track.loop=true;
track.preload='auto';
track.volume=.35;
let muted=false,started=false;
try{muted=localStorage.getItem('rus-music-muted-v1')==='1'}catch{}
const button=document.getElementById('musicToggle');
function label(){
 button.textContent=muted?'🎵 Музыка: выкл.':'🎵 Музыка: вкл.';
 button.setAttribute('aria-pressed',String(!muted));
}
function play(){
 if(muted||document.hidden)return;
 const promise=track.play();
 if(promise)promise.catch(()=>{});
}
function unlock(){started=true;play()}
button.addEventListener('click',()=>{
 muted=!muted;
 try{localStorage.setItem('rus-music-muted-v1',muted?'1':'0')}catch{}
 if(muted)track.pause();else unlock();
 label();
});
for(const type of ['pointerdown','touchend','keydown'])
 document.addEventListener(type,unlock,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)track.pause();else if(started)play();
});
window.addEventListener('pagehide',()=>track.pause());
window.addEventListener('pageshow',()=>{if(started)play()});
label();
play();
})();
