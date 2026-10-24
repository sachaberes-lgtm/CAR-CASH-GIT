/* ================= LA PLAQUE D'IMMATRICULATION (2026-10-17, Sacha : « rajoute une plaque d'immatriculation personnalisable au début du
   jeu, fais plusieurs templates, le joueur peut écrire ce qu'il veut sur la plaque, puis elle doit être intégrée à toutes les voitures ») ======
   · LES MODÈLES (`PLQ_MOD`) : neuf plaques peintes à la main dans une toile 512 × 128 (`plqPeint`) — FRANCE, RETRO (la noire d'avant 93),
     U.K. (la jaune), USA, COURSE (damier), BILLET (le vert des billets), LINGOT (or sur laque), NEON (le rose et le cyan de la nuit), ARCADE
     (la plaque des menus du jeu). La MÊME fonction peint la texture 3D et les aperçus de l'écran : ce qu'on choisit est ce qui roule.
   · LE TEXTE (`plqNet`) : 9 signes au plus, en capitales sans accent (la police pixel n'en a pas) : A-Z, 0-9, espace, - . ! ? $.
     Le corps se règle sur la longueur (multiple de 8 : la police reste nette), une plaque de 2 lettres a de grosses lettres.
   · LA SAUVEGARDE : `SAVE.d.plq` = {m: modèle, x: texte, ok: 1 quand le joueur l'a validée}. `ok` à 0 = l'atelier de la plaque se pose au
     prochain accueil (`plqGuette`, avant la question de bienvenue) — une fois : tout le monde, même une vieille sauvegarde, choisit sa plaque.
   · SUR LA CAISSE (`plqPose`, appelée par buildCar juste avant que les pièces rejoignent la carrosserie) : une plaque À L'ARRIÈRE de TOUTES
     les caisses (plus à l'avant depuis le 17/10 au soir : Sacha), sans une ligne par gabarit. Des rayons tirés depuis l'arrière à dix hauteurs trouvent la
     tôle la plus reculée, hors verre, hors feux et hors néons ; on garde la hauteur la plus proche de celle d'une vraie plaque (40 % de la
     caisse derrière, 30 % devant), où la surface fait face et où deux rayons de côté retrouvent la tôle (la plaque ne pend pas dans le vide).
     Elle s'y colle, penchée comme la tôle (`plqCherche`). Le résultat se garde par caisse (`PLQ.pos`) : la rafale de photos du garage ne
     relance pas les rayons. Un gabarit peut trancher : `plq:0` dans sa fiche d'ancrages (pas de plaque).
   · UNE toile, UNE texture, DEUX matières partagées par toutes les caisses (la face peinte, le cadre) : changer la plaque repeint la toile
     (`needsUpdate`) ; aucune matière ne naît, aucun programme ne se compile en course. buildCar ne les libère jamais (`userData.plq`).
   · LE PROFIL (`profOuvre`, le petit TROPHÉE du garage) : la plaque en grand, CHANGER MA PLAQUE, et les chiffres du compte (temps de jeu,
     joueur depuis, parties, figures, plus longue partie, records). Deux compteurs neufs dans `SAVE.d.prof` : `ne` (le jour où le compte est
     né — pour une sauvegarde d'avant, le jour de cette version), `tA` (les secondes passées dans le jeu, écran visible ; une vieille sauvegarde
     part de son temps de course déjà compté, `ex.temps`), `dMax` (la plus longue partie, `RUNX.t`, versée par commitExploits).
   Crochets : `dbgPlaque()` (l'état) · `dbgPlaque('ouvre')` (l'atelier) · `dbgPlaque('fr','AB-123-CD')` (pose sans écran) · `dbgPlaque('raz')`
   (la plaque redevient « à choisir ») · `dbgPlaque('pos')` (où elle s'est posée sur la caisse) · `dbgProfil()` (ouvre le profil). */
var PLQ={cv:null,ctx:null,tex:null,matF:null,matC:null,pos:{},ray:null,on:false,mode:'',m:'fr',x:'',iv:0,t0:0,fait:false,prof:false};
const PLQ_MOD=[{id:'fr',n:'FRANCE'},{id:'retro',n:'RETRO'},{id:'uk',n:'U.K.'},{id:'us',n:'USA'},{id:'course',n:'COURSE'},
  {id:'billet',n:'BILLET'},{id:'lingot',n:'LINGOT'},{id:'neon',n:'NEON'},{id:'arcade',n:'ARCADE'}];
/* ---- LES PLAQUES DU MONDE (2026-10-21, Léo : « cherche la plaque de son pays, ajoute les plaques de pays, tous ceux qui sont différents ») ----
   Une table : id = code ISO en minuscules (le Royaume-Uni garde `uk`). Chaque fiche : n (nom, traduit par I18N) · bg (fond) · bd (filet noir du bord) ·
   tx (couleur des signes) · g / d (bande à GAUCHE / à DROITE : [couleur ou rayures, code, couleur du code, étoiles 0/1, 'croix' = croix suisse]) ·
   h (bandeau du HAUT : [texte, fond, couleur]) · fil (liseré intérieur). Peinte par `plqPays` : même toile que les autres modèles. */
const PLQ_UE=['#1d3fae'];
const PLQ_PAYS={
  de:{n:'ALLEMAGNE',g:['#1d3fae','D','#fff',1]},es:{n:'ESPAGNE',g:['#1d3fae','E','#fff',1]},
  it:{n:'ITALIE',g:['#1d3fae','I','#fff',1],d:['#1d3fae','','#fff',0]},pt:{n:'PORTUGAL',g:['#1d3fae','P','#fff',1]},
  nl:{n:'PAYS-BAS',bg:'#f7c600',g:['#1d3fae','NL','#fff',1]},be:{n:'BELGIQUE',tx:'#c8102e',g:['#1d3fae','B','#fff',1]},
  lu:{n:'LUXEMBOURG',g:['#1d3fae','L','#fff',1]},at:{n:'AUTRICHE',g:['#1d3fae','A','#fff',1],fil:'#d52b1e'},
  pl:{n:'POLOGNE',g:['#1d3fae','PL','#fff',1]},cz:{n:'TCHEQUIE',g:['#1d3fae','CZ','#fff',1]},
  sk:{n:'SLOVAQUIE',g:['#1d3fae','SK','#fff',1]},hu:{n:'HONGRIE',g:['#1d3fae','H','#fff',1]},
  ro:{n:'ROUMANIE',g:['#1d3fae','RO','#fff',1]},bg:{n:'BULGARIE',g:['#1d3fae','BG','#fff',1]},
  gr:{n:'GRECE',g:['#1d3fae','GR','#fff',1]},hr:{n:'CROATIE',g:['#1d3fae','HR','#fff',1]},
  si:{n:'SLOVENIE',g:['#1d3fae','SLO','#fff',1]},se:{n:'SUEDE',g:['#1d3fae','S','#fff',1]},
  dk:{n:'DANEMARK',g:['#1d3fae','DK','#fff',1]},fi:{n:'FINLANDE',g:['#1d3fae','FIN','#fff',1]},
  ie:{n:'IRLANDE',g:['#1d3fae','IRL','#fff',1]},lt:{n:'LITUANIE',g:['#1d3fae','LT','#fff',1]},
  lv:{n:'LETTONIE',g:['#1d3fae','LV','#fff',1]},ee:{n:'ESTONIE',g:['#1d3fae','EST','#fff',1]},
  ch:{n:'SUISSE',g:['#d52b1e','','#fff',0,'croix'],d:['#d52b1e','','#fff',0,'croix']},
  no:{n:'NORVEGE',g:['#1d3fae','N','#fff',0]},is:{n:'ISLANDE',g:['#1d3fae','IS','#fff',0]},
  tr:{n:'TURQUIE',g:['#1d3fae','TR','#fff',0]},ua:{n:'UKRAINE',g:[['#1d3fae','#ffd400'],'UA','#fff',0]},
  ru:{n:'RUSSIE',d:[['#f4f5f8','#0039a6','#d52b1e'],'RUS','#121418',0]},
  ps:{n:'PALESTINE',g:[['#111','#f4f5f8','#0a7a35'],'PS','#d3202e',0]},
  jp:{n:'JAPON',bd:'#0b6b3a',tx:'#0b6b3a',fil:'#0b6b3a'},kr:{n:'COREE',bg:'#1f7a4a',bd:'#e8eee9',tx:'#fff'},
  cn:{n:'CHINE',bg:'#0a3d9c',bd:'#e9eef7',tx:'#fff',fil:'#e9eef7'},vn:{n:'VIETNAM',bg:'#1544a8',tx:'#fff'},
  id:{n:'INDONESIE',bg:'#0e0e10',bd:'#d9d9d9',tx:'#f5f5f5'},sg:{n:'SINGAPOUR',bg:'#0e0e10',bd:'#d9d9d9',tx:'#ffe14a',h:['SINGAPORE','#0e0e10','#ffe14a']},
  in:{n:'INDE',g:['#0a3d9c','IND','#fff',0]},th:{n:'THAILANDE',h:['THAILAND','#f4f5f8','#555']},
  au:{n:'AUSTRALIE',tx:'#0a3d9c',h:['AUSTRALIA','#ffc72a','#0a3d9c']},ca:{n:'CANADA',tx:'#0a3d9c',h:['CANADA','#d52b1e','#fff']},
  mx:{n:'MEXIQUE',h:['MEXICO','#0b7a3b','#fff']},br:{n:'BRESIL',h:['BRASIL','#0a3d9c','#fff']},
  ar:{n:'ARGENTINE',h:['ARGENTINA','#3a8fd8','#fff']},cl:{n:'CHILI',tx:'#0a3d9c',fil:'#d52b1e',h:['CHILE','#f4f5f8','#d52b1e']},
  co:{n:'COLOMBIE',bg:'#f7c600',h:['COLOMBIA','#f7c600','#1d3fae']},za:{n:'AFRIQUE DU SUD',bg:'#f7c600',d:['#1d3fae','ZA','#fff',0]},
  eg:{n:'EGYPTE',h:['EGYPT','#d52b1e','#fff']},ma:{n:'MAROC',g:['#d52b1e','MA','#fff',0]},
  sa:{n:'ARABIE SAOUDITE',d:['#0b7a3b','KSA','#fff',0]},ae:{n:'EMIRATS',h:['UAE','#d52b1e','#fff']},
  ng:{n:'NIGERIA',h:['NIGERIA','#0b7a3b','#fff']}
};
for(const k in PLQ_PAYS)PLQ_MOD.push({id:k,n:PLQ_PAYS[k].n,pays:1});
Object.assign(I18N,{'ALLEMAGNE':'GERMANY','ESPAGNE':'SPAIN','ITALIE':'ITALY','PAYS-BAS':'NETHERLANDS','BELGIQUE':'BELGIUM','AUTRICHE':'AUSTRIA','POLOGNE':'POLAND','TCHEQUIE':'CZECHIA','SLOVAQUIE':'SLOVAKIA','HONGRIE':'HUNGARY','ROUMANIE':'ROMANIA','BULGARIE':'BULGARIA','GRECE':'GREECE','CROATIE':'CROATIA','SLOVENIE':'SLOVENIA','SUEDE':'SWEDEN','DANEMARK':'DENMARK','FINLANDE':'FINLAND','IRLANDE':'IRELAND','LITUANIE':'LITHUANIA','LETTONIE':'LATVIA','ESTONIE':'ESTONIA','SUISSE':'SWITZERLAND','NORVEGE':'NORWAY','ISLANDE':'ICELAND','TURQUIE':'TURKEY','UKRAINE':'UKRAINE','RUSSIE':'RUSSIA','ISRAEL':'ISRAEL','JAPON':'JAPAN','COREE':'KOREA','CHINE':'CHINA','INDONESIE':'INDONESIA','SINGAPOUR':'SINGAPORE','INDE':'INDIA','THAILANDE':'THAILAND','AUSTRALIE':'AUSTRALIA','MEXIQUE':'MEXICO','BRESIL':'BRAZIL','ARGENTINE':'ARGENTINA','CHILI':'CHILE','COLOMBIE':'COLOMBIA','AFRIQUE DU SUD':'SOUTH AFRICA','EGYPTE':'EGYPT','MAROC':'MOROCCO','ARABIE SAOUDITE':'SAUDI ARABIA','EMIRATS':'EMIRATES','PORTUGAL':'PORTUGAL','LUXEMBOURG':'LUXEMBOURG','VIETNAM':'VIETNAM','NIGERIA':'NIGERIA','CANADA':'CANADA'});
function plqPaysLocal(){ /* la plaque du pays de l'appareil (langue du navigateur : « fr-CA » → CA), sinon la française */
  try{const L=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']);
    for(const l of L){const r=String(l).split(/[-_]/)[1];if(!r)continue;const c=r.toLowerCase(),id=c==='gb'?'uk':c;if(plqModOk(id)===id)return id;}}catch(e){}
  return 'fr';}
const PLQ_MAX=9;
function plqModOk(m){for(const o of PLQ_MOD)if(o.id===m)return m;return 'fr';}
function plqNet(s){ // le texte tel qu'il peut se peindre : capitales, sans accent, 9 signes, rien que la police sache dessiner
  s=String(s==null?'':s).toUpperCase();
  try{s=s.normalize('NFD').replace(/[̀-ͯ]/g,'');}catch(e){}
  return s.replace(/[^A-Z0-9 \-.!?$]/g,'').replace(/\s+/g,' ').replace(/^ /,'').slice(0,PLQ_MAX);}
function plqHasard(){const L='ABCDEFGHJKLMNPQRSTVWXYZ',c=function(){return L[Math.random()*L.length|0];},n=function(){return String(Math.random()*10|0);};
  return c()+c()+'-'+n()+n()+n()+'-'+c()+c();} // le format d'une vraie plaque française (sans I, O ni U, comme la vraie)
function plqEtat(){try{const p=SAVE.d&&SAVE.d.plq;if(p&&typeof p==='object')return p;}catch(e){} // (1er buildCar : SAVE n'existe pas encore)
  return PLQ.def||(PLQ.def={m:plqPaysLocal(),x:plqHasard(),ok:0});}
/* ---- LE PEINTRE : une plaque dans un contexte 2D de W × H (rapport 4:1). `fond` : la couleur des coins coupés (la texture 3D les
   remplit de la couleur du cadre ; les aperçus de l'écran les laissent transparents). */
function plqPays(x,P){ /* une plaque du monde (voir PLQ_PAYS) : renvoie la zone du texte */
  const oct=function(i,c){const a=Math.max(2,10-i*.5);x.beginPath();x.moveTo(i+a,i);x.lineTo(512-i-a,i);x.lineTo(512-i,i+a);x.lineTo(512-i,128-i-a);
    x.lineTo(512-i-a,128-i);x.lineTo(i+a,128-i);x.lineTo(i,128-i-a);x.lineTo(i,i+a);x.closePath();if(c){x.fillStyle=c;x.fill();}};
  const mot=function(s,px,cx,cy,c){x.font=px+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillStyle=c;x.fillText(s,cx,cy+px*.06);};
  const bg=P.bg||'#f4f5f8';oct(0,P.bd||'#16181d');oct(4,bg);
  x.save();oct(4);x.clip();
  const bande=function(b,x0){const c=b[0],lw=62;
    if(Array.isArray(c)){if(c.length>2){for(let i=0;i<3;i++){x.fillStyle=c[i];x.fillRect(x0,72+i*16,lw,16);}}
      else{x.fillStyle=c[0];x.fillRect(x0,0,lw,64);x.fillStyle=c[1];x.fillRect(x0,64,lw,64);}
      if(b[1])mot(b[1],16,x0+lw/2,c.length>2?44:64,b[2]);return;}
    x.fillStyle=c;x.fillRect(x0,0,lw,128);
    if(b[4]==='croix'){const cx=x0+lw/2;x.fillStyle='#fff';x.fillRect(cx-5,34,10,60);x.fillRect(cx-20,59,40,10);return;}
    if(b[3]){x.fillStyle='#ffd400';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.fillRect(Math.round(x0+lw/2+Math.cos(a)*17)-2,Math.round(42+Math.sin(a)*17)-2,4,4);}}
    if(b[1])mot(b[1],16,x0+lw/2,b[3]?94:64,b[2]);};
  if(P.g)bande(P.g,0);if(P.d)bande(P.d,450);
  let zy=64,cap=56;
  if(P.h){x.fillStyle=P.h[1];x.fillRect(0,0,512,30);mot(P.h[0],12,256,17,P.h[2]);zy=80;cap=48;}
  x.restore();
  if(P.fil){if(!P.h){x.strokeStyle=P.fil;x.lineWidth=3;oct(10);x.stroke();}}
  const gl=P.g?66:20,dr=P.d?66:20;
  return {zx:gl+(P.g?4:8),zw:512-gl-dr-(P.g?4:8)-(P.d?0:8),zy:zy,col:P.tx||'#121418',cap:cap};}
function plqPeint(x,W,H,m,t,fond){
  const k=W/512;x.save();x.setTransform(k,0,0,H/128,0,0);x.clearRect(0,0,512,128);
  if(fond){x.fillStyle=fond;x.fillRect(0,0,512,128);}
  const oct=function(i,c){const a=Math.max(2,10-i*.5);x.beginPath();x.moveTo(i+a,i);x.lineTo(512-i-a,i);x.lineTo(512-i,i+a);x.lineTo(512-i,128-i-a);
    x.lineTo(512-i-a,128-i);x.lineTo(i+a,128-i);x.lineTo(i,128-i-a);x.lineTo(i,i+a);x.closePath();if(c){x.fillStyle=c;x.fill();}};
  const deg=function(y0,y1,a,b){const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
  const mot=function(s,px,cx,cy,c){x.font=px+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillStyle=c;x.fillText(s,cx,cy+px*.06);};
  let zx=28,zw=456,zy=64,col='#111',omb=null,ombY=0,lue=null,cap=56;
  x.save();
  switch(m){
    case 'retro':
      oct(0,'#c3c8cf');oct(5,'#141416');x.strokeStyle='rgba(205,210,218,.45)';x.lineWidth=2;oct(11);x.stroke();
      for(const p of [[24,24],[488,24],[24,104],[488,104]]){x.fillStyle='#7d838b';x.beginPath();x.arc(p[0],p[1],6,0,7);x.fill();x.fillStyle='#d9dde2';x.fillRect(p[0]-3,p[1]-3,3,3);}
      col='#e9ebef';omb='#000';ombY=4;zx=40;zw=432;break;
    case 'uk':
      oct(0,'#111');oct(4,'#f7c600');mot('CASH CAR',8,256,116,'#5a4700');col='#121212';zy=60;break;
    case 'us':
      oct(0,'#14285e');oct(4,deg(4,124,'#ffffff','#d6e4ff'));
      x.fillStyle='rgba(20,40,94,.28)';for(const bx of [150,362]){x.beginPath();x.ellipse(bx,16,9,5,0,0,7);x.fill();}
      mot('CASH CITY',16,256,26,'#c8102e');mot('SPEED STATE',8,256,114,'#14285e');col='#14285e';zy=70;cap=48;break;
    case 'course':
      oct(0,'#111');oct(4,'#fafafa');x.save();oct(4);x.clip();
      for(let r=0;r<10;r++)for(let c=0;c<4;c++){x.fillStyle=(r+c)%2?'#fafafa':'#111';x.fillRect(4+c*12,4+r*12,12,12);x.fillRect(460+c*12,4+r*12,12,12);}
      x.restore();x.fillStyle='#e0101e';x.fillRect(52,4,4,120);x.fillRect(456,4,4,120);col='#111';zx=60;zw=392;break;
    case 'billet':
      oct(0,'#0d4d2a');oct(4,deg(4,124,'#dff3d6','#b8deb0'));
      x.save();oct(4);x.clip();x.strokeStyle='rgba(13,77,42,.16)';x.lineWidth=2;
      for(let j=0;j<7;j++){x.beginPath();for(let i=0;i<=64;i++){const px=i*8,py=14+j*17+Math.sin(i*.45+j)*6;if(i)x.lineTo(px,py);else x.moveTo(px,py);}x.stroke();}
      x.restore();x.strokeStyle='#2f7d4c';x.lineWidth=2;x.strokeRect(13,13,486,102);
      for(const p of [[30,32],[482,32],[30,98],[482,98]])mot('$',16,p[0],p[1],'#0d4d2a');
      col='#0b3a20';zx=52;zw=408;break;
    case 'lingot':
      oct(0,'#5a3000');oct(3,deg(3,125,'#fff2b8','#e89a12'));oct(8,deg(8,120,'#22180a','#0d0904'));
      for(const p of [[20,20],[492,20],[20,108],[492,108]]){x.fillStyle='#ffd75e';x.fillRect(p[0]-3,p[1]-3,6,6);}
      col='#ffd75e';omb='#8a4d00';ombY=4;zx=36;zw=440;break;
    case 'neon':
      oct(0,'#05030c');x.save();oct(0);x.clip();x.strokeStyle='rgba(0,234,255,.10)';x.lineWidth=1;
      for(let i=16;i<512;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();}for(let j=16;j<128;j+=16){x.beginPath();x.moveTo(0,j);x.lineTo(512,j);x.stroke();}
      x.restore();x.shadowColor='#ff3ec8';x.shadowBlur=14;x.strokeStyle='#ff5ad2';x.lineWidth=4;oct(10);x.stroke();x.shadowBlur=0;
      col='#c8fbff';lue='#00eaff';zx=36;zw=440;break;
    case 'arcade':
      oct(0,'#06122e');oct(3,deg(3,125,'#22305c','#141d3a'));
      x.fillStyle='rgba(255,255,255,.12)';x.fillRect(12,8,488,3);x.fillStyle='rgba(0,0,0,.4)';x.fillRect(12,117,488,3);
      x.fillStyle='#ff3ec8';x.fillRect(24,106,190,6);x.fillStyle='#00eaff';x.fillRect(236,106,96,6);x.fillStyle='#ffc72a';x.fillRect(354,106,134,6);
      col='#ffd75e';omb='#7a4400';ombY=4;zx=36;zw=440;zy=58;cap=48;break;
    default:
      if(PLQ_PAYS[m]){const r=plqPays(x,PLQ_PAYS[m]);zx=r.zx;zw=r.zw;zy=r.zy;col=r.col;cap=r.cap;break;}
      /* 'fr' */
      oct(0,'#16181d');oct(4,'#f4f5f8');
      x.save();oct(4);x.clip();x.fillStyle='#1d3fae';x.fillRect(0,0,62,128);x.fillRect(450,0,62,128);x.restore();
      x.fillStyle='#ffd400';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.fillRect(Math.round(33+Math.cos(a)*17)-2,Math.round(42+Math.sin(a)*17)-2,4,4);}
      mot('F',24,33,94,'#fff');
      x.fillStyle='#ffd400';x.beginPath();x.arc(481,44,15,0,7);x.fill();mot('$',16,481,45,'#1d3fae');mot('CC',16,481,94,'#fff');
      col='#121418';zx=66;zw=380;
  }
  x.restore();
  t=String(t||'');const n=Math.max(1,t.length);let s=Math.min(cap,Math.floor(zw/n/8)*8);if(s<16)s=16;
  x.font=s+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';
  const cx=zx+zw/2,cy=zy+s*.06;
  if(omb){x.fillStyle=omb;x.fillText(t,cx,cy+ombY);}
  if(lue){x.shadowColor=lue;x.shadowBlur=16;}
  x.fillStyle=col;x.fillText(t,cx,cy);x.shadowBlur=0;
  x.restore();
}
function plqTex(){if(PLQ.tex)return PLQ.tex;
  const cv=document.createElement('canvas');cv.width=512;cv.height=128;PLQ.cv=cv;PLQ.ctx=cv.getContext('2d');
  const t=new THREE.CanvasTexture(cv);try{t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}catch(e){t.anisotropy=4;}PLQ.tex=t;
  plqRepeint();try{apresPolice(plqRepeint);}catch(e){}return t;}
function plqRepeint(){if(!PLQ.ctx)return;const e=plqEtat();plqPeint(PLQ.ctx,512,128,plqModOk(e.m),String(e.x||'').trim(),'#101014');if(PLQ.tex)PLQ.tex.needsUpdate=true;}
function plqMats(){if(PLQ.matF)return;plqTex();
  PLQ.matF=new THREE.MeshBasicMaterial({map:PLQ.tex,color:0xd9d9d9});PLQ.matF.userData.plq=1; // la face : elle ne prend pas la lumière, comme une plaque éclairée par sa lampe (lisible de nuit)
  PLQ.matC=new THREE.MeshPhongMaterial({color:0x101014,shininess:70,specular:0x4a4a4a});PLQ.matC.userData.plq=1;} // le cadre (le programme des plastiques noirs : rien de neuf à compiler)
/* ---- OÙ POSER LA PLAQUE : des rayons tirés vers la caisse, dans son repère (sd −1 = l'arrière, +1 = l'avant) ---- */
function plqCherche(sd,W9,H9,L9,y0,pw,exclus,verre){
  const R=PLQ.ray||(PLQ.ray=new THREE.Raycaster()),o=new THREE.Vector3(),d=new THREE.Vector3(),n=new THREE.Vector3(),
    M=carGroup.matrixWorld,Mi=new THREE.Matrix4().copy(M).invert(),cib=[];
  carGroup.traverse(function(m){if(!m.isMesh||m.isSprite||m.isInstancedMesh||!m.geometry||!m.visible)return; /* (les effets instanciés : flammes, écume, gouttes — pas de la tôle, et chers à viser) */const u=m.userData||{};if(u.sol||u.fx||u.noShadow||u.plqNon)return; /* (19/10, RONDES) plqNon : une pièce qui n'est pas la poupe (la queue du chat) */
    let p=m;while(p&&p!==carGroup){if(exclus.indexOf(p)>=0||!p.visible)return;p=p.parent;}cib.push(m);});
  const verreOu=function(mt){return !mt||mt===verre||mt.transparent||(mt.userData&&mt.userData.g==='g');}; // ni verre (le kit : g · hors kit : la vitre), ni ce qui se voit à travers
  const tir=function(px,py){o.set(px,py,sd<0?-L9-3:L9+3).applyMatrix4(M);d.set(0,0,-sd).transformDirection(M);R.set(o,d);R.far=L9*2+6;
    const h=R.intersectObjects(cib,false)[0];if(!h)return null;
    const q=h.point.clone().applyMatrix4(Mi),mt=Array.isArray(h.object.material)?h.object.material[0]:h.object.material;
    n.copy(h.face?h.face.normal:d).transformDirection(h.object.matrixWorld).transformDirection(Mi);
    if(n.z*-sd>0)n.multiplyScalar(-1); // une face vue de dos (le kit est en double face) : la normale regarde dehors
    return {q:q,ny:n.y,nz:n.z,verre:verreOu(mt),nu:!!(mt&&mt.isMeshBasicMaterial)};}; // `nu` : une matière sans lumière (feux, néons… ou la peau du chat en pixels, du doge)
  /* UN SEUL balayage de dix rayons au centre : la tôle d'abord (la hauteur d'une vraie plaque : 40 % derrière, 30 % devant) ; une caisse toute
     en matière sans lumière (le chat, le doge) n'a que de la peau « nue » : on la prend alors, plaque EN BAS (16 % : sous le museau, pas sur
     le visage). Puis deux rayons de côté, sur les TROIS meilleures hauteurs au plus (le doge, 47 000 triangles, coûtait 146 ms en deux passages). */
  const f0=sd<0?.40:.30,C0=[],Cn=[];
  for(const f of [.14,.20,.26,.32,.38,.44,.50,.56,.62,.70]){const y=y0+H9*f,h=tir(0,y);if(!h||h.verre)continue;
    if(h.nz*sd<.45||Math.abs(h.ny)>.8)continue; // la tôle doit FAIRE FACE (un toit, un dessous : non)
    if(h.nu)Cn.push({f:f,y:y,h:h,sc:Math.abs(f-.16)+Math.abs(h.ny)*.35});else C0.push({f:f,y:y,h:h,sc:Math.abs(f-f0)+Math.abs(h.ny)*.35});}
  const souple=!C0.length,C=souple?Cn:C0;
  C.sort(function(a,b){return a.sc-b.sc;});
  for(const c of C.slice(0,3)){const g=tir(-pw*.42,c.y),dr=tir(pw*.42,c.y),ok=function(x){return x&&!x.verre&&(souple||!x.nu)&&Math.abs(x.q.z-c.h.q.z)<=.3;};
    if(!ok(g)||!ok(dr))continue; // la plaque tient sur la tôle de bout en bout
    const z=sd<0?Math.min(c.h.q.z,g.q.z,dr.q.z):Math.max(c.h.q.z,g.q.z,dr.q.z);
    return {y:c.y,z:z,ny:c.h.ny,nz:c.h.nz,src:souple?'souple':'rayons'};}
  if(C.length)return {y:C[0].y,z:C[0].h.q.z,ny:C[0].h.ny,nz:C[0].h.nz,src:'centre'}; // aucune hauteur assez large : la meilleure au centre
  const b=new THREE.Box3();for(const m of cib)b.expandByObject(m);if(!b.isEmpty())b.applyMatrix4(Mi); // rien de franc : au ras de la boîte de la caisse
  return {y:y0+H9*f0,z:b.isEmpty()?sd*L9/2:(sd<0?b.min.z:b.max.z),ny:0,nz:sd,src:'boite'};}
/* LA PLAQUE DÉJÀ DESSINÉE (17/10, LES POUPES REFAITES) : des gabarits refaits posent une plaque blanche éclairée dans leur pare-chocs
   (une boîte du kit en famille `l`, presque blanche, quatre fois plus large que haute, au milieu). La nôtre se pose PILE dessus, un peu
   devant et plus grande : elle la couvre — jamais deux plaques. `prims` : les pièces simples du kit relevées par buildCar (lpPrims). */
function plqDessinee(sd,prims){let b=null;
  for(const p of prims||[]){if(p.t!=='box'||p.rot||p.g!=='l'||p.c==null||!(p.h>.04))continue;
    const r9=p.c>>16&255,g9=p.c>>8&255,b9=p.c&255,k=p.w/p.h;if(r9<185||g9<185||b9<185||k<2.6||k>6.5||Math.abs(p.x)>.06||p.z*sd<=0)continue;
    const zf=p.z+sd*p.d/2;if(!b||zf*sd>b.z*sd)b={y:p.y,z:zf,ny:0,nz:sd,src:'dessinee'};}
  return b;}
function plqPose(lvl,A,W9,H9,L9,y0,exclus,verre,prims){ // appelée par buildCar : les deux plaques de la caisse qui se construit (repère caisse)
  if(A&&A.plq===0)return;plqMats();
  const pw=Math.max(.5,Math.min(.64,W9*.32)),ph=pw*.25;
  carGroup.updateMatrixWorld(true);
  let P=PLQ.pos[lvl];
  if(!P||P.L!==L9||P.W!==W9){const t9=performance.now();P=PLQ.pos[lvl]={L:L9,W:W9,ar:plqDessinee(-1,prims)||plqCherche(-1,W9,H9,L9,y0,pw,exclus,verre)};P.ms=Math.round((performance.now()-t9)*10)/10;} // `ms` : le prix des rayons (dbgPlaque('pos'))
  for(const sd of [-1]){const q=P.ar;if(!q)continue; // (2026-10-17, Sacha : « pas de plaque d'immatriculation à l'avant ») : l'arrière seul — plus de rayons tirés vers le nez
    const a=Math.max(-.3,Math.min(.7,Math.atan2(q.ny,Math.abs(q.nz)||1e-3))); // la pente de la tôle (vers le haut = la plaque regarde un peu le ciel)
    const nx9=0,ny9=Math.sin(a),nz9=sd*Math.cos(a);
    for(const k of [0,1]){const m=new THREE.Mesh(k?new THREE.PlaneGeometry(pw,ph):new THREE.BoxGeometry(pw+.035,ph+.035,.02),k?PLQ.matF:PLQ.matC);
      const e=k?.024:.011;m.position.set(nx9*e,q.y+ny9*e,q.z+nz9*e);
      m.rotation.order='YXZ';m.rotation.y=sd<0?Math.PI:0;m.rotation.x=-a;
      m.userData.noShadow=true;m.userData.plaque=sd<0?'ar':'av';carGroup.add(m);}
  }
}
/* ---- LES ÉCRANS : l'atelier de la plaque (#plq) et le profil (#prof) ---- */
Object.assign(I18N,{'TA PLAQUE':'YOUR PLATE','Elle roule sur toutes tes caisses':'It rides on all your cars','VALIDER':'CONFIRM','RETOUR':'BACK',
  'MON PROFIL':'MY PROFILE','CHANGER MA PLAQUE':'CHANGE MY PLATE','TEMPS DE JEU':'PLAY TIME','JOUEUR DEPUIS':'PLAYER SINCE','PARTIES':'RUNS',
  'FIGURES':'TRICKS','MEILLEUR TEMPS':'BEST TIME','RECORD':'BEST SCORE','FORTUNE MAX':'TOP FORTUNE','VITESSE MAX':'TOP SPEED',
  'AURA':'AURA','MEILLEURE AURA':'BEST AURA','RANG':'RANK','CAISSES':'CARS','MISSIONS':'MISSIONS','MEILLEUR COMBO':'BEST COMBO','SERIE':'STREAK',
  'TEMPS EN COURSE':'RACE TIME','Au hasard':'Random','Le texte de ta plaque':'Your plate text','Modeles':'Styles','Profil':'Profile',
  'JOURS':'DAYS','JOUR':'DAY','AUJOURD\'HUI':'TODAY','RETRO':'RETRO','COURSE':'RACING','BILLET':'BANKNOTE','LINGOT':'GOLD BAR','FRANCE':'FRANCE',
  'PLAQUE ENREGISTREE':'PLATE SAVED'});
function $p(id){return document.getElementById(id);}
function plqDuree(s){s=Math.max(0,Math.round(+s||0));const h=Math.floor(s/3600),mn=Math.floor(s%3600/60),sc=s%60;
  if(h)return h+' H '+String(mn).padStart(2,'0');if(mn)return mn+' MIN '+String(sc).padStart(2,'0');return sc+' S';}
function plqDate(ms){const d=new Date(+ms||Date.now()),j=String(d.getDate()).padStart(2,'0'),m=String(d.getMonth()+1).padStart(2,'0');
  return LANG==='fr'?j+'/'+m+'/'+d.getFullYear():d.getFullYear()+'-'+m+'-'+j;}
function plqApercu(cv,m,t){if(!cv)return;const c=cv.getContext('2d');plqPeint(c,cv.width,cv.height,m,t,null);}
function plqMods(){const box=$p('plqMods');if(!box)return;
  if(!box.children.length){box.innerHTML=PLQ_MOD.map(function(o){return '<div class="plMod" role="radio" tabindex="0" data-m="'+o.id+'" aria-label="'+o.n+'"><canvas width="256" height="64"></canvas><b>'+sansAcc(TR(o.n))+'</b></div>';}).join('');
    box.querySelectorAll('.plMod').forEach(function(el){const go=function(e){if(e)e.stopPropagation();const m=el.getAttribute('data-m');if(m===PLQ.m){uiClic('nav');return;}
      PLQ.m=m;uiClic('onglet');hap(8);uiPop(el);plqVue();};
      el.addEventListener('click',go);el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go(e);}});});}
  const t=(PLQ.x.trim()||'CASH CAR');
  box.querySelectorAll('.plMod').forEach(function(el){const m=el.getAttribute('data-m'),on=m===PLQ.m;el.classList.toggle('on',on);el.setAttribute('aria-checked',on?'true':'false');
    const cv=el.querySelector('canvas');if(cv._k!==m+'|'+t){cv._k=m+'|'+t;plqApercu(cv,m,t);}
    const b=el.querySelector('b');const n9=sansAcc(TR((PLQ_MOD.find(function(o){return o.id===m;})||{}).n||''));if(b.textContent!==n9)b.textContent=n9;});}
function plqVue(){plqApercu($p('plqCv'),PLQ.m,PLQ.x.trim());plqMods();}
function plqOuvre(mode){ // mode : 'premier' (le début du jeu, à valider) · 'profil' (depuis le profil, RETOUR annule)
  const el=$p('plq');if(!el||PLQ.on)return;const e=plqEtat();PLQ.on=true;PLQ.mode=mode||'profil';PLQ.m=(PLQ.mode==='premier'&&!e.ok)?plqPaysLocal():plqModOk(e.m);PLQ.x=plqNet(e.x)||plqHasard();
  el.classList.toggle('premier',PLQ.mode==='premier');
  el.classList.remove('clavier');el.style.top=el.style.height='';PLQ.kb=false;PLQ.kbFaux=0;PLQ.h0=plqH0(); /* (2026-10-18) la pose du clavier repart de zéro */
  const tx=$p('plqTx');if(tx){tx.value=PLQ.x;tx.setAttribute('aria-label',TR('Le texte de ta plaque'));}
  plqVue();feuilleOuvre(el,'on');try{chuteDoigtMontre(false);}catch(_){}
  try{const bx=$p('plqMods'),on=bx&&bx.querySelector('.plMod.on');if(bx&&on)bx.scrollTop=Math.max(0,on.offsetTop-bx.offsetTop-8);}catch(_){}
}
/* (2026-10-18) LE CLAVIER DU TÉLÉPHONE (voir #plq.clavier) : iOS et Android posent le clavier PAR-DESSUS la page — seule la partie visible
   (visualViewport) rétrécit, la mise en page ne bouge pas. Tant que le champ a le focus et que la partie visible a perdu plus de 90 px,
   l'atelier se pose exactement sur elle. Sur l'ordi (clavier physique) rien ne rétrécit : rien ne change. Un iPad au clavier physique n'a que
   sa barre de raccourcis (< 90 px) : rien ne change non plus. `dbgPlaque('clavier',h)` simule un clavier qui laisse h px visibles (bancs). */
const PLQ_KB=!/[?&]plqclavier=0\b/.test(location.search);
function plqH0(){const vv=window.visualViewport;return Math.max(innerHeight||0,document.documentElement.clientHeight||0,vv&&!PLQ.kb?vv.height:0);} /* la hauteur SANS clavier */
function plqClavier(){const el=$p('plq'),tx=$p('plqTx'),vv=window.visualViewport;if(!el||!PLQ.on)return; /* l'atelier qui se referme garde sa pose pendant son fondu */
  let on=false,top=0,h=0;
  if(PLQ.kbFaux){on=true;h=PLQ.kbFaux;}
  else if(PLQ_KB&&vv&&tx&&document.activeElement===tx){const h0=Math.max(PLQ.h0||0,document.documentElement.clientHeight||0);
    if(h0-vv.height>90){on=true;top=Math.max(0,vv.offsetTop);h=vv.height;}}
  PLQ.kb=on;
  if(on){const T=Math.round(top)+'px',H=Math.round(h)+'px',neuf=!el.classList.contains('clavier')||el.style.height!==H;if(el.style.top!==T)el.style.top=T;if(el.style.height!==H)el.style.height=H;
    if(neuf){el.classList.add('clavier');el.classList.remove('serre');if(el.scrollHeight>el.clientHeight+2)el.classList.add('serre');el.scrollTop=el.scrollHeight;}} /* debout, les modèles restent s'ils tiennent ; le champ et VALIDER, toujours au ras du clavier */
  else if(el.classList.contains('clavier')){el.classList.remove('clavier','serre');el.style.top=el.style.height='';}}
function plqFerme(ok){const el=$p('plq');if(!el||!PLQ.on)return;
  if(ok){const p=SAVE.d.plq||(SAVE.d.plq={});p.m=PLQ.m;p.x=plqNet(PLQ.x).trim()||plqHasard();p.ok=1;SAVE.flush();plqRepeint();
    toast(pxi('coche')+' '+TR('PLAQUE ENREGISTREE'),true);}
  PLQ.on=false;PLQ.kb=false;const tx=$p('plqTx');try{if(tx)tx.blur();}catch(_){} /* (2026-10-18, débogage) PLQ.kb remis ici : plqClavier ne tourne plus une fois l'atelier fermé, et le rattrapage de 400 ms (la page qui revient en haut quand le clavier iOS descend) attendait un PLQ.kb faux qui ne venait jamais */
  feuilleFerme(el,'on');if(PLQ.prof)profRemplit();}
function plqBranche(){const el=$p('plq');if(!el||el._b)return;el._b=1;
  const tx=$p('plqTx');
  if(tx){tx.addEventListener('input',function(){const v=plqNet(tx.value);if(v!==tx.value){const p=tx.selectionStart;tx.value=v;try{tx.setSelectionRange(Math.min(p,v.length),Math.min(p,v.length));}catch(_){}}
      PLQ.x=v;plqVue();});
    tx.addEventListener('click',function(e){e.stopPropagation();});
    /* (2026-10-18) LE CLAVIER DU TÉLÉPHONE : on suit la partie visible ; au départ du clavier, la page revient en haut (iOS la laissait
       remontée : le même correctif que le nom du TOP 10) ; le retour à l'écran entier attend 120 ms (le doigt qui touche VALIDER : la feuille
       ne bouge pas sous lui) */
    tx.addEventListener('focus',function(){clearTimeout(PLQ.kbT);plqClavier();PLQ.kbT=setTimeout(plqClavier,350);});
    tx.addEventListener('blur',function(){clearTimeout(PLQ.kbT);PLQ.kbT=setTimeout(plqClavier,120);
      setTimeout(function(){try{scrollTo(0,0);}catch(_){}},60);setTimeout(function(){try{if(!PLQ.kb)scrollTo(0,0);}catch(_){}},400);});
    if(window.visualViewport){const vvGo=function(){if(!PLQ.on)return;if(document.activeElement!==tx&&!PLQ.kbFaux)PLQ.h0=plqH0();plqClavier();};
      visualViewport.addEventListener('resize',vvGo);visualViewport.addEventListener('scroll',vvGo);}}
  const vue=el.querySelector('.plVue');if(vue)vue.addEventListener('click',function(e){e.stopPropagation();try{tx.focus();}catch(_){}});
  const de=el.querySelector('.plDe');if(de)de.addEventListener('mousedown',function(e){if(document.activeElement===tx)e.preventDefault();}); /* le dé n'emporte pas le focus : le clavier reste ouvert */
  el.querySelectorAll('[data-p]').forEach(function(b){const a=b.getAttribute('data-p'),go=function(e){if(e)e.stopPropagation();
      if(a==='ok'){uiClic('');hap(14);uiPop(b);plqFerme(true);}
      else if(a==='ret'){uiClic('retour');hap(6);plqFerme(false);}
      else if(a==='hasard'){const ecrit=PLQ.kb||document.activeElement===tx;uiClic('onglet');hap(8);uiPop(b);PLQ.x=plqHasard();if(tx)tx.value=PLQ.x;plqVue();
        if(ecrit&&tx)try{tx.focus();tx.setSelectionRange(tx.value.length,tx.value.length);}catch(_){}}}; /* on écrivait : on continue d'écrire, au bout du texte tiré */
    b.addEventListener('click',go);b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go(e);}});});
  addEventListener('keydown',function(e){if(!PLQ.on)return;if(e.target===tx)return;if(e.code==='Escape'&&PLQ.mode!=='premier'){e.preventDefault();e.stopImmediatePropagation();plqFerme(false);}
    else if(e.code==='Enter'){e.preventDefault();e.stopImmediatePropagation();plqFerme(true);}},true);
}
/* le clavier qui écrit sur la plaque ne conduit pas : la touche ne descend pas jusqu'au jeu (ESPACE = nitro, P = pause, I = inventaire…) —
   posé en CAPTURE ici, avant tous les autres gestionnaires du clavier (ce bloc passe avant eux au chargement). La frappe, elle, n'est pas annulée. */
addEventListener('keydown',function(e){if(e.target&&e.target.id==='plqTx'){e.stopImmediatePropagation();if(e.key==='Enter'){e.preventDefault();e.target.blur();}}},true); // Entrée referme le clavier
addEventListener('keyup',function(e){if(e.target&&e.target.id==='plqTx')e.stopImmediatePropagation();},true);
/* LE PREMIER ACCUEIL : la plaque se choisit avant tout le reste (la question de bienvenue attend qu'elle soit refermée, voir bienvPret) */
function plqVeut(){try{if(/[?&]plaque=1\b/.test(location.search))return !PLQ.fait;if(/[?&](plaque|bienvenue)=0\b/.test(location.search)||navigator.webdriver)return false; /* les BANCS (Puppeteer : navigator.webdriver) partent de sauvegardes neuves : l'atelier leur boucherait l'accueil — `?plaque=1` le rend */
  return !PLQ.fait&&!(SAVE.d.plq&&SAVE.d.plq.ok)&&!BALADE&&!SIMU_JEU&&!SANDBOX&&!(PARK&&PARK.on);}catch(e){return false;}}
function plqGuette(){if(PLQ.iv)return;PLQ.iv=setInterval(function(){try{
  if(!plqVeut()){clearInterval(PLQ.iv);return;}
  const sp=document.getElementById('splash'),md=document.getElementById('modale');
  const pret=!sp&&!!overlay&&overlay.getAttribute('data-ecran')==='home'&&!(started&&!gameOver)&&!(garageOn&&!document.body.classList.contains('titreCiel'))&&!(GAR&&GAR.go)&&!ecranWipe._on&&!(md&&md.classList.contains('on'))&&!document.body.classList.contains('play')&&!BIENV.on;
  if(!pret){PLQ.t0=0;return;}if(!PLQ.t0){PLQ.t0=performance.now();return;}
  if(performance.now()-PLQ.t0>600){clearInterval(PLQ.iv);PLQ.fait=true;plqOuvre('premier');}}catch(e){}},250);}
/* LE PROFIL */
function profChiffres(){const d=SAVE.d,ex=d.ex||{},p=d.prof||{};let tc=0;try{for(const k in (ex.temps||{}))tc+=+ex.temps[k]||0;}catch(e){}
  let own=0,tot=0;try{for(let i=0;i<CARS.length;i++){if(carRetiree(i))continue;tot++;if(i===0||carOwned(i))own++;}}catch(e){}
  let mis=0,misT=0;try{const s=m2Etat();mis=(s.ok||[]).length;misT=M2.length;}catch(e){}
  let rang='';try{rang=auraRankName();}catch(e){}
  return [
    ['horloge','TEMPS DE JEU',plqDuree(Math.max(p.tA||0,tc)),'gros'],
    ['etoile','JOUEUR DEPUIS',plqDate(p.ne),''],
    ['drapeau','PARTIES',String(ex.runs|0),''],
    ['rotation','FIGURES',String(ex.tricks|0),''],
    ['horloge','MEILLEUR TEMPS',p.dMax?plqDuree(p.dMax):'—',''],
    ['volant','TEMPS EN COURSE',plqDuree(tc),''],
    ['piece','RECORD',fmtC(d.best||0),'cash'],
    ['piece','FORTUNE MAX',fmtC(Math.max(d.bankMax||0,d.bank||0)),'cash'],
    ['eclair','VITESSE MAX',(ex.kmh|0)+' KM/H',''],
    ['etoile','AURA',String(Math.round(d.aura||0)),'aura'],
    ['trophee','RANG',rang?sansAcc(rang):'—','aura'],
    ['etoile','MEILLEURE AURA',String(Math.round(d.auraMax||0)),'aura'],
    ['rotation','MEILLEUR COMBO',d.figRec?'×'+(+d.figRec).toFixed(d.figRec%1?1:0):'—',''],
    ['voiture','CAISSES',own+' / '+tot,''],
    ['cible','MISSIONS',mis+(misT?' / '+misT:''),''],
    ['flamme','SERIE',((d.jour&&d.jour.n)|0)+' '+TR(((d.jour&&d.jour.n)|0)>1?'JOURS':'JOUR'),'']];}
function profRemplit(){const g=$p('pfStats');if(!g)return;
  g.innerHTML=profChiffres().map(function(c){return '<div class="pfS '+c[3]+'">'+pxi(c[0])+'<i>'+sansAcc(TR(c[1]))+'</i><b>'+c[2]+'</b></div>';}).join('');
  const e=plqEtat();plqApercu($p('pfCv'),plqModOk(e.m),String(e.x||'').trim());}
function profOuvre(){const el=$p('prof');if(!el||PLQ.prof)return;PLQ.prof=true;profRemplit();try{const s=el.querySelector('.pfStats');if(s)s.scrollTop=0;}catch(_){}feuilleOuvre(el,'on');}
function profFerme(){const el=$p('prof');if(!el||!PLQ.prof)return;PLQ.prof=false;feuilleFerme(el,'on');}
function profBranche(){const el=$p('prof');if(!el||el._b)return;el._b=1;
  el.querySelectorAll('[data-p]').forEach(function(b){const a=b.getAttribute('data-p'),go=function(e){if(e)e.stopPropagation();
      if(a==='ret'){uiClic('retour');hap(6);profFerme();}else if(a==='plaque'){uiClic('');hap(10);uiPop(b);plqOuvre('profil');}};
    b.addEventListener('click',go);b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go(e);}});});
  addEventListener('keydown',function(e){if(!PLQ.prof||PLQ.on)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();profFerme();}},true);
  const g=$p('gProf');if(g){const go=function(e){e.stopPropagation();if(!garageOn||(GAR&&GAR.go)||ecranWipe._on)return;uiClic('nav');hap(8);uiPop(g);profOuvre();};
    g.addEventListener('click',go);g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go(e);}});}
}
/* l'horloge du compte : cinq secondes de plus toutes les cinq secondes où le jeu est à l'écran (SAVE.mark : c'est le filet des 30 s qui écrit) */
function plqHorloge(){try{if(document.hidden)return;const p=SAVE.d.prof;if(!p)return;p.tA=Math.min(1e9,(p.tA||0)+5);SAVE.mark();}catch(e){}}
/* le trophée ne se montre que sur la vue principale de l'atelier (là où JOUER attend) : ni inventaire ouvert, ni « la voiture seule », ni
   boutique, ni missions, ni garage-menu — relu 4 fois par seconde, écrit seulement quand ça change. Sa place (2026-10-18 soir, Sacha : « la
   disposition des boutons est catastrophique… le trophée doit être en haut à droite ») : le coin HAUT-DROIT, en MIROIR du compte (#gCompteur
   tient le haut-gauche) — même marge au bord, centré sur sa hauteur. Les boîtes lues sont les boîtes penchées : la pente est comptée. */
function plqGarage(){const g=$p('gProf');if(!g)return;let on=false;
  try{if(garageOn&&!(GAR&&GAR.go)&&!(INV&&INV.on)&&!PLQ.prof&&!PLQ.on&&gEl&&!gEl.classList.contains('vueSeule')&&!gEl.classList.contains('menu')&&!gEl.classList.contains('atelierInv')&&!gEl.classList.contains('shopRet')){const j=$p('gJouer'); /* (2026-10-18) JOUER vit aussi dans l'inventaire et la boutique : ce ne sont pas la vue principale */
    if(j&&j.getClientRects().length&&getComputedStyle(j).visibility!=='hidden')on=true;}}catch(e){}
  if(g.classList.contains('on')!==on)g.classList.toggle('on',on);
  if(on&&!g.matches(':active,.appui'))try{const c=$p('gCompteur'),r=c&&c.getBoundingClientRect();
    if(r&&r.width>8&&r.bottom>0){const b=g.getBoundingClientRect(),dx=Math.round((innerWidth-r.left)-b.right),dy=Math.round((r.top+r.height/2)-(b.top+b.height/2));
      if(dx||dy){g.style.left=(g.offsetLeft+dx)+'px';g.style.top=(g.offsetTop+dy)+'px';}}}catch(e){}}
function plqDemarre(){try{plqBranche();profBranche();}catch(e){console.warn('plaque',e);}
  try{plqRepeint();}catch(e){}setInterval(plqHorloge,5000);setInterval(plqGarage,250);plqGuette();}
/* les profils fermés par un changement d'écran (JOUER, accueil) : le garage qui se ferme emporte le profil */
document.addEventListener('cc:jeu',function(){try{if(PLQ.prof)profFerme();}catch(e){}});
window.dbgPlaque=function(a,b){
  if(a==='ouvre'){plqOuvre(b||'profil');return 'ouvert';}
  if(a==='clavier'){PLQ.kbFaux=Math.max(0,+b||0);plqClavier();const el=$p('plq'),bx=function(s){const n=el.querySelector(s),r=n&&n.getBoundingClientRect();return r&&r.width?[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]:null;};
    return {clavier:el.classList.contains('clavier'),top:el.style.top,h:el.style.height,vue:bx('.plVue'),champ:bx('#plqTx'),de:bx('.plDe'),ret:bx('.plRet'),ok:bx('.plOk'),titre:bx('.plTete'),mods:bx('.plMods')};}
  if(a==='raz'){SAVE.d.plq.ok=0;SAVE.flush();PLQ.fait=false;return 'à choisir au prochain accueil';}
  if(a==='pos')return {pos:PLQ.pos,plaques:(function(){const r=[];carGroup.traverse(function(o){if(o.userData&&o.userData.plaque&&o.isMesh)r.push([o.userData.plaque,o.position.toArray().map(function(v){return +v.toFixed(3);})]);});return r;})()};
  if(a&&b!=null){const p=SAVE.d.plq;p.m=plqModOk(a);p.x=plqNet(b).trim()||p.x;p.ok=1;SAVE.flush();plqRepeint();return p;}
  return {plq:SAVE.d.plq,prof:SAVE.d.prof,on:PLQ.on,profil:PLQ.prof,caisses:Object.keys(PLQ.pos).length};};
window.dbgProfil=function(){profOuvre();return profChiffres().map(function(c){return c[1]+' : '+c[2];});};
