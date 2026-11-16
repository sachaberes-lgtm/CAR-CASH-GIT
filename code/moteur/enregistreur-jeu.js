/* ===== L'ENREGISTREUR DE JEU (2026-11-13, Sacha : « je veux retravailler la génération de terrain, mais Claude arrive mal à comprendre comment on
   joue au jeu ; crée-moi un enregistreur de position sur la version mobile pour que, sans flux vidéo ni flux d'images, Claude comprenne comment je
   joue ; je fais quelques parties, et après je lui fais un prompt à partir de ça pour la génération de maps ») =====
   Pas une image : des CHIFFRES. À chaque partie, le jeu note :
     · LA ROUTE, une fois par piste (au départ et à chaque portail) : un point tous les ~20 m (x, y, z, cap, pente, dévers, la dalle à l'envers ?),
       ses modules (abscisse, nom de la figure, climax), ses trous, sa largeur, la map, la météo ;
     · LA CAISSE, 10 fois par seconde : où elle est PAR RAPPORT À LA ROUTE (abscisse s, décalage latéral, hauteur au-dessus de la dalle), la
       vitesse, le sol / le vol / la figure, la position monde, et LE POUCE (stick x / y, doigt posé, braquage lissé), la nitro, le drift ;
     · LES ÉVÉNEMENTS, à l'image près : décollage (et d'où : bord, trou, saut), pose (durée du vol, hauteur max), figure lancée, pièces, bump,
       changement de route, pause, mort (et sa cause).
   Les parties se rangent dans le téléphone (localStorage `ccJeuRec`, les 8 dernières, ~1,6 Mo au plus) et en SORTENT par le panneau « PARTIES »
   (boîte noire : 5 touchers sur la ligne de version → PARTIES) : PARTAGER (un fichier .json par la feuille de partage : AirDrop vers le Mac,
   Fichiers, Mail…), COPIER (le presse-papier, qui passe sur le Mac), ou par le pont de l'inspecteur (`dbgJeuRec()`).
   Sur le Mac : `node outils/jeu-rec/lire.mjs <fichier.json>` rend le récit lisible par Claude ; `outils/jeu-rec/voir.html` dessine les traces.
   ALLUMER : le bouton du panneau, `?jeurec=1`, ou `dbgJeuRec(1)` (gardé dans le téléphone) ; ÉTEINDRE : pareil avec 0. Éteint : aucun rappel
   d'image, zéro coût. Allumé : il LIT, il ne pose rien (son propre repère `JREC.F`, jamais le `F` de la boucle). */
const JREC={on:false,K:'ccJeuRec',KON:'ccJeuRecOn',N:8,MAXC:1600000,PAS:.1,cours:null,ts:0,
  F:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
  COLS:['t','r','m','s','lat','h','kmh','vm','st','sv','doigt','steer','nit','drift','dessous','x','y','z']};
(function(){try{const q=location.search;
  if(/[?&]jeurec=0\b/.test(q)){localStorage.removeItem(JREC.KON);}
  else if(/[?&]jeurec=1\b/.test(q)){localStorage.setItem(JREC.KON,'1');JREC.on=true;}
  else JREC.on=localStorage.getItem(JREC.KON)==='1';}catch(e){JREC.on=/[?&]jeurec=1\b/.test(location.search);}})();
function jrR(v,k){return Math.round((+v||0)*k)/k;}
function jrLieu(){const c=LVL&&LVL.cur;return c?{id:c.id||null,carte:c.carte||c.piste||c.id||null,meteo:c.meteo||null,nm:c.nm||null}:{id:PARK.on?'parc':null};}
function jrRoute(){ /* la piste en cours, à plat sur ~20 m : ce que le générateur a dessiné */
  const F9=JREC.F,n=Math.max(2,Math.min(1500,Math.round(L/20))),P=[];
  for(let k=0;k<=n;k++){frameAt(k*L/n,F9);const t=F9.t,p=F9.p;
    P.push([jrR(p.x,10),jrR(p.y,10),jrR(p.z,10),jrR(Math.atan2(t.x,t.z)*57.2958,10),jrR(Math.asin(Math.max(-1,Math.min(1,t.y)))*57.2958,10),
      jrR(Math.asin(Math.max(-1,Math.min(1,F9.b.y)))*57.2958,10),F9.n.y<0?1:0]);}
  let mods=[],trous=[];
  try{mods=(MODS||[]).map(function(m){return [Math.round(m.s0+60),Math.round(m.s1),m.fig||null,m.climax?1:0];});}catch(e){}
  try{trous=(TROUS||[]).map(function(q){return [Math.round(q.s0),Math.round(q.s1)];});}catch(e){}
  return Object.assign(jrLieu(),{L:Math.round(L),rh:jrR(ROAD_HALF,10),pas:jrR(L/n,100),cols:['x','y','z','cap','pente','devers','envers'],P:P,mods:mods,trous:trous});}
function jrNeuve(now){
  let car=null;try{car=CARS[level]&&CARS[level].name;}catch(e){}
  return {format:'cashcar-jeurec-1',debut:new Date().toISOString(),ver:(typeof CC_VER==='string'?CC_VER:'?'),
    ecran:{w:innerWidth,h:innerHeight,portrait:innerHeight>innerWidth,app:!!window.Capacitor,tel:!!(typeof ALLEGE!=='undefined'&&ALLEGE)},
    voiture:car,tuto:!!(TUTO&&TUTO.on),routes:[],cols:JREC.COLS,ech:[],ev:[],
    _t0:now,_pause:0,_pt:0,_dern:-1,_pts:null,_mode:null,_vol:null,_coins:coinsGot|0,_bumps:runStats.bumps|0,_tricks:runStats.tricks|0,_figN:null,_pz:false,_sol:null};}
function jrT(c,now){return (now-c._t0-c._pause)/1000;}
function jrEv(c,now,a){a.unshift(jrR(jrT(c,now),100));c.ev.push(a);}
function jrIci(){ /* la caisse par rapport à la route, et dans le monde */
  const F9=JREC.F;
  if(mode==='fall'){const sN=curNear?lastNearS:s;return {s:sN,lat:curNear?curLatOff:lat,h:curNear?curHOff:0,x:fallPos.x,y:fallPos.y,z:fallPos.z};}
  frameAt(s,F9);const g=side<0?-1:1,hy=(typeof hopY==='number'?hopY:0);
  return {s:s,lat:lat,h:hy,x:F9.p.x+F9.b.x*lat*g+F9.n.x*hy*g,y:F9.p.y+F9.b.y*lat*g+F9.n.y*hy*g,z:F9.p.z+F9.b.z*lat*g+F9.n.z*hy*g};}
function jrFinit(c,now){
  const fin={t:jrR(jrT(c,now),100),cause:(typeof mortCause==='string'&&mortCause)||(gameOver?'?':'quitte'),argent:jrR(money,100),pieces:coinsGot|0,
    figures:runStats.tricks|0,bumps:runStats.bumps|0,zones:runStats.zones|0,vmax:Math.round(runStats.vmax||0)};
  c.fin=fin;for(const k in c)if(k.charAt(0)==='_')delete c[k];
  if(c.ech.length<20)return; /* moins de 2 s : un faux départ, rien à apprendre */
  try{let a=JSON.parse(localStorage.getItem(JREC.K)||'[]');a.push(c);while(a.length>JREC.N)a.shift();
    let txt=JSON.stringify(a);while(txt.length>JREC.MAXC&&a.length>1){a.shift();txt=JSON.stringify(a);}
    localStorage.setItem(JREC.K,txt);
    setTimeout(function(){try{toast(pxi('coche')+' PARTIE ENREGISTRÉE · '+a.length,true);}catch(e){}},2600);}catch(e){}}
function jrImage(ts){
  if(!JREC.on)return;requestAnimationFrame(jrImage);
  const now=performance.now(),enCourse=started&&!gameOver;
  if(!enCourse){if(JREC.cours){if(mode==='boom'||gameOver)jrEvMort(JREC.cours,now);jrFinit(JREC.cours,now);JREC.cours=null;}return;}
  if(!JREC.cours)JREC.cours=jrNeuve(now);
  const c=JREC.cours;
  if(paused){if(!c._pz){c._pz=now;jrEv(c,now,['pause']);}return;}
  if(c._pz){c._pause+=now-c._pz;c._pz=false;jrEv(c,now,['reprise']);}
  try{jrSuit(c,now);}catch(e){}}
function jrEvMort(c,now){if(c._mort)return;c._mort=1;let q={s:s,lat:lat};try{q=jrIci();}catch(e){}
  jrEv(c,now,['mort',(typeof mortCause==='string'&&mortCause)||'?',Math.round(q.s),jrR(q.lat,10),c._mode||mode]);}
function jrSuit(c,now){
  if(c._pts!==pts){c._pts=pts;c.routes.push(jrRoute());if(c.routes.length>1)jrEv(c,now,['route',c.routes.length-1,c.routes[c.routes.length-1].carte]);}
  const r=c.routes.length-1,q=jrIci(),kmh=(mode==='fall'?Math.hypot(fallVel.x,fallVel.y,fallVel.z):Math.abs(vA))*SPD*3.6;
  /* les événements, à l'image près */
  if(mode!==c._mode){
    if(mode==='fall'&&c._mode==='drive'){const sol=c._sol||q,i9=Math.max(0,Math.min(NP-1,Math.round(sol.s/L*(NP-1)))),
        d=(TROU&&TROU[i9])?'trou':Math.abs(sol.lat)>ROAD_HALF*.92?'bord':'saut';
      c._vol={t:now,hMax:0,figs:0};jrEv(c,now,['decol',d,Math.round(sol.s),jrR(sol.lat,10),Math.round(kmh)]);}
    else if(mode==='drive'&&c._mode==='fall'&&c._vol){jrEv(c,now,['pose',Math.round(q.s),jrR(q.lat,10),Math.round(kmh),jrR((now-c._vol.t)/1000,100),Math.round(c._vol.hMax),c._vol.figs]);c._vol=null;}
    else if(mode==='boom')jrEvMort(c,now);
    c._mode=mode;}
  if(mode==='drive')c._sol={s:q.s,lat:q.lat};
  if(c._vol&&q.h>c._vol.hMax)c._vol.hMax=q.h;
  try{const C=FX2&&FX2.corps;if(C){if(c._figN==null)c._figN=C.n;else if(C.n>c._figN){c._figN=C.n;if(c._vol)c._vol.figs++;jrEv(c,now,['fig',C.der||'?']);}}}catch(e){}
  if((coinsGot|0)>c._coins){jrEv(c,now,['piece',(coinsGot|0)-c._coins,Math.round(q.s),jrR(q.lat,10)]);c._coins=coinsGot|0;}
  if((runStats.bumps|0)>c._bumps){jrEv(c,now,['bump',Math.round(q.s),jrR(q.lat,10)]);c._bumps=runStats.bumps|0;}
  if((runStats.tricks|0)>c._tricks){jrEv(c,now,['figure_payee',(runStats.tricks|0)-c._tricks]);c._tricks=runStats.tricks|0;}
  /* l'échantillon, 10 fois par seconde */
  const t=jrT(c,now);if(t-c._dern<JREC.PAS)return;c._dern=t;
  const fig=mode==='fall'&&FX2&&FX2.corps&&FX2.corps.occupe&&FX2.corps.occupe()>0;
  c.ech.push([jrR(t,100),r,mode==='drive'?0:mode==='fall'?(fig?2:1):3,jrR(q.s,10),jrR(q.lat,10),jrR(q.h,10),Math.round(kmh),jrR(vitMult(),100),
    jrR(TCTL.st,100),jrR(TCTL.sv,100),TCTL.act?1:0,jrR(steer,100),nitroOn?1:0,driftEnCours?1:0,side<0?1:0,Math.round(q.x),Math.round(q.y),Math.round(q.z)]);
  if(c.ech.length>6000)c.ech.splice(0,1); /* 10 min : au-delà on garde la fin */}
if(JREC.on)requestAnimationFrame(jrImage);
function jrParties(){try{return JSON.parse(localStorage.getItem(JREC.K)||'[]');}catch(e){return [];}}
function jrPaquet(){return JSON.stringify({format:'cashcar-jeurec-1',exporte:new Date().toISOString(),ver:(typeof CC_VER==='string'?CC_VER:'?'),parties:jrParties()});}
function jrAllume(on){JREC.on=!!on;try{if(on)localStorage.setItem(JREC.KON,'1');else localStorage.removeItem(JREC.KON);}catch(e){}if(on)requestAnimationFrame(jrImage);}
/* LE PANNEAU « PARTIES » (ouvert depuis la boîte noire) : allumer / éteindre, partager le fichier, copier, effacer */
function jrPanneau(){
  let o=document.getElementById('ccJeuRec');if(o)o.remove();
  const P=jrParties(),txtL=P.length?P.slice().reverse().map(function(c){const r0=c.routes&&c.routes[0];
    return c.debut.slice(5,16).replace('T',' ')+' · '+(c.routes||[]).map(function(r){return r.carte;}).join(' > ')+' · '+(c.fin?c.fin.t:'?')+' s · '+(c.fin?c.fin.cause:'')+' · '+(c.ecran&&c.ecran.portrait?'debout':'couché');}).join('\n')
    :'Aucune partie. Allume, joue, reviens ici.';
  o=document.createElement('div');o.id='ccJeuRec';
  o.setAttribute('style','position:fixed;inset:0;z-index:99999;background:rgba(7,5,15,.97);color:#ffd75e;box-sizing:border-box;overflow:auto;'+
    'font:8px/1.8 var(--pix);padding:calc(env(safe-area-inset-top,0px) + 20px) 18px calc(env(safe-area-inset-bottom,0px) + 20px);-webkit-user-select:text;user-select:text');
  const bt='display:inline-block;margin:0 8px 14px 0;padding:12px 14px;border:0;font:10px var(--pix);color:#3a1800;background:linear-gradient(180deg,#ffe78e,#f7ae16);cursor:pointer';
  o.innerHTML='<div style="font:12px/1.5 var(--pix);color:#fff;margin-bottom:6px">PARTIES ENREGISTRÉES · '+P.length+'</div>'+
    '<div style="margin-bottom:12px;color:'+(JREC.on?'#7dff9a':'#ff7d7d')+'">'+(JREC.on?'● ENREGISTRE CHAQUE PARTIE':'○ ÉTEINT')+'</div>'+
    '<button data-j="o" style="'+bt+'">'+(JREC.on?'ÉTEINDRE':'ALLUMER')+'</button><button data-j="p" style="'+bt+'">PARTAGER</button><button data-j="c" style="'+bt+'">COPIER</button>'+
    '<button data-j="v" style="'+bt+'">EFFACER</button><button data-j="f" style="'+bt+'">FERMER</button>'+
    '<pre style="white-space:pre-wrap;word-break:break-word;color:#c9bdf0;margin:0"></pre>';
  o.querySelector('pre').textContent=txtL;
  o.addEventListener('click',function(ev){const k=ev.target&&ev.target.getAttribute&&ev.target.getAttribute('data-j');if(!k)return;ev.stopPropagation();const b=ev.target;
    if(k==='o'){jrAllume(!JREC.on);jrPanneau();return;}
    if(k==='f'){o.remove();return;}
    if(k==='v'){if(b.textContent!=='SÛR ?'){b.textContent='SÛR ?';return;}try{localStorage.removeItem(JREC.K);}catch(e){}jrPanneau();return;}
    const txt=jrPaquet(),nom='cashcar-parties-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json';
    const copie=function(){try{navigator.clipboard.writeText(txt).then(function(){b.textContent='COPIÉ !';},function(){b.textContent='RATÉ';});}catch(e){b.textContent='RATÉ';}};
    if(k==='c'){copie();return;}
    if(k==='p'){let f=null;try{f=new File([txt],nom,{type:'application/json'});}catch(e){}
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:nom}).then(function(){b.textContent='ENVOYÉ';},function(e){if(!(e&&e.name==='AbortError'))copie();});return;}
      if(navigator.share){navigator.share({title:nom,text:txt}).then(function(){b.textContent='ENVOYÉ';},function(e){if(!(e&&e.name==='AbortError'))copie();});return;}
      try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=nom;document.body.appendChild(a);a.click();a.remove();b.textContent='TÉLÉCHARGÉ';}catch(e){copie();}}});
  document.body.appendChild(o);}
window.__ccJeuRec=jrPanneau;
/* (banc / pont de l'inspecteur) dbgJeuRec() : l'état · dbgJeuRec(1|0) : allumer / éteindre · dbgJeuRec('tout') : le paquet entier (le même que PARTAGER) ·
   dbgJeuRec('vide') : effacer · dbgJeuRec('panneau') : ouvrir le panneau */
window.dbgJeuRec=function(a){
  if(a===1||a===true){jrAllume(true);return 'enregistreur de jeu allumé';}
  if(a===0||a===false){jrAllume(false);return 'enregistreur de jeu éteint';}
  if(a==='vide'){try{localStorage.removeItem(JREC.K);}catch(e){}return 'parties effacées';}
  if(a==='tout')return jrPaquet();
  if(a==='panneau'){jrPanneau();return 'ok';}
  const P=jrParties();
  return {on:JREC.on,enCours:JREC.cours?{ech:JREC.cours.ech.length,ev:JREC.cours.ev.length,routes:JREC.cours.routes.length}:null,parties:P.length,
    taille:(localStorage.getItem(JREC.K)||'').length,liste:P.map(function(c){return c.debut+' '+(c.routes||[]).map(function(r){return r.carte;}).join('>')+' '+(c.fin&&c.fin.t)+'s '+(c.fin&&c.fin.cause);})};};
