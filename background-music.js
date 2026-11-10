/* User supplied soundtrack, continuous across menus and battles. */
(() => {
'use strict';
// The soundtrack is uploaded to the repository root; accept Latin/Cyrillic extensions.
const sources=['mp3','mP3','Mp3','MP3','мп3','мП3','Мп3','МП3'].map(ext=>'./Russ_music.'+ext);
let sourceIndex=0;
const track=new Audio(sources[sourceIndex]);
track.addEventListener('error',()=>{
 if(sourceIndex+1>=sources.length)return;
 track.src=sources[++sourceIndex];
 if(!muted&&!document.hidden)play();
});
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
