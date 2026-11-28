/* ===== LES VUES DES TESTS DES GENES V4 (28/11/2026, lot « genes v4 ») =====
   Ce fichier n'est pas un test : un module partage par tests/genes-v4.test.js et tests/genes-muets.test.js.
   - vueVol, vueSol : les deux vues de l'inventaire (ml/ecurie/etude/selection-naturelle/inventaire/vue-exemple.json), retouchees ;
   - suitesPortage() : les suites de tests/portage.test.js, recopiees (un fichier de test joue ses tests en se chargeant : il ne s'importe pas) ;
   - suitesV4() : des suites faites pour declencher chaque gene v4 (la sortie preparee, la bascule vers « rien », la loi fidele, les secours). Elles
     portent parfois des rayons retour<i> qu'un pilote sans loi demandee n'attend pas : il leve « YEUX CHANGES », la meme erreur dans le pilote d'avant
     et dans celui d'aujourd'hui (la comparaison la compte comme une decision).
   Aucune course, aucun jeu charge. */
'use strict';
const path=require('path');
const EX=require(path.join(__dirname,'..','..','ecurie','etude','selection-naturelle','inventaire','vue-exemple.json'));
const copie=x=>JSON.parse(JSON.stringify(x));
const D10=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
/* un vol propre (10 rayons, sans cible) ; f(v, par) retouche la vue, par = les rayons par nom */
function vueVol(f){const v=copie(EX.vol.vue),R=v.vol.radar.rayons.filter(r=>r.m!=='viser'&&r.m!=='viserPlane'),par={};for(const r of R)par[r.m]=r;
  v.vol.radar.rayons=D10.map(n=>par[n]);v.vol.cible=null;if(f)f(v,par);return v;}
function vueSol(f){const v=copie(EX.sol.vue);if(f)f(v);return v;}

/* ---------- les suites de tests/portage.test.js (recopiees, comme tests/genes-muets.test.js) ---------- */
function suitesPortage(){
  const S=[];
  S.push({nom:'inventaire sol',vues:[vueSol()]},{nom:'inventaire vol',vues:[copie(EX.vol.vue)]});
  S.push({nom:'inventaire sol-vol-vol-sol',vues:[EX.sol.vue,EX.vol.vue,EX.vol.vue,EX.sol.vue].map((x,i)=>{const v=copie(x);v.t=+(10+i*.1).toFixed(2);return v;})});
  for(const carte of ['espace','nuages','grotte'])for(const t of [.2,.5,.65,.8,1.1,2])for(const jauge of [.3,.6,1.7])
    S.push({nom:'bord '+carte+' t '+t+' jauge '+jauge,vues:[vueSol(v=>{v.carte=carte;v.tenue={tient:false,cote:1,t:t,approx:true};v.nitro=Math.min(1,jauge);v.reserve=Math.max(0,jauge-1);})]});
  for(const carte of ['espace','grotte'])for(let i=0;i<=24;i++){const l=+(i*.07).toFixed(2);
    S.push({nom:'libre '+carte+' lacet '+l,vues:[vueSol(v=>{v.carte=carte;v.lacetRoute=0;v.route=v.route.map(p=>Object.assign({},p,{virage:0}));}),
      vueSol(v=>{v.carte=carte;v.t=8.2;v.lacetRoute=l;v.route=v.route.map(p=>Object.assign({},p,{virage:l*p.d/120}));})]});}
  for(const carte of ['espace','grotte'])for(const marge of [-12,-6,-3,0,2,4,6,10])
    S.push({nom:'libre '+carte+' marge '+marge,vues:[vueSol(v=>{v.carte=carte;}),vueSol(v=>{v.carte=carte;v.t=8.2;v.virage=Object.assign({},v.virage,{d:50,marge:marge});})]});
  for(const carte of ['nuages','grotte'])for(const tp of [.6,1.5,2.5])for(const n of [1,2,3])
    S.push({nom:'dessous '+carte+' t '+tp+' vues '+n,vues:Array.from({length:n},(x,i)=>vueVol((v,par)=>{v.carte=carte;v.vol.radar.decor=carte;v.t=+(24.8+.1*i).toFixed(2);
      Object.assign(par.versRoute,{issue:'pose',t:tp,dessous:true,propre:true,axe:.1});Object.assign(par.versRoutePlane,{issue:'pose',t:tp+.3,propre:true,axe:.2,dessous:false});
      Object.assign(par.pique,{issue:'pose',t:tp+.1,propre:true,axe:.15,dessous:false});}))});
  for(const carte of ['nuages','espace','grotte'])for(const haut of [2,3.5,5,7,8.5,10,12,14,16])for(const tp of [1.9,2.4,3])
    S.push({nom:'large '+carte+' haut '+haut+' pose '+tp,vues:[0,1,2,3].map(i=>vueVol((v,par)=>{v.carte=carte;v.vol.radar.decor=carte;v.t=+(24.8+.15*i).toFixed(2);
      v.vol.t=+(.6+.15*i).toFixed(2);v.vol.proche=Object.assign({},v.vol.proche,{haut:haut,lat:-3,axe:.05});v.nitro=.9;v.reserve=1;v.vol.air={reste:5.6,jauges:1};
      Object.assign(par.versRoute,{issue:'pose',t:tp-.15*i,axe:.2,propre:true,dessous:false,air:5});Object.assign(par.versRoutePlane,{issue:'pose',t:tp-.15*i+.2,axe:.25,propre:true,dessous:false,air:4.5});
      Object.assign(par.tenu,par.versRoute,{m:'tenu'});}))});
  return S;}

/* ---------- les vues des genes v4 ---------- */
const pose=(o)=>Object.assign({issue:'pose',t:1.5,axe:.1,propre:true,dessous:false,lat:-3,gain:0,air:5},o||{});
/* LA SORTIE PREPAREE (§ 3.1) : au sol, la route lache dans t s (cote 1), jauge donnee, le rayon du bord : rien / versRoute / plane */
function solBord(o){o=o||{};return vueSol(v=>{v.carte=o.carte||'grotte';v.t=o.t0!=null?o.t0:8.1;v.tenue={tient:false,cote:1,t:o.t!=null?o.t:.5,approx:true};
  const j=o.jauge!=null?o.jauge:.8;v.nitro=Math.min(1,j);v.reserve=Math.max(0,j-1);
  v.sorties={pourquoi:'bord proche',bord:{t:o.t!=null?o.t:.5,rayons:[{m:'rien',issue:o.rien||'choc',t:1.2,cause:'roche'},{m:'versRoute',issue:o.versRoute||'choc',t:1.4,cause:'roche'},
    o.plane==='choc'?{m:'plane',issue:'choc',t:1.1,cause:'roche'}:o.plane==='levre'?{m:'plane',issue:'levre',t:1.6}:pose({m:'plane',t:1.8,axe:.12,propre:o.propre!==false,dessous:!!o.dessous})]},
    gauche:null,droite:null,saut:null};});}
/* la premiere vue de vol apres ce bord : radar de l'inventaire (sans viser), plane qui se pose */
function volApres(o){o=o||{};return vueVol((v,par)=>{v.carte=o.carte||'grotte';v.vol.radar.decor=v.carte;v.t=o.t!=null?o.t:8.2;v.vol.t=.05;
  Object.assign(par.plane,pose({m:'plane',t:1.7}));if(o.f)o.f(v,par);});}
/* LA BASCULE VERS « RIEN » (§ 3.2) : n vues de vol a 0,1 s ; versRoute se pose (axe axeVR), rien se pose (axe axeR) des la vue k0 */
function volRien(n,o){o=o||{};return Array.from({length:n},(x,i)=>vueVol((v,par)=>{v.carte=o.carte||'nuages';v.vol.radar.decor=v.carte;v.t=+(30+.1*i).toFixed(2);v.vol.t=+(.2+.1*i).toFixed(2);
  Object.assign(par.versRoute,pose({m:'versRoute',t:o.tVR!=null?o.tVR:2,axe:o.axeVR!=null?o.axeVR:.5}));Object.assign(par.tenu,par.versRoute,{m:'tenu'});
  Object.assign(par.versRoutePlane,{issue:'choc',t:2,cause:'roche'});Object.assign(par.pique,{issue:'choc',t:.8,cause:'roche'});
  const ici=o.rienDe?o.rienDe(i):(i>=(o.k0|0));
  if(ici)Object.assign(par.rien,pose({m:'rien',t:o.tR!=null?o.tR:2.2,axe:o.axeR!=null?o.axeR:.1,dessous:!!o.dessousR}));
  else Object.assign(par.rien,{issue:'choc',t:.6,cause:'roche'});
  if(o.f)o.f(v,par,i);}));}
/* LES SECOURS (§ 3.4) : tous les rayons longs meurent ; les courts « libre » (ou non) ; les rayons de secours retour<k> */
function volSecours(o){o=o||{};return vueVol((v,par)=>{v.carte=o.carte||'nuages';v.vol.radar.decor=v.carte;v.t=o.t!=null?o.t:40;v.vol.t=o.ft!=null?o.ft:.5;
  Object.assign(par.rien,{issue:'choc',t:.9,cause:'roche'});Object.assign(par.plane,{issue:'air',t:2.5});Object.assign(par.versRoute,{issue:'choc',t:.5,cause:'roche'});
  Object.assign(par.tenu,par.versRoute,{m:'tenu'});Object.assign(par.versRoutePlane,{issue:o.vrp||'fond',t:3});
  for(const k of ['gauche','droite','cabre'])Object.assign(par[k],{issue:o.court||'libre',t:2,haut:30,lat:-20});
  Object.assign(par.pique,{issue:'choc',t:.7,cause:'roche'});Object.assign(par.planeCabre,{issue:'choc',t:.8,cause:'roche'});
  if(o.rayons){v.vol.radar.rayons=v.vol.radar.rayons.concat(o.rayons);v.vol.retours=o.retours;}
  if(o.f)o.f(v,par);});}
function suitesV4(){
  const S=[];
  /* sortieOn : la regle vraie au sol, puis le decollage ; ses variantes (carte sans decor, plane au choc, t au-dela de sortieT, jauge, levre) */
  for(const carte of ['grotte','canyon','ville','jade','espace','nuages'])for(const t of [.4,.5,.9,1.3])for(const jauge of [.3,.6,.8])
    S.push({nom:'sortie '+carte+' t '+t+' jauge '+jauge,vues:[solBord({carte,t,jauge}),volApres({carte})]});
  for(const plane of ['choc','levre','sale','dessous'])S.push({nom:'sortie grotte plane '+plane,vues:[solBord({plane:plane==='sale'||plane==='dessous'?'pose':plane,propre:plane!=='sale',dessous:plane==='dessous'}),volApres()]});
  S.push({nom:'sortie annonce contraire',vues:[solBord(),solBord({t0:8.15,plane:'choc'}),volApres({t:8.25})]});
  S.push({nom:'sortie puis viser',vues:[solBord(),copie(EX.vol.vue)].map((v,i)=>{if(i===1){v.carte='grotte';v.t=8.2;v.vol.t=.05;for(const r of v.vol.radar.rayons)if(r.m==='plane')Object.assign(r,{issue:'choc',t:.5});}return v;})});
  /* rienOn : deux vues de suite apres tenirFacon ; une seule vue ; ecart trop petit ; rien dessous ; retour de la bascule ; la figure qui suit */
  S.push({nom:'rien simple',vues:volRien(8)});
  S.push({nom:'rien une seule vue',vues:volRien(8,{rienDe:i=>i===5})});
  S.push({nom:'rien ecart .35',vues:volRien(8,{axeR:.35})});
  for(const axeR of [.05,.15,.25,.3])S.push({nom:'rien axe '+axeR,vues:volRien(8,{axeR})});
  S.push({nom:'rien dessous',vues:volRien(8,{dessousR:true})});
  S.push({nom:'rien puis retour',vues:volRien(14,{rienDe:i=>i!==7})});
  S.push({nom:'rien et figure',vues:volRien(8,{tVR:1,tR:2.5,f:(v)=>{v.vol.proche=Object.assign({},v.vol.proche,{haut:20});}})});
  /* loiFidele : le rayon versRoute du radar meurt, la loi fidele (retour0) se pose ; et l'inverse */
  const fid=(o)=>vueVol((v,par)=>{v.carte='nuages';v.vol.radar.decor='nuages';v.t=50;v.vol.t=.5;
    Object.assign(par.versRoute,o.vr);Object.assign(par.tenu,par.versRoute,{m:'tenu'});
    v.vol.radar.rayons.push(Object.assign({m:'retour0'},o.r0));v.vol.retours=[{volant:.3,manche:0,nitro:false}];if(o.f)o.f(v,par);});
  S.push({nom:'fidele air/pose',vues:[fid({vr:{issue:'air',t:.5},r0:pose({t:1.5})})]});
  S.push({nom:'fidele pose/air',vues:[fid({vr:pose({m:'versRoute',t:1.5}),r0:{issue:'air',t:.5}})]});
  S.push({nom:'fidele figure',vues:[fid({vr:pose({m:'versRoute',t:1}),r0:pose({t:2.5}),f:v=>{v.vol.proche=Object.assign({},v.vol.proche,{haut:20});}})]});
  S.push({nom:'fidele pas de figure',vues:[fid({vr:pose({m:'versRoute',t:2.5}),r0:pose({t:1}),f:v=>{v.vol.proche=Object.assign({},v.vol.proche,{haut:20});}})]});
  /* secoursOn : tout meurt, S1 (retour0) se pose ; un long libre bloque ; un court qui ne meurt pas ; S2 seul ; deux vues */
  const R0=pose({m:'retour0',t:1.6}),R1=pose({m:'retour1',t:1.4,axe:.05});
  const CMD=[{volant:.21,manche:.5,nitro:true},{volant:-.33,manche:1,nitro:false}];
  S.push({nom:'secours S1',vues:[volSecours({rayons:[R0,{m:'retour1',issue:'choc',t:1,cause:'roche'}],retours:CMD})]});
  S.push({nom:'secours S2',vues:[volSecours({rayons:[{m:'retour0',issue:'air',t:2},R1],retours:CMD})]});
  S.push({nom:'secours les deux',vues:[volSecours({rayons:[R0,R1],retours:CMD})]});
  S.push({nom:'secours long libre',vues:[volSecours({vrp:'libre',rayons:[R0,R1],retours:CMD})]});
  S.push({nom:'secours courts choc',vues:[volSecours({court:'choc',rayons:[R0,R1],retours:CMD})]});
  S.push({nom:'secours deux vues',vues:[volSecours({rayons:[R0,R1],retours:CMD}),volSecours({t:40.1,ft:.6,rayons:[R0,R1],retours:CMD})]});
  return S;}

module.exports={EX,D10,copie,vueVol,vueSol,pose,solBord,volApres,volRien,volSecours,suitesPortage,suitesV4};
