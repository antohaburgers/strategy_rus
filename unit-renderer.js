/* Hand-painted Canvas 2D silhouettes. No image assets; coordinates are ground anchored.
 * Render-only state (motion/hurt/facing) never participates in combat decisions. */
(() => {
'use strict';
let c;
const peasantIds=new Set(['militia','shield','spear','archer','rider','bogatyr']);
const ink='#292b29', steel='#a7b7b7', light='#e3e6d4', gold='#dab56a';
function path(p,fill,stroke=ink,w=1.3){c.beginPath();c.moveTo(...p[0]);for(let i=1;i<p.length;i++)c.lineTo(...p[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke()}}
function oval(x,y,rx,ry,fill,stroke=null,w=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke()}}
function line(p,color,w=2){c.beginPath();c.moveTo(...p[0]);for(let i=1;i<p.length;i++)c.lineTo(...p[i]);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke()}
function limb(p,col,w){line(p,ink,w+2);line(p,col,w)}
function metal(p){path(p,steel);line([p[0],p[1]],light,1)}
function spear(x,y,angle=0,tassel=false){c.save();c.translate(x,y);c.rotate(angle);line([[0,13],[0,-39]],'#342d25',3.8);line([[-.5,12],[-.5,-37]],'#b99660',1.7);metal([[0,-48],[-3.6,-36],[0,-38],[3.6,-36]]);if(tassel)path([[0,-35],[9,-31],[6,-22],[1,-27]],'#c74e3e');c.restore()}
function sword(x,y,a,heavy=false){c.save();c.translate(x,y);c.rotate(a);line([[0,4],[0,-6]],'#5e372a',3);line([[-5,-5],[5,-5]],gold,2.5);metal([[-2.5,-7],[-2.5,-28],[0,-34],[3,-28],[2,-7]]);if(heavy)path([[-2,-21],[-12,-25],[-13,-36],[-3,-31]],steel);c.restore()}
function bow(x,y,draw=0){c.save();c.translate(x,y);c.beginPath();c.moveTo(0,-17);c.bezierCurveTo(19,-9,19,9,0,18);c.strokeStyle=ink;c.lineWidth=4;c.stroke();c.strokeStyle='#d7a96a';c.lineWidth=2;c.stroke();line([[0,-17],[-7*draw,0],[0,18]],'#f0ddb0',.9);line([[-10-7*draw,0],[20,0]],'#e5d1a4',1.2);path([[22,0],[16,-2],[16,2]],steel,null);c.restore()}
function shield(x,y,col,heavy=false,steppe=false){c.save();c.translate(x,y);const p=heavy?[[-11,-17],[9,-17],[12,-5],[5,14],[-3,19],[-13,5]]:[[-10,-12],[0,-16],[10,-10],[9,8],[0,16],[-10,6]];if(steppe)oval(0,0,12,13,col,ink,1.6);else path(p,col);if(!steppe){line([[-7,-10],[-6,5],[-1,12]],'#ffffff45',1.3);line([[3,-12],[4,7]],'#1b302a55',1)}line([[-8,-1],[8,-1]],gold,2);line([[0,-11],[0,12]],gold,2);oval(0,-1,3.4,3.4,steel,ink);oval(-.8,-2,1.1,1.1,light);c.restore()}
// Fictional branching rune: deliberately drawn as geometry, independent of fonts.
function rune(x,y,size=1,col='#a62d36'){
 c.save();c.translate(x,y);c.scale(size,size);
 line([[0,-7],[0,7]],col,1.8);line([[-5,-5],[0,-1],[5,-5]],col,1.8);line([[-4,5],[0,2],[4,5]],col,1.6);c.restore();
}
function runicShield(x,y,heavy=false){shield(x,y,'#244b40',heavy,false);c.save();c.translate(x,y);line([[-8,-10],[-8,5]],'#ad3540',2);line([[7,-10],[7,4]],'#ad3540',2);rune(0,-1,.9,'#e7c46e');for(const [rx,ry] of [[-7,-8],[7,-7],[-6,7],[5,8]])oval(rx,ry,1,1,gold);c.restore()}
function armor(x,y,w,h,col,lamellar=false){path([[x-w,y],[x+w,y+1],[x+w+2,y+h],[x-w-2,y+h]],col);path([[x,y+2],[x+w,y+1],[x+w+2,y+h],[x,y+h]],'#10232728',null);for(let row=0;row<3;row++){const yy=y+5+row*5;line([[x-w+2,yy],[x+w-1,yy]],'#182b324f',1);for(let i=-1;i<=1;i++)if(lamellar)line([[x+i*4,yy-3],[x+i*4,yy-1]],gold,.8);else oval(x+(row%2?1:0)+i*4,yy-2,.8,.7,'#dce3d080')}}
function head(x,y,kind,skin,beard=false){
 oval(x,y,7,8,skin,ink,1.2);path([[x+4,y-2],[x+10,y+1],[x+6,y+3]],skin,ink,.8);
 if(beard)path([[x-6,y+2],[x-1,y+3],[x+6,y+2],[x+5,y+10],[x,y+14],[x-5,y+8]],kind==='hero'?'#8b5936':'#695040');
 line([[x+2,y-2],[x+5,y-2]],ink,1.5);oval(x+4,y-1,1,1,'#111d1c');
 if(kind==='cloth'){path([[x-8,y-4],[x-7,y-10],[x+4,y-11],[x+8,y-4]],'#926844');line([[x-7,y-4],[x+7,y-4]],'#e1c18a',2)}
 else if(kind==='fur'){path([[x-8,y-3],[x-9,y-9],[x-3,y-10],[x,y-16],[x+5,y-9],[x+8,y-7],[x+8,y-3]],'#775441');line([[x-7,y-4],[x-4,y-6],[x,y-4],[x+4,y-6],[x+7,y-4]],'#cfb18a',3)}
 else if(kind==='hood'){path([[x-7,y+4],[x-10,y-6],[x-5,y-13],[x+4,y-12],[x+9,y-5],[x+3,y-5],[x-3,y-7],[x-4,y+3]],'#57744c');line([[x-8,y-6],[x-5,y-10],[x+3,y-10]],'#a0b778',1)}
 else if(kind==='china'){path([[x-8,y-3],[x-7,y-10],[x,y-13],[x+7,y-9],[x+8,y-3]],'#374e55');line([[x-9,y-3],[x+9,y-3]],gold,2);path([[x-2,y-12],[x-4,y-21],[x+1,y-18],[x+4,y-23],[x+4,y-12]],'#c24a3d');path([[x-8,y-1],[x-5,y],[x-5,y+7],[x-9,y+4]],steel)}
 else {metal([[x-8,y-3],[x-7,y-9],[x,y-17],[x+6,y-10],[x+8,y-3]]);line([[x,y-14],[x,y-4]],light,1);line([[x-8,y-3],[x+8,y-3]],kind==='hero'?gold:'#586b75',2.5);path([[x-7,y-2],[x-4,y-2],[x-4,y+5],[x-8,y+3]],steel);if(kind==='hero')path([[x-2,y-16],[x-8,y-23],[x-4,y-27],[x+5,y-19]],'#b74436')}
}
function horse(gait,kind){
 const dark=kind==='c'?'#3b4447':'#624330',coat=kind==='p'?'#c1a17a':kind==='c'?'#778184':'#916342';
 // Far legs first, fetlocks and hooves remain at the ground plane.
 for(const [x,phase] of [[-15,0],[13,Math.PI]]){const s=Math.sin(gait+phase)*5;limb([[x,-18],[x-4+s,-8],[x+s,0]],dark,3.5);line([[x+s-2,1],[x+s+3,1]],ink,3)}
 path([[-20,-26],[-29,-24],[-33,-10],[-28,-13],[-24,-23]],dark);
 oval(-1,-23,23,11,coat,ink,1.5);oval(-8,-27,13,5,'#ffffff16');
 path([[9,-27],[13,-44],[20,-50],[26,-43],[24,-30],[17,-19]],coat);path([[12,-30],[11,-43],[19,-51],[23,-47],[18,-41],[17,-28]],dark);
 path([[19,-48],[29,-45],[35,-36],[32,-32],[23,-35],[17,-41]],coat);path([[20,-47],[20,-57],[24,-51],[28,-53],[28,-46]],coat);oval(27,-42,1.5,1.3,ink);line([[30,-36],[34,-35]],'#d9c5a0',2);
 line([[22,-45],[28,-38],[32,-34],[7,-29]],'#d8b575',1.2);line([[27,-38],[25,-32]],'#382d29',1.4);
 path([[-12,-33],[7,-34],[13,-19],[-10,-17]],kind==='c'?'#325f68':'#9c4437');line([[-10,-19],[11,-20]],gold,1.6);oval(-3,-33,11,3,'#4b3428',ink);
 for(const [x,phase] of [[-12,Math.PI],[15,0]]){const s=Math.sin(gait+phase)*5;limb([[x,-20],[x+3-s,-9],[x+s,1]],coat,4);line([[x+s-2,2],[x+s+3,2]],ink,3)}
}
function human(u,gait,attack){
 const id=u.id,p=id.startsWith('p_'),k=id.startsWith('c_'),china=id.startsWith('h_'),hero=id==='bogatyr',rus=!p&&!k&&!china;
 const mounted=['rider','p_horse','c_horsebow','c_lancer'].includes(id),heavy=['shield','c_guard','h_guard','bogatyr'].includes(id);
 const archer=id==='archer'||id==='c_horsebow',cross=id==='h_crossbow',spearman=['spear','p_spear','c_lancer','h_spear'].includes(id);
 const cloth=p?'#ad7547':k?'#36747a':china?'#b64236':archer?'#364a35':hero?'#6d3430':'#254d3e';
 if(rus)c.scale(1.12,1);
 if(mounted){horse(gait,p?'p':k?'c':'r');if(rus){path([[-20,-31],[7,-33],[13,-18],[2,-13],[-19,-17]],'#37574f');for(let i=0;i<4;i++){line([[-17+i*7,-29],[-15+i*7,-17]],gold,1.3)}rune(-4,-24,.65,'#e3c16e');path([[17,-49],[24,-47],[28,-37],[23,-34],[16,-42]],steel);rune(21,-42,.4,'#416a6b')}c.save();c.translate(-4,-23)}else c.save();
 const stride=mounted?0:Math.sin(gait)*3;
 if(rus||hero||k||id==='rider')path([[-8,-39],[-15,-28],[-17,-9],[-4,-15],[7,-12],[7,-38]],k?'#23505e':archer?'#203a30':'#702f30');
 limb([[-5,-15],[-7-stride,-7],[-7-stride,0]],'#655a46',4);limb([[5,-15],[6+stride,-7],[7+stride,0]],'#716046',4);
 path([[-10-stride,-6],[-4-stride,-6],[-3-stride,0],[-11-stride,1]],'#40352c');path([[4+stride,-6],[10+stride,-6],[13+stride,0],[4+stride,1]],'#40352c');
 if(archer){line([[-10,-28],[-15,-48]],'#6d452e',5);for(let i=0;i<3;i++){line([[-15+i*2,-41],[-17+i*2,-55]],'#cfb17c',1.1);line([[-17+i*2,-54],[-19+i*2,-52]],light,1.2)}}
 path([[-8,-37],[7,-37],[11,-14],[6,-10],[-2,-13],[-10,-11]],cloth);
 if(id!=='militia'&&!p&&!archer&&!cross)armor(0,-35,8,20,china?'#3e565a':k?'#5e7d7d':'#71868a',true);
 else {line([[-5,-33],[-4,-18]],'#ffffff30',1.2);line([[2,-35],[4,-17]],'#382b293f',1.2)}
 if(p){path([[-9,-37],[-12,-30],[-7,-32],[-3,-28],[0,-33],[6,-30],[10,-34],[7,-38]],'#d8c09b');}
 line([[-9,-18],[9,-18]],'#4e3328',3);path([[-1,-20],[3,-20],[3,-16],[-1,-16]],gold,ink,.6);
 if(rus){line([[-7,-13],[7,-13]],'#b43840',3);line([[-5,-35],[-4,-22]],'#b43840',2);rune(3,-27,.4);}
 if(heavy){oval(-9,-34,rus?8:5,rus?6:4,steel,ink);oval(8,-34,rus?8:5,rus?6:4,steel,ink)}
 if(rus){
  // Broad, ragged fur mantle, bronze binding and bone charms.
  path([[-9,-39],[-17,-35],[-16,-27],[-12,-30],[-9,-25],[-5,-31],[0,-29],[5,-32],[11,-26],[14,-32],[17,-30],[14,-38],[6,-41]],hero?'#b5a484':'#82765d');
  line([[-13,-35],[-8,-36],[-4,-33],[1,-35],[7,-34],[12,-36]],'#d6c4a0',1.6);
  line([[-5,-32],[-1,-26],[5,-31]],gold,1.3);
  for(const x of [-4,4])path([[x,-27],[x-1,-22],[x+1,-21],[x+2,-26]],'#e1d2b0',ink,.6);
  rune(2,-21,.42,'#dbb55b');line([[-8,-12],[8,-12]],gold,1.1);
 }
 if(rus)path([[-6,-48],[-10,-42],[-9,-29],[-5,-33],[1,-29],[6,-32],[9,-39],[7,-49]],hero?'#916b45':'#584533');
 const skin='#d7ad84';head(0,-44,china?'china':p?'fur':k?'hero':hero?'hero':id==='militia'?'cloth':archer?'hood':'rus',skin,!china&&(!archer||rus));
 if(rus){line([[-7,-48],[6,-48]],'#ab323d',2);if(archer)path([[-7,-41],[-10,-49],[-5,-56],[4,-55],[9,-48],[3,-48],[-3,-50],[-4,-41]],'#334934');
  line([[1,-47],[6,-46]],'#372e26',2.4);
  path([[-6,-41],[-2,-39],[5,-41],[7,-35],[4,-25],[0,-22],[-5,-30]],hero?'#93643f':'#67503a');
  line([[-3,-36],[-1,-28]],'#b3976b',1);line([[3,-36],[2,-29]],'#c1a477',1);
  if(!archer){rune(0,-53,.45,gold);line([[-7,-48],[-10,-44]],gold,1.3)}}
 // Weapon arm is animated independently from the torso.
 const handX=12+attack*7,handY=-27-attack*5;
 limb([[7,-32],[10,-24],[handX,handY]],cloth,4);if(rus)line([[10,-26],[13,-28]],'#b63840',2.5);oval(handX,handY,2.7,2.7,skin,ink,.8);
 if(spearman){spear(handX,handY,id==='p_spear'?.55-attack*.9:.35+attack*.65,china||k||rus);if(rus){rune(handX+4,handY-24,.4,gold);line([[handX-2,handY-12],[handX+3,handY-17]],gold,2)}}
 else if(archer){limb([[-5,-32],[4-attack*5,-29],[13-attack*7,-29]],cloth,3);bow(15,-29,1-attack);if(rus){rune(23,-39,.35,gold);line([[24,-18],[27,-21]],gold,1.5)}}
 else if(cross){line([[3,-25],[22,-31]],'#a07448',4);line([[17,-41],[22,-31],[26,-20]],steel,2.6);line([[17,-41],[17-attack*4,-29],[26,-20]],'#eee1bb',.8);line([[13,-29],[29,-34]],'#d9c8a5',1.2)}
 else {sword(handX,handY,.35+attack*1.5,hero||id==='militia');if(rus)rune(handX+3,handY-17,.35,'#91ced0')}
 if(heavy&&rus)runicShield(-11,-26,true);
 else if(heavy)shield(-11,-26,china?'#963f35':k?'#30747a':hero?'#9c4636':'#3d6576',!k,k);
 else if(mounted&&rus)runicShield(-10,-29);
 else if(mounted&&!archer)shield(-10,-29,p?'#a77a4b':'#904d37',false,true);
 else if(rus&&!archer&&!cross)runicShield(-11,-25);
 else if(!archer&&!cross)limb([[-8,-31],[-12,-22],[-8,-19]],cloth,3.6);
 c.restore();
}
// Rus-only silhouettes: work shirts, homespun trousers, woven shoes and farm tools.
function stitch(points,col='#a34332',w=1){line(points,col,w)}
function sunMark(x,y,r,col){c.save();c.translate(x,y);c.beginPath();c.arc(0,0,r*.5,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=1.2;c.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;line([[Math.cos(a)*r*.72,Math.sin(a)*r*.72],[Math.cos(a)*r,Math.sin(a)*r]],col,1.1)}c.restore()}
function woodShield(x,y,heavy=false){
 c.save();c.translate(x,y);const r=heavy?14:11;
 oval(0,0,r,r*1.13,'#513c29',ink,1.5);oval(0,-.5,r-1.9,r*1.13-2,'#987341','#b3975d',1.2);
 for(let i=-2;i<=2;i++){const xx=i*4;line([[xx,-Math.sqrt(Math.max(0,r*r-xx*xx))+2],[xx,Math.sqrt(Math.max(0,r*r-xx*xx))-1]],'#61472c',.9)}
 line([[-r+3,-5],[r-3,-5]],'#ceb27b',1.3);line([[-r+3,6],[r-3,6]],'#675b40',1.4);
 sunMark(0,0,r*.66,'#ead7a0');oval(0,0,2.5,2.8,'#998354',ink,.8);
 for(const a of [-2.4,-.7,.8,2.4])oval(Math.cos(a)*(r-2),Math.sin(a)*(r-1),1,1,'#d1b87c');c.restore();
}
function farmerAxe(x,y,attack,big=false){
 c.save();c.translate(x,y);c.rotate(-.25+attack*1.35);line([[0,10],[0,-27]],ink,4.5);line([[-.5,9],[-.5,-26]],'#a77e45',2.3);
 path([[-1,-27],[5,-29],[big?16:12,-25],[big?15:11,-15],[4,-18],[-1,-18]],'#8d9c98',ink,1.2);line([[big?15:11,-24],[big?14:10,-17]],'#e1e4d0',1.5);line([[-2,-21],[3,-22]],'#626e69',2);c.restore();
}
function fork(x,y,attack){
 c.save();c.translate(x,y);c.rotate(.24+attack*.5);line([[0,13],[0,-39]],ink,4);line([[0,12],[0,-38]],'#aa864e',2.2);
 line([[-5,-39],[-5,-49]],'#a9b1a3',1.6);line([[0,-38],[0,-52]],'#c9cebb',1.8);line([[5,-39],[5,-49]],'#a9b1a3',1.6);line([[-5,-39],[-4,-34],[0,-31],[4,-34],[5,-39]],'#7c8577',1.7);
 path([[-1,-28],[-5,-27],[-5,-18],[-2,-20]],'#a34b38',ink,.6);c.restore();
}
function peasantFace(id){
 const elder=id==='bogatyr',hunter=id==='archer',skin=elder?'#cfa27b':'#dbb18b';
 const hair=hunter?'#4c3e30':elder?'#655244':id==='shield'?'#82634c':'#795236';
 path([[-7,-46],[-9,-40],[-8,-32],[-4,-35],[1,-32],[7,-37],[7,-46]],hair,ink,1);
 oval(0,-44,6.8,8,skin,ink,1);path([[4,-46],[9,-43],[6,-41]],skin,ink,.8);
 // Quiet, stern faces with thick brows, separate moustaches and varied beards.
 line([[1,-47],[5,-46]],'#514235',1.7);oval(4,-44.7,.9,1,'#29342c');
 const long=elder?13:hunter?6:id==='rider'?8:11;
 path([[-5,-41],[-1,-39],[5,-41],[7,-36],[4,-36+long],[0,-33+long],[-5,-35+long],[-7,-37]],hair,ink,.8);
 line([[-4,-39],[0,-40],[5,-38]],elder?'#b4a186':'#a07852',2.2);
 line([[-3,-35],[-1,-28+long*.22]],'#b49771',.8);line([[3,-35],[2,-28+long*.22]],'#c4a17a',.8);
 if(id==='spear'||elder){
  path([[-8,-48],[-9,-53],[-6,-58],[5,-58],[9,-53],[8,-47]],elder?'#68594a':'#74614a');
  line([[-7,-48],[-4,-50],[0,-49],[4,-50],[7,-48]],'#b5a383',3);
 }else if(hunter){path([[-7,-49],[-5,-55],[4,-54],[8,-49]],'#655b3e');line([[-7,-49],[7,-49]],'#b98c4e',2)}
 else{path([[-8,-49],[-6,-54],[5,-54],[8,-49]],id==='shield'?'#6e6a57':'#834837');line([[-8,-49],[8,-49]],'#b59c73',1.5)}
}
function peasant(u,gait,attack){
 const id=u.id,mounted=id==='rider',hero=id==='bogatyr',hunter=id==='archer',shielded=id==='shield',spearman=id==='spear';
 const shirt=hero?'#a34c39':hunter?'#a16c43':shielded?'#b4b6a3':spearman?'#b5af87':'#e2d6b1';
 if(mounted){horse(gait,'r');line([[-12,-25],[7,-25],[10,-18]],'#d4b98a',1.7);c.save();c.translate(-4,-24)}else c.save();
 const stride=mounted?0:Math.sin(gait)*2.8;
 limb([[-5,-17],[-6-stride,-7],[-7-stride,0]],'#635b49',4.5);limb([[5,-17],[6+stride,-7],[7+stride,0]],'#665d47',4.5);
 for(const [x,left] of [[-7-stride,true],[7+stride,false]]){
  if(shielded||hero||mounted){path([[x-3,-8],[x+3,-8],[x+3,-2],[x+6,0],[x-4,1]],'#493b2c');line([[x-2,-7],[x+1,-2]],'#846d4c',1)}
  else{oval(x,0,5,2.7,'#bca879',ink,1);for(let j=0;j<3;j++)line([[x-3+j*2,-2],[x-1+j*2,1]],'#806740',.8);line([[x-3,-7],[x+2,-3]],'#9d8e6a',1.2)}
 }
 // Rounded work-shirt shoulders replace armour plates. All decoration is non-emissive.
 path([[-8,-38],[-12,-35],[-13,-28],[-10,-26],[-11,-14],[0,-11],[11,-14],[10,-28],[13,-30],[11,-36],[7,-38]],shirt,ink,1.2);
 path([[0,-35],[7,-36],[10,-15],[2,-13]],'#332d1f18',null);
 if(hunter||shielded||hero){path([[-8,-38],[-11,-31],[-9,-19],[-3,-20],[-3,-35],[3,-35],[4,-20],[9,-21],[10,-31],[7,-38],[3,-36],[-3,-36]],hero?'#887353':hunter?'#655c3c':'#9a8b6a',ink,.9);if(hero||shielded)line([[-8,-36],[-5,-35],[-5,-23]],'#cab88e',1.7)}
 line([[-10,-17],[10,-17]],'#9f392b',4);path([[4,-16],[5,-7],[8,-9],[7,-16]],'#b24430',ink,.5);
 // Asymmetric embroidered collar and cuffs — a kosovorotka rather than a fantasy tabard.
 stitch([[-5,-37],[-5,-28]],'#993f30',1.5);stitch([[-5,-37],[0,-35],[5,-37]],'#a74130',1.5);
 for(let i=0;i<5;i++){const x=-8+i*4;stitch([[x,-13],[x+1.5,-15],[x+3,-13]],'#ae4e36',.9)}
 line([[-2,-33],[0,-27],[3,-30]],'#786243',1);oval(0,-26,2.2,3,'#a2854d',ink,.6);sunMark(0,-26,1.4,'#e0ca92');
 peasantFace(id);
 const hx=12+attack*5,hy=-29-attack*5;
 limb([[8,-33],[12,-26],[hx,hy]],shirt,4);line([[10,-28],[14,-29]],'#b04d37',1.5);oval(hx,hy,2.5,2.7,'#d8ad86',ink,.8);
 if(spearman)fork(hx,hy,attack);
 else if(hunter){limb([[-7,-32],[3-attack*4,-29],[11-attack*6,-29]],shirt,3.6);bow(16,-29,1-attack);line([[22,-42],[25,-38],[23,-33]],'#944d32',1);line([[-9,-32],[-14,-48]],'#5c462b',5);for(let i=0;i<3;i++)line([[-14+i*2,-44],[-15+i*2,-54]],'#d2bb87',1)}
 else if(shielded){c.save();c.translate(hx,hy);c.rotate(attack);line([[0,5],[0,-28]],'#544028',5);oval(0,-26,5,9,'#776044',ink,1);line([[-2,-29],[3,-24]],'#ac9670',1.2);c.restore()}
 else farmerAxe(hx,hy,attack,hero);
 if(shielded||hero)woodShield(-12,-25,hero);
 else if(mounted)woodShield(-11,-27,false);
 else limb([[-8,-31],[-12,-23],[-9,-19]],shirt,3.7);
 c.restore();
}

function volkhv(u,gait,attack,time){
 const stride=Math.sin(gait)*2,charge=Math.max(0,(u.casting||0)/.5),sy=-charge*7;
 limb([[-5,-14],[-6-stride,0]],'#554936',4);limb([[5,-14],[7+stride,0]],'#554936',4);
 path([[-10,-43],[-16,-29],[-17,-4],[-9,-6],[-2,-3],[6,-7],[15,-4],[12,-33],[7,-45]],'#b6af91');
 path([[1,-40],[9,-34],[13,-8],[5,-10],[1,-5]],'#8a8b6d');
 line([[-12,-8],[-3,-10],[4,-8],[11,-11]],'#973f33',2);
 for(const x of [-8,-3,2,7])stitch([[x,-11],[x+2,-14],[x+4,-11]],'#b26a3c',1);
 path([[-10,-44],[-16,-38],[-12,-29],[-5,-33],[0,-30],[6,-34],[12,-30],[14,-39],[6,-45]],'#605d44');
 line([[-9,-39],[-5,-36],[1,-37],[7,-40]],'#d0c39b',2);
 line([[-6,-32],[-7,-23]],'#6f4f31',1.5);oval(-7,-21,4,5,'#83704a',ink,.8);line([[-10,-24],[-4,-24]],'#d4bd81',1);line([[8,-34],[10,-21]],'#655638',1.2);path([[8,-22],[7,-15],[13,-14],[14,-20]],'#79623d');
 for(const [x,y] of [[-12,-21],[11,-28]]){line([[x,y],[x-2,y+6]],'#80916b',1);line([[x,y+2],[x+3,y+4]],'#7e9d72',1.2)}
 path([[-7,-50],[-13,-42],[-11,-53],[-15,-52],[-10,-60],[-5,-58],[-1,-64],[3,-59],[9,-62],[12,-52],[15,-46],[7,-47]],'#d1d3bc');
 oval(1,-49,7,8,'#cba887',ink);
 line([[-5,-51],[-1,-52]],'#e8e4cb',2);line([[3,-52],[7,-51]],'#e8e4cb',2);
 line([[-3,-49],[-1,-49]],charge>.08?'#a4e4ed':'#4e5746',charge>.08?1.8:1.1);line([[4,-49],[6,-49]],charge>.08?'#a4e4ed':'#4e5746',charge>.08?1.8:1.1);
 path([[-6,-45],[-2,-44],[2,-46],[7,-44],[8,-35],[6,-25],[0,-15],[-5,-26],[-9,-37]],'#dddeca');
 line([[-5,-41],[-3,-29],[0,-20]],'#a0ab96',1);line([[4,-40],[3,-29],[0,-21]],'#f0ecd6',1.2);
 limb([[10,-36],[16,-30-charge*8],[22,-35-charge*8]],'#9c9c79',4);oval(22,-35-charge*8,3,3,'#cba887',ink);
 // An old branch with carved notches, herb bags and a small bronze sun.
 line([[23,-1+sy],[22,-36+sy],[24,-57+sy],[21,-70+sy]],ink,5);line([[22,-2+sy],[21,-36+sy],[23,-57+sy],[20,-70+sy]],'#987448',2.6);
 line([[21,-67+sy],[16,-74+sy],[18,-80+sy]],'#80623d',3);line([[23,-60+sy],[29,-70+sy],[27,-76+sy]],'#9c7b48',3);
 for(let i=0;i<4;i++)line([[21,-17-i*10+sy],[25,-19-i*10+sy]],'#c1a473',1);
 oval(22,-71+sy,6.5,7.5,'#a1803f',ink,1);sunMark(22,-71+sy,5,'#e6c979');
 line([[27,-60+sy],[31,-50+sy]],'#8f7444',1);oval(31,-48+sy,2.7,4,'#6a7950',ink,.7);
 if(charge>.08){
  oval(22,-71+sy,10,12,'#79c8d52b');line([[16,-83+sy],[20,-79+sy],[18,-73+sy],[25,-77+sy],[23,-68+sy]],'#a7e0e5',1.5);
  c.save();c.globalAlpha=Math.min(.7,charge);sunMark(22,-94+sy,7,'#9bd6df');line([[22,-99+sy],[19,-94+sy],[24,-94+sy],[21,-89+sy]],'#d4ecdf',1.5);c.restore();
 }
}
function reptile(u,gait,attack){
 const guard=u.id==='l_shield',spit=u.id==='l_spitter',col=guard?'#49776b':spit?'#89a74f':'#59956b',step=Math.sin(gait)*4;
 path([[-5,-14],[-18,-11],[-32,-17],[-22,-6],[-8,-5],[2,-12]],col);line([[-27,-14],[-15,-9],[-8,-10]],'#c1cf7a',1);
 limb([[-5,-17],[-10,-8],[-12-step,0]],col,5);limb([[5,-17],[10,-8],[9+step,0]],col,5);
 for(const x of [-12-step,9+step])for(let i=0;i<3;i++)line([[x+i*2-2,0],[x+i*2,2]],'#ddd5a6',1.5);
 oval(0,-27,guard?13:9,16,col,ink,1.5);oval(3,-24,5,11,'#b4bd7a');
 if(guard){path([[-12,-37],[-17,-32],[-16,-18],[-6,-11],[3,-17],[3,-33]],'#576253');for(let j=0;j<3;j++)path([[-13,-33+j*6],[-7,-36+j*6],[-2,-31+j*6],[-8,-27+j*6]],'#7e8970',ink,.7)}
 for(let i=0;i<4;i++)path([[-8,-28-i*5],[-14,-30-i*5],[-7,-34-i*5]],spit?'#b68c4c':'#b5ae60');
 oval(2,-43,9,9,col,ink);path([[5,-48],[20,-44],[23,-39],[14,-35],[4,-37]],col);line([[12,-38],[21,-39]],ink,1.2);oval(10,-45,3,2,gold);line([[10,-46],[10,-44]],ink,1.3);line([[3,-49],[9,-48]],'#d5df96',1.4);
 limb([[8,-30],[13,-23],[21+attack*6,-24-attack*4]],col,4);for(let i=0;i<3;i++)line([[21+attack*6,-25+i*2],[25+attack*6,-27+i*2]],'#ded6af',1.3);
 if(spit){oval(10,-34,7,5,'#d3b45f',ink);oval(21,-39,2+attack*2,2,'#d4ee8c');}
 if(guard)shield(-13,-24,'#777c4d',true);else limb([[-7,-30],[-12,-22],[-7,-20]],col,3);
 for(let j=0;j<3;j++)for(let i=0;i<2;i++)line([[i*5-4,-34+j*5],[i*5-2,-32+j*5]],'#284f4c',1);
}
function zombie(u,gait,attack){
 const runner=u.id==='z_runner',brute=u.id==='z_brute',skin=runner?'#a3b18a':'#819686',cloth=brute?'#594d5b':runner?'#745a4a':'#52666c',s=Math.sin(gait)*3;
 limb([[-5,-14],[-8,-7],[-10+s,0]],skin,4);limb([[5,-13],[9,-6],[7-s,1]],skin,4);
 path([[-9,-35],[5,-36],[11,-14],[6,-15],[4,-9],[0,-13],[-5,-10],[-6,-15],[-12,-13]],cloth);
 path([[-7,-30],[-1,-31],[2,-22],[-4,-23]],skin);line([[-6,-28],[-1,-26]],'#d4d4b0',1.2);
 limb([[-8,-32],[-16,-22],[-12-attack*4,-16]],skin,4);limb([[6,-32],[16,-29],[23+attack*5,-32]],skin,4);
 for(let i=0;i<3;i++)line([[22+attack*5,-33+i*2],[27+attack*5,-34+i*2]],'#c5c4a1',1);
 c.save();c.translate(runner?6:3,-43);c.rotate(runner?.25:-.17);oval(0,0,8,9,skin,ink);path([[-7,-3],[-7,-10],[-3,-8],[0,-12],[5,-7],[7,-3]],'#414b42');oval(-2,-1,2.5,2,'#394943');oval(5,-1,2.4,2,'#394943');oval(5,-1,1,1,'#d6d487');path([[0,1],[-2,4],[2,4]],'#4a6050',null);line([[-2,6],[5,5]],ink,1.5);for(let i=0;i<3;i++)line([[i*2,5],[i*2,7]],'#d7d4b1',1);c.restore();
 if(brute){path([[-12,-36],[-15,-31],[-9,-27],[-5,-35]],'#8b8582');line([[-13,-32],[-5,-30],[1,-25],[8,-23]],'#b0a88b',2);line([[20,-32],[26,-11]],'#6b5140',5);path([[19,-19],[31,-21],[33,-9],[23,-6]],'#7e8983')}
}
function dinosaur(u,gait,attack){
 const trike=u.id==='d_trike',rex=u.id==='d_rex',col=trike?'#aa8060':rex?'#688e75':'#6c9e8a',shade=trike?'#765b4e':'#42695d',s=Math.sin(gait)*4;
 path([[-6,-24],[-25,-20],[-40,-30],[-30,-16],[-11,-11],[3,-18]],col);
 if(trike){for(const x of [-15,11])limb([[x,-17],[x+3,-8],[x-s,0]],shade,5);oval(-2,-23,25,14,col,ink,1.6);for(const x of [-16,10]){limb([[x,-20],[x-2,-9],[x+s,1]],col,6);line([[x+s-3,2],[x+s+3,2]],'#d3c49c',2)}
 path([[10,-34],[9,-44],[17,-51],[25,-48],[31,-38],[23,-24]],'#b79871');for(let i=0;i<4;i++)path([[12+i*4,-42-i%2*3],[12+i*4,-49-i%2*3],[16+i*4,-43]],'#d3c39b');
 oval(25+attack*4,-29,13,9,col,ink);for(const [x,y] of [[20,-36],[28,-33]])path([[x,y],[x+8,y-17],[x+5,y+1]],'#e7d8af');path([[34,-29],[40,-36],[39,-26]],'#e7d8af');oval(29,-33,1.8,1.8,ink);
 }else{
 limb([[-5,-19],[-10,-9],[-11-s,0]],shade,5);oval(0,-25,rex?18:14,14,col,ink,1.5);path([[5,-22],[9,-42],[17,-47],[23,-37],[15,-18]],col);
 limb([[4,-20],[12,-12],[7+s,0]],col,6);path([[5+s,0],[17+s,0],[12+s,-3]],'#c3c69a');line([[12+s,0],[14+s,2]],ink,1);
 const hx=rex?20:23,hy=rex?-47:-41;c.save();c.translate(hx+attack*4,hy);c.rotate(attack*.16);path([[-9,-8],[9,-8],[17,-3],[16,6],[-2,8],[-9,2]],col);path([[-1,3],[17,1],[15,8],[0,10]],'#c9bf89');line([[0,3],[16,2]],ink,1.5);for(let i=0;i<4;i++)path([[2+i*3,3],[3+i*3,6],[4+i*3,3]],'#f0e6c8',null);oval(0,-3,2.7,2,gold);oval(1,-3,1,1,ink);line([[-3,-7],[3,-6]],shade,2);c.restore();
 limb([[9,-31],[17,-25],[20,-28]],col,rex?2.5:3);if(!rex)line([[19,-28],[24+attack*3,-29]],'#d4d3ae',1.7);
 }
 for(let i=0;i<4;i++){line([[-16+i*6,-30],[-15+i*6,-23]],shade,2);oval(-14+i*6,-32,1.3,1,'#d3cd9b')}
}
function bear(u,gait,attack){
 const step=Math.sin(gait)*4;
 for(const x of [-14,13])limb([[x,-17],[x+2-step,-7],[x-step,0]],'#3c3227',6);
 oval(-3,-21,23,15,'#70553b',ink,1.5);oval(-12,-28,12,10,'#84674a');
 for(const x of [-14,13]){limb([[x,-18],[x-2+step,-8],[x+step,1]],'#76583c',6);line([[x+step-3,2],[x+step+4,2]],'#c9b98d',2)}
 oval(17+attack*4,-30,13,12,'#8e7050',ink,1.5);oval(9,-41,4,4,'#71583c',ink);oval(24,-40,4,4,'#71583c',ink);oval(24+attack*4,-26,10,6,'#b19a72',ink);oval(30+attack*4,-28,4,2.5,'#292d27');oval(19,-34,1.6,1.5,'#e4c87e');line([[26,-22],[32,-24]],ink,1.5);
 line([[-12,-32],[-5,-27],[3,-32]],gold,2);rune(-5,-24,.65,'#a4cc9b');
}
const sizes={bogatyr:1.25,z_brute:1.45,d_rex:1.35,d_trike:1.13};
window.RUS_ART={
 rune(ctx,x,y,size,col){c=ctx;rune(x,y,size,col)},
 height(u){if(u.id==='volkhv')return 94;if(u.id==='bear')return 62;return (['rider','p_horse','c_horsebow','c_lancer'].includes(u.id)?93:76)*(sizes[u.id]||1)*(u.bossScale||1)},
 draw(ctx,u,time=0){
 c=ctx;c.save();c.lineJoin='round';c.lineCap='round';const size=(sizes[u.id]||1)*(u.bossScale||1),dead=u.hpNow<=0;
 const age=dead?Math.max(0,time-(u.deadVisualAt??u.deadAt??time)):0;
 const facing=u.facing??(u.team==='enemy'?-1:1),moving=!dead&&(u.motion||0)>0;
 const gait=dead?0:(u.walk||0)*10,attack=dead?0:Math.sin(Math.min(1,(u.flash||0)/.23)*Math.PI);
 // Three translucent ellipses make a soft contact shadow without canvas shadowBlur.
 c.globalAlpha=dead?.65:1;
 const mount=['rider','p_horse','c_horsebow','c_lancer'].includes(u.id),wide=mount||u.id.startsWith('d_');
 oval(0,2,(wide?27:15)*size,6*size,'#142b2518');oval(0,2,(wide?22:12)*size,4*size,'#142b2528');oval(0,2,(wide?17:8)*size,2.5*size,'#142b252c');
 if(mount&&moving&&!dead){for(let i=0;i<2;i++)oval(-facing*(18+i*7),3+i,4+i*2,2,'#dbc18b35')}
 c.scale(facing*size,size);
 if(dead){const fall=Math.min(1,age/.35);c.globalAlpha=.88;c.rotate(-fall*1.5);c.scale(1,1-fall*.18)}
 const idle=dead?0:Math.sin(time*2.7+(u.idNum||u.x*3||0))*.55;
 c.translate(!dead&&(u.hurt||0)>0?-2:0,-(u.team==='rus'&&u.id!=='bear'?0:moving?Math.abs(Math.sin(gait))*(u.big?.7:1.2):idle));
 const lean=u.id==='z_runner'?.2:u.id==='z_shambler'?-.08:attack*.045;c.transform(1,0,-lean,1,0,0);
 if(u.id==='bear')bear(u,gait,attack);else if(u.id==='volkhv')volkhv(u,gait,attack,time);else if(u.team==='rus'&&peasantIds.has(u.id))peasant(u,gait,attack);else if(u.id.startsWith('l_'))reptile(u,gait,attack);else if(u.id.startsWith('z_'))zombie(u,gait,attack);else if(u.id.startsWith('d_'))dinosaur(u,gait,attack);else human(u,gait,attack);
 if(u.bossKey&&!dead){const y=mount?-87:-66;path([[-11,y+5],[-13,y-5],[-5,y],[0,y-9],[5,y],[13,y-5],[11,y+5]],gold,ink,1);line([[-10,y+5],[10,y+5]],'#fff0b3',1.5);if(u.abilityFlash>0){c.globalAlpha=Math.min(.7,u.abilityFlash);oval(0,-22,24,30,'#dcba5d24',gold,1.2);c.globalAlpha=1}}
 if((u.electric||0)>0&&!dead){line([[-12,-35],[-6,-31],[-9,-24],[-2,-20]],'#99dce0',1.8);line([[8,-40],[13,-34],[9,-28]],'#99dce0',1.5)}
 if((u.hurt||0)>0&&!dead){c.globalAlpha=Math.min(.8,u.hurt*4);line([[-13,-38],[-18,-45]],'#fff4c9',2);line([[14,-31],[20,-34]],'#fff4c9',2)}
 c.restore();
 }
};
})();

