/* ===== LES ROUTES UNIQUES (2026-11-17, Sacha : « c'est toujours la même chose : les mêmes modules, la map a globalement la même direction ; Jade commence toujours
   par une boucle, une grande descente et une autre boucle ; il faut que la map soit unique à chaque fois, une expérience totalement différente à chaque partie ») =====
   MESURÉ (passation/ROUTES-UNIQUES.md, 200 graines par map) : la route était un SQUELETTE fixe (ouverture écrite → saut → envers → climax → saut) dont seuls les réglages
   changeaient ; les modules neufs du 16/11 dormaient derrière deux drapeaux éteints (?jade=avatar, ?espace=voyages).
   LE SAC (commun à Jade et à l'orbite) : chaque map a UN sac de tous ses modules. Une route y pioche au hasard pesé — un module joué dans la route d'avant ne revient
   presque jamais dans la suivante (poids × 0,03), puis il remonte (× 0,2, × 0,5, × 0,8) ; un module jamais vu, ou pas vu depuis longtemps, pèse plus lourd : en
   quelques routes tout le sac est passé. Le sac se souvient d'une partie à l'autre (localStorage `cashcarRU`, ~5 Ko par map, borné), ainsi que de la dernière
   ouverture, du dernier tempérament de cap et de relief : deux routes de suite ne partent jamais de la même façon.
   LE PLAN d'une route (son ordre de modules, son ouverture, ses tempéraments) est tiré UNE fois par graine et gardé (RU.P) : les essais du directeur de rythme, le
   pré-bâti puis le vrai départ, REJOUER rendent la même route. Avec `?pistegraine=` le sac n'a pas de mémoire : le plan ne dépend que de la graine (une partie se rejoue).
   `?sans=uniques` : le tirage d'avant, à l'identique. Crochet : `dbgRoutesU()`. */
const ROUTES_U=typeof location==='undefined'||!/[?&]sans=([^&]*,)?uniques(,|&|$)/.test(location.search);
const RU={H:{},P:new Map(),V:{},lu:0,cle:'cashcarRU',fige:typeof location!=='undefined'&&/[?&]pistegraine=/.test(location.search)};
function ruH(c){if(!RU.lu){RU.lu=1;if(!RU.fige)try{const s=localStorage.getItem(RU.cle),o=s?JSON.parse(s):null;if(o&&typeof o==='object')RU.H=o;}catch(e){}}
  let h=RU.H[c];if(!h||typeof h!=='object'||!h.vu)h=RU.H[c]={n:0,vu:{},der:{},dg:null};return h;}
/* le poids d'un module dans le sac de la carte c : presque nul s'il vient de passer, plus lourd s'il n'est pas venu depuis longtemps */
function ruPoids(c,nom){if(RU.fige)return 1;const h=ruH(c),v=h.vu[nom];if(v==null)return 1.6;const a=h.n-v;return a<=0?.03:a===1?.2:a===2?.5:a===3?.8:1+Math.min(1,(a-3)/8);}
/* un choix pesé parmi des clés, jamais celui de la route d'avant (h.der[champ]) s'il en reste un autre */
function ruChoix(c,champ,cles,rf,poids){const d=RU.fige?null:ruH(c).der[champ];let L=cles.filter(function(k){return k!==d;});if(!L.length)L=cles.slice();let t=0;const W=L.map(function(k){const w=poids&&poids[k]!=null?poids[k]:1;t+=w;return w;});
  let u=rf()*t;for(let i=0;i<L.length;i++){u-=W[i];if(u<=0)return L[i];}return L[L.length-1];}
/* tout le sac, dans un ordre tiré au hasard pesé (clé d'Efraimidis : −ln(u)/poids) — items : [{k, w}] ; rend les clés */
function ruOrdre(c,items,rf){const A=items.map(function(o){const w=Math.max(1e-4,(o.w==null?1:o.w)*ruPoids(c,o.k));return {k:o.k,q:-Math.log(Math.max(1e-12,rf()))/w};});
  A.sort(function(a,b){return a.q-b.q;});return A.map(function(o){return o.k;});}
function ruPlan(c,graine,fait){const cle=c+':'+graine;let p=RU.P.get(cle);if(p)return p;p=fait(RU.V[cle]|0);p.cle=cle;RU.P.set(cle,p);if(RU.P.size>48)RU.P.delete(RU.P.keys().next().value);return p;}
/* la route gardée : ses modules vieillissent le sac (une fois par graine), ses tirages deviennent « ceux d'avant » */
function ruMarque(c,graine,noms,der){if(RU.fige)return;const h=ruH(c);if(h.dg===graine)return;h.dg=graine;h.n++;for(const k of noms)h.vu[k]=h.n;if(der)h.der=der;if(!h.sq)h.sq=[];{const e9=ruHache(noms.join('>'));h.sq.push(e9);if(h.sq.length>400)h.sq.splice(0,h.sq.length-400);if(!h.sg)h.sg=[];h.sg.push(String(graine)+'='+e9);if(h.sg.length>48)h.sg.splice(0,h.sg.length-48);}
  if(h.n>4000){for(const k in h.vu)h.vu[k]=Math.max(0,h.vu[k]-3000);h.n-=3000;}
  try{localStorage.setItem(RU.cle,JSON.stringify(RU.H));}catch(e){}}
function ruSig(p){return p?p.sig:'';}
/* CHAQUE ROUTE EST UNIQUE (Sacha, 17/11 : « il faut que vraiment chaque route soit unique ») : le sac garde l'empreinte des 400 dernières suites de modules jouées ;
   une route dont la suite a déjà été jouée est refaite sur une variante de son plan (ruRefait : la graine reste, le tirage du plan change), deux fois au plus. */
function ruHache(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function ruDeja(c,noms,graine){if(RU.fige)return false;const h=ruH(c),e9=ruHache(noms.join('>'));if(!h.sq||h.sq.indexOf(e9)<0)return false;return !(h.sg&&h.sg.indexOf(String(graine)+'='+e9)>=0);} /* (le contrôle adverse, 17/11) la suite que CETTE graine a déjà marquée n'est pas une redite : la même graine régénérée (pré-bâti puis départ, REJOUER, dbgGenRoute) rend la même route */
function ruRefait(c,graine){const cle=c+':'+graine,n=Object.keys(RU.V);if(n.length>64)delete RU.V[n[0]];RU.V[cle]=(RU.V[cle]|0)+1;RU.P.delete(cle);return RU.V[cle];}
/* LA FORME (le contrôle adverse, 17/11 : « aucune paire de parties avec un tracé proche sur les 3 premiers km ») : les 3 premiers km d'une route dans le repère de son départ
   (origine au 1er point, z = son cap), un point tous les 150 m ; ruFormeProche : l'écart RMS 3D (m) à la plus proche des 300 dernières routes gardées de la séance
   (au miroir gauche/droite près ; la route de la même graine ne compte pas) est-il sous `seuil` ? Mémoire de la séance seulement (rien dans localStorage). */
function ruForme(C){const n=C.length,F=new Float32Array(63);if(n<2)return F;let k=1;while(k<n-1&&Math.hypot(C[k].x-C[0].x,C[k].z-C[0].z)<40)k++;const a=Math.atan2(C[k].x-C[0].x,C[k].z-C[0].z),ca=Math.cos(a),sa=Math.sin(a);
  let i=1,acc=0,l=C[1].distanceTo(C[0]);for(let q=0;q<21;q++){const s=q*150;while(i<n-1&&acc+l<s){acc+=l;i++;l=C[i].distanceTo(C[i-1]);}const t=l>0?Math.max(0,Math.min(1,(s-acc)/l)):0,A=C[i-1],B=C[i],x=A.x+(B.x-A.x)*t-C[0].x,y=A.y+(B.y-A.y)*t-C[0].y,z=A.z+(B.z-A.z)*t-C[0].z;
    F[q*3]=x*ca-z*sa;F[q*3+1]=y;F[q*3+2]=x*sa+z*ca;}return F;}
function ruFormeProche(c,F,graine,seuil){if(RU.fige)return false;const L=RU.F&&RU.F[c];if(!L)return false;const s2=seuil*seuil*21;for(const o of L){if(o.g===graine)continue;let d=0,m=0;for(let q=0;q<63;q+=3){const dy=F[q+1]-o.f[q+1],dz=F[q+2]-o.f[q+2],dx=F[q]-o.f[q],mx=F[q]+o.f[q];d+=dx*dx+dy*dy+dz*dz;m+=mx*mx+dy*dy+dz*dz;if(d>s2&&m>s2)break;}if(d<=s2||m<=s2)return true;}return false;}
function ruFormeGarde(c,F,graine){if(RU.fige)return;if(!RU.F)RU.F={};const L=RU.F[c]||(RU.F[c]=[]);for(const o of L)if(o.g===graine)return;L.push({g:graine,f:F});if(L.length>300)L.shift();}
if(typeof window!=='undefined')window.dbgRoutesU=function(raz){if(raz){RU.H={};RU.P.clear();try{localStorage.removeItem(RU.cle);}catch(e){}}return {on:ROUTES_U,fige:RU.fige,H:JSON.parse(JSON.stringify(RU.H)),plans:Array.from(RU.P.values()).map(function(p){return {cle:p.cle,sig:p.sig};})};};
