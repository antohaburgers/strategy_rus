/* Small CC0 soundscape. No loops, delayed queues or timers in the simulation. */
(() => {
'use strict';
const files={sword:Array.from({length:10},(_,i)=>`./audio/sword-${String(i+1).padStart(2,'0')}.mp3`),cry:Array.from({length:4},(_,i)=>`./audio/cry-${String(i+1).padStart(2,'0')}.mp3`),horse:['./audio/horse-neigh.mp3']};
const buffers=new Map(),pending=new Map(),playing=new Set(),bags={sword:[],cry:[],horse:[]},last={};
let context,master,round=false,muted=false,nextSword=0,nextCry=0,nextHorse=0,nextVocal=0,cries=0,horses=0;
try{muted=localStorage.getItem('rus-sound-muted-v1')==='1'}catch{}
const button=document.getElementById('soundToggle'),rand=(lo,hi)=>lo+Math.random()*(hi-lo),mounted=u=>['rider','p_horse','c_horsebow','c_lancer'].includes(u.id),human=u=>!['l_','z_','d_'].some(prefix=>u.id.startsWith(prefix));
function label(){button.textContent=muted?'🔇 Звуки: выкл.':'🔊 Звуки: вкл.';button.setAttribute('aria-pressed',String(!muted))}
function stopAll(){for(const source of playing){try{source.stop()}catch{}}playing.clear()}
function load(url){
 if(buffers.has(url))return Promise.resolve();if(pending.has(url))return pending.get(url);
 const task=fetch(url).then(r=>{if(!r.ok)throw Error('Sound unavailable');return r.arrayBuffer()}).then(a=>context.decodeAudioData(a)).then(b=>buffers.set(url,b)).catch(()=>{}).finally(()=>pending.delete(url));pending.set(url,task);return task;
}
function unlock(){
 if(muted)return Promise.resolve();
 try{
  if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return Promise.resolve();context=new Audio();master=context.createGain();master.gain.value=.5;master.connect(context.destination)}
  // Called synchronously from a real touch/click, including on iOS Safari.
  const resumed=context.state==='running'?Promise.resolve():context.resume();
  if(context.state!=='running'){const silent=context.createBufferSource();silent.buffer=context.createBuffer(1,1,context.sampleRate);silent.connect(master);silent.start()}
  return Promise.all([resumed,...Object.values(files).flat().map(load)]).catch(()=>{});
 }catch{return Promise.resolve()}
}
function choose(kind){
 if(!bags[kind].length){bags[kind]=files[kind].slice();for(let i=bags[kind].length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bags[kind][i],bags[kind][j]]=[bags[kind][j],bags[kind][i]]}
  if(bags[kind].length>1&&bags[kind].at(-1)===last[kind]){[bags[kind][0],bags[kind][bags[kind].length-1]]=[bags[kind].at(-1),bags[kind][0]]}}
 return bags[kind].at(-1);
}
function play(kind,volume,x=.5){
 if(muted||!context||context.state!=='running'||document.hidden||playing.size>=3)return false;
 if((kind==='cry'||kind==='horse')&&[...playing].some(s=>s.kind==='cry'||s.kind==='horse'))return false;
 const url=choose(kind),buffer=buffers.get(url);if(!buffer)return false;
 const source=context.createBufferSource(),gain=context.createGain(),now=context.currentTime;source.buffer=buffer;source.kind=kind;source.playbackRate.value=rand(.97,1.03);
 const level=volume*rand(.85,1);gain.gain.setValueAtTime(level,now);gain.gain.setValueAtTime(level,now+Math.max(.01,buffer.duration/source.playbackRate.value-.035));gain.gain.linearRampToValueAtTime(0,now+buffer.duration/source.playbackRate.value);
 source.connect(gain);let pan;
 if(context.createStereoPanner){pan=context.createStereoPanner();pan.pan.value=Math.max(-.65,Math.min(.65,(x-.5)*1.3));gain.connect(pan);pan.connect(master)}else gain.connect(master);
 source.onended=()=>{playing.delete(source);source.disconnect();gain.disconnect();pan?.disconnect()};playing.add(source);
 try{source.start();bags[kind].pop();last[kind]=url;return true}catch{playing.delete(source);source.disconnect();gain.disconnect();pan?.disconnect();return false}
}
function resetDelays(){const now=context?.currentTime||0;nextSword=now+.2;nextCry=now+2.5;nextHorse=now+rand(3,5);nextVocal=now+2.5}
window.RUS_AUDIO={
 unlock,
 begin(){stopAll();round=true;cries=0;horses=0;resetDelays();void unlock()},
 end(){round=false;stopAll()},
 hit(attacker,target){
  if(!round||muted||!context||document.hidden)return;const now=context.currentTime;
  if(attacker.role!=='ranged'&&human(attacker)&&now>=nextSword&&Math.random()<.65&&play('sword',.35,target.x/12))nextSword=now+rand(.45,.75);
  if(human(target)&&cries<3&&now>=nextCry&&now>=nextVocal&&Math.random()<(target.hpNow<=0?.45:.10)&&play('cry',.22,target.x/12)){
   cries++;nextCry=now+rand(5,9);nextVocal=now+3;
  }
 },
 update(units){
  if(!round||muted||!context||document.hidden||horses>=2)return;const now=context.currentTime;
  if(now<nextHorse||now<nextVocal)return;const horse=units.find(u=>u.hpNow>0&&mounted(u));
  if(!horse){nextHorse=now+1;return}
  if(play('horse',.24,horse.x/12)){horses++;nextHorse=now+rand(12,18);nextVocal=now+3}
 }
};
button.addEventListener('click',()=>{muted=!muted;try{localStorage.setItem('rus-sound-muted-v1',muted?'1':'0')}catch{}if(muted)stopAll();else{resetDelays();void unlock()}label()});
for(const type of ['pointerdown','touchend','keydown'])document.addEventListener(type,()=>{void unlock()},{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();else resetDelays()});
window.addEventListener('pagehide',()=>{round=false;stopAll()});label();
})();
