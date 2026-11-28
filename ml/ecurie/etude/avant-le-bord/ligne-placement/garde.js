#!/usr/bin/env node
/* ===== LA GARDE AU BORD, REJOUEE SUR LES TRACES (28/11/2026, etude « avant le bord », concepteur « ligne et placement ») =====
   Lecture seule des traces de l'etude « sortie preparee » (../../sortie-preparee/sorties/lignes/*.jsonl.gz) et de la liste des decollages subis sur
   decor du lecteur des traces (../lecteur-traces/sorties/avant-le-bord.json). AUCUNE course : la regle n'est pas jouee, on compte seulement les vues
   ou sa CONDITION aurait ete vraie (la caisse, elle, a continue comme sans la regle : apres le premier declenchement la suite n'est plus la meme).
   La regle (gene propose « gardeOn ») : pour chaque cote k, capSur = (demi - gardeM - lat*k) / (gardeT * vitesse), borne a [0 ; 0,4] ;
     (a) BORNE  : le cap demande vers k depasse capSur (cap demande = (O.ligne - lat) / (0,9 * vitesse), ce que la main vise) ;
     (b) CONTRE : le cap de la caisse vers k depasse capSur (elle sera a gardeM du bord dans moins de gardeT s si rien ne change).
   Vues comptees : au sol, sur decor, ni dessous, ni glisse, ni rebond, sans raccourci engage (D.so nul), ordre « ligne ».
   usage : node garde.js   -> sorties/garde.txt et sorties/garde.json */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,LIG=path.join(ICI,'..','..','sortie-preparee','sorties','lignes'),SORT=path.join(ICI,'sorties');
const J=JSON.parse(fs.readFileSync(path.join(ICI,'..','lecteur-traces','sorties','avant-le-bord.json'),'utf8'));
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
const cl=(x,a,b)=>x<a?a:x>b?b:x;
const q=(a,p)=>{const b=a.filter(x=>x!=null&&isFinite(x)).sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(2);};
const L=[],P=s=>L.push(s);
const C={};
for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
  const X=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
  C[n.replace(/\.jsonl\.gz$/,'')]={h:X[0],V:X.slice(1).filter(v=>!v.erreurDiag)};}
const ok=s=>s.mo==='s'&&DECOR[s.c]&&!s.de&&!s.gl&&!s.rb&&!(s.D&&s.D.so)&&s.O&&s.O.ligne!=null&&s.lat!=null&&s.cap!=null;
const cmd=s=>(s.O.ligne-s.lat)/(.9*Math.max(6,s.v));
function etat(s,T,gM){
  const vit=Math.max(6,s.v),c=cmd(s);let borne=0,contre=0;
  for(const k of [1,-1]){const capSur=cl((s.demi-gM-s.lat*k)/(T*vit),0,.4);
    if(c*k>capSur+1e-6)borne=k;
    if(s.cap*k>capSur+1e-6)contre=k;}
  return {borne,contre};}
const D=J.decollages.filter(d=>d.fin==='mort'||d.fin==='pose');
const M=D.filter(d=>d.fin==='mort'),N=D.filter(d=>d.fin==='pose');
P('LA GARDE AU BORD rejouee sur les traces ('+Object.keys(C).length+' courses, '+D.length+' decollages subis sur decor : '+M.length+' morts, '+N.length+' poses) — '+new Date().toISOString().slice(0,10));
P('');
/* le sol contigu avant le decollage (comme avant-le-bord.js), la vue la plus proche d'abord */
function solAvant(d){const V=C[d.course].V,S=[];
  for(let k=V.length-1;k>=0;k--){const s=V[k];if(s.t>d.td+1e-9)continue;if(s.mo!=='s'){if(Math.abs(s.t-d.td)<1e-6)continue;break;}
    if(S.length&&S[S.length-1].t-s.t>.15)break;if(d.td-s.t>3.05)break;S.push(s);}
  return S;}
/* ---------- 0. le pilote a-t-il DEMANDE le cap vers le bord de la sortie ? ---------- */
P('== 0. Le cap DEMANDE par le pilote (vers la sortie = +), fenetre de 0,25 a 1 s avant le decollage ==');
const fen=(d,a,b)=>solAvant(d).filter(s=>d.td-s.t>=a-1e-9&&d.td-s.t<=b+1e-9&&s.O&&s.O.ligne!=null&&s.lat!=null&&s.cap!=null);
const zero={};
for(const [nom,G] of [['morts',M],['poses',N]]){
  const W=G.map(d=>{const F=fen(d,.25,1);if(F.length<3)return null;const c=F.map(s=>cmd(s)*d.co),k=F.map(s=>s.cap*d.co);
    return {d,cMax:Math.max(...c),cMoy:c.reduce((a,x)=>a+x,0)/c.length,kMax:Math.max(...k),pous:F.reduce((a,s)=>a+Math.max(0,s.v*Math.sin(cmd(s)*d.co))*.1,0)};}).filter(Boolean);
  zero[nom]={lisibles:W.length,sur:G.length,capDemandeMaxMed:q(W.map(w=>w.cMax),.5),ge015:W.filter(w=>w.cMax>=.15).length,ge025:W.filter(w=>w.cMax>=.25).length,lt005:W.filter(w=>w.cMax<.05).length,pousseMed:q(W.map(w=>w.pous),.5)};
  P('  '+nom+' (fenetre lisible : '+W.length+' sur '+G.length+') : cap demande max, mediane '+q(W.map(w=>w.cMax),.5)+' (q25 '+q(W.map(w=>w.cMax),.25)+', q75 '+q(W.map(w=>w.cMax),.75)+') ; moyen, mediane '+q(W.map(w=>w.cMoy),.5)+
    ' ; demande >= +0,15 vers la sortie a une vue au moins : '+W.filter(w=>w.cMax>=.15).length+' ; >= +0,25 : '+W.filter(w=>w.cMax>=.25).length+' ; jamais au-dessus de +0,05 : '+W.filter(w=>w.cMax<.05).length+
    ' ; metres pousses vers la sortie par la demande (somme de v.sin(cap demande).0,1 s), mediane '+q(W.map(w=>w.pous),.5));
  if(nom==='morts')for(const w of W)P('     '+w.d.course.padEnd(22)+' td '+String(w.d.td).padStart(7)+' '+String(w.d.cause).padEnd(7)+' cap demande max '+w.cMax.toFixed(2)+' moyen '+w.cMoy.toFixed(2)+' cap reel max '+w.kMax.toFixed(2)+' pousse '+w.pous.toFixed(0)+' m');}
P('');
/* ---------- 1. la regle, par reglage ---------- */
const res={};
for(const T of [.5,.7,.9,1.2])for(const gM of [4]){
  const cle='T'+T+'_g'+gM;const r=res[cle]={T,gM};
  let n=0,nb=0,nc=0,nbc=0,epis=0,episSuivis=0;
  for(const nom in C){const c=C[nom],V=c.V,dec=(c.h.ev||[]).filter(e=>e[1]==='decol').map(e=>e[0]);let tPrev=-9;
    for(const s of V){if(!ok(s))continue;
      const e=etat(s,T,gM);n++;if(e.borne)nb++;if(e.contre)nc++;if(e.borne||e.contre)nbc++;
      if(e.contre){if(s.t-tPrev>=.25){epis++;if(dec.some(t=>t>=s.t-1e-9&&t-s.t<=1.5))episSuivis++;}tPrev=s.t;}}}
  r.vues=n;r.borne=nb;r.contre=nc;r.unOuAutre=nbc;r.episodes=epis;r.episodesSuivis=episSuivis;
  const par=G=>G.map(d=>{const S=solAvant(d).filter(ok);let ta=null;
    for(const s of S){const e=etat(s,T,gM);if(e.borne===d.co)ta=+(d.td-s.t).toFixed(2);}
    /* le debut de la derniere serie continue de (b) du cote de la sortie, qui dure jusqu'au decollage */
    let deb=null;for(const s of S){const e=etat(s,T,gM);if(e.contre===d.co)deb=+(d.td-s.t).toFixed(2);else break;}
    return {d,nSol:S.length,contreDebut:deb,borneAncien:ta,tPrem:d.tPrem};});
  const pm=par(M),pn=par(N),cnt=(X,f)=>X.filter(f).length;
  const resume=X=>({n:X.length,avecSol:cnt(X,x=>x.nSol>0),contre:cnt(X,x=>x.contreDebut!=null),contre03:cnt(X,x=>x.contreDebut>=.3-1e-9),contre04:cnt(X,x=>x.contreDebut>=.4-1e-9),contre05:cnt(X,x=>x.contreDebut>=.5-1e-9),
    avantAnnonce:cnt(X,x=>x.contreDebut!=null&&x.contreDebut>(x.tPrem||0)+.05),borne:cnt(X,x=>x.borneAncien!=null&&x.borneAncien>=.3),medDebut:q(X.map(x=>x.contreDebut),.5)});
  r.morts=resume(pm);r.poses=resume(pn);
  r.detailMorts=pm.map(x=>({course:x.d.course,td:x.d.td,carte:x.d.carte,cause:x.d.cause,nSol:x.nSol,contreDebut:x.contreDebut,borneAncien:x.borneAncien,annonce:x.tPrem}));
  r.parCarte={};for(const k of ['canyon','grotte','ville','jade'])r.parCarte[k]={morts04:cnt(pm,x=>x.d.carte===k&&x.contreDebut>=.4-1e-9),morts:cnt(pm,x=>x.d.carte===k),poses04:cnt(pn,x=>x.d.carte===k&&x.contreDebut>=.4-1e-9),poses:cnt(pn,x=>x.d.carte===k)};
  P('== gardeT '+T+' s, gardeM '+gM+' m ==');
  P('  vues comptees (sol, decor, hors dessous/glisse/rebond/raccourci) : '+n+' ; (a) BORNE vraie : '+nb+' ('+(100*nb/n).toFixed(1)+' %) ; (b) CONTRE vraie : '+nc+' ('+(100*nc/n).toFixed(1)+' %) ; l\'une ou l\'autre : '+(100*nbc/n).toFixed(1)+' %');
  P('  episodes de (b) (series separees de 0,25 s) : '+epis+' ; suivis d\'un decollage dans 1,5 s : '+episSuivis+' ('+(100*episSuivis/Math.max(1,epis)).toFixed(0)+' %) ; '+(epis-episSuivis)+' ou la caisse est restee sur la route sans la regle');
  for(const [nom,x] of [['morts',r.morts],['poses',r.poses]])P('  '+nom+' : '+x.n+' (avec du sol lisible '+x.avecSol+') ; (b) vraie sans interruption jusqu\'au decollage : '+x.contre+' ; depuis >= 0,3 s : '+x.contre03+' ; >= 0,4 s : '+x.contre04+' ; >= 0,5 s : '+x.contre05+' ; avant l\'annonce des yeux : '+x.avantAnnonce+' ; debut median '+x.medDebut+' s ; (a) vraie du cote de la sortie a >= 0,3 s : '+x.borne);
  P('  par carte, (b) depuis >= 0,4 s : '+JSON.stringify(r.parCarte));
  P('');}
P('== detail des morts, gardeT 0,9 : debut de (b) avant le decollage (s) | annonce des yeux (s) ==');
for(const x of res['T0.9_g4'].detailMorts)P('  '+x.course.padEnd(22)+' '+String(x.carte).padEnd(7)+String(x.cause).padEnd(7)+' sol '+String(x.nSol).padStart(2)+' vues ; (b) depuis '+(x.contreDebut==null?'  -  ':String(x.contreDebut).padStart(5))+' ; (a) au plus tot '+(x.borneAncien==null?'  -  ':String(x.borneAncien).padStart(5))+' ; annonce '+x.annonce);
fs.mkdirSync(SORT,{recursive:true});
fs.writeFileSync(path.join(SORT,'garde.txt'),L.join('\n')+'\n');fs.writeFileSync(path.join(SORT,'garde.json'),JSON.stringify({date:new Date().toISOString(),zero,reglages:res}));
process.stdout.write(L.join('\n')+'\n');

/* ---------- 2. (ajout) la BORNE (a) dans la seconde d'avant : combien de decollages, de combien elle rabote, et hors decollage ---------- */
{const L2=[],P2=s=>L2.push(s),res2={};
  P2('');P2('== 2. La BORNE (a) du cote de la sortie, de 0,25 a 1 s avant le decollage (elle rabote le cap demande) ==');
  for(const T of [.5,.7,.9,1.2]){const gM=4;
    const un=d=>{const F=solAvant(d).filter(ok).filter(s=>d.td-s.t>=.25-1e-9&&d.td-s.t<=1+1e-9);let n=0,rab=0;
      for(const s of F){const vit=Math.max(6,s.v),capSur=cl((s.demi-gM-s.lat*d.co)/(T*vit),0,.4),c=cmd(s)*d.co;if(c>capSur+1e-6){n++;rab+=(c-capSur)*vit*.1;}}
      return {lis:F.length>=3,n,rab};};
    const m=M.map(un),p=N.map(un);
    let ep=0,epS=0,vues=0;
    for(const nom in C){const c=C[nom],dec=(c.h.ev||[]).filter(e=>e[1]==='decol').map(e=>e[0]);let tPrev=-9;
      for(const s of c.V){if(!ok(s))continue;vues++;if(etat(s,T,gM).borne){if(s.t-tPrev>=.25){ep++;if(dec.some(t=>t>=s.t-1e-9&&t-s.t<=1.5))epS++;}tPrev=s.t;}}}
    res2['T'+T]={morts:m.filter(x=>x.n>0).length,mortsLisibles:m.filter(x=>x.lis).length,poses:p.filter(x=>x.n>0).length,posesLisibles:p.filter(x=>x.lis).length,
      rabotMedMorts:q(m.filter(x=>x.n>0).map(x=>x.rab),.5),rabotMedPoses:q(p.filter(x=>x.n>0).map(x=>x.rab),.5),episodes:ep,episodesSuivis:epS};
    const r=res2['T'+T];
    P2('  gardeT '+T+' : morts '+r.morts+' sur '+r.mortsLisibles+' lisibles ; poses '+r.poses+' sur '+r.posesLisibles+' ; metres de traversee rabotes (mediane, ceux qu\'elle touche) : morts '+r.rabotMedMorts+', poses '+r.rabotMedPoses+
      ' ; episodes de (a) sur toutes les vues : '+r.episodes+', dont suivis d\'un decollage dans 1,5 s : '+r.episodesSuivis);}
  fs.appendFileSync(path.join(SORT,'garde.txt'),L2.join('\n')+'\n');fs.writeFileSync(path.join(SORT,'garde-borne.json'),JSON.stringify(res2));process.stdout.write(L2.join('\n')+'\n');}
