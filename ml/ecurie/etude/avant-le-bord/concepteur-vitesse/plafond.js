#!/usr/bin/env node
/* ===== LE PLAFOND DE VITESSE SUR DECOR : CE QUE LA REGLE AURAIT FAIT SUR LES TRACES (28/11/2026, etude « avant le bord », le concepteur vitesse) =====
   Relit les 40 traces de ../../sortie-preparee/sorties/lignes/*.jsonl.gz SANS jouer aucune course. Les decollages viennent des evenements du jeu
   (comme ../lecteur-traces/avant-le-bord.js, meme cle de doublon). Les vues au sol en double (courses « libre » qui rejouent une course tenue) sont
   retirees par leur cle (graine, t, carte, vitesse, lat, cap).
   Ecrit : plafond.txt et plafond.json a cote de ce fichier.
   usage : node ml/ecurie/etude/avant-le-bord/concepteur-vitesse/plafond.js */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,LIG=path.join(ICI,'..','..','sortie-preparee','sorties','lignes');
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
const q=(a,p)=>{const b=a.filter(x=>x!=null&&isFinite(x)).sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(2);};
const inc=(o,k,n)=>{o[k]=(o[k]||0)+(n==null?1:n);};
const pc=(a,b)=>b?Math.round(1000*a/b)/10+' %':'-';
const L=[],P=s=>L.push(s),J={};

function lire(){const C=[];
  for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
    const T=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
    C.push({nom:n.replace(/\.jsonl\.gz$/,''),h:T[0],V:T.slice(1).filter(v=>!v.erreurDiag)});}
  return C;}
const C=lire();

/* ---------- les vues au sol, sans doublon, avec l'anciennete de l'ordre de nitro (depuis combien de temps il n'a pas change, au sol contigu) ---------- */
const vuKey=new Set();
for(const c of C){let depuis=0,prev=null,tPrev=null,plein=false;
  for(const s of c.V){
    if(s.mo!=='s'){prev=null;tPrev=null;depuis=0;continue;}
    const nit=!!(s.O&&s.O.nitro);
    if(prev===null||tPrev==null||s.t-tPrev>.15||nit!==prev)depuis=0;else depuis+=s.t-tPrev;
    prev=nit;tPrev=s.t;s._nit=nit;s._dep=depuis;
    /* la jauge pleine du pilote (modele.js l.283 : jaugeAllume 0,45, jaugeCoupe 0,25 chez c0025) refaite ici */
    const jg=(s.n||0)+(s.r||0);if(jg>.45)plein=true;else if(jg<.25)plein=false;s._plein=plein;s._jg=jg;
    const k=c.h.graine+'|'+s.t+'|'+s.c+'|'+s.v+'|'+s.lat+'|'+s.cap;s._dbl=vuKey.has(k);vuKey.add(k);}}
const SOL=[];for(const c of C)for(const s of c.V)if(s.mo==='s'&&!s._dbl)SOL.push(s);
const SOLD=SOL.filter(s=>DECOR[s.c]);
P('LE PLAFOND DE VITESSE SUR DECOR — relu sans course ('+C.length+' traces, '+new Date().toISOString().slice(0,10)+')');
P('vues au sol sans doublon : '+SOL.length+' ; sur decor : '+SOLD.length+' ; nitro demandee sur decor : '+pc(SOLD.filter(s=>s._nit).length,SOLD.length)+' ; toutes maps : '+pc(SOL.filter(s=>s._nit).length,SOL.length));
P('');

/* ---------- 1. la vitesse selon le palier, nitro tenue ou coupee depuis 1 s au moins ---------- */
P('== 1. La vitesse au sol sur decor selon le palier (m/s) : nitro demandee depuis >= 1 s | coupee depuis >= 1 s (ni glisse ni rebond ni dessous) ==');
const parPal={};
for(const s of SOLD){if(s.gl||s.rb||s.de||s._dep<1-1e-9)continue;const k=s.pal;parPal[k]=parPal[k]||{on:[],off:[]};parPal[k][s._nit?'on':'off'].push(s.v);}
const VOFF={},VON={};
for(const k of Object.keys(parPal).map(Number).sort((a,b)=>a-b)){const o=parPal[k];VOFF[k]=q(o.off,.5);VON[k]=q(o.on,.5);
  P('  palier '+String(k).padStart(2)+' : nitro '+String(o.on.length).padStart(5)+' vues, q10/50/90 '+[.1,.5,.9].map(p=>q(o.on,p)).join(' / ')+'   |  coupee '+String(o.off.length).padStart(5)+' vues, q10/50/90 '+[.1,.5,.9].map(p=>q(o.off,p)).join(' / '));}
J.vitesseParPalier={nitro:VON,coupee:VOFF};
{const tous={};for(const s of SOLD){tous[s.pal]=tous[s.pal]||[];tous[s.pal].push(s.v);}
  P('  toutes vues au sol sur decor, part au-dessus de 143 m/s par palier : '+Object.keys(tous).map(Number).sort((a,b)=>a-b).map(k=>k+': '+pc(tous[k].filter(v=>v>143).length,tous[k].length)+' ('+tous[k].length+')').join(' ; '));}
P('');

/* ---------- les decollages subis (evenements), sans doublon ---------- */
function decollagesDe(c){
  const ev=c.h.ev||[],V=c.V,D=[];let tPose=-9;
  for(let i=0;i<ev.length;i++){const e=ev[i];
    if(e[1]==='pose'){tPose=e[0];continue;}
    if(e[1]!=='decol')continue;
    const fin=ev.slice(i+1).find(x=>x[1]==='pose'||x[1]==='mort')||null,td=e[0],co=e[4]<0?-1:1;
    const sol=[];let kS=-1;
    for(let k=V.length-1;k>=0;k--){if(V[k].t<=td+1e-9){if(V[k].mo==='v'&&Math.abs(V[k].t-td)<1e-6)continue;kS=k;break;}}
    if(kS>=0&&V[kS].mo==='s'&&V[kS].t>tPose+1e-9){
      for(let k=kS;k>=0;k--){const s=V[k];if(s.mo!=='s'||s.t<=tPose+1e-9)break;if(sol.length&&sol[sol.length-1].t-s.t>.15)break;if(td-s.t>6.05)break;sol.push(s);}}
    const S=sol[0]||null;
    const voulu=!!(S&&S.D&&S.D.so)||!!(V.find(v=>v.mo==='v'&&v.t>td&&v.D&&v.D.vo&&v.t-td<.2));
    D.push({course:c.nom,graine:c.h.graine,carte:S?S.c:null,td,s:e[3],latDecol:e[4],kmhDecol:e[5],co,fin:fin?fin[1]:'tmax',cause:fin&&fin[1]==='mort'?fin[2]:null,
      dt:fin?+(fin[0]-td).toFixed(2):null,voulu,sol});}
  return D;}
const tous=[];for(const c of C)tous.push(...decollagesDe(c));
{const vu=new Map();for(const d of tous){const k=d.graine+'|'+d.td+'|'+d.s+'|'+d.latDecol+'|'+d.kmhDecol+'|'+d.dt;if(vu.has(k))d.double=1;else vu.set(k,1);}}
const U=tous.filter(d=>!d.double),subis=U.filter(d=>!d.voulu),decor=subis.filter(d=>DECOR[d.carte]);
const M=decor.filter(d=>d.fin==='mort'),N=decor.filter(d=>d.fin==='pose');
P('== 2. Le perimetre (controle : doit recouper les lecteurs) ==');
P('  decollages subis distincts '+subis.length+' (morts '+subis.filter(d=>d.fin==='mort').length+') ; sur decor '+decor.length+' : morts '+M.length+', poses '+N.length+', tmax '+decor.filter(d=>d.fin==='tmax').length);
const vueA=(d,R)=>{let b=null,bd=9;for(const s of d.sol){const x=Math.abs((d.td-s.t)-R);if(x<bd){bd=x;b=s;}}return b&&bd<=.06?b:null;};
P('');

/* ---------- 3. vitesse absolue ou vitesse en trop pour le palier ? ---------- */
P('== 3. A 1,5 s avant le decollage : la vitesse (m/s), et la vitesse divisee par la mediane « nitro coupee » du meme palier (§ 1) ==');
function rangCarte(val){/* le rang moyen des morts dans leur carte (0,5 = hasard) et sa p par permutation dans la carte (4 000 tirages, graine fixe) */
  const B=decor.filter(d=>d.fin!=='tmax'&&val(d)!=null),cartes=[...new Set(B.map(d=>d.carte))];
  const stat=et=>{let s=0,n=0;for(const k of cartes){const X=B.map((d,i)=>({v:val(d),m:et[i],c:d.carte})).filter(x=>x.c===k);for(const x of X){if(!x.m)continue;
      const inf=X.filter(y=>y!==x&&y.v<x.v).length,eg=X.filter(y=>y!==x&&y.v===x.v).length;if(X.length>1){s+=(inf+eg/2)/(X.length-1);n++;}}}return n?s/n:null;};
  const et0=B.map(d=>d.fin==='mort'?1:0),s0=stat(et0);let x=987654321>>>0;const rnd=()=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296;};
  let plus=0;const NP=4000;
  for(let p=0;p<NP;p++){const et=et0.slice();for(const k of cartes){const I=B.map((d,i)=>d.carte===k?i:-1).filter(i=>i>=0);for(let a=I.length-1;a>0;a--){const b=Math.floor(rnd()*(a+1));const t=et[I[a]];et[I[a]]=et[I[b]];et[I[b]]=t;}}
    if(Math.abs(stat(et)-.5)>=Math.abs(s0-.5)-1e-12)plus++;}
  return {n:B.length,morts:et0.filter(Boolean).length,rang:+s0.toFixed(3),p:+((plus+1)/(NP+1)).toFixed(4)};}
const v15=d=>{const s=vueA(d,1.5);return s?s.v:null;};
const x15=d=>{const s=vueA(d,1.5);return s&&VOFF[s.pal]?+(s.v/VOFF[s.pal]).toFixed(3):null;};
const p15=d=>{const s=vueA(d,1.5);return s?s.pal:null;};
J.rang={vitesse:rangCarte(v15),vitesseSurPalier:rangCarte(x15),palier:rangCarte(p15)};
P('  rang moyen des morts dans leur carte (0,5 = hasard), permutation dans la carte :');
P('    vitesse a 1,5 s            : '+JSON.stringify(J.rang.vitesse));
P('    vitesse / mediane du palier : '+JSON.stringify(J.rang.vitesseSurPalier));
P('    palier a 1,5 s             : '+JSON.stringify(J.rang.palier));
P('  medianes morts | poses : vitesse '+q(M.map(v15),.5)+' | '+q(N.map(v15),.5)+' ; vitesse/palier '+q(M.map(x15),.5)+' | '+q(N.map(x15),.5)+' ; palier '+q(M.map(p15),.5)+' | '+q(N.map(p15),.5));
P('');

/* ---------- 4. le seuil choisi sans la graine jugee (8 graines : on choisit le seuil sur 7, on compte sur la 8e) ---------- */
P('== 4. Le seuil de vitesse a 1,5 s choisi SANS la graine jugee (Youden sur 7 graines, compte sur la 8e) ==');
{const B=decor.filter(d=>d.fin!=='tmax'&&v15(d)!=null),G=[...new Set(B.map(d=>d.graine))].sort();
  const youden=X=>{const m=X.filter(d=>d.fin==='mort').map(v15),n=X.filter(d=>d.fin==='pose').map(v15),vals=[...new Set(m.concat(n))].sort((a,b)=>a-b);let best=null;
    for(let i=0;i<vals.length-1;i++){const s=(vals[i]+vals[i+1])/2,j=m.filter(x=>x>s).length/m.length-n.filter(x=>x>s).length/n.length;if(!best||j>best.j)best={j,s};}return best;};
  let a=0,b=0,c=0,d=0;const seuils=[];
  for(const g of G){const y=youden(B.filter(x=>x.graine!==g));seuils.push(+y.s.toFixed(1));
    for(const x of B.filter(x=>x.graine===g)){const haut=v15(x)>y.s;if(x.fin==='mort'){if(haut)a++;else b++;}else{if(haut)c++;else d++;}}}
  P('  seuils trouves (un par graine ecartee) : '+seuils.join(', '));
  P('  hors echantillon : morts au-dessus '+a+' / en dessous '+b+' ; poses au-dessus '+c+' / en dessous '+d+'  → part de morts au-dessus '+pc(a,a+c)+', en dessous '+pc(b,b+d));
  J.horsEchantillon={seuils,mortsHaut:a,mortsBas:b,posesHaut:c,posesBas:d};
  const y=youden(B);P('  (dans l\'echantillon, seuil '+y.s.toFixed(1)+' : J '+y.j.toFixed(2)+')');}
P('');

/* ---------- 5. la regle : au sol sur decor, pas de nitro au-dessus de S ---------- */
P('== 5. La regle « sur decor, au-dessus de S m/s, la nitro demandee est coupee » : ou elle aurait agi ==');
P('   agit = vue au sol sur decor, nitro demandee par le pilote, vitesse > S, aucun raccourci engage. Fenetre d\'un decollage : le sol contigu de 0,6 a 5 s avant.');
P('   « >= 1 s » : au moins 10 vues ou elle agit dans la fenetre (a −12 m/s par seconde contre la nitro tenue, lecteur du code § 4 : assez pour perdre une dizaine de m/s).');
const agit=(s,S)=>!!(DECOR[s.c]&&s._nit&&s.v>S&&!(s.D&&s.D.so));
const nitSol=SOL.filter(s=>s._nit).length,nitSolD=SOLD.filter(s=>s._nit).length;
J.regle={};
for(const S of [120,130,135,140,143,150,160,170]){
  const nA=SOLD.filter(s=>agit(s,S)).length;
  const t=d=>d.sol.filter(s=>d.td-s.t>=.6-1e-9&&d.td-s.t<=5.05&&agit(s,S)).length;
  const fen=d=>d.sol.some(s=>d.td-s.t>=.6-1e-9);
  const Mf=M.filter(fen),Nf=N.filter(fen);
  const mT=Mf.filter(d=>t(d)>0).length,nT=Nf.filter(d=>t(d)>0).length,mT1=Mf.filter(d=>t(d)>=10).length,nT1=Nf.filter(d=>t(d)>=10).length;
  const parC={};for(const k of ['canyon','grotte','ville','jade'])parC[k]=Mf.filter(d=>d.carte===k&&t(d)>=10).length+'/'+Mf.filter(d=>d.carte===k).length+' morts, '+Nf.filter(d=>d.carte===k&&t(d)>=10).length+'/'+Nf.filter(d=>d.carte===k).length+' poses';
  /* le plafond optimiste : les decollages touches (>= 1 s) prendraient le taux de mort des non touches de la meme carte */
  let apres=0;for(const k of ['canyon','grotte','ville','jade']){const a=Mf.filter(d=>d.carte===k&&t(d)>=10).length,c=Nf.filter(d=>d.carte===k&&t(d)>=10).length,b=Mf.filter(d=>d.carte===k&&t(d)<10).length,dd=Nf.filter(d=>d.carte===k&&t(d)<10).length;
    apres+=(b+dd)?(a+c)*b/(b+dd):a;}
  J.regle[S]={vuesAgit:nA,partSolDecor:nA/SOLD.length,partNitroDecor:nA/nitSolD,partSolTout:nA/SOL.length,mortsTouches:mT,posesTouches:nT,mortsTouches1s:mT1,posesTouches1s:nT1,mortsFenetre:Mf.length,posesFenetre:Nf.length,parCarte:parC,mortsAttenduesApres:+apres.toFixed(1)};
  P('  S '+S+' : agit sur '+nA+' vues = '+pc(nA,SOLD.length)+' du sol sur decor, '+pc(nA,nitSolD)+' de sa nitro, '+pc(nA,SOL.length)+' de tout le sol ('+pc(nA,nitSol)+' de toute la nitro au sol)');
  P('         decollages touches : morts '+mT+'/'+Mf.length+', poses '+nT+'/'+Nf.length+' ; >= 1 s : morts '+mT1+'/'+Mf.length+', poses '+nT1+'/'+Nf.length+' ; plafond optimiste (taux des non touches, par carte) : '+mT1+' morts touchees → '+apres.toFixed(1)+' attendues');
  P('         >= 1 s par carte : '+JSON.stringify(parC));}
P('');

/* ---------- 6. la meme regle avec un seuil qui monte avec le palier : S = S1 + pente x (palier − 1) ---------- */
P('== 6. Le seuil qui suit le palier : S = k x la mediane « nitro coupee » du palier (§ 1) — ce que la vue offrirait par palier.vmax, que les traces n\'ont pas ==');
for(const k of [1.0,1.05,1.1,1.15]){
  const ag=s=>!!(DECOR[s.c]&&s._nit&&VOFF[s.pal]&&s.v>k*VOFF[s.pal]&&!(s.D&&s.D.so));
  const nA=SOLD.filter(ag).length,t=d=>d.sol.filter(s=>d.td-s.t>=.6-1e-9&&d.td-s.t<=5.05&&ag(s)).length,fen=d=>d.sol.some(s=>d.td-s.t>=.6-1e-9);
  const Mf=M.filter(fen),Nf=N.filter(fen);
  P('  k '+k+' : agit sur '+pc(nA,SOLD.length)+' du sol sur decor ('+pc(nA,nitSolD)+' de sa nitro) ; >= 1 s : morts '+Mf.filter(d=>t(d)>=10).length+'/'+Mf.length+', poses '+Nf.filter(d=>t(d)>=10).length+'/'+Nf.length);}
P('');

/* ---------- 7. pourquoi la nitro est coupee avant le decollage (refait depuis modele.js l.282-296) ---------- */
P('== 7. Pourquoi le pilote coupe la nitro avant un decollage subi sur decor (refait : lache = tenue.tient faux ; pose = |lat| < demi − 6, |cap| < 0,35, ni glisse ni rebond ; jauge) ==');
P('   « virage » = rien de tout cela : c\'est le test « sur » (marge de vitesse du virage ou volant demande), que les traces ne gardent pas.');
for(const R of [2,1.5,1,.8,.6,.3]){const o={morts:{},poses:{}};
  for(const [nom,X] of [['morts',M],['poses',N]])for(const d of X){const s=vueA(d,R);if(!s)continue;
    let pq;if(s._nit)pq='nitro';else if(s.tn&&s.tn.ti===false)pq='lache';else if(!(Math.abs(s.lat)<s.demi-6&&Math.abs(s.cap)<.35&&!s.gl&&!s.rb))pq='de travers/bord';else if(!(s.nl||s._plein))pq='jauge';else pq='virage';
    inc(o[nom],pq);}
  P('  a '+R+' s : morts '+JSON.stringify(o.morts)+' ; poses '+JSON.stringify(o.poses));J['pourquoi'+R]=o;}
P('');

/* ---------- 8. le taux de decollages subis et de morts par minute de sol, selon la vitesse 1,5 s avant ---------- */
P('== 8. Par tranche de vitesse (sol sur decor) : minutes de sol, decollages subis dont la vue a 1,5 s est dans la tranche, morts ==');
{const T=[[0,110],[110,125],[125,143],[143,160],[160,999]];
  for(const [a,b] of T){const min=SOLD.filter(s=>s.v>=a&&s.v<b).length*.1/60,D=decor.filter(d=>{const v=v15(d);return v!=null&&v>=a&&v<b;}),m=D.filter(d=>d.fin==='mort').length;
    P('  '+String(a).padStart(3)+'–'+String(b).padEnd(3)+' m/s : '+min.toFixed(1).padStart(5)+' min de sol ; decollages '+String(D.length).padStart(3)+' ('+(D.length/min).toFixed(1)+' par min) ; morts '+m+' ('+(m/min).toFixed(2)+' par min ; '+pc(m,D.length)+' des decollages)');}
  for(const k of ['canyon','grotte','ville','jade']){const bas=SOLD.filter(s=>s.c===k&&s.v<143).length*.1/60,haut=SOLD.filter(s=>s.c===k&&s.v>=143).length*.1/60;
    const Db=decor.filter(d=>d.carte===k&&v15(d)!=null&&v15(d)<143),Dh=decor.filter(d=>d.carte===k&&v15(d)!=null&&v15(d)>=143);
    P('  '+k.padEnd(7)+' sous 143 : '+bas.toFixed(1)+' min, '+Db.length+' decollages ('+(Db.length/bas).toFixed(1)+'/min), '+Db.filter(d=>d.fin==='mort').length+' morts ; au-dessus : '+haut.toFixed(1)+' min, '+Dh.length+' decollages ('+(haut?(Dh.length/haut).toFixed(1):'-')+'/min), '+Dh.filter(d=>d.fin==='mort').length+' morts');}}
P('');

/* ---------- 9. la jauge et la nitro au decollage (l'angle « energie ») ---------- */
P('== 9. L\'energie au bord : jauge (nitro + reserve) et nitro a la derniere vue au sol, morts | poses ==');
{const jg=d=>d.sol[0]?d.sol[0]._jg:null,ni=d=>d.sol[0]?d.sol[0]._nit:null;
  P('  jauge, q25/50/75 : morts '+[.25,.5,.75].map(p=>q(M.map(jg),p)).join(' / ')+' ; poses '+[.25,.5,.75].map(p=>q(N.map(jg),p)).join(' / ')+' ; rang dans la carte '+JSON.stringify(rangCarte(jg)));
  P('  nitro demandee a la derniere vue au sol : morts '+M.filter(ni).length+'/'+M.filter(d=>d.sol[0]).length+' ; poses '+N.filter(ni).length+'/'+N.filter(d=>d.sol[0]).length);
  P('  jauge sous 0,25 a la derniere vue : morts '+M.filter(d=>jg(d)!=null&&jg(d)<.25).length+' ; poses '+N.filter(d=>jg(d)!=null&&jg(d)<.25).length);}
P('');

/* ---------- 10. ce que la nitro fait a la vitesse, autour du seuil : la variation sur 1 s, nitro tenue ou coupee, au-dessus de 130 m/s ---------- */
P('== 10. La variation de vitesse sur 1 s au sol sur decor, au-dessus de 130 m/s (ordre de nitro stable de t a t + 1 s, ni glisse ni rebond ni dessous) ==');
{const on=[],off=[];
  for(const c of C){const V=c.V;for(let i=0;i<V.length;i++){const s=V[i];if(s.mo!=='s'||s._dbl||!DECOR[s.c]||s.v<130||s.gl||s.rb||s.de)continue;
    let j=i,ok=true;while(j+1<V.length&&V[j+1].t-s.t<=1+1e-9){j++;if(V[j].mo!=='s'||V[j]._nit!==s._nit||V[j].t-V[j-1].t>.15||V[j].gl||V[j].rb){ok=false;break;}}
    if(!ok||Math.abs(V[j].t-s.t-1)>.06)continue;(s._nit?on:off).push(V[j].v-s.v);}}
  P('  nitro tenue : '+on.length+' mesures, q10/50/90 '+[.1,.5,.9].map(p=>q(on,p)).join(' / ')+' m/s ; nitro coupee : '+off.length+' mesures, q10/50/90 '+[.1,.5,.9].map(p=>q(off,p)).join(' / ')+' m/s');
  J.variation1s={tenue:{n:on.length,q:[.1,.5,.9].map(p=>q(on,p))},coupee:{n:off.length,q:[.1,.5,.9].map(p=>q(off,p))}};}

fs.writeFileSync(path.join(ICI,'plafond.txt'),L.join('\n')+'\n');
fs.writeFileSync(path.join(ICI,'plafond.json'),JSON.stringify(J,null,1));
process.stdout.write(L.join('\n')+'\n');

/* ---------- 11. la meme regle SANS la jade (canyon, grotte, ville) : la jade prend la moitie des vues rapides pour 1 mort sur 22 ---------- */
{const L2=[],P2=s=>L2.push(s),TROIS={canyon:1,grotte:1,ville:1};
  P2('');P2('== 11. La regle sans la jade (canyon, grotte, ville seulement) ==');
  const S3=SOLD.filter(s=>TROIS[s.c]),nit3=S3.filter(s=>s._nit).length;J.sansJade={};
  for(const S of [135,140,143,145,150]){
    const nA=S3.filter(s=>agit(s,S)).length,t=d=>d.sol.filter(s=>d.td-s.t>=.6-1e-9&&d.td-s.t<=5.05&&agit(s,S)).length,fen=d=>TROIS[d.carte]&&d.sol.some(s=>d.td-s.t>=.6-1e-9);
    const Mf=M.filter(fen),Nf=N.filter(fen),o={vues:nA,partSol3:nA/S3.length,partNitro3:nA/nit3,partSolDecor:nA/SOLD.length,morts:Mf.length,poses:Nf.length,
      mortsTouches:Mf.filter(d=>t(d)>0).length,posesTouches:Nf.filter(d=>t(d)>0).length,morts1s:Mf.filter(d=>t(d)>=10).length,poses1s:Nf.filter(d=>t(d)>=10).length};
    J.sansJade[S]=o;
    P2('  S '+S+' : agit sur '+nA+' vues = '+pc(nA,S3.length)+' du sol de ces 3 maps ('+pc(nA,nit3)+' de leur nitro ; '+pc(nA,SOLD.length)+' de tout le sol sur decor) ; touches : morts '+o.mortsTouches+'/'+o.morts+', poses '+o.posesTouches+'/'+o.poses+' ; >= 1 s : morts '+o.morts1s+'/'+o.morts+', poses '+o.poses1s+'/'+o.poses);}
  /* les 4 morts « sans sol a 0,6 s » et les morts jamais touchees a S 143 */
  const t143=d=>d.sol.filter(s=>d.td-s.t>=.6-1e-9&&d.td-s.t<=5.05&&agit(s,143)).length;
  P2('  les morts sur decor que la regle (S 143) ne touche pas du tout : '+M.filter(d=>t143(d)===0).map(d=>d.carte+' '+d.graine+' t '+d.td+' ('+(d.sol.some(s=>d.td-s.t>=.6-1e-9)?'v a 1,5 s '+v15(d):'pas de sol a 0,6 s')+', '+d.cause+')').join(' ; '));
  /* les paliers ou la regle agit */
  const pp={};for(const s of S3)if(agit(s,143))inc(pp,s.pal);P2('  paliers des vues ou elle agit (S 143, 3 maps) : '+JSON.stringify(pp));
  fs.appendFileSync(path.join(ICI,'plafond.txt'),L2.join('\n')+'\n');fs.writeFileSync(path.join(ICI,'plafond.json'),JSON.stringify(J,null,1));process.stdout.write(L2.join('\n')+'\n');}
