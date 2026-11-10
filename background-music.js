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
let volume=.35,musicContext,musicGain;
try{const saved=localStorage.getItem('rus-music-volume-v1');if(saved!==null&&saved.trim()!==''&&Number.isFinite(Number(saved)))volume=Math.max(0,Math.min(1,Number(saved)))}catch{}
track.volume=volume;
let muted=false,started=false;
try{muted=localStorage.getItem('rus-music-muted-v1')==='1'}catch{}
const button=document.getElementById('musicToggle'),slider=document.getElementById('musicVolume'),output=document.getElementById('musicVolumeValue');
function applyVolume(){
 // iOS ignores HTMLMediaElement.volume: route music through a Web Audio gain.
 if(musicGain){track.volume=1;musicGain.gain.setValueAtTime(volume,musicContext.currentTime)}
 else track.volume=volume;
 slider.value=String(Math.round(volume*100));output.textContent=slider.value+'%';
 slider.setAttribute('aria-valuetext',slider.value+'%');
}
function unlockGain(){
 try{
  if(!musicContext){
   const AudioContext=window.AudioContext||window.webkitAudioContext;
   if(!AudioContext)return;
   const ctx=new AudioContext(),gain=ctx.createGain(),source=ctx.createMediaElementSource(track);
   gain.gain.value=volume;source.connect(gain);gain.connect(ctx.destination);
   musicContext=ctx;musicGain=gain;track.volume=1;
  }
  if(musicContext.state!=='running')musicContext.resume().catch(()=>{});
 }catch{}
}
slider.addEventListener('input',()=>{
 volume=Math.max(0,Math.min(1,Number(slider.value)/100));muted=volume===0;
 try{localStorage.setItem('rus-music-volume-v1',String(volume));localStorage.setItem('rus-music-muted-v1',muted?'1':'0')}catch{}
 applyVolume();label();if(muted)track.pause();else unlock();
});
function label(){
 button.textContent=muted?'🎵 Музыка: выкл.':'🎵 Музыка: вкл.';
 button.setAttribute('aria-pressed',String(!muted));
}
function play(){
 if(muted||document.hidden||document.body.classList.contains('at-title'))return;
 const promise=track.play();
 if(promise)promise.catch(()=>{});
}
function unlock(){if(document.body.classList.contains('at-title'))return;started=true;unlockGain();play()}
window.addEventListener('rus:start',unlock);
button.addEventListener('click',()=>{
 muted=!muted;
 if(!muted&&volume===0){volume=.35;try{localStorage.setItem('rus-music-volume-v1',String(volume))}catch{}applyVolume()}
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
applyVolume();label();
if(!document.body.classList.contains('at-title'))play();
})();
