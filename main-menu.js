/* Title illustration: the game's own warriors, steppe, banners and Perun's storm. */
(() => {
'use strict';
const screen=document.getElementById('titleScreen'),canvas=document.getElementById('titleArt'),ctx=canvas.getContext('2d');
const button=document.getElementById('startGame'),app=document.getElementById('app');
function draw(){
 if(screen.hidden)return;
 const w=innerWidth,h=innerHeight,dpr=Math.min(2,devicePixelRatio||1);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#173b38');sky.addColorStop(.43,'#839b7f');sky.addColorStop(.6,'#d1bd87');sky.addColorStop(1,'#304c36');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 const sun=ctx.createRadialGradient(w*.5,h*.43,0,w*.5,h*.43,w*.37);sun.addColorStop(0,'#f9d99588');sun.addColorStop(1,'#f9d99500');ctx.fillStyle=sun;ctx.fillRect(0,0,w,h);
 function poly(points,color){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill()}
 function line(points,color,width){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
 for(let k=0;k<3;k++){const points=[[0,h]];for(let i=0;i<=30;i++)points.push([w*i/30,h*(.54+k*.1)+Math.sin(i*.55+k*2)*h*.035]);points.push([w,h]);poly(points,['#647f69','#45674e','#2c4b37'][k])}
 // Distant fir trees and palisades.
 for(let i=0;i<50;i++){const x=i*w/49,y=h*(.64+Math.sin(i*.9)*.018),size=h*(.025+(i%5)*.005);poly([[x,y-size],[x-size*.35,y],[x+size*.35,y]],'#3c5a47')}
 for(const side of [0,1]){const x=w*(side?.87:.13),y=h*.69,s=Math.min(w,h)*.002;line([[x,y],[x,y-100*s]],'#b69b68',3*s);poly([[x+2*s,y-98*s],[x+52*s,y-92*s],[x+44*s,y-54*s],[x+2*s,y-60*s]],side?'#7c392d':'#e4d5ae');if(!side)window.RUS_ART.rune(ctx,x+24*s,y-78*s,1.8*s,'#a83d36')}
 // Army silhouettes at the horizon.
 const D=window.RUS_DATA;
 function unit(id,enemy,x,y,scale,shade=false){
  const def=[...D.heroes,...D.enemies].find(u=>u.id===id);
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(shade)ctx.globalAlpha=.45;
  window.RUS_ART.draw(ctx,{...def,team:enemy?'enemy':'rus',hpNow:def.hp,facing:enemy?-1:1},0);ctx.restore();
 }
 const s=Math.min(w/1000,h/620);
 for(let i=0;i<7;i++){unit(i%2?'spear':'shield',false,w*(.04+i*.035),h*(.77+(i%2)*.015),s*.75,true);unit(i%2?'p_foot':'l_runner',true,w*(.75+i*.035),h*(.77+(i%2)*.015),s*.75,true)}
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
button.addEventListener('click',()=>{
 if(screen.hidden)return;
 screen.hidden=true;screen.classList.add('hidden');document.body.classList.remove('at-title');
 app.inert=false;app.removeAttribute('inert');app.removeAttribute('aria-hidden');
 window.dispatchEvent(new Event('resize'));
 window.dispatchEvent(new Event('rus:start'));
 document.getElementById('menu').focus({preventScroll:true});
});
window.addEventListener('resize',draw);
draw();
})();
