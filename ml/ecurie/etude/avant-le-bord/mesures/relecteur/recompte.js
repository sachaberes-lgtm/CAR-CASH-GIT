#!/usr/bin/env node
/* ===== LE RECOMPTE DES MESURES A ET C (28/11/2026, le relecteur adverse) =====
   Lecture seule de ../sorties/lignes/*.jsonl.gz. AUCUNE course. Ne requiert NI analyser.js du mesureur NI volsDe : les vols, leur issue,
   le cote, les reculs et les tests sont recodes ici, avec des choix volontairement differents quand le choix du mesureur est discutable :
   - un vol = une suite de vues « v » sans trou de plus de 0,15 s ; pose = une vue « s » le suit a 0,15 s au plus ; sinon mort, sauf a la fin
     d'une course coupee par le temps (« fin », retiree) ; recoupe avec le compteur de morts de l'en-tete ;
   - subi = la premiere vue du vol n'a pas « vo » (vol voulu) ; sur decor = carte de la premiere vue du vol ;
   - la vue « a x s avant » = la DERNIERE vue au sol de la suite d'avant dont t <= t0 - x + 0,05 et >= t0 - x - 0,15 (le mesureur : la plus proche a 0,06 s) ;
   - le rang : statistique de Mann-Whitney a l'interieur des strates, p par 20 000 permutations des etiquettes dans chaque strate.
   Ce qu'il ajoute : le biais du « dernier evenement » (une mort finit la course), des strates par course et par temps de course, la famille
   des decoupages regardes (le hasard), des definitions voisines (fenetres, seuils).
   usage (racine du depot) : node ml/ecurie/etude/avant-le-bord/mesures/relecteur/recompte.js -> relecteur/sorties/recompte.txt, recompte.json */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,LIG=path.join(ICI,'..','sorties','lignes'),OUT=path.join(ICI,'sorties');fs.mkdirSync(OUT,{recursive:true});
const DECOR=new Set(['canyon','grotte','jade','ville']);
const G=i=>3963000+37*i,ANC=new Set(),NEU=new Set();for(let i=200;i<208;i++)ANC.add(G(i));for(let i=400;i<416;i++)NEU.add(G(i));
const L=[],P=s=>{L.push(s);},J={};
let graine=12345;const rnd=()=>{graine^=graine<<13;graine^=graine>>>17;graine^=graine<<5;return (graine>>>0)/4294967296;};
const med=a=>{const b=a.filter(x=>x!=null&&x===x).sort((x,y)=>x-y);if(!b.length)return null;const m=(b.length-1)/2;return (b[Math.floor(m)]+b[Math.ceil(m)])/2;};
const f2=x=>x==null?'-':(+x).toFixed(2),f3=x=>x==null?'-':(+x).toFixed(3);
const LF=[0];for(let i=1;i<3000;i++)LF.push(LF[i-1]+Math.log(i));
function fisher(a,b,c,d){const m=a+c,N=b+d;let p=0;for(let x=a;x<=Math.min(b,m);x++){const y=m-x;if(y>d||y<0)continue;p+=Math.exp(LF[b]-LF[x]-LF[b-x]+LF[d]-LF[y]-LF[d-y]-LF[N]+LF[m]+LF[N-m]);}return Math.min(1,p);}

/* ---------- lecture ---------- */
function lire(filtre){const C=[];
  for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){const T=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
    const c={nom:n.replace('.jsonl.gz',''),h:T[0],V:T.slice(1).filter(v=>v.mo)};if(filtre(c))C.push(c);}
  return C;}
function vols(c){const V=c.V,out=[];
  for(let i=0;i<V.length;i++){if(V[i].mo!=='v'||(i>0&&V[i-1].mo==='v'&&V[i].t-V[i-1].t<=.15))continue;
    let j=i;while(V[j+1]&&V[j+1].mo==='v'&&V[j+1].t-V[j].t<=.15)j++;
    const nx=V[j+1];let issue;
    if(nx&&nx.mo==='s'&&nx.t-V[j].t<=.15)issue='pose';else if(!nx&&c.h.cause==='temps')issue='fin';else issue='mort';
    const sol=[];for(let k=i-1;k>=0&&V[k].mo==='s'&&(k===i-1?V[i].t-V[k].t<=.15:V[k+1].t-V[k].t<=.15);k--)sol.push(V[k]);
    out.push({course:c.nom,graine:c.h.graine,carte:V[i].c,t0:V[i].t,voulu:!!(V[i].D&&V[i].D.vo),so:sol[0]&&sol[0].D?sol[0].D.so:null,issue,sol,iv:i,jv:j});}
  return out;}
const vueA=(d,x)=>{for(const s of d.sol){const dt=d.t0-s.t;if(dt>=x-.05&&dt<=x+.15)return s;}return null;};   /* sol : la plus proche du decollage d'abord */

/* ---------- le rang a strate egale ---------- */
function rang(items,strate,N){N=N||20000;const S=new Map();
  for(const o of items){if(o.x==null||o.x!==o.x)continue;const k=strate(o);if(k==null)continue;if(!S.has(k))S.set(k,[]);S.get(k).push(o);}
  const ks=[...S.keys()].filter(k=>S.get(k).some(o=>o.m)&&S.get(k).some(o=>!o.m));if(!ks.length)return {rang:null,p:null,morts:0,poses:0,strates:0};
  const groupes=ks.map(k=>({x:S.get(k).map(o=>o.x),m:S.get(k).map(o=>o.m)}));
  const stat=lab=>{let s=0,n=0;groupes.forEach((g,gi)=>{const l=lab[gi];const Pz=[],M=[];for(let i=0;i<g.x.length;i++)(l[i]?M:Pz).push(g.x[i]);
      for(const m of M){let r=0;for(const p of Pz)r+=p<m?1:p===m?.5:0;s+=r/Pz.length;n++;}});return s/n;};
  const lab0=groupes.map(g=>g.m.slice()),s0=stat(lab0);let ge=0;
  for(let it=0;it<N;it++){const lab=lab0.map(a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=b[i];b[i]=b[j];b[j]=t;}return b;});if(stat(lab)>=s0-1e-12)ge++;}
  let nm=0,np=0;for(const g of groupes){nm+=g.m.filter(Boolean).length;np+=g.m.filter(x=>!x).length;}
  return {rang:+s0.toFixed(3),p:+((ge+1)/(N+1)).toFixed(4),morts:nm,poses:np,strates:ks.length};}
const dire=(mot,r)=>P('  '+mot+' : rang '+f3(r.rang)+', p '+r.p+' ('+r.morts+' morts / '+r.poses+' poses, '+r.strates+' strates)');

/* ===================== LES 40 COURSES (37 sans les doublons) ===================== */
const tout=lire(c=>ANC.has(c.h.graine));
const empT=new Set(tout.filter(c=>c.h.tenue).map(c=>c.h.empreinte));
const doublons=tout.filter(c=>!c.h.tenue&&empT.has(c.h.empreinte)).map(c=>c.nom);
const C=tout.filter(c=>doublons.indexOf(c.nom)<0);
P('LE RECOMPTE DU RELECTEUR (mesures A et C, « avant le bord »)');
P(C.length+' courses ; doublons retires (meme empreinte qu\'une course tenue) : '+doublons.join(', '));
/* recoupe : morts trouvees contre l'en-tete */
let mH=0,mT=0;const Vall=[];for(const c of C){const A=vols(c);Vall.push(...A);mH+=c.h.morts|0;mT+=A.filter(f=>f.issue==='mort').length;}
P('morts : en-tete '+mH+' ; trouvees ici (vols finis par un trou ou la fin) '+mT+' ; morts au sol (sans vol) = la difference');
/* LES DOUBLONS PARTIELS : une course libre restante qui partage des decollages (meme t0, meme vitesse) avec la course tenue de sa graine */
{let part=0,tot=0;for(const c of C.filter(c=>!c.h.tenue)){const tw=C.filter(x=>x.h.tenue&&x.h.graine===c.h.graine);
    const A=Vall.filter(f=>f.course===c.nom&&!f.voulu&&DECOR.has(f.carte));tot+=A.length;
    for(const f of A)if(tw.some(x=>Vall.some(g=>g.course===x.nom&&Math.abs(g.t0-f.t0)<.01&&g.sol[0]&&f.sol[0]&&g.sol[0].v===f.sol[0].v)))part++;}
  P('doublons partiels (decollage subi sur decor d\'une course libre restante, meme t0 et meme vitesse dans la course tenue de la meme graine) : '+part+' sur '+tot);J.doublonsPartiels=part;}
const SUB=Vall.filter(f=>!f.voulu&&DECOR.has(f.carte));
const fins=SUB.filter(f=>f.issue==='fin').length,sansSol=SUB.filter(f=>f.issue!=='fin'&&!f.sol.length);
const D=SUB.filter(f=>f.issue!=='fin'&&f.sol.length);
const M=D.filter(d=>d.issue==='mort'),Po=D.filter(d=>d.issue==='pose');
P('decollages subis sur decor : '+SUB.length+' ; coupes par la fin '+fins+' ; sans vue au sol a 0,15 s avant : '+sansSol.length+' ('+sansSol.filter(f=>f.issue==='mort').length+' morts) ; gardes : '+D.length+' = '+M.length+' morts + '+Po.length+' poses');
const pc={};for(const d of D){pc[d.carte]=pc[d.carte]||[0,0];pc[d.carte][d.issue==='mort'?0:1]++;}
P('par carte (morts / poses) : '+Object.keys(pc).sort().map(k=>k+' '+pc[k].join(' / ')).join(' ; '));
P('causes des morts : '+Object.entries(M.reduce((o,d)=>{const c=(C.find(x=>x.nom===d.course).h.causesMorts||[])[0]||'?';o[c]=(o[c]||0)+1;return o;},{})).map(e=>e.join(' ')).join(', ')+' (la premiere cause de chaque course, pour l\'ordre de grandeur)');
J.effectifs={courses:C.length,decollages:D.length,morts:M.length,poses:Po.length,parCarte:pc,fins,sansSol:sansSol.length};

/* ---------- LE BIAIS DU DERNIER EVENEMENT ---------- */
P('');P('== LE BIAIS DU DERNIER EVENEMENT : une mort finit presque toujours la course ==');
{let der=0,av=0,parC={};for(const d of M){const A=Vall.filter(f=>f.course===d.course);if(A.indexOf(d)===A.length-1)der++;
    av+=Po.filter(p=>p.course===d.course&&p.t0<d.t0).length;parC[d.course]=(parC[d.course]||0)+1;}
  const multi=Object.values(parC).filter(n=>n>1).length;
  P('  morts qui sont le dernier vol de leur course : '+der+' sur '+M.length+' ; courses avec plus d\'une mort subie sur decor : '+multi);
  const tM=med(M.map(d=>d.t0)),tP=med(Po.map(d=>d.t0));
  P('  instant du decollage (s de course), mediane morts / poses : '+f2(tM)+' / '+f2(tP)+' ; poses qui suivent une mort dans la meme course : '+Po.filter(p=>M.some(m=>m.course===p.course&&m.t0<p.t0)).length);
  P('  => une mort est TOUJOURS le dernier vol de sa course, donc au plus haut palier de sa course. Comparer une mort aux poses de SA course est donc biaise par construction (strates « meme course » ci-dessous : a ne pas lire comme une preuve).');
  P('     Comparer aux poses de toute la carte reste juste si le risque par decollage est constant : la mort tombe alors a un rang de decollage tire comme celui des poses. Controle voisin : la tranche de 30 s de course.');}

/* ---------- a. VITESSE OU PALIER ---------- */
P('');P('== a. VITESSE OU PALIER (ma vue a x s avant : la derniere vue au sol dans [x - 0,05 ; x + 0,15] s avant le decollage) ==');
const famille=[];
const item=(d,x)=>{const s=vueA(d,x);if(!s)return null;const pr=s.vg&&!s.vg.erreur&&s.vg.d!=null&&s.vg.d<3*Math.max(6,s.v);
  return {m:d.issue==='mort',carte:d.carte,course:d.course,t0:d.t0,v:s.v,pal:s.pal,vm:s.vm,rel:s.P&&s.P.vx?s.v/s.P.vx:null,ratio:pr&&s.vg.vs>0?s.v/s.vg.vs:null,besoin:s.lm>0?Math.abs(s.lr)/s.lm:null};};
const aRes=[];
for(const x of [2,1.5,1,.6]){const it=D.map(d=>item(d,x)).filter(Boolean);
  P('-- '+x+' s avant : '+it.filter(o=>o.m).length+' morts, '+it.filter(o=>!o.m).length+' poses avec une vue --');
  const T=[
    ['vitesse, a carte egale',it.map(o=>Object.assign({},o,{x:o.v})),o=>o.carte],
    ['palier, a carte egale',it.map(o=>Object.assign({},o,{x:o.pal})),o=>o.carte],
    ['vitesse, a carte ET palier egaux',it.map(o=>Object.assign({},o,{x:o.v})),o=>o.carte+'|'+o.pal],
    ['vitesse, a carte et palier egaux, SANS le pouvoir VITESSE (vitMult = 1)',it.filter(o=>o.vm===1).map(o=>Object.assign({},o,{x:o.v})),o=>o.carte+'|'+o.pal],
    ['vitesse, dans la MEME COURSE (BIAISE par construction : la mort est le dernier vol)',it.map(o=>Object.assign({},o,{x:o.v})),o=>o.course],
    ['palier, dans la meme course (BIAISE par construction)',it.map(o=>Object.assign({},o,{x:o.pal})),o=>o.course],
    ['vitesse, a carte et tranche de 30 s de course egales',it.map(o=>Object.assign({},o,{x:o.v})),o=>o.carte+'|'+Math.floor(o.t0/30)],
    ['palier, a carte et tranche de 30 s de course egales',it.map(o=>Object.assign({},o,{x:o.pal})),o=>o.carte+'|'+Math.floor(o.t0/30)],
    ['v / vSure, a carte egale',it.map(o=>Object.assign({},o,{x:o.ratio})),o=>o.carte],
    ['besoin de volant, a carte egale',it.map(o=>Object.assign({},o,{x:o.besoin})),o=>o.carte]];
  for(const [mot,its,st] of T){const r=rang(its,st);dire(mot,r);aRes.push({recul:x,mot,r});}}
J.a=aRes;
/* v / vSure, vue par vue */
{let n=0,au=0;const morts=new Set();for(const d of D)for(const s of d.sol){const pr=s.vg&&!s.vg.erreur&&s.vg.d!=null&&s.vg.d<3*Math.max(6,s.v);if(!pr||!(s.vg.vs>0))continue;n++;if(s.v>s.vg.vs){au++;if(d.issue==='mort'&&d.t0-s.t<=3)morts.add(d.course+d.t0);}}
  P('-- v / vSure, vues au sol des suites d\'avant decollage : '+n+' vues avec un virage proche ; au-dessus de 1 : '+au+' ; morts avec au moins une telle vue dans les 3 s : '+morts.size+' sur '+M.length);}

/* ---------- LA FAMILLE : combien de decoupages, que donne le hasard ---------- */
P('');P('== LE HASARD : la famille des grandeurs scalaires de l\'analyse du mesureur (§ a : 8 grandeurs x 4 reculs ; § f : 3 balancements) ==');
{/* les grandeurs, recalculees pour chaque decollage */
  const G0=[];const add=(nom,val,st)=>G0.push({nom,val,st});
  for(const x of [2,1.5,1,.6]){
    add('vitesse '+x,d=>{const s=vueA(d,x);return s?s.v:null;},d=>d.carte);
    add('palier '+x,d=>{const s=vueA(d,x);return s?s.pal:null;},d=>d.carte);
    add('vitesse a palier egal '+x,d=>{const s=vueA(d,x);return s?s.v:null;},d=>{const s=vueA(d,x);return s?d.carte+'|'+s.pal:null;});
    add('v/vmax '+x,d=>{const s=vueA(d,x);return s&&s.P&&s.P.vx?s.v/s.P.vx:null;},d=>d.carte);
    {/* le residu de la vitesse sur le palier, droite des moindres carres carte par carte (comme le mesureur) */
      const R=new Map(),byC={};for(const d of D){const s=vueA(d,x);if(s&&s.pal!=null)(byC[d.carte]=byC[d.carte]||[]).push([d,s.pal,s.v]);}
      for(const k in byC){const a=byC[k],n=a.length,mx=a.reduce((q,o)=>q+o[1],0)/n,my=a.reduce((q,o)=>q+o[2],0)/n;let sxy=0,sxx=0;for(const o of a){sxy+=(o[1]-mx)*(o[2]-my);sxx+=(o[1]-mx)**2;}const b=sxx>0?sxy/sxx:0;for(const o of a)R.set(o[0],o[2]-(my+b*(o[1]-mx)));}
      add('residu vitesse sur palier '+x,d=>R.has(d)?R.get(d):null,d=>d.carte);}
    add('v/vSure '+x,d=>{const s=vueA(d,x);if(!s)return null;const pr=s.vg&&!s.vg.erreur&&s.vg.d!=null&&s.vg.d<3*Math.max(6,s.v);return pr&&s.vg.vs>0?s.v/s.vg.vs:null;},d=>d.carte);
    add('besoin '+x,d=>{const s=vueA(d,x);return s&&s.lm>0?Math.abs(s.lr)/s.lm:null;},d=>d.carte);
    add('braquage '+x,d=>{const s=vueA(d,x);if(!s)return null;const pr=s.vg&&!s.vg.erreur&&s.vg.d!=null&&s.vg.d<3*Math.max(6,s.v);return pr?s.vg.br:null;},d=>d.carte);}
  const bal=d=>{const w=d.sol.filter(s=>d.t0-s.t<=3&&d.t0-s.t>=.6&&s.vo!=null);if(w.length<5)return null;const l=w.map(s=>s.lat);return Math.max(...l)-Math.min(...l);};
  const inv=d=>{const w=d.sol.filter(s=>d.t0-s.t<=3&&d.t0-s.t>=.6&&s.vo!=null).slice().reverse();if(w.length<5)return null;let n=0,der=0;for(const s of w)if(Math.abs(s.vo)>=.9){const g=Math.sign(s.vo);if(der&&g!==der)n++;der=g;}return n;};
  add('balancement : inversions',inv,d=>d.carte);add('balancement : ecart',bal,d=>d.carte);
  add('balancement : ecart a palier egal',bal,d=>{const s=vueA(d,1.5);return s?d.carte+'|'+s.pal:null;});
  /* une statistique rapide par grandeur ; p par la loi de permutation commune (etiquettes melangees DANS chaque carte) */
  const tabs=G0.map(g=>D.map(d=>({x:g.val(d),k:g.st(d),c:d.carte})));
  const lab0=D.map(d=>d.issue==='mort');
  const parCarte={};D.forEach((d,i)=>{(parCarte[d.carte]=parCarte[d.carte]||[]).push(i);});
  const statG=(T,lab)=>{const S=new Map();T.forEach((o,i)=>{if(o.x==null||o.x!==o.x||o.k==null)return;if(!S.has(o.k))S.set(o.k,{m:[],p:[]});S.get(o.k)[lab[i]?'m':'p'].push(o.x);});
    let s=0,n=0;for(const g of S.values()){if(!g.m.length||!g.p.length)continue;for(const m of g.m){let r=0;for(const p of g.p)r+=p<m?1:p===m?.5:0;s+=r/g.p.length;n++;}}return n?s/n:.5;};
  graine=777;   /* une graine fixe pour ce bloc : le resultat ne depend pas des tests d'avant */
  const obs=tabs.map(T=>statG(T,lab0));const NP=20000,nul=tabs.map(()=>new Float64Array(NP));
  for(let it=0;it<NP;it++){const lab=lab0.slice();for(const k in parCarte){const I=parCarte[k],v=I.map(i=>lab0[i]);for(let i=v.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=v[i];v[i]=v[j];v[j]=t;}I.forEach((i,q)=>lab[i]=v[q]);}
    tabs.forEach((T,g)=>{nul[g][it]=statG(T,lab);});}
  const pDe=(g,x)=>{let ge=0;for(let i=0;i<NP;i++)if(nul[g][i]>=x-1e-12)ge++;return (ge+1)/(NP+1);};
  const pObs=obs.map((x,g)=>pDe(g,x));
  /* la loi du plus petit p de la famille sous le hasard, pour deux familles : tout, et les grandeurs NON nommees d'avance (hors vitesse et palier) */
  const fams=[['toute la famille ('+G0.length+' decoupages)',G0.map((g,i)=>i)],['les grandeurs non nommees d\'avance ('+G0.filter(g=>!/^vitesse [0-9]|^palier/.test(g.nom)).length+' : sans vitesse ni palier seuls)',G0.map((g,i)=>i).filter(i=>!/^vitesse [0-9]|^palier/.test(G0[i].nom))]];
  /* les p nuls de chaque tirage, par grandeur : rang dans sa propre loi */
  const pNul=nul.map(a=>{const s=Array.from(a).sort((x,y)=>x-y);return Array.from(a).map(x=>{let lo=0,hi=s.length;while(lo<hi){const mid=(lo+hi)>>1;if(s[mid]<x-1e-12)lo=mid+1;else hi=mid;}return (s.length-lo+1)/(NP+1);});});
  for(const [mot,I] of fams){const minObs=Math.min(...I.map(i=>pObs[i]));let ge=0;for(let it=0;it<NP;it++){const m=Math.min(...I.map(i=>pNul[i][it]));if(m<=minObs+1e-12)ge++;}
    const best=I.reduce((b,i)=>pObs[i]<pObs[b]?i:b,I[0]);
    P('  '+mot+' : le meilleur p trouve vaut '+f3(minObs)+' ('+G0[best].nom+') ; le hasard (etiquettes melangees dans chaque carte) fait au moins aussi bien '+Math.round(100*ge/NP)+' fois sur 100');}
  P('  detail (p de chaque grandeur, meme loi de permutation, a carte egale ; strate carte|palier pour « a palier egal ») :');
  P('    '+G0.map((g,i)=>g.nom+' '+f3(pObs[i])).join(' ; '));
  J.famille=G0.map((g,i)=>({nom:g.nom,p:pObs[i]}));}

/* ---------- b. LE VOLANT ---------- */
P('');P('== b. LE VOLANT (signe : + = vers le bord de sortie ; le bord = le signe de lat a la derniere vue au sol) ==');
{const cl=x=>x==null?'?':x<=-.9?'a fond vers l\'interieur':x<-.2?'vers l\'interieur':x<=.2?'droit':'vers le bord';
  /* le signe du volant : verifie que le volant demande « interieur » a la derniere vue (la ligne ramene au centre) */
  for(const [mot,k] of [['applique (vo)','vo'],['demande (vd)','vd']])for(const x of ['der',.5,1]){const T={};
    for(const d of D){const s=x==='der'?d.sol[0]:vueA(d,x);const c=Math.sign(d.sol[0].lat)||1;const v=s&&s[k]!=null?s[k]*c:null;const q=cl(v);T[q]=T[q]||[0,0];T[q][d.issue==='mort'?0:1]++;}
    P('  '+mot+', '+(x==='der'?'derniere vue':x+' s avant')+' : '+Object.keys(T).sort().map(q=>q+' '+T[q][0]+'/'+T[q][1]).join(' ; '));}
  /* a fond vers l'interieur a la derniere vue : Fisher (morts plus souvent) */
  const a=M.filter(d=>d.sol[0].vo*(Math.sign(d.sol[0].lat)||1)<=-.9).length,c=Po.filter(d=>d.sol[0].vo*(Math.sign(d.sol[0].lat)||1)<=-.9).length;
  P('  a fond vers l\'interieur a la derniere vue : morts '+a+' sur '+M.length+', poses '+c+' sur '+Po.length+' ; Fisher bilateral approche p '+f3(Math.min(1,2*Math.min(fisher(a,M.length,c,Po.length),1-fisher(a+1,M.length,c-1,Po.length)))));}

/* ---------- c. LE FREIN ---------- */
P('');P('== c. LE FREIN POSSIBLE : |volant applique| < 0,35 et pas de drift ==');
{for(const [mot,g] of [['morts',M],['poses',Po]]){let vues=0,sous=0;const lg=[];let avec=0,s05=0,s05v=0;
    for(const d of g){const w=d.sol.filter(s=>d.t0-s.t<=2&&s.vo!=null);vues+=w.length;sous+=w.filter(s=>Math.abs(s.vo)<.35).length;
      const z=d.sol.filter(s=>{const dt=d.t0-s.t;return dt<=2+1e-6&&dt>=.6-1e-6;}).slice().reverse();if(z.length)avec++;
      let best=0,deb=null,prec=null;for(const s of z){if(Math.abs(s.vo)<.35&&!s.dr){if(deb==null||s.t-prec>.15)deb=s.t;best=Math.max(best,s.t-deb+.1);prec=s.t;}else deb=null;}
      lg.push(+best.toFixed(1));if(best>=.5-1e-6)s05++;
      /* la meme fenetre, a une vitesse ou freiner a un sens (au-dessus de 0,42 x vmax du palier, le seuil vitOk du drift) : non, plus simple : v > 120 m/s */
      let b2=0;deb=null;for(const s of z){if(Math.abs(s.vo)<.35&&!s.dr&&s.v>120){if(deb==null||s.t-prec>.15)deb=s.t;b2=Math.max(b2,s.t-deb+.1);prec=s.t;}else deb=null;}if(b2>=.5-1e-6)s05v++;}
    P('  '+mot+' : '+sous+' vues sur '+vues+' dans les 2 s avant ('+Math.round(100*sous/Math.max(1,vues))+' %) ; au moins 0,5 s continues entre 2 et 0,6 s avant : '+s05+' sur '+avec+' (avec des vues) ; les memes au-dessus de 120 m/s : '+s05v);
    if(mot==='morts')P('    plus longue suite, mort par mort (s) : '+lg.join(' '));}}

/* ---------- f. LE POUVOIR VITESSE, fenetres voisines ---------- */
P('');P('== f. LE POUVOIR VITESSE : vitMult > 1 a au moins une vue de la fenetre, morts / poses (fenetres voisines de celle du mesureur, 2 s) ==');
for(const w of [1,2,3]){const mm=M.filter(d=>d.sol.some(s=>d.t0-s.t<=w&&s.vm>1.01)).length,pp=Po.filter(d=>d.sol.some(s=>d.t0-s.t<=w&&s.vm>1.01)).length;
  P('  '+w+' s : morts '+mm+' sur '+M.length+', poses '+pp+' sur '+Po.length+' ; Fisher unilateral p '+f3(fisher(mm,M.length,pp,Po.length)));}
{/* les vols en pouvoir VITESSE hors des suites d'avant decollage : toutes les vues au sol sur decor */
  let n=0,x=0;for(const c of C)for(const v of c.V)if(v.mo==='s'&&DECOR.has(v.c)){n++;if(v.vm>1.01)x++;}
  P('  vues au sol sur decor en pouvoir VITESSE : '+x+' sur '+n);}

/* ===================== e. LA VILLE ===================== */
P('');P('== e. LA VILLE : la regle de prediction-ville.md, recodee (vol voulu dont la derniere vue au sol porte un raccourci ; vue d\'engagement a 0,026 s de so.t0 ; cote = Sg si so.c > 0) ==');
{const V=lire(c=>c.h.carteDemandee==='ville'&&(NEU.has(c.h.graine)||ANC.has(c.h.graine)));
  const cls=X=>{if(!X||!Array.isArray(X.R))return 'non classe';const r=X.R.find(q=>q.m==='rien'),p=X.R.find(q=>q.m==='plane');const n=(r&&r.i==='choc'?1:0)+(p&&p.i==='choc'?1:0);return n===2?'borde':n===1?'mi-borde':'ouvert';};
  const S=[];let mortsCourses=0,mortsVoulues=0,mortsTot=0;
  for(const c of V){const A=vols(c);if(NEU.has(c.h.graine)){mortsTot+=c.h.morts|0;}
    for(const f of A){if(!f.voulu||!f.so||f.carte!=='ville')continue;const e=c.V.find(o=>Math.abs(o.t-f.so.t0)<.026);
      S.push({neuve:NEU.has(c.h.graine),dessous:!!f.so.d,mort:f.issue==='mort',classe:e?cls(e[f.so.c>0?'Sg':'Sd']):'sans vue',course:c.nom});}}
  const juge=(a,b,c,d)=>{const rap=c/d>0?(a/b)/(c/d):(a>=2?Infinity:0),p=fisher(a,b,c,d);return (rap>=3&&p<=.05?'CONFIRMEE':(b>=10&&d>=10&&rap<1.5)?'REFUTEE':'INDECISE')+' (rapport '+(rap===Infinity?'infini':rap.toFixed(2))+', p '+f3(p)+')';};
  for(const [mot,f] of [['16 neuves',s=>s.neuve],['8 d\'avant',s=>!s.neuve],['ensemble',s=>true]]){const X=S.filter(f);
    for(const [sm,g] of [['toutes',s=>true],['vrais raccourcis',s=>!s.dessous],['dessous',s=>s.dessous]]){const T={};for(const s of X.filter(g)){T[s.classe]=T[s.classe]||[0,0];T[s.classe][0]++;if(s.mort)T[s.classe][1]++;}
      const b=T.borde||[0,0],o=T.ouvert||[0,0];
      P('  '+mot+', '+sm+' : '+Object.keys(T).sort().map(k=>k+' '+T[k][1]+' morts/'+T[k][0]).join(' ; ')+' -> '+juge(b[1],b[0],o[1],o[0]));}}
  const N=S.filter(s=>s.neuve);mortsVoulues=N.filter(s=>s.mort).length;
  P('  16 neuves : morts de l\'en-tete '+mortsTot+' ; dont sur une sortie voulue (raccourci engage) '+mortsVoulues+' ; sorties voulues '+N.length);
  /* toutes les sorties voulues des 16 neuves, sans le filtre « raccourci engage » */
  let vv=0,vm=0;for(const c of V.filter(c=>NEU.has(c.h.graine)))for(const f of vols(c))if(f.voulu&&f.carte==='ville'){vv++;if(f.issue==='mort')vm++;}
  P('  16 neuves, TOUS les vols voulus en ville (raccourci engage ou non) : '+vv+', dont mortels '+vm);
  J.ville=S;}

fs.writeFileSync(path.join(OUT,'recompte.json'),JSON.stringify(J,null,1));
fs.writeFileSync(path.join(OUT,'recompte.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
