/* ===== LES MESURES COMMUNES (2026-11-23, etape 1 BOTS-ML : « pas de chiffres inventes : les figures par minute, le temps en l'air et
   l'argent par minute de Sacha sont la barre ») =====
   UNE seule facon de compter, pour Sacha et pour les bots : les deux passent par l'enregistreur du jeu (code/moteur/enregistreur-jeu.js,
   format `cashcar-jeurec-1`) et par les fonctions de ce fichier. Sacha : ses parties exportees du telephone ou de l'ordinateur.
   Le bot : le pilote (piloter.js) fait tourner le MEME enregistreur dans le jeu sans ecran.
   mesures(partie) : les chiffres d'une partie · barre(parties) : le resume d'un lot (c'est LA BARRE quand le lot est celui de Sacha)
   partiesJoueurs(fichiers lus) : les VRAIES parties des joueurs (doublons, pause, seconde chance), pour etalon.js ET discerner.js. */
const RACC=60; /* le jeu crie RACCOURCI a partir de 60 m gagnes (piste sautee moins distance volee) */
/* ===== LE PALIER ATTEINT (2026-11-24, Sacha : « des bots du record de palier 1 au palier 30 ») =====
   Un palier = un moteur de ENGINE_TIERS (code/gameplay/pickups-fruits.js), gagne en ramassant des pieces PENDANT la course. Le palier d'une
   partie = le PLUS HAUT seuil franchi par ses pieces (1 = MOTEUR ROUILLE … 30 = TROU NOIR). C'est l'echelle du matchmaking.
   Les seuils sont RELUS dans le code du jeu quand il est la (ils changent avec lui) ; la liste ci-dessous est celle du 24/11/2026 (cashcar-v1627). */
let SEUILS=[0,40,85,150,225,305,400,505,615,730,860,995,1130,1280,1430,1585,1745,1910,2080,2255,2440,2630,2825,3030,3240,3455,3680,3910,4145,4385];
try{const src=require('fs').readFileSync(require('path').join(__dirname,'..','..','code','gameplay','pickups-fruits.js'),'utf8'),a=src.indexOf('const ENGINE_TIERS=['),b=src.indexOf('];',a);
  if(a>=0&&b>a){const S=[...src.slice(a,b).matchAll(/coins:\s*(\d+)/g)].map(m=>+m[1]);if(S.length>=10&&S[0]===0&&S.every((x,i)=>i===0||x>S[i-1]))SEUILS=S;}}catch(e){}
function palierDe(pieces){let k=0;for(let i=0;i<SEUILS.length;i++)if((pieces|0)>=SEUILS[i])k=i;return k+1;}
/* (2026-11-24, defaut 2 : « apres une seconde chance, le palier vient de la fin, apres la perte d'un palier ») LE SOMMET, pas la fin.
   Le jeu monte le record du joueur (SAVE.d.ex.eng) A L'INSTANT ou un palier tombe (economie/achat-carte-moteur.js, addCoins) ; la reprise par
   seconde chance retire ensuite un palier et ramene les pieces a son seuil (gameplay/seconde-chance.js:188). Dans un morceau d'enregistrement
   les pieces ne font que monter : le sommet d'une partie = le plus haut `fin.pieces` de ses morceaux (`pieces_max`, pose par colle()).
   MESURE (etalon) : la partie de 548,8 s avait 4044 pieces a la mort, 3923 a la fin du 2e morceau. */
const piecesMax=c=>Math.max((c.fin&&c.fin.pieces)|0,c.pieces_max|0);

/* ===== LES VRAIES PARTIES (2026-11-23, premier export de Sacha ; mis en commun le 2026-11-24, defauts 6 et 28 : « etalon.js et discerner.js
   ne comptaient pas les parties de la meme facon ») =====
   · QUITTEE DEPUIS LA PAUSE : l'horloge de fin de l'enregistreur compte la pause (3,6 s jouees, 123 s notees). On revient a l'instant de la pause.
   · L'EXPLOSION NE COMPTE PAS (defaut 6) : le bot s'arrete a la premiere decision qui voit la mort ; l'enregistreur d'un joueur, lui, continue
     jusqu'a la fin de l'explosion (~1,8 a 2 s, gameOver tombe apres) et ajoute des echantillons « m=3 ». Une partie finit donc a son evenement
     'mort', pour TOUT LE MONDE ; les echantillons et evenements d'apres sont laisses de cote. Seule la derniere mort compte (une mort suivie
     d'une seconde chance recollee n'est pas une fin).
   finVraie(c) rend une COPIE (ou la partie elle-meme si rien ne change) : on peut l'appeler deux fois. */
function finVraie(c){
  if(!c||!c.fin)return c;
  let p=null,m=null;
  for(const e of c.ev||[]){const k=e[1];if(k==='pause')p=e[0];else if(k==='reprise')p=null;else if(k==='mort')m=e[0];else if(k==='seconde_chance')m=null;}
  let t=c.fin.t,cause=c.fin.cause;
  if(p!=null&&(m==null||p<m)&&t>p){t=p;cause='quitte';}
  else if(m!=null&&t>m)t=m;
  const it=(c.cols||[]).indexOf('t'),E=c.ech||[],ev=c.ev||[];
  const coupeE=it>=0&&E.length&&E[E.length-1][it]>t+1e-6,coupeEv=ev.length&&ev[ev.length-1][0]>t+1e-6;
  if(t===c.fin.t&&cause===c.fin.cause&&!coupeE&&!coupeEv)return c;
  return Object.assign({},c,{fin:Object.assign({},c.fin,{t:t,cause:cause}),ech:coupeE?E.filter(e=>e[it]<=t+1e-6):E,ev:coupeEv?ev.filter(e=>e[0]<=t+1e-6):ev});
}
/* · LA SECONDE CHANCE : le jeu ferme la partie a la mort et en ouvre une autre a la reprise, au meme endroit de la meme route ; l'argent, les
     pieces, les figures et les bumps de la fin CONTINUENT ceux d'avant. Comptees a part, l'argent d'avant la mort serait compte deux fois :
     on recolle les deux morceaux en une partie (duree = la somme, fin = celle du dernier morceau, le 2e morceau decale de l'instant de la MORT). */
function suite(a,b){
  const e0=b.ech&&b.ech[0],ra=a.routes&&a.routes[a.routes.length-1],rb=b.routes&&b.routes[0];
  if(!e0||!ra||!rb||ra.carte!==rb.carte||ra.L!==rb.L)return false;
  const attente=(Date.parse(b.debut)-Date.parse(a.debut))/1000-a.fin.t;
  return e0[b.cols.indexOf('s')]>50&&attente>-2&&attente<900&&b.fin.argent>=a.fin.argent&&(b.fin.figures|0)>=(a.fin.figures|0); /* pas les pieces : la reprise en reprend (4044 → 3923 vu le 23/11) */}
function colle(a,b){
  a=finVraie(a);b=finVraie(b);
  const T=a.fin.t,R=a.routes.length-1,it=b.cols.indexOf('t'),ir=b.cols.indexOf('r'),r2=x=>Math.round(x*100)/100;
  return Object.assign({},a,{routes:a.routes.concat(b.routes.slice(1)),
    ech:a.ech.concat(b.ech.map(e=>{const q=e.slice();q[it]=r2(q[it]+T);q[ir]+=R;return q;})),
    ev:a.ev.concat([[T,'seconde_chance']],b.ev.map(e=>{const q=e.slice();q[0]=r2(q[0]+T);if(q[1]==='route')q[2]+=R;return q;})),
    fin:Object.assign({},b.fin,{t:r2(T+b.fin.t)}),chances:(a.chances|0)+1,pieces_max:Math.max(piecesMax(a),piecesMax(b))});}
/* LES PARTIES DES JOUEURS, comptees UNE fois : `lus` = [{nom, j}] (le JSON de chaque fichier exporte). Rend { parties, lues, ecartees, doublons,
   recollees, parFichier }.
   · une partie presente dans deux exports n'est comptee qu'une fois (meme debut, meme fin) ;
   · ecartees : les courses de bot rangees la par erreur, l'auto-ecole, et les parties de moins de MIN s apres recollage (10 : un faux depart,
     une partie quittee tout de suite). */
function partiesJoueurs(lus,o){
  o=o||{};const MIN=o.min!=null?o.min:10;
  const vues=new Map(),parFichier=[];let lues=0,ecartees=0,doublons=0;
  for(const f of lus){const P=partiesDe(f.j);parFichier.push({nom:f.nom,parties:P.length});
    for(const c of P){lues++;
      if(c.bot||c.tuto||!c.fin||!c.ech||!c.ech.length){ecartees++;continue;}
      const k=(c.debut||'?')+'|'+c.fin.t;if(vues.has(k)){doublons++;continue;}vues.set(k,c);}}
  const morceaux=[...vues.values()].sort((a,b)=>String(a.debut).localeCompare(String(b.debut))).map(finVraie),parties=[];let recollees=0;
  for(const c of morceaux){const d=parties[parties.length-1];
    if(d&&suite(d,c)){parties[parties.length-1]=colle(d,c);recollees++;}else parties.push(c);}
  for(let i=parties.length-1;i>=0;i--)if(!(parties[i].fin.t>=MIN)){parties.splice(i,1);ecartees++;}
  return {parties,lues,ecartees,doublons,recollees,parFichier};
}

function mesures(c){
  c=finVraie(c);
  const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);
  const E=c.ech||[],ev=c.ev||[],fin=c.fin||{},g=(e,n)=>e[col[n]];
  const duree=fin.t||(E.length?g(E[E.length-1],'t'):0),min=Math.max(1e-9,duree/60);
  /* (2026-11-24, defaut 23) L'enregistreur ne garde que les 6000 derniers echantillons (10 min) ; les evenements, tous. Une partie plus longue
     est TRONQUEE : ce qui se calcule sur les echantillons (distance, raccourcis) se rapporte a la FENETRE couverte, pas a toute la duree. */
  const tronquee=!!(E.length&&g(E[0],'t')>1),fenetre=tronquee?g(E[E.length-1],'t')-g(E[0],'t'):duree;
  const par=t=>ev.filter(e=>e[1]===t);
  /* les vols : du decollage a la pose (ou a la mort) ; un vol qui passe le PORTAIL est marque (la route change pendant le vol) */
  const vols=[];let d=null;
  for(const e of ev){
    if(e[1]==='decol')d={e:e,portail:null};
    else if(e[1]==='route'&&d&&d.portail==null)d.portail=e[0];
    else if(e[1]==='pose'&&d){vols.push({t:d.e[0],origine:d.e[2],s0:d.e[3],duree:e[5],hMax:e[6],figs:e[7],s1:e[2],tPose:e[0],portail:d.portail});d=null;}
    else if(e[1]==='mort'&&d){vols.push({t:d.e[0],origine:d.e[2],s0:d.e[3],duree:e[0]-d.e[0],mort:e[2]});d=null;}}
  /* ===== LES RACCOURCIS, COMME LE JEU LES PAIE (2026-11-24, defauts 7 et 23) =====
     · pose sur la MEME route : gain = piste sautee (s pose − s decollage) − distance volee en ligne droite (gameplay/demi-tour.js:590) ;
     · vol qui passe le PORTAIL (portail-passage.js:80) : gain = (L − 80 − s decollage) − distance volee jusqu'au portail. Avant le 24/11 ce vol
       etait jete (la pose arrive sur la route suivante) : un joueur qui coupe vers les portails avait 0 raccourci ;
     · les positions viennent des echantillons (10 par seconde) : a plus de 0,3 s d'un echantillon (debut tronque, trou), le vol n'est PAS compte
       (avant : le premier echantillon gardé servait de decollage ET de pose, distance 0, et tout vol de 60 m devenait un raccourci).
     CE QUI RESTE FAUX, ET POURQUOI : le jeu ne paie pas une pose dans le FILET de son virage (« RATTRAPE », filetDe dans rendu/portails.js) ; les
     filets ne sont pas dans l'enregistrement, on ne peut donc pas les exclure ici, ni pour un joueur ni pour un bot. Il faudrait que le jeu
     enregistre ses raccourcis (un evenement 'raccourci' dans code/moteur/enregistreur-jeu.js) : c'est une modification du jeu. */
  const ici=(t,r)=>{let b=null,bd=1e9;for(const e of E){if(r!=null&&g(e,'r')!==r)continue;const q=Math.abs(g(e,'t')-t);if(q<bd){bd=q;b=e;}else if(g(e,'t')>t+.3)break;}return bd<=.3?b:null;};
  const vole=(a,b)=>Math.hypot(g(b,'x')-g(a,'x'),g(b,'y')-g(a,'y'),g(b,'z')-g(a,'z'));
  let racc=0,raccM=0;
  for(const v of vols){if(v.mort||v.tPose==null)continue;const a=ici(v.t);if(!a)continue;let gain;
    if(v.portail!=null){const r0=g(a,'r'),b=ici(v.portail,r0),Lr=((c.routes||[])[r0]||{}).L;if(!b||!Lr)continue;gain=(Lr-80-v.s0)-vole(a,b);}
    else{const b=ici(v.tPose);if(!b||g(a,'r')!==g(b,'r'))continue;gain=(v.s1-v.s0)-vole(a,b);}
    v.gain=Math.round(gain);if(gain>=RACC){racc++;raccM+=gain;}}
  const enVol=E.filter(e=>g(e,'m')===1||g(e,'m')===2).length,auSol=E.filter(e=>g(e,'m')===0);
  /* la distance : la somme des avancees le long de la route (les sauts d'une route a l'autre ne comptent pas) */
  let dist=0;for(let i=1;i<E.length;i++){if(g(E[i],'r')!==g(E[i-1],'r'))continue;const ds=g(E[i],'s')-g(E[i-1],'s');if(ds>0&&ds<400)dist+=ds;}
  const figPayees=par('figure_payee').reduce((a,e)=>a+(e[2]|0),0),moy=A=>A.length?A.reduce((a,b)=>a+b,0)/A.length:0;
  /* les pieces : celles de la FIN (ce que le jeu affiche), le SOMMET (il fait le palier), et celles RAMASSEES (la somme des evenements 'piece' :
     les gains seulement, jamais la perte de la seconde chance) — c'est elle qui fait les pieces par minute */
  const pMax=piecesMax(c),ramassees=ev.some(e=>e[1]==='piece')?par('piece').reduce((a,e)=>a+(e[2]|0),0):fin.pieces|0;
  return {
    duree_s:+duree.toFixed(1),cause:fin.cause||'?',cartes:(c.routes||[]).map(r=>r.carte),routes:(c.routes||[]).length,voiture:c.voiture||null,
    appareil:c.ecran?(c.ecran.app?'app iPhone':c.ecran.tel?'version allegee (telephone ou PC lent)':'ordinateur'):(c.bot?'bot':'?'), /* ecran.tel = ALLEGE, vrai aussi sur un PC lent */
    clavier:(E.length&&col.doigt!=null)?!E.some(e=>g(e,'doigt')):null,chances:c.chances|0,
    argent:fin.argent||0,argent_min:+((fin.argent||0)/min).toFixed(1),
    pieces:fin.pieces|0,pieces_max:pMax,pieces_ramassees:ramassees,pieces_min:+(ramassees/min).toFixed(1),palier:palierDe(pMax),
    figures_lancees:par('fig').length,figures_payees:figPayees,figures_min:+(figPayees/min).toFixed(2),
    vols:vols.length,vols_min:+(vols.length/min).toFixed(2),
    air_s:+vols.reduce((a,v)=>a+(v.duree||0),0).toFixed(1),air_pct:+(E.length?100*enVol/E.length:0).toFixed(1),
    vol_moyen_s:+moy(vols.map(v=>v.duree||0)).toFixed(2),vol_max_s:+Math.max(0,...vols.map(v=>v.duree||0)).toFixed(2),
    /* (2026-11-24, etape 1 bis) les courses « remarquables » du labo : le plus long vol POSE, le plus de figures en un vol, le plus gros raccourci */
    vol_pose_max_s:+Math.max(0,...vols.filter(v=>!v.mort).map(v=>v.duree||0)).toFixed(2),combo_max:Math.max(0,...vols.map(v=>v.figs|0)),
    raccourci_max_m:Math.max(0,...vols.map(v=>v.gain|0)),
    decollages:{bord:vols.filter(v=>v.origine==='bord').length,trou:vols.filter(v=>v.origine==='trou').length,saut:vols.filter(v=>v.origine==='saut').length},
    poses:vols.filter(v=>!v.mort).length,morts_en_vol:vols.filter(v=>v.mort).length,
    raccourcis:racc,raccourcis_m:Math.round(raccM),raccourcis_portail:vols.filter(v=>v.portail!=null&&v.gain>=RACC).length,
    bumps:fin.bumps|0,distance_m:Math.round(dist),kmh_moyen:Math.round(moy(E.map(e=>g(e,'kmh')))),vmax:fin.vmax|0,
    nitro_pct:+(E.length?100*E.filter(e=>g(e,'nit')).length/E.length:0).toFixed(1),
    drift_pct:+(auSol.length?100*auSol.filter(e=>g(e,'drift')).length/auSol.length:0).toFixed(1),
    tronquee:tronquee,fenetre_s:+fenetre.toFixed(1)};
}

/* LE RESUME D'UN LOT. Les taux « par minute » sont des TOTAUX divises par le temps total (une longue partie pese plus qu'une courte) ;
   la mediane dit ce que vaut une partie ordinaire. La distance et les raccourcis se rapportent au temps COUVERT par les echantillons (defaut 23). */
function barre(parties){
  const M=parties.map(mesures),n=M.length,som=k=>M.reduce((a,m)=>a+(m[k]||0),0);
  const med=k=>{const A=M.map(m=>m[k]).sort((a,b)=>a-b);return n?(n%2?A[(n-1)/2]:(A[n/2-1]+A[n/2])/2):0;};
  const min=Math.max(1e-9,som('duree_s')/60),minE=Math.max(1e-9,som('fenetre_s')/60),causes={},cartes={};
  for(const m of M){causes[m.cause]=(causes[m.cause]||0)+1;for(const c of m.cartes)cartes[c]=(cartes[c]||0)+1;}
  const r=(x,k)=>+x.toFixed(k==null?1:k);
  return {parties:n,minutes:r(min),
    survie_mediane_s:r(med('duree_s')),survie_moyenne_s:r(som('duree_s')/Math.max(1,n)),
    argent_min:r(som('argent')/min),argent_mediane:r(med('argent')),
    pieces_min:r(som('pieces_ramassees')/min),
    /* l'echelle du matchmaking : le palier d'une partie ordinaire (mediane), le RECORD du lot (le meilleur), et chaque partie.
       (2026-11-24, defaut 17) `coupees` : les parties arretees par la limite de temps (cause « temps ») — leur survie et leur palier sont des
       PLANCHERS, pas des mesures : une barre ou il y en a ne dit pas jusqu'ou le bot serait alle. */
    palier_median:med('palier'),palier_record:Math.max(0,...M.map(m=>m.palier)),paliers:M.map(m=>m.palier).sort((a,b)=>a-b),
    coupees:M.filter(m=>m.cause==='temps').length,palier_record_coupees:Math.max(0,...M.filter(m=>m.cause==='temps').map(m=>m.palier)),
    tronquees:M.filter(m=>m.tronquee).length,
    figures_min:r(som('figures_payees')/min,2),figures_lancees_min:r(som('figures_lancees')/min,2),
    vols_min:r(som('vols')/min,2),air_pct:r(100*som('air_s')/Math.max(1e-9,som('duree_s'))),vol_moyen_s:r(som('air_s')/Math.max(1,som('vols')),2),
    raccourcis_min:r(som('raccourcis')/minE,2),raccourcis_m_min:r(som('raccourcis_m')/minE),
    bumps_min:r(som('bumps')/min,2),distance_m_min:r(som('distance_m')/minE,0),
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
    `parties ${b.parties} · ${b.minutes} min de jeu · survie mediane ${b.survie_mediane_s} s (moyenne ${b.survie_moyenne_s} s)`+(b.coupees?` · ⚠ ${b.coupees} coupee(s) par la limite de temps : leur survie et leur palier sont des planchers`:''),
    `argent ${b.argent_min} par minute (mediane d'une partie : ${b.argent_mediane}) · pieces ramassees ${b.pieces_min} par minute`,
    `figures posees ${b.figures_min} par minute (lancees ${b.figures_lancees_min})`,
    `en l'air ${b.air_pct} % du temps · ${b.vols_min} vols par minute · vol moyen ${b.vol_moyen_s} s`,
    `PALIER moteur (le sommet de chaque partie) : mediane ${b.palier_median} · record ${b.palier_record} · par partie ${(b.paliers||[]).join(' ')}`,
    `raccourcis ${b.raccourcis_min} par minute (${b.raccourcis_m_min} m gagnes par minute ; filets comptes, voir mesures.js) · bumps ${b.bumps_min} par minute`,
    `distance ${b.distance_m_min} m par minute · nitro tenue ${b.nitro_pct} % du temps`+(b.tronquees?` · ${b.tronquees} partie(s) de plus de 10 min : distance et raccourcis sur leurs 10 dernieres minutes`:''),
    `fins : ${Object.entries(b.causes).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · ')}`,
    `maps : ${Object.entries(b.cartes).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · ')}`];
}
module.exports={mesures,barre,partiesDe,partiesJoueurs,finVraie,suite,colle,lignes,RACC,palierDe,SEUILS};
