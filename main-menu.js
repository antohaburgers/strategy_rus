/* Title illustration: the game's own warriors, steppe, banners and Perun's storm. */
(() => {
'use strict';
const screen=document.getElementById('titleScreen'),canvas=document.getElementById('titleArt'),ctx=canvas.getContext('2d');
const button=document.getElementById('startGame'),app=document.getElementById('app');
function draw(){
 if(screen.hidden)return;
 const w=innerWidth,h=innerHeight,dpr=Math.min(2,devicePixelRatio||1);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#1b3433');sky.addColorStop(.4,'#617b6b');sky.addColorStop(.67,'#c6ad72');sky.addColorStop(1,'#283e2d');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 function poly(points,color){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill()}
 function line(points,color,width){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke()}
 function disc(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
 const sy=h*.54,sr=Math.min(w*.19,h*.18),sun=ctx.createRadialGradient(w*.5,sy,sr*.5,w*.5,sy,sr*2.4);sun.addColorStop(0,'#e6c68580');sun.addColorStop(.5,'#d7b56626');sun.addColorStop(1,'#e8c67c00');ctx.fillStyle=sun;ctx.fillRect(0,0,w,h);
 disc(w*.5,sy,sr,'#d4b778');disc(w*.5-2,sy-2,sr*.91,'#e0c58c');
 ctx.save();ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(w*.5,sy,sr*1.1,0,Math.PI*2);ctx.strokeStyle='#f3dca0';ctx.lineWidth=1;ctx.stroke();for(let i=0;i<24;i++){const a=i*Math.PI/12;line([[w*.5+Math.cos(a)*sr*1.15,sy+Math.sin(a)*sr*1.15],[w*.5+Math.cos(a)*sr*1.25,sy+Math.sin(a)*sr*1.25]],'#f2d695',1)}ctx.restore();
 // Soft cloud bands, forest and a small settlement against the sun.
 for(let k=0;k<3;k++){const points=[[0,h]];for(let i=0;i<=30;i++)points.push([w*i/30,h*(.58+k*.065)+Math.sin(i*.55+k*2)*h*.025]);points.push([w,h]);poly(points,['#6c8166','#4b694f','#294b36'][k])}
 for(let i=0;i<45;i++){const x=i*w/44,y=h*(.67+Math.sin(i*.9)*.015),size=h*(.026+(i%5)*.006);poly([[x,y-size],[x-size*.35,y],[x+size*.35,y]],'#31513e')}
 const hs=Math.min(w/900,h/510);
 function hut(x,y,scale){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  poly([[-27,-35],[23,-35],[23,0],[-27,0]],'#2e3828');poly([[23,-35],[39,-29],[39,-2],[23,0]],'#233227');
  poly([[-36,-32],[-2,-61],[30,-32]],'#26362b');poly([[-2,-61],[16,-65],[48,-30],[30,-32]],'#1e2e25');
  for(let j=0;j<5;j++)line([[-27,-30+j*6],[23,-30+j*6]],'#4d4c32',1.5);
  poly([[-15,-23],[-4,-23],[-4,-11],[-15,-11]],'#b79b5b88');line([[-9,-23],[-9,-11]],'#263529',1.5);line([[-15,-17],[-4,-17]],'#263529',1.5);
  line([[-18,-27],[-9,-30],[0,-27]],'#7c7044',2);poly([[8,-21],[17,-21],[17,0],[8,0]],'#182d23');line([[-2,-61],[-2,-68]],'#7e754a',1.5);ctx.restore()}
 for(let i=0;i<6;i++)hut(w*(.13+i*.145),h*(.735+Math.sin(i*2)*.014),hs*(.65+(i%3)*.13));
 for(let i=0;i<16;i++){const x=w*(.05+i*.063),y=h*.75;line([[x,y],[x,y-h*.045]],'#23382a',2*hs)}
 // Birch trunks and branches carry the village silhouette without becoming scenery assets.
 for(const [x,side] of [[w*.07,-1],[w*.91,1]]){const y=h*.79,ht=h*.35;line([[x,y],[x+side*ht*.04,y-ht]],'#c4c3a166',5*hs);for(let i=0;i<7;i++){const yy=y-ht*(.15+i*.1);line([[x-2*hs,yy],[x+3*hs,yy-2*hs]],'#2b3b2d',2*hs)}line([[x,y-ht*.6],[x+side*ht*.17,y-ht*.9]],'#a7b29455',2*hs);for(let i=0;i<7;i++)disc(x+Math.sin(i*2)*ht*.13,y-ht*.8+Math.cos(i)*ht*.12,ht*.07,'#304e3a99')}
 for(const side of [0,1]){const x=w*(side?.87:.13),y=h*.71,s=Math.min(w,h)*.002;line([[x,y],[x,y-100*s]],'#a88d5c',3*s);poly([[x+2*s,y-98*s],[x+52*s,y-92*s],[x+44*s,y-54*s],[x+2*s,y-60*s]],side?'#7c392d':'#c6b991');if(!side)window.RUS_ART.rune(ctx,x+24*s,y-78*s,1.8*s,'#9d4433')}
 if(window.RUS_RUNE_ART){ctx.save();ctx.globalAlpha=.06;const art=window.RUS_RUNE_ART.create(window.RUS_RUN.runeMap.get('ancestors'),160);for(const x of [w*.13,w*.87])ctx.drawImage(art,x-45,h*.19-45,90,90);ctx.restore()}
 // Army silhouettes at the horizon.
 const D=window.RUS_DATA;
 function unit(id,enemy,x,y,scale,shade=false){
  const def=[...D.heroes,...D.enemies].find(u=>u.id===id);
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(shade)ctx.globalAlpha=.45;
  window.RUS_ART.draw(ctx,{...def,team:enemy?'enemy':'rus',hpNow:def.hp,facing:enemy?-1:1},0);ctx.restore();
 }
 const s=Math.min(w/1000,h/620);
 for(let i=0;i<4;i++){unit(i%2?'spear':'shield',false,w*(.04+i*.035),h*(.77+(i%2)*.015),s*.75,true);unit(i%2?'p_foot':'l_runner',true,w*(.75+i*.035),h*(.77+(i%2)*.015),s*.75,true)}
 // Larger foreground characters frame the single start button.
 const portrait=h>w,base=portrait?h*.89:h*.96,heroScale=portrait?w/205:Math.min(h/160,w/310);
 unit('rider',false,w*.08,base,heroScale*.77);
 unit('bogatyr',false,w*(portrait?.24:.22),base,heroScale);
 unit('l_shield',true,w*(portrait?.77:.79),base,heroScale*.9);
 unit('d_rex',true,w*.95,base,heroScale*.9);
 for(let i=0;i<85;i++){const x=(i*73.17%w),y=h*(.86+(i%7)*.025);line([[x,y],[x-4,y-8-(i%4)*3]],i%2?'#a69b5c55':'#132e27',1)}
 // Small golden sparks suspended over the field.
 for(let i=0;i<28;i++){ctx.fillStyle='#ebca7b66';ctx.beginPath();ctx.arc((i*137.3)%w,h*(.3+(i%13)*.048),i%3===0?1.6:.8,0,Math.PI*2);ctx.fill()}
}
button.addEventListener('click',()=>window.RUS_UI.launch());
window.addEventListener('resize',draw);
draw();
})();

