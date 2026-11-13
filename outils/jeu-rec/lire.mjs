#!/usr/bin/env node
/* ===== LIRE LES PARTIES ENREGISTRÉES (2026-11-13, Sacha : « que Claude comprenne comment je joue, pour la génération de maps ») =====
   Entrée : le .json du panneau PARTIES (PARTAGER / COPIER) ou de `dbgJeuRec('tout')`.
   Sortie : un RÉCIT en texte, fait pour être lu par Claude (et par Sacha) : par partie, le bilan, la route découpée en morceaux
   (droites / virages / serrés / modules / trous) avec ce que le joueur y a fait, la liste des vols, l'anticipation du pouce, une frise.
   Usage : node outils/jeu-rec/lire.mjs <parties.json> [--partie N] [--frise 1|0] [--pas 2]
   Conventions (repère de la route) : s = abscisse le long de la route (m) ; lat > 0 = à GAUCHE de l'axe (m) ; h = hauteur au-dessus de la dalle (m) ;
   courbure > 0 = la route tourne à GAUCHE ; st = stick horizontal du pouce (-1..1), steer = le braquage lissé (> 0 = à gauche). */
import fs from 'node:fs';

const args=process.argv.slice(2);
if(!args.length||args[0]==='-h'){console.log('usage : node outils/jeu-rec/lire.mjs <parties.json> [--partie N] [--frise 1|0] [--pas 2]');process.exit(0);}
const opt={partie:null,frise:true,pas:2};
for(let i=1;i<args.length;i++){if(args[i]==='--partie')opt.partie=+args[++i];else if(args[i]==='--frise')opt.frise=args[++i]!=='0';else if(args[i]==='--pas')opt.pas=+args[++i];}
let brut=fs.readFileSync(args[0],'utf8').trim();
let J=JSON.parse(brut);
const parties=Array.isArray(J)?J:J.parties||[J];

const f1=v=>(Math.round(v*10)/10).toString().replace('.',',');
const f0=v=>Math.round(v).toString();
const pc=v=>Math.round(v*100)+' %';
const moy=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const MODES=['sol','vol','figure','boom'];

function colonnes(c){const I={};c.cols.forEach((k,i)=>I[k]=i);return I;}

/* la route : courbure (°/100 m, lissée) et découpage en morceaux */
function lisRoute(R){
  const P=R.P,n=P.length,pas=R.pas,cap=P.map(p=>p[3]);
  const dc=[0];for(let i=1;i<n;i++){let d=cap[i]-cap[i-1];while(d>180)d-=360;while(d<-180)d+=360;dc.push(d);}
  const k=Math.max(1,Math.round(40/pas)),courb=[]; /* lissée sur ~80 m */
  for(let i=0;i<n;i++){let sm=0,m=0;for(let j=i-k;j<=i+k;j++)if(j>0&&j<n){sm+=dc[j];m++;}courb.push(m?sm/m*(100/pas):0);}
  const genre=c=>Math.abs(c)<6?'droite':(Math.abs(c)<25?'virage':'serré')+(c>0?' G':' D');
  const M=[];let cur=null;
  for(let i=0;i<n;i++){const g=genre(courb[i]);if(!cur||cur.g!==g){if(cur)M.push(cur);cur={g,i0:i,i1:i,deg:0,pente:[],envers:0};}
    cur.i1=i;cur.deg+=dc[i];cur.pente.push(P[i][4]);if(P[i][6])cur.envers=1;}
  if(cur)M.push(cur);
  /* fondre les miettes (< 60 m) dans le voisin */
  const G=[];for(const m of M){const l=(m.i1-m.i0+1)*pas;if(G.length&&l<60){const p=G[G.length-1];p.i1=m.i1;p.deg+=m.deg;p.pente.push(...m.pente);p.envers|=m.envers;}else G.push(m);}
  for(const m of G){m.s0=m.i0*pas;m.s1=(m.i1+1)*pas;m.pMoy=moy(m.pente);m.pMin=Math.min(...m.pente);m.pMax=Math.max(...m.pente);}
  return {courb,morceaux:G,courbA:s=>{const i=Math.max(0,Math.min(n-1,Math.round(s/pas)));return courb[i];}};
}

function recit(c,num){
  const I=colonnes(c),E=c.ech,out=[];
  const g=(e,k)=>e[I[k]];
  const T=E.length?g(E[E.length-1],'t'):0;
  out.push(`## PARTIE ${num} — ${c.debut.slice(0,16).replace('T',' ')} · v ${c.ver} · ${c.ecran&&c.ecran.portrait?'téléphone DEBOUT':'téléphone COUCHÉ'}${c.ecran&&c.ecran.app?' (app)':''} · ${c.voiture||'?'}${c.tuto?' · AUTO-ÉCOLE':''}`);
  const fin=c.fin||{};
  out.push(`Durée ${f1(fin.t||T)} s · fin : ${fin.cause||'?'} · ${fin.pieces??'?'} pièces · ${fin.figures??'?'} figures payées · ${fin.bumps??'?'} bumps · vmax ${fin.vmax??'?'} · routes : ${c.routes.map(r=>r.carte+(r.meteo?'/'+r.meteo:'')).join(' > ')}`);
  /* bilan du jeu */
  const nM=[0,0,0,0];for(const e of E)nM[g(e,'m')]++;
  const kmh=E.map(e=>g(e,'kmh'));
  const doigt=moy(E.map(e=>g(e,'doigt'))),stAbs=E.filter(e=>g(e,'doigt')).map(e=>Math.abs(g(e,'st')));
  out.push(`Temps : sol ${pc(nM[0]/E.length)} · vol ${pc(nM[1]/E.length)} · figure ${pc(nM[2]/E.length)} · vitesse moy ${f0(moy(kmh))} km/h, max ${f0(Math.max(...kmh))}`);
  out.push(`Pouce : posé ${pc(doigt)} du temps · |stick| moyen doigt posé ${f1(moy(stAbs)*100)} % · à fond (>90 %) ${pc(stAbs.filter(v=>v>.9).length/Math.max(1,stAbs.length))} · nitro ${pc(moy(E.map(e=>g(e,'nit'))))} · drift ${pc(moy(E.map(e=>g(e,'drift'))))}`);
  /* où sur la largeur (au sol) */
  const sol=E.filter(e=>g(e,'m')===0);
  if(sol.length){const H=[0,0,0,0,0],lab=['bord D','droite','centre','gauche','bord G'];
    for(const e of sol){const R=c.routes[g(e,'r')]||c.routes[0],u=g(e,'lat')/R.rh;H[Math.max(0,Math.min(4,Math.floor((u+1)/2*5)))]++;}
    out.push('Placement au sol (largeur en 5 bandes) : '+H.map((v,i)=>lab[i]+' '+pc(v/sol.length)).join(' · '));}
  /* événements */
  const ev=c.ev||[],par=t=>ev.filter(e=>e[1]===t);
  const vols=[];let d=null;
  for(const e of ev){if(e[1]==='decol')d=e;else if(e[1]==='pose'&&d){vols.push({t:d[0],orig:d[2],s:d[3],lat:d[4],kmh:d[5],duree:e[5],hMax:e[6],figs:e[7],sPose:e[2],latPose:e[3],kmhPose:e[4]});d=null;}
    else if(e[1]==='mort'&&d){vols.push({t:d[0],orig:d[2],s:d[3],lat:d[4],kmh:d[5],mort:e[2]});d=null;}}
  const R0=lisRoutes(c);
  /* l'anticipation : le décalage (s) où le stick colle le mieux à la courbure de la route devant */
  {let best=null;for(let tau=-.5;tau<=2.51;tau+=.25){const X=[],Y=[];
      for(const e of sol){const r=g(e,'r'),Rd=R0[r];if(!Rd)continue;const v=g(e,'kmh')/3.6*(g(e,'vm')||1);X.push(g(e,'steer'));Y.push(Rd.courbA(g(e,'s')+v*tau));}
      const r9=correl(X,Y);if(best==null||r9>best.r)best={tau,r:r9};}
    if(best)out.push(`Anticipation : le braquage colle le mieux à la courbure de la route ${f1(best.tau)} s devant (corrélation ${f1(best.r*100)} %)${best.r<.25?' — faible : le pouce ne suit pas les virages (vol, figures, ou route qui se prend sans braquer)':''}`);}
  out.push(`Vols : ${vols.length} (${['bord','trou','saut'].map(o=>o+' '+vols.filter(v=>v.orig===o).length).join(', ')}) · figures lancées ${par('fig').length} · morts ${par('mort').length}`);
  if(vols.length){out.push('','### Les vols');
    for(const v of vols)out.push(`- t ${f1(v.t)} s · décolle (${v.orig}) à s ${v.s} m, lat ${f1(v.lat)}, ${v.kmh} km/h${v.mort?` → MORT (${v.mort})`:` → ${f1(v.duree)} s en l'air, ${v.hMax} m au plus haut, ${v.figs} figure(s), pose à s ${v.sPose} (+${v.sPose-v.s} m), lat ${f1(v.latPose)}, ${v.kmhPose} km/h`}`);}
  /* la route, morceau par morceau */
  c.routes.forEach((R,ri)=>{const Rd=R0[ri];const ech=E.filter(e=>g(e,'r')===ri);if(!ech.length)return;
    const sMax=Math.max(...ech.map(e=>g(e,'s')));
    out.push('',`### Route ${ri} — ${R.carte}${R.meteo?' / '+R.meteo:''} · ${R.L} m · demi-largeur ${f1(R.rh)} m · parcourue jusqu'à s ${f0(sMax)}`);
    if(R.mods.length)out.push('Modules : '+R.mods.map(m=>`${m[2]||'module'}${m[3]?' (CLIMAX)':''} ${m[0]}-${m[1]} m`).join(' · '));
    if(R.trous.length)out.push('Trous : '+R.trous.map(t=>`${t[0]}-${t[1]} m`).join(' · '));
    out.push('| s (m) | tracé | pente ° | ce que fait le joueur |','|---|---|---|---|');
    for(const m of Rd.morceaux){if(m.s0>sMax+50)break;
      const dans=ech.filter(e=>g(e,'s')>=m.s0&&g(e,'s')<m.s1);
      const mod=R.mods.find(q=>q[0]<m.s1&&q[1]>m.s0),tr=R.trous.find(q=>q[0]<m.s1&&q[1]>m.s0);
      const trace=`${m.g} ${f0(Math.abs(m.deg))}°${m.envers?' (À L\'ENVERS)':''}${mod?' ['+(mod[2]||'module')+']':''}${tr?' [TROU]':''}`;
      let fait='—';
      if(dans.length){const t0=g(dans[0],'t'),t1=g(dans[dans.length-1],'t'),air=dans.filter(e=>g(e,'m')>0).length/dans.length;
        const lat=dans.filter(e=>g(e,'m')===0).map(e=>g(e,'lat'));
        const evs=ev.filter(e=>e[0]>=t0&&e[0]<=t1+.05&&['decol','pose','fig','mort','bump'].includes(e[1])).map(e=>e[1]==='decol'?'décolle('+e[2]+')':e[1]==='fig'?'figure '+e[2]:e[1]==='mort'?'MORT '+e[2]:e[1]);
        fait=`${f1(t1-t0)} s, ${f0(moy(dans.map(e=>g(e,'kmh'))))} km/h, ${air>0?pc(air)+' en l\'air, ':''}${lat.length?'lat '+f1(Math.min(...lat))+'…'+f1(Math.max(...lat))+' (moy '+f1(moy(lat))+')':''}, braquage moy ${f1(moy(dans.map(e=>g(e,'steer')))*100)} %${evs.length?' · '+evs.join(', '):''}`;}
      out.push(`| ${f0(m.s0)}-${f0(m.s1)} | ${trace} | ${f0(m.pMoy)} (${f0(m.pMin)}…${f0(m.pMax)}) | ${fait} |`);}
  });
  /* la frise */
  if(opt.frise){out.push('','### Frise (une ligne toutes les '+opt.pas+' s)','t s | route s | mode | lat/h | km/h | stick x,y doigt | braq | nitro drift | événements');
    let tN=0,iE=0;
    for(const e of E){const t=g(e,'t');if(t+1e-6<tN)continue;tN=t+opt.pas;
      const evs=[];while(iE<ev.length&&ev[iE][0]<=t+opt.pas){const x=ev[iE];if(!['piece'].includes(x[1]))evs.push(x.slice(1).join(' '));iE++;}
      out.push(`${f1(t)} | r${g(e,'r')} ${f0(g(e,'s'))} | ${MODES[g(e,'m')]}${g(e,'dessous')?' (dessous)':''} | ${f1(g(e,'lat'))}/${f1(g(e,'h'))} | ${g(e,'kmh')}${g(e,'vm')>1.01?'×'+f1(g(e,'vm')):''} | ${f1(g(e,'st')*100)},${f1(g(e,'sv')*100)} ${g(e,'doigt')?'●':'○'} | ${f0(g(e,'steer')*100)} | ${g(e,'nit')?'N':'-'}${g(e,'drift')?'D':'-'} | ${evs.join(' ; ')}`);}}
  return out.join('\n');
}
function lisRoutes(c){return c.routes.map(lisRoute);}
function correl(X,Y){const n=X.length;if(n<10)return 0;const mx=moy(X),my=moy(Y);let a=0,b=0,d=0;for(let i=0;i<n;i++){a+=(X[i]-mx)*(Y[i]-my);b+=(X[i]-mx)**2;d+=(Y[i]-my)**2;}return b&&d?a/Math.sqrt(b*d):0;}

const sortie=[`# CASH CAR — ${parties.length} partie(s) enregistrée(s)${J.exporte?' · exportées le '+J.exporte.slice(0,16).replace('T',' '):''}`,
  'Repère : s = abscisse le long de la route (m) · lat > 0 = à GAUCHE de l\'axe · h = hauteur au-dessus de la dalle · courbure/virage G = la route tourne à gauche · braquage > 0 = à gauche.',''];
parties.forEach((c,i)=>{if(opt.partie!=null&&opt.partie!==i)return;sortie.push(recit(c,i),'');});
console.log(sortie.join('\n'));
