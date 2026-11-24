/* ===== LES MESURES COMMUNES (2026-11-23, etape 1 BOTS-ML : « pas de chiffres inventes : les figures par minute, le temps en l'air et
   l'argent par minute de Sacha sont la barre ») =====
   UNE seule facon de compter, pour Sacha et pour les bots : les deux passent par l'enregistreur du jeu (code/moteur/enregistreur-jeu.js,
   format `cashcar-jeurec-1`) et par les fonctions de ce fichier. Sacha : ses parties exportees du telephone ou de l'ordinateur.
   Le bot : le pilote (piloter.js) fait tourner le MEME enregistreur dans le jeu sans ecran.
   mesures(partie) : les chiffres d'une partie · barre(parties) : le resume d'un lot (c'est LA BARRE quand le lot est celui de Sacha). */
const RACC=60; /* le jeu crie RACCOURCI a partir de 60 m gagnes (piste sautee moins distance volee) */
/* ===== LE PALIER ATTEINT (2026-11-24, Sacha : « des bots du record de palier 1 au palier 30 ») =====
   Un palier = un moteur de ENGINE_TIERS (code/gameplay/pickups-fruits.js), gagne en ramassant des pieces PENDANT la course. Le palier d'une
   partie = le dernier seuil franchi par ses pieces (1 = MOTEUR ROUILLE … 30 = TROU NOIR). C'est l'echelle du matchmaking.
   Les seuils sont RELUS dans le code du jeu quand il est la (ils changent avec lui) ; la liste ci-dessous est celle du 24/11/2026 (cashcar-v1627). */
let SEUILS=[0,40,85,150,225,305,400,505,615,730,860,995,1130,1280,1430,1585,1745,1910,2080,2255,2440,2630,2825,3030,3240,3455,3680,3910,4145,4385];
try{const src=require('fs').readFileSync(require('path').join(__dirname,'..','..','code','gameplay','pickups-fruits.js'),'utf8'),a=src.indexOf('const ENGINE_TIERS=['),b=src.indexOf('];',a);
  if(a>=0&&b>a){const S=[...src.slice(a,b).matchAll(/coins:\s*(\d+)/g)].map(m=>+m[1]);if(S.length>=10&&S[0]===0&&S.every((x,i)=>i===0||x>S[i-1]))SEUILS=S;}}catch(e){}
function palierDe(pieces){let k=0;for(let i=0;i<SEUILS.length;i++)if((pieces|0)>=SEUILS[i])k=i;return k+1;}

function mesures(c){
  const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);
  const E=c.ech||[],ev=c.ev||[],fin=c.fin||{},g=(e,n)=>e[col[n]];
  const duree=fin.t||(E.length?g(E[E.length-1],'t'):0),min=Math.max(1e-9,duree/60);
  const par=t=>ev.filter(e=>e[1]===t);
  /* les vols : du decollage a la pose (ou a la mort) */
  const vols=[];let d=null;
  for(const e of ev){
    if(e[1]==='decol')d=e;
    else if(e[1]==='pose'&&d){vols.push({t:d[0],origine:d[2],s0:d[3],duree:e[5],hMax:e[6],figs:e[7],s1:e[2],tPose:e[0]});d=null;}
    else if(e[1]==='mort'&&d){vols.push({t:d[0],origine:d[2],s0:d[3],duree:e[0]-d[0],mort:e[2]});d=null;}}
  /* un raccourci : pose sur la meme route, gain = piste sautee - distance volee en ligne droite */
  const ici=t=>{let b=null,bd=1e9;for(const e of E){const q=Math.abs(g(e,'t')-t);if(q<bd){bd=q;b=e;}else if(g(e,'t')>t+.3)break;}return b;};
  let racc=0,raccM=0;
  for(const v of vols){if(v.mort||v.tPose==null)continue;const a=ici(v.t),b=ici(v.tPose);if(!a||!b||g(a,'r')!==g(b,'r'))continue;
    const gain=(v.s1-v.s0)-Math.hypot(g(b,'x')-g(a,'x'),g(b,'y')-g(a,'y'),g(b,'z')-g(a,'z'));v.gain=Math.round(gain);if(gain>=RACC){racc++;raccM+=gain;}}
  const enVol=E.filter(e=>g(e,'m')===1||g(e,'m')===2).length,auSol=E.filter(e=>g(e,'m')===0);
  /* la distance : la somme des avancees le long de la route (les sauts d'une route a l'autre ne comptent pas) */
  let dist=0;for(let i=1;i<E.length;i++){if(g(E[i],'r')!==g(E[i-1],'r'))continue;const ds=g(E[i],'s')-g(E[i-1],'s');if(ds>0&&ds<400)dist+=ds;}
  const figPayees=par('figure_payee').reduce((a,e)=>a+(e[2]|0),0),moy=A=>A.length?A.reduce((a,b)=>a+b,0)/A.length:0;
  return {
    duree_s:+duree.toFixed(1),cause:fin.cause||'?',cartes:(c.routes||[]).map(r=>r.carte),routes:(c.routes||[]).length,voiture:c.voiture||null,
    appareil:c.ecran?(c.ecran.app?'app iPhone':c.ecran.tel?'version allegee (telephone ou PC lent)':'ordinateur'):(c.bot?'bot':'?'), /* ecran.tel = ALLEGE, vrai aussi sur un PC lent */
    clavier:(E.length&&col.doigt!=null)?!E.some(e=>g(e,'doigt')):null,chances:c.chances|0,
    argent:fin.argent||0,argent_min:+((fin.argent||0)/min).toFixed(1),
    pieces:fin.pieces|0,pieces_min:+((fin.pieces|0)/min).toFixed(1),palier:palierDe(fin.pieces|0),
    figures_lancees:par('fig').length,figures_payees:figPayees,figures_min:+(figPayees/min).toFixed(2),
    vols:vols.length,vols_min:+(vols.length/min).toFixed(2),
    air_s:+vols.reduce((a,v)=>a+(v.duree||0),0).toFixed(1),air_pct:+(E.length?100*enVol/E.length:0).toFixed(1),
    vol_moyen_s:+moy(vols.map(v=>v.duree||0)).toFixed(2),vol_max_s:+Math.max(0,...vols.map(v=>v.duree||0)).toFixed(2),
    /* (2026-11-24, etape 1 bis) les courses « remarquables » du labo : le plus long vol POSE, le plus de figures en un vol, le plus gros raccourci */
    vol_pose_max_s:+Math.max(0,...vols.filter(v=>!v.mort).map(v=>v.duree||0)).toFixed(2),combo_max:Math.max(0,...vols.map(v=>v.figs|0)),
    raccourci_max_m:Math.max(0,...vols.map(v=>v.gain|0)),
    decollages:{bord:vols.filter(v=>v.origine==='bord').length,trou:vols.filter(v=>v.origine==='trou').length,saut:vols.filter(v=>v.origine==='saut').length},
    poses:vols.filter(v=>!v.mort).length,morts_en_vol:vols.filter(v=>v.mort).length,
    raccourcis:racc,raccourcis_m:Math.round(raccM),
    bumps:fin.bumps|0,distance_m:Math.round(dist),kmh_moyen:Math.round(moy(E.map(e=>g(e,'kmh')))),vmax:fin.vmax|0,
    nitro_pct:+(E.length?100*E.filter(e=>g(e,'nit')).length/E.length:0).toFixed(1),
    drift_pct:+(auSol.length?100*auSol.filter(e=>g(e,'drift')).length/auSol.length:0).toFixed(1)};
}

/* LE RESUME D'UN LOT. Les taux « par minute » sont des TOTAUX divises par le temps total (une longue partie pese plus qu'une courte) ;
   la mediane dit ce que vaut une partie ordinaire. */
function barre(parties){
  const M=parties.map(mesures),n=M.length,som=k=>M.reduce((a,m)=>a+(m[k]||0),0);
  const med=k=>{const A=M.map(m=>m[k]).sort((a,b)=>a-b);return n?(n%2?A[(n-1)/2]:(A[n/2-1]+A[n/2])/2):0;};
  const min=Math.max(1e-9,som('duree_s')/60),causes={},cartes={};
  for(const m of M){causes[m.cause]=(causes[m.cause]||0)+1;for(const c of m.cartes)cartes[c]=(cartes[c]||0)+1;}
  const r=(x,k)=>+x.toFixed(k==null?1:k);
  return {parties:n,minutes:r(min),
    survie_mediane_s:r(med('duree_s')),survie_moyenne_s:r(som('duree_s')/Math.max(1,n)),
    argent_min:r(som('argent')/min),argent_mediane:r(med('argent')),
    pieces_min:r(som('pieces')/min),
    /* l'echelle du matchmaking : le palier d'une partie ordinaire (mediane), le RECORD du lot (le meilleur), et chaque partie */
    palier_median:med('palier'),palier_record:Math.max(0,...M.map(m=>m.palier)),paliers:M.map(m=>m.palier).sort((a,b)=>a-b),
    figures_min:r(som('figures_payees')/min,2),figures_lancees_min:r(som('figures_lancees')/min,2),
    vols_min:r(som('vols')/min,2),air_pct:r(100*som('air_s')/Math.max(1e-9,som('duree_s'))),vol_moyen_s:r(som('air_s')/Math.max(1,som('vols')),2),
    raccourcis_min:r(som('raccourcis')/min,2),raccourcis_m_min:r(som('raccourcis_m')/min),
    bumps_min:r(som('bumps')/min,2),distance_m_min:r(som('distance_m')/min,0),
    nitro_pct:r(M.reduce((a,m)=>a+m.nitro_pct*m.duree_s,0)/Math.max(1e-9,som('duree_s'))),
    causes,cartes,detail:M};
}

/* un fichier exporte par le jeu ({format, parties:[…]}), une partie seule, ou une liste de parties → la liste des parties */
function partiesDe(j){
  if(Array.isArray(j))return j.flatMap(partiesDe);
  if(j&&Array.isArray(j.parties))return j.parties;
  if(j&&j.ech&&j.ev)return [j];
  return [];
}
/* les lignes d'un tableau lisible : la barre (ou une note) en clair */
function lignes(b){
  return [
    `parties ${b.parties} · ${b.minutes} min de jeu · survie mediane ${b.survie_mediane_s} s (moyenne ${b.survie_moyenne_s} s)`,
    `argent ${b.argent_min} par minute (mediane d'une partie : ${b.argent_mediane}) · pieces ${b.pieces_min} par minute`,
    `figures posees ${b.figures_min} par minute (lancees ${b.figures_lancees_min})`,
    `en l'air ${b.air_pct} % du temps · ${b.vols_min} vols par minute · vol moyen ${b.vol_moyen_s} s`,
    `PALIER moteur : mediane ${b.palier_median} · record ${b.palier_record} · par partie ${(b.paliers||[]).join(' ')}`,
    `raccourcis ${b.raccourcis_min} par minute (${b.raccourcis_m_min} m gagnes par minute) · bumps ${b.bumps_min} par minute`,
    `distance ${b.distance_m_min} m par minute · nitro tenue ${b.nitro_pct} % du temps`,
    `fins : ${Object.entries(b.causes).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · ')}`,
    `maps : ${Object.entries(b.cartes).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · ')}`];
}
module.exports={mesures,barre,partiesDe,lignes,RACC,palierDe,SEUILS};
