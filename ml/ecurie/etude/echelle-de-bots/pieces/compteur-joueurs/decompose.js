#!/usr/bin/env node
/* ===== LE COMPTEUR DES JOUEURS (2026-11-28, etude « echelle de bots », mesure « d'ou viennent les pieces ») =====
   Decompose les pieces (coinsGot, ce qui fait le palier) des 14 parties de joueurs, partie par partie et minute par minute, et les met face
   aux 20 courses enregistrees de c0025 (ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json, meme enregistreur du jeu, 900 s au plus).
   CE QUI FAIT MONTER coinsGot (lu dans code/) : addCoins n'a que deux appels de jeu :
     · gameplay/ramassage.js:174   addCoins(1) par piece ramassee (aimant compris : la piece tiree arrive par le meme chemin) ;
     · gameplay/demi-tour.js:574   addCoins(2..18) a la pose d'un vol a figures ; gameplay/figures-route.js:64 addCoins(2..18) a la figure de route.
     Frenesie, flow, combo, contrats, raccourcis, billets : ils multiplient l'ARGENT (money), jamais coinsGot. La seconde chance RETIRE un palier
     (gameplay/seconde-chance.js:188, moteurPerte 1). Le depart booste (economie/final-spin.js:482) pose coinsGot a 40 avant la course.
   CE QUE L'ENREGISTREUR PERMET (code/moteur/enregistreur-jeu.js:82-84) : un evenement 'piece' = la hausse de coinsGot dans UNE image ;
     'figure_payee' tombe dans la MEME image que les pieces de sa figure. Donc : piece a l'instant d'une figure_payee = pieces de figure
     (une piece de route prise dans la meme image y est comptee avec, au plus 1 a 2 par figure) ; sinon = pieces de route.
     Une figure payee a l'instant d'un 'pose' = figure de vol ; loin de toute pose = figure de route (au sol).
   usage : node ml/ecurie/etude/echelle-de-bots/pieces/compteur-joueurs/decompose.js  (ecrit sortie.txt et sortie.json a cote). Lecture seule. */
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..','..','..','..','..','..');
const {partiesJoueurs,mesures,finVraie,SEUILS,palierDe}=require(path.join(R,'ml/bot/mesures'));
const D=path.join(R,'ml/bot/etalon');
const QUI={'cashcar-parties-2026-11-23-1950.json':'S','cashcar-parties-2026-11-23-2020.json':'S','cashcar-parties-2026-11-24-1213.json':'S','cashcar-parties-2026-11-24-11-05.json':'L'};
const lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).sort().map(x=>{const j=JSON.parse(fs.readFileSync(path.join(D,x),'utf8'));(j.parties||[]).forEach(p=>p._f=x);return {nom:x,j};});
const J=partiesJoueurs(lus).parties.map(c0=>({c:finVraie(c0),m:mesures(c0),qui:QUI[c0._f]||'?'}));
const BOTF=path.join(R,'ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json');
const B=JSON.parse(fs.readFileSync(BOTF,'utf8')).parties.map(x=>({c:finVraie(x.partie),m:mesures(x.partie),qui:'c0025'}));

const FEN=[[0,60,'min 1'],[60,120,'min 2'],[120,180,'min 3'],[180,1e9,'min 4+']];
const PAL=[[1,4],[5,8],[9,12],[13,30]];
const fx=(x,k)=>x==null||!isFinite(x)?'-':(+x).toFixed(k==null?0:k);

/* UNE PARTIE : chaque piece rangee par source, chaque echantillon par fenetre, palier et route */
function lire(c){
  const col={};c.cols.forEach((n,i)=>col[n]=i);const g=(e,n)=>e[col[n]];
  const ev=c.ev,T=c.fin.t;
  const vols=[];let d=null;for(const e of ev){if(e[1]==='decol')d=e[0];else if((e[1]==='pose'||e[1]==='mort')&&d!=null){vols.push([d,e[0]]);d=null;}}
  const enVol=t=>vols.some(v=>t>v[0]&&t<=v[1]+1e-6);
  const poses=ev.filter(e=>e[1]==='pose').map(e=>e[0]);
  const figT=new Map();for(const e of ev)if(e[1]==='figure_payee')figT.set(e[0].toFixed(2),(figT.get(e[0].toFixed(2))||0)+(e[2]|0));
  /* le palier a chaque instant : la somme des pieces ; la seconde chance ramene au seuil du palier d'en dessous */
  const P=[];let run=0;const palA=[];/* [t, palier] */
  for(const e of ev){
    if(e[1]==='seconde_chance'){const k=palierDe(run)-1;run=SEUILS[Math.max(0,k-1)];palA.push([e[0],palierDe(run)]);continue;}
    if(e[1]!=='piece')continue;const t=e[0],n=e[2]|0,k=t.toFixed(2),nf=figT.get(k)||0;
    const palAvant=palierDe(run);
    let src;if(n>=40&&t<3&&run===0)src='autre';
    else if(nf>0){const dp=Math.min(...poses.map(p=>Math.abs(p-t)).concat([1e9]));src=dp<.25?'fig_vol':'fig_route';}
    else src=enVol(t)?'route_air':'route_sol';
    run+=n;P.push({t,n,src,nf,pal:palAvant});palA.push([t,palierDe(run)]);}
  const palAt=t=>{let p=1;for(const q of palA){if(q[0]>t)break;p=q[1];}return p;};
  /* les echantillons : distance (comme mesures.js), air, nitro, km/h au sol, route */
  const S=[];const E=c.ech;
  for(let i=1;i<E.length;i++){const a=E[i-1],b=E[i],t=g(b,'t'),dt=t-g(a,'t');if(!(dt>0&&dt<.3))continue;
    const ds=g(b,'r')===g(a,'r')?g(b,'s')-g(a,'s'):0;
    S.push({t,dt,ds:ds>0&&ds<400?ds:0,air:g(b,'m')===1||g(b,'m')===2,nit:!!g(b,'nit'),kmh:g(b,'kmh'),sol:g(b,'m')===0,r:g(b,'r'),pal:palAt(t)});}
  const rAt=t=>{let r=0;for(const s of S){if(s.t>t)break;r=s.r;}return r;};
  for(const p of P)p.r=rAt(p.t);
  return {P,S,vols,decol:ev.filter(e=>e[1]==='decol').map(e=>e[0]),route:ev.filter(e=>e[1]==='route').map(e=>e[0]),
    figs:ev.filter(e=>e[1]==='figure_payee'),T,perte:P.reduce((a,p)=>a+p.n,0)-(c.fin.pieces|0)};
}
const SRC=['route_sol','route_air','fig_vol','fig_route','autre'];
function bilan(L,filtre){ /* L = liste de lectures ; filtre(t) -> fenetre */
  const o={min:0,km:0,airS:0,nitS:0,solN:0,solK:0,vols:0,portails:0,figs:0,src:Object.fromEntries(SRC.map(k=>[k,0])),nFig:0};
  for(const x of L){for(const s of x.S)if(filtre(s.t,s)){o.min+=s.dt/60;o.km+=s.ds/1000;if(s.air)o.airS+=s.dt;if(s.nit)o.nitS+=s.dt;if(s.sol){o.solN++;o.solK+=s.kmh;}}
    for(const p of x.P)if(filtre(p.t,p)){o.src[p.src]+=p.n;if(p.src.startsWith('fig'))o.nFig+=p.nf;}
    for(const t of x.decol)if(filtre(t,{pal:null,r:null,t}))o.vols++;
    for(const t of x.route)if(filtre(t,{pal:null,r:null,t}))o.portails++;}
  o.tot=SRC.reduce((a,k)=>a+o.src[k],0);o.route=o.src.route_sol+o.src.route_air;o.fig=o.src.fig_vol+o.src.fig_route;
  return o;}
const out=[],J2={};const P_=s=>out.push(s);
const lJ=J.map(x=>Object.assign(x,{l:lire(x.c)})),lB=B.map(x=>Object.assign(x,{l:lire(x.c)}));

/* 1. PARTIE PAR PARTIE */
P_('COMPTEUR DES JOUEURS : d\'ou viennent les pieces (coinsGot). Lecture seule, '+new Date().toISOString().slice(0,10));
P_('Joueurs : ml/bot/etalon/*.json via partiesJoueurs ('+J.length+' parties). c0025 : '+path.relative(R,BOTF).replace(/\\/g,'/')+' ('+B.length+' courses, tmax 900, meme enregistreur).');
P_('S = joueur au clavier, L = joueur au doigt (les deux habitues de l\'etude). Sources : route_sol / route_air = pieces ramassees (1 chacune) au sol / en vol ;');
P_('fig_vol = pieces payees a la pose d\'un vol a figures ; fig_route = figure de route (au sol) ; perte = ce que la seconde chance a repris.\n');
P_('## 1. Partie par partie');
const tabP=(lst,nom)=>{P_(`\n${nom}\nqui | palier | duree s | pieces | /min | route_sol | route_air | fig_vol (nb fig) | fig_route (nb) | %fig | km/min | route/km | %air | vols/min | fig/vol | %nitro | portails | perte SC`);
  const rows=[];
  for(const x of lst){const l=x.l,o=bilan([l],()=>true),m=x.m,figV=l.figs.length;
    const nfV=l.P.filter(p=>p.src==='fig_vol').reduce((a,p)=>a+p.nf,0),nfR=l.P.filter(p=>p.src==='fig_route').reduce((a,p)=>a+p.nf,0);
    const r={qui:x.qui,palier:m.palier,duree:m.duree_s,pieces:o.tot,pmin:o.tot/(m.duree_s/60),route_sol:o.src.route_sol,route_air:o.src.route_air,fig_vol:o.src.fig_vol,nfV,fig_route:o.src.fig_route,nfR,
      pfig:100*o.fig/Math.max(1,o.tot),kmmin:o.km/o.min,routekm:o.route/Math.max(1e-9,o.km),air:100*o.airS/(o.min*60),volsmin:o.vols/(m.duree_s/60),figvol:m.vols?nfV/m.vols:0,nit:100*o.nitS/(o.min*60),portails:l.route.length,perte:l.perte};
    rows.push(r);
    P_([r.qui,r.palier,fx(r.duree,1),r.pieces,fx(r.pmin),r.route_sol,r.route_air,r.fig_vol+' ('+nfV+')',r.fig_route+' ('+nfR+')',fx(r.pfig,1),fx(r.kmmin,2),fx(r.routekm),fx(r.air),fx(r.volsmin,1),fx(r.figvol,2),fx(r.nit),r.portails,r.perte].join(' | '));}
  return rows;};
J2.parties_joueurs=tabP(lJ.sort((a,b)=>a.m.palier-b.m.palier),'JOUEURS (14)');
J2.parties_c0025=tabP(lB.sort((a,b)=>a.m.palier-b.m.palier),'c0025 (20 courses enregistrees)');

/* 2. MINUTE PAR MINUTE : la recette */
P_('\n## 2. Minute par minute (temps de toutes les parties encore en vie dans la fenetre ; taux = total / minutes vecues)');
const tabF=(L,nom)=>{P_(`\n${nom}\nfenetre | parties vivantes | minutes | pieces/min | route_sol/min | route_air/min | fig_vol/min | fig_route/min | figures payees/min | pieces/figure | km/min | pieces de route/km | %air | vols/min | %nitro | km/h sol | portails/min`);
  const rows=[];for(const [a,b,nm] of FEN){const o=bilan(L,t=>t>=a&&t<b),viv=L.filter(l=>l.T>a).length,mi=o.min;
    const r={fen:nm,vivantes:viv,minutes:mi,pmin:o.tot/mi,sol:o.src.route_sol/mi,air_p:o.src.route_air/mi,fv:o.src.fig_vol/mi,fr:o.src.fig_route/mi,figmin:o.nFig/mi,pparfig:o.fig/Math.max(1,o.nFig),
      kmmin:o.km/mi,routekm:o.route/Math.max(1e-9,o.km),air:100*o.airS/(mi*60),volsmin:o.vols/mi,nit:100*o.nitS/(mi*60),kmh:o.solK/Math.max(1,o.solN),portmin:o.portails/mi,
      part:Object.fromEntries(SRC.map(k=>[k,100*o.src[k]/Math.max(1,o.tot)]))};rows.push(r);
    P_([nm,viv,fx(mi,1),fx(r.pmin),fx(r.sol),fx(r.air_p),fx(r.fv),fx(r.fr),fx(r.figmin,1),fx(r.pparfig,1),fx(r.kmmin,2),fx(r.routekm),fx(r.air),fx(r.volsmin,1),fx(r.nit),fx(r.kmh),fx(r.portmin,2)].join(' | '));}
  const o=bilan(L,()=>true),mi=o.min;P_(['TOUT',L.length,fx(mi,1),fx(o.tot/mi),fx(o.src.route_sol/mi),fx(o.src.route_air/mi),fx(o.src.fig_vol/mi),fx(o.src.fig_route/mi),fx(o.nFig/mi,1),fx(o.fig/Math.max(1,o.nFig),1),fx(o.km/mi,2),fx(o.route/o.km),fx(100*o.airS/(mi*60)),fx(o.vols/mi,1),fx(100*o.nitS/(mi*60)),fx(o.solK/o.solN),fx(o.portails/mi,2)].join(' | '));
  P_('recette sur 100 pieces : fenetre | route_sol | route_air | fig_vol | fig_route | autre');
  for(const r of rows)P_([r.fen,...SRC.map(k=>fx(r.part[k]))].join(' | '));
  P_(['TOUT',...SRC.map(k=>fx(100*o.src[k]/o.tot))].join(' | '));
  return rows;};
J2.fen_joueurs=tabF(lJ.map(x=>x.l),'JOUEURS');
J2.fen_c0025=tabF(lB.map(x=>x.l),'c0025');
J2.fen_clavier=tabF(lJ.filter(x=>x.qui==='S').map(x=>x.l),'JOUEUR S seul (clavier, 10 parties)');
J2.fen_doigt=tabF(lJ.filter(x=>x.qui==='L').map(x=>x.l),'JOUEUR L seul (doigt, 4 parties)');

/* 3. LE PALIER LUI-MEME : km/min et pieces/km selon le palier courant, et pieces/km selon le nombre de portails franchis */
P_('\n## 3. L\'effet du palier : vitesse (km/min) ou densite (pieces de route / km) ?');
const tabPal=(L,nom)=>{P_(`\n${nom} — par palier courant\npaliers | minutes | km/min | pieces de route/km | pieces de route/min | fig/min (pieces) | km/h sol | %air`);
  for(const [a,b] of PAL){const o=bilan(L,(t,x)=>x.pal!=null&&x.pal>=a&&x.pal<=b);if(o.min<.05){P_(a+'-'+b+' | -');continue;}
    P_([a+'-'+b,fx(o.min,1),fx(o.km/o.min,2),fx(o.route/o.km),fx(o.route/o.min),fx(o.fig/o.min),fx(o.solK/Math.max(1,o.solN)),fx(100*o.airS/(o.min*60))].join(' | '));}
  P_(`${nom} — par nombre de portails franchis (la route n° r de l'enregistrement ; economie.md : densite 55, 97, 141, 188, 240 /km)\nportails | minutes | km/min | pieces de route/km`);
  for(const [a,b] of [[0,0],[1,1],[2,2],[3,3],[4,99]]){const o=bilan(L,(t,x)=>x.r!=null&&x.r>=a&&x.r<=b);if(o.min<.05){P_(a+(b>a?'+':'')+' | -');continue;}
    P_([a+(b>a?'+':''),fx(o.min,1),fx(o.km/o.min,2),fx(o.route/o.km)].join(' | '));}};
tabPal(lJ.map(x=>x.l),'JOUEURS');tabPal(lB.map(x=>x.l),'c0025');

/* 4. LA DECOMPOSITION DE L'ECART : route/min = km/min x route/km ; + figures */
P_('\n## 4. L\'ecart joueurs / c0025, fenetre par fenetre (rapports ; log-decomposition de route/min = km/min x pieces/km)');
P_('fenetre | pieces/min J / B | route/min J / B | km/min J / B | route/km J / B | part de l\'ecart de route/min due aux km (log) | fig/min J / B');
J2.ecart=[];
for(let i=0;i<FEN.length;i++){const a=J2.fen_joueurs[i],b=J2.fen_c0025[i];const rJ=a.sol+a.air_p,rB=b.sol+b.air_p;
  const lk=Math.log(a.kmmin/b.kmmin),ld=Math.log(a.routekm/b.routekm),part=lk/(lk+ld);
  J2.ecart.push({fen:a.fen,partKm:part});
  P_([a.fen,fx(a.pmin)+' / '+fx(b.pmin),fx(rJ)+' / '+fx(rB),fx(a.kmmin,2)+' / '+fx(b.kmmin,2),fx(a.routekm)+' / '+fx(b.routekm),fx(100*part)+' %',fx(a.fv+a.fr)+' / '+fx(b.fv+b.fr)].join(' | '));}

/* 5. FOURCHETTES : rééchantillonnage des PARTIES (bootstrap, 4000 tirages) sur les rapports joueurs / c0025, toutes minutes */
P_('\n## 5. Fourchettes (bootstrap sur les parties, 4000 tirages ; 2,5 % - 97,5 %)');
let gr=12345;const rnd=()=>{gr=(gr*1103515245+12345)%2147483648;return gr/2147483648;};
const tir=A=>A.map(()=>A[Math.floor(rnd()*A.length)]);
const stat=(L,f)=>{const o=bilan(L,f||(()=>true));return {pmin:o.tot/o.min,route:o.route/o.min,km:o.km/o.min,dens:o.route/o.km,fig:o.fig/o.min,pfig:100*o.fig/o.tot,air:100*o.airS/(o.min*60),vols:o.vols/o.min};};
const q=(A,p)=>{const s=A.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*s.length))];};
const LJ=lJ.map(x=>x.l),LB=lB.map(x=>x.l);
for(const [nm,f] of [['toutes minutes',null],['min 1 (0-60 s)',t=>t<60],['apres 60 s',t=>t>=60]]){
  const sJ=stat(LJ,f),sB=stat(LB,f),bs={};for(const k in sJ)bs[k]=[];
  for(let i=0;i<4000;i++){const a=stat(tir(LJ),f),b=stat(tir(LB),f);for(const k in sJ)bs[k].push(a[k]/b[k]);}
  P_(`\n${nm} : mesure | joueurs | c0025 | rapport J/B [IC 95 %]`);
  for(const k in sJ)P_([k,fx(sJ[k],k==='km'?2:0),fx(sB[k],k==='km'?2:0),fx(sJ[k]/sB[k],2)+' ['+fx(q(bs[k],.025),2)+' ; '+fx(q(bs[k],.975),2)+']'].join(' | '));
  J2['ic_'+nm]={sJ,sB};}

/* 6. Le palier 1 et la route : pieces de route par km au premier kilometre (densite de depart, avant tout portail) */
P_('\n## 6. La premiere route (avant le premier portail) : pieces de route par km et km/min');
for(const [nm,L] of [['joueurs',LJ],['c0025',LB]]){const o=bilan(L,(t,x)=>x.r===0);P_(`${nm} : ${fx(o.min,1)} min, ${fx(o.km/o.min,2)} km/min, ${fx(o.route/o.km)} pieces de route/km, ${fx(o.fig/o.min)} pieces de figure/min`);}
/* 7. Temps jusqu'au premier portail et longueur de la premiere route */
P_('\n## 7. Le premier portail : instant (s) et longueur de la premiere route (m)');
for(const [nm,L] of [['joueurs',lJ],['c0025',lB]]){const t=L.map(x=>x.l.route[0]).filter(v=>v!=null).sort((a,b)=>a-b),Lr=L.map(x=>x.c.routes[0].L).sort((a,b)=>a-b);
  P_(`${nm} : premier portail atteint par ${t.length}/${L.length} ; instants ${t.map(v=>fx(v)).join(' ')} ; mediane ${fx(q(t,.5))} s ; longueur mediane route 1 : ${fx(q(Lr,.5))} m`);}

fs.writeFileSync(path.join(__dirname,'sortie.txt'),out.join('\n')+'\n');
fs.writeFileSync(path.join(__dirname,'sortie.json'),JSON.stringify(J2,null,1));
console.log(out.join('\n'));
