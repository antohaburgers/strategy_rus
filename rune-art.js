/* Fictional sacred artifacts, not historical writing. Cached Canvas art, no image requests.
 * Schools are presentation metadata; they never modify rune rules or save data. */
(() => {
'use strict';
const schools={
 rod:{id:'rod',name:'РОД',color:'#e7c984',light:'#fff0c9',stone:'#8b7250',dark:'#4a3928'},
 perun:{id:'perun',name:'ПЕРУН',color:'#91d5e8',light:'#d9f0ed',stone:'#718a8b',dark:'#344b51'},
 ra:{id:'ra',name:'РА',color:'#eeb16b',light:'#ffe3aa',stone:'#bd8c41',dark:'#68432b'},
 veles:{id:'veles',name:'ВЕЛЕС',color:'#a9c48b',light:'#e7ddb0',stone:'#7e8152',dark:'#3d4c35'},
 vedat:{id:'vedat',name:'ВЕДАТЬ',color:'#b8ace7',light:'#e2e4fc',stone:'#746a8c',dark:'#3b354e'}
};
const rows=[
 ['ancestors','rod','Родовой дуб','tree'],['svarog','rod','Белый речной камень','shield'],
 ['bast','ra','Янтарная бронза','steps'],['goida','veles','Дубовая плашка','grain'],
 ['beard','rod','Резная береста','beard'],['fury','perun','Грозовой камень','bolt'],
 ['berserk','ra','Обожжённая глина','heart'],['arrows','ra','Солнечная латунь','arrow'],
 ['tribute','veles','Старая бронза','coins'],['cunning','vedat','Морёный ясень','fox'],
 ['wrath','perun','Расколотый гранит','chain'],['veles','veles','Лесной камень','paw'],
 ['hyperfury','ra','Воронёное железо','axe'],['staff','perun','Серебро на дереве','staff'],
 ['immortal','rod','Светлый известняк','sprout'],['curse','vedat','Кость и обсидиан','splitEye'],
 ['sky','perun','Небесное серебро','storm'],['call','rod','Дерево священной рощи','kin'],
 ['madness','rod','Тёмный янтарь','rootsHeart'],['wisdom','vedat','Фиолетовый агат','eye'],
 ['hyperborea','vedat','Северный хрусталь','world'],['greatness','rod','Золото предков','greatTree']
];
rows.push(
 ['pikes','rod','Остриё из ясеня','arrow'],['cavalry','ra','Кованая подкова','steps'],
 ['hunters','vedat','Соколиная кость','eye'],['ember','ra','Уголь из горна','axe'],
 ['ward','rod','Соляной камень','shield'],['pack','veles','Медвежий камень','paw'],
 ['discipline','rod','Дубовый обруч','shield'],['peasants','veles','Берестяная община','grain'],
 ['duelist','ra','Сталь богатыря','axe'],['stormiron','perun','Грозовое железо','bolt'],
 ['silence','vedat','Печать тишины','splitEye'],['dread','veles','Тёмный клык','paw'],
 ['scouts','ra','Степной янтарь','arrow'],['thorns','rod','Колючий дуб','tree'],
 ['focus','perun','Спокойное серебро','staff']);
const specs=new Map(rows.map(([id,school,material,motif],i)=>[id,{id,school:schools[school],material,motif,index:i}]));
let c;const cache=new Map(),MAX_CACHE=111;
function line(points,col,w=2){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke()}
function poly(points,fill,stroke,w=1){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke()}}
function circle(x,y,r,col,w=2,fill=null){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function curve(points,col,w=2){c.beginPath();c.moveTo(points[0],points[1]);c.bezierCurveTo(...points.slice(2));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke()}
function sun(x,y,r,col,count=8){circle(x,y,r*.55,col,1.7);for(let i=0;i<count;i++){const a=i*Math.PI*2/count;line([[x+Math.cos(a)*r*.75,y+Math.sin(a)*r*.75],[x+Math.cos(a)*r,y+Math.sin(a)*r]],col,1.5)}}
function tree(col,great=false){
 line([[0,18],[0,-15]],col,great?3.5:3);line([[0,18],[-13,25],[-19,25]],col,2);line([[0,18],[13,25],[19,25]],col,2);line([[0,19],[-5,27]],col,1.5);line([[0,19],[5,27]],col,1.5);
 for(const [x,y] of [[-17,-11],[-9,-23],[10,-22],[18,-10]]){line([[0,7],[x,y]],col,2);circle(x,y,3,col,1.3)}
 circle(0,-24,great?8:5,col,1.5);if(great){sun(0,-24,10,col);circle(-18,8,2,col,1);circle(18,8,2,col,1)}
}
function eye(col,split=false){curve([-22,0,-9,-20,9,-20,22,0],col,2.5);curve([-22,0,-9,20,9,20,22,0],col,2.5);circle(0,0,7,col,2);circle(0,0,2,col,1.5,col);if(split)line([[2,-27],[-4,-15],[3,-3],[-3,9],[2,25]],col,2);else{circle(0,0,24,col,1.1);line([[0,-28],[0,-23]],col,2);line([[0,23],[0,28]],col,2)}}
function glyph(spec,col){
 const m=spec.motif;
 if(m==='tree'||m==='greatTree')tree(col,m==='greatTree');
 else if(m==='shield'){poly([[-19,-19],[0,-25],[19,-19],[17,10],[0,26],[-17,10]],null,col,2.5);line([[-9,9],[0,1],[9,9]],col,2);sun(0,-7,9,col)}
 else if(m==='steps'){poly([[-15,-10],[-7,-15],[-2,-3],[-6,8],[-17,8]],null,col,2.5);poly([[5,3],[13,-2],[18,10],[14,22],[3,22]],null,col,2.5);for(let i=0;i<3;i++)line([[-19,-7+i*5],[-26,-10+i*4]],col,1.5);sun(13,-20,8,col)}
 else if(m==='grain'){line([[-12,22],[-12,-17]],col,2);for(let i=0;i<4;i++){const y=10-i*8;line([[-12,y],[-22,y-8]],col,2);line([[-12,y],[-2,y-8]],col,2)}poly([[7,-7],[23,-7],[27,17],[17,24],[4,16]],null,col,2);line([[10,-9],[21,-9]],col,3);circle(16,8,5,col,1.5)}
 else if(m==='beard'){curve([-16,-12,-15,8,-7,20,0,27],col,3);curve([16,-12,15,8,7,20,0,27],col,3);curve([-16,-12,-7,-4,-3,-18,0,-10],col,2);curve([16,-12,7,-4,3,-18,0,-10],col,2);line([[-7,0],[-3,13],[0,17],[4,11],[8,0]],col,1.8);sun(0,-26,8,col)}
 else if(m==='bolt'){poly([[4,-28],[-15,3],[-1,2],[-7,27],[19,-9],[3,-7]],null,col,3);line([[-23,-22],[-19,-15]],col,1.5);line([[20,16],[25,22]],col,1.5)}
 else if(m==='heart'||m==='rootsHeart'){curve([0,-12,-23,-30,-26,0,0,20],col,2.5);curve([0,-12,23,-30,26,0,0,20],col,2.5);if(m==='heart'){line([[0,12],[-6,0],[2,-10],[7,3]],col,2);for(const x of [-22,22])line([[x,-15],[x*1.16,-25]],col,1.7)}else{line([[0,20],[-12,27],[-22,25]],col,2);line([[0,20],[12,27],[22,25]],col,2);circle(0,-26,4,col,1.5)}}
 else if(m==='arrow'){line([[-16,21],[14,-23]],col,3);line([[1,-19],[16,-26],[17,-10]],col,2.5);for(let i=0;i<3;i++)line([[-16+i*3,21-i*4],[-22+i*3,16-i*4]],col,1.7);sun(17,16,9,col)}
 else if(m==='coins'){circle(-12,-9,13,col,2.5);circle(13,9,13,col,2.5);circle(-12,-9,6,col,1.5);circle(13,9,6,col,1.5);line([[-24,14],[-15,23],[-2,23]],col,2);line([[2,-23],[16,-23],[24,-15]],col,2)}
 else if(m==='fox'){poly([[-23,-22],[-7,-9],[0,-13],[7,-9],[23,-22],[18,11],[0,26],[-18,11]],null,col,2.5);line([[-16,1],[-8,5],[-3,0]],col,2);line([[16,1],[8,5],[3,0]],col,2);poly([[-3,16],[3,16],[0,21]],col,null)}
 else if(m==='chain'){for(const [x,y] of [[-19,-8],[0,6],[20,-8]]){line([[x+3,y-18],[x-6,y-2],[x+2,y-3],[x-4,y+12]],col,2.4)}curve([-19,7,-9,21,9,21,20,7],col,1.8);circle(0,-26,3,col,1.5)}
 else if(m==='paw'){circle(-15,-13,5,col,2);circle(-4,-22,5,col,2);circle(9,-21,5,col,2);circle(20,-10,5,col,2);curve([-17,12,-20,-6,18,-7,20,13],col,2.5);curve([-17,12,-9,27,12,27,20,13],col,2.5);line([[-5,7],[2,3],[8,8]],col,1.5)}
 else if(m==='axe'){line([[-11,25],[5,-26]],col,3);poly([[3,-23],[13,-27],[26,-19],[22,-3],[11,-9],[-2,-10]],null,col,2.5);line([[-24,-17],[-19,-25],[-18,-12]],col,1.8);line([[-25,3],[-21,-3],[-18,6]],col,1.8);sun(-15,-5,7,col)}
 else if(m==='staff'){line([[0,27],[0,-16]],col,3);circle(0,-22,8,col,2);line([[-12,-14],[-17,-8],[-10,-1]],col,1.8);line([[13,-17],[19,-9],[12,-4]],col,1.8);line([[-4,5],[4,1],[-4,16],[4,12]],col,1.5);sun(0,-22,4,col)}
 else if(m==='sprout'){circle(0,0,25,col,1.8);line([[0,22],[0,-14]],col,2.5);curve([0,0,-23,4,-25,-12,0,-3],col,2);curve([0,-7,24,-9,17,-26,0,-14],col,2);line([[0,22],[-10,27]],col,1.5);line([[0,22],[10,27]],col,1.5)}
 else if(m==='splitEye')eye(col,true);
 else if(m==='storm'){curve([-22,-11,-30,-25,-9,-33,-5,-22],col,2);curve([-5,-22,3,-40,26,-27,22,-13],col,2);line([[-22,-11],[22,-13]],col,2);for(let i=0;i<3;i++){const x=-15+i*15;line([[x,-2],[x-5,9],[x+2,7],[x-4,25]],col,2)}}
 else if(m==='kin'){for(const [x,y] of [[-18,-8],[0,-20],[18,-8]]){circle(x,y,4,col,1.7);line([[x,y+6],[x,y+24]],col,2);line([[x-6,y+14],[x,y+9],[x+6,y+14]],col,1.7)}curve([-24,20,-9,34,11,34,24,20],col,1.8)}
 else if(m==='eye')eye(col);
 else if(m==='world'){circle(0,0,26,col,1.5);poly([[-22,12],[-7,-10],[0,0],[8,-21],[23,12]],null,col,2.5);curve([-25,-7,-7,-24,17,-18,26,-2],col,1.6);curve([-25,-7,-9,12,15,19,26,-2],col,1.6);circle(0,20,3,col,1.5);circle(-23,-16,2,col,1.5)}
}
function outline(s){
 if(s.id==='rod'){c.beginPath();c.ellipse(0,0,39,44,0,0,Math.PI*2)}
 else if(s.id==='ra'){c.beginPath();for(let i=0;i<32;i++){const a=i*Math.PI/16-Math.PI/2,r=i%2?39:43;(i?c.lineTo.bind(c):c.moveTo.bind(c))(Math.cos(a)*r,Math.sin(a)*r)}c.closePath()}
 else{const points=s.id==='perun'?[[-26,-44],[11,-46],[32,-29],[38,9],[25,40],[-14,44],[-36,23],[-37,-16]]:s.id==='veles'?[[-26,-40],[1,-45],[29,-35],[39,-8],[35,28],[15,43],[-19,40],[-39,15],[-38,-16]]:[[-9,-46],[20,-38],[36,-16],[34,18],[10,45],[-18,38],[-37,13],[-30,-24]];c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath()}
}
function drawArtifact(ctx,r,size){
 c=ctx;const spec=specs.get(r.id)||specs.get('ancestors'),s=spec.school,legend=r.tier===4;
 c.clearRect(0,0,size,size);c.save();c.translate(size/2,size/2);c.scale(size/112,size/112);
 // These soft shadows are baked once, never recomputed in animation frames.
 c.shadowColor=s.color+'48';c.shadowBlur=legend?13:5;outline(s);c.fillStyle=s.dark;c.fill();c.shadowBlur=0;
 c.translate(0,2);outline(s);c.fillStyle='#171b19';c.fill();c.translate(0,-4);outline(s);
 const bevel=c.createLinearGradient(-24,-39,22,45);bevel.addColorStop(0,legend?'#dbc786':s.stone);bevel.addColorStop(.5,s.dark);bevel.addColorStop(1,'#242c29');c.fillStyle=bevel;c.fill();c.strokeStyle=legend?'#d7bb70':'#a8a17c';c.lineWidth=1.4;c.stroke();
 c.save();outline(s);c.clip();
 for(let i=0;i<19;i++){const x=((i*23+spec.index*7)%73)-36,y=((i*17+spec.index*11)%83)-42;
  if(spec.material.includes('дуб')||spec.material.includes('дерев')||spec.material.includes('Дуб')||spec.material.includes('береста'))curve([x,y,x-3,y+8,x+4,y+13,x-1,y+20],'#d0b28519',.75);
  else line([[x,y],[x+2+(i%3),y-1]],i%2?'#eee1b125':'#0e211f45',.7);
 }
 c.restore();
 // A hand-cut decorative border, not a borrowed alphabet.
 c.save();c.scale(.84,.87);outline(s);c.strokeStyle=s.color+'6b';c.lineWidth=1;c.stroke();c.restore();
 if(s.id==='perun'){line([[-31,-28],[-22,-21],[-28,-10]],'#cce0d45c',.8);line([[30,24],[23,29],[26,36]],'#cce0d45c',.8)}
 for(let i=0;i<(legend?12:6);i++){const a=i*Math.PI*2/(legend?12:6)-Math.PI/2,x=Math.cos(a)*33,y=Math.sin(a)*36;circle(x,y,legend?1.25:.8,s.color,.7,s.color+'80')}
 c.save();c.translate(1,1.3);glyph(spec,'#111e1c');c.restore();
 c.shadowColor=s.color+'88';c.shadowBlur=legend?6:2;glyph(spec,s.color);c.shadowBlur=0;
 if(legend){circle(0,0,48,s.color+'88',.8);for(const x of [-43,43])poly([[x,-3],[x+3,0],[x,3],[x-3,0]],s.light,null)}
 c.restore();
}
function cached(r,size){size=size>=250?320:size>=100?160:64;const key=r.id+':'+r.tier+':'+size;if(cache.has(key))return cache.get(key);const canvas=document.createElement('canvas');canvas.width=canvas.height=size;drawArtifact(canvas.getContext('2d'),r,size);if(cache.size>=MAX_CACHE)cache.delete(cache.keys().next().value);cache.set(key,canvas);return canvas}
function create(r,size=160){const image=cached(r,size),canvas=document.createElement('canvas');canvas.className='runeSymbol';canvas.width=canvas.height=image.width;canvas.dataset.school=(specs.get(r.id)||specs.get('ancestors')).school.id;canvas.setAttribute('aria-hidden','true');canvas.getContext('2d').drawImage(image,0,0);return canvas}
function info(r){return specs.get(typeof r==='string'?r:r.id)||specs.get('ancestors')}
let backdropCache=null;
function shopBackdrop(w,h){
 w=Math.min(1600,Math.max(320,Math.round(w)));h=Math.min(1200,Math.max(300,Math.round(h)));
 if(!backdropCache||backdropCache.width!==w||backdropCache.height!==h){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;c=canvas.getContext('2d');
  const s=Math.min(w/900,h/600);
  for(const side of [-1,1]){
   const x=w*(side<0?.045:.955),y=h*.47;
   c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=.28;
   // Carved wooden idols of the game's fictional pantheon, recessed into the stall.
   poly([[-16,-66],[0,-79],[16,-66],[13,-40],[21,53],[-21,53],[-13,-40]],'#211e15','#ac8b4e',1.5);
   line([[-10,-49],[-4,-47]],'#c3a974',2);line([[4,-47],[10,-49]],'#c3a974',2);line([[0,-45],[-2,-34],[4,-34]],'#96794b',1.5);line([[-8,-27],[0,-20],[8,-27]],'#b99b62',1.5);sun(0,3,13,'#ad925b');
   for(let i=0;i<5;i++)curve([-16+i*7,20,-19+i*7,29,-12+i*7,35,-16+i*7,47],'#9b7d4a',1);
   c.restore();
   // Candlelight is painted once; no full-screen flickering glow.
   c.save();c.translate(x,h*.17);c.scale(s,s);c.globalAlpha=.5;
   const glow=c.createRadialGradient(0,-24,0,0,-24,28);glow.addColorStop(0,'#e6bd6b55');glow.addColorStop(1,'#e6bd6b00');c.fillStyle=glow;c.fillRect(-28,-52,56,56);
   poly([[-5,-13],[5,-13],[5,18],[-5,18]],'#bca477','#78653b',1);poly([[0,-31],[-4,-23],[0,-17],[4,-23]],'#d3ac63',null);line([[-9,19],[9,19]],'#a58b4e',3);c.restore();
  }
  // A bear hide and old coins lie under the counter, away from the card faces.
  c.save();c.translate(w*.5,h*.91);c.scale(s,s);c.globalAlpha=.1;
  poly([[-140,0],[-111,-28],[-81,-26],[-70,-42],[-46,-40],[-31,-59],[0,-62],[31,-59],[46,-40],[70,-42],[81,-26],[111,-28],[140,0],[103,17],[74,12],[40,30],[0,34],[-40,30],[-74,12],[-103,17]],'#b49a6c','#d2bb88',1.5);
  for(let i=0;i<5;i++)line([[-75+i*34,-17],[-70+i*34,15]],'#493b25',2);c.restore();
  for(let i=0;i<9;i++){const x=w*(.15+i*.085),y=h*.965+(i%2)*4;circle(x,y,4+s*2,'#ba9f60',1,'#68533755')}
  backdropCache=canvas;
 }
 const result=document.createElement('canvas');result.width=w;result.height=h;result.className='shopAtmosphere';result.setAttribute('aria-hidden','true');result.getContext('2d').drawImage(backdropCache,0,0);return result;
}
function activate(id){window.dispatchEvent(new CustomEvent('rus:rune-activation',{detail:{id}}))}
window.RUS_RUNE_ART={create,info,activate,schools,shopBackdrop,cacheSize:()=>cache.size,cacheLimit:MAX_CACHE};
})();
