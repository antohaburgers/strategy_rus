const fs=require('fs'),vm=require('vm'),assert=require('assert');
const plays=[],live=new Set(),handlers={},docHandlers={},attrs={};let context,hidden=false;
class Context{
 constructor(){context=this;this.currentTime=0;this.state='running';this.sampleRate=44100;this.destination={}}
 createGain(){return{gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
 createOscillator(){const s={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){plays.push({kind:'synthetic',time:context.currentTime});live.add(this);assert(live.size<=3)},stop(at){if(at>context.currentTime)this.until=at;else{live.delete(this);this.onended?.()}}};return s}
 createStereoPanner(){return{pan:{value:0},connect(){},disconnect(){}}}
 createBuffer(){return{duration:.001}}
 createBufferSource(){const s={playbackRate:{value:1},connect(){},disconnect(){},start(){if(this.buffer.url){plays.push({kind:this.kind,url:this.buffer.url,time:context.currentTime});live.add(this);this.until=context.currentTime+this.buffer.duration/this.playbackRate.value;assert(live.size<=3)}},stop(){live.delete(this);this.onended?.()}};return s}
 decodeAudioData(a){return Promise.resolve({url:new TextDecoder().decode(a),duration:.4})}
 resume(){this.state='running';return Promise.resolve()}
}
const math=Object.create(Math);math.random=()=>0;
const sandbox={console,Math:math,Promise,TextDecoder,localStorage:{getItem:()=>null,setItem(){}},fetch:async url=>{assert(fs.existsSync(url));return{ok:true,arrayBuffer:async()=>new TextEncoder().encode(url).buffer}},document:{get hidden(){return hidden},getElementById:()=>({textContent:'',setAttribute(k,v){attrs[k]=v},addEventListener(n,f){handlers[n]=f}}),addEventListener(n,f){docHandlers[n]=f}},window:{AudioContext:Context,addEventListener(){}}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('battle-audio.js','utf8'),sandbox);const api=sandbox.window.RUS_AUDIO;
function advance(t){context.currentTime=t;for(const s of [...live])if(s.until<=t){live.delete(s);s.onended?.()}}
(async()=>{assert.equal(context,undefined,'no autoplay/context before user input');await api.unlock();api.begin();const u={id:'militia',role:'melee',x:2,hpNow:55},target={id:'p_foot',x:8,hpNow:0},horse={id:'rider',x:2,hpNow:100};
for(let i=0;i<600;i++){advance(i/10);for(let j=0;j<20;j++)api.hit(u,target);api.update([u,horse])}
const swords=plays.filter(p=>p.kind==='sword'),cries=plays.filter(p=>p.kind==='cry'),horses=plays.filter(p=>p.kind==='horse');assert.equal(new Set(swords.map(p=>p.url)).size,10);for(let i=1;i<swords.length;i++){assert(swords[i].time-swords[i-1].time>=.44);assert.notEqual(swords[i].url,swords[i-1].url)}assert(cries.length>0&&cries.length<=3);for(let i=1;i<cries.length;i++)assert(cries[i].time-cries[i-1].time>=5);assert.equal(horses.length,2);
api.end();assert.equal(live.size,0);const count=plays.length;advance(70);api.hit(u,target);api.update([horse]);assert.equal(plays.length,count);
api.begin();const beforeHorse=plays.filter(p=>p.kind==='horse').length;for(let i=700;i<1000;i++){advance(i/10);api.update([u])}assert.equal(plays.filter(p=>p.kind==='horse').length,beforeHorse);
api.begin();for(const [i,kind] of ['gun','flame','blast','laser','magic','swish','metal','roar','warning','horse'].entries()){advance(200+i);assert(api.effect(kind));assert(!api.effect(kind),'rate limit prevents sound pileup')}api.end();assert.equal(live.size,0);
handlers.click();assert.equal(attrs['aria-pressed'],'false');const muted=plays.length;advance(110);api.hit(u,target);assert.equal(plays.length,muted);handlers.click();await api.unlock();hidden=true;docHandlers.visibilitychange();assert.equal(live.size,0);advance(120);api.hit(u,target);api.update([horse]);assert.equal(plays.length,muted);console.log('PASS: 10 synthesis cues obey shared polyphony/rate limit/stop; 10 non-repeating swords, sparse voices (max 3), horses only with cavalry (max 2), polyphony <=3, stop after battle, mute and background silence');})();

