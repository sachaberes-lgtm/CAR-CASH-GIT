
/* ===== LE CREUSEMENT DE LA GROTTE DANS UN TRAVAILLEUR (2026-11-08, vitesse-fluide : « sortir le creusement du fil principal ») =====
   MESURÉ (Mac ×4, 10 s par palier moteur) : la grotte d'après est le plus gros travail du pré-bâti (≈ 6,5-7,2 s de calcul) et `grtCreuse1` en est le cœur (5,7 ms par image à grande vitesse) — calcul pur sur des tableaux
   typés : une grille de densité (cases de 12 m) creusée par un ellipsoïde autour de chaque échantillon de route, le bruit mis en cache Int8 par case. Ici le creusement entier (grtMonde, puis pour chaque échantillon grtNoyau
   et grtCreuse1, EXACTEMENT la boucle de buildGrotteG) tourne dans un travailleur, avec les MÊMES fonctions (recopiées par leur source, comme le canyon : cyTravailleur) : même code, mêmes entrées (les tableaux de la route,
   les bornes, ROAD_HALF et THICK du travail en cours) = la même grille au bit près (dbgGrotteHash compare les deux chemins). Le fil principal garde le reste (lacs, piliers, décors, mailles) et ne fait qu'ATTENDRE
   (`yield 'attente'` : prebTravaille rend la main tout de suite, sans brûler la tranche).
   Seulement sur TÉLÉPHONE (TEL_NATIF) et au PRÉ-BÂTI (tranches finies : un bâti « d'un trait » ne peut pas attendre un message) ; `?grotteworker=0` = avant. REPLI AUTOMATIQUE sur le fil principal : pas de Worker, création ou
   message en erreur, ou la tranche devient infinie pendant l'attente (le passage du portail sans voile : le travailleur est alors abandonné et le creusement se refait ici, comme avant). Banc : dbgGrotteHash(), dbgGrotteTrav(). */
const GRW={on:TEL_NATIF&&typeof Worker!=='undefined'&&!/[?&]grotteworker=0\b/.test(location.search),w:undefined,job:0,cur:null,faits:0,replis:0,ms:0,err:'',vu:false};
const GRW_R=['X','Y','Z','NNX','NNY','NNZ','BX','BY','BZ','LAT','BAS','RH','UP','DN','EX','NZ','EXT'];
function grwTravailleur(){
  if(GRW.w!==undefined)return GRW.w;
  try{const fns=[grtH3,grtN3,grtRoche,grtMonde,grtCh,grtNoyau,grtCreuse1].map(function(f){return f.toString();}).join('\n');
    const code="'use strict';var GRT={B:12,K:1.6},GRV={nzK:2},GRT_VASTE=true,ROAD_HALF=28,THICK=5.2,JF={lim:Infinity};\n"+fns+
      "\nonmessage=function(e){var m=e.data,t0=performance.now();GRT={B:m.B,K:m.K};GRV={nzK:m.nzK};GRT_VASTE=m.vaste;ROAD_HALF=m.rh;THICK=m.th;var R=m.R,V=grtMonde(m.x0,m.y0,m.z0,m.x1,m.y1,m.z1);"+
      "for(var q=0,ac=1e9;q<R.n;q++){grtNoyau(V,R,q);ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;for(var g1 of grtCreuse1(V,R,q));if(R.BAS[q]>0)for(var g2 of grtCreuse1(V,R,q,{ax:0,ay:1,az:0,rh:R.RH[q]*.85,up:14,dn:R.BAS[q]}));}"+
      "var n=V.pool.length,P=new Uint8Array(n*4096),D=new Int8Array(n*4096),SI=new Int32Array(n*64),SD=new Float32Array(n*64);"+
      "for(var c=0;c<n;c++){P.set(V.pool[c],c*4096);D.set(V.dn[c],c*4096);SI.set(V.si[c],c*64);SD.set(V.sd[c],c*64);}"+
      "postMessage({job:m.job,n:n,P:P,D:D,SI:SI,SD:SD,dir:V.dir,chS:V.chS,cle:V.cle,nAir:V.nAir,ms:Math.round(performance.now()-t0)},[P.buffer,D.buffer,SI.buffer,SD.buffer,V.dir.buffer]);};";
    const W=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
    W.onmessage=function(e){const r=e.data,c=GRW.cur;if(!c||r.job!==c.job||c.annule)return;c.r=r;c.fini=true;};
    W.onerror=function(e){GRW.err=String(e&&e.message||e);GRW.on=false;GRW.w=null;const c=GRW.cur;if(c)c.echec=true;try{W.terminate();}catch(e2){}};
    GRW.w=W;}catch(e){GRW.err=String(e&&e.message||e);GRW.w=null;GRW.on=false;}
  return GRW.w;}
function grwAbandon(c){ /* le travail en cours est jeté : on arrête le travailleur (il finirait un creusement dont personne ne veut, et ferait attendre le suivant) */
  if(c)c.annule=true;if(GRW.cur===c)GRW.cur=null;try{if(GRW.w)GRW.w.terminate();}catch(e){}GRW.w=undefined;}
function* grwCreuse(V,R,b){ /* rend vrai si le travailleur a creusé (V est alors rempli) ; faux : le fil principal creuse comme avant */
  if(!GRW.on||JF.lim===Infinity)return false;
  const W=grwTravailleur();if(!W)return false;
  const c={job:++GRW.job,fini:false,echec:false,annule:false,r:null,t0:performance.now()};GRW.cur=c;
  const Rm={n:R.n};for(const k of GRW_R)Rm[k]=R[k].slice();
  try{W.postMessage({job:c.job,B:GRT.B,K:GRT.K,nzK:GRV.nzK,vaste:GRT_VASTE,rh:ROAD_HALF,th:THICK,x0:b.x0,y0:b.y0,z0:b.z0,x1:b.x1,y1:b.y1,z1:b.z1,R:Rm});}catch(e){GRW.err=String(e&&e.message||e);GRW.on=false;grwAbandon(c);return false;}
  try{while(!c.fini&&!c.echec){if(JF.lim===Infinity){GRW.replis++;grwAbandon(c);return false;}yield 'attente';}}
  finally{if(!c.fini)grwAbandon(c);}
  if(c.echec||!c.r){GRW.replis++;return false;}
  const r=c.r,n=r.n;V.dir=r.dir;V.pool=new Array(n);V.dn=new Array(n);V.si=new Array(n);V.sd=new Array(n);V.nzc=new Array(n).fill(null);
  for(let k=0;k<n;k++){V.pool[k]=r.P.subarray(k*4096,(k+1)*4096);V.dn[k]=r.D.subarray(k*4096,(k+1)*4096);V.si[k]=r.SI.subarray(k*64,(k+1)*64);V.sd[k]=r.SD.subarray(k*64,(k+1)*64);}
  V.chS=r.chS;V.cle=r.cle;V.nAir=r.nAir;GRW.faits++;GRW.ms=r.ms;GRW.cur=null;return true;}
window.dbgGrotteTrav=function(){return {on:GRW.on,travailleur:GRW.w===undefined?'pas créé':GRW.w?'prêt':'indisponible',faits:GRW.faits,replis:GRW.replis,msCreusement:GRW.ms,err:GRW.err};};
window.dbgGrotteHash=function(){const V=GROTTE.V;if(!V)return null;let h=2166136261>>>0;const mix=function(a){for(let i=0;i<a.length;i++){h^=a[i]&255;h=Math.imul(h,16777619)>>>0;}};
  for(let c=0;c<V.pool.length;c++){mix(V.pool[c]);mix(new Uint8Array(V.dn[c].buffer,V.dn[c].byteOffset,V.dn[c].byteLength));mix(new Uint8Array(V.si[c].buffer,V.si[c].byteOffset,V.si[c].byteLength));}
  return {hash:h.toString(16),troncons:V.pool.length,air:V.nAir,chS:V.chS.length,travailleur:GROTTE.tm&&GROTTE.tm.travailleur,tm:GROTTE.tm||null,pretMailles:!!GROTTE.pret};};
