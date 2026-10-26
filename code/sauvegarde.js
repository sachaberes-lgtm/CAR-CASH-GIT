/* fin LE RETOUR DU JOUR ET LE CADEAU */
// ---------- SAVE : UNE clé versionnée ('cashcarSave'), migration douce depuis rrXxx5 ----------
// Toute la persistance passe par ici : SAVE.d vit en mémoire, flush() écrit tout d'un bloc,
// mark() note un changement (le filet des 30 s l'écrira). Les anciennes clés rrXxx5 sont lues
// UNE fois puis laissées intactes (retour arrière possible) — plus jamais écrites.
const SAVE={
  V:2,K:'cashcarSave',d:null,dirty:false,
  def(){return{v:this.V,best:0,leaders:[],bestCar:0,equipped:0,sfx:true,vox:true,mus:true,fruits:[],
    vol:{mus:.62,sfx:1,vox:1}, // les trois curseurs de volume (1 = le mixage d'origine)
    tctl:'stick',q:(PAL.b('qNetDefaut',0)?'net':'fast'),qChoisi:0,sand:false,carr:{}, // MOBILE : schéma de commandes · résolution d'image · bac à sable // (2026-10-14, passe perf mobile) q d'une sauvegarde NEUVE = le défaut du palier (RAPIDE tant que qNetDefaut=[0,0,0]) ; qChoisi = 1 quand le joueur a touché IMAGE
    volH:'monte',volHv:2, // (2026-10-10, Léo) POUCE HAUT EN VOL : MONTE d'origine (voir san)
    figG:'tap', // (2026-10-15, Léo) FIGURES : 'tap' = le double-tap NITRO (d'origine) · 'glisse' = glisser depuis NITRO puis lâcher (voir GLI)
    // EXPLOITS — les compteurs À VIE qui débloquent les caisses. Ils PERSISTENT : le moteur est la
    // progression DANS une partie (il repart à zéro), la voiture est la progression ENTRE les parties.
    // `eng` = plus haut palier moteur jamais atteint · `gaps`/`tricks`/`bumps` = cumuls · `zones`,
    // `chain`, `kmh` = meilleurs d'une partie · `surv` = victoires en Survivant.
    // `floor` = clause de GRAND-PÈRE : les caisses gagnées sous les anciennes règles (déblocage à
    // l'argent de la partie) restent acquises. Sans elle, changer de règles reprenait au joueur des
    // caisses qu'il avait méritées — une mise à jour ne doit jamais confisquer.
    ex:{eng:0,tricks:0,gaps:0,bumps:0,zones:0,chain:0,kmh:0,surv:0,runs:0,floor:0,pubs:0,morts:{},temps:{}}, // (2026-10-06) `pubs` : les pubs regardées (L'ÉTERNELLE — plus aucune pub depuis le retrait des portails, 14/10) // (2026-09-30) `morts`/`temps` : la mesure des morts par niveau (voir MORTS) — jamais affichée
    /* ---- LE COMPTE EN BANQUE ET L'AURA (2026-08-17) --------------------------------------------
       `bank` : l'argent survit désormais à la partie. À la fin d'un run, ce qui a été ENCAISSÉ y est
       versé — et c'est avec ça qu'on achète les caisses. ⚠ ça n'annule pas le bank-or-bust : la
       mallette en cours, elle, part toujours en fumée si on explose en vol, parce qu'elle n'a jamais
       été encaissée. La banque rend la métaphore littérale.
       `aura` : le total à vie de style. Elle ne s'achète rien — elle donne un RANG, et le rang ouvre
       les caisses que l'argent ne peut pas acheter.
       `owned` : les index des caisses ACHETÉES. Séparé des exploits : un achat n'est pas un exploit. */
    mis:{n:0,ok:[0,0,0],best:[0,0,0],f:-1}, shop:{own:[],eq:{peinture:'usine',aile:'panneaux',trainee:'nitro'}}, figs:['tailwhip','saltov'], figT0:0, figS0:1, figEq:[], pseudo:'', tuto:0, shopVu:0, ast:0, // CONTRATS · BOUTIQUE · nom du Top 10 · 1re partie guidée faite
    bank:0, aura:0, owned:[], auraMax:0, gamme:3, eco:3, frenRec:0, // `frenRec` : la plus longue FRÉNÉSIE jamais tenue (s) // `eco` : échelle de l'argent de course (vague 3, voir la migration des records en fin de san) // `gamme` : version de la GAMME de caisses (voir la migration dans san) // `auraMax` : la meilleure aura d'UNE partie — le chiffre à battre, affiché en jeu
    jour:{d:'',n:0},cad:{t:0},dj:{d:'',k:'',v:0,b:0,ok:0,y:''}, // (2026-10-14, GAMEPLAY) LE RETOUR DU JOUR : `d` = la date locale de la dernière partie COMPTÉE ('AAAA-MM-JJ'), `n` = la série à cette date · LE CADEAU : `t` = l'heure (ms) du dernier cadeau ouvert, 0 = jamais (voir JOUR / CAD)
    m2:m2Vierge(), // (2026-10-16) LES MISSIONS v2 : réussies, prises, suivies, records, compteurs à vie (voir m2Etat)
    plq:{m:'fr',x:(typeof plqHasard==='function'?plqHasard():'CASH CAR'),ok:0},prof:{ne:Date.now(),tA:0,dMax:0}, // (2026-10-17) LA PLAQUE (modèle, texte, validée) et LE PROFIL (né le, temps de jeu, plus longue partie) — voir PLQ
    ai:{air:.5,boost:.35,caution:.5,skill:.86,aggr:.55,airDur:1.1,runs:0}};}, // profil d'apprentissage des IA
  san(d){ // désinfection : quoi qu'on charge (storage rongé, code importé), la forme est GARANTIE
    const c=this.def();
    if(!d||typeof d!=='object')return c;
    c.best=Math.max(0,Math.min(1e30,Math.round(+d.best)||0)); // (2026-10-14, chasse aux bugs) borné comme la banque : un code importé à « 1e999 » posait un record INFINI (« Infinity » à l'écran, puis null → 0 au flush suivant)
    // ⚠ `equipped` NE SE BORNE PLUS À `bestCar` (2026-08-05). Ce clamp datait de l'époque où les
    // caisses se gagnaient DANS L'ORDRE : `bestCar` était alors le plus haut index atteint, donc un
    // plafond valable. Depuis que chaque caisse a sa condition — et surtout depuis que les trois
    // PREMIUM sont ouvertes d'entrée alors que `bestCar` vaut encore 0 — il RAMENAIT à la cabossée,
    // à chaque chargement, une caisse parfaitement légitime. Le vrai garde-fou est `equippedCar()`,
    // qui teste `carUnlocked()` ; ici on ne borne que la FORME (un index qui existe).
    c.bestCar=Math.min(CARS.length-1,Math.max(0,Math.round(+d.bestCar)||0));
    c.equipped=Math.min(CARS.length-1,Math.max(0,Math.round(+d.equipped)||0)); // borné sur la gamme : un index périmé ne passe pas
    if(Array.isArray(d.leaders))c.leaders=d.leaders
      .filter(e=>e&&typeof e.n==='string'&&isFinite(+e.s))
      .slice(0,10).map(e=>({n:e.n.slice(0,8),s:Math.max(0,Math.round(+e.s))}));
    c.sfx=d.sfx!==false;c.vox=d.vox!==false;c.mus=d.mus!==false;c.vib=d.vib!==false; // (2026-09-28) VIBRATIONS : leur propre interrupteur
    if(d.facile===1||d.facile===true)c.facile=1;else if(d.facile===0||d.facile===false)c.facile=0; // (2026-09-29) MODE FACILE : absent = jamais choisi (le 1er JOUER le propose)
    c.figG=d.figG==='glisse'?'glisse':'tap'; // (2026-10-15) LA FIGURE AU GLISSÉ
    c.vdep=Math.max(0,Math.min(5,Math.round(+d.vdep)||0)); // (2026-10-19) LA VITESSE DE DÉPART : le cran choisi au garage (0-5 ; vdepN le ramène au plus haut ouvert)
    c.volH=d.volH==='plonge'&&d.volHv>=2?'plonge':'monte';c.volHv=2; // pouce en HAUT en vol : monte (d'origine depuis le 2026-10-10, Léo : « plus logique, plus intuitif sur mobile ») ou plonge (manche d'avion, l'ancien défaut) — `volHv` < 2 : sauvegarde d'avant, basculée UNE fois sur MONTE, le choix fait après est gardé
    /* ⚠ LES VOLUMES SONT BORNÉS À [0,1], ET C'EST UNE VRAIE PROTECTION, pas une formalité : ces
       nombres partent DIRECTEMENT dans un GainNode et dans `HTMLAudio.volume`. Un NaN venu d'un
       storage rongé rend tout le graphe WebAudio silencieux sans lever la moindre erreur ; une
       valeur >1 sur `.volume` lève, elle, une exception qui tuerait la lecture. */
    if(d.vol&&typeof d.vol==='object'){const q=(k,dv)=>{const x=+d.vol[k];return isFinite(x)?Math.min(1,Math.max(0,x)):dv;};
      c.vol={mus:q('mus',.62),sfx:q('sfx',1),vox:q('vox',1)};}
    {const v9=Math.round(+d.vu);if(isFinite(v9)&&v9>0)c.vu=v9;} // (2026-10-14, session SON) la DERNIÈRE VISITE (ms) : la musique qui revient après une longue absence (MUS_RETOUR_H) — absente = inconnue
    c.tctl=(d.tctl==='pad')?'pad':'stick';c.q=(d.q==='net'||d.q==='haute')?d.q:'fast';c.sand=(d.sand===true);c.carr={};if(d.carr&&typeof d.carr==='object')for(const k of ['nuages','ville','espace','paris'])c.carr[k]=Math.max(0,Math.min(10,d.carr[k]|0)); // réglages MOBILE
    /* (2026-10-14, passe perf mobile) « JAMAIS CHOISI » ≠ « A CHOISI RAPIDE » : qChoisi=1 posé par les trois bascules IMAGE. Une sauvegarde
       d'AVANT ce champ (qChoisi absent) en 'net' a forcément choisi (le défaut a toujours été RAPIDE) ; en 'fast' on ne peut pas savoir : elle
       suit le défaut du palier. Jamais choisi → le défaut du palier (qNetDefaut), relu à chaque chargement : qNetDefaut=[0,0,0] = RAPIDE, comme avant. */
    c.qChoisi=(d.qChoisi===1||(d.qChoisi===undefined&&(d.q==='net'||d.q==='haute')))?1:0;if(!c.qChoisi)c.q=PAL.b('qNetDefaut',0)?'net':'fast';
    if(d.carrSel&&typeof d.carrSel==='object'&&['nuages','ville','espace','paris'].includes(d.carrSel.id))c.carrSel={id:d.carrSel.id,i:Math.max(0,Math.min(9,d.carrSel.i|0))}; // (2026-10-07) LE NIVEAU DES PLAY (carrSel le revérifie contre la carrière)
    if(Array.isArray(d.fruits))c.fruits=d.fruits.slice(0,32).filter(e=>e&&typeof e.n==='string').map(e=>({ // réglages de l'ÉTAL (bornés : un import bidon ne casse rien)
      n:e.n.slice(0,24),
      b:THREE.MathUtils.clamp(isFinite(+e.b)?+e.b:.5,0,2),
      f:THREE.MathUtils.clamp(isFinite(+e.f)?+e.f:8,0,40)}));
    if(d.ex&&typeof d.ex==='object'){const e=d.ex,n=(k,hi)=>Math.min(hi,Math.max(0,Math.round(+e[k])||0)); // bornés : un code importé bidon ne débloque pas le roster
      c.ex={eng:n('eng',ENGINE_TIERS.length-1),tricks:n('tricks',1e7),gaps:n('gaps',1e6),bumps:n('bumps',1e6),
        zones:n('zones',1e4),chain:n('chain',1e5),kmh:n('kmh',1e5),surv:n('surv',1e5),runs:n('runs',1e6),pubs:n('pubs',1e6),
        floor:n('floor',CARS.length-1),morts:{},temps:{}};
      /* (2026-09-30) LES MORTS PAR NIVEAU : des objets de NOMBRES — clés filtrées (niveau a-z0-9-, cause a-z), 64 niveaux × 16 causes au plus,
         valeurs entières bornées ; un import bidon ne gonfle pas la sauvegarde et ne glisse rien d'autre qu'un nombre. */
      const K9=/^[a-z0-9-]{1,24}$/,C9=/^[a-z]{1,12}$/,ok9=function(x){return x&&typeof x==='object'&&!Array.isArray(x);};
      if(ok9(e.morts))for(const k of Object.keys(e.morts).slice(0,64)){const o=e.morts[k];if(!K9.test(k)||!ok9(o))continue;const r={};let u=0;
        for(const q of Object.keys(o).slice(0,16)){const v=Math.min(1e6,Math.max(0,Math.round(+o[q])||0));if(C9.test(q)&&v){r[q]=v;u=1;}}if(u)c.ex.morts[k]=r;}
      if(ok9(e.temps))for(const k of Object.keys(e.temps).slice(0,64)){const v=Math.min(1e8,Math.max(0,+e.temps[k]||0));if(K9.test(k)&&v>0)c.ex.temps[k]=Math.round(v*10)/10;}}
    /* ⚠ SECONDE CLAUSE DE GRAND-PÈRE (2026-08-17, passage à la BANQUE). Les caisses se gagnaient par
       conditions (record d'argent, figures, gaps, chaîne, km/h…) ; elles s'ACHÈTENT désormais. Ces
       conditions ayant disparu de la table, un joueur qui avait mérité la VEUVE NOIRE se la verrait
       REPRENDRE au prochain chargement — et devrait la racheter. Inacceptable : on ne confisque pas.
       `bestCar` est le plus haut index jamais débloqué : on s'en sert comme plancher. Ça donne un
       peu plus que le dû (les index en dessous n'étaient pas forcément acquis), et c'est VOULU —
       entre trop rendre et confisquer, une mise à jour se trompe toujours du bon côté. */
    /* ⚠ (2026-09-25) CETTE LIGNE A SAUTÉ : `floor=max(floor,bestCar)` à CHAQUE chargement offrait toutes les caisses d'index
       inférieur à la meilleure débloquée — acheter SA MAJESTÉ rendait l'ELDORADO et le CAÏD gratuits, et gagner LA BULLE
       (index 6, par les défis) offrait TOUTE la gamme. Le plancher ne sert plus qu'aux très vieilles sauvegardes. */
    if(c.bestCar>0&&!(d.ex&&typeof d.ex==='object'))c.ex.floor=c.bestCar; // SAUVEGARDE D'AVANT LES NOUVELLES RÈGLES : tout ce qui
      // était acquis le reste. Ne s'applique qu'une fois — dès le 1er flush, `ex` existe et ce chemin
      // n'est plus emprunté.
    /* BANQUE / AURA / CAISSES ACHETÉES — bornés comme le reste : un code d'import bidon ne doit pas
       offrir le roster. ⚠ `owned` est dédoublonné et filtré sur les index qui EXISTENT : une gamme
       qui rétrécit (24 → 15, c'est déjà arrivé) laisserait sinon des index morts dans la sauvegarde. */
    c.bank=Math.max(0,Math.min(1e30,+d.bank||0));
    // CONTRATS / BOUTIQUE (2026-09-25) — bornés : un code importé ne remplit pas un carnet ni la vitrine
    if(d.mis&&typeof d.mis==='object'){c.mis.n=Math.max(0,Math.min(999,Math.round(+d.mis.n)||0));
      if(Array.isArray(d.mis.ok))c.mis.ok=[0,1,2].map(i=>d.mis.ok[i]?1:0);
      if(Array.isArray(d.mis.best))c.mis.best=[0,1,2].map(i=>Math.max(0,Math.min(1e30,+d.mis.best[i]||0)));
      c.mis.f=[0,1,2].indexOf(d.mis.f)>=0?d.mis.f:-1;if(Array.isArray(d.mis.w)&&d.mis.w.length===3)c.mis.w=d.mis.w.map(x=>Math.max(0,Math.min(99999,Math.round(+x)||0))); /* (2026-10-15) la file : misFile la vérifie et la reconstruit si elle ment */ if(d.mis.pop)c.mis.pop=1;} // (2026-10-14, chasse aux bugs) `pop` : la remise à zéro des carnets POP est faite (voir popCarnets) // (2026-09-30) la mission SUIVIE (cochée à l'écran MISSIONS du garage), -1 = aucune // (2026-09-28) le meilleur essai de chaque défi (la jauge de l'écran MISSIONS)
    if(d.shop&&typeof d.shop==='object'){
      if(Array.isArray(d.shop.own))c.shop.own=[...new Set(d.shop.own.filter(k=>typeof k==='string'&&/^(peinture|aile|trainee):[a-z]{2,12}$/.test(k)))];
      if(d.shop.eq&&typeof d.shop.eq==='object')for(const k of ['peinture','aile','trainee'])if(typeof d.shop.eq[k]==='string'&&/^[a-z]{2,12}$/.test(d.shop.eq[k]))c.shop.eq[k]=d.shop.eq[k];}
    if(Array.isArray(d.figs))c.figs=[...new Set(['tailwhip'].concat(d.figs.filter(k=>typeof k==='string'&&/^[a-z0-9_]{2,24}$/.test(k))))].slice(0,80); // (2026-10-14) LES FIGURES possédées — (2026-10-15) le TAIL WHIP offert ; le TONNEAU, offert jusque-là, reste dans la liste des sauvegardes d'avant (il s'achète désormais)
    else if((+d.best>0)||(+d.bank>0)||(+d.aura>0))c.figs=['tailwhip','tonneau']; // une sauvegarde d'avant les figures (sans liste) qui a déjà joué : elle avait le tonneau, elle le garde
    c.figS0=(d.figS0===1||(d.figS0===undefined&&!Array.isArray(d.figs)&&!((+d.best>0)||(+d.bank>0)||(+d.aura>0))))?1:0; /* (2026-10-22, Sacha : « pour les nouveaux joueurs on doit donner la figure salto avant ») figS0 : le SALTO AVANT offert aux sauvegardes neuves — pas un achat */
    c.figT0=(d.figT0===1||(d.figT0===undefined&&c.figs.indexOf('tonneau')>=0))?1:0; // figT0 : ce tonneau-là était OFFERT (sauvegarde d'avant le tail whip) — pas un achat (ecoDebutAchat)
    if(d.combos&&typeof d.combos==='object'){c.combos={};for(const k of Object.keys(d.combos).slice(0,40))if(/^[MPST]{3}$/.test(k))c.combos[k]=Math.min(1e6,Math.max(0,Math.round(+d.combos[k])||0));} // (2026-10-14) LE CARNET DES COMBOS À TROIS
    if(Array.isArray(d.figEq))c.figEq=[...new Set(d.figEq.filter(k=>typeof k==='string'&&/^[a-z0-9_]{2,24}$/.test(k)))].slice(0,2); // (2026-10-14, LES FIGURES v2) les emplacements — (2026-10-15, Sacha : « seulement 2 figures à la fois, pas 3 ») DEUX
    if(Array.isArray(d.figEq3))c.figEq3=[0,1,2].map(i=>{const k=d.figEq3[i];return typeof k==='string'&&/^[a-z0-9_]{2,24}$/.test(k)?k:'';}); // (2026-10-15 soir) UN PAR DIRECTION, à sa place : avant · arrière · côté ('' = vide) — voir figSlots
    if(d.figRec!=null)c.figRec=Math.max(0,Math.min(9,Math.round((+d.figRec||0)*100)/100)); // (2026-10-15 soir, HUD des figures v4) le meilleur COMBO jamais posé (le × d'un vol)
    if(typeof d.pseudo==='string')c.pseudo=d.pseudo.slice(0,8);
    c.tuto=d.tuto===0?0:(d.tuto||c.ex.runs>0)?1:0;c.permis=d.permis?1:0;c.bienv=d.bienv?1:0;c.tutoProv=d.tutoProv?1:0; /* (2026-10-16) LA QUESTION DE BIENVENUE : `bienv` = ne plus la poser · `tutoProv` = la leçon sautée pour UNE ouverture (voir bienvMontre) */c.cousin=d.cousin?1:0;c.spinJ=Math.max(0,Math.min(9,d.spinJ|0));c.chanceG=Math.max(0,Math.min(3,d.chanceG|0));c.spinBoost=Math.max(0,Math.min(3,d.spinBoost|0)); /* (2026-10-14) FINAL SPIN v2 : les bons gagnés à la machine */ /* (2026-10-14) LE FINAL SPIN : les jetons gardés */ /* (2026-10-14) LE CODE COUSIN */ /* (2026-09-28) un 0 ÉCRIT est respecté : c'est « REVOIR L'AUTO-ÉCOLE » (le « qui a déjà joué » ne vaut que pour les sauvegardes d'avant l'auto-école, sans champ) · `permis` : la prime de 500 déjà versée (une seule fois) */ c.shopVu=d.shopVu?1:0;c.ast=Math.max(0,Math.min(1023,Math.round(+d.ast)||0)); // `ast` : les ASTUCES déjà montrées (bits : 1 drift, 2 assiette en vol ; 256 le doigt de bienvenue de l'accueil, 2026-10-15 soir — d'où 1023 au lieu de 255) // (2026-09-25) la pastille NEW de la boutique ne s'allume que tant qu'on n'y est jamais entré // qui a déjà joué ne refait pas la partie guidée
    c.aura=Math.max(0,Math.min(1e12,Math.round(+d.aura)||0));
    c.auraMax=Math.max(0,Math.min(1e12,Math.round(+d.auraMax)||0));
    c.bankMax=Math.max(c.bank||0,Math.min(1e30,Math.round(+d.bankMax)||0));c.bankMaxVu=Math.max(0,Math.min(c.bankMax,Math.round(+d.bankMaxVu)||0)); // (2026-10-06) LE RECORD DE FORTUNE (la jauge d'argent) : jamais sous la banque ; vu = celui que la jauge a déjà fêté
    c.frenRec=Math.max(0,Math.min(3600,Math.round((+d.frenRec||0)*10)/10)); // (v3) le record de frénésie, borné à une heure
    // (2026-09-30) LA PARTIE INTERROMPUE (voir enCoursPose) : bornée comme les exploits — un code importé ne remplit pas la banque par ce biais
    if(d.enCours&&typeof d.enCours==='object'){const e=d.enCours,n=(k,hi)=>Math.min(hi,Math.max(0,Math.round(+e[k])||0));
      c.enCours={v:Math.min(1e12,Math.max(0,+e.v||0)),a:n('a',1e6),e:n('e',ENGINE_TIERS.length-1),tr:n('tr',1e5),ga:n('ga',1e5),bu:n('bu',1e5),
        sv:n('sv',1e3),zo:n('zo',1e4),ch:n('ch',1e5),km:n('km',1e5),s:n('s',1e12),f:Math.min(3600,Math.max(0,Math.floor((+e.f||0)*10)/10))};}
    if(Array.isArray(d.owned))c.owned=[...new Set(d.owned
      .map(x=>Math.round(+x)).filter(x=>isFinite(x)&&x>=0&&x<CARS.length))].slice(0,CARS.length);
    /* (2026-10-02) LES CAISSES RETIRÉES (`retire`, voir CARS) : qui en avait acheté une est REMBOURSÉ au prix payé — une mise à jour ne
       confisque pas — et elle sort de `owned` (le remboursement ne joue donc qu'une fois) ; qui roulait avec repart en LA HONTE. */
    /* (2026-10-14, Sacha) le menu DIT le remboursement (`SAVE.remb`, voir cc:revele). (2026-10-18) LA RAIE, remboursée ainsi le 14/10, est REVENUE dans le
       jeu : le remboursement versé reste acquis, et plus aucune caisse en vente ne sort de `owned` (seules les `retire` sortent). */
    {let rb=0;const nm=[];c.owned=c.owned.filter(x=>{if(!CARS[x].retire)return true;const p9=(CAR_UNLOCK[x]&&CAR_UNLOCK[x].p)||0;if(p9){rb+=p9;nm.push(CARS[x].name);}return false;});
     c.shop.own=c.shop.own.filter(k=>{const h=HAB_RETIRES[k];if(!h)return true;rb+=h.p;if(h.p)nm.push(h.n);return false;}); /* (2026-10-18 soir) LES HABILLAGES RETIRÉS (HAB_RETIRES) : même règle */
     for(const k of ['peinture','aile','trainee'])if(HAB_RETIRES[k+':'+c.shop.eq[k]])c.shop.eq[k]=k==='peinture'?'usine':k==='aile'?'panneaux':'nitro';
     if(rb){c.bank=Math.min(1e30,c.bank+rb);this.remb={n:nm,v:rb};}if(CARS[c.equipped]&&CARS[c.equipped].retire)c.equipped=0;}
    if(d.ai&&typeof d.ai==='object'){const a=d.ai,g=(k,dv,lo,hi)=>THREE.MathUtils.clamp(isFinite(+a[k])?+a[k]:dv,lo,hi);
      c.ai={air:g('air',.5,0,1),boost:g('boost',.35,0,1),caution:g('caution',.5,0,1),
        skill:g('skill',.86,.5,1.1),aggr:g('aggr',.55,0,1),airDur:g('airDur',1.1,.4,4),
        runs:Math.max(0,Math.round(+a.runs)||0)};}
    /* ⚠ LA GAMME A CHANGÉ (2026-09-24 : 15 caisses → LA HONTE + 5). Les index d'avant désignent
       d'AUTRES voitures : garder `owned`/`floor`/`equipped` tels quels offrirait l'Eldorado à qui
       avait acheté la caisse à savon. On remet les caisses à zéro ET on REMBOURSE à la banque tout
       ce qui avait été payé, au prix d'alors — une mise à jour ne confisque pas. (Les caisses gagnées
       sous les règles d'avant l'argent n'avaient rien coûté : il n'y a rien à rendre.) */
    if(d.gamme===2){c.ex.floor=0;} // GAMME 3 : le plancher gonflé par la ligne retirée plus haut repart à zéro — les ACHATS, eux, sont dans `owned`
    if(d.gamme!==2&&d.gamme!==3){
      const OLD=[0,5e3,25e3,120e3,600e3,3e6,15e6,80e6,500e6];let rb=0;
      if(Array.isArray(d.owned))for(const x of new Set(d.owned.map(v=>Math.round(+v))))rb+=OLD[x]||0;
      c.bank=Math.min(1e30,c.bank+rb);c.owned=[];c.ex.floor=0;c.equipped=0;c.bestCar=0;
    }
    c.gamme=3; // (2026-09-26) la valeur par défaut : 2 faisait repasser la migration à chaque chargement
    /* (vague 3, 2026-09-27) LE DOLLAR DE COURSE A CHANGÉ DE VALEUR (voir ECO3) : les RECORDS D'ARGENT d'une partie (record, Top 10)
       passent UNE fois à la nouvelle échelle — sinon plus aucune partie ne crierait « NOUVEAU RECORD » avant des mois. Facteur
       mesuré sur les grandes parties (celles qui font les records) : ECO3.gain × 0,5 (les fuites corrigées en retirent la moitié).
       ⚠ LA BANQUE N'EST PAS TOUCHÉE : on ne confisque jamais ce qui a été gagné. */
    if(!(d.eco>=3)){const k9=ECO3.gain*.5;c.best=Math.round(c.best*k9);c.leaders.forEach(function(e){e.s=Math.round(e.s*k9);});}
    c.eco=3;
    if(d.bq&&typeof d.bq==='object'&&isFinite(+d.bq.j)&&Array.isArray(d.bq.l))c.bq={j:Math.round(+d.bq.j),l:d.bq.l.filter(function(x){return typeof x==='string';}).slice(0,12).map(function(x){return x.slice(0,32);})}; // (2026-10-10) LA BOUTIQUE DU JOUR : la vitrine tirée ce jour-là
    /* (2026-10-14, GAMEPLAY) LE RETOUR DU JOUR ET LE CADEAU : une date illisible repart de zéro, la série est bornée ; un cadeau « dans le futur » (horloge reculée, code importé) est ramené à maintenant — il ne bloquerait pas le suivant des mois */
    /* (2026-10-20, Léo) LE DÉFI DU JOUR : une date et une famille lisibles, des nombres finis — sinon le prochain regard en tire un neuf */
    if(d.dj&&typeof d.dj==='object'&&/^\d{4}-\d{2}-\d{2}$/.test(String(d.dj.d||''))&&/^[a-zA-Z]{2,8}$/.test(String(d.dj.k||''))){const N9=function(x){x=+x;return isFinite(x)?Math.max(0,Math.min(1e9,x)):0;};c.dj={d:String(d.dj.d),k:String(d.dj.k),v:N9(d.dj.v),b:N9(d.dj.b),ok:d.dj.ok?1:0,y:/^[a-zA-Z]{0,8}$/.test(String(d.dj.y||''))?String(d.dj.y||''):''};}
    c.jour={d:'',n:0};if(typeof jourNum==='function'&&typeof JOUR==='object'&&d.jour&&typeof d.jour==='object'){/* (2026-10-14, GAMEPLAY) le test de typeof : les preuves de sauvegarde (passation/preuves) n'exécutent que la zone SAVE, hors du bloc JOUR — sans lui elles jetaient « jourNum is not defined » */const nj=jourNum(d.jour.d);if(nj===nj){c.jour.d=String(d.jour.d);c.jour.n=Math.max(0,Math.min(JOUR.max,Math.round(+d.jour.n)||0));}}
    /* (2026-10-16) LES MISSIONS v2 : bornées comme le reste — ids a-z0-9 (2 à 12), listes courtes, nombres finis ; un code importé ne coche rien qu'il ne saurait dire */
    if(d.m2&&typeof d.m2==='object'){const s9=d.m2,o9=c.m2,I9=/^[a-z0-9]{2,12}$/,L9=function(a,n){return Array.isArray(a)?[...new Set(a.filter(function(x){return typeof x==='string'&&I9.test(x);}))].slice(0,n):[];},
      N9=function(x,hi){x=+x;return isFinite(x)?Math.max(0,Math.min(hi,x)):0;};
      o9.v=s9.v===1?1:0;if(s9.vc===1)o9.vc=1;if(s9.vr===1)o9.vr=1;/* (2026-10-18) la reprise de la migration, faite */o9.ok=L9(s9.ok,200);o9.pr=L9(s9.pr,200);o9.su=L9(s9.su,3);o9.nv=L9(s9.nv,200);o9.fl=L9(s9.fl,60);
      if(s9.vu&&typeof s9.vu==='object')for(const k of Object.keys(s9.vu).slice(0,200))if(I9.test(k))o9.vu[k]=N9(s9.vu[k],1e30);
      if(s9.r&&typeof s9.r==='object')for(const k of ['fig','airP','parf','frenN','frenT','kmh','vie','tours','vol','lac','rejoue','prof'])if(s9.r[k]!=null)o9.r[k]=N9(s9.r[k],1e7);
      const cc=s9.c&&typeof s9.c==='object'?s9.c:{};o9.c.morts=Math.round(N9(cc.morts,1e7));o9.c.gagne=N9(cc.gagne,1e30);o9.c.jours=Math.round(N9(cc.jours,1e5));
      o9.c.jd=typeof cc.jd==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(cc.jd)?cc.jd:'';o9.c.cartes=L9(cc.cartes,40);o9.c.cartesP=L9(cc.cartesP,40);o9.c.rejoue=Math.round(N9(cc.rejoue,1e5));}
    c.cad={t:0};if(d.cad&&typeof d.cad==='object'){const tc=+d.cad.t;if(isFinite(tc)&&tc>0)c.cad.t=Math.min(Math.round(tc),Date.now());}
    /* (2026-10-17) LA PLAQUE et LE PROFIL (voir PLQ) — bornés : un code importé ne peint rien d'autre qu'une plaque de 9 signes ; une sauvegarde
       d'avant le profil part du temps de course qu'elle a déjà (ex.temps), née aujourd'hui. Le typeof : les preuves de sauvegarde n'exécutent que cette zone. */
    if(typeof plqNet==='function'&&d.plq&&typeof d.plq==='object'){const x9=plqNet(d.plq.x).trim();c.plq={m:plqModOk(d.plq.m),x:x9||c.plq.x,ok:(d.plq.ok&&x9)?1:0};}
    {const p9=(d.prof&&typeof d.prof==='object')?d.prof:null,n9=function(v,hi){v=+v;return isFinite(v)&&v>0?Math.min(hi,v):0;};let tc9=0;for(const k in c.ex.temps)tc9+=+c.ex.temps[k]||0;
     c.prof=p9?{ne:Math.min(Date.now(),n9(p9.ne,1e15)||Date.now()),tA:Math.round(n9(p9.tA,1e9)),dMax:Math.round(n9(p9.dMax,1e6)*10)/10}:{ne:Date.now(),tA:Math.round(tc9),dMax:0};}
    return c;
  },
  /* ===== SANS SAUVEGARDE SUR LE LIEN WEB (2026-10-22, Sacha : « enlève le système de sauvegarde du lien Vercel, dès qu'on se connecte on arrive sur un nouveau compte ») =====
     Sur le web (pas Capacitor) chaque ouverture démarre un compte NEUF : on ne lit rien, on n'écrit rien. `?garde=1` rend la sauvegarde locale (bancs, essais). L'appli native garde la sienne. */
  neuf:!(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Preferences)&&!/[?&]garde=1/.test(location.search),
  load(){
    let d=null;
    if(!this.neuf)try{d=JSON.parse(localStorage[this.K]||'null');}catch(e){}
    if(!d&&!this.neuf){ // première fois (ou clé rongée) : on ramasse l'ancien monde éparpillé
      try{d={best:+localStorage.rrBest5||0,
        leaders:JSON.parse(localStorage.rrLeaders5||'[]'),
        bestCar:+localStorage.rrBestCar5||0,
        sfx:localStorage.rrSfx5!=='0',vox:localStorage.rrVox5!=='0'};}catch(e){}
    }
    // migrations futures : une marche par version, dans l'ordre — if(d&&d.v<3){…}
    this.d=this.san(d);
    /* (2026-09-30) UNE PARTIE A ÉTÉ TUÉE EN ARRIÈRE-PLAN : on verse ce qu'un QUITTER aurait versé (mêmes règles que commitExploits
       + endGame), on efface l'instantané, et le flush qui suit écrit les deux d'UN bloc — jamais la banque créditée ET l'instantané
       sur le disque en même temps. `repris` : ce qui vient d'être versé (le toast du menu, dbgEnCours). */
    const ec=this.d.enCours;
    if(ec){delete this.d.enCours;const x=this.d.ex,L=this.d.leaders;
      this.d.bank=Math.min(1e30,this.d.bank+ec.v);gagneAjoute(ec.v);if(this.d.bank>(this.d.bankMax||0))this.d.bankMax=this.d.bank;
      this.d.aura=(this.d.aura||0)+ec.a;this.d.auraMax=Math.max(this.d.auraMax||0,ec.a);
      x.eng=Math.max(x.eng,ec.e);x.tricks+=ec.tr;x.gaps+=ec.ga;x.bumps+=ec.bu;x.surv+=ec.sv;
      x.zones=Math.max(x.zones,ec.zo);x.chain=Math.max(x.chain,ec.ch);x.kmh=Math.max(x.kmh,ec.km);x.runs++;
      if(ec.f>=5&&ec.f>(this.d.frenRec||0))this.d.frenRec=ec.f; // la frénésie qui tenait encore (endGame : frenFin)
      if(ec.s>0&&(L.length<10||ec.s>L[L.length-1].s)){L.push({n:this.d.pseudo||'TOI',s:ec.s});L.sort(function(a,b){return b.s-a.s;});if(L.length>10)L.length=10;} // le Top 10, comme lbQualifies
      this.repris={v:ec.v,a:ec.a};}
    /* (2026-10-14, chasse aux bugs) APRÈS UNE PURGE (natif===1 : le secours n'est pas encore lu) ce flush écrivait une sauvegarde VIERGE dans localStorage : si l'appli était tuée avant la
       réponse de `Preferences.get` (l'init synchrone dure des secondes), le lancement suivant trouvait un localStorage NON vide, ne consultait plus le miroir, puis l'écrasait — perte totale.
       Rien à écrire à ce stade (pas d'instantané : localStorage était vide) ; la réponse vide, ou le 1er flush de jeu, écrivent. */
    if(!(this.natif===1&&!ec))this.flush();
  },
  mark(){this.dirty=true;},
  natif:0, // (2026-09-30) le miroir natif : 0 libre · 1 suspendu (on attend la lecture du secours) · 2 restauration en cours, plus AUCUNE écriture (voir plus bas)
  flush(){if(this.natif===2||this.neuf)return;try{this.d.v=this.V;const s=JSON.stringify(this.d);try{localStorage[this.K]=s;this.dirty=false;}catch(e){} /* (2026-10-14, chasse aux bugs) localStorage plein/refusé : le miroir natif doit partir quand même (avant, l'exception sautait Preferences.set) ; `dirty` reste levé, le filet de 30 s réessaie */
    // P0-03 : miroir natif sous Capacitor — NSUserDefaults (Preferences) survit aux purges WKWebView.
    // Le web n'a pas ce plugin : la garde saute et on reste sur localStorage seul.
    if(this.natif===0&&window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Preferences){try{window.Capacitor.Plugins.Preferences.set({key:this.K,value:s});}catch(e){}}
  }catch(e){}},
  export(){return btoa(unescape(encodeURIComponent(JSON.stringify(this.d))));}, // code à copier-coller
  import(code){ // rend true si le code est valide — la désinfection repasse derrière
    try{
      const d=JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
      if(typeof d.v!=='number')return false; // pas un code à nous
      this.d=this.san(d);this.flush();return true;
    }catch(e){return false;}
  }
};
// P0-03 : sous Capacitor, si le localStorage a été purgé mais que les Preferences natifs ont encore la
// sauvegarde, on la sème puis on recharge UNE fois (le boot est synchrone, impossible de le bloquer).
/* (2026-09-30) ⚠ LE MIROIR ATTEND LA LECTURE. `Preferences.get` est asynchrone : SAVE.load() tourne AVANT sa réponse, trouve le
   localStorage vide, et son flush() envoyait aussitôt `Preferences.set(sauvegarde VIERGE)` — deux appels natifs en vol, dans un
   ordre que rien ne garantit : l'écriture passée la première, le secours était écrasé par du vide (perte totale). Donc
   `SAVE.natif=1` le temps de la lecture (le localStorage s'écrit, le natif n'est pas touché) ; réponse vide → 0 et un flush
   rattrape le miroir ; réponse pleine → 2 : plus AUCUNE écriture jusqu'au rechargement (le passage en arrière-plan qui accompagne
   un rechargement flushait la sauvegarde vierge PAR-DESSUS celle qu'on venait de semer). Lecture en échec : on reste à 1 — on
   n'écrase pas un secours qu'on n'a pas pu lire. Et on ne recharge que si le localStorage a GARDÉ la valeur (sinon : boucle). */
if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Preferences&&!(function(){try{const x=JSON.parse(localStorage[SAVE.K]||'null');return !!x&&typeof x==='object';}catch(e){return false;}})()){ // (2026-10-14, chasse aux bugs) une sauvegarde locale ILLISIBLE (écriture tronquée) comptait comme présente : le miroir n'était pas lu, load repartait à neuf et le 1er flush écrasait le secours natif — perte totale. Illisible = absente
  SAVE.natif=1;
  try{window.Capacitor.Plugins.Preferences.get({key:SAVE.K}).then(function(r){
    if(r&&r.value){SAVE.natif=2;let ok=false;try{localStorage[SAVE.K]=r.value;ok=localStorage[SAVE.K]===r.value;}catch(e){}
      if(ok)location.reload();else SAVE.natif=1;}
    else{SAVE.natif=0;SAVE.flush();}
  }).catch(function(){});}catch(e){}
}
SAVE.load();
/* (2026-10-16) J'AI DÉJÀ JOUÉ, sans « ne plus me demander » : la leçon n'était sautée que pour l'ouverture d'avant — la question revient. */
if(SAVE.d.tutoProv){SAVE.d.tutoProv=0;if(!SAVE.d.bienv&&!SAVE.d.permis)SAVE.d.tuto=0;}
/* (2026-10-14, Sacha) SANS CARRIÈRE : un trophée de la carrière déjà GAGNÉ (5 niveaux de SKY HIGH → LA CAISSE-NUAGE, 5 de la VILLE → LE LINGOT)
   entre dans `owned` — il est à toi partout, boutique comprise (elle ne te le revend pas). Voir `exK`/`exV` dans CAR_UNLOCK. */
try{const mo9={carrN:'nuages',carrV:'ville'};let m9=false;
  CAR_UNLOCK.forEach(function(u,i){if(u&&u.exK&&mo9[u.exK]&&!carRetiree(i)&&(((SAVE.d.carr||{})[mo9[u.exK]])|0)>=u.exV&&!carOwned(i)){SAVE.d.owned.push(i);m9=true;}}); /* (2026-10-18) jamais une RETIRÉE (LE LINGOT) : san la rembourserait à chaque lancement */
  if(m9)SAVE.mark();}catch(e){}
try{m2Etat();}catch(e){console.warn('missions v2 : migration',e);} // (2026-10-16) LES MISSIONS v2 : la migration de la sauvegarde, une fois (voir m2Migre / m2MigreV2) — (2026-10-18) tout `const` / `let` qu'elle atteint doit être déclaré AVANT cette ligne (M2_COLK, M2_RECO : à côté de M2K)
if(BALADE){SAVE.d.tuto=1;SAVE.d.permis=1;if(SAVE.d.facile==null)SAVE.d.facile=0;SAVE.flush=function(){};SAVE.mark=function(){};} // (2026-10-09) LA BALADE n'écrit rien : ni leçon, ni question du mode, ni sauvegarde
/* (2026-09-30) la partie tuée en arrière-plan vient d'être versée (SAVE.load) : le menu le DIT, une fois, à son apparition */
Object.assign(I18N,{'PARTIE INTERROMPUE':'RUN INTERRUPTED','COPIE IMPOSSIBLE : COPIE-LE A LA MAIN':'COPY FAILED: COPY IT BY HAND','Sélectionne le code et copie-le à la main.':'Select the code and copy it by hand.'});
if(SAVE.repris)document.addEventListener('cc:revele',function(){const r=SAVE.repris;if(!r||!(r.v>=1||r.a>=1))return;
  try{toast(pxi('coche')+' '+TR('PARTIE INTERROMPUE')+' : +'+(r.v>=1?fmtC(r.v)+' '+TR('VERSÉS AU COMPTE'):fmtAura(r.a)+' '+TR('AURA')));}catch(e){}},{once:true});
/* (2026-10-14, Sacha) une caisse retirée de la gamme vient d'être remboursée (san) : le menu le DIT, une fois — « LE QUATTRO EST PARTIE : 52 k$ REMBOURSÉS » */
Object.assign(I18N,{'EST PARTIE':'IS GONE','SONT PARTIES':'ARE GONE','REMBOURSÉS':'REFUNDED'});
if(SAVE.remb)document.addEventListener('cc:revele',function(){const r=SAVE.remb;if(!r)return;
  try{toast(pxi('coche')+' '+r.n.map(function(x){return TR(x);}).join(' · ')+' '+TR(r.n.length>1?'SONT PARTIES':'EST PARTIE')+' : '+fmtC(r.v)+' '+TR('REMBOURSÉS'));}catch(e){}},{once:true});
setInterval(()=>{if(SAVE.dirty)SAVE.flush();},30000); // le filet : rien ne se perd plus de 30 s
SND.sfx=SAVE.d.sfx;SND.music=SAVE.d.mus;SND.vib=SAVE.d.vib!==false;
VOL.mus=SAVE.d.vol.mus;VOL.sfx=SAVE.d.vol.sfx;
/* (2026-10-14, Sacha : « la musique est très importante dans le jeu ; quand un joueur se déconnecte longtemps et qu'il revient, la musique
   doit se réactiver dans les réglages ») LA MUSIQUE REVIENT APRÈS UNE LONGUE ABSENCE. Au lancement et au retour d'arrière-plan : si la
   dernière visite (`SAVE.d.vu`, posée au départ en arrière-plan — le flush du départ l'écrit) date de plus de MUS_RETOUR_H heures et que
   MUSIQUE est coupée ou à 0, elle repasse sur ON au volume d'usine. Une fois par retour : la visite est réécrite aussitôt. Rien d'autre ne
   bouge : ni les EFFETS, ni la VOIX, ni leurs curseurs. Le bouton Silencieux de l'iPhone suit la règle de toujours (musicSession).
   Visite inconnue (sauvegarde d'avant ce champ, joueur neuf) = rien. Banc : `?retour=1` simule 25 h d'absence au lancement ; dbgMusRetour(). */
const MUS_RETOUR_H=24;
const MUS_RETOUR_TEST=(function(){try{return new URLSearchParams(location.search).get('retour')==='1';}catch(e){return false;}})();
const MUSRET={n:0,dernier:null}; // n : réactivations de cette session · dernier : la dernière décision (banc)
function musRetour(boot){try{
  const now=Date.now(),vu=(boot&&MUS_RETOUR_TEST)?now-25*36e5:(+SAVE.d.vu||0);
  const loin=vu>0&&now-vu>MUS_RETOUR_H*36e5,coupee=!SND.music||!(VOL.mus>0);
  MUSRET.dernier={boot:!!boot,h:vu>0?+((now-vu)/36e5).toFixed(1):null,loin:loin,coupee:coupee};
  SAVE.d.vu=now;
  if(!(loin&&coupee)){SAVE.mark();return;}
  MUSRET.n++;
  VOL.mus=SAVE.def().vol.mus;SAVE.d.vol.mus=VOL.mus; // le volume d'usine, depuis la SEULE source (SAVE.def)
  if(boot){SND.music=true;SAVE.d.mus=true;SAVE.flush();return;} // au lancement : sndRefresh et le menu partent juste après, sur l'état rallumé
  if(!SND.music)musBascule();else{SAVE.flush();volUI();} // au retour : le même chemin que le bouton MUSIQUE (session audio, relance selon le contexte)
}catch(e){}}
musRetour(true);
document.addEventListener('visibilitychange',function(){if(document.hidden){SAVE.d.vu=Date.now();SAVE.mark();}else musRetour(false);}); // départ : le flush de l'arrière-plan (plus bas) l'écrit
window.dbgMusRetour=function(simH){ // (banc) l'état ; dbgMusRetour(26) simule un retour d'arrière-plan après 26 h d'absence
  if(simH>0){SAVE.d.vu=Date.now()-simH*36e5;musRetour(false);}
  return {vu:SAVE.d.vu,mus:SND.music,vol:VOL.mus,sfx:VOL.sfx,n:MUSRET.n,dernier:MUSRET.dernier,test:MUS_RETOUR_TEST,mode:musicMode,voulue:musicVoulue};};
