#!/usr/bin/env node
/* ===== L'ANALYSE DES COURSES REJOUEES AVEC LE DIAGNOSTIC ETENDU (28/11/2026, etude « avant le bord », le mesureur) =====
   Lecture seule de sorties/lignes/*.jsonl.gz (ecrites par course-diag.js --diag 1). AUCUNE course.
   Les vols sont trouves par volsDe de ../../sortie-preparee/analyser.js (le meme decoupage que les etudes d'avant, requis tel quel).
   Les doublons « libre » (meme empreinte de course qu'une course tenue de la meme graine) sont retires.
   Ecrit sorties/analyse.txt et sorties/analyse.json : a vitesse ou palier, b le volant, c le frein, d le virage, f le reste.
   usage : node analyser.js */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,LIG=path.join(ICI,'sorties','lignes');
const {volsDe}=require(path.join(ICI,'..','..','sortie-preparee','analyser'));
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
const ANC=new Set();for(let i=200;i<208;i++)ANC.add(3963000+37*i);

function lireCourses(filtre){
  const C=[];
  for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
    const L=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
    const h=L[0];const c={nom:n.replace(/\.jsonl\.gz$/,''),res:h,vues:L.slice(1).filter(v=>!v.erreurDiag),erreursDiag:L.slice(1).filter(v=>v.erreurDiag).length};
    if(!filtre||filtre(c))C.push(c);}
  /* les doublons : une course libre dont l'empreinte est celle d'une course tenue */
  const emp=new Set(C.filter(c=>c.res.tenue).map(c=>c.res.empreinte));
  const doublons=C.filter(c=>!c.res.tenue&&emp.has(c.res.empreinte)).map(c=>c.nom);
  return {C:C.filter(c=>doublons.indexOf(c.nom)<0),doublons};}

/* ---------- petits outils ---------- */
const med=a=>{const b=a.filter(x=>x!=null&&x===x).sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)/2;return +((b[Math.floor(i)]+b[Math.ceil(i)])/2).toFixed(3);};
const q=(a,p)=>{const b=a.filter(x=>x!=null&&x===x).sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(3);};
const f3=x=>x==null?'-':(+x).toFixed(3),f2=x=>x==null?'-':(+x).toFixed(2),f1=x=>x==null?'-':(+x).toFixed(1);
let G0=987654321;const alea=()=>{G0=(G0+0x6D2B79F5)|0;let t=Math.imul(G0^(G0>>>15),1|G0);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};
/* LE RANG A STRATE EGALE : pour chaque mort, la part des poses de SA strate qui ont une valeur plus basse (egalite = 1/2) ; moyenne sur les morts
   (0,5 = hasard). p unilateral (les morts plus haut) par permutation des etiquettes a l'interieur de chaque strate (10 000 tirages). */
function rangStrate(items,val,strate,N){
  N=N||10000;const S={};for(const it of items){const x=val(it);if(x==null||x!==x)continue;const k=strate(it);if(k==null)continue;(S[k]=S[k]||[]).push({x,m:!!it.mort});}
  const ks=Object.keys(S).filter(k=>S[k].some(o=>o.m)&&S[k].some(o=>!o.m));
  const stat=lab=>{let s=0,n=0;for(const k of ks){const A=S[k],P=A.filter((o,i)=>!lab[k][i]),M=A.filter((o,i)=>lab[k][i]);
      for(const m of M){let r=0;for(const p of P)r+=p.x<m.x?1:p.x===m.x?.5:0;s+=r/P.length;n++;}}return n?s/n:null;};
  const lab0={};for(const k of ks)lab0[k]=S[k].map(o=>o.m);
  const s0=stat(lab0);if(s0==null)return {rang:null,p:null,morts:0,poses:0,strates:0};
  let ge=0;for(let it=0;it<N;it++){const lab={};for(const k of ks){const a=lab0[k].slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(alea()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}lab[k]=a;}
    if(stat(lab)>=s0-1e-12)ge++;}
  let nm=0,np=0;for(const k of ks){nm+=lab0[k].filter(Boolean).length;np+=lab0[k].filter(x=>!x).length;}
  return {rang:+s0.toFixed(3),p:+((ge+1)/(N+1)).toFixed(4),morts:nm,poses:np,strates:ks.length};}
/* Fisher unilateral : P(X >= a), a morts sur b, c morts sur d */
const LF=[0];for(let i=1;i<2000;i++)LF.push(LF[i-1]+Math.log(i));
function fisher(a,b,c,d){const m=a+c,N=b+d;let p=0;for(let x=a;x<=Math.min(b,m);x++){const y=m-x;if(y>d||y<0)continue;p+=Math.exp(LF[b]-LF[x]-LF[b-x]+LF[d]-LF[y]-LF[d-y]-LF[N]+LF[m]+LF[N-m]);}return +Math.min(1,p).toFixed(4);}

/* ---------- les decollages subis sur decor, avec leurs vues au sol d'avant ---------- */
function etat(touches){ /* l'etat des fleches G et D a chaque image, depuis le journal */
  const T=(touches||[]).filter(t=>t[1]==='G'||t[1]==='D');let k=0;const on={G:0,D:0};
  return function(img){while(k<T.length&&T[k][0]<=img){on[T[k][1]]=T[k][2];k++;}return on.G?(on.D?0:1):on.D?-1:0;};}
function decollages(C){
  const out=[];
  for(const c of C){const A=volsDe(c),V=c.vues;
    /* la fleche tenue a chaque vue au sol (G = +1, D = -1) : lue avant l'image de la vue (les touches de l'image de la vue se posent apres la decision) */
    const fl=etat(c.res.touches);const fleche=new Map();for(const v of V)if(v.im!=null)fleche.set(v.im,fl(v.im-1));
    for(const f of A.vols){if(f.voulu||!DECOR[f.carte])continue;
      const i0=V.findIndex(v=>v.t===f.t0&&v.mo==='v');if(i0<0)continue;
      /* la suite de vues au sol juste avant (sans trou de plus de 0,15 s) */
      const sol=[];for(let k=i0-1;k>=0&&V[k].mo==='s'&&(k===i0-1?f.t0-V[k].t<=.15:V[k+1].t-V[k].t<=.15);k--)sol.push(V[k]);
      if(!sol.length)continue;
      const der=sol[0],cote=Math.sign(der.lat)||1;   /* le cote de la sortie (+ = a gauche), dans le repere du conducteur */
      const a=x=>{let b=null,bd=9;for(const s of sol){const d=Math.abs((f.t0-s.t)-x);if(d<bd){bd=d;b=s;}}return b&&bd<=.06?b:null;};
      out.push({course:c.nom,carte:f.carte,t0:f.t0,mort:f.issue.k==='mort',fin:f.issue.k==='fin',cause:f.issue.cause||null,cote,sol,a,fleche,
        nouvelle:!ANC.has(c.res.graine)});}}
  return out;}

function analyser(){
  const {C,doublons}=lireCourses(c=>ANC.has(c.res.graine));
  const D=decollages(C).filter(d=>!d.fin);
  const L=[],P=s=>L.push(s),J={};
  const M=D.filter(d=>d.mort),Po=D.filter(d=>!d.mort);
  P('L\'ANALYSE « AVANT LE BORD » : les 40 courses de la mesure d\'avant rejouees avec le diagnostic etendu');
  P(C.length+' courses (doublons retires : '+doublons.join(', ')+'), '+D.length+' decollages subis sur decor avec au moins une vue au sol juste avant : '+M.length+' morts, '+Po.length+' poses (les vols coupes par la limite de temps sont retires).');
  const parCarte={};for(const d of D){const k=d.carte;parCarte[k]=parCarte[k]||[0,0];parCarte[k][d.mort?0:1]++;}
  P('par carte (morts / poses) : '+Object.keys(parCarte).sort().map(k=>k+' '+parCarte[k].join(' / ')).join(' ; '));
  J.effectifs={courses:C.length,doublons,decollages:D.length,morts:M.length,poses:Po.length,parCarte};
  /* LES CHAMPS : existent-ils ? */
  let nv=0,nvo=0,nvd=0,nvg=0,nvgE=0,nvm=0,vmPas1=0,nP=0,nO=0,nOv=0,nMan=0;
  for(const c of C)for(const v of c.vues){if(v.mo!=='s')continue;nv++;if(v.vo!=null)nvo++;if(v.vd!=null)nvd++;if(v.vg&&!v.vg.erreur)nvg++;if(v.vg&&v.vg.erreur)nvgE++;
    if(v.vm!=null){nvm++;if(v.vm!==1)vmPas1++;}if(v.P)nP++;if(v.O)nO++;if(v.O&&typeof v.O.volant==='number')nOv++;if(v.O&&v.O.manche)nMan++;}
  P('');P('== LES CHAMPS, sur '+nv+' vues au sol ==');
  P('volant applique (vue.volant, le steer du jeu) : '+nvo+' ; volant demande (loi de ligne de doigts.js refaite sur la vue) : '+nvd+' ; dont ordre avec un volant chiffre : '+nOv+' ; ordre avec un manche (frein) : '+nMan);
  P('virage des yeux (vSure, rayon, marge) : '+nvg+' vues avec un virage devant, '+nvgE+' en erreur, les autres : aucun virage plus serre que 600 m dans la portee');
  P('vitMult : present '+nvm+' fois ; different de 1 : '+vmPas1+' fois (vitMult = le pouvoir VITESSE x2, pas le palier : portail-passage.js l.70)');
  J.champs={vues:nv,volant:nvo,volantDemande:nvd,ordreVolant:nOv,manche:nMan,virage:nvg,virageErreur:nvgE,vitMult:nvm,vitMultPas1:vmPas1};

  /* ===== a. VITESSE OU PALIER ===== */
  P('');P('== a. VITESSE OU PALIER (decollages subis sur decor ; la vue au sol la plus proche de 1,5 s avant, a 0,06 s pres) ==');
  const A={};
  for(const x of [2,1.5,1,.6]){
    const it=D.map(d=>{const s=d.a(x);if(!s)return null;
      const pr=s.vg&&!s.vg.erreur&&s.vg.d!=null&&s.vg.d<3*Math.max(6,s.v);   /* « proche », comme modele.js : le virage est a moins de 3 s */
      return {mort:d.mort,carte:d.carte,v:s.v,pal:s.pal,vmax:s.P?s.P.vx:null,rel:s.P&&s.P.vx?s.v/s.P.vx:null,vm:s.vm,
        vs:pr?s.vg.vs:null,ratio:pr&&s.vg.vs>0?s.v/s.vg.vs:null,marge:pr?s.vg.ma:null,br:pr?s.vg.br:null,besoin:s.lm>0?Math.abs(s.lr)/s.lm:null};}).filter(Boolean);
    A[x]=it;}
  const it15=A[1.5];
  P('vues trouvees a 1,5 s : '+it15.length+' ('+it15.filter(o=>o.mort).length+' morts, '+it15.filter(o=>!o.mort).length+' poses)');
  /* le residu de la vitesse sur le palier, carte par carte (moindres carres sur tous les decollages de la carte) */
  const resid=(items)=>{const byC={};for(const o of items)(byC[o.carte]=byC[o.carte]||[]).push(o);
    for(const k in byC){const a=byC[k].filter(o=>o.pal!=null);const n=a.length;if(n<3)continue;const mx=a.reduce((s,o)=>s+o.pal,0)/n,my=a.reduce((s,o)=>s+o.v,0)/n;
      let sxy=0,sxx=0;for(const o of a){sxy+=(o.pal-mx)*(o.v-my);sxx+=(o.pal-mx)**2;}const b=sxx>0?sxy/sxx:0;for(const o of a)o.res=o.v-(my+b*(o.pal-mx));byC[k].pente=b;}
    return Object.keys(byC).map(k=>k+' '+f2(byC[k].pente)+' m/s par palier').join(', ');};
  const tA=[];
  for(const x of [2,1.5,1,.6]){const it=A[x];const pentes=resid(it);
    const lignes=[
      ['vitesse, a carte egale',rangStrate(it,o=>o.v,o=>o.carte)],
      ['palier, a carte egale',rangStrate(it,o=>o.pal,o=>o.carte)],
      ['vitesse, a carte ET palier egaux',rangStrate(it,o=>o.v,o=>o.carte+'|'+o.pal)],
      ['residu de la vitesse sur le palier, a carte egale',rangStrate(it,o=>o.res,o=>o.carte)],
      ['vitesse / vmax du palier (P.vmax), a carte egale',rangStrate(it,o=>o.rel,o=>o.carte)],
      ['v / vSure du virage proche, a carte egale',rangStrate(it,o=>o.ratio,o=>o.carte)],
      ['besoin de volant ici |lacetRoute| / lacetMax, a carte egale',rangStrate(it,o=>o.besoin,o=>o.carte)],
      ['braquage du virage proche (rayonMin / rayon), a carte egale',rangStrate(it,o=>o.br,o=>o.carte)]];
    P('-- '+x+' s avant (pente vitesse/palier : '+pentes+') --');
    for(const [mot,r] of lignes){P('  '+mot+' : rang '+f3(r.rang)+', p '+r.p+' ('+r.morts+' morts, '+r.poses+' poses, '+r.strates+' strates)');tA.push({recul:x,grandeur:mot,r});}
    const md=k=>[med(it.filter(o=>o.mort).map(o=>o[k])),med(it.filter(o=>!o.mort).map(o=>o[k]))];
    P('  medianes morts / poses : vitesse '+md('v').map(f1).join(' / ')+' ; palier '+md('pal').map(f1).join(' / ')+' ; v/vmax '+md('rel').map(f2).join(' / ')+
      ' ; v/vSure '+md('ratio').map(f3).join(' / ')+' (vues avec virage proche : '+it.filter(o=>o.ratio!=null&&o.mort).length+' morts, '+it.filter(o=>o.ratio!=null&&!o.mort).length+' poses) ; besoin '+md('besoin').map(f3).join(' / '));}
  J.a=tA;
  /* LA VITESSE SURE : les morts la depassent-ils, depuis quand, de combien ? */
  P('');P('-- a bis. v / vSure et le besoin de volant, vue par vue, dans les 3 s avant (morts / poses) --');
  const fen=[[3,2],[2,1.5],[1.5,1],[1,.6],[.6,.3],[.3,0]];
  const tab=[];
  for(const [h,b] of fen){const cnt=g=>{let n=0,dep=0,nb=0,b1=0,vg=0;for(const d of g){let dpD=false,b1D=false,vu=false;for(const s of d.sol){const dt=d.t0-s.t;if(dt<=b||dt>h)continue;vu=true;
        const pr=s.vg&&!s.vg.erreur&&s.vg.d!=null&&s.vg.d<3*Math.max(6,s.v);if(pr){vg++;if(s.v>s.vg.vs)dpD=true;}
        if(s.lm>0&&Math.abs(s.lr)/s.lm>=1)b1D=true;}
      if(vu){n++;if(dpD)dep++;if(b1D)b1++;}}return [n,dep,b1];};
    const m=cnt(M),p=cnt(Po);tab.push({fenetre:[h,b],morts:m,poses:p});
    P('  de '+h+' a '+b+' s avant : decollages avec une vue '+m[0]+' / '+p[0]+' ; au moins une vue AU-DESSUS de vSure (virage proche) '+m[1]+' / '+p[1]+' ; au moins une vue ou le besoin de volant ici >= 1 (meme a fond, la caisse ne suit pas) '+m[2]+' / '+p[2]);}
  J.aBis=tab;
  /* le detail des morts */
  P('');P('-- chaque mort : vitesse, palier, vitMult (x), v/vmax, v/vSure (si un virage proche), besoin de volant, a 2 / 1,5 / 1 / 0,6 s et a la derniere vue --');
  const det=[];
  for(const d of M){const r=x=>{const s=x==='der'?d.sol[0]:d.a(x);if(!s)return '-';const pr=s.vg&&!s.vg.erreur&&s.vg.d!=null&&s.vg.d<3*Math.max(6,s.v);
      return f1(s.v)+'/p'+s.pal+'/x'+f2(s.vm)+'/'+(s.P&&s.P.vx?f2(s.v/s.P.vx):'-')+'/'+(pr&&s.vg.vs>0?f2(s.v/s.vg.vs):'-')+'/'+(s.lm>0?f2(Math.abs(s.lr)/s.lm):'-');};
    const l=d.course.replace('-tenue','')+' t0 '+d.t0+' '+d.cause+' | '+[2,1.5,1,.6,'der'].map(r).join(' | ');P('  '+l);det.push(l);}
  J.aMorts=det;

  /* ===== b. LE VOLANT dans la derniere seconde ===== */
  P('');P('== b. LE VOLANT dans la derniere seconde avant chaque decollage subi (signe : + = vers le BORD de sortie, - = vers l\'interieur) ==');
  const classeV=x=>x==null?'?':x<=-.9?'a fond vers l\'interieur':x<-.2?'vers l\'interieur, pas a fond':x<=.2?'ne braque pas (|v| <= 0,2)':'vers le bord';
  const tB=[];
  for(const [mot,cle] of [['volant APPLIQUE (le steer du jeu)','vo'],['volant DEMANDE (la loi de ligne)','vd']]){
    for(const x of ['der',.3,.5,1]){const T={};
      for(const d of D){const s=x==='der'?d.sol[0]:d.a(x);const v=s&&s[cle]!=null?s[cle]*d.cote:null;const k=classeV(v);T[k]=T[k]||[0,0];T[k][d.mort?0:1]++;}
      P('  '+mot+', '+(x==='der'?'a la derniere vue au sol':x+' s avant')+' : '+Object.keys(T).sort().map(k=>k+' '+T[k][0]+' / '+T[k][1]).join(' ; ')+'   (morts / poses)');
      tB.push({grandeur:cle,recul:x,T});}}
  /* sur toute la derniere seconde : le volant applique moyen, le temps a fond vers l'interieur */
  {const T={};for(const d of D){const w=d.sol.filter(s=>d.t0-s.t<=1&&s.vo!=null);if(!w.length)continue;
      const fond=w.filter(s=>s.vo*d.cote<=-.9).length/w.length,bord=w.filter(s=>s.vo*d.cote>.2).length/w.length;
      const k=fond>=.5?'a fond vers l\'interieur la moitie du temps ou plus':bord>=.5?'vers le bord la moitie du temps ou plus':'ni l\'un ni l\'autre';T[k]=T[k]||[0,0];T[k][d.mort?0:1]++;}
    P('  sur toute la derniere seconde (volant applique) : '+Object.keys(T).sort().map(k=>k+' '+T[k][0]+' / '+T[k][1]).join(' ; '));tB.push({grandeur:'seconde',T});}
  /* la fleche tenue (le journal des touches) a la derniere vue */
  {const T={};for(const d of D){const s=d.sol[0];const f=s.im!=null?d.fleche.get(s.im):null;const k=f==null?'?':f===0?'aucune fleche':f*d.cote<0?'fleche vers l\'interieur':'fleche vers le bord';T[k]=T[k]||[0,0];T[k][d.mort?0:1]++;}
    P('  la fleche tenue par la main a la derniere vue au sol : '+Object.keys(T).sort().map(k=>k+' '+T[k][0]+' / '+T[k][1]).join(' ; '));tB.push({grandeur:'fleche',T});}
  /* l'ecart demande / applique */
  {const e=[];for(const d of D)for(const s of d.sol)if(d.t0-s.t<=1&&s.vo!=null&&s.vd!=null)e.push({m:d.mort,x:Math.abs(s.vd-s.vo)});
    P('  |demande - applique| dans la derniere seconde, mediane morts / poses : '+f2(med(e.filter(o=>o.m).map(o=>o.x)))+' / '+f2(med(e.filter(o=>!o.m).map(o=>o.x)))+' ('+e.length+' vues)');}
  J.b=tB;

  /* ===== c. LE FREIN ===== */
  P('');P('== c. LE FREIN : |volant applique| < 0,35 (au clavier, la fleche du bas freine sans drifter : boucle-2-conduite.js l.43 et l.61) ==');
  const tC={};
  for(const [mot,g] of [['morts',M],['poses',Po]]){let vues=0,sous=0,av05=0,nd=0;const parD=[];
    for(const d of g){const w=d.sol.filter(s=>d.t0-s.t<=2&&s.vo!=null);vues+=w.length;const k=w.filter(s=>Math.abs(s.vo)<.35).length;sous+=k;
      /* la plus longue suite continue de vues sous 0,35 entre 2 s et 0,6 s avant (vues espacees de 0,1 s : la duree = derniere - premiere + 0,1) */
      const z=d.sol.filter(s=>{const dt=d.t0-s.t;return dt<=2.0001&&dt>=.6-1e-6;}).slice().reverse();let best=0,deb=null,prec=null;
      for(const s of z){if(s.vo!=null&&Math.abs(s.vo)<.35&&!s.dr){if(deb==null||s.t-prec>.15)deb=s.t;best=Math.max(best,s.t-deb+.1);prec=s.t;}else deb=null;}
      if(z.length)nd++;if(best>=.5-1e-6)av05++;parD.push(+best.toFixed(2));}
    tC[mot]={decollages:g.length,avecVues:nd,vues2s:vues,vuesSous035:sous,auMoins05s:av05,plusLongue:parD};
    P('  '+mot+' : '+g.length+' decollages ; dans les 2 s avant, '+sous+' vues sur '+vues+' ont |volant| < 0,35 ('+(vues?Math.round(100*sous/vues):0)+' %) ; '+av05+' sur '+nd+' (avec des vues entre 2 et 0,6 s) ont au moins 0,5 s CONTINUES de frein possible entre 2 s et 0,6 s avant');}
  P('  plus longue suite de frein possible (s), chaque mort : '+tC.morts.plusLongue.join(' '));
  J.c=tC;

  /* ===== d. LE VIRAGE ===== */
  P('');P('== d. LE VIRAGE : la courbure de la route sous la caisse (k = lacetRoute / vitesse, rad/m), et le cote de la sortie par rapport au virage ==');
  const tD={};
  for(const [mot,g] of [['morts',M],['poses',Po]]){const T={entree:0,sortie:0,stable:0,droit:0,nd:0},X={exterieur:0,interieur:0,droit:0},kk=[];
    for(const d of g){const s1=d.a(1.5),s0=d.sol.filter(s=>d.t0-s.t<=.5);
      if(!s1||!s0.length){T.nd++;continue;}
      const k1=Math.abs(s1.lr/Math.max(6,s1.v)),k0=s0.reduce((a,s)=>a+Math.abs(s.lr/Math.max(6,s.v)),0)/s0.length;kk.push([1000*k1,1000*k0]);
      if(k0<.0015&&k1<.0015)T.droit++;else if(k0>k1*1.5)T.entree++;else if(k1>k0*1.5)T.sortie++;else T.stable++;
      const lr=s0.reduce((a,s)=>a+s.lr,0)/s0.length;if(Math.abs(lr/Math.max(6,s0[0].v))<.0015)X.droit++;else if(Math.sign(lr)===-d.cote)X.exterieur++;else X.interieur++;}
    tD[mot]={courbure:T,cote:X};
    P('  '+mot+' : courbure de 1,5 s avant a la derniere demi-seconde : ENTREE (x1,5 ou plus) '+T.entree+', stable '+T.stable+', SORTIE de virage '+T.sortie+', tout droit (< 1/667 m) '+T.droit+', sans vue '+T.nd+
      ' | cote de la sortie (virage de la derniere demi-seconde) : EXTERIEUR '+X.exterieur+', interieur '+X.interieur+', route droite '+X.droit);
    P('    courbure mediane 1,5 s avant / derniere demi-seconde : '+f2(med(kk.map(x=>x[0])))+' / '+f2(med(kk.map(x=>x[1])))+' (en 1/km)');}
  J.d=tD;

  /* ===== f. LE RESTE ===== */
  P('');P('== f. LE RESTE ==');
  {/* la nitro et le frein demandes au sol, sur toutes les vues au sol des maps a decor */
    let n=0,nit=0,man=0,dr=0;for(const c of C)for(const v of c.vues){if(v.mo!=='s'||!DECOR[v.c])continue;n++;if(v.O&&v.O.nitro)nit++;if(v.O&&v.O.manche)man++;if(v.dr)dr++;}
    P('  vues au sol sur decor : '+n+' ; nitro demandee '+nit+' ; manche demande (frein) '+man+' ; drift en cours '+dr);
    /* le volant applique a fond, sur toutes les vues au sol */
    let fond=0,tot=0;for(const c of C)for(const v of c.vues){if(v.mo!=='s'||!DECOR[v.c]||v.vo==null)continue;tot++;if(Math.abs(v.vo)>=.9)fond++;}
    P('  vues au sol sur decor avec le volant applique a fond (|v| >= 0,9) : '+fond+' sur '+tot+' ('+Math.round(100*fond/Math.max(1,tot))+' %)');
    /* le virage des yeux : vSure, sa distribution */
    const rat=[];for(const c of C)for(const v of c.vues){if(v.mo!=='s'||!DECOR[v.c])continue;const pr=v.vg&&!v.vg.erreur&&v.vg.d!=null&&v.vg.d<3*Math.max(6,v.v);if(pr&&v.vg.vs>0)rat.push(v.v/v.vg.vs);}
    P('  v / vSure (virage proche), toutes vues au sol sur decor : '+rat.length+' vues ; quantiles 50 / 90 / 99 % : '+[.5,.9,.99].map(p=>f3(q(rat,p))).join(' / ')+' ; au-dessus de 1 : '+rat.filter(x=>x>1).length);
    const bes=[];for(const c of C)for(const v of c.vues){if(v.mo!=='s'||!DECOR[v.c]||!(v.lm>0))continue;bes.push(Math.abs(v.lr)/v.lm);}
    P('  besoin de volant ici |lacetRoute| / lacetMax, toutes vues au sol sur decor : quantiles 50 / 90 / 99 % : '+[.5,.9,.99].map(p=>f3(q(bes,p))).join(' / ')+' ; >= 1 : '+bes.filter(x=>x>=1).length+' sur '+bes.length);}
  /* LE POUVOIR VITESSE (vitMult > 1) et LE BALANCEMENT (le volant applique qui passe d'un bord a l'autre) avant le decollage */
  {const T={morts:[0,0],poses:[0,0]};const O={morts:[],poses:[]};const Ra={morts:[],poses:[]};
    for(const d of D){const k=d.mort?'morts':'poses';const w=d.sol.filter(s=>d.t0-s.t<=2);if(!w.length)continue;
      T[k][1]++;if(w.some(s=>s.vm>1.01))T[k][0]++;
      const w3=d.sol.filter(s=>d.t0-s.t<=3&&s.vo!=null).slice().reverse();let inv=0,der=0;for(const s of w3){if(Math.abs(s.vo)>=.9){const sg=Math.sign(s.vo);if(der&&sg!==der)inv++;der=sg;}}
      O[k].push(inv);const L3=w3.map(s=>s.lat);if(L3.length)Ra[k].push(Math.max(...L3)-Math.min(...L3));}
    P('  le pouvoir VITESSE (vitMult > 1) a au moins une vue des 2 s avant : morts '+T.morts[0]+' sur '+T.morts[1]+', poses '+T.poses[0]+' sur '+T.poses[1]+' (Fisher unilateral p '+fisher(T.morts[0],T.morts[1],T.poses[0],T.poses[1])+')');
    P('  LE BALANCEMENT dans les 3 s avant : inversions du volant applique a fond (|v| >= 0,9, d\'un cote a l\'autre), mediane morts / poses : '+med(O.morts)+' / '+med(O.poses)+
      ' ; 2 inversions ou plus : '+O.morts.filter(x=>x>=2).length+' sur '+O.morts.length+' morts, '+O.poses.filter(x=>x>=2).length+' sur '+O.poses.length+' poses (Fisher p '+fisher(O.morts.filter(x=>x>=2).length,O.morts.length,O.poses.filter(x=>x>=2).length,O.poses.length)+')');
    P('  ecart lateral parcouru dans les 3 s avant (max - min de lat, m), mediane morts / poses : '+f1(med(Ra.morts))+' / '+f1(med(Ra.poses)));
    J.f={vitesse:T,inversions:O,ecart:Ra};
    /* le balancement a carte egale, rang */
    const it=D.map(d=>{const w3=d.sol.filter(s=>d.t0-s.t<=3&&d.t0-s.t>=.6&&s.vo!=null).slice().reverse();if(w3.length<5)return null;let inv=0,der=0;for(const s of w3){if(Math.abs(s.vo)>=.9){const sg=Math.sign(s.vo);if(der&&sg!==der)inv++;der=sg;}}
      const L3=w3.map(s=>s.lat);return {mort:d.mort,carte:d.carte,inv,ec:Math.max(...L3)-Math.min(...L3),pal:(d.a(1.5)||{}).pal,v:(d.a(1.5)||{}).v};}).filter(Boolean);
    const r1=rangStrate(it,o=>o.inv,o=>o.carte),r2=rangStrate(it,o=>o.ec,o=>o.carte),r3=rangStrate(it,o=>o.ec,o=>o.carte+'|'+o.pal);
    P('  entre 3 s et 0,6 s avant seulement, a carte egale : inversions rang '+f3(r1.rang)+' p '+r1.p+' ; ecart lateral rang '+f3(r2.rang)+' p '+r2.p+' ('+r2.morts+' morts, '+r2.poses+' poses) ; ecart lateral a carte et palier egaux rang '+f3(r3.rang)+' p '+r3.p+' ('+r3.morts+' morts, '+r3.poses+' poses)');
    J.fRang={inversions:r1,ecart:r2,ecartPalier:r3};}
  fs.writeFileSync(path.join(ICI,'sorties','analyse.json'),JSON.stringify(J,null,1));
  fs.writeFileSync(path.join(ICI,'sorties','analyse.txt'),L.join('\n')+'\n');
  console.log(L.join('\n'));
}
if(require.main===module)analyser();
module.exports={lireCourses,decollages,rangStrate,fisher};
