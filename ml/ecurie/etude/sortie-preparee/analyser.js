#!/usr/bin/env node
/* ===== LES TABLEAUX DES DECOLLAGES (28/11/2026, etude « sortie preparee », le mesureur) =====
   Relit les lignes gardees (sorties/lignes/*.jsonl.gz, ecrites par course-diag.js --diag 1) SANS jouer une course, et ecrit
   sorties/decollages.json (chaque decollage, et les comptes) et sorties/decollages.txt (les tableaux a lire).
   usage : node analyser.js   (ou require('./analyser').analyser()) */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,SORT=path.join(ICI,'sorties'),LIG=path.join(SORT,'lignes');
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
/* les reglages de c0025 lus par les regles (genome.js, naissance) */
const R0={sortieT:.7,sortieJauge:.5,tenirFacon:.35,rienEcart:.2};

/* ---------- les categories d'un rayon ---------- */
/* P pose propre sur la dalle ; p pose de travers ou dessous ; L levre ; T portail ; C choc ; A air ou fond ; F libre ou coupe ; - absent */
function cat(r){if(!r)return '-';
  if(r.i==='pose')return (r.p===1&&!r.d)?'P':'p';
  if(r.i==='levre')return 'L';if(r.i==='portail')return 'T';if(r.i==='choc')return 'C';
  if(r.i==='air'||r.i==='fond')return 'A';if(r.i==='libre'||r.i==='coupe')return 'F';return '?';}
const MOT={P:'pose propre',p:'pose de travers ou dessous',L:'levre',T:'portail',C:'choc',A:'air ou fond',F:'libre (jauge vide a venir)','-':'absent','?':'autre'};
const RANG={P:4,p:3,L:3,T:3,F:2,C:1,A:1,'-':0,'?':0};
const sauve=c=>c==='P'||c==='p'||c==='L'||c==='T';
const ray=(L,m)=>Array.isArray(L)?L.find(x=>x&&x.m===m)||null:null;
const estRetour=f=>typeof f==='string'&&(f.indexOf('versRoute')===0||f.indexOf('retour')===0);
const LONGS=['rien','plane','versRoute','versRoutePlane','viser','viserPlane'];

function quantiles(a,qs){const b=a.slice().sort((x,y)=>x-y);if(!b.length)return qs.map(()=>null);
  return qs.map(q=>{const i=(b.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(3);});}
const pc=(a,b)=>b?Math.round(100*a/b)+' %':'-';
const inc=(o,k,n)=>{o[k]=(o[k]||0)+(n==null?1:n);};

function lireCourses(){
  if(!fs.existsSync(LIG))return [];
  const C=[];
  for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
    const L=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
    const h=L[0];C.push({nom:n.replace(/\.jsonl\.gz$/,''),res:h,vues:L.slice(1).filter(v=>!v.erreurDiag),erreursDiag:L.slice(1).filter(v=>v.erreurDiag).length});}
  return C;}

/* ---------- les vols d'une course, tires des vues ---------- */
function volsDe(c){
  const V=c.vues,res=c.res,ev=res.ev||[];
  const fins=[];   /* les points de mort : la derniere vue avant un trou (une mort, puis la reprise de la seconde chance) ou avant la fin */
  for(let i=0;i<V.length;i++){const suiv=V[i+1];
    if(suiv&&suiv.t-V[i].t>.15)fins.push(i);
    else if(!suiv&&res.cause!=='temps'&&res.cause!=='panne')fins.push(i);}
  const morts=ev.filter(e=>e[1]==='mort'),decols=ev.filter(e=>e[1]==='decol');
  const causeDe=k=>{const j=fins.indexOf(k);if(j<0)return null;return morts.length===fins.length?morts[j][2]:(morts[j]?morts[j][2]:'?');};
  const vols=[],mortsSol=[];
  for(const k of fins)if(V[k].mo==='s')mortsSol.push({t:V[k].t,carte:V[k].c,cause:causeDe(k)});
  for(let i=0;i<V.length;i++){
    const v=V[i];if(v.mo!=='v')continue;
    const p=V[i-1];if(p&&p.mo==='v'&&v.t-p.t<=.15)continue;
    /* un vol commence ici */
    let j=i;while(V[j+1]&&V[j+1].mo==='v'&&V[j+1].t-V[j].t<=.15)j++;
    const FV=V.slice(i,j+1),apres=V[j+1];
    let issue;
    if(fins.indexOf(j)>=0)issue={k:'mort',dt:+(V[j].t-v.t+.05).toFixed(2),cause:causeDe(j)};
    else if(apres&&apres.mo==='s'&&apres.t-V[j].t<=.15)issue={k:'pose',dt:+(apres.t-v.t).toFixed(2),cap:apres.cap,lat:apres.lat,iPose:j+1};
    else issue={k:'fin',dt:+(V[j].t-v.t).toFixed(2)};
    /* la derniere vue au sol, juste avant (sans trou) */
    const S=p&&p.mo==='s'&&v.t-p.t<=.15?p:null,SP=S?V[i-2]:null;
    const sol=[];for(let k=i-1;k>=0&&V[k].mo==='s'&&v.t-V[k].t<=1.65;k--)sol.push(V[k]);   /* les vues au sol des 1,6 s d'avant, la plus proche d'abord */
    const avecB=sol.filter(s=>s.B&&Array.isArray(s.B.R));
    const B0=avecB[0]||null;
    const Bavant=x=>{let b=null,bd=9;for(const s of avecB){const d=Math.abs((v.t-s.t)-x);if(d<bd){bd=d;b=s;}}return b&&bd<=.06?b:null;};
    const de=decols.reduce((b,e)=>{const d=Math.abs(e[0]-v.t+.05);return d<.3&&(!b||d<b.d)?{d,e}:b;},null);
    const D0=v.D||{},DS=S&&S.D||{};
    const defaut=DS.so&&DS.so.f?DS.so.f:'versRoute';
    /* les bascules en vol */
    const basc=[];for(let k=1;k<FV.length;k++){const a=FV[k-1].D&&FV[k-1].D.f,b=FV[k].D&&FV[k].D.f;if(a!==b)basc.push([FV[k].ft,a,b]);}
    if(D0.f&&D0.f!==defaut)basc.unshift([v.ft,defaut,D0.f]);
    /* les secours possibles (la condition de secoursOn, modele.js § 3.4, sur les rayons vus) */
    let secV=0,secS1=0,secS2=0,secFt=null;
    for(const w of FV){const D=w.D||{},Y=w.Y;if(!Y||!D.f)continue;
      if(D.f.indexOf('viser')===0&&(D.ma|0)<3)continue;
      if(sauve(cat(ray(Y,D.f))))continue;
      let longs=0,meurent=true;
      for(const nom of LONGS){if(!D.vo&&nom.indexOf('viser')===0)continue;const r=ray(Y,nom);if(!r)continue;longs++;if(!(r.i==='choc'||r.i==='air'||r.i==='fond')){meurent=false;break;}}
      if(longs>0&&meurent){secV++;if(secFt==null)secFt=w.ft;const Y2=w.YR||[];if(cat(Y2[1])==='P')secS1++;if(cat(Y2[2])==='P')secS2++;}}
    /* une issue annoncee en vol et pas prise : a une vue du vol, un rayon long autre que la facon tenue se pose propre (ou la levre) */
    let offertVol=0;for(const w of FV){const D=w.D||{},Y=w.Y;if(!Y||!D.f)continue;
      if(['rien','plane','versRoute','versRoutePlane'].some(m=>m!==D.f&&(cat(ray(Y,m))==='P'||cat(ray(Y,m))==='L'))&&!sauve(cat(ray(Y,D.f))))offertVol++;}
    const rays=s=>s?{rien:cat(ray(s.B.R,'rien')),versRoute:cat(ray(s.B.R,'versRoute')),plane:cat(ray(s.B.R,'plane'))}:null;
    vols.push({course:c.nom,carte:v.c,carteDemandee:res.carteDemandee||null,t0:v.t,vitesse:S?S.v:null,jauge:S?+((S.n||0)+(S.r||0)).toFixed(3):null,
      nitroSol:S&&S.O?!!S.O.nitro:null,nitroVol0:v.O?!!v.O.nitro:null,voulu:!!D0.vo,raccourci:DS.so||null,origine:de?de.e[2]:null,
      tn:sol.slice(0,15).map(s=>[+(v.t-s.t).toFixed(2),s.tn?s.tn.ti:null,s.tn?s.tn.t:null]),
      S:S?{t:S.t,lache:!!(S.tn&&S.tn.ti===false),tnT:S.tn?S.tn.t:null,de:S.de,gl:S.gl,rb:S.rb,B:!!(S.B&&S.B.R),soAvant:SP&&SP.mo==='s'&&SP.D?SP.D.so||null:null}:null,
      B0:B0?Object.assign({avant:+(v.t-B0.t).toFixed(2),tn:B0.tn?B0.tn.t:null,derniere:B0===S},rays(B0),{brut:B0.B.R}):null,
      B03:rays(Bavant(.3)),B07:rays(Bavant(.7)),B12:rays(Bavant(1.2)),
      defaut,facon:D0.f||null,radar0:v.Y?cat(ray(v.Y,D0.f)):null,bascules:basc,nVues:FV.length,
      secours:{vues:secV,ftPremiere:secFt,s1Propre:secS1,s2Propre:secS2},offertVol,issue});
  }
  return {vols,mortsSol,fins:fins.length,mortsEv:morts.length,decolsEv:decols.length};
}

/* ---------- les regles candidates, a la derniere vue au sol ---------- */
function garde(f){const S=f.S;return !!(S&&DECOR[f.carte]&&!S.soAvant&&!f.raccourci&&S.lache&&!S.de&&!S.gl&&!S.rb&&S.tnT!=null&&S.tnT<R0.sortieT&&f.jauge>R0.sortieJauge);}
const REGLES={
  R1:{mot:'le contrat : rien au choc, versRoute au choc, plane se pose propre (ou levre)',
    f:f=>garde(f)&&f.S.B&&f.B0&&f.B0.derniere&&f.B0.rien==='C'&&f.B0.versRoute==='C'&&(f.B0.plane==='P'||f.B0.plane==='L')},
  R2:{mot:'plane se pose propre et versRoute ne se pose pas propre',
    f:f=>garde(f)&&f.S.B&&f.B0&&f.B0.derniere&&f.B0.plane==='P'&&f.B0.versRoute!=='P'},
  R3:{mot:'plane se pose (propre ou non) et versRoute finit en choc',
    f:f=>garde(f)&&f.S.B&&f.B0&&f.B0.derniere&&(f.B0.plane==='P'||f.B0.plane==='p')&&f.B0.versRoute==='C'},
  R4:{mot:'le meilleur rayon du bord (pose propre > pose > libre > choc) s\'il bat versRoute',
    f:f=>{if(!(garde(f)&&f.S.B&&f.B0&&f.B0.derniere))return false;const r=RANG[f.B0.versRoute];return RANG[f.B0.rien]>r||RANG[f.B0.plane]>r;},
    choix:f=>{const r=RANG[f.B0.versRoute];return RANG[f.B0.rien]>=RANG[f.B0.plane]?(RANG[f.B0.rien]>r?'rien':'plane'):'plane';}},
  R5:{mot:'la nitro seule : garder la nitro au decollage (la garde de R1 sans les rayons ; la facon ne change pas)',
    f:f=>garde(f)&&f.nitroSol===false}
};
/* la meme garde et la meme regle sur TOUTES les vues au sol (fausse alerte : la regle part et la caisse ne decolle pas dans les 0,5 s) */
function fausses(c,vols){
  const t0s=vols.map(f=>f.t0),o={};
  const V=c.vues;
  for(let i=1;i<V.length;i++){const s=V[i];if(s.mo!=='s'||!s.tn||s.tn.ti!==false)continue;
    const sp=V[i-1];
    const f={carte:s.c,raccourci:s.D&&s.D.so||null,jauge:(s.n||0)+(s.r||0),nitroSol:s.O?!!s.O.nitro:null,
      S:{lache:true,tnT:s.tn.t,de:s.de,gl:s.gl,rb:s.rb,B:!!(s.B&&s.B.R),soAvant:sp&&sp.mo==='s'&&sp.D?sp.D.so||null:null},
      B0:s.B&&s.B.R?{derniere:true,rien:cat(ray(s.B.R,'rien')),versRoute:cat(ray(s.B.R,'versRoute')),plane:cat(ray(s.B.R,'plane'))}:null};
    const decolle=t0s.some(t=>t>s.t&&t-s.t<=.55);
    for(const k in REGLES)if(REGLES[k].f(f)){inc(o,k+'.vues');if(!decolle)inc(o,k+'.sansDecollage');}}
  return o;}

function analyser(){
  const C=lireCourses();
  if(!C.length){process.stdout.write('analyser : aucune ligne dans '+LIG+'\n');return null;}
  const tous=[],mortsSol=[],parCourse=[],fa={};
  let survie=0;const survieCarte={};
  for(const c of C){const A=volsDe(c);tous.push(...A.vols);mortsSol.push(...A.mortsSol.map(m=>Object.assign({course:c.nom},m)));
    const F=fausses(c,A.vols);for(const k in F)inc(fa,k,F[k]);
    const grp=c.res.carteDemandee?c.res.carteDemandee+' (tenue)':'sans carte';
    survie+=c.res.survie_s;inc(survieCarte,grp,c.res.survie_s);
    parCourse.push({course:c.nom,groupe:grp,graine:c.res.graine,palier:c.res.palier,survie_s:c.res.survie_s,cause:c.res.cause,cartes:c.res.cartes,
      causesMorts:c.res.causesMorts,chancePrise:c.res.chancePrise,vols:A.vols.length,decolsEv:A.decolsEv,finsVues:A.fins,mortsEv:A.mortsEv,erreurs:c.res.erreurs,erreursDiag:c.erreursDiag});}
  const L=[];const P=s=>L.push(s);
  const grpDe=f=>f.carteDemandee?f.carteDemandee+' (tenue)':'sans carte';
  const subis=tous.filter(f=>!f.voulu);
  P('LES DECOLLAGES DE c0025 (etude « sortie preparee », '+new Date().toISOString().slice(0,10)+')');
  P(C.length+' courses relues, '+tous.length+' decollages ('+subis.length+' subis, '+(tous.length-subis.length)+' voulus), '+(survie/60).toFixed(1)+' min de course.');
  P('Categories d\'un rayon : P pose propre sur la dalle, p pose de travers ou dessous, L levre, T portail, C choc, A air ou fond, F libre, - absent.');
  P('');
  /* ---- les courses ---- */
  P('== 0. Les courses ==');
  for(const q of parCourse)P('  '+q.course.padEnd(28)+' palier '+String(q.palier).padStart(2)+'  '+String(q.survie_s).padStart(6)+' s  '+String(q.cause).padEnd(7)+' '+(q.cartes||[]).join('>')+'  vols '+q.vols+' (decol '+q.decolsEv+')  morts '+JSON.stringify(q.causesMorts)+(q.chancePrise?' chance prise':'')+(q.finsVues!==q.mortsEv?'  (ATTENTION : '+q.finsVues+' fins vues, '+q.mortsEv+' morts dans les evenements)':'')+(q.vols!==q.decolsEv?'  (ATTENTION : '+q.vols+' vols vus, '+q.decolsEv+' decollages dans les evenements)':''));
  P('');
  /* ---- a. par carte ---- */
  P('== a. Par carte (la map ou la caisse decolle) : decollages subis par le bord, part mortelle, causes ==');
  const parCarte={};
  for(const f of tous){const k=f.carte;const o=parCarte[k]||(parCarte[k]={tous:0,voulus:0,subis:0,bord:0,bordMort:0,subisMort:0,voulusMort:0,causes:{},fin:0,mortDt:[]});
    o.tous++;if(f.voulu){o.voulus++;if(f.issue.k==='mort')o.voulusMort++;}else{o.subis++;if(f.issue.k==='mort'){o.subisMort++;inc(o.causes,f.issue.cause);o.mortDt.push(f.issue.dt);}
      if(f.origine==='bord'){o.bord++;if(f.issue.k==='mort')o.bordMort++;}}
    if(f.issue.k==='fin')o.fin++;}
  P('  carte    decol  voulus(morts)  subis  dont bord  subis morts  bord morts  causes des morts subies            mort apres (s, mediane)');
  for(const k of Object.keys(parCarte).sort()){const o=parCarte[k];
    P('  '+k.padEnd(8)+String(o.tous).padStart(6)+String(o.voulus).padStart(8)+'('+o.voulusMort+')'+String(o.subis).padStart(9)+String(o.bord).padStart(11)+('  '+o.subisMort+' ('+pc(o.subisMort,o.subis)+')').padStart(13)+('  '+o.bordMort+' ('+pc(o.bordMort,o.bord)+')').padStart(12)+'   '+JSON.stringify(o.causes).padEnd(34)+' '+quantiles(o.mortDt,[.5])[0]);}
  P('  morts au sol (pas en vol) : '+mortsSol.length+' '+JSON.stringify(mortsSol.reduce((o,m)=>(inc(o,m.carte+':'+m.cause),o),{})));
  P('  vols coupes par tmax : '+tous.filter(f=>f.issue.k==='fin').length);
  const avecB0=subis.filter(f=>f.B0);
  P('  rayon du bord vu avant un decollage subi : '+avecB0.length+' sur '+subis.length+' (la derniere vue au sol : '+avecB0.filter(f=>f.B0.derniere).length+') ; temps du bord annonce a la derniere vue au sol (tn.t), quantiles 10/50/90 % : '+JSON.stringify(quantiles(subis.filter(f=>f.S&&f.S.tnT!=null).map(f=>f.S.tnT),[.1,.5,.9])));
  P('  premiere annonce du bord (tient:false) avant le decollage, quantiles 10/50/90 % (s) : '+JSON.stringify(quantiles(subis.map(f=>{let x=null;for(const q of f.tn)if(q[1]===false)x=q[0];else break;return x;}).filter(x=>x!=null),[.1,.5,.9])));
  P('  rayons du bord dispo a 0,3 s / 0,7 s / 1,2 s avant le decollage : '+subis.filter(f=>f.B03).length+' / '+subis.filter(f=>f.B07).length+' / '+subis.filter(f=>f.B12).length+' (sur '+subis.length+')');
  P('');
  /* ---- b. la fiabilite des yeux ---- */
  P('== b. La fiabilite des yeux : ce que le rayon de la facon prise annoncait, et ce qui est arrive ==');
  const tab=(titre,liste,catDe)=>{const o={};for(const f of liste){const c=catDe(f);if(c==null)continue;const k=c;o[k]=o[k]||{n:0,pose:0,mort:0,fin:0};o[k].n++;o[k][f.issue.k]++;}
    P('  '+titre);for(const k of Object.keys(o).sort())P('    annonce '+(k+' ('+MOT[k]+')').padEnd(34)+' : '+String(o[k].n).padStart(4)+' vols, poses '+o[k].pose+' ('+pc(o[k].pose,o[k].n-o[k].fin)+'), morts '+o[k].mort+(o[k].fin?', coupes '+o[k].fin:''));return o;};
  const bA=tab('b1. vols SUBIS, rayon du bord « '+'versRoute'+' » (la facon prise au decollage) a la derniere vue au sol ou il existe :',subis.filter(f=>f.B0&&f.defaut==='versRoute'),f=>f.B0.versRoute);
  const bB=tab('b2. les memes, sans aucune bascule pendant le vol (versRoute tenu jusqu\'au bout) :',subis.filter(f=>f.B0&&f.defaut==='versRoute'&&!f.bascules.length),f=>f.B0.versRoute);
  const bC=tab('b3. tous les vols, rayon du radar de vol de la facon tenue a la PREMIERE vue en vol :',tous,f=>f.radar0);
  const bD=tab('b4. les memes, sans bascule :',tous.filter(f=>!f.bascules.length),f=>f.radar0);
  const bE=tab('b5. vols VOULUS (raccourci) : la facon engagee, rayon du radar a la premiere vue en vol :',tous.filter(f=>f.voulu),f=>f.radar0);
  P('');
  /* ---- c. les decollages mortels ---- */
  P('== c. Les decollages subis MORTELS : que disaient les rayons du bord a la derniere vue au sol ou ils existent ? ==');
  const combo=f=>f.B0?'rien '+f.B0.rien+'  versRoute '+f.B0.versRoute+'  plane '+f.B0.plane:'(pas de rayon du bord)';
  const mortels=subis.filter(f=>f.issue.k==='mort'),vivants=subis.filter(f=>f.issue.k==='pose');
  const cm={},cv={};for(const f of mortels)inc(cm,combo(f));for(const f of vivants)inc(cv,combo(f));
  P('  combinaison                            mortels   non mortels (poses)');
  for(const k of [...new Set(Object.keys(cm).concat(Object.keys(cv)))].sort((a,b)=>((cm[b]||0)-(cm[a]||0))||((cv[b]||0)-(cv[a]||0))))P('  '+k.padEnd(38)+String(cm[k]||0).padStart(8)+String(cv[k]||0).padStart(12));
  const offertBord=mortels.filter(f=>f.B0&&(sauve(f.B0.rien)||sauve(f.B0.plane)));
  const offertBordP=mortels.filter(f=>f.B0&&(f.B0.rien==='P'||f.B0.plane==='P'));
  P('  mortels ou un autre rayon du bord (rien ou plane) annoncait une pose ou la levre : '+offertBord.length+' sur '+mortels.length+' (une pose PROPRE : '+offertBordP.length+')');
  P('  mortels ou versRoute lui-meme annoncait une pose ou la levre : '+mortels.filter(f=>f.B0&&sauve(f.B0.versRoute)).length);
  P('  mortels ou, en vol, un rayon long (rien, plane, versRoute, versRoutePlane) autre que la facon tenue promettait une pose propre ou la levre alors que la facon tenue ne sauvait pas : '+mortels.filter(f=>f.offertVol>0).length+' vols');
  P('  mortels avec au moins une vue ou la condition des secours (secoursOn) est vraie : '+mortels.filter(f=>f.secours.vues>0).length+' ; dont un secours S1 propose une pose propre : '+mortels.filter(f=>f.secours.s1Propre>0).length+', S2 : '+mortels.filter(f=>f.secours.s2Propre>0).length);
  P('  non mortels avec la condition des secours vraie : '+vivants.filter(f=>f.secours.vues>0).length+' (S1 propre '+vivants.filter(f=>f.secours.s1Propre>0).length+', S2 propre '+vivants.filter(f=>f.secours.s2Propre>0).length+')');
  P('  mortels ou le pilote a bascule en vol : '+mortels.filter(f=>f.bascules.length).length+' ; duree du vol mortel (s), quantiles 10/50/90 % : '+JSON.stringify(quantiles(mortels.map(f=>f.issue.dt),[.1,.5,.9])));
  P('  voulus mortels : '+tous.filter(f=>f.voulu&&f.issue.k==='mort').length+' sur '+tous.filter(f=>f.voulu).length);
  P('');
  /* ---- d, e. les regles candidates ---- */
  P('== d, e. Les regles candidates, evaluees a la derniere vue au sol (garde commune : map a decor, route qui lache dans moins de 0,7 s, jauge > 0,5, ni dessous,');
  P('   ni glisse, ni rebond, aucun raccourci engage — la garde du contrat) ==');
  const gardes=subis.filter(garde);
  P('  decollages subis qui passent la garde : '+gardes.length+' sur '+subis.filter(f=>DECOR[f.carte]).length+' subis sur decor (nitro deja tenue au sol : '+gardes.filter(f=>f.nitroSol).length+')');
  const regles={};
  for(const k in REGLES){const R=REGLES[k],fx=subis.filter(R.f);
    const m=fx.filter(f=>f.issue.k==='mort'),nm=fx.filter(f=>f.issue.k==='pose');
    const parC={};for(const f of fx)inc(parC,f.carte);
    const parG={};for(const f of fx)inc(parG,grpDe(f));
    const ann=f=>k==='R5'?null:(k==='R4'?R.choix(f):'plane');
    const annonce=f=>{const a=ann(f);return a?f.B0[a]:null;};
    regles[k]={mot:R.mot,declenche:fx.length,parCourse180:+(fx.length/(survie/180)).toFixed(2),parCarte:parC,parGroupe:parG,mortels:m.length,nonMortels:nm.length,
      mortelsAnnoncePropre:m.filter(f=>annonce(f)==='P').length,nonMortelsDefautPropre:nm.filter(f=>f.B0&&f.B0.versRoute==='P').length,
      vuesSol:fa[k+'.vues']||0,sansDecollage:fa[k+'.sansDecollage']||0,
      liste:fx.map(f=>({course:f.course,t0:f.t0,carte:f.carte,issue:f.issue,bord:f.B0?combo(f):null,choix:ann(f)}))};
    P('  '+k+' — '+R.mot);
    P('     se declenche sur '+fx.length+' decollages ('+regles[k].parCourse180+' par course de 180 s) '+JSON.stringify(parC)+' ; mortels touches '+m.length+' (le rayon choisi y annoncait une pose propre : '+regles[k].mortelsAnnoncePropre+'), non mortels touches '+nm.length+' (dont versRoute annoncait deja une pose propre : '+regles[k].nonMortelsDefautPropre+')');
    const taux={};for(const g in survieCarte)taux[g]=+(((parG[g]||0))/(survieCarte[g]/180)).toFixed(2);
    regles[k].parCourse180ParGroupe=taux;
    P('     par course de 180 s, groupe par groupe : '+JSON.stringify(taux));
    P('     vues au sol ou elle part : '+regles[k].vuesSol+', dont sans decollage dans les 0,55 s : '+regles[k].sansDecollage);}
  P('');
  /* ---- f. rienOn ---- */
  P('== f. rienOn : en vol, les vues ou « rien » promet une pose propre ==');
  const ecarts=[],ecartsRegle=[],parCourseVues={};const seuils=[.02,.05,.1,.2];const declR={};
  for(const c of C){const V=c.vues;let rienVu={},fait={},vol=0;
    for(let i=0;i<V.length;i++){const w=V[i];if(w.mo!=='v'){vol++;rienVu={};fait={};continue;}
      const D=w.D||{},Y=w.Y;if(!Y||!D.f)continue;const r0=ray(Y,'rien');if(cat(r0)!=='P')continue;
      const q=ray(Y,D.f);
      if(q&&q.i==='pose'&&D.f!=='rien')ecarts.push(Math.abs(q.a||0)-Math.abs(r0.a||0));
      const ok0=D.f!=='rien'&&estRetour(D.f)&&w.t-D.tf>R0.tenirFacon&&q&&q.i==='pose';
      if(ok0){const e=Math.abs(q.a||0)-Math.abs(r0.a||0);ecartsRegle.push(e);
        for(const s of seuils){const kk=c.nom+'|'+s;if(e>=s)inc(parCourseVues,kk);
          if(!fait[s]&&e>=s){if(rienVu[s]!=null&&w.t-rienVu[s]<=.25){fait[s]=1;inc(declR,s);}else rienVu[s]=w.t;}else rienVu[s]=null;}}
      else for(const s of seuils)rienVu[s]=null;}}
  const nRienP=ecarts.length;
  P('  vues ou « rien » se pose propre et la facon tenue se pose aussi : '+nRienP+' ; ecart |axe facon tenue| - |axe rien| (rad, + = rien plus droit), quantiles 5/25/50/75/95 % : '+JSON.stringify(quantiles(ecarts,[.05,.25,.5,.75,.95])));
  P('  rien plus droit : '+ecarts.filter(e=>e>0).length+' ; rien plus tordu : '+ecarts.filter(e=>e<0).length+' ; egal : '+ecarts.filter(e=>e===0).length);
  P('  les memes vues sous la garde de rienOn (facon tenue = loi de retour, tenue depuis plus de 0,35 s) : '+ecartsRegle.length+', quantiles 5/25/50/75/95 % : '+JSON.stringify(quantiles(ecartsRegle,[.05,.25,.5,.75,.95])));
  for(const s of seuils){const n=ecartsRegle.filter(e=>e>=s).length;P('  rienEcart = '+s+' : '+n+' vues passent ('+(n/C.length).toFixed(2)+' par course ; '+(n/(survie/180)).toFixed(2)+' par course de 180 s) ; la regle entiere (deux vues de suite, une fois par vol) partirait '+(declR[s]||0)+' fois');}
  P('');
  /* ---- g. loiFidele.suit ---- */
  P('== g. loiFidele.suit : la commande des yeux (loi fidele, retour0) contre celle de versRoute du pilote, aux vues en versRoute ==');
  const dv=[],dm=[];let nSuit=0,nVues=0;
  for(const c of C)for(const w of c.vues){if(w.mo!=='v'||!w.D||w.D.f!=='versRoute'||!w.ret||!w.ret[0]||!w.O)continue;nVues++;
    const a=w.ret[0],o=w.O;const d=Math.abs((+a.v||0)-(+o.volant||0));dv.push(d);dm.push(a.m!==o.manche?1:0);if(a.v!==o.volant||a.m!==o.manche)nSuit++;}
  P('  vues en versRoute avec la loi fidele : '+nVues+' ; le compteur d\'aujourd\'hui (toute difference) en compterait '+nSuit+' ('+pc(nSuit,nVues)+')');
  P('  |volant des yeux - volant du pilote|, quantiles 10/25/50/75/90/95/99 % : '+JSON.stringify(quantiles(dv,[.1,.25,.5,.75,.9,.95,.99])));
  P('  manche different : '+dm.reduce((a,b)=>a+b,0)+' vues');
  const sv=[0,.005,.01,.02,.05,.1,.2,.5];
  P('  vues comptees selon le seuil (volant different de plus que le seuil, ou manche different) :');
  for(const s of sv){let n=0;for(let i=0;i<dv.length;i++)if(dv[i]>s+1e-9||dm[i])n++;P('    seuil '+String(s).padEnd(5)+' : '+n+' ('+pc(n,nVues)+')');}
  const histo={};for(const d of dv){const b=d<=.005?'<=0,005':d<=.01?'0,005-0,01':d<=.02?'0,01-0,02':d<=.05?'0,02-0,05':d<=.1?'0,05-0,1':d<=.2?'0,1-0,2':d<=.5?'0,2-0,5':'>0,5';inc(histo,b);}
  P('  repartition : '+JSON.stringify(histo));
  P('');
  const sortie={date:new Date().toISOString(),courses:parCourse,survie_s:survie,survieParGroupe:survieCarte,parCarte,fiabilite:{b1:bA,b2:bB,b3:bC,b4:bD,b5:bE},
    combinaisons:{mortels:cm,poses:cv},regles,rienOn:{ecarts,ecartsRegle,declenchementsSimules:declR},loiFidele:{vues:nVues,suitAujourdhui:nSuit,dv,dm},
    mortsSol,decollages:tous};
  fs.writeFileSync(path.join(SORT,'decollages.json'),JSON.stringify(sortie));
  fs.writeFileSync(path.join(SORT,'decollages.txt'),L.join('\n')+'\n');
  process.stdout.write(L.join('\n')+'\n');
  return sortie;
}
module.exports={analyser,cat,REGLES,volsDe,lireCourses};
if(require.main===module)analyser();
