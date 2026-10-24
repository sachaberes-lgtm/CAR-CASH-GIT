/* ===== L'ENREGISTREUR DE PARTIES (2026-10-24, passe perf, Sacha : « lors des tests la voiture reste conduite sur le sol alors qu'une grosse partie du
   jeu se joue en voltigeant dans les airs ; fais un mode où c'est moi qui joue en voltigeant et toi tu récupères de la data ») =====
   Le pilote des bancs roule au sol : il ne vole presque pas, ne fait pas de figures, ne rate rien. Ici c'est SACHA qui joue, et le jeu note, à chaque
   image de course : la durée de l'image, le temps pris par le jeu avant le dessin (proxy du JS de la boucle), et la PHASE — sol, vol, figure (en vol
   avec une figure lancée) — avec la map, le palier, le cran de qualité, la densité. À chaque fin de partie, la course est rangée dans le téléphone
   (localStorage `ccPerfRec`, les 15 dernières) : on la relit sur le Mac par le pont de l'inspecteur (`dbgPerfRec()`).
   ALLUMER : `?perfrec=1` dans l'adresse, ou `localStorage.ccPerfRecOn='1'` (l'appli n'a pas d'adresse), ou `dbgPerfRec(1)` ; ÉTEINDRE : `?perfrec=0`
   ou `dbgPerfRec(0)`. Éteint, il ne pose aucun rappel d'image : zéro coût. Rien de ce qu'il fait ne touche au jeu (il lit, il ne pose rien). */
const PREC={on:false,cours:null,der:0,K:'ccPerfRec',KON:'ccPerfRecOn',N:15,LONG:40,BORNES:[16.9,25,33.4,50,100]};
(function(){try{const q=location.search;
  if(/[?&]perfrec=0\b/.test(q)){localStorage.removeItem(PREC.KON);}
  else if(/[?&]perfrec=1\b/.test(q)){localStorage.setItem(PREC.KON,'1');PREC.on=true;}
  else PREC.on=localStorage.getItem(PREC.KON)==='1';}catch(e){PREC.on=/[?&]perfrec=1\b/.test(location.search);}})();
function precPhase(){ /* sol / vol / figure (en vol avec une figure lancée) */
  if(mode!=='fall')return 'sol';
  let f=false;try{const C=FX2&&FX2.corps;f=!!(C&&C.figs&&C.figs.length);}catch(e){}
  return f?'figure':'vol';}
function precLieu(){try{return (LVL&&LVL.cur&&LVL.cur.id)||'?';}catch(e){return '?';}}
function precNeuve(now){ return {debut:new Date().toISOString(),t0:now,carte:[precLieu()],palier:(typeof PAL!=='undefined'?PAL.n:null),
  phases:{},longues:[],secondes:[],sec:null,ql:[],dpr:[],cad:null,n:0}; }
function precPose(c,ph,dt,js){
  const p=c.phases[ph]||(c.phases[ph]={n:0,ms:0,js:0,max:0,b:[0,0,0,0,0,0]});
  p.n++;p.ms+=dt;p.js+=js;if(dt>p.max)p.max=dt;
  let i=0;while(i<PREC.BORNES.length&&dt>PREC.BORNES[i])i++;p.b[i]++;}
function precFinit(c,now){ /* la course finie : arrondie et rangée */
  if(c.sec)c.secondes.push(c.sec);c.duree=+((now-c.t0)/1000).toFixed(1);
  for(const k in c.phases){const p=c.phases[k];p.ms=Math.round(p.ms);p.js=Math.round(p.js);p.max=Math.round(p.max);p.ips=p.ms?+(1000*p.n/p.ms).toFixed(1):0;}
  delete c.sec;delete c.t0;
  try{const a=JSON.parse(localStorage.getItem(PREC.K)||'[]');a.push(c);while(a.length>PREC.N)a.shift();localStorage.setItem(PREC.K,JSON.stringify(a));}catch(e){}}
function precImage(ts){
  if(!PREC.on)return;requestAnimationFrame(precImage);
  const now=performance.now(),js=Math.max(0,now-ts),dt=PREC.der?ts-PREC.der:0;PREC.der=ts;
  const enCourse=started&&!gameOver;
  if(!enCourse){if(PREC.cours){precFinit(PREC.cours,now);PREC.cours=null;}return;}
  if(!PREC.cours){PREC.cours=precNeuve(now);return;}
  if(!(dt>0)||dt>5000)return; /* l'onglet caché, une pause : pas une image */
  const c=PREC.cours,ph=precPhase(),lieu=precLieu();c.n++;
  if(c.carte[c.carte.length-1]!==lieu)c.carte.push(lieu);
  precPose(c,ph,dt,js);
  const s=Math.floor((now-c.t0)/1000);
  if(!c.sec||c.sec[0]!==s){if(c.sec)c.secondes.push(c.sec);c.sec=[s,0,0,ph];}
  c.sec[1]++;if(dt>c.sec[2])c.sec[2]=Math.round(dt);if(ph!=='sol')c.sec[3]=ph;
  try{const k=QL.k,d=+curDPR.toFixed(2);if(c.ql[c.ql.length-1]?.[1]!==k)c.ql.push([s,k]);if(c.dpr[c.dpr.length-1]?.[1]!==d)c.dpr.push([s,d]);c.cad=!!(typeof CAD!=='undefined'&&CAD.on);}catch(e){}
  if(dt>PREC.LONG&&c.longues.length<200){let v=0;try{v=Math.round(mode==='fall'?Math.hypot(fallVel.x,fallVel.z):Math.abs(vA));}catch(e){}
    c.longues.push([+((now-c.t0)/1000).toFixed(2),Math.round(dt),Math.round(js),ph,lieu,v]);}
}
if(PREC.on)requestAnimationFrame(precImage);
/* (banc) dbgPerfRec() : tout · dbgPerfRec(1|0) : allumer / éteindre (gardé dans le téléphone) · dbgPerfRec('vide') : effacer les courses ·
   dbgPerfRec('resume') : une ligne par course et par phase (i/s, images > 25 / 33 / 50 ms, pire) */
window.dbgPerfRec=function(a){
  if(a===1||a===true){PREC.on=true;try{localStorage.setItem(PREC.KON,'1');}catch(e){}PREC.der=0;requestAnimationFrame(precImage);return 'enregistreur allumé';}
  if(a===0||a===false){PREC.on=false;try{localStorage.removeItem(PREC.KON);}catch(e){}return 'enregistreur éteint';}
  let C=[];try{C=JSON.parse(localStorage.getItem(PREC.K)||'[]');}catch(e){}
  if(a==='vide'){try{localStorage.removeItem(PREC.K);}catch(e){}return 'courses effacées';}
  if(a==='resume')return C.map(function(c){return c.debut.slice(11,19)+' '+c.carte.join('>')+' '+c.duree+'s palier '+c.palier+' | '+Object.keys(c.phases).map(function(k){const p=c.phases[k];
    return k+' '+p.n+' img '+p.ips+' i/s >25:'+(p.b[2]+p.b[3]+p.b[4]+p.b[5])+' >33:'+(p.b[3]+p.b[4]+p.b[5])+' >50:'+(p.b[4]+p.b[5])+' pire '+p.max;}).join(' · ');});
  return {on:PREC.on,enCours:PREC.cours?{n:PREC.cours.n,carte:PREC.cours.carte,phases:PREC.cours.phases}:null,courses:C};};
