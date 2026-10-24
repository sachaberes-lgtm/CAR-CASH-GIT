#!/usr/bin/env node
/* (24/10, débogage sortie iOS) SANS OBJET : les deux systèmes balayés — le trafic de l'heure de pointe (traficTick, VILLE 9) et la pluie
   de satellites (satHard, SATOB, 6e niveau) — appartenaient à la CARRIÈRE, retirée du jeu par 48eaef5d (18/10, « Allègement B (carrière) :
   la carrière, ses niveaux, ses écrans et ses systèmes retirés du jeu ») ; JOURNAL : « PLUS DE CARRIÈRE + PLUS DE MODE FACILE, POUR LA
   SORTIE (2026-10-14, Sacha … « on le fera dans des MAJ, donc garde-le dans le git quelque part ») ». Le fichier est gardé : si la
   carrière revient (un des repères réapparaît), la preuve d'origine se rejoue telle quelle. */
/* PREUVE DU BALAYAGE DES CHOCS (2026-10-14, chasse aux bugs — agent preuve-balayage)
   usage : node preuve-balayage.cjs [chemin index.html]        (défaut : la référence de la session DEBUGGING)
   Sans navigateur. Le test EXTRAIT du fichier du jeu le texte réel de :
     · `function traficTick(dt,sp){…}` EN ENTIER (le trafic de l'heure de pointe, VILLE 9), avec `const VTR_F`, `const VTR_T` ;
     · `function satHard(){…}` EN ENTIER (la pluie de satellites), avec `const SATOB=…` ;
     · les deux lignes de `pose0` qui fabriquent la BOÎTE d'un satellite (hw, hu, ht, R2) ; `const SPD`, `NTR_BOOST_MAX`, CARS[0], ENGINE_TIERS.
   et les exécute dans un bac `vm` avec des bouchons minimaux (explode, traficChoc, frole, sparkBurst, un Vector3 de 6 méthodes…).
   TRANSCRIT À LA MAIN (dit ici, et dans le rapport) : l'orientation W/U/T d'un satellite (2 lignes de pose0), le bouchon de traficChoc
   (c.fly, vA×.62, VC.gel) et la formule de la vitesse terminale au sol (pour chiffrer le plafond de vitesse).
   Ce qu'il vérifie, pour chaque système, sur une grille pas de temps × vitesse × phase sous-pas × trajectoire :
     (a) le plan médian de l'obstacle franchi DANS la boîte (dont le plein axe) → choc TOUJOURS, à tous les pas ;
     (b) trajectoire dont la droite ne coupe pas la boîte → JAMAIS de choc ;
     (c) hors de la « bande de coin » (la droite écorne la boîte sans franchir son plan médian dedans), le verdict ne dépend ni du pas ni
         de la phase ; dans la bande il peut en dépendre : la bande est MESURÉE et affichée (c'est la tolérance du bord) ;
     (d) sauts de position (relance, portail, reprise après vol / répit / explosion) → aucun choc fantôme ;
     (e) l'ANCIEN code (git show 0c1ecee, sinon le correctif retiré du texte) rate bien le plein axe à 1/30 — sinon la preuve ne prouve rien.
   Dernière ligne : PREUVE OK ou PREUVE KO — <cas> ; code de sortie 0 / 1. */
'use strict';
const fs=require('fs'),vm=require('vm'),cp=require('child_process');
const REF='/Users/sachaberes/cash-car/debug/integ/VERSION PRINCIPALE/index.html',DEPOT='/Users/sachaberes/cash-car/debug/integ',ANCIEN='0c1ecee';
const fichier=process.argv[2]||REF;
const src=fs.readFileSync(fichier,'utf8');
if(src.indexOf('function satHard(){')<0&&src.indexOf('function traficTick(dt,sp){')<0){
  console.log('PREUVE SANS OBJET — ni traficTick (trafic de VILLE 9) ni satHard (pluie de satellites) dans '+fichier+' : la carrière a été retirée (48eaef5d, 18/10)');
  process.exit(0);}

// ---------- EXTRACTION PAR REPÈRES DE TEXTE ----------
function finBloc(t,i0){ // i0 = l'accolade ouvrante ; rend l'index APRÈS l'accolade fermante (commentaires et chaînes sautés)
  let d=0;
  for(let i=i0;i<t.length;i++){const c=t[i],n=t[i+1];
    if(c==='/'&&n==='/'){i=t.indexOf('\n',i);if(i<0)break;continue;}
    if(c==='/'&&n==='*'){i=t.indexOf('*/',i+2)+1;continue;}
    if(c==="'"||c==='"'||c==='`'){i++;while(i<t.length&&t[i]!==c){if(t[i]==='\\')i++;i++;}continue;}
    if(c==='{')d++;else if(c==='}'){d--;if(d===0)return i+1;}}
  throw new Error('bloc non fermé');
}
function unique(t,rep){const i=t.indexOf(rep);if(i<0)throw new Error('repère introuvable : '+rep);if(t.indexOf(rep,i+1)>=0)throw new Error('repère non unique : '+rep);return i;}
function fonction(t,entete){const i=unique(t,entete);return t.slice(i,finBloc(t,i+entete.length-1));}
function ligne(t,rep){const i=unique(t,rep);let j=t.indexOf('\n',i);if(j<0)j=t.length;return t.slice(i,j);}
function nLigne(t,rep){return t.slice(0,t.indexOf(rep)).split('\n').length;}
function extrait(t){
  const X={};
  X.satob=ligne(t,'const SATOB={');X.satHard=fonction(t,'function satHard(){');
  X.trafic=fonction(t,'function traficTick(dt,sp){');X.vtrF=ligne(t,'const VTR_F=[');X.vtrT=ligne(t,'const VTR_T=[');
  X.boite=ligne(t,'const hw=(k===0?rad:rad*.8)');X.pousse=ligne(t,'SATOB.list.push({');
  {const i=unique(t,'SATOB.list.length=0;SATOB.on=false;');let j=t.indexOf('//',i);const n=t.indexOf('\n',i);if(j<0||j>n)j=n;X.rebati=t.slice(i,j);}
  X.L={satHard:nLigne(t,'function satHard(){'),trafic:nLigne(t,'function traficTick(dt,sp){'),rebati:nLigne(t,'SATOB.list.length=0;SATOB.on=false;')};
  return X;
}
const X=extrait(src);
function constantes(t){
  const K={};
  K.SPD=+/const SPD=([0-9.]+)/.exec(t)[1];
  K.NTR=+/function vitMult\(\)\{return Math\.min\(([0-9.]+),/.exec(t)[1]-1; /* (18/10) le plafond ×2,6 : NTR_BOOST_MAX est parti avec NITROOO, vitMult porte le 2,6 */
  const iC=t.indexOf('const CARS=');const mC=/maxKmh:([0-9.]+),accel:([0-9.]+)/.exec(t.slice(iC<0?0:iC));K.maxKmh=+mC[1];K.accel=+mC[2];
  const iE=unique(t,'const ENGINE_TIERS=[');const blocE=t.slice(iE,t.indexOf('\n];',iE));K.push=(blocE.match(/push:([0-9.]+)/g)||[]).map(function(x){return +x.slice(5);});
  return K;
}
const K=constantes(src),SPD=K.SPD,MULT=1+K.NTR;
/* LE PLAFOND DE VITESSE (formule de la boucle, branche 'drive', TRANSCRITE) : la traînée vA²·acc9/(maxSp²·5,8) équilibre la poussée
   acc9·.55·(pad ? 1,5 : 1)·élan(≤ 2,8)·(1 + .06·flow) + nitro(30 ; 48 en réserve bleue)·push — puis l'avance du monde = vA·SPD·vitMult (≤ ×2,6). */
function plafond(tier,th,nit){const p=K.push[tier],late=1+Math.min(.5,Math.max(0,tier-8)*.035),maxSp=K.maxKmh/3.6*late*p,acc9=K.accel*late*(1+(p-1)*.6);
  return maxSp*Math.sqrt(5.8*(th+nit*p/acc9))*SPD*MULT;}
const TMAX=K.push.length-1,V_SOUT=plafond(TMAX,.55*2.8,30),V_THEO=plafond(TMAX,.55*1.5*2.8*1.24,48),
      V_VOL=V_THEO+(46+96*1.4*3)*K.push[TMAX]*SPD; // en vol : l'éjection + le coup de réacteur (46) + 3 s de réacteur bleu (96 × 1,4), rien ne freine
const VITS=[5,30,90,150,220,300,450,700,1000,1400,Math.round(V_SOUT),Math.round(V_THEO)];
const DTS=[[1/20,'1/20'],[1/30,'1/30'],[1/60,'1/60'],[1/120,'1/120']];
const NPH=50,MARGE=.01;
function phases(pas){const n=pas>.25?NPH:6,a=[];for(let i=0;i<n;i++)a.push((i+.371)/n);return a;}

// ---------- LES BOUCHONS ----------
class V3{constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;} length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);}
  addScaledVector(v,k){this.x+=v.x*k;this.y+=v.y*k;this.z+=v.z*k;return this;} clone(){return new V3(this.x,this.y,this.z);}}
const v3=function(x,y,z){return new V3(x,y,z);},comb=function(){const r=new V3();for(let i=0;i<arguments.length;i+=2)r.addScaledVector(arguments[i],arguments[i+1]);return r;},
      unit=function(v){const l=v.length();return v3(v.x/l,v.y/l,v.z/l);},croix=function(a,b){return v3(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);};
function bacSat(code){
  const sb={Math:Math,THREE:{Vector3:V3},ORB:{actif:true},started:true,gameOver:false,mode:'drive',graceT:0,carGroup:{position:new V3()},shake:0,
    sparkGold:{},sparkBurst:function(){},vA:0,SPD:SPD,fallVel:new V3(),mult:1,nBoom:0,nFrole:0};
  sb.vitMult=function(){return sb.mult;};sb.explode=function(c){sb.nBoom++;sb.cause=c;};sb.frole=function(){sb.nFrole++;};
  vm.createContext(sb);vm.runInContext(code.satob+'\n'+code.satHard+'\n;globalThis.__S=SATOB;globalThis.__f=satHard;',sb);return sb;
}
function bacTrafic(code){
  const im=function(){return {count:0,instanceMatrix:{},instanceColor:null,setMatrixAt:function(){},setColorAt:function(){}};};
  const sb={Math:Math,mode:'drive',side:1,s:0,lat:0,vA:0,SPD:SPD,L:1e9,THICK:2.6,mult:1,VC:{gel:0},CITY:{uT:{value:0}},VQ:{setFromEuler:function(){return this;}},
    VF:{p:new V3(),b:new V3(),n:new V3(),t:new V3()},VM4:{},VV1:new V3(),VV2:new V3(),VZ:{bouchons:[]},
    VTR:{on:true,klaxT:0,o:{},o2:{},cars:[],N:0,im:im(),imL:im(),cl:im(),eu:{set:function(){return this;}},col:{setHex:function(){return this;}},du:{mesh:{position:new V3()}},chocN:0,froN:0},
    nChoc:0,nFrole:0,nKlax:0};
  sb.vitMult=function(){return sb.mult;};sb.frameAt=function(){};sb.traficLibre=function(){return false;};sb.klaxon=function(){sb.nKlax++;};sb.vChip=function(){};sb.TR=function(x){return x;};
  sb.frole=function(){sb.nFrole++;};
  sb.traficChoc=function(c,dl){sb.nChoc++;c.fly=1.7;sb.vA*=.62;sb.VC.gel=.3;c.vel=new V3();c.p=new V3();c.q={multiply:function(){}};c.w=new V3();}; // (transcrit) les effets de jeu du vrai traficChoc
  vm.createContext(sb);vm.runInContext(code.vtrF+'\n'+code.vtrT+'\n'+code.trafic+'\n;globalThis.__f=traficTick;globalThis.__F=VTR_F;globalThis.__T=VTR_T;',sb);return sb;
}

// ---------- L'ORACLE : la droite du trajet contre la boîte (tranches) ----------
function droiteCoupe(c0,dv,h,m){let lo=-Infinity,hi=Infinity;
  for(let i=0;i<c0.length;i++){const H=h[i]+m;if(Math.abs(dv[i])<1e-12){if(Math.abs(c0[i])>=H)return false;}
    else{let a=(-H-c0[i])/dv[i],b=(H-c0[i])/dv[i];if(a>b){const t=a;a=b;b=t;}if(a>lo)lo=a;if(b<hi)hi=b;}}
  return lo<hi;}
function classe(c0,dv,h){ // axe 0 = le long (plan médian = 0). 'dedans' : plan médian franchi dans la boîte · 'dehors' : la droite ne coupe pas la boîte · 'coin' : le reste
  const k=-c0[0]/dv[0];let ok=true,ecart=0;for(let i=1;i<c0.length;i++){const v=Math.abs(c0[i]+dv[i]*k);if(v>=h[i]-MARGE)ok=false;ecart=Math.max(ecart,v-h[i]);}
  if(ok)return {c:'dedans',e:ecart};if(!droiteCoupe(c0,dv,h,MARGE))return {c:'dehors',e:ecart};return {c:'coin',e:ecart};}

// ---------- LA TABLE DES RÉSULTATS ----------
function Table(){this.m=new Map();}
Table.prototype.note=function(dt,V,cl,axe,choc,frole,bande){const k=dt+'|'+V;let r=this.m.get(k);
  if(!r)this.m.set(k,r={dt:dt,V:V,axe:[0,0],dedans:[0,0],coin:[0,0],dehors:[0,0],fr:[0,0],bande:0});
  r[cl][0]++;r[cl][1]+=choc;if(axe){r.axe[0]++;r.axe[1]+=choc;}if(frole>=0){r.fr[0]++;r.fr[1]+=frole;}if(cl==='coin'&&bande>r.bande)r.bande=bande;};
Table.prototype.somme=function(filtre){const t={axe:[0,0],dedans:[0,0],coin:[0,0],dehors:[0,0],fr:[0,0],bande:0};
  for(const r of this.m.values())if(filtre(r)){for(const c of ['axe','dedans','coin','dehors','fr']){t[c][0]+=r[c][0];t[c][1]+=r[c][1];}t.bande=Math.max(t.bande,r.bande);}return t;};
const pct=function(a){return a[0]?(100*a[1]/a[0]).toFixed(1)+' %':'—';},col=function(x,n){x=String(x);return x.length>=n?x:x+' '.repeat(n-x.length);};
const KO=[];function ko(m){KO.push(m);}
function affiche(nom,T,lesDts,vits){
  console.log('\n'+nom+' — par pas de temps (toutes vitesses, toutes phases)');
  console.log(col('pas',7)+col('plein axe : chocs',24)+col('dedans : chocs',26)+col('dehors : chocs',22)+col('bande de coin : chocs',30)+'frôlés payés (dehors, < seuil)');
  for(const d of lesDts){const t=T.somme(function(r){return r.dt===d[1];});
    console.log(col(d[1],7)+col(t.axe[1]+' / '+t.axe[0],24)+col(t.dedans[1]+' / '+t.dedans[0],26)+col(t.dehors[1]+' / '+t.dehors[0],22)+col(t.coin[1]+' / '+t.coin[0]+' ('+pct(t.coin)+')',30)+pct(t.fr));}
  console.log(nom+' — par vitesse (m/s monde ; km/h compteur ; m parcourus par image) : « dedans » MANQUÉS / « dehors » TOUCHÉS');
  console.log(col('vitesse',22)+lesDts.map(function(d){return col(d[1],28);}).join(''));
  for(const V of vits){let l=col(V+' m/s · '+Math.round(V*3.6)+' km/h',22);
    for(const d of lesDts){const r=T.m.get(d[1]+'|'+V);l+=col(r?(V*d[0]).toFixed(1)+' m : '+(r.dedans[0]-r.dedans[1])+' / '+r.dehors[1]+'  ('+r.dedans[0]+'+'+r.dehors[0]+')':'—',28);}
    console.log(l);}
}
function juge(nom,T,lesDts){
  for(const r of T.m.values()){const pas=(r.V*r.dt_).toFixed(1);
    if(r.axe[1]<r.axe[0])ko(nom+' · (a) plein axe · pas '+r.dt+' · '+r.V+' m/s ('+Math.round(r.V*3.6)+' km/h, '+pas+' m par image) : '+(r.axe[0]-r.axe[1])+' / '+r.axe[0]+' traversées');
    else if(r.dedans[1]<r.dedans[0])ko(nom+' · (a) plan médian franchi dans la boîte · pas '+r.dt+' · '+r.V+' m/s ('+pas+' m par image) : '+(r.dedans[0]-r.dedans[1])+' / '+r.dedans[0]+' traversées');
    if(r.dehors[1]>0)ko(nom+' · (b) FAUX POSITIF · pas '+r.dt+' · '+r.V+' m/s : '+r.dehors[1]+' chocs hors de la boîte');}
}

// ====================================================================================================================
// 1 · LA PLUIE DE SATELLITES — satHard
// ====================================================================================================================
const REP=(function(){const t=unit(v3(.6,.2,.77)),n0=v3(.1,1,.05),n=unit(comb(n0,1,t,-n0.dot(t))),b=croix(n,t);return {t:t,n:n,b:b,p:v3(1840,212,-960)};})(); // un repère de route quelconque (b = n × t, comme frameAt)
const fabBoite=new Function('k','rad','s9','la','q','W','U','Tt','haut',X.boite+'\nconst SATOB={list:[]};\n'+X.pousse+'\nreturn SATOB.list[0];'); // le TEXTE de pose0 : hw, hu, ht, R2
function satellite(k,rad,al,be,la,h,haut){ // (transcrit de pose0) k = 0 : panneau en travers, penché de al autour de la route · k = 1 : étage couché, de biais de be
  const ca=Math.cos(al),sa=Math.sin(al),cb=Math.cos(be),sb=Math.sin(be);let W,U,T;
  if(k===0){W=comb(REP.b,ca,REP.n,sa);U=comb(REP.n,ca,REP.b,-sa);T=REP.t.clone();}else{W=comb(REP.b,cb,REP.t,sb);U=REP.n.clone();T=comb(REP.t,cb,REP.b,-sb);}
  const q=comb(REP.p,1,REP.b,la,REP.n,h),o=fabBoite(k,rad,1000,la,q,unit(W),unit(U),unit(T),haut);o.__la=la;o.__h=h;o.__Xs=Math.sqrt(o.R2)+8;return o;}
const SATS=[['panneau 14 m penché 8°',satellite(0,7,.14,0,3,1.15,false)],['panneau 20 m penché −28°',satellite(0,10,-.49,0,-5,1.15,false)],
            ['étage 10 m biais +17°',satellite(1,6,0,.3,2,6*.24+.3,false)],['étage 14 m biais −14°',satellite(1,9,0,-.25,-4,9*.24+.3,false)],
            ['panneau EN L\'AIR 16 m penché 29°',satellite(0,8,.5,0,6,12,true)]];
function trajetsSat(o){ // [psi, piqué, hauteur de passage, écart latéral d, en vol ?] — sol : la caisse roule (n = 0), cap dans l'axe ou de travers ; vol : elle arrive en descendant
  const L=[],hw=o.hw,lin=function(a,b,n){const r=[0];for(let i=0;i<n;i++)r.push(a+(b-a)*i/(n-1));return r;};
  if(!o.haut){for(const psi of [0,.2,-.2])for(const d of lin(-hw-7,hw+7,20))L.push([psi,0,0,d,false]);
    for(const pq of [-.25,-.8])for(const hc of [o.__h,o.__h+2.5])for(const d of lin(-hw-5,hw+5,9))L.push([0,pq,hc,d,true]);}
  else for(const pq of [0,-.25])for(const psi of [0,.2])for(const hc of [o.__h,o.__h+1.8])for(const d of lin(-hw-5,hw+5,9))L.push([psi,pq,hc,d,true]);
  return L;}
function geoSat(o,tr){const C=comb(REP.p,1,REP.b,o.__la+tr[3],REP.n,tr[2]),D=unit(comb(REP.t,1,REP.b,Math.tan(tr[0]),REP.n,Math.tan(tr[1])));
  const r=v3(C.x-o.q.x,C.y-o.q.y,C.z-o.q.z),c0=[r.dot(o.T),r.dot(o.W),r.dot(o.U)],dv=[D.dot(o.T),D.dot(o.W),D.dot(o.U)],cl=classe(c0,dv,[o.ht,o.hw,o.hu]);
  const k=-c0[0]/dv[0],a=Math.abs(c0[1]+dv[1]*k),u=Math.abs(c0[2]+dv[2]*k);
  return {C:C,D:D,cl:cl.c,ecart:cl.e,frole:cl.c==='dehors'&&u<o.hu+1.2&&a>o.hw&&a<o.hw+3.2,axe:!tr[4]&&tr[0]===0&&tr[3]===0};}
function essaiSat(sb,o,G,V,dt,phi,vol){
  const S=sb.__S,P=sb.carGroup.position,pas=V*dt,Xs=o.__Xs,x0=-Xs-(1+phi)*pas,C=G.C,D=G.D;
  o.fait=false;o.pres=0;o.min=99;S.pv=false;S.on=true;sb.nBoom=0;sb.nFrole=0;sb.graceT=0;sb.gameOver=false;sb.started=true;
  if(vol){sb.mode='fall';sb.vA=0;sb.mult=1;sb.fallVel.set(D.x*V/SPD,D.y*V/SPD,D.z*V/SPD);}else{sb.mode='drive';sb.mult=V>500?MULT:1;sb.vA=V/(SPD*sb.mult);sb.fallVel.set(0,0,0);}
  for(let i=0;;i++){const x=x0+i*pas;if(x>Xs+2*pas)break;P.set(C.x+D.x*x,C.y+D.y*x,C.z+D.z*x);sb.__f();if(sb.nBoom)return 1;}
  return 0;}
function grilleSat(code,T,seulementAxe,lesDts){
  const sb=bacSat(code);let n=0;
  for(const so of SATS){const o=so[1];sb.__S.list.length=0;sb.__S.list.push(o);
    for(const tr of trajetsSat(o)){const G=geoSat(o,tr);if(seulementAxe&&!G.axe)continue;
      for(const V of (tr[4]?VITS.concat([Math.round(V_VOL)]):VITS))for(const d of lesDts)for(const phi of phases(V*d[0])){
        const c=essaiSat(sb,o,G,V,d[0],phi,tr[4]);n++;T.note(d[1],V,G.cl,G.axe,c,G.frole?(sb.nFrole>0?1:0):-1,G.ecart);}}}
  for(const r of T.m.values())r.dt_=DTS.filter(function(d){return d[1]===r.dt;})[0][0];
  return n;}
function sautsSat(code){ // (d) les sauts de position : aucun choc fantôme
  const sb=bacSat(code),S=sb.__S,o=SATS[0][1],G=geoSat(o,[0,0,0,0,false]),P=sb.carGroup.position,R=[];
  const pose=function(x){P.set(G.C.x+G.D.x*x,G.C.y+G.D.y*x,G.C.z+G.D.z*x);},neuf=function(){S.list.length=0;S.list.push(o);S.on=true;S.pv=false;o.fait=false;o.pres=0;o.min=99;sb.nBoom=0;sb.graceT=0;sb.gameOver=false;sb.started=true;sb.mode='drive';sb.mult=1;sb.vA=100/SPD;sb.fallVel.set(0,0,0);},
        deux=function(x){pose(x);sb.__f();pose(x+.5);sb.__f();};
  neuf();deux(-20);pose(15);sb.graceT=1.6;for(let i=0;i<130;i++){sb.graceT=Math.max(0,sb.graceT-1/60);pose(15+i*.4);sb.__f();}
  R.push(['relance (respawn, graceT 1,6 s) : replacée 35 m plus loin, par-dessus l\'obstacle',sb.nBoom===0,true]);
  neuf();deux(30);pose(-40);sb.graceT=1.6;for(let i=0;i<110;i++){sb.graceT=Math.max(0,sb.graceT-1/60);sb.__f();}
  R.push(['relance en AMONT (70 m en arrière, par-dessus l\'obstacle), à l\'arrêt jusqu\'à la fin du répit',sb.nBoom===0,true]);
  for(const J of [61,150,600,5000]){neuf();deux(-J/2);pose(J/2);sb.__f();R.push(['saut de '+J+' m par-dessus l\'obstacle, sans répit (portail, replacement), à 100 m/s',sb.nBoom===0,true]);}
  for(const g of ['boom','gameOver','started','ORB']){neuf();deux(-20);
    if(g==='boom')sb.mode='boom';else if(g==='gameOver')sb.gameOver=true;else if(g==='started')sb.started=false;else sb.ORB.actif=false;
    pose(-10);sb.__f();pose(20);sb.__f();sb.mode='drive';sb.gameOver=false;sb.started=true;sb.ORB.actif=true;sb.__f();pose(20.5);sb.__f();
    R.push(['reprise après une image gardée ('+g+') passée de l\'autre côté',sb.nBoom===0,true]);}
  neuf();deux(-20);vm.runInContext(X.rebati,sb);S.on=true;S.list.push(o);pose(20);sb.__f();
  R.push(['piste REBÂTIE (le texte de orbiteBuild : « '+X.rebati.trim()+' ») puis caisse 40 m plus loin, par-dessus un obstacle',sb.nBoom===0,false]);
  neuf();o.fait=true;let b=0;for(let x=-25;x<25;x+=1){pose(x);sb.__f();b+=sb.nBoom;}
  R.push(['(constat, piste n° 4) un obstacle marqué o.fait traversé plein axe : pas de collision',b===0,null]);
  return R;}

// ====================================================================================================================
// 2 · LE TRAFIC DE L'HEURE DE POINTE — traficTick
// ====================================================================================================================
const CV=62; // la vitesse d'une voiture du trafic (unités de vA ; × SPD = m/s) — hors bouchon : 62 + 4·file + 0…6
function trajetsTrafic(T9){const E=T9[4]+1.15,L=[],lin=function(a,b,n){const r=[0];for(let i=0;i<n;i++)r.push(a+(b-a)*i/(n-1));return r;};
  for(const pente of [0,.1,-.1,.3])for(const l of lin(-E-5,E+5,24))L.push([pente,l]);return L;}
function essaiTrafic(sb,ty,tr,V,dt,phi,cote){ // V = vitesse RELATIVE (m/s) ; l'écart en long g = s − c.s ; l'écart latéral l(g) = l0 + pente·g
  const T9=sb.__T[ty],W9=T9[3]+2.1,Vc=CV*SPD,Vp=V+Vc,pas=V*dt,c={s:5000,lane:3,f0:3,f1:3,u:1,lat:sb.__F[3],v:CV,ty:ty,col:0,ch:1e9,bl:0,dm:9,fr:false,klax:0,fly:0,mort:false};
  sb.VTR.cars.length=0;sb.VTR.cars.push(c);sb.nChoc=0;sb.nFrole=0;sb.VC.gel=0;sb.mode='drive';sb.side=cote;sb.mult=Vp>500?MULT:1;sb.vA=Vp/(SPD*sb.mult);
  const g0=-(W9+(2+phi)*pas),fin=T9[3]+2.6+2*pas;sb.s=c.s+g0;
  for(let i=1;;i++){const g=g0+i*pas;if(g>fin+pas)break;sb.s+=Vp*dt;sb.lat=cote*(c.lat+tr[1]+tr[0]*g);sb.__f(dt,sb.s);if(sb.nChoc)return 1;}
  return 0;}
function grilleTrafic(code,T,seulementAxe,lesDts){
  const sb=bacTrafic(code);let n=0;const vits=VITS.map(function(v){return v>=1400?Math.round(v-CV*SPD):v;});
  for(let ty=0;ty<3;ty++){const T9=sb.__T[ty],h=[T9[3]+2.1,T9[4]+1.15];let it=0;
    for(const tr of trajetsTrafic(T9)){it++;const axe=tr[0]===0&&tr[1]===0;if(seulementAxe&&!axe)continue;
      const cl=classe([0,tr[1]],[1,tr[0]],h),fr=cl.c==='dehors'&&Math.abs(tr[1])-h[1]<1.4&&Math.abs(tr[0])<.05;
      for(const V of vits)for(const d of lesDts)for(const phi of phases(V*d[0])){
        const c=essaiTrafic(sb,ty,tr,V,d[0],phi,it%2?1:-1);n++;T.note(d[1],V,cl.c,axe,c,fr&&V>60?(sb.nFrole>0?1:0):-1,cl.e);}}}
  for(const r of T.m.values())r.dt_=DTS.filter(function(d){return d[1]===r.dt;})[0][0];
  return {n:n,vits:vits};}
function sautsTrafic(code){
  const sb=bacTrafic(code),R=[],dt=1/30,T9=sb.__T[0];let c;
  const neuf=function(g,l){c={s:5000,lane:3,f0:3,f1:3,u:1,lat:sb.__F[3],v:CV,ty:0,col:0,ch:1e9,bl:0,dm:9,fr:false,klax:0,fly:0,mort:false};sb.VTR.cars.length=0;sb.VTR.cars.push(c);
    sb.nChoc=0;sb.VC.gel=0;sb.mode='drive';sb.side=1;sb.mult=1;sb.vA=(100+CV*SPD)/SPD;sb.s=c.s+g;sb.lat=c.lat+l;},
    img=function(dg){sb.s+=dg+CV*SPD*dt;sb.__f(dt,sb.s);}; // une image : l'écart en long avance de dg (la voiture avance de son côté dans traficTick)
  neuf(-30,0);img(1);img(1);sb.mode='fall';for(let i=0;i<6;i++)img(10);sb.mode='drive';img(1);img(1);
  R.push(['reprise après un VOL passé par-dessus la voiture (plein axe)',sb.nChoc===0,true]);
  neuf(-30,0);img(1);img(1);sb.VC.gel=.3;for(let i=0;i<6;i++)img(10);sb.VC.gel=0;img(1);img(1);
  R.push(['reprise après le RÉPIT d\'un accrochage (VC.gel), la voiture dépassée entre-temps (plein axe)',sb.nChoc===0,true]);
  neuf(-30,0);img(1);img(1);sb.mode='boom';for(let i=0;i<6;i++)img(10);sb.mode='drive';img(1);
  R.push(['reprise après une EXPLOSION / un replacement passé de l\'autre côté',sb.nChoc===0,true]);
  neuf(50,T9[4]+4);img(1);img(1);img(-250);img(1);
  R.push(['relance en AMONT (250 m en arrière) : pas de choc à l\'image du replacement',sb.nChoc===0,true]);
  for(const J of [61,200,2000]){neuf(-J/2,0);img(1);img(.5);img(J);img(1);R.push(['saut de '+J+' m par-dessus la voiture en une image, à 100 m/s (portail, replacement)',sb.nChoc===0,true]);}
  neuf(20,0);img(1);img(1);
  R.push(['1re image d\'une voiture déjà dépassée (pas de trajet connu)',sb.nChoc===0,true]);
  return R;}

// ====================================================================================================================
// 3 · L'ANCIEN CODE (e)
// ====================================================================================================================
function ancienCode(){
  try{const t=cp.execFileSync('git',['-C',DEPOT,'show',ANCIEN+':VERSION PRINCIPALE/index.html'],{encoding:'utf8',maxBuffer:64*1024*1024,stdio:['ignore','pipe','ignore']});
    const A=extrait(t);A.src='git show '+ANCIEN+' (extraction des mêmes repères)';return A;}catch(e){}
  const A=Object.assign({},X);A.src='reconstruit : le correctif retiré du texte courant (git indisponible)';
  {const i=A.satHard.indexOf('if(bal){');if(i<0)throw new Error('ancien code : if(bal){ introuvable');A.satHard=A.satHard.slice(0,i)+A.satHard.slice(finBloc(A.satHard,i+7));}
  {const a='if((Math.abs(dS)<W9||saut9)&&dlB<T9[4]+1.15){traficChoc(c,dlB);continue;}';if(A.trafic.indexOf(a)<0)throw new Error('ancien code : test du trafic introuvable');
   A.trafic=A.trafic.replace(a,'if(Math.abs(dS)<W9&&dl<T9[4]+1.15){traficChoc(c,dl);continue;}');}
  return A;}

// ====================================================================================================================
// LE DÉROULÉ
// ====================================================================================================================
const t00=Date.now();
console.log('PREUVE DU BALAYAGE DES CHOCS — '+fichier);
console.log('extrait du fichier : satHard (l. '+X.L.satHard+', '+X.satHard.length+' car.) · traficTick (l. '+X.L.trafic+', '+X.trafic.length+' car.) · SATOB · VTR_F · VTR_T · la boîte de pose0');
console.log('constantes lues : SPD '+SPD+' · vitMult ≤ ×'+MULT+' · CARS[0] '+K.maxKmh+' km/h, accel '+K.accel+' · '+K.push.length+' moteurs (push ≤ '+K.push[TMAX]+') · dt plafonné à 0,05 s dans loop');
console.log('plafonds de vitesse (avance du monde) : croisière nitro tenue + NITROOO ×'+MULT+' au dernier moteur ≈ '+Math.round(V_SOUT)+' m/s ('+Math.round(V_SOUT*3.6)+' km/h) · tout empilé (pad, frénésie, réserve bleue) ≈ '+Math.round(V_THEO)+' m/s ('+Math.round(V_THEO*3.6)+' km/h) · en vol (éjection + 3 s de réacteur) ≈ '+Math.round(V_VOL)+' m/s');
console.log('grille : pas '+DTS.map(function(d){return d[1];}).join(' · ')+' × vitesses '+VITS.join(' · ')+' m/s × '+NPH+' phases (6 quand le pas fait moins de 25 cm) × trajectoires');

const TS=new Table(),nS=grilleSat(X,TS,false,DTS);
affiche('SATELLITES (satHard)',TS,DTS,VITS.concat([Math.round(V_VOL)]));juge('satHard',TS,DTS);
{const t=TS.somme(function(){return true;});console.log('satellites : '+nS+' essais · 5 obstacles ('+SATS.map(function(x){return x[0];}).join(' ; ')+') · bande de coin mesurée : la droite passe jusqu\'à '+t.bande.toFixed(2)+' m hors du rectangle médian et écorne quand même la boîte');}
const RS=sautsSat(X);console.log('SATELLITES — (d) sauts de position');
for(const r of RS){console.log('  '+(r[1]?'OK  ':(r[2]?'KO  ':'INFO'))+' '+r[0]+(r[1]?'':(r[2]===true?' → CHOC FANTÔME':r[2]===false?' → choc (non bloquant : aucun obstacle à moins de 650 m du départ d\'une piste, et la caisse arrive de plus loin)':' → collision')));if(!r[1]&&r[2]===true)ko('satHard · (d) '+r[0]);}

const TT=new Table(),gT=grilleTrafic(X,TT,false,DTS);
affiche('TRAFIC (traficTick)',TT,DTS,gT.vits);juge('traficTick',TT,DTS);
{const t=TT.somme(function(){return true;});console.log('trafic : '+gT.n+' essais · 3 gabarits (voiture, fourgonnette, bus) × pentes latérales 0, ±0,1, 0,3 · vitesses RELATIVES à la voiture ('+(CV*SPD).toFixed(1)+' m/s) · bande de coin mesurée : jusqu\'à '+t.bande.toFixed(2)+' m');}
const RT=sautsTrafic(X);console.log('TRAFIC — (d) sauts de position');
for(const r of RT){console.log('  '+(r[1]?'OK  ':'KO  ')+r[0]+(r[1]?'':' → CHOC FANTÔME'));if(!r[1])ko('traficTick · (d) '+r[0]);}

let A=null;try{A=ancienCode();}catch(e){ko('(e) ancien code indisponible : '+e.message);}
if(A){const D30=[DTS[1]],aS=new Table(),aT=new Table(),nS2=new Table(),nT2=new Table();
  grilleSat(A,aS,true,D30);grilleTrafic(A,aT,true,D30);grilleSat(X,nS2,true,D30);grilleTrafic(X,nT2,true,D30);
  const s=function(T){return T.somme(function(){return true;}).axe;},a1=s(aS),a2=s(aT),n1=s(nS2),n2=s(nT2);
  console.log('\n(e) L\'ANCIEN CODE — '+A.src+' — plein axe, pas 1/30, toutes vitesses');
  console.log('  satHard    ancien : '+(a1[0]-a1[1])+' traversées / '+a1[0]+'   ·   fichier testé : '+(n1[0]-n1[1])+' / '+n1[0]);
  console.log('  traficTick ancien : '+(a2[0]-a2[1])+' traversées / '+a2[0]+'   ·   fichier testé : '+(n2[0]-n2[1])+' / '+n2[0]);
  {const l=[];for(const V of VITS){const r=aS.m.get('1/30|'+V);if(r)l.push(V+' m/s : '+(r.axe[0]-r.axe[1])+'/'+r.axe[0]);}console.log('  satHard ancien, par vitesse    : '+l.join(' · '));}
  {const l=[];for(const V of gT.vits){const r=aT.m.get('1/30|'+V);if(r)l.push(V+' m/s : '+(r.axe[0]-r.axe[1])+'/'+r.axe[0]);}console.log('  traficTick ancien, par vitesse : '+l.join(' · '));}
  if(a1[1]===a1[0])ko('(e) l\'ancien satHard ne rate rien plein axe à 1/30 : le test ne prouve rien');
  if(a2[1]===a2[0])ko('(e) l\'ancien traficTick ne rate rien plein axe à 1/30 : le test ne prouve rien');}

console.log('\n('+((Date.now()-t00)/1000).toFixed(1)+' s)');
if(KO.length){console.log(KO.length+' cas en échec ; les premiers :');for(const m of KO.slice(0,12))console.log('  · '+m);console.log('PREUVE KO — '+KO[0]);process.exit(1);}
console.log('PREUVE OK');process.exit(0);
