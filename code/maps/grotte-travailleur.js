
/* ===== LE CREUSEMENT DE LA GROTTE DANS UN TRAVAILLEUR (2026-11-08, vitesse-fluide : « sortir le creusement du fil principal ») =====
   MESURÉ (Mac ×4, 10 s par palier moteur) : la grotte d'après est le plus gros travail du pré-bâti (≈ 6,5-7,2 s de calcul) et `grtCreuse1` en est le cœur (5,7 ms par image à grande vitesse) — calcul pur sur des tableaux
   typés : une grille de densité (cases de 12 m) creusée par un ellipsoïde autour de chaque échantillon de route, le bruit mis en cache Int8 par case. Ici le creusement entier (grtMonde, puis pour chaque échantillon grtNoyau
   et grtCreuse1, EXACTEMENT la boucle de buildGrotteG) tourne dans un travailleur, avec les MÊMES fonctions (recopiées par leur source, comme le canyon : cyTravailleur) : même code, mêmes entrées (les tableaux de la route,
   les bornes, ROAD_HALF et THICK du travail en cours) = la même grille au bit près (dbgGrotteHash compare les deux chemins). Le fil principal garde le reste (lacs, piliers, décors, mailles) et ne fait qu'ATTENDRE
   (`yield 'attente'` : prebTravaille rend la main tout de suite, sans brûler la tranche).
   (2026-11-13, la chasse aux millisecondes de l'ordi) SUR TOUS LES APPAREILS — il n'était allumé que sur le téléphone (TEL_NATIF) : MESURÉ sur l'ordi de Sacha (Ryzen 5 3600,
   banc outils/banc-pc/chasse.cjs), le pré-bâti de la grotte pendant la ville faisait des blocs de 130 à 210 ms sur le fil du jeu (grtTronconG, grtCreuse1). Les mêmes fonctions, les
   mêmes entrées : la même grotte au bit près sur l'ordi aussi (`?grottecompare=1` remaille chaque tronçon reçu ici et compare, dbgGrotteTrav().compare).
   Au PRÉ-BÂTI seulement (tranches finies : un bâti « d'un trait » ne peut pas attendre un message) ; `?grotteworker=0` = avant. REPLI AUTOMATIQUE sur le fil principal : pas de Worker, création ou
   message en erreur, ou la tranche devient infinie pendant l'attente (le passage du portail sans voile : le travailleur est alors abandonné et le creusement se refait ici, comme avant). Banc : dbgGrotteHash(), dbgGrotteTrav(). */
const GRW={on:typeof Worker!=='undefined'&&!/[?&]grotteworker=0\b/.test(location.search),cmp:/[?&]grottecompare=1\b/.test(location.search),cmpOk:0,cmpKo:0,w:undefined,job:0,cur:null,faits:0,replis:0,ms:0,err:'',vu:false,maille:null,mfaits:0,minline:0,mms:0};
GRW.raison=typeof Worker==='undefined'?'pas de Worker':/[?&]grotteworker=0\b/.test(location.search)?'coupé (?grotteworker=0)':'';
function grwNote(msg,ou){if(!TEL_NATIF)return;try{window.__ccNote('grotte',msg,ou);}catch(e){}} /* (2026-11-08) la boîte noire : « grotte | travailleur » (ou « repli <raison> ») à chaque grotte creusée — n compte les grottes ; le temps en 3e champ */
const GRW_R=['X','Y','Z','NNX','NNY','NNZ','BX','BY','BZ','LAT','BAS','RH','UP','DN','EX','NZ','EXT','CAX','CAY','CAZ','OFX','OFY','OFZ']; /* (2026-11-13, L'ASSIETTE LIBRE) l'axe et le décalage du creux */
function grwTravailleur(){
  if(GRW.w!==undefined)return GRW.w;
  try{const fns=[grtH3,grtN3,grtRoche,grtMonde,grtCh,grtNoyau,grtCreuse1,grtD,grtLit,grtMatieres,grtLum,grtTampons,grtR6,grtGalNoir,grtMailleNetsG].map(function(f){return f.toString();}).join('\n');
    const code="'use strict';var GRT={B:12,K:1.6},GRV={nzK:2},GRT_VASTE=true,ROAD_HALF=28,THICK=5.2,JF={lim:Infinity},GRT_ARETES="+JSON.stringify(GRT_ARETES)+",GRT_TMP={lum:[0,0,0,0],loc:null,vid:null,P:null,F:null,Lt:null,I:null},GRT_AMB=[],GROTTE={},GT={},MV=null,MLL=null;\n"+fns+
      "\nfunction grwInit(m){var n=m.n,V={B:m.Vb,ox:m.ox,oy:m.oy,oz:m.oz,CX:m.CX,CY:m.CY,CZ:m.CZ,NX:m.NX,NY:m.NY,NZ:m.NZ,dir:m.dir,pool:[],dn:[],si:[],cle:m.cle};for(var c=0;c<n;c++){V.pool.push(m.P.subarray(c*4096,(c+1)*4096));V.dn.push(m.D.subarray(c*4096,(c+1)*4096));V.si.push(m.SI.subarray(c*64,(c+1)*64));}"+
      "GT=m.GT;GRT_AMB=m.AMB;GRV={amb:m.amb,tR2:m.tR2,tF:m.tF,lavL:m.lavL};GROTTE={R:{SAL:m.SAL},lac:m.lac,eau:m.eau,piliers:m.piliers,lavLum:m.lavLum,galeries:m.gal||null};MLL=new Map(m.LL);MV=V;}"+
      "\nfunction grwPull(m){if(!MV)return;for(var i=0;i<m.list.length;i++){var c=m.list[i],r=grtMailleNetsG(MV,c,MLL.get(MV.cle[c])||null),x;do{x=r.next();}while(!x.done);var q=x.value;postMessage({t:'maille',job:m.job,c:c,P:q.P,F:q.F,L:q.L,nv:q.nv,nt:q.nt},[q.P.buffer,q.F.buffer,q.L.buffer]);}}"+
      "\nonmessage=function(e){var m=e.data;if(m.t==='init'){grwInit(m);return;}if(m.t==='pull'){grwPull(m);return;}if(m.t==='fin'){MV=null;MLL=null;GROTTE={};return;}var t0=performance.now();GRT={B:m.B,K:m.K};GRV={nzK:m.nzK};GRT_VASTE=m.vaste;ROAD_HALF=m.rh;THICK=m.th;var R=m.R,V=grtMonde(m.x0,m.y0,m.z0,m.x1,m.y1,m.z1);"+
      "for(var q=0,ac=1e9;q<R.n;q++){grtNoyau(V,R,q);ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;for(var g1 of grtCreuse1(V,R,q));if(R.BAS[q]>0)for(var g2 of grtCreuse1(V,R,q,{ax:0,ay:1,az:0,rh:R.RH[q]*.85,up:14,dn:R.BAS[q]}));}"+
      "var n=V.pool.length,P=new Uint8Array(n*4096),D=new Int8Array(n*4096),SI=new Int32Array(n*64),SD=new Float32Array(n*64);"+
      "for(var c=0;c<n;c++){P.set(V.pool[c],c*4096);D.set(V.dn[c],c*4096);SI.set(V.si[c],c*64);SD.set(V.sd[c],c*64);}"+
      "postMessage({job:m.job,n:n,P:P,D:D,SI:SI,SD:SD,dir:V.dir,chS:V.chS,cle:V.cle,nAir:V.nAir,ms:Math.round(performance.now()-t0)},[P.buffer,D.buffer,SI.buffer,SD.buffer,V.dir.buffer]);};";
    const W=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
    W.onmessage=function(e){const r=e.data;if(r.t==='maille'){const J=GRW.maille;if(J&&r.job===J.job&&!J.fait.has(r.c)){J.res.set(r.c,r);}return;}const c=GRW.cur;if(!c||r.job!==c.job||c.annule)return;c.r=r;c.fini=true;};
    W.onerror=function(e){GRW.err=String(e&&e.message||e);GRW.on=false;GRW.w=null;if(GRW.maille)GRW.maille.annule=true;const c=GRW.cur;if(c)c.echec=true;try{W.terminate();}catch(e2){}};
    GRW.w=W;}catch(e){GRW.err=String(e&&e.message||e);GRW.w=null;GRW.on=false;}
  return GRW.w;}
function grwAbandon(c){ /* le travail en cours est jeté : on arrête le travailleur (il finirait un creusement dont personne ne veut, et ferait attendre le suivant) */
  if(c)c.annule=true;if(GRW.cur===c)GRW.cur=null;try{if(GRW.w)GRW.w.terminate();}catch(e){}GRW.w=undefined;}
function* grwCreuse(V,R,b){ /* rend vrai si le travailleur a creusé (V est alors rempli) ; faux : le fil principal creuse comme avant */
  if(!GRW.on){grwNote('repli '+(GRW.raison||GRW.err||'travailleur indisponible'));return false;}
  if(JF.lim===Infinity){grwNote('repli bâti d\'un trait (sans tranches)');return false;}
  const W=grwTravailleur();if(!W){grwNote('repli création : '+(GRW.err||'?'));return false;}
  const c={job:++GRW.job,fini:false,echec:false,annule:false,r:null,t0:performance.now()};GRW.cur=c;
  const Rm={n:R.n};for(const k of GRW_R)Rm[k]=R[k].slice();
  try{W.postMessage({job:c.job,B:GRT.B,K:GRT.K,nzK:GRV.nzK,vaste:GRT_VASTE,rh:ROAD_HALF,th:THICK,x0:b.x0,y0:b.y0,z0:b.z0,x1:b.x1,y1:b.y1,z1:b.z1,R:Rm});}catch(e){GRW.err=String(e&&e.message||e);GRW.on=false;grwAbandon(c);grwNote('repli envoi : '+GRW.err);return false;}
  try{while(!c.fini&&!c.echec){if(JF.lim===Infinity){GRW.replis++;grwAbandon(c);grwNote('repli passage sans voile (tranche infinie)');return false;}yield 'attente';}}
  finally{if(!c.fini)grwAbandon(c);}
  if(c.echec||!c.r){GRW.replis++;grwNote('repli erreur : '+GRW.err);return false;}
  const r=c.r,n=r.n;V.dir=r.dir;V.pool=new Array(n);V.dn=new Array(n);V.si=new Array(n);V.sd=new Array(n);V.nzc=new Array(n).fill(null);
  for(let k=0;k<n;k++){V.pool[k]=r.P.subarray(k*4096,(k+1)*4096);V.dn[k]=r.D.subarray(k*4096,(k+1)*4096);V.si[k]=r.SI.subarray(k*64,(k+1)*64);V.sd[k]=r.SD.subarray(k*64,(k+1)*64);}
  V.chS=r.chS;V.cle=r.cle;V.nAir=r.nAir;GRW.faits++;GRW.ms=r.ms;GRW.cur=null;grwNote('travailleur',r.ms+' ms de creusement, attente '+Math.round(performance.now()-c.t0)+' ms · le travailleur garde ≈ '+(Math.round((r.P.byteLength+r.D.byteLength+r.SI.byteLength+r.dir.byteLength+r.cle.length*8)/104857.6)/10)+' Mo de grille + 1,8 Mo de tampons + ≤ '+GRW_AVANCE+' tronçons d\'avance'); /* (2026-11-08) la mémoire que le travailleur garde jusqu\'à grotteVide : à lire sur le 13 Pro */return true;}
/* LES MAILLES (2026-11-08) : la surface à facettes de chaque tronçon (grtMailleNetsG : sommets, matières, lumière cuite, triangles) est AUSSI du calcul pur sur tableaux typés — 5,3 s des 8,1 s de pré-bâti restant sur le fil
   (profil ×4 : grtMailleNetsG 3,3 s en propre + lecture de la grille 1,1 s). Une fois la grotte creusée, décorée et ses lumières posées (buildGrotteG, juste avant la boucle des tronçons), le fil envoie au travailleur UNE copie de la
   grille et de ce que le maillage lit (salles, lac, eau, piliers, lumières par tronçon, matières) ; grtTronconG lui DEMANDE les tronçons dans l'ordre de la file (12 d'avance : le tas ne grossit pas) et ne fait plus que les BufferGeometry.
   Mêmes fonctions, mêmes entrées : mêmes tableaux au bit près (preuve vm). Pas de résultat prêt : le tronçon se maille ici, comme avant (en course, jamais d'attente). `grwFin` (grotteVide) libère la copie. */
const GRW_AVANCE=12;
function grwMailleInit(V,R,ord){
  if(!GRW.on||!GROTTE.LL)return;
  try{const W=grwTravailleur();if(!W)return;
    const n=V.pool.length,P=new Uint8Array(n*4096),D=new Int8Array(n*4096),SI=new Int32Array(n*64);
    for(let c=0;c<n;c++){P.set(V.pool[c],c*4096);D.set(V.dn[c],c*4096);SI.set(V.si[c],c*64);}
    const LL=[];for(const e of GROTTE.LL){const t=[],p=[];for(const o of e[1].t)t.push({x:o.x,y:o.y,z:o.z});for(const o of e[1].p)p.push({x:o.x,y:o.y,z:o.z,r2:o.r2,I:o.I,c:[o.c[0],o.c[1],o.c[2]]});LL.push([e[0],{t:t,p:p}]);}
    const pil=GROTTE.piliers?GROTTE.piliers.map(function(c){return {x:c.x,z:c.z,r:c.r,yb:c.yb,yt:c.yt,k:c.k};}):null;
    const J={job:++GRW.job,V:V,ord:ord,pos:new Map(),res:new Map(),dem:new Set(),fait:new Set(),annule:false,t0:performance.now()};for(let i=0;i<ord.length;i++)J.pos.set(ord[i],i);
    W.postMessage({t:'init',n:n,Vb:V.B,ox:V.ox,oy:V.oy,oz:V.oz,CX:V.CX,CY:V.CY,CZ:V.CZ,NX:V.NX,NY:V.NY,NZ:V.NZ,dir:V.dir.slice(),cle:V.cle.slice(),P:P,D:D,SI:SI,GT:GT,AMB:GRT_AMB,amb:GRV.amb,tR2:GRV.tR2,tF:GRV.tF,lavL:GRV.lavL,
      SAL:R.SAL.slice(),lac:GROTTE.lac?{y:GROTTE.lac.y}:null,eau:GROTTE.eau?{y:GROTTE.eau.y}:null,piliers:pil,lavLum:GROTTE.lavLum||null,gal:GROTTE.galeries?GROTTE.galeries.map(function(g){return {P:g.P,r:g.r,dS:g.dS,bb:g.bb};}):null,LL:LL},[P.buffer,D.buffer,SI.buffer]);
    GRW.maille=J;}catch(e){GRW.err=String(e&&e.message||e);GRW.maille=null;grwNote('repli mailles : '+GRW.err);}}
function grwMailleTire(J,c){const i=J.pos.get(c);if(i==null)return;const l=[];for(let k=i;k<Math.min(J.ord.length,i+GRW_AVANCE);k++){const cc=J.ord[k];if(!J.dem.has(cc)&&!J.fait.has(cc)){J.dem.add(cc);l.push(cc);}}
  if(l.length&&GRW.w)try{GRW.w.postMessage({t:'pull',job:J.job,list:l});}catch(e){J.annule=true;}}
function* grwMailleDe(V,c,LL){ /* les tableaux de maille du tronçon c : ceux du travailleur s'ils sont prêts (ou si l'on peut attendre), sinon calculés ici */
  const J=GRW.maille;
  if(J&&J.V===V&&!J.annule&&GRW.w){
    if(!J.dem.has(c))grwMailleTire(J,c);
    const t0=performance.now();
    for(;;){const r=J.res.get(c);
      if(r){J.res.delete(c);J.fait.add(c);GRW.mfaits++;grwMailleTire(J,c);if(GRW.cmp)grwCompare(V,c,LL,r);return {P:r.P,F:r.F,L:r.L,I:null,nv:r.nv,nt:r.nt};}
      if(JF.lim===Infinity||J.annule||performance.now()-t0>8000)break;
      yield 'attente';}
    J.fait.add(c);} /* ce tronçon sera maillé ici : un résultat tardif du travailleur est ignoré */
  GRW.minline++;
  return yield* grtMailleNetsG(V,c,LL);}
function grwCompare(V,c,LL,r){ /* (banc, ?grottecompare=1) le même tronçon maillé ICI : les tableaux du travailleur doivent être les mêmes au bit près */
  try{const it=grtMailleNetsG(V,c,LL);let x;do{x=it.next();}while(!x.done);const q=x.value;
    const egal=function(a,b){if(!a||!b||a.length!==b.length)return false;const A=new Uint8Array(a.buffer,a.byteOffset,a.byteLength),B=new Uint8Array(b.buffer,b.byteOffset,b.byteLength);for(let i=0;i<A.length;i++)if(A[i]!==B[i])return false;return true;};
    if(q.nv===r.nv&&q.nt===r.nt&&egal(q.P.subarray(0,q.nv*3),r.P.subarray(0,r.nv*3))&&egal(q.F.subarray(0,q.nv*4),r.F.subarray(0,r.nv*4))&&egal(q.L.subarray(0,q.nv*4),r.L.subarray(0,r.nv*4)))GRW.cmpOk++;else GRW.cmpKo++;}
  catch(e){GRW.cmpKo++;GRW.err='compare : '+(e&&e.message||e);}}
function grwFin(){try{const J=GRW.maille;GRW.maille=null;if(J){J.annule=true;J.res.clear();try{if(GRW.w)GRW.w.postMessage({t:'fin'});}catch(e){}}}catch(e){}} /* (try : grotteVide peut tourner avant que ce morceau soit lu) */
window.dbgGrotteTrav=function(){return {compare:GRW.cmp?{egaux:GRW.cmpOk,differents:GRW.cmpKo}:null,mailles:{duTravailleur:GRW.mfaits,ici:GRW.minline,actif:!!GRW.maille},on:GRW.on,travailleur:GRW.w===undefined?'pas créé':GRW.w?'prêt':'indisponible',faits:GRW.faits,replis:GRW.replis,msCreusement:GRW.ms,err:GRW.err};};
window.dbgGrotteHash=function(){const V=GROTTE.V;if(!V)return null;let h=2166136261>>>0;const mix=function(a){for(let i=0;i<a.length;i++){h^=a[i]&255;h=Math.imul(h,16777619)>>>0;}};
  for(let c=0;c<V.pool.length;c++){mix(V.pool[c]);mix(new Uint8Array(V.dn[c].buffer,V.dn[c].byteOffset,V.dn[c].byteLength));mix(new Uint8Array(V.si[c].buffer,V.si[c].byteOffset,V.si[c].byteLength));}
  return {hash:h.toString(16),troncons:V.pool.length,air:V.nAir,chS:V.chS.length,travailleur:GROTTE.tm&&GROTTE.tm.travailleur,tm:GROTTE.tm||null,pretMailles:!!GROTTE.pret,triangles:GROTTE.n&&GROTTE.n.triangles};};
