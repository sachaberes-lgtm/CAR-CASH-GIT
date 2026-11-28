#!/usr/bin/env node
/* ===== AVANT LE BORD : CE QUI SE PASSE AU SOL DANS LES 3 S QUI PRECEDENT UN DECOLLAGE SUBI (28/11/2026, etude « avant le bord », le lecteur des traces) =====
   Relit les traces gardees par l'etude « sortie preparee » (../../sortie-preparee/sorties/lignes/*.jsonl.gz) SANS jouer aucune course.
   Les decollages sont tires des EVENEMENTS du jeu (comme relecture.js) ; les doublons des courses « libre » qui rejouent une course tenue sont retires.
   Pour chaque decollage subi sur une map a decor : les vues au sol contigues (apres la pose precedente) jusqu'a 3 s avant ; a des reculs donnes
   (0,6 / 0,8 / 1 / 1,5 / 2 s) la vue la plus proche (a 0,06 s pres) ; les grandeurs lues ; les separateurs (seuil, tableau croise, Fisher).
   Ecrit : sorties/avant-le-bord.json (chaque decollage, ses vues) et sorties/avant-le-bord.txt (les tableaux).
   usage : node avant-le-bord.js   (depuis n'importe ou) */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,LIG=path.join(ICI,'..','..','sortie-preparee','sorties','lignes'),SORT=path.join(ICI,'sorties');
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
const RECULS=[.3,.6,.8,1,1.5,2];
const q=(a,p)=>{const b=a.filter(x=>x!=null&&isFinite(x)).sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(3);};
const inc=(o,k,n)=>{o[k]=(o[k]||0)+(n==null?1:n);};
const r3=x=>x==null||!isFinite(x)?null:+x.toFixed(3);

function lire(){const C=[];
  for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
    const L=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
    C.push({nom:n.replace(/\.jsonl\.gz$/,''),h:L[0],V:L.slice(1).filter(v=>!v.erreurDiag)});}
  return C;}

/* ce qu'on lit d'une vue au sol, oriente vers le cote de la sortie (co = +1 ou -1, le signe du lat au decollage) */
function lireVue(s,co,td){
  const lat=s.lat,demi=s.demi;
  return {recul:r3(td-s.t),v:s.v,latS:r3(lat*co),marge:r3(demi-lat*co),margeAbs:r3(demi-Math.abs(lat)),capS:r3(s.cap*co),
    ti:s.tn?s.tn.ti:null,tnT:s.tn?s.tn.t:null,tnCo:s.tn?s.tn.co:null,mur:s.tn?!!s.tn.mu:null,
    jauge:r3((s.n||0)+(s.r||0)),nitro:s.O?!!s.O.nitro:null,ligneS:s.O&&s.O.ligne!=null?r3(s.O.ligne*co):null,
    volantS:s.O&&s.O.volant!=null?r3(s.O.volant*co):null,pal:s.pal,de:s.de,gl:s.gl,rb:s.rb,B:!!(s.B&&s.B.R),
    so:!!(s.D&&s.D.so)};}

function decollagesDe(c){
  const ev=(c.h.ev||[]),V=c.V,D=[];
  let tPose=-9,route=0,tRoute=0,decRoute=0;
  for(let i=0;i<ev.length;i++){const e=ev[i];
    if(e[1]==='route'){route++;tRoute=e[0];decRoute=0;continue;}
    if(e[1]==='pose'){tPose=e[0];continue;}
    if(e[1]!=='decol')continue;
    decRoute++;
    const fin=ev.slice(i+1).find(x=>x[1]==='pose'||x[1]==='mort')||null;
    const td=e[0],co=e[4]<0?-1:1;
    /* les vues au sol contigues avant le decollage (apres la pose precedente, sans trou de plus de 0,15 s), la plus proche d'abord */
    const sol=[];let kS=-1;
    for(let k=V.length-1;k>=0;k--){if(V[k].t<=td+1e-9){if(V[k].mo==='v'&&Math.abs(V[k].t-td)<1e-6)continue;kS=k;break;}}
    if(kS>=0&&V[kS].mo==='s'&&V[kS].t>tPose+1e-9){
      for(let k=kS;k>=0;k--){const s=V[k];if(s.mo!=='s'||s.t<=tPose+1e-9)break;if(sol.length&&sol[sol.length-1].t-s.t>.15)break;if(td-s.t>3.05)break;sol.push(s);}}
    const S=sol[0]||null;
    const voulu=!!(S&&S.D&&S.D.so)||!!(V.find(v=>v.mo==='v'&&v.t>td&&v.D&&v.D.vo&&v.t-td<.2));
    /* l'annonce du bord : la premiere vue contigue (en remontant) ou tn.ti est faux ; le recul de la plus ancienne */
    let tPrem=null;for(const s of sol){if(s.tn&&s.tn.ti===false)tPrem=r3(td-s.t);else break;}
    /* tient encore a 0,6 s ou plus avant ? */
    const tientTot=sol.filter(s=>td-s.t>=.6-1e-9&&td-s.t<=3.05);
    const vues={};for(const R of RECULS){let b=null,bd=9;for(const s of sol){const d=Math.abs((td-s.t)-R);if(d<bd){bd=d;b=s;}}vues[R]=b&&bd<=.06?lireVue(b,co,td):null;}
    /* vitesse laterale (vers la sortie) entre la vue a 1 s et la vue a 0,6 s, en unites de lat par s */
    const vL=(vues[1]&&vues[.6])?r3((vues[.6].latS-vues[1].latS)/(vues[1].recul-vues[.6].recul)):null;
    const o={course:c.nom,graine:c.h.graine,carte:S?S.c:null,td,s:e[3],latDecol:e[4],kmhDecol:e[5],type:e[2],co,
      fin:fin?fin[1]:'tmax',cause:fin&&fin[1]==='mort'?fin[2]:null,dt:fin?+(fin[0]-td).toFixed(2):null,hMax:fin&&fin[1]==='pose'?fin[6]:null,
      ecartPose:+(td-tPose).toFixed(2),chaine:td-tPose<.5,route,tDansRoute:+(td-tRoute).toFixed(2),rangDansRoute:decRoute,
      nSol:sol.length,solDepuis:sol.length?r3(td-sol[sol.length-1].t):0,voulu,tPrem,
      tientA06:tientTot.length?tientTot.some(s=>s.tn&&s.tn.ti===true):null,
      tientA06Tous:tientTot.length?tientTot.every(s=>s.tn&&s.tn.ti===true):null,
      dernier:S?lireVue(S,co,td):null,vues,vL};
    /* le gros du trajet au sol : la marge minimale et le cap maximal vers la sortie sur [0,6 ; 3] s */
    const fen=sol.filter(s=>td-s.t>=.6-1e-9);
    o.fen={n:fen.length,margeMin:fen.length?r3(Math.min(...fen.map(s=>s.demi-s.lat*co))):null,capMax:fen.length?r3(Math.max(...fen.map(s=>s.cap*co))):null,
      vMax:fen.length?Math.max(...fen.map(s=>s.v)):null,nitroPart:fen.length?r3(fen.filter(s=>s.O&&s.O.nitro).length/fen.length):null,
      ligneMoy:fen.length?r3(fen.reduce((a,s)=>a+((s.O&&s.O.ligne!=null?s.O.ligne:0)*co),0)/fen.length):null};
    D.push(o);}
  return D;}

/* le test exact de Fisher (unilateral : plus de morts du cote « au-dessus ») */
function lnf(n){let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s;}
function hyp(a,b,c,d){const n=a+b+c+d;return Math.exp(lnf(a+b)+lnf(c+d)+lnf(a+c)+lnf(b+d)-lnf(n)-lnf(a)-lnf(b)-lnf(c)-lnf(d));}
function fisher(a,b,c,d){/* a = morts au-dessus, b = morts en dessous, c = vivants au-dessus, d = vivants en dessous ; p(A>=a) */
  let p=0;const r1=a+b,c1=a+c,n=a+b+c+d;for(let x=a;x<=Math.min(r1,c1);x++){const y=r1-x,z=c1-x,w=n-r1-z;if(y<0||z<0||w<0)continue;p+=hyp(x,y,z,w);}return p;}
/* fisher bilateral : somme des tables aussi ou moins probables */
function fisher2(a,b,c,d){const r1=a+b,c1=a+c,n=a+b+c+d,p0=hyp(a,b,c,d);let p=0;for(let x=Math.max(0,r1+c1-n);x<=Math.min(r1,c1);x++){const y=r1-x,z=c1-x,w=n-r1-z;const px=hyp(x,y,z,w);if(px<=p0*(1+1e-7))p+=px;}return Math.min(1,p);}

/* le meilleur seuil d'une grandeur (dans les deux sens), au sens de Youden (sensibilite + specificite - 1) */
function meilleurSeuil(M,N){
  const vals=[...new Set(M.concat(N))].sort((a,b)=>a-b);let best=null;
  for(let i=0;i<vals.length-1;i++){const s=(vals[i]+vals[i+1])/2;
    const a=M.filter(x=>x>s).length,b=M.length-a,c=N.filter(x=>x>s).length,d=N.length-c;
    const J1=a/M.length-c/N.length;   /* les morts au-dessus */
    const J=Math.abs(J1);if(!best||J>best.J)best={J,s,a,b,c,d,sens:J1>=0?'>':'<'};}
  if(!best)return null;best.s=r3(best.s);best.J=r3(best.J);best.p1=fisher(...(best.sens==='>'?[best.a,best.b,best.c,best.d]:[best.b,best.a,best.d,best.c]));best.p2=fisher2(best.a,best.b,best.c,best.d);
  return best;}

/* une permutation : la meilleure separation trouvee par hasard sur 24 morts et ~150 vivants, avec le meme nombre de grandeurs essayees */
function permMax(listeGrandeurs,etiq,nPerm,graine){
  let x=graine>>>0;const rnd=()=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296;};
  const res=[];
  for(let p=0;p<nPerm;p++){const e=etiq.slice();for(let i=e.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[e[i],e[j]]=[e[j],e[i]];}
    let mx=0;for(const g of listeGrandeurs){const M=[],N=[];for(let i=0;i<g.length;i++){if(g[i]==null)continue;(e[i]?M:N).push(g[i]);}if(M.length<5||N.length<5)continue;const b=meilleurSeuil(M,N);if(b&&b.J>mx)mx=b.J;}
    res.push(mx);}
  return res;}

function main(){
  const C=lire(),L=[],P=s=>L.push(s);
  const tous=[];for(const c of C)tous.push(...decollagesDe(c));
  /* les doublons (meme graine, meme evenement de decollage, meme duree de vol) : la course « libre » qui rejoue la course tenue */
  const vu=new Map();for(const d of tous){const k=d.graine+'|'+d.td+'|'+d.s+'|'+d.latDecol+'|'+d.kmhDecol+'|'+d.dt;if(vu.has(k))d.double=vu.get(k);else vu.set(k,d.course);}
  const U=tous.filter(d=>!d.double);
  const subis=U.filter(d=>!d.voulu),decor=subis.filter(d=>DECOR[d.carte]);
  const mortel=d=>d.fin==='mort';
  const M=decor.filter(mortel),N=decor.filter(d=>d.fin==='pose'),T=decor.filter(d=>d.fin==='tmax');
  P('AVANT LE BORD — relu sans course depuis sortie-preparee/sorties/lignes ('+C.length+' courses ; '+new Date().toISOString().slice(0,10)+')');
  P('decollages (evenements) '+tous.length+', doublons retires '+(tous.length-U.length)+' ; subis distincts '+subis.length+' (morts '+subis.filter(mortel).length+') ; sur decor '+decor.length+' : morts '+M.length+', poses '+N.length+', coupes par tmax '+T.length);
  const ty={};for(const d of U)inc(ty,d.type);P('type de decollage selon le jeu (enregistreur : trou si TROU, bord si |lat| > 0,92 demi, sinon saut) : '+JSON.stringify(ty));
  P('|lat| au decollage (subis sur decor), quantiles 0/50/100 : '+[0,.5,1].map(p=>q(decor.map(d=>Math.abs(d.latDecol)),p)).join(' / ')+' (demi-largeur de la route dans les vues : toujours 28)');
  P('subis sur decor morts hors des morts « en vol » : non mortels = poses ; on compare les '+M.length+' morts aux '+N.length+' poses (les '+T.length+' coupes par tmax a part)');
  P('');
  /* ---------- 1. ce qui est connu au sol, et quand ---------- */
  P('== 1. Le sol avant le decollage : combien de vues, depuis quand ==');
  const solD=d=>d.solDepuis;
  P('  sol contigu avant le decollage (s), quantiles 10/50/90 : morts '+[.1,.5,.9].map(p=>q(M.map(solD),p)).join(' / ')+' ; poses '+[.1,.5,.9].map(p=>q(N.map(solD),p)).join(' / '));
  for(const R of RECULS)P('  vue au sol disponible a '+R+' s avant : morts '+M.filter(d=>d.vues[R]).length+'/'+M.length+', poses '+N.filter(d=>d.vues[R]).length+'/'+N.length);
  P('  en chaine (pose precedente < 0,5 s) : morts '+M.filter(d=>d.chaine).length+', poses '+N.filter(d=>d.chaine).length);
  P('');
  /* ---------- 2. evitable ou impose ---------- */
  P('== 2. Evitable ou impose (definition : a au moins une vue au sol de 0,6 a 3 s avant, les yeux disaient « la route tient 3 s en conduite au mieux » = evitable ;');
  P('   les yeux disaient « bord » a toutes ces vues = impose ; aucune vue au sol a 0,6 s ou plus = pas de sol (chaine ou rebond)) ==');
  const classe=d=>d.tientA06==null?'pas de sol >= 0,6 s':d.tientA06?'evitable':'impose';
  const tab2={};for(const d of decor)inc(tab2,classe(d)+' | '+d.fin);
  for(const k of ['evitable','impose','pas de sol >= 0,6 s'])P('  '+k.padEnd(22)+' morts '+String(tab2[k+' | mort']||0).padStart(3)+'  poses '+String(tab2[k+' | pose']||0).padStart(3)+'  tmax '+(tab2[k+' | tmax']||0));
  const parCarte2={};for(const d of decor)inc(parCarte2,d.carte+' '+classe(d)+' '+d.fin);
  P('  par carte : '+JSON.stringify(parCarte2));
  P('  premiere annonce du bord (s avant), quantiles 10/50/90/max : morts '+[.1,.5,.9,1].map(p=>q(M.map(d=>d.tPrem),p)).join(' / ')+' ; poses '+[.1,.5,.9,1].map(p=>q(N.map(d=>d.tPrem),p)).join(' / '));
  P('  annonce a 0,6 s ou plus avant : morts '+M.filter(d=>d.tPrem>=.6-1e-9).length+', poses '+N.filter(d=>d.tPrem>=.6-1e-9).length);
  P('  « tient » a TOUTES les vues de 0,6 a 3 s : morts '+M.filter(d=>d.tientA06Tous).length+', poses '+N.filter(d=>d.tientA06Tous).length);
  P('  le cote annonce par les yeux a la premiere annonce = le cote de la sortie : '+decor.filter(d=>d.dernier&&d.dernier.tnCo===d.co).length+' sur '+decor.filter(d=>d.dernier&&d.dernier.tnCo!=null).length);
  P('  bord annonce comme un MUR de couloir a la derniere vue : '+decor.filter(d=>d.dernier&&d.dernier.mur).length);
  P('');
  /* ---------- 3. les grandeurs, morts contre poses ---------- */
  P('== 3. Les grandeurs a chaque recul : mediane (morts | poses), meilleur seuil (Youden), tableau croise, Fisher ==');
  P('   marge = 28 - lat oriente vers la sortie (m) ; capS = cap vers la sortie (rad, + = vers le bord) ; ligneS = la ligne visee par le pilote, orientee (+ = vers le bord) ;');
  P('   jauge = nitro + reserve ; nitro = la nitro demandee ; v = vitesse de la vue ; pal = palier');
  const G=['v','marge','capS','ligneS','jauge','pal'];
  const sep={};const grandeursPerm=[],etiq=[];
  const base=decor.filter(d=>d.fin!=='tmax');for(const d of base)etiq.push(mortel(d)?1:0);
  for(const R of RECULS){
    for(const g of G){const m=M.map(d=>d.vues[R]&&d.vues[R][g]).filter(x=>x!=null),n=N.map(d=>d.vues[R]&&d.vues[R][g]).filter(x=>x!=null);
      if(R>=.6)grandeursPerm.push(base.map(d=>d.vues[R]&&d.vues[R][g]!=null?d.vues[R][g]:null));
      const b=m.length>=5&&n.length>=5?meilleurSeuil(m,n):null;sep[R+'|'+g]={morts:m.length,poses:n.length,medM:q(m,.5),medN:q(n,.5),b};
      P('  '+String(R).padEnd(4)+g.padEnd(7)+' n '+m.length+'/'+n.length+'  med '+q(m,.5)+' | '+q(n,.5)+'  q25-75 morts '+q(m,.25)+'..'+q(m,.75)+'  poses '+q(n,.25)+'..'+q(n,.75)+
        (b?'  seuil '+b.sens+' '+b.s+' : morts '+b.a+' au-dessus / '+b.b+' en dessous ; poses '+b.c+' / '+b.d+'  J '+b.J+'  p(Fisher bilat.) '+b.p2.toExponential(1):''));}
    const nm=M.filter(d=>d.vues[R]),nn=N.filter(d=>d.vues[R]);
    P('  '+String(R).padEnd(4)+'nitro   demandee : morts '+nm.filter(d=>d.vues[R].nitro).length+'/'+nm.length+', poses '+nn.filter(d=>d.vues[R].nitro).length+'/'+nn.length);
    P('  '+String(R).padEnd(4)+'tient   (ti vrai) : morts '+nm.filter(d=>d.vues[R].ti===true).length+'/'+nm.length+', poses '+nn.filter(d=>d.vues[R].ti===true).length+'/'+nn.length);
    P('');}
  /* la fenetre [0,6 ; 3] s */
  for(const g of ['margeMin','capMax','vMax','nitroPart','ligneMoy']){const m=M.map(d=>d.fen[g]).filter(x=>x!=null),n=N.map(d=>d.fen[g]).filter(x=>x!=null);grandeursPerm.push(base.map(d=>d.fen[g]));
    const b=m.length>=5&&n.length>=5?meilleurSeuil(m,n):null;sep['fen|'+g]={medM:q(m,.5),medN:q(n,.5),b};
    P('  fen '+g.padEnd(9)+' n '+m.length+'/'+n.length+'  med '+q(m,.5)+' | '+q(n,.5)+(b?'  seuil '+b.sens+' '+b.s+' : morts '+b.a+'/'+b.b+' ; poses '+b.c+'/'+b.d+'  J '+b.J+'  p '+b.p2.toExponential(1):''));}
  {const m=M.map(d=>d.vL).filter(x=>x!=null),n=N.map(d=>d.vL).filter(x=>x!=null);grandeursPerm.push(base.map(d=>d.vL));const b=meilleurSeuil(m,n);sep['vL']={medM:q(m,.5),medN:q(n,.5),b};
    P('  vL (m/s vers le bord, de 1 s a 0,6 s) n '+m.length+'/'+n.length+'  med '+q(m,.5)+' | '+q(n,.5)+(b?'  seuil '+b.sens+' '+b.s+' : morts '+b.a+'/'+b.b+' ; poses '+b.c+'/'+b.d+'  J '+b.J+'  p '+b.p2.toExponential(1):''));}
  /* le hasard : meilleure separation sur etiquettes melangees */
  const perm=permMax(grandeursPerm,etiq,300,12345);
  P('  LE HASARD : sur '+grandeursPerm.length+' grandeurs lues a 0,6 s ou plus, etiquettes « mort » melangees (300 tirages), le meilleur J trouve : mediane '+q(perm,.5)+', 95 % '+q(perm,.95)+', 99 % '+q(perm,.99));
  P('');
  /* ---------- 4. par carte (la carte confond tout : le canyon tue 30 %, la jade 5 %) ---------- */
  P('== 4. Par carte, a 0,6 s : mediane morts | poses ==');
  const parC={};
  for(const k of ['canyon','grotte','ville','jade']){const m=M.filter(d=>d.carte===k),n=N.filter(d=>d.carte===k);
    const f=(L,g)=>L.map(d=>d.vues[.6]&&d.vues[.6][g]).filter(x=>x!=null);
    parC[k]={morts:m.length,poses:n.length};
    P('  '+k.padEnd(7)+' morts '+m.length+' poses '+n.length+' | '+['v','marge','capS','ligneS','jauge','pal'].map(g=>g+' '+q(f(m,g),.5)+'|'+q(f(n,g),.5)).join('  ')+' | fen.margeMin '+q(m.map(d=>d.fen.margeMin),.5)+'|'+q(n.map(d=>d.fen.margeMin),.5)+' | nitro a 0,6 '+m.filter(d=>d.vues[.6]&&d.vues[.6].nitro).length+'/'+m.filter(d=>d.vues[.6]).length+' | '+n.filter(d=>d.vues[.6]&&d.vues[.6].nitro).length+'/'+n.filter(d=>d.vues[.6]).length);}
  P('');
  /* ---------- 5. les memes endroits ---------- */
  P('== 5. Les endroits : s (distance sur la route du decollage), rang dans la visite, palier ==');
  const lst=M.slice().sort((a,b)=>a.carte<b.carte?-1:a.carte>b.carte?1:a.s-b.s);
  for(const d of lst)P('  '+d.carte.padEnd(7)+' s '+String(d.s).padStart(6)+'  '+d.course.padEnd(22)+' t '+String(d.td).padStart(6)+'  visite '+d.route+' (t '+d.tDansRoute+' s, decollage n. '+d.rangDansRoute+')  pal '+(d.dernier?d.dernier.pal:'-')+'  '+d.cause+'  vol '+d.dt+' s  '+(d.tientA06==null?'pas de sol':d.tientA06?'evitable':'impose')+'  annonce '+d.tPrem+' s'+(d.chaine?'  chaine '+d.ecartPose:''));
  /* paires a moins de 40 m sur la meme carte, entre morts, et avec les poses */
  const proches=(A,B,dm)=>{let n=0;const ex=[];for(const a of A)for(const b of B){if(a===b||a.carte!==b.carte||Math.abs(a.s-b.s)>dm)continue;if(A===B&&a.td+a.course>b.td+b.course)continue;n++;ex.push(a.carte+' '+a.s+'/'+b.s+' ('+a.course+' / '+b.course+')');}return {n,ex};};
  const pm=proches(M,M,40);P('  paires de morts sur la meme carte a moins de 40 m l\'une de l\'autre : '+pm.n+(pm.ex.length?' : '+pm.ex.join(' ; '):''));
  const memesC={};for(const d of M)inc(memesC,d.course);P('  morts par course : '+JSON.stringify(memesC));
  /* pour juger la coincidence : la meme mesure sur toutes les paires de decollages (morts et poses) */
  const pt=proches(decor,decor,40);P('  pour comparer : paires de decollages subis (morts ou poses) a moins de 40 m sur la meme carte : '+pt.n+' sur '+(decor.length*(decor.length-1)/2)+' paires');
  P('  la distance s depend-elle de la graine ? (s des premiers decollages de chaque course tenue, par carte) : '+JSON.stringify(['canyon','grotte','ville','jade'].reduce((o,k)=>{o[k]=decor.filter(d=>d.carte===k&&d.route===0&&d.rangDansRoute===1).map(d=>d.s);return o;},{})));
  P('');
  P('  rang du decollage dans la visite de la map : morts '+JSON.stringify(M.reduce((o,d)=>(inc(o,d.rangDansRoute>=4?'4+':d.rangDansRoute),o),{}))+' ; poses '+JSON.stringify(N.reduce((o,d)=>(inc(o,d.rangDansRoute>=4?'4+':d.rangDansRoute),o),{})));
  P('  temps depuis l\'entree dans la map (s), quantiles 25/50/75 : morts '+[.25,.5,.75].map(p=>q(M.map(d=>d.tDansRoute),p)).join(' / ')+' ; poses '+[.25,.5,.75].map(p=>q(N.map(d=>d.tDansRoute),p)).join(' / '));
  P('  visite (0 = premiere map de la course) : morts '+JSON.stringify(M.reduce((o,d)=>(inc(o,d.route),o),{}))+' ; poses '+JSON.stringify(N.reduce((o,d)=>(inc(o,d.route),o),{})));
  const palD=d=>d.dernier?d.dernier.pal:null;
  P('  palier a la derniere vue : morts '+JSON.stringify(M.reduce((o,d)=>(inc(o,palD(d)),o),{}))+' ; poses '+JSON.stringify(N.reduce((o,d)=>(inc(o,palD(d)),o),{})));
  P('  vitesse au decollage (km/h, evenement), quantiles 25/50/75 : morts '+[.25,.5,.75].map(p=>q(M.map(d=>d.kmhDecol),p)).join(' / ')+' ; poses '+[.25,.5,.75].map(p=>q(N.map(d=>d.kmhDecol),p)).join(' / '));
  {const b=meilleurSeuil(M.map(d=>d.kmhDecol),N.map(d=>d.kmhDecol));P('  vitesse au decollage, meilleur seuil '+b.sens+' '+b.s+' : morts '+b.a+'/'+b.b+' ; poses '+b.c+'/'+b.d+'  J '+b.J+'  p '+b.p2.toExponential(1)+' (lue AU decollage : pas 0,6 s avant)');
    sep.kmhDecol={b};}
  P('');
  fs.mkdirSync(SORT,{recursive:true});
  fs.writeFileSync(path.join(SORT,'avant-le-bord.txt'),L.join('\n')+'\n');
  fs.writeFileSync(path.join(SORT,'avant-le-bord.json'),JSON.stringify({date:new Date().toISOString(),source:'ml/ecurie/etude/sortie-preparee/sorties/lignes',separateurs:sep,hasard:{grandeurs:grandeursPerm.length,J:{m:q(perm,.5),p95:q(perm,.95),p99:q(perm,.99)}},decollages:decor}));
  process.stdout.write(L.join('\n')+'\n');}
main();
