/* ================= ÉCONOMIE — VAGUE 3 (2026-09-27, Sacha : « on gagne de l'argent trop rapidement, réajuste l'équilibrage
   global du système d'argent ») =================
   MESURÉ (banc scratchpad v3-eco : 23 parties entières jouées par un pilote automatique à 4 niveaux de jeu, chaque dollar compté à
   sa source, puis rejouées hors ligne sous d'autres formules) : le pilote SANS AUCUN geste gagnait ~1 300 $ la première minute
   (une COMMUNE par minute de conduite passive) ; débutant (75 s) 3 450 $/partie · moyen (2,3 min) 11 300 · bon (7 min, ORBITE)
   148 k · très bon (12 min, niveau 5) 442 k. Un bon joueur s'offrait TOUTES les communes en une partie, TOUTE la gamme en ~110.
   91 à 99 % venaient des PIÈCES : RÉCOLTE ×4 (série de pièces) × FLOW ×3 = ×12 sur CHAQUE pièce, et sur une route dense la
   récolte ne retombe jamais — la 10e minute d'une grande partie rapportait ~170× la 1re. Côté poses, FLOW × CHAÎNE × POSE × FACE
   × SÉRIE montait à ×108, et la SÉRIE (×2) ne retombait jamais non plus.
   CE BLOC EST TOUT LE RÉGLAGE : d'abord les trois FUITES (des multiplicateurs qui se composaient), puis UN bouton de niveau.
   RÉSULTAT (re-mesuré, jeu modifié) : débutant ~560 $/partie · moyen ~1 750 · bon ~17 k · très bon ~55-73 k — la 1re caisse
   après l'auto-école + 1 à 2 parties, la 5e en ~5 parties moyennes, les communes en ~5 bonnes parties, la caisse à 2,5 M en ~35-45
   très bonnes. Le talent paie toujours autant : un très bon joueur gagne ~100-130× un débutant par partie (c'était ~130×). */
const ECO3={
  gain:.25,     // LE BOUTON : la valeur du dollar gagné EN COURSE — pièces et portail passent par denom() (les poses et l'assurance ne paient plus : 29/09)
  prime:1,      // les PRIMES DE CONTRAT (versées en banque) — (2026-10-14, équilibrage) PLEINES (c'était la moitié) : sans les communes retirées le 06/10, ce salaire d'accueil rapproche la 1re caisse
  defi:{1000:200,20000:2500,100000:12000,500000:60000}, // les défis « ENCAISSE X » (ancien seuil → nouveau), calés sur les parties mesurées
  flow:[1,1.3,1.5,1.8,3], // FUITE 1 — le FLOW paie ×1,3 · ×1,5 · ×1,8 · ×3 à la FRÉNÉSIE (c'était +0,5 par palier, jusqu'à ×3) ; des valeurs
                //   qui s'écrivent juste avec une décimale : la bande du FLOW affiche flowMult() tel quel, elle ne doit pas arrondir
                //   (2026-09-29, Sacha : « en mode frénésie on doit gagner 3× l'argent ») : la FRÉNÉSIE repasse à ×3 (elle payait ×2) — elle
                //   seule, les paliers d'avant gardent leur prix. En échange elle se gagne plus vite et TOMBE plus vite (FLOW2, loi 16) : le
                //   ×3 n'est plus une rente, c'est une rafale qu'on relance. Toute la paie de course passe par flowMult() (pièces, portail,
                //   butins de la ville, fins de monde) ; les figures, elles, ne paient plus qu'en aura (session GAMEPLAY, même jour).
  recolte:2.5,  // FUITE 2 — la RÉCOLTE monte de ×0,5 toutes les 5 pièces et plafonne à ×2,5 (c'était +1 par 5, jusqu'à ×4)
  serie:.5      // FUITE 3 — la SÉRIE de poses : +5 % par pose, plafond +50 % (c'était +10 %, plafond ×2 dès la 10e pose)
};
function ecoSerie(){return streak>=2?1+Math.min(ECO3.serie,streak*.05):1;} // la SÉRIE : lue par la pose ET par la mallette (chainEst) — un seul endroit
// ⚠ `THRESH` A ÉTÉ RETIRÉ (2026-08-03) — c'était l'échelle de 23 seuils d'argent qui faisait tomber
// les caisses EN COURS de partie. Depuis que les voitures se débloquent sur des exploits persistants
// (voir CAR_UNLOCK), plus une seule ligne ne la lisait : la laisser aurait fait croire qu'elle pilote
// encore quelque chose. Son dernier seuil valait 1,9e13, hors d'atteinte — c'est précisément ce qui
// rendait les dernières caisses inaccessibles et ce qui a motivé de nouvelles règles.
let level=0; // la caisse CONDUITE (choisie au garage). Fixe pendant toute une partie — ce n'est plus un « niveau ».
// ⚠ LA VALEUR DES PIÈCES SUIT LE MOTEUR, PLUS LA VOITURE (2026-08-02). La voiture est désormais
// PUREMENT COSMÉTIQUE : l'indexer sur `level` faisait qu'équiper une belle caisse donnait d'emblée
// des pièces à 40 000 — d'où la tirelire à 320 000 dès le premier écran. Le moteur, lui, part
// toujours de zéro : l'économie repart donc au même point à chaque partie.
function denom(){return DENOMS[Math.min(engTier,DENOMS.length-1)]*ECO3.gain*ECOD.k;} // clamp sur la table elle-même : la liste de paliers peut grandir sans qu'un 23 codé en dur la tronque · ×ECO3.gain (vague 3) : tous les seuils relatifs (mallette « chaude », caisse enregistreuse, verdicts) suivent seuls
/* (2026-10-14, GAMEPLAY — Sacha : « le premier achat — la PEINTURE la moins chère — doit tomber à la 4e PARTIE d'un joueur MOYEN, sans toucher aux PRIX de Léo ; les gains du début sont relevés, et ce relèvement s'éteint après le 1er achat ») L'ARGENT DU DÉBUT.
   LE LEVIER : denom() × ECOD.k. Toute la paie de COURSE (pièces, portail, fins de monde, butins de la ville) passe déjà par denom() × flowMult() : on ne crée pas
   de deuxième chemin d'argent, on règle le robinet qui existe. Les PRIMES (permis, défis) et les PRIX (COSM, CAR_UNLOCK) ne bougent pas.
   QUAND IL VAUT — décidé au DÉPART de chaque partie (runxReset → ecoDebutMaj), donc constant pendant toute la partie : ECOD.coup (×1,5) tant que
   (1) rien n'a été acheté en boutique (caisse, peinture, aile, traînée, figure : voir ecoDebutAchat — un habillage GAGNÉ par un carnet n'est pas un achat) ;
   (2) la banque n'atteint pas la peinture la moins chère (le filet : qui peut déjà se l'offrir n'a plus besoin d'aide, même s'il garde son argent pour autre chose) ;
   (3) ni `?eco=ancien` (strictement l'ancienne économie) ni le code cousin. Un achat, quel qu'il soit, l'éteint pour toujours : aucun champ de sauvegarde, tout se relit sur l'état.
   LE CALCUL (outils/eco-debut-modele.cjs : les constantes sont LUES dans ce fichier, les comportements sont des hypothèses écrites) — le joueur MOYEN tient 45-90 s, prend la
   moitié des pièces, entre dans le flow I vers 40 s, remplit le carnet 1 vers la 1re-3e partie : ~175 $ par partie. Sans relèvement la MENTHE GLACÉE (2 500 $) tombe à la 6e
   partie (médiane, 11 % des joueurs avant la 5e) ; avec ×1,5 à la 4e (25 % dès la 3e, 62 % au plus tard à la 4e, 89 % à la 5e). ⚠ Le résultat dépend surtout des PRIMES, pas des
   pièces : si ce joueur fait aussi la moitié des défis du carnet 2 (1 800 $), il l'a déjà à la 3e même sans relèvement — ECOD.coup est LE bouton à reprendre après un vrai test
   (`dbgEcoDebut()` dit où l'on en est). Le joueur qui meurt avant 45 s (25-30 $ par partie) n'y arrive pas par les pièces : son plancher est un autre chantier. */
const ECO_ANCIEN=/[?&]eco=ancien\b/.test(location.search); // `?eco=ancien` : ECOD.k reste à 1, l'économie d'avant au dollar près
const ECOD={coup:1.5,k:1,raison:'depart'}; // coup : LE réglage · k : ce que la partie en cours applique · raison : pourquoi (actif · achat · assez · cousin · ancien · erreur)
function ecoDebutPrix(){let m=1e30;for(const c of ['peinture','aile','trainee'])for(const x of COSM[c])if(x.p>0&&x.p<m&&!x.sec&&!x.mis&&!x.retire&&!x.eur)m=x.p;for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(u&&u.p>0&&u.p<m&&!carRetiree(i))m=u.p;}return m;} /* la 1re chose qui s'achète EN DOLLARS, LUE sur COSM et CAR_UNLOCK : si les prix changent, le seuil suit — ni les SECRÈTES, ni celles d'un carnet, ni les retirées, ni celles en euros. (2026-10-24) toutes les peintures sont passées en euros (boutique.js leur retire p) : le seuil valait 1e30 et « assez » ne tombait plus jamais ; caisses, ailes et traînées en $ prennent le relais (aujourd'hui LA CABOSSÉE, 2 500 $, le prix de l'ancienne MENTHE GLACÉE) */
function ecoDebutAchat(){ // vrai dès qu'UN achat a été fait : caisse (owned), figure (figs — le TAIL WHIP est offert ; le TONNEAU l'était avant le 15/10), habillage payant (shop.own — ceux d'un carnet n'ont pas de `p`)
  const d=SAVE.d;if(d.owned&&d.owned.length)return true;if(d.figs&&d.figs.some(function(id){return id!=='tailwhip'&&!(id==='tonneau'&&d.figT0)&&!(id==='saltov'&&d.figS);}))return true; // (2026-10-15) le TAIL WHIP offert, et le tonneau offert des sauvegardes d'avant, ne sont pas des achats
  const o=d.shop&&d.shop.own;if(o)for(let i=0;i<o.length;i++){const a=String(o[i]).split(':'),l=COSM[a[0]],x=l&&l.find(function(y){return y.id===a[1];});if(x&&x.p>0)return true;}
  return false;
}
function ecoDebutEtat(){ // {k, raison} — pur : ne touche à rien
  try{
    if(ECO_ANCIEN)return {k:1,raison:'ancien'};
    if(cousin())return {k:1,raison:'cousin'};
    if(ecoDebutAchat())return {k:1,raison:'achat'};
    if(bank()>=ecoDebutPrix())return {k:1,raison:'assez'};
    return {k:ECOD.coup,raison:'actif'};
  }catch(e){return {k:1,raison:'erreur'};} // SAVE ou COSM pas encore déclarés (le tout premier buildCar tourne avant eux) : l'ancienne économie
}
function ecoDebutMaj(){const e=ecoDebutEtat();ECOD.k=e.k;ECOD.raison=e.raison;return e.k;} // appelée par runxReset : UNE fois par partie
window.dbgEcoDebut=function(){const e=ecoDebutEtat(),p=ecoDebutPrix(),b=bank(); // (2026-10-14, GAMEPLAY) l'état du relèvement : `k` = ce que la partie en cours applique, `prochain` = ce que la suivante appliquerait
  return {actif:ECOD.raison==='actif',k:ECOD.k,raison:ECOD.raison,prochain:e.k,raisonProchaine:e.raison,coup:ECOD.coup,parties:(SAVE.d.ex&&SAVE.d.ex.runs)|0,achatFait:ecoDebutAchat(),banque:b,peintureMin:p,manque:Math.max(0,p-b),ancien:ECO_ANCIEN};};
// LANGUE & DEVISE (2026-09-03) : la devise est désormais UNIQUE — le dollar, quelle que soit la
// langue d'affichage (avant : le français comptait en euros). `CUR()` ne dépend donc plus de `LANG` ;
// seul `LOC()` (le séparateur des milliers/décimales) suit encore la langue.
// ⚠ DEUX LANGUES (FR/EN) : `LANG_CYCLE` est la SEULE liste à tenir à jour — le
// sélecteur (desktop ET mobile) boucle dessus via `langNext()`, un seul écrivain pour ne pas
// diverger entre les deux (même piège que `modeLbl`).
// (2026-10-14, Sacha : « enlève le chinois ») un `ccLang` qui n'est plus proposé (l'ancien 'zh') retombe sur la langue de l'appareil (`langAuto`).
const LANG_CYCLE=['fr','en'];
/* (2026-09-28, passe de lancement) LA LANGUE DU TÉLÉPHONE PAR DÉFAUT : sans choix enregistré, TOUT LE MONDE démarrait en anglais —
   un iPhone réglé en français compris. On lit les langues préférées de l'appareil, la 1re que le jeu parle gagne (sinon l'anglais) ;
   le choix fait dans les réglages (`langNext` → `ccLang`) reste maître, et l'automatique n'est jamais écrit : il suit l'appareil. */
const LANG_AUTO=['fr','en'];
function langAuto(){
  try{const L=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||''];
    for(const l of L){const c=String(l).toLowerCase().slice(0,2);if(LANG_AUTO.indexOf(c)>=0)return c;}}catch(e){}
  return 'en';
}
function decFr(x,d){const t=(+x).toFixed(d);return LANG==='fr'?t.replace('.',','):t;} // (passe qualité) « 5,3 » en français, « 5.3 » ailleurs
let LANG=(function(){try{const c=localStorage.ccLang;if(LANG_CYCLE.indexOf(c)>=0)return c;}catch(e){}return langAuto();})();
function langNext(){
  const i=LANG_CYCLE.indexOf(LANG);
  LANG=LANG_CYCLE[(i+1)%LANG_CYCLE.length];
  try{localStorage.ccLang=LANG;}catch(err){}
  return LANG;
}
const CUR=()=>'$';
const LOC=()=>LANG==='fr'?'fr-FR':'en-US';
const fmt=v=>CUR()+' '+Math.round(v).toLocaleString(LOC());
