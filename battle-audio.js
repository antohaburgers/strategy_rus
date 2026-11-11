/* Small CC0 soundscape. No loops, delayed queues or timers in the simulation. */
(() => {
'use strict';
const files={sword:Array.from({length:10},(_,i)=>`./audio/sword-${String(i+1).padStart(2,'0')}.mp3`),cry:Array.from({length:4},(_,i)=>`./audio/cry-${String(i+1).padStart(2,'0')}.mp3`),horse:['./audio/horse-neigh.mp3']};
const buffers=new Map(),pending=new Map(),playing=new Set(),bags={sword:[],cry:[],horse:[]},last={};
let context,master,round=false,muted=false,nextSword=0,nextCry=0,nextHorse=0,nextVocal=0,cries=0,horses=0;
try{muted=localStorage.getItem('rus-sound-muted-v1')==='1'}catch{}
let volume=.5;
try{const saved=localStorage.getItem('rus-sound-volume-v1');if(saved!==null&&saved.trim()!==''&&Number.isFinite(Number(saved)))volume=Math.max(0,Math.min(1,Number(saved)))}catch{}
const slider=document.getElementById('soundVolume'),output=document.getElementById('soundVolumeValue');
function applyVolume(){if(master)master.gain.setValueAtTime(muted?0:volume,context.currentTime);slider.value=String(Math.round(volume*100));output.textContent=slider.value+'%';slider.setAttribute('aria-valuetext',slider.value+'%')}
slider.addEventListener('input',()=>{volume=Math.max(0,Math.min(1,Number(slider.value)/100));muted=volume===0;try{localStorage.setItem('rus-sound-volume-v1',String(volume));localStorage.setItem('rus-sound-muted-v1',muted?'1':'0')}catch{}applyVolume();label();if(muted)stopAll();else void unlock()});
const button=document.getElementById('soundToggle'),rand=(lo,hi)=>lo+Math.random()*(hi-lo),mounted=u=>u.mounted||['rider','p_horse','c_horsebow','c_lancer'].includes(u.id),human=u=>!u.machine&&u.id!=='e_mummy'&&!['l_','z_','d_'].some(prefix=>u.id.startsWith(prefix));
function label(){button.textContent=muted?'🔇 Звуки: выкл.':'🔊 Звуки: вкл.';button.setAttribute('aria-pressed',String(!muted))}
function stopAll(){for(const source of playing){try{source.stop()}catch{}}playing.clear()}
function load(url){
 if(buffers.has(url))return Promise.resolve();if(pending.has(url))return pending.get(url);
 const task=fetch(url).then(r=>{if(!r.ok)throw Error('Sound unavailable');return r.arrayBuffer()}).then(a=>context.decodeAudioData(a)).then(b=>buffers.set(url,b)).catch(()=>{}).finally(()=>pending.delete(url));pending.set(url,task);return task;
}
function unlock(){
 if(muted)return Promise.resolve();
 try{
  if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return Promise.resolve();context=new Audio();master=context.createGain();master.gain.value=muted?0:volume;master.connect(context.destination)}
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
let nextEffect=0;
function effect(kind){
 if(!round||muted||!context||context.state!=='running'||document.hidden||playing.size>=3||!context.createOscillator)return false;
 const now=context.currentTime;if(now<nextEffect)return false;nextEffect=now+(['blast','roar','warning'].includes(kind)?.7:.24);
 const specs={gun:[180,45,.09,'square'],flame:[100,40,.22,'sawtooth'],blast:[90,25,.4,'sawtooth'],laser:[950,140,.16,'sawtooth'],magic:[420,950,.25,'sine'],swish:[650,180,.1,'triangle'],metal:[270,80,.12,'triangle'],roar:[85,35,.6,'sawtooth'],warning:[430,590,.18,'sine'],horse:[150,70,.12,'triangle']};
 const [start,end,duration,type]=specs[kind]||specs.metal,osc=context.createOscillator(),gain=context.createGain();osc.kind='synthetic';osc.type=type;
 osc.frequency.setValueAtTime(start,now);osc.frequency.exponentialRampToValueAtTime(end,now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.06,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
 osc.connect(gain);gain.connect(master);playing.add(osc);osc.onended=()=>{playing.delete(osc);osc.disconnect();gain.disconnect()};osc.start(now);osc.stop(now+duration);return true;
}
window.RUS_AUDIO={
 effect,
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
button.addEventListener('click',()=>{muted=!muted;if(!muted&&volume===0){volume=.5;try{localStorage.setItem('rus-sound-volume-v1',String(volume))}catch{}}applyVolume();try{localStorage.setItem('rus-sound-muted-v1',muted?'1':'0')}catch{}if(muted)stopAll();else{resetDelays();void unlock()}label()});
for(const type of ['pointerdown','touchend','keydown'])document.addEventListener(type,()=>{void unlock()},{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();else resetDelays()});
window.addEventListener('pagehide',()=>{round=false;stopAll()});applyVolume();label();
})();

