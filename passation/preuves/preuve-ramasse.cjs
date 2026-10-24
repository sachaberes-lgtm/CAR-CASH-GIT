#!/usr/bin/env node
/* PREUVE DU RAMASSAGE BALAYÉ (2026-10-14, chasse aux bugs — agent ramasse-30)
   usage : node preuve-ramasse.cjs [index.html CORRIGÉ] [index.html ANCIEN]
           (défaut : ancien = la référence de la session DEBUGGING ; corrigé = la copie wt/ramasse-30)
   Sans navigateur. Le test EXTRAIT de chaque fichier le texte réel de :
     · `function pickupsTick(dt){…}` EN ENTIER (pièces, fruits, cristaux de pouvoir, grappes du ciel, pièces du fourgon et de la
       campagne : TOUT ce qui se ramasse passe par elle), `const RAM={…}`, `const RAM_K=…`, `const MAG_R=…`, `const ENG_CAP=…`, `const SPD=…`
   et l'exécute dans un bac `vm` avec des bouchons minimaux (les EFFETS du ramassage — sons, gerbes, argent — sont des compteurs vides ;
   un Vector3 de 8 méthodes). TRANSCRIT À LA MAIN (dit ici et dans le rapport) : l'ordre de la boucle (au sol `s` avance, pickupsTick,
   PUIS la caisse est posée — elle a une image de retard sur `s` ; en vol la caisse est posée AVANT pickupsTick), la hauteur des objets
   (pièce 1,3 m au-dessus du bitume, comme `place`), les jumeaux sous la dalle, et la formule du plafond de vitesse (celle de
   preuve-balayage.cjs, pour chiffrer jusqu'où monter).
   Ce qu'il vérifie (pièce posée sur la trajectoire, route droite) :
     (a) au sol, pièce PILE sur la ligne de la caisse : prise à TOUTES les vitesses jusqu'au plafond théorique, à TOUS les pas
         (1/20, 1/30, 1/60, 1/120) et toutes les phases — l'ancien code la RATE à 30 i/s au-delà d'une vitesse critique (mesurée) ;
     (b) en vol, pièce sous la trajectoire (passage à 4 m et à 9 m au-dessus) : accrochée/prise de même ;
     (c) à 60 et 120 i/s, aux vitesses où l'ancien code ne rate rien, le résultat est IDENTIQUE à l'ancien code pour tout écart
         latéral hors de la « lentille » (la mince bande où le trajet frôle la pièce entre deux images sans qu'aucune image ne la touche :
         mesurée et affichée) ;
     (d) les SAUTS de caisse (replacement à vA 26, portail, saut > 150 m) ne ramassent RIEN de ce qui est sur le segment sauté ;
     (e) jamais de pièce payée deux fois (jumeau de l'autre face), et une pièce loin de la trajectoire n'est jamais prise.
   Dernière ligne : PREUVE OK ou PREUVE KO — <cas> ; code de sortie 0 / 1. */
'use strict';
const fs=require('fs'),vm=require('vm');
const D='/Users/sachaberes/cash-car/debug';
const NEUF=process.argv[2]||D+'/wt/ramasse-30/VERSION PRINCIPALE/index.html';
const VIEUX=process.argv[3]||D+'/integ/VERSION PRINCIPALE/index.html';

// ---------- EXTRACTION PAR REPÈRES DE TEXTE (comme preuve-balayage) ----------
function finBloc(t,i0){let d=0;
  for(let i=i0;i<t.length;i++){const c=t[i],n=t[i+1];
    if(c==='/'&&n==='/'){i=t.indexOf('\n',i);if(i<0)break;continue;}
    if(c==='/'&&n==='*'){i=t.indexOf('*/',i+2)+1;continue;}
    if(c==="'"||c==='"'||c==='`'){i++;while(i<t.length&&t[i]!==c){if(t[i]==='\\')i++;i++;}continue;}
    if(c==='{')d++;else if(c==='}'){d--;if(d===0)return i+1;}}
  throw new Error('bloc non fermé');}
function unique(t,rep){const i=t.indexOf(rep);if(i<0)throw new Error('repère introuvable : '+rep);if(t.indexOf(rep,i+1)>=0)throw new Error('repère non unique : '+rep);return i;}
function fonction(t,e){const i=unique(t,e);return t.slice(i,finBloc(t,i+e.length-1));}
function ligne(t,rep){const i=unique(t,rep);let j=t.indexOf('\n',i);const k=t.indexOf('//',i);if(k>=0&&k<j)j=k;return t.slice(i,j);}
function extrait(f){const t=fs.readFileSync(f,'utf8');
  return {rd:t.indexOf('function ramD(')>=0?fonction(t,'function ramD(P,Q,ax,R){'):'',
    vf:t.indexOf('function volFaceTick(){')>=0?fonction(t,'function volFaceTick(){'):'', /* (24/10) la face du vol, sortie de pickupsTick le 20/10 : extraite elle aussi */pt:fonction(t,'function pickupsTick(dt){'),ram:ligne(t,'const RAM={'),ramK:ligne(t,'const RAM_K='),mag:ligne(t,'const MAG_R='),
    cap:ligne(t,'const ENG_CAP='),spd:+/const SPD=([0-9.]+)/.exec(t)[1],
    L:t.slice(0,t.indexOf('function pickupsTick(dt){')).split('\n').length,txt:t};}
const XN=extrait(NEUF),XV=extrait(VIEUX);
const SPD=XV.spd;

// ---------- LE PLAFOND DE VITESSE (TRANSCRIT de preuve-balayage.cjs : la traînée équilibre la poussée, puis ×vitMult ≤ 2,6) ----------
function plafonds(t){
  const NTR=+/function vitMult\(\)\{return Math\.min\(([0-9.]+),/.exec(t)[1]-1; /* (18/10) le plafond ×2,6 : NTR_BOOST_MAX est parti avec NITROOO, vitMult porte le 2,6 */
  const iC=t.indexOf('const CARS=');const mC=/maxKmh:([0-9.]+),accel:([0-9.]+)/.exec(t.slice(iC<0?0:iC));const maxKmh=+mC[1],accel=+mC[2];
  const iE=unique(t,'const ENGINE_TIERS=[');const blocE=t.slice(iE,t.indexOf('\n];',iE));const push=(blocE.match(/push:([0-9.]+)/g)||[]).map(x=>+x.slice(5));
  const P=(tier,th,nit)=>{const p=push[tier],late=1+Math.min(.5,Math.max(0,tier-8)*.035),maxSp=maxKmh/3.6*late*p,acc9=accel*late*(1+(p-1)*.6);
    return maxSp*Math.sqrt(5.8*(th+nit*p/acc9))*SPD*(1+NTR);};
  const T=push.length-1,vS=P(T,.55*2.8,30),vT=P(T,.55*1.5*2.8*1.24,48);
  return {sout:vS,theo:vT,vol:vT+(46+96*1.4*3)*push[T]*SPD};}
const PL=plafonds(XN.txt); /* (24/10, débogage sortie iOS) PÉRIMÉE puis remise à jour : le plafond se lit dans le jeu d'AUJOURD'HUI.
   Depuis le 18/10 la regex de plafonds() vise la forme neuve de vitMult (Math.min(2.6,…)) ; l'appliquer à l'ANCIEN fichier de référence
   (debug/integ du 14/10, où vitMult valait encore Math.min(1+NTR_BOOST_MAX,…)) faisait planter la preuve. Même propriété : jusqu'au plafond actuel. */

// ---------- LE BAC ----------
class V3{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
  distanceToSquared(v){const a=this.x-v.x,b=this.y-v.y,c=this.z-v.z;return a*a+b*b+c*c;} distanceTo(v){return Math.sqrt(this.distanceToSquared(v));}
  lerp(v,k){this.x+=(v.x-this.x)*k;this.y+=(v.y-this.y)*k;this.z+=(v.z-this.z)*k;return this;}
  length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);} lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
  addScaledVector(v,k){this.x+=v.x*k;this.y+=v.y*k;this.z+=v.z*k;return this;} clone(){return new V3(this.x,this.y,this.z);}}
function bac(X){
  const nop=function(){};
  const sb={Math:Math,THREE:{Vector3:V3},performance:{now:()=>0},mode:'drive',s:0,lat:0,side:1,vA:0,SPD:SPD,AIR_RATE:1,fallVel:new V3(),mult:1,
    LIGNE:{sPk:null},pickups:[],pwrMagT:0,engTier:0,lastNearS:0,curNear:null,curHOff:0,THICK:2.6,fallStartSide:1,carGroup:{position:new V3()},
    scene:{remove:nop},pwrPrend:nop,FRUIT_DEFS:[{boost:1,n:'x'}],ENGINE_TIERS:[{res:2}],nitroX:0,LIVRE:{on:false},livre:nop,SONV2:false,sfx:nop,
    volgNitro:()=>true,nbPrend:nop,RUNX:{fruits:0,coins:0},hap:nop,SENS:false,REDUCED_MOTION:true,sensCoup:nop,fruitCroque:nop,trickMsg:nop,
    sparkBurst:nop,sparkGold:{},sparkBlue:{},FLOW:{lv:0},combo:0,comboT:0,chaineAura:nop,addCoins:nop,flowAdd:nop,coinSerie:nop,SCOUP:{ht:0},
    sensHap:nop,ECO3:{recolte:2.5},denom:()=>1,fever:0,flowMult:()=>1,money:0,levelCash:0,blip:nop,addStyle:nop,frenCash:nop,checkUpgrade:nop,shake:0};
  sb.vitMult=function(){return sb.mult;};
  /* (24/10, débogage sortie iOS) ce que pickupsTick appelle de plus depuis le 14/10 : les horloges des auras et décors des fruits-pouvoirs
     (ninfTick … raisinTick), la spirale de l'aimant, le jeton du FINAL SPIN, le « +1 » et le compteur de fruits des missions : des EFFETS,
     bouchonnés vides comme les autres. La face du vol (volFaceTick) est le VRAI code, extrait avec ses réglages (sans radar ici : curNear nul). */
  for(const k of ['ninfTick','fauraGlobalTick','dragonDecor','zapTick','raisinTick','magSpirale','spinPrend','m2Fruit','piece1Plus'])sb[k]=nop;
  Object.assign(sb,{VOLF:{m:0,h:0},curLatOff:0,ROAD_HALF:6});
  vm.createContext(sb);
  vm.runInContext(X.ram+';\n'+X.ramK+';\n'+X.mag+';\n'+X.cap+';\n'+X.rd+'\n'+X.vf+'\n'+X.pt+'\n;globalThis.__RAM=RAM;globalThis.__f=pickupsTick;',sb);
  return sb;}
const BV=bac(XV),BN=bac(XN);

// une pièce (et son jumeau sous la dalle) — `place` : 1,3 m au-dessus du bitume, la route file le long de +z, b = +x
// h = hauteur de l'objet au-dessus du bitume : pièce 1,3 (place), cristal 2,1 (spawnPickups), fruit ≥ 1,3 (fruitLeve ; 3 m = un gros fruit, supposé)
function piece(so,lo,air,h){h=h||1.3;const m=new V3(lo,air?air:h,so),m2=new V3(lo,-(2.6+h),so);
  const a={s:so,lat:lo,face:1,nitro:false,fruit:-1,mesh:{position:m},taken:false,air:!!air,ax:{x:0,y:1,z:0}},b={s:so,lat:lo,face:-1,nitro:false,fruit:-1,mesh:{position:m2},taken:false,ax:{x:0,y:-1,z:0}};
  return air?[a]:[a,b];}
function raz(sb){const R=sb.__RAM;R.ok=false;R.p0.set(0,0,0);sb.LIGNE.sPk=null;sb.pickups.length=0;sb.pwrMagT=0;sb.engTier=0;}

/* AU SOL — l'ordre réel de la boucle : `s` avance (vA·SPD·vitMult·dt), pickupsTick(dt), puis la caisse est posée sur (s, lat).
   V = vitesse MONDE (m/s) ; la caisse vise un écart latéral dl de la pièce ; phi = la phase de la pièce dans le pas d'une image. */
function essaiSol(sb,V,dt,phi,dl,mag,h){
  raz(sb);sb.mode='drive';sb.side=1;sb.mult=V>400?2.6:1;sb.vA=V/(SPD*sb.mult);if(mag)sb.engTier=15;
  const pas=V*dt,so=1000;sb.pickups.push(...piece(so,0,0,h));
  sb.lat=dl;sb.s=so-60-(1+phi)*pas;sb.carGroup.position.set(sb.lat,0,sb.s);
  for(let i=0;i<4000;i++){sb.s+=pas;sb.__f(dt);sb.carGroup.position.set(sb.lat,0,sb.s);if(sb.s>so+80+3*pas)break;}
  return (sb.pickups[0].taken?1:0)+(sb.pickups[1].taken?10:0);}
/* EN VOL — la caisse est posée AVANT pickupsTick ; elle passe à h m au-dessus de la pièce (vol rasant) */
function essaiVol(sb,V,dt,phi,h,dl){
  raz(sb);sb.mode='fall';sb.side=1;sb.fallStartSide=1;sb.fallVel.set(0,0,V/SPD);
  const pas=V*dt,so=1000;sb.pickups.push(...piece(so,0));
  let z=so-80-(1+phi)*pas;sb.carGroup.position.set(dl,1.3+h,z);
  for(let i=0;i<4000;i++){z+=pas;sb.carGroup.position.set(dl,1.3+h,z);sb.lastNearS=z;sb.s=z;sb.__f(dt);if(z>so+120+3*pas)break;}
  // laisse finir une accroche
  for(let i=0;i<40;i++){sb.__f(dt);}
  return (sb.pickups[0].taken?1:0)+(sb.pickups[1].taken?10:0);}

const KO=[];const ko=m=>KO.push(m);const kmh=v=>Math.round(v*3.6);
const DTS=[[1/20,'1/20'],[1/30,'1/30'],[1/60,'1/60'],[1/120,'1/120']];
const VITS=[30,60,100,150,200,250,300,350,400,450,500,550,Math.round(PL.sout),Math.round(PL.theo)];
const PH=n=>{const a=[];for(let i=0;i<n;i++)a.push((i+.37)/n);return a;};
console.log('pickupsTick : neuf l.'+XN.L+' ('+NEUF.replace(D+'/','')+') · ancien l.'+XV.L+' ('+VIEUX.replace(D+'/','')+')');
console.log('plafonds (formule transcrite) : sol soutenu '+kmh(PL.sout)+' km/h · théorique '+kmh(PL.theo)+' km/h · vol '+kmh(PL.vol)+' km/h');

// ---- (a) AU SOL, pièce pile sur la ligne ----
console.log('\n(a) AU SOL, pièce sur la ligne (écart 0) — pièces RATÉES / phases, ancien → neuf');
console.log('vitesse'.padEnd(22)+DTS.map(d=>d[1].padEnd(22)).join(''));
const crit={};
for(const [mag,h,nm] of [[0,1.3,''],[1,1.3,' A'],[0,2.1,' CR'],[0,3,' F3']])for(const V of VITS){let l=(V+' m/s · '+kmh(V)+' km/h'+nm).padEnd(24);
  for(const d of DTS){const ph=PH(24);let rv=0,rn=0,dbl=0;
    for(const p of ph){const a=essaiSol(BV,V,d[0],p,0,mag,h),b=essaiSol(BN,V,d[0],p,0,mag,h);if(!(a&1))rv++;if(!(b&1))rn++;if(b>=10)dbl++;}
    if(rv&&!crit[d[1]+nm])crit[d[1]+nm]=V;
    if(rn)ko('(a) neuf rate un objet sur la ligne · '+d[1]+' · '+kmh(V)+' km/h'+nm+' : '+rn+'/'+ph.length);
    if(dbl)ko('(e) jumeau payé · '+d[1]+' · '+kmh(V));
    l+=((rv+' → '+rn)+' ('+(V*d[0]).toFixed(1)+' m)').padEnd(22);}
  console.log(l);}
console.log('(A = aimant moteur, CR = cristal à 2,1 m, F3 = fruit à 3 m) — vitesse à partir de laquelle l\'ANCIEN code rate, dans la grille :');
for(const nm of ['',' A',' CR',' F3'])console.log('  objet'+nm+' : '+DTS.map(d=>d[1]+' '+(crit[d[1]+nm]?kmh(crit[d[1]+nm])+' km/h':'jamais')).join(' · '));
const preuveKO=!!crit['1/30']&&crit['1/30']<=550;
/* (24/10, débogage sortie iOS) la référence « ancienne » par défaut (debug/integ, 14/10 13 h 20) contient DÉJÀ le correctif (ramD) :
   elle ne rate plus rien, et la preuve d'origine elle-même (b4960019) le constate sur ce fichier. Le contrôle « l'ancien rate » ne vaut
   donc que si l'on passe en 2e argument un index.html d'AVANT le correctif (sans ramD) ; sinon on le dit, sans KO. Tout ce qui juge le
   jeu d'aujourd'hui — (a) prises au sol, (b) en vol, (c) jamais moins que la référence, (d) sauts muets, (e) ni jumeau ni prise lointaine —
   reste vérifié en entier. */
const vieuxCorrige=!!XV.rd;
if(!preuveKO&&!vieuxCorrige)ko('(a) l\'ANCIEN code ne rate rien à 1/30 jusqu\'à 1 980 km/h : la preuve ne prouve rien');
if(!preuveKO&&vieuxCorrige)console.log('NOTE : la référence ancienne contient déjà ramD (corrigée) — « l\'ancien rate » non démontrable ici, (c) compare au correctif du 14/10');

// ---- (b) EN VOL (accroche 11 m, prise 3,8 m) ----
console.log('\n(b) EN VOL, passage à h au-dessus de la pièce (axe), RATÉES / phases, ancien → neuf');
const VV=[150,300,450,550,Math.round(PL.theo),Math.round(PL.vol)];
for(const h of [2,6,9])for(const V of VV){let l=('h '+h+' m · '+kmh(V)+' km/h').padEnd(22);
  for(const d of DTS){const ph=PH(16);let rv=0,rn=0;
    for(const p of ph){if(!(essaiVol(BV,V,d[0],p,h,0)&1))rv++;if(!(essaiVol(BN,V,d[0],p,h,0)&1))rn++;}
    if(rn&&V<=556)ko('(b) neuf rate en vol · h '+h+' · '+d[1]+' · '+kmh(V)+' km/h : '+rn+'/'+ph.length);
    l+=((rv+' → '+rn)+' ('+(V*d[0]).toFixed(1)+' m)').padEnd(22);}
  console.log(l);}

// ---- (c) 60 / 120 i/s : identique hors de la lentille ----
console.log('\n(c) 60 et 120 i/s : écarts latéraux 0 → 6 m (pas 5 cm), différences ancien / neuf');
let bandeMax=0,diffs=0,tot=0;
const corde=2*Math.sqrt(3.8*3.8-1.3*1.3);
for(const d of [[1/60,'1/60'],[1/120,'1/120']])for(const V of [60,100,150,200,250,300,350,400,425,450,500,550]){let dV=0,mV=0,mn=9;
  for(let k=0;k<=120;k++){const dl=k*.05;for(const p of PH(6)){tot++;
    const a=essaiSol(BV,V,d[0],p,dl,0)&1,b=essaiSol(BN,V,d[0],p,dl,0)&1;
    if(a&&!b)ko('(c) neuf PERD une pièce que l\'ancien prenait · '+d[1]+' · '+kmh(V)+' km/h · écart '+dl.toFixed(2));
    if(a!==b){if(V*d[0]<=corde)ko('(c) différence sous la corde dans l\'axe · '+d[1]+' · '+kmh(V)+' km/h · écart '+dl.toFixed(2));diffs++;dV++;mV=Math.max(mV,dl);mn=Math.min(mn,dl);bandeMax=Math.max(bandeMax,dl);}}}
  console.log('  '+d[1]+' · '+kmh(V)+' km/h ('+(V*d[0]).toFixed(1)+' m/image) : '+dV+' différences'+(dV?' (écarts '+mn.toFixed(2)+' → '+mV.toFixed(2)+' m)':''));}
// la lentille : la plus grande prise latérale de l'ancien à 60 i/s (sur les mêmes cas) — le neuf peut aller jusqu'au rayon effectif
console.log('cas comparés '+tot+' · différences '+diffs+' (toutes : le NEUF prend, l\'ancien pas) — identique tant que le pas d\'une image ≤ la corde dans l\'axe ('+corde.toFixed(2)+' m : 60 i/s ≤ '+kmh(corde*60)+' km/h, 120 i/s ≤ '+kmh(corde*120)+' km/h)');
for(const [V,dt9,nd] of [[300,1/60,'1/60'],[500,1/60,'1/60'],[300,1/30,'1/30'],[500,1/30,'1/30']]){let rV=0,rN=0;for(let k=0;k<=140;k++){const dl=k*.05;if(PH(6).some(p=>essaiSol(BV,V,dt9,p,dl,0)&1))rV=dl;if(PH(6).some(p=>essaiSol(BN,V,dt9,p,dl,0)&1))rN=dl;}
console.log('  portée latérale (attraction d\'origine comprise) à '+kmh(V)+' km/h, '+nd+' : ancien '+rV.toFixed(2)+' m · neuf '+rN.toFixed(2)+' m');}

// ---- (d) SAUTS : replacement, portail, saut de 150 m ----
console.log('\n(d) sauts de caisse au-dessus d\'une pièce (rien ne doit être pris)');
function saut(sb,de,a,vA9,mode9){raz(sb);sb.mode=mode9||'drive';sb.side=1;sb.mult=1;sb.vA=vA9;sb.fallVel.set(0,0,vA9);sb.pickups.push(...piece(1000,0));
  sb.s=1000+de;sb.carGroup.position.set(0,0,1000+de);sb.__f(1/30);sb.__f(1/30); // la caisse posée avant la pièce, deux images
  sb.s=1000+a;sb.lastNearS=sb.s;sb.__f(1/30);sb.carGroup.position.set(0,0,1000+a);sb.__f(1/30);sb.__f(1/30);
  return sb.pickups[0].taken;}
const S=[['replacement (vA 26) de −40 m à +8 m',-40,8,26],['replacement (vA 26) de −12 m à +5 m',-12,5,26],['portail : vA 300, −400 → +12 m',-400,12,300],
  ['saut de 160 m, vA 400',-80,80,400],['vol : replacement en l\'air de −30 → +6 m, vit. 26',-30,6,26,'fall']];
for(const c of S){const a=saut(BV,c[1],c[2],c[3],c[4]),b=saut(BN,c[1],c[2],c[3],c[4]);console.log('  '+c[0].padEnd(54)+'ancien '+(a?'PRISE':'rien')+' · neuf '+(b?'PRISE':'rien'));
  if(b)ko('(d) saut qui ramasse : '+c[0]);}

// ---- (e) loin de la trajectoire : jamais ----
let loin=0;for(const d of DTS)for(const V of VITS)for(const p of PH(6))if(essaiSol(BN,V,d[0],p,12,1)&1)loin++;
console.log('\n(e) pièce à 12 m de la ligne (hors de l\'attraction d\'origine, 9 + 2 m avec l\'aimant moteur) : prises par le neuf = '+loin);
if(loin)ko('(e) pièce prise hors de portée : '+loin);

console.log('\n'+(KO.length?'PREUVE KO — '+KO.slice(0,6).join(' | ')+(KO.length>6?' … (+'+(KO.length-6)+')':''):'PREUVE OK — '+(preuveKO?'ancien KO à 1/30 dès '+kmh(crit['1/30'])+' km/h (cristal/gros fruit dès '+kmh(crit['1/30 CR'])+')':'référence ancienne déjà corrigée')+' · neuf OK à 20/30/60/120 i/s au sol jusqu\'au plafond théorique '+kmh(PL.theo)+' km/h, en vol jusqu\'à 2 000 km/h (au-delà de ~5 000 km/h par image de 70 m le pré-filtre de vol coupe : inatteignable) · 60/120 i/s identiques jusqu\'à 1 543 / 3 085 km/h · sauts muets'));
process.exit(KO.length?1:0);
