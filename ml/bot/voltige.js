#!/usr/bin/env node
/* ===== LA VOLTIGE : les vols d'un lot de parties, un par un (2026-11-26, Sacha : « les bots sont encore trop frileux de s'envoler et de faire
   des figures dans les airs […] parfois ils n'osent pas prendre des raccourcis evidents ») =====
   Ce que mesures.js resume en trois chiffres (vols par minute, raccourcis par minute, figures lancees), ce fichier le DETAILLE, pareil pour un
   joueur et pour un bot : pour chaque vol, d'ou il part (bord, saut), DE QUEL COTE du virage (interieur = couper), combien de piste il saute,
   combien il dure, a quelle hauteur, combien de figures, lesquelles, quand la premiere part, ou il se pose.
   usage : node voltige.js                       les joueurs de l'etalon (ml/bot/etalon/)
           node voltige.js <note faite avec --parties> [--nom x]   un bot
           --humains clavier|doigt|tous (clavier)   --vols (la liste, un vol par ligne)   --json <fichier>
   `resume(parties)` est exporte : la boucle (ml/ecurie/boucle.js) et les comptes rendus lisent les memes chiffres. */
const fs=require('fs'),path=require('path');
const {partiesJoueurs,partiesDe,finVraie,RACC}=require('./mesures');

/* le virage de la route entre s0 et s0+L metres (degres, + a gauche) : lu sur les points de la route (cap en degres, un point tous les `pas` m) */
function virageDe(route,s0,L){
  if(!route||!Array.isArray(route.P)||!route.pas)return null;
  const ic=(route.cols||[]).indexOf('cap');if(ic<0)return null;
  const i0=Math.max(0,Math.min(route.P.length-1,Math.round(s0/route.pas))),i1=Math.max(0,Math.min(route.P.length-1,Math.round((s0+L)/route.pas)));
  let a=0;for(let i=i0+1;i<=i1;i++){let d=route.P[i][ic]-route.P[i-1][ic];while(d>180)d-=360;while(d<-180)d+=360;a+=d;}
  return a;}
/* LES VOLS D'UNE PARTIE. Chaque vol : t, origine, s0, lat0, kmh, duree, hMax, figs (noms), tFig1 (s apres le decollage), s1, lat1, gain (m, comme le jeu
   le compte : piste sautee moins distance volee), portail, mort, virage (degres de route sur les 400 m qui suivent le decollage), interieur
   (sorti du cote ou la route tourne), bumps */
function volsDe(c){
  c=finVraie(c);
  const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);const E=c.ech||[],g=(e,n)=>e[col[n]];
  const ici=(t,r)=>{let b=null,bd=1e9;for(const e of E){if(r!=null&&g(e,'r')!==r)continue;const q=Math.abs(g(e,'t')-t);if(q<bd){bd=q;b=e;}else if(g(e,'t')>t+.3)break;}return bd<=.3?b:null;};
  const vole=(a,b)=>Math.hypot(g(b,'x')-g(a,'x'),g(b,'y')-g(a,'y'),g(b,'z')-g(a,'z'));
  const V=[];let d=null,r=0;
  for(const e of c.ev||[]){
    const k=e[1];
    if(k==='route'){r=e[2];if(d&&d.portail==null)d.portail=e[0];}
    else if(k==='decol')d={t:e[0],origine:e[2],s0:e[3],lat0:e[4],kmh:e[5],r:r,figs:[],tFig1:null,bumps:0,portail:null};
    else if(k==='fig'&&d){d.figs.push(e[2]);if(d.tFig1==null)d.tFig1=+(e[0]-d.t).toFixed(2);}
    else if(k==='bump'&&d)d.bumps++;
    else if((k==='pose'||k==='mort')&&d){
      const v=d;d=null;
      if(k==='pose'){v.duree=e[5];v.hMax=e[6];v.s1=e[2];v.lat1=e[3];v.tPose=e[0];}else{v.duree=+(e[0]-v.t).toFixed(2);v.mort=e[2];}
      const R=(c.routes||[])[v.r],a=ici(v.t);
      v.virage=R?virageDe(R,v.s0,400):null;
      v.cote=v.lat0>0?1:-1;
      /* interieur : sorti du cote vers lequel la route tourne (au moins 8 degres sur 400 m) ; null = route droite */
      v.interieur=v.virage==null||Math.abs(v.virage)<8?null:(v.virage>0)===(v.cote>0);
      if(!v.mort&&a){
        if(v.portail!=null){const b=ici(v.portail,v.r);if(b&&R&&R.L)v.gain=Math.round((R.L-80-v.s0)-vole(a,b));}
        else{const b=ici(v.tPose);if(b&&g(a,'r')===g(b,'r'))v.gain=Math.round((v.s1-v.s0)-vole(a,b));}}
      v.carte=R?R.carte:null;V.push(v);}}
  return V;}

const q=(A,p)=>{A=A.filter(x=>x!=null&&x===x).slice().sort((a,b)=>a-b);return A.length?A[Math.round(p*(A.length-1))]:null;};
const r1=(x,k)=>x==null?null:+(+x).toFixed(k==null?1:k);
/* LE RESUME D'UN LOT : ce qui dit si l'on vole « comme un joueur » */
function resume(parties){
  const P=parties.map(finVraie),V=[].concat(...P.map(volsDe));
  const min=Math.max(1e-9,P.reduce((a,c)=>a+((c.fin&&c.fin.t)||0),0)/60),n=Math.max(1,V.length),part=f=>r1(100*V.filter(f).length/n);
  const poses=V.filter(v=>!v.mort),racc=poses.filter(v=>v.gain>=RACC),avecFig=V.filter(v=>v.figs.length),figs=[].concat(...V.map(v=>v.figs));
  const noms={};for(const f of figs)noms[f]=(noms[f]||0)+1;
  const voulus=V.filter(v=>v.origine==='saut'||v.interieur===true);
  return {parties:P.length,minutes:r1(min),vols:V.length,vols_min:r1(V.length/min,2),
    bord_pct:part(v=>v.origine==='bord'),saut_pct:part(v=>v.origine==='saut'),
    interieur_pct:part(v=>v.interieur===true),exterieur_pct:part(v=>v.interieur===false),droit_pct:part(v=>v.interieur===null),
    duree_p10:q(V.map(v=>v.duree),.1),duree_p50:q(V.map(v=>v.duree),.5),duree_p90:q(V.map(v=>v.duree),.9),
    haut_p50:q(poses.map(v=>v.hMax),.5),haut_p90:q(poses.map(v=>v.hMax),.9),
    raccourcis:racc.length,raccourcis_min:r1(racc.length/min,2),raccourcis_pct:r1(100*racc.length/Math.max(1,poses.length)),
    gain_p50:q(racc.map(v=>v.gain),.5),gain_p90:q(racc.map(v=>v.gain),.9),gain_m_min:r1(racc.reduce((a,v)=>a+v.gain,0)/min,0),
    figures:figs.length,figures_min:r1(figs.length/min,2),vols_avec_figure_pct:r1(100*avecFig.length/n),
    figures_par_vol_figure:r1(figs.length/Math.max(1,avecFig.length),2),combo_max:Math.max(0,...V.map(v=>v.figs.length)),
    figure_t1_p50:q(avecFig.map(v=>v.tFig1),.5),duree_vol_figure_p50:q(avecFig.map(v=>v.duree),.5),
    figures_noms:noms,figures_differentes:Object.keys(noms).length,
    morts_en_vol:V.filter(v=>v.mort).length,morts_pct:r1(100*V.filter(v=>v.mort).length/n),morts_voulus:voulus.filter(v=>v.mort).length,voulus:voulus.length,
    pose_centre_pct:r1(100*poses.filter(v=>Math.abs(v.lat1)<8.4).length/Math.max(1,poses.length)),bumps_min:r1(V.reduce((a,v)=>a+v.bumps,0)/min,2)};}
function lignes(R,nom){
  return [`${nom} : ${R.parties} parties, ${R.minutes} min · ${R.vols} vols (${R.vols_min} par minute) · morts en vol ${R.morts_en_vol} (${R.morts_pct} % des vols)`,
    `  d'ou : bord ${R.bord_pct} % · saut ${R.saut_pct} % — cote du virage : interieur ${R.interieur_pct} % · exterieur ${R.exterieur_pct} % · route droite ${R.droit_pct} %`,
    `  duree p10 · p50 · p90 : ${R.duree_p10} · ${R.duree_p50} · ${R.duree_p90} s — hauteur p50 · p90 : ${R.haut_p50} · ${R.haut_p90} m — poses au centre ${R.pose_centre_pct} %`,
    `  RACCOURCIS : ${R.raccourcis} (${R.raccourcis_min} par minute, ${R.raccourcis_pct} % des poses) · gain p50 · p90 : ${R.gain_p50} · ${R.gain_p90} m · ${R.gain_m_min} m gagnes par minute`,
    `  FIGURES : ${R.figures} lancees (${R.figures_min} par minute) · ${R.vols_avec_figure_pct} % des vols en ont · ${R.figures_par_vol_figure} par vol a figure (au plus ${R.combo_max}) · la premiere ${R.figure_t1_p50} s apres le decollage, dans des vols de ${R.duree_vol_figure_p50} s`,
    `  lesquelles (${R.figures_differentes}) : ${Object.entries(R.figures_noms).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · ')||'aucune'}`];}

if(require.main===module){
  const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;},a=n=>A.includes('--'+n);
  const f=A.find((x,i)=>!x.startsWith('--')&&(i===0||!['--nom','--humains','--json'].includes(A[i-1])));
  let parties,nom;
  if(f){const j=JSON.parse(fs.readFileSync(f,'utf8'));parties=j.parties?j.parties.map(p=>p.partie||p):partiesDe(j);nom=opt('nom',path.basename(f,'.json'));
    if(!parties.length||!parties[0].ev){console.log('pas de parties dans ce fichier : il faut une note faite avec --parties');process.exit(1);}}
  else{const D=path.join(__dirname,'etalon'),quels=opt('humains','clavier');
    const lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).map(x=>({nom:x,j:JSON.parse(fs.readFileSync(path.join(D,x),'utf8'))}));
    parties=partiesJoueurs(lus).parties.filter(c=>{const col=(c.cols||[]).indexOf('doigt'),doigt=col>=0&&c.ech.some(e=>e[col]);return quels==='tous'||(quels==='doigt')===doigt;});
    nom='les joueurs ('+quels+')';}
  const R=resume(parties);console.log(lignes(R,nom).join('\n'));
  if(a('vols'))for(const c of parties)for(const v of volsDe(c))
    console.log(`  t ${String(v.t).padStart(6)} ${String(v.carte).padEnd(7)} ${v.origine.padEnd(4)} lat ${String(v.lat0).padStart(6)} ${String(v.kmh).padStart(5)} km/h virage ${v.virage==null?'  ?':String(Math.round(v.virage)).padStart(4)}° ${v.interieur===true?'INT':v.interieur===false?'ext':' - '} · ${String(v.duree).padStart(5)} s h ${String(v.hMax==null?'':v.hMax).padStart(4)} · gain ${String(v.gain==null?'':v.gain).padStart(5)} · figs ${v.figs.join(',')||'-'}${v.tFig1!=null?' (a '+v.tFig1+' s)':''}${v.mort?' · MORT '+v.mort:' · pose lat '+v.lat1}${v.portail!=null?' · PORTAIL':''}`);
  if(opt('json',null))fs.writeFileSync(opt('json'),JSON.stringify(R,null,1));
}
module.exports={volsDe,resume,lignes,virageDe};
