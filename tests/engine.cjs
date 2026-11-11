const fs=require('fs'),vm=require('vm'),path=require('path'),root=path.resolve(__dirname,'..');
module.exports=function engine(seed=17,saved=null){
 const elements=new Map(),noop=()=>{},storage=saved?{'rus-roguelike-v1':JSON.stringify(saved)}:{};
 const context=new Proxy({},{get:(o,k)=>k.startsWith('create')?()=>({addColorStop:noop}):noop,set:()=>true});
 function el(id){if(!elements.has(id))elements.set(id,{id,style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},getContext:()=>context,getBoundingClientRect:()=>({width:844,height:390,left:0,top:0}),querySelectorAll:()=>[],querySelector:()=>el('cost'),addEventListener:noop,append:noop,add:noop,setAttribute:noop});return elements.get(id)}
 let rng=seed;const math=Object.create(Math);math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
 const ctx={window:{dispatchEvent:noop,addEventListener:noop,RUS_ART:{draw:noop}},document:{getElementById:el,createElement:()=>el('el'+math.random()),body:el('body')},Event:class{},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},Math:math,Date,performance:{now:()=>0},requestAnimationFrame:noop,console};vm.createContext(ctx);
 for(const f of ['game-data.js','factions.js','roguelike.js','rune-effects.js','faction-combat.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8').replace('EncounterGenerator:{reference}', 'EncounterGenerator:{reference,generate:encounter}'),ctx);
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8').replace('window.RUS_BATTLE={','window.TEST={state,makeSoldier,attack,applyDamage,updateLightning,tick,prepareEncounter,placeAt,startBattle,clearArmy,spawn,render,special:()=>special};window.RUS_BATTLE={');vm.runInContext(source,ctx);
 const R=ctx.window.RUS_RUN,T=ctx.window.TEST,D=ctx.window.RUS_DATA;
 if(!saved){R.newRun();R.get().seed=R.get().rng=seed;R.get().startChoices=['ancestors','svarog','goida'];R.chooseStart('ancestors')}
 return {R,T,D,ctx,storage};
};
