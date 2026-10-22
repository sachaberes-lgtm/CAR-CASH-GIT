/* ===== LES DÉFIS SECRETS — les détections (2026-10-14, Sacha via PILOTAGE : « une dizaine de couleurs secrètes, chacune gagnée par un défi
   caché un peu compliqué à avoir, façon Geometry Dash » ; GRAPHISME écrit les peintures `COSM.peinture` (`sec:'id'`, l'indice) et `secDonne(id)`
   — la peinture donnée, le toast COULEUR SECRÈTE ; GAMEPLAY écrit ici QUAND on la gagne). Rien en BALADE, en BAC À SABLE, au PARC ni à
   l'auto-école. Les seuils sont dans `SEC_K` ; l'état de la partie dans `SEC` (remis à zéro par `resetGame`). Console : `dbgSec()`.
   1 PRISME — six figures nommées dans UN vol, posé proprement (`secPose` : `chain` ≥ 6, pose non ratée).
   2 FANTÔME — deux minutes de course sans toucher un bord (le rase-bord, la sortie par le bord, un bump sur la tranche, la lèvre : `secBord`).
   3 OR ROSE — une pose DIVINE à plus de 900 km/h.
   4 ÉCLAIR — 1 500 km/h affichés.
   5 NACRE — cinq poses PARFAIT (ou DIVINES) d'affilée (une vraie pose, > 0,7 s de vol ; une pose ordinaire remet à zéro).
   6 ORAGE — MER DE NUAGES · ORAGE : 3 km d'affilée sans allumer la nitro.
   7 JADE IMPÉRIAL — PICS DE JADE : 8 km roulés (ou volés) sur les pics dans une même partie.
   8 LUNAIRE — EN ORBITE : franchir un portail qui est le 3e de la partie (au moins).
   9 LAMPADAIRE — LA VILLE · NUIT : 25 figures dans une même partie.
   10 CAMÉLÉON — traverser les QUATRE maps du mode classique dans une même partie (une seule vie). */
const SEC_K={prisme:6,fantome:120,orrose:900,eclair:1500,nacre:5,orage:3000,jade:8000,lunaire:3,lampadaire:25,cameleon:4};
const SEC={bordT:0,parf:0,sansNit:0,jadeD:0,villeFig:0,cartes:{},nCartes:0,dits:{}};
function secOk(){return typeof secDonne==='function'&&started&&!gameOver&&!BALADE&&!SANDBOX&&!(PARK&&PARK.on)&&!TUTO.on;}
function secGagne(id){if(SEC.dits[id]||!secOk())return;SEC.dits[id]=1;try{secDonne(id);}catch(e){console.warn('secDonne',id,e);}} // une fois par partie : secDonne ne fait rien si elle est déjà à toi
function secReset(){SEC.bordT=0;SEC.parf=0;SEC.sansNit=0;SEC.jadeD=0;SEC.villeFig=0;SEC.cartes={};SEC.nCartes=0;SEC.dits={};}
function secCarte(){const c=LVL&&LVL.cur;return c?{c:c.carte||null,m:c.meteo||null}:{c:null,m:null};}
function secTick(dt,kmh){ // chaque image de course (après la vitesse affichée)
  if(!started||gameOver||paused)return;
  const k=secCarte(),d=kmh/3.6*dt;
  if(k.c&&!SEC.cartes[k.c]){SEC.cartes[k.c]=1;SEC.nCartes++;if(SEC.nCartes>=SEC_K.cameleon)secGagne('cameleon');}
  if(kmh>=SEC_K.eclair)secGagne('eclair');
  if(mode==='drive'&&Math.abs(lat)>ROAD_HALF*.8)SEC.bordT=0;else{SEC.bordT+=dt;if(SEC.bordT>=SEC_K.fantome)secGagne('fantome');}
  /* (2026-10-22) CIEL D'ORAGE : dix niveaux sous la pluie (m2Niveau) — l'ancien « 3 km sans nitro sous l'orage » n'ouvre plus rien */
  if(k.c==='jade'){SEC.jadeD+=d;if(SEC.jadeD>=SEC_K.jade)secGagne('jadeimperial');}
}
function secBord(){SEC.bordT=0;} // le bord touché (sortie par le côté, bump, lèvre)
function secPose(g,ratee,vol,kmh){ // au verdict d'une pose : g = 1,5 PARFAIT · 2 DIVIN
  if(!ratee&&chain>=SEC_K.prisme)secGagne('prisme');
  if(!ratee&&g>=2&&kmh>SEC_K.orrose)secGagne('orrose');
  if(vol>.7){if(!ratee&&g>=1.5){SEC.parf++;if(SEC.parf>=SEC_K.nacre)secGagne('nacre');}else SEC.parf=0;}
}
function secFig(){const k=secCarte();if(k.c==='ville'&&k.m==='nuit'){SEC.villeFig++;if(SEC.villeFig>=SEC_K.lampadaire)secGagne('lampadaire');}} // une figure (addTrick)
function secPorte(){} /* (2026-10-22) LUNAIRE : dix niveaux dans l'espace (m2Niveau) — l'ancien « 3e portail » n'ouvre plus rien ; */ // un portail franchi (après le compte)
window.dbgSec=function(a){if(a==='raz'){secReset();return 'remis à zéro';}const k=secCarte();
  return {actif:secOk(),secDonne:typeof secDonne==='function',carte:k.c,meteo:k.m,sansBord:+SEC.bordT.toFixed(1),parfaitsDeSuite:SEC.parf,sansNitroOrage:Math.round(SEC.sansNit),
    jade:Math.round(SEC.jadeD),villeNuitFigures:SEC.villeFig,cartes:Object.keys(SEC.cartes),portails:runStats.zones|0,gagnesCettePartie:Object.keys(SEC.dits),seuils:SEC_K};};
/* ===== LES MISSIONS v2 — LE MOTEUR (2026-10-16, Sacha : « toutes les missions sont ouvertes en même temps, sans ordre imposé » · « il
   faut une migration propre de SAVE.d.mis vers le nouveau format, sans rien perdre et sans redonner de primes déjà touchées ») =====
   LA SAUVEGARDE `SAVE.d.m2` (désinfectée par san) : `ok` les missions réussies · `pr` celles dont la récompense est prise · `su` les
   suivies (3 au plus) · `vu` l'avancement que l'écran a déjà montré (la barre se remplit DEPUIS là) · `nv` réussies pas encore vues ·
   `fl` les drapeaux des exploits d'un instant (les secrètes « meurs… ») · `r` les records d'une partie que le jeu ne gardait pas · `c` les
   compteurs à vie (morts, argent accumulé, jours joués, maps jouées, maps posées en parfait, parties enchaînées).
   LES BRANCHEMENTS (à côté de ceux des couleurs secrètes, SEC) : m2Tick (chaque image de course, après secTick) · m2Fig (addTrick) ·
   m2Pose (le verdict d'une pose) · m2Mort (explode, une vraie mort) · m2Fin (endGame) · m2Raz (runxReset : une partie neuve) ·
   m2Saut (startFall) · m2Rejoue / m2Menu (REJOUER / le retour au menu) · gagneAjoute (chaque crédit de la banque).
   LA SECONDE CHANCE (CHANCE) : la reprise n'appelle pas runxReset → les compteurs de la partie continuent (« 3 premières secondes » se
   juge sur la conduite depuis le DÉPART, « partie entière sans… » sur toute la partie) ; seule la vie repart (« tiens 5 min sans
   mourir » : on est mort). Rien en BALADE, au BAC À SABLE, au PARC ni à l'AUTO-ÉCOLE. */
function m2Vierge(){return {v:0,ok:[],pr:[],su:[],vu:{},nv:[],fl:[],r:{},c:{morts:0,gagne:0,jours:0,jd:'',cartes:[],cartesP:[],rejoue:0}};}
function m2Etat(){const d=SAVE.d;if(!m2Etat._pop){m2Etat._pop=1;misPop();} /* (2026-10-18) le cadeau des carnets POP, une fois, avant la migration */let s=d.m2;if(!s||typeof s!=='object'||!s.c)s=d.m2=m2Vierge();if(s.v!==1)m2Migre(s);if(s.vc!==1)m2MigreV2(s);else if(s.vr!==1)m2MigreV2(s,1);return s;} /* (2026-10-18) vr : la REPRISE de la migration avortée (voir m2MigreV2) */
function m2EnC(){try{return !!(started&&!gameOver);}catch(e){return false;}} // (les `let` de la course naissent APRÈS SAVE.load : la migration passe avant)
function m2Ok(){try{return started&&!gameOver&&!BALADE&&!SANDBOX&&!(PARK&&PARK.on)&&!TUTO.on;}catch(e){return false;}}
function m2Def(id){for(let i=0;i<M2.length;i++)if(M2[i].id===id)return M2[i];return null;}
function m2CarIdx(nom){for(let i=0;i<CARS.length;i++)if(CARS[i]&&CARS[i].name===nom)return i;return -1;}
function m2Jour(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
/* LES CARTES : celles que JOUER tire (SF_CARTES, le canyon compris quand il est ouvert) — « chaque map » suit la liste du jeu */
function m2Cartes(){try{return Object.keys(SF_CARTES).filter(function(k){return !SF_HORS[k];});}catch(e){return [];}} // (2026-10-18) les maps HORS DU TIRAGE n'y sont pas (la ville vitrée vit dans la ville)
function m2Vues(L){const K=m2Cartes();let n=0;for(const k of L)if(K.indexOf(k)>=0)n++;return n;} // les maps jouées qui comptent (une map sortie du tirage ne compte plus)
/* À TOI, SANS LE CODE COUSIN : le code cousin ouvre tout sur un appareil (« l'argent, l'aura et les records ne bougent pas ») — il ne
   doit pas non plus encaisser les primes de collection. Même règle que carUnlockedVrai / shopOwned / figPossede, le cousin en moins. */
function m2CarAMoi(i){if(carRetiree(i))return false;if(carOwned(i))return true;if(i<=((SAVE.d.ex&&SAVE.d.ex.floor)|0))return true;
  const u=CAR_UNLOCK[i];if(!u)return true;if(u.k==='mis'||u.p||u.k==='premium'||u.eur)return false;return carStat(u.k)>=u.v;}
function m2HabAMoi(cat,d){if(cat==='figure')return d.id==='tailwhip'||(Array.isArray(SAVE.d.figs)&&SAVE.d.figs.indexOf(d.id)>=0);
  if(d.pack==='chat'&&m2Chat())return true;if(!d.p&&!d.mis&&!d.mis2&&!d.pack&&!d.sec&&!d.eur&&!d.serie)return true;return SAVE.d.shop.own.indexOf(cat+':'+d.id)>=0;}
function m2Chat(){for(let i=0;i<CARS.length;i++)if(CARS[i]&&CARS[i].shape==='poptart')return m2CarAMoi(i)||(function(){try{return carUnlockedVrai(i);}catch(e){return false;}})();return false;}
/* les objets que donnent les missions : hors des « toutes » (« les objets gagnés par mission ne comptent PAS dans toutes ») — les
   couleurs SECRÈTES de la palette aussi (elles se gagnent par leur mission secrète) */
/* (M2_RECO, le cache de m2Reco, est déclarée plus haut, à côté de M2K : voir là) */
function m2Reco(){if(M2_RECO)return M2_RECO;const R={car:{},hab:{}};for(const m of M2){const r=m.r||{};if(r.car)R.car[r.car]=m.id;if(r.cat)R.hab[r.cat+':'+r.id]=m.id;}return (M2_RECO=R);}
function m2HabReco(cat,d){return !!(m2Reco().hab[cat+':'+d.id]||(cat==='peinture'&&(d.sec||d.serie)));} /* (2026-10-20) les peintures de la SÉRIE se gagnent au 7e jour : hors des « toutes » */
/* LA COLLECTION : n = possédés (tout compte), tot/nT = le lot « toutes » (sans les objets de mission) et ce qu'on en a */
function m2Col(cat){const R=m2Reco();let n=0,tot=0,nT=0;
  if(cat==='voiture'){for(let i=0;i<CARS.length;i++){if(carRetiree(i))continue;const a=m2CarAMoi(i);if(a)n++;if(!R.car[CARS[i].name]){tot++;if(a)nT++;}}}
  else{const L=COSM[cat]||[];for(const d of L){const a=m2HabAMoi(cat,d);if(a)n++;if(!m2HabReco(cat,d)){tot++;if(a)nT++;}}}
  return {n:n,tot:tot,nT:nT};}
/* (2026-10-22) LES RARES À TOI : celles qui s'achètent (les rares gagnées par mission ne comptent pas — LA DOLORÈS se débloque en les ayant toutes) */
function m2Rares(){const R=m2Reco();let n=0,tot=0;for(let i=0;i<CARS.length;i++){if(carRetiree(i)||carRar(i)!=='rare'||R.car[CARS[i].name])continue;tot++;if(m2CarAMoi(i))n++;}return {n:n,tot:tot};}
/* (2026-10-22) LA MÉTÉO D'UNE MAP (LA STRATOS) : pour chaque map, les temps (SF_CARTES[k].m : matin, midi, soir, nuit, pluie, orage…) déjà joués ; la meilleure map compte (n joués sur tot) */
function m2Meteo(){const c=m2Etat().c,H=c.met||{};let n=0,tot=0,f=-1;for(const k of m2Cartes()){const L=Object.keys((SF_CARTES[k]&&SF_CARTES[k].m)||{});if(!L.length)continue;let j=0;for(const x of L)if((H[k]||[]).indexOf(x)>=0)j++;if(j/L.length>f||(j/L.length===f&&L.length>tot)){f=j/L.length;n=j;tot=L.length;}}return {n:n,tot:tot};}
function m2Tout(){let tot=0,nT=0;for(const c of ['voiture','peinture','aile','trainee','figure']){const o=m2Col(c);tot+=o.tot;nT+=o.nT;}return {tot:tot,nT:nT};}
/* (M2_COLK est déclarée plus haut, à côté de M2K : voir là) */
/* LA VALEUR D'UNE MISSION, maintenant (les records de la partie en cours compris) */
function m2Val(m){const d=SAVE.d,s=m2Etat(),r=s.r,c=s.c,ex=d.ex||{},enC=m2EnC();
  switch(m.k){
    case 'fig':return r.fig|0; // (pas ex.chain : la chaîne compte aussi les gestes automatiques — jaillissements, vrilles, glisses)
    case 'airP':return r.airP||0;
    case 'parf':return r.parf|0;
    case 'fren':return (r.frenN||(d.frenRec||0)>0)?1:0;
    case 'frenT':return Math.max(d.frenRec||0,r.frenT||0);
    case 'kmh':return Math.max(ex.kmh|0,r.kmh|0);
    case 'vie':return Math.max(r.vie||0,enC?M2R.vie:0);
    case 'tours':return r.tours|0;
    case 'cartesP':return m2Vues(c.cartesP);
    case 'cartes':return m2Vues(c.cartes);
    case 'aura':{let a=d.auraMax||0;if(enC)try{a=Math.max(a,Math.round(auraRun)||0);}catch(e){}return a;}
    case 'gagne':return c.gagne||0;
    case 'eng':{let e=ex.eng|0;if(enC)e=Math.max(e,engTier|0);return e+1;}
    case 'morts':return c.morts|0;
    case 'jours':return c.jours|0;
    case 'vol':return r.vol||0;
    case 'lac':return r.lac||0;
    case 'rejoue':return r.rejoue|0;
    case 'prof':return r.prof||0;
    case 'flag':return s.fl.indexOf(m.id)>=0?1:0;
    case 'toutT':return m2Tout().nT;
    case 'raresT':return m2Rares().n;
    /* (2026-10-22, Sacha : « tableau des voitures ») les compteurs À VIE des nouvelles missions de caisse : ramassés / secondes de nitro / de nitro max / figures / secondes en l'air / revives par pub / morts contre la glace */
    case 'pu':case 'nitS':case 'nmaxS':case 'figs':case 'airS':case 'verglasKm':return c[m.k]||0;
    case 'kmTot':return Math.floor(c.kmTot||0);
    case 'meteoMap':return m2Meteo().n;
    case 'misok':return s.ok.length;
  }
  const t=/T$/.test(m.k),o=m2Col(M2_COLK[t?m.k.slice(0,-1):m.k]);return t?o.nT:o.n;}
function m2Seuil(m){if(m.v==='prof')return M2K.prof;if(m.v!=='tot')return m.v;
  if(m.k==='cartes'||m.k==='cartesP')return m2Cartes().length;if(m.k==='raresT')return m2Rares().tot;if(m.k==='meteoMap')return m2Meteo().tot;if(m.k==='toutT')return m2Tout().tot;
  return m2Col(M2_COLK[m.k.slice(0,-1)]).tot;}
function m2Txt(m){const s=String(LANG==='fr'?m.t:m.en),v=m2Seuil(m);
  return s.replace('{v}',m.u==='$'?fmtSolde(v):m.u==='s'?String(v):Math.round(v).toLocaleString(typeof LOC==='function'?LOC():'fr').replace(/[  ]/g,' '));} // « 1 000 KM/H », « 10 000 D'AURA »
function m2Flag(id){const s=m2Etat();if(s.fl.indexOf(id)<0){s.fl.push(id);SAVE.mark();}}
function gagneAjoute(x){try{const s=SAVE.d&&SAVE.d.m2;x=+x;if(s&&s.c&&isFinite(x)&&x>0)s.c.gagne=Math.min(1e30,(s.c.gagne||0)+x);}catch(e){}}
/* ---- LA MIGRATION, EN DEUX TEMPS : ce que l'ancienne sauvegarde savait déjà ----
   1. m2Migre (une fois, v1 comme v2) — les compteurs : morts (la mesure par niveau, ex.morts), argent accumulé (la banque + ce qui a été
      dépensé en caisses, figures et habillages ; jamais sous le record de fortune), jours (la série du jour, au moins 1 si l'on a joué).
   2. m2MigreV2 (une fois, à la première ouverture en v2) — les CAISSES déjà acquises sous l'ancienne règle (carnet relevé, 100 parties,
      achat) entrent dans `owned` : à toi pour toujours ; une mission DÉJÀ remplie à ce moment est réussie ; sa récompense est donnée si
      c'est un OBJET qu'on n'a pas ; sa prime en ARGENT n'est versée que pour la COLLECTION — les exploits, l'aura, l'argent et le moteur
      avaient leurs primes dans les carnets (« sans redonner de primes déjà touchées ») ; ce qu'on a déjà est marqué pris.
   3. (2026-10-18) LA REPRISE — m2MigreV2(s,1), une fois, pour une sauvegarde déjà marquée `vc` sans `vr` : du 16 au 18/10 la passe 2 avortait
      (M2_COLK / M2_RECO en zone morte) APRÈS avoir posé `vc` — les caisses de l'ancienne règle étaient faites, les missions jugées jusqu'à `carall`
      seulement (car5…car20 vues à 0, toute la collection, `maps` et les secrètes jamais jugées). La reprise ne refait PAS les caisses et ne juge
      que les missions pas encore réussies ; une prime en ARGENT n'y est JAMAIS marquée prise : les seules hors collection (fig2, air5, fren,
      aura10k/20k, eng10/20) ont été bien jugées par la passe avortée, et si l'une est remplie depuis, c'est en jouant en v2 — elle se touche.
      Un OBJET déjà à soi est marqué pris (RÉCUPÈRE ne donnerait rien). Rien n'est retiré, rien n'est versé ici. Une sauvegarde migrée en entier
      (v634 et après) y passe aussi : sans effet. `vr` posé avec `vc`, gardé par `san`. */
function m2Migre(s){const d=SAVE.d,ex=d.ex||{},c=s.c;
  let mo=0;try{for(const k in (ex.morts||{}))for(const q in ex.morts[k])mo+=ex.morts[k][q]|0;}catch(e){}c.morts=Math.max(c.morts|0,mo);
  c.gagne=Math.max(c.gagne||0,m2GagneEstime());
  const j=d.jour||{};if(!c.jd&&j.d)c.jd=String(j.d);c.jours=Math.max(c.jours|0,j.n|0,(ex.runs|0)>0?1:0);
  s.v=1;SAVE.mark();}
function m2MigreV2(s,rep){const d=SAVE.d;s.vc=1;s.vr=1; /* posés d'abord : m2Val rappelle m2Etat — rep : la reprise (voir 3. plus haut) */
  if(!Array.isArray(d.owned))d.owned=[];
  if(!rep)for(let i=0;i<CAR_UNLOCK.length;i++){const u=CAR_UNLOCK[i];if(!u||carRetiree(i)||carOwned(i))continue;let a=false;
    if(u.k==='mis'){const o=u.av;if(o&&o.k&&!o.p&&o.k!=='premium'&&!o.eur)try{a=carStat(o.k)>=o.v;}catch(e){}}
    else if(u.exK==='carnet')try{a=carStat('carnet')>=u.exV;}catch(e){}
    if(a)d.owned.push(i);}
  for(const m of M2){if(s.ok.indexOf(m.id)>=0)continue;let v=0;try{v=m2Val(m);}catch(e){}if(!(v>=m2Seuil(m)))continue;
    s.ok.push(m.id);const r=m.r||{};let deja=false;
    if(r.car){const i=m2CarIdx(r.car);deja=i>=0&&carOwned(i);}
    else if(r.cat)deja=d.shop.own.indexOf(r.cat+':'+r.id)>=0;
    else if(r.cash)deja=!rep&&m.f!=='collection'; /* la reprise ne marque jamais une prime en argent prise */
    (deja?s.pr:s.nv).push(m.id);}
  SAVE.mark();}
function m2GagneEstime(){const d=SAVE.d;let t=bank();
  try{for(const i of (d.owned||[])){const u=CAR_UNLOCK[i];const o=u&&u.k==='mis'?u.av:u;if(o&&o.p)t+=o.p;}}catch(e){}
  try{const F=(window.FIG&&FIG.liste)||[];for(const id of (d.figs||[])){if(id==='tailwhip'||(id==='tonneau'&&d.figT0)||(id==='saltov'&&d.figS))continue;const f=F.find(function(x){return x.id===id;});if(f&&f.p)t+=f.p;}}catch(e){}
  try{for(const k of (d.shop&&d.shop.own)||[]){const p=k.split(':'),h=(COSM[p[0]]||[]).find(function(x){return x.id===p[1];});if(h&&h.p)t+=h.p;}}catch(e){}
  return Math.max(t,d.bankMax||0);}
/* ---- LA VÉRIFICATION : une mission tombe dès que sa valeur passe le seuil (en course : 4 fois par seconde, sans la collection) ---- */
function m2Verifie(enC){const s=m2Etat();let n=0;
  for(const m of M2){if(s.ok.indexOf(m.id)>=0||!m2Dispo(m))continue;if(enC&&m.f==='collection')continue;let v=0;try{v=m2Val(m);}catch(e){continue;}
    if(v>=m2Seuil(m)){s.ok.push(m.id);s.nv.push(m.id);if(enC||m2EnC())M2R.run.push(m.id);n++;try{m2Annonce(m,enC);}catch(e){}}}
  if(n){SAVE.mark();if(!enC)try{m2Portes();}catch(e){}}return n;}
/* l'annonce d'une mission réussie : EN COURSE, la LIGNE du bas (#m2Ligne) ; hors course, le toast. Une secrète ne dit rien d'elle */
function m2Annonce(m,enC){const r=m.r||{};
  if(m.f==='secret'){if(enC)m2LigneDit('sec','? ? ?','');return;}
  const p=r.cash?'+'+fmtC(r.cash):r.car?TR(r.car):r.cat?TR(((COSM[r.cat]||[]).find(function(x){return x.id===r.id;})||{n:''}).n):'';
  if(enC&&m2LigneDit('ok',sansAcc(m2Txt(m)),p))return;try{toast(pxi('coche')+' '+TR('MISSION RÉUSSIE')+' · '+sansAcc(m2Txt(m)),true);}catch(e){}}
/* LA LIGNE DES MISSIONS (2026-10-17, Sacha : « il y a trop de pop-up mission pendant la partie, écris-le en ligne, un peu plus discrète,
   en bas de l'écran ») : en course, une mission réussie ne pose plus la bannière du haut (#misBan, qui reste aux astuces et aux combos) mais
   UNE ligne de texte en bas (#m2Ligne), juste au-dessus des missions suivies (#m2Focus) — couché au centre, debout à gauche (la colonne de
   NITRO reste libre). Plusieurs d'un coup : la première passe seule, tout le reste se dit en UNE ligne (« 3 MISSIONS RÉUSSIES ») ; 2,4 s
   chacune. Le son ui.mission une fois par ligne (la couleur secrète garde le sien, sonné par secDonne). Aucune image de la boucle n'y touche :
   piloté par événements, vidé par hautVide (l'explosion, l'écran de mort, RECOMMENCER). k : 'ok' réussie · 'sec' secrète · 'col' couleur */
const M2L={q:[],t:0,on:0};
function m2LigneDit(k,tx,p){if(!m2EnC())return false;M2L.q.push({k:k,tx:tx,p:p||''});if(!M2L.on)m2LigneSuit();return true;}
function m2LigneSuit(){clearTimeout(M2L.t);let e=document.getElementById('m2Ligne');
  if(!M2L.q.length||!m2EnC()){m2LigneVide();return;}
  let it=M2L.q.shift();
  if(M2L.on&&M2L.q.length&&it.k!=='dj'){const n=M2L.q.length+1;M2L.q.length=0;it={k:'ok',tx:'',p:'',n:n};} // une rafale : le reste en une seule ligne (2026-10-20 : le DÉFI DU JOUR passe toujours seul, en tête)
  M2L.on=1;
  if(!e){e=document.createElement('div');e.id='m2Ligne';e.setAttribute('role','status');(document.getElementById('hud')||document.body).appendChild(e);}
  const f=document.getElementById('m2Focus');e.style.setProperty('--m2lY',(f&&f._on&&f.offsetHeight?f.offsetHeight+4:0)+'px'); // au-dessus des suivies
  const dj=it.k==='dj',sec=it.k!=='ok'&&!dj,ti=it.n?it.n+' '+TR('MISSIONS RÉUSSIES'):TR(dj?'DÉFI DU JOUR':sec?'MISSION SECRÈTE':'MISSION RÉUSSIE');
  e.innerHTML='<i>'+pxi(dj?'cible':sec?'oeil':'coche')+'</i><span><small>'+sansAcc(ti)+'</small>'+(it.tx?' '+it.tx:'')+'</span>'+(it.p?'<b>'+it.p+'</b>':'');
  e.classList.toggle('sec',sec);e.classList.remove('on');void e.offsetWidth;e.classList.add('on');
  try{if(SONV2&&(it.k==='ok'||dj))sfx('ui.mission');}catch(x){}
  M2L.t=setTimeout(function(){e.classList.remove('on');M2L.t=setTimeout(m2LigneSuit,520);},2400);}
function m2LigneVide(){M2L.q.length=0;clearTimeout(M2L.t);M2L.on=0;const e=document.getElementById('m2Ligne');if(e)e.classList.remove('on');}
/* ---- LA RÉCOMPENSE (RÉCUPÈRE) : une fois, jamais deux ---- rend {cash|car|cat,hab} ou null */
function m2Prend(id){const s=m2Etat(),m=m2Def(id);if(!m||s.ok.indexOf(id)<0||s.pr.indexOf(id)>=0)return null;const r=m.r||{},o={id:id};
  if(r.vide)return null; // la récompense de « tous les objets » n'existe pas encore (à définir par Sacha)
  if(r.cash){SAVE.d.bank=Math.min(1e30,bank()+r.cash);gagneAjoute(r.cash);bankMaxMaj();o.cash=r.cash;}
  else if(r.car){const i=m2CarIdx(r.car);if(i<0||carRetiree(i))return null; /* pas encore revenue au garage : elle attend */ if(!carOwned(i))SAVE.d.owned.push(i);o.car=i;}
  else if(r.cat){const h=(COSM[r.cat]||[]).find(function(x){return x.id===r.id;});if(!h)return null;const k=r.cat+':'+r.id;if(SAVE.d.shop.own.indexOf(k)<0)SAVE.d.shop.own.push(k);o.cat=r.cat;o.hab=r.id;}
  s.pr.push(id);const k9=s.nv.indexOf(id);if(k9>=0)s.nv.splice(k9,1);SAVE.flush();return o;}
/* (2026-10-19, Sacha : « il y a des missions en vert avec marqué COMING TO THE GARAGE SOON, enlève ») une mission dont la récompense n'est PAS au garage
   (une caisse retirée, un habillage qui n'existe plus, la récompense « à définir ») n'existe plus pour le joueur : ni dans la liste, ni dans le compte,
   ni suivie, ni réussie en course. Elle revient d'elle-même quand sa récompense revient (une réussie d'avant attend alors, prête). ?sans=missionsvides = avant. */
const M2DISPO=!/[?&]sans=([^&]*,)?missionsvides(,|&|$)/.test(location.search);
function m2Dispo(m){if(!M2DISPO)return true;const r=(m&&m.r)||{};if(r.vide)return false;if(r.car){const i=m2CarIdx(r.car);return i>=0&&!carRetiree(i);}
  if(r.cat)return !!(COSM[r.cat]||[]).find(function(x){return x.id===r.id;});return true;}
function m2Pret(id){const s=m2Etat(),m=m2Def(id);if(!m||s.ok.indexOf(id)<0||s.pr.indexOf(id)>=0)return false;const r=m.r||{};
  if(r.vide)return false;if(r.car){const i=m2CarIdx(r.car);return i>=0&&!carRetiree(i);}if(r.cat)return !!(COSM[r.cat]||[]).find(function(x){return x.id===r.id;});return true;}
/* ---- LES BRANCHEMENTS DE LA COURSE ---- */
function m2Raz(){M2R.lv='';M2R.sonne=false;M2R.ctl=0;M2R.vie=0;M2R.parf=0;M2R.lac=0;M2R.tourV.length=0;M2R.run.length=0;M2R.t=0;M2R.deb=false;M2R.figV=0;M2R.volT=0;M2R.figMax=0;M2R.airPm=0;}
function m2Debut(){const s=m2Etat(),c=s.c,j=m2Jour();M2R.deb=true; // la 1re image de la partie qui compte : le jour, l'heure
  if(c.jd!==j){c.jd=j;c.jours=(c.jours|0)+1;SAVE.mark();}
  if(new Date().getHours()===3)m2Flag('nuit3h');}
function m2Tick(dt,kmh){if(!m2Ok()||paused)return;const s=m2Etat(),r=s.r;if(!M2R.deb)m2Debut();
  if(!introD&&(mode==='drive'||mode==='fall'))M2R.ctl+=dt;
  if(mode!=='boom'){M2R.vie+=dt;if(M2R.vie>(r.vie||0))r.vie=M2R.vie;}
  if(kmh>(r.kmh||0))r.kmh=Math.round(kmh);
  if(mode==='drive'||mode==='fall'){s.c.kmTot=(s.c.kmTot||0)+kmh*dt/3600;if(SND.sfx||SND.music)M2R.sonne=true;if(SND.music&&((engTier|0)+1)>=10)m2Flag('palier10');}
  {const k9=secCarte(),sg=k9.c+'/'+k9.m+'/'+(runStats.zones|0);if(M2R.lv!==sg){M2R.lv=sg;m2Niveau(k9);}} /* (2026-10-22, Sacha : « tableau des peintures ») un niveau entré */
  if(mode==='drive'&&side<0)m2Cpt('envers',kmh*dt/3600,100,'envers'); /* MONDE À L'ENVERS : 100 km sous la dalle (side < 0) */
  if(((engTier|0)+1)>=24)secGagne('guerrier'); /* SUPER GUERRIER : le palier 24 */
 /* (2026-10-22) les kilomètres à vie (LA QUEUE DE CANARD) ; SND : la partie a-t-elle eu du son ou de la musique (LA SILENCIEUSE) */
  if(nitroOn&&(mode==='drive'||mode==='fall')){s.c.nitS=(s.c.nitS||0)+dt;if(pwrNitroT>0)s.c.nmaxS=(s.c.nmaxS||0)+dt;SAVE.mark();} /* (2026-10-22) les secondes de nitro, et celles brûlées pendant une NITRO MAX */
  if(FLOW.lv===4){r.frenN=1;if(FREN.t>(r.frenT||0))r.frenT=FREN.t;}
  const k=secCarte().c;if(k&&s.c.cartes.indexOf(k)<0){s.c.cartes.push(k);SAVE.mark();}
  {const k9=secCarte();if(k9.c&&k9.m){const H=s.c.met||(s.c.met={}),L=H[k9.c]||(H[k9.c]=[]);if(L.indexOf(k9.m)<0){L.push(k9.m);SAVE.mark();}}} /* (2026-10-22) les temps joués, map par map (LA STRATOS) */
  if(k==='banquise'&&BANQ.sur>0){s.c.verglasKm=(s.c.verglasKm||0)+kmh*dt/3600;} /* (2026-10-22) les km sur le verglas du glacier (L'ICEBERG) */
  if(mode==='fall'){if(!JEAU.dans){M2R.volT+=dt;s.c.airS=(s.c.airS||0)+dt;SAVE.mark();}if(k==='nuages'&&M2R.volT>(r.vol||0))r.vol=M2R.volT;if(k==='ville')m2Tours(r);else if(k==='volcan')m2Geyser();}
  if(k==='banquise'&&BANQ.glisse&&BANQ.sur===2){M2R.lac+=dt;if(M2R.lac>(r.lac||0))r.lac=M2R.lac;}else M2R.lac=0;
  if(k==='jade'&&JEAU.dans&&JEAU.prof>(r.prof||0))r.prof=JEAU.prof;
  try{djTick(dt);}catch(e){} /* (2026-10-20) LE DÉFI DU JOUR (missions/aujourdhui.js) */
  M2R.t-=dt;if(M2R.t<=0){M2R.t=.25;m2Verifie(true);try{m2FocusMaj();}catch(e){}}}
/* (2026-10-22) un POWER-UP ramassé (pwrPrend) */
function m2Pu(k){if(!m2Ok())return;const c=m2Etat().c;c.pu=(c.pu|0)+1;SAVE.mark();const T={v:['citron','taxi'],a:['raisin','royal'],x:['dragon','fuchsia']}[k];if(T)m2Cpt(T[0],1,50,T[1]);} /* (2026-10-22, Sacha : « tableau des peintures ») les fruits-pouvoirs : CITRON (v), RAISIN (a), FRUIT DU DRAGON (x) — 50 chacun pour leur peinture */
/* UN COMPTEUR À VIE DE PEINTURE SECRÈTE : `c.sc[k]` += v ; au seuil, la peinture `id` (secGagne → secDonne) */
function m2Cpt(k,v,seuil,id){if(!m2Ok())return;const c=m2Etat().c,S=c.sc||(c.sc={});S[k]=(S[k]||0)+v;if(S[k]>=seuil)secGagne(id);SAVE.mark();}
function m2Fruit(nom){const T={CERISE:['cerise','bolide'],ORANGE:['orange','emeute'],MYRTILLE:['myrtille','azur']}[nom];if(T)m2Cpt(T[0],1,50,T[1]);} /* un fruit croqué (ramassage.js) */
/* UN NIVEAU ENTRÉ (le portail franchi, ou le départ) : dix par temps / par map pour les peintures secrètes */
function m2Niveau(k){const m=k.m,c=k.c;
  if(m==='neige'||m==='blizzard')m2Cpt('neige',1,10,'menthe');if(m==='nuit')m2Cpt('nuit',1,10,'minuit');if(m==='matin')m2Cpt('matin',1,10,'dragee');if(m==='midi')m2Cpt('midi',1,10,'abricot');
  if(c==='banquise')m2Cpt('glacier',1,10,'neige');if(c==='foret')m2Cpt('foret',1,10,'ogre');if(c==='ville'||c==='crypto'||c==='vitree')m2Cpt('ville',1,10,'gotham');
  if(m==='pluie'||m==='orage')m2Cpt('pluie',1,10,'orage');if(c==='espace')m2Cpt('espace',1,10,'lunaire');if(c==='nuages')m2Cpt('nuages',1,5,'chrome');} /* (2026-10-22, Sacha : « oui » aux deux points de la revue) MENTHE compte aussi le blizzard (le glacier en neige seule : un niveau sur 66) ; CHROME MIROIR : cinq niveaux sur la mer de nuages (un seul l'ouvrait dès la 1re course) */
function m2Saut(){M2R.tourV.length=0;M2R.figV=0;M2R.volT=0;} // startFall : un saut neuf (le bump n'en est pas un : il prolonge le saut)
/* FRÔLER UNE TOUR (la ville) : passer à moins de M2K.frole m d'un flanc, à hauteur de la tour, sans la toucher — la même grille que
   villeHeurt (CITY.col : boîtes x,y,z,l,h,p), les huit cases voisines comprises. Une tour = son décalage dans la grille. */
function m2Tours(r){const C=CITY.col;if(!C||!CITY.root)return;const p=carGroup.position,cg=C.CG,ix=Math.floor(p.x/cg),iz=Math.floor(p.z/cg),c=C.c,M=M2K.frole;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=C.g.get((ix+a)+','+(iz+b));if(!L)continue;
    for(let j=0;j<L.length;j++){const o=L[j];if(Math.abs(p.y-c[o+1])>c[o+4]/2)continue;
      const ex9=Math.abs(p.x-c[o])-c[o+3]/2,ez9=Math.abs(p.z-c[o+2])-c[o+5]/2,dd=Math.max(ex9,ez9);
      if(dd>0&&dd<M&&M2R.tourV.indexOf(o)<0&&M2R.tourV.length<32){M2R.tourV.push(o);if(M2R.tourV.length>(r.tours|0))r.tours=M2R.tourV.length;}}}}
/* TRAVERSER UN GEYSER (le volcan) : le calendrier du shader (période, phase), la colonne qui monte de sa bouche (v m/s) */
function m2Geyser(){const G=VOLCAN.gey;if(!G||!G.length)return;let t=0;try{t=VLC_U.uTime.value;}catch(e){return;}const p=carGroup.position;
  for(const g of G){const dx=p.x-g.x,dz=p.z-g.z;if(dx*dx+dz*dz>(g.sz*2.4)*(g.sz*2.4))continue;
    const tE=(((t/g.per+g.ph)%1+1)%1)*g.per,h=g.v*g.v/(2*9.8);if(tE<2*g.v/9.8&&p.y>g.y-2&&p.y<g.y+h){m2Flag('geyser');return;}}}
function m2Fig(id){if(!m2Ok())return;const s=m2Etat(),r=s.r;
  /* UNE FIGURE = une figure à bouton (fig_<id>, pas le bonus fig_combo_) ou le BUMP (Sacha, 15/10 : « bump doit compter comme une figure ») */
  if((/^fig_/.test(id)&&!/^fig_combo_/.test(id))||id==='bump'){M2R.figV++;s.c.figs=(s.c.figs|0)+1;SAVE.mark();if(M2R.figV>M2R.figMax)M2R.figMax=M2R.figV;if(M2R.figV>(r.fig|0))r.fig=M2R.figV;}
  /* LE SALTO DEVANT LA TERRE : une figure qui passe par l'avant ou l'arrière (un salto), en orbite, la Terre dans le champ */
  if(/^fig_/.test(id)&&secCarte().c==='espace'&&typeof planetGroup!=='undefined'&&planetGroup&&planetGroup.visible&&LVL.cur&&LVL.cur.meteo==='matin'){
    try{const f=FIG.liste.find(function(x){return 'fig_'+x.id===id;}),D=f?FIG.dirs(f):[];
      if(D.indexOf('avant')>=0||D.indexOf('arriere')>=0){camera.getWorldDirection(tmp3);if(tmp3.dot(ORB.terre)>.55)m2Flag('terre');}}catch(e){}}}
function m2Pose(g,ratee,vol){if(!m2Ok())return;const s=m2Etat(),r=s.r;
  if(vol>.7){if(!ratee&&g>=1.5){M2R.parf++;if(M2R.parf>(r.parf|0))r.parf=M2R.parf;}else M2R.parf=0;}
  if(!ratee&&g>=1.5){if(M2R.volT>M2R.airPm)M2R.airPm=M2R.volT;if(M2R.volT>(r.airP||0))r.airP=M2R.volT; /* le temps VÉCU en l'air (le bump ne le raccourcit pas) */const k=secCarte().c;if(k&&s.c.cartesP.indexOf(k)<0){s.c.cartesP.push(k);SAVE.mark();}}}
function m2Mort(cause){if(!m2Ok())return;const s=m2Etat();s.c.morts=(s.c.morts|0)+1;
  if(M2R.ctl<M2K.debut)m2Flag('mort3s');
  if(cause==='arret')m2Flag('arret');
  if(cause==='air')m2Flag('air0'); // le chrono de vol est tombé à zéro (la boule de l'airtime)
  if(cause==='lave')m2Flag('lave');
  try{if(nitroR>=nitroCap()-.01)m2Flag('nitplein');}catch(e){}
  try{if(secCarte().c==='volcan'){const p=carGroup.position;for(const q of [[VOLCAN.C,VOLCAN.K],[VOLCAN.C2,VOLCAN.K2]])if(q[0]&&q[1]&&Math.hypot(p.x-q[0].x,p.z-q[0].z)<q[1].rc){m2Flag('cratere');break;}}}catch(e){}
  m2Verifie(true);SAVE.mark();}
function m2Fin(){ // endGame (une mort, ou QUITTER) : la partie entière se juge ici
  try{if(BALADE||SANDBOX||(PARK&&PARK.on)||TUTO.on||TUTO.quitte)return;}catch(e){return;}
  if(mortCause&&M2R.ctl>=M2K.partie){if(!(RUNX.nitro>0))m2Flag('sansnit');if(!(RUNX.coins>0))m2Flag('sanspiece');if(!M2R.sonne)m2Flag('silence');}
  m2Verifie(false);{const s9=m2Etat();s9.su=s9.su.filter(function(id){return s9.ok.indexOf(id)<0;});} /* une suivie réussie se récupère : elle quitte le suivi */SAVE.flush();}
function m2Rejoue(){const s=m2Etat();s.c.rejoue=(s.c.rejoue|0)+1;if(s.c.rejoue>(s.r.rejoue|0))s.r.rejoue=s.c.rejoue;SAVE.mark();}
function m2Menu(){const s=m2Etat();if(s.c.rejoue){s.c.rejoue=0;SAVE.mark();}}
/* CONSOLE : dbgMissions() = chaque mission (visibles ET secrètes) : sa valeur, son seuil, réussie, prise · dbgMissions('gagne',id) = la
   réussir pour de vrai (sa récompense attend à l'écran ; une secrète joue sa révélation) · ('prend',id) · ('raz') = tout effacer
   (la sauvegarde repart de la migration) · ('etat') = l'état de la partie en cours */
/* console : dbgMissionsLots() = le contenu des lots « toutes » (sans les objets de mission) et ce qui, dedans, ne s'achète PAS à l'argent du jeu */
window.dbgMissionsLots=function(){const o={};for(const cat of ['voiture','peinture','aile','trainee','figure']){const c=m2Col(cat),sans=[];
  if(cat==='voiture'){for(let i=0;i<CARS.length;i++){if(carRetiree(i)||m2Reco().car[CARS[i].name])continue;const u=CAR_UNLOCK[i];if(u&&!u.p&&u.k)sans.push(CARS[i].name+' ('+(u.eur||u.k)+')');}}
  else for(const d of COSM[cat]||[]){if(m2HabReco(cat,d))continue;if(!d.p&&(d.eur||d.pack||d.sec||d.mis))sans.push(d.id+' ('+(d.eur||d.pack||'?')+')');}
  o[cat]={possedes:c.n,toutes:c.tot,dansToutes:c.nT,pasAArgentDuJeu:sans};}return o;};
window.dbgMissions=function(a,id){
  if(a==='raz'){SAVE.d.m2=m2Vierge();SAVE.flush();return 'missions remises à zéro (migration rejouée)';}
  if(a==='etat')return {ctl:+M2R.ctl.toFixed(1),vie:+M2R.vie.toFixed(1),parf:M2R.parf,lac:+M2R.lac.toFixed(1),tours:M2R.tourV.length,cettePartie:M2R.run.slice(),v2:true};
  const s=m2Etat();
  if(a==='gagne'){const m=m2Def(id);if(!m)return 'inconnue : '+id;if(s.ok.indexOf(id)<0){s.ok.push(id);s.nv.push(id);SAVE.flush();try{m2Annonce(m,m2EnC());}catch(e){}}
    try{if(typeof m2Revele==='function'&&m.f==='secret')m2Revele(id);}catch(e){console.warn(e);}return 'réussie : '+id;}
  if(a==='prend')return m2Prend(id)||'rien à prendre';
  return M2.map(function(m){let v=0;try{v=m2Val(m);}catch(e){v='?';}return {id:m.id,famille:m.f,texte:m2Txt(m),valeur:typeof v==='number'?Math.round(v*10)/10:v,seuil:m2Seuil(m),
    reussie:s.ok.indexOf(m.id)>=0,prise:s.pr.indexOf(m.id)>=0,suivie:s.su.indexOf(m.id)>=0,recompense:m.r,auGarage:m2Dispo(m)};});};
